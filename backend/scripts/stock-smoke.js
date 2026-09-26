import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Warehouse from '../src/models/Warehouse.js';
import Product from '../src/models/Product.js';
import Receipt from '../src/models/Receipt.js';
import StockQuant from '../src/models/StockQuant.js';
import StockLedger from '../src/models/StockLedger.js';
import { applyReceiptLines } from '../src/services/stockService.js';

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });

try {
  await mongoose.connect(replSet.getUri());
  const warehouse = await Warehouse.create({
    name: 'Smoke Warehouse',
    code: 'SMK',
    locations: [{ name: 'Rack A', code: 'RACK-A' }],
  });
  const product = await Product.create({ name: 'Smoke Product', sku: 'SMOKE-001', uom: 'pcs' });
  const receipt = await Receipt.create({
    code: 'SMK/IN/0001',
    supplier: 'Smoke Supplier',
    warehouse: warehouse._id,
    destinationLocation: 'RACK-A',
    lines: [{ product: product._id, qty: 7 }],
    status: 'Draft',
  });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await applyReceiptLines(session, receipt);
      receipt.status = 'Done';
      receipt.validatedAt = new Date();
      await receipt.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const quant = await StockQuant.findOne({ product: product._id, warehouse: warehouse._id, location: 'RACK-A' });
  const ledger = await StockLedger.findOne({ type: 'receipt', product: product._id, warehouse: warehouse._id });
  assert.equal(receipt.status, 'Done');
  assert.equal(quant.quantity, 7);
  assert.equal(ledger.quantityChange, 7);
  console.log('Stock smoke test passed');
} finally {
  await mongoose.disconnect();
  await replSet.stop();
}