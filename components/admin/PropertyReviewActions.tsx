"use client";

import { useState } from "react";
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isApproved = status === "ACTIVE";
  const isRejected = status === "REJECTED";

  const updateStatus = async (status: "ACTIVE" | "REJECTED") => {
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
        return;
      }
      setSuccess(status === "ACTIVE" ? "Approved" : "Rejected");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async () => {
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
        return;
      }
      setSuccess(!isFeatured ? "Featured" : "Unfeatured");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => updateStatus("ACTIVE")}
        disabled={isLoading || isApproved}
        className="px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isApproved ? "Approved" : "Approve"}
      </button>
      <button
        type="button"
        onClick={() => updateStatus("REJECTED")}
        disabled={isLoading || isRejected}
        className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRejected ? "Rejected" : "Reject"}
      </button>
      <button
        type="button"
        onClick={toggleFeatured}
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
    </div>
  );
}
