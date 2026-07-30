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

export async function deleteMedia(id: string) {
  const media = await prisma.media.findUniqueOrThrow({ where: { id } });
  await prisma.media.delete({ where: { id } });
  await deleteMediaFile(media.key);
}
