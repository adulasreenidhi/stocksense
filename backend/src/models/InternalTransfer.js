import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const internalTransferSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Waiting', 'Done', 'Canceled'], default: 'Draft' },
    lines: [lineSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('InternalTransfer', internalTransferSchema);
