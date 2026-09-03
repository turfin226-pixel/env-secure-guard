"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();
const MAX_TEXT = { title: 200, author: 120, description: 4_000, category: 80, url: 2_000, comment: 1_000 } as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function text(value: FormDataEntryValue | null, field: string, limit: number, required = true): string {
  if (typeof value !== "string") throw new Error(`Invalid ${field}`);
  const result = value.trim();
  if (required && !result) throw new Error(`Missing ${field}`);
  if (result.length > limit) throw new Error(`${field} is too long`);
  return result;
}

function cleanComment(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

function dataImage(value: string, field: string): string {
  if (!/^data:image\/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/i.test(value)) throw new Error(`Invalid ${field} image`);
  const encoded = value.slice(value.indexOf(",") + 1);
  if (Math.ceil(encoded.length * 3 / 4) > MAX_IMAGE_BYTES) throw new Error(`${field} exceeds 5 MB`);
  return value;
}

async function requireAdmin(): Promise<void> {
  const configured = process.env.MANGA_ADMIN_SECRET;
  const authorization = (await headers()).get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!configured || !supplied) throw new Error("Unauthorized");
  const expected = createHash("sha256").update(configured).digest();
  const actual = createHash("sha256").update(supplied).digest();
  if (!timingSafeEqual(expected, actual)) throw new Error("Forbidden");
}

export async function uploadManga(formData: FormData) {
  try {
    await requireAdmin();
    const title = text(formData.get("title"), "title", MAX_TEXT.title);
    const author = text(formData.get("author"), "author", MAX_TEXT.author, false) || "Anonymous";
    const description = text(formData.get("description"), "description", MAX_TEXT.description, false);
    const category = text(formData.get("category"), "category", MAX_TEXT.category, false) || "Uncategorized";
    const cover = dataImage(text(formData.get("cover"), "cover", 7_000_000), "cover");
    let pages: unknown;
    try { pages = JSON.parse(text(formData.get("pages"), "pages", 60_000)); } catch { throw new Error("Invalid pages JSON"); }
    if (!Array.isArray(pages) || pages.length < 1 || pages.length > 100 || pages.some((page) => typeof page !== "string")) throw new Error("Pages must contain 1 to 100 images");
    const validPages = pages.map((page) => dataImage(page, "page"));
    const manga = await prisma.manga.create({ data: { title, author, description, category, cover, pages: { create: validPages.map((url, order) => ({ url, order })) } } });
    revalidatePath("/");
    return { success: true, mangaId: manga.id };
  } catch (error) {
    console.error("Manga mutation rejected", error instanceof Error ? error.message : "unknown error");
    return { success: false, error: error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message) ? error.message : "Unable to publish manga" };
  }
}

export async function getMangas(sortBy: "popular" | "new" = "new") { return prisma.manga.findMany({ orderBy: sortBy === "popular" ? { views: "desc" } : { createdAt: "desc" }, take: 12 }); }
export async function getMangaById(id: string) { if (!/^c[a-z0-9]{20,30}$/.test(id)) return null; return prisma.manga.findUnique({ where: { id }, include: { pages: { orderBy: { order: "asc" } }, comments: { orderBy: { timestamp: "desc" } } } }); }
export async function incrementViews(id: string) { if (!/^c[a-z0-9]{20,30}$/.test(id)) throw new Error("Invalid manga id"); await prisma.manga.update({ where: { id }, data: { views: { increment: 1 } } }); revalidatePath("/"); }
export async function addComment(mangaId: string, author: string, value: string) {
  if (!/^c[a-z0-9]{20,30}$/.test(mangaId)) throw new Error("Invalid manga id");
  const safeAuthor = cleanComment(text(author, "author", MAX_TEXT.author, false) || "Anonymous");
  const safeText = cleanComment(text(value, "comment", MAX_TEXT.comment));
  if (!safeText) throw new Error("Comment cannot be empty");
  await prisma.comment.create({ data: { mangaId, author: safeAuthor, text: safeText } }); revalidatePath("/");
}
export async function deleteManga(id: string) { await requireAdmin(); if (!/^c[a-z0-9]{20,30}$/.test(id)) throw new Error("Invalid manga id"); await prisma.manga.delete({ where: { id } }); revalidatePath("/"); }
export async function getMangasByIds(ids: string[]) { const valid = ids.filter((id) => /^c[a-z0-9]{20,30}$/.test(id)).slice(0, 50); return prisma.manga.findMany({ where: { id: { in: valid } } }); }
