# LightweightChart.vue Error Fix Plan

## Issue Identified
**Error:** `TypeError: Cannot read properties of undefined (reading 'value')` at line 283

**Root Cause:**
The `subscribeCrosshairMove` callback in lightweight-charts can be triggered when:
1. Chart is still initializing
2. No data is loaded yet
3. Cursor moves to areas without data points
4. `param.seriesData.get(lineSeries.value)` returns `undefined`

When `data` is `undefined`, trying to access `data.value` or `data.close` causes the error.

## Fixes Applied

### 1. Comprehensive Validation in Crosshair Callback ✅
- **Added checks for:**
  - `param.seriesData` existence
  - `lineSeries.value` existence
  - `symbol.value` and `symbol.value.tsym` existence
  - `data` from `seriesData.get()` existence
  - Price value validation (null, undefined, NaN checks)

- **Early returns:** Return early if any required data is missing
- **Try-catch:** Wrapped tooltip update in try-catch for error handling

### 2. Enhanced `showDateformat` Function ✅
- **Added null checks for:**
  - `date` parameter validation
  - `symbol.value` existence before accessing `instname`
  - Date validity checks (`isNaN(dateo.getTime())` and `isNaN(datet.getTime())`)
- **Try-catch:** Wrapped in error handling

### 3. DOM Element Validation ✅ (Previously Fixed)
- Using template refs instead of `getElementById`
- Checking element existence before chart creation
- Using `nextTick()` for DOM readiness

## Code Changes Summary

### Line 274-330: Crosshair Callback
```javascript
// Before: Direct access to data.value without null checks
const data = param.seriesData.get(lineSeries.value)
const price = data.value !== undefined ? data.value : data.close

// After: Comprehensive validation with early returns
if (!param.seriesData || !lineSeries.value || !symbol.value || !symbol.value.tsym) {
    toolTip.style.display = "none"
    return
}

const data = param.seriesData.get(lineSeries.value)
if (!data) {
    toolTip.style.display = "none"
    return
}

const price = data.value !== undefined ? data.value : (data.close !== undefined ? data.close : null)
if (price === null || price === undefined || isNaN(price)) {
    toolTip.style.display = "none"
    return
}
```

### Line 155-174: showDateformat Function
```javascript
// Before: Direct access to symbol.value.instname
if (toggle.value == 0 || (toggle.value == 1 && (symbol.value.instname == "UNDIND" || symbol.value.instname == "COM"))) {

// After: Null checks and validation
if (!date) return ''
if (toggle.value == 0 || (toggle.value == 1 && symbol.value && (symbol.value.instname == "UNDIND" || symbol.value.instname == "COM"))) {
    // ... with date validation
}
```

## Testing Checklist

### Functional Testing
- [ ] Chart initializes without errors
- [ ] Chart displays data correctly when loaded
- [ ] Tooltip appears on hover when data exists
- [ ] Tooltip hides when cursor moves to areas without data
- [ ] No errors in console when moving cursor over chart
- [ ] Chart works with different time ranges (1D, 1W, 1M, 1Y, YTD, MAX)
- [ ] Chart updates correctly with WebSocket data
- [ ] Chart handles theme changes (dark/light)
- [ ] Chart handles prop changes (symbol changes)

### Edge Cases Testing
- [ ] Chart with no data (empty chart)
- [ ] Chart while data is still loading
- [ ] Cursor move before chart fully initialized
- [ ] Cursor move to edges of chart
- [ ] Symbol changes while chart is displayed
- [ ] Component unmount while chart is active
- [ ] WebSocket updates while cursor is hovering

### Error Handling Testing
- [ ] No console errors when data is undefined
- [ ] No console errors when seriesData is undefined
- [ ] No console errors when symbol is undefined
- [ ] Graceful handling of invalid dates
- [ ] Graceful handling of invalid price values

## Verification Steps

1. **Check Console:**
   - Open browser console
   - Navigate to stocks details page
   - Verify no errors appear
   - Move cursor over chart area
   - Verify no new errors appear

2. **Test Tooltip:**
   - Hover over chart data points
   - Verify tooltip appears with correct data
   - Move cursor to empty areas
   - Verify tooltip hides smoothly

3. **Test Data Loading:**
   - Refresh page on stocks details
   - Wait for chart to load
   - Verify chart displays correctly
   - Verify no errors during loading

4. **Test Symbol Changes:**
   - Navigate to different stocks
   - Verify chart updates correctly
   - Verify no errors during transition

## Additional Improvements Made

1. **Error Logging:** Added console.error for debugging
2. **Defensive Programming:** Multiple layers of validation
3. **Early Returns:** Prevent unnecessary processing
4. **Null Safety:** All property access is guarded

## Status
✅ **FIXED** - All null checks and validations added

