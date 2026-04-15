import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, formatSupabaseError } from "@/lib/supabase-server";
import { createVerificationToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getRequestIp, isSameOrigin } from "@/lib/security";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`forgot-password:${ip}`, 5, 60_000);
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
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const supabase = getSupabaseAdmin();
    const { data: user, error: userError } = await supabase
      .from("User")
      .select("id, email, name")
      .ilike("email", email)
      .maybeSingle();

    if (userError) {
      console.error(
        "[POST /api/auth/forgot-password] User lookup failed",
        formatSupabaseError(userError),
      );
    }

    if (user?.email) {
      const identifier = `password-reset:${email}`;
      await supabase
        .from("VerificationToken")
        .delete()
        .eq("identifier", identifier);

      const { token, hashed } = createVerificationToken();
      const expires = new Date(Date.now() + 1000 * 60 * 60);

      const { error: tokenError } = await supabase
        .from("VerificationToken")
        .insert({
          identifier,
          token: hashed,
          expires,
        });

      if (tokenError) {
        console.error(
          "[POST /api/auth/forgot-password] Token create failed",
          formatSupabaseError(tokenError),
        );
      } else {
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ??
          process.env.NEXTAUTH_URL ??
          "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(
          email,
        )}`;
        await sendPasswordResetEmail({
          userEmail: user.email,
          userName: user.name,
          resetUrl,
        });
      }
    }

    return NextResponse.json({
      message: "If the account exists, a reset link has been sent.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auth/forgot-password]", message);
    return NextResponse.json(
      { error: "Unable to send reset email." },
      { status: 500 },
    );
  }
}
