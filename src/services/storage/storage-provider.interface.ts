export interface UploadInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Port for object storage. The dashboard's media library uploads through
 * this without knowing whether files land on local disk (dev, no cloud
 * account needed) or Cloudflare R2 (once credentials are configured) —
 * see storage.service.ts for provider selection.
 */
export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}
