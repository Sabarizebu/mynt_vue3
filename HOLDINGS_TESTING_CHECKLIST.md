# Holdings Page Migration - Testing Checklist

## Pre-Testing Verification ✅

### Code Quality Checks
- [x] ✅ No Vue 2 syntax (no `eventBus`, `this.$`, `v-tabs-items`, `v-tab-item`)
- [x] ✅ No Vuetify 2 props (`flat`, `solo`, `item-text`)
- [x] ✅ All imports are correct (Vue 3, Vuetify 3, Pinia)
- [x] ✅ Event listeners properly cleaned up in `onBeforeUnmount`
- [x] ✅ All event listeners use named functions for proper cleanup
- [x] ✅ Composition API with `<script setup>` used throughout
- [x] ✅ WebSocket subscription/unsubscription properly implemented

### File Status
- [x] ✅ `HolDings.vue` is the migrated version (already in place)
- [x] ✅ All duplicate files cleaned up
- [x] ✅ Documentation files created

## Functional Testing Checklist

### 1. Data Loading ✅
- [ ] Navigate to Holdings page
- [ ] Verify stocks holdings data loads correctly
- [ ] Verify MF holdings data loads correctly
- [ ] Check that loading state shows while fetching
- [ ] Verify cached data loads on mount (optimistic UI)
- [ ] Check that fresh data replaces cached data

### 2. Stats Cards Display ✅
- [ ] **Stocks Tab:**
  - [ ] Stocks Value displays correctly
  - [ ] Day Change displays with correct color (green/red/grey)
  - [ ] Day Change percentage displays correctly
  - [ ] Invested amount displays correctly
  - [ ] P&L displays with correct color
  - [ ] P&L percentage displays correctly
  - [ ] Positive count chip displays
  - [ ] Negative count chip displays
  
- [ ] **MF Tab:**
  - [ ] Current Value displays correctly
  - [ ] Invested amount displays correctly
  - [ ] P&L displays with correct color
  - [ ] P&L percentage displays correctly

### 3. Search and Filter ✅
- [ ] **Search Functionality:**
  - [ ] Type in search box filters by instrument symbol
  - [ ] Search works case-insensitively
  - [ ] Search filters correctly by exchange
  - [ ] Clearing search shows all filtered results
  
- [ ] **Filter Functionality:**
  - [ ] "All" filter shows all holdings
  - [ ] "NSE" filter shows only NSE holdings
  - [ ] "BSE" filter shows only BSE holdings
  - [ ] "MCX" filter shows only MCX holdings
  - [ ] "Bonds" filter shows only bond holdings (T-BILL, G-SEC, SGB)
  - [ ] Filter works with search simultaneously

### 4. Data Table - Stocks Tab ✅
- [ ] **Table Display:**
  - [ ] Table headers display correctly (Vuetify 3 format)
  - [ ] All columns show correct data:
    - Instrument (with exchange)
    - Net Qty (with pledged/BTST chips if applicable)
    - Avg Price
    - LTP
    - Invested
    - Current Value
    - Day P&L
    - Day %
    - P&L
  - [ ] Data is properly formatted (numbers, currency)
  - [ ] Color coding works (green/red/grey for P&L values)
  
- [ ] **Action Buttons (on row hover):**
  - [ ] Buy (B) button appears and works
  - [ ] Sell (S) button appears and works
  - [ ] Chart button appears and navigates correctly
  - [ ] Exit button appears with tooltip and works
  - [ ] Menu (3-dots) button appears and opens menu
  - [ ] Menu dropdown shows all options:
    - Add
    - Exit
    - Create GTT/GTC
    - Create Alert
    - Market Depth
    - Chart
    - Fundamentals
    - Details
  
- [ ] **Row Click:**
  - [ ] Clicking row opens drawer with correct data
  - [ ] Drawer displays all holding details

### 5. Data Table - MF Tab ✅
- [ ] **Table Display:**
  - [ ] MF table headers display correctly
  - [ ] All columns show correct data:
    - Instrument (fund name)
    - Qty
    - Avg NAV
    - NAV
    - Invested
    - Current Value
    - Overall P&L
    - Overall %
  - [ ] Color coding works for P&L values
  - [ ] Redeem button appears for MF holdings
  
- [ ] **Row Click:**
  - [ ] Clicking row opens drawer with MF data
  - [ ] Drawer displays MF-specific fields (NAV, invested_value, etc.)

### 6. Drawer/Details View ✅
- [ ] **Stocks Drawer:**
  - [ ] Drawer opens on row click
  - [ ] Instrument name and exchange display correctly
  - [ ] LTP and P&L display with correct colors
  - [ ] Quantity displays correctly (with chip color)
  - [ ] Pledged Qty displays (if applicable)
  - [ ] Avg Price displays correctly
  - [ ] Last trade price displays
  - [ ] Overall P&L displays with percentage
  - [ ] Day P&L displays with percentage
  - [ ] Investment amount displays
  - [ ] Current value displays
  - [ ] Product displays correctly (INTRADAY/DELIVERY/MARKET)
  - [ ] Order type displays
  - [ ] ISIN displays
  - [ ] E-DIS button appears (if available)
  - [ ] Exit button works
  - [ ] Add button at bottom works
  
- [ ] **MF Drawer:**
  - [ ] Drawer opens with MF data
  - [ ] Fund name displays
  - [ ] Current value and P&L display
  - [ ] Quantity displays
  - [ ] Avg NAV displays
  - [ ] NAV displays
  - [ ] Overall P&L displays
  - [ ] Investment displays
  - [ ] Current value displays
  - [ ] ISIN displays

### 7. WebSocket Updates ✅
- [ ] **Real-time Updates:**
  - [ ] LTP updates in real-time when WebSocket receives data
  - [ ] P&L recalculates and updates in real-time
  - [ ] Day P&L updates in real-time
  - [ ] Current Value updates in real-time
  - [ ] Stats cards update in real-time
  - [ ] Updates don't cause flickering or performance issues
  
- [ ] **Subscription/Unsubscription:**
  - [ ] WebSocket subscribes when data loads
  - [ ] WebSocket unsubscribes when component unmounts
  - [ ] No duplicate subscriptions occur

### 8. E-DIS Functionality ✅
- [ ] E-DIS button appears in toolbar when `edisbtn` is true
- [ ] Clicking E-DIS button:
  - [ ] Makes API call to get token
  - [ ] Opens E-DIS window in new tab
  - [ ] Shows error message if API fails
- [ ] DO POA button appears when E-DIS not enabled
- [ ] POA button opens correct URL

### 9. Menu Actions ✅
- [ ] **Add Order:**
  - [ ] Opens order dialog with correct symbol
  - [ ] Pre-fills with correct transaction type (B/S)
  
- [ ] **Exit Order:**
  - [ ] Opens exit order dialog
  - [ ] Pre-fills with correct data
  
- [ ] **Create GTT/GTC:**
  - [ ] Opens GTT/GTC dialog
  
- [ ] **Create Alert:**
  - [ ] Opens alert creation dialog
  
- [ ] **Market Depth:**
  - [ ] Navigates to market depth view
  
- [ ] **Chart:**
  - [ ] Navigates to chart view with correct symbol
  
- [ ] **Fundamentals:**
  - [ ] Navigates to fundamentals view
  
- [ ] **Details:**
  - [ ] Opens drawer (same as row click)

### 10. Tab Switching ✅
- [ ] Switching between Stocks and MF tabs works smoothly
- [ ] Stats cards update correctly for each tab
- [ ] Search and filter reset appropriately (optional)
- [ ] Data persists when switching tabs

### 11. Error Handling ✅
- [ ] **API Errors:**
  - [ ] Error message displays if holdings API fails
  - [ ] Error message displays if MF holdings API fails
  - [ ] Cached data loads if API fails
  - [ ] No console errors appear
  
- [ ] **Empty States:**
  - [ ] Empty state displays when no holdings
  - [ ] Empty state displays when no MF holdings
  - [ ] Stats show "0.00" when no data

### 12. Performance ✅
- [ ] Page loads within acceptable time
- [ ] No lag when WebSocket updates occur
- [ ] Search and filter respond immediately
- [ ] Table scrolling is smooth
- [ ] Drawer opens/closes smoothly
- [ ] No memory leaks (check in DevTools)
- [ ] Event listeners properly cleaned up

### 13. Responsive Design ✅
- [ ] Page works on desktop
- [ ] Page works on tablet
- [ ] Page works on mobile (if applicable)
- [ ] Table is scrollable on smaller screens
- [ ] Drawer is properly sized on all screens

### 14. Browser Compatibility ✅
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

## Code Verification Checklist

### Imports ✅
- [x] ✅ Vue 3 imports (`ref`, `computed`, `onMounted`, `onBeforeUnmount`)
- [x] ✅ Vue Router v4 (`useRouter`)
- [x] ✅ Pinia (`useAppStore`)
- [x] ✅ API functions (`getMHoldings`, `getMMHoldings`, `getQuotesdata`, `getHsTokenapi`)
- [x] ✅ CryptoJS for E-DIS

### Component Structure ✅
- [x] ✅ `<script setup>` used
- [x] ✅ No Options API syntax
- [x] ✅ All reactive state uses `ref()` or `computed()`
- [x] ✅ Functions are properly defined

### Vuetify 3 Compliance ✅
- [x] ✅ `v-tabs` uses `v-model` and `value` prop
- [x] ✅ No `v-tabs-items` or `v-tab-item`
- [x] ✅ `v-text-field` uses `variant="solo"` and `density`
- [x] ✅ `v-select` uses `item-title` and `item-value`
- [x] ✅ Data table headers use `{ title, key, align }`
- [x] ✅ `v-navigation-drawer` uses `location="right"`

### Event Handling ✅
- [x] ✅ No `eventBus` usage
- [x] ✅ Window CustomEvents used for communication
- [x] ✅ Event listeners cleaned up in `onBeforeUnmount`
- [x] ✅ WebSocket subscribe/unsubscribe implemented

## Testing Commands

### Manual Testing Steps:
1. Start the development server
2. Navigate to Holdings page
3. Go through each test case above
4. Check browser console for errors
5. Test with actual user session data

### Automated Checks (if available):
```bash
# Run linter
npm run lint

# Run type checking (if using TypeScript)
npm run type-check

# Build check
npm run build
```

## Issues Found

Document any issues found during testing:

1. 
2. 
3. 

## Testing Results Summary

- **Total Test Cases:** 
- **Passed:** 
- **Failed:** 
- **Blocked:** 
- **Overall Status:** ⏳ Testing in Progress

## Notes

- All core functionality has been migrated
- Code follows Vue 3 and Vuetify 3 best practices
- Ready for comprehensive testing
- Issues found should be documented and fixed before production

