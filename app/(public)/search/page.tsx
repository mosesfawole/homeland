import Link from "next/link";
import { headers } from "next/headers";
import PropertyCard, {
  type PropertyCardData,
} from "@/components/property/PropertyCard";
import PropertyFilters from "@/components/property/PropertyFilters";
import SearchStoreSync from "@/components/layout/SearchStoreSync";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = {
  title: "Search Properties - Homeland",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value[0]) queryParams.set(key, value[0]);
    } else if (value) {
      queryParams.set(key, value);
    }
  });

  if (!queryParams.get("limit")) queryParams.set("limit", "12");

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const apiUrl = `${protocol}://${host}/api/properties?${queryParams.toString()}`;

  const res = await fetch(apiUrl, { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  const properties: PropertyCardData[] = res.ok ? (json.data ?? []) : [];
  const meta = json.meta ?? {
    page: 1,
    totalPages: 1,
    hasMore: false,
    total: properties.length,
  };

  const query = queryParams.get("q") ?? "";
  const listingType = queryParams.get("listingType") ?? "";
  const propertyType = queryParams.get("propertyType") ?? "";
  const state = queryParams.get("state") ?? "";
  const minPrice = queryParams.get("minPrice") ?? "";
  const maxPrice = queryParams.get("maxPrice") ?? "";
  const bedrooms = queryParams.get("bedrooms") ?? "";
  const sortBy = queryParams.get("sortBy") ?? "createdAt";
  const sortOrder = queryParams.get("sortOrder") ?? "desc";

  const buildPageLink = (page: number) => {
    const nextParams = new URLSearchParams(queryParams);
    nextParams.set("page", String(page));
    return `/search?${nextParams.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SearchStoreSync
        query={query}
        listingType={listingType}
        propertyType={propertyType}
        state={state}
        minPrice={minPrice}
        maxPrice={maxPrice}
        bedrooms={bedrooms}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse verified listings from trusted agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <PropertyFilters
          query={query}
          listingType={listingType}
          propertyType={propertyType}
          state={state}
          minPrice={minPrice}
          maxPrice={maxPrice}
          bedrooms={bedrooms}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {properties.length} of {meta.total ?? properties.length}{" "}
              results
            </p>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-500">
              No properties match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link
              href={buildPageLink(Math.max(1, Number(meta.page) - 1))}
              className={`px-4 py-2 rounded-lg text-sm border ${
                Number(meta.page) <= 1
                  ? "pointer-events-none text-gray-300 border-gray-200"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Previous
            </Link>
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Link
              href={buildPageLink(Math.min(meta.totalPages, Number(meta.page) + 1))}
              className={`px-4 py-2 rounded-lg text-sm border ${
                meta.hasMore
                  ? "text-gray-600 border-gray-200 hover:bg-gray-50"
                  : "pointer-events-none text-gray-300 border-gray-200"
              }`}
            >
              Next
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
