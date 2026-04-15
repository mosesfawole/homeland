import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { isSameOrigin } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: updated, error: updateError } = await supabase
      .from("AgentProfile")
      .update({
        verificationStatus: "VERIFIED",
        verifiedAt: new Date().toISOString(),
        verifiedBy: session.user.id,
        rejectionReason: null,
      })
      .eq("verificationStatus", "PENDING")
      .select("id");

    if (updateError) {
      console.error(
        "[POST /api/admin/verify-agent/bulk] Update failed",
        formatSupabaseError(updateError),
      );
      return NextResponse.json(
        { error: "Failed to bulk approve agents" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Agents approved",
      count: updated?.length ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/verify-agent/bulk]", message);
    return NextResponse.json(
      { error: "Failed to bulk approve agents" },
      { status: 500 },
    );
  }
}
