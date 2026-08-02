import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCopyCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  StorageProvider,
  UploadInput,
  UploadResult,
  PresignedUpload,
} from "@/services/storage/storage-provider.interface";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

const PRESIGNED_URL_TTL_SECONDS = 15 * 60; // room for large video uploads on slow connections

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor(config: R2Config) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/$/, "");
  }

  async upload({ key, body, contentType }: UploadInput): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return { key, url: `${this.publicBaseUrl}/${key}` };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getPresignedUploadUrl({
    key,
    contentType,
  }: {
    key: string;
    contentType: string;
  }): Promise<PresignedUpload> {
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: PRESIGNED_URL_TTL_SECONDS },
    );

    return { uploadUrl, publicUrl: `${this.publicBaseUrl}/${key}` };
  }

  async completeChunkedUpload({
    finalKey,
    contentType,
    partKeys,
  }: {
    finalKey: string;
    contentType: string;
    partKeys: string[];
  }): Promise<{ url: string }> {
    const created = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: finalKey,
        ContentType: contentType,
      }),
    );
    const uploadId = created.UploadId;
    if (!uploadId) {
      throw new Error("R2 did not return a multipart upload id");
    }

    try {
      const parts = await Promise.all(
        partKeys.map(async (partKey, i) => {
          const copied = await this.client.send(
            new UploadPartCopyCommand({
              Bucket: this.bucket,
              Key: finalKey,
              UploadId: uploadId,
              PartNumber: i + 1,
              CopySource: `${this.bucket}/${partKey}`,
            }),
          );
          const etag = copied.CopyPartResult?.ETag;
          if (!etag) {
            throw new Error(`Missing ETag copying part ${i + 1}`);
          }
          return { PartNumber: i + 1, ETag: etag };
        }),
      );

      await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.bucket,
          Key: finalKey,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }),
      );
    } catch (err) {
      await this.client
        .send(
          new AbortMultipartUploadCommand({
            Bucket: this.bucket,
            Key: finalKey,
            UploadId: uploadId,
          }),
        )
        .catch(() => {});
      throw err;
    } finally {
      await Promise.all(
        partKeys.map((partKey) =>
          this.client
            .send(new DeleteObjectCommand({ Bucket: this.bucket, Key: partKey }))
            .catch(() => {}),
        ),
      );
    }

    return { url: `${this.publicBaseUrl}/${finalKey}` };
  }
}
