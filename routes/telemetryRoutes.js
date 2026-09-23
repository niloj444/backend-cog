import { Router } from 'express';
import { create } from '../controllers/telemetryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireGameSessionBodyAccess } from '../middleware/authorizationMiddleware.js';
import { validateTelemetryCreate } from '../validators/telemetryValidator.js';
const router = Router();
router.post('/', requireAuth, validateTelemetryCreate, requireGameSessionBodyAccess, create);
export default router;
