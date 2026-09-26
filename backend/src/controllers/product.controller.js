import Product from '../models/Product.js';
import Category from '../models/Category.js';
import StockQuant from '../models/StockQuant.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }];
  if (category) filter.category = category;

  const [data, total] = await Promise.all([
    Product.find(filter)
      .populate('category')
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return ok(res, data, { page: Number(page), limit: Number(limit), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return fail(res, 'Product not found', 404);

  const stockByLocation = await StockQuant.find({ product: product._id }).populate('warehouse');
  return ok(res, { ...product.toObject(), stockByLocation });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return ok(res, product, null, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return fail(res, 'Product not found', 404);
  return ok(res, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return fail(res, 'Product not found', 404);
  return res.status(204).send();
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return ok(res, categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return ok(res, category, null, 201);
});
