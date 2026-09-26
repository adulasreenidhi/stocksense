import StockLedger from '../models/StockLedger.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const listLedgerEntries = asyncHandler(async (req, res) => {
  const { product, warehouse, type, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (product) filter.product = product;
  if (warehouse) filter.warehouse = warehouse;
  if (type) filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (Number.isNaN(fromDate.getTime())) return fail(res, 'Invalid from date', 400, ['from must be a valid date']);
      filter.createdAt.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (Number.isNaN(toDate.getTime())) return fail(res, 'Invalid to date', 400, ['to must be a valid date']);
      filter.createdAt.$lte = toDate;
    }
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const [data, total] = await Promise.all([
    StockLedger.find(filter)
      .populate('product warehouse')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    StockLedger.countDocuments(filter),
  ]);

  return ok(res, data, { page: pageNumber, limit: limitNumber, total });
});