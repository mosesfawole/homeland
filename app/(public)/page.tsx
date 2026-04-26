import Link from "next/link";
import PropertyCard, { type PropertyCardData } from "@/components/property/PropertyCard";
import HeroSearch from "@/components/layout/HeroSearch";
import { ShieldCheck, Sparkles, MapPin, CalendarCheck, BadgeCheck, KeyRound } from "lucide-react";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";
import { unwrapRelation, type RelationValue } from "@/lib/utils/helpers";

type AgentUserSummary = {
  name: string | null;
  avatar: string | null;
};

type LandingAgentProfile = {
  agencyName: string | null;
  verificationStatus: string;
  user: RelationValue<AgentUserSummary>;
};

export const metadata = {
  title: "Homeland - Verified Nigerian Properties",
  description:
    "Find verified rental and sale listings across Nigeria with trusted agents and AI-assisted search.",
};

export default async function LandingPage() {
  let featuredCards: PropertyCardData[] = [];
  let totalListings = 0;
  let verifiedAgents = 0;

  try {
    const supabase = getSupabaseAdmin();

    const [featuredResult, totalResult, agentsResult] = await Promise.all([
      supabase
        .from("Property")
        .select(
          `
          id,
          title,
          propertyType,
          listingType,
          bedrooms,
          bathrooms,
          price,
          rentDuration,
          address,
          city,
          state,
          neighborhood,
          isFeatured,
          createdAt,
          verificationStatus,
          images:PropertyImage(url, isPrimary, order),
          agentProfile:AgentProfile(
            agencyName,
            verificationStatus,
            user:User(name, avatar)
          )
        `,
        )
        .eq("isFeatured", true)
        .eq("status", "ACTIVE")
        .eq("verificationStatus", "VERIFIED")
        .order("createdAt", { ascending: false })
        .order("order", { ascending: true, foreignTable: "PropertyImage" })
        .limit(6),
      supabase
        .from("Property")
        .select("id", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
      supabase
        .from("AgentProfile")
        .select("id", { count: "exact", head: true })
        .eq("verificationStatus", "VERIFIED"),
    ]);

    if (featuredResult.error) {
      console.error(
        "[LandingPage] Failed to load featured listings",
        formatSupabaseError(featuredResult.error),
      );
    }

    const featured = featuredResult.data ?? [];
    featuredCards = featured.map((property) => {
      const images = Array.isArray(property.images) ? property.images : [];
      const primary =
        images.find((img: { isPrimary?: boolean }) => img.isPrimary) ?? images[0];
      const agent = unwrapRelation(
        property.agentProfile as RelationValue<LandingAgentProfile>,
      );
      const agentUser = unwrapRelation(agent?.user);
      return {
        ...property,
        images: primary ? [{ url: primary.url }] : [],
        agentProfile: {
          agencyName: agent?.agencyName ?? null,
          verificationStatus: agent?.verificationStatus ?? "",
          user: {
            name: agentUser?.name ?? null,
            avatar: agentUser?.avatar ?? null,
          },
        },
      } as PropertyCardData;
    });

    totalListings = totalResult.count ?? 0;
    verifiedAgents = agentsResult.count ?? 0;

  } catch (error) {
    console.error("[LandingPage] Failed to load featured listings", error);
  }

  return (
    <div className="bg-[#f7f5f0]">
      <section className="relative overflow-hidden border-b border-[#e7e0d2]">
        <div className="page-shell relative grid gap-10 pt-10 pb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center lg:pt-16 lg:pb-20">
          <div className="space-y-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d9cfbc] bg-white px-3 py-1.5 text-xs font-semibold text-[#12372a] shadow-sm">
              <Sparkles size={14} /> AI-assisted listings built for trust
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-[#121826] sm:text-5xl lg:text-6xl">
              Rent or buy property with agents Homeland has checked.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#5f655f] md:text-lg">
              Search verified Nigerian homes, compare agent details, and book inspections without chasing random phone numbers.
            </p>

            <HeroSearch />

            <div className="flex flex-wrap gap-2 text-xs font-medium text-[#6f6a5f]">
              <span className="rounded-full border border-[#e7e0d2] bg-white px-3 py-1.5">Lekki Phase 1</span>
              <span className="rounded-full border border-[#e7e0d2] bg-white px-3 py-1.5">Ikeja GRA</span>
              <span className="rounded-full border border-[#e7e0d2] bg-white px-3 py-1.5">Serviced apartments</span>
              <span className="rounded-full border border-[#e7e0d2] bg-white px-3 py-1.5">Annual rent</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e7e0d2] bg-[#12372a] p-4 text-white shadow-[0_24px_80px_rgba(18,55,42,0.2)]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#12372a]">
                  Inspection ready
                </span>
                <span className="text-xs text-white/55">Lagos, Nigeria</span>
              </div>
              <div className="mt-12">
                <p className="text-sm text-white/65">3 bedroom apartment</p>
                <p className="mt-2 text-3xl font-semibold">NGN 3.5M / year</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                {["KYC agent", "Verified listing", "Tour booking"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/10 p-3 text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-[#121826]">
                <p className="text-2xl font-semibold">{totalListings}</p>
                <p className="mt-1 text-xs text-[#6f6a5f]">Active listings</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-[#121826]">
                <p className="text-2xl font-semibold">{verifiedAgents}</p>
                <p className="mt-1 text-xs text-[#6f6a5f]">Verified agents</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-[#121826]">
                <p className="text-2xl font-semibold">24h</p>
                <p className="mt-1 text-xs text-[#6f6a5f]">Fraud review</p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-white p-4 text-[#121826]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1efe7] text-[#12372a]">
                  <BadgeCheck size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Verified by Homeland</p>
                  <p className="text-xs text-[#6f6a5f]">Agent checks, listing review, and report tools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-[#121826]">Featured listings</h2>
            <p className="mt-2 text-sm text-[#6f6a5f]">
              Handpicked homes and offices vetted before they go live.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden rounded-full border border-[#d9cfbc] bg-white px-4 py-2 text-sm font-semibold text-[#12372a] shadow-sm hover:bg-[#f8f6ee] sm:inline-flex"
          >
            View all
          </Link>
        </div>

        {featuredCards.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#d9cfbc] bg-white p-10 text-center text-sm text-[#6f6a5f]">
            Featured listings will appear here once approved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredCards.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-[#e7e0d2] bg-white text-[#121826]">
        <div className="page-shell grid gap-5 py-14 md:grid-cols-3">
          {[
            {
              title: "KYC checked agents",
              copy: "Agents submit verification details before managing trusted listings.",
              icon: <ShieldCheck size={20} />,
            },
            {
              title: "Inspection workflow",
              copy: "Users request tours and keep booking activity inside their dashboard.",
              icon: <CalendarCheck size={20} />,
            },
            {
              title: "Fraud reporting",
              copy: "Suspicious listings can be reported for admin review before they waste anyone's time.",
              icon: <KeyRound size={20} />,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-[#e7e0d2] bg-[#fbfaf7] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12372a] text-white">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6f6a5f]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-[#121826]">How Homeland works</h2>
            <p className="text-sm leading-6 text-[#6f6a5f]">
              From listing to tour confirmations, we keep everything verified and transparent.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Agents list with AI",
                  copy: "Upload photos, paste the description, and let AI structure the listing before approval.",
                },
                {
                  title: "Users search with confidence",
                  copy: "Filters, verification badges, and pricing clarity mean fewer wasted visits.",
                },
                {
                  title: "Tour booking workflow",
                  copy: "Request a visit, get confirmed times, and manage everything in one dashboard.",
                },
              ].map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#12372a] text-sm text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#121826]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#6f6a5f]">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e7e0d2] bg-white p-6 shadow-xl shadow-stone-200/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1efe7] text-[#12372a]">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#121826]">Tour request ready</p>
                <p className="text-xs text-[#6f6a5f]">3 bedroom apartment, Ikeja GRA</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#6f6a5f]">Price</span>
                <span className="font-semibold text-[#121826]">NGN 3.5M / year</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6f6a5f]">Agent</span>
                <span className="font-semibold text-[#121826]">Verified by Homeland</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6f6a5f]">Next slot</span>
                <span className="font-semibold text-[#121826]">Tomorrow, 11:00</span>
              </div>
            </div>
            <Link
              href="/search"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#12372a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2c21]"
            >
              Start searching
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
