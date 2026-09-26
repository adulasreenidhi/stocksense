import { Router } from 'express';
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  listCategories, createCategory,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/roleCheck.js';
import { ROLES } from '../config/constants.js';
import { validateBody } from '../middleware/validateInput.js';

const router = Router();
router.use(requireAuth);

router.get('/categories', listCategories);
router.post('/categories', requireRole(ROLES.MANAGER), validateBody({ required: ['name'] }), createCategory);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireRole(ROLES.MANAGER), validateBody({ required: ['name', 'sku', 'category', 'uom'], positive: ['initialStock'], nonNegative: ['reorderPoint', 'reorderQty'] }), createProduct);
router.put('/:id', requireRole(ROLES.MANAGER), validateBody({ positive: ['initialStock'], nonNegative: ['reorderPoint', 'reorderQty'] }), updateProduct);
router.delete('/:id', requireRole(ROLES.MANAGER), deleteProduct);

export default router;
