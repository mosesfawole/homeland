import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { propertySchema, type PropertyFormInput } from "@/lib/validations/property";
import type { PropertyImageInput } from "@/types";
import { PROPERTY_STATUSES, type PropertyStatus, type VerificationStatus } from "@/lib/db-types";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { isSameOrigin } from "@/lib/security";

type Params = { params: Promise<{ id: string }> };

// ── GET /api/properties/[id] ─────────────────────────────────────
// Public — fetch single property with full details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: property, error } = await supabase
      .from("Property")
      .select(
        `
        id,
        title,
        description,
        propertyType,
        listingType,
        bedrooms,
        bathrooms,
        toilets,
        price,
        rentDuration,
        address,
        city,
        state,
        neighborhood,
        features,
        isFeatured,
        viewCount,
        status,
        createdAt,
        agentProfileId,
        images:PropertyImage(url, publicId, isPrimary, order),
        agentProfile:AgentProfile(
          id,
          agencyName,
          verificationStatus,
          user:User(name, avatar)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("[GET /api/properties/[id]] Supabase error", formatSupabaseError(error));
    }

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

    const [bookingsCount, reviewsCount, favoritesCount] = await Promise.all([
      supabase
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("propertyId", id)
        .then((res) => res.count ?? 0),
      supabase
        .from("Review")
        .select("id", { count: "exact", head: true })
        .eq("propertyId", id)
        .then((res) => res.count ?? 0),
      supabase
        .from("Favorite")
        .select("id", { count: "exact", head: true })
        .eq("propertyId", id)
        .then((res) => res.count ?? 0),
    ]);

    const viewCount = typeof property.viewCount === "number" ? property.viewCount : 0;

    // Increment view count — fire and forget
    void supabase
      .from("Property")
      .update({ viewCount: viewCount + 1 })
      .eq("id", id);

    const images = Array.isArray(property.images)
      ? property.images.sort((a, b) => {
          if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
          return (a.order ?? 0) - (b.order ?? 0);
        })
      : [];

    const publicProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      toilets: property.toilets,
      price: property.price,
      rentDuration: property.rentDuration,
      address: property.address,
      city: property.city,
      state: property.state,
      neighborhood: property.neighborhood,
      features: property.features,
      isFeatured: property.isFeatured,
      viewCount: property.viewCount,
      createdAt: property.createdAt,
      agentProfile: property.agentProfile,
    };

    return NextResponse.json({
      data: {
        ...publicProperty,
        images,
        _count: {
          bookings: bookingsCount,
          reviews: reviewsCount,
          favorites: favoritesCount,
        },
      },
    });
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
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();

    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .select("agentProfileId, status")
      .eq("id", id)
      .maybeSingle();

    if (propertyError) {
      console.error("[PATCH /api/properties/[id]] Supabase error", formatSupabaseError(propertyError));
    }

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
      (PROPERTY_STATUSES as readonly string[]).includes(value);

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
          { error: parsed.error.issues[0].message },
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
      const { images: imagesToUpdate, ...rest } = updateData;
      nextImages = imagesToUpdate;
      updateData = rest;
    }

    const { data: updated, error: updateError } = await supabase
      .from("Property")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      console.error("[PATCH /api/properties/[id]] Update failed", formatSupabaseError(updateError ?? { message: "Property not updated" }));
      return NextResponse.json(
        { error: "Failed to update property" },
        { status: 500 },
      );
    }

    if (nextImages) {
      const { data: existingImages, error: existingImagesError } = await supabase
        .from("PropertyImage")
        .select("url, publicId, isPrimary, order")
        .eq("propertyId", id);

      if (existingImagesError) {
        console.error(
          "[PATCH /api/properties/[id]] Existing image lookup failed",
          formatSupabaseError(existingImagesError),
        );
        return NextResponse.json(
          { error: "Failed to update property images" },
          { status: 500 },
        );
      }

      const { error: deleteImagesError } = await supabase
        .from("PropertyImage")
        .delete()
        .eq("propertyId", id);

      if (deleteImagesError) {
        console.error(
          "[PATCH /api/properties/[id]] Existing image delete failed",
          formatSupabaseError(deleteImagesError),
        );
        return NextResponse.json(
          { error: "Failed to update property images" },
          { status: 500 },
        );
      }

      if (nextImages.length > 0) {
        const imageRows = nextImages.map((image, index) => ({
          propertyId: id,
          url: image.url,
          publicId: image.publicId,
          isPrimary: image.isPrimary ?? index === 0,
          order: image.order ?? index,
        }));
        const { error: imagesError } = await supabase
          .from("PropertyImage")
          .insert(imageRows);
        if (imagesError) {
          if ((existingImages ?? []).length > 0) {
            await supabase.from("PropertyImage").insert(
              existingImages.map((image) => ({
                propertyId: id,
                ...image,
              })),
            );
          }
          console.error("[PATCH /api/properties/[id]] Image update failed", formatSupabaseError(imagesError));
          return NextResponse.json(
            { error: "Failed to update property images" },
            { status: 500 },
          );
        }
      }
    }

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
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: property, error: propertyError } = await supabase
      .from("Property")
      .select("agentProfileId")
      .eq("id", id)
      .maybeSingle();

    if (propertyError) {
      console.error("[DELETE /api/properties/[id]] Supabase error", formatSupabaseError(propertyError));
    }

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

    const { error: deleteError } = await supabase
      .from("Property")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[DELETE /api/properties/[id]] Delete failed", formatSupabaseError(deleteError));
      return NextResponse.json(
        { error: "Failed to delete property" },
        { status: 500 },
      );
    }

    // Decrement agent listing count
    if (property.agentProfileId) {
      const { data: agentProfile } = await supabase
        .from("AgentProfile")
        .select("totalListings")
        .eq("id", property.agentProfileId)
        .maybeSingle();
      const current = agentProfile?.totalListings ?? 0;
      await supabase
        .from("AgentProfile")
        .update({ totalListings: Math.max(current - 1, 0) })
        .eq("id", property.agentProfileId);
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
