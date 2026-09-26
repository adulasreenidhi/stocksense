import mongoose from 'mongoose';

const stockAdjustmentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: String, required: true },
    systemQty: { type: Number, required: true },
    countedQty: { type: Number, required: true },
    delta: { type: Number, required: true },
    reason: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('StockAdjustment', stockAdjustmentSchema);
