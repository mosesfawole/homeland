import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { getRequestIp, checkRateLimit, isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`upload-signature:${ip}`, 20, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const session = await auth();
    if (session?.user?.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials are missing." },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedFolder =
      typeof body?.folder === "string" ? body.folder.trim() : "";
    const allowedFolders = new Set(["homeland/properties", "homeland/kyc"]);
    const folder = allowedFolders.has(requestedFolder)
      ? requestedFolder
      : "homeland/properties";

    const allowedFormats =
      folder === "homeland/kyc"
        ? ["jpg", "jpeg", "png"]
        : ["jpg", "jpeg", "png", "webp"];
    const maxFileSize = folder === "homeland/kyc" ? 6 * 1024 * 1024 : 8 * 1024 * 1024;
    const uploadType = folder === "homeland/kyc" ? "private" : "upload";
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        allowed_formats: allowedFormats.join(","),
        max_file_size: maxFileSize,
        type: uploadType,
      },
      apiSecret,
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      allowedFormats,
      maxFileSize,
      resourceType: "image",
      uploadType,
      apiKey,
      cloudName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/uploads/cloudinary]", message);
    return NextResponse.json(
      { error: "Failed to initialize upload" },
      { status: 500 },
    );
  }
}
