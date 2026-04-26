import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgentSidebarNav from "@/components/layout/AgentSidebarNav";
import Navbar from "@/components/layout/Navbar";
import { getCallbackUrl } from "@/lib/utils/request";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    const callbackUrl = await getCallbackUrl("/agent/dashboard");
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (session.user.role !== "AGENT") {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden bg-white border border-gray-100 rounded-xl p-4 h-fit shadow-sm lg:block">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Agent Dashboard
            </h2>
            <AgentSidebarNav />
          </aside>

          <main className="min-w-0 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
