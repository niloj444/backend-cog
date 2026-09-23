import { calculatePatientAnalytics, calculateSessionAnalytics, createSessionFeatureVector, listPatientFeatureVectors } from '../services/analyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSessionAnalytics = asyncHandler(async (req, res) => {
  const analytics = await calculateSessionAnalytics(req.gameSession);
  return res.status(200).json({ success: true, analytics, featureVector: createSessionFeatureVector(analytics) });
});

export const getPatientAnalytics = asyncHandler(async (req, res) =>
  res.status(200).json({ success: true, analytics: await calculatePatientAnalytics(req.patient.patientId) }));

export const getPatientFeatureVectors = asyncHandler(async (req, res) =>
  res.status(200).json({ success: true, featureVectors: await listPatientFeatureVectors(req.patient.patientId) }));
