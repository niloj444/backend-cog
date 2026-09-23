import mongoose from 'mongoose';

export const FAMILY_RELATION_TYPES = Object.freeze(['Son', 'Daughter', 'Wife', 'Grandchild']);

const familyMemberSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true, immutable: true },
    relationType: { type: String, required: true, enum: FAMILY_RELATION_TYPES },
    personName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    age: { type: Number, min: 0, max: 130 },
    city: { type: String, trim: true, maxlength: 100 },
    occupation: { type: String, trim: true, maxlength: 100 },
    notes: { type: String, trim: true, maxlength: 2_000 },
  },
  { timestamps: true },
);

export const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
