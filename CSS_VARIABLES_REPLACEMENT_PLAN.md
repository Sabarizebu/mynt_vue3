# CSS Variables Replacement Plan

## 🎯 Objective
Replace all CSS variable functions (`var(--variable-name)`) with direct color values throughout the entire codebase for all pages and components.

## 📊 Current State Analysis

### CSS Variables Defined (Light Theme)
- `--primary`: #0037B7
- `--secondary`: #0037B7
- `--mainbg`: #fff
- `--maintext`: #000
- `--secbg`: #F1F3F8
- `--subtext`: #666666
- `--outline`: #EBEEF0
- `--subline`: #454344
- `--mainred`: #F23645
- `--maingreen`: #43A833
- `--secred`: #ffcdcd90
- `--secgreen`: #ECF8F1
- `--cardbg`: #ffffff
- `--btnclr`: #000
- `--btntext`: #fff
- `--statcard`: #FAFBFF
- `--primhover`: #CFD9F2
- `--loaderbg`: #FAFBFF

### CSS Variables Defined (Dark Theme)
- `--primary`: #2E65F6
- `--secondary`: #2E65F6
- `--mainbg`: #000
- `--maintext`: #fff
- `--secbg`: #1E1E1E
- `--subtext`: #999999
- `--outline`: #222222
- `--subline`: #EBEEF0
- `--mainred`: #FF1717
- `--maingreen`: #1BBC00
- `--secred`: #FF17173a
- `--secgreen`: #49c5333a
- `--cardbg`: #121212
- `--btnclr`: #B0BEC5
- `--btntext`: #000
- `--statcard`: #1E1E1E
- `--primhover`: #2E65F61a
- `--loaderbg`: rgba(0, 0, 0, 0.12)

## 🔍 Files Affected

### Priority 1: High Usage Files
1. `src/views/Watchlist/WatchList.vue` - 49+ occurrences
2. `src/views/Dashboard/stocks/StocksOption.vue` - Multiple occurrences
3. `src/components/Popups/StockOrderWindow.vue` - Likely has many
4. All other Vue components in `src/views/` and `src/components/`

### Priority 2: Style Files
1. `src/assets/style.css`
2. Component `<style>` sections
3. Inline styles in templates

## 📋 Implementation Plan

### Phase 1: Color Mapping & Strategy

#### Option A: Use Light Theme Colors (Default)
- Replace all `var(--variable)` with light theme values
- Simpler, but loses dark mode support

#### Option B: Use Vuetify Theme Detection
- Use `useTheme()` from Vuetify to detect current theme
- Replace with computed values based on theme
- Maintains dark/light mode support

#### Option C: Hardcode Current Theme
- If app always uses light theme, use light theme values
- If app always uses dark theme, use dark theme values

**Recommendation**: Start with Option A (Light Theme) for simplicity, then add Option B if dark mode is needed.

### Phase 2: Component-by-Component Replacement

#### Step 1: Create Color Constants File
```javascript
// src/utils/colors.js
export const COLORS = {
  // Light Theme Colors (default)
  primary: '#0037B7',
  secondary: '#0037B7',
  mainbg: '#fff',
  maintext: '#000',
  secbg: '#F1F3F8',
  subtext: '#666666',
  outline: '#EBEEF0',
  subline: '#454344',
  mainred: '#F23645',
  maingreen: '#43A833',
  secred: '#ffcdcd90',
  secgreen: '#ECF8F1',
  cardbg: '#ffffff',
  btnclr: '#000',
  btntext: '#fff',
  statcard: '#FAFBFF',
  primhover: '#CFD9F2',
  loaderbg: '#FAFBFF',
}
```

#### Step 2: Replace in Template Styles
- Find all `style="...var(--variable)..."`
- Replace with direct color values
- Example: `style="color: var(--maintext)"` → `style="color: #000"`

#### Step 3: Replace in Style Sections
- Find all CSS rules with `var(--variable)`
- Replace with direct color values
- Example: `color: var(--maintext);` → `color: #000;`

#### Step 4: Replace in JavaScript/Computed Styles
- Find all dynamic style bindings using CSS variables
- Replace with direct color values or computed properties
- Example: `:style="{ color: 'var(--maintext)' }"` → `:style="{ color: '#000' }"`

### Phase 3: File-by-File Implementation

#### Batch 1: Core Components (High Priority)
1. ✅ `src/views/Watchlist/WatchList.vue`
2. ✅ `src/views/Dashboard/stocks/StocksOption.vue`
3. ✅ `src/components/Popups/StockOrderWindow.vue`
4. ✅ `src/views/Dashboard/stocks/StocksDetails.vue`
5. ✅ `src/views/Dashboard/stocks/StocksOverview.vue`

#### Batch 2: Dashboard Components
6. `src/views/Dashboard/stocks/StocksSrc.vue`
7. `src/views/Dashboard/stocks/StockSingle.vue`
8. `src/views/Dashboard/stocks/StockScreener.vue`
9. `src/views/Dashboard/stocks/StocksIndices.vue`
10. `src/views/Dashboard/stocks/StockMarket.vue`
11. `src/views/Dashboard/stocks/StockAD.vue`
12. `src/views/Dashboard/StatBoard.vue`
13. `src/views/Dashboard/DashBoard.vue`

#### Batch 3: Orders & Positions
14. `src/views/Orders/StockOrderSrc.vue`
15. `src/views/Orders/StocksOrderBook.vue`
16. `src/views/Orders/StockSIPorders.vue`
17. `src/views/Orders/StocksTradeBook.vue`
18. `src/views/Orders/StockBSKorders.vue`
19. `src/views/Orders/StockGTTorders.vue`
20. `src/views/Positions/PosiTions.vue`
21. `src/views/Holdings/HolDings.vue`

#### Batch 4: Other Views
22. `src/views/Accounts/FundSrc.vue`
23. `src/views/Accounts/SettingSrc.vue`
24. `src/views/Accounts/AlertScreen.vue`
25. All other view files in `src/views/`

#### Batch 5: Components
26. All component files in `src/components/`

#### Batch 6: Global Styles
27. `src/assets/style.css`
28. Any other global CSS files

### Phase 4: Replacement Patterns

#### Pattern 1: Inline Styles in Templates
```vue
<!-- Before -->
<div style="color: var(--maintext); background: var(--mainbg);">

<!-- After -->
<div style="color: #000; background: #fff;">
```

#### Pattern 2: Style Bindings
```vue
<!-- Before -->
<div :style="{ color: 'var(--maintext)', backgroundColor: 'var(--secbg)' }">

<!-- After -->
<div :style="{ color: '#000', backgroundColor: '#F1F3F8' }">
```

#### Pattern 3: CSS Style Sections
```css
/* Before */
.my-class {
  color: var(--maintext);
  background-color: var(--mainbg);
}

/* After */
.my-class {
  color: #000;
  background-color: #fff;
}
```

#### Pattern 4: Dynamic Styles in JavaScript
```javascript
// Before
const style = {
  color: 'var(--maintext)',
  backgroundColor: 'var(--secbg)'
}

// After
const style = {
  color: '#000',
  backgroundColor: '#F1F3F8'
}
```

#### Pattern 5: Vuetify Color Props
```vue
<!-- Before (if using color prop) -->
<v-btn color="maingreen">

<!-- After - Keep Vuetify color props if theme is configured -->
<!-- Or replace with direct style -->
<v-btn style="background-color: #43A833; color: #fff;">
```

### Phase 5: Testing & Validation

#### Test Checklist
- [ ] Visual regression testing on all pages
- [ ] Light mode appearance verified
- [ ] Dark mode appearance verified (if applicable)
- [ ] Button colors correct (green/red)
- [ ] Text colors readable
- [ ] Background colors correct
- [ ] Border colors visible
- [ ] Hover states work
- [ ] All interactive elements styled correctly

#### Validation Steps
1. Run through all major pages
2. Check buy/sell buttons (green/red)
3. Verify text readability
4. Check form inputs
5. Verify cards and containers
6. Test hover states
7. Check loading states
8. Verify error/success states

## 🔧 Implementation Tools & Scripts

### Regex Patterns for Search & Replace

#### Find all CSS variable usages:
```regex
var\(--[^)]+\)
```

#### Find inline styles with variables:
```regex
style="[^"]*var\(--[^)]+\)[^"]*"
```

#### Find CSS rules with variables:
```regex
:\s*var\(--[^)]+\)\s*;
```

### Color Mapping Table
| Variable | Light Theme | Dark Theme |
|----------|-------------|------------|
| `--primary` | #0037B7 | #2E65F6 |
| `--mainbg` | #fff | #000 |
| `--maintext` | #000 | #fff |
| `--secbg` | #F1F3F8 | #1E1E1E |
| `--subtext` | #666666 | #999999 |
| `--outline` | #EBEEF0 | #222222 |
| `--mainred` | #F23645 | #FF1717 |
| `--maingreen` | #43A833 | #1BBC00 |
| `--secred` | #ffcdcd90 | #FF17173a |
| `--secgreen` | #ECF8F1 | #49c5333a |
| `--cardbg` | #ffffff | #121212 |
| `--btnclr` | #000 | #B0BEC5 |
| `--btntext` | #fff | #000 |
| `--statcard` | #FAFBFF | #1E1E1E |
| `--primhover` | #CFD9F2 | #2E65F61a |
| `--loaderbg` | #FAFBFF | rgba(0, 0, 0, 0.12) |

## 📝 Implementation Order

### Week 1: Setup & Core Components
- Day 1-2: Create color constants file and mapping
- Day 3-4: Replace in WatchList.vue (highest usage)
- Day 5: Replace in StocksOption.vue

### Week 2: Dashboard Components
- Day 1-2: Replace in all Dashboard/stocks components
- Day 3: Replace in Dashboard layout components
- Day 4-5: Testing and fixes

### Week 3: Orders & Positions
- Day 1-2: Replace in Orders components
- Day 3: Replace in Positions and Holdings
- Day 4-5: Testing and fixes

### Week 4: Remaining Components & Finalization
- Day 1-2: Replace in remaining views
- Day 3: Replace in components
- Day 4: Global styles cleanup
- Day 5: Final testing and documentation

## ⚠️ Important Considerations

1. **Theme Support**: If dark mode is needed, use Option B (Vuetify theme detection)
2. **Maintenance**: Without CSS variables, theme changes require updating all files
3. **Consistency**: Ensure same color values used consistently across all files
4. **Testing**: Thorough visual testing required after each batch
5. **Backup**: Keep a backup of original files before bulk replacements

## 🚀 Quick Start Guide

1. **Create color constants file** (`src/utils/colors.js`)
2. **Start with one component** (WatchList.vue)
3. **Replace all occurrences** in that component
4. **Test visually** before moving to next
5. **Repeat** for all components

## 📊 Progress Tracking

Use this checklist to track progress:
- [ ] Color constants file created
- [ ] Batch 1: Core Components (0/5)
- [ ] Batch 2: Dashboard Components (0/8)
- [ ] Batch 3: Orders & Positions (0/8)
- [ ] Batch 4: Other Views (0/10+)
- [ ] Batch 5: Components (0/10+)
- [ ] Batch 6: Global Styles (0/1)
- [ ] Final Testing Complete

---

**Note**: This is a large-scale refactoring. Consider implementing in phases and testing thoroughly after each batch to catch issues early.

