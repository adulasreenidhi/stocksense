import { Router } from 'express';
import { listAdjustments, createAdjustment } from '../controllers/adjustment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/', listAdjustments);
router.post('/', validateBody({ required: ['product', 'warehouse', 'location', 'countedQty'], nonNegative: ['countedQty'] }), createAdjustment);

export default router;
