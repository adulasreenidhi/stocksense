# StockSense Backend

Express + MongoDB REST API. See `../docs/API.md` for the full endpoint contract and
`../docs/DATABASE_SCHEMA.md` for collections.

## Setup

```bash
cp .env.example .env     # fill in Mongo URI, JWT secrets, SMTP creds
npm install
npm run dev                 # nodemon, restarts on change
```

Health check: `GET http://localhost:5000/health`

## Folder guide

```
src/
├── config/        db.js (Mongo connection), constants.js (roles, status enums)
├── models/         one Mongoose schema per collection (matches docs/DATABASE_SCHEMA.md)
├── controllers/    req/res handlers — thin, delegate business logic
├── routes/          one router per module, mounted in app.js
├── middleware/      auth.middleware.js (JWT verify), roleCheck.js, errorHandler.js
├── utils/            asyncHandler, apiResponse (ok/fail), OTP + email helpers
├── app.js             Express app setup
└── server.js          entry point
```

## Status of modules

| Module | Status |
|---|---|
| Auth | ✅ Implemented — reference pattern for the rest |
| Products / Categories | ✅ Implemented — reference pattern for the rest |
| Warehouses | ⬜ Stub route only — see `docs/API.md` |
| Receipts | ⬜ Stub route only |
| Delivery Orders | ⬜ Stub route only |
| Internal Transfers | ⬜ Stub route only |
| Stock Adjustments | ⬜ Stub route only |
| Move History / Ledger | ⬜ Stub route only (read-only) |
| Dashboard | ⬜ Stub route only |

## Implementing a stub module

1. Create `controllers/<module>.controller.js` — copy the shape of `product.controller.js`.
2. Wire it into the matching `routes/<module>.routes.js` (already mounted in `app.js`).
3. Match `docs/API.md` exactly: same paths, body shapes, status codes.
4. Any action that changes stock (`validate` on Receipts/Deliveries/Transfers, or creating
   an Adjustment) must, inside one Mongo session/transaction:
   - upsert the relevant `StockQuant` document(s)
   - insert a `StockLedger` entry
   - flip the source document's `status`

## Auth model

- `POST /auth/login` returns a short-lived access token (used as `Authorization: Bearer`)
  and sets an httpOnly refresh cookie.
- `requireAuth` middleware verifies the access token and attaches `req.user = {id, role, email}`.
- `requireRole(ROLES.MANAGER)` restricts manager-only routes (Products, Categories, Warehouses).

## Scripts

- `npm run dev` — nodemon
- `npm start` — production
- `npm test` — jest (add tests under `src/**/__tests__`)
