# Buy & Sell Order Logic Migration Plan

## Overview

This document provides a detailed, step-by-step plan to migrate all buy and sell order logic from Vue 2/Vuetify 2/Event Bus to Vue 3/Vuetify 3/Pinia.

## Migration Phases

### Phase 1: Preparation & Setup

### Phase 2: Core Component Migration (StockOrderWindow.vue)

### Phase 3: Event System Migration

### Phase 4: Integration Points Migration

### Phase 5: Testing & Validation

---

## Phase 1: Preparation & Setup

### Step 1.1: Create Pinia Store for Order State (Optional)

**File**: `src/stores/orderStore.js`

**Purpose**: Centralize order-related state (optional - can use local component state instead)

```javascript
import { defineStore } from "pinia";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orderDialog: false,
    orderPreferences: null,
    // ... other order state
  }),
  actions: {
    // Order actions if needed
  },
});
```

**Note**: This is optional. The order dialog can use local component state if preferred.

### Step 1.2: Verify API Functions

**Files to Check**:

- `src/components/mixins/getAPIdata.js` - Verify `getPlaceOrder`, `getOrderMargin`, `getBrokerage`, `getGTTPlaceOrder`, `getQuotesdata`, `getSecuritydata`, `setOrdprefApi`

**Actions**:

- Ensure all API functions read `sessionStorage.getItem('userid')` and `sessionStorage.getItem('msession')` dynamically
- Verify error handling is proper
- Check that API payloads are correctly formatted

### Step 1.3: Verify WebSocket Integration

**Files to Check**:

- WebSocket manager (if exists)
- Event listeners for order updates

**Actions**:

- Ensure WebSocket subscriptions work correctly
- Verify real-time price updates reach the order dialog

---

## Phase 2: Core Component Migration (StockOrderWindow.vue)

### Step 2.1: Convert to Composition API Setup

**File**: `src/components/Popups/StockOrderWindow.vue`

**Actions**:

1. **Replace `<script>` with `<script setup>`**

   ```javascript
   // Old
   <script>
   export default { ... }
   </script>

   // New
   <script setup>
   import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
   import { useAppStore } from '@/stores/appStore'
   import { useTheme } from 'vuetify'
   // ... imports
   </script>
   ```

2. **Convert data() to refs/reactive**

   ```javascript
   // Old
   data() {
     return {
       orderdialog: false,
       buyrsell: false,
       ordertype: 0,
       // ...
     }
   }

   // New
   const orderdialog = ref(false)
   const buyrsell = ref(false)
   const ordertype = ref(0)
   const menudata = ref([])
   // ...
   ```

3. **Convert computed properties**

   ```javascript
   // Old
   computed: {
     orderchartItems() { ... }
   }

   // New
   const orderchartItems = computed(() => { ... })
   ```

4. **Convert methods to functions**

   ```javascript
   // Old
   methods: {
     setMenudialog(type, token, exch, tsym, trantype, item) { ... }
   }

   // New
   const setMenudialog = async (type, token, exch, tsym, trantype, item) => { ... }
   ```

5. **Convert lifecycle hooks**

   ```javascript
   // Old
   mounted() { ... }
   beforeDestroy() { ... }

   // New
   onMounted(() => { ... })
   onBeforeUnmount(() => { ... })
   ```

### Step 2.2: Migrate Template to Vuetify 3

**Actions**:

1. **Update v-dialog**

   ```vue
   <!-- Old -->
   <v-dialog v-model="menudata.sliceorder" persistent hide-overlay width="380px">

   <!-- New -->
   <v-dialog v-model="menudata.sliceorder" persistent :scrim="false" width="380px">
   ```

2. **Update v-tabs**

   ```vue
   <!-- Old -->
   <v-tabs @change="setOrderTabs()" v-model="ordertype">

   <!-- New -->
   <v-tabs @update:model-value="setOrderTabs()" v-model="ordertype">
   ```

3. **Update v-chip-group**

   ```vue
   <!-- Old -->
   <v-chip-group @change="getMargin(), setOrdertypes()" row>

   <!-- New -->
   <v-chip-group @update:model-value="getMargin(), setOrdertypes()" row>
   ```

4. **Update v-select (if any)**

   ```vue
   <!-- Old -->
   <v-select @change="handler">

   <!-- New -->
   <v-select @update:model-value="handler">
   ```

5. **Update v-text-field**

   ```vue
   <!-- Old -->
   <v-text-field dense background-color="secbg" flat solo>

   <!-- New -->
   <v-text-field density="compact" bg-color="secbg" variant="flat">
   ```

6. **Update v-btn**

   ```vue
   <!-- Old -->
   <v-btn small outlined fab x-small>

   <!-- New -->
   <v-btn size="small" variant="outlined" fab size="x-small">
   ```

7. **Update v-list-item structure**

   ```vue
   <!-- Old -->
   <v-list-item>
     <v-list-item-content>
       <v-list-item-title>...</v-list-item-title>
       <v-list-item-subtitle>...</v-list-item-subtitle>
     </v-list-item-content>
   </v-list-item>

   <!-- New -->
   <v-list-item>
     <v-list-item-title>...</v-list-item-title>
     <v-list-item-subtitle>...</v-list-item-subtitle>
   </v-list-item>
   ```

8. **Update v-menu**

   ```vue
   <!-- Old -->
   <v-menu offset-y left>

   <!-- New -->
   <v-menu location="bottom" :offset="[0, 8]">
   ```

### Step 2.3: Migrate Event Bus to Custom Events

**Actions**:

1. **Replace eventBus.$emit with window.dispatchEvent**

   ```javascript
   // Old
   eventBus.$emit("snack-event", color, msg);

   // New
   appStore.showSnackbar(color, msg);
   // OR
   window.dispatchEvent(
     new CustomEvent("snack-event", { detail: { color, msg } })
   );
   ```

2. **Replace eventBus.$on with window.addEventListener**

   ```javascript
   // Old
   mounted() {
     eventBus.$on('menudialog', this.setMenudialog)
   }

   // New
   onMounted(() => {
     window.addEventListener('menudialog', handleMenuDialogEvent)
   })

   // Handler function
   const handleMenuDialogEvent = (event) => {
     const { type, token, exch, tsym, trantype, item } = event.detail
     setMenudialog(type, token, exch, tsym, trantype, item)
   }
   ```

3. **Replace eventBus.$off with window.removeEventListener**

   ```javascript
   // Old
   beforeDestroy() {
     eventBus.$off('menudialog')
   }

   // New
   onBeforeUnmount(() => {
     window.removeEventListener('menudialog', handleMenuDialogEvent)
   })
   ```

### Step 2.4: Update Theme Access

**Actions**:

1. **Replace this.$vuetify.theme.dark with useTheme()**

   ```javascript
   // Old
   const isDark = this.$vuetify.theme.dark;

   // New
   import { useTheme } from "vuetify";
   const theme = useTheme();
   const isDark = theme.current.value.dark;
   ```

### Step 2.5: Migrate WebSocket Integration

**Actions**:

1. **Update WebSocket subscription logic**

   ```javascript
   // Old
   this.setWebsocket("sub", wsdata, "menu");

   // New
   const setWebsocket = (flow, data, is) => {
     // Use window.dispatchEvent for WebSocket subscription
     window.dispatchEvent(
       new CustomEvent("web-scoketOn", {
         detail: { flow, data, is, page: "menu" },
       })
     );
   };
   ```

2. **Update WebSocket data handling**

   ```javascript
   // Old
   eventBus.$on("web-scoketConn", this.handleWebSocketConnection);

   // New
   const handleWebSocketConnection = (event) => {
     const data = event.detail;
     if (data && data.token == symbol.value.token) {
       optionChainDataParse(data);
     }
   };

   onMounted(() => {
     window.addEventListener("web-scoketConn", handleWebSocketConnection);
   });

   onBeforeUnmount(() => {
     window.removeEventListener("web-scoketConn", handleWebSocketConnection);
   });
   ```

### Step 2.6: Update API Calls

**Actions**:

1. **Ensure session data is read dynamically**

   ```javascript
   // Old (might use class-level variables)
   const uid = this.uid;

   // New
   const uid = ref(sessionStorage.getItem("userid"));
   const mtoken = ref(sessionStorage.getItem("msession"));

   // Watch for changes
   watch(
     () => sessionStorage.getItem("userid"),
     (newVal) => {
       uid.value = newVal;
     }
   );
   ```

2. **Update getPlaceOrder calls**
   ```javascript
   // Ensure API functions read sessionStorage directly
   // The API function should already handle this, but verify
   const data = await getPlaceOrder(item, menudata.value.settype);
   ```

---

## Phase 3: Event System Migration

### Step 3.1: Update All Order Trigger Points

**Files to Update**:

1. `src/views/Dashboard/stocks/StocksDetails.vue` ✓ (Already done)
2. `src/views/Watchlist/WatchList.vue` ✓ (Already done)
3. `src/views/Orders/StocksOrderBook.vue`
4. `src/views/Orders/StockGTTorders.vue`
5. `src/views/Holdings/HolDings.vue`
6. `src/views/Positions/PosiTions.vue`

**Actions**:

1. **Ensure all use window.dispatchEvent**

   ```javascript
   // Standard pattern
   const handleMenuDialog = (type, token, exch, tsym, trantype, item) => {
     window.dispatchEvent(
       new CustomEvent("menudialog", {
         detail: { type, token, exch, tsym, trantype, item },
       })
     );
   };
   ```

2. **Update event payload structure**
   ```javascript
   // All events should use object detail
   {
     detail: {
       type: 'order' | 'order-GTT' | 'mod-order' | 're-order' | 'exit-order' | 'cancel-order' | 'mod-GTT',
       token: string,
       exch: string,
       tsym: string,
       trantype: 'b' | 's',
       item?: object // For modify/re-order/cancel orders
     }
   }
   ```

### Step 3.2: Update Layout/App Component

**File**: `src/App.vue` or Layout component

**Actions**:

1. **Add StockOrderWindow component**

   ```vue
   <template>
     <StockOrderWindow />
   </template>

   <script setup>
   import StockOrderWindow from "@/components/Popups/StockOrderWindow.vue";
   </script>
   ```

2. **Listen for menudialog events globally**

   ```javascript
   onMounted(() => {
     window.addEventListener("menudialog", handleGlobalMenuDialog);
   });

   onBeforeUnmount(() => {
     window.removeEventListener("menudialog", handleGlobalMenuDialog);
   });
   ```

---

## Phase 4: Integration Points Migration

### Step 4.1: Update Snackbar Notifications

**Actions**:

1. **Replace eventBus snackbar with Pinia store**

   ```javascript
   // Old
   eventBus.$emit("snack-event", color, msg);

   // New
   import { useAppStore } from "@/stores/appStore";
   const appStore = useAppStore();
   appStore.showSnackbar(color, msg);
   ```

### Step 4.2: Update Order Book Refresh

**Actions**:

1. **Replace orderbook-update event**

   ```javascript
   // Old
   eventBus.$emit("orderbook-update", "orders");

   // New
   window.dispatchEvent(
     new CustomEvent("orderbook-update", {
       detail: { type: "orders" },
     })
   );
   ```

2. **Update OrderScreen to listen for events**

   ```javascript
   // In OrderScreen.vue or relevant component
   onMounted(() => {
     window.addEventListener("orderbook-update", handleOrderBookUpdate);
   });

   const handleOrderBookUpdate = (event) => {
     const { type } = event.detail;
     if (type === "orders") {
       // Refresh order book
       getMOrderbook();
     }
   };
   ```

### Step 4.3: Update Loader Events

**Actions**:

1. **Replace sub-loader events**

   ```javascript
   // Old
   eventBus.$emit("sub-loader", 1);

   // New
   // Use local loading state or Pinia store
   const orderloader = ref(false);
   ```

---

## Phase 5: Testing & Validation

### Step 5.1: Unit Testing

**Test Cases**:

1. **Order Dialog Opening**

   - [ ] Dialog opens from StocksDetails
   - [ ] Dialog opens from WatchList
   - [ ] Dialog opens from OrderBook
   - [ ] Dialog opens from Positions
   - [ ] Dialog opens from Holdings

2. **Order Type Selection**

   - [ ] Normal order works
   - [ ] Cover order works
   - [ ] Bracket order works
   - [ ] GTT order works

3. **Investment Type**

   - [ ] Intraday works
   - [ ] Delivery works (NSE/BSE)
   - [ ] Carry Forward works (F&O)

4. **Price Type**

   - [ ] Market order works
   - [ ] Limit order works
   - [ ] Stop Loss Market works
   - [ ] Stop Loss Limit works

5. **Validation**

   - [ ] Quantity validation (lot size)
   - [ ] Price validation (tick size, circuit limits)
   - [ ] Stop loss validation
   - [ ] Target validation
   - [ ] Trigger price validation

6. **Order Placement**

   - [ ] Normal order placement
   - [ ] Modify order
   - [ ] Cancel order
   - [ ] Exit order
   - [ ] GTT order placement
   - [ ] OCO order placement

7. **Edge Cases**

   - [ ] Slice orders (large quantities)
   - [ ] After market orders
   - [ ] Disclosed quantity orders (IOC/EOS)
   - [ ] Market protection orders

8. **UI/UX**
   - [ ] Dialog drag functionality
   - [ ] Position persistence
   - [ ] Sticky dialog
   - [ ] Quick order mode
   - [ ] Real-time price updates

### Step 5.2: Integration Testing

**Test Scenarios**:

1. **Complete Order Flow**

   - Click Buy/Sell → Dialog opens → Configure order → Place order → Success/Error

2. **WebSocket Integration**

   - Order dialog shows live prices
   - Prices update in real-time

3. **Order Book Integration**

   - After placing order, order book refreshes
   - Order appears in order book

4. **Error Handling**
   - Invalid quantity shows error
   - Invalid price shows error
   - API errors show proper messages

### Step 5.3: Performance Testing

**Check**:

- [ ] Order dialog opens quickly
- [ ] Margin calculation is fast
- [ ] Brokerage calculation is fast
- [ ] WebSocket updates don't lag
- [ ] No memory leaks

---

## Detailed Implementation Steps

### Implementation Order

1. **Step 1**: Create/Update StockOrderWindow.vue template (Vuetify 3)
2. **Step 2**: Convert script to Composition API
3. **Step 3**: Migrate event handlers
4. **Step 4**: Migrate WebSocket integration
5. **Step 5**: Update all trigger points
6. **Step 6**: Test each order type individually
7. **Step 7**: Integration testing
8. **Step 8**: Performance optimization

### Key Files to Modify

1. **Primary Component**

   - `src/components/Popups/StockOrderWindow.vue` (Complete rewrite)

2. **Trigger Points** (Already migrated)

   - `src/views/Dashboard/stocks/StocksDetails.vue` ✓
   - `src/views/Watchlist/WatchList.vue` ✓

3. **Trigger Points** (Need Migration)

   - `src/views/Orders/StocksOrderBook.vue`
   - `src/views/Orders/StockGTTorders.vue`
   - `src/views/Holdings/HolDings.vue`
   - `src/views/Positions/PosiTions.vue`

4. **Layout/App Component**

   - `src/App.vue` or Layout component (add StockOrderWindow)

5. **API Functions** (Verify)
   - `src/components/mixins/getAPIdata.js`

---

## Migration Checklist

### Template Migration

- [ ] Convert all v-dialog props
- [ ] Convert all v-tabs props
- [ ] Convert all v-chip-group props
- [ ] Convert all v-select props
- [ ] Convert all v-text-field props
- [ ] Convert all v-btn props
- [ ] Convert all v-list-item structures
- [ ] Convert all v-menu props
- [ ] Convert all v-switch props
- [ ] Convert all v-radio-group props

### Script Migration

- [ ] Convert to `<script setup>`
- [ ] Convert data() to refs/reactive
- [ ] Convert computed to computed()
- [ ] Convert methods to functions
- [ ] Convert lifecycle hooks
- [ ] Update theme access
- [ ] Update $vuetify references
- [ ] Remove this references

### Event Migration

- [ ] Replace eventBus.$emit with window.dispatchEvent
- [ ] Replace eventBus.$on with window.addEventListener
- [ ] Replace eventBus.$off with window.removeEventListener
- [ ] Update all event payloads to use detail object

### API Integration

- [ ] Verify API functions read sessionStorage dynamically
- [ ] Update all API calls
- [ ] Add proper error handling
- [ ] Add loading states

### WebSocket Integration

- [ ] Update WebSocket subscription logic
- [ ] Update WebSocket data handling
- [ ] Ensure real-time updates work

### Testing

- [ ] Unit tests for each order type
- [ ] Integration tests
- [ ] Error scenario tests
- [ ] Edge case tests
- [ ] Performance tests

---

## Notes

1. **Preserve All Functionality**: Ensure no features are lost during migration
2. **Maintain Validation Logic**: Keep all business rules intact
3. **Error Handling**: Maintain comprehensive error handling
4. **User Experience**: Don't change UX, only update underlying code
5. **Performance**: Ensure no performance degradation
6. **Backward Compatibility**: Ensure event system works with existing components

---

## Success Criteria

✅ All order types work correctly (Normal, Cover, Bracket, GTT)
✅ All investment types work (Intraday, Delivery, Carry Forward)
✅ All price types work (Market, Limit, Stop Loss)
✅ Validation logic works correctly
✅ Order placement succeeds
✅ Order modification works
✅ Order cancellation works
✅ Real-time price updates work
✅ Margin calculation works
✅ Brokerage calculation works
✅ No console errors
✅ No warnings
✅ UI matches old app
✅ Performance is maintained or improved

---

## Next Steps After Migration

1. Code review
2. Testing with real accounts
3. Performance monitoring
4. Bug fixes
5. Documentation updates
6. Deployment
