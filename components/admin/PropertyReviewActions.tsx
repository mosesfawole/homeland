"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  propertyId: string;
  isFeatured: boolean;
}

export default function PropertyReviewActions({ propertyId, isFeatured }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: "ACTIVE" | "REJECTED") => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, status }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/verify-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, isFeatured: !isFeatured }),
      });
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
      <button
        type="button"
        onClick={toggleFeatured}
        disabled={isLoading}
        className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
      >
        {isFeatured ? "Unfeature" : "Feature"}
      </button>
    </div>
  );
}
