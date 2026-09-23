import mongoose from 'mongoose';
import { ROLE_VALUES, ROLES } from '../utils/roles.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLE_VALUES, default: ROLES.PATIENT, required: true },
  phone: { type: String, trim: true, maxlength: 30 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Defence in depth when a user document is serialized outside an auth response.
userSchema.set('toJSON', { transform: (document, returnedObject) => {
  delete returnedObject.passwordHash;
  delete returnedObject.__v;
  return returnedObject;
} });

export const User = mongoose.model('User', userSchema);
