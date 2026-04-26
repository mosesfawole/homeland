"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RegisterInput["role"] | "">("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const roleRegistration = register("role");
  const inputClass =
    "w-full rounded-xl border border-[#e7e0d2] bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition-colors focus:border-[#c7852b] focus:bg-white";

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error ?? "Registration failed");
        return;
      }

      router.push("/login?pending=1");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-[1.75rem] border border-[#e7e0d2] bg-white p-6 shadow-xl shadow-stone-200/70 sm:p-8"
    >
      {serverError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#39463d]">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          {(["USER", "AGENT"] as const).map((role) => (
            <label
              key={role}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                selectedRole === role
                  ? "border-[#12372a] bg-[#f1efe7] text-[#12372a]"
                  : "border-[#e7e0d2] text-[#6f6a5f] hover:border-[#d9cfbc]"
              }`}
            >
              <input
                type="radio"
                value={role}
                {...roleRegistration}
                onChange={(event) => {
                  roleRegistration.onChange(event);
                  setSelectedRole(role);
                }}
                className="sr-only"
              />
              {role === "USER" ? "Property Seeker" : "Property Agent"}
            </label>
          ))}
        </div>
        {errors.role && (
          <p className="text-xs text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#39463d]">Full name</label>
        <input
          type="text"
          placeholder="John Doe"
          {...register("name")}
          className={inputClass}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

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
            placeholder="Min. 8 characters"
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

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#39463d]">
          Confirm password
        </label>
        <input
          type="password"
          placeholder="********"
          {...register("confirmPassword")}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12372a] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d2c21] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={15} className="animate-spin" />}
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-[#6f6a5f]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#12372a] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
