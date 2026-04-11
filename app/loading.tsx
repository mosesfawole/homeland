import LoadingScreen from "@/components/ui/LoadingScreen";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LoadingScreen label="Loading page..." />
    </div>
  );
}
