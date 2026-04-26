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
  const inputClass =
    "w-full rounded-xl border border-[#e7e0d2] bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#c7852b]";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a5f]";

  return (
    <aside className="h-fit rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm shadow-stone-200/50 lg:sticky lg:top-24">
      <div className="mb-5">
        <p className="text-sm font-semibold text-[#121826]">Refine search</p>
        <p className="mt-1 text-xs leading-5 text-[#6f6a5f]">
          Filter by location, budget, and inspection-ready homes.
        </p>
      </div>
      <form method="GET" className="space-y-4">
        <div>
          <label className={labelClass}>
            Search
          </label>
          <input
            name="q"
            defaultValue={query}
            placeholder="Location, title, keyword"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Listing Type
          </label>
          <select
            name="listingType"
            defaultValue={listingType}
            className={inputClass}
          >
            <option value="">Any</option>
            <option value="RENT">For Rent</option>
            <option value="SALE">For Sale</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            Property Type
          </label>
          <select
            name="propertyType"
            defaultValue={propertyType}
            className={inputClass}
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
          <label className={labelClass}>
            State
          </label>
          <select
            name="state"
            defaultValue={state}
            className={inputClass}
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
            <label className={labelClass}>
              Min Price
            </label>
            <input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Max Price
            </label>
            <input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Bedrooms (min)
          </label>
          <select
            name="bedrooms"
            defaultValue={bedrooms}
            className={inputClass}
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
            <label className={labelClass}>
              Sort By
            </label>
            <select
              name="sortBy"
              defaultValue={sortBy}
              className={inputClass}
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Order
            </label>
            <select
              name="sortOrder"
              defaultValue={sortOrder}
              className={inputClass}
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#12372a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2c21]"
          >
            Apply Filters
          </button>
          <Link
            href="/search"
            className="rounded-xl border border-[#d9cfbc] bg-white px-4 py-2.5 text-sm font-semibold text-[#12372a] hover:bg-[#f8f6ee]"
          >
            Clear
          </Link>
        </div>
      </form>
    </aside>
  );
}
