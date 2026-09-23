import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

const createToken = (user) => jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const registerUser = async ({ name, email, password, phone }) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw new AppError('An account with that email already exists', 409);
  const passwordHash = await bcrypt.hash(password, 12);
  // Public registration has no role argument; users begin as PATIENT.
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, phone: phone?.trim() });
  return { user, token: createToken(user) };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('This account is inactive', 403);
  return { user, token: createToken(user) };
};

export const findAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new AppError('Authentication is no longer valid', 401);
  return user;
};
