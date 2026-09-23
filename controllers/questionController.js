import { createQuestion, deleteQuestion, findGame, toQuestionResponse, updateQuestion, listQuestions } from '../services/gameService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';

export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, question: toQuestionResponse(await createQuestion(req.game.gameId, req.body), true) }));
export const list = asyncHandler(async (req, res) => {
  const questions = await listQuestions(req.game.gameId);
  return res.status(200).json({ success: true, questions: questions.map((question) => toQuestionResponse(question, req.user.role === ROLES.ADMIN)) });
});
export const getOne = asyncHandler(async (req, res) => {
  await findGame(req.question.gameId, req.user);
  return res.status(200).json({ success: true, question: toQuestionResponse(req.question, req.user.role === ROLES.ADMIN) });
});
export const update = asyncHandler(async (req, res) => res.status(200).json({ success: true, question: toQuestionResponse(await updateQuestion(req.question, req.body), true) }));
export const remove = asyncHandler(async (req, res) => { await deleteQuestion(req.question); return res.status(200).json({ success: true, message: 'Question deleted' }); });
