import { listPatientTelemetry, listSessionTelemetry, recordTelemetry, toTelemetryResponse } from '../services/telemetryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const telemetry = await recordTelemetry(req.body, req.gameSession);
  return res.status(201).json({ success: true, telemetry: toTelemetryResponse(telemetry) });
});
export const listForSession = asyncHandler(async (req, res) => {
  const telemetry = await listSessionTelemetry(req.gameSession._id);
  return res.status(200).json({ success: true, telemetry: telemetry.map(toTelemetryResponse) });
});
export const listForPatient = asyncHandler(async (req, res) => {
  const telemetry = await listPatientTelemetry(req.patient.patientId);
  return res.status(200).json({ success: true, telemetry: telemetry.map(toTelemetryResponse) });
});
