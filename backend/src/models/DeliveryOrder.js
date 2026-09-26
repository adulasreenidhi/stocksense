import mongoose from 'mongoose';

const lineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const deliveryOrderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    sourceLocation: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'], default: 'Draft' },
    lines: [lineSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('DeliveryOrder', deliveryOrderSchema);
