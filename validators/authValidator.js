import { AppError } from '../utils/appError.js';
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) errors.push('name must be between 2 and 100 characters');
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) errors.push('email must be valid');
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) errors.push('password must be between 8 and 128 characters');
  if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length > 30)) errors.push('phone must be a string with at most 30 characters');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim()) || typeof password !== 'string' || password.length === 0) return next(new AppError('email and password are required', 400));
  return next();
};
