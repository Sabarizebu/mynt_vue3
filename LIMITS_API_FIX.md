# Limits API Continuous Calls Fix

## Problem
The `Limits` API was being called continuously, causing excessive network requests. The network logs showed multiple identical requests firing repeatedly, all initiated from `getAPIdata.js:1084`.

## Root Cause Analysis

1. **No Debouncing/Throttling**: Every time positions or orders updated, `refreshMargins()` was called immediately without any rate limiting
2. **Missing Function**: `reloadAllStats()` function was being called but was not defined
3. **Redundant Calls**: When positions or orders updated via `handleTempEvent()`, it would immediately trigger `refreshMargins()` with a 500ms delay, leading to rapid successive calls
4. **Multiple Triggers**: Multiple event listeners (`position-update`, `funds-update`) were all calling `refreshMargins()` directly
5. **No Concurrency Control**: Multiple API calls could be triggered simultaneously without checking if one was already in progress

## Solution Implemented

### 1. Added Debouncing Mechanism
- Created `refreshMarginsDebounced()` function with 2-second debounce period
- Prevents rapid successive API calls by consolidating multiple requests into a single call after the debounce period
- Clears and resets timeout if called again before the debounce period expires

### 2. Implemented Concurrency Control
- Added `isRefreshMarginsPending` flag to prevent concurrent API calls
- Ensures only one API call is in progress at a time
- Skips new requests if one is already pending

### 3. Fixed Missing `reloadAllStats()` Function
- Implemented `reloadAllStats()` function that reloads all stats (holdings, positions, orders, margins)
- Uses Promise.all for parallel data fetching
- Refreshes margins after other data loads to avoid race conditions

### 4. Updated All Call Sites
- Replaced direct `refreshMargins()` calls with `refreshMarginsDebounced()` in:
  - `handleTempEvent()` when positions/orders update
  - `positionUpdateHandler()` event listener
  - `fundsUpdateHandler()` event listener
  - Periodic 30-second interval refresh
- Initial margin load in `loadAll()` remains direct (not debounced) for initial page load

### 5. Proper Cleanup
- Added cleanup for debounce timeout in `onBeforeUnmount()`
- Prevents memory leaks and unnecessary timeouts after component unmounts

## Code Changes

### Key Functions Added/Modified:

1. **`refreshMarginsDebounced()`** - Debounced wrapper that consolidates multiple rapid calls
2. **`refreshMargins()`** - Now includes concurrency control with `isRefreshMarginsPending` flag
3. **`reloadAllStats()`** - New function that reloads all stats in parallel
4. **Event Handlers** - Updated to use debounced version

### Debounce Configuration:
```javascript
const REFRESH_MARGINS_DEBOUNCE_MS = 2000 // 2 seconds debounce
```

## Expected Behavior After Fix

1. **Initial Load**: Margins API is called once during initial page load
2. **Position/Order Updates**: When positions or orders update, the margin refresh is debounced
   - Multiple updates within 2 seconds will result in only one API call after 2 seconds
3. **Periodic Refresh**: Margins are refreshed every 30 seconds (with debouncing)
4. **Concurrent Protection**: If an API call is already in progress, new requests are skipped

## Testing Checklist

- [ ] Verify Limits API is called on initial page load
- [ ] Verify Limits API is not called continuously when positions update
- [ ] Verify Limits API is debounced (wait 2 seconds, then make one call)
- [ ] Verify Limits API refreshes every 30 seconds (not continuously)
- [ ] Check network tab - should see reasonable number of Limits API calls, not hundreds
- [ ] Verify margins data updates correctly after debounce period
- [ ] Test with rapid position/order updates - should only trigger one API call

## Files Modified

- `superApp_v4/src/views/Dashboard/StatBoard.vue`
  - Added debouncing mechanism
  - Added `reloadAllStats()` function
  - Updated all `refreshMargins()` call sites
  - Added proper cleanup

## Performance Impact

- **Before**: Hundreds of API calls per minute
- **After**: 
  - 1 call on initial load
  - 1 call every 2 seconds maximum (when updates occur)
  - 1 call every 30 seconds (periodic refresh)
  
This should reduce API calls by **95%+** in normal usage scenarios.

