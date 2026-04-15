import Link from "next/link";
import PropertyCard, { type PropertyCardData } from "@/components/property/PropertyCard";
import HeroSearch from "@/components/layout/HeroSearch";
import { ShieldCheck, Sparkles, MapPin, CalendarCheck } from "lucide-react";
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
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.2),_transparent_55%)]" />
        <div className="absolute -top-48 right-[-10%] h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-40 left-[-5%] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white text-xs font-medium text-slate-700">
              <Sparkles size={14} /> AI-assisted listings built for trust
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
              Find verified homes and commercial spaces across Nigeria in minutes.
            </h1>
            <p className="text-base md:text-lg text-slate-600">
              Homeland matches serious renters and buyers with verified agents. Search by location, property type, and
              budget, then book tours instantly.
            </p>
          </div>

          <div className="mt-10">
            <HeroSearch />
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="px-3 py-1 rounded-full bg-white/80 border border-white">24hr power</span>
              <span className="px-3 py-1 rounded-full bg-white/80 border border-white">Lekki Phase 1</span>
              <span className="px-3 py-1 rounded-full bg-white/80 border border-white">Serviced apartments</span>
              <span className="px-3 py-1 rounded-full bg-white/80 border border-white">Mini flats</span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/90 border border-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active listings</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">{totalListings}</p>
              <p className="text-xs text-slate-500 mt-1">Verified listings ready to tour.</p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Verified agents</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">{verifiedAgents}</p>
              <p className="text-xs text-slate-500 mt-1">KYC checked professionals.</p>
            </div>
            <div className="rounded-2xl bg-white/90 border border-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trusted platform</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">100% secure</p>
              <p className="text-xs text-slate-500 mt-1">Report fraud and verify listings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Featured listings</h2>
            <p className="text-sm text-slate-500 mt-1">
              Handpicked homes and offices vetted by Homeland.
            </p>
          </div>
          <Link
            href="/search"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            View all
          </Link>
        </div>

        {featuredCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
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

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Verified by default",
              copy: "Every agent goes through KYC checks. Listings remain hidden until approved.",
              icon: <ShieldCheck size={20} />,
            },
            {
              title: "Smart AI parser",
              copy: "Paste a description, and we structure bedrooms, prices, and features instantly.",
              icon: <Sparkles size={20} />,
            },
            {
              title: "Tour scheduling",
              copy: "Users can request inspections and get confirmations without endless calls.",
              icon: <CalendarCheck size={20} />,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">How Homeland works</h2>
            <p className="text-sm text-slate-600">
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
                  <div className="mt-1 h-9 w-9 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-xl shadow-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Tour request ready</p>
                <p className="text-xs text-slate-500">3 bedroom apartment, Ikeja GRA</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Price</span>
                <span className="font-semibold text-slate-900">NGN 3.5M / year</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Agent</span>
                <span className="font-semibold text-slate-900">Verified by Homeland</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next slot</span>
                <span className="font-semibold text-slate-900">Tomorrow, 11:00</span>
              </div>
            </div>
            <Link
              href="/search"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start searching
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
