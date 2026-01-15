# Complete Pricing Logic Breakdown

## 📊 ALL VARIABLES INVOLVED IN PRICING

### Base Pricing Variables
1. **`base_rent`** (per zone, per room)
   - `tlv_heart`: ₪3,800 per room
   - `old_north`: ₪3,500 per room
   - `ramat_aviv`: ₪3,000 per room
   - `south_jaffa`: ₪2,600 per room

2. **`rooms`** (number of bedrooms)
   - Used as multiplier: `base * rooms`

3. **`assetType`** (property type multipliers)
   - `studio`: 1.60x
   - `luxury_penthouse`: 1.40x
   - `standard_apt`: 1.0x
   - `shared_room`: 0.7x

4. **`premium`** (feature-based additions)
   - `has_parking`: +3% (0.03)
   - `is_renovated`: +10% (0.10)
   - Base premium: 1.0

5. **`verifiedRent`** (monthly rent - either estimated or user-declared)
   - Calculated from: `base * rooms * assetType_multiplier * premium`
   - Can be manually overridden by user (with proof if exceeds limits)

6. **`checkInDate`** (for seasonality calculation)
   - Used to determine high vs normal season

7. **`seasonal_multiplier`**
   - High season (Jan, Feb, Jul, Aug): 1.40x
   - Normal season: 1.25x

8. **`pricePerNight`** (final nightly rate)
   - Calculated from verifiedRent and seasonality

9. **`nights`** (number of nights)
   - Calculated: `Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))`

10. **`totalPrice`** (subtotal before fees)
    - Formula: `nights * pricePerNight`

### Fee Variables (Currently Found)
11. **`platformFee`** (platform commission)
    - Rate: 10% (0.10)
    - Applied to: `totalPrice`
    - Formula: `totalPrice * 0.10`

12. **`hostPayout`** (amount host receives)
    - Formula: `totalPrice * 0.90` (after 10% platform fee)

### Missing Variables (NOT FOUND IN CODE)
- ❌ **Cleaning Fee**: Not implemented
- ❌ **Service Fee**: Not implemented  
- ❌ **Tax/VAT**: Not implemented
- ❌ **Weekly Discount**: Not implemented
- ❌ **Monthly Discount**: Not implemented

---

## 🧮 THE FORMULAS

### Formula 1: Monthly Rent Estimation
**Location**: `functions/calculateFairPrice.ts` → `estimateMonthlyRent()`

```javascript
base = zoneConfig.base_rent * (input.rooms || 1)
factor = PRICING_CONFIG.multipliers[input.assetType] || 1.0
premium = 1.0
if (input.features?.has_parking) premium += 0.03  // +3%
if (input.features?.is_renovated) premium += 0.10  // +10%

estimatedMonthlyRent = Math.ceil(base * factor * premium)
```

**Example**:
- Zone: `tlv_heart` (₪3,800)
- Rooms: 2
- Asset Type: `standard_apt` (1.0x)
- Has Parking: Yes (+3%)
- Is Renovated: Yes (+10%)
- Calculation: `3800 * 2 * 1.0 * (1.0 + 0.03 + 0.10) = 3800 * 2 * 1.13 = ₪8,588`

---

### Formula 2: Nightly Rate Calculation
**Location**: `functions/calculateFairPrice.ts` → `calculateNightlyRate()`

```javascript
dailyCost = verifiedRent / 30
month = checkInDate.getMonth()
isHighSeason = [0, 1, 6, 7].includes(month)  // Jan, Feb, Jul, Aug
multiplier = isHighSeason ? 1.40 : 1.25

recommended = Math.ceil(dailyCost * multiplier)
min_limit = Math.floor(recommended * 0.8)
max_limit = Math.ceil(recommended * 1.3)
```

**Example**:
- Verified Rent: ₪8,588/month
- Check-in: July (high season)
- Daily Cost: `8588 / 30 = ₪286.27`
- Recommended: `Math.ceil(286.27 * 1.40) = ₪401`
- Min Limit: `Math.floor(401 * 0.8) = ₪320`
- Max Limit: `Math.ceil(401 * 1.3) = ₪522`

---

### Formula 3: Subtotal (Base Price)
**Location**: `src/components/booking/StickyBookingCard.jsx` → Line 26

```javascript
nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
subtotal = nights * listing.pricePerNight
```

**Example**:
- Check-in: July 1, 2024
- Check-out: July 8, 2024
- Nights: `Math.ceil((July 8 - July 1) / 86400000) = 7 nights`
- Price Per Night: ₪401
- Subtotal: `7 * 401 = ₪2,807`

---

### Formula 4: Platform Fee
**Location**: `functions/generateDailyReport.ts` → Line 49
**Location**: `functions/getHostDashboardData.ts` → Lines 78-80

```javascript
platformFee = totalPrice * 0.10  // 10% commission
hostPayout = totalPrice * 0.90  // Host receives 90%
```

**Example**:
- Subtotal: ₪2,807
- Platform Fee: `2807 * 0.10 = ₪280.70`
- Host Payout: `2807 * 0.90 = ₪2,526.30`

---

### Formula 5: Final Total Price (GUEST PAYS)
**⚠️ CONFLICT IDENTIFIED**: The code shows TWO different calculations:

**Version A** (Simple - No fees added):
```javascript
// Location: StickyBookingCard.jsx Line 26
totalPrice = nights * listing.pricePerNight
// Guest pays: ₪2,807 (no fees added)
```

**Version B** (With platform fee):
```javascript
// Platform fee is calculated separately in reports
// But NOT added to guest's totalPrice
platformFee = totalPrice * 0.10
// Guest still pays: ₪2,807
// Platform takes: ₪280.70 from host's payout
```

**⚠️ ISSUE**: Platform fee appears to be deducted from HOST payout, not added to GUEST price. This means:
- Guest pays: `subtotal` (no fees)
- Host receives: `subtotal * 0.90`
- Platform keeps: `subtotal * 0.10`

---

## 🔄 THE FLOW

### Phase 1: Listing Creation (Host Sets Price)
1. **Location**: `src/components/wizard/PricingStep.jsx`
2. **Trigger**: Host creates listing
3. **Steps**:
   - Calls `calculateFairPrice` → `estimate_rent` action
   - Gets estimated monthly rent
   - Host confirms or manually enters rent
   - Calls `calculateFairPrice` → `calculate_price` action
   - Gets recommended nightly rate with min/max limits
   - Host sets `pricePerNight` (can be between min_limit and max_limit)
   - Saved to `listing.pricePerNight`

### Phase 2: Guest Views Listing
1. **Location**: `src/pages/ListingDetails.jsx`
2. **Display**: Shows `listing.pricePerNight`
3. **Component**: `StickyBookingCard` displays price

### Phase 3: Guest Selects Dates
1. **Location**: `src/components/booking/StickyBookingCard.jsx`
2. **Calculation**: 
   ```javascript
   nights = calculateNights()  // Based on checkIn/checkOut dates
   totalPrice = nights * listing.pricePerNight
   ```
3. **Display**: Shows "Total for X nights" but NOT the breakdown

### Phase 4: Guest Clicks "Reserve"
1. **Location**: `src/pages/ListingDetails.jsx` → Line 525
2. **Action**: Opens `PaymentDialog`
3. **⚠️ MISSING**: No booking creation code found in PaymentDialog/PaymentForm
4. **Expected**: Should create Booking entity with:
   - `dates.start` (checkIn)
   - `dates.end` (checkOut)
   - `totalPrice` (nights * pricePerNight)
   - `guestId`, `hostId`, `listingId`

### Phase 5: Payment Processing
1. **Location**: `src/components/payment/PaymentForm.jsx`
2. **Current**: Only creates Payment record, NOT Booking
3. **Amount**: Uses `amount` prop (likely `totalPrice`)
4. **⚠️ ISSUE**: No booking creation logic found

### Phase 6: Host Payout Calculation
1. **Location**: `functions/getHostDashboardData.ts` → Lines 78-80
2. **Formula**: `booking.totalPrice * 0.90`
3. **Timing**: After check-in (24 hours threshold)

---

## ⚠️ EDGE CASES & SPECIAL CONDITIONS

### 1. Weekly/Monthly Discounts
**Status**: ❌ **NOT IMPLEMENTED**
- No code found for weekly discounts
- No code found for monthly discounts
- No discount logic in pricing calculations

### 2. Cancellation Refunds
**Location**: `src/components/booking/CancellationModal.jsx` → Lines 25-77

**Policies**:
- **FLEXIBLE**:
  - > 1 day before check-in: 100% refund
  - ≤ 1 day: Charge 1st night only, refund rest
- **MODERATE**:
  - > 5 days: 100% refund
  - ≤ 5 days: 50% refund
- **STRICT**:
  - > 14 days: 100% refund
  - 7-14 days: 50% refund
  - < 7 days: 0% refund

**Formula**:
```javascript
refundAmount = (totalPaid * refundPercentage) / 100
deduction = totalPaid - refundAmount
```

### 3. Price Validation Limits
**Location**: `src/components/wizard/PricingStep.jsx` → Lines 26-53

**Max Limits by Zone/Type**:
- `shared_room`: ₪4,000-5,000/month (varies by zone)
- `studio`: ₪5,500-7,000/month (varies by zone)
- `standard_apt` (1 room): ₪5,500-7,000/month
- `standard_apt` (2 rooms): ₪7,200-9,500/month
- `standard_apt` (3 rooms): ₪9,000-13,000/month
- `standard_apt` (4+ rooms): ₪12,000-18,000/month

**If exceeded**: Requires proof upload (contract/rent receipt)

### 4. Seasonal Pricing
**Location**: `functions/calculateFairPrice.ts` → Lines 19-23

**High Season Months**: January, February, July, August
- Multiplier: 1.40x
- Applied to: Daily cost calculation

**Normal Season**: All other months
- Multiplier: 1.25x

### 5. Original Price vs Current Price (Discount Display)
**Location**: `src/components/booking/StickyBookingCard.jsx` → Lines 27-28

```javascript
originalPrice = listing.originalPrice || null
hasDiscount = originalPrice && originalPrice > listing.pricePerNight
```

**Display**: Shows strikethrough original price if `hasDiscount` is true
**⚠️ NOTE**: No actual discount calculation - just visual display

---

## 🚨 CONFLICTS & ISSUES IDENTIFIED

### Conflict 1: Platform Fee Not Added to Guest Price
- **Issue**: Platform fee (10%) is deducted from host payout, not added to guest total
- **Impact**: Guest pays less than expected, host receives less
- **Location**: `getHostDashboardData.ts` vs `StickyBookingCard.jsx`

### Conflict 2: Missing Fee Breakdown
- **Issue**: No cleaning fee, service fee, or tax calculation found
- **Impact**: Total price shown may not reflect all costs
- **Location**: No implementation found

### Conflict 3: Booking Creation Missing
- **Issue**: PaymentForm creates Payment but no Booking entity
- **Impact**: Bookings may not be properly tracked
- **Location**: `PaymentForm.jsx` → No booking creation

### Conflict 4: Total Price Calculation Inconsistency
- **Issue**: `totalPrice` calculated in `StickyBookingCard` but not used consistently
- **Impact**: Different components may show different totals
- **Location**: Multiple files calculate differently

### Conflict 5: No Weekly/Monthly Discount Logic
- **Issue**: User asked about discounts, but none exist
- **Impact**: Cannot offer long-term stay discounts
- **Location**: No implementation found

---

## 📍 WHERE CALCULATIONS HAPPEN

### Frontend (React Components)
1. **`src/components/booking/StickyBookingCard.jsx`**
   - Calculates: `nights`, `totalPrice` (subtotal)
   - When: On date selection change
   - Display: Shows price to guest

2. **`src/components/wizard/PricingStep.jsx`**
   - Calculates: Estimated rent, recommended nightly rate
   - When: During listing creation
   - Display: Shows pricing recommendations to host

3. **`src/components/booking/CancellationModal.jsx`**
   - Calculates: Refund amounts
   - When: User cancels booking
   - Display: Shows refund breakdown

### Backend (Deno Functions)
1. **`functions/calculateFairPrice.ts`**
   - Calculates: Monthly rent estimate, nightly rate
   - When: Called from PricingStep component
   - Returns: Pricing recommendations

2. **`functions/getHostDashboardData.ts`**
   - Calculates: Host payout (totalPrice * 0.90)
   - When: Host views dashboard
   - Returns: Wallet balance

3. **`functions/generateDailyReport.ts`**
   - Calculates: Platform revenue (totalTransactions * 0.10)
   - When: Admin generates daily report
   - Returns: Financial metrics

### Database
- **No calculations happen in database**
- All calculations are done in code (frontend or backend functions)
- Database stores: `pricePerNight`, `totalPrice`, `estimatedMonthlyRent`

---

## 🔍 RAW LOGIC SUMMARY

### Current Flow (As Found):
```
1. Host creates listing
   → estimateMonthlyRent() calculates base rent
   → calculateNightlyRate() calculates recommended price
   → Host sets pricePerNight

2. Guest views listing
   → Sees pricePerNight

3. Guest selects dates
   → StickyBookingCard calculates: nights * pricePerNight
   → Shows totalPrice (subtotal only)

4. Guest clicks Reserve
   → Opens PaymentDialog
   → PaymentForm processes payment
   → ⚠️ NO BOOKING CREATION FOUND

5. Host receives payout
   → getHostDashboardData calculates: totalPrice * 0.90
   → Platform keeps: totalPrice * 0.10
```

### Missing Components:
- ❌ Booking creation on payment
- ❌ Cleaning fee calculation
- ❌ Service fee calculation
- ❌ Tax/VAT calculation
- ❌ Weekly discount logic
- ❌ Monthly discount logic
- ❌ Fee breakdown display to guest
- ❌ Final total calculation with all fees

---

## 📝 RECOMMENDATIONS FOR REFACTORING

1. **Centralize Pricing Logic**
   - Create single source of truth for all price calculations
   - Move calculations to backend function

2. **Add Missing Fees**
   - Implement cleaning fee (if needed)
   - Implement service fee (if needed)
   - Implement tax/VAT (if required)

3. **Fix Platform Fee Logic**
   - Decide: Add to guest price OR deduct from host
   - Make consistent across all calculations

4. **Add Discount Logic**
   - Implement weekly discounts (if needed)
   - Implement monthly discounts (if needed)

5. **Create Booking on Payment**
   - Ensure Booking entity is created when payment succeeds
   - Store all pricing breakdown in booking record

6. **Show Fee Breakdown**
   - Display subtotal, fees, and total to guest before payment
   - Show host payout breakdown in dashboard
