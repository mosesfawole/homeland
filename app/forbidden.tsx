import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          You don&apos;t have permission
        </h1>
        <p className="text-sm text-gray-500">
          Your account doesn’t have access to this page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
