import Link from "next/link";
import {
  PROPERTY_TYPE_LABELS,
  NIGERIAN_STATES,
} from "@/lib/validations/property";

interface Props {
  query: string;
  listingType: string;
  propertyType: string;
  state: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  sortBy: string;
  sortOrder: string;
}

export default function PropertyFilters({
  query,
  listingType,
  propertyType,
  state,
  minPrice,
  maxPrice,
  bedrooms,
  sortBy,
  sortOrder,
}: Props) {
  return (
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
  );
}
