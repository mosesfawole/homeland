# Deployment Checklist

## 1) Vercel Project
1. Create a new Vercel project and connect the repo.
2. Set the build command to `npm run build` and output directory to `.next` (default).
3. Add environment variables listed in `.env.example`.

## 2) Supabase Project
1. Create a Supabase project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` to your project URL.
3. Set `SUPABASE_SERVICE_ROLE_KEY` to the service role key (server-only).
4. Ensure the required tables exist in the `public` schema (see `prisma/schema.prisma` for the structure).
5. Run `docs/supabase-security-fix.sql` on existing projects, or use the updated `docs/supabase-bootstrap.sql` for fresh setup so Row-Level Security is enabled on all app tables.
6. Optionally run `docs/supabase-advisor-followup.sql` to clear the mutable `search_path` warning and add missing foreign-key indexes.

## 3) Cloudinary
1. Create a Cloudinary account and add the cloud name, API key, and API secret.
2. Verify that `next.config.ts` allows `res.cloudinary.com` for images.

## 4) Resend
1. Add a verified sender domain in Resend.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
3. Confirm booking emails by creating and confirming a tour.

## 5) Anthropic
1. Add your `ANTHROPIC_API_KEY` to enable the AI parser.
2. Test `POST /api/ai/parse-property` from an agent account.

## 6) Upstash Rate Limiting
1. Create an Upstash Redis database.
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. This is required for durable production rate limiting on Vercel.

## 7) DNS Fix (if needed)
1. If you see DNS or IPv6 resolution errors in production, set `NODE_OPTIONS=--dns-result-order=ipv4first`.
2. This is included in `.env.example` for local parity.
