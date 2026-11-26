import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ENDPOINT = process.env.AWS_ENDPOINT_URL_S3!;
const REGION = process.env.AWS_REGION!;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const BUCKET = process.env.AWS_S3_BUCKET || 'nestbloom';

export const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  forcePathStyle: true,
});

export const BUCKET_NAME = BUCKET;

export const FOLDERS = {
  avatars: 'avatars',
  bumps: 'bumps',
  journal: 'journal',
} as const;

export type Folder = (typeof FOLDERS)[keyof typeof FOLDERS];

export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function getDownloadUrl(key: string, expiresIn = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix });
  const res = await s3.send(command);
  return (res.Contents ?? []).map((o) => o.Key!).filter(Boolean);
}

export function makeKey(folder: Folder, userId: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${folder}/${userId}/${Date.now()}_${safeName}`;
}
