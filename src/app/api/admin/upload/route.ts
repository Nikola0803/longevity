import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

function safeExt(filename: string, mime: string) {
  const fromName = path.extname(filename).toLowerCase().replace(".", "");
  if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(fromName)) return fromName;
  return mime.split("/")[1] ?? "jpg";
}

// POST /api/admin/upload — staff-only image upload for product/CMS images.
//
// Two storage backends, picked automatically:
// - Vercel Blob, when BLOB_READ_WRITE_TOKEN is set (Vercel injects this
//   automatically once a Blob store is connected to the project). Required
//   on Vercel — its filesystem is read-only/ephemeral at runtime, so writing
//   to /public would silently fail or vanish on the next deploy.
// - Local disk under /public/uploads, when that token isn't set — i.e.
//   local dev on your own machine or a VPS with a persistent filesystem.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, GIF, or AVIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 400 });
  }

  const ext = safeExt(file.name, file.type);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
