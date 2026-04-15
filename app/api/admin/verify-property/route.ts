import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { isSameOrigin } from "@/lib/security";

const verifySchema = z.object({
  propertyId: z.string().min(1),
  status: z.enum(["ACTIVE", "REJECTED"]).optional(),
  rejectionReason: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { propertyId, status, rejectionReason, isFeatured } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
      updateData.verificationStatus = status === "ACTIVE" ? "VERIFIED" : "REJECTED";
      updateData.verifiedAt = status === "ACTIVE" ? new Date() : null;
      updateData.verifiedBy = status === "ACTIVE" ? session.user.id : null;
      if (status === "REJECTED") {
        updateData.rejectionReason = rejectionReason ?? "Not specified";
      } else {
        updateData.rejectionReason = null;
      }
    }
    if (typeof isFeatured === "boolean") {
      updateData.isFeatured = isFeatured;
    }

    const supabase = getSupabaseAdmin();
    const { data: updated, error: updateError } = await supabase
      .from("Property")
      .update(updateData)
      .eq("id", propertyId)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("[POST /api/admin/verify-property] Update failed", formatSupabaseError(updateError ?? { message: "Property not updated" }));
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Property updated", data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/admin/verify-property]", message);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 },
    );
  }
}
