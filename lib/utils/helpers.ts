import { LISTING_TYPES, PROPERTY_TYPES, type ListingType, type PropertyType } from "@/lib/db-types";

export type PropertyFilterInput = {
  query?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export function parsePagination(searchParams: URLSearchParams) {
  const pageRaw = Number(searchParams.get("page") ?? 1);
  const limitRaw = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export type RelationValue<T> = T | T[] | null | undefined;

export function unwrapRelation<T>(value: RelationValue<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function buildPropertyFilters(
  searchParams: URLSearchParams,
): PropertyFilterInput {
  const filters: PropertyFilterInput = {};

  const query = searchParams.get("q") || searchParams.get("query");
  if (query) {
    filters.query = query;
  }

  const propertyType = searchParams.get("propertyType");
  if (propertyType && (PROPERTY_TYPES as readonly string[]).includes(propertyType)) {
    filters.propertyType = propertyType as PropertyType;
  }

  const listingType = searchParams.get("listingType");
  if (listingType && (LISTING_TYPES as readonly string[]).includes(listingType)) {
    filters.listingType = listingType as ListingType;
  }

  const city = searchParams.get("city");
  if (city) filters.city = city;

  const state = searchParams.get("state");
  if (state) filters.state = state;

  const minPriceRaw = searchParams.get("minPrice");
  const maxPriceRaw = searchParams.get("maxPrice");
  const minPrice =
    minPriceRaw !== null && minPriceRaw !== ""
      ? Number(minPriceRaw)
      : undefined;
  const maxPrice =
    maxPriceRaw !== null && maxPriceRaw !== ""
      ? Number(maxPriceRaw)
      : undefined;

  if (Number.isFinite(minPrice)) filters.minPrice = minPrice;
  if (Number.isFinite(maxPrice)) filters.maxPrice = maxPrice;

  const bedrooms = Number(searchParams.get("bedrooms") ?? "");
  if (Number.isFinite(bedrooms) && bedrooms > 0) {
    filters.bedrooms = bedrooms;
  }

  return filters;
}
