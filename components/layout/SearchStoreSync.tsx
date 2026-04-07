"use client";

import { useEffect } from "react";
import { useSearchStore, type SearchFiltersValues } from "@/store/useSearchStore";

interface Props extends SearchFiltersValues {}

export default function SearchStoreSync({
  query,
  listingType,
  propertyType,
  state,
  minPrice,
  maxPrice,
  bedrooms,
}: Props) {
  const setFilters = useSearchStore((store) => store.setFilters);

  useEffect(() => {
    setFilters({
      query,
      listingType,
      propertyType,
      state,
      minPrice,
      maxPrice,
      bedrooms,
    });
  }, [
    query,
    listingType,
    propertyType,
    state,
    minPrice,
    maxPrice,
    bedrooms,
    setFilters,
  ]);

  return null;
}
