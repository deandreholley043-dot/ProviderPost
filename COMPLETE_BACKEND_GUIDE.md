# COMPLETE BACKEND GUIDE

## Overview

The backend is built with Next.js API routes and follows a modular, production-ready architecture. All features are isolated and do not interfere with the frontend.

---

## Backend Structure

```
lib/backend/
├── validation.ts       - Input validation utilities
├── errors.ts          - Custom error classes
├── middleware.ts      - Authentication & authorization
├── db-helpers.ts      - Database query helpers
├── utils.ts           - General utility functions
├── response.ts        - API response formatters
└── constants.ts       - Shared constants

app/api/
├── auth/              - Authentication endpoints
├── providers/         - Ad management endpoints
├── uploads/           - File upload endpoints
├── payments/          - Payment processing
├── admin/             - Admin-only endpoints
├── eternal-links/     - Archive endpoints
└── ...                - Feature-specific endpoints
```

---

## Key Components

### 1. Validation (`lib/backend/validation.ts`)

Input validation for all API routes:

```typescript
// Email validation
validateEmail("user@example.com")

// Phone validation
validatePhone("+1 555 1234567")

// Ad data validation
validateAdData({ name: "...", description: "..." })

// Price validation
validatePrice(150)

// Age validation
validateAge(24)
```

### 2. Error Handling (`lib/backend/errors.ts`)

Consistent error handling across all endpoints:

```typescript
// Throw specific errors
throw new ValidationError("Invalid input", { field: "error" })
throw new AuthenticationError("Invalid credentials")
throw new AuthorizationError("Access denied")
throw new NotFoundError("Advertisement")
throw new ConflictError("Email already registered")
throw new RateLimitError(60)
```

### 3. Middleware (`lib/backend/middleware.ts`)

Authentication and authorization:

```typescript
// Verify user session
const user = await verifyUserSession(request)

// Verify admin session
const admin = await verifyAdminSession(request)

// Rate limiting
await checkRateLimit(identifier, limit, windowMs)

// IP blocking
await verifyIPAllowed(ipAddress)
```

### 4. Database Helpers (`lib/backend/db-helpers.ts`)

Common database operations:

```typescript
// User operations
const user = await getUserById(userId)
const user = await getUserByEmail(email)

// Ad operations
const ad = await getAdById(adId)
const ads = await getUserAds(userId)
const { ads, count } = await getActiveAds(limit, offset)

// Session operations
const session = await getSessionByToken(token)

// Subscription operations
const subscription = await getActiveSubscription(userId)

// Audit logging
await logAuditEvent(adminId, action, resourceType, resourceId)
```

### 5. Utilities (`lib/backend/utils.ts`)

General utility functions:

```typescript
// Security
const token = generateSecureToken(32)
const hash = await hashPassword(password)
const match = await comparePassword(password, hash)

// Formatting
const slug = generateSlug(text)
const currency = formatCurrency(amount)
const truncated = truncateText(text, maxLength)

// Calculations
const distance = calculateDistance(lat1, lon1, lat2, lon2)
const timeUntilExp = getTimeUntilExpiration(expiresAt)
```

### 6. Response Formatting (`lib/backend/response.ts`)

Consistent API responses:

```typescript
// Success
successResponse(data, 200, "Success message")

// Created
createdResponse(data, "Created successfully")

// Updated
updatedResponse(data)

// Deleted
deletedResponse()

// Paginated
paginatedResponse(items, total, page, pageSize)

// Errors
errorResponse("Error message", 400, "ERROR_CODE")
unauthorizedResponse()
forbiddenResponse()
notFoundResponse("Resource")
serverErrorResponse()
rateLimitResponse(60)
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
GET    /api/auth/me                - Get current user
POST   /api/auth/verify-email      - Verify email
POST   /api/auth/reset-password    - Reset password
```

### Advertisements
```
POST   /api/providers              - Create ad
GET    /api/providers              - List ads
GET    /api/providers/[id]         - Get ad
PUT    /api/providers/[id]         - Update ad
DELETE /api/providers/[id]         - Delete ad
GET    /api/providers/[id]/photos  - Get ad photos
POST   /api/providers/[id]/photos  - Add photo
DELETE /api/providers/[id]/photos/[photoId] - Remove photo
```

### Uploads
```
POST   /api/upload                 - Upload file
DELETE /api/upload/[id]            - Delete file
POST   /api/upload/[id]/verify     - Verify upload
```

### Payments
```
POST   /api/payments/create        - Create payment
POST   /api/payments/webhook       - Payment webhook
GET    /api/payments/status        - Payment status
```

### Search & Browse
```
GET    /api/browse                 - Browse ads
GET    /api/search                 - Search ads
GET    /api/categories             - Get categories
GET    /api/filters                - Get filter options
```

### User Features
```
GET    /api/favorites              - Get favorites
POST   /api/favorites              - Add favorite
DELETE /api/favorites/[id]         - Remove favorite

GET    /api/messages               - Get messages
POST   /api/messages               - Send message

GET    /api/reviews                - Get reviews
POST   /api/reviews                - Create review

GET    /api/subscriptions          - Get subscriptions
POST   /api/subscriptions          - Renew subscription
```

### Admin
```
GET    /api/admin/ads              - List all ads
GET    /api/admin/moderation       - Moderation queue
PUT    /api/admin/moderation/[id]  - Approve/reject ad
GET    /api/admin/users            - List users
GET    /api/admin/bans             - List bans
POST   /api/admin/bans             - Create ban
DELETE /api/admin/bans/[id]        - Remove ban

GET    /api/admin/analytics        - Analytics
GET    /api/admin/logs             - Audit logs
```

### Eternal Links
```
POST   /api/admin/eternal-links              - Create archive
GET    /api/admin/eternal-links              - List archives
PUT    /api/admin/eternal-links/[id]        - Update archive
DELETE /api/admin/eternal-links/[id]        - Delete archive
GET    /api/eternal-links/[code]            - View archived ad
POST   /api/eternal-links/[code]/view       - Track view
```

### Admin Ad Posting
```
POST   /api/admin/ads/create                - Create admin ad
GET    /api/admin/ads                       - List admin ads
PUT    /api/admin/ads/manage                - Update admin ad
DELETE /api/admin/ads/manage                - Delete admin ad
```

---

## Request/Response Examples

### Create Ad
```
POST /api/providers
Content-Type: application/json
Authorization: Bearer [session-token]

{
  "name": "Female Provider, 24",
  "email": "provider@example.com",
  "phone": "+1 555 1234567",
  "age": 24,
  "city": "Los Angeles",
  "state": "CA",
  "description": "Available now...",
  "rates_per_hour": 150,
  "category": "escort"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Female Provider, 24",
    "created_at": "2025-06-02T10:00:00Z",
    ...
  },
  "meta": {
    "timestamp": "2025-06-02T10:00:00Z"
  }
}
```

### Error Response
```
{
  "success": false,
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "meta": {
    "timestamp": "2025-06-02T10:00:00Z"
  }
}
```

### Paginated Response
```
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "2025-06-02T10:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

---

## Error Handling

All errors follow a consistent pattern:

```typescript
// Validation Error (400)
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR"
}

// Authentication Error (401)
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTHENTICATION_ERROR"
}

// Authorization Error (403)
{
  "success": false,
  "error": "Access denied",
  "code": "AUTHORIZATION_ERROR"
}

// Not Found Error (404)
{
  "success": false,
  "error": "Advertisement not found",
  "code": "NOT_FOUND"
}

// Rate Limit Error (429)
{
  "success": false,
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}

// Server Error (500)
{
  "success": false,
  "error": "Internal server error",
  "code": "SERVER_ERROR"
}
```

---

## Security Features

### Authentication
- Session-based authentication with HttpOnly cookies
- Secure token generation
- Password hashing with bcrypt (12 rounds)
- Email verification
- Password reset flow

### Authorization
- Role-based access control (user, admin)
- Admin-only endpoints protected
- User-specific resource access control

### Input Validation
- Email validation
- Phone validation
- Password strength validation
- Ad data validation
- Price/age validation

### Rate Limiting
- 10 requests per minute per user (configurable)
- IP-based rate limiting
- Graceful rate limit responses

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Data Protection
- SQL injection prevention (Supabase parameterized queries)
- XSS prevention (HTML escaping)
- CSRF protection (session-based)
- IP blocking (ban system)

---

## Best Practices

### 1. Always Validate Input
```typescript
const validation = validateAdData(body)
if (!validation.valid) {
  return validationErrorResponse(validation.errors)
}
```

### 2. Use Database Helpers
```typescript
// Good
const ad = await getAdById(adId)

// Avoid
const { data } = await supabase.from("providers").select("*").eq("id", adId).single()
```

### 3. Handle Errors Properly
```typescript
try {
  // operation
} catch (error) {
  if (error instanceof ValidationError) {
    return validationErrorResponse(error.fields)
  }
  return serverErrorResponse(error.message)
}
```

### 4. Use Response Formatters
```typescript
// Good
return successResponse(data, 200, "Created successfully")

// Avoid
return Response.json({ data, success: true })
```

### 5. Log Important Actions
```typescript
await logAuditEvent(adminId, "deleted", "ad", adId, { reason: "spam" })
```

---

## Testing

### Integration Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test ad creation
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -b "pp_session=[token]" \
  -d '{"name":"Test","email":"test@example.com",...}'

# Test error handling
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
```

---

## Monitoring

### Logs to Watch
```
[timestamp] POST /api/providers [User: user-id]
[timestamp] PUT /api/admin/moderation/ad-id [User: admin-id]
[timestamp] Error: ValidationError - Invalid email
```

### Metrics to Track
- Request count by endpoint
- Error rate
- Average response time
- Rate limit hits
- Failed login attempts
- Admin actions

---

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=...
CRON_SECRET=...
```

### Pre-deployment Checklist
- [ ] All endpoints tested
- [ ] Error handling working
- [ ] Rate limiting configured
- [ ] Security headers in place
- [ ] Validation rules strict
- [ ] Logging enabled
- [ ] Environment variables set
- [ ] Database migrations run

---

## Summary

The complete backend provides:
- ✅ All API endpoints
- ✅ Input validation
- ✅ Error handling
- ✅ Authentication
- ✅ Authorization
- ✅ Rate limiting
- ✅ Audit logging
- ✅ Response formatting
- ✅ Security
- ✅ Database helpers
- ✅ Production ready

All features are isolated and don't interfere with the frontend.

