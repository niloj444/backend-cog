import { randomUUID } from 'node:crypto';
import { FamilyMember } from '../models/FamilyMember.js';
import { Media } from '../models/Media.js';
import { objectStorage } from '../config/storage.js';
import { AppError } from '../utils/appError.js';

const extensionForMime = (mimeType) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg', 'video/mp4': 'mp4', 'video/webm': 'webm' }[mimeType]);

export const createMedia = async ({ patientId, familyMemberId, event, description, metadata, file, mediaType, actor }) => {
  if (familyMemberId) {
    const familyMember = await FamilyMember.findOne({ _id: familyMemberId, patientId });
    if (!familyMember) throw new AppError('Family member not found for this patient', 404);
  }
  const key = `patients/${patientId}/${randomUUID()}.${extensionForMime(file.mimetype)}`;
  const stored = await objectStorage.upload({ key, buffer: file.buffer, contentType: file.mimetype });
  try {
    return await Media.create({ patientId, familyMemberId: familyMemberId || null, type: mediaType, storageUrl: stored.storageUrl, event: event?.trim(), description: description?.trim(), uploadedBy: actor._id, metadata: { ...metadata, storageKey: stored.key, originalName: file.originalname, contentType: file.mimetype, sizeBytes: file.size } });
  } catch (error) {
    await objectStorage.delete(stored.key).catch(() => undefined);
    throw error;
  }
};

export const listMedia = (patientId) => Media.find({ patientId }).sort({ uploadedAt: -1 });

export const findMedia = async (mediaId) => {
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Media not found', 404);
  return media;
};

export const deleteMedia = async (media) => {
  await objectStorage.delete(media.metadata.storageKey);
  await media.deleteOne();
};

export const toMediaResponse = (media) => ({
  mediaId: String(media._id), patientId: media.patientId, familyMemberId: media.familyMemberId ? String(media.familyMemberId) : null,
  type: media.type, event: media.event, description: media.description, uploadedBy: String(media.uploadedBy), uploadedAt: media.uploadedAt,
  metadata: { originalName: media.metadata.originalName, contentType: media.metadata.contentType, sizeBytes: media.metadata.sizeBytes },
});
