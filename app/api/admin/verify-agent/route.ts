import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

const verifySchema = z.object({
  agentProfileId: z.string().min(1),
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { agentProfileId, status, rejectionReason } = parsed.data;

    const supabase = getSupabaseAdmin();
    const { data: updated, error: updateError } = await supabase
      .from("AgentProfile")
      .update({
        verificationStatus: status,
        verifiedAt: status === "VERIFIED" ? new Date().toISOString() : null,
        verifiedBy: status === "VERIFIED" ? session.user.id : null,
        rejectionReason: status === "REJECTED" ? rejectionReason ?? null : null,
      })
      .eq("id", agentProfileId)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("[POST /api/admin/verify-agent] Update failed", formatSupabaseError(updateError ?? { message: "Agent not updated" }));
      return NextResponse.json(
        { error: "Failed to update agent" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Agent updated", data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/verify-agent]", message);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 },
    );
  }
}
