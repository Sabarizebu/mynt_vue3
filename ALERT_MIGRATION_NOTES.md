# Alert Screen (Vue 2 -> Vue 3, Vuetify 2 -> 3, EventBus -> Web APIs) – Migration Notes

## Overview

This document outlines the migration of the Alert Screen page from Vue 2 to Vue 3, Vuetify 2 to Vuetify 3, and EventBus to Pinia/Web APIs. Use this as a reference for migrating similar pages.

## Migration Checklist

### 1) Composition API + Pinia

- ✅ Convert Options API to `<script setup>` and replace `data/computed/methods` with `ref`, `computed`, and functions
- ✅ Centralize auth and app state in Pinia stores (`useAuthStore`, `useAppStore`)
- ✅ Use `sessionStorage` for session data instead of component-level state
- ✅ Replace EventBus with window CustomEvents

### 2) Vuetify 3 Data Table

- ⏳ Headers: use `{ title, key, align }` (not `{ text, value }`)
- ⏳ Replace `v-slot:body` with Vuetify 3 data table item slots
- ⏳ Use `fixed-header` for sticky headers
- ⏳ Add `hide-default-footer` for infinite tables

### 3) Vuetify 3 Components Updates

#### Tabs

- ✅ `v-tabs` with `v-model` (already done)
- ✅ `v-tab` with `value` prop (already done)
- ✅ Removed `v-tabs-items` and `v-tab-item`, using `v-if`/`v-else-if` (already done)
- ✅ Use `density="compact"` and `show-arrows` (already done)

#### Text Field (for search)

- ⏳ Add search field for pending alerts table
- ⏳ Use `variant="solo"`, `density="comfortable"`, `:bg-color="'secbg'"`

### 4) Action Buttons in Pending Alerts Table

- ⏳ Add Buy (B) button
- ⏳ Add Sell (S) button
- ⏳ Add Chart button
- ⏳ Add Cancel button with tooltip
- ⏳ Add Modify button with tooltip
- ⏳ Add Menu (3-dots) with dropdown actions:
  - Modify Alert
  - Exit/Cancel Alert
  - Create GTT / GTC
  - Create Alert
  - Market Depth
  - Chart
  - Fundamentals
  - Details

### 5) Cancel Alert Dialog

- ⏳ Add cancel confirmation dialog
- ⏳ Implement cancel alert API call
- ⏳ Handle success/error messages
- ⏳ Refresh alerts after cancel

### 6) Menu Actions Integration

- ⏳ Replace `eventBus.$emit('menudialog', ...)` with `window.dispatchEvent(new CustomEvent('menudialog', ...))`
- ⏳ Handle different action types:
  - `alert` / `m-alert`: Open alert dialog
  - `c-alert`: Open cancel dialog
  - `cGTT`: Open GTT order dialog
  - `chart`, `depth`, `Funda`: Navigate to stock details
  - Empty string: Show details drawer (if applicable)

### 7) Search Functionality

- ⏳ Add search input field for pending alerts
- ⏳ Implement `includeSearch` helper function
- ⏳ Filter by instrument symbol, exchange, alert type, condition, value

### 8) WebSocket Integration

- ⏳ Replace EventBus with window CustomEvents
- ⏳ Subscribe on data load: `window.dispatchEvent(new CustomEvent('web-scoketOn', ...))`
- ⏳ Listen for updates: `window.addEventListener('orderbook-update', onOrderbookUpdate)`
- ⏳ Unsubscribe on unmount to avoid memory leaks

### 9) Event Listener Cleanup

- ⏳ Add `onBeforeUnmount` hook
- ⏳ Remove event listeners properly

## Code Snippets

### Headers (Vuetify 3):

```js
const orderheader = [
  { title: 'Instrument', key: 'tsym', sortable: false },
  { title: 'Alert type', key: 'ai_t', sortable: false },
  { title: 'Condition', key: 'ai_t', sortable: false },
  { title: 'Value', key: 'd', sortable: false, align: 'end' },
  { title: 'Order no', key: 'al_id', sortable: false, align: 'end' }
]
```

### Table with Item Slots:

```vue
<v-data-table
  :headers="orderheader"
  :items="pendingItems"
  :items-per-page="-1"
  fixed-header
  hide-default-footer
>
  <template v-slot:item.tsym="{ item }">
    <!-- Action buttons and instrument display -->
  </template>
  <template v-slot:item.ai_t="{ item }">
    <!-- Alert type display -->
  </template>
  <!-- Other slots -->
</v-data-table>
```

### Menu Actions:

```js
function setSSDtab(type, token, exch, tsym, trantype, item) {
  if (type === 'c-alert') {
    singledata.value = item
    canceldialog.value = true
  } else if (type === 'alert' || type === 'm-alert') {
    window.dispatchEvent(new CustomEvent('menudialog', {
      detail: { type, token, exch, tsym, trantype, item }
    }))
  } else if (type === 'cGTT') {
    window.dispatchEvent(new CustomEvent('menudialog', {
      detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' }
    }))
  } else {
    const path = [type, token, exch, tsym]
    router.push({ name: 'stocks details', params: { val: path } })
  }
}
```

### Cancel Alert:

```js
async function setCancelalert() {
  loader.value = true
  const uid = sessionStorage.getItem('userid')
  const data = { uid, al_id: singledata.value.al_id }
  const alert = await setMalert(data, 'cancel')
  if (alert.stat === 'OI deleted') {
    appStore.showSnackbar(1, `Alert has been Cancelled for ${singledata.value.tsym}`)
    await getAllalerts()
  } else {
    appStore.showSnackbar(2, alert.emsg || alert)
  }
  loader.value = false
  singledata.value = {}
  canceldialog.value = false
}
```

### WebSocket Integration:

```js
// Subscribe
window.dispatchEvent(new CustomEvent('web-scoketOn', {
  detail: { flow: 'sub', data: [], is: 'alert', page: 'alert' }
}))

// Listen for updates
function onOrderbookUpdate(e) {
  if (e.detail === 'orders') {
    getAllalerts()
  }
}
window.addEventListener('orderbook-update', onOrderbookUpdate)

// Unsubscribe on unmount
onBeforeUnmount(() => {
  window.dispatchEvent(new CustomEvent('web-scoketOn', {
    detail: { flow: 'unsub', data: [], is: 'alert', page: 'alert' }
  }))
  window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
```

## Common Pitfalls

1. **V2 props removed in V3**:
   - `{ text, value }` → `{ title, key }`
   - `v-slot:body` → use template slots for items

2. **EventBus → Window Events**:
   - Always clean up event listeners in `onBeforeUnmount`
   - Use `CustomEvent` with `detail` for data passing
   - Check for `detail` existence before accessing

3. **Menu Actions**:
   - Use `window.dispatchEvent` with `CustomEvent('menudialog', ...)`
   - Handle different action types appropriately

## Migration Status

- ✅ Template tabs structure updated to Vuetify 3
- ✅ Composition API migration (basic structure)
- ⏳ Pending alerts table structure (Vuetify 3 format)
- ⏳ Action buttons integration
- ⏳ Cancel dialog functionality
- ⏳ Menu actions integration
- ⏳ Search functionality
- ⏳ WebSocket integration
- ⏳ Event listener cleanup

## Testing Checklist

- [ ] All alert tabs load correctly (Notification, Exch alert, Exch status, Pending alert)
- [ ] Pending alerts table displays correctly with action buttons
- [ ] Buy/Sell buttons trigger order dialog
- [ ] Chart button navigates to chart view
- [ ] Cancel button opens confirmation dialog
- [ ] Cancel alert API call works correctly
- [ ] Modify button opens modify alert dialog
- [ ] Menu dropdown shows all actions
- [ ] Menu actions navigate correctly
- [ ] Search functionality filters pending alerts
- [ ] WebSocket updates refresh alerts correctly
- [ ] No console errors
- [ ] Event listeners cleaned up properly

