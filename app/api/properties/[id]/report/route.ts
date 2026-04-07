import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const report = await prisma.report.create({
      data: {
        propertyId: id,
        userId: session.user.id,
        reason: parsed.data.reason,
        details: parsed.data.details,
      },
    });

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
