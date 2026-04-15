import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, formatSupabaseError } from "@/lib/supabase-server";
import { hashToken } from "@/lib/token";
import { checkRateLimit, getRequestIp, isSameOrigin } from "@/lib/security";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`reset-password:${ip}`, 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const tokenHash = hashToken(parsed.data.token);
    const identifier = `password-reset:${email}`;

    const supabase = getSupabaseAdmin();
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("VerificationToken")
      .select("token, expires")
      .eq("identifier", identifier)
      .eq("token", tokenHash)
      .maybeSingle();

    if (tokenError) {
      console.error(
        "[POST /api/auth/reset-password] Token lookup failed",
        formatSupabaseError(tokenError),
      );
    }

    const expiresAt = tokenRecord?.expires
      ? new Date(tokenRecord.expires).getTime()
      : 0;

    if (!tokenRecord || expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const { data: updated, error: updateError } = await supabase
      .from("User")
      .update({ password: hashedPassword })
      .ilike("email", email)
      .select("id")
      .maybeSingle();

    if (updateError || !updated) {
      console.error(
        "[POST /api/auth/reset-password] Password update failed",
        formatSupabaseError(updateError ?? { message: "User not updated" }),
      );
      return NextResponse.json(
        { error: "Unable to reset password. Please try again." },
        { status: 500 },
      );
    }

    await supabase.from("VerificationToken").delete().eq("identifier", identifier);

    return NextResponse.json({ message: "Password updated" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auth/reset-password]", message);
    return NextResponse.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 },
    );
  }
}
