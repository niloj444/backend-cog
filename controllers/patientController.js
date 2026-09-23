import { createPatient, deletePatient, listAuthorizedPatients, toPatientResponse, updatePatient } from '../services/patientService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const patient = await createPatient(req.body, req.user);
  return res.status(201).json({ success: true, patient: toPatientResponse(patient) });
});

export const list = asyncHandler(async (req, res) => {
  const patients = await listAuthorizedPatients(req.user);
  return res.status(200).json({ success: true, patients: patients.map(toPatientResponse) });
});

export const getOne = (req, res) => res.status(200).json({ success: true, patient: toPatientResponse(req.patient) });

export const update = asyncHandler(async (req, res) => {
  const patient = await updatePatient(req.patient, req.body, req.user);
  return res.status(200).json({ success: true, patient: toPatientResponse(patient) });
});

export const remove = asyncHandler(async (req, res) => {
  await deletePatient(req.patient);
  return res.status(200).json({ success: true, message: 'Patient deleted' });
});
