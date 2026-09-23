import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true, immutable: true },
    familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
    type: { type: String, required: true, enum: ['PHOTO', 'AUDIO', 'VIDEO'] },
    // Internal object reference, never returned directly to callers.
    storageUrl: { type: String, required: true, immutable: true },
    event: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2_000 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    uploadedAt: { type: Date, required: true, default: Date.now, immutable: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

mediaSchema.index({ patientId: 1, uploadedAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);
