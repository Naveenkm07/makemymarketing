# Manual Deployment Instructions - Supabase Migration

## 🚀 Quick Deployment Steps

Since the browser automation tool is experiencing environment issues, here's how to deploy manually:

### Step 1: Copy Migration SQL

The migration file is located at:
```
x:\Anvir\web\supabase\migrations\001_enhanced_schema.sql
```

**You have this file open in your editor!** Select all (Ctrl+A) and copy (Ctrl+C).

### Step 2: Open Supabase SQL Editor

Open your browser and navigate to:
```
https://supabase.com/dashboard/project/kspxdrhgrrghhbuzwhsj/sql/new
```

Or:
1. Go to https://supabase.com/dashboard
2. Select your project: `kspxdrhgrrghhbuzwhsj`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 3: Paste and Run

1. **Paste** the migration SQL into the editor (Ctrl+V)
2. Click **RUN** button (or press Ctrl+Enter)
3. Wait for success message

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. Verify you see these NEW tables:
   - ✅ `payments`
   - ✅ `playback_logs`

### Step 5: Verify RLS Policies

1. Go to **Database** → **Policies**
2. Check policies exist for:
   - `payments` table (2 policies)
   - `playback_logs` table (2 policies)

---

## Expected Migration Output

When you run the migration, you should see success messages for:

```
✅ Extensions created
✅ Enums created (user_role, campaign_status, booking_status, payment_status)
✅ Tables created/updated (profiles, screens, campaigns, bookings, payments, playback_logs)
✅ RLS policies created
✅ Indexes created
✅ Triggers created
✅ Realtime subscriptions enabled
```

---

## Troubleshooting

### Error: "relation already exists"
- This is NORMAL! The migration uses `CREATE TABLE IF NOT EXISTS`
- The migration is safe to run multiple times

### Error: "type already exists"
- This is NORMAL! The migration handles existing enums

### Error: "permission denied"
- Make sure you're logged in to the correct Supabase project
- Verify you have admin access

### Error: "column does not exist"
- Check if you're using the correct migration file
- Ensure you copied the entire SQL content

---

## After Deployment

Once deployed, test the new API endpoints:

### Test 1: Check Payments Endpoint
```bash
curl http://localhost:3000/api/payments
```

**Expected:** 401 Not authenticated (this is correct - shows endpoint works!)

### Test 2: Check Playback Endpoint
```bash
curl http://localhost:3000/api/playback
```

**Expected:** 401 Not authenticated (this is correct - shows endpoint works!)

### Test 3: With Authentication

After logging in to your app, get the session cookie and test:

```bash
curl http://localhost:3000/api/payments \
  -H "Cookie: sb-kspxdrhgrrghhbuzwhsj-auth-token=YOUR_TOKEN_HERE"
```

**Expected:** 200 OK with empty payments array `{"ok":true,"payments":[]}`

---

## Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL from `001_enhanced_schema.sql`
- [ ] Pasted and ran the migration
- [ ] Verified `payments` table exists
- [ ] Verified `playback_logs` table exists
- [ ] Tested `/api/payments` endpoint (returns 401)
- [ ] Tested `/api/playback` endpoint (returns 401)

---

## Migration SQL Preview

The migration includes:
- **2 New Tables:** `payments`, `playback_logs`
- **1 New Enum:** `payment_status`
- **Updated Enum:** `user_role` (added 'admin')
- **6 New RLS Policies:** Secure access control for both tables
- **5 New Indexes:** For performance optimization
- **2 New Triggers:** Auto-update timestamps
- **Realtime:** Enabled for real-time subscriptions

**File Size:** ~12KB of SQL
**Execution Time:** ~2-3 seconds

---

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in the SQL Editor
2. Verify you're on the correct project
3. Ensure the migration file is complete (382 lines)
4. Try running the migration in smaller chunks if needed

The migration is **idempotent** - you can run it multiple times safely!
