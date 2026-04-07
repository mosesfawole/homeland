import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!property || property.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: id,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: session.user.id, propertyId: id },
    });

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
