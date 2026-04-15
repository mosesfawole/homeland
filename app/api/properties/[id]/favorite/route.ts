import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { isSameOrigin } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const session = await auth();
    if (!session || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (propertyError) {
      console.error("[POST /api/properties/[id]/favorite] Property lookup failed", formatSupabaseError(propertyError));
    }

    if (!property || property.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("Favorite")
      .select("id")
      .eq("userId", session.user.id)
      .eq("propertyId", id)
      .maybeSingle();

    if (existingError) {
      console.error("[POST /api/properties/[id]/favorite] Favorite lookup failed", formatSupabaseError(existingError));
    }

    if (existing) {
      await supabase.from("Favorite").delete().eq("id", existing.id);
      return NextResponse.json({ favorited: false });
    }

    const { error: insertError } = await supabase
      .from("Favorite")
      .insert({ userId: session.user.id, propertyId: id });

    if (insertError) {
      console.error("[POST /api/properties/[id]/favorite] Favorite create failed", formatSupabaseError(insertError));
      return NextResponse.json(
        { error: "Failed to update favorite" },
        { status: 500 },
      );
    }

    return NextResponse.json({ favorited: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/properties/[id]/favorite]", message);
    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 },
    );
  }
}
