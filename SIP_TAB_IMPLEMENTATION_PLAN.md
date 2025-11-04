# SIP Tab Implementation Plan

## Overview

Implement the complete SIP (Systematic Investment Plan) tab functionality in the buy/sell order dialog component (`StockOrderWindow.vue`) to match the old app's behavior exactly, using Vue 3, Vuetify 3, and Pinia.

## Current Status

- ✅ SIP tab exists in the order type tabs (value 4)
- ❌ Currently only shows a redirect message
- ❌ No SIP order form fields
- ❌ No SIP order placement logic

## Old App Behavior Analysis

### When SIP Tab is Clicked (`ordertype == 4`)

1. **If not on orders page**: Navigate to `/orders` route with `menudata[1]` (security data) as params
2. **If already on orders page**: Emit `siporder-trigger` event with `menudata[1]` (security data)
3. **Close the order dialog**: Call `closeMenudialog("order")`

### SIP Order Form Structure (from `StockSIPorders.vue`)

The SIP order dialog contains the following fields:

1. **SIP Name** (Text input)

   - Placeholder: "name"
   - Validation: Only letters and spaces allowed
   - Required: Yes

2. **Start Date** (Date picker)

   - Format: YYYY-MM-DD
   - Min date: Today (maxdate)
   - Required: Yes

3. **Frequency** (Select dropdown)

   - Options: Daily, Weekly, Fortnightly, Monthly
   - Values: '0' (Daily), '1' (Weekly), '2' (Fortnightly), '3' (Monthly)
   - Required: Yes

4. **No. of SIPs** (Number input)

   - Must be > 0
   - Required: Yes

5. **Investment Type** (Radio/Toggle)

   - Options: Qty (Quantity) or Amount (Price)
   - Default: Qty

6. **Scrips List** (Data table)
   - Shows selected stocks with:
     - Symbol & Exchange
     - Quantity or Amount (based on investment type)
     - Price (if amount-based)
   - Add/Remove stocks functionality

## Implementation Plan

### Phase 1: Update SIP Tab Click Handler ✅

**File**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`

**Changes**:

1. Update `onOrderTypeChanged` function to handle `orderType === 4`:
   ```javascript
   if (orderType.value === 4) {
     // SIP tab clicked - redirect to orders page or trigger SIP dialog
     const router = useRouter();
     const currentPath = router.currentRoute.value.path;

     if (currentPath !== "/orders") {
       // Navigate to orders page with security data
       router.push({
         name: "orderbook",
         params: menudata.value[1] || {},
       });
     } else {
       // Emit event to trigger SIP order dialog
       window.dispatchEvent(
         new CustomEvent("siporder-trigger", {
           detail: menudata.value[1] || {},
         })
       );
     }

     // Close order dialog
     closeOrderDialog();
     return;
   }
   ```

### Phase 2: Create SIP Order Dialog Component (If Not Exists)

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue` (already exists)

**Verify/Update**:

1. Check if the component listens for `siporder-trigger` event
2. Ensure it can receive security data from the event
3. Verify all form fields match the old app structure

**Key Fields to Verify**:

- SIP Name input (letters only)
- Start Date picker (min = today)
- Frequency dropdown (Daily, Weekly, Fortnightly, Monthly)
- No. of SIPs input (must be > 0)
- Investment Type toggle (Qty/Amount)
- Scrips data table
- Add/Remove scrips functionality

### Phase 3: Event Listener Integration

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue`

**Changes**:

1. Add event listener in `onMounted`:

   ```javascript
   onMounted(() => {
     getOrderbook();

     // Listen for SIP order trigger from buy/sell dialog
     window.addEventListener("siporder-trigger", handleSIPOrderTrigger);
   });
   ```

2. Add event cleanup in `onBeforeUnmount`:

   ```javascript
   onBeforeUnmount(() => {
     window.removeEventListener("siporder-trigger", handleSIPOrderTrigger);
   });
   ```

3. Create `handleSIPOrderTrigger` function:
   ```javascript
   function handleSIPOrderTrigger(event) {
     const securityData = event.detail;

     if (securityData && securityData.token) {
       // Add the security to orderbookdata
       const scrip = {
         exch: securityData.exch,
         tsym: securityData.tsym,
         token: securityData.token,
         prd: "C", // Default to Delivery
         qty: securityData.ls || 1, // Default quantity
       };

       // Check if already exists
       const exists = orderbookdata.value.find(
         (o) => o.token === scrip.token && o.exch === scrip.exch
       );

       if (!exists) {
         orderbookdata.value.push(scrip);
       }

       // Open SIP dialog
       basketdialog.value = true;
       setmode.value = true; // Create mode

       // Reset form fields
       sip_name.value = "";
       sipdate.value = moment().format("YYYY-MM-DD");
       frequency.value = "Daily";
       sipinstall.value = 1;
     }
   }
   ```

### Phase 4: Form Field Validation

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue`

**Validation Rules**:

1. **SIP Name**:

   - Required
   - Only letters and spaces
   - Cannot be duplicate (check against existing SIP names)

2. **Start Date**:

   - Required
   - Must be >= today
   - Format: YYYY-MM-DD

3. **Frequency**:

   - Required
   - Must be one of: Daily, Weekly, Fortnightly, Monthly

4. **No. of SIPs**:

   - Required
   - Must be > 0
   - Must be a number

5. **Scrips**:
   - At least one scrip required
   - Each scrip must have valid token, exch, tsym
   - Quantity/Amount must be > 0

### Phase 5: SIP Order Placement API Integration

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue`

**API Call**:

- Use `getSIPOrderset(item, url)` from `getAPIdata.js`
- URL: `'PlaceSipOrder'` for new orders, `'ModifySipOrder'` for edits

**Request Format**:

```javascript
{
    uid: sessionStorage.getItem('userid'),
    actid: sessionStorage.getItem('userid'),
    reg_date: moment().format('DDMMYYYY'), // Current date
    start_date: moment(sipdate.value).format('DDMMYYYY'),
    frequency: '0' | '1' | '2' | '3', // Daily, Weekly, Fortnightly, Monthly
    end_period: sipinstall.value.toString(),
    sip_name: sip_name.value,
    Scrips: orderbookdata.value.map(scrip => ({
        exch: scrip.exch,
        tsym: scrip.tsym,
        token: scrip.token,
        prd: scrip.prd || 'C',
        qty: scrip.qty?.toString(),
        prc: scrip.prc?.toString() // If amount-based
    }))
}
```

**Response Handling**:

- Success (`ReqStatus === 'OK'`): Show success snackbar, refresh orderbook, close dialog
- Error: Show error snackbar with error message

### Phase 6: Scrips Management

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue`

**Functionality**:

1. **Add Scrip from Buy/Sell Dialog**:

   - Receive security data from `siporder-trigger` event
   - Add to `orderbookdata` array
   - Default: Quantity = lot size, Investment type = Qty

2. **Add More Scrips**:

   - Search functionality (similar to watchlist search)
   - Add selected stocks to `orderbookdata`

3. **Remove Scrips**:

   - Delete button in data table
   - Remove from `orderbookdata` array

4. **Edit Scrip**:
   - Modify quantity/amount
   - Change investment type (Qty/Amount)

### Phase 7: UI/UX Matching Old App

**File**: `superApp_v4/src/views/Orders/StockSIPorders.vue`

**Visual Elements**:

1. **Dialog Header**:

   - Title: "Create SIP order" or "Edit SIP order"
   - Close button (X icon) on right
   - Divider

2. **Form Layout**:

   - 4-column grid for: SIP name, Start date, Frequency, No. of SIPs
   - 2-column grid for: Investment type toggle
   - Full-width data table for scrips

3. **Data Table**:

   - Columns: Symbol, Exchange, Quantity/Amount, Price (if amount-based), Actions
   - Actions: Edit, Delete
   - Hover effects matching old app

4. **Action Buttons**:
   - "Place SIP Order" or "Modify SIP Order" button
   - Cancel button
   - Loading state during API call

### Phase 8: Integration with Orders Page

**File**: `superApp_v4/src/views/Orders/OrderScreen.vue` or `StocksOrderBook.vue`

**Changes**:

1. Ensure route name is `'orderbook'` or update navigation
2. Ensure component listens for `siporder-trigger` event
3. Pass security data correctly when navigating

### Phase 9: Testing Checklist

- [ ] SIP tab click navigates to orders page (when not on orders page)
- [ ] SIP tab click triggers SIP dialog (when on orders page)
- [ ] SIP dialog opens with security data from buy/sell dialog
- [ ] SIP name validation works (letters only, no duplicates)
- [ ] Start date picker works (min = today)
- [ ] Frequency dropdown works (all options)
- [ ] No. of SIPs validation works (> 0)
- [ ] Investment type toggle works (Qty/Amount)
- [ ] Scrips can be added/removed
- [ ] SIP order placement API works
- [ ] Success/error messages display correctly
- [ ] Orderbook refreshes after SIP placement
- [ ] Dialog closes after successful placement

## Files to Modify

1. **`superApp_v4/src/components/Popups/StockOrderWindow.vue`**

   - Update `onOrderTypeChanged` function
   - Add router import
   - Add SIP tab click handler

2. **`superApp_v4/src/views/Orders/StockSIPorders.vue`**

   - Add `siporder-trigger` event listener
   - Create `handleSIPOrderTrigger` function
   - Verify/update form fields
   - Verify/update validation logic
   - Verify/update API integration

3. **`superApp_v4/src/views/Orders/OrderScreen.vue`** (if exists)
   - Verify route name matches
   - Ensure component can receive params

## Dependencies

- `moment` (for date formatting)
- `useRouter` from `vue-router`
- `useAppStore` from Pinia stores
- `getSIPOrderset` from `getAPIdata.js`

## Notes

- The old app uses `eventBus.$emit` for events, new app uses `window.dispatchEvent` with `CustomEvent`
- The old app uses `moment().format('DDMMYYYY')` for dates, maintain same format
- Frequency mapping: Daily='0', Weekly='1', Fortnightly='2', Monthly='3'
- Default investment type is Qty (Quantity)
- Default product type (prd) is 'C' (Delivery) for NSE/BSE stocks
