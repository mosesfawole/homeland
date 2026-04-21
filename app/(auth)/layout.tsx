import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-2xl px-2 py-1.5 text-slate-900 transition-colors hover:bg-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              H
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Homeland</span>
              <span className="block text-xs text-slate-500">Back to homepage</span>
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
