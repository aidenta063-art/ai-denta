import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type {
  StorageProvider,
  UploadInput,
  UploadResult,
} from "@/services/storage/storage-provider.interface";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Dev-only fallback used until a real Cloudflare R2 bucket is configured.
 * Writes straight to /public/uploads so files are served by Next.js like
 * any other static asset. Not suitable for a multi-instance deployment —
 * swap to R2Provider (see r2.provider.ts) once credentials exist.
 */
export class LocalStorageProvider implements StorageProvider {
  async upload({ key, body, contentType }: UploadInput): Promise<UploadResult> {
    void contentType;
    const filePath = path.join(UPLOADS_DIR, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);
    return { key, url: `/uploads/${key}` };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, key);
    await unlink(filePath).catch(() => {});
  }
}
