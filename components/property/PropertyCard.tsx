import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, BadgeCheck } from "lucide-react";
import {
  formatPrice,
  formatRentDuration,
  timeAgo,
  truncate,
} from "@/lib/utils/format";

export interface PropertyCardData {
  id: string;
  title: string;
  propertyType: string;
  listingType: "RENT" | "SALE";
  bedrooms: number;
  bathrooms: number | null;
  price: number;
  rentDuration: string | null;
  address: string;
  city: string;
  state: string;
  neighborhood: string | null;
  isFeatured: boolean;
  createdAt: string | Date;
  verificationStatus: string;
  images: { url: string }[];
  agentProfile: {
    agencyName: string | null;
    verificationStatus: string;
    user: { name: string | null; avatar: string | null };
  };
}

interface Props {
  property: PropertyCardData;
}

export default function PropertyCard({ property }: Props) {
  const imageUrl = property.images?.[0]?.url;
  const location = [
    property.neighborhood,
    property.city,
    property.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/property/${property.id}`}
      className="group block rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
            {property.listingType === "RENT" ? "For Rent" : "For Sale"}
          </span>
          {property.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/90 text-white">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">
            {truncate(property.title, 52)}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={12} />
            <span>{location || property.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(property.price)}
            {property.listingType === "RENT" && (
              <span className="text-sm font-medium text-gray-500">
                {formatRentDuration(property.rentDuration)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {timeAgo(property.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} /> {property.bedrooms} bed
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} /> {property.bathrooms ?? 0} bath
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {property.agentProfile.agencyName ||
                property.agentProfile.user.name ||
                "Verified Agent"}
            </span>
            {property.agentProfile.verificationStatus === "VERIFIED" && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <BadgeCheck size={12} /> Verified
              </span>
            )}
          </div>
          {property.verificationStatus === "VERIFIED" && (
            <span className="text-emerald-600">Listing Verified</span>
          )}
        </div>
      </div>
    </Link>
  );
}

