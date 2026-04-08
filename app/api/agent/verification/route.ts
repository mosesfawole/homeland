import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

const verificationSchema = z.object({
  govIdUrl: z.string().url().optional(),
  cacDocUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: agentProfile, error: agentError } = await supabase
      .from("AgentProfile")
      .select("id, verificationStatus")
      .eq("userId", session.user.id)
      .maybeSingle();

    if (agentError) {
      console.error("[POST /api/agent/verification] Agent lookup failed", formatSupabaseError(agentError));
    }

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 },
      );
    }

    const nextStatus =
      agentProfile.verificationStatus === "VERIFIED"
        ? "VERIFIED"
        : "PENDING";

    const { data: updated, error: updateError } = await supabase
      .from("AgentProfile")
      .update({
        govIdUrl: parsed.data.govIdUrl ?? null,
        cacDocUrl: parsed.data.cacDocUrl ?? null,
        verificationStatus: nextStatus,
      })
      .eq("id", agentProfile.id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("[POST /api/agent/verification] Update failed", formatSupabaseError(updateError ?? { message: "Agent profile not updated" }));
      return NextResponse.json(
        { error: "Failed to submit verification documents" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification documents submitted",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/agent/verification]", message);
    return NextResponse.json(
      { error: "Failed to submit verification documents" },
      { status: 500 },
    );
  }
}
