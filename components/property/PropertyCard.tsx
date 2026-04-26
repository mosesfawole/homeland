import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Home, BadgeCheck, Bath, ArrowUpRight } from "lucide-react";
import {
  formatPrice,
  formatRentDuration,
  timeAgo,
  truncate,
} from "@/lib/utils/format";
import { PROPERTY_TYPE_LABELS } from "@/lib/validations/property";

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
      className="group block overflow-hidden rounded-[1.5rem] border border-[#e7e0d2] bg-white shadow-sm shadow-stone-200/50 transition duration-200 hover:-translate-y-0.5 hover:border-[#d5c7ad] hover:shadow-xl hover:shadow-stone-200/80"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f1efe7]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#12372a] text-sm font-medium text-white/70">
            Image pending
          </div>
        )}

        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#12372a] shadow-sm">
            {property.listingType === "RENT" ? "For Rent" : "For Sale"}
          </span>
          {property.isFeatured && (
            <span className="rounded-full bg-[#c7852b] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {property.verificationStatus === "VERIFIED" && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#12372a]/95 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            <BadgeCheck size={13} /> Listing verified
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold leading-6 text-[#121826]">
            {truncate(property.title, 52)}
          </h3>
          <div className="flex items-start gap-2 text-xs leading-5 text-[#6f6a5f]">
            <MapPin size={13} className="mt-0.5 shrink-0 text-[#9b641e]" />
            <span className="line-clamp-2">{location || property.address}</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="text-xl font-semibold text-[#121826]">
            {formatPrice(property.price)}
            {property.listingType === "RENT" && (
              <span className="ml-1 text-sm font-medium text-[#6f6a5f]">
                {formatRentDuration(property.rentDuration)}
              </span>
            )}
          </div>
          <span className="shrink-0 text-xs text-[#918a7a]">
            {timeAgo(property.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-[#4f5b51]">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f7f5f0] px-2 py-2">
            <BedDouble size={14} /> {property.bedrooms} bed
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f7f5f0] px-2 py-2">
            <Bath size={14} /> {property.bathrooms ?? "-"} bath
          </span>
          <span className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#f7f5f0] px-2 py-2">
            <Home size={14} /> {PROPERTY_TYPE_LABELS[property.propertyType] ?? "Home"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#eee8dc] pt-3 text-xs text-[#6f6a5f]">
          <div className="min-w-0">
            <span className="block truncate font-semibold text-[#39463d]">
              {property.agentProfile.agencyName ||
                property.agentProfile.user.name ||
                "Verified Agent"}
            </span>
            {property.agentProfile.verificationStatus === "VERIFIED" && (
              <span className="mt-1 inline-flex items-center gap-1 text-[#167a52]">
                <BadgeCheck size={12} /> Verified
              </span>
            )}
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#12372a] text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

