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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white border border-gray-100 rounded-xl p-4 h-fit shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Admin Console
            </h2>
            <AdminSidebarNav />
          </aside>

          <main className="space-y-6">
            <Navbar />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
