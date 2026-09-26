import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockAdjustment from '../models/StockAdjustment.js';
import StockQuant from '../models/StockQuant.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';

const pendingDocumentStatuses = ['Draft', 'Waiting', 'Ready'];

function objectId(value) {
  return value && mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : value;
}

async function stockKpis(warehouse) {
  const warehouseId = objectId(warehouse);
  const stockLookupMatch = warehouseId
    ? { $expr: { $eq: ['$warehouse', warehouseId] } }
    : {};
  const [result] = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'stockquants',
        let: { productId: '$_id' },
        pipeline: [
          { $match: stockLookupMatch },
          { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
          { $group: { _id: null, quantity: { $sum: '$quantity' } } },
        ],
        as: 'stock',
      },
    },
    {
      $set: {
        totalQuantity: { $ifNull: [{ $arrayElemAt: ['$stock.quantity', 0] }, 0] },
      },
    },
    {
      $facet: {
        lowStock: [
          { $match: { $expr: { $and: [{ $gt: ['$totalQuantity', 0] }, { $lte: ['$totalQuantity', '$reorderPoint'] }] } } },
          { $count: 'count' },
        ],
        outOfStock: [
          { $match: { $expr: { $eq: ['$totalQuantity', 0] } } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  return {
    lowStock: result?.lowStock[0]?.count || 0,
    outOfStock: result?.outOfStock[0]?.count || 0,
  };
}

export const getKpis = asyncHandler(async (req, res) => {
  const { warehouse } = req.query;
  const warehouseFilter = warehouse ? { warehouse } : {};
  const [totalProducts, stock, pendingReceipts, pendingDeliveries, scheduledTransfers] = await Promise.all([
    warehouse
      ? StockQuant.distinct('product', { warehouse }).then((productIds) =>
        Product.countDocuments({ isActive: true, _id: { $in: productIds } }))
      : Product.countDocuments({ isActive: true }),
    stockKpis(warehouse),
    Receipt.countDocuments({ ...warehouseFilter, status: { $in: pendingDocumentStatuses } }),
    DeliveryOrder.countDocuments({ ...warehouseFilter, status: { $in: pendingDocumentStatuses } }),
    InternalTransfer.countDocuments({ ...warehouseFilter, status: { $in: ['Draft', 'Waiting'] } }),
  ]);

  return ok(res, {
    totalProducts,
    lowStock: stock.lowStock,
    outOfStock: stock.outOfStock,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
  });
});

function activityFilter({ status, warehouse, productIds }) {
  const filter = {};
  if (status) filter.status = status;
  if (warehouse) filter.warehouse = warehouse;
  if (productIds) filter.lines = { $elemMatch: { product: { $in: productIds } } };
  return filter;
}

export const getActivity = asyncHandler(async (req, res) => {
  const { type, status, warehouse, category, page = 1, limit = 20 } = req.query;
  const types = type ? [type] : ['receipt', 'delivery', 'transfer', 'adjustment'];
  const categoryProducts = category
    ? await Product.find({ category }).distinct('_id')
    : null;
  const queries = [];

  if (types.includes('receipt')) {
    queries.push(Receipt.find(activityFilter({ status, warehouse, productIds: categoryProducts }))
      .populate('warehouse').populate({ path: 'lines.product', populate: { path: 'category' } })
      .lean().then((items) => items.map((item) => ({ ...item, type: 'receipt' }))));
  }
  if (types.includes('delivery')) {
    queries.push(DeliveryOrder.find(activityFilter({ status, warehouse, productIds: categoryProducts }))
      .populate('warehouse').populate({ path: 'lines.product', populate: { path: 'category' } })
      .lean().then((items) => items.map((item) => ({ ...item, type: 'delivery' }))));
  }
  if (types.includes('transfer')) {
    queries.push(InternalTransfer.find(activityFilter({ status, warehouse, productIds: categoryProducts }))
      .populate('warehouse').populate({ path: 'lines.product', populate: { path: 'category' } })
      .lean().then((items) => items.map((item) => ({ ...item, type: 'transfer' }))));
  }
  if (types.includes('adjustment')) {
    const filter = { ...(status ? { status } : {}), ...(warehouse ? { warehouse } : {}) };
    if (categoryProducts) filter.product = { $in: categoryProducts };
    queries.push(StockAdjustment.find(filter)
      .populate('warehouse product').lean()
      .then((items) => items.map((item) => ({ ...item, type: 'adjustment' }))));
  }

  const groups = await Promise.all(queries);
  const combined = groups.flat().sort((left, right) => right.updatedAt - left.updatedAt);
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const total = combined.length;
  return ok(res, combined.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber), {
    page: pageNumber,
    limit: limitNumber,
    total,
  });
});