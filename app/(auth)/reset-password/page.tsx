import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Set New Password - Homeland",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#121826]">
            Set a new password
          </h1>
          <p className="mt-1 text-sm text-[#6f6a5f]">
            Create a new password to access your account.
          </p>
        </div>
        <Suspense fallback={<div />}>
          <ResetPasswordForm />
        </Suspense>
    </div>
  );
}
