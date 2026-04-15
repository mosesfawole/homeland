import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations/property";
import { parsePagination, buildPropertyFilters } from "@/lib/utils/helpers";
import { LISTING_TYPES, PROPERTY_TYPES, type PropertyStatus } from "@/lib/db-types";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { isSameOrigin } from "@/lib/security";

// ── GET /api/properties ──────────────────────────────────────────
// Public — search and filter active listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const filters = buildPropertyFilters(searchParams);
    const supabase = getSupabaseAdmin();

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = supabase
      .from("Property")
      .select(
        `
        id,
        title,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        price,
        rentDuration,
        address,
        city,
        state,
        neighborhood,
        isFeatured,
        viewCount,
        createdAt,
        verificationStatus,
        features,
        images:PropertyImage(url, isPrimary, order),
        agentProfile:AgentProfile(
          id,
          agencyName,
          verificationStatus,
          user:User(name, avatar)
        )
      `,
        { count: "exact" },
      )
      .eq("status", "ACTIVE");

    if (filters.query) {
      const q = filters.query.replace(/[%(),]/g, "").trim();
      if (q) {
        query = query.or(
          [
            `title.ilike.%${q}%`,
            `description.ilike.%${q}%`,
            `address.ilike.%${q}%`,
            `city.ilike.%${q}%`,
            `state.ilike.%${q}%`,
            `neighborhood.ilike.%${q}%`,
          ].join(","),
        );
      }
    }

    if (filters.propertyType && PROPERTY_TYPES.includes(filters.propertyType)) {
      query = query.eq("propertyType", filters.propertyType);
    }

    if (filters.listingType && LISTING_TYPES.includes(filters.listingType)) {
      query = query.eq("listingType", filters.listingType);
    }

    if (filters.city) query = query.ilike("city", filters.city);
    if (filters.state) query = query.ilike("state", filters.state);
    if (Number.isFinite(filters.minPrice)) {
      query = query.gte("price", filters.minPrice as number);
    }
    if (Number.isFinite(filters.maxPrice)) {
      query = query.lte("price", filters.maxPrice as number);
    }
    if (Number.isFinite(filters.bedrooms)) {
      query = query.gte("bedrooms", filters.bedrooms as number);
    }

    query = query
      .order("isFeatured", { ascending: false })
      .order(sortBy === "price" ? "price" : "createdAt", {
        ascending: sortOrder === "asc",
      })
      .order("order", { ascending: true, foreignTable: "PropertyImage" })
      .range(skip, skip + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET /api/properties] Supabase error", formatSupabaseError(error));
      return NextResponse.json(
        { error: "Failed to fetch properties" },
        { status: 500 },
      );
    }

    const properties = (data ?? []).map((property) => {
      const images = Array.isArray(property.images) ? property.images : [];
      const primary =
        images.find((img: { isPrimary?: boolean }) => img.isPrimary) ?? images[0];
      return {
        ...property,
        images: primary ? [{ url: primary.url }] : [],
      };
    });

    const total = count ?? 0;

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
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const session = await auth();

    if (session?.user?.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = propertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0].message,
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: agentProfile, error: agentError } = await supabase
      .from("AgentProfile")
      .select("id, verificationStatus, totalListings")
      .eq("userId", session.user.id)
      .maybeSingle();

    if (agentError || !agentProfile) {
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

    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .insert({
        title,
        description,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        toilets,
        price,
        rentDuration: rentDuration ?? null,
        features: features ?? [],
        address,
        city,
        state,
        neighborhood,
        aiParsed: aiParsed ?? false,
        aiRawInput,
        status,
        agentProfileId: agentProfile.id,
      })
      .select("*")
      .single();

    if (propertyError || !property) {
      console.error("[POST /api/properties] Property create failed", formatSupabaseError(propertyError ?? { message: "Property not created" }));
      return NextResponse.json(
        { error: "Failed to create listing" },
        { status: 500 },
      );
    }

    const imageRows = (images ?? []).map((image, index) => ({
      propertyId: property.id,
      url: image.url,
      publicId: image.publicId,
      isPrimary: image.isPrimary ?? index === 0,
      order: image.order ?? index,
    }));

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase
        .from("PropertyImage")
        .insert(imageRows);

      if (imagesError) {
        await supabase.from("Property").delete().eq("id", property.id);
        console.error("[POST /api/properties] Image insert failed", formatSupabaseError(imagesError));
        return NextResponse.json(
          { error: "Failed to create listing images" },
          { status: 500 },
        );
      }
    }

    // Update agent listing count
    const nextTotal = (agentProfile.totalListings ?? 0) + 1;
    await supabase
      .from("AgentProfile")
      .update({ totalListings: nextTotal })
      .eq("id", agentProfile.id);

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
