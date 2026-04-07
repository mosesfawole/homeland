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
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Book a Tour</h3>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Date
          </label>
          <input
            type="date"
            value={tourDate}
            onChange={(event) => setTourDate(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Time
          </label>
          <input
            type="time"
            value={tourTime}
            onChange={(event) => setTourTime(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none"
          placeholder="Any specific timing details?"
        />
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? "Sending..." : "Request Tour"}
      </button>
    </div>
  );
}
