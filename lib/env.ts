const requiredInProd = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
];

const missing = requiredInProd.filter((key) => !process.env[key]);

if (process.env.NODE_ENV === "production") {
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  const secret = process.env.NEXTAUTH_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters long.");
  }

  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? "gemini";
  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic.");
  }
}
