import { NextResponse } from "next/server";
import { deleteManga, uploadManga } from "@/actions/manga";

export async function POST(request: Request) {
  const result = await uploadManga(await request.formData());
  if (result.success) return NextResponse.json(result, { status: 201 });
  const error = "error" in result ? result.error : "Unable to publish manga";
  return NextResponse.json(result, { status: error === "Unauthorized" ? 401 : error === "Forbidden" ? 403 : 400 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  try { await deleteManga(id); return new Response(null, { status: 204 }); }
  catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete manga";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ success: false, error: message === "Unauthorized" || message === "Forbidden" ? message : "Unable to delete manga" }, { status });
  }
}
