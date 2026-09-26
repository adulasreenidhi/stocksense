import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  { name: String, code: String },
  { _id: false }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    locations: [locationSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Warehouse', warehouseSchema);
