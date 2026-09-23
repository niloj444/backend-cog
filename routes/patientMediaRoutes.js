import { Router } from 'express';
import { list } from '../controllers/mediaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePatientAccess } from '../middleware/authorizationMiddleware.js';
import { validatePatientIdParam } from '../validators/resourceValidator.js';
const router = Router({ mergeParams: true });
router.use(requireAuth, validatePatientIdParam, requirePatientAccess);
router.get('/', list);
export default router;
