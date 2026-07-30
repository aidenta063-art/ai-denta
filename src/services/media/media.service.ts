import { prisma } from "@/lib/prisma";
import { MediaType } from "@/generated/prisma/enums";
import { uploadMediaFile, deleteMediaFile } from "@/services/storage/storage.service";

export async function listMedia() {
  return prisma.media.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createMedia(input: {
  body: Buffer;
  contentType: string;
  originalName: string;
  uploadedById: string;
}) {
  const type = input.contentType.startsWith("video/")
    ? MediaType.VIDEO
    : MediaType.IMAGE;

  const { key, url } = await uploadMediaFile(input);

  return prisma.media.create({
    data: {
      key,
      url,
      type,
      sizeBytes: input.body.byteLength,
      uploadedById: input.uploadedById,
    },
  });
}

/** Records a Media row for a file that was already uploaded directly to
 * storage via a presigned URL (the bytes never passed through our server). */
export async function recordMedia(input: {
  key: string;
  publicUrl: string;
  contentType: string;
  sizeBytes: number;
  uploadedById: string;
}) {
  const type = input.contentType.startsWith("video/")
    ? MediaType.VIDEO
    : MediaType.IMAGE;

  return prisma.media.create({
    data: {
      key: input.key,
      url: input.publicUrl,
      type,
      sizeBytes: input.sizeBytes,
      uploadedById: input.uploadedById,
    },
  });
}

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUniqueOrThrow({ where: { id } });
  await prisma.media.delete({ where: { id } });
  await deleteMediaFile(media.key);
}
