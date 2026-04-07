import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KycForm from "@/components/agent/KycForm";

export const metadata = {
  title: "Agent Verification - Homeland",
};

export default async function AgentVerificationPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      govIdUrl: true,
      cacDocUrl: true,
      verificationStatus: true,
    },
  });

  if (!agentProfile) redirect("/agent/dashboard");

  return (
    <KycForm
      govIdUrl={agentProfile.govIdUrl}
      cacDocUrl={agentProfile.cacDocUrl}
      verificationStatus={agentProfile.verificationStatus}
    />
  );
}
