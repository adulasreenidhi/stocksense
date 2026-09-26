import mongoose from 'mongoose';
import InternalTransfer from '../models/InternalTransfer.js';
import Warehouse from '../models/Warehouse.js';
import { applyTransferLines } from '../services/stockService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

function transferCode(warehouseCode, id) {
  return `${warehouseCode}/INT/${String(id).padStart(4, '0')}`;
}

async function findTransferForValidation(id, session) {
  const transfer = await InternalTransfer.findById(id).session(session);
  if (!transfer) throw new AppError('Transfer not found', 404);
  if (['Done', 'Canceled'].includes(transfer.status)) {
    throw new AppError('Transfer cannot be validated in its current status', 409);
  }
  return transfer;
}

export const listTransfers = asyncHandler(async (req, res) => {
  const { status, warehouse, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (warehouse) filter.warehouse = warehouse;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [data, total] = await Promise.all([
    InternalTransfer.find(filter).populate('warehouse').skip((pageNumber - 1) * limitNumber).limit(limitNumber),
    InternalTransfer.countDocuments(filter),
  ]);
  return ok(res, data, { page: pageNumber, limit: limitNumber, total });
});

export const createTransfer = asyncHandler(async (req, res) => {
  const { warehouse, fromLocation, toLocation, lines } = req.body;
  const warehouseDoc = await Warehouse.findById(warehouse);
  if (!warehouseDoc) return fail(res, 'Warehouse not found', 404);
  const count = await InternalTransfer.countDocuments({ warehouse });
  const transfer = await InternalTransfer.create({
    code: transferCode(warehouseDoc.code, count + 1),
    warehouse,
    fromLocation,
    toLocation,
    lines,
    status: 'Draft',
    createdBy: req.user.id,
  });
  return ok(res, transfer, null, 201);
});

export const updateTransfer = asyncHandler(async (req, res) => {
  const transfer = await InternalTransfer.findById(req.params.id);
  if (!transfer) return fail(res, 'Transfer not found', 404);
  if (!['Draft', 'Waiting'].includes(transfer.status)) {
    return fail(res, 'Transfer is not editable in its current status', 409);
  }
  const { warehouse, fromLocation, toLocation, lines } = req.body;
  if (warehouse !== undefined) transfer.warehouse = warehouse;
  if (fromLocation !== undefined) transfer.fromLocation = fromLocation;
  if (toLocation !== undefined) transfer.toLocation = toLocation;
  if (lines !== undefined) transfer.lines = lines;
  await transfer.save();
  return ok(res, transfer);
});

export const validateTransfer = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let transfer;
    await session.withTransaction(async () => {
      transfer = await findTransferForValidation(req.params.id, session);
      await applyTransferLines(session, transfer);
      transfer.status = 'Done';
      transfer.validatedAt = new Date();
      await transfer.save({ session });
    });
    return ok(res, transfer);
  } catch (error) {
    if (error instanceof AppError) return fail(res, error.message, error.statusCode);
    throw error;
  } finally {
    await session.endSession();
  }
});

export const cancelTransfer = asyncHandler(async (req, res) => {
  const transfer = await InternalTransfer.findById(req.params.id);
  if (!transfer) return fail(res, 'Transfer not found', 404);
  if (transfer.status === 'Done') return fail(res, 'Done transfers cannot be canceled', 409);
  transfer.status = 'Canceled';
  await transfer.save();
  return ok(res, transfer);
});