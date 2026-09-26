import mongoose from 'mongoose';
import StockLedger from '../models/StockLedger.js';
import StockQuant from '../models/StockQuant.js';
import { AppError } from '../utils/AppError.js';

async function inTransaction(providedSession, operation) {
  if (providedSession) return operation(providedSession);

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function getQuantity(key, session) {
  const quant = await StockQuant.findOne(key).session(session);
  return quant?.quantity ?? 0;
}

async function incrementQuantity(key, quantity, session) {
  return StockQuant.findOneAndUpdate(
    key,
    { $inc: { quantity } },
    { upsert: true, new: true, setDefaultsOnInsert: true, session }
  );
}

async function createLedgerEntry(entry, session) {
  return StockLedger.create([entry], { session });
}

export function applyReceiptLines(session, { warehouse, destinationLocation, lines }) {
  return inTransaction(session, async (transactionSession) => {
    for (const line of lines) {
      const key = { product: line.product, warehouse, location: destinationLocation };
      await incrementQuantity(key, line.qty, transactionSession);
      await createLedgerEntry({
        type: 'receipt',
        product: line.product,
        warehouse,
        quantityChange: line.qty,
        toLocation: destinationLocation,
        fromLocation: null,
      }, transactionSession);
    }
  });
}

export function applyDeliveryLines(session, { warehouse, sourceLocation, lines }) {
  return inTransaction(session, async (transactionSession) => {
    for (const line of lines) {
      const quantity = await getQuantity(
        { product: line.product, warehouse, location: sourceLocation },
        transactionSession
      );
      if (quantity < line.qty) {
        throw new AppError(`Insufficient stock for product ${line.product}`, 409);
      }
    }

    for (const line of lines) {
      const key = { product: line.product, warehouse, location: sourceLocation };
      await StockQuant.updateOne(key, { $inc: { quantity: -line.qty } }, { session: transactionSession });
      await createLedgerEntry({
        type: 'delivery',
        product: line.product,
        warehouse,
        quantityChange: -line.qty,
        fromLocation: sourceLocation,
        toLocation: null,
      }, transactionSession);
    }
  });
}

export function applyTransferLines(session, { warehouse, fromLocation, toLocation, lines }) {
  return inTransaction(session, async (transactionSession) => {
    for (const line of lines) {
      const quantity = await getQuantity(
        { product: line.product, warehouse, location: fromLocation },
        transactionSession
      );
      if (quantity < line.qty) {
        throw new AppError(`Insufficient stock for product ${line.product}`, 409);
      }
    }

    for (const line of lines) {
      const sourceKey = { product: line.product, warehouse, location: fromLocation };
      const destinationKey = { product: line.product, warehouse, location: toLocation };
      await StockQuant.updateOne(sourceKey, { $inc: { quantity: -line.qty } }, { session: transactionSession });
      await incrementQuantity(destinationKey, line.qty, transactionSession);
      await createLedgerEntry({
        type: 'transfer',
        product: line.product,
        warehouse,
        quantityChange: line.qty,
        fromLocation,
        toLocation,
      }, transactionSession);
    }
  });
}

export function applyAdjustment(session, { product, warehouse, location, countedQty }) {
  return inTransaction(session, async (transactionSession) => {
    const key = { product, warehouse, location };
    const systemQty = await getQuantity(key, transactionSession);
    const delta = countedQty - systemQty;

    await StockQuant.findOneAndUpdate(
      key,
      { $set: { quantity: countedQty } },
      { upsert: true, new: true, setDefaultsOnInsert: true, session: transactionSession }
    );
    await createLedgerEntry({
      type: 'adjustment',
      product,
      warehouse,
      quantityChange: delta,
      fromLocation: null,
      toLocation: location,
    }, transactionSession);

    return { systemQty, countedQty, delta };
  });
}