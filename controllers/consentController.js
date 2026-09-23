import { createConsent, listConsents, revokeConsent, toConsentResponse } from '../services/consentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const consent = await createConsent(req.patient.patientId, req.body, req.user);
  return res.status(201).json({ success: true, consent: toConsentResponse(consent) });
});
export const list = asyncHandler(async (req, res) => {
  const consents = await listConsents(req.patient.patientId);
  return res.status(200).json({ success: true, consents: consents.map(toConsentResponse) });
});
export const revoke = asyncHandler(async (req, res) => {
  const consent = await revokeConsent(req.consent);
  return res.status(200).json({ success: true, consent: toConsentResponse(consent) });
});
