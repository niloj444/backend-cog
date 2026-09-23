import { GameSession, SESSION_STATUS } from '../models/GameSession.js';
import { Question } from '../models/Question.js';
import { Telemetry } from '../models/Telemetry.js';
import { findGame } from './gameService.js';
import { AppError } from '../utils/appError.js';

const calculateTimeOfDay = (date) => {
  const hour = date.getHours();
  if (hour < 12) return 'MORNING';
  if (hour < 17) return 'AFTERNOON';
  if (hour < 21) return 'EVENING';
  return 'NIGHT';
};

export const startGameSession = async ({ patientId, gameId }, actor) => {
  await findGame(gameId, actor);
  const startedAt = new Date();
  const totalQuestions = await Question.countDocuments({ gameId });
  return GameSession.create({ patientId, gameId, startedAt, totalQuestions, timeOfDay: calculateTimeOfDay(startedAt) });
};

export const findGameSession = async (sessionId) => {
  const session = await GameSession.findById(sessionId);
  if (!session) throw new AppError('Game session not found', 404);
  return session;
};

export const listPatientSessions = (patientId) => GameSession.find({ patientId }).sort({ startedAt: -1 });

export const endGameSession = async (session) => {
  if (session.status !== SESSION_STATUS.IN_PROGRESS) throw new AppError('Only an in-progress session can be ended', 409);
  const events = await Telemetry.find({ sessionId: session._id }).select('questionId isCorrect');
  const answered = new Set(events.map((event) => String(event.questionId)));
  const correct = new Set(events.filter((event) => event.isCorrect).map((event) => String(event.questionId)));
  const endedAt = new Date();
  const correctAnswers = Math.min(correct.size, session.totalQuestions);
  const completionRate = session.totalQuestions === 0 ? 0 : Math.min(100, Math.round((answered.size / session.totalQuestions) * 10000) / 100);
  const completed = await GameSession.findOneAndUpdate(
    { _id: session._id, status: SESSION_STATUS.IN_PROGRESS },
    { $set: { endedAt, sessionDuration: Math.max(0, Math.round((endedAt - session.startedAt) / 1000)), correctAnswers, completionRate, score: correctAnswers * 100, status: SESSION_STATUS.COMPLETED } },
    { new: true },
  );
  if (!completed) throw new AppError('Only an in-progress session can be ended', 409);
  return completed;
};

export const toGameSessionResponse = (session) => ({
  sessionId: String(session._id), patientId: session.patientId, gameId: session.gameId, startedAt: session.startedAt,
  endedAt: session.endedAt, score: session.score, completionRate: session.completionRate, totalQuestions: session.totalQuestions,
  correctAnswers: session.correctAnswers, sessionDuration: session.sessionDuration, timeOfDay: session.timeOfDay, status: session.status,
});
