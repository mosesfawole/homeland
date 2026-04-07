"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
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
      className="w-full rounded-2xl bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur px-4 py-4 md:px-6 md:py-5 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto]"
    >
      <div>
        <label className="sr-only" htmlFor="search-query">
          Search
        </label>
        <input
          id="search-query"
          value={query}
          onChange={(event) => setFilters({ query: event.target.value })}
          placeholder="Lekki, Ikoyi, or a keyword"
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
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
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
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
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
        >
          <option value="">Any property</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
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
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
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
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="search-listing">
          Listing type
        </label>
        <select
          id="search-listing"
          value={listingType}
          onChange={(event) => setFilters({ listingType: event.target.value })}
          className="hidden lg:block rounded-xl border border-slate-200 px-3 py-3 text-sm"
        >
          <option value="">Any listing</option>
          <option value="RENT">For rent</option>
          <option value="SALE">For sale</option>
        </select>

        <label className="sr-only" htmlFor="search-bedrooms">
          Bedrooms
        </label>
        <select
          id="search-bedrooms"
          value={bedrooms}
          onChange={(event) => setFilters({ bedrooms: event.target.value })}
          className="hidden lg:block rounded-xl border border-slate-200 px-3 py-3 text-sm"
        >
          <option value="">Beds</option>
          {[1, 2, 3, 4, 5].map((count) => (
            <option key={count} value={count}>
              {count}+
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full lg:w-auto px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Search
        </button>
      </div>
    </form>
  );
}
