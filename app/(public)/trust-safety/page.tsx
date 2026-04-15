export const metadata = {
  title: "Trust & Safety - Homeland",
};

export default function TrustSafetyPage() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Trust & Safety
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Trust is the foundation of every listing
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Homeland is built to reduce uncertainty for renters, buyers, and
            agents. We combine verification, review workflows, and safety
            guidance so every interaction feels clearer and more reliable.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Agent verification
            </h2>
            <p className="text-sm text-slate-600">
              Agents submit KYC documents before their listings are approved.
              Verification status is shown publicly.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Listing review
            </h2>
            <p className="text-sm text-slate-600">
              New listings pass through an approval workflow to ensure details
              are complete and consistent.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Reporting tools
            </h2>
            <p className="text-sm text-slate-600">
              Users can flag suspicious listings so we can review quickly and
              take action.
            </p>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              What we verify
            </h2>
            <p className="text-sm text-slate-600">
              Verification is designed to confirm identity and professional
              legitimacy. This reduces fraud risk and improves accountability.
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Government-issued ID checks for agents</p>
              <p>Company documents when applicable</p>
              <p>Verification status visible on agent profiles</p>
              <p>Review timestamps to track recent approvals</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              How we review listings
            </h2>
            <p className="text-sm text-slate-600">
              Listings are assessed for clarity, completeness, and appropriate
              categorization before they go live.
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Clear pricing with rent duration or sale type</p>
              <p>Accurate property type and feature details</p>
              <p>Location data consistent with listing text</p>
              <p>Images that match the property description</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Safety tips for renters and buyers
          </h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
            <p>Confirm agent identity before sharing sensitive documents.</p>
            <p>Visit the property in person or via live tour before paying.</p>
            <p>Use the platform’s booking flow to keep records consistent.</p>
            <p>Report anything suspicious so our team can review quickly.</p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Privacy and data handling
            </h2>
            <p className="text-sm text-slate-600">
              We collect only the information needed to run verification and
              bookings. Sensitive documents are protected and access is limited
              to review workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Enforcement and escalation
            </h2>
            <p className="text-sm text-slate-600">
              Listings and accounts that violate guidelines can be paused,
              rejected, or removed. Repeat violations may lead to suspension.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
