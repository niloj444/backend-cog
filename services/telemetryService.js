import { Question } from '../models/Question.js';
import { Telemetry } from '../models/Telemetry.js';
import { SESSION_STATUS } from '../models/GameSession.js';
import { AppError } from '../utils/appError.js';

export const recordTelemetry = async (input, session) => {
  if (session.status !== SESSION_STATUS.IN_PROGRESS) throw new AppError('Telemetry can only be recorded for an in-progress session', 409);
  if (input.patientId !== session.patientId) throw new AppError('Session does not belong to the supplied patient', 400);
  if (input.gameId !== session.gameId) throw new AppError('Session does not belong to the supplied game', 400);
  const question = await Question.findOne({ _id: input.questionId, gameId: session.gameId });
  if (!question) throw new AppError('Question does not belong to this game', 400);
  const selectedOption = input.selectedOption.trim();
  if (!question.options.includes(selectedOption)) throw new AppError('selectedOption must be one of the question options', 400);
  return Telemetry.create({
    patientId: session.patientId, sessionId: session._id, gameId: session.gameId, questionId: question._id,
    selectedOption, correctOption: question.correctAnswer, isCorrect: selectedOption === question.correctAnswer,
    responseTime: input.responseTime, hintsUsed: input.hintsUsed, retryCount: input.retryCount,
  });
};

export const listSessionTelemetry = (sessionId) => Telemetry.find({ sessionId }).sort({ timestamp: 1 });
export const listPatientTelemetry = (patientId) => Telemetry.find({ patientId }).sort({ timestamp: -1 });
export const toTelemetryResponse = (telemetry, includeCorrectOption = false) => ({
  telemetryId: String(telemetry._id), patientId: telemetry.patientId, sessionId: String(telemetry.sessionId), gameId: telemetry.gameId,
  questionId: String(telemetry.questionId), selectedOption: telemetry.selectedOption,
  ...(includeCorrectOption ? { correctOption: telemetry.correctOption } : {}), isCorrect: telemetry.isCorrect,
  responseTime: telemetry.responseTime, hintsUsed: telemetry.hintsUsed, retryCount: telemetry.retryCount, timestamp: telemetry.timestamp,
});
