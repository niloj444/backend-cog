import { Router } from 'express';
import { create, getOne, list, remove, update } from '../controllers/patientController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requirePatientAccess, requireRole } from '../middleware/authorizationMiddleware.js';
import { ROLES } from '../utils/roles.js';
import { validatePatientCreate, validatePatientUpdate } from '../validators/patientValidator.js';

const router = Router();
router.use(requireAuth);
router.post('/', requireRole(ROLES.ADMIN, ROLES.DOCTOR, ROLES.CAREGIVER), validatePatientCreate, create);
router.get('/', list);
router.get('/:patientId', requirePatientAccess, getOne);
router.put('/:patientId', requirePatientAccess, validatePatientUpdate, update);
router.delete('/:patientId', requireRole(ROLES.ADMIN), requirePatientAccess, remove);
export default router;
