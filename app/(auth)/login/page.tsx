import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign In — Homeland",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#121826]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#6f6a5f]">
            Sign in to your Homeland account
          </p>
        </div>
        <Suspense fallback={<div />}>
          <LoginForm />
        </Suspense>
    </div>
  );
}
