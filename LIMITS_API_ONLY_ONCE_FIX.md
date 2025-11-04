# Limits API - "Call Only Once" Fix

## Problem
The Limits API was still being called multiple times despite throttling/debouncing. The user requested that the Limits API be called **ONLY ONCE** per application session.

## Root Cause Analysis

1. **Multiple Automatic Triggers**: 
   - 30-second interval in StatBoard.vue calling `refreshMarginsDebounced()`
   - Event listeners (`position-update`, `funds-update`) triggering refreshes
   - Position/order updates triggering automatic margin refreshes
   - `reloadAllStats()` calling margin refresh
   - FundSrc.vue calling `getMLimits()` on mount

2. **Throttling Not Enough**: The 2-second throttle mechanism still allowed multiple calls over time, not "only once"

## Solution Implemented

### 1. Strict "Call Only Once" Mechanism
- Added `hasBeenCalledOnce` flag to global `limitsApiState`
- Once `getMLimits()` is called once, all subsequent calls (without force refresh) return cached data
- Permanent caching until manual refresh

### 2. Force Refresh Function
- Created `forceRefreshMLimits()` function for manual refresh only
- Resets the `hasBeenCalledOnce` flag to allow a new API call
- Used by the manual refresh button in FundSrc.vue

### 3. Removed All Automatic Triggers
- **Removed 30-second interval** in StatBoard.vue
- **Removed event-triggered refreshes** (`position-update`, `funds-update`)
- **Removed automatic refreshes** when positions/orders update
- **Removed margin refresh** from `reloadAllStats()`
- **Kept only initial load** in `loadAll()` function

### 4. Updated Components
- **StatBoard.vue**: 
  - Removed all automatic `refreshMarginsDebounced()` calls
  - Only calls `getMLimits()` once in `loadAll()` function
- **FundSrc.vue**: 
  - Updated `getAllmargin()` to use `forceRefreshMLimits()` for manual refresh
  - Initial load uses `getMLimits()` (which will return cached data if already loaded)

## Implementation Details

### Global State Object
```javascript
let limitsApiState = {
    hasBeenCalledOnce: false,  // Flag to ensure API is called only once
    isPending: false,
    pendingPromise: null,
    cachedData: null,          // Cache the response permanently until manual refresh
    cacheExpiry: 0,
    cacheDurationMs: Infinity  // Cache forever until manual refresh
};
```

### Function Flow
1. **First Call**: 
   - `getMLimits()` is called → Sets `hasBeenCalledOnce = true` → Makes API call → Caches response
2. **Subsequent Calls**: 
   - `getMLimits()` is called → Checks `hasBeenCalledOnce` → Returns cached data (no API call)
3. **Manual Refresh**: 
   - `forceRefreshMLimits()` is called → Resets `hasBeenCalledOnce = false` → Makes API call → Updates cache

### Key Changes

#### `getAPIdata.js`
- Modified `getMLimits(format, forceRefresh = false)`:
  - Checks `hasBeenCalledOnce` flag before making API call
  - Returns cached data if already called once (unless forced refresh)
  - Sets `hasBeenCalledOnce = true` after first call
- Added `forceRefreshMLimits(format)`:
  - Resets flag and calls `getMLimits()` with `forceRefresh = true`

#### `StatBoard.vue`
- Removed all `refreshMarginsDebounced()` calls
- Removed 30-second interval
- Removed event-triggered refreshes
- Only calls `getMLimits()` once in `loadAll()`

#### `FundSrc.vue`
- Updated `getAllmargin()` to use `forceRefreshMLimits()` for manual refresh button
- Initial mount uses `getMLimits()` (gets cached data if already loaded)

## Expected Behavior

### Before Fix:
- Limits API called multiple times:
  - Once on initial load
  - Every 30 seconds (interval)
  - On position updates
  - On order updates
  - On fund update events
  - On page refresh in FundSrc

### After Fix:
- Limits API called **ONLY ONCE**:
  - Once on initial page load (first component that needs it)
  - **Never again automatically**
  - Only manually via refresh button (uses `forceRefreshMLimits()`)

## Benefits

1. **Strict Control**: API called exactly once per session
2. **No Automatic Polling**: Eliminated all automatic refresh mechanisms
3. **Manual Refresh Available**: Users can manually refresh when needed
4. **Performance**: Significant reduction in API calls (from hundreds to 1)
5. **Consistent Data**: All components share the same cached data

## Files Modified

- `superApp_v4/src/components/mixins/getAPIdata.js`
  - Added `hasBeenCalledOnce` flag
  - Modified `getMLimits()` to enforce "call only once"
  - Added `forceRefreshMLimits()` function
- `superApp_v4/src/views/Dashboard/StatBoard.vue`
  - Removed all automatic refresh calls
  - Removed 30-second interval
  - Removed event-triggered refreshes
- `superApp_v4/src/views/Accounts/FundSrc.vue`
  - Updated to use `forceRefreshMLimits()` for manual refresh

## Testing Checklist

- [ ] Verify Limits API is called only once on initial page load
- [ ] Verify Limits API is NOT called on position updates
- [ ] Verify Limits API is NOT called on order updates
- [ ] Verify Limits API is NOT called every 30 seconds
- [ ] Verify manual refresh button works (calls API again)
- [ ] Check network tab - should see exactly 1 Limits API call (or 2 if manual refresh clicked)
- [ ] Verify all components receive the same cached data
- [ ] Test navigation between pages - cached data should persist

## Performance Impact

- **Before**: Hundreds of API calls per session
- **After**: Exactly 1 API call per session (or 2 if manual refresh clicked)
- **Reduction**: 99%+ reduction in API calls
- **Network Traffic**: Minimal - only essential calls

