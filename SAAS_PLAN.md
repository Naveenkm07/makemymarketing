# SaaS Application Plan: makemymarketing

## Current Stack
- **Frontend**: Next.js 16.1.6 + React 19 + TypeScript
- **Styling**: TailwindCSS v4
- **Database**: Prisma + SQLite (dev), PostgreSQL (prod)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended) or AWS/azure

## SaaS Features to Add (priority order)

### 1. Authentication & Authorization
- `next-auth` or `clerk` for login/signup
- Role-based access: owners vs advertisers
- OAuth providers (Google, GitHub)

### 2. Payments & Billing
- `stripe` integration
- Subscription tiers (free, pro, enterprise)
- Per-usage billing (ad slots, impressions)
- Invoicing and receipts

### 3. Multi-tenancy & Data Isolation
- Tenant-aware schemas in Prisma
- Row-level security
- Tenant subdomains or paths

### 4. Notifications & Emails
- `resend` or `sendgrid` for transactional emails
- In-app notifications
- SMS alerts (optional)

### 5. Analytics & Reporting
- Dashboard metrics (revenue, usage, growth)
- Export to CSV/PDF
- Real-time stats with WebSocket or polling

### 6. File Storage & CDN
- `aws-s3` or `cloudinary` for ad creatives
- Image/video optimization
- CDN delivery

### 7. Rate Limiting & Security
- `@upstash/redis` for rate limiting
- `@sentry/nextjs` for error tracking
- Input validation with `zod`

### 8. API Layer
- `trpc` for type-safe APIs
- OpenAPI documentation
- Webhooks for integrations

## Deployment Architecture
- **Frontend**: Vercel edge
- **Database**: PostgreSQL (Vercel Postgres or AWS RDS)
- **Storage**: S3/Cloudinary
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Vercel Analytics

## MVP v0.1 Focus
1. Authentication (owners/advertisers)
2. Screen listing and booking
3. Basic payment flow (Stripe)
4. Simple dashboard
5. Manual content delivery (no smart screens yet)

## Next Steps
1. Add `next-auth` and set up login
2. Extend Prisma schema for users, screens, bookings
3. Integrate Stripe for payments
4. Build owner/advertiser dashboards
5. Set up production database and deploy
