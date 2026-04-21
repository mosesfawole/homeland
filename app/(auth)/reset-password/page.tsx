import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Set New Password - Homeland",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Set a new password
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Create a new password to access your account.
          </p>
        </div>
        <ResetPasswordForm />
    </div>
  );
}
