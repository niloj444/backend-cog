import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, immutable: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 0, max: 130 },
    gender: { type: String, required: true, trim: true, maxlength: 50 },
    preferredLanguage: { type: String, required: true, trim: true, maxlength: 50 },
    dementiaStage: { type: String, required: true, trim: true, maxlength: 50 },
    routine: { type: [String], default: [] },
    difficulties: { type: [String], default: [] },
    // This ownership link is used only for authorization; it is not returned in patient DTOs.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    caregiverIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    doctorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

patientSchema.index({ doctorIds: 1 });
patientSchema.index({ caregiverIds: 1 });

export const Patient = mongoose.model('Patient', patientSchema);
