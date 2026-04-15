import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Reset Password - Homeland",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Forgot your password?
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            We&apos;ll email you a secure reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
