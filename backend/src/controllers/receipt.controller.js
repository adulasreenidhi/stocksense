import mongoose from 'mongoose';
import Receipt from '../models/Receipt.js';
import Warehouse from '../models/Warehouse.js';
import { applyReceiptLines } from '../services/stockService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

function receiptCode(warehouseCode, id) {
  return `${warehouseCode}/IN/${String(id).padStart(4, '0')}`;
}

async function findReceiptForValidation(id, session) {
  const receipt = await Receipt.findById(id).session(session);
  if (!receipt) throw new AppError('Receipt not found', 404);
  if (['Done', 'Canceled'].includes(receipt.status)) {
    throw new AppError('Receipt cannot be validated in its current status', 409);
  }
  return receipt;
}

export const listReceipts = asyncHandler(async (req, res) => {
  const { status, warehouse, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (warehouse) filter.warehouse = warehouse;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [data, total] = await Promise.all([
    Receipt.find(filter).populate('warehouse').skip((pageNumber - 1) * limitNumber).limit(limitNumber),
    Receipt.countDocuments(filter),
  ]);
  return ok(res, data, { page: pageNumber, limit: limitNumber, total });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id).populate('warehouse');
  if (!receipt) return fail(res, 'Receipt not found', 404);
  return ok(res, receipt);
});

export const createReceipt = asyncHandler(async (req, res) => {
  const { supplier, warehouse, destinationLocation, lines } = req.body;
  const warehouseDoc = await Warehouse.findById(warehouse);
  if (!warehouseDoc) return fail(res, 'Warehouse not found', 404);
  const count = await Receipt.countDocuments({ warehouse });
  const receipt = await Receipt.create({
    code: receiptCode(warehouseDoc.code, count + 1),
    supplier,
    warehouse,
    destinationLocation,
    lines,
    status: 'Draft',
    createdBy: req.user.id,
  });
  return ok(res, receipt, null, 201);
});

export const updateReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) return fail(res, 'Receipt not found', 404);
  if (!['Draft', 'Waiting'].includes(receipt.status)) {
    return fail(res, 'Receipt is not editable in its current status', 409);
  }
  const { supplier, warehouse, destinationLocation, lines } = req.body;
  if (supplier !== undefined) receipt.supplier = supplier;
  if (warehouse !== undefined) receipt.warehouse = warehouse;
  if (destinationLocation !== undefined) receipt.destinationLocation = destinationLocation;
  if (lines !== undefined) receipt.lines = lines;
  await receipt.save();
  return ok(res, receipt);
});

export const validateReceipt = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let receipt;
    await session.withTransaction(async () => {
      receipt = await findReceiptForValidation(req.params.id, session);
      await applyReceiptLines(session, receipt);
      receipt.status = 'Done';
      receipt.validatedAt = new Date();
      await receipt.save({ session });
    });
    return ok(res, receipt);
  } catch (error) {
    if (error instanceof AppError) return fail(res, error.message, error.statusCode);
    throw error;
  } finally {
    await session.endSession();
  }
});

export const cancelReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) return fail(res, 'Receipt not found', 404);
  if (receipt.status === 'Done') return fail(res, 'Done receipts cannot be canceled', 409);
  receipt.status = 'Canceled';
  await receipt.save();
  return ok(res, receipt);
});