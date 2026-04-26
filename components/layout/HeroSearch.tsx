"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { PROPERTY_TYPE_LABELS, NIGERIAN_STATES } from "@/lib/validations/property";
import { useSearchStore } from "@/store/useSearchStore";

export default function HeroSearch() {
  const router = useRouter();
  const {
    query,
    listingType,
    propertyType,
    state,
    minPrice,
    maxPrice,
    bedrooms,
    setFilters,
  } = useSearchStore();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (listingType) params.set("listingType", listingType);
    if (propertyType) params.set("propertyType", propertyType);
    if (state) params.set("state", state);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[1.75rem] border border-[#e7e0d2] bg-white p-3 shadow-[0_24px_80px_rgba(18,24,38,0.12)] md:p-4"
    >
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="relative">
          <label className="sr-only" htmlFor="search-query">
            Search
          </label>
          <Search
            aria-hidden="true"
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918a7a]"
          />
          <input
            id="search-query"
            value={query}
            onChange={(event) => setFilters({ query: event.target.value })}
            placeholder="Lekki Phase 1, Ikoyi, serviced apartment"
            className="h-13 w-full rounded-2xl border border-[#e7e0d2] bg-[#fbfaf7] px-11 text-sm font-medium outline-none transition-colors focus:border-[#c7852b] focus:bg-white"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="search-state">
            State
          </label>
          <select
            id="search-state"
            value={state}
            onChange={(event) => setFilters({ state: event.target.value })}
            className="h-13 w-full rounded-2xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 text-sm font-medium"
          >
            <option value="">All states</option>
            {NIGERIAN_STATES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="sr-only" htmlFor="search-property">
            Property type
          </label>
          <select
            id="search-property"
            value={propertyType}
            onChange={(event) => setFilters({ propertyType: event.target.value })}
            className="h-13 w-full rounded-2xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 text-sm font-medium"
          >
            <option value="">Any property</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#12372a] px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-950/15 transition-colors hover:bg-[#0d2c21]"
        >
          <Search size={17} />
          Search
        </button>
      </div>

      <div className="mt-3 grid gap-2 border-t border-[#eee8dc] pt-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr]">
        <div>
          <label className="sr-only" htmlFor="search-min">
            Minimum price
          </label>
          <input
            id="search-min"
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => setFilters({ minPrice: event.target.value })}
            placeholder="Min"
            className="h-11 w-full rounded-xl border border-[#e7e0d2] bg-white px-3 text-sm"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="search-max">
            Maximum price
          </label>
          <input
            id="search-max"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setFilters({ maxPrice: event.target.value })}
            placeholder="Max"
            className="h-11 w-full rounded-xl border border-[#e7e0d2] bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="search-listing">
            Listing type
          </label>
          <select
            id="search-listing"
            value={listingType}
            onChange={(event) => setFilters({ listingType: event.target.value })}
            className="h-11 w-full rounded-xl border border-[#e7e0d2] bg-white px-3 text-sm"
          >
            <option value="">Rent or sale</option>
            <option value="RENT">For rent</option>
            <option value="SALE">For sale</option>
          </select>
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="search-bedrooms">
            Bedrooms
          </label>
          <SlidersHorizontal
            aria-hidden="true"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#918a7a]"
          />
          <select
            id="search-bedrooms"
            value={bedrooms}
            onChange={(event) => setFilters({ bedrooms: event.target.value })}
            className="h-11 w-full rounded-xl border border-[#e7e0d2] bg-white px-9 text-sm"
          >
            <option value="">Bedrooms</option>
            {[1, 2, 3, 4, 5].map((count) => (
              <option key={count} value={count}>
                {count}+
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
