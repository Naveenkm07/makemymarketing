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
Add these to your `web/.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kspxdrhgrrghhbuzwhsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_E8GLpqVyRWEyuuq_9GLSog_xhHPW2an
```

### 2. Setup Database Schema

Go to Supabase Dashboard > SQL Editor and run the schema from `supabase/schema.sql`:

1. Navigate to: https://supabase.com/dashboard/project/kspxdrhgrrghhbuzwhsj
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/schema.sql`
5. Click "Run"

### 3. Enable Auth Provider

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email confirmation settings (optional)
4. Save changes

### 4. Deploy to Vercel

Add environment variables in Vercel:
1. Go to Project Settings > Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://kspxdrhgrrghhbuzwhsj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_E8GLpqVyRWEyuuq_9GLSog_xhHPW2an`

### 5. Test Authentication

1. Run `npm run dev`
2. Visit http://localhost:3000/advertiser/signup
3. Create a test account
4. Check Supabase Dashboard > Authentication > Users to verify
