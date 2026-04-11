"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pendingCount: number;
  isPendingTab: boolean;
}

export default function AgentBulkActions({
  pendingCount,
  isPendingTab,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const approveAll = async () => {
    if (!isPendingTab || pendingCount === 0) return;
    const ok = window.confirm(
      `Approve all ${pendingCount} pending agents? This can't be undone.`,
    );
    if (!ok) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/verify-agent/bulk", {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.error ?? "Bulk approval failed", "error");
        return;
      }
      showToast(
        `Approved ${json.count ?? pendingCount} agents.`,
        "success",
      );
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={approveAll}
        disabled={isLoading || !isPendingTab || pendingCount === 0}
        className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Approving..." : "Approve All Pending"}
      </button>
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
