# ProviderPost - Dynamic Pricing System

## 📊 Overview

Complete dynamic pricing system with:
- ✅ Regional pricing tiers
- ✅ Subscription plans
- ✅ Admin pricing control panel
- ✅ Real-time pricing updates
- ✅ Rate history & analytics
- ✅ Currency conversion
- ✅ Bulk pricing rules
- ✅ Promotional pricing

---

## 🗄️ Database Schema

### Table 1: Pricing Tiers
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  listing_limit INTEGER,
  photo_limit INTEGER,
  duration_days INTEGER,
  base_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data:
-- Tier 1: "Free" - 1 listing, 5 photos, 30 days, $0
-- Tier 2: "Basic" - 5 listings, 25 photos, 30 days, $9.99
-- Tier 3: "Pro" - 20 listings, 100 photos, 30 days, $29.99
-- Tier 4: "Premium" - Unlimited, Unlimited, 30 days, $99.99
```

### Table 2: Regional Pricing
```sql
CREATE TABLE regional_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES pricing_tiers(id),
  region VARCHAR(50), -- US, CA, UK, AU, EU, ASIA
  country_code VARCHAR(2),
  multiplier DECIMAL(3,2), -- 0.8 = 20% discount, 1.2 = 20% increase
  local_price DECIMAL(10,2),
  currency VARCHAR(3), -- USD, CAD, GBP, AUD, EUR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Examples:
-- US tier: 1.0x (baseline)
-- Canada: 1.13x (CAD higher)
-- UK: 0.85x (GBP conversion)
-- Australia: 1.15x (cost of living)
-- India: 0.3x (purchasing power)
```

### Table 3: Subscription Plans
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  billing_cycle VARCHAR(20), -- monthly, quarterly, annual
  base_price DECIMAL(10,2),
  discount_percent INTEGER, -- 0 for monthly, 10 for quarterly, 20 for annual
  features JSONB, -- feature list
  is_popular BOOLEAN,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Data:
-- 1 Month: $39.99, 0% discount
-- 3 Months: $99.99, 16% discount ($33.33/month)
-- 6 Months: $179.99, 25% discount ($29.99/month)
-- 12 Months: $299.99, 38% discount ($24.99/month)
```

### Table 4: User Subscriptions
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tier_id UUID REFERENCES pricing_tiers(id),
  plan_id UUID REFERENCES subscription_plans(id),
  price_paid DECIMAL(10,2),
  region VARCHAR(50),
  currency VARCHAR(3),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  status VARCHAR(20), -- active, expired, cancelled
  payment_method VARCHAR(20), -- card, crypto
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table 5: Pricing History & Analytics
```sql
CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES pricing_tiers(id),
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  change_reason VARCHAR(255),
  effective_date TIMESTAMP,
  changed_by UUID, -- admin user
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pricing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE,
  region VARCHAR(50),
  tier_id UUID,
  conversions INTEGER, -- purchases
  impressions INTEGER, -- views
  revenue DECIMAL(12,2),
  avg_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table 6: Promo & Bulk Pricing Rules
```sql
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100),
  rule_type VARCHAR(50), -- promo_code, bulk_purchase, loyalty, seasonal
  tier_id UUID REFERENCES pricing_tiers(id),
  discount_type VARCHAR(20), -- percentage, fixed, tiered
  discount_value DECIMAL(10,2),
  min_quantity INTEGER,
  max_quantity INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Examples:
-- Spring Sale: 20% off all tiers (percentage)
-- Buy 6 months: $50 off (fixed)
-- Loyalty: Extra 5% for annual subscribers (tiered)
-- Seasonal holiday: 15% off (percentage)
```

---

## 🔌 API Endpoints

### Get Pricing (Public)
```
GET /api/pricing/tiers
GET /api/pricing/tiers/[region]
GET /api/pricing/plans
GET /api/pricing/current-price?tier=[id]&region=[region]

Response:
{
  "tiers": [
    {
      "id": "uuid",
      "name": "Basic",
      "basePrice": 9.99,
      "listingLimit": 5,
      "photoLimit": 25,
      "duration_days": 30,
      "regionalPrice": {
        "USD": 9.99,
        "CAD": 11.29,
        "GBP": 8.49,
        "AUD": 11.49
      }
    }
  ]
}
```

### Admin Pricing Management
```
POST /api/admin/pricing/tiers
PATCH /api/admin/pricing/tiers/[id]
DELETE /api/admin/pricing/tiers/[id]

POST /api/admin/pricing/regional
PATCH /api/admin/pricing/regional/[id]
DELETE /api/admin/pricing/regional/[id]

POST /api/admin/pricing/plans
PATCH /api/admin/pricing/plans/[id]
DELETE /api/admin/pricing/plans/[id]

POST /api/admin/pricing/rules
PATCH /api/admin/pricing/rules/[id]
DELETE /api/admin/pricing/rules/[id]

GET /api/admin/pricing/analytics
GET /api/admin/pricing/history
```

### Apply Pricing
```
POST /api/pricing/calculate
Body:
{
  "tierId": "uuid",
  "region": "US",
  "billingCycle": "monthly",
  "promoCode": "SAVE20"
}

Response:
{
  "basePrice": 9.99,
  "regionalMultiplier": 1.0,
  "regionalPrice": 9.99,
  "discountPercent": 20,
  "discountAmount": 2.00,
  "finalPrice": 7.99,
  "currency": "USD",
  "breakdown": {
    "base": 9.99,
    "regional": 0,
    "promo": -2.00,
    "total": 7.99
  }
}
```

---

## 💻 Frontend Components

### Pricing Display Page
```typescript
// app/pricing/page.tsx

export default function PricingPage() {
  const [region, setRegion] = useState<string>('US');
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');

  useEffect(() => {
    fetch(`/api/pricing/tiers/${region}`)
      .then(r => r.json())
      .then(data => setTiers(data.tiers));
  }, [region]);

  return (
    <div className="pricing-container">
      {/* Region Selector */}
      <div className="region-selector">
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="US">🇺🇸 United States (USD)</option>
          <option value="CA">🇨🇦 Canada (CAD)</option>
          <option value="UK">🇬🇧 United Kingdom (GBP)</option>
          <option value="AU">🇦🇺 Australia (AUD)</option>
          <option value="EU">🇪🇺 Europe (EUR)</option>
        </select>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="tiers-grid">
        {tiers.map(tier => (
          <PricingCard
            key={tier.id}
            tier={tier}
            region={region}
            isSelected={selectedTier === tier.id}
            onSelect={() => setSelectedTier(tier.id)}
          />
        ))}
      </div>

      {/* Compare Plans Button */}
      <button onClick={() => showComparison(tiers)}>
        Compare Plans
      </button>
    </div>
  );
}

function PricingCard({ tier, region, isSelected, onSelect }) {
  return (
    <div className={`pricing-card ${isSelected ? 'selected' : ''}`}>
      <h3>{tier.name}</h3>
      
      {/* Price Display */}
      <div className="price-display">
        <span className="currency">$</span>
        <span className="amount">{tier.regionalPrice[region]}</span>
        <span className="period">/month</span>
      </div>

      {/* Features List */}
      <ul className="features">
        <li>✅ {tier.listingLimit} Listings</li>
        <li>✅ {tier.photoLimit} Photos</li>
        <li>✅ {tier.duration_days} Day Duration</li>
      </ul>

      {/* CTA Button */}
      <button 
        onClick={onSelect}
        className={`cta-button ${isSelected ? 'selected' : ''}`}
      >
        {tier.name === 'Free' ? 'Get Started' : 'Subscribe Now'}
      </button>
    </div>
  );
}
```

### Admin Pricing Control Panel
```typescript
// app/admin/pricing/page.tsx

export default function AdminPricingPanel() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'regional' | 'plans' | 'rules'>('tiers');
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    const res = await fetch('/api/admin/pricing/tiers');
    const data = await res.json();
    setTiers(data.tiers);
  }

  async function saveTier(tier: PricingTier) {
    const method = tier.id ? 'PATCH' : 'POST';
    const url = tier.id ? `/api/admin/pricing/tiers/${tier.id}` : '/api/admin/pricing/tiers';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tier)
    });
    
    if (res.ok) {
      await fetchTiers();
      setEditingTier(null);
    }
  }

  return (
    <div className="admin-pricing-panel">
      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('tiers')}
          className={activeTab === 'tiers' ? 'active' : ''}
        >
          Pricing Tiers
        </button>
        <button 
          onClick={() => setActiveTab('regional')}
          className={activeTab === 'regional' ? 'active' : ''}
        >
          Regional Pricing
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={activeTab === 'plans' ? 'active' : ''}
        >
          Subscription Plans
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          className={activeTab === 'rules' ? 'active' : ''}
        >
          Pricing Rules
        </button>
      </div>

      {/* Tiers Management */}
      {activeTab === 'tiers' && (
        <div className="tiers-management">
          <h2>Manage Pricing Tiers</h2>
          
          {/* Tiers Table */}
          <table>
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Base Price</th>
                <th>Listings</th>
                <th>Photos</th>
                <th>Duration</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(tier => (
                <tr key={tier.id}>
                  <td>{tier.name}</td>
                  <td>${tier.base_price}</td>
                  <td>{tier.listing_limit}</td>
                  <td>{tier.photo_limit}</td>
                  <td>{tier.duration_days} days</td>
                  <td>{tier.is_active ? '✅' : '❌'}</td>
                  <td>
                    <button onClick={() => setEditingTier(tier)}>Edit</button>
                    <button onClick={() => deleteTier(tier.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add New Tier Button */}
          <button 
            onClick={() => setEditingTier({
              id: '',
              name: '',
              base_price: 0,
              listing_limit: 0,
              photo_limit: 0,
              duration_days: 30,
              is_active: true
            })}
            className="btn-primary"
          >
            + Add New Tier
          </button>

          {/* Edit Form */}
          {editingTier && (
            <div className="edit-form">
              <h3>{editingTier.id ? 'Edit Tier' : 'New Tier'}</h3>
              
              <input
                type="text"
                placeholder="Tier Name"
                value={editingTier.name}
                onChange={(e) => setEditingTier({...editingTier, name: e.target.value})}
              />
              
              <input
                type="number"
                placeholder="Base Price"
                value={editingTier.base_price}
                onChange={(e) => setEditingTier({...editingTier, base_price: parseFloat(e.target.value)})}
              />
              
              <input
                type="number"
                placeholder="Listing Limit"
                value={editingTier.listing_limit}
                onChange={(e) => setEditingTier({...editingTier, listing_limit: parseInt(e.target.value)})}
              />
              
              <input
                type="number"
                placeholder="Photo Limit"
                value={editingTier.photo_limit}
                onChange={(e) => setEditingTier({...editingTier, photo_limit: parseInt(e.target.value)})}
              />
              
              <input
                type="number"
                placeholder="Duration (days)"
                value={editingTier.duration_days}
                onChange={(e) => setEditingTier({...editingTier, duration_days: parseInt(e.target.value)})}
              />
              
              <label>
                <input
                  type="checkbox"
                  checked={editingTier.is_active}
                  onChange={(e) => setEditingTier({...editingTier, is_active: e.target.checked})}
                />
                Active
              </label>

              <button onClick={() => saveTier(editingTier)}>Save</button>
              <button onClick={() => setEditingTier(null)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Regional Pricing Tab */}
      {activeTab === 'regional' && (
        <RegionalPricingPanel />
      )}

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <SubscriptionPlansPanel />
      )}

      {/* Pricing Rules Tab */}
      {activeTab === 'rules' && (
        <PricingRulesPanel />
      )}

      {/* Analytics */}
      <div className="pricing-analytics">
        <h3>Pricing Analytics</h3>
        <PricingAnalyticsChart />
      </div>
    </div>
  );
}
```

---

## 🔄 Pricing Calculation Logic

```typescript
// lib/pricing-calculator.ts

interface PricingRequest {
  tierId: string;
  region: string;
  billingCycle?: string;
  promoCode?: string;
  quantity?: number;
}

interface PricingResponse {
  basePrice: number;
  regionalMultiplier: number;
  regionalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  breakdown: object;
}

export async function calculatePrice(
  request: PricingRequest
): Promise<PricingResponse> {
  // 1. Get base pricing tier
  const tier = await getTier(request.tierId);
  let basePrice = tier.base_price;

  // 2. Apply regional multiplier
  const regional = await getRegionalPricing(
    request.tierId,
    request.region
  );
  const regionalMultiplier = regional?.multiplier || 1.0;
  const regionalPrice = basePrice * regionalMultiplier;

  // 3. Apply promo code discount
  let promoDiscount = 0;
  let promoPercent = 0;
  if (request.promoCode) {
    const promo = await validatePromoCode(request.promoCode, request.tierId);
    if (promo) {
      promoDiscount = regionalPrice * (promo.discount_value / 100);
      promoPercent = promo.discount_value;
    }
  }

  // 4. Apply bulk/quantity discounts
  let bulkDiscount = 0;
  if (request.quantity && request.quantity > 1) {
    const bulkRule = await getBulkPricingRule(
      request.tierId,
      request.quantity
    );
    if (bulkRule) {
      bulkDiscount = regionalPrice * (bulkRule.discount_value / 100);
    }
  }

  // 5. Apply subscription plan discount
  let planDiscount = 0;
  if (request.billingCycle) {
    const plan = await getSubscriptionPlan(request.billingCycle);
    if (plan) {
      planDiscount = regionalPrice * (plan.discount_percent / 100);
    }
  }

  // 6. Calculate final price
  const totalDiscount = promoDiscount + bulkDiscount + planDiscount;
  const finalPrice = Math.max(0, regionalPrice - totalDiscount);

  return {
    basePrice,
    regionalMultiplier,
    regionalPrice,
    discountPercent: promoPercent,
    discountAmount: totalDiscount,
    finalPrice,
    currency: regional?.currency || 'USD',
    breakdown: {
      base: basePrice,
      regional: regionalPrice - basePrice,
      promo: -promoDiscount,
      bulk: -bulkDiscount,
      plan: -planDiscount,
      total: finalPrice
    }
  };
}

// Helper functions
async function getTier(tierId: string) {
  return supabaseAdmin()
    .from('pricing_tiers')
    .select('*')
    .eq('id', tierId)
    .single();
}

async function getRegionalPricing(tierId: string, region: string) {
  return supabaseAdmin()
    .from('regional_pricing')
    .select('*')
    .eq('tier_id', tierId)
    .eq('region', region)
    .single();
}

async function validatePromoCode(code: string, tierId: string) {
  return supabaseAdmin()
    .from('pricing_rules')
    .select('*')
    .eq('name', code)
    .eq('rule_type', 'promo_code')
    .eq('tier_id', tierId)
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .single();
}

async function getBulkPricingRule(tierId: string, quantity: number) {
  return supabaseAdmin()
    .from('pricing_rules')
    .select('*')
    .eq('tier_id', tierId)
    .eq('rule_type', 'bulk_purchase')
    .eq('is_active', true)
    .gte('min_quantity', quantity)
    .lte('max_quantity', quantity)
    .single();
}

async function getSubscriptionPlan(billingCycle: string) {
  return supabaseAdmin()
    .from('subscription_plans')
    .select('*')
    .eq('billing_cycle', billingCycle)
    .eq('is_active', true)
    .single();
}
```

---

## 📈 Pricing Strategy Examples

### Example 1: Tiered Subscription
```
Free Tier: $0 - 1 listing, 5 photos
Basic: $9.99/month - 5 listings, 25 photos
Pro: $29.99/month - 20 listings, 100 photos
Premium: $99.99/month - Unlimited
```

### Example 2: Regional Pricing
```
US (baseline): $9.99
Canada: $9.99 × 1.13 = $11.29 CAD equivalent
UK: $9.99 × 0.85 = $8.49 GBP equivalent
India: $9.99 × 0.30 = $3.00 (purchasing power)
Australia: $9.99 × 1.15 = $11.49 AUD equivalent
```

### Example 3: Subscription Discounts
```
1 Month: $39.99 (full price)
3 Months: $99.99 (16% discount = $33.33/month)
6 Months: $179.99 (25% discount = $29.99/month)
12 Months: $299.99 (38% discount = $24.99/month)
```

### Example 4: Promotional Pricing
```
Spring Sale: 20% off all tiers
Loyalty: Extra 5% off annual for returning customers
Bulk: 10% off per 5+ listings
Seasonal: Holiday 15% discount
```

---

## 🔐 Security Considerations

1. **Server-Side Validation** - All pricing calculated on server
2. **Rate Limiting** - Limit pricing calculation API calls
3. **Audit Trail** - Track all pricing changes
4. **Admin Only** - Only admins can modify pricing
5. **Price Integrity** - Validate prices before payment
6. **Promo Code Validation** - Check expiry, usage limits
7. **Currency Validation** - Ensure proper currency handling
8. **Payment Verification** - Verify final price at checkout

---

## 📊 Analytics & Reporting

### Track These Metrics
- Conversions by tier
- Conversions by region
- Revenue by region
- Revenue by tier
- Promo code effectiveness
- Price sensitivity
- Customer lifetime value
- Churn rate

### Dashboard Displays
```
Revenue by Tier (pie chart)
Revenue by Region (bar chart)
Conversion Rate by Price (line chart)
Promo Code Performance (table)
Regional Price Elasticity (analysis)
Customer Acquisition Cost (metric)
```

---

## 🚀 Implementation Checklist

- [ ] Create database tables
- [ ] Create API endpoints
- [ ] Build pricing calculator
- [ ] Create admin dashboard
- [ ] Build pricing display page
- [ ] Implement regional detection
- [ ] Add promo code system
- [ ] Set up analytics
- [ ] Create audit logging
- [ ] Test pricing calculations
- [ ] Test regional pricing
- [ ] Test promo codes
- [ ] Document pricing strategy
- [ ] Train admins on system

---

## 💡 Advanced Features (Future)

- AI-powered price optimization
- A/B testing different prices
- Dynamic pricing based on demand
- Competitor price monitoring
- Customer willingness-to-pay analysis
- Predictive pricing models
- Bundle pricing
- Volume-based discounts
- VIP pricing tiers

