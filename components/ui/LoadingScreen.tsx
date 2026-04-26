export default function LoadingScreen({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-50/95 px-4 pt-28"
    >
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  );
}
