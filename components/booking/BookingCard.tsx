"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils/format";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface BookingCardData {
  id: string;
  status: BookingStatus;
  tourDate: string | Date;
  tourTime: string;
  message?: string | null;
  createdAt: string | Date;
  cancelReason?: string | null;
  agentNote?: string | null;
  property: {
    id: string;
    title: string;
  };
  user?: {
    name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;
}

interface Props {
  booking: BookingCardData;
  role: "USER" | "AGENT" | "ADMIN";
}

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-600",
  COMPLETED: "bg-slate-100 text-slate-600",
};

export default function BookingCard({ booking, role }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const tourDate = new Date(booking.tourDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const canConfirm = role !== "USER" && booking.status === "PENDING";
  const canComplete = role !== "USER" && booking.status === "CONFIRMED";
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  const runAction = async (
    action: "CONFIRM" | "CANCEL" | "COMPLETE",
    payload?: { cancelReason?: string; agentNote?: string },
  ) => {
    setIsLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking request?")) return;
    const reason = window.prompt("Optional cancellation reason") ?? "";
    await runAction("CANCEL", reason ? { cancelReason: reason } : undefined);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Property</p>
          <p className="text-base font-semibold text-gray-900">
            {booking.property.title}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400">Tour date</p>
          <p className="font-medium text-gray-800">{tourDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Time</p>
          <p className="font-medium text-gray-800">{booking.tourTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Requested</p>
          <p className="font-medium text-gray-800">{timeAgo(booking.createdAt)}</p>
        </div>
      </div>

      {booking.message ? (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          "{booking.message}"
        </div>
      ) : null}

      {booking.cancelReason ? (
        <p className="text-xs text-rose-600">Reason: {booking.cancelReason}</p>
      ) : null}

      {booking.user && role !== "USER" ? (
        <div className="text-sm text-gray-600">
          Client: {booking.user.name ?? booking.user.email}
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-500">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        {canConfirm ? (
          <button
            type="button"
            onClick={() => runAction("CONFIRM")}
            disabled={isLoading !== null}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            {isLoading === "CONFIRM" ? "Confirming..." : "Confirm"}
          </button>
        ) : null}

        {canComplete ? (
          <button
            type="button"
            onClick={() => runAction("COMPLETE")}
            disabled={isLoading !== null}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            {isLoading === "COMPLETE" ? "Completing..." : "Mark completed"}
          </button>
        ) : null}

        {canCancel ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading !== null}
            className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50"
          >
            {isLoading === "CANCEL" ? "Cancelling..." : "Cancel"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
