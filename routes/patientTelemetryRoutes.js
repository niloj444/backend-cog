import { Router } from 'express';
import { listForPatient } from '../controllers/telemetryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePatientAccess } from '../middleware/authorizationMiddleware.js';
import { validatePatientIdParam } from '../validators/resourceValidator.js';
const router = Router({ mergeParams: true });
router.use(requireAuth, validatePatientIdParam, requirePatientAccess);
router.get('/', listForPatient);
export default router;
