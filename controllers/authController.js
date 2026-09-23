import { findAuthenticatedUser, loginUser, registerUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const authenticationResponse = (res, statusCode, { user, token }) => res.status(statusCode).json({ success: true, token, user: user.toJSON() });
export const register = asyncHandler(async (req, res) => authenticationResponse(res, 201, await registerUser(req.body)));
export const login = asyncHandler(async (req, res) => authenticationResponse(res, 200, await loginUser(req.body)));
export const getMe = asyncHandler(async (req, res) => {
  const user = await findAuthenticatedUser(req.user.id);
  return res.status(200).json({ success: true, user: user.toJSON() });
});
export const logout = (req, res) => res.status(204).send();
