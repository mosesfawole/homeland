import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Please sign in
        </h1>
        <p className="text-sm text-gray-500">
          You need an account to access this page.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
