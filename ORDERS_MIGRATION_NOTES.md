# Orders (Vue 2 -> Vue 3, Vuetify 2 -> 3, EventBus -> Web APIs) – Migration Plan

## Overview
Migrate the Orders page to Vue 3 + Vuetify 3 with Pinia/Web APIs, mirroring the approach in `HOLDINGS_MIGRATION_NOTES.md`.

## Current State
- Component: `src/views/Orders/OrderScreen.vue`
- Uses `<script setup>` and `useAppStore`
- Tables use Vuetify 2 headers `{ text, value }`
- Search field uses `flat solo background-color`
- Events: `tempdata-update`, `orderbook-update`
- API: `getMOrderbook(true)`

## Migration Checklist

### 1) Composition API + Pinia
- Keep `<script setup>`, refs/computed
- Ensure API adapters pull fresh `userid/msession` from `sessionStorage`
- Use `appStore.showSnackbar` for errors

### 2) Vuetify 3 Data Table
- Convert headers to `{ title, key, align }`
- Use `:hide-default-footer="true"`, `fixed-header`, `height`, `:items-per-page="-1"`
- Prefer default table renderer + small item slots (avoid custom `<tbody>`) 
- If row clicks needed, use `@click:row="(e, { item }) => onRowClick(item.raw || item)"`

### 3) Vuetify 3 Components
- Text Field: `variant="solo"`, `density="comfortable"`, `:bg-color="'secbg'"`, `hide-details`
- Tabs: keep `v-tabs` with `v-tab value` and `density="compact"`, `show-arrows`
- Buttons/Icons: ensure `variant` usage is v3-friendly

### 4) Filtering & Search
- Implement `includeSearch(item, keys, term)` helper (same as Holdings)
- Apply only to open orders list

### 5) Data Modeling
- `setOrderPayload`: normalize `response`, `openorders`, `execorders`
- Add time formatting helper for `exch_tm/norentm`
- Coerce numeric fields before formatting

### 6) Realtime Updates
- Continue listening to `tempdata-update` and `orderbook-update`
- Debounce optional; always cleanup listeners on unmount

### 7) API Adapter Consistency
- Ensure `getMOrderbook` reads latest creds
- Optionally cache last payload to `sessionStorage` (`orders_last`) and hydrate on load

### 8) UX/Empty States
- Keep empty-state image and captions
- Show loading states clearly

## Suggested Table Slots (example)
```vue
<v-data-table :headers="openHeaders" :items="openItems" :hide-default-footer="true" fixed-header height="520" :items-per-page="-1">
  <template #item.tsym="{ item }">
    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">
      {{ item.tsym }} <span class="ml-1 subtext--text fs-10">{{ item.exch }}</span>
    </p>
  </template>
  <template #item.qty="{ item }">
    <span class="text-right d-inline-block w-100">{{ item.tradedqty || item.qty || 0 }}</span>
  </template>
</v-data-table>
```

## Testing Checklist
- Open/Executed tabs load and switch correctly
- Search filters open orders
- Time field is human-friendly if formatted
- No console warnings/errors
- Listeners cleaned up on navigation

## Done Criteria
- Vuetify 3 headers/slots used
- Inputs updated to Vuetify 3 props
- Realtime updates intact
- Error handling consistent with Holdings
