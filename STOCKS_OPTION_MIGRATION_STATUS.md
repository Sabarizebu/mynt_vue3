# StocksOption.vue Migration Status

## Migration Overview
StocksOption.vue is a complex component (~1870 lines) that displays option chain data. This document tracks the migration from Vue 2/Vuetify 2 to Vue 3/Vuetify 3.

## Migration Checklist

### Template Migrations
- [x] `flat dense` → `flat density="compact"`  
- [x] `@change` on `v-list-item-group` → `@update:model-value`
- [x] `tile` prop → Remove or use `variant="flat"`
- [x] `readonly` on `v-btn` → `disabled`
- [x] Event handling: `switchBus.$emit` → `window.dispatchEvent`
- [x] `v-list-item-content` → Direct `v-list-item-title`/`v-list-item-subtitle`
- [x] `require()` asset imports → Direct paths or `@/assets/`

### Script Migrations  
- [ ] Convert from Options API to Composition API (`<script setup>`)
- [ ] Replace `this.` references with reactive refs/reactive objects
- [ ] Replace `eventBus.$on` → `window.addEventListener`
- [ ] Replace `eventBus.$emit` → `window.dispatchEvent`
- [ ] Replace `eventBus.$off` → `window.removeEventListener`
- [ ] Convert all `data()` properties to `ref`/`reactive`
- [ ] Convert all `methods` to functions
- [ ] Convert lifecycle hooks (`mounted` → `onMounted`, etc.)
- [ ] Replace `this.$set` with direct assignment
- [ ] Replace `this.$vuetify.theme.dark` with `useTheme()` from Vuetify

## Key Features to Preserve
1. Option chain table display (CALLS/PUTS)
2. Expiry date selection
3. Chain count selection (5, 10, 15, 30, All)
4. Greeks display (Delta, Gamma, Vega, Theta)
5. WebSocket updates for real-time data
6. Position integration (shows user positions)
7. Basket order functionality
8. Chart/Depth navigation
9. Add to watchlist
10. Buy/Sell order dialogs

## Dependencies
- `getMasters`, `getQuotesdata`, `getOptionschain`, `getGreekoptions`, `getMPosotion` from `@/components/mixins/getAPIdata`
- WebSocket integration via `window.addEventListener('web-scoketConn')`
- Event bus replacement with `window.dispatchEvent` and `window.addEventListener`

## Migration Priority
**HIGH** - This component is essential for the Options tab in StocksDetails page.

## Notes
- Component uses complex table structure with many columns
- WebSocket parsing is critical for real-time updates
- Position data integration affects multiple table cells
- Greek values calculation is async and conditional
- Theme detection needed for asset paths

