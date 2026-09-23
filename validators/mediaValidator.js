import mongoose from 'mongoose';
import { fileTypeFromBuffer } from 'file-type';
import { AppError } from '../utils/appError.js';
import { validatePatientIdValue } from './resourceValidator.js';

const supportedFiles = {
  'image/jpeg': { type: 'PHOTO', extensions: ['jpg', 'jpeg'] },
  'image/png': { type: 'PHOTO', extensions: ['png'] },
  'image/webp': { type: 'PHOTO', extensions: ['webp'] },
  'audio/mpeg': { type: 'AUDIO', extensions: ['mp3'] },
  'audio/wav': { type: 'AUDIO', extensions: ['wav'] },
  'audio/ogg': { type: 'AUDIO', extensions: ['ogg'] },
  'video/mp4': { type: 'VIDEO', extensions: ['mp4'] },
  'video/webm': { type: 'VIDEO', extensions: ['webm'] },
};

export const validateMediaUpload = async (req, res, next) => {
  try {
    const { patientId, familyMemberId, event, description, metadata } = req.body;
    if (!validatePatientIdValue(patientId)) throw new AppError('patientId is invalid', 400);
    if (!req.file) throw new AppError('A supported photo, audio, or video file is required', 400);
    if (familyMemberId && !mongoose.isObjectIdOrHexString(familyMemberId)) throw new AppError('familyMemberId is invalid', 400);
    if (event !== undefined && (typeof event !== 'string' || event.trim().length > 100)) throw new AppError('event must be a string with at most 100 characters', 400);
    if (description !== undefined && (typeof description !== 'string' || description.trim().length > 2_000)) throw new AppError('description must be a string with at most 2000 characters', 400);
    if (metadata !== undefined) {
      try {
        const parsed = JSON.parse(metadata);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
        req.parsedMetadata = parsed;
      } catch { throw new AppError('metadata must be a JSON object', 400); }
    }
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const supported = detected && supportedFiles[req.file.mimetype];
    if (!supported || !supported.extensions.includes(detected.ext)) throw new AppError('The uploaded file content does not match a supported media type', 400);
    req.mediaType = supported.type;
    return next();
  } catch (error) { return next(error); }
};
