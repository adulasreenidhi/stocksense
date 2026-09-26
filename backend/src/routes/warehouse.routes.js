import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
// import { requireRole } from '../middleware/roleCheck.js';
// import { ROLES } from '../config/constants.js';

const router = Router();
router.use(requireAuth);

// See docs/API.md -> "Warehouses" section for the full contract.
// TODO: implement a warehouse.controller.js following the pattern in
// product.controller.js (asyncHandler + ok/fail + Mongo transaction for
// anything that mutates StockQuant / writes to StockLedger).

router.get('/', (req, res) => res.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0 } }));

export default router;
