# Stocks Single Page Migration - Implementation Checklist

## Quick Reference Checklist

### Phase 1: Setup & Infrastructure ✅
- [ ] Create `stores/stocksSingleStore.js`
  - [ ] Define state structure
  - [ ] Create actions (setSingleData, clearData, etc.)
  - [ ] Create getters (if needed)
  - [ ] Export store
- [ ] Create `composables/useStocksSingle.js`
  - [ ] useStockData composable
  - [ ] useStockCharts composable
  - [ ] useTabNavigation composable
  - [ ] useScrollHandling composable
- [ ] Update router configuration
  - [ ] Verify route params
  - [ ] Add route guard (if needed)

### Phase 2: Component Structure ✅
- [ ] Convert template to Vue 3
  - [ ] Replace `v-tabs-items` → `v-window`
  - [ ] Replace `v-tab-item` → `v-window-item`
  - [ ] Update all Vuetify components
  - [ ] Update event handlers
- [ ] Convert script to Composition API
  - [ ] Use `<script setup>`
  - [ ] Import stores and composables
  - [ ] Set up reactive refs
  - [ ] Implement lifecycle hooks

### Phase 3: Header Section ✅
- [ ] Stock icon/image display
- [ ] Image error handling
- [ ] Company name and chips
- [ ] Price display with change
- [ ] Color-coded change indicators

### Phase 4: Overview Tab ✅
- [ ] TradingView iframe integration
- [ ] Market statistics (Market Cap, Volume, Open, Close)
- [ ] High-Low slider
- [ ] 52-week High-Low slider
- [ ] Stock description
- [ ] Returns cards (1M, 3M, 6M, 1Y, 3Y, 5Y, Max)

### Phase 5: Fundamental Tab ✅
- [ ] Fundamental ratios display
- [ ] Grid layout (3 columns)
- [ ] Empty state handling

### Phase 6: Financials Tab ✅
- [ ] Tab switching (Income/Balance Sheet/Cashflow)
- [ ] Standalone/Consolidated toggle
- [ ] ECharts financial chart
  - [ ] Chart initialization
  - [ ] Chart configuration
  - [ ] Chart updates
  - [ ] Chart disposal
- [ ] Financial data table
  - [ ] Dynamic year columns
  - [ ] Mobile responsive
  - [ ] Empty state

### Phase 7: Peers Tab ✅
- [ ] Peers comparison table
- [ ] Search functionality
- [ ] Mobile responsive columns
- [ ] Dynamic column selector
- [ ] Empty state

### Phase 8: Holdings Tab ✅
- [ ] Shareholding breakdown visualization
- [ ] Holdings history chart (ECharts)
- [ ] Date selector
- [ ] Holdings table
- [ ] MF holdings table
- [ ] MF holdings search
- [ ] Empty state

### Phase 9: Events Tab ✅
- [ ] Event type chips
- [ ] Event cards
- [ ] Date formatting
- [ ] Empty state

### Phase 10: News Tab ✅
- [ ] News type filter (Daily/Weekly/Monthly)
- [ ] News grid (2 columns desktop)
- [ ] News cards
- [ ] Loading state
- [ ] Empty state
- [ ] External link handling

### Phase 11: Charts Integration ✅
- [ ] Install/verify echarts package
- [ ] Financial chart implementation
- [ ] Holdings chart implementation
- [ ] Price comparison chart implementation
- [ ] Chart disposal on unmount
- [ ] Chart resize handling

### Phase 12: API Integration ✅
- [ ] Verify all API functions exist
- [ ] Implement getQuotedata call
- [ ] Implement getLtpdata call
- [ ] Implement getssDetails call
- [ ] Implement getssNews call
- [ ] Error handling
- [ ] Loading states

### Phase 13: Route & Navigation ✅
- [ ] Route parameter parsing
- [ ] Symbol validation
- [ ] Navigation to symbol_not_found
- [ ] Route change handling

### Phase 14: Scroll Handling ✅
- [ ] Scroll event listener
- [ ] Tab switching based on scroll
- [ ] Smooth scrolling to sections
- [ ] Performance optimization (throttle/debounce)

### Phase 15: Theme Support ✅
- [ ] Dark/light theme support
- [ ] Chart theme adaptation
- [ ] TradingView theme parameter

### Phase 16: Testing ✅
- [ ] Test all tabs
- [ ] Test all charts
- [ ] Test all API calls
- [ ] Test responsive design
- [ ] Test error states
- [ ] Test empty states
- [ ] Test loading states
- [ ] Test theme switching
- [ ] Test scroll functionality
- [ ] Test search/filter functionality

### Phase 17: Optimization ✅
- [ ] Lazy loading for charts
- [ ] Debounce scroll events
- [ ] Optimize re-renders
- [ ] Memory leak prevention
- [ ] Performance optimization

### Phase 18: Documentation ✅
- [ ] Code comments
- [ ] JSDoc comments (if applicable)
- [ ] Update migration plan with deviations
- [ ] Document any issues encountered

---

## Vuetify 2 → Vuetify 3 Component Mapping

| Vue 2 Component | Vue 3 Component | Notes |
|----------------|----------------|-------|
| `v-tabs-items` | `v-window` | Container for tab content |
| `v-tab-item` | `v-window-item` | Individual tab content |
| `v-chip-group` | `v-chip-group` | Check API changes |
| `v-data-table` | `v-data-table` | Check props updates |
| `v-list-item-avatar` | `v-list-item-avatar` | Mostly compatible |
| `v-list-item-content` | `v-list-item-content` | Mostly compatible |
| `v-overlay` | `v-overlay` | Check props updates |
| `v-progress-linear` | `v-progress-linear` | Mostly compatible |

---

## API Functions Required

- [x] `getToken()` - Authentication
- [x] `getQuotedata(symbol)` - Stock quotes
- [x] `getLtpdata([{token, exch}])` - Last traded price
- [x] `getssDetails(symbol)` - Stock details
- [x] `getssNews()` - Stock news

**Status**: All API functions exist in both old and new codebase.

---

## Key Dependencies

- [x] `vue` - Vue 3
- [x] `vue-router` - Vue Router 4
- [x] `pinia` - State management
- [x] `vuetify` - Vuetify 3
- [x] `echarts` - Chart library
- [x] `firebase/analytics` - Analytics

---

## Common Issues & Solutions

### Issue 1: Chart Not Rendering
**Solution**: Ensure element is visible before initialization, check element dimensions

### Issue 2: Tab Switching Not Working
**Solution**: Check v-window and v-window-item implementation, verify v-model binding

### Issue 3: Data Not Loading
**Solution**: Check API calls, verify store state, check error handling

### Issue 4: Scroll Performance
**Solution**: Implement throttle/debounce, optimize scroll detection logic

### Issue 5: Memory Leaks
**Solution**: Dispose charts on unmount, remove event listeners, clear intervals/timeouts

---

## Testing Checklist

### Functional Testing
- [ ] All tabs navigate correctly
- [ ] All data loads correctly
- [ ] All charts render correctly
- [ ] Search functionality works
- [ ] Filter functionality works
- [ ] Scroll-based tab switching works
- [ ] External links open correctly
- [ ] Image loading with error handling works

### Performance Testing
- [ ] Initial load time acceptable
- [ ] Chart rendering smooth
- [ ] Scroll performance acceptable
- [ ] No memory leaks
- [ ] No console errors

### Responsive Testing
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Landscape orientation

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Error Handling Testing
- [ ] Invalid symbol handling
- [ ] API error handling
- [ ] Network error handling
- [ ] Empty data handling
- [ ] Loading state handling

---

## Notes

- Keep old implementation as reference until migration is complete
- Test incrementally after each phase
- Document any deviations from the plan
- Update this checklist as you progress
- Mark completed items with ✅

---

**Last Updated**: 2024

