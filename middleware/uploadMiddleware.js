import multer from 'multer';
import { AppError } from '../utils/appError.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
});

export const uploadMediaFile = (req, res, next) => upload.single('file')(req, res, (error) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return next(new AppError('File must be 50 MB or smaller', 400));
  if (error) return next(new AppError('Unsupported file type or invalid upload', 400));
  return next();
});
