# StockSense Frontend

React SPA (Vite + Redux Toolkit + Tailwind). Talks to the backend only through
`VITE_API_BASE_URL` — see `../docs/API.md` for the full contract.

## Setup

```bash
cp .env.example .env     # set VITE_API_BASE_URL
npm install
npm run dev                 # http://localhost:5173
```

## Folder guide

```
src/
├── api/            axios instance + one file per resource (authApi.js, productsApi.js...)
├── app/             Redux store
├── features/         one folder per module: <name>Slice.js (+ local components/hooks later)
├── components/       shared UI: layout/ (Sidebar), common/ (Table, Modal, Badge — add as needed)
├── pages/             route-level components, one per nav item in the problem statement
├── routes/            AppRoutes.jsx (route table) + ProtectedRoute.jsx (auth/role guard)
├── styles/            Tailwind entry css
├── App.jsx             shell: sidebar + routed content
└── main.jsx            entry point
```

## Status of modules

| Module | Status |
|---|---|
| Auth (slice + api) | ✅ Implemented — reference pattern |
| Products (slice + api) | ✅ Implemented — reference pattern |
| Receipts / Deliveries / Transfers / Adjustments / Warehouses | ⬜ Slice + api scaffolded, pages are stubs |
| Dashboard | ⬜ Not started |

All page components exist and are routed (see `routes/AppRoutes.jsx`), matching the
navigation in the problem statement (Products, Operations sub-items, Settings, Profile).

## Building a stub module

1. Flesh out `pages/<Name>Page.jsx` using the matching `features/<name>/<name>Slice.js`.
2. If the slice needs more than a list fetch (create/validate/cancel actions), add more
   `createAsyncThunk`s to that slice, mirroring the `docs/API.md` entry for that module.
3. Until the backend route is implemented, mock it (e.g. `msw`) with a response shaped
   exactly like `docs/API.md` — swapping to the live route needs no code changes on this side.

## Auth flow

- `authSlice` holds `{ user, accessToken }` in memory (not localStorage, to reduce XSS risk).
- The refresh token lives in an httpOnly cookie set by the backend; `api/axiosClient.js`
  auto-refreshes the access token on a 401 and retries the original request once.
- `routes/ProtectedRoute.jsx` redirects unauthenticated users to `/login`, and can restrict
  a route to a role (e.g. `roles={['inventory_manager']}` for Warehouse settings).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build (`dist/`)
- `npm run preview` — preview the production build locally
