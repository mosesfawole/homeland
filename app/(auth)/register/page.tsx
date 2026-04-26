import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Create Account - Homeland",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#121826]">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-[#6f6a5f]">
            Join Homeland to find or list properties
          </p>
        </div>
        <RegisterForm />
    </div>
  );
}
