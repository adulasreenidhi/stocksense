import { Router } from 'express';
import { getKpis, getActivity } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/kpis', getKpis);
router.get('/activity', getActivity);

export default router;
