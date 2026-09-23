import { Game } from '../models/Game.js';
import { GameSession, SESSION_STATUS } from '../models/GameSession.js';
import { Question } from '../models/Question.js';
import { Telemetry } from '../models/Telemetry.js';

const DEFAULT_DOMAIN_BY_GAME_TYPE = Object.freeze({
  'Who is this?': 'MEMORY',
  'Life Timeline': 'MEMORY',
  'Routine Sequencing': 'EXECUTIVE',
  'My Story Quiz': 'LANGUAGE',
});
const DOMAINS = Object.freeze(['MEMORY', 'ATTENTION', 'EXECUTIVE', 'LANGUAGE']);

const percentage = (numerator, denominator) => denominator === 0 ? 0 : Math.round((numerator / denominator) * 10000) / 100;
const average = (numbers) => numbers.length === 0 ? 0 : Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 100) / 100;
const percentile = (numbers, value) => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((value / 100) * sorted.length) - 1)];
};

const responseTimeFeatures = (events) => {
  const times = events.map((event) => event.responseTime);
  return {
    count: times.length,
    averageMs: average(times),
    medianMs: percentile(times, 50),
    p95Ms: percentile(times, 95),
    minimumMs: times.length ? Math.min(...times) : 0,
    maximumMs: times.length ? Math.max(...times) : 0,
  };
};

const domainFor = (question, game) => {
  const configuredDomain = question?.configuration?.analyticsDomain || game?.configuration?.analyticsDomain;
  return DOMAINS.includes(configuredDomain) ? configuredDomain : DEFAULT_DOMAIN_BY_GAME_TYPE[game?.type] || null;
};

const domainAccuracy = (events, questionById, game) => Object.fromEntries(DOMAINS.map((domain) => {
  const domainEvents = events.filter((event) => domainFor(questionById.get(String(event.questionId)), game) === domain);
  return [domain.toLowerCase(), domainEvents.length ? percentage(domainEvents.filter((event) => event.isCorrect).length, domainEvents.length) : null];
}));

const questionPerformance = (events, questionById) => [...events.reduce((groups, event) => {
  const key = String(event.questionId);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(event);
  return groups;
}, new Map()).entries()].map(([questionId, questionEvents]) => ({
  questionId,
  question: questionById.get(questionId)?.question || null,
  attempts: questionEvents.length,
  accuracy: percentage(questionEvents.filter((event) => event.isCorrect).length, questionEvents.length),
  averageResponseTimeMs: average(questionEvents.map((event) => event.responseTime)),
  hintsUsed: questionEvents.reduce((sum, event) => sum + event.hintsUsed, 0),
  retries: questionEvents.reduce((sum, event) => sum + event.retryCount, 0),
}));

const gamePerformance = (events, game) => ({
  gameId: game?.gameId || events[0]?.gameId || null,
  name: game?.name || null,
  type: game?.type || null,
  attempts: events.length,
  accuracy: percentage(events.filter((event) => event.isCorrect).length, events.length),
  averageResponseTimeMs: average(events.map((event) => event.responseTime)),
  hintsUsed: events.reduce((sum, event) => sum + event.hintsUsed, 0),
  retries: events.reduce((sum, event) => sum + event.retryCount, 0),
});

export const calculateSessionAnalytics = async (session) => {
  const [events, game] = await Promise.all([
    Telemetry.find({ sessionId: session._id }).sort({ timestamp: 1 }),
    Game.findOne({ gameId: session.gameId }),
  ]);
  const questionIds = [...new Set(events.map((event) => String(event.questionId)))];
  const questions = questionIds.length ? await Question.find({ _id: { $in: questionIds } }).select('question configuration') : [];
  const questionById = new Map(questions.map((question) => [String(question._id), question]));
  const uniqueAnsweredQuestions = new Set(events.map((event) => String(event.questionId))).size;
  const correctEvents = events.filter((event) => event.isCorrect).length;
  const domainMetrics = domainAccuracy(events, questionById, game);
  const responseTimes = responseTimeFeatures(events);

  return {
    patientId: session.patientId,
    sessionId: String(session._id),
    gameId: session.gameId,
    status: session.status,
    accuracy: percentage(correctEvents, events.length),
    completionRate: percentage(uniqueAnsweredQuestions, session.totalQuestions),
    responseTimeBehavior: responseTimes,
    hintsUsed: events.reduce((sum, event) => sum + event.hintsUsed, 0),
    retries: events.reduce((sum, event) => sum + event.retryCount, 0),
    sessionDuration: session.sessionDuration,
    questionPerformance: questionPerformance(events, questionById),
    gamePerformance: gamePerformance(events, game),
    domainAccuracy: domainMetrics,
    telemetryEventCount: events.length,
    // Event integrity, not an identity claim or a clinical measure. Stored telemetry is server-validated.
    authenticity: events.length === 0 ? 0 : percentage(events.filter((event) => String(event.sessionId) === String(session._id) && event.patientId === session.patientId && event.gameId === session.gameId).length, events.length),
  };
};

export const createSessionFeatureVector = (analytics) => ({
  patientId: analytics.patientId,
  sessionId: analytics.sessionId,
  memoryAccuracy: analytics.domainAccuracy.memory,
  attentionAccuracy: analytics.domainAccuracy.attention,
  executiveAccuracy: analytics.domainAccuracy.executive,
  languageAccuracy: analytics.domainAccuracy.language,
  authenticity: analytics.authenticity,
  responseTimeFeatures: analytics.responseTimeBehavior,
  hints: analytics.hintsUsed,
  retries: analytics.retries,
  completionRate: analytics.completionRate,
  sessionDuration: analytics.sessionDuration,
});

export const calculatePatientAnalytics = async (patientId) => {
  const sessions = await GameSession.find({ patientId }).sort({ startedAt: -1 });
  const sessionAnalytics = await Promise.all(sessions.map(calculateSessionAnalytics));
  const completed = sessionAnalytics.filter((analytics) => analytics.status === SESSION_STATUS.COMPLETED);
  const aggregateSource = completed.length ? completed : sessionAnalytics;
  const sourceSessionIds = aggregateSource.map((analytics) => analytics.sessionId);
  const events = sourceSessionIds.length ? await Telemetry.find({ sessionId: { $in: sourceSessionIds } }) : [];
  const questionIds = [...new Set(events.map((event) => String(event.questionId)))];
  const gameIds = [...new Set(events.map((event) => event.gameId))];
  const [questions, games] = await Promise.all([
    questionIds.length ? Question.find({ _id: { $in: questionIds } }).select('question configuration') : [],
    gameIds.length ? Game.find({ gameId: { $in: gameIds } }) : [],
  ]);
  const questionById = new Map(questions.map((question) => [String(question._id), question]));
  const gameById = new Map(games.map((game) => [game.gameId, game]));
  const gamePerformanceRows = [...events.reduce((groups, event) => {
    if (!groups.has(event.gameId)) groups.set(event.gameId, []);
    groups.get(event.gameId).push(event);
    return groups;
  }, new Map()).entries()].map(([gameId, gameEvents]) => gamePerformance(gameEvents, gameById.get(gameId)));
  return {
    patientId,
    sessionCount: sessions.length,
    completedSessionCount: completed.length,
    accuracy: percentage(events.filter((event) => event.isCorrect).length, events.length),
    completionRate: average(aggregateSource.map((analytics) => analytics.completionRate)),
    responseTimeBehavior: responseTimeFeatures(events),
    hintsUsed: events.reduce((sum, event) => sum + event.hintsUsed, 0),
    retries: events.reduce((sum, event) => sum + event.retryCount, 0),
    averageSessionDuration: average(aggregateSource.map((analytics) => analytics.sessionDuration)),
    questionPerformance: questionPerformance(events, questionById),
    gamePerformance: gamePerformanceRows,
  };
};

export const listPatientFeatureVectors = async (patientId) => {
  const sessions = await GameSession.find({ patientId, status: SESSION_STATUS.COMPLETED }).sort({ startedAt: -1 });
  return Promise.all(sessions.map(async (session) => createSessionFeatureVector(await calculateSessionAnalytics(session))));
};
