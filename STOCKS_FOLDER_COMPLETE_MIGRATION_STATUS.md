# Stocks Folder Complete Migration Status

## Overview
Complete migration plan for all files in `/stocks` folder from Vue 2 to Vue 3, Vuetify 3, and Composition API.

---

## Current Status

### ✅ Fully Migrated
1. **StocksDetails.vue** (29KB, 699 lines) - ✅ **COMPLETED**
   - Vue 3 Composition API
   - Vuetify 3 components
   - Custom Events (no EventBus)
   - TradingView Chart integration
   - WebSocket integration
   - All tabs (Overview, Chart, Fundamental, Option, Future, Info)

### ⚠️ Partially Migrated (Needs Completion)
2. **StocksSrc.vue** (71KB, 1966 lines) - ⚠️ **IN PROGRESS**
   - ✅ Template: Vuetify 3 compatible
   - ✅ Custom Events: Mostly migrated from EventBus
   - ❌ Script: Still using Options API (needs Composition API conversion)
   - ✅ WebSocket: Custom Events pattern
   - ✅ Top indices display
   - ✅ Advance/Decline charts
   - ✅ Heatmap (ECharts)
   - ✅ Trade action tables
   - ✅ Stock monitor
   - ✅ News section
   - ✅ Corporate actions
   - **Action Required**: Convert Options API → Composition API

### 📋 Placeholders (Need Full Migration)
3. **StocksIndices.vue** (14KB, 309 lines) - 📋 **PLACEHOLDER**
4. **StockMarket.vue** (14KB, 303 lines) - 📋 **PLACEHOLDER**
5. **StockScreener.vue** (12KB, 313 lines) - 📋 **PLACEHOLDER**
6. **StockAD.vue** (18KB, 414 lines) - 📋 **PLACEHOLDER**
7. **SingleStocks.vue** (75KB, 1542 lines) - 📋 **PLACEHOLDER** (basic structure exists)
8. **StocksOverview.vue** (32KB, 600 lines) - 📋 **PLACEHOLDER**
9. **StockSingle.vue** (57KB, 1236 lines) - 📋 **PLACEHOLDER**
10. **StocksOption.vue** (93KB, 1870 lines) - 📋 **PLACEHOLDER**

---

## Migration Priority

### Phase 1: Complete StocksSrc.vue (High Priority)
**Status**: ⚠️ Partially migrated
**Action**: Convert Options API → Composition API
- Convert `data()` → `ref()`/`reactive()`
- Convert `methods` → functions
- Convert `computed` → `computed()`
- Convert `watch` → `watch()`
- Convert lifecycle hooks
- Update router usage to `useRouter()`
- Fix any remaining EventBus calls
- Ensure all Vuetify 3 compatibility

### Phase 2: Migrate Smaller Pages
1. **StocksIndices.vue** - Top indices page
2. **StockMarket.vue** - Market overview
3. **StockScreener.vue** - Stock screener
4. **StockAD.vue** - Advance Decline page

### Phase 3: Migrate Single Stock Pages
5. **SingleStocks.vue** - Single stock analysis (complex)

### Phase 4: Complete Child Components
6. **StocksOverview.vue** - Overview tab component
7. **StockSingle.vue** - Fundamental tab component
8. **StocksOption.vue** - Options chain component

---

## Migration Steps Per File

### Step 1: Analyze Vue 2 File
- Read the file structure
- Identify data properties
- Identify methods
- Identify computed properties
- Identify lifecycle hooks
- Identify event handlers
- Identify API calls
- Identify WebSocket usage

### Step 2: Convert Template
- Convert Vuetify 2 → Vuetify 3 components
- Update event handlers
- Update v-model directives
- Fix any deprecated syntax

### Step 3: Convert Script
- Convert Options API → Composition API
- Convert EventBus → Custom Events
- Convert data() → ref()/reactive()
- Convert methods → functions
- Convert computed → computed()
- Convert lifecycle hooks
- Update router usage
- Update Pinia stores if needed

### Step 4: Update Imports
- Check all imports
- Update component imports
- Update API function imports
- Update utility imports

### Step 5: Test & Fix
- Check for linter errors
- Test functionality
- Fix any issues
- Verify against Vue 2 version

---

## Notes

1. **StocksSrc.vue**: Already has most functionality working. Main task is converting Options API to Composition API for better Vue 3 compatibility and maintainability.
2. **EventBus Migration**: All EventBus calls should use `window.dispatchEvent` and `window.addEventListener` (Custom Events pattern).
3. **Vuetify 3**: Check component API changes (`v-tabs-items` → `v-window`, `v-tab-item` → `v-window-item`, etc.).
4. **WebSocket**: Already using Custom Events pattern in StocksSrc.vue.
5. **Router**: Use `useRoute()` and `useRouter()` from vue-router.
6. **Pinia**: Use stores where needed.

---

**Status**: 🚀 **Starting Phase 1 - Complete StocksSrc.vue Migration**

