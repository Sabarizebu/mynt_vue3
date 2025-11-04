# Watchlist Component - Complete Migration Plan

## Executive Summary

This document provides a comprehensive plan to complete the migration of the Watchlist component from Vue 2 to Vue 3, Vuetify 3, and Pinia. The component is currently **~60% migrated** and needs completion of remaining features.

## Current Migration Status

### ✅ Completed Features (Basic Watchlist)

- [x] Basic watchlist structure
- [x] Watchlist CRUD operations (create, delete)
- [x] Add/remove symbols
- [x] Search functionality (basic)
- [x] Drag and drop reordering
- [x] WebSocket price updates
- [x] Predefined watchlists (NIFTY50, NIFTYBANK, SENSEX, MY:HOLDINGS)
- [x] Holdings badge display
- [x] Context menu (basic)
- [x] Sorting and filtering

### ❌ Missing Features (Need Migration)

- [ ] **Mutual Fund Watchlist** - Complete section missing
- [ ] **Options Chain Basket** - Complete section missing
- [ ] **Index Management** - Partially missing
- [ ] **Advanced Search Features** - Partially implemented
- [ ] **Exchange Filtering** - Missing
- [ ] **Options Search** - Missing
- [ ] **Index Dialog** - Missing
- [ ] **Basket Order Placement** - Missing
- [ ] **Product Type Toggle (MIS/NRML)** - Missing

## Detailed Migration Plan

### Phase 1: Mutual Fund Watchlist (Priority: HIGH)

#### 1.1 State Management

```javascript
// Add to Composition API setup
const panel = ref(false); // Toggle between stocks/mutual funds
const mfisLoading = ref(true);
const mfuseritem = ref([]); // User's mutual fund watchlist
const mfwatchlistdata = ref([]); // Search results for mutual funds
const allmutualfunds = ref(null); // All mutual funds data
const mfmodel = ref(null);
const mfsearch = ref("");
const mfexch = ref(0); // Exchange filter (0=All, 1=Equity, 2=Debt, 3=Hybrid, 4=Other)
const mutualuseritems = ref([]); // Search results filtered
const mffilter = ref(null);
const mffilters = ref([
  { key: "a", text: "Script - A to Z" },
  { key: "z", text: "Script - Z to A" },
  { key: "nav-h", text: "NAV - High to Low" },
  { key: "nav-l", text: "NAV - Low to High" },
  { key: "y-h", text: "3yr rtn - High to Low" },
  { key: "y-l", text: "3yr rtn - Low to High" },
]);
const mfexchfilter = ref(["All", "Equity", "Debt", "Hybrid", "Other"]);
```

#### 1.2 Template Section

Migrate the entire mutual fund section from old component:

- [ ] Mutual fund search input
- [ ] Mutual fund toolbar with sort options
- [ ] Mutual fund list display
- [ ] Add/remove mutual fund functionality
- [ ] Mutual fund filters
- [ ] Mutual fund details navigation

#### 1.3 Methods to Migrate

```javascript
// Add these methods
async function getusedMutual(mode, item, del)
async function mutfndsearch(val)
function mfsearchFilter()
function setMFFilter()
function setSinglepage(item)
function deleteuserMutual(item)
function putMForder(value, item)
async function setmfserach(setext) // Mutual fund API search
```

#### 1.4 API Integration

- [ ] `getMFwatchlist()` - Mutual fund watchlist operations
- [ ] Mutual fund search API endpoint
- [ ] Add/remove mutual fund from watchlist

### Phase 2: Options Chain Basket (Priority: MEDIUM)

#### 2.1 State Management

```javascript
const optchainbasket = ref(false); // Show/hide basket
const optchainbasketdata = ref([]); // Basket items
const prdordplace = ref(false); // Product: false=MIS, true=NRML
const totalmargin = ref(0);
const postTrademargin = ref(0);
const orderloader = ref(false);
```

#### 2.2 Template Section

- [ ] Options basket toolbar
- [ ] Basket items list with:
  - [ ] Checkbox to enable/disable item
  - [ ] BUY/SELL toggle
  - [ ] MKT/LMT toggle
  - [ ] Quantity input
  - [ ] Price input
  - [ ] Delete button
- [ ] Margin calculation display
- [ ] Place order button

#### 2.3 Methods to Migrate

```javascript
function setBskmodify(o, key, value) // Modify basket item
async function getOBMargin() // Calculate margin
async function setBfoPlaceorder(i) // Place basket order recursively
async function setPlaceorder(data, i) // Place individual order
```

#### 2.4 API Integration

- [ ] `getBSKMargin()` - Calculate basket margin
- [ ] `getPlaceOrder()` - Place order (already exists)

#### 2.5 Event Handlers

- [ ] `bskwatch-event` - Add symbol to basket from options chain

### Phase 3: Index Management (Priority: MEDIUM)

#### 3.1 State Management

```javascript
const pdmwdata = ref([
  { key: "NIFTY50:NSE", exch: "NSE", token: "26000", tsym: "Nifty 50" },
  { key: "NIFTYBANK:NSE", exch: "NSE", token: "26009", tsym: "Nifty Bank" },
]);
const allindex = ref({ NSE: [], BSE: [], MCX: [] });
const indexdialog = ref(false);
const singleindex = ref({});
const indexpanel = ref(0);
```

#### 3.2 Template Section

- [ ] Predefined watchlist cards (pdmwdata display)
- [ ] Index selection dialog
- [ ] Index list by exchange (NSE, BSE, MCX)
- [ ] Change index functionality

#### 3.3 Methods to Migrate

```javascript
async function getAllindicedata(item, callback)
function setChangeindex(item, exch)
```

#### 3.4 API Integration

- [ ] `getIndexList()` - Get all indices by exchange

### Phase 4: Advanced Search Features (Priority: MEDIUM)

#### 4.1 Options Search

```javascript
const optsearch = ref(false);
const optsearchdata = ref({});
const stksearch = ref(null);
```

#### 4.2 Exchange Filtering

```javascript
const stocksexch = ref(0);
const exchfilter = ref([
  "All",
  "Equity",
  "F&O",
  "Currency",
  "Commodities",
  "Indices",
]);
```

#### 4.3 Enhanced Search

- [ ] Exchange filter chips
- [ ] Options-specific search
- [ ] Search result filtering by exchange
- [ ] Search result display with expiry/series for F&O

#### 4.4 Methods Enhancement

```javascript
function searchFilter() // Filter search results by exchange
function onSearchInput(query) // Enhanced with options support
```

### Phase 5: UI/UX Polish

#### 5.1 Template Improvements

- [ ] Conditional rendering for `panel` (stocks vs mutual funds)
- [ ] Options basket section integration
- [ ] Index dialog integration
- [ ] Exchange filter chips in search
- [ ] Product type toggle in options basket

#### 5.2 Vuetify 3 Migration

Update all Vuetify 2 syntax to Vuetify 3:

**Components to Update:**

- [ ] `v-chip-group` → `v-chip-group` (may need updates)
- [ ] `v-list-item-group` → `v-list-group` or manual implementation
- [ ] `v-text-field` props (`solo` → `variant="outlined"`)
- [ ] `v-btn` props (`text` → `variant="text"`, `small` → `size="small"`)
- [ ] `v-tooltip` → Check V3 syntax
- [ ] `v-menu` → Check V3 syntax
- [ ] Color classes (keep CSS variables but update component props)

#### 5.3 Styling Preservation

- [ ] All existing CSS classes
- [ ] CSS variables for theming
- [ ] Responsive design
- [ ] Dark/Light theme support

### Phase 6: Event Bus Migration

#### 6.1 Replace All EventBus Calls

```javascript
// Old (Vue 2)
eventBus.$emit("event-name", data);
eventBus.$on("event-name", handler);
eventBus.$off("event-name");

// New (Vue 3)
window.dispatchEvent(new CustomEvent("event-name", { detail: data }));
window.addEventListener("event-name", handler);
window.removeEventListener("event-name", handler);
```

#### 6.2 Events to Migrate

- [ ] `addscript-wl` → Window event
- [ ] `bskwatch-event` → Window event
- [ ] `option-search` → Window event
- [ ] `setappbar-event` → Window event or Pinia store
- [ ] `menudialog` → Window event or Pinia store
- [ ] `ssdmf-event` → Window event (mutual fund single page)

### Phase 7: Context Menu Integration

#### 7.1 Menu Actions

- [ ] Create GTT / GTC
- [ ] Create Alert
- [ ] Market Depth
- [ ] Chart
- [ ] Delete
- [ ] Fundamentals
- [ ] Details

#### 7.2 Integration

- [ ] Right-click handler
- [ ] Menu dialog integration
- [ ] Navigation to respective pages

### Phase 8: Lifecycle & Cleanup

#### 8.1 Lifecycle Hooks

- [ ] `created()` → Setup in `onBeforeMount()`
- [ ] `mounted()` → `onMounted()`
- [ ] `beforeDestroy()` → `onBeforeUnmount()`

#### 8.2 Event Cleanup

- [ ] Remove all event listeners on unmount
- [ ] Cleanup WebSocket subscriptions
- [ ] Clear timers and intervals

## Implementation Checklist

### Week 1: Foundation & Mutual Funds

- [ ] Add all missing state properties
- [ ] Implement mutual fund watchlist UI
- [ ] Migrate mutual fund methods
- [ ] Integrate mutual fund APIs
- [ ] Test mutual fund functionality

### Week 2: Options Basket & Index

- [ ] Implement options basket UI
- [ ] Migrate basket methods
- [ ] Integrate margin calculation
- [ ] Implement basket order placement
- [ ] Add index management
- [ ] Test options basket

### Week 3: Advanced Features & Polish

- [ ] Implement exchange filtering
- [ ] Add options search
- [ ] Enhance search functionality
- [ ] Complete Vuetify 3 migration
- [ ] Style polish

### Week 4: Testing & Bug Fixes

- [ ] Functionality testing
- [ ] UI/UX testing
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Documentation

## Code Examples

### Mutual Fund Watchlist Template

```vue
<!-- Mutual Fund Section -->
<div v-if="panel">
    <v-text-field
        :loading="searchloading"
        ref="mwref"
        class="rounded-pill mt-2"
        variant="outlined"
        density="compact"
        v-model="mfsearch"
        @input="setmfserach(mfsearch)"
        @click="(addscript = true), (watchsecti = false), (mfwatchlistdata = []), (nodata = null), putMWfocus()"
        label="Search funds"
        prepend-inner-icon="mdi-magnify"
    >
        <template v-if="addscript" v-slot:append>
            <v-icon :disabled="isLoading" @click="onMWClear()" color="primary" class="mr-1">mdi-close</v-icon>
        </template>
    </v-text-field>

    <v-toolbar v-if="!addscript" flat dense class="tool-sty crd-trn">
        <v-btn variant="text" readonly class="elevation-0 rounded-lg text-none fs-14 d-inline-flex px-2 text-capitalize"
            max-width="220px">
            My watchlist
            <span class="ml-2 font-weight-bold fs-12">({{ mfuseritem ? mfuseritem.length : "0" }})</span>
        </v-btn>
        <v-spacer></v-spacer>
        <!-- Sort menu -->
        <v-menu location="bottom">
            <template v-slot:activator="{ props }">
                <v-icon v-bind="props" v-if="!watchsecti && !addscript" :disabled="mfisLoading" color="maintext"
                    class="mr-1">mdi-flip-h mdi-sort-variant</v-icon>
            </template>
            <v-list density="compact">
                <v-list-item v-for="(item, index) in mffilters" :key="index" @click="mffilter = index; setMFFilter()">
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-icon v-if="!watchsecti && !addscript" :disabled="mfisLoading"
            @click="(addscript = true), (watchsecti = false), (mfwatchlistdata = []), (nodata = null), putMWfocus()"
            color="maintext">mdi-magnify</v-icon>
    </v-toolbar>

    <!-- Mutual Fund List -->
    <div v-if="!addscript" style="height: calc(100vh - 172px)" class="overflow-y-auto overflow-x-hidden no-scroll">
        <div v-if="mfuseritem && mfuseritem.length > 0">
            <v-card v-for="(item, o) in mfuseritem" :key="o"
                class="elevation-0 rounded-0 table-row overflow-hidden crd-trn">
                <!-- Mutual fund item display -->
            </v-card>
        </div>
    </div>
</div>
```

### Options Basket Template

```vue
<!-- Options Basket Section -->
<div v-if="optchainbasket">
    <v-toolbar flat dense class="tool-sty crd-trn pl-1">
        <p class="font-weight-bold mb-0 lh-16">Basket Options({{ optchainbasketdata.length }})</p>
        <v-spacer></v-spacer>
        <v-card color="secbg" class="px-2 py-0 elevation-0 rounded-xl">
            <v-switch hide-details v-model="prdordplace" density="compact" class="mt-n01">
                <template #label>
                    <p class="pl-1 fw-6 fs-13 maintext--text mb-0 pt-1">{{ prdordplace ? " MIS" : " NRML" }}</p>
                </template>
            </v-switch>
        </v-card>
        <v-btn class="mr-0" size="small" icon @click="optchainbasket = false">
            <v-tooltip text="Minimize">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props">mdi-minus</v-icon>
                </template>
            </v-tooltip>
        </v-btn>
        <v-btn class="mr-0" size="small" icon @click="(optchainbasket = false), (optchainbasketdata = [])">
            <v-tooltip text="Close">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props">mdi-close</v-icon>
                </template>
            </v-tooltip>
        </v-btn>
    </v-toolbar>
    <v-divider></v-divider>

    <!-- Basket Items -->
    <div v-if="optchainbasketdata && optchainbasketdata.length > 0" style="height: calc(100vh-124px)"
        class="overflow-y-auto overflow-x-hidden no-scroll">
        <div v-for="(item, o) in optchainbasketdata" :key="o" class="pt-2 px-1">
            <!-- Basket item row with all controls -->
        </div>
    </div>

    <!-- Margin & Place Order -->
    <div v-if="optchainbasketdata && optchainbasketdata.length > 0">
        <v-divider></v-divider>
        <v-toolbar class="tool-sty elevation-0 crd-trn pt-1 pl-1" density="compact">
            <v-list-item class="px-0">
                <v-list-item-content class="py-0">
                    <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-2">
                        Margin: <span class="ml-1 primary--text"><b>₹{{ totalmargin || "0.00" }}</b></span>
                        <v-icon class="ml-1 cursor-p" @click="getOBMargin()" color="maintext" size="12">mdi-reload</v-icon>
                    </v-list-item-title>
                    <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                        Post margin: <span class="ml-1 primary--text"><b>₹{{ postTrademargin || "0.00" }}</b></span>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-spacer></v-spacer>
            <v-btn @click="setBfoPlaceorder(0)" color="primary" :loading="orderloader"
                class="text-none rounded-pill elevation-0 white--text px-6" height="40px"> Place order </v-btn>
        </v-toolbar>
    </div>
</div>
```

## Files to Create/Modify

### Primary Files

1. **`superApp_v4/src/views/Watchlist/WatchList.vue`** - Main component (extend existing)
2. **`superApp_v4/src/composables/useWatchlist.js`** - Watchlist composable (optional)
3. **`superApp_v4/src/composables/useMutualFundWatchlist.js`** - MF watchlist composable (optional)
4. **`superApp_v4/src/composables/useOptionsBasket.js`** - Options basket composable (optional)

### API Functions (Already Exist)

- `getMwatchlistset()` - Watchlist operations
- `getMFwatchlist()` - Mutual fund watchlist
- `getBSKMargin()` - Basket margin
- `getPlaceOrder()` - Place order
- `getIndexList()` - Get indices
- `getGloabSearch()` - Global search

## Testing Strategy

### Unit Tests

- [ ] Watchlist CRUD operations
- [ ] Search functionality
- [ ] Drag and drop
- [ ] Mutual fund operations
- [ ] Options basket operations

### Integration Tests

- [ ] API integration
- [ ] WebSocket integration
- [ ] Navigation flows
- [ ] Event handling

### E2E Tests

- [ ] Complete watchlist workflow
- [ ] Mutual fund workflow
- [ ] Options basket workflow
- [ ] User interactions

## Performance Considerations

1. **Large Watchlists**: Optimize rendering for 50+ symbols
2. **WebSocket Updates**: Efficient DOM updates
3. **Search Debouncing**: Prevent excessive API calls
4. **Lazy Loading**: Load watchlists on demand

## Success Criteria

- ✅ All features from Vue 2 version work
- ✅ Same UI/UX appearance
- ✅ All styling preserved
- ✅ No console errors
- ✅ Proper cleanup on unmount
- ✅ WebSocket subscriptions managed
- ✅ Responsive design works
- ✅ Dark/Light theme works
- ✅ Performance acceptable (60fps)

## Timeline

- **Week 1**: Mutual Fund Watchlist
- **Week 2**: Options Basket & Index Management
- **Week 3**: Advanced Features & Polish
- **Week 4**: Testing & Bug Fixes

**Total Estimated Time**: 4 weeks

---

**Ready to begin migration?** Start with Phase 1 (Mutual Fund Watchlist) as it's a complete missing section.
