import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';

const PATIENT_ID_PATTERN = /^PAT-[A-F0-9]{16}$/;

export const validatePatientIdValue = (patientId) => typeof patientId === 'string' && PATIENT_ID_PATTERN.test(patientId);

export const validatePatientIdParam = (req, res, next) =>
  validatePatientIdValue(req.params.patientId)
    ? next()
    : next(new AppError('patientId is invalid', 400));

export const validateObjectIdParam = (paramName) => (req, res, next) =>
  mongoose.isObjectIdOrHexString(req.params[paramName])
    ? next()
    : next(new AppError(`${paramName} is invalid`, 400));
