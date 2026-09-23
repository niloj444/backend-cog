import { randomUUID } from 'node:crypto';
import { Game } from '../models/Game.js';
import { Question } from '../models/Question.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../utils/roles.js';

const normalize = (input, fields) => Object.fromEntries(fields.filter((field) => input[field] !== undefined).map((field) => [field, typeof input[field] === 'string' ? input[field].trim() : input[field]]));
const gameFields = ['name', 'type', 'difficulty', 'description', 'active', 'configuration'];
const questionFields = ['question', 'options', 'correctAnswer', 'configuration'];
const gameFilter = (actor) => actor.role === ROLES.ADMIN ? {} : { active: true };

export const createGame = (input) => Game.create({ ...normalize(input, gameFields), gameId: `GAME-${randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}` });
export const listGames = (actor) => Game.find(gameFilter(actor)).sort({ name: 1 });
export const findGame = async (gameId, actor) => {
  const game = await Game.findOne({ gameId, ...gameFilter(actor) });
  if (!game) throw new AppError('Game not found', 404);
  return game;
};
export const updateGame = async (game, input) => { Object.assign(game, normalize(input, gameFields)); return game.save(); };
export const deleteGame = async (game) => { await Question.deleteMany({ gameId: game.gameId }); await game.deleteOne(); };

export const createQuestion = (gameId, input) => Question.create({ gameId, ...normalize(input, questionFields), options: input.options.map((option) => option.trim()) });
export const listQuestions = (gameId) => Question.find({ gameId }).sort({ createdAt: 1 });
export const findQuestion = async (questionId) => { const question = await Question.findById(questionId); if (!question) throw new AppError('Question not found', 404); return question; };
export const updateQuestion = async (question, input) => {
  const update = normalize(input, questionFields);
  if (update.options) update.options = update.options.map((option) => option.trim());
  const proposedOptions = update.options || question.options;
  const proposedAnswer = update.correctAnswer || question.correctAnswer;
  if (!proposedOptions.includes(proposedAnswer)) throw new AppError('correctAnswer must match one of the options', 400);
  Object.assign(question, update);
  return question.save();
};
export const deleteQuestion = (question) => question.deleteOne();

export const toGameResponse = (game) => ({ gameId: game.gameId, name: game.name, type: game.type, difficulty: game.difficulty, description: game.description, active: game.active, configuration: game.configuration, createdAt: game.createdAt, updatedAt: game.updatedAt });
export const toQuestionResponse = (question, includeAnswer = false) => ({ questionId: String(question._id), gameId: question.gameId, question: question.question, options: question.options, ...(includeAnswer ? { correctAnswer: question.correctAnswer } : {}), configuration: question.configuration, createdAt: question.createdAt, updatedAt: question.updatedAt });
