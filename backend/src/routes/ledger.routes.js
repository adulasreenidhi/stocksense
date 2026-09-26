import { Router } from 'express';
import { listLedgerEntries } from '../controllers/ledger.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', listLedgerEntries);

export default router;
