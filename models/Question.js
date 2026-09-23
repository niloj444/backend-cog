import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true, index: true, immutable: true },
    question: { type: String, required: true, trim: true, minlength: 1, maxlength: 2_000 },
    options: { type: [String], required: true, validate: [(value) => value.length >= 2, 'At least two options are required'] },
    correctAnswer: { type: String, required: true, trim: true },
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

questionSchema.index({ gameId: 1, createdAt: 1 });

export const Question = mongoose.model('Question', questionSchema);
