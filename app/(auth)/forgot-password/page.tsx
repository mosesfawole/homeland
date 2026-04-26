import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Reset Password - Homeland",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#121826]">
            Forgot your password?
          </h1>
          <p className="mt-1 text-sm text-[#6f6a5f]">
            We&apos;ll email you a secure reset link.
          </p>
        </div>
        <ForgotPasswordForm />
    </div>
  );
}
