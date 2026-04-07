import { ListingType, PropertyType, type Prisma } from "@prisma/client";

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

export function buildPropertyFilters(
  searchParams: URLSearchParams,
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
  };

  const query = searchParams.get("q") || searchParams.get("query");
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { state: { contains: query, mode: "insensitive" } },
      { neighborhood: { contains: query, mode: "insensitive" } },
    ];
  }

  const propertyType = searchParams.get("propertyType");
  if (
    propertyType &&
    (Object.values(PropertyType) as string[]).includes(propertyType)
  ) {
    where.propertyType = propertyType as PropertyType;
  }

  const listingType = searchParams.get("listingType");
  if (
    listingType &&
    (Object.values(ListingType) as string[]).includes(listingType)
  ) {
    where.listingType = listingType as ListingType;
  }

  const city = searchParams.get("city");
  if (city) where.city = { equals: city, mode: "insensitive" };

  const state = searchParams.get("state");
  if (state) where.state = { equals: state, mode: "insensitive" };

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

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.price = {
      ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
      ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}),
    };
  }

  const bedrooms = Number(searchParams.get("bedrooms") ?? "");
  if (Number.isFinite(bedrooms) && bedrooms > 0) {
    where.bedrooms = { gte: bedrooms };
  }

  return where;
}
