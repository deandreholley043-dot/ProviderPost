# REMAINING FEATURES - COMPLETE BUILD GUIDE

## ✅ EMAIL SYSTEM (COMPLETE)

**Files Created:**
- `lib/email/templates.ts` - All email templates (welcome, ad approval, payment, renewal, etc.)
- `lib/email/send.ts` - Resend integration with functions for each email type

**Usage:**
```typescript
import { sendWelcomeEmail, sendAdApprovedEmail } from "@/lib/email/send"

// Send welcome email
await sendWelcomeEmail("user@example.com", "John")

// Send ad approved
await sendAdApprovedEmail(
  "user@example.com",
  "John",
  "My Service",
  "https://providerpost.com/providers/123"
)
```

**Already Built Emails:**
- ✅ Welcome email
- ✅ Ad submission confirmation
- ✅ Ad approved
- ✅ Ad rejected
- ✅ Payment receipt
- ✅ Renewal reminder (7 days)
- ✅ Renewal final notice (1 day)
- ✅ Password reset
- ✅ Photo rejection
- ✅ Verification success

---

## ⏳ REMAINING 7 FEATURES (Build Order by Dependency)

### 1. EDIT ADS (12 hours)

**What it does:**
- Providers edit existing ads
- Change rates, description, photos, availability
- Re-submit for moderation if major changes

**Database Changes:**
```sql
-- Add to providers table
ALTER TABLE providers ADD COLUMN (
  last_edited_at TIMESTAMP,
  edit_count INT DEFAULT 0
);

-- Create ad_edits table for tracking
CREATE TABLE ad_edits (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES providers(id),
  old_data JSONB,
  new_data JSONB,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints to Create:**
```
PUT /api/providers/[id] - Update ad
GET /api/providers/[id]/edit - Get edit form data
GET /api/providers/[id]/edit-history - View all edits
```

**Implementation:**
1. Create `PUT /api/providers/[id]` endpoint
   - Validate ownership (auth check)
   - Check for major changes (photos, rates, name)
   - Log in `ad_edits` table
   - If major: set moderation_status = "pending"
   - Send email: "Your ad has been updated and is awaiting review"

2. Update checkout page to support edit mode
   - Add `?edit=providerId` parameter
   - Pre-fill form with existing data
   - Show "Update Ad" instead of "Create Ad"

3. Add edit button to provider dashboard
   - Show last edited date
   - Show edit count
   - Allow viewing edit history

---

### 2. MODERATION DASHBOARD (24 hours)

**What it does:**
- Admins review and approve/reject ads
- Manual review queue for pending ads
- Approve photo + ad at once
- Send rejection emails

**Database Changes:**
```sql
-- Already have: moderation_status, flagged_for_moderation

-- Create moderation queue
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES providers(id),
  ad_id UUID REFERENCES providers(id),
  priority INT DEFAULT 0,
  reason VARCHAR(255),
  auto_rejected BOOLEAN,
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  decision VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Page:** `/admin/moderation`

**Features:**
- Queue of pending ads (sorted by date)
- Preview ad with all photos
- Provider details
- Approve/Reject buttons
- Bulk actions
- Search & filter

**Implementation:**
1. Create admin page showing moderation queue
2. Display: Provider info, ad details, photos (6 grid)
3. Approve button → Set moderation_status = "approved", send email
4. Reject button → Set moderation_status = "rejected", send email with reason

---

### 3. AGE VERIFICATION (16 hours)

**What it does:**
- Providers upload ID photo
- Admin verifies they're 18+
- Shows "Verified" badge on profile

**Database Changes:**
```sql
CREATE TABLE verifications (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES providers(id),
  type VARCHAR(50), -- 'id_photo', 'selfie', etc.
  document_url VARCHAR(255),
  verified BOOLEAN,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE providers ADD COLUMN (
  verified_at TIMESTAMP,
  verification_type VARCHAR(50)
);
```

**Implementation:**
1. Create `/verify-age` page in signup flow
   - Upload ID photo
   - Save to R2
   - Set verification status to "pending"

2. Create admin verification page at `/admin/verifications`
   - Queue of pending verifications
   - Preview ID photo
   - Approve/Reject buttons
   - Send verification success email

3. Show verified badge on profile if verified_at exists

---

### 4. RENEWAL / AUTO-EXPIRY (8 hours)

**What it does:**
- Hide ads when subscription expires
- Send reminder emails (7 days, 1 day)
- Archive old ads

**Cron Job:** `/api/cron/renewal-check`

**Implementation:**
```typescript
// Daily 2 AM UTC:

// 1. Find ads expiring in 7 days
const expiring7Days = await supabase
  .from("subscriptions")
  .select("provider_id, expires_at")
  .lte("expires_at", new Date(Date.now() + 7*24*60*60*1000))
  .gt("expires_at", new Date())

for (const sub of expiring7Days) {
  const provider = await getProvider(sub.provider_id)
  await sendRenewalReminderEmail(
    provider.email,
    provider.name,
    sub.expires_at.toDateString(),
    "https://providerpost.com/checkout"
  )
}

// 2. Find ads expiring in 1 day (same logic)
// 3. Find ads expired yesterday -> hide (set active = false)
// 4. Find ads expired 30+ days -> archive
```

**Vercel Cron Setup:**
```typescript
// app/api/cron/renewal-check/route.ts
export async function GET(request: Request) {
  if (request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  // Run renewal logic here
  
  return Response.json({ ok: true })
}

// In vercel.json:
{
  "crons": [{
    "path": "/api/cron/renewal-check",
    "schedule": "0 2 * * *"
  }]
}
```

---

### 5. DUPLICATE PREVENTION (20 hours)

**What it does:**
- Prevent duplicate accounts (same phone, IP, payment method)
- Detect duplicate photos via hash (already built!)
- Block banned IPs

**Database Changes:**
```sql
-- Already have: hash in provider_images

CREATE TABLE user_ips (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE banned_ips (
  id UUID PRIMARY KEY,
  ip_address VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP
);

CREATE TABLE duplicate_accounts (
  id UUID PRIMARY KEY,
  user_1 UUID REFERENCES users(id),
  user_2 UUID REFERENCES users(id),
  reason VARCHAR(100), -- 'same_phone', 'same_ip', 'same_payment'
  merged_to UUID,
  created_at TIMESTAMP
);
```

**Implementation:**
1. On signup: Capture IP, check if banned
2. On first ad: Check for duplicate photos (hash matching)
3. On payment: Log payment method (crypto wallet)
4. On profile update: Check phone uniqueness
5. Admin dashboard to view suspected duplicates and merge accounts

---

### 6. PAYMENT RETRY LOGIC (8 hours)

**What it does:**
- Retry failed payments up to 3 times
- Send failure notifications
- Allow manual retry

**Database Changes:**
```sql
ALTER TABLE ipn_logs ADD COLUMN (
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' -- pending, success, failed, cancelled
);

CREATE TABLE payment_retries (
  id UUID PRIMARY KEY,
  subscription_id UUID,
  payment_id VARCHAR(255),
  attempt_number INT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP
);
```

**Implementation:**
1. On payment failure: Log to ipn_logs with status = "failed", next_retry_at = tomorrow
2. Daily cron job: Find payments with retry_count < 3, retry via NowPayments
3. On retry success: Activate subscription, send success email
4. On retry failure (3 attempts): Send "Payment Failed" email with manual retry link
5. Allow provider to manually trigger retry on dashboard

---

### 7. COMPLETE MODERATION WORKFLOW

**Full Workflow:**

```
Provider submits ad with photos
  ↓
1. Photos uploaded (moderation_status = "pending")
2. Ad created (moderation_status = "pending")
3. Send confirmation email
  ↓
Admin goes to /admin/photo-verification
  ↓
Admin reviews photos:
  - Approve all 6 photos
  - Reject 2, ask for new ones
  - Flag 1 for later review
  ↓
If all approved:
  - Ad moderation_status = "approved"
  - Send ad approved email
  - Show in search results
  ↓
If any rejected:
  - Ad stays pending
  - Send rejection email with reasons
  - Provider uploads new photos
  - Ad goes back to review queue
```

---

## 📋 DATABASE MIGRATIONS NEEDED

Copy these to Supabase SQL Editor:

**Edit Ads:**
```sql
ALTER TABLE providers ADD COLUMN last_edited_at TIMESTAMP;
CREATE TABLE ad_edits (...); -- see above
```

**Moderation:**
```sql
CREATE TABLE moderation_queue (...); -- see above
```

**Verification:**
```sql
CREATE TABLE verifications (...); -- see above
ALTER TABLE providers ADD COLUMN verified_at, verification_type;
```

**Renewal:**
- No new tables (uses subscriptions.expires_at)

**Duplicate Prevention:**
```sql
CREATE TABLE user_ips (...);
CREATE TABLE banned_ips (...);
CREATE TABLE duplicate_accounts (...);
```

**Payment Retry:**
```sql
ALTER TABLE ipn_logs ADD COLUMN retry_count, next_retry_at, status;
CREATE TABLE payment_retries (...);
```

---

## 🚀 IMPLEMENTATION PRIORITY

**MUST DO FIRST (Blocking Launch):**
1. ✅ Email System (done)
2. Edit Ads
3. Moderation Dashboard
4. Age Verification
5. Renewal/Auto-Expiry

**SHOULD DO (Pre-Launch):**
6. Duplicate Prevention
7. Payment Retry

**NICE TO HAVE (Post-Launch):**
- Analytics dashboard
- Recommendation algorithm
- Advanced search

---

## 📝 SUMMARY TABLE

| Feature | Time | DB | APIs | UI | Notes |
|---------|------|----|----|----|----|
| Edit Ads | 12h | ✓ | 3 | ✓ | Update form + history |
| Moderation | 24h | ✓ | 2 | ✓ | Admin queue + approval |
| Age Verification | 16h | ✓ | 2 | ✓ | ID upload + badge |
| Renewal | 8h | - | 1 cron | - | Email reminders + hide |
| Duplicates | 20h | ✓ | 3 | ✓ | Merge accounts |
| Payment Retry | 8h | ✓ | 1 cron | - | Email on failure |

**Total: 88 hours** (down from 120h with email done)

---

## 🎯 NEXT IMMEDIATE STEPS

1. Run Email System:
   - Set `RESEND_API_KEY` in .env
   - Test: `await sendWelcomeEmail("test@example.com", "Test")`

2. Start Edit Ads:
   - Create migration
   - Build PUT /api/providers/[id]
   - Add edit button to dashboard

3. Start Moderation in parallel:
   - Create admin page
   - Wire up photo approval

---

## ✨ EMAIL INTEGRATION CHECKLIST

Add these calls to existing code:

```typescript
// In signup
await sendWelcomeEmail(email, name)

// In ad submission
await sendAdSubmissionEmail(email, providerName, adTitle)

// In photo approval
await sendAdApprovedEmail(email, name, adTitle, adUrl)

// In photo rejection
await sendPhotoRejectionEmail(email, name, adTitle, 3, "Low quality")

// In payment success
await sendPaymentReceiptEmail(email, name, planName, amount, "USD", expiryDate)

// In payment failure
// (manual trigger or add to payment webhook)
```

---

**Ready to build? Start with Edit Ads. It's the quickest and unblocks the post form updates.**

