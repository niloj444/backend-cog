import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true, immutable: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', required: true, index: true, immutable: true },
    gameId: { type: String, required: true, immutable: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, immutable: true },
    selectedOption: { type: String, required: true, trim: true, maxlength: 500, immutable: true },
    correctOption: { type: String, required: true, trim: true, maxlength: 500, immutable: true },
    isCorrect: { type: Boolean, required: true, immutable: true },
    responseTime: { type: Number, required: true, min: 0, max: 3_600_000, immutable: true },
    hintsUsed: { type: Number, required: true, min: 0, max: 50, immutable: true },
    retryCount: { type: Number, required: true, min: 0, max: 50, immutable: true },
    timestamp: { type: Date, required: true, default: Date.now, immutable: true },
  },
  { timestamps: true },
);

telemetrySchema.index({ sessionId: 1, timestamp: 1 });
telemetrySchema.index({ patientId: 1, timestamp: -1 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
