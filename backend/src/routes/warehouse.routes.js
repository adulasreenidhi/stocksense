import { Router } from 'express';
import {
	listWarehouses,
	createWarehouse,
	updateWarehouse,
	deleteWarehouse,
} from '../controllers/warehouse.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleCheck.js';
import { ROLES } from '../config/constants.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/', listWarehouses);
router.post('/', requireRole(ROLES.MANAGER), validateBody({ required: ['name', 'code', 'locations'], arrays: ['locations'] }), createWarehouse);
router.put('/:id', requireRole(ROLES.MANAGER), validateBody({ arrays: ['locations'] }), updateWarehouse);
router.delete('/:id', requireRole(ROLES.MANAGER), deleteWarehouse);

export default router;
