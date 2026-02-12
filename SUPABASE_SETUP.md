# Supabase Environment Configuration

## Credentials Provided:

**Project URL:**
```
https://kspxdrhgrrghhbuzwhsj.supabase.co
```

**Anon/Publishable Key:**
```
sb_publishable_E8GLpqVyRWEyuuq_9GLSog_xhHPW2an
```

**Database Connection:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.kspxdrhgrrghhbuzwhsj.supabase.co:5432/postgres
```

## Email Configuration (SMTP)

### Brevo SMTP Settings

Configure these in Supabase Dashboard:

**Sender Email:** 07naveenkm@gmail.com (or kmnaveenkm85@gmail.com)
**Sender Name:** MakeMyMarketing

**SMTP Settings:**
- **Host:** smtp-relay.brevo.com
- **Port:** 587
- **Username:** a20133001@smtp-brevo.com
- **Password:** xsmtpsib-c2a74ff30561ffb505bbb8f1bc8c605fced60760df73

### Setup Steps:

1. Go to https://supabase.com/dashboard/project/kspxdrhgrrghhbuzwhsj
2. Navigate to **Authentication → Email Templates**
3. Click **Configuration** tab
4. Enter the SMTP credentials above
5. Save settings
6. Test by clicking "Send test email"

## Setup Instructions:

### 1. Update .env file
Add these to your `web/.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kspxdrhgrrghhbuzwhsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_E8GLpqVyRWEyuuq_9GLSog_xhHPW2an
```

### 2. Setup Database Schema

**IMPORTANT:** Use the migration file for the complete enhanced schema.

Go to Supabase Dashboard > SQL Editor and run the migration:

1. Navigate to: https://supabase.com/dashboard/project/kspxdrhgrrghhbuzwhsj
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/001_enhanced_schema.sql`
5. Click "Run"

**What's included in the enhanced schema:**
- ✅ Profiles table with admin role support
- ✅ Screens table for billboard owners
- ✅ Campaigns table for advertisers
- ✅ Bookings table linking campaigns to screens
- ✅ **Payments table** for transaction tracking
- ✅ **Playback logs table** for proof-of-play verification
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Automatic timestamp triggers
- ✅ Performance indexes
- ✅ Realtime subscriptions

### 3. Verify Schema Deployment

After running the migration, verify in Supabase Dashboard:

1. Go to **Table Editor**
2. Check that these tables exist:
   - profiles
   - screens
   - campaigns
   - bookings
   - **payments** (new)
   - **playback_logs** (new)
3. Go to **Database → Policies** to verify RLS policies are active

### 4. Enable Auth Provider

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email confirmation settings (optional)
4. Save changes

### 5. Deploy to Vercel

Add environment variables in Vercel:
1. Go to Project Settings > Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://kspxdrhgrrghhbuzwhsj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_E8GLpqVyRWEyuuq_9GLSog_xhHPW2an`

### 6. Test Authentication

1. Run `npm run dev`
2. Visit http://localhost:3000/advertiser/signup
3. Create a test account
4. Check Supabase Dashboard > Authentication > Users to verify

## New Features

### Payments System
Track financial transactions for bookings. See [docs/PAYMENTS.md](../docs/PAYMENTS.md) for details.

**API Endpoints:**
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments` - Update payment status

### Playback Tracking (Proof of Play)
Log when ads are displayed on screens. See [docs/PLAYBACK_TRACKING.md](../docs/PLAYBACK_TRACKING.md) for details.

**API Endpoints:**
- `GET /api/playback` - View playback logs
- `POST /api/playback` - Log playback event

## TypeScript Types

The project includes type-safe database types in `lib/types/database.types.ts`:

```typescript
import type { Database } from '@/lib/types/database.types';

// Use with Supabase client for type safety
const supabase = createClient<Database>();

// Type-safe queries
const { data } = await supabase
  .from('payments')
  .select('*')
  .eq('status', 'completed'); // TypeScript will validate this
```

## Database Schema Reference

### User Roles
- `advertiser` - Creates campaigns and books screens
- `owner` - Manages screens and logs playback
- `admin` - Full access to all resources

### Payment Status
- `pending` - Payment created, not processed
- `processing` - Payment being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### Booking Status
- `pending` - Booking requested
- `booked` - Booking confirmed
- `running` - Currently active
- `finished` - Completed
- `cancelled` - Cancelled

## Troubleshooting

### Migration Errors
If you encounter errors running the migration:
1. Check if tables already exist
2. The migration uses `IF NOT EXISTS` and `DROP POLICY IF EXISTS` for safety
3. You can run it multiple times safely

### RLS Policy Issues
If users can't access their data:
1. Verify user is authenticated: `SELECT auth.uid()`
2. Check RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
3. Review policies in Supabase Dashboard > Database > Policies

### Type Errors
If TypeScript shows type errors:
1. Ensure `database.types.ts` is up to date
2. Restart TypeScript server in VS Code
3. Run `npm run build` to check for errors
