# Buy/Sell Order Dialog Migration Plan

## Overview
Migrate the buy/sell order dialog from Vue 2/Vuetify 2 to Vue 3/Vuetify 3 to match the old app exactly.

## Image Analysis - Old App Structure

### Header Section
1. **Symbol & Exchange**: "TCS-EQ NSE"
2. **Price & Change**: "₹3006.10" with "-10.70 (-0.35%)" in red
3. **Buy/Sell Toggle**: Green "B" button, black "S" button, with switch in between
4. **Options Menu**: Three dots icon (vertical ellipsis)

### Order Type Tabs
- Tabs: "Regular", "Cover", "Bracket", "GTT", "SIP"
- "Regular" is selected/highlighted
- SIP tab only shows for NSE/BSE exchanges

### Investment Type
- Radio buttons: "Intraday" and "Delivery"
- "Delivery" is selected

### Select Order Type
- Chips: "Limit", "Market", "SL Limit", "SL Mkt"
- "Limit" is selected

### Quantity Input
- Input field with value "1"
- **Minus (-) button on left** (prepend-inner)
- **Plus (+) button on right** (append)
- Shows "Freeze qty: 32562" below the input

### Price Input
- Input field with value "₹3006.00"
- Shows "MLot: 1" on the left side
- Shows "Tick: 0.1" on the right side
- Shows "Circuit level: 2715.20 - 3318.40" below the input
- Lock icon when readonly (MKT/SL-MKT)

### Checkboxes
1. "Add Validity & Disclosed Qty" checkbox
2. "After market order (AMO)" checkbox

### Quick Order Link
- Blue text link: "Quick order «" (with double chevron)

### Footer Section
1. **Margin Display**: "Margin ₹3006.00 + ₹10.00"
2. **Availability**: "Avail ₹0.00 + Add fund" with exclamation icon
3. **Action Buttons**:
   - Cancel button (grey, left side)
   - Buy button (green, right side)

## Current New Code Status

### ✅ Already Implemented
- Basic dialog structure
- Header with symbol and price
- Buy/Sell toggle
- Order type tabs (but missing SIP)
- Investment type radio buttons
- Price type chips
- Quantity and price inputs
- Margin calculation
- Place order button

### ❌ Missing/Needs Fix
1. **Order Type Tabs**: Need "Regular" instead of "Normal", add "SIP" tab
2. **Quantity Input**: Missing +/- buttons
3. **Price Input**: Missing "MLot" label on left, missing "Circuit level" display
4. **Freeze Qty**: Missing "Freeze qty" display below quantity
5. **Checkboxes**: Missing proper checkbox structure for "Add Validity & Disclosed Qty"
6. **Quick Order Link**: Missing "Quick order «" link
7. **Footer**: Missing Cancel button, need proper margin format with "+" separator
8. **Availability**: Missing "Add fund" link and exclamation icon
9. **Price Type Labels**: Need full text "Limit", "Market", "SL Limit", "SL Mkt" instead of abbreviations

## Migration Tasks

### Task 1: Fix Header Section ✅
- [x] Symbol and exchange display
- [x] Price and change display
- [ ] Verify Buy/Sell button styling matches exactly
- [ ] Add three dots menu icon

### Task 2: Fix Order Type Tabs ✅
- [ ] Change "Normal" to "Regular"
- [ ] Add "SIP" tab (only for NSE/BSE)
- [ ] Verify tab styling matches

### Task 3: Fix Quantity Input ✅
- [ ] Add minus (-) button on left (prepend-inner)
- [ ] Add plus (+) button on right (append)
- [ ] Add "Freeze qty: X" display below input
- [ ] Implement increase/decrease functions

### Task 4: Fix Price Input ✅
- [ ] Add "MLot: X" label on left side
- [ ] Keep "Tick: X" on right side
- [ ] Add "Circuit level: X - Y" display below input
- [ ] Add lock icon when readonly

### Task 5: Add Checkboxes ✅
- [ ] Add "Add Validity & Disclosed Qty" checkbox
- [ ] Show Validity chip group when checked (IOC/EOS/Day)
- [ ] Show Disclosed Qty input when checked
- [ ] Add "After market order (AMO)" checkbox

### Task 6: Add Quick Order Link ✅
- [ ] Add "Quick order «" link
- [ ] Implement toggle functionality

### Task 7: Fix Footer Section ✅
- [ ] Update margin display format: "Margin ₹X.XX + ₹Y.YY"
- [ ] Add "Avail ₹X.XX + Add fund" with exclamation icon
- [ ] Add Cancel button (grey, left side)
- [ ] Keep Buy button (green, right side)
- [ ] Make buttons side-by-side (not stacked)

### Task 8: Fix Price Type Labels ✅
- [ ] Change "LMT" to "Limit"
- [ ] Change "MKT" to "Market"
- [ ] Change "SL-LMT" to "SL Limit"
- [ ] Change "SL-MKT" to "SL Mkt"

## Implementation Priority

1. **HIGH**: Quantity +/- buttons and Freeze qty
2. **HIGH**: Price input labels (MLot, Tick, Circuit level)
3. **HIGH**: Footer buttons (Cancel + Buy)
4. **MEDIUM**: Order type tabs (Regular, SIP)
5. **MEDIUM**: Checkboxes (Validity & Disclosed Qty, AMO)
6. **MEDIUM**: Margin/Availability display format
7. **LOW**: Quick order link
8. **LOW**: Price type label text

## Files to Modify

1. `src/components/Popups/StockOrderWindow.vue` - Main order dialog component

## Next Steps

1. Analyze current implementation
2. Compare with old code structure
3. Implement missing features
4. Test and verify

