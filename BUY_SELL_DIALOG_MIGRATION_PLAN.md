# Buy/Sell Dialog (StockOrderWindow) Migration Plan

## Overview
This plan outlines the migration of the `StockOrderWindow.vue` component from Vue 2 (Options API, Vuetify 2) to Vue 3 (Composition API, Vuetify 3, Pinia). The component is a critical order placement dialog with extensive functionality including order types, GTT, OCO, SIP integration, drag functionality, and real-time price updates.

---

## Current State Analysis

### Old App (Vue 2) Implementation

**File**: `SuperApp-FE-main-2/src/components/Popups/StockOrderWindow.vue`

#### Key Features:

1. **Slice Order Dialog**:
   - Separate dialog for slice orders
   - Displays slice quantities and multipliers
   - Place order button

2. **Main Order Dialog**:
   - **Header Section**:
     - Symbol name and exchange
     - Live price (LTP) with change and change percentage
     - Buy/Sell toggle switch
     - Loading indicator
     - Color-coded header (green for buy, red for sell)
   
   - **Order Type Tabs**:
     - Regular (0)
     - Cover (1)
     - Bracket (2)
     - GTT (3)
     - SIP (4) - Only for NSE/BSE
   
   - **Investment Type**:
     - Intraday (I)
     - Delivery (C) - NSE/BSE only
     - Carry Forward (M) - Others
   
   - **Price Type**:
     - Limit (LMT)
     - Market (MKT)
     - SL Limit (SL-LMT)
     - SL Mkt (SL-MKT)
   
   - **Order Fields**:
     - Quantity (with +/- buttons, lot size validation)
     - Price (readonly for Market orders)
     - Trigger Price (for SL orders)
     - Stop Loss (Cover/Bracket orders)
     - Target Price (Bracket orders)
   
   - **Advanced Options**:
     - Validity & Disclosed Qty (IOC, EOS, DAY)
     - After Market Order (AMO)
     - Market Protection % (for Market orders)
   
   - **GTT Options**:
     - Alert Type (LTP, Perc. change, ATP, OI, TOI, 52HIGH, 52LOW, VOLUME)
     - Condition (> or <)
     - Trigger Value
     - OCO Panel (One-Cancel-Other)
     - OCO Leg 2 fields
   
   - **SIP Tab**:
     - Redirects to SIP orders page
     - Passes security data as route params
   
   - **Quick/Advanced Toggle**:
     - Quick order mode (compact view)
     - Advanced order mode (full view)
   
   - **Sticky Dialog**:
     - Option to keep dialog open after order placement
     - Saved in preferences
   
   - **Margin Display**:
     - Order margin calculation
     - Brokerage charges
     - Available balance
     - Margin breakdown (tooltip menu)
     - Charge breakdown (tooltip menu)
   
   - **Actions**:
     - Place Order (Regular, GTT, OCO)
     - Modify Order
     - Cancel Order
     - Re-order
     - Exit Order
   
   - **Drag Functionality**:
     - Draggable dialog
     - Position saved to localStorage
     - Position restored on open

3. **WebSocket Integration**:
   - Real-time price updates
   - LTP, change, change percentage updates
   - Margin recalculation on price change

4. **Order Preferences**:
   - Quick order mode preference
   - Sticky dialog preference
   - Investment type preference
   - Price type preference
   - Default quantity preference

5. **Event Handling**:
   - `menudialog` event listener
   - `web-scoketConn` event listener
   - `place-bskord` event listener
   - Order book update events

---

### New App (Vue 3) Current Implementation

**File**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`

#### Current Features:

✅ **Implemented**:
- Basic order dialog structure
- Buy/Sell toggle
- Order type tabs (Regular, Cover, Bracket, GTT, SIP)
- Investment type selection
- Price type selection
- Quantity and Price inputs
- Trigger price, Stop loss, Target price
- Validity & Disclosed Qty
- After Market Order
- Market Protection
- GTT basic fields
- Margin calculation
- Order placement (Regular, GTT)
- Order modification
- Order cancellation
- Drag functionality
- WebSocket integration
- SIP tab navigation

⚠️ **Partially Implemented**:
- Slice Order Dialog (scaffold only)
- GTT OCO Panel (missing)
- Margin breakdown tooltip (missing detailed breakdown)
- Charge breakdown tooltip (missing)
- Order preferences loading (basic)
- Position restoration (basic)

❌ **Missing**:
- Slice order functionality
- GTT OCO full implementation
- Detailed margin breakdown menu
- Detailed charge breakdown menu
- Advanced order validation
- Order book update event handling
- Basket order integration
- Exit order functionality
- Re-order functionality

---

## Migration Plan

### Phase 1: Template Migration (Vuetify 2 → Vuetify 3)

#### 1.1 Slice Order Dialog
- [ ] Migrate `v-dialog` to Vuetify 3 syntax
- [ ] Update `v-card` props (`rounded-xl` → `rounded`)
- [ ] Update `v-toolbar` props (`dense` → `density="compact"`)
- [ ] Update `v-btn` props (`x-small fab outlined` → `size="x-small" variant="outlined" icon`)
- [ ] Implement slice order data structure
- [ ] Implement slice order placement logic

#### 1.2 Main Order Dialog
- [ ] Update `v-card` to Vuetify 3 syntax
- [ ] Update `v-toolbar` to Vuetify 3 syntax
- [ ] Update `v-list-item` to Vuetify 3 syntax (`v-list-item-content` → `v-list-item-title`)
- [ ] Update `v-switch` props (`inset` → default)
- [ ] Update `v-tabs` to Vuetify 3 syntax
- [ ] Update `v-tab` props
- [ ] Update `v-chip-group` to Vuetify 3 syntax
- [ ] Update `v-chip` props
- [ ] Update `v-radio-group` to Vuetify 3 syntax
- [ ] Update `v-text-field` props (`solo` → `variant="flat"`, `dense` → `density="compact"`)
- [ ] Update `v-checkbox` props
- [ ] Update `v-select` to Vuetify 3 syntax
- [ ] Update `v-menu` to Vuetify 3 syntax
- [ ] Update `v-tooltip` to Vuetify 3 syntax

#### 1.3 GTT OCO Panel
- [ ] Implement OCO panel structure
- [ ] Implement OCO leg 2 fields
- [ ] Implement OCO alert type selection
- [ ] Implement OCO condition selection
- [ ] Implement OCO value input
- [ ] Implement OCO quantity input
- [ ] Implement OCO price input
- [ ] Implement OCO trigger price input

#### 1.4 Margin & Charges Display
- [ ] Implement margin breakdown tooltip menu
- [ ] Implement charge breakdown tooltip menu
- [ ] Update `v-menu` activator structure
- [ ] Implement `orderchartItems` computed property
- [ ] Implement `chargeItems` computed property
- [ ] Implement `setFormatNumber` function

---

### Phase 2: Script Migration (Options API → Composition API)

#### 2.1 State Management
- [ ] Convert `data()` to `ref()` / `reactive()`
- [ ] Convert `computed` to `computed()`
- [ ] Convert `methods` to regular functions
- [ ] Convert `mounted()` to `onMounted()`
- [ ] Convert `beforeDestroy()` to `onBeforeUnmount()`
- [ ] Replace `this.$nextTick()` with `nextTick()`
- [ ] Replace `this.$router` with `useRouter()`
- [ ] Replace `this.$route` with `useRoute()`
- [ ] Replace `eventBus.$on` / `eventBus.$emit` with `window.addEventListener` / `window.dispatchEvent`

#### 2.2 Event Handling
- [ ] Migrate `menudialog` event listener
- [ ] Migrate `web-scoketConn` event listener
- [ ] Migrate `place-bskord` event listener
- [ ] Migrate `orderbook-update` event listener
- [ ] Implement event cleanup in `onBeforeUnmount()`

#### 2.3 Order Placement Functions
- [ ] Migrate `setUPPlaceorder()` function
- [ ] Migrate `setGttplaceorder()` function
- [ ] Implement slice order placement
- [ ] Implement OCO order placement
- [ ] Implement order modification
- [ ] Implement order cancellation (already done)
- [ ] Implement re-order functionality
- [ ] Implement exit order functionality

#### 2.4 Order Validation
- [ ] Implement lot size validation
- [ ] Implement tick size validation
- [ ] Implement circuit limit validation
- [ ] Implement Cover order validation (stop loss required)
- [ ] Implement Bracket order validation (stop loss and target required)
- [ ] Implement GTT validation
- [ ] Implement OCO validation

#### 2.5 Margin Calculation
- [ ] Migrate `getMargin()` function
- [ ] Migrate margin calculation logic
- [ ] Implement margin recalculation on field changes
- [ ] Implement margin display formatting
- [ ] Implement charge calculation
- [ ] Implement charge display formatting

#### 2.6 Order Preferences
- [ ] Migrate `setOrdprefApi()` calls
- [ ] Implement preference loading
- [ ] Implement preference saving
- [ ] Implement sticky dialog preference
- [ ] Implement quick order preference
- [ ] Implement investment type preference
- [ ] Implement price type preference
- [ ] Implement default quantity preference

#### 2.7 Drag Functionality
- [ ] Migrate `setDragableSett()` function
- [ ] Migrate `dragElement()` function
- [ ] Migrate `savePosition()` function
- [ ] Migrate `restorePosition()` function
- [ ] Migrate `clearPosition()` function
- [ ] Update position restoration logic
- [ ] Update drag event handlers

#### 2.8 WebSocket Integration
- [ ] Migrate `optionChainDataParse()` function
- [ ] Migrate WebSocket update handling
- [ ] Implement real-time price updates
- [ ] Implement margin recalculation on price change
- [ ] Implement DOM updates for price display

#### 2.9 Order Type Handling
- [ ] Migrate `setOrderTabs()` function
- [ ] Migrate `setOrdertypes()` function
- [ ] Implement order type change handlers
- [ ] Implement price type change handlers
- [ ] Implement investment type change handlers
- [ ] Implement SIP tab handler (redirect to orders page)

#### 2.10 Quantity Management
- [ ] Migrate `increaseorderQty()` function
- [ ] Migrate `decreaseorderQty()` function
- [ ] Implement lot size step calculation
- [ ] Implement MCX special handling (step = 1)

#### 2.11 Helper Functions
- [ ] Migrate `setFormatNumber()` function
- [ ] Migrate `toBool()` function
- [ ] Migrate `snackAlert()` function
- [ ] Migrate `setWebsocket()` function
- [ ] Migrate `setStickyupdate()` function

---

### Phase 3: Pinia Store Integration

#### 3.1 Order Store Creation
- [ ] Create `orderStore.js` Pinia store
- [ ] Move order state to store
- [ ] Move order preferences to store
- [ ] Move order validation logic to store
- [ ] Move margin calculation logic to store

#### 3.2 Store Actions
- [ ] Create `placeOrder()` action
- [ ] Create `modifyOrder()` action
- [ ] Create `cancelOrder()` action
- [ ] Create `getOrderMargin()` action
- [ ] Create `getBrokerage()` action
- [ ] Create `loadPreferences()` action
- [ ] Create `savePreferences()` action

#### 3.3 Store Getters
- [ ] Create `orderMargin` getter
- [ ] Create `brokerage` getter
- [ ] Create `availableBalance` getter
- [ ] Create `orderValidation` getter

---

### Phase 4: Advanced Features Implementation

#### 4.1 Slice Order
- [ ] Implement slice order data structure
- [ ] Implement slice order dialog
- [ ] Implement slice order placement
- [ ] Implement slice order quantity calculation

#### 4.2 GTT OCO
- [ ] Implement OCO panel toggle
- [ ] Implement OCO leg 2 fields
- [ ] Implement OCO validation
- [ ] Implement OCO order placement
- [ ] Implement OCO modification

#### 4.3 Margin & Charges Breakdown
- [ ] Implement margin breakdown menu
- [ ] Implement charge breakdown menu
- [ ] Implement tooltip display
- [ ] Implement formatting functions

#### 4.4 Order Book Integration
- [ ] Implement order book update event handling
- [ ] Implement order status updates
- [ ] Implement order refresh

#### 4.5 Basket Order Integration
- [ ] Implement `place-bskord` event handling
- [ ] Implement basket order placement
- [ ] Implement basket order data structure

#### 4.6 Exit & Re-order
- [ ] Implement exit order functionality
- [ ] Implement re-order functionality
- [ ] Implement exit order validation
- [ ] Implement re-order prefill

---

### Phase 5: Testing & Validation

#### 5.1 Unit Testing
- [ ] Test order validation logic
- [ ] Test margin calculation
- [ ] Test order placement
- [ ] Test order modification
- [ ] Test order cancellation

#### 5.2 Integration Testing
- [ ] Test WebSocket integration
- [ ] Test drag functionality
- [ ] Test order preferences
- [ ] Test SIP navigation
- [ ] Test GTT OCO

#### 5.3 UI/UX Testing
- [ ] Test dialog responsiveness
- [ ] Test dialog drag
- [ ] Test dialog positioning
- [ ] Test dark mode compatibility
- [ ] Test all order types
- [ ] Test all price types
- [ ] Test all investment types

---

## Detailed Implementation Checklist

### ✅ Completed (Current New App)
- [x] Basic dialog structure
- [x] Buy/Sell toggle
- [x] Order type tabs
- [x] Investment type selection
- [x] Price type selection
- [x] Quantity and Price inputs
- [x] Trigger price, Stop loss, Target price
- [x] Validity & Disclosed Qty
- [x] After Market Order
- [x] Market Protection
- [x] GTT basic fields
- [x] Margin calculation
- [x] Order placement (Regular, GTT)
- [x] Order modification
- [x] Order cancellation
- [x] Drag functionality
- [x] WebSocket integration
- [x] SIP tab navigation

### ⚠️ Partial Implementation
- [ ] Slice Order Dialog (scaffold only)
- [ ] GTT OCO Panel (missing)
- [ ] Margin breakdown tooltip (missing detailed breakdown)
- [ ] Charge breakdown tooltip (missing)
- [ ] Order preferences loading (basic)
- [ ] Position restoration (basic)

### ❌ Missing Features
- [ ] Slice order functionality
- [ ] GTT OCO full implementation
- [ ] Detailed margin breakdown menu
- [ ] Detailed charge breakdown menu
- [ ] Advanced order validation
- [ ] Order book update event handling
- [ ] Basket order integration
- [ ] Exit order functionality
- [ ] Re-order functionality

---

## Priority Order

1. **High Priority**:
   - Complete GTT OCO implementation
   - Implement margin and charge breakdown menus
   - Implement order preferences loading
   - Implement exit and re-order functionality
   - Fix any existing bugs

2. **Medium Priority**:
   - Implement slice order functionality
   - Implement basket order integration
   - Enhance order validation
   - Improve position restoration

3. **Low Priority**:
   - Optimize performance
   - Add additional error handling
   - Add loading states
   - Add accessibility features

---

## Key Differences Between Old and New

### Template Differences:
1. **Vuetify 2 → Vuetify 3**:
   - `v-list-item-content` → `v-list-item-title`
   - `solo` → `variant="flat"`
   - `dense` → `density="compact"`
   - `x-small fab outlined` → `size="x-small" variant="outlined" icon`
   - `rounded-xl` → `rounded`
   - `hide-overlay` → `scrim="false"`

2. **Event Handling**:
   - `eventBus.$on` → `window.addEventListener`
   - `eventBus.$emit` → `window.dispatchEvent(new CustomEvent())`

3. **Component Structure**:
   - Options API → Composition API
   - `this.` → Direct ref access
   - `this.$nextTick()` → `nextTick()`

### Logic Differences:
1. **State Management**:
   - `data()` → `ref()` / `reactive()`
   - `computed` → `computed()`
   - `methods` → Regular functions

2. **Lifecycle Hooks**:
   - `mounted()` → `onMounted()`
   - `beforeDestroy()` → `onBeforeUnmount()`

3. **Router**:
   - `this.$router` → `useRouter()`
   - `this.$route` → `useRoute()`

---

## Notes

- The new app already has most of the core functionality implemented
- Focus should be on completing missing features and fixing any bugs
- GTT OCO is a critical missing feature
- Margin and charge breakdown menus enhance UX
- Order preferences need proper loading and saving
- Exit and re-order are important for order management

---

## Testing Checklist

1. **Order Placement**:
   - [ ] Regular order
   - [ ] Cover order
   - [ ] Bracket order
   - [ ] GTT order
   - [ ] OCO order
   - [ ] Slice order

2. **Order Management**:
   - [ ] Modify order
   - [ ] Cancel order
   - [ ] Re-order
   - [ ] Exit order

3. **UI/UX**:
   - [ ] Dialog drag
   - [ ] Dialog positioning
   - [ ] Quick/Advanced toggle
   - [ ] Sticky dialog
   - [ ] Margin display
   - [ ] Charge display

4. **Integration**:
   - [ ] WebSocket updates
   - [ ] Order book updates
   - [ ] SIP navigation
   - [ ] Basket orders

