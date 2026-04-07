import { headers } from "next/headers";
import Link from "next/link";
import PropertyCard, {
  type PropertyCardData,
} from "@/components/property/PropertyCard";
import { PROPERTY_TYPE_LABELS, NIGERIAN_STATES } from "@/lib/validations/property";

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
  const meta = json.meta ?? { page: 1, totalPages: 1, hasMore: false };

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse verified listings from trusted agents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="bg-white border border-gray-100 rounded-xl p-6 h-fit">
          <form method="GET" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search
              </label>
              <input
                name="q"
                defaultValue={query}
                placeholder="Location, title, keyword"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Listing Type
              </label>
              <select
                name="listingType"
                defaultValue={listingType}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">Any</option>
                <option value="RENT">For Rent</option>
                <option value="SALE">For Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Property Type
              </label>
              <select
                name="propertyType"
                defaultValue={propertyType}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">Any</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State
              </label>
              <select
                name="state"
                defaultValue={state}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">All states</option>
                {NIGERIAN_STATES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Min Price
                </label>
                <input
                  name="minPrice"
                  type="number"
                  min={0}
                  defaultValue={minPrice}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Max Price
                </label>
                <input
                  name="maxPrice"
                  type="number"
                  min={0}
                  defaultValue={maxPrice}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bedrooms (min)
              </label>
              <select
                name="bedrooms"
                defaultValue={bedrooms}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}+
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Order
                </label>
                <select
                  name="sortOrder"
                  defaultValue={sortOrder}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
              >
                Apply Filters
              </button>
              <Link
                href="/search"
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear
              </Link>
            </div>
          </form>
        </aside>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {properties.length} results
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
