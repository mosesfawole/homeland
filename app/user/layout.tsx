import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserSidebarNav from "@/components/layout/UserSidebarNav";
import Navbar from "@/components/layout/Navbar";
import { getCallbackUrl } from "@/lib/utils/request";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    const callbackUrl = await getCallbackUrl("/user/dashboard");
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (session.user.role !== "USER") {
    redirect("/forbidden");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden bg-[#f4f1eb]">
        <div className="page-shell py-6">
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="hidden h-fit rounded-2xl border border-[#d9dfd6] bg-white p-4 shadow-sm shadow-stone-200/50 lg:block">
              <h2 className="mb-4 border-b border-[#e9eee8] pb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#6f7b70]">
                User Dashboard
              </h2>
              <UserSidebarNav />
            </aside>

            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
