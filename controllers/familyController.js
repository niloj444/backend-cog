import { createFamilyMember, deleteFamilyMember, listFamilyMembers, toFamilyResponse, updateFamilyMember } from '../services/familyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const familyMember = await createFamilyMember(req.patient.patientId, req.body);
  return res.status(201).json({ success: true, familyMember: toFamilyResponse(familyMember) });
});
export const list = asyncHandler(async (req, res) => {
  const familyMembers = await listFamilyMembers(req.patient.patientId);
  return res.status(200).json({ success: true, familyMembers: familyMembers.map(toFamilyResponse) });
});
export const getOne = (req, res) => res.status(200).json({ success: true, familyMember: toFamilyResponse(req.familyMember) });
export const update = asyncHandler(async (req, res) => {
  const familyMember = await updateFamilyMember(req.familyMember, req.body);
  return res.status(200).json({ success: true, familyMember: toFamilyResponse(familyMember) });
});
export const remove = asyncHandler(async (req, res) => {
  await deleteFamilyMember(req.familyMember);
  return res.status(200).json({ success: true, message: 'Family member deleted' });
});
