import mongoose from 'mongoose';

export const SESSION_STATUS = Object.freeze({ IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' });

const gameSessionSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true, immutable: true },
    gameId: { type: String, required: true, immutable: true },
    startedAt: { type: Date, required: true, default: Date.now, immutable: true },
    endedAt: { type: Date, default: null },
    score: { type: Number, required: true, default: 0, min: 0 },
    completionRate: { type: Number, required: true, default: 0, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true, min: 0, immutable: true },
    correctAnswers: { type: Number, required: true, default: 0, min: 0 },
    sessionDuration: { type: Number, required: true, default: 0, min: 0 },
    timeOfDay: { type: String, required: true, enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'] },
    status: { type: String, required: true, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.IN_PROGRESS },
  },
  { timestamps: true },
);

gameSessionSchema.index({ patientId: 1, startedAt: -1 });

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
