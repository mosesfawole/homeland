"use client";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const safeCallbackUrl = useMemo(() => {
    if (!callbackUrl) return "";
    try {
      const url = new URL(callbackUrl, window.location.origin);
      return url.origin === window.location.origin
        ? `${url.pathname}${url.search}${url.hash}`
        : "";
    } catch {
      return "";
    }
  }, [callbackUrl]);
  const verified = searchParams.get("verified");
  const pending = searchParams.get("pending");
  const reset = searchParams.get("reset");
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const inputClass =
    "w-full rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#c7852b] focus:bg-white";
  const noticeClass = "rounded-xl border px-4 py-3 text-sm";

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const errorText = result.error.toLowerCase();
        if (errorText.includes("emailnotverified")) {
          setAuthError("Please verify your email before signing in.");
        } else if (errorText.includes("ratelimited")) {
          setAuthError("Too many login attempts. Please try again shortly.");
        } else {
          setAuthError("Invalid email or password");
        }
        return;
      }

      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      if (safeCallbackUrl) {
        router.push(safeCallbackUrl);
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "AGENT") {
        router.push("/agent/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-[1.75rem] border border-[#e7e0d2] bg-white p-6 shadow-xl shadow-stone-200/70 sm:p-8"
    >
      {authError && (
        <div className={`${noticeClass} border-red-200 bg-red-50 text-red-700`}>
          {authError}
        </div>
      )}
      {verified === "1" && (
        <div className={`${noticeClass} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          Email verified. You can sign in now.
        </div>
      )}
      {verified === "0" && (
        <div className={`${noticeClass} border-amber-200 bg-amber-50 text-amber-700`}>
          Verification link expired or invalid. Please sign up again.
        </div>
      )}
      {pending === "1" && (
        <div className={`${noticeClass} border-[#d9cfbc] bg-[#f8f6ee] text-[#12372a]`}>
          Check your email to verify your account. You can still sign in while verification is pending.
        </div>
      )}
      {reset === "1" && (
        <div className={`${noticeClass} border-emerald-200 bg-emerald-50 text-emerald-700`}>
          Password updated. You can sign in now.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#39463d]">
          Email address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className={inputClass}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#39463d]">Password</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#918a7a] hover:text-[#12372a]"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2c21] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={15} className="animate-spin" />}
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-[#6f6a5f]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#12372a] hover:underline"
        >
          Create one
        </Link>
      </p>
      <p className="text-center text-sm text-[#6f6a5f]">
        Forgot your password?{" "}
        <Link
          href="/forgot-password"
          className="font-semibold text-[#12372a] hover:underline"
        >
          Reset it
        </Link>
      </p>
    </form>
  );
}
