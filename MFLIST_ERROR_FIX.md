# mflist API Error Fix

## Issue
The `mflist` API call was returning **404 Not Found** errors in the network tab, even though the component was handling it gracefully.

## Root Cause
After analyzing the Vue 2 codebase:
- The `allmutualfunds` data in Vue 2 is **NOT loaded via direct API call**
- It's loaded via the `setappbar-event` event (line 952-960 in Vue 2 WatchList.vue)
- There's no `mflist` endpoint call in the original Vue 2 watchlist component
- The `mflist` endpoint doesn't exist or is not meant to be called directly

## Solution
**Removed the direct API call entirely** and rely only on event-based loading (matching Vue 2 behavior):

### Changes Made:
1. ✅ **Removed `loadMutualFundsData()` function** - This function was trying to fetch from non-existent endpoint
2. ✅ **Removed call to `loadMutualFundsData()` from `onMounted()`** - No longer needed
3. ✅ **Kept `handleSetAppBarEvent()` event listener** - This is how Vue 2 loads the data

### Before:
```javascript
const loadMutualFundsData = async () => {
    const response = await fetch('https://v3.mynt.in/mfapi/dashboard/mflist')  // ❌ 404 Error
    // ... error handling
}

onMounted(async () => {
    await loadMutualFundsData()  // ❌ Makes API call that fails
})
```

### After:
```javascript
// Note: Mutual funds data is loaded via setappbar-event (like Vue 2)
// No direct API call needed - data comes from event handler

const handleSetAppBarEvent = (event) => {
    const { data, value } = event.detail || {}
    if (value == 1 && data) {
        panel.value = true
        allmutualfunds.value = data  // ✅ Load data from event
    }
}

onMounted(async () => {
    window.addEventListener('setappbar-event', handleSetAppBarEvent)  // ✅ Only event listener
    // No API call - data comes from event
})
```

## Result
- ✅ **No more 404 errors** - The API call is completely removed
- ✅ **Matches Vue 2 behavior** - Data loads via event, just like original
- ✅ **Cleaner code** - No unnecessary error handling for non-existent endpoint

## Status
✅ **FIXED** - The `mflist` 404 error will no longer appear in the network tab.

