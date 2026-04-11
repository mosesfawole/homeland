"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  propertyId: string;
  isFeatured: boolean;
  status: string;
}

export default function PropertyReviewActions({
  propertyId,
  isFeatured,
  status,
}: Props) {
  const tableKey = "properties";
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isApproved = status === "ACTIVE";
  const isRejected = status === "REJECTED";

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

  const scrollAfterAction = (triggerEl: HTMLElement | null) => {
    if (!triggerEl) return;
    const row = triggerEl.closest("tr") as HTMLElement | null;
    const nextRow = row?.nextElementSibling as HTMLElement | null;
    const prevRow = row?.previousElementSibling as HTMLElement | null;
    const targetId = nextRow?.dataset.rowId ?? prevRow?.dataset.rowId ?? null;

    setTimeout(() => {
      if (targetId) {
        const target = document.querySelector(
          `tr[data-row-id="${targetId}"]`,
        ) as HTMLElement | null;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const firstRow = document.querySelector(
        `table[data-admin-table="${tableKey}"] tbody tr`,
      ) as HTMLElement | null;
      firstRow?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const updateStatus = async (
    status: "ACTIVE" | "REJECTED",
    triggerEl: HTMLElement | null,
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status }),
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to update property");
        showToast(json.error ?? "Failed to update property", "error");
        return;
      }
      const message = status === "ACTIVE" ? "Approved" : "Rejected";
      setSuccess(message);
      showToast(`Listing ${message.toLowerCase()}.`, "success");
      router.refresh();
      scrollAfterAction(triggerEl);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (triggerEl: HTMLElement | null) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, isFeatured: !isFeatured }),
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to update property");
        showToast(json.error ?? "Failed to update property", "error");
        return;
      }
      const message = !isFeatured ? "Featured" : "Unfeatured";
      setSuccess(message);
      showToast(`Listing ${message.toLowerCase()}.`, "success");
      router.refresh();
      scrollAfterAction(triggerEl);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={(event) =>
          updateStatus("ACTIVE", event.currentTarget as HTMLElement)
        }
        disabled={isLoading || isApproved}
        className="px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isApproved ? "Approved" : "Approve"}
      </button>
      <button
        type="button"
        onClick={(event) =>
          updateStatus("REJECTED", event.currentTarget as HTMLElement)
        }
        disabled={isLoading || isRejected}
        className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRejected ? "Rejected" : "Reject"}
      </button>
      <button
        type="button"
        onClick={(event) =>
          toggleFeatured(event.currentTarget as HTMLElement)
        }
        disabled={isLoading || !isApproved}
        className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isFeatured ? "Unfeature" : "Feature"}
      </button>
      {success ? (
        <span className="text-xs text-emerald-700">{success}</span>
      ) : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      {!isApproved ? (
        <span className="text-xs text-gray-500">Approve to feature</span>
      ) : null}
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
