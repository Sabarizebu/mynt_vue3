# Watchlist Migration Plan - Vue 2 to Vue 3/Vuetify 3/Pinia

## Overview

This document provides a comprehensive migration plan for the Watchlist component from Vue 2/Vuetify 2 to Vue 3/Vuetify 3 with Pinia state management.

## Current Status Analysis

### Old App (Vue 2) - `SuperApp-FE-main-2/src/views/Watchlist/WatchList.vue`

- **Size**: ~1817 lines
- **Technology**: Vue 2 Options API, Vuetify 2, Event Bus
- **Key Features**:
  1. Watchlist management (create, delete, select)
  2. Stock/Mutual Fund search
  3. Drag and drop reordering
  4. Predefined watchlists (Nifty50, Bank Nifty, etc.)
  5. Hover actions (Buy/Sell/Chart/Options)
  6. Real-time price updates via WebSocket
  7. Filtering and sorting
  8. Options chain basket
  9. Index management

### New App (Vue 3) - `superApp_v4/src/views/Watchlist/WatchList.vue`

- **Size**: ~3890 lines
- **Technology**: Vue 3 Composition API, Vuetify 3, Custom Events
- **Status**: Partially migrated, needs completion

---

## Detailed Migration Plan

### Phase 1: Template Structure & Syntax Migration

#### Step 1.1: Hover Action Bar (Buy/Sell/Chart/Options)

**Priority: HIGH - User Requested**

**Old Code Pattern:**

```vue
<div @click.stop class="pos-abs table-hov" style="bottom: 8px; left: 50%; transform: translate(-50%, 0)">
  <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
    @click="switchBus.$emit('menudialog', 'order', item.token, item.exch, item.tsym, 'b')"
    style="min-width: 24px; background-color: var(--maingreen); border-radius: 4px"
    class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center">
    B
  </div>
  <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
    @click="switchBus.$emit('menudialog', 'order', item.token, item.exch, item.tsym, 's')"
    style="min-width: 24px; background-color: var(--mainred); border-radius: 4px"
    class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center">
    S
  </div>
  <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym)"
    style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
    class="px-0 font-weight-bold white--text elevation-0 mr-1" x-small>
    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
  </v-btn>
  <v-menu close-on-click absolute offset-y class="table-menu">
    <!-- Options menu -->
  </v-menu>
</div>
```

**New Code (Vue 3/Vuetify 3):**

```vue
<div v-if="uid" @click.stop class="pos-abs table-hov" style="bottom: 8px; left: 50%; transform: translate(-50%, 0)">
  <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
    @click="handleMenuDialog('order', item.token, item.exch, item.tsym, 'b')"
    style="min-width: 24px; background-color: var(--maingreen); border-radius: 4px"
    class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center cursor-pointer">
    B
  </div>
  <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
    @click="handleMenuDialog('order', item.token, item.exch, item.tsym, 's')"
    style="min-width: 24px; background-color: var(--mainred); border-radius: 4px"
    class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center cursor-pointer">
    S
  </div>
  <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym)"
    style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small" icon>
    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
  </v-btn>
  <v-menu location="bottom" :offset="[0, 8]" class="table-menu">
    <!-- Options menu -->
  </v-menu>
</div>
```

**Changes Required:**

- ✅ Use `bottom: 8px` instead of `top: 8px` or `bottom: 12px`
- ✅ Keep `left: 50%; transform: translate(-50%, 0)` for centering
- ✅ Use `div` elements with inline styles for Buy/Sell buttons (not `v-btn`)
- ✅ Use `size="x-small"` and `icon` prop for Vuetify 3 buttons
- ✅ Replace `offset-y` with `:offset="[0, 8]"` on `v-menu`
- ✅ Use `location="bottom"` instead of `offset-y`
- ✅ Replace `switchBus.$emit` with `window.dispatchEvent`

**CSS Requirements:**

```css
.table-hov {
  display: none !important;
}

.table-row:hover .table-hov {
  display: inline-flex !important;
}

.table-row:hover .table-hide {
  opacity: 0.5 !important;
}
```

#### Step 1.2: Vuetify 2 to Vuetify 3 Component Migration

**Components to Update:**

1. **v-list-item-content** → Remove, use direct title/subtitle

   ```vue
   <!-- Old -->
   <v-list-item-content>
     <v-list-item-title>...</v-list-item-title>
     <v-list-item-subtitle>...</v-list-item-subtitle>
   </v-list-item-content>

   <!-- New -->
   <template v-slot:prepend>
     <!-- Avatar if needed -->
   </template>
   <v-list-item-title>...</v-list-item-title>
   <v-list-item-subtitle>...</v-list-item-subtitle>
   ```

2. **v-chip** props

   - `x-small` → `size="x-small"`
   - `text-color` → `:text-color` (still valid)

3. **v-btn** props

   - `x-small` → `size="x-small"`
   - `small` → `size="small"`
   - `fab` → `variant="fab"` (if needed)

4. **v-select/@change** → `@update:model-value`

5. **v-menu**

   - `offset-y` → `location="bottom" :offset="[0, 8]"`
   - `close-on-click` → `close-on-click` (still valid)

6. **v-data-table**
   - `mobile-breakpoint` → `mobile`
   - `no-glutters` → `no-gutters`

#### Step 1.3: Drag and Drop

**Old**: `vuedraggable` with `v-model`
**New**: Same, but ensure Vue 3 compatibility

---

### Phase 2: Script Migration (Composition API)

#### Step 2.1: Data Properties → Refs

```javascript
// Old
data() {
  return {
    uid: null,
    watchlistdata: [],
    watchlist: [],
    // ...
  }
}

// New
const uid = ref(null)
const watchlistdata = ref([])
const watchlist = ref([])
```

#### Step 2.2: Methods → Functions

```javascript
// Old
methods: {
  setSSDtab(type, token, exch, tsym) {
    // ...
  }
}

// New
function setSSDtab(type, token, exch, tsym) {
  // ...
}
```

#### Step 2.3: Computed Properties

```javascript
// Old
computed: {
  filteredData() {
    return this.watchlistdata.filter(...)
  }
}

// New
const filteredData = computed(() => {
  return watchlistdata.value.filter(...)
})
```

#### Step 2.4: Lifecycle Hooks

```javascript
// Old
mounted() { ... }
beforeDestroy() { ... }

// New
onMounted(() => { ... })
onBeforeUnmount(() => { ... })
```

#### Step 2.5: Event Bus → Custom Events

```javascript
// Old
switchBus.$emit("menudialog", type, token, exch, tsym, trantype);
switchBus.$on("event-name", handler);
switchBus.$off("event-name", handler);

// New
window.dispatchEvent(
  new CustomEvent("menudialog", {
    detail: { type, token, exch, tsym, trantype },
  })
);
window.addEventListener("event-name", handler);
window.removeEventListener("event-name", handler);
```

#### Step 2.6: Watch

```javascript
// Old
watch: {
  watchlistis(newVal) { ... }
}

// New
watch(() => watchlistis.value, (newVal) => { ... })
```

---

### Phase 3: Pinia Store Integration

#### Step 3.1: Create Watchlist Store

**File**: `src/stores/watchlistStore.js`

```javascript
import { defineStore } from "pinia";

export const useWatchlistStore = defineStore("watchlist", {
  state: () => ({
    watchlists: [],
    currentWatchlist: null,
    watchlistData: [],
    pdmwdata: [], // Predefined market watch data (Nifty, Bank Nifty, etc.)
    isLoading: false,
    mfisLoading: false,
    filters: {
      mwfilter: null,
      mffilter: null,
      exchfilter: "All",
      mfexchfilter: "All",
    },
  }),
  actions: {
    async fetchWatchlists() {
      // API call to get user watchlists
    },
    async selectWatchlist(name) {
      this.currentWatchlist = name;
      await this.fetchWatchlistData(name);
    },
    async fetchWatchlistData(watchlistName) {
      // API call to get watchlist stocks
    },
    async addSymbol(watchlistName, symbol) {
      // API call to add symbol
    },
    async deleteSymbol(watchlistName, symbol) {
      // API call to delete symbol
    },
    setFilter(filterKey) {
      this.filters.mwfilter = filterKey;
      // Apply filter logic
    },
  },
});
```

#### Step 3.2: Migrate Watchlist Management Logic

- Move watchlist CRUD operations to store
- Keep UI state (dialogs, search) in component
- Move filtering/sorting logic to store getters

---

### Phase 4: WebSocket Integration

#### Step 4.1: Real-time Price Updates

**Old**: Event Bus for WebSocket updates
**New**: Custom Events + Pinia store

```javascript
// Component listens to WebSocket events
window.addEventListener("web-scoketConn", (event) => {
  const data = event.detail;
  // Update watchlistData directly via DOM or reactive refs
  updatePriceInWatchlist(data);
});

function updatePriceInWatchlist(data) {
  const item = watchlistdata.value.find((w) => w.token === data.token);
  if (item) {
    item.ltp = Number(data.lp).toFixed(2);
    item.ch = Number(data.ch || 0).toFixed(2);
    item.chp = Number(data.chp || 0).toFixed(2);
    // Direct DOM update for performance
    updateDOMElements(data.token, item);
  }
}
```

---

### Phase 5: Functionality Completion Checklist

#### ✅ Already Migrated:

- [x] Basic watchlist structure
- [x] Search functionality
- [x] Watchlist tabs
- [x] Stock display
- [x] Real-time price updates (partial)
- [x] WebSocket integration (partial)

#### ⏳ Needs Completion:

1. **Hover Action Bar**

   - [x] Position: `bottom: 8px` (FIXED)
   - [x] Centered with transform (FIXED)
   - [ ] Use `div` elements instead of `v-btn` for Buy/Sell
   - [ ] Match exact styling from old app
   - [ ] Ensure visibility on hover only

2. **Drag and Drop Reordering**

   - [ ] Verify `vuedraggable` works with Vue 3
   - [ ] Save order to backend on drag end
   - [ ] Update local state immediately

3. **Watchlist Management**

   - [ ] Create new watchlist dialog
   - [ ] Delete watchlist with confirmation
   - [ ] Rename watchlist
   - [ ] Maximum 10 watchlists validation

4. **Options Chain Basket**

   - [ ] Add to basket functionality
   - [ ] Basket order placement
   - [ ] Margin calculation for basket

5. **Filtering & Sorting**

   - [ ] Script A-Z / Z-A
   - [ ] Price High-Low / Low-High
   - [ ] Change % sorting
   - [ ] Exchange filtering

6. **Mutual Funds Watchlist**

   - [ ] MF search functionality
   - [ ] MF watchlist tabs
   - [ ] MF order placement

7. **Predefined Watchlists**

   - [ ] Nifty 50 data loading
   - [ ] Bank Nifty data loading
   - [ ] Sensex data loading
   - [ ] Index selection dialog

8. **Search & Add Symbols**

   - [ ] Global search with debounce
   - [ ] Add symbol to watchlist
   - [ ] Symbol suggestions
   - [ ] Options search mode

9. **WebSocket Subscriptions**

   - [ ] Subscribe on watchlist load
   - [ ] Unsubscribe on watchlist change
   - [ ] Handle reconnection
   - [ ] Update all watchlist items

10. **Error Handling**
    - [ ] API error handling
    - [ ] WebSocket error handling
    - [ ] User-friendly error messages
    - [ ] Retry mechanisms

---

## Implementation Steps

### Step 1: Fix Hover Action Bar (IMMEDIATE)

1. Change position from `top: 8px` to `bottom: 8px`
2. Replace `v-btn` with `div` elements for Buy/Sell
3. Match exact styling from old app
4. Ensure CSS hover states work correctly

### Step 2: Complete Template Migration

1. Update all Vuetify 2 syntax to Vuetify 3
2. Fix all `v-list-item-content` structures
3. Update all `v-menu` props
4. Fix all `@change` to `@update:model-value`

### Step 3: Script Migration

1. Convert all `data()` properties to `ref()`
2. Convert all `methods` to functions
3. Convert all `computed` to `computed()`
4. Update lifecycle hooks
5. Replace Event Bus with Custom Events

### Step 4: Pinia Store Integration

1. Create `watchlistStore.js`
2. Move watchlist state to store
3. Move watchlist actions to store
4. Use store in component

### Step 5: Complete Functionality

1. Drag and drop reordering
2. Options chain basket
3. Index management
4. Filtering and sorting
5. Error handling

---

## Key Files to Modify

1. **Primary Component**

   - `src/views/Watchlist/WatchList.vue` - Main component

2. **Stores**

   - `src/stores/watchlistStore.js` - New Pinia store (create)

3. **API Functions**

   - `src/components/mixins/getAPIdata.js` - Verify all watchlist APIs

4. **Utilities**
   - Drag and drop utilities
   - WebSocket helpers

---

## Testing Checklist

### UI/UX Testing

- [ ] Hover action bar appears on hover
- [ ] Buy/Sell buttons work correctly
- [ ] Chart button navigates correctly
- [ ] Options menu works correctly
- [ ] Position matches old app exactly

### Functionality Testing

- [ ] Create watchlist works
- [ ] Delete watchlist works
- [ ] Add symbol works
- [ ] Remove symbol works
- [ ] Drag and drop reordering works
- [ ] Filtering works
- [ ] Sorting works
- [ ] Search works
- [ ] Real-time updates work

### Integration Testing

- [ ] Order dialog opens from Buy/Sell
- [ ] Chart opens from Chart button
- [ ] Stock details open from options menu
- [ ] WebSocket updates reflect in UI
- [ ] Navigation works correctly

---

## Success Criteria

✅ Hover action bar matches old app exactly
✅ All functionality from old app works
✅ No console errors
✅ No warnings
✅ Performance is maintained or improved
✅ UI matches old app behavior

---

## Phase Completion Summary

### ✅ Phase 1: Template Migration - COMPLETED

- Hover action bar fixed (`bottom: 8px`, centered, CSS variables for colors)
- All `v-list-item-content` migrated to Vuetify 3 structure
- All Vuetify 2 syntax updated to Vuetify 3 (menus, buttons, chips)
- No linter errors

### ✅ Phase 2: Pinia Store Integration - COMPLETED

- Created `src/stores/watchlistStore.js` with comprehensive state management
- Migrated watchlist CRUD operations to store actions
- Added getters for filtered/sorted watchlist data
- Added price caching functionality
- Store is ready for integration into component

### ✅ Phase 3: WebSocket Integration - COMPLETED

- Added WebSocket subscription/unsubscription helpers to store
- Added `subscribeToWatchlist()` and `unsubscribeFromWatchlist()` methods
- Added `subscribeToPdmwdata()` and `unsubscribeFromPdmwdata()` methods
- Added `handleWebSocketPriceUpdate()` for processing WebSocket events
- Store methods ready for use in component

### ⏳ Next Steps:

1. **Phase 4 - Component Integration**: Gradually migrate WatchList.vue to use the Pinia store
2. **Phase 5 - WebSocket Integration**: Connect store WebSocket methods to component lifecycle
3. **Phase 6 - Remaining Features**: Complete drag-drop, options basket, filtering, mutual funds

**Current Status**: Phases 1, 2, and 3 are complete. The store is ready and can be integrated into WatchList.vue component.
