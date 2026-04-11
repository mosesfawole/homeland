export default function LoadingScreen({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  );
}
