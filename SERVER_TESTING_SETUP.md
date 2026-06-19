# COMPLETE SERVER TESTING SETUP CHECKLIST

## 🎯 OBJECTIVE
Get ProviderPost running locally/staging with all services connected for end-to-end testing

---

## 1️⃣ DATABASE SETUP (Supabase)

### Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Create new project
- [ ] Save credentials:
  - [ ] Project URL: `https://[project-id].supabase.co`
  - [ ] Anon Key: `eyJ...` (copy from Settings > API)
  - [ ] Service Role Key: `eyJ...` (copy from Settings > API)

### Run Database Migrations
```bash
cd ProviderPost

# Option 1: Use Supabase CLI
npm install -g @supabase/cli
supabase login
supabase link --project-ref [project-id]
supabase db push

# Option 2: Manual SQL in Supabase dashboard
# Copy each .sql file from supabase/migrations/ into SQL Editor
# Run in this order:
1. supabase/migrations/initial_schema.sql
2. supabase/migrations/photo_upload_support.sql
3. supabase/migrations/promo_code_system.sql
4. supabase/migrations/admin_photo_verification.sql
5. supabase/migrations/moderation_system.sql
```

### Verify Database
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Should see: users, sessions, providers, provider_images, promo_codes, 
-- promo_redemptions, reviews, favorites, bans, subscriptions, etc.

-- Test connection
SELECT NOW();
```

### Setup RLS Policies
- [ ] All migrations include RLS policies
- [ ] Enable RLS on all tables
- [ ] Test that users can only see their own data

---

## 2️⃣ ENVIRONMENT VARIABLES

### Create `.env.local`
```bash
cd ProviderPost
cp .env.example .env.local  # Or create new file
```

### Fill in all variables:

```env
# DATABASE (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SITE CONFIG
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# PAYMENT (NowPayments)
NOWPAYMENTS_API_KEY=[get from nowpayments.io]
NOWPAYMENTS_SANDBOX=true  # Set to true for testing
NOWPAYMENTS_IPN_SECRET=[generate in nowpayments dashboard]

# EMAIL (Resend)
RESEND_API_KEY=[get from resend.com]
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Can use localhost for testing

# STORAGE (Cloudflare R2)
CLOUDFLARE_R2_ACCESS_KEY_ID=[get from R2]
CLOUDFLARE_R2_SECRET_ACCESS_KEY=[get from R2]
CLOUDFLARE_R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=providerpost
CLOUDFLARE_R2_PUBLIC_URL=https://[custom-domain].com

# CACHE (Upstash Redis) - OPTIONAL for development
REDIS_URL=redis://...  # Or skip for in-memory cache

# ADMIN
ADMIN_USERNAME=admin
ADMIN_PASSWORD=testpass123
ADMIN_TOKEN_SECRET=random-secret-key-min-32-characters-long

# CRON SECRET (for renewal jobs)
CRON_SECRET=random-cron-secret-key

# MONITORING (Sentry) - OPTIONAL
SENTRY_DSN=
```

---

## 3️⃣ PAYMENT PROCESSOR SETUP (NowPayments)

### Create Account
- [ ] Go to https://nowpayments.io
- [ ] Sign up
- [ ] Verify email
- [ ] Enable sandbox mode (for testing)

### Get API Credentials
- [ ] Login to dashboard
- [ ] Settings > API Settings
- [ ] Copy API Key
- [ ] Copy IPN Secret
- [ ] Add to `.env.local`

### Setup Webhook
- [ ] Settings > Webhooks
- [ ] Add webhook URL: `https://yourdomain.com/api/payments/webhook`
- [ ] Select events: `payment_received`, `payment_failed`
- [ ] Save IPN secret

### Test Payment Flow
```bash
# Start server
npm run dev

# In browser: http://localhost:3000/checkout
# Select a plan
# Enter test payment info
# Should redirect to payment-success
```

---

## 4️⃣ EMAIL SERVICE SETUP (Resend)

### Create Account
- [ ] Go to https://resend.com
- [ ] Sign up
- [ ] Verify email
- [ ] Create API key

### Verify Sender Domain (Optional for testing)
- [ ] Settings > Domains
- [ ] Add your domain
- [ ] Add DNS records
- [ ] Click "Verify"

### Test Email Service
```typescript
// In Node console or API route
import { sendWelcomeEmail } from "@/lib/email/send"

const result = await sendWelcomeEmail("test@example.com", "Test User")
console.log(result)  // Should show { success: true, id: "..." }
```

### Check Sent Emails
- [ ] Resend Dashboard > Emails tab
- [ ] Should see your test email
- [ ] Click to view content

---

## 5️⃣ STORAGE SETUP (Cloudflare R2)

### Create R2 Bucket
- [ ] Go to https://dash.cloudflare.com
- [ ] R2 > Create Bucket
- [ ] Name: `providerpost`
- [ ] Choose region
- [ ] Create bucket

### Create API Token
- [ ] R2 Settings > API Tokens
- [ ] Create API token
- [ ] Copy Access Key ID
- [ ] Copy Secret Access Key
- [ ] Add to `.env.local`

### Configure CORS
- [ ] Bucket Settings > CORS
- [ ] Add CORS rule:
```json
[{
  "allowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
  "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "allowedHeaders": ["*"]
}]
```

### Setup Custom Domain (Optional)
- [ ] Workers & Pages > Create Application > Create Worker
- [ ] Add route: `https://photos.yourdomain.com/*`
- [ ] Route to R2 bucket
- [ ] Update `CLOUDFLARE_R2_PUBLIC_URL` in `.env.local`

### Test Upload
```bash
# In app: /user/photos or /post page
# Select image
# Upload
# Check Cloudflare R2 dashboard - should see file
```

---

## 6️⃣ REDIS SETUP (Optional but Recommended)

### Use Upstash (easiest)
- [ ] Go to https://upstash.com
- [ ] Create Redis database
- [ ] Copy connection string
- [ ] Add to `.env.local` as `REDIS_URL`

### Or use Docker locally
```bash
docker run -d -p 6379:6379 redis:latest
export REDIS_URL=redis://localhost:6379
```

### Test Connection
```typescript
// In API route
import { Redis } from "@upstash/redis"
const redis = Redis.fromEnv()
await redis.set("test", "value")
const val = await redis.get("test")
console.log(val)  // Should print "value"
```

---

## 7️⃣ LOCAL DEVELOPMENT SETUP

### Install Dependencies
```bash
cd ProviderPost
npm install  # or pnpm install
```

### Generate TypeScript types
```bash
npm run types
# or if that doesn't exist:
npx supabase gen types typescript > types/supabase.ts
```

### Start Development Server
```bash
npm run dev
# Should start on http://localhost:3000
```

### Verify Server is Running
```bash
curl http://localhost:3000
# Should return HTML

curl http://localhost:3000/api/auth/me
# Should return { user: null } or user object if logged in
```

---

## 8️⃣ TESTING CHECKLIST

### Test User Authentication
- [ ] Go to http://localhost:3000/register
- [ ] Create test account
- [ ] Check email for confirmation (should be in Resend dashboard)
- [ ] Login with credentials
- [ ] Should see dashboard

### Test Ad Posting
- [ ] Login as user
- [ ] Go to /post
- [ ] Fill out ad form
- [ ] Upload photos
- [ ] Submit
- [ ] Should redirect to checkout or confirmation

### Test Payment
- [ ] On checkout page
- [ ] Select a plan
- [ ] Go through payment flow
- [ ] Check NowPayments dashboard for payment
- [ ] Should receive success email

### Test Email System
- [ ] Trigger all email types:
  - [ ] Welcome email (signup)
  - [ ] Ad submission (post ad)
  - [ ] Payment receipt (pay for plan)
  - [ ] Renewal reminder (manual: set date to 7 days from now)
- [ ] Check Resend dashboard
- [ ] Verify content is correct

### Test Photo Upload
- [ ] Upload photo in post form
- [ ] Check R2 bucket - file should exist
- [ ] File should be compressed (check size)
- [ ] Should be able to view via Cloudflare URL

### Test Photo Verification
- [ ] Admin login at http://localhost:3000/admin
- [ ] Go to /admin/photo-verification
- [ ] Should see pending photos
- [ ] Approve one - should get email
- [ ] Reject one with reason - should get rejection email

### Test Moderation Dashboard
- [ ] Admin login
- [ ] Go to /admin/moderation
- [ ] Should see pending ads
- [ ] Approve one
- [ ] Check moderation_logs table - should have audit record
- [ ] Provider should receive approval email

### Test Promo Codes
- [ ] Admin go to /admin/promos
- [ ] Create test code: TESTCODE50
- [ ] Value: 50% discount
- [ ] User tries to redeem at checkout
- [ ] Should apply discount
- [ ] Check promo_redemptions table

### Test Duplicate Prevention
- [ ] Try to upload same photo twice
- [ ] System should detect duplicate via hash
- [ ] Should prevent resubmission

### Test Admin Auth
- [ ] Try to access /admin without login
- [ ] Should redirect to login
- [ ] Try with wrong username/password
- [ ] Should fail
- [ ] Login with correct credentials
- [ ] Should work

---

## 9️⃣ DATABASE VERIFICATION

### Run These SQL Queries
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check indexes
SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';

-- Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM providers;
SELECT COUNT(*) FROM provider_images;
SELECT COUNT(*) FROM promo_codes;

-- Verify sessions table
SELECT * FROM sessions LIMIT 1;

-- Check moderation logs
SELECT * FROM moderation_logs LIMIT 1;
```

---

## 🔟 API ENDPOINT VERIFICATION

### Test All Critical Endpoints
```bash
# Auth endpoints
curl http://localhost:3000/api/auth/me

# Ad endpoints
curl http://localhost:3000/api/providers

# Upload endpoint
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -H "Authorization: Bearer [session-token]"

# Promo endpoints
curl http://localhost:3000/api/promos/validate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"code":"TESTCODE50"}'

# Admin endpoints
curl http://localhost:3000/api/admin/promos \
  -H "Authorization: Bearer [admin-token]"

curl http://localhost:3000/api/admin/moderation

# Photo verification
curl http://localhost:3000/api/admin/photos/pending

# Moderation
curl http://localhost:3000/api/admin/moderation?filter=pending
```

---

## 1️⃣1️⃣ DEBUGGING & LOGS

### Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Console tab - check for errors
- [ ] Network tab - check API responses
- [ ] Look for 4xx/5xx errors

### Check Server Logs
```bash
# Terminal where npm run dev is running
# Should see:
# - Route requests
# - Database queries
# - Email send logs
# - Error stack traces
```

### Check Database Logs (Supabase)
- [ ] Go to Supabase dashboard
- [ ] Project > Logs
- [ ] View database queries
- [ ] Check for errors

### Enable Debug Logging
```typescript
// In lib/supabase.ts or any API route
console.log('DEBUG:', variableName)
```

### Check External Service Dashboards
- [ ] Supabase: https://supabase.com/dashboard
- [ ] NowPayments: https://nowpayments.io/dashboard
- [ ] Resend: https://resend.com/emails
- [ ] Cloudflare R2: https://dash.cloudflare.com/r2

---

## 1️⃣2️⃣ COMMON ISSUES & FIXES

### "Cannot connect to database"
```bash
# Check credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
psql postgresql://[user]@[host]:5432/[db]
```

### "Email not sending"
- [ ] Check RESEND_API_KEY is set
- [ ] Check RESEND_FROM_EMAIL is correct
- [ ] View Resend dashboard for errors
- [ ] Check email address is valid

### "Photos not uploading"
- [ ] Check CLOUDFLARE_R2_* vars
- [ ] Check R2 bucket exists
- [ ] Check CORS configured
- [ ] Check file size (sharp compresses to 1200px)

### "Payment webhook not working"
- [ ] Check NOWPAYMENTS_IPN_SECRET is set
- [ ] Check webhook URL is correct
- [ ] Check NowPayments dashboard shows webhook events
- [ ] Verify sandbox mode enabled

### "Admin can't login"
- [ ] Check ADMIN_USERNAME and ADMIN_PASSWORD in .env.local
- [ ] Check users table has admin user
- [ ] Check role = 'admin' in database

### "Rate limiter not working"
- [ ] For local testing, in-memory is fine
- [ ] For production, need Redis
- [ ] Check REDIS_URL if using external Redis

---

## 1️⃣3️⃣ FULL SETUP COMMAND REFERENCE

```bash
# 1. Clone and install
git clone [repo]
cd ProviderPost
npm install

# 2. Setup .env.local with all credentials

# 3. Run migrations
supabase db push

# 4. Start server
npm run dev

# 5. Run in second terminal to check server
curl http://localhost:3000

# 6. Open browser
open http://localhost:3000
```

---

## 1️⃣4️⃣ TESTING SCRIPT

Create `test-server.sh`:
```bash
#!/bin/bash

echo "🧪 Starting Server Tests"

# Test 1: Server running
echo "Test 1: Server connection..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Server running" || echo "❌ Server not running"

# Test 2: Database
echo "Test 2: Database connection..."
curl -s http://localhost:3000/api/auth/me | jq . && echo "✅ Database OK" || echo "❌ Database failed"

# Test 3: Email
echo "Test 3: Email service..."
curl -s http://localhost:3000/api/test/email && echo "✅ Email OK" || echo "❌ Email failed"

# Test 4: Storage
echo "Test 4: Storage service..."
curl -s http://localhost:3000/api/test/storage && echo "✅ Storage OK" || echo "❌ Storage failed"

# Test 5: Payment
echo "Test 5: Payment service..."
curl -s http://localhost:3000/api/test/payment && echo "✅ Payment OK" || echo "❌ Payment failed"

echo "🎉 All tests complete"
```

Run with:
```bash
chmod +x test-server.sh
./test-server.sh
```

---

## 1️⃣5️⃣ PRODUCTION DEPLOYMENT CHECKLIST

When ready to deploy to production:

- [ ] All environment variables set correctly
- [ ] Database migrations run on prod DB
- [ ] NEXT_PUBLIC_SITE_URL = your production domain
- [ ] NOWPAYMENTS_SANDBOX = false
- [ ] RESEND_FROM_EMAIL = your verified domain
- [ ] R2 bucket public URL configured
- [ ] Webhook URLs point to production domain
- [ ] SSL certificate installed
- [ ] Rate limiting configured (use Redis, not in-memory)
- [ ] Error monitoring enabled (Sentry)
- [ ] Backups configured
- [ ] Monitoring alerts set up

---

## SUMMARY

**To test the server, you need:**

| Service | Required | Setup Time | Cost |
|---------|----------|-----------|------|
| Supabase (Database) | ✅ YES | 10 min | Free (testing) |
| NowPayments (Payment) | ✅ YES | 10 min | Free |
| Resend (Email) | ✅ YES | 10 min | Free (100/month) |
| Cloudflare R2 (Storage) | ✅ YES | 15 min | Free (first 10GB) |
| Upstash Redis (Cache) | ⚠️ Optional | 5 min | Free (500MB) |

**Total setup time: ~1 hour**

**To verify everything works:**
1. Run `npm run dev`
2. Create test account
3. Post test ad with photos
4. Go through checkout
5. Check all emails received
6. Verify files in R2
7. Admin approve the ad
8. Check moderation logs

---

**Ready to test? Start with:** Setting up Supabase + NowPayments + Resend + R2

