import LoginForm from "./LoginForm";

export const metadata = {
  title: "Welcome Back - Homeland",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sign in to manage listings and bookings
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
