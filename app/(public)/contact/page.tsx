export const metadata = {
  title: "Contact - Homeland",
};

export default function ContactPage() {
  const inputClass =
    "w-full rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#c7852b] focus:bg-white";

  return (
    <div className="bg-[#f7f5f0]">
      <div className="page-shell max-w-5xl space-y-12 py-12">
        <section className="rounded-[2rem] border border-[#e7e0d2] bg-white p-6 shadow-sm shadow-stone-200/50 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b641e]">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#121826]">
            We are here to help
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#6f6a5f]">
            Reach out for support, partnership inquiries, or feedback. We aim to
            respond quickly during business hours and provide clear next steps.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Support",
              copy: "Questions about listings, bookings, or account access.",
              email: "support@homeland.example",
            },
            {
              title: "Partnerships",
              copy: "Agencies, property managers, and marketplace integrations.",
              email: "partners@homeland.example",
            },
            {
              title: "Press",
              copy: "Media requests and announcements.",
              email: "press@homeland.example",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="space-y-2 rounded-[1.5rem] border border-[#e7e0d2] bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#121826]">
                {item.title}
              </h2>
              <p className="text-sm leading-6 text-[#6f6a5f]">{item.copy}</p>
              <p className="text-sm font-semibold text-[#12372a]">
                {item.email}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 rounded-[1.5rem] border border-[#e7e0d2] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-[#121826]">
              Send a message
            </h2>
            <p className="text-sm text-[#6f6a5f]">
              This form is a placeholder for now.
            </p>
            <div className="grid gap-4">
              <input type="text" placeholder="Full name" className={inputClass} />
              <input
                type="email"
                placeholder="Email address"
                className={inputClass}
              />
              <input type="text" placeholder="Topic" className={inputClass} />
              <textarea
                rows={4}
                placeholder="Tell us how we can help"
                className={inputClass}
              />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-[#12372a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d2c21]"
              >
                Submit message
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "Hours",
                copy: "Monday to Friday",
                value: "9:00 AM - 6:00 PM (WAT)",
              },
              {
                title: "Office",
                copy: "Placeholder address for now",
                value: "Lagos, Nigeria",
              },
              {
                title: "Response time",
                copy: "We typically respond within 24 hours on business days.",
                value: "Business support",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="space-y-2 rounded-[1.5rem] border border-[#e7e0d2] bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-[#121826]">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-[#6f6a5f]">{item.copy}</p>
                <p className="text-sm font-semibold text-[#39463d]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
