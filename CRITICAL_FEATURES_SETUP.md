# ProviderPost - 8 Critical Features Setup Guide

## 1. PHOTO UPLOAD API

### Prerequisites
```bash
npm install sharp @aws-sdk/client-s3
```

### Cloudflare R2 Setup
1. Go to: https://dash.cloudflare.com/
2. Navigate to R2 → Create Bucket
3. Bucket name: `providerpost`
4. Create R2 API Token:
   - Settings → API tokens
   - Create API token
   - Permissions: Object Read & Write
   - Zone Resources: All zones
   - TTL: 10 years
5. Copy to `.env.local`:
   ```
   CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
   CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
   CLOUDFLARE_R2_BUCKET_NAME=providerpost
   CLOUDFLARE_R2_PUBLIC_URL=https://photos.yourdomain.com
   ```
6. In Cloudflare R2 settings:
   - Set bucket to public (Anyone)
   - CORS: Allow GET, HEAD from https://yourdomain.com
   - Set up custom domain (optional)

### Database Migration
Run this in Supabase SQL editor:
```bash
# Copy contents of supabase/migrations/photo_upload_support.sql
# Paste into Supabase SQL editor
# Click "RUN"
```

### API Endpoints Created
- `POST /api/upload` - Upload photo
- `DELETE /api/upload/[photoId]` - Delete photo
- `PUT /api/providers/[id]/photos/reorder` - Reorder photos

### Usage Example
```javascript
// Upload photo
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url, photoId, width, height } = await response.json();

// Delete photo
await fetch(`/api/upload/${photoId}`, { method: 'DELETE' });

// Reorder photos
await fetch(`/api/providers/${providerId}/photos/reorder`, {
  method: 'PUT',
  body: JSON.stringify({ photoIds: ['id1', 'id2', 'id3'] }),
});
```

---

## 2. EMAIL SYSTEM (Next: Implement Resend)

### Resend Setup
1. Go to: https://resend.com/
2. Sign up / Login
3. Get API key from: Settings → API Keys
4. Copy to `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Emails to Implement
- [ ] Welcome email (signup)
- [ ] Ad submission confirmation
- [ ] Ad approval/rejection
- [ ] Payment receipt
- [ ] Renewal reminder (7 days before expiry)
- [ ] Renewal final notice (1 day before)
- [ ] Password reset
- [ ] Message notification

### Code Structure (Next Step)
```
lib/email.ts
├── sendWelcomeEmail()
├── sendAdSubmissionEmail()
├── sendAdApprovalEmail()
├── sendPaymentReceiptEmail()
├── sendRenewalReminderEmail()
└── sendPasswordResetEmail()

app/api/emails/
└── send/route.ts (internal API for sending)
```

---

## 3. EDIT ADS (Depends on: Photo Upload API)

### Endpoints to Create
- `PUT /api/providers/[id]` - Update ad details
- `GET /api/providers/[id]/edit` - Get edit form data

### Features
- [ ] Edit name, age, ethnicity
- [ ] Edit rates (quick visit, hourly, overnight)
- [ ] Edit description
- [ ] Reorder/add/remove photos
- [ ] Update availability
- [ ] Save changes
- [ ] Re-submit for moderation if major changes

### Database
Track edits in `ad_edits` table (created in photo migration)

---

## 4. MODERATION DASHBOARD (Depends on: Email System)

### Admin Page: `/admin/moderation`

Features:
- [ ] Queue of pending ads (sorted by date)
- [ ] Photo preview grid (6 thumbnail grid)
- [ ] Provider details
- [ ] Auto-rejection rules
- [ ] Approve/Reject buttons
- [ ] Add rejection reason
- [ ] Bulk actions
- [ ] Send rejection email

### Database
- `moderation_queue` table (created in photo migration)
- `photo_moderation_logs` table (audit trail)

---

## 5. AGE VERIFICATION (Depends on: Email System)

### Features
- [ ] Provider uploads ID photo
- [ ] Extracts ID number (OCR)
- [ ] Verifies age 18+
- [ ] Shows verified badge on profile
- [ ] Admin can manually verify/reject

### Implementation
Option A: Manual verification (admins review ID photos)
Option B: Third-party API (IDology, Veriff) - More expensive but automated

Start with Option A, add Option B later.

---

## 6. RENEWAL / AUTO-EXPIRY (Depends on: Email System)

### Cron Job: `/api/cron/renewal-check`

Schedule daily at 2:00 AM UTC:
```
0 2 * * * curl https://yourdomain.com/api/cron/renewal-check
```

Steps:
1. Find ads expiring in 7 days → Send email reminder
2. Find ads expiring in 1 day → Send final reminder
3. Find ads that expired yesterday → Hide from search
4. Find ads expired 30+ days → Archive

### Database
- `renewal_history` table
- `subscriptions` table (update expiry logic)

---

## 7. DUPLICATE PREVENTION (Standalone)

### Detection Methods

**1. Photo Hashing** (Already built into upload!)
```
- Hash every uploaded photo (SHA256)
- Reject if hash already exists
- Prevents stolen photos
```

**2. Phone Uniqueness**
```sql
-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT unique_phone UNIQUE(phone);
```

**3. IP Address Banning**
```
- Track IP on registration
- Block signup from banned IPs
- Track repeat offenders
```

**4. Payment Method Tracking**
```
- Log payment method (crypto wallet address)
- Reject if same wallet used for 3+ bans
```

### Implementation
- Phone: DB constraint
- IP: Middleware + ban table
- Payment: NowPayments webhook tracking
- Photo: Already in upload API

---

## 8. PAYMENT RETRY LOGIC (Standalone)

### Webhook Enhancement: `/api/payments/webhook`

Current: Marks as approved on first success

New: Implement retry queue:
```
Payment Failed
  ↓ (Next day)
Retry #1
  ↓ (If failed, next day)
Retry #2
  ↓ (If failed, next day)
Retry #3
  ↓ (If all failed)
Send "Payment Failed" email
Offer manual retry
```

### Database
- Add to `ipn_logs`: `retry_count`, `next_retry_at`, `status`
- Create `payment_retries` table

### Cron Job
```
Daily at 3:00 AM UTC:
- Find failed payments with retry < 3
- next_retry_at <= NOW()
- Call NowPayments to retry
- Log result
- Send email if all retries exhausted
```

---

## IMPLEMENTATION ORDER

**Week 1:**
- [x] Photo Upload API ← You are here
- [ ] Email System (Resend integration)
- [ ] Database migrations

**Week 2:**
- [ ] Edit Ads (PUT endpoint)
- [ ] Moderation Dashboard (Admin UI)
- [ ] Age Verification (Upload flow)

**Week 3:**
- [ ] Renewal/Auto-Expiry (Cron jobs)
- [ ] Payment Retry (Enhanced webhook)
- [ ] Duplicate Prevention (Query logic)

**Week 4:**
- [ ] Integration testing
- [ ] Load testing
- [ ] Documentation
- [ ] Launch!

---

## TESTING CHECKLIST

### Photo Upload
- [ ] Upload valid JPEG/PNG/WebP
- [ ] Reject oversized files (>5MB)
- [ ] Reject invalid formats
- [ ] Verify EXIF stripping
- [ ] Check photo URL is accessible
- [ ] Verify duplicate hash rejection
- [ ] Test delete photo
- [ ] Test reorder photos

### Email
- [ ] Test all email templates
- [ ] Check links work
- [ ] Verify branding/styling
- [ ] Test unsubscribe link

### Edit Ads
- [ ] Update all fields
- [ ] Verify ownership check
- [ ] Test photo reordering during edit
- [ ] Check re-moderation trigger

### Moderation
- [ ] Admin can view queue
- [ ] Approve ad
- [ ] Reject with reason
- [ ] Provider gets email
- [ ] Bulk actions work

### Age Verification
- [ ] Upload ID photo
- [ ] Admin reviews
- [ ] Badge shows on approved
- [ ] Rejection email sent

### Renewal
- [ ] Cron job runs
- [ ] Reminder emails sent
- [ ] Expired ads hidden
- [ ] Renewal link works

### Duplicate Prevention
- [ ] Hash duplicates rejected
- [ ] Banned IPs blocked
- [ ] Phone uniqueness enforced
- [ ] Payment method tracking

### Payment Retry
- [ ] Failed payment retries
- [ ] Email sent on final failure
- [ ] Subscription activated on success
- [ ] Retry count increments

---

## DEPLOYMENT

### Environment Variables (Set in Production)
```
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
REDIS_URL=
```

### Vercel Deployment
1. Push code to GitHub
2. Link GitHub to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!
5. Run database migrations in Supabase

### Supabase Migrations
In Supabase dashboard:
1. SQL Editor
2. Copy `supabase/migrations/photo_upload_support.sql`
3. Paste and RUN
4. Verify: Check `provider_images` columns

### Cron Jobs
Option 1 (Free): Use cron-job.org
```
- URL: https://yourdomain.com/api/cron/renewal-check
- Time: 02:00 UTC daily
- Method: GET
```

Option 2 (Better): Use Vercel Cron
```
// app/api/cron/renewal-check/route.ts
export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Run renewal check logic
  // ...
}

export const config = {
  regions: ['iad1'],
};
```

Then in Vercel dashboard:
- Settings → Cron Jobs
- Add: `/api/cron/renewal-check` at 02:00 UTC

---

## ESTIMATED COMPLETION

- Photo Upload: ✓ Code ready (needs npm install + R2 setup) = ~30 min setup
- Email System: ~4-6 hours
- Edit Ads: ~8-10 hours
- Moderation: ~12-16 hours
- Age Verification: ~10-12 hours
- Renewal: ~6-8 hours
- Duplicate Prevention: ~8-10 hours
- Payment Retry: ~4-6 hours

**Total remaining: ~52-68 hours**

Combined with upload setup: **120 hours total** ✓ Matches estimate!

---

## SUPPORT & DOCS

- Resend: https://resend.com/docs
- AWS SDK: https://docs.aws.amazon.com/sdk-for-javascript/
- Sharp: https://sharp.pixelplumbing.com/
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
