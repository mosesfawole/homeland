import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PropertyCard, {
  type PropertyCardData,
} from "@/components/property/PropertyCard";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Saved Properties - Homeland",
};

export default async function UserFavoritesPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: favorites, error } = await supabase
    .from("Favorite")
    .select(
      `
      createdAt,
      property:Property(
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
        createdAt,
        verificationStatus,
        images:PropertyImage(url, isPrimary, order),
        agentProfile:AgentProfile(
          agencyName,
          verificationStatus,
          user:User(name, avatar)
        )
      )
    `,
    )
    .eq("userId", session.user.id)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[UserFavoritesPage] Failed to load favorites", formatSupabaseError(error));
  }

  const properties = (favorites ?? [])
    .map((fav) => {
      const property = fav.property;
      if (!property) return null;
      const images = Array.isArray(property.images) ? property.images : [];
      const primary =
        images.find((img: { isPrimary?: boolean }) => img.isPrimary) ?? images[0];
      return {
        ...property,
        images: primary ? [{ url: primary.url }] : [],
      } as PropertyCardData;
    })
    .filter(Boolean) as PropertyCardData[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your favorite listings in one place.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">
          You have no saved properties yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
