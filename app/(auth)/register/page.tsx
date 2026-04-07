import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Create Account — Homeland",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create an account
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Join Homeland to find or list properties
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
