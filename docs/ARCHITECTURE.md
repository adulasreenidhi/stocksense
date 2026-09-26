# Architecture — StockSense

## 1. High-level design

```
┌────────────────┐        REST/JSON over HTTPS        ┌───────────────────┐
│   React SPA     │ ───────────────────────────────▶  │   Express API      │
│  (Vite, Redux    │ ◀───────────────────────────────  │  (Node.js)          │
│  Toolkit, RTK     │        JWT in Authorization        │                     │
│  Query/Axios)      │             header                 │  Controllers        │
└────────────────┘                                     │  Services            │
                                                          │  Models (Mongoose)   │
                                                          └─────────┬──────────┘
                                                                    │
                                                             ┌──────▼──────┐
                                                             │  MongoDB     │
                                                             └─────────────┘
```

- **Stateless API**: auth via JWT (access token + refresh token), no server-side sessions —
  lets frontend and backend scale/deploy independently.
- **Contract-first**: `docs/API.md` is written before implementation, so both teams start
  simultaneously.
- **Layered backend**: routes → controllers (HTTP concerns only) → services (business logic,
  e.g. "validating a receipt increases stock") → models (Mongoose schemas/data access).
  This keeps stock-mutation logic testable and out of route handlers.
- **Append-only ledger**: every stock-affecting action (receipt validated, delivery validated,
  transfer done, adjustment applied) writes a `StockLedger` entry. Current stock levels are a
  derived/materialized view (`StockQuant`), rebuildable from the ledger if it ever drifts.
  This matches the "Move History" requirement and gives full auditability.

## 2. Backend architecture

```
backend/
├── src/
│   ├── config/          # db connection, env loader, constants
│   ├── models/           # Mongoose schemas (one file per collection)
│   ├── controllers/      # req/res handlers, call services, no business logic
│   ├── routes/            # Express routers, one per module, mounted in app.js
│   ├── middleware/        # auth (JWT verify), role-based access, error handler, validation
│   ├── utils/              # asyncHandler, OTP generator, email sender, pagination helper
│   ├── app.js               # Express app: middleware, routes mounted
│   └── server.js             # entry point: connects DB, starts HTTP server
├── .env.example
└── package.json
```

**Key conventions**
- Every route is wrapped in `asyncHandler` so async errors reach the central error middleware
  (no repeated try/catch).
- Every mutating stock operation (receipt validate, delivery validate, transfer done,
  adjustment apply) runs inside a **Mongo transaction** (multi-document session) so the
  `StockQuant` update and the `StockLedger` write never diverge.
- Role-based access via `middleware/roleCheck.js`: `inventory_manager` vs `warehouse_staff`
  (staff can operate receipts/deliveries/transfers/counts; only managers can edit products,
  categories, reorder rules, warehouses).
- Validation with a schema-validation middleware (e.g. `express-validator` or `zod`) placed
  before the controller — keeps controllers thin.

## 3. Frontend architecture

```
frontend/
├── src/
│   ├── api/                 # axios instance + one file per resource (productsApi.js, etc.)
│   ├── app/                  # Redux store, root reducer, RTK Query base config
│   ├── features/              # one folder per module: slice + hooks + module-local components
│   │   ├── auth/
│   │   ├── products/
│   │   ├── receipts/
│   │   ├── deliveries/
│   │   ├── transfers/
│   │   ├── adjustments/
│   │   ├── warehouses/
│   │   └── dashboard/
│   ├── components/              # shared/dumb UI: layout (Sidebar, Topbar), common (Table, Modal, Badge)
│   ├── pages/                     # route-level components, compose features + components
│   ├── routes/                     # React Router route table + protected-route wrapper
│   ├── hooks/                       # shared hooks (useAuth, useDebounce, usePagination)
│   └── styles/                       # Tailwind config / global css
```

**Key conventions**
- **Feature-based folders**, not type-based — each module (Receipts, Deliveries, etc.) owns its
  slice, API hooks and module-specific components. Matches the backend module split 1:1, so a
  frontend dev working on "Receipts" only touches `features/receipts/` + `docs/API.md`.
  api/`) with Redux Toolkit's RTK Query — gives caching, loading/error states, and
  auto-refetch for free, and each endpoint maps directly to a line in `docs/API.md`.
- JWT access token stored in memory (Redux) + refresh token in httpOnly cookie set by backend
  (avoids XSS token theft); axios interceptor auto-refreshes on 401.
- Route guard component reads role from auth state to hide manager-only screens
  (Products, Warehouses settings) from Warehouse Staff.

## 4. Parallel-build strategy

1. Agree `docs/API.md` and `docs/DATABASE_SCHEMA.md` first (both teams review/sign off).
2. Backend team implements one module at a time in the order: Auth → Products → Warehouses →
   Receipts → Deliveries → Transfers → Adjustments → Dashboard.
3. Frontend team mocks the same modules with `msw` (Mock Service Worker) using fixtures that
   match `docs/API.md` response shapes exactly, so no rework is needed when swapping to the
   live API — just remove the mock handler.
4. Integrate module-by-module; run a shared Postman/Thunder Client collection (exported next to
   `docs/API.md`) as the regression check when integrating.

## 5. Deployment shape (suggested)

- Backend: Node process (e.g. Render/Railway/EC2) + MongoDB Atlas.
- Frontend: static build (Vite `dist/`) on Vercel/Netlify, calling backend via
  `VITE_API_BASE_URL`.
- CORS restricted to the frontend origin in backend `.env`.
