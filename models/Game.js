import mongoose from 'mongoose';

export const GAME_TYPES = Object.freeze(['Who is this?', 'Life Timeline', 'Routine Sequencing', 'My Story Quiz']);

const gameSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true, unique: true, immutable: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    type: { type: String, required: true, enum: GAME_TYPES },
    difficulty: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, trim: true, maxlength: 2_000 },
    active: { type: Boolean, default: true },
    // Server-owned rules, timers, scoring settings, and type-specific data.
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Game = mongoose.model('Game', gameSchema);
