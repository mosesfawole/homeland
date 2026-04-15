import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { getSupabaseAdmin, formatSupabaseError } from "@/lib/supabase-server";
import { getRequestIp, checkRateLimit, isSameOrigin } from "@/lib/security";
import { createVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, role } = parsed.data;

    const supabase = getSupabaseAdmin();

    // Check email not already taken
    const { data: existing, error: existingError } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("[POST /api/auth/register] Email check failed", formatSupabaseError(existingError));
      return NextResponse.json(
        { error: "Unable to validate email. Please try again." },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error: userError } = await supabase
      .from("User")
      .insert({ name, email, password: hashedPassword, role })
      .select("id")
      .single();

    if (userError || !user) {
      console.error("[POST /api/auth/register] User create failed", formatSupabaseError(userError ?? { message: "User not created" }));
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 },
      );
    }

    let agentProfileId: string | null = null;

    if (role === "AGENT") {
      const { data: agentProfile, error: agentError } = await supabase
        .from("AgentProfile")
        .insert({ userId: user.id })
        .select("id")
        .single();

      if (agentError) {
        // Roll back user if agent profile creation fails
        await supabase.from("User").delete().eq("id", user.id);
        console.error("[POST /api/auth/register] Agent profile create failed", formatSupabaseError(agentError));
        return NextResponse.json(
          { error: "Registration failed. Please try again." },
          { status: 500 },
        );
      }

      agentProfileId = agentProfile?.id ?? null;
    }

    const { token, hashed: verificationHash } = createVerificationToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const { error: tokenError } = await supabase
      .from("VerificationToken")
      .insert({
        identifier: email,
        token: verificationHash,
        expires,
      });

    if (tokenError) {
      if (agentProfileId) {
        await supabase.from("AgentProfile").delete().eq("id", agentProfileId);
      }
      await supabase.from("User").delete().eq("id", user.id);
      console.error("[POST /api/auth/register] Verification token create failed", formatSupabaseError(tokenError));
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(
      email,
    )}`;

    await sendVerificationEmail({
      userEmail: email,
      userName: name,
      verifyUrl,
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/auth/register]", message);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
