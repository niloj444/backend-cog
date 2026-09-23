import { createGame, deleteGame, findGame, listGames, toGameResponse, updateGame } from '../services/gameService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, game: toGameResponse(await createGame(req.body)) }));
export const list = asyncHandler(async (req, res) => {
  const games = await listGames(req.user);
  return res.status(200).json({ success: true, games: games.map(toGameResponse) });
});
export const getOne = asyncHandler(async (req, res) => res.status(200).json({ success: true, game: toGameResponse(await findGame(req.params.gameId, req.user)) }));
export const update = asyncHandler(async (req, res) => res.status(200).json({ success: true, game: toGameResponse(await updateGame(req.game, req.body)) }));
export const remove = asyncHandler(async (req, res) => { await deleteGame(req.game); return res.status(200).json({ success: true, message: 'Game deleted' }); });
