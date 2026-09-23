import { endGameSession, listPatientSessions, startGameSession, toGameSessionResponse } from '../services/gameSessionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const start = asyncHandler(async (req, res) => {
  const session = await startGameSession(req.body, req.user);
  return res.status(201).json({ success: true, session: toGameSessionResponse(session) });
});
export const getOne = (req, res) => res.status(200).json({ success: true, session: toGameSessionResponse(req.gameSession) });
export const end = asyncHandler(async (req, res) => res.status(200).json({ success: true, session: toGameSessionResponse(await endGameSession(req.gameSession)) }));
export const list = asyncHandler(async (req, res) => {
  const sessions = await listPatientSessions(req.patient.patientId);
  return res.status(200).json({ success: true, sessions: sessions.map(toGameSessionResponse) });
});
