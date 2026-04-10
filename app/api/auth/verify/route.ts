import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, formatSupabaseError } from "@/lib/supabase-server";
import { hashToken } from "@/lib/token";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  const baseUrl = url.origin;

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/login?verified=0`);
  }

  const supabase = getSupabaseAdmin();
  const hashed = hashToken(token);

  const { data: record, error } = await supabase
    .from("VerificationToken")
    .select("identifier, token, expires")
    .eq("identifier", email)
    .eq("token", hashed)
    .maybeSingle();

  if (error || !record) {
    if (error) {
      console.error("[GET /api/auth/verify] Token lookup failed", formatSupabaseError(error));
    }
    return NextResponse.redirect(`${baseUrl}/login?verified=0`);
  }

  if (record.expires && new Date(record.expires) < new Date()) {
    await supabase
      .from("VerificationToken")
      .delete()
      .eq("identifier", email)
      .eq("token", hashed);
    return NextResponse.redirect(`${baseUrl}/login?verified=0`);
  }

  const { error: updateError } = await supabase
    .from("User")
    .update({ emailVerified: new Date().toISOString() })
    .eq("email", email);

  if (updateError) {
    console.error("[GET /api/auth/verify] User update failed", formatSupabaseError(updateError));
    return NextResponse.redirect(`${baseUrl}/login?verified=0`);
  }

  await supabase
    .from("VerificationToken")
    .delete()
    .eq("identifier", email)
    .eq("token", hashed);

  return NextResponse.redirect(`${baseUrl}/login?verified=1`);
}
