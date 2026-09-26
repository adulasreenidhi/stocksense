import { Router } from 'express';
import {
  listReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  validateReceipt,
  cancelReceipt,
} from '../controllers/receipt.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/', listReceipts);
router.get('/:id', getReceipt);
router.post('/', validateBody({ required: ['supplier', 'warehouse', 'destinationLocation', 'lines'], arrays: ['lines'] }), createReceipt);
router.put('/:id', validateBody({ arrays: ['lines'] }), updateReceipt);
router.post('/:id/validate', validateReceipt);
router.post('/:id/cancel', cancelReceipt);

export default router;
