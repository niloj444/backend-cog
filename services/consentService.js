import { Consent } from '../models/Consent.js';
import { AppError } from '../utils/appError.js';

export const createConsent = (patientId, input, actor) =>
  Consent.create({
    patientId,
    consentGiven: input.consentGiven,
    consentType: input.consentType.trim().toUpperCase(),
    consentVersion: input.consentVersion.trim(),
    givenBy: actor._id,
  });

export const listConsents = (patientId) => Consent.find({ patientId }).sort({ timestamp: -1 });

export const findConsent = async (consentId) => {
  const consent = await Consent.findById(consentId);
  if (!consent) throw new AppError('Consent not found', 404);
  return consent;
};

export const revokeConsent = async (consent) => {
  if (consent.revokedAt) throw new AppError('Consent has already been revoked', 409);
  consent.revokedAt = new Date();
  return consent.save();
};

export const hasActiveConsent = (patientId, consentType) =>
  Consent.exists({ patientId, consentType: consentType.toUpperCase(), consentGiven: true, revokedAt: null });

export const toConsentResponse = (consent) => ({
  consentId: String(consent._id),
  patientId: consent.patientId,
  consentGiven: consent.consentGiven,
  consentType: consent.consentType,
  consentVersion: consent.consentVersion,
  givenBy: String(consent.givenBy),
  timestamp: consent.timestamp,
  revokedAt: consent.revokedAt,
  createdAt: consent.createdAt,
  updatedAt: consent.updatedAt,
});
