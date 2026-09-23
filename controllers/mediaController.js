import { objectStorage } from '../config/storage.js';
import { createMedia, deleteMedia, listMedia, toMediaResponse } from '../services/mediaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const upload = asyncHandler(async (req, res) => {
  const media = await createMedia({ patientId: req.patient.patientId, familyMemberId: req.body.familyMemberId, event: req.body.event, description: req.body.description, metadata: req.parsedMetadata || {}, file: req.file, mediaType: req.mediaType, actor: req.user });
  return res.status(201).json({ success: true, media: toMediaResponse(media) });
});

export const list = asyncHandler(async (req, res) => {
  const media = await listMedia(req.patient.patientId);
  return res.status(200).json({ success: true, media: media.map(toMediaResponse) });
});

export const getOne = asyncHandler(async (req, res) => {
  const downloadUrl = await objectStorage.createDownloadUrl(req.media.metadata.storageKey);
  return res.status(200).json({ success: true, media: toMediaResponse(req.media), downloadUrl, downloadUrlExpiresInSeconds: 300 });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteMedia(req.media);
  return res.status(200).json({ success: true, message: 'Media deleted' });
});
