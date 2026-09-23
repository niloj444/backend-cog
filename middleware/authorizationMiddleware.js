import { AppError } from '../utils/appError.js';
import { findAuthorizedPatient } from '../services/patientService.js';
import { findFamilyMember } from '../services/familyService.js';
import { findConsent } from '../services/consentService.js';
import { findMedia } from '../services/mediaService.js';
import { hasActiveConsent } from '../services/consentService.js';
import { findGame, findQuestion } from '../services/gameService.js';
import { findGameSession } from '../services/gameSessionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication is required', 401));
  if (!allowedRoles.includes(req.user.role)) return next(new AppError('You do not have permission to access this resource', 403));
  return next();
};

export const requirePatientAccess = asyncHandler(async (req, res, next) => {
  req.patient = await findAuthorizedPatient(req.params.patientId, req.user);
  return next();
});

export const requireFamilyMemberAccess = asyncHandler(async (req, res, next) => {
  req.familyMember = await findFamilyMember(req.params.familyMemberId);
  req.patient = await findAuthorizedPatient(req.familyMember.patientId, req.user);
  return next();
});

export const requireConsentAccess = asyncHandler(async (req, res, next) => {
  req.consent = await findConsent(req.params.consentId);
  req.patient = await findAuthorizedPatient(req.consent.patientId, req.user);
  return next();
});

export const requireMediaUploadAccess = asyncHandler(async (req, res, next) => {
  req.patient = await findAuthorizedPatient(req.body.patientId, req.user);
  return next();
});

export const requireMediaUploadConsent = asyncHandler(async (req, res, next) => {
  if (!(await hasActiveConsent(req.patient.patientId, 'MEDIA_UPLOAD'))) {
    throw new AppError('Active MEDIA_UPLOAD consent is required', 403);
  }
  return next();
});

export const requireMediaAccess = asyncHandler(async (req, res, next) => {
  req.media = await findMedia(req.params.mediaId);
  req.patient = await findAuthorizedPatient(req.media.patientId, req.user);
  return next();
});

export const requireGameAccess = asyncHandler(async (req, res, next) => {
  req.game = await findGame(req.params.gameId, req.user);
  return next();
});

export const requireQuestionAccess = asyncHandler(async (req, res, next) => {
  req.question = await findQuestion(req.params.questionId);
  return next();
});

export const requireGameSessionAccess = asyncHandler(async (req, res, next) => {
  req.gameSession = await findGameSession(req.params.sessionId);
  req.patient = await findAuthorizedPatient(req.gameSession.patientId, req.user);
  return next();
});

export const requireGameSessionBodyAccess = asyncHandler(async (req, res, next) => {
  req.gameSession = await findGameSession(req.body.sessionId);
  req.patient = await findAuthorizedPatient(req.gameSession.patientId, req.user);
  return next();
});

export const requirePatientBodyAccess = asyncHandler(async (req, res, next) => {
  req.patient = await findAuthorizedPatient(req.body.patientId, req.user);
  return next();
});
