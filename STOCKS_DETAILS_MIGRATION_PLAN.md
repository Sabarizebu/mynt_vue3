# Stocks Details Page Migration Plan

## Overview
Complete migration of `StocksDetails.vue` from Vue 2 to Vue 3, Vuetify 3, and Pinia.

---

## Comparison Analysis

### Vue 2 StocksDetails.vue Features:
1. **Tabs Structure**: 6 tabs (Overview, Chart, Fundamental, Option, Future, Info)
2. **Toolbar Actions**:
   - Buy/Sell buttons
   - Alert button
   - GTT/GTC button
   - Chart layout menu (single, dual, quad)
   - Pop chart toggle
3. **Chart Components**:
   - TVSingleChartContainer
   - TVMultiChartContainer (dual/quad layouts)
   - Pop chart (draggable floating window)
4. **Data Loading**:
   - `getQuotesdata()` - Quote data
   - `getssDetails()` - Security details with fundamental data
   - `getLinkedScrips()` - Linked scripts (equity, options, futures)
   - `getSecuritydata()` - Security info
   - `getTechnicals()` - Technical analysis data
5. **WebSocket Integration**:
   - Real-time updates for futures chain
   - Option chain data parsing
   - Direct DOM updates for performance
6. **Child Components**:
   - `StocksOverview` - Overview tab
   - `StockSingle` - Fundamental tab
   - `StocksOption` - Options tab
7. **Future Chain Table**:
   - Data table with columns: SYMBOL, LTP CH(%), BID, ASK, AVG PRICE, HIGH, LOW, OPEN, CLOSE, VOL
   - Action buttons (Buy/Sell, Watchlist, Chart)
   - WebSocket real-time updates with DOM manipulation
8. **Security Info Display**: Grid layout with security information
9. **Linked Scrips Display**: Equity, Futures, and Options cards
10. **Event Bus Integration**: Multiple event listeners

### Vue 3 StocksDetails.vue Current State:
- Basic placeholder with simple chart
- Missing all tabs, toolbar, and advanced features
- No data loading from APIs
- No WebSocket integration
- No child components

---

## Migration Plan

### Phase 1: Core Structure Setup
**Priority: High**
1. ✅ Convert to Composition API
2. ✅ Set up Pinia stores (if needed)
3. ✅ Migrate tabs structure with Vuetify 3
4. ✅ Set up route parameter handling

### Phase 2: Toolbar and Navigation
**Priority: High**
1. ✅ Migrate sticky toolbar
2. ✅ Add Buy/Sell buttons
3. ✅ Add Alert/GTT buttons
4. ✅ Add chart layout menu
5. ✅ Add pop chart toggle

### Phase 3: Data Loading
**Priority: High**
1. ✅ Migrate `setLoadingdata()` method
2. ✅ Integrate API calls (getQuotesdata, getssDetails, etc)
3. ✅ Set up data caching (window.ssdreqdata pattern)
4. ✅ Handle route params and localStorage

### Phase 4: Chart Components
**Priority: High**
1. ✅ Integrate TVSingleChartContainer
2. ✅ Integrate TVMultiChartContainer
3. ✅ Implement chart layout switching
4. ✅ Add pop chart (draggable floating window)
5. ✅ Chart symbol updates

### Phase 5: Tab Content Components
**Priority: Medium**
1. ✅ Integrate StocksOverview component
2. ✅ Integrate StockSingle component
3. ✅ Integrate StocksOption component
4. ✅ Create Future chain table
5. ✅ Create Security info display
6. ✅ Create Linked scrips display

### Phase 6: WebSocket Integration
**Priority: High**
1. ✅ Set up WebSocket subscription for futures
2. ✅ Migrate `optionChainDataParse()` method
3. ✅ Implement real-time DOM updates
4. ✅ Handle unsubscription

### Phase 7: Event Handlers
**Priority: Medium**
1. ✅ Migrate event listeners (ssd-event, user-event, web-scoketConn)
2. ✅ Convert EventBus to Window CustomEvents
3. ✅ Handle tab changes and analytics

### Phase 8: Styling and UX
**Priority: Low**
1. ✅ Match Vue 2 styling
2. ✅ Ensure responsive design
3. ✅ Add loading states
4. ✅ Error handling

### Phase 9: Testing and Verification
**Priority: High**
1. ✅ Test all tabs
2. ✅ Test chart layouts
3. ✅ Test WebSocket updates
4. ✅ Test API data loading
5. ✅ Test route navigation
6. ✅ Compare with Vue 2 version

---

## Implementation Steps

### Step 1: Create Basic Structure with Tabs
- Migrate template structure
- Set up Vuetify 3 tabs
- Add basic data properties

### Step 2: Add Toolbar
- Sticky toolbar with tabs
- Action buttons (Buy/Sell/Alert/GTT)
- Chart layout menu

### Step 3: Integrate Data Loading
- Route parameter handling
- API integration
- Data caching

### Step 4: Add Chart Components
- Single chart
- Multi chart layouts
- Pop chart

### Step 5: Add Tab Content
- Overview tab
- Fundamental tab
- Options tab
- Future tab
- Info tab

### Step 6: WebSocket Integration
- Subscription logic
- Real-time updates
- DOM manipulation

### Step 7: Event System
- Custom events
- Event listeners
- Cleanup

### Step 8: Polish and Test
- Styling
- Loading states
- Error handling
- Testing

---

## Files to Modify/Create

1. **`superApp_v4/src/views/Dashboard/stocks/StocksDetails.vue`**
   - Complete rewrite to match Vue 2 functionality

2. **Child Components** (check if exist or need migration):
   - `StocksOverview.vue`
   - `StockSingle.vue`
   - `StocksOption.vue`

3. **API Functions** (already exist in getAPIdata.js):
   - `getQuotesdata()`
   - `getssDetails()`
   - `getLinkedScrips()`
   - `getSecuritydata()`
   - `getTechnicals()`

---

## Key Migration Points

### EventBus → Custom Events
- `eventBus.$emit()` → `window.dispatchEvent(new CustomEvent())`
- `eventBus.$on()` → `window.addEventListener()`
- `eventBus.$off()` → `window.removeEventListener()`

### Vuetify 2 → Vuetify 3
- `v-tabs-items` → `v-window`
- `v-tab-item` → `v-window-item`
- `v-data-table` → Check API compatibility
- `v-tooltip` → Check props compatibility

### Vue 2 → Vue 3
- `this.$route` → `useRoute()`
- `this.$router` → `useRouter()`
- `this.$emit()` → `defineEmits()`
- Options API → Composition API

### Data Storage
- `window.ssdreqdata` - Keep for caching (works in both)
- `window.ssddetail` - Keep for global access (works in both)

---

## Status
🔄 **In Progress** - Starting migration

---

## Next Steps
1. Read child components to understand dependencies
2. Start with basic structure and tabs
3. Gradually add features following the plan
4. Test each phase before moving to next

