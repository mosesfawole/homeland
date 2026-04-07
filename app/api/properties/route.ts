import { NextRequest, NextResponse } from "next/server";
import {
  ListingType,
  PropertyStatus,
  PropertyType,
  RentDuration,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations/property";
import { parsePagination, buildPropertyFilters } from "@/lib/utils/helpers";

// ── GET /api/properties ──────────────────────────────────────────
// Public — search and filter active listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const where = buildPropertyFilters(searchParams);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const orderBy =
      sortBy === "price"
        ? { price: sortOrder as "asc" | "desc" }
        : { createdAt: sortOrder as "asc" | "desc" };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" }, // featured always first
          orderBy,
        ],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          propertyType: true,
          listingType: true,
          bedrooms: true,
          bathrooms: true,
          price: true,
          rentDuration: true,
          address: true,
          city: true,
          state: true,
          neighborhood: true,
          isFeatured: true,
          viewCount: true,
          createdAt: true,
          verificationStatus: true,
          features: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
          agentProfile: {
            select: {
              id: true,
              agencyName: true,
              verificationStatus: true,
              user: {
                select: { name: true, avatar: true },
              },
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/properties]", message);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

// ── POST /api/properties ─────────────────────────────────────────
// Agent only — create a new listing
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0].message,
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 },
      );
    }

    const {
      title,
      description,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      toilets,
      price,
      rentDuration,
      features,
      images,
      address,
      city,
      state,
      neighborhood,
      aiParsed,
      aiRawInput,
    } = parsed.data;

    // Verified agents go straight to ACTIVE, others go to PENDING_REVIEW
    const status: PropertyStatus =
      agentProfile.verificationStatus === "VERIFIED"
        ? "ACTIVE"
        : "PENDING_REVIEW";

    const property = await prisma.property.create({
      data: {
        title,
        description,
        propertyType: propertyType as PropertyType,
        listingType: listingType as ListingType,
        bedrooms,
        bathrooms,
        toilets,
        price,
        rentDuration: rentDuration
          ? (rentDuration as RentDuration)
          : null,
        features: features ?? [],
        address,
        city,
        state,
        neighborhood,
        aiParsed: aiParsed ?? false,
        aiRawInput,
        status,
        agentProfileId: agentProfile.id,
        images: {
          create: (images ?? []).map((image, index) => ({
            url: image.url,
            publicId: image.publicId,
            isPrimary: image.isPrimary ?? index === 0,
            order: image.order ?? index,
          })),
        },
      },
    });

    // Update agent listing count
    await prisma.agentProfile.update({
      where: { id: agentProfile.id },
      data: { totalListings: { increment: 1 } },
    });

    return NextResponse.json(
      {
        data: property,
        message:
          status === "ACTIVE"
            ? "Listing published successfully"
            : "Listing submitted for review",
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/properties]", message);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 },
    );
  }
}
