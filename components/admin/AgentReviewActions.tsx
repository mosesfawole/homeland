"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  agentProfileId: string;
}

export default function AgentReviewActions({ agentProfileId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string, tone: "success" | "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

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
        showToast(json.error ?? "Failed to update agent", "error");
        return;
      }
      showToast(
        status === "VERIFIED" ? "Agent approved." : "Agent rejected.",
        "success",
      );
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
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-2 text-xs font-semibold shadow-lg ${
            toast.tone === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
