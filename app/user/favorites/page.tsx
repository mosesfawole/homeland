import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PropertyCard, {
  type PropertyCardData,
} from "@/components/property/PropertyCard";

export const metadata = {
  title: "Saved Properties - Homeland",
};

export default async function UserFavoritesPage() {
  const session = await auth();
  if (!session || session.user.role !== "USER") redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
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
          createdAt: true,
          verificationStatus: true,
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          agentProfile: {
            select: {
              agencyName: true,
              verificationStatus: true,
              user: { select: { name: true, avatar: true } },
            },
          },
        },
      },
    },
  });

  const properties = favorites.map((fav) => fav.property) as PropertyCardData[];

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
