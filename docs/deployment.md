# Deployment Checklist

## 1) Vercel Project
1. Create a new Vercel project and connect the repo.
2. Set the build command to `npm run build` and output directory to `.next` (default).
3. Add environment variables listed in `.env.example`.

## 2) Supabase Postgres + Pooler
1. Create a Supabase project and get the connection pooler URL.
2. Set `DATABASE_URL` to the pooler connection string with SSL enabled.
3. Run Prisma migrations or `npx prisma db push` locally against the same URL.

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

## 6) DNS Fix (if needed)
1. If you see DNS or IPv6 resolution errors in production, set `NODE_OPTIONS=--dns-result-order=ipv4first`.
2. This is included in `.env.example` for local parity.
