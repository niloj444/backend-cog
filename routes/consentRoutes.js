import { Router } from 'express';
import { revoke } from '../controllers/consentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireConsentAccess } from '../middleware/authorizationMiddleware.js';
import { validateObjectIdParam } from '../validators/resourceValidator.js';
const router = Router();
router.use(requireAuth);
router.post('/:consentId/revoke', validateObjectIdParam('consentId'), requireConsentAccess, revoke);
export default router;
