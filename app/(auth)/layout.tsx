import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className="page-shell flex min-h-screen flex-col py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl px-2 py-1.5 text-[#121826] transition-colors hover:bg-white"
          >
            <span className="brand-mark">H</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Homeland</span>
              <span className="block text-xs text-[#6f6a5f]">Back to homepage</span>
            </span>
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
