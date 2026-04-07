import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PropertyImages from "@/components/property/PropertyImages";
import AgentCard from "@/components/agent/AgentCard";
import BookingForm from "@/components/booking/BookingForm";
import { formatPrice, formatRentDuration } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Property Details - Homeland",
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const apiUrl = `${protocol}://${host}/api/properties/${id}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) {
    notFound();
  }

  const json = await res.json();
  const property = json?.data;

  if (!property) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {property.title}
            </h1>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(property.price)}
              {property.listingType === "RENT" && (
                <span className="text-sm font-medium text-gray-500">
                  {formatRentDuration(property.rentDuration)}
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500">
              {property.address}, {property.city}, {property.state}
            </p>
          </div>

          <PropertyImages mode="gallery" value={property.images ?? []} />

          <section className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <p className="text-xs text-gray-400">Bedrooms</p>
                <p className="font-medium text-gray-800">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Bathrooms</p>
                <p className="font-medium text-gray-800">
                  {property.bathrooms ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Toilets</p>
                <p className="font-medium text-gray-800">
                  {property.toilets ?? 0}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-900">
              Description
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {property.description}
            </p>
          </section>

          {property.features?.length > 0 && (
            <section className="bg-white border border-gray-100 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-semibold text-gray-900">
                Features
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature: string) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <AgentCard
            agencyName={property.agentProfile?.agencyName ?? null}
            verificationStatus={property.agentProfile?.verificationStatus ?? ""}
            user={{
              name: property.agentProfile?.user?.name ?? null,
              email: property.agentProfile?.user?.email ?? null,
              phone: property.agentProfile?.user?.phone ?? null,
              avatar: property.agentProfile?.user?.avatar ?? null,
            }}
          />

          <BookingForm propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
