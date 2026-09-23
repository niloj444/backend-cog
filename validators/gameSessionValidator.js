import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';
import { validatePatientIdValue } from './resourceValidator.js';

const GAME_ID_PATTERN = /^GAME-[A-F0-9]{16}$/;

export const validateSessionStart = (req, res, next) => {
  const { patientId, gameId } = req.body;
  if (!validatePatientIdValue(patientId) || typeof gameId !== 'string' || !GAME_ID_PATTERN.test(gameId)) {
    return next(new AppError('patientId and gameId are required and must be valid', 400));
  }
  return next();
};

export const validateSessionIdParam = (req, res, next) =>
  mongoose.isObjectIdOrHexString(req.params.sessionId)
    ? next()
    : next(new AppError('sessionId is invalid', 400));
