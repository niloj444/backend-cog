import { Router } from 'express';
import { getSessionAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireGameSessionAccess } from '../middleware/authorizationMiddleware.js';
import { validateSessionIdParam } from '../validators/gameSessionValidator.js';
const router = Router({ mergeParams: true });
router.use(requireAuth, validateSessionIdParam, requireGameSessionAccess);
router.get('/', getSessionAnalytics);
export default router;
