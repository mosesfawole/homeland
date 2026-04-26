"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputClass =
    "w-full rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#c7852b] focus:bg-white";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          json.error ??
            "We couldn’t process that request. Please try again.",
        );
        return;
      }

      setMessage(
        "If an account exists for that email, we sent a reset link.",
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[1.75rem] border border-[#e7e0d2] bg-white p-6 shadow-xl shadow-stone-200/70 sm:p-8"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#39463d]">
          Email address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2c21] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending link..." : "Send reset link"}
      </button>

      <p className="text-center text-sm text-[#6f6a5f]">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#12372a] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}
