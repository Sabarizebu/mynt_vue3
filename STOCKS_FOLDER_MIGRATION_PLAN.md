# Stocks Folder Complete Migration Plan

## Overview
Migrate all files in the stocks folder from Vue 2 to Vue 3, Vuetify 3, and Pinia/Composition API.

---

## Files Analysis

### ✅ Already Migrated
1. **StocksDetails.vue** (29KB, 699 lines) - ✅ Fully migrated

### ⚠️ Placeholder Created (Need Full Migration)
2. **StocksOverview.vue** (32KB, 600 lines) - ⚠️ Placeholder created
3. **StockSingle.vue** (57KB, 1236 lines) - ⚠️ Placeholder created  
4. **StocksOption.vue** (93KB, 1870 lines) - ⚠️ Placeholder created

### 📋 Need Complete Migration
5. **StocksSrc.vue** (71KB, 1429 lines) - Main stocks page
6. **SingleStocks.vue** (75KB, 1542 lines) - Single stock analysis
7. **StockAD.vue** (18KB, 414 lines) - Advance Decline page
8. **StockMarket.vue** (14KB, 303 lines) - Market page
9. **StockScreener.vue** (12KB, 313 lines) - Stock screener
10. **StocksIndices.vue** (14KB, 309 lines) - Indices page (check if exists)

---

## Migration Priority

### Phase 1: Main Pages (High Priority)
1. ✅ **StocksDetails.vue** - Already completed
2. 🔄 **StocksSrc.vue** - Main stocks landing page (IN PROGRESS)
3. **StocksIndices.vue** - Top indices page
4. **StockMarket.vue** - Market overview
5. **StockScreener.vue** - Stock screener
6. **StockAD.vue** - Advance Decline

### Phase 2: Single Stock Pages
7. **SingleStocks.vue** - Single stock analysis (complex)

### Phase 3: Child Components (Complete Migration)
8. **StocksOverview.vue** - Overview tab component
9. **StockSingle.vue** - Fundamental tab component
10. **StocksOption.vue** - Options chain component

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

## Current Status

### Completed ✅
- StocksDetails.vue - Fully migrated

### In Progress 🔄
- StocksSrc.vue - Starting migration

### Pending ⏳
- All other files

---

## Notes

1. **EventBus Migration**: All EventBus calls need to be converted to Custom Events
2. **Vuetify 3**: Check component API changes
3. **Global Data**: `window.ssddetail`, `window.ssdreqdata` still used (compatibility)
4. **WebSocket**: Already using Custom Events pattern
5. **Router**: Use `useRoute()` and `useRouter()` from vue-router
6. **Pinia**: Use stores where needed

---

**Status**: 🚀 **Starting Phase 1 - StocksSrc.vue Migration**

