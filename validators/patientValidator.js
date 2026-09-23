import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';

const isObjectId = (value) => typeof value === 'string' && mongoose.isObjectIdOrHexString(value);
const stringArrayIsValid = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0 && item.trim().length <= 200);

const validatePatientFields = (body, isUpdate) => {
  const errors = [];
  const fields = ['name', 'gender', 'preferredLanguage', 'dementiaStage'];
  for (const field of fields) {
    if ((!isUpdate || body[field] !== undefined) && (typeof body[field] !== 'string' || body[field].trim().length === 0 || body[field].trim().length > 100)) errors.push(`${field} must be a non-empty string`);
  }
  if (!isUpdate && body.dateOfBirth === undefined && body.age === undefined) errors.push('dateOfBirth or age is required');
  if (body.dateOfBirth !== undefined && (typeof body.dateOfBirth !== 'string' || Number.isNaN(Date.parse(body.dateOfBirth)))) errors.push('dateOfBirth must be a valid date string');
  if (body.age !== undefined && (!Number.isInteger(body.age) || body.age < 0 || body.age > 130)) errors.push('age must be an integer between 0 and 130');
  for (const field of ['routine', 'difficulties']) if (body[field] !== undefined && !stringArrayIsValid(body[field])) errors.push(`${field} must be an array of non-empty strings`);
  for (const field of ['userId', 'doctorIds', 'caregiverIds']) {
    if (body[field] === undefined) continue;
    const values = field === 'userId' ? [body[field]] : body[field];
    if (!Array.isArray(values) || !values.every(isObjectId)) errors.push(`${field} must contain valid user identifiers`);
  }
  return errors;
};

const validate = (isUpdate) => (req, res, next) => {
  const errors = validatePatientFields(req.body, isUpdate);
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};

export const validatePatientCreate = validate(false);
export const validatePatientUpdate = validate(true);
