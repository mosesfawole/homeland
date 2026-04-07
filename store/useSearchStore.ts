import { create } from "zustand";

export interface SearchFiltersValues {
  query: string;
  listingType: string;
  propertyType: string;
  state: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
}

export interface SearchFiltersState extends SearchFiltersValues {
  setFilters: (filters: Partial<SearchFiltersValues>) => void;
  clear: () => void;
}

const defaultFilters: SearchFiltersValues = {
  query: "",
  listingType: "",
  propertyType: "",
  state: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
};

export const useSearchStore = create<SearchFiltersState>((set) => ({
  ...defaultFilters,
  setFilters: (filters) =>
    set((state) => ({
      ...state,
      ...filters,
    })),
  clear: () => set(() => ({ ...defaultFilters })),
}));
