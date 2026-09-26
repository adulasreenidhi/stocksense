import mongoose from 'mongoose';
import DeliveryOrder from '../models/DeliveryOrder.js';
import Warehouse from '../models/Warehouse.js';
import { applyDeliveryLines } from '../services/stockService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

function deliveryCode(warehouseCode, id) {
  return `${warehouseCode}/OUT/${String(id).padStart(4, '0')}`;
}

async function findDeliveryForValidation(id, session) {
  const delivery = await DeliveryOrder.findById(id).session(session);
  if (!delivery) throw new AppError('Delivery order not found', 404);
  if (['Done', 'Canceled'].includes(delivery.status)) {
    throw new AppError('Delivery order cannot be validated in its current status', 409);
  }
  return delivery;
}

export const listDeliveries = asyncHandler(async (req, res) => {
  const { status, warehouse, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (warehouse) filter.warehouse = warehouse;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [data, total] = await Promise.all([
    DeliveryOrder.find(filter).populate('warehouse').skip((pageNumber - 1) * limitNumber).limit(limitNumber),
    DeliveryOrder.countDocuments(filter),
  ]);
  return ok(res, data, { page: pageNumber, limit: limitNumber, total });
});

export const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await DeliveryOrder.findById(req.params.id).populate('warehouse');
  if (!delivery) return fail(res, 'Delivery order not found', 404);
  return ok(res, delivery);
});

export const createDelivery = asyncHandler(async (req, res) => {
  const { customer, warehouse, sourceLocation, lines } = req.body;
  const warehouseDoc = await Warehouse.findById(warehouse);
  if (!warehouseDoc) return fail(res, 'Warehouse not found', 404);
  const count = await DeliveryOrder.countDocuments({ warehouse });
  const delivery = await DeliveryOrder.create({
    code: deliveryCode(warehouseDoc.code, count + 1),
    customer,
    warehouse,
    sourceLocation,
    lines,
    status: 'Draft',
    createdBy: req.user.id,
  });
  return ok(res, delivery, null, 201);
});

export const updateDelivery = asyncHandler(async (req, res) => {
  const delivery = await DeliveryOrder.findById(req.params.id);
  if (!delivery) return fail(res, 'Delivery order not found', 404);
  if (!['Draft', 'Waiting'].includes(delivery.status)) {
    return fail(res, 'Delivery order is not editable in its current status', 409);
  }
  const { customer, warehouse, sourceLocation, lines } = req.body;
  if (customer !== undefined) delivery.customer = customer;
  if (warehouse !== undefined) delivery.warehouse = warehouse;
  if (sourceLocation !== undefined) delivery.sourceLocation = sourceLocation;
  if (lines !== undefined) delivery.lines = lines;
  await delivery.save();
  return ok(res, delivery);
});

export const pickDelivery = asyncHandler(async (req, res) => {
  const delivery = await DeliveryOrder.findById(req.params.id);
  if (!delivery) return fail(res, 'Delivery order not found', 404);
  if (['Done', 'Canceled'].includes(delivery.status)) {
    return fail(res, 'Delivery order cannot be picked in its current status', 409);
  }
  delivery.status = 'Ready';
  await delivery.save();
  return ok(res, delivery);
});

export const validateDelivery = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let delivery;
    await session.withTransaction(async () => {
      delivery = await findDeliveryForValidation(req.params.id, session);
      await applyDeliveryLines(session, delivery);
      delivery.status = 'Done';
      delivery.validatedAt = new Date();
      await delivery.save({ session });
    });
    return ok(res, delivery);
  } catch (error) {
    if (error instanceof AppError) return fail(res, error.message, error.statusCode);
    throw error;
  } finally {
    await session.endSession();
  }
});

export const cancelDelivery = asyncHandler(async (req, res) => {
  const delivery = await DeliveryOrder.findById(req.params.id);
  if (!delivery) return fail(res, 'Delivery order not found', 404);
  if (delivery.status === 'Done') return fail(res, 'Done delivery orders cannot be canceled', 409);
  delivery.status = 'Canceled';
  await delivery.save();
  return ok(res, delivery);
});