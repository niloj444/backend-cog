import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';
import { validatePatientIdValue } from './resourceValidator.js';

const GAME_ID_PATTERN = /^GAME-[A-F0-9]{16}$/;

export const validateTelemetryCreate = (req, res, next) => {
  const { patientId, sessionId, gameId, questionId, selectedOption, responseTime, hintsUsed, retryCount } = req.body;
  const errors = [];
  if (!validatePatientIdValue(patientId)) errors.push('patientId is invalid');
  if (!mongoose.isObjectIdOrHexString(sessionId)) errors.push('sessionId is invalid');
  if (typeof gameId !== 'string' || !GAME_ID_PATTERN.test(gameId)) errors.push('gameId is invalid');
  if (!mongoose.isObjectIdOrHexString(questionId)) errors.push('questionId is invalid');
  if (typeof selectedOption !== 'string' || selectedOption.trim().length === 0 || selectedOption.trim().length > 500) errors.push('selectedOption must be a non-empty string up to 500 characters');
  if (!Number.isInteger(responseTime) || responseTime < 0 || responseTime > 3_600_000) errors.push('responseTime must be an integer in milliseconds up to 3600000');
  if (!Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > 50) errors.push('hintsUsed must be an integer between 0 and 50');
  if (!Number.isInteger(retryCount) || retryCount < 0 || retryCount > 50) errors.push('retryCount must be an integer between 0 and 50');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};
