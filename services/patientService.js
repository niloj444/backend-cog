import { randomUUID } from 'node:crypto';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/roles.js';

const createPatientId = () => `PAT-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`;

const patientFilterFor = (user) => {
  if (user.role === ROLES.ADMIN) return {};
  if (user.role === ROLES.DOCTOR) return { doctorIds: user._id };
  if (user.role === ROLES.CAREGIVER) return { caregiverIds: user._id };
  return { userId: user._id };
};

const normalizePatientInput = (input) => {
  const fields = ['name', 'dateOfBirth', 'age', 'gender', 'preferredLanguage', 'dementiaStage', 'routine', 'difficulties', 'userId', 'doctorIds', 'caregiverIds'];
  return Object.fromEntries(fields.filter((field) => input[field] !== undefined).map((field) => [field, typeof input[field] === 'string' ? input[field].trim() : input[field]]));
};

const verifyAssignments = async ({ userId, doctorIds = [], caregiverIds = [] }) => {
  const ids = [...new Set([userId, ...doctorIds, ...caregiverIds].filter(Boolean).map(String))];
  if (!ids.length) return;
  const users = await User.find({ _id: { $in: ids }, isActive: true }).select('_id role');
  if (users.length !== ids.length) throw new AppError('One or more assigned users do not exist or are inactive', 400);
  const roleFor = (id) => users.find((user) => String(user._id) === String(id))?.role;
  if (userId && roleFor(userId) !== ROLES.PATIENT) throw new AppError('userId must identify a PATIENT user', 400);
  if (doctorIds.some((id) => roleFor(id) !== ROLES.DOCTOR)) throw new AppError('doctorIds must identify DOCTOR users', 400);
  if (caregiverIds.some((id) => roleFor(id) !== ROLES.CAREGIVER)) throw new AppError('caregiverIds must identify CAREGIVER users', 400);
};

const applyCreatorAssignment = (input, actor) => {
  if (actor.role === ROLES.ADMIN) return input;
  const safeInput = { ...input };
  delete safeInput.userId;
  delete safeInput.doctorIds;
  delete safeInput.caregiverIds;
  if (actor.role === ROLES.DOCTOR) safeInput.doctorIds = [actor._id];
  if (actor.role === ROLES.CAREGIVER) safeInput.caregiverIds = [actor._id];
  return safeInput;
};

export const createPatient = async (input, actor) => {
  const patientInput = applyCreatorAssignment(normalizePatientInput(input), actor);
  await verifyAssignments(patientInput);
  return Patient.create({ ...patientInput, patientId: createPatientId() });
};

export const listAuthorizedPatients = (actor) => Patient.find(patientFilterFor(actor)).sort({ createdAt: -1 });

export const findAuthorizedPatient = async (patientId, actor) => {
  const patient = await Patient.findOne({ patientId, ...patientFilterFor(actor) });
  if (!patient) throw new AppError('Patient not found or access is not permitted', 404);
  return patient;
};

export const updatePatient = async (patient, input, actor) => {
  const update = normalizePatientInput(input);
  if (actor.role !== ROLES.ADMIN) {
    delete update.userId;
    delete update.doctorIds;
    delete update.caregiverIds;
  }
  await verifyAssignments({
    userId: update.userId ?? patient.userId,
    doctorIds: update.doctorIds ?? patient.doctorIds,
    caregiverIds: update.caregiverIds ?? patient.caregiverIds,
  });
  Object.assign(patient, update);
  return patient.save();
};

export const deletePatient = (patient) => patient.deleteOne();

export const toPatientResponse = (patient) => ({
  patientId: patient.patientId,
  name: patient.name,
  dateOfBirth: patient.dateOfBirth,
  age: patient.age,
  gender: patient.gender,
  preferredLanguage: patient.preferredLanguage,
  dementiaStage: patient.dementiaStage,
  routine: patient.routine,
  difficulties: patient.difficulties,
  caregiverIds: patient.caregiverIds.map(String),
  doctorIds: patient.doctorIds.map(String),
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});
