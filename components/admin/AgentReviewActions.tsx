"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  agentProfileId: string;
}

export default function AgentReviewActions({ agentProfileId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (status: "VERIFIED" | "REJECTED") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/verify-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentProfileId, status }),
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to update agent");
        return;
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => updateStatus("VERIFIED")}
        disabled={isLoading}
        className="px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => updateStatus("REJECTED")}
        disabled={isLoading}
        className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Reject
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
