import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    destinationLocation: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'], default: 'Draft' },
    lines: [lineSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Receipt', receiptSchema);
