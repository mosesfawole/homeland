import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebarNav from "@/components/layout/AdminSidebarNav";
import Navbar from "@/components/layout/Navbar";
import { getCallbackUrl } from "@/lib/utils/request";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    const callbackUrl = await getCallbackUrl("/admin/dashboard");
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden bg-white border border-gray-100 rounded-xl p-4 h-fit shadow-sm lg:block">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Admin Console
            </h2>
            <AdminSidebarNav />
          </aside>

          <main className="min-w-0 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
