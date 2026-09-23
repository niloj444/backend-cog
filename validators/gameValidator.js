import mongoose from 'mongoose';
import { GAME_TYPES } from '../models/Game.js';
import { AppError } from '../utils/appError.js';

const GAME_ID_PATTERN = /^GAME-[A-F0-9]{16}$/;
export const validateGameIdParam = (req, res, next) => GAME_ID_PATTERN.test(req.params.gameId) ? next() : next(new AppError('gameId is invalid', 400));
const validConfiguration = (value) => value === undefined || (value !== null && !Array.isArray(value) && typeof value === 'object');

const validateGame = (isUpdate) => (req, res, next) => {
  const { name, type, difficulty, description, active, configuration } = req.body;
  const errors = [];
  if ((!isUpdate || name !== undefined) && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) errors.push('name must be between 2 and 100 characters');
  if ((!isUpdate || type !== undefined) && !GAME_TYPES.includes(type)) errors.push(`type must be one of: ${GAME_TYPES.join(', ')}`);
  if ((!isUpdate || difficulty !== undefined) && (typeof difficulty !== 'string' || difficulty.trim().length === 0 || difficulty.trim().length > 50)) errors.push('difficulty must be a non-empty string up to 50 characters');
  if (description !== undefined && (typeof description !== 'string' || description.trim().length > 2_000)) errors.push('description must be a string with at most 2000 characters');
  if (active !== undefined && typeof active !== 'boolean') errors.push('active must be a boolean');
  if (!validConfiguration(configuration)) errors.push('configuration must be an object');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};
export const validateGameCreate = validateGame(false);
export const validateGameUpdate = validateGame(true);

const validateQuestion = (isUpdate) => (req, res, next) => {
  const { question, options, correctAnswer, configuration } = req.body;
  const errors = [];
  if ((!isUpdate || question !== undefined) && (typeof question !== 'string' || question.trim().length === 0 || question.trim().length > 2_000)) errors.push('question must be a non-empty string up to 2000 characters');
  if (options !== undefined && (!Array.isArray(options) || options.length < 2 || options.some((option) => typeof option !== 'string' || option.trim().length === 0 || option.trim().length > 500))) errors.push('options must contain at least two non-empty strings');
  if ((!isUpdate || correctAnswer !== undefined) && (typeof correctAnswer !== 'string' || correctAnswer.trim().length === 0)) errors.push('correctAnswer is required');
  const finalOptions = options || (isUpdate ? undefined : []);
  if (finalOptions && correctAnswer !== undefined && !finalOptions.map((option) => option.trim()).includes(correctAnswer.trim())) errors.push('correctAnswer must match one of the options');
  if (!validConfiguration(configuration)) errors.push('configuration must be an object');
  return errors.length ? next(new AppError(errors.join('; '), 400)) : next();
};
export const validateQuestionCreate = validateQuestion(false);
export const validateQuestionUpdate = validateQuestion(true);
export const validateQuestionIdParam = (req, res, next) => mongoose.isObjectIdOrHexString(req.params.questionId) ? next() : next(new AppError('questionId is invalid', 400));
