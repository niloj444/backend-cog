import jwt from 'jsonwebtoken';
import { findAuthenticatedUser } from '../services/authService.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new AppError('Authentication token is required', 401);
  const token = authorization.slice(7).trim();
  if (!token) throw new AppError('Authentication token is required', 401);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await findAuthenticatedUser(payload.sub);
    return next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Invalid or expired authentication token', 401);
  }
});
