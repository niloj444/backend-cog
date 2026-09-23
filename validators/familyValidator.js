import { FAMILY_RELATION_TYPES } from '../models/FamilyMember.js';
import { AppError } from '../utils/appError.js';

const optionalTextIsValid = (value, maxLength) => value === undefined || (typeof value === 'string' && value.trim().length <= maxLength);

const validateFamily = (isUpdate) => (req, res, next) => {
  const { relationType, personName, age, city, occupation, notes } = req.body;
  const errors = [];
  if ((!isUpdate || relationType !== undefined) && !FAMILY_RELATION_TYPES.includes(relationType)) errors.push(`relationType must be one of: ${FAMILY_RELATION_TYPES.join(', ')}`);
  if ((!isUpdate || personName !== undefined) && (typeof personName !== 'string' || personName.trim().length < 2 || personName.trim().length > 100)) errors.push('personName must be between 2 and 100 characters');
  if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 130)) errors.push('age must be an integer between 0 and 130');
  if (!optionalTextIsValid(city, 100)) errors.push('city must be a string with at most 100 characters');
  if (!optionalTextIsValid(occupation, 100)) errors.push('occupation must be a string with at most 100 characters');
  if (!optionalTextIsValid(notes, 2_000)) errors.push('notes must be a string with at most 2000 characters');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};

export const validateFamilyCreate = validateFamily(false);
export const validateFamilyUpdate = validateFamily(true);
