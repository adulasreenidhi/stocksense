# Database Schema — StockSense (MongoDB / Mongoose)

## Collections overview

| Collection | Purpose |
|---|---|
| `users` | Auth + role (inventory_manager / warehouse_staff) |
| `categories` | Product categories |
| `products` | Product master data |
| `warehouses` | Warehouses, each with named locations (e.g. Rack A) |
| `stockquants` | **Current** stock per product per location (materialized, fast reads) |
| `receipts` | Incoming stock documents |
| `deliveryorders` | Outgoing stock documents |
| `internaltransfers` | Location-to-location moves |
| `stockadjustments` | Physical-count corrections |
| `stockledgers` | Append-only audit log of every stock movement (Move History) |

## `users`
```js
{
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['inventory_manager','warehouse_staff'] },
  otp: { code: String, expiresAt: Date },       // transient, for password reset
  createdAt, updatedAt
}
```

## `categories`
```js
{ name: { type: String, unique: true }, createdAt, updatedAt }
```

## `products`
```js
{
  name: String,
  sku: { type: String, unique: true },
  category: { type: ObjectId, ref: 'Category' },
  uom: String,                       // e.g. 'pcs', 'kg'
  reorderPoint: Number,               // triggers low-stock alert
  reorderQty: Number,
  isActive: Boolean,
  createdAt, updatedAt
}
```

## `warehouses`
```js
{
  name: String,
  code: { type: String, unique: true },
  locations: [{ name: String, code: String }],   // e.g. Rack A, Production Floor
  createdAt, updatedAt
}
```

## `stockquants`  (current stock — derived, rebuildable from ledger)
```js
{
  product: { type: ObjectId, ref: 'Product' },
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  location: String,             // location code within warehouse
  quantity: Number,
  updatedAt: Date
}
// unique compound index: { product, warehouse, location }
```

## `receipts`
```js
{
  code: String,                             // auto e.g. RCPT-0001
  supplier: String,
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  destinationLocation: String,
  status: { type: String, enum: ['Draft','Waiting','Ready','Done','Canceled'] },
  lines: [{ product: { type: ObjectId, ref: 'Product' }, qty: Number }],
  createdBy: { type: ObjectId, ref: 'User' },
  validatedAt: Date,
  createdAt, updatedAt
}
```

## `deliveryorders`
```js
{
  code: String,                             // auto e.g. DO-0001
  customer: String,
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  sourceLocation: String,
  status: { type: String, enum: ['Draft','Waiting','Ready','Done','Canceled'] },
  lines: [{ product: { type: ObjectId, ref: 'Product' }, qty: Number }],
  createdBy: { type: ObjectId, ref: 'User' },
  validatedAt: Date,
  createdAt, updatedAt
}
```

## `internaltransfers`
```js
{
  code: String,                             // auto e.g. INT-0001
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  fromLocation: String,
  toLocation: String,
  status: { type: String, enum: ['Draft','Waiting','Done','Canceled'] },
  lines: [{ product: { type: ObjectId, ref: 'Product' }, qty: Number }],
  createdBy: { type: ObjectId, ref: 'User' },
  validatedAt: Date,
  createdAt, updatedAt
}
```

## `stockadjustments`
```js
{
  product: { type: ObjectId, ref: 'Product' },
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  location: String,
  systemQty: Number,      // snapshot at time of count
  countedQty: Number,
  delta: Number,           // countedQty - systemQty
  reason: String,
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt, updatedAt
}
```

## `stockledgers`  (append-only — Move History)
```js
{
  type: { type: String, enum: ['receipt','delivery','transfer','adjustment'] },
  refDoc: { type: ObjectId, refPath: 'refModel' },   // points to source document
  refModel: { type: String, enum: ['Receipt','DeliveryOrder','InternalTransfer','StockAdjustment'] },
  product: { type: ObjectId, ref: 'Product' },
  warehouse: { type: ObjectId, ref: 'Warehouse' },
  fromLocation: String,     // null for pure receipts
  toLocation: String,       // null for pure deliveries
  quantityChange: Number,    // signed
  createdAt: Date
}
```

## Relationships
```
Category 1───* Product
Warehouse 1───* StockQuant *───1 Product
Warehouse 1───* Receipt / DeliveryOrder / InternalTransfer
Receipt / DeliveryOrder / InternalTransfer / StockAdjustment 1───* StockLedger (via refDoc)
User 1───* (createdBy on all documents)
```

## Indexes to create
- `products.sku` unique
- `stockquants` compound unique `{product, warehouse, location}`
- `stockledgers` compound `{product, warehouse, createdAt}` for fast Move History queries
- `receipts.status`, `deliveryorders.status`, `internaltransfers.status` for dashboard filters
