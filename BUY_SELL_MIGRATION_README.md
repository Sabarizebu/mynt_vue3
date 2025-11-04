# Buy & Sell Order Logic Migration - Analysis & Documentation

## Overview
This document provides a comprehensive analysis of the buy and sell order logic from the old Vue 2 application and outlines the migration plan to Vue 3, Vuetify 3, and Pinia.

## Table of Contents
1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Key Components](#key-components)
3. [Order Flow & Functionality](#order-flow--functionality)
4. [API Integration](#api-integration)
5. [Event Bus Usage](#event-bus-usage)
6. [Data Models](#data-models)
7. [Migration Considerations](#migration-considerations)

---

## Current Architecture Analysis

### Old App (Vue 2) Architecture

#### 1. **StockOrderWindow Component**
- **Location**: `SuperApp-FE-main-2/src/components/Popups/StockOrderWindow.vue`
- **Size**: ~1928 lines
- **Technology**: Vue 2 Options API, Vuetify 2, Event Bus

#### 2. **Order Trigger Points**
The buy/sell functionality is triggered from multiple locations:
- **StocksDetails.vue**: Buy/Sell buttons in toolbar
- **WatchList.vue**: B/S buttons on hover (watchlist items)
- **StocksOrderBook.vue**: Modify/Re-order actions
- **StockGTTorders.vue**: GTT order modifications
- **Positions.vue**: Exit orders
- **Holdings.vue**: Buy/Sell for holdings

#### 3. **Event Communication**
- Uses `eventBus.$emit('menudialog', type, token, exch, tsym, trantype, item)`
- Listens in `LayoutSrc.vue` which opens `StockOrderWindow` component
- Event types: `'order'`, `'order-GTT'`, `'mod-order'`, `'re-order'`, `'exit-order'`, `'cancel-order'`, `'mod-GTT'`

---

## Key Components

### 1. StockOrderWindow.vue (Main Order Dialog)

#### **Template Structure**
```vue
<template>
  <!-- Slice Order Dialog (for large quantities) -->
  <v-dialog v-if="menudata.sliceorder" ...>
  
  <!-- Main Order Dialog -->
  <v-card v-if="orderdialog" id="maindiv" ...>
    <!-- Header with symbol info and Buy/Sell toggle -->
    <v-card id="maindivheader" ...>
      <v-toolbar>
        <v-list-item>
          <v-list-item-title>{{ symbol info }}</v-list-item-title>
        </v-list-item>
        <v-switch v-model="buyrsell"> <!-- Buy/Sell toggle -->
      </v-toolbar>
    </v-card>
    
    <!-- Order Configuration -->
    <v-tabs v-model="ordertype">
      <!-- Order Type Tabs: Normal, Cover, Bracket, GTT -->
    </v-tabs>
    
    <!-- Investment Type: Intraday/Delivery/Carry Forward -->
    <v-radio-group v-model="investype">...</v-radio-group>
    
    <!-- Price Type: Market/Limit/Stop Loss -->
    <v-chip-group v-model="prc">...</v-chip-group>
    
    <!-- Quantity Input -->
    <v-text-field v-model="ordqty" ...>
    
    <!-- Price Input -->
    <v-text-field v-model="ordprice" :readonly="prc == 'MKT'">
    
    <!-- Stop Loss & Target (for Cover/Bracket orders) -->
    <v-text-field v-model="ordslprice" v-if="ordertype == 1 || ordertype == 2">
    <v-text-field v-model="ordtagprice" v-if="ordertype == 2">
    
    <!-- Trigger Price (for Stop Loss orders) -->
    <v-text-field v-model="ordtrgprice" v-if="prc == 'SL-LMT' || prc == 'SL-MKT'">
    
    <!-- Margin & Charges Display -->
    <!-- Order Summary -->
    
    <!-- Place Order Button -->
    <v-btn @click="setUPPlaceorder()">Place Order</v-btn>
  </v-card>
</template>
```

#### **Key Data Properties**
- `menudata`: Array containing symbol quote data `[0]` and security data `[1]`
- `orderdialog`: Boolean - controls order dialog visibility
- `buyrsell`: Boolean - false = Buy, true = Sell
- `ordertype`: Number - 0=Normal, 1=Cover, 2=Bracket, 3=GTT
- `investype`: String - 'I'=Intraday, 'C'=Delivery, 'M'=Carry Forward
- `prc`: String - 'MKT'|'LMT'|'SL-MKT'|'SL-LMT'
- `ordqty`: Number - Order quantity
- `ordprice`: Number - Limit price
- `ordslprice`: Number - Stop loss price (Cover/Bracket)
- `ordtagprice`: Number - Target price (Bracket)
- `ordtrgprice`: Number - Trigger price (Stop Loss)
- `orddisqty`: Number - Disclosed quantity (IOC/EOS orders)
- `addmktord`: Boolean - After Market Order flag
- `quickord`: Boolean - Quick order mode
- `ordsrcpop`: Boolean - Sticky order dialog flag

#### **Key Methods**
1. **`setMenudialog(type, token, exch, tsym, trantype, item)`**
   - Opens order dialog
   - Fetches quote and security data
   - Initializes order preferences
   - Handles different order types (new/modify/re-order/GTT)

2. **`setUPPlaceorder(loop)`**
   - Validates quantity
   - Handles slice orders (large quantities split into multiple orders)
   - Opens main order dialog or slice dialog

3. **`setPlaceorder(loop, fqty)`**
   - Core order placement logic
   - Validates: quantity, price (circuit limits), trigger price, stop loss, target
   - Validates tick size and lot size
   - Constructs order payload
   - Calls `getPlaceOrder()` API
   - Handles order types: Place, Modify, Cancel, Exit

4. **`getMargin()`**
   - Calculates margin requirements
   - Fetches order margin from API
   - Updates `menudata.margin`, `ordermargin`, `cash`

5. **`getBroker()`**
   - Calculates brokerage charges
   - Updates `menudata.charges`

6. **`setOrdertypes()`**
   - Updates order type dependencies
   - Sets default prices based on order type
   - Handles GTT-specific logic

7. **`setGttplaceorder()`**
   - Handles GTT (Good Till Trigger) orders
   - Supports OCO (One Cancels Other) orders
   - Constructs GTT-specific payload

8. **`optionChainDataParse(data)`**
   - Updates real-time LTP in order dialog
   - Handles WebSocket updates

---

## Order Flow & Functionality

### Order Placement Flow

```
User Clicks Buy/Sell
    ↓
eventBus.$emit('menudialog', 'order', token, exch, tsym, trantype)
    ↓
LayoutSrc.vue receives event
    ↓
StockOrderWindow.setMenudialog() called
    ↓
Fetch Quote Data (getQuotesdata)
Fetch Security Data (getSecuritydata)
Load Order Preferences (setOrdprefApi)
    ↓
Initialize Order Dialog
- Set default order type
- Set default investment type
- Set default quantity
- Subscribe to WebSocket for live prices
    ↓
User Configures Order
- Select Buy/Sell
- Select Order Type (Normal/Cover/Bracket/GTT)
- Select Investment Type
- Enter Quantity
- Enter Price/Select Market
- (Optional) Enter Stop Loss/Target
    ↓
setUPPlaceorder() called
    ↓
Validate Quantity
Check if slice order needed (quantity > freeze quantity * 20)
    ↓
If slice order: Show slice dialog
Else: setPlaceorder() called
    ↓
Validate Order Parameters
- Quantity > 0
- Price within circuit limits (LC to UC)
- Trigger price > 0 (for SL orders)
- Stop loss > 0 (for Cover/Bracket)
- Target > 0 (for Bracket)
- Quantity multiple of lot size
- Price multiple of tick size
    ↓
Construct Order Payload
{
  uid, actid, exch, tsym, qty, prc, prd, trantype, prctyp,
  ret, blprc (stop loss), bpprc (target), trgprc (trigger),
  dscqty (disclosed qty), amo (after market), mktProt
}
    ↓
Call getPlaceOrder(item, type)
    ↓
Handle Response
- Success: Close dialog (if not sticky), show success
- Error: Show error message
    ↓
Emit orderbook-update event
```

### Order Types

#### 1. **Normal Order (ordertype = 0)**
- Standard market or limit order
- No stop loss or target
- Investment type: Intraday/Delivery/Carry Forward

#### 2. **Cover Order (ordertype = 1)**
- Stop loss order
- Requires `ordslprice`
- Product code: `prd = "H"`

#### 3. **Bracket Order (ordertype = 2)**
- Stop loss + Target order
- Requires `ordslprice` and `ordtagprice`
- Product code: `prd = "B"`

#### 4. **GTT Order (ordertype = 3)**
- Good Till Trigger order
- Conditional orders based on price alerts
- Supports OCO (One Cancels Other) orders
- Requires alert type, condition, value

### Investment Types

#### **Intraday ('I')**
- Valid for all exchanges
- Position closed by end of day
- Product code: `prd = "MIS"`

#### **Delivery ('C')**
- Valid for NSE/BSE only
- Shares delivered to demat account
- Product code: `prd = "CNC"`

#### **Carry Forward ('M')**
- Valid for F&O exchanges (NFO, BFO, etc.)
- Position carried forward
- Product code: `prd = "NRML"`

### Price Types

#### **Market ('MKT')**
- Market price order
- `prc = "0"`
- No price validation needed

#### **Limit ('LMT')**
- Limit price order
- `prc = ordprice`
- Must be within circuit limits (LC to UC)
- Must be multiple of tick size

#### **Stop Loss Market ('SL-MKT')**
- Stop loss market order
- Requires trigger price (`ordtrgprice`)
- Market order executed when trigger hit

#### **Stop Loss Limit ('SL-LMT')**
- Stop loss limit order
- Requires trigger price and limit price
- Limit order executed when trigger hit

---

## API Integration

### 1. **getPlaceOrder(item, type)**
- **Location**: `components/mixins/getAPIdata.js`
- **Parameters**:
  ```javascript
  {
    uid: string,
    actid: string,
    exch: string,
    tsym: string (URL encoded),
    qty: string,
    prc: string,
    prd: string, // 'MIS'|'CNC'|'NRML'|'H'|'B'
    trantype: string, // 'B'|'S'
    prctyp: string, // 'MKT'|'LMT'|'SL-MKT'|'SL-LMT'
    ret: string, // 'DAY'|'IOC'|'EOS'
    blprc?: string, // Stop loss price
    bpprc?: string, // Target price
    trgprc?: string, // Trigger price
    dscqty?: string, // Disclosed quantity
    amo?: string, // 'Yes' for after market order
    mktProt?: string, // Market protection percentage
    norenordno?: string // For modify/cancel orders
  }
  ```
- **Endpoints**:
  - `PlaceOrder` - New order
  - `ModifyOrder` - Modify existing order
  - `CancelOrder` - Cancel order
  - `ExitSNOOrder` - Exit bracket/cover order

### 2. **getOrderMargin(item)**
- Calculates margin requirement for order
- Returns: `marginused`, `ordermargin`, `cash`, `remarks`

### 3. **getBrokerage(item)**
- Calculates brokerage and charges
- Returns: `brkage_amt`, `stt_amt`, `exch_chrg`, etc.

### 4. **getQuotesdata(exch|token)**
- Fetches real-time quote for symbol
- Returns: `lp`, `ch`, `chp`, `lc`, `uc`, `ti`, `ls`, etc.

### 5. **getSecuritydata(exch|token)**
- Fetches security/instrument details
- Returns: `frzqty`, `ls`, `prd`, etc.

### 6. **setOrdprefApi(data, save)**
- Gets/sets user order preferences
- Returns: Default order type, investment type, quantity, etc.

### 7. **getGTTPlaceOrder(item, url)**
- Places GTT orders
- Endpoints: `PlaceGTTOrder`, `PlaceOCOOrder`, `ModifyGTTOrder`

---

## Event Bus Usage

### Events Emitted

1. **`menudialog`**
   ```javascript
   eventBus.$emit('menudialog', type, token, exch, tsym, trantype, item)
   ```
   - Opens order dialog
   - Types: `'order'`, `'order-GTT'`, `'mod-order'`, `'re-order'`, `'exit-order'`, `'cancel-order'`

2. **`snack-event`**
   ```javascript
   eventBus.$emit('snack-event', color, msg)
   ```
   - Shows snackbar notification
   - Color: 0=info, 1=success, 2=error

3. **`orderbook-update`**
   ```javascript
   eventBus.$emit('orderbook-update', 'orders'|'gtt')
   ```
   - Triggers order book refresh

4. **`sub-loader`**
   ```javascript
   eventBus.$emit('sub-loader', 0|1)
   ```
   - Shows/hides global loader

5. **`web-scoketOn`**
   ```javascript
   eventBus.$emit('web-scoketOn', 'sub'|'unsub', data, page)
   ```
   - WebSocket subscription management

### Events Listened

1. **`menudialog`** - Received in LayoutSrc.vue
2. **`web-scoketConn`** - WebSocket data updates
3. **`place-bskord`** - Basket order placement

---

## Data Models

### Order Payload Structure

```javascript
{
  // Required
  uid: string,
  actid: string,
  exch: string,
  tsym: string, // URL encoded
  qty: string,
  prc: string, // "0" for market, actual price for limit
  prd: string, // 'MIS'|'CNC'|'NRML'|'H'|'B'
  trantype: string, // 'B'|'S'
  prctyp: string, // 'MKT'|'LMT'|'SL-MKT'|'SL-LMT'
  ret: string, // 'DAY'|'IOC'|'EOS'
  
  // Optional - Cover Order
  blprc?: string, // Stop loss price
  
  // Optional - Bracket Order
  bpprc?: string, // Target price
  
  // Optional - Stop Loss Orders
  trgprc?: string, // Trigger price
  
  // Optional - IOC/EOS Orders
  dscqty?: string, // Disclosed quantity
  
  // Optional - After Market
  amo?: string, // 'Yes'
  
  // Optional - Market Protection
  mktProt?: string, // Percentage (e.g., '5')
  
  // Optional - Modify/Cancel
  norenordno?: string,
  
  // System
  app_inst_id?: string,
  usr_agent?: string,
  ipaddr?: string,
  channel?: string,
  userAgent?: string,
  appInstaId?: string
}
```

### Quote Data Structure

```javascript
{
  token: string,
  exch: string,
  tsym: string,
  lp: number, // Last price
  ch: number, // Change
  chp: number, // Change percent
  lc: number, // Lower circuit
  uc: number, // Upper circuit
  ti: number, // Tick size
  ls: number, // Lot size
  instname: string, // 'UNDIND'|'COM'|...
  wk52_l: number, // 52 week low
  wk52_h: number // 52 week high
}
```

### Security Data Structure

```javascript
{
  frzqty: number, // Freeze quantity
  ls: number, // Lot size
  prd: string, // Product alias
  // ... other security details
}
```

---

## Migration Considerations

### 1. **Event Bus → Custom Events**
- Replace `eventBus.$emit` with `window.dispatchEvent(new CustomEvent(...))`
- Replace `eventBus.$on` with `window.addEventListener`
- Replace `eventBus.$off` with `window.removeEventListener`

### 2. **Options API → Composition API**
- Convert `data()` to `ref()` / `reactive()`
- Convert `methods` to functions
- Convert `computed` to `computed()`
- Convert lifecycle hooks: `mounted()` → `onMounted()`, `beforeDestroy()` → `onBeforeUnmount()`

### 3. **Vuetify 2 → Vuetify 3**
- `v-data-table`: `{ text, value }` → `{ title, key }`
- `v-select`: `@change` → `@update:model-value`
- `v-chip-group`: `@change` → `@update:model-value`
- `v-switch`: `inset` → `inset`
- `v-btn`: `small` → `size="small"`, `outlined` → `variant="outlined"`
- `v-text-field`: `flat solo` → `variant="flat"`, `background-color` → `bg-color`
- `v-dialog`: `hide-overlay` → `scrim={false}`
- `v-tabs`: `@change` → `@update:model-value`
- Remove `v-list-item-content`, use direct `v-list-item-title`/`v-list-item-subtitle`

### 4. **State Management**
- Move dialog state to Pinia store (optional, or use local component state)
- Use `useAppStore()` for snackbar notifications
- Consider order preferences in Pinia store

### 5. **API Calls**
- Ensure `sessionStorage.getItem('userid')` and `sessionStorage.getItem('msession')` are available
- Handle async/await properly
- Add error handling with try-catch

### 6. **WebSocket Integration**
- Migrate WebSocket subscription logic
- Use `window.dispatchEvent` for WebSocket updates
- Handle real-time price updates in order dialog

### 7. **Validation Logic**
- Keep all validation logic intact
- Ensure tick size and lot size validation
- Circuit limit validation
- Freeze quantity validation

### 8. **UI/UX Enhancements**
- Maintain drag functionality for order dialog
- Preserve position in localStorage
- Keep sticky order dialog functionality
- Maintain quick order mode

---

## Testing Checklist

- [ ] Order dialog opens from all trigger points
- [ ] Buy/Sell toggle works correctly
- [ ] All order types (Normal/Cover/Bracket/GTT) function properly
- [ ] Investment types (Intraday/Delivery/Carry Forward) work
- [ ] Price types (Market/Limit/Stop Loss) function
- [ ] Quantity validation (lot size) works
- [ ] Price validation (tick size, circuit limits) works
- [ ] Stop loss and target prices work for Cover/Bracket orders
- [ ] Trigger price validation for Stop Loss orders
- [ ] Margin calculation displays correctly
- [ ] Brokerage charges display correctly
- [ ] Order placement succeeds
- [ ] Order modification works
- [ ] Order cancellation works
- [ ] GTT order placement works
- [ ] OCO order placement works
- [ ] Slice orders work (large quantities)
- [ ] WebSocket updates reflect in order dialog
- [ ] Dialog position is preserved
- [ ] Sticky dialog works
- [ ] Quick order mode works
- [ ] Error messages display correctly
- [ ] Success notifications display correctly

---

## Next Steps

See `BUY_SELL_MIGRATION_PLAN.md` for detailed step-by-step migration instructions.

