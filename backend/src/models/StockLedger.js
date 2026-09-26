import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['receipt', 'delivery', 'transfer', 'adjustment'], required: true },
    refDoc: { type: mongoose.Schema.Types.ObjectId, refPath: 'refModel' },
    refModel: {
      type: String,
      enum: ['Receipt', 'DeliveryOrder', 'InternalTransfer', 'StockAdjustment'],
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    fromLocation: String,
    toLocation: String,
    quantityChange: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

stockLedgerSchema.index({ product: 1, warehouse: 1, createdAt: -1 });

export default mongoose.model('StockLedger', stockLedgerSchema);
