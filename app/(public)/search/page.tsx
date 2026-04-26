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

  const activeFilterCount = [
    query,
    listingType,
    propertyType,
    state,
    minPrice,
    maxPrice,
    bedrooms,
  ].filter(Boolean).length;

  return (
    <div className="bg-[#f7f5f0]">
      <div className="page-shell py-8 md:py-10">
      <SearchStoreSync
        query={query}
        listingType={listingType}
        propertyType={propertyType}
        state={state}
        minPrice={minPrice}
        maxPrice={maxPrice}
        bedrooms={bedrooms}
      />
      <div className="mb-8 rounded-[2rem] border border-[#e7e0d2] bg-white p-6 shadow-sm shadow-stone-200/50 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b641e]">
          Marketplace search
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#121826] md:text-4xl">Find verified property</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6a5f]">
              Browse listings from checked agents, compare budget fit, and shortlist inspection-ready homes.
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f5f0] px-4 py-3 text-sm text-[#4f5b51]">
            <span className="font-semibold text-[#121826]">{activeFilterCount}</span>{" "}
            active filters
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
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
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-[#e7e0d2] bg-white px-4 py-3 shadow-sm shadow-stone-200/50 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#4f5b51]">
              Showing <span className="font-semibold text-[#121826]">{properties.length}</span> of{" "}
              <span className="font-semibold text-[#121826]">{meta.total ?? properties.length}</span> results
            </p>
            <p className="text-xs text-[#918a7a]">Newest verified listings first</p>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-[#d9cfbc] bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-[#121826]">No matching properties yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f6a5f]">
                Try widening your budget, removing a location filter, or checking back after new approvals.
              </p>
              <Link
                href="/search"
                className="mt-5 inline-flex rounded-full bg-[#12372a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2c21]"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-[1.25rem] border border-[#e7e0d2] bg-white p-3">
            <Link
              href={buildPageLink(Math.max(1, Number(meta.page) - 1))}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                Number(meta.page) <= 1
                  ? "pointer-events-none border-[#eee8dc] text-[#c9c1b2]"
                  : "border-[#d9cfbc] text-[#12372a] hover:bg-[#f8f6ee]"
              }`}
            >
              Previous
            </Link>
            <span className="text-sm font-medium text-[#6f6a5f]">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Link
              href={buildPageLink(Math.min(meta.totalPages, Number(meta.page) + 1))}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                meta.hasMore
                  ? "border-[#d9cfbc] text-[#12372a] hover:bg-[#f8f6ee]"
                  : "pointer-events-none border-[#eee8dc] text-[#c9c1b2]"
              }`}
            >
              Next
            </Link>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
