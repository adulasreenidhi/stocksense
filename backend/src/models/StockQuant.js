import mongoose from 'mongoose';

const stockQuantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

stockQuantSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });

export default mongoose.model('StockQuant', stockQuantSchema);
