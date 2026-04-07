import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { propertySchema, type PropertyFormInput } from "@/lib/validations/property";
import { PropertyStatus, VerificationStatus } from "@prisma/client";
import type { PropertyImageInput } from "@/types";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/properties/[id] ─────────────────────────────────────
// Public — fetch single property with full details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
        videos: true,
        agentProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
                phone: true,
                createdAt: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { bookings: true, reviews: true, favorites: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Don't expose draft or rejected listings to the public
    const session = await auth();
    const isOwner = session?.user?.agentProfileId === property.agentProfileId;
    const isAdmin = session?.user?.role === "ADMIN";

    if (property.status !== "ACTIVE" && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Increment view count — fire and forget
    prisma.property
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return NextResponse.json({ data: property });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/properties/[id]]", message);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 },
    );
  }
}

// ── PATCH /api/properties/[id] ───────────────────────────────────
// Agent (own) or Admin — update a listing
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { agentProfileId: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    // Only the owner agent or admin can update
    const isOwner = session.user.agentProfileId === property.agentProfileId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Admin can update status directly (approve/reject)
    // Agents can only update content fields
    type AdminUpdateFields = {
      status?: PropertyStatus;
      verificationStatus?: VerificationStatus;
      verifiedAt?: Date | null;
      verifiedBy?: string | null;
      rejectionReason?: string | null;
      isFeatured?: boolean;
    };
    let updateData: Partial<PropertyFormInput> & AdminUpdateFields = {};

    const isPropertyStatus = (value: string): value is PropertyStatus =>
      (Object.values(PropertyStatus) as string[]).includes(value);

    if (isAdmin && typeof body.status === "string" && isPropertyStatus(body.status)) {
      updateData.status = body.status;
      if (body.status === "ACTIVE") {
        updateData.verificationStatus = "VERIFIED";
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = session.user.id;
      }
      if (body.status === "REJECTED" && typeof body.rejectionReason === "string") {
        updateData.rejectionReason = body.rejectionReason;
      }
      if (typeof body.isFeatured === "boolean") {
        updateData.isFeatured = body.isFeatured;
      }
    } else {
      // Agent editing — validate with schema
      const parsed = propertySchema.partial().safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0].message },
          { status: 400 },
        );
      }
      updateData = parsed.data;
      // Re-submit for review if agent edits a rejected listing
      if (property.status === "REJECTED") {
        updateData.status = "PENDING_REVIEW";
        updateData.rejectionReason = null;
      }
    }

    let nextImages: PropertyImageInput[] | undefined;
    if (updateData.images) {
      nextImages = updateData.images;
      const { images, ...rest } = updateData;
      updateData = rest;
    }
    if (nextImages) {
      delete (updateData as any).images;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        ...(nextImages
          ? {
              images: {
                deleteMany: {},
                create: nextImages.map((image, index) => ({
                  url: image.url,
                  publicId: image.publicId,
                  isPrimary: image.isPrimary ?? index === 0,
                  order: image.order ?? index,
                })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/properties/[id]]", message);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 },
    );
  }
}

// ── DELETE /api/properties/[id] ──────────────────────────────────
// Agent (own) or Admin — delete a listing
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { agentProfileId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }

    const isOwner = session.user.agentProfileId === property.agentProfileId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    // Decrement agent listing count
    if (property.agentProfileId) {
      await prisma.agentProfile
        .update({
          where: { id: property.agentProfileId },
          data: { totalListings: { decrement: 1 } },
        })
        .catch(() => {});
    }

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[DELETE /api/properties/[id]]", message);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 },
    );
  }
}
