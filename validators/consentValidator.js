import { AppError } from '../utils/appError.js';

const CONSENT_TYPE_PATTERN = /^[A-Z][A-Z0-9_]{2,50}$/;

export const validateConsentCreate = (req, res, next) => {
  const { consentGiven, consentType, consentVersion } = req.body;
  const errors = [];
  if (typeof consentGiven !== 'boolean') errors.push('consentGiven must be a boolean');
  if (typeof consentType !== 'string' || !CONSENT_TYPE_PATTERN.test(consentType.trim().toUpperCase())) errors.push('consentType must use uppercase letters, numbers, and underscores');
  if (typeof consentVersion !== 'string' || consentVersion.trim().length === 0 || consentVersion.trim().length > 50) errors.push('consentVersion must be a non-empty string up to 50 characters');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};
