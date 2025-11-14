# StockOrderWindow Component - Migration Guide

## Overview

This document provides a comprehensive breakdown of the `StockOrderWindow.vue` component logic and functionality to facilitate migration from Vue 2 + Vuetify 2 + EventBus to Vue 3 + Vuetify 3 + Pinia.

## Component Structure

### Main Components

1. **Slice Order Dialog** - Handles order splitting for freeze quantity scenarios
2. **Main Order Dialog** - Primary order placement interface with multiple tabs

---

## Tabs Overview

The component uses `ordertype` to switch between different order types:

- `0` - Regular Order
- `1` - Cover Order
- `2` - Bracket Order
- `3` - GTT (Good Till Triggered) Order
- `4` - SIP Order (redirects to orderbook)

---

## Tab 1: Regular Order (ordertype: 0)

### Input Fields & Logic

#### 1. Investment Type Radio Group

- **Field**: `investype`
- **Options**:
  - `"I"` - Intraday (default)
  - `"C"` - Delivery (NSE/BSE only)
  - `"M"` - Carry Forward (other exchanges)
- **Logic**:
  - Changes trigger `setOrdertypes()` and `getMargin()`
  - Determines product type (`prd`) in order payload
  - Affects margin calculation

#### 2. Order Type Selection (Chip Group)

- **Field**: `prc`
- **Options** (from `prcitems`):
  - `"LMT"` - Limit
  - `"MKT"` - Market
  - `"SL-LMT"` - Stop Loss Limit
  - `"SL-MKT"` - Stop Loss Market
- **Logic**:
  - Clicking a chip sets `prc = tag.val`
  - Triggers `getMargin()` and `setOrdertypes()`
  - For MCX/BSE, `prc_c_items` is used (excludes SL-MKT)

#### 3. Quantity Input

- **Field**: `ordqty`
- **Validation**:
  - Must be multiple of lot size (`menudata[0].ls`)
  - MCX: minimum 1, step 1
  - Other exchanges: minimum = lot size, step = lot size
- **Logic**:
  - `@input` triggers `getMargin()`
  - Increase/Decrease buttons adjust by lot size
  - Freeze quantity check: `menudata[1].frzqty`
  - Display: "MLot: {lotSize} {priceUnit}"

#### 4. Price Input

- **Field**: `ordprice`
- **Validation**:
  - Must be multiple of tick size (`menudata[0].ti`)
  - Readonly when `prc == 'MKT' || prc == 'SL-MKT'`
  - Must be between circuit levels: `menudata[1].lc` and `menudata[1].uc`
- **Logic**:
  - `@input` triggers `getMargin()`
  - Auto-set to LTP (`menudata[0].lp`) when switching to LMT/SL-LMT
  - Set to 0 for MKT orders
  - Display: "Tick: {tickSize}"

#### 5. Trigger Price (Conditional)

- **Field**: `ordtrgprice`
- **Visibility**: Only when `prc == 'SL-LMT' || prc == 'SL-MKT'`
- **Validation**:
  - Must be > 0
  - Must be multiple of tick size
- **Logic**:
  - Required for stop loss orders
  - Resets to 0 when not in SL mode

#### 6. Validity & Disclosed Qty (Expandable)

- **Toggle**: `addvalqty`
- **Validity Field**: `ordvalqtyprice`
  - Options: `"IOC"`, `"EOS"` (BFO/BCD), `"DAY"` (default)
  - BSE: Only `"DAY"` available
- **Disclosed Qty Field**: `orddisqty`
  - Type: number, min: 0
  - Required if `addvalqty` is true
- **Logic**:
  - `@change` on validity triggers `getMargin()`
  - Increment/decrement buttons for disclosed qty

#### 7. After Market Order (AMO)

- **Field**: `addmktord`
- **Type**: Checkbox
- **Logic**:
  - Disabled when `menudata.settype == 'mod'`
  - Adds `"amo": "Yes"` to order payload

#### 8. Market Production %

- **Field**: `mktprdordpec`
- **Visibility**: Only when `prc == 'MKT' || prc == 'SL-MKT'`
- **Validation**: min: 2, max: 100, step: 1
- **Default**: 5
- **Logic**:
  - `@input` triggers `getMargin()`
  - Sent as `mktProt` in order payload

---

## Tab 2: Cover Order (ordertype: 1)

### Additional Fields

#### 1. Stoploss Price

- **Field**: `ordslprice`
- **Validation**: Must be > 0
- **Logic**:
  - Required for Cover/Bracket orders
  - Sent as `blprc` in order payload
  - Product type becomes `"H"` (Cover)

### Shared Fields

- All fields from Regular Order apply
- Investment type options same as Regular
- Order type: Cannot use SL-MKT with Cover orders

---

## Tab 3: Bracket Order (ordertype: 2)

### Additional Fields

#### 1. Target Price

- **Field**: `ordtagprice`
- **Validation**: Must be > 0
- **Logic**:
  - Required for Bracket orders
  - Sent as `bpprc` in order payload
  - Product type becomes `"B"` (Bracket)

#### 2. Stoploss Price

- **Field**: `ordslprice`
- **Same as Cover Order**

### Shared Fields

- All fields from Regular Order apply
- Investment type: Cannot switch to Delivery with Bracket orders

---

## Tab 4: GTT Order (ordertype: 3)

### Main GTT Fields

#### 1. Alert Type

- **Field**: `gttalert`
- **Options** (from `gttalertitemso` or `gttalertitemst`):
  - `"LTP"` - Last Traded Price
  - `"Perc. change"` - Percentage Change
  - `"ATP"` - Average Traded Price
  - `"OI"` - Open Interest
  - `"TOI"` - Total Open Interest
  - `"52HIGH"` - 52 Week High
  - `"52LOW"` - 52 Week Low
  - `"VOLUME"` - Volume
- **Logic**:
  - When `gttalert == 'VOLUME'`, condition is forced to `">"`
  - Disabled when `gttocopanel || gttBSM == 'Modify'`

#### 2. Condition

- **Field**: `gttcond`
- **Options**: `">"` or `"<"`
- **Logic**:
  - Disabled when `gttalert == 'VOLUME'` or `gttBSM == 'Modify'`
  - Maps to `"A_O"` (>) or `"B_O"` (<) in API

#### 3. Value

- **Field**: `gttvalue`
- **Type**: number, min: 0
- **Logic**:
  - `@keyup` triggers `setOrdertypes()`
  - Required for GTT validation

#### 4. Quantity

- **Field**: `gttqty`
- **Validation**: Must be multiple of lot size
- **Default**: 1 (lot size)
- **Logic**:
  - Increment/decrement by lot size
  - Auto-set to lot size in `setOrdertypes()`

#### 5. Price

- **Field**: `gttprice`
- **Validation**:
  - Readonly when `prc == 'MKT' || prc == 'SL-MKT'`
  - Must be between circuit levels
- **Logic**:
  - Auto-set to LTP for LMT/SL-LMT
  - Set to 0 for MKT orders

#### 6. Trigger Price (Conditional)

- **Field**: `gtttrgprice`
- **Visibility**: Only when `prc == 'SL-LMT' || prc == 'SL-MKT'`
- **Type**: number, min: 0

### OCO Panel (Expandable)

#### Toggle

- **Field**: `gttocopanel`
- **Logic**:
  - When enabled, sets `gttalert = 'LTP'` and `gttcond = '>'`
  - When disabled, sets `gttalert = 'LTP'` and `gttcond = '<'`
  - Disabled when `gttBSM == 'Modify'`

#### OCO Order Type

- **Field**: `ocoprc`
- **Options**: Same as `prcitems` (LMT, MKT, SL-LMT, SL-MKT)
- **Logic**: `@change` triggers `setOrdertypes()`

#### OCO Fields (Similar to Main GTT)

- `ocovalue` - Alert value
- `ocoqty` - Quantity
- `ocoprice` - Price
- `ocotrgprice` - Trigger price (conditional)

### GTT Order Placement Logic

- **Validation**:
  - `gttvalue > 0`
  - `gttqty > 0`
  - If OCO: `ocovalue > 0 && ocoqty > 0`
- **API Endpoints**:
  - Create: `PlaceGTTOrder` or `PlaceOCOOrder`
  - Modify: `ModifyGTTOrder`
- **Payload Structure**:
  - `ai_t`: Alert type + condition (e.g., `"LTP_A_O"`)
  - `oivariable`: Array of values for OCO
  - `place_order_params`: Main order details
  - `place_order_params_leg2`: OCO order details (if OCO)

---

## Quick Order Mode

### Toggle

- **Field**: `quickord`
- **Default**: `false` (Advanced mode)
- **Logic**:
  - Stored in preferences (`orderprefd.quicksrc`)
  - Toggle button at bottom: "Quick order" ↔ "Advanced order"

### Differences in Quick Mode

#### 1. Investment Type

- **Field**: `invespoptype` (switch instead of radio)
- **Display**: Shows current type (Intraday/Delivery/Carry Forward)
- **Logic**:
  - Disabled when `ordertype == 2` (Bracket)
  - Tooltip shows switch option

#### 2. Order Type

- **Field**: `prc`
- **Display**: Two-card toggle (LMT/MKT)
- **Position**: Inline with price field
- **Logic**: Same options, different UI

#### 3. SL/Trigger Checkbox

- **Field**: `triggerfield`
- **Logic**:
  - When checked: `prc` becomes SL variant
  - When unchecked: `prc` becomes non-SL variant
  - Disabled when `prc == 'MKT' && ordertype != 0`

#### 4. Target Checkbox

- **Field**: `targetfield`
- **Logic**:
  - When checked: Sets `ordertype = 2` (Bracket)
  - Also enables `stoplossfield`

#### 5. Stoploss Checkbox

- **Field**: `stoplossfield`
- **Logic**:
  - When checked alone: Sets `ordertype = 1` (Cover)
  - When unchecked: Sets `ordertype = 0` (Regular)
  - Disabled when `ordertype == 2`

#### 6. Layout Changes

- Single column for quantity/price
- No tabs visible
- Compact spacing
- Height: `380px` vs `calc(100vh - 320px)`

---

## Common Features

### 1. Buy/Sell Toggle

- **Field**: `buyrsell`
- **Type**: Switch
- **Logic**:
  - `false` = Buy (green)
  - `true` = Sell (red)
  - Disabled when `menudata.settype == 'mod'`
  - Affects margin calculation (`trantype: "B"` or `"S"`)

### 2. Margin Display

- **Fields**:
  - `menudata.ordermargin` - Order margin required
  - `menudata.charges` - Brokerage charges
  - `alllimit.avbma` - Available balance
  - `menudata.mremarks` - Validation remarks
- **Logic**:
  - Calculated via `getMargin()` API call
  - Updates on quantity/price/investment type changes
  - Shows success/error icon based on `mremarks`
  - Expandable menu with detailed breakdown

### 3. Order Preferences

- **Storage**: `orderprefd` object
- **Fields**:
  - `stickysrc` - Keep dialog open after order
  - `quicksrc` - Default to quick order mode
  - `expos` - Exit order price type
  - `mktpro` - Market production %
  - `qtypre` - Default quantity preference
  - `mainpreitems` - Exchange-specific defaults

### 4. Slice Order Feature

- **Trigger**: When quantity > freeze quantity
- **Logic**:
  - Splits order into multiple parts
  - Max 20 splits
  - Sequential placement with delay
  - Dialog shows split quantities

### 5. WebSocket Integration

- **Purpose**: Real-time LTP updates
- **Logic**:
  - Subscribes on dialog open
  - Updates `menudata.ltp`, `menudata.ch`, `menudata.chp`
  - Unsubscribes on dialog close
  - Uses `WebSocketManager` for subscription tracking

### 6. Drag & Drop

- **Element**: `#maindiv`
- **Header**: `#maindivheader`
- **Logic**:
  - Position saved to localStorage
  - Restored on dialog open
  - Bounds checking to keep in viewport

---

## State Management (Current - Vue 2)

### Data Properties

```javascript
// UI State
quickord: false;
quickordswt: false;
ordsrcpop: false;
orderdialog: false;
orderloader: false;

// Order Fields
buyrsell: false;
investype: "I";
prc: "LMT";
ordertype: 0;
ordqty: 0;
ordprice: 0;
ordtrgprice: 0;
ordslprice: 0;
ordtagprice: 0;
ordvalqtyprice: "DAY";
orddisqty: 0;
addvalqty: false;
addmktord: false;
mktprdordpec: 5;

// GTT Fields
gttalert: "LTP";
gttcond: ">";
gttvalue: 0;
gttqty: 1;
gttprice: null;
gtttrgprice: null;
gttocopanel: false;
ocoprc: "LMT";
ocovalue: 0;
ocoqty: 1;
ocoprice: null;
ocotrgprice: null;

// Quick Order Fields
triggerfield: false;
stoplossfield: false;
targetfield: false;
invespoptype: false;

// Data
menudata: {
}
alllimit: null;
orderbskbookdata: {
}
```

### EventBus Events

#### Listening

- `"web-scoketConn"` - WebSocket data updates
- `"menudialog"` - Open order dialog
- `"place-bskord"` - Basket order placement

#### Emitting

- `"snack-event"` - Show snackbar message
- `"sub-loader"` - Show/hide loader
- `"web-scoketOn"` - WebSocket subscribe/unsubscribe
- `"orderbook-update"` - Refresh orderbook
- `"siporder-trigger"` - Open SIP order
- `"color-event"` - Update element color

---

## Migration to Vue 3 + Vuetify 3 + Pinia

### 1. Pinia Store Structure

```typescript
// stores/orderWindow.ts
export const useOrderWindowStore = defineStore("orderWindow", {
  state: () => ({
    // UI State
    quickord: false,
    quickordswt: false,
    ordsrcpop: false,
    orderdialog: false,
    orderloader: false,

    // Order Fields
    buyrsell: false,
    investype: "I",
    prc: "LMT",
    ordertype: 0,
    // ... all other fields

    // Data
    menudata: {} as any,
    alllimit: null as any,
  }),

  getters: {
    isQuickMode: (state) => state.quickord,
    canPlaceOrder: (state) => {
      // Validation logic
    },
  },

  actions: {
    async getMargin() {
      // Margin calculation logic
    },
    async setPlaceorder() {
      // Order placement logic
    },
    // ... all other methods
  },
});
```

### 2. Component Structure (Vue 3)

```vue
<script setup lang="ts">
import { useOrderWindowStore } from "@/stores/orderWindow";
import { onMounted, watch } from "vue";

const store = useOrderWindowStore();

// Computed properties become getters or computed()
// Methods become actions or regular functions
// EventBus becomes composables or direct store calls
</script>
```

### 3. Key Migration Points

#### EventBus → Pinia/Composables

- Replace `eventBus.$on` with Pinia store subscriptions or composables
- Replace `eventBus.$emit` with store actions or direct function calls

#### Vuetify 2 → Vuetify 3

- Update component names (e.g., `v-chip-group` → `v-chip-group`)
- Update prop names (some changed)
- Update slot syntax
- Update color system

#### Vue 2 → Vue 3

- Convert `data()` to `ref()` or `reactive()`
- Convert `methods` to regular functions
- Convert `computed` to `computed()`
- Update lifecycle hooks
- Update event handling syntax

### 4. Validation Logic

All validation should be extracted to:

- Pinia store actions
- Composable functions
- Or validation library (e.g., VeeValidate)

### 5. API Calls

Move all API calls to:

- Pinia store actions
- Service layer
- Or composables

---

## API Integration Points

### 1. getPlaceOrder(item, settype)

- **Purpose**: Place/modify/cancel order
- **Payload**: Varies by order type
- **Response**: `{ stat: "Ok", ... }` or error

### 2. getGTTPlaceOrder(item, url)

- **Purpose**: Place/modify GTT order
- **URLs**: `PlaceGTTOrder`, `PlaceOCOOrder`, `ModifyGTTOrder`
- **Response**: `{ stat: "OI created", ... }`

### 3. getOrderMargin(item)

- **Purpose**: Calculate margin requirement
- **Triggers**: On quantity/price/investment type change
- **Response**: `{ stat: "Ok", ordermargin, marginused, remarks, ... }`

### 4. getBrokerage(item)

- **Purpose**: Calculate charges
- **Response**: `{ stat: "Ok", brkage_amt, allcharges, ... }`

### 5. getMLimits()

- **Purpose**: Get available balance
- **Response**: `{ stat: "Ok", avbma, ... }`

### 6. getQuotesdata(exch|token)

- **Purpose**: Get symbol data
- **Response**: Quote data with LTP, lot size, etc.

### 7. getSecuritydata(exch|token)

- **Purpose**: Get security details
- **Response**: Freeze quantity, circuit levels, etc.

### 8. setOrdprefApi(data, isUpdate)

- **Purpose**: Get/set order preferences
- **Response**: Preference object

---

## Validation Rules Summary

### Quantity

- Must be > 0
- Must be multiple of lot size (except MCX)
- MCX: min 1, step 1
- Cannot exceed freeze quantity × 20 (non-BSE)

### Price

- Must be multiple of tick size (for LMT/SL-LMT)
- Must be between circuit levels (lc to uc)
- Market orders: 0 (readonly)

### Trigger Price

- Required for SL orders
- Must be > 0
- Must be multiple of tick size

### Stoploss/Target

- Required for Cover/Bracket orders
- Must be > 0

### GTT

- Value must be > 0
- Quantity must be > 0
- If OCO: Both legs must be valid

---

## Order Payload Structure

### Regular/Cover/Bracket Order

```javascript
{
  uid: string,
  actid: string,
  exch: string,
  tsym: string,
  ret: "DAY" | "IOC" | "EOS",
  qty: string,
  prc: string, // "0" for market
  prd: "I" | "C" | "M" | "H" | "B",
  trantype: "B" | "S",
  prctyp: "LMT" | "MKT" | "SL-LMT" | "SL-MKT",
  trgprc?: string, // For SL orders
  blprc?: string, // For Cover/Bracket
  bpprc?: string, // For Bracket
  dscqty?: string, // If disclosed qty
  amo?: "Yes", // If AMO
  mktProt?: string, // For market orders
  norenordno?: string, // For modify
}
```

### GTT Order

```javascript
{
  uid: string,
  tsym: string,
  exch: string,
  ai_t: string, // Alert type + condition
  al_id?: string, // For modify
  validity: "GTT",
  d: string, // Value
  trantype: "B" | "S",
  prctyp: string,
  prd: string,
  ret: "DAY",
  actid: string,
  qty: string,
  prc: string,
  trgprc: string,
  // OCO fields if applicable
  oivariable?: Array<{d: string, var_name: string}>,
  place_order_params?: {...},
  place_order_params_leg2?: {...},
}
```

---

## Testing Checklist

### Regular Order

- [ ] Investment type switching
- [ ] Order type selection
- [ ] Quantity validation (lot size)
- [ ] Price validation (tick size, circuit levels)
- [ ] Trigger price (SL orders)
- [ ] Validity & disclosed qty
- [ ] AMO checkbox
- [ ] Market production %
- [ ] Margin calculation
- [ ] Order placement

### Cover Order

- [ ] Stoploss price required
- [ ] Cannot use SL-MKT
- [ ] Product type = "H"

### Bracket Order

- [ ] Target price required
- [ ] Stoploss price required
- [ ] Cannot switch to Delivery
- [ ] Product type = "B"

### GTT Order

- [ ] Alert type selection
- [ ] Condition selection
- [ ] Value input
- [ ] OCO panel toggle
- [ ] OCO fields validation
- [ ] GTT placement/modify

### Quick Order Mode

- [ ] Investment type switch
- [ ] Order type toggle
- [ ] SL/Trigger checkbox
- [ ] Target checkbox
- [ ] Stoploss checkbox
- [ ] Order type auto-switching

### Common

- [ ] Buy/Sell toggle
- [ ] Margin display
- [ ] Slice order
- [ ] Drag & drop
- [ ] WebSocket updates
- [ ] Preferences persistence

---

## Notes

1. **Exchange-Specific Logic**: Many validations depend on exchange type (NSE, BSE, MCX, etc.)
2. **Modify Mode**: When `menudata.settype == 'mod'`, certain fields are disabled
3. **Exit Order**: Special handling for position exit orders
4. **Basket Orders**: Separate flow via `orderbskbookdata`
5. **SIP Orders**: Redirects to orderbook page
6. **Error Handling**: All API errors shown via snackbar
7. **Loading States**: `orderloader` controls button disabled state

---

## Migration Priority

1. **High Priority**:

   - Core order placement logic
   - Validation rules
   - Margin calculation
   - API integration

2. **Medium Priority**:

   - UI state management
   - Quick order mode
   - GTT orders
   - Slice orders

3. **Low Priority**:
   - Drag & drop
   - Preferences
   - WebSocket (if already migrated)

---

This README should serve as a comprehensive guide for migrating the StockOrderWindow component to Vue 3 + Vuetify 3 + Pinia.
