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
    <div className="min-h-screen overflow-x-hidden bg-[#f7f5f0]">
      <Navbar />
      <div className="page-shell py-6">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-[1.5rem] border border-[#e7e0d2] bg-white p-4 shadow-sm shadow-stone-200/50 lg:block">
            <h2 className="mb-4 text-sm font-semibold text-[#121826]">
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
