import type { DefaultSession } from "next-auth";

// NextAuth type extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "AGENT" | "ADMIN";
      agentProfileId: string | null;
      agentVerified: boolean;
    } & DefaultSession["user"];
  }
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Property filters (search page)
export interface PropertyFilters {
  query?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  listingType?: "RENT" | "SALE";
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export interface PropertyImageInput {
  url: string;
  publicId: string;
  isPrimary?: boolean;
  order?: number;
}

// Property AI parse output
export interface ParsedProperty {
  title: string;
  propertyType: string;
  listingType: "RENT" | "SALE";
  bedrooms: number | null;
  bathrooms: number | null;
  location: string;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  price: number;
  rentDuration: "year" | "month" | null;
  features: string[];
}

