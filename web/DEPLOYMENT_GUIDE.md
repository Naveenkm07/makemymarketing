# Deployment Guide — Make My Marketing

This guide covers how to deploy your DOOH SaaS platform to production using **GitHub** and **Netlify/Vercel**.

## 1. Prerequisites
- GitHub Account
- Netlify or Vercel Account
- Resend API Key (for emails)
- Stripe Keys (Live Mode)
- Supabase Project (Production)

## 2. Environment Variables
Configure these in your Netlify/Vercel dashboard:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
```

## 3. Database Migration
Run the following SQL scripts in your Supabase User Dashboard -> SQL Editor (in order):

1.  `supabase/migrations/001_initial_schema.sql` (Core tables)
2.  `supabase/migrations/20260212_payouts_tables.sql` (Payouts system)
3.  `supabase/migrations/20260212_admin_panel.sql` (Admin system)

## 4. Admin Setup
To access the Admin Panel (`/admin`), you must promote your user account:
1.  Sign up on your deployed site.
2.  Go to Supabase -> Table Editor -> `profiles`.
3.  Find your user and change `role` to `'admin'`.
4.  (Or run `supabase/promote_admin.sql`).

## 5. Storage Buckets
Create these public buckets in Supabase Storage:
- `screen-images`
- `campaign-creatives`

## 6. Email Verification (Resend)
- Add your domain to Resend (DNS records).
- Update `lib/email.ts` to use your verified domain: `from: 'Make My Marketing <support@yourdomain.com>'`.

## 7. Go Live 🚀
- Push your code to GitHub `main` branch.
- Connect repository to Netlify/Vercel.
- Watch the build green light!
