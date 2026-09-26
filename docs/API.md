# API Contract — StockSense

Base URL: `${VITE_API_BASE_URL}` e.g. `http://localhost:5000/api/v1`

All responses use this envelope:
```json
// success
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 57 } }
// error
{ "success": false, "message": "Product not found", "errors": [] }
```
Auth: `Authorization: Bearer <accessToken>` on all routes except `/auth/*`.
Roles: `inventory_manager`, `warehouse_staff` — routes note which roles are allowed.

---
## Auth — `/api/v1/auth`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| POST | `/signup` | public | `{name,email,password,role}` | `201 {user, accessToken}` |
| POST | `/login` | public | `{email,password}` | `200 {user, accessToken}` (sets refresh cookie) |
| POST | `/logout` | any | — | `204` |
| POST | `/otp/request` | public | `{email}` | `200 {message}` — sends OTP for password reset |
| POST | `/otp/verify` | public | `{email, otp}` | `200 {resetToken}` |
| POST | `/password/reset` | public | `{resetToken, newPassword}` | `200 {message}` |
| POST | `/refresh` | any (cookie) | — | `200 {accessToken}` |

## Dashboard — `/api/v1/dashboard`
| Method | Path | Roles | Query | Response |
|---|---|---|---|---|
| GET | `/kpis` | any | `warehouse?` | `200 {totalProducts, lowStock, outOfStock, pendingReceipts, pendingDeliveries, scheduledTransfers}` |
| GET | `/activity` | any | `type?,status?,warehouse?,category?,page,limit` | `200 {data:[...documents], meta}` — unified feed used by the dynamic filters |

## Products — `/api/v1/products`
| Method | Path | Roles | Body/Query | Response |
|---|---|---|---|---|
| GET | `/` | any | `search?,category?,page,limit` | `200 {data:[Product], meta}` |
| GET | `/:id` | any | — | `200 {data:Product}` (includes stock-by-location) |
| POST | `/` | manager | `{name,sku,category,uom,initialStock?,reorderPoint?,reorderQty?}` | `201 {data:Product}` |
| PUT | `/:id` | manager | partial Product | `200 {data:Product}` |
| DELETE | `/:id` | manager | — | `204` |
| GET | `/categories` | any | — | `200 {data:[Category]}` |
| POST | `/categories` | manager | `{name}` | `201 {data:Category}` |

## Warehouses — `/api/v1/warehouses`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| GET | `/` | any | — | `200 {data:[Warehouse]}` |
| POST | `/` | manager | `{name,code,locations:[string]}` | `201 {data:Warehouse}` |
| PUT | `/:id` | manager | partial | `200 {data:Warehouse}` |
| DELETE | `/:id` | manager | — | `204` |

## Receipts (incoming) — `/api/v1/receipts`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| GET | `/` | any | `status?,warehouse?,page,limit` | `200 {data:[Receipt], meta}` |
| GET | `/:id` | any | — | `200 {data:Receipt}` |
| POST | `/` | any | `{supplier, warehouse, lines:[{product,qty}]}` | `201 {data:Receipt}` status=Draft |
| PUT | `/:id` | any | `{lines?, supplier?}` | `200 {data:Receipt}` (only while Draft/Waiting) |
| POST | `/:id/validate` | any | — | `200 {data:Receipt}` status=Done, **stock += qty per line**, ledger entries written |
| POST | `/:id/cancel` | any | — | `200 {data:Receipt}` status=Canceled |

## Delivery Orders (outgoing) — `/api/v1/deliveries`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| GET | `/` | any | `status?,warehouse?,page,limit` | `200 {data:[DeliveryOrder], meta}` |
| GET | `/:id` | any | — | `200 {data:DeliveryOrder}` |
| POST | `/` | any | `{customer, warehouse, lines:[{product,qty}]}` | `201 {data:DeliveryOrder}` status=Draft |
| POST | `/:id/pick` | any | — | `200 {...}` status=Ready |
| POST | `/:id/validate` | any | — | `200 {...}` status=Done, **stock -= qty per line** (rejects if insufficient stock) |
| POST | `/:id/cancel` | any | — | `200 {...}` status=Canceled |

## Internal Transfers — `/api/v1/transfers`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| GET | `/` | any | `status?,warehouse?,page,limit` | `200 {data:[Transfer], meta}` |
| POST | `/` | any | `{fromLocation,toLocation,lines:[{product,qty}]}` | `201 {data:Transfer}` status=Draft |
| POST | `/:id/validate` | any | — | `200 {...}` status=Done, location updated, total stock unchanged |
| POST | `/:id/cancel` | any | — | `200 {...}` status=Canceled |

## Stock Adjustments — `/api/v1/adjustments`
| Method | Path | Roles | Body | Response |
|---|---|---|---|---|
| GET | `/` | any | `warehouse?,page,limit` | `200 {data:[Adjustment], meta}` |
| POST | `/` | any | `{product, location, countedQty}` | `201 {data:Adjustment}` — auto-computes delta vs system qty, applies immediately, writes ledger entry |

## Move History / Stock Ledger — `/api/v1/ledger`
| Method | Path | Roles | Query | Response |
|---|---|---|---|---|
| GET | `/` | any | `product?,warehouse?,type?,from?,to?,page,limit` | `200 {data:[LedgerEntry], meta}` — read-only, append-only log |

## Common status codes
`200` OK · `201` Created · `204` No Content · `400` Validation error · `401` Not authenticated ·
`403` Role not permitted · `404` Not found · `409` Conflict (e.g. insufficient stock) · `500` Server error

## Document status enum (Receipts/Deliveries/Transfers)
`Draft → Waiting → Ready → Done` (or `Canceled` from any pre-Done state)
