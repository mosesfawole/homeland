import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseError = {
  message: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
};

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) return cachedAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cachedAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
}

export function formatSupabaseError(error: SupabaseError): string {
  return [
    error.message,
    error.details,
    error.hint,
    error.code ? `code: ${error.code}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function throwSupabaseError(error: SupabaseError): never {
  throw new Error(formatSupabaseError(error));
}
