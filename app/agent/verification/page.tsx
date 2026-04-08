import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import KycForm from "@/components/agent/KycForm";
import { formatSupabaseError, getSupabaseAdmin } from "@/lib/supabase-server";

export const metadata = {
  title: "Agent Verification - Homeland",
};

export default async function AgentVerificationPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const supabase = getSupabaseAdmin();
  const { data: agentProfile, error } = await supabase
    .from("AgentProfile")
    .select("govIdUrl, cacDocUrl, verificationStatus")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("[AgentVerificationPage] Failed to load agent profile", formatSupabaseError(error));
  }

  if (!agentProfile) redirect("/agent/dashboard");

  return (
    <KycForm
      govIdUrl={agentProfile.govIdUrl}
      cacDocUrl={agentProfile.cacDocUrl}
      verificationStatus={agentProfile.verificationStatus}
    />
  );
}
