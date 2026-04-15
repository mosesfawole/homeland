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
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5"
    >
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {authError}
        </div>
      )}
      {verified === "1" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
          Email verified. You can sign in now.
        </div>
      )}
      {verified === "0" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
          Verification link expired or invalid. Please sign up again.
        </div>
      )}
      {pending === "1" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-lg">
          Check your email to verify your account before signing in.
        </div>
      )}
      {reset === "1" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
          Password updated. You can sign in now.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="********"
            {...register("password")}
            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
      >
        {isSubmitting && <Loader2 size={15} className="animate-spin" />}
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
      <p className="text-center text-sm text-gray-500">
        Forgot your password?{" "}
        <Link
          href="/forgot-password"
          className="text-blue-600 hover:underline font-medium"
        >
          Reset it
        </Link>
      </p>
    </form>
  );
}
