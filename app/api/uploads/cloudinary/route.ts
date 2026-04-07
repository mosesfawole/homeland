import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
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
    const folder =
      typeof body?.folder === "string" && body.folder.trim().length > 0
        ? body.folder.trim()
        : "homeland/properties";

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret,
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
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
