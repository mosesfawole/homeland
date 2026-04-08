import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

const reportSchema = z.object({
  reason: z.string().min(3, "Reason is required"),
  details: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (propertyError) {
      console.error("[POST /api/properties/[id]/report] Property lookup failed", formatSupabaseError(propertyError));
    }

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const { data: report, error: reportError } = await supabase
      .from("Report")
      .insert({
        propertyId: id,
        userId: session.user.id,
        reason: parsed.data.reason,
        details: parsed.data.details ?? null,
      })
      .select("*")
      .single();

    if (reportError || !report) {
      console.error("[POST /api/properties/[id]/report] Report create failed", formatSupabaseError(reportError ?? { message: "Report not created" }));
      return NextResponse.json(
        { error: "Failed to submit report" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Report submitted", data: report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/properties/[id]/report]", message);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 },
    );
  }
}
