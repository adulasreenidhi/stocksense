import { Router } from 'express';
import {
	listDeliveries,
	getDelivery,
	createDelivery,
	updateDelivery,
	pickDelivery,
	validateDelivery,
	cancelDelivery,
} from '../controllers/delivery.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/', listDeliveries);
router.get('/:id', getDelivery);
router.post('/', validateBody({ required: ['customer', 'warehouse', 'sourceLocation', 'lines'], arrays: ['lines'] }), createDelivery);
router.put('/:id', validateBody({ arrays: ['lines'] }), updateDelivery);
router.post('/:id/pick', pickDelivery);
router.post('/:id/validate', validateDelivery);
router.post('/:id/cancel', cancelDelivery);

export default router;
