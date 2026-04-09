-- Supabase bootstrap SQL generated from prisma/schema.prisma
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Enums (safe if already created)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'Role') then
    create type "Role" as enum ('USER', 'AGENT', 'ADMIN');
  end if;

  if not exists (select 1 from pg_type where typname = 'PropertyType') then
    create type "PropertyType" as enum (
      'APARTMENT',
      'SELF_CONTAIN',
      'MINI_FLAT',
      'DUPLEX',
      'BUNGALOW',
      'TERRACED',
      'DETACHED',
      'SEMI_DETACHED',
      'PENTHOUSE',
      'STUDIO',
      'OFFICE',
      'LAND',
      'WAREHOUSE',
      'SHOP'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ListingType') then
    create type "ListingType" as enum ('RENT', 'SALE');
  end if;

  if not exists (select 1 from pg_type where typname = 'RentDuration') then
    create type "RentDuration" as enum ('MONTH', 'YEAR');
  end if;

  if not exists (select 1 from pg_type where typname = 'PropertyStatus') then
    create type "PropertyStatus" as enum (
      'DRAFT',
      'PENDING_REVIEW',
      'ACTIVE',
      'REJECTED',
      'RENTED',
      'SOLD',
      'INACTIVE'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'BookingStatus') then
    create type "BookingStatus" as enum ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
  end if;

  if not exists (select 1 from pg_type where typname = 'VerificationStatus') then
    create type "VerificationStatus" as enum ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
  end if;
end $$;

-- Tables
create table if not exists "User" (
  "id" text primary key default gen_random_uuid()::text,
  "email" text not null unique,
  "emailVerified" timestamptz,
  "name" text,
  "phone" text,
  "avatar" text,
  "role" "Role" not null default 'USER',
  "password" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "AgentProfile" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null unique references "User"("id") on delete cascade,
  "agencyName" text,
  "bio" text,
  "yearsExperience" integer,
  "specialization" text[] not null default '{}',
  "whatsapp" text,
  "instagram" text,
  "website" text,
  "verificationStatus" "VerificationStatus" not null default 'UNVERIFIED',
  "govIdUrl" text,
  "cacDocUrl" text,
  "verifiedAt" timestamptz,
  "verifiedBy" text,
  "rejectionReason" text,
  "totalListings" integer not null default 0,
  "totalSales" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Property" (
  "id" text primary key default gen_random_uuid()::text,
  "agentProfileId" text not null references "AgentProfile"("id") on delete cascade,
  "title" text not null,
  "description" text not null,
  "propertyType" "PropertyType" not null,
  "listingType" "ListingType" not null,
  "bedrooms" integer not null,
  "bathrooms" integer,
  "toilets" integer,
  "price" double precision not null,
  "rentDuration" "RentDuration",
  "features" text[] not null default '{}',
  "address" text not null,
  "city" text not null,
  "state" text not null,
  "country" text not null default 'Nigeria',
  "latitude" double precision,
  "longitude" double precision,
  "neighborhood" text,
  "virtualTourUrl" text,
  "status" "PropertyStatus" not null default 'DRAFT',
  "verificationStatus" "VerificationStatus" not null default 'UNVERIFIED',
  "verifiedAt" timestamptz,
  "verifiedBy" text,
  "rejectionReason" text,
  "isFeatured" boolean not null default false,
  "viewCount" integer not null default 0,
  "aiParsed" boolean not null default false,
  "aiRawInput" text,
  "aiConfidence" double precision,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "PropertyImage" (
  "id" text primary key default gen_random_uuid()::text,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "url" text not null,
  "publicId" text not null,
  "isPrimary" boolean not null default false,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists "PropertyVideo" (
  "id" text primary key default gen_random_uuid()::text,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "url" text not null,
  "publicId" text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists "Booking" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"("id") on delete cascade,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "tourDate" timestamptz not null,
  "tourTime" text not null,
  "message" text,
  "status" "BookingStatus" not null default 'PENDING',
  "agentNote" text,
  "confirmedAt" timestamptz,
  "cancelledAt" timestamptz,
  "cancelReason" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Review" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"("id") on delete cascade,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "rating" integer not null,
  "comment" text,
  "createdAt" timestamptz not null default now(),
  constraint "Review_userId_propertyId_key" unique ("userId", "propertyId")
);

create table if not exists "Favorite" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"("id") on delete cascade,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "createdAt" timestamptz not null default now(),
  constraint "Favorite_userId_propertyId_key" unique ("userId", "propertyId")
);

create table if not exists "Report" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"("id") on delete cascade,
  "propertyId" text not null references "Property"("id") on delete cascade,
  "reason" text not null,
  "details" text,
  "resolved" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists "Account" (
  "id" text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"("id") on delete cascade,
  "type" text not null,
  "provider" text not null,
  "providerAccountId" text not null,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  constraint "Account_provider_providerAccountId_key" unique ("provider", "providerAccountId")
);

create table if not exists "Session" (
  "id" text primary key default gen_random_uuid()::text,
  "sessionToken" text not null unique,
  "userId" text not null references "User"("id") on delete cascade,
  "expires" timestamptz not null
);

create table if not exists "VerificationToken" (
  "identifier" text not null,
  "token" text not null,
  "expires" timestamptz not null,
  constraint "VerificationToken_token_key" unique ("token"),
  constraint "VerificationToken_identifier_token_key" unique ("identifier", "token")
);

-- Indexes
create index if not exists "Property_city_state_idx" on "Property" ("city", "state");
create index if not exists "Property_propertyType_idx" on "Property" ("propertyType");
create index if not exists "Property_listingType_idx" on "Property" ("listingType");
create index if not exists "Property_price_idx" on "Property" ("price");
create index if not exists "Property_status_idx" on "Property" ("status");
create index if not exists "Property_agentProfileId_idx" on "Property" ("agentProfileId");
create index if not exists "Booking_userId_idx" on "Booking" ("userId");
create index if not exists "Booking_propertyId_idx" on "Booking" ("propertyId");

-- UpdatedAt trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create trigger "User_set_updated_at" before update on "User"
for each row execute function set_updated_at();

create trigger "AgentProfile_set_updated_at" before update on "AgentProfile"
for each row execute function set_updated_at();

create trigger "Property_set_updated_at" before update on "Property"
for each row execute function set_updated_at();

create trigger "Booking_set_updated_at" before update on "Booking"
for each row execute function set_updated_at();
