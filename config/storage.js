import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const requireStorageEnvironment = () => {
  const required = ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'];
  const missing = required.filter((name) => !process.env[name]);
  if (process.env.STORAGE_PROVIDER !== 's3' || missing.length) {
    throw new Error(`Object storage is unavailable. Set STORAGE_PROVIDER=s3 and: ${required.join(', ')}`);
  }
};

let client;
const getClient = () => {
  requireStorageEnvironment();
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
    });
  }
  return client;
};

export const objectStorage = {
  async upload({ key, buffer, contentType }) {
    const storageClient = getClient();
    await storageClient.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: buffer, ContentType: contentType, ServerSideEncryption: 'AES256' }));
    return { key, storageUrl: `s3://${process.env.S3_BUCKET}/${key}` };
  },
  async createDownloadUrl(key) {
    return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: 300 });
  },
  async delete(key) {
    await getClient().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  },
};
