"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  agentProfileId: string;
}

export default function AgentReviewActions({ agentProfileId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: "VERIFIED" | "REJECTED") => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/verify-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentProfileId, status }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => updateStatus("VERIFIED")}
        disabled={isLoading}
        className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => updateStatus("REJECTED")}
        disabled={isLoading}
        className="px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
      >
        Reject
      </button>
    </div>
  );
}
