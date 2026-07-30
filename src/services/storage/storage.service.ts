import crypto from "node:crypto";
import { LocalStorageProvider } from "@/services/storage/providers/local.provider";
import { R2StorageProvider } from "@/services/storage/providers/r2.provider";
import type { StorageProvider } from "@/services/storage/storage-provider.interface";

let cachedProvider: StorageProvider | null = null;

function createProvider(): StorageProvider {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE_URL,
  } = process.env;

  if (
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET &&
    R2_PUBLIC_BASE_URL
  ) {
    return new R2StorageProvider({
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET,
      publicBaseUrl: R2_PUBLIC_BASE_URL,
    });
  }

  return new LocalStorageProvider();
}

function getProvider(): StorageProvider {
  cachedProvider ??= createProvider();
  return cachedProvider;
}

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB, generous enough for short clips

const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function isAllowedUploadType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(contentType);
}

export function isWithinUploadSizeLimit(sizeBytes: number): boolean {
  return sizeBytes <= MAX_UPLOAD_BYTES;
}

function generateKey(originalName: string): string {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "";
  return `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
}

export async function uploadMediaFile(input: {
  body: Buffer;
  contentType: string;
  originalName: string;
}): Promise<{ key: string; url: string }> {
  return getProvider().upload({
    key: generateKey(input.originalName),
    body: input.body,
    contentType: input.contentType,
  });
}

export async function deleteMediaFile(key: string): Promise<void> {
  await getProvider().delete(key);
}

/**
 * Direct-to-storage upload URL for large files (see StorageProvider
 * docs). Returns null when the active provider doesn't support it
 * (LocalStorageProvider) — callers should fall back to the
 * server-proxied uploadMediaFile path in that case.
 */
export async function createPresignedMediaUpload(input: {
  originalName: string;
  contentType: string;
}): Promise<{ key: string; uploadUrl: string; publicUrl: string } | null> {
  const provider = getProvider();
  if (!provider.getPresignedUploadUrl) {
    return null;
  }

  const key = generateKey(input.originalName);
  const { uploadUrl, publicUrl } = await provider.getPresignedUploadUrl({
    key,
    contentType: input.contentType,
  });
  return { key, uploadUrl, publicUrl };
}
