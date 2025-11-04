# Options Tab Migration Plan

## Vue 2 to Vue 3, Vuetify 3, and Pinia Migration

### Overview

This document outlines the comprehensive migration plan for the Stock Details Options Tab from Vue 2 to Vue 3, Vuetify 3, and Pinia. The options tab displays a complex options chain table with live data updates, position tracking, Greeks calculation, and interactive features.

---

## Table of Contents

1. [Component Structure](#1-component-structure)
2. [State Management (Pinia)](#2-state-management-pinia)
3. [UI Components & Layout](#3-ui-components--layout)
4. [Data Fetching & API Integration](#4-data-fetching--api-integration)
5. [WebSocket Integration](#5-websocket-integration)
6. [Styling & Design](#6-styling--design)
7. [Functionality & Features](#7-functionality--features)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. Component Structure

### 1.1 File Organization

```
src/views/Dashboard/stocks/StocksOption.vue (Main Component)
src/stores/optionsStore.js (Pinia Store for Options Data)
src/components/mixins/getAPIdata.js (API Functions - Already exists)
src/utils/webSocketEventBus.js (WebSocket - Already exists)
```

### 1.2 Component Architecture

- **Main Component**: `StocksOption.vue` (Composition API)
- **Pinia Store**: `optionsStore.js` for:
  - Options chain data
  - Selected expiry and chain count
  - Column visibility settings
  - Position data
  - Live updates state

### 1.3 Key Sections to Migrate

1. **Toolbar Section** (Search, Expiry Selector, Chain Count, Settings)
2. **Options Chain Table** (Calls, Strikes, Puts)
3. **Settings Drawer** (Column visibility, Greeks toggle)
4. **Hover Actions** (Buy/Sell, Chart, Depth, Basket, Watchlist)
5. **Position Indicators** (Badges showing user positions)
6. **Progress Bars** (OI percentage visualization)
7. **Spot Price Row** (Current spot price indicator)

---

## 2. State Management (Pinia)

### 2.1 Create Options Store (`src/stores/optionsStore.js`)

```javascript
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useOptionsStore = defineStore("options", () => {
  // Core Data
  const optionchainid = ref(true);
  const coractdata = ref(false);
  const coractloader = ref(true);

  // Stock Symbol Info
  const optionStockSymbol = ref("");
  const optionStockSpot = ref("");
  const optionStockSymbolInfo = ref({});
  const optionStockName = ref("");

  // Expiry & Chain Settings
  const lsexd = ref([]); // Expiry dates list
  const lsexdfilter = ref(0); // Selected expiry index
  const lsexdval = ref(""); // Selected expiry value
  const daydiff = ref(null); // Days to expiry
  const ccfilter = ref(1); // Chain count filter index
  const chainCount = ref(null); // Selected chain count (5, 10, 15, 30, All)

  // Options Chain Data
  const chainStocksList = ref([]); // All options chain data
  const subscriptionchainStocksList = ref([]); // For WebSocket subscription
  const chainSpotdata = ref({}); // Spot price data
  const chainSpotPrice = ref({});

  // Segregated Options Data
  const upcallSO = ref([]); // Call options above spot
  const upputSO = ref([]); // Put options above spot
  const dwncallSO = ref([]); // Call options below spot
  const dwnputSO = ref([]); // Put options below spot
  const callsideopc = ref([]); // All call options
  const putsideopc = ref([]); // All put options

  // PCR (Put Call Ratio)
  const pcrRatio = ref(0.0);
  const pcrputRatio = ref(0.0);
  const pcrcallRatio = ref(0.0);

  // Bar Calculations
  const barCallsOi = ref(null);
  const barPutsOi = ref(null);

  // Column Visibility Settings
  const bitcheckbox = ref(true); // BID column
  const askcheckbox = ref(true); // ASK column
  const ivcheckbox = ref(false); // IV column
  const thetacheckbox = ref(false); // THETA column
  const vagacheckbox = ref(false); // VEGA column
  const gamacheckbox = ref(false); // GAMA column
  const deltacheckbox = ref(false); // DELTA column

  // Table Style Settings
  const opchtablehead = ref(10); // Column count for header
  const simtblwidth = ref("100%"); // Table width
  const simtblscroll = ref("hidden"); // Scroll behavior

  // Settings Drawer
  const drawer = ref(false);

  // Position Data
  const positiondata = ref([]);
  const positions = ref(null);

  // Greeks Counter
  const greekCount = ref(0);

  // Data Processing Arrays
  const data1 = ref([]); // Processed expiry dates
  const tsym = ref([]); // Symbol list
  const optionchain = ref([]); // Raw option chain data
  const opexch = ref(""); // Options exchange
  const securityinfo = ref([]); // Security information
  const opname = ref(""); // Option name

  // Computed Properties
  const opdatabgs = computed(() => {
    // Calculate background color based on theme
    return `background-color: ${
      isDark.value ? "#1E222D" : "#F9FCFF"
    } !important;`;
  });

  // Actions
  const clearOption = (flow) => {
    // Clear all option data
  };

  const setOptionChainData = (data) => {
    // Set option chain data
  };

  const updateOptionChainFromWebSocket = (data) => {
    // Update option chain from WebSocket
  };

  const calculatePCR = () => {
    // Calculate Put Call Ratio
  };

  const updateColumnVisibility = () => {
    // Update table column visibility
  };

  return {
    // State
    optionchainid,
    coractdata,
    coractloader,
    optionStockSymbol,
    optionStockSpot,
    optionStockSymbolInfo,
    optionStockName,
    lsexd,
    lsexdfilter,
    lsexdval,
    daydiff,
    ccfilter,
    chainCount,
    chainStocksList,
    subscriptionchainStocksList,
    chainSpotdata,
    chainSpotPrice,
    upcallSO,
    upputSO,
    dwncallSO,
    dwnputSO,
    callsideopc,
    putsideopc,
    pcrRatio,
    pcrputRatio,
    pcrcallRatio,
    barCallsOi,
    barPutsOi,
    bitcheckbox,
    askcheckbox,
    ivcheckbox,
    thetacheckbox,
    vagacheckbox,
    gamacheckbox,
    deltacheckbox,
    opchtablehead,
    simtblwidth,
    simtblscroll,
    drawer,
    positiondata,
    positions,
    greekCount,
    data1,
    tsym,
    optionchain,
    opexch,
    securityinfo,
    opname,
    // Computed
    opdatabgs,
    // Actions
    clearOption,
    setOptionChainData,
    updateOptionChainFromWebSocket,
    calculatePCR,
    updateColumnVisibility,
  };
});
```

### 2.2 Store Integration Points

- Load column visibility settings from `localStorage`
- Save column visibility settings to `localStorage`
- Manage WebSocket subscriptions
- Handle position data integration
- Calculate PCR ratios
- Update Greeks calculations

---

## 3. UI Components & Layout

### 3.1 Toolbar Section

**Vue 2 Components → Vue 3/Vuetify 3:**

- `v-toolbar` → `v-toolbar` (Vuetify 3)
- `v-btn` → `v-btn` (Vuetify 3)
- `v-menu` → `v-menu` (Vuetify 3)
- `v-list-item-group` → `v-list-item-group` (Vuetify 3)

**Features:**

1. **Search Button**: Opens option search dialog
2. **Expiry Date Selector**: Dropdown menu with expiry dates
3. **Chain Count Selector**: Dropdown (5, 10, 15, 30, All)
4. **Basket Order Button**: Opens basket order dialog
5. **Settings Button**: Toggles settings drawer

### 3.2 Options Chain Table

**Vue 2 → Vue 3:**

- `v-simple-table` → `v-table` (Vuetify 3)
- Custom table structure with:
  - **Header Row 1**: "CALLS" | "PUTS" (spans)
  - **Header Row 2**: Column headers (Greeks, VOL, OI, BID, ASK, CH, LTP, IV, STRIKES, IV, LTP, CH, BID, ASK, OI, VOL, Greeks)
  - **Body Rows**: Option data rows (above spot, spot row, below spot)
  - **Footer Row**: PCR ratios

**Table Structure:**

```
CALLS (Left Side)          STRIKES (Center)          PUTS (Right Side)
- THETA (optional)                                  - LTP
- VEGA (optional)                                   - CH
- GAMA (optional)                                   - BID (optional)
- DELTA (optional)                                  - ASK (optional)
- VOL                                               - OI
- OI (with progress bar)                            - VOL
- BID (optional)                                    - DELTA (optional)
- ASK (optional)                                    - GAMA (optional)
- CH                                                - VEGA (optional)
- LTP                                               - THETA (optional)
- IV (optional)
```

### 3.3 Settings Drawer

**Vue 2 → Vue 3:**

- `v-navigation-drawer` → `v-navigation-drawer` (Vuetify 3)
- `v-checkbox` → `v-checkbox` (Vuetify 3)

**Settings:**

1. **Add Columns**:
   - BID checkbox
   - ASK checkbox
   - IV checkbox
2. **Add Greeks**:
   - DELTA checkbox
   - GAMA checkbox
   - VEGA checkbox
   - THETA checkbox
3. **Info Section**:
   - OI percentage bar explanation
   - Bullish/Bearish indicators explanation

### 3.4 Hover Actions Row

**Vue 2 → Vue 3:**

- Custom hover row with buttons:
  - **Chart** (mdi-chart-line-variant)
  - **Depth** (mdi-format-align-center)
  - **Basket** (basket icon)
  - **Watchlist** (mdi-bookmark-outline)
  - **Sell** (red button "S")
  - **Buy** (green button "B")

**Implementation:**

- Use `v-btn` with custom styling
- Position absolute with hover visibility
- Match old app's hover behavior

### 3.5 Spot Price Row

**Vue 2 → Vue 3:**

- Special row showing current spot price
- Orange progress bar indicator
- Scrolls into view on load

### 3.6 Position Badges

**Vue 2 → Vue 3:**

- Tooltip icons showing user positions
- Color-coded (green for profit, red for loss)
- Clickable to navigate to positions page

---

## 4. Data Fetching & API Integration

### 4.1 API Functions (Already in `getAPIdata.js`)

- `getMasters(symbol)` - Get master data for symbol
- `getQuotesdata(query)` - Get quote data
- `getOptionschain(query)` - Get options chain data
- `getGreekoptions(data)` - Calculate Greeks (IV, Delta, Gamma, Vega, Theta)
- `getMPosotion()` - Get user positions

### 4.2 Data Flow

1. **Initial Load**:

   - Get symbol from `localStorage` or route params
   - Call `getMasters()` to get symbol info
   - Call `getOptionschain()` to get option chain
   - Process and segregate data (calls/puts, above/below spot)
   - Calculate PCR ratios
   - Calculate OI bars

2. **Expiry Change**:

   - Filter by selected expiry
   - Re-fetch option chain for new expiry
   - Update all data

3. **Chain Count Change**:

   - Filter option chain by count
   - Update display

4. **Greeks Calculation**:
   - On-demand calculation when column is visible
   - Use `getGreekoptions()` API
   - Cache results per option

### 4.3 Data Processing Functions

```javascript
// Process option chain data
function processOptionChain(chainData, spotPrice) {
  // Sort by strike price
  // Separate calls and puts
  // Separate above and below spot
  // Calculate OI percentages
  // Prepare for display
}

// Calculate OI progress bars
function calculateOIProgress(callsData, putsData) {
  // Find max OI for calls and puts
  // Calculate percentage for each option
  // Set progress bar width
}

// Calculate PCR
function calculatePCR(callsData, putsData) {
  // Sum all call OI
  // Sum all put OI
  // Calculate ratio
}
```

---

## 5. WebSocket Integration

### 5.1 WebSocket Subscription

**Vue 2 → Vue 3:**

- `eventBus.$on('web-scoketConn', ...)` → `window.addEventListener('web-scoketConn', ...)`
- Subscribe to:
  - Option chain tokens
  - Spot price token

### 5.2 WebSocket Update Handler

**Function**: `optionChainDataParse(data)`

**Updates:**

- LTP (Last Traded Price)
- Bid/Ask
- Change & Change %
- OI (Open Interest) & OI Change
- Volume
- Bar colors (based on price change and OI change)
- Position data (MTM calculations)

### 5.3 Live Updates Flow

1. Receive WebSocket data
2. Match token to option in chain
3. Update corresponding data (upcallSO, upputSO, dwncallSO, dwnputSO)
4. Update DOM elements directly for performance
5. Recalculate PCR if needed
6. Update progress bars
7. Update position badges if applicable

### 5.4 WebSocket Event Handler

```javascript
function handleWebSocketUpdate(event) {
  const data = event.detail;
  if (data && data.page === "stockSSD") {
    optionChainDataParse(data);
  }
}
```

---

## 6. Styling & Design

### 6.1 CSS Variables

Use existing CSS variables:

- `var(--maingreen)` - Green for positive values
- `var(--mainred)` - Red for negative values
- `var(--secgreen)` - Light green
- `var(--secred)` - Light red
- `var(--maintext)` - Main text color
- `var(--subtext)` - Sub text color
- `var(--cardbg)` - Card background
- `var(--secbg)` - Secondary background
- `var(--outline)` - Border color

### 6.2 Custom Classes

- `.opdatas` - Table cell padding
- `.opstrprcborder` - Strike price border
- `.lftbarstatus` - Left bar (call side)
- `.rgtbarstatus` - Right bar (put side)
- `.optionheadsty` - Header text style
- `.optiondatasty` - Data text style
- `.optionchsty` - Change text style
- `.opdatacalluphov` - Hover container
- `.callprogress` - Call OI progress bar
- `.putprogress` - Put OI progress bar
- `.totrhover` - Row hover class
- `.lfttrbtn` - Left hover buttons
- `.uprghtrbtn` - Upper right hover buttons
- `.dwnrghtrbtn` - Lower right hover buttons
- `.newhoverbtn` - Hover button style
- `.badghlpos` - Badge left position
- `.badghrpos` - Badge right position

### 6.3 Table Styling

- Fixed header
- Horizontal scroll for wide tables
- Dynamic width based on visible columns
- Alternating row backgrounds
- Hover effects on rows

### 6.4 Progress Bars

- OI percentage bars using CSS `::after` pseudo-element
- Dynamic width based on `--my-width-var` CSS variable
- Color-coded based on price change and OI change

### 6.5 Color Coding

- **Green**: Positive change, bullish trend
- **Red**: Negative change, bearish trend
- **Light Green**: Short covering
- **Light Red**: Long unwinding
- **Gray**: No change

---

## 7. Functionality & Features

### 7.1 Option Search

**Function**: `setWaiting(tsym, exit)`

- Parse symbol from `localStorage` or route
- Match to underlying symbol
- Load option chain if available
- Navigate if symbol is option

### 7.2 Expiry Date Selection

**Function**: `optionChainDate()`

- Calculate days to expiry
- Filter options by expiry
- Fetch option chain for selected expiry
- Update display

### 7.3 Chain Count Selection

**Function**: `optionChainDate()`

- Filter options by count (5, 10, 15, 30, All)
- Update display

### 7.4 Column Visibility

**Function**: `simpleTablestyle()`

- Calculate table width based on visible columns
- Update `opchtablehead` (column count)
- Update `simtblwidth` and `simtblscroll`
- Save to `localStorage`

### 7.5 Greeks Calculation

**Function**: `getGreekValues(section, optionData, index)`

- Calculate on-demand when column is visible
- Cache results
- Update option data

### 7.6 Position Integration

**Function**: `getPositionbook()`

- Load user positions
- Match positions to options in chain
- Display position badges
- Calculate MTM (Mark to Market)
- Update position indicators

### 7.7 Hover Actions

**Functions:**

- `buyOption(script, ...)` - Open buy order dialog
- `sellOption(script, ...)` - Open sell order dialog
- `chartOption(script, ...)` - Navigate to chart
- `depthOption(script, ...)` - Navigate to market depth
- `basketOption(script, ...)` - Add to basket
- `addOption(script, ...)` - Add to watchlist

### 7.8 Basket Order

**Function**: `setBaskorder(type, data)`

- Emit event to open basket order dialog
- Add option to basket with default values

### 7.9 Scroll to Spot

**Function**: `scrollToChainSpot()`

- Scroll to spot price row on load
- Use `scrollIntoView()` with smooth behavior

---

## 8. Testing Checklist

### 8.1 Initial Load

- [ ] Options chain loads correctly
- [ ] Spot price displays
- [ ] Expiry dates populate
- [ ] Default chain count (10) works
- [ ] Table scrolls to spot price

### 8.2 Expiry Selection

- [ ] Expiry dropdown works
- [ ] Days to expiry calculates correctly
- [ ] Option chain updates on expiry change
- [ ] Data refreshes correctly

### 8.3 Chain Count Selection

- [ ] Chain count dropdown works
- [ ] Options filter correctly by count
- [ ] All options display when "All" selected

### 8.4 Column Visibility

- [ ] BID column toggles correctly
- [ ] ASK column toggles correctly
- [ ] IV column toggles correctly
- [ ] Greeks columns toggle correctly
- [ ] Table width adjusts correctly
- [ ] Settings persist in localStorage

### 8.5 WebSocket Updates

- [ ] LTP updates live
- [ ] Bid/Ask updates live
- [ ] Change & Change % updates live
- [ ] OI updates live
- [ ] Volume updates live
- [ ] Progress bars update live
- [ ] Bar colors update based on changes
- [ ] Spot price updates live

### 8.6 Position Integration

- [ ] Position badges display correctly
- [ ] Position tooltips show correct data
- [ ] Position badges navigate to positions page
- [ ] MTM calculations are correct
- [ ] Position colors are correct (green/red)

### 8.7 Hover Actions

- [ ] Hover buttons appear on row hover
- [ ] Buy button opens buy dialog with correct data
- [ ] Sell button opens sell dialog with correct data
- [ ] Chart button navigates to chart
- [ ] Depth button navigates to market depth
- [ ] Basket button adds to basket
- [ ] Watchlist button adds to watchlist

### 8.8 Greeks Calculation

- [ ] Greeks calculate when column is visible
- [ ] IV displays correctly
- [ ] Delta displays correctly
- [ ] Gamma displays correctly
- [ ] Vega displays correctly
- [ ] Theta displays correctly
- [ ] Greeks cache correctly

### 8.9 PCR Calculation

- [ ] PCR ratio calculates correctly
- [ ] PCR call ratio displays correctly
- [ ] PCR put ratio displays correctly
- [ ] PCR updates on data changes

### 8.10 Progress Bars

- [ ] OI progress bars display correctly
- [ ] Progress bar width is accurate
- [ ] Progress bars update on OI changes

### 8.11 Basket Order

- [ ] Basket order button works
- [ ] Option adds to basket with correct defaults
- [ ] Basket order dialog opens

### 8.12 Settings Drawer

- [ ] Settings drawer opens/closes correctly
- [ ] Checkboxes toggle correctly
- [ ] Info sections display correctly
- [ ] Settings save to localStorage

### 8.13 Search Functionality

- [ ] Search button opens search dialog
- [ ] Symbol search works correctly
- [ ] Option chain loads for selected symbol

### 8.14 Responsive Design

- [ ] Table scrolls horizontally on small screens
- [ ] Toolbar is responsive
- [ ] Settings drawer works on mobile

### 8.15 Error Handling

- [ ] Error messages display for API failures
- [ ] Loading states display correctly
- [ ] Empty states display when no data
- [ ] Invalid symbol handling

---

## 9. Implementation Phases

### Phase 1: Basic Structure & Data Fetching

1. Create Pinia store
2. Set up component structure
3. Implement data fetching
4. Display basic table structure

### Phase 2: Table Layout & Columns

1. Implement table headers
2. Implement table body rows
3. Add column visibility logic
4. Implement table styling

### Phase 3: Interactive Features

1. Implement expiry selector
2. Implement chain count selector
3. Implement settings drawer
4. Implement column visibility toggles

### Phase 4: WebSocket Integration

1. Set up WebSocket subscriptions
2. Implement update handler
3. Update DOM elements
4. Test live updates

### Phase 5: Advanced Features

1. Implement Greeks calculation
2. Implement position integration
3. Implement PCR calculation
4. Implement progress bars

### Phase 6: Hover Actions & Interactions

1. Implement hover action buttons
2. Implement buy/sell actions
3. Implement chart/depth navigation
4. Implement basket/watchlist actions

### Phase 7: Styling & Polish

1. Match all styles to old app
2. Implement hover effects
3. Implement color coding
4. Implement responsive design

### Phase 8: Testing & Bug Fixes

1. Test all functionality
2. Fix bugs
3. Optimize performance
4. Final polish

---

## 10. Key Migration Points

### 10.1 Vue 2 → Vue 3

- `data()` → `ref()` / `reactive()`
- `computed` → `computed()`
- `methods` → Regular functions
- `$set` → Direct assignment (Vue 3 reactivity)
- `this.` → Remove `this`, use refs directly
- `eventBus.$emit` → `window.dispatchEvent(new CustomEvent(...))`
- `eventBus.$on` → `window.addEventListener(...)`
- `eventBus.$off` → `window.removeEventListener(...)`
- `$vuetify.theme.dark` → Use theme store or computed

### 10.2 Vuetify 2 → Vuetify 3

- `v-tabs-items` → `v-window`
- `v-tab-item` → `v-window-item`
- `v-simple-table` → `v-table`
- `v-list-item-group` → `v-list-item-group` (same but check API)
- `v-navigation-drawer` → `v-navigation-drawer` (check props)
- `v-menu offset-y` → `v-menu location="bottom"`

### 10.3 Event Bus → Custom Events

- `eventBus.$emit('menudialog', ...)` → `window.dispatchEvent(new CustomEvent('menudialog', { detail: {...} }))`
- `eventBus.$emit('ssd-event', ...)` → `window.dispatchEvent(new CustomEvent('ssd-event', { detail: {...} }))`
- `eventBus.$emit('bskwatch-event', ...)` → `window.dispatchEvent(new CustomEvent('bskwatch-event', { detail: {...} }))`
- `eventBus.$emit('addscript-wl', ...)` → `window.dispatchEvent(new CustomEvent('addscript-wl', { detail: {...} }))`

### 10.4 localStorage Integration

- Load column visibility settings on mount
- Save column visibility settings on change
- Load option chain data from cache if available

---

## 11. Code Examples

### 11.1 Component Setup

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useOptionsStore } from "@/stores/optionsStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getMasters,
  getOptionschain,
  getQuotesdata,
  getGreekoptions,
  getMPosotion,
} from "@/components/mixins/getAPIdata";

const route = useRoute();
const optionsStore = useOptionsStore();
const authStore = useAuthStore();

// ... implementation
</script>
```

### 11.2 WebSocket Event Handler

```javascript
function handleWebSocketUpdate(event) {
  const detail = event.detail;
  if (detail && detail.page === "stockSSD" && optionsStore.chainStocksList) {
    optionChainDataParse(detail);
  }
}

onMounted(() => {
  window.addEventListener("web-scoketConn", handleWebSocketUpdate);
  window.addEventListener("ssd-event", handleSSDEvent);
  window.addEventListener("orderbook-update", handleOrderbookUpdate);
});

onUnmounted(() => {
  window.removeEventListener("web-scoketConn", handleWebSocketUpdate);
  window.removeEventListener("ssd-event", handleSSDEvent);
  window.removeEventListener("orderbook-update", handleOrderbookUpdate);
});
```

### 11.3 Table Row Structure

```vue
<tbody>
  <tr v-for="(script, k) in optionsStore.upcallSO" :key="'calloption' + k" class="totrhover">
    <!-- Call columns (left side) -->
    <th v-if="optionsStore.deltacheckbox" colspan="1" class="text-center pa-0">
      <div class="optiondatasty">{{ script.delta || '0.0000' }}</div>
    </th>
    <!-- ... more call columns ... -->
    
    <!-- Strike price (center) -->
    <th colspan="4" class="text-center opstrprcborder opdatacalluphov pos-rlt">
      <div class="lftbarstatus" :style="`--my-lftbrdclr-var:${script.bar};`"></div>
      <span class="subtitle-2 font-weight-bold">{{ script.strprc }}</span>
      <div class="rgtbarstatus" :style="`--my-rgtbrdclr-var:${putOption.bar};`"></div>
    </th>
    
    <!-- Put columns (right side) -->
    <!-- ... put columns ... -->
    
    <!-- Hover actions row -->
    <tr v-if="script.token" class="opdatacallupbtn lfttrbtn">
      <th colspan="1" @click="chartOption(script)">
        <v-btn icon size="x-small">...</v-btn>
      </th>
      <!-- ... more hover buttons ... -->
    </tr>
  </tr>
</tbody>
```

---

## 12. Dependencies

### 12.1 Required Packages

- `vue@^3.x`
- `vuetify@^3.x`
- `pinia@^2.x`
- `vue-router@^4.x`

### 12.2 API Functions

- `getMasters()` - Get master data
- `getQuotesdata()` - Get quote data
- `getOptionschain()` - Get options chain
- `getGreekoptions()` - Calculate Greeks
- `getMPosotion()` - Get positions

### 12.3 WebSocket

- Use existing `webSocketEventBus.js`
- Subscribe to `web-scoketConn` events
- Page identifier: `'stockSSD'`

---

## 13. Estimated Timeline

- **Phase 1**: 2-3 days (Structure & Data Fetching)
- **Phase 2**: 2-3 days (Table Layout)
- **Phase 3**: 2-3 days (Interactive Features)
- **Phase 4**: 2-3 days (WebSocket)
- **Phase 5**: 3-4 days (Advanced Features)
- **Phase 6**: 2-3 days (Hover Actions)
- **Phase 7**: 2-3 days (Styling)
- **Phase 8**: 2-3 days (Testing)

**Total**: ~18-25 days

---

## 14. Notes

1. **Performance**: Use direct DOM updates for WebSocket data to avoid Vue reactivity overhead
2. **Caching**: Cache Greeks calculations to avoid repeated API calls
3. **Memory**: Clean up WebSocket subscriptions on unmount
4. **Responsiveness**: Ensure table scrolls horizontally on smaller screens
5. **Accessibility**: Maintain keyboard navigation and screen reader support
6. **Error Handling**: Handle API failures gracefully with user-friendly messages
7. **Loading States**: Show loading indicators during data fetching
8. **Empty States**: Display appropriate messages when no data is available

---

## End of Migration Plan
