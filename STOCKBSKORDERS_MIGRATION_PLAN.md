# StockBSKorders.vue Migration Plan

## 🎯 Objective
Migrate `StockBSKorders.vue` from Vue 2 (Options API, Vuetify 2, eventBus) to Vue 3 (Composition API, Vuetify 3, Pinia, window events) with full functionality preservation.

---

## 📊 Current State Analysis

### Source Files
- **Old Vue 2**: `SuperApp-FE-main-2/src/views/Orders/StockBSKorders.vue` (973 lines)
- **Partial Vue 3**: `superApp_v4/src/views/Orders/StockBSKorders.vue` (230 lines - incomplete)
- **Target**: Complete migration to `superApp_v4/src/views/Orders/StockBSKorders.vue`

### Key Functionalities Identified

#### 1. **Basket Management**
- Create basket (max 10 baskets)
- Edit basket name
- Delete basket
- View basket details
- List all baskets with search
- Local storage persistence (`${uid}_basketorder`)

#### 2. **Basket Item Management**
- Add script to basket (max 20 items per basket)
- Edit basket item
- Delete basket item
- Duplicate basket item
- Script search with autocomplete (KambalaSearch API)
- Real-time price updates via WebSocket

#### 3. **Order Form Fields**
- Buy/Sell toggle
- Investment type (Intraday/Delivery/Carry Forward)
- Order type (Limit/Market/SL Limit/SL Mkt)
- Quantity (with lot size validation)
- Price (with tick size validation)
- Trigger price (for SL orders)
- Market Protection % (for MKT orders)
- AMO (After Market Order) checkbox
- Slice order support (for large quantities)

#### 4. **Margin Calculation**
- Basket margin calculation (`getBSKMargin` API)
- Post-trade margin display
- Real-time margin updates

#### 5. **Place Order**
- Place basket order (all items)
- Event emission (`place-bskord`)
- Slice order handling for large quantities

#### 6. **WebSocket Integration**
- Subscribe to script prices
- Real-time price updates
- Update basket items with latest prices

#### 7. **Data Validation**
- Lot size multiple validation
- Tick size multiple validation
- Circuit level validation
- Quantity limits (freeze qty, max slice)
- Price range validation

---

## 🔄 Migration Strategy

### Phase 1: Setup & Store Creation

#### Step 1.1: Create Basket Store (Pinia)
**File**: `superApp_v4/src/stores/basketStore.js`

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBSKMargin, getSecuritydata, getKambalaSearch } from '@/components/mixins/getAPIdata.js'
import { useAuthStore } from './authStore.js'
import { useAppStore } from './appStore.js'

export const useBasketStore = defineStore('basket', () => {
  // State
  const allBaskets = ref([])
  const activeBasket = ref(null)
  const basketItems = ref([])
  const loading = ref(false)
  const searchLoading = ref(false)
  const orderLoader = ref(false)
  
  // Form state
  const selectedScript = ref(null)
  const buyOrSell = ref(false)
  const investType = ref('I')
  const priceType = ref('LMT')
  const quantity = ref(0)
  const price = ref(0)
  const triggerPrice = ref(0)
  const marketProtection = ref(5)
  const afterMarket = ref(false)
  const editMode = ref(false)
  const editItem = ref(null)
  
  // Search
  const searchItems = ref([])
  const searchQuery = ref('')
  const noData = ref(null)
  
  // Margin
  const basketMargin = ref({})
  const totalMargin = ref('0.00')
  const postTradeMargin = ref('0.00')
  
  // Dialogs
  const createDialog = ref(false)
  const basketDialog = ref(false)
  const deleteDialog = ref(false)
  const basketName = ref('')
  const editTarget = ref(null)
  
  // Getters
  const filteredBaskets = computed(() => {
    // Filter by search query
  })
  
  const canCreateBasket = computed(() => {
    return allBaskets.value.length < 10
  })
  
  const canAddItem = computed(() => {
    return basketItems.value.length < 20
  })
  
  // Actions
  const loadBaskets = () => {
    // Load from localStorage
  }
  
  const saveBaskets = () => {
    // Save to localStorage
  }
  
  const createBasket = (name) => {
    // Create new basket
  }
  
  const updateBasket = (basket, name) => {
    // Update basket name
  }
  
  const deleteBasket = (basket) => {
    // Delete basket
  }
  
  const openBasket = (basket) => {
    // Open basket dialog
  }
  
  const addItemToBasket = (item) => {
    // Add script to basket
  }
  
  const updateItemInBasket = (item) => {
    // Update basket item
  }
  
  const removeItemFromBasket = (item) => {
    // Remove item from basket
  }
  
  const duplicateItem = (item) => {
    // Duplicate basket item
  }
  
  const searchScript = async (query) => {
    // Search scripts using getKambalaSearch
  }
  
  const calculateMargin = async () => {
    // Calculate basket margin using getBSKMargin
  }
  
  const placeBasketOrder = () => {
    // Place order and emit event
  }
  
  const subscribeWebSocket = (items) => {
    // Subscribe to WebSocket for price updates
  }
  
  const updatePrice = (data) => {
    // Update prices in basket items
  }
  
  return {
    // State
    allBaskets,
    activeBasket,
    basketItems,
    loading,
    searchLoading,
    orderLoader,
    selectedScript,
    buyOrSell,
    investType,
    priceType,
    quantity,
    price,
    triggerPrice,
    marketProtection,
    afterMarket,
    editMode,
    editItem,
    searchItems,
    searchQuery,
    noData,
    basketMargin,
    totalMargin,
    postTradeMargin,
    createDialog,
    basketDialog,
    deleteDialog,
    basketName,
    editTarget,
    // Getters
    filteredBaskets,
    canCreateBasket,
    canAddItem,
    // Actions
    loadBaskets,
    saveBaskets,
    createBasket,
    updateBasket,
    deleteBasket,
    openBasket,
    addItemToBasket,
    updateItemInBasket,
    removeItemFromBasket,
    duplicateItem,
    searchScript,
    calculateMargin,
    placeBasketOrder,
    subscribeWebSocket,
    updatePrice
  }
})
```

---

### Phase 2: Component Migration

#### Step 2.1: Template Migration (Vuetify 2 → 3)

**Key Changes**:

1. **v-data-table**:
   - `@click:row` → `@click:row="(event, { item }) => ..."`
   - `must-sort` → `:must-sort="true"`
   - `hide-default-footer` → `:items-per-page="Infinity"` or `hide-default-footer`
   - `v-slot:[`item.name`]` → `#item.name="{ item }"`

2. **v-text-field**:
   - `solo` → `variant="solo"`
   - `flat` → `variant="flat"`
   - `background-color` → `:bg-color`
   - `dense` → `density="compact"` or `density="comfortable"`

3. **v-autocomplete**:
   - `item-text` → `item-title`
   - `return-object` → `return-object`
   - `solo` → `variant="solo"`
   - `@change` → `@update:model-value`

4. **v-tooltip**:
   - `v-slot:activator="{ on, attrs }"` → `v-slot:activator="{ props }"`
   - `v-bind="attrs" v-on="on"` → `v-bind="props"`

5. **v-dialog**:
   - `width="760"` → `:width="760"` or `max-width="760"`

6. **v-switch**:
   - `inset` → `inset` (same)

7. **v-select**:
   - `item-text` → `item-title`
   - `item-value` → `item-value`
   - `append-icon` → `append-inner-icon`

8. **CSS Variables**:
   - Replace `var(--outline)` → `#EBEEF0`
   - Replace `var(--maintext)` → `#000`
   - Replace `var(--subtext)` → `#666666`
   - Replace `var(--maingreen)` → `#43A833`
   - Replace `var(--mainred)` → `#F23645`

#### Step 2.2: Script Migration (Options API → Composition API)

**Key Changes**:

1. **Imports**:
```javascript
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/stores/basketStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useAppStore } from '@/stores/appStore.js'
import { getBSKMargin, getSecuritydata, getKambalaSearch } from '@/components/mixins/getAPIdata.js'
```

2. **Event Bus → Window Events**:
```javascript
// Old: eventBus.$on('orderbook-update', ...)
// New:
window.addEventListener('orderbook-update', handleOrderbookUpdate)

// Old: eventBus.$emit('place-bskord', ...)
// New:
window.dispatchEvent(new CustomEvent('place-bskord', { detail: items }))

// Old: eventBus.$on('web-scoketConn', ...)
// New:
window.addEventListener('web-scoketConn', handleWebSocket)

// Old: eventBus.$emit('web-scoketOn', ...)
// New:
window.dispatchEvent(new CustomEvent('web-scoketOn', { detail: { flow, data, page: 'bsk' } }))
```

3. **Data Properties**:
```javascript
// Old: data: () => ({ ... })
// New:
const basketStore = useBasketStore()
const authStore = useAuthStore()
const appStore = useAppStore()
```

4. **Computed Properties**:
```javascript
// Old: computed: { ... }
// New:
const orderHeader = computed(() => [...])
const itemHeader = computed(() => [...])
```

5. **Methods**:
```javascript
// Old: methods: { ... }
// New:
function createBasket() { ... }
function deleteBasket() { ... }
// etc.
```

6. **Watchers**:
```javascript
// Old: watch: { search(val) { ... } }
// New:
watch(() => basketStore.searchQuery, async (val) => {
  if (val && val.length > 2) {
    await basketStore.searchScript(val)
  }
})
```

7. **Lifecycle Hooks**:
```javascript
// Old: mounted() { ... }
// New:
onMounted(() => {
  basketStore.loadBaskets()
  // Setup event listeners
})

// Old: beforeDestroy() { ... }
// New:
onBeforeUnmount(() => {
  // Cleanup event listeners
})
```

---

### Phase 3: Feature Implementation

#### Step 3.1: Basket Management Functions

**Create Basket**:
```javascript
function createBasket() {
  const name = basketStore.basketName?.trim()
  if (!name) return
  
  if (basketStore.editTarget) {
    basketStore.updateBasket(basketStore.editTarget, name)
  } else {
    basketStore.createBasket(name)
  }
  
  basketStore.createDialog = false
  basketStore.basketName = ''
  basketStore.editTarget = null
}
```

**Delete Basket**:
```javascript
function deleteBasket() {
  if (basketStore.editTarget) {
    basketStore.deleteBasket(basketStore.editTarget)
  }
  basketStore.deleteDialog = false
  basketStore.editTarget = null
}
```

**Open Basket**:
```javascript
function openBasket(basket) {
  basketStore.openBasket(basket)
  basketStore.subscribeWebSocket(basket.list)
  basketStore.calculateMargin()
}
```

#### Step 3.2: Basket Item Management

**Add/Edit Item**:
```javascript
async function addOrEditItem() {
  // Validate form
  if (!validateItem()) return
  
  // Get security data
  const secData = await getSecuritydata(`${selectedScript.value.exch}|${selectedScript.value.token}`)
  
  // Prepare item
  const item = {
    ...selectedScript.value,
    '0': secData, // Security data
    buyrsell: buyOrSell.value,
    investype: investType.value,
    prctype: priceType.value,
    qty: quantity.value,
    price: price.value,
    trgprice: triggerPrice.value,
    mktprdordqty: marketProtection.value,
    addmktord: afterMarket.value,
    // ... other fields
  }
  
  if (editMode.value) {
    basketStore.updateItemInBasket(item)
  } else {
    basketStore.addItemToBasket(item)
  }
  
  // Reset form
  resetItemForm()
}
```

**Validation**:
```javascript
function validateItem() {
  // Lot size validation
  // Tick size validation
  // Circuit level validation
  // Quantity limits
  // Return true/false
}
```

#### Step 3.3: WebSocket Integration

**Subscribe**:
```javascript
function subscribeWebSocket(items) {
  const flow = 'sub'
  const data = items.map(item => ({
    exch: item.exch,
    token: item.token
  }))
  
  window.dispatchEvent(new CustomEvent('web-scoketOn', {
    detail: { flow, data, page: 'bsk' }
  }))
}
```

**Handle Updates**:
```javascript
function handleWebSocket(event) {
  const { data, page } = event.detail || {}
  if (page !== 'bsk' || !data || !data.token) return
  
  basketStore.updatePrice(data)
  basketStore.calculateMargin()
}
```

#### Step 3.4: Margin Calculation

```javascript
async function calculateMargin() {
  const items = basketStore.basketItems
  
  if (!items || items.length === 0) {
    basketStore.totalMargin = '0.00'
    basketStore.postTradeMargin = '0.00'
    return
  }
  
  // Build margin request
  const marginData = await getBSKMargin(requestData)
  
  basketStore.totalMargin = marginData.marginused || '0.00'
  basketStore.postTradeMargin = marginData.marginusedtrade || '0.00'
  basketStore.basketMargin = marginData
}
```

#### Step 3.5: Place Order

```javascript
function placeBasketOrder() {
  // Split slice orders if needed
  const splitItems = basketStore.basketItems.flatMap(item => {
    if (item.slicetimes) {
      // Split logic
    }
    return item
  })
  
  // Emit event
  window.dispatchEvent(new CustomEvent('place-bskord', {
    detail: splitItems
  }))
  
  basketStore.basketDialog = false
}
```

---

### Phase 4: Integration & Testing

#### Step 4.1: Event Integration
- Replace all `eventBus.$on` with `window.addEventListener`
- Replace all `eventBus.$emit` with `window.dispatchEvent`
- Replace all `eventBus.$off` with `window.removeEventListener`

#### Step 4.2: API Integration
- Verify all API calls work with new structure
- Test error handling
- Test loading states

#### Step 4.3: Local Storage
- Verify basket persistence
- Test data migration if needed

#### Step 4.4: WebSocket
- Test real-time price updates
- Test subscription/unsubscription

#### Step 4.5: Validation
- Test all form validations
- Test edge cases

---

## 📋 Implementation Checklist

### Setup Phase
- [ ] Create `basketStore.js` Pinia store
- [ ] Define all state properties
- [ ] Define all getters
- [ ] Define all actions
- [ ] Test store in isolation

### Component Migration
- [ ] Migrate template to Vuetify 3 syntax
- [ ] Replace all CSS variables with direct colors
- [ ] Convert to `<script setup>`
- [ ] Import all required dependencies
- [ ] Replace eventBus with window events
- [ ] Migrate all computed properties
- [ ] Migrate all methods
- [ ] Migrate all watchers
- [ ] Migrate lifecycle hooks

### Feature Implementation
- [ ] Basket CRUD operations
- [ ] Basket item CRUD operations
- [ ] Script search functionality
- [ ] Order form with all fields
- [ ] Form validation
- [ ] Margin calculation
- [ ] WebSocket integration
- [ ] Place order functionality
- [ ] Slice order handling

### Integration
- [ ] Test basket creation
- [ ] Test basket editing
- [ ] Test basket deletion
- [ ] Test adding items to basket
- [ ] Test editing basket items
- [ ] Test deleting basket items
- [ ] Test duplicate functionality
- [ ] Test script search
- [ ] Test form validation
- [ ] Test margin calculation
- [ ] Test WebSocket updates
- [ ] Test place order
- [ ] Test local storage persistence
- [ ] Test error handling
- [ ] Test loading states

### UI/UX
- [ ] Verify all dialogs work correctly
- [ ] Verify all tooltips display
- [ ] Verify responsive design
- [ ] Verify dark mode compatibility
- [ ] Verify all icons display
- [ ] Verify all colors match old app

---

## 🔧 Technical Details

### API Functions Used
- `getBSKMargin(item)` - Calculate basket margin
- `getSecuritydata(secudata)` - Get security details
- `getKambalaSearch(query)` - Search scripts

### Event Names
- `orderbook-update` - Trigger basket refresh
- `web-scoketConn` - WebSocket data updates
- `web-scoketOn` - Subscribe/unsubscribe WebSocket
- `place-bskord` - Place basket order

### Local Storage Keys
- `${uid}_basketorder` - Basket data storage

### Validation Rules
- Max 10 baskets per user
- Max 20 items per basket
- Quantity must be multiple of lot size
- Price must be multiple of tick size
- Price must be within circuit levels
- Quantity must not exceed freeze qty * 20

### WebSocket Flow
1. Subscribe to scripts when basket opened
2. Receive price updates
3. Update basket items
4. Recalculate margin
5. Unsubscribe when basket closed

---

## 🎨 UI Component Mapping

| Old (Vuetify 2) | New (Vuetify 3) |
|----------------|-----------------|
| `v-data-table` with `must-sort` | `v-data-table` with `:must-sort="true"` |
| `v-text-field` with `solo` | `v-text-field` with `variant="solo"` |
| `v-autocomplete` with `item-text` | `v-autocomplete` with `item-title` |
| `v-tooltip` with `v-slot:activator` | `v-tooltip` with `v-slot:activator="{ props }"` |
| `v-dialog` with `width` | `v-dialog` with `:width` or `max-width` |
| `v-switch` with `inset` | `v-switch` with `inset` (same) |
| `v-select` with `item-text` | `v-select` with `item-title` |
| `v-chip` with `text-color` | `v-chip` with `text-color` (same) |
| `v-btn` with `icon` | `v-btn` with `icon` (same) |

---

## ⚠️ Important Notes

1. **State Management**: All basket state should be in Pinia store, not component local state
2. **Event System**: Use window events instead of eventBus
3. **Reactivity**: Ensure all reactive data uses `ref()` or `reactive()`
4. **Validation**: Keep all validation logic from old component
5. **WebSocket**: Maintain same subscription/unsubscription logic
6. **Local Storage**: Maintain same storage format for compatibility
7. **Error Handling**: Preserve all error handling and user feedback
8. **Loading States**: Maintain all loading indicators
9. **CSS Variables**: Replace all CSS variables with direct color values
10. **Icons**: Replace SVG inline code with icon imports or use Vuetify icons

---

## 🚀 Priority Order

1. **High Priority**:
   - Basket CRUD operations
   - Basket item management
   - Script search
   - Order form

2. **Medium Priority**:
   - Margin calculation
   - WebSocket integration
   - Place order

3. **Low Priority**:
   - Slice order UI
   - Advanced validations
   - Performance optimizations

---

## 📝 Testing Checklist

### Functional Testing
- [ ] Create basket
- [ ] Edit basket name
- [ ] Delete basket
- [ ] Add item to basket
- [ ] Edit basket item
- [ ] Delete basket item
- [ ] Duplicate basket item
- [ ] Search script
- [ ] Fill order form
- [ ] Validate form
- [ ] Calculate margin
- [ ] Receive WebSocket updates
- [ ] Place order

### Edge Cases
- [ ] Max 10 baskets limit
- [ ] Max 20 items limit
- [ ] Large quantity (slice order)
- [ ] Invalid lot size
- [ ] Invalid tick size
- [ ] Circuit level limits
- [ ] Freeze qty limits
- [ ] Empty basket
- [ ] Network errors
- [ ] API errors

### UI/UX Testing
- [ ] All dialogs open/close correctly
- [ ] All tooltips display
- [ ] All buttons work
- [ ] All forms validate
- [ ] Loading states display
- [ ] Error messages display
- [ ] Success messages display
- [ ] Responsive design
- [ ] Dark mode compatibility

---

## ✅ Completion Criteria

- [ ] All functionality from old component preserved
- [ ] All tests passing
- [ ] No console errors
- [ ] No linter errors
- [ ] UI matches old app
- [ ] Performance is acceptable
- [ ] Code is maintainable
- [ ] Documentation is complete

---

**Estimated Time**: 2-3 days for complete migration

**Dependencies**:
- Pinia store setup
- API functions available
- WebSocket system working
- Event system migrated

