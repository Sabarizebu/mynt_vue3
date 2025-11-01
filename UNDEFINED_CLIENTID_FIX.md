# Undefined clientid Fix

## Issue

API call was showing `clientid=undefined` in the URL:

```
https://be.mynt.in/weblog/getpreference?clientid=undefined&source=WEB
```

## Root Cause

The global `uid` variable in `getAPIdata.js` was not being updated before calling `setOrdprefApi()`. The `uid` variable needs to be populated from `sessionStorage` before making API calls.

## Solution

Added `await seyCheckwebsocket()` before calling `setOrdprefApi()` to ensure the global `uid` variable is properly updated.

## What seyCheckwebsocket() Does

```javascript
export async function seyCheckwebsocket() {
  uid = sessionStorage.getItem("userid"); // Updates global uid
  tok = sessionStorage.getItem("msession"); // Updates global tok
}
```

## Code Changes

### File: LayoutSrc.vue (Lines 658-662)

**Before:**

```javascript
// IMPORTANT: Load order preferences API (this was being skipped!)
console.log("📥 Loading order preferences...");
var ordpre = await setOrdprefApi(); // ❌ uid is undefined
```

**After:**

```javascript
// IMPORTANT: Load order preferences API (this was being skipped!)
console.log("📥 Loading order preferences...");
// Update global uid variable for API calls
await seyCheckwebsocket(); // ✅ Updates uid from sessionStorage
var ordpre = await setOrdprefApi(); // ✅ uid is now defined
```

## How It Works

### Global Variable Flow

1. **Module Load**: `var uid = apiurl.uid` (undefined at module load)
2. **User Login**: URL params stored in `sessionStorage`
3. **seyCheckwebsocket()**: Reads from `sessionStorage` and updates global `uid`
4. **setOrdprefApi()**: Uses global `uid` in API call

### Why It Was Undefined

When loading from a valid session (without URL params), the code path was:

1. Skip `getUserSession()` (because session is valid)
2. Call `setOrdprefApi()` directly
3. ❌ Global `uid` was never updated from `sessionStorage`

## Expected Result

**Before:**

```
GET https://be.mynt.in/weblog/getpreference?clientid=undefined&source=WEB
```

**After:**

```
GET https://be.mynt.in/weblog/getpreference?clientid=Z51875&source=WEB
```

## Verification

To verify the fix:

1. Clear browser cache
2. Login to the app
3. Refresh the page
4. Check network tab
5. Look for `getpreference` request - should show correct `clientid`

## Summary

✅ Fixed: `uid` is now properly updated from `sessionStorage`  
✅ Status: Ready for testing
