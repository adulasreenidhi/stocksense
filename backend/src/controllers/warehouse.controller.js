import Warehouse from '../models/Warehouse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';

function normalizeLocations(locations) {
  return locations?.map((location) => (
    typeof location === 'string' ? { name: location, code: location } : location
  ));
}

export const listWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find();
  return ok(res, warehouses);
});

export const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.create({
    ...req.body,
    locations: normalizeLocations(req.body.locations),
  });
  return ok(res, warehouse, null, 201);
});

export const updateWarehouse = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  if (updates.locations !== undefined) updates.locations = normalizeLocations(updates.locations);
  const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!warehouse) return fail(res, 'Warehouse not found', 404);
  return ok(res, warehouse);
});

export const deleteWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
  if (!warehouse) return fail(res, 'Warehouse not found', 404);
  return res.status(204).send();
});