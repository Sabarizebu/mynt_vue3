# StocksSrc.vue Migration Plan and Verification Checklist

## Current Status
- ✅ Template syntax errors fixed (no-glutters → no-gutters, color → bg-color, incomplete :class bindings)
- ✅ Script setup structure started (imports, data conversions, computed properties, watchers)
- ✅ Initial methods converted (savePdmwdataCache, loadPdmwdataCache, updatePdmwdataFromCache, handleQuoteUpdate, handleWebSocketConnection, checkVisibility, isVisible, setSinglestock, scrollToo, scrollFrom, setScrpitCH, getToplistdata, getContentlistdata, getSectorlistdata, getMrkBreakerdata)
- ⚠️ **IN PROGRESS**: Remaining methods need conversion and all `this.` references need replacement

## Critical Issues to Fix

### 1. Script Section - Remaining Method Conversions
The following methods still need to be converted from object property syntax to function declarations:
- `getADlistdata()`
- `setStatavddec()`
- `convertData()`
- `setStatAD()`
- `newsPage()`
- `getNews()`
- `getCorpationaction()`
- `setSSDtab()`
- `setWebsocket()`
- `optionChainDataParse()`

**Pattern to follow:**
```javascript
// OLD (Vue 2 Options API):
methodName() {
    // code using this.variable
},

// NEW (Vue 3 Composition API):
const methodName = () => {
    // code using variable.value
}
```

### 2. Replace All `this.` References
Systematically replace all `this.` references throughout the file:

#### Data References
- `this.uid` → `uid.value`
- `this.mtoken` → `mtoken.value`
- `this.stoken` → `stoken.value`
- `this.pdmwdata` → `pdmwdata.value`
- `this.tradeactionitem` → `tradeactionitem.value`
- `this.screentitems` → `screentitems.value`
- `this.advdecitems` → `advdecitems` (reactive object, no .value)
- `this.advdectab` → `advdectab.value`
- `this.treemaps` → `treemaps.value`
- And all other reactive variables...

#### Vue Instance Properties
- `this.$router` → `router`
- `this.$route` → Use `useRoute()` from vue-router
- `this.$vuetify.theme.dark` → `theme.global.name.value === 'dark'`
- `this.$nextTick` → `nextTick`
- Remove all `this.$forceUpdate()` calls (not needed in Vue 3)

### 3. Lifecycle Hooks
- ✅ `mounted()` → `onMounted()` - **CONVERTED**
- ⚠️ `beforeDestroy()` → `onBeforeUnmount()` - **NEEDS CONVERSION**

### 4. Template Updates for Vuetify 3
Check and update the following throughout the template:
- ✅ `no-glutters` → `no-gutters` - **FIXED**
- ✅ `color` prop on v-card → `bg-color` - **FIXED**
- ⚠️ `mobile-breakpoint` → `mobile`
- ⚠️ `item-text`/`item-value` → `item-title`/`item-value`
- ⚠️ `align: "right"` → `align: "end"`
- ⚠️ `small` → `size="small"`
- ⚠️ `outlined` → `variant="outlined"`
- ⚠️ `dense` → `density="compact"`
- ⚠️ `solo`/`flat` → `variant="flat"`
- ⚠️ `:value` on v-select/v-text-field → `:model-value`
- ⚠️ `@change` → `@update:model-value`

## Verification Plan

### Phase 1: Compilation and Linting ✅
- [ ] File compiles without syntax errors
- [ ] No ESLint errors
- [ ] No TypeScript errors (if applicable)
- [ ] Run: `npm run lint` and fix all issues

### Phase 2: Template Rendering
- [ ] Component loads in browser without errors
- [ ] All sections render correctly:
  - [ ] Top indices section
  - [ ] Market heatmap
  - [ ] Trade action tables (Top Gainers, Top Losers, Volume, Value)
  - [ ] High/Low breakers
  - [ ] Screener section
  - [ ] Advance/Decline section (Sectors & Thematic)
  - [ ] News section
  - [ ] Corporate actions section
- [ ] All cards, tables, and UI elements display properly
- [ ] Responsive design works on mobile, tablet, desktop

### Phase 3: Data Loading
- [ ] Top indices data loads and displays
- [ ] Market heatmap renders with correct data
- [ ] Trade action tables populate with data
- [ ] High/Low breakers data loads
- [ ] Screener data loads and displays
- [ ] Advance/Decline data loads for sectors and thematic
- [ ] News data loads
- [ ] Corporate actions data loads
- [ ] Loading states work correctly

### Phase 4: Interactivity
- [ ] **Indices Cards**: Click navigation works
- [ ] **Market Heatmap**: 
  - [ ] Dropdown selection works (treemaps)
  - [ ] Chart renders correctly
  - [ ] Click on chart nodes works
- [ ] **Trade Action Tabs**: Switching between tabs works
- [ ] **Screener**:
  - [ ] Condition dropdown works (screent0)
  - [ ] Index filter works (screent1)
  - [ ] Table displays filtered data
- [ ] **Advance/Decline**:
  - [ ] Tabs switch between Sectors and Thematic
  - [ ] Cards display correct data
  - [ ] Click navigation works
- [ ] **News**:
  - [ ] Load news button works
  - [ ] News items display
  - [ ] External links work
- [ ] **Scroll Buttons**: Horizontal scrolling works

### Phase 5: Real-time Updates (WebSocket)
- [ ] WebSocket connection establishes
- [ ] Top indices prices update in real-time
- [ ] Trade action tables update in real-time
- [ ] Advance/Decline prices update in real-time
- [ ] Price changes reflect color coding (green/red)
- [ ] Cache saves and restores correctly

### Phase 6: State Management
- [ ] Pinia stores accessible:
  - [ ] `useAppStore()`
  - [ ] `useAuthStore()`
  - [ ] `useNavStore()`
- [ ] Authentication state reflects correctly
- [ ] User login/logout triggers appropriate updates

### Phase 7: Navigation
- [ ] Router navigation works:
  - [ ] Clicking indices navigates to details
  - [ ] Stock navigation works
  - [ ] Route parameters handled correctly

### Phase 8: Error Handling
- [ ] API errors handled gracefully
- [ ] Missing data shows appropriate empty states
- [ ] WebSocket disconnection handled
- [ ] Network errors don't crash the component

### Phase 9: Browser Console
- [ ] No console errors
- [ ] No console warnings
- [ ] No Vue warnings
- [ ] No Vuetify warnings
- [ ] No deprecation notices

### Phase 10: Performance
- [ ] Component mounts quickly
- [ ] No memory leaks (check on unmount)
- [ ] No excessive re-renders
- [ ] Charts render efficiently
- [ ] WebSocket updates don't cause lag

## Testing Commands

```bash
# Lint check
npm run lint

# Type check (if using TypeScript)
npm run type-check

# Build check
npm run build

# Dev server
npm run dev
```

## Manual Testing Steps

1. **Load the page** → Navigate to stocks route
2. **Check browser console** → No errors/warnings
3. **Test each section**:
   - Scroll through indices
   - Select different heatmap options
   - Switch trade action tabs
   - Filter screener data
   - Switch A/D tabs
   - Load news
4. **Test interactions**:
   - Click on cards/items
   - Use scroll buttons
   - Filter data
5. **Monitor real-time updates**:
   - Watch price changes
   - Verify color coding
   - Check cache behavior
6. **Test responsiveness**:
   - Resize browser
   - Test on mobile viewport
7. **Test with/without login**:
   - Logged out state
   - Logged in state

## Files to Review

- `StocksSrc.vue` - Main component file
- `getAPIdata.js` - API functions
- `webSocketstream.js` - WebSocket functions
- `appStore.js` - App state
- `authStore.js` - Auth state
- `navStore.js` - Navigation state

## Migration Priority

1. **HIGH**: Fix all `this.` references in remaining methods
2. **HIGH**: Convert all remaining methods to function declarations
3. **HIGH**: Fix `beforeDestroy` → `onBeforeUnmount`
4. **MEDIUM**: Update template for all Vuetify 3 props
5. **MEDIUM**: Test all functionality
6. **LOW**: Performance optimizations
7. **LOW**: Code cleanup and documentation

## Notes

- This is a large file (~1959 lines), systematic conversion is necessary
- Many methods depend on each other, so convert in dependency order
- Test after each major section conversion
- Keep browser console open during development
- Use Vue DevTools to inspect reactive state

