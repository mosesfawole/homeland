import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, formatSupabaseError } from "@/lib/supabase-server";

async function seedAdmin() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment." },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error(
        "[POST /api/auth/seed-admin] Lookup failed",
        formatSupabaseError(existingError),
      );
      return NextResponse.json(
        { error: "Failed to check admin account." },
        { status: 500 },
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("User")
        .update({
          name,
          role: "ADMIN",
          password: hashed,
          emailVerified: now,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(
          "[POST /api/auth/seed-admin] Update failed",
          formatSupabaseError(updateError),
        );
        return NextResponse.json(
          { error: "Failed to update admin account." },
          { status: 500 },
        );
      }

      return NextResponse.json({ message: "Admin account updated." });
    }

    const { error: createError } = await supabase.from("User").insert({
      name,
      email,
      password: hashed,
      role: "ADMIN",
      emailVerified: now,
    });

    if (createError) {
      console.error(
        "[POST /api/auth/seed-admin] Create failed",
        formatSupabaseError(createError),
      );
      return NextResponse.json(
        { error: "Failed to create admin account." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Admin account created." });
  } catch (error) {
    console.error("[POST /api/auth/seed-admin]", error);
    return NextResponse.json(
      { error: "Failed to seed admin account." },
      { status: 500 },
    );
  }
}

export async function POST() {
  return seedAdmin();
}

export async function GET() {
  return seedAdmin();
}
