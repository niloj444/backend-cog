import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true, immutable: true },
    consentGiven: { type: Boolean, required: true },
    // A normalized, validated string keeps consent categories extensible without schema changes.
    consentType: { type: String, required: true, trim: true, uppercase: true, match: /^[A-Z][A-Z0-9_]{2,50}$/ },
    consentVersion: { type: String, required: true, trim: true, maxlength: 50 },
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    timestamp: { type: Date, required: true, default: Date.now, immutable: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

consentSchema.index({ patientId: 1, consentType: 1, revokedAt: 1 });

export const Consent = mongoose.model('Consent', consentSchema);
