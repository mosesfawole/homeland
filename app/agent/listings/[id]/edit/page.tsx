import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PropertyForm from "@/components/forms/PropertyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Listing - Homeland",
};

export default async function EditListingPage({ params }: PageProps) {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!property) redirect("/agent/listings");

  if (property.agentProfileId !== session.user.agentProfileId) {
    redirect("/agent/listings");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/agent/listings"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Listings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your listing information and images.
        </p>
      </div>

      <PropertyForm
        mode="edit"
        propertyId={property.id}
        defaultValues={{
          title: property.title,
          description: property.description,
          propertyType: property.propertyType,
          listingType: property.listingType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          toilets: property.toilets,
          price: property.price,
          rentDuration: property.rentDuration,
          features: property.features,
          address: property.address,
          city: property.city,
          state: property.state,
          neighborhood: property.neighborhood,
          images: property.images.map((image) => ({
            url: image.url,
            publicId: image.publicId,
            isPrimary: image.isPrimary,
            order: image.order,
          })),
        }}
      />
    </div>
  );
}
