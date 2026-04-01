"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function uploadManga(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const cover = formData.get("cover") as string; // Will receive base64 for now
    const pagesRaw = formData.get("pages") as string;
    const pages = JSON.parse(pagesRaw) as string[];

    const manga = await prisma.manga.create({
      data: {
        title,
        author: author || "Anonymous",
        description,
        category,
        cover,
        pages: {
          create: pages.map((url, order) => ({
            url,
            order,
          })),
        },
      },
    });

    revalidatePath("/");
    return { success: true, mangaId: manga.id };
  } catch (error) {
    console.error("Failed to upload manga:", error);
    return { success: false, error: "Failed to upload manga" };
  }
}

export async function getMangas(sortBy: "popular" | "new" = "new") {
  const mangas = await prisma.manga.findMany({
    orderBy: sortBy === "popular" ? { views: "desc" } : { createdAt: "desc" },
    take: 12,
  });
  return mangas;
}

export async function getMangaById(id: string) {
  return prisma.manga.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { order: "asc" },
      },
      comments: {
        orderBy: { timestamp: "desc" },
      },
    },
  });
}

export async function incrementViews(id: string) {
  await prisma.manga.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
  revalidatePath("/");
}

export async function addComment(mangaId: string, author: string, text: string) {
  await prisma.comment.create({
    data: { mangaId, author, text },
  });
  revalidatePath("/");
}

export async function deleteManga(id: string) {
  await prisma.manga.delete({
    where: { id },
  });
  revalidatePath("/");
}

export async function getMangasByIds(ids: string[]) {
  return prisma.manga.findMany({
    where: { id: { in: ids } }
  });
}
