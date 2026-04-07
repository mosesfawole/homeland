"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  propertyId: string;
}

export default function ListingActions({ propertyId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        return;
      }
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={`/agent/listings/${propertyId}/edit`}
        className="text-blue-600 hover:text-blue-700"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-600 disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
