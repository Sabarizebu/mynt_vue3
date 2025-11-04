# TPSeries Multiple API Calls Fix Plan

## Issue Identified
**Problem:** TPSeries API is being called 30+ times, all initiated by `LightweightChart.vue`

**Root Causes:**
1. **Watch triggers multiple times** - `watch(() => props.propstsym, ...)` with `deep: true` triggers on every nested property change
2. **No duplicate call prevention** - Multiple calls can be triggered simultaneously
3. **Multiple initialization paths** - Both `onMounted` and `watch` can call `setLWchart`
4. **Object reference changes** - Prop object might be getting new reference on each render
5. **No request cancellation** - Previous requests aren't cancelled when new ones start

## Fixes Needed

### 1. Add Request Deduplication ✅
- Add a flag to track if API call is in progress
- Prevent multiple simultaneous calls
- Cancel previous request if new one starts

### 2. Fix Watch Logic ✅
- Remove unnecessary `deep: true` or make it more specific
- Compare actual symbol values (token/exch/tsym) before calling API
- Only call API if symbol actually changed

### 3. Consolidate Initialization ✅
- Ensure chart initializes only once on mount
- Prevent watch from triggering during initial mount

### 4. Add Request Cancellation ✅
- Use AbortController to cancel in-flight requests
- Clean up on component unmount

### 5. Add Symbol Comparison ✅
- Store current symbol token/exch/tsym
- Compare before making new API call
- Skip if same symbol

## Implementation Plan

### Step 1: Add Request Management
- Add `isLoading` ref to track API call status
- Add `currentRequest` ref to store AbortController
- Add `currentSymbolKey` to track what symbol is currently loaded

### Step 2: Fix Watch Logic
- Change watch to compare actual symbol values, not object reference
- Only trigger if token/exch/tsym changed
- Remove deep watch or make it shallow with manual deep comparison

### Step 3: Add Symbol Comparison
- Create a function to generate symbol key (exch:token:tsym)
- Compare before initializing

### Step 4: Consolidate Initialization
- Use a flag to prevent duplicate initialization
- Ensure setLWchart only runs once

## Expected Result
- TPSeries API called only **once** per symbol change
- No duplicate calls during component lifecycle
- Proper cleanup on unmount

## Additional Issue Found

**Root Cause in StocksOverview.vue:**
- `optionChainDataParse` function updates `menudata.value[0]` properties frequently via WebSocket
- Properties like `ltp`, `lp`, `ch`, `chp` are updated in real-time
- Even though we removed `deep: true`, the object reference might change or nested updates could still trigger watch
- **Solution:** Symbol key comparison (`exch:token:tsym`) prevents duplicate calls even when other properties change

## Final Status
✅ **FIXED** - All fixes applied:
1. ✅ Request deduplication with `isLoading` flag
2. ✅ AbortController for request cancellation
3. ✅ Symbol key comparison to prevent duplicate calls
4. ✅ Removed `deep: true` from watch
5. ✅ `isInitialized` flag prevents duplicate chart initialization
6. ✅ Proper cleanup on unmount

## Testing Checklist
- [ ] Open stock details page - TPSeries should be called **once**
- [ ] Switch to different stock - TPSeries should be called **once** for new symbol
- [ ] WebSocket updates shouldn't trigger new API calls
- [ ] Change time range (1D, 1W, etc.) - API should be called once per change
- [ ] Check Network tab - no duplicate TPSeries calls

