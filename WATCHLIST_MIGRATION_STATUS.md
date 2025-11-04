# Watchlist Migration Status - Vue 2 to Vue 3

## Current Migration Status: ~50% Complete

### ✅ Completed Functionality

#### Data Management
- [x] watchlist array management
- [x] watchlistis (current watchlist) management
- [x] watchlistdata array management
- [x] PreDefinedMW loading
- [x] pdmwdata (top indices) management
- [x] localStorage caching for watchlists
- [x] localStorage caching for watchlist data

#### Search Functionality
- [x] Basic stock search (stockSearch)
- [x] Search input handling (onSearchInput)
- [x] Exchange filtering (stocksexch)
- [x] Search results display (items)

#### Watchlist Operations
- [x] Create watchlist (createMW)
- [x] Delete watchlist (deleteMW)
- [x] Select watchlist (selectWatchlist)
- [x] Load watchlist data (getMWlistdata)
- [x] Load predefined watchlist (setPDwatchlist)
- [x] Add script to watchlist (addSearch)
- [x] Delete script from watchlist (deleteScript)

#### WebSocket Integration
- [x] WebSocket subscription for watchlistdata
- [x] WebSocket subscription for pdmwdata
- [x] WebSocket update handler (handleWebSocketUpdate)
- [x] Real-time price updates

#### Sort & Filter
- [x] Sort functionality (setMWfilter)
- [x] Sort UI (Sort by button and dropdown)

#### Options Chain Basket
- [x] Options basket display
- [x] Basket item management (setBskmodify)
- [x] Margin calculation (getOBMargin)
- [x] Place order from basket (setBfoPlaceorder, setPlaceorder)

#### Index Management
- [x] Index data loading (getAllindicedata)
- [x] Index selection (setChangeindex)
- [x] Index dialog

#### Mutual Fund Watchlist
- [x] Mutual fund search (setmfserach)
- [x] Mutual fund filtering (mfsearchFilter)
- [x] Mutual fund watchlist management (addSearch, deleteuserMutual)
- [x] Mutual fund order placement (putMForder)

#### Client Details
- [x] Client exchange data (getClientexch)
- [x] Client details usage

#### Navigation
- [x] Stock details navigation (setSSDtab)
- [x] Menu dialog handling (handleMenuDialog)

#### Holdings
- [x] Holdings badge (setHoldbadge)
- [x] Holdings count (setHoldcount)

---

### ❌ Missing/Incomplete Functionality

#### Drag and Drop
- [ ] onDragable - Reorder watchlist items (partially implemented)
- [ ] Drag end handling - Save new order to API
- [ ] watchdraglist management

#### Search Enhancement
- [ ] searchFilter - Additional filtering logic
- [ ] Advanced search options
- [ ] Search history

#### Mutual Fund Features
- [ ] getusedMutual - Load user mutual fund watchlist (missing or incomplete)
- [ ] Complete mutual fund watchlist UI
- [ ] Mutual fund details integration

#### Options Chain Search
- [ ] optsearch handling complete
- [ ] Options chain search integration
- [ ] Options chain basket from search

#### Exchange Filtering
- [ ] Complete exchange filter UI for stocks
- [ ] Exchange filter chip group (mentioned but not fully implemented)

#### Event Handlers
- [ ] addscript-wl event handler (partially implemented)
- [ ] bskwatch-event handler (partially implemented)
- [ ] option-search event handler (partially implemented)
- [ ] setappbar-event handler (partially implemented)

#### Error Handling
- [ ] Comprehensive error handling
- [ ] Loading state management improvements
- [ ] Retry logic for failed API calls

#### UI Components (Vuetify 3 Migration)
- [ ] Complete stock list rendering with Vuetify 3 components
- [ ] Replace custom styling with Vuetify 3 theming
- [ ] Responsive design improvements
- [ ] Dark mode support improvements
- [ ] Loading skeletons
- [ ] Empty states

#### Data Loading After Login
- [ ] Immediate data load on mount after login
- [ ] Proper loading state management
- [ ] Cache restore on mount after login

---

## Detailed Missing Methods Analysis

### Vue 2 Methods to Check in Vue 3:

1. **onDragable(flow)** - Drag end handler
   - Vue 2: Lines 1032-1048
   - Vue 3: Partially implemented, needs completion

2. **searchFilter()** - Filter search results
   - Vue 2: Lines 1274-1295
   - Vue 3: Missing

3. **mfsearchFilter()** - Filter mutual fund results
   - Vue 2: Lines 1296-1313
   - Vue 3: Partially implemented

4. **setSinglepage(item)** - Single page navigation
   - Vue 2: Lines 1265-1273
   - Vue 3: Missing

5. **isLetter(e)** - Validate letter input
   - Vue 2: Lines 1661-1666
   - Vue 3: Missing

6. **setWatchUnique(i, x)** - Set unique ID for watchlist items
   - Vue 2: Lines 1800-1802
   - Vue 3: Partially implemented

---

## UI Components Missing from Vuetify 3 Migration

### Stock List Rendering
- [ ] Complete Vuetify 3 v-list or v-data-table implementation
- [ ] Proper v-card structure for stock items
- [ ] v-chip for exchange badges (partially done)
- [ ] v-btn for action buttons
- [ ] v-menu for context menu
- [ ] v-dialog for confirmations

### Watchlist Management
- [ ] v-dialog for create watchlist
- [ ] v-dialog for delete confirmation
- [ ] v-list for watchlist selection
- [ ] v-text-field for watchlist name input

### Search Results
- [ ] v-list for search results
- [ ] v-card for search result items
- [ ] v-chip for exchange display
- [ ] v-btn for add to watchlist

### Mutual Fund UI
- [ ] Complete mutual fund list rendering
- [ ] Mutual fund card components
- [ ] Mutual fund search UI

### Options Chain Basket
- [ ] Complete basket UI with Vuetify 3
- [ ] v-text-field for quantity and price
- [ ] v-switch for product type
- [ ] v-chip for buy/sell toggle
- [ ] v-btn for place order

---

## Data Loading Issues

### After Login Mount Issue
- [ ] Data doesn't load immediately after login
- [ ] watch() on uid/mtoken needs enhancement
- [ ] PreDefinedMW loading needs fix
- [ ] WebSocket subscription needs immediate trigger after login

---

## Next Steps

1. ✅ Fix Issue 1 (Stocks Page) - DONE
2. ⏳ Fix Issue 2.1: Data loading on mount after login
3. ⏳ Fix Issue 2.2: Complete missing methods
4. ⏳ Fix Issue 2.3: Complete UI migration to Vuetify 3
5. ⏳ Fix Issue 2.4: Complete event handlers
6. ⏳ Fix Issue 2.5: Complete drag and drop
7. ⏳ Fix Issue 2.6: Complete mutual fund features
8. ⏳ Fix Issue 2.7: Testing and verification
