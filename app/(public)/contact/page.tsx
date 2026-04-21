export const metadata = {
  title: "Contact - Homeland",
};

export default function ContactPage() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Contact
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            We are here to help
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Reach out for support, partnership inquiries, or feedback. We aim to
            respond quickly during business hours and provide clear next steps.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Support</h2>
            <p className="text-sm text-slate-600">
              Questions about listings, bookings, or account access.
            </p>
            <p className="text-sm text-slate-800 font-medium">
              support@homeland.example
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Partnerships
            </h2>
            <p className="text-sm text-slate-600">
              Agencies, property managers, and marketplace integrations.
            </p>
            <p className="text-sm text-slate-800 font-medium">
              partners@homeland.example
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Press</h2>
            <p className="text-sm text-slate-600">
              Media requests and announcements.
            </p>
            <p className="text-sm text-slate-800 font-medium">
              press@homeland.example
            </p>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Send a message
            </h2>
            <p className="text-sm text-slate-600">
              This form is a placeholder for now.
            </p>
            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Topic"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                rows={4}
                placeholder="Tell us how we can help"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium"
              >
                Submit message
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Hours</h2>
              <p className="text-sm text-slate-600">Monday to Friday</p>
              <p className="text-sm text-slate-800 font-medium">
                9:00 AM – 6:00 PM (WAT)
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Office</h2>
              <p className="text-sm text-slate-600">
                Placeholder address for now
              </p>
              <p className="text-sm text-slate-800 font-medium">Lorem ipsum </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Response time
              </h2>
              <p className="text-sm text-slate-600">
                We typically respond within 24 hours on business days.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
