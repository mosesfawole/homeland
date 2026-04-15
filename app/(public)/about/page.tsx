export const metadata = {
  title: "About - Homeland",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            About Homeland
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            A trusted home search for Nigeria, built with agents and renters in mind
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Homeland connects verified agents with serious renters and buyers.
            We focus on transparent listings, consistent review standards, and
            a booking flow that keeps everyone informed. Our goal is simple:
            help people find reliable homes faster while giving agents tools
            that reduce friction and build trust.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Our mission</h2>
            <p className="text-sm text-slate-600">
              Make property discovery safer and more predictable by combining
              verified agent profiles with listing quality checks.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Our promise</h2>
            <p className="text-sm text-slate-600">
              Every listing is reviewed before it becomes active, and every
              agent goes through a verification process.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Our focus</h2>
            <p className="text-sm text-slate-600">
              Clarity in pricing, clear availability signals, and quick
              communication between renters and agents.
            </p>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              What makes Homeland different
            </h2>
            <p className="text-sm text-slate-600">
              We prioritize quality over volume. Listings are curated, and
              agents are held to clear standards. The platform is built to
              highlight verified profiles, show accurate listing status, and
              reduce uncertainty in the search process.
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Verified agents with visible status badges</p>
              <p>Listing review workflow before public display</p>
              <p>Structured listing details for easier comparison</p>
              <p>Booking requests with clear next steps</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Who Homeland is for
            </h2>
            <p className="text-sm text-slate-600">
              Whether you are renting, buying, or representing properties,
              Homeland gives you the tools to move quickly without sacrificing
              trust.
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Renters who want verified listings and fewer surprises</p>
              <p>Buyers who need clarity on pricing and availability</p>
              <p>Agents who value credibility and faster close cycles</p>
              <p>Teams managing multiple listings and approvals</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Our operating principles
          </h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Transparency:</span>{" "}
              Listings show the details people actually need to decide.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Accountability:</span>{" "}
              Verification and review workflows keep quality high.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Speed:</span> Clear
              steps and prompt responses reduce time wasted.
            </p>
            <p>
              <span className="font-semibold text-slate-800">Respect:</span>{" "}
              We protect user data and promote safe engagement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
