export const ROLES = ["USER", "AGENT", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PROPERTY_TYPES = [
  "APARTMENT",
  "SELF_CONTAIN",
  "MINI_FLAT",
  "DUPLEX",
  "BUNGALOW",
  "TERRACED",
  "DETACHED",
  "SEMI_DETACHED",
  "PENTHOUSE",
  "STUDIO",
  "OFFICE",
  "LAND",
  "WAREHOUSE",
  "SHOP",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LISTING_TYPES = ["RENT", "SALE"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const RENT_DURATIONS = ["MONTH", "YEAR"] as const;
export type RentDuration = (typeof RENT_DURATIONS)[number];

export const PROPERTY_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "REJECTED",
  "RENTED",
  "SOLD",
  "INACTIVE",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
