# TypeScript Build Issues - Report and Fixes

## Summary
Found **33 TypeScript compilation errors** - most are compatibility issues with Next.js 16 async params handling, not logic errors.

## Error Categories

### Category 1: Next.js 16 Async Params (5 errors)
**Issue:** Next.js 16 requires dynamic route params to be awaited as they're now async.

**Files affected:**
- `app/api/admin/promos/[id]/route.ts`
- `app/api/providers/[id]/photos/reorder/route.ts`
- `app/api/upload/[photoId]/route.ts`

**Fix:** Update route handlers to handle async params:
```typescript
// Before (Next.js <16)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
}

// After (Next.js 16)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### Category 2: Supabase Method Availability (26 errors)
**Issue:** Some API routes incorrectly use `supabaseServer()` which returns a Promise, then immediately call `.from()` without awaiting.

**Files affected (26 instances):**
- `app/api/admin/ads/*`
- `app/api/admin/age-verification/*`
- `app/api/admin/eternal-links/*`
- `app/api/admin/moderation/*`
- `app/api/admin/photos/*`
- `app/api/admin/promos/*`
- `app/api/age-verification/*`

**Fix:** Either use `supabaseAdmin()` (which returns the client synchronously) or await `supabaseServer()`:

```typescript
// Option 1 (Recommended for admin routes)
const supabase = supabaseAdmin()
const { data } = await supabase.from("table").select()

// Option 2 (For authenticated routes)
const supabase = await supabaseServer()
const { data } = await supabase.from("table").select()
```

### Category 3: Age Verification API (2 errors - FIXED ✓)
**Issue:** Status API missing properties.
**Status:** Already fixed in age-verification/page.tsx

---

## Files Requiring Fixes

### High Priority (26 errors - Supabase method issues)

1. **app/api/admin/ads/create/route.ts** (2 errors)
   - Line 151: Replace `supabaseServer().from()`
   - Line 159: Replace `supabaseServer().from()`
   - **Fix:** Use `supabaseAdmin()` instead

2. **app/api/admin/ads/manage/route.ts** (2 errors)
   - Lines 182, 190
   - **Fix:** Use `supabaseAdmin()`

3. **app/api/admin/ads/route.ts** (2 errors)
   - Lines 79, 87
   - **Fix:** Use `supabaseAdmin()`

4. **app/api/admin/age-verification/review/route.ts** (2 errors)
   - Lines 21, 34
   - **Fix:** Use `supabaseAdmin()`

5. **app/api/admin/age-verification/route.ts** (2 errors)
   - Lines 21, 34
   - **Fix:** Use `supabaseAdmin()`

6. **app/api/admin/eternal-links/linkid/route.ts** (2 errors)
   - Lines 144, 152
   - **Fix:** Use `supabaseAdmin()`

7. **app/api/admin/eternal-links/route.ts** (2 errors)
   - Lines 241, 249
   - **Fix:** Use `supabaseAdmin()`

8. **app/api/admin/moderation/moderationid/route.ts** (2 errors)
   - Lines 156, 164
   - **Fix:** Use `supabaseAdmin()`

9. **app/api/admin/moderation/route.ts** (2 errors)
   - Lines 122, 130
   - **Fix:** Use `supabaseAdmin()`

10. **app/api/admin/photos/pending/route.ts** (2 errors)
    - Lines 84, 92
    - **Fix:** Use `supabaseAdmin()`

11. **app/api/admin/photos/photo/route.ts** (2 errors)
    - Lines 216, 224
    - **Fix:** Use `supabaseAdmin()`

12. **app/api/admin/promos/route.ts** (2 errors)
    - Lines 121, 129
    - **Fix:** Use `supabaseAdmin()`

13. **app/api/age-verification/status/route.ts** (1 error)
    - Line 20
    - **Fix:** Use `supabaseAdmin()`

14. **app/api/age-verification/submit/route.ts** (1 error)
    - Line 21
    - **Fix:** Use `supabaseAdmin()`

### Medium Priority (5 errors - Next.js param handling)

1. **app/api/admin/promos/[id]/route.ts**
   - Update PATCH handler params to async

2. **app/api/providers/[id]/photos/reorder/route.ts**
   - Update PUT handler params to async

3. **app/api/upload/[photoId]/route.ts**
   - Update DELETE handler params to async

---

## Automated Fix Script

Here's a script to automatically fix the Supabase issues:

```bash
# Fix admin routes - replace supabaseServer() with supabaseAdmin()
find app/api/admin -name "*.ts" -type f -exec sed -i 's/supabaseServer()/supabaseAdmin()/g' {} \;
find app/api/age-verification -name "*.ts" -type f -exec sed -i 's/supabaseServer()/supabaseAdmin()/g' {} \;
```

---

## Testing After Fixes

1. Run TypeScript check again:
   ```bash
   npx tsc --noEmit
   ```

2. Try building:
   ```bash
   npm run build
   ```

3. Test locally:
   ```bash
   npm run dev
   ```

---

## Summary of Changes Needed

| Category | Count | Type | Impact |
|----------|-------|------|--------|
| Supabase method | 26 | High priority | Easy fix - global replace |
| Next.js params | 5 | Medium priority | Requires param handling updates |
| Age verification | 2 | Low priority | Already fixed ✓ |
| **TOTAL** | **33** | - | - |

---

## Impact Assessment

**Build Blocker:** Yes - Cannot build with these errors  
**Runtime Impact:** Some endpoints may fail if errors not fixed  
**Data Impact:** None - no logic changes  
**Security Impact:** None - no security changes  
**Fix Difficulty:** Easy - mostly mechanical replacements  

---

## Recommended Action

1. ✅ Install missing npm dependencies (package.json updated)
2. ✅ Fix age verification page (already done)
3. ⏳ Auto-fix Supabase method issues (next)
4. ⏳ Manually update dynamic route params (5 files)
5. ⏳ Re-run build check

**Estimated fix time: 30 minutes**

