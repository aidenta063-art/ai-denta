export interface UploadInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
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
  /**
   * Direct-to-storage upload URL, so large files bypass our server
   * entirely (serverless platforms cap request body size — a proxied
   * upload through our own route handler fails well before typical
   * video file sizes). Only meaningful for a real cloud provider;
   * LocalStorageProvider doesn't implement this.
   */
  getPresignedUploadUrl?(input: {
    key: string;
    contentType: string;
  }): Promise<PresignedUpload>;
  /**
   * Stitches a set of already-uploaded temporary objects (each uploaded
   * in parallel via its own getPresignedUploadUrl — see
   * storage.service.ts's chunked upload flow) into one final object via
   * server-side multipart-copy, then deletes the temporary objects.
   *
   * Browsers can't read the ETag response header from a presigned PUT
   * (R2's CORS policy doesn't expose it), which rules out true
   * client-driven S3 multipart upload. Copying server-side sidesteps
   * that entirely: the SDK reads ETags directly, no CORS involved.
   */
  completeChunkedUpload?(input: {
    finalKey: string;
    contentType: string;
    partKeys: string[];
  }): Promise<{ url: string }>;
}
