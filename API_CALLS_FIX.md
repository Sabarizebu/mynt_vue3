# API Calls Fix - get_sessions and getpreference

## Issue Identified

The `get_sessions` and `getpreference` APIs were **not being called** on page refresh when a valid session was already present.

## Root Cause

When `sessionStorage.getItem("c3RhdHVz") === "dmFsaWR1c2Vy"` (valid session), the code was **skipping the full initialization flow** to avoid unnecessary API calls. However, this also skipped important API calls like:

1. ✅ `getActiveSession()` → calls `get_sessions` API
2. ❌ `setOrdprefApi()` → calls `getpreference` API

## What Was Fixed

### Before (Lines 635-663)

```javascript
if (uid && token && sessionStatus === "dmFsaWR1c2Vy") {
  // Session is valid, just load the data
  await sessionStore.initializeConfig();

  // Load snackbar alerts...
  // Load watchlist layout...

  appStore.setMainLoader(false); // ❌ Loader hidden WITHOUT calling order prefs API
}
```

### After (Lines 635-680)

```javascript
if (uid && token && sessionStatus === "dmFsaWR1c2Vy") {
  console.log("✅ Valid session found, loading data without validation...");
  // Session is valid, just load the data
  await sessionStore.initializeConfig();

  // Load snackbar alerts...
  // Load watchlist layout...

  // IMPORTANT: Load order preferences API (this was being skipped!)
  console.log("📥 Loading order preferences...");
  var ordpre = await setOrdprefApi(); // ✅ NOW CALLS getpreference API
  if (!(ordpre && ordpre.metadata && ordpre.metadata.mainpreitems)) {
    ordpre = JSON.parse(localStorage.getItem(`${uid}_ordpref`));
    var data = {};
    if (ordpre && ordpre.mainpreitems) {
      data = ordpre;
      localStorage.removeItem(`${uid}_ordpref`);
    } else {
      data = appStore.getOrderPref();
    }
    await setOrdprefApi({ clientid: uid, metadata: data, source: "WEB" }, true);
  }
  console.log("✅ Order preferences loaded");

  appStore.setMainLoader(false); // ✅ Loader hidden AFTER calling order prefs API
}
```

## API Calls Flow

### On Fresh Login (URL has uid and token params)

1. ✅ `getActiveSession()` is called → calls `get_sessions` API
2. ✅ `setOrdprefApi()` is called → calls `getpreference` API

### On Page Refresh (Valid session exists)

**Before fix:**

1. ❌ `getActiveSession()` is skipped → NO `get_sessions` API call
2. ❌ `setOrdprefApi()` is skipped → NO `getpreference` API call

**After fix:**

1. ❌ `getActiveSession()` is still skipped (to avoid unnecessary API call) ✅
2. ✅ `setOrdprefApi()` is NOW called → YES `getpreference` API call ✅

## Why Skip getActiveSession but Call setOrdprefApi?

- **getActiveSession()**: Only needed when you need to validate the session. If session is already validated, skip it to reduce API calls.
- **setOrdprefApi()**: This contains user's order preferences (default exchange, order type, etc.) that should ALWAYS be loaded to ensure the app has the latest user preferences.

## Expected Console Output

When you refresh the page now, you should see:

```
✅ Valid session found, loading data without validation...
📥 Loading order preferences...
✅ Order preferences loaded
✅ Hiding loader...
✅ Loader hidden, mainloader value: false
```

## Network Tab - Expected API Calls

After this fix, on page refresh you should see:

- ✅ `getpreference?clientid=Z51875&source=WEB` - 200 OK
- ✅ `ClientDetails` - 200 OK
- ✅ `MWList` - 200 OK
- ✅ `PositionBook` - 200 OK
- ✅ `Holdings` - 200 OK
- ✅ `OrderBook` - 200 OK
- ✅ `Limits` - 200 OK
- ✅ `watchlist_for_mobile` - 200 OK
- ✅ Other market data APIs...

**Note**: `get_sessions` will NOT appear because we skip it when session is valid (to reduce API calls).

## Testing

1. Clear browser cache
2. Login fresh
3. Check network tab - should see `get_sessions` and `getpreference` called
4. Refresh page
5. Check network tab - should see `getpreference` called (but NOT `get_sessions`)

## Files Modified

- `src/components/Layout/LayoutSrc.vue` - Added order preferences API call when session is valid

## Summary

✅ Fixed: Order preferences API (`getpreference`) now called on page refresh  
✅ Kept: Session validation (`get_sessions`) still skipped on refresh to reduce API calls  
✅ Added: Console logging to track when APIs are called
