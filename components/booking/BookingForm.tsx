"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  propertyId: string;
}

export default function BookingForm({ propertyId }: Props) {
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minDate = new Date().toISOString().split("T")[0] ?? "";

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!tourDate || !tourTime) {
      setError("Please select a date and time.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          tourDate,
          tourTime,
          message,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Failed to request tour.");
        return;
      }

      setSuccess("Tour request sent. The agent will confirm shortly.");
      setTourDate("");
      setTourTime("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-[#e7e0d2] bg-white p-5 shadow-sm shadow-stone-200/50">
      <h3 className="text-base font-semibold text-[#121826]">Book a Tour</h3>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a5f]">
            Date
          </label>
          <input
            type="date"
            value={tourDate}
            min={minDate}
            onChange={(event) => setTourDate(event.target.value)}
            className="h-12 w-full min-w-0 rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-3 text-sm outline-none focus:border-[#c7852b] focus:bg-white"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a5f]">
            Time
          </label>
          <input
            type="time"
            value={tourTime}
            onChange={(event) => setTourTime(event.target.value)}
            className="h-12 w-full min-w-0 rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-3 text-sm outline-none focus:border-[#c7852b] focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6a5f]">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-3 py-3 text-sm outline-none focus:border-[#c7852b] focus:bg-white"
          placeholder="Any specific timing details?"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d2c21] disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Sending..." : "Request Tour"}
      </button>
    </div>
  );
}
