# Stocks Details - Overview Tab Migration TODO Checklist

## 📋 Quick Reference Implementation Checklist

### ✅ Phase 1: Code Understanding & Analysis
- [x] Read old Vue 2 component (`SuperApp-FE-main-2/src/views/Dashboard/stocks/StocksOverview.vue`)
- [x] Read new Vue 3 component (`superApp_v4/src/views/Dashboard/stocks/StocksOverview.vue`)
- [x] Identify all props, emits, and dependencies
- [x] Map all API calls and data sources
- [x] Document EventBus → Custom Events migration
- [x] Identify all Vuetify components used

### ✅ Phase 2: Setup & Infrastructure
- [ ] **Create Pinia Store** (Optional - currently using global cache)
  - [ ] Create `stores/stocksOverviewStore.js`
  - [ ] Define state structure:
    ```javascript
    {
      menudata: [],
      imageicon: null,
      stockreturns: [],
      stkltp: 0,
      lwchartis: false
    }
    ```
  - [ ] Create actions:
    - [ ] `setSingleData(token, exch, tsym)`
    - [ ] `getReturns(token)`
    - [ ] `setHoldbadge(token)`
    - [ ] `optionChainDataParse(data)`
  - [ ] Export store

- [ ] **Create Composable Functions** (Recommended)
  - [ ] Create `composables/useStocksOverview.js`
  - [ ] Implement `useStockData()`:
    ```javascript
    export function useStockData() {
      const menudata = ref([])
      const setSingleData = async (token, exch, tsym) => { ... }
      return { menudata, setSingleData }
    }
    ```
  - [ ] Implement `useWebSocketUpdates()`:
    ```javascript
    export function useWebSocketUpdates() {
      const handleWebSocketConnection = (event) => { ... }
      return { handleWebSocketConnection }
    }
    ```
  - [ ] Implement `useOverviewCalculations()`:
    ```javascript
    export function useOverviewCalculations() {
      const computeReturnPercent = (baseValue) => { ... }
      return { computeReturnPercent }
    }
    ```
  - [ ] Implement `useHoldingsBadge()`:
    ```javascript
    export function useHoldingsBadge() {
      const setHoldbadge = (tk) => { ... }
      return { setHoldbadge }
    }
    ```

- [x] **Event System Migration** (Already done)
  - [x] Replace `eventBus.$on()` with `window.addEventListener()`
  - [x] Replace `eventBus.$emit()` with `window.dispatchEvent()`
  - [ ] Verify all event listeners are cleaned up in `onBeforeUnmount`
  - [ ] Test event propagation

---

### 🔧 Phase 3: Template Migration

#### 3.1 Stock Header Card (Lines 4-78)
- [ ] Verify `v-avatar` renders correctly
  - [ ] Test image loading
  - [ ] Test fallback to first letter
  - [ ] Test error handling
- [ ] Verify chip group displays correctly
  - [ ] Industry chip
  - [ ] Market cap chip
  - [ ] Holdings badge chip (if applicable)
- [ ] Verify LTP display
  - [ ] Test price formatting
  - [ ] Test change percentage display
  - [ ] Test color coding (green/red)
- [ ] Test responsive layout
  - [ ] Desktop (md and up)
  - [ ] Mobile (sm and below)

**Vuetify 2 → 3 Component Checks**:
- [x] `v-list-item-avatar` → `v-avatar` (Already done)
- [x] `v-list-item-content` → Custom div (Already done)
- [ ] `v-chip-group` - Verify `mandatory` prop works
- [ ] `v-chip` - Verify `size="small"` works (was `small` in V2)
- [ ] `v-chip` - Verify `variant="outlined"` works (was `outlined` in V2)

#### 3.2 Lightweight Chart Section (Lines 72-77)
- [x] Component already migrated
- [ ] Test chart renders on mount
- [ ] Test chart updates when `propstsym` changes
- [ ] Test time range toggles (1D, 1W, 1M, 1Y, YTD, MAX)
- [ ] Test theme switching (dark/light mode)
- [ ] Test chart disposal on unmount

#### 3.3 Stock Statistics Card (Lines 80-333)

**Left Column - Market Stats**:
- [ ] Verify Market Cap display
- [ ] Verify Volume display (with real-time updates)
- [ ] Verify Open Price display
- [ ] Verify Close Price display
- [ ] Verify High-Low slider
  - [ ] Test slider renders when price is between high/low
  - [ ] Test slider doesn't render when price is outside range
  - [ ] Test readonly slider functionality
- [ ] Verify 52-week High-Low slider
  - [ ] Test slider renders when price is between 52w high/low
  - [ ] Test slider doesn't render when price is outside range

**Right Column - Market Depth**:
- [ ] Verify Market Depth section renders
- [ ] Verify Buy/Sell order Qty percentages display
- [ ] Verify `v-progress-linear` with `:model-value` (not `:value`)
- [ ] Verify Bid/Ask depth table
  - [ ] Test bid depth rows render
  - [ ] Test ask depth rows render
  - [ ] Test quantity bars display correctly
  - [ ] Test hover effects on depth rows
- [ ] Verify non-tradable overlay
  - [ ] Test overlay shows for indices (UNDIND)
  - [ ] Test overlay shows for commodities (COM)

**Vuetify 2 → 3 Component Checks**:
- [x] `v-progress-linear` - Use `:model-value` instead of `:value` (Already done)
- [ ] `v-slider` - Verify `readonly` prop works
- [ ] `v-slider` - Verify `min` and `max` props work
- [ ] `v-list-item` - Verify structure is Vuetify 3 compatible
- [ ] `v-list-item-subtitle` - Verify works correctly
- [ ] `v-list-item-title` - Verify works correctly

#### 3.4 Additional Stats Row (Lines 261-332)
- [ ] Verify Avg price display
- [ ] Verify OI (Open Interest) display
- [ ] Verify Upper circuit level display
- [ ] Verify Lower circuit level display
- [ ] Verify Last trade qty display
- [ ] Verify Last trade time display
- [ ] Test real-time DOM updates work correctly
- [ ] Consider: Refactor DOM manipulation to Vue reactivity (optional)

#### 3.5 Returns Cards (Lines 336-365)
- [ ] Verify all 6 return periods display:
  - [ ] 1 day
  - [ ] 1 week
  - [ ] 2 week
  - [ ] 1 month
  - [ ] 3 month
  - [ ] 1 year
- [ ] Verify color coding:
  - [ ] Green for positive returns
  - [ ] Red for negative returns
  - [ ] Gray for zero/neutral
- [ ] Verify calculation accuracy:
  - [ ] Test `computeReturnPercent()` function
  - [ ] Test edge cases (zero values, negative values)
- [ ] Test empty state handling

#### 3.6 Pivot Levels (Lines 367-393)
- [ ] Verify all 6 pivot levels display:
  - [ ] S3 (Support 3)
  - [ ] S2 (Support 2)
  - [ ] S1 (Support 1)
  - [ ] R1 (Resistance 1)
  - [ ] R2 (Resistance 2)
  - [ ] R3 (Resistance 3)
- [ ] Verify visual indicator:
  - [ ] Test indicator shows when price is between levels
  - [ ] Test indicator position calculation
- [ ] Verify pivot point display
- [ ] Verify color coding:
  - [ ] Red for support levels
  - [ ] Green for resistance levels
- [ ] Test empty state handling

---

### 💻 Phase 4: Script Migration

#### 4.1 Reactive Data
- [x] Convert `data()` to `ref()` (Already done)
- [ ] Verify all refs are properly initialized:
  ```javascript
  const mainloader = ref(true)
  const menudata = ref([])
  const imageicon = ref(null)
  const stockreturns = ref([])
  const stkltp = ref(0)
  const lwchartis = ref(false)
  ```
- [ ] Test reactivity updates work correctly

#### 4.2 Helper Functions
- [ ] Verify `computeReturnPercent()` function:
  ```javascript
  const computeReturnPercent = (baseValue) => {
    const ltp = Number(menudata.value[0]?.ltp || 0)
    const base = Number(baseValue)
    if (!ltp || !base || base <= 0) return '0.00'
    const pct = ((ltp - base) / base) * 100
    return isFinite(pct) ? pct.toFixed(2) : '0.00'
  }
  ```
- [ ] Verify `getPriceCache()` function
- [ ] Verify `setPriceCache()` function
- [ ] Verify `initializeOverviewFromQuote()` function

#### 4.3 Main Methods
- [ ] Verify `setWaiting()` function:
  - [ ] Test waiting logic
  - [ ] Test timeout handling
- [ ] Verify `setSingleData()` function:
  - [ ] Test data loading from `window.ssddetail`
  - [ ] Test image icon URL generation
  - [ ] Test fundamental data extraction
  - [ ] Test WebSocket subscription
  - [ ] Test holdings badge setting
- [ ] Verify `getReturns()` function:
  - [ ] Test loading from cache
  - [ ] Test retry logic if cache empty
  - [ ] Test returns array creation
  - [ ] Test pivot levels creation
- [ ] Verify `setHoldbadge()` function:
  - [ ] Test holdings data retrieval
  - [ ] Test badge display logic
- [ ] Verify `setWebsocket()` function:
  - [ ] Test custom event dispatch
  - [ ] Test subscription/unsubscription

#### 4.4 WebSocket Data Parser
- [ ] Verify `optionChainDataParse()` function:
  - [ ] Test price updates (ltp, ch, chp)
  - [ ] Test high/low price updates
  - [ ] Test 52-week high/low updates
  - [ ] Test open/close price updates
  - [ ] Test volume updates
  - [ ] Test average price updates
  - [ ] Test OI updates
  - [ ] Test circuit level updates
  - [ ] Test last trade qty/time updates
  - [ ] Test bid/ask qty updates
  - [ ] Test market depth updates
  - [ ] Test DOM updates for real-time display
  - [ ] Test cache updates
  - [ ] Test returns card updates

#### 4.5 Event Handlers
- [ ] Verify `handleSSDEvent()` function:
  - [ ] Test event listener setup
  - [ ] Test symbol change handling
  - [ ] Test WebSocket unsubscription
  - [ ] Test data clearing
  - [ ] Test waiting logic
- [ ] Verify `handleLWCEvent()` function:
  - [ ] Test chart toggle handling
- [ ] Verify `handleWebSocketConnection()` function:
  - [ ] Test WebSocket data parsing
  - [ ] Test different data formats (array vs object)

#### 4.6 Lifecycle Hooks
- [ ] Verify `onMounted()` hook:
  - [ ] Test localStorage data loading
  - [ ] Test event listener setup
  - [ ] Test initial data loading
- [ ] Verify `onBeforeUnmount()` hook:
  - [ ] Test event listener cleanup
  - [ ] Test WebSocket cleanup
  - [ ] Test memory leak prevention

---

### 🔌 Phase 5: API Integration

#### 5.1 API Functions
- [ ] Verify `getMHoldingdata()` function exists and works
- [ ] Test API response format
- [ ] Add error handling for API calls
- [ ] Add loading states for API calls

#### 5.2 Data Fetching
- [ ] Verify `window.ssddetail` data structure:
  - [ ] `window.ssddetail[0]` - Quote data
  - [ ] `window.ssddetail[1]` - Stock details
- [ ] Verify `window.ssdreqdata.data[token]` structure:
  - [ ] `window.ssdreqdata.data[token].t` - Technical data
- [ ] Add fallback if global cache is empty
- [ ] Add error handling for missing data

#### 5.3 WebSocket Integration
- [ ] Verify WebSocket subscription:
  - [ ] Test subscription on component mount
  - [ ] Test subscription on symbol change
- [ ] Verify WebSocket unsubscription:
  - [ ] Test unsubscription on symbol change
  - [ ] Test unsubscription on component unmount
- [ ] Test real-time price updates
- [ ] Test real-time volume updates
- [ ] Test real-time market depth updates
- [ ] Add error handling for WebSocket failures
- [ ] Add reconnection logic if needed

---

### 🎨 Phase 6: Vuetify 2 → 3 Component Migration

#### 6.1 Component Updates
- [ ] `v-card` - Verify props (should be compatible)
- [ ] `v-avatar` - Test size, color props
- [ ] `v-chip` - Test:
  - [ ] `size="small"` (was `small` in V2)
  - [ ] `variant="outlined"` (was `outlined` in V2)
  - [ ] `label` prop (if needed)
- [ ] `v-chip-group` - Test:
  - [ ] `mandatory` prop
  - [ ] `active-class` prop
  - [ ] `@update:model-value` (was `@change` in V2)
- [ ] `v-list-item` - Verify structure
- [ ] `v-list-item-subtitle` - Verify works
- [ ] `v-list-item-title` - Verify works
- [ ] `v-progress-linear` - Test:
  - [ ] `:model-value` instead of `:value` ✅ (Already done)
  - [ ] `color` prop
  - [ ] `indeterminate` prop
- [ ] `v-slider` - Test:
  - [ ] `readonly` prop
  - [ ] `min` and `max` props
  - [ ] `v-model` binding
  - [ ] `thumb-color` prop
  - [ ] `track-color` prop
- [ ] `v-divider` - Verify works
- [ ] `v-row` - Verify `no-gutters` prop (should be `no-gutters` in V3)
- [ ] `v-col` - Verify breakpoints work

#### 6.2 Prop Updates
- [x] `v-progress-linear` - `:value` → `:model-value` ✅ (Already done)
- [ ] `v-chip` - `outlined` → `variant="outlined"`
- [ ] `v-chip` - `small` → `size="small"`
- [ ] `v-chip-group` - `@change` → `@update:model-value` (Already done)
- [ ] Verify all other props work correctly

#### 6.3 Class Updates
- [ ] Verify custom CSS classes work:
  - [ ] `.depthrow-b`, `.depthrow-a`
  - [ ] `.pivot`
  - [ ] `.crd-trn`, `.ss-cards`
- [ ] Verify color classes work:
  - [ ] `maingreen--text`, `mainred--text`
  - [ ] `subtext--text`, `maintext--text`
  - [ ] `secgreen`, `secred`, `secbg`
- [ ] Test dark mode compatibility
- [ ] Test light mode compatibility

---

### 🧪 Phase 7: Functionality Testing

#### 7.1 Stock Header Card
- [ ] Test stock icon/image loading
- [ ] Test image error fallback to first letter
- [ ] Test company name display
- [ ] Test industry chip display
- [ ] Test market cap chip display
- [ ] Test holdings badge display (when applicable)
- [ ] Test LTP display with real-time updates
- [ ] Test change percentage display
- [ ] Test color coding (green for positive, red for negative)

#### 7.2 Lightweight Chart
- [ ] Test chart renders on component mount
- [ ] Test chart updates when symbol changes
- [ ] Test time range toggles:
  - [ ] 1D (1 day)
  - [ ] 1W (1 week)
  - [ ] 1M (1 month)
  - [ ] 1Y (1 year)
  - [ ] YTD (Year to date)
  - [ ] MAX (Maximum)
- [ ] Test real-time price updates on chart
- [ ] Test theme switching (dark/light mode)
- [ ] Test chart disposal on unmount

#### 7.3 Stock Statistics
- [ ] Test Market Cap display
- [ ] Test Volume display with real-time updates
- [ ] Test Open Price display
- [ ] Test Close Price display
- [ ] Test High-Low slider:
  - [ ] Renders when price is between high/low
  - [ ] Doesn't render when price is outside range
  - [ ] Shows current price position
- [ ] Test 52-week High-Low slider:
  - [ ] Renders when price is between 52w high/low
  - [ ] Doesn't render when price is outside range
  - [ ] Shows current price position
- [ ] Test Market Depth display:
  - [ ] Buy/Sell order Qty percentages
  - [ ] Progress bars display correctly
  - [ ] Bid/Ask depth table renders
  - [ ] Quantity bars display correctly
  - [ ] Hover effects work
- [ ] Test non-tradable overlay:
  - [ ] Shows for indices (UNDIND)
  - [ ] Shows for commodities (COM)

#### 7.4 Additional Stats
- [ ] Test Avg price display with real-time updates
- [ ] Test OI display with real-time updates
- [ ] Test Upper circuit level display
- [ ] Test Lower circuit level display
- [ ] Test Last trade qty display with real-time updates
- [ ] Test Last trade time display with real-time updates
- [ ] Test all stats update in real-time via WebSocket

#### 7.5 Returns Cards
- [ ] Test all 6 return periods display correctly
- [ ] Test calculation accuracy for each period
- [ ] Test color coding:
  - [ ] Green for positive returns
  - [ ] Red for negative returns
  - [ ] Gray for zero/neutral
- [ ] Test empty state when no returns data
- [ ] Test real-time updates when price changes

#### 7.6 Pivot Levels
- [ ] Test all 6 pivot levels display correctly
- [ ] Test visual indicator position:
  - [ ] Shows when price is between levels
  - [ ] Position calculation is correct
- [ ] Test pivot point display
- [ ] Test color coding:
  - [ ] Red for support levels (S3, S2, S1)
  - [ ] Green for resistance levels (R1, R2, R3)
- [ ] Test empty state when no pivot data

---

### ⚡ Phase 8: Performance Optimization

#### 8.1 Reactivity Optimization
- [ ] Review current DOM manipulation approach
- [ ] Consider: Replace DOM manipulation with Vue reactivity (optional)
- [ ] Decision: Keep DOM manipulation if performance is critical
- [ ] Optimize watchers to prevent unnecessary re-renders
- [ ] Use `shallowRef` for large objects if appropriate

#### 8.2 DOM Updates
- [ ] Current: Direct DOM manipulation for performance ✅
- [ ] Option: Refactor to Vue reactivity (may impact performance)
- [ ] Decision: Keep current approach for real-time updates
- [ ] Verify DOM updates don't cause memory leaks

#### 8.3 Memory Management
- [ ] Verify event listener cleanup in `onBeforeUnmount`
- [ ] Verify WebSocket cleanup
- [ ] Test for memory leaks:
  - [ ] Component mount/unmount cycle
  - [ ] Symbol changes
  - [ ] WebSocket updates
- [ ] Use Chrome DevTools Memory Profiler to check for leaks

---

### ✅ Phase 9: Testing & Validation

#### 9.1 Functional Testing
- [ ] Test component renders without errors
- [ ] Test all UI components display correctly
- [ ] Test all data displays correctly
- [ ] Test all interactions work
- [ ] Test real-time updates work
- [ ] Test symbol changes work
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test theme switching (dark/light)

#### 9.2 Edge Cases
- [ ] Test with missing data (empty `window.ssddetail`)
- [ ] Test with invalid data (malformed data)
- [ ] Test with empty cache (`window.ssdreqdata` empty)
- [ ] Test with WebSocket disconnection
- [ ] Test with slow network (API delays)
- [ ] Test with non-tradable symbols (indices, commodities)
- [ ] Test with zero values (price, volume, etc.)
- [ ] Test with negative values (if applicable)

#### 9.3 Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

#### 9.4 Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile Landscape (667x375)
- [ ] Mobile Portrait (375x667)

---

### 🎨 Phase 10: Final Polish

#### 10.1 Code Quality
- [ ] Remove all `console.log` statements
- [ ] Add JSDoc comments to functions
- [ ] Verify code formatting (Prettier/ESLint)
- [ ] Remove unused code
- [ ] Optimize imports
- [ ] Add error boundaries if needed

#### 10.2 Documentation
- [ ] Document component purpose
- [ ] Document props (if any)
- [ ] Document event handlers
- [ ] Document data flow
- [ ] Document dependencies
- [ ] Document WebSocket integration

#### 10.3 Accessibility
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios
- [ ] Test focus indicators

---

## 🔥 Priority Order (Recommended Implementation Sequence)

### 🔴 High Priority (Must Have)
1. **Stock Header Card** - Core UI, displays basic info
2. **Stock Statistics Card** - Core market data
3. **WebSocket Integration** - Real-time updates
4. **Lightweight Chart** - Verify integration works
5. **Returns Cards** - Display returns data

### 🟡 Medium Priority (Should Have)
6. **Market Depth** - Enhanced feature
7. **Pivot Levels** - Technical indicators
8. **Additional Stats** - Extra metrics
9. **Error Handling** - Robust error handling

### 🟢 Low Priority (Nice to Have)
10. **Performance Optimization** - Code optimization
11. **Accessibility Improvements** - A11y enhancements
12. **Code Refactoring** - Extract to composables/store

---

## 🐛 Common Issues & Solutions

### Issue 1: Vuetify 3 Component Not Rendering
**Solution**: Check prop names (e.g., `outlined` → `variant="outlined"`, `small` → `size="small"`)

### Issue 2: Real-time Updates Not Working
**Solution**: Verify WebSocket event listeners are set up correctly and cleaned up properly

### Issue 3: DOM Updates Not Reflecting
**Solution**: Ensure DOM element IDs match the token-based IDs used in `optionChainDataParse()`

### Issue 4: Chart Not Rendering
**Solution**: Verify chart container has dimensions before initialization, check `propstsym` prop

### Issue 5: Responsive Layout Breaking
**Solution**: Verify Vuetify 3 breakpoints (`md`, `sm`, etc.) work correctly

---

## 📝 Notes

- **Current Status**: ~70% migrated, needs verification and completion
- **DOM Manipulation**: Currently using direct DOM manipulation for performance. Consider keeping this approach for real-time updates.
- **Global State**: Currently using `window.ssddetail` and `window.ssdreqdata`. Consider migrating to Pinia store in future.
- **Event System**: Already migrated from EventBus to Custom Events. ✅

---

**Last Updated**: 2024  
**Status**: In Progress

