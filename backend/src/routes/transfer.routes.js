import { Router } from 'express';
import {
	listTransfers,
	createTransfer,
	updateTransfer,
	validateTransfer,
	cancelTransfer,
} from '../controllers/transfer.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/', listTransfers);
router.post('/', validateBody({ required: ['warehouse', 'fromLocation', 'toLocation', 'lines'], arrays: ['lines'] }), createTransfer);
router.put('/:id', validateBody({ arrays: ['lines'] }), updateTransfer);
router.post('/:id/validate', validateTransfer);
router.post('/:id/cancel', cancelTransfer);

export default router;
