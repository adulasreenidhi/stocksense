import mongoose from 'mongoose';
import StockAdjustment from '../models/StockAdjustment.js';
import { applyAdjustment } from '../services/stockService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

export const listAdjustments = asyncHandler(async (req, res) => {
  const { warehouse, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (warehouse) filter.warehouse = warehouse;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [data, total] = await Promise.all([
    StockAdjustment.find(filter)
      .populate('product warehouse')
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    StockAdjustment.countDocuments(filter),
  ]);
  return ok(res, data, { page: pageNumber, limit: limitNumber, total });
});

export const createAdjustment = asyncHandler(async (req, res) => {
  const { product, warehouse, location, countedQty, reason } = req.body;
  const session = await mongoose.startSession();
  try {
    let adjustment;
    await session.withTransaction(async () => {
      const values = await applyAdjustment(session, {
        product,
        warehouse,
        location,
        countedQty,
        createdBy: req.user.id,
      });
      adjustment = new StockAdjustment({
        product,
        warehouse,
        location,
        systemQty: values.systemQty,
        countedQty: values.countedQty,
        delta: values.delta,
        reason,
        createdBy: req.user.id,
      });
      await adjustment.save({ session });
    });
    return ok(res, adjustment, null, 201);
  } catch (error) {
    if (error instanceof AppError) return fail(res, error.message, error.statusCode);
    throw error;
  } finally {
    await session.endSession();
  }
});