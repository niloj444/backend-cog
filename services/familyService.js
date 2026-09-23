import { FamilyMember } from '../models/FamilyMember.js';
import { AppError } from '../utils/appError.js';

const normalizeInput = (input) => {
  const fields = ['relationType', 'personName', 'age', 'city', 'occupation', 'notes'];
  return Object.fromEntries(fields.filter((field) => input[field] !== undefined).map((field) => [field, typeof input[field] === 'string' ? input[field].trim() : input[field]]));
};

export const createFamilyMember = (patientId, input) => FamilyMember.create({ patientId, ...normalizeInput(input) });

export const listFamilyMembers = (patientId) => FamilyMember.find({ patientId }).sort({ createdAt: -1 });

export const findFamilyMember = async (familyMemberId) => {
  const familyMember = await FamilyMember.findById(familyMemberId);
  if (!familyMember) throw new AppError('Family member not found', 404);
  return familyMember;
};

export const updateFamilyMember = async (familyMember, input) => {
  Object.assign(familyMember, normalizeInput(input));
  return familyMember.save();
};

export const deleteFamilyMember = (familyMember) => familyMember.deleteOne();

export const toFamilyResponse = (familyMember) => ({
  familyMemberId: String(familyMember._id),
  patientId: familyMember.patientId,
  relationType: familyMember.relationType,
  personName: familyMember.personName,
  age: familyMember.age,
  city: familyMember.city,
  occupation: familyMember.occupation,
  notes: familyMember.notes,
  createdAt: familyMember.createdAt,
  updatedAt: familyMember.updatedAt,
});
