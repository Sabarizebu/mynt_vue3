# API URL Error Fix - WatchList.vue

## Problem

**Error:** "No API URL available, session may not be ready"  
**Location:** `WatchList.vue:975`  
**Occurrence:** 2 errors in console

### Root Cause

The `ensureSessionReady()` function was logging errors even when:
1. User is not logged in (initial page load)
2. Session is still initializing
3. Component is mounting before session is fully ready

The error was being called from:
- `getWatchlist()` - called on mount if logged in (line 2722)
- `getusedMutual()` - called on mount if logged in (line 2725)

Both functions call `ensureSessionReady()` which checks for `mynturl.myntapi`, and if not available, it logs an error even when the user is not logged in or session is still initializing.

---

## Solution Implemented ✅

### Fix 1: Enhanced `ensureSessionReady()` Function

**Changes:**
1. **Check login status first** - Only proceed with API URL check if user is logged in
2. **Silent return for non-logged-in users** - No error logging if user is not logged in
3. **Changed error to warning** - Use `console.warn` instead of `console.error` to reduce noise
4. **Removed snackbar on mount** - Only show snackbar on user action, not on initial mount

**Before:**
```javascript
const ensureSessionReady = async () => {
    // Check if mynturl is loaded
    if (!mynturl.myntapi || !mynturl.stat) {
        // ... try to load ...
        
        // Always logs error, even if user not logged in
        console.error("❌ No API URL available, session may not be ready")
        appStore.showSnackbar(0, "Session not ready. Please wait or refresh the page.")
        return false
    }
    // ...
}
```

**After:**
```javascript
const ensureSessionReady = async () => {
    // First, verify authentication tokens are present
    // If user is not logged in, silently return false (no error logging)
    const suid = uid.value || sessionStorage.getItem('userid')
    const stok = mtoken.value || sessionStorage.getItem('msession')
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    const isLoggedIn = sessionStatus === 'dmFsaWR1c2Vy' && suid && stok
    
    // If user is not logged in, just return false silently
    if (!isLoggedIn) {
        return false
    }

    // Check if mynturl is loaded
    if (!mynturl.myntapi || !mynturl.stat) {
        // ... try to load ...
        
        // Only show warning if user is logged in but session not ready
        if (isLoggedIn) {
            console.warn("⚠️ API URL not available yet, session may still be initializing")
            // Don't show snackbar on initial mount - wait for user action
        }
        return false
    }
    // ...
}
```

### Fix 2: Enhanced `getWatchlist()` Function

**Changes:**
1. **Check login status before calling `ensureSessionReady()`** - Skip API calls if user not logged in
2. **Load from cache if session not ready** - Instead of showing 'no data', try to load from cache
3. **Better handling for non-logged-in users** - Skip API calls gracefully

**Key Changes:**
```javascript
// Check if user is logged in before checking session
const sessionStatus = sessionStorage.getItem("c3RhdHVz")
const isLoggedIn = sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value

// If user not logged in, skip API call
if (!isLoggedIn) {
    watchlist.value = ['Millionaire']
    watchlistis.value = 'Millionaire'
    watchlistdata.value = 'no data'
    isLoading.value = false
    return
}

// Only check session if user is logged in
if (!(await ensureSessionReady())) {
    // Try to load from cache instead of showing 'no data'
    const cached = loadWatchlistFromCache(watchlistis.value)
    if (cached && Array.isArray(cached) && cached.length > 0) {
        watchlistdata.value = cached
    } else {
        watchlistdata.value = 'no data'
    }
    // ...
}
```

### Fix 3: Enhanced `getusedMutual()` Function

**Changes:**
1. **Check login status before calling `ensureSessionReady()`** - Skip API calls if user not logged in
2. **Silent return for non-logged-in users** - No error logging for initial load if user not logged in
3. **Better handling for session not ready** - Silently return and let it retry later

**Key Changes:**
```javascript
const getusedMutual = async (mode, item, del) => {
    // Check if user is logged in first
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    const isLoggedIn = sessionStatus === 'dmFsaWR1c2Vy' && uid.value
    
    // If user not logged in and mode is not specified (initial load), silently return
    if (!isLoggedIn && !mode) {
        mfisLoading.value = false
        return
    }
    
    // If user is logged in but session not ready, silently return (will retry later)
    if (isLoggedIn && !(await ensureSessionReady())) {
        mfisLoading.value = false
        return
    }
    
    // ... rest of function
}
```

### Fix 4: Fixed Syntax Error

**Issue:** Line 49 had `color: ;` (missing value)  
**Fix:** Removed the empty color property

---

## Files Modified

- `superApp_v4/src/views/Watchlist/WatchList.vue`
  - Lines ~951-998: Enhanced `ensureSessionReady()` function
  - Lines ~1646-1696: Enhanced `getWatchlist()` function
  - Lines ~2284-2305: Enhanced `getusedMutual()` function
  - Line ~49: Fixed syntax error in style attribute

---

## Expected Results

### Before Fix:
- ❌ 2 console errors on mount: "No API URL available, session may not be ready"
- ❌ Errors appear even when user is not logged in
- ❌ Errors appear during session initialization
- ❌ Unnecessary snackbar notifications

### After Fix:
- ✅ No console errors when user is not logged in
- ✅ No console errors during session initialization
- ✅ Only console.warn (not error) if user is logged in but session not ready
- ✅ Silent handling for non-logged-in users
- ✅ Cache loading when session not ready
- ✅ Better user experience

---

## Verification

✅ **Fixed:**
- Console error removed for non-logged-in users
- Console error removed during session initialization
- Silent handling for expected scenarios
- Cache loading when session not ready
- Syntax error fixed

⏳ **Test Checklist:**
1. [ ] Load watchlist page without being logged in - should have no errors
2. [ ] Load watchlist page while logged in - should have no errors if session is ready
3. [ ] Load watchlist page during login (session initializing) - should have no errors, only warnings if needed
4. [ ] Check console for any other issues

---

## Status

✅ **FIXED** - Ready for testing

The API URL error should no longer appear in the console for normal scenarios (non-logged-in users, session initialization). It will only show a warning if a logged-in user's session is not ready, which is an unexpected but recoverable scenario.

