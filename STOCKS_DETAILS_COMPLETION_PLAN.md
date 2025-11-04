# StocksDetails.vue Completion Plan

## Overview
Complete the migration of `StocksDetails.vue` from Vue 2/Vuetify 2 to Vue 3/Vuetify 3, ensuring all components, syntax, and functionality work correctly.

## Current Status
- ✅ Script section migrated to Vue 3 Composition API
- ✅ Basic template structure migrated
- ✅ Navigation and persistence implemented
- ⚠️ Some Vuetify 3 syntax issues remain
- ⚠️ Child component `StocksOption.vue` is placeholder only

## Issues to Fix

### 1. Icon Prop Syntax (Vuetify 3)
**Issue:** Using `icon="true"` instead of boolean prop `icon`
**Locations:**
- Line 37: Alert button
- Line 51: GTT/GTC button
- Line 64: Pop chart button
- Line 80: Multi chart menu button
- Line 91: Layout icon button
- Line 175: Watchlist button (Future tab)
- Line 181: Chart button (Future tab)
- Line 340: Close button (Pop chart)

**Fix:** Change `icon="true"` to `icon` (boolean prop in Vuetify 3)

---

### 2. v-list-item Component Structure (Vuetify 3)
**Issue:** Using deprecated `v-list-item-content`, `v-list-item-title`, `v-list-item-subtitle` structure
**Locations:**
- Lines 242-252: Security Information section
- Line 88: Multi chart layout menu

**Vuetify 3 Migration:**
- Replace `v-list-item-content` wrapper with direct `v-list-item-title` or `v-list-item-subtitle`
- Structure should be:
  ```vue
  <v-list-item>
    <v-list-item-title>Title</v-list-item-title>
    <template v-slot:append>
      <!-- append content -->
    </template>
  </v-list-item>
  ```

---

### 3. v-list-item Append Slot (Line 89-94)
**Issue:** Using `v-slot:append` inside `v-list-item` - verify correct structure
**Fix:** Ensure append slot is correctly placed in Vuetify 3 structure

---

### 4. v-tabs-slider (Optional Enhancement)
**Issue:** Missing `v-tabs-slider` component for tab indicator (was in Vue 2 version)
**Location:** After `<v-tabs>` component (around line 12)
**Fix:** Add `<v-tabs-slider>` if tab indicator is desired:
```vue
<v-tabs ...>
  ...
</v-tabs>
<v-tabs-slider v-if="!ssdloader" color="maintext"></v-tabs-slider>
```

---

### 5. StocksOption.vue Component (Critical)
**Current Status:** Placeholder component only
**Location:** `superApp_v4/src/views/Dashboard/stocks/StocksOption.vue`

**Requirements:**
- Full migration from Vue 2 version
- Display option chain data from `optiondata` ref
- Handle WebSocket updates for option chain
- Integrate with parent component's data

**Action Items:**
1. Read old Vue 2 version from `SuperApp-FE-main-2/src/views/Dashboard/stocks/StocksOption.vue`
2. Migrate template to Vuetify 3 syntax
3. Migrate script to Vue 3 Composition API
4. Ensure data binding with parent `optiondata`
5. Implement WebSocket updates if needed

---

### 6. Template Slot Syntax Verification
**Check:** All `v-slot:` syntax is correct for Vuetify 3
**Locations:**
- Lines 33, 47, 61, 75: Tooltip activators
- Line 78: Menu activator
- Line 89: List item append
- Lines 159, 187, 196, 199, 202, 205, 208, 211: Data table slots
- Line 214: Data table no-data slot

**Status:** Mostly correct, but verify `v-slot:` vs `#` syntax consistency

---

### 7. Data Table Slot Syntax
**Issue:** Using `v-slot:[`backticks`]` for dynamic slots
**Locations:** Lines 159, 187, 196, 199, 202, 205, 208, 211
**Fix:** In Vuetify 3, dynamic slots should use:
```vue
<template #[`item.ltp`]="{ item }">
```
instead of:
```vue
<template v-slot:[`item.ltp`]="{ item }">
```

---

### 8. Asset Paths
**Issue:** Some asset paths use `/src/assets/` directly
**Locations:**
- Lines 38, 52, 66, 82, 93: Image assets
- Line 129: Image asset

**Fix:** Verify if these should use `@/assets/` or remain as `/src/assets/` based on project structure

---

## Testing Checklist

### Functional Testing
- [ ] Navigation from watchlist works correctly
- [ ] Page persists on refresh (query params + localStorage)
- [ ] All 6 tabs load correctly:
  - [ ] Overview tab
  - [ ] Chart tab (single and multi-layout)
  - [ ] Fundamental tab
  - [ ] **Option tab** (needs StocksOption.vue completion)
  - [ ] Future tab (with WebSocket updates)
  - [ ] Info tab (Security Info + Linked Scrips)
- [ ] Buy/Sell buttons trigger order dialog
- [ ] Alert button creates alert
- [ ] GTT/GTC button creates GTT/GTC order
- [ ] Pop chart functionality works
- [ ] Multi-chart layout switching works
- [ ] WebSocket updates Future tab data correctly
- [ ] Linked scrips display and update correctly

### UI/UX Testing
- [ ] All buttons display correctly
- [ ] Icons show properly
- [ ] Tooltips work
- [ ] Tab navigation smooth
- [ ] Loading indicators show/hide correctly
- [ ] Data tables render correctly
- [ ] Responsive design works on mobile

### Error Handling
- [ ] Invalid params redirect to /stocks
- [ ] Missing data shows appropriate messages
- [ ] API errors handled gracefully
- [ ] WebSocket disconnections handled

---

## Implementation Priority

### High Priority (Must Fix)
1. ✅ Fix icon prop syntax (quick fix)
2. ✅ Fix v-list-item structure (affects UI)
3. **Complete StocksOption.vue component** (tab not functional)
4. Fix data table slot syntax (if causing issues)

### Medium Priority (Should Fix)
5. Add v-tabs-slider (UI enhancement)
6. Verify and fix asset paths
7. Test WebSocket functionality

### Low Priority (Nice to Have)
8. Code cleanup and optimization
9. Additional error handling
10. Performance optimizations

---

## Migration Steps

### Step 1: Fix Icon Props
- Replace all `icon="true"` with `icon`
- Test button rendering

### Step 2: Fix v-list-item Structure
- Update Security Information section
- Update Multi chart menu
- Test list rendering

### Step 3: Complete StocksOption.vue
- Read old version
- Migrate template and script
- Test option chain display
- Integrate WebSocket if needed

### Step 4: Fix Template Slots
- Verify all slot syntax
- Fix data table dynamic slots if needed

### Step 5: Add v-tabs-slider (Optional)
- Add tab indicator if desired

### Step 6: Comprehensive Testing
- Test all functionality
- Fix any remaining issues

---

## Notes
- The script section is already fully migrated
- Navigation and persistence are working
- Most template syntax is correct
- Main gaps are icon props, list-item structure, and StocksOption component

