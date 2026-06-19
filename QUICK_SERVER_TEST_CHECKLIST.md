# ⚡ QUICK SERVER TESTING CHECKLIST

## 🎯 WHAT NEEDS TO BE CONNECTED

### ✅ CRITICAL (Must Have to Run Server)

#### 1. **Supabase (Database)**
```
What: PostgreSQL database
Priority: 🔴 CRITICAL
Setup: 15 minutes
Cost: FREE for testing

Steps:
□ Go to https://supabase.com
□ Create project
□ Copy: NEXT_PUBLIC_SUPABASE_URL
□ Copy: NEXT_PUBLIC_SUPABASE_ANON_KEY  
□ Copy: SUPABASE_SERVICE_ROLE_KEY
□ Run database migrations (see SERVER_TESTING_SETUP.md)
□ Test connection: SELECT NOW();

What You Get:
✓ Users table (authentication)
✓ Providers table (ad listings)
✓ Sessions table (login sessions)
✓ Photos table (ad photos)
✓ Subscriptions table (payment tracking)
✓ Moderation logs (admin audit trail)
```

#### 2. **NowPayments (Crypto Payments)**
```
What: Payment processor for cryptocurrency
Priority: 🔴 CRITICAL
Setup: 10 minutes
Cost: FREE account + 0.5% fee on transactions

Steps:
□ Go to https://nowpayments.io
□ Sign up and verify email
□ Enable SANDBOX MODE for testing
□ Go to Settings > API Settings
□ Copy: NOWPAYMENTS_API_KEY
□ Copy: NOWPAYMENTS_IPN_SECRET
□ Go to Webhooks
□ Add webhook: https://yourdomain.com/api/payments/webhook
□ Set NOWPAYMENTS_SANDBOX=true in .env.local

What You Get:
✓ Payment processing (BTC, ETH, SOL, XRP)
✓ Subscription management
✓ Webhook notifications for payment status
✓ Test payment flow without real money
```

#### 3. **Resend (Email Service)**
```
What: Email sending service
Priority: 🔴 CRITICAL
Setup: 10 minutes
Cost: FREE 100/month for testing

Steps:
□ Go to https://resend.com
□ Sign up and verify email
□ Go to API Keys
□ Create API key
□ Copy: RESEND_API_KEY
□ Set RESEND_FROM_EMAIL=noreply@yourdomain.com

What You Get:
✓ Welcome emails
✓ Payment receipts
✓ Ad approval/rejection emails
✓ Promo code notifications
✓ Renewal reminders
```

#### 4. **Cloudflare R2 (Photo Storage)**
```
What: Cloud storage for photo uploads
Priority: 🔴 CRITICAL
Setup: 15 minutes
Cost: FREE first 10GB

Steps:
□ Go to https://dash.cloudflare.com
□ R2 > Create Bucket > Name: "providerpost"
□ Go to Settings > API Tokens
□ Create API token
□ Copy: CLOUDFLARE_R2_ACCESS_KEY_ID
□ Copy: CLOUDFLARE_R2_SECRET_ACCESS_KEY
□ Copy: CLOUDFLARE_R2_ENDPOINT
□ Go to Bucket Settings > CORS
□ Add: allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"]

What You Get:
✓ Photo upload and storage
✓ Auto-compression to 1200px
✓ EXIF stripping (privacy)
✓ CDN serving for fast loading
```

---

### ⚠️ RECOMMENDED (Highly Recommended for Testing)

#### 5. **Upstash Redis (Cache/Rate Limiting)**
```
What: Redis cache for performance and rate limiting
Priority: 🟡 RECOMMENDED
Setup: 5 minutes
Cost: FREE 500MB

Steps:
□ Go to https://upstash.com
□ Create Redis database
□ Copy connection string
□ Set REDIS_URL in .env.local

What You Get:
✓ Rate limiting (10 requests/min per user)
✓ Session caching
✓ Email queue
✓ Performance improvements

Alternative:
- Skip for local testing (in-memory cache works)
- Required for production
```

#### 6. **Admin Account Setup**
```
What: Admin credentials for /admin pages
Priority: 🟡 RECOMMENDED
Setup: 5 minutes
Cost: FREE

Steps:
□ Create admin user in Supabase
□ Go to users table
□ Insert: email=admin@test.com, role='admin'
□ Set environment variables:
   - ADMIN_USERNAME=admin
   - ADMIN_PASSWORD=testpass123
   - ADMIN_TOKEN_SECRET=random-secret-key-32-chars-min

What You Get:
✓ Access to /admin/moderation
✓ Access to /admin/photo-verification
✓ Access to /admin/promos
✓ Access to /admin dashboard
```

---

### 🟢 OPTIONAL (For Full Testing)

#### 7. **Sentry (Error Monitoring)**
```
What: Error tracking and monitoring
Priority: 🟢 OPTIONAL
Setup: 5 minutes
Cost: FREE for small projects

Steps:
□ Go to https://sentry.io
□ Create account
□ Create project for Next.js
□ Copy: SENTRY_DSN
□ (Optional for local testing)

What You Get:
✓ Error tracking
✓ Performance monitoring
✓ Alert notifications
```

---

## 📋 ENVIRONMENT VARIABLES (.env.local)

Create file: `ProviderPost/.env.local`

```env
# ========== REQUIRED ==========

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Payment (NowPayments)
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_SANDBOX=true
NOWPAYMENTS_IPN_SECRET=...

# Email (Resend)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Storage (Cloudflare R2)
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=providerpost
CLOUDFLARE_R2_PUBLIC_URL=https://photos.yourdomain.com

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=testpass123
ADMIN_TOKEN_SECRET=your-secret-key-here-min-32-characters

# Cron Jobs
CRON_SECRET=your-cron-secret-key

# ========== OPTIONAL ==========

# Cache (Upstash Redis)
REDIS_URL=redis://...

# Monitoring (Sentry)
SENTRY_DSN=
```

---

## 🚀 STEP-BY-STEP SETUP (1 HOUR TOTAL)

### Step 1: Create Supabase Project (10 min)
```bash
1. Go to https://supabase.com
2. Click "New Project"
3. Name: ProviderPost
4. Choose region near you
5. Set database password
6. Wait for creation (2-3 min)
7. Copy Project URL and Keys
8. Add to .env.local
```

### Step 2: Create NowPayments Account (5 min)
```bash
1. Go to https://nowpayments.io
2. Sign up
3. Verify email
4. Enable sandbox mode
5. Copy API key
6. Copy IPN secret
7. Add to .env.local
```

### Step 3: Create Resend Account (5 min)
```bash
1. Go to https://resend.com
2. Sign up
3. Copy API key
4. Add to .env.local
```

### Step 4: Create Cloudflare R2 Bucket (10 min)
```bash
1. Go to https://dash.cloudflare.com
2. R2 > Create Bucket
3. Name: providerpost
4. Copy credentials
5. Add to .env.local
```

### Step 5: Setup Database (15 min)
```bash
cd ProviderPost

# Option A: CLI (recommended)
npm install -g @supabase/cli
supabase login
supabase link --project-ref [project-id]
supabase db push

# Option B: Manual
# Copy each .sql file from supabase/migrations/ 
# Paste into Supabase SQL Editor and run
```

### Step 6: Start Development Server (5 min)
```bash
npm install
npm run dev

# Should see:
# ▲ Next.js 14.x
# - Local: http://localhost:3000
```

### Step 7: Test Everything (10 min)
```bash
# In browser:
# 1. Go to http://localhost:3000
# 2. Register test account
# 3. Check email (in Resend dashboard)
# 4. Login
# 5. Post test ad
# 6. Upload photo
# 7. Go through checkout
# 8. Check moderation dashboard
```

---

## ✅ VERIFICATION CHECKLIST

### Server Running?
```bash
curl http://localhost:3000
# Should return HTML page
```

### Database Connected?
```bash
# In browser: Go to /api/auth/me
# Should return { user: null } or user object
```

### Email Working?
```bash
# Create account
# Check Resend dashboard
# Should see welcome email
```

### Storage Working?
```bash
# Upload photo
# Check Cloudflare R2 dashboard
# Should see .jpg file
```

### Payment Ready?
```bash
# Go to checkout
# Should see payment form
# Can process test transactions
```

---

## 🔧 QUICK REFERENCE - WHERE TO GET EACH CREDENTIAL

| Service | What You Need | Where to Find |
|---------|---------------|---------------|
| Supabase | NEXT_PUBLIC_SUPABASE_URL | Settings > API > Project URL |
| Supabase | NEXT_PUBLIC_SUPABASE_ANON_KEY | Settings > API > Anon Key |
| Supabase | SUPABASE_SERVICE_ROLE_KEY | Settings > API > Service Role Key |
| NowPayments | NOWPAYMENTS_API_KEY | Settings > API Settings |
| NowPayments | NOWPAYMENTS_IPN_SECRET | Settings > API Settings |
| Resend | RESEND_API_KEY | API Keys tab |
| R2 | CLOUDFLARE_R2_ACCESS_KEY_ID | R2 > Settings > API Tokens |
| R2 | CLOUDFLARE_R2_SECRET_ACCESS_KEY | R2 > Settings > API Tokens |
| R2 | CLOUDFLARE_R2_ENDPOINT | R2 > Settings > Bucket Details |

---

## 🚨 COMMON ISSUES & QUICK FIXES

### "Cannot connect to database"
```bash
# Fix:
1. Check NEXT_PUBLIC_SUPABASE_URL is correct
2. Check SUPABASE_SERVICE_ROLE_KEY is correct
3. Restart npm run dev
```

### "Email not sending"
```bash
# Fix:
1. Check RESEND_API_KEY is set
2. Go to Resend dashboard
3. Look for error message
4. Check email is valid format
```

### "Photos not uploading"
```bash
# Fix:
1. Check CLOUDFLARE_R2_* vars
2. Check R2 bucket exists
3. Check CORS configured
4. Check file size < 100MB
```

### "Payment not working"
```bash
# Fix:
1. Check NOWPAYMENTS_SANDBOX=true
2. Check API key is correct
3. Check webhook URL is set
4. Try in incognito window
```

### "Admin can't login"
```bash
# Fix:
1. Check ADMIN_USERNAME and ADMIN_PASSWORD
2. Verify admin user exists in database
3. Check role = 'admin' in users table
```

---

## 📊 SUMMARY TABLE

| Service | Time | Cost | Must Have? | Status |
|---------|------|------|-----------|--------|
| Supabase | 15 min | FREE | ✅ YES | |
| NowPayments | 10 min | FREE | ✅ YES | |
| Resend | 10 min | FREE | ✅ YES | |
| Cloudflare R2 | 15 min | FREE | ✅ YES | |
| Upstash Redis | 5 min | FREE | ⚠️ Optional | |
| Admin Setup | 5 min | FREE | ✅ YES | |
| **TOTAL** | **60 min** | **FREE** | | |

---

## 🎯 FINAL CHECKLIST BEFORE TESTING

- [ ] Supabase project created + credentials in .env.local
- [ ] Database migrations run
- [ ] NowPayments account created + credentials in .env.local
- [ ] Resend account created + credentials in .env.local
- [ ] Cloudflare R2 bucket created + credentials in .env.local
- [ ] Admin user created in database
- [ ] .env.local file complete with all variables
- [ ] `npm install` completed
- [ ] `npm run dev` started successfully
- [ ] http://localhost:3000 loads in browser
- [ ] Can create test account
- [ ] Can receive welcome email

---

## 🎬 START HERE

1. **Open SERVER_TESTING_SETUP.md** for detailed guide
2. **Follow Step 1-7** above
3. **Test each service** using the verification checklist
4. **Start coding!**

