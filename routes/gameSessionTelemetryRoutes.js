import { Router } from 'express';
import { listForSession } from '../controllers/telemetryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireGameSessionAccess } from '../middleware/authorizationMiddleware.js';
import { validateSessionIdParam } from '../validators/gameSessionValidator.js';
const router = Router({ mergeParams: true });
router.use(requireAuth, validateSessionIdParam, requireGameSessionAccess);
router.get('/', listForSession);
export default router;
