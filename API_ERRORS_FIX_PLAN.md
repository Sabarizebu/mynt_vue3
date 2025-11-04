# API Errors Fix Plan

## Errors Identified

1. **`mflist` (404 Not Found)** - `WatchList.vue:1815`
   - Issue: Endpoint may not exist or URL is incorrect
   - Source: `loadMutualFundsData()` function trying to fetch from `https://v3.mynt.in/mfapi/dashboard/mflist`

2. **`ClientDetails` (401 Unauthorized)** - `getAPIdata.js:1144`
   - Issue: Authentication tokens (`uid`, `tok`) not properly retrieved before API call
   - Source: `getClientDetails()` function using stale module-level variables

## Fix Strategy

### Fix 1: `mflist` (404) Error

**Analysis:**
- Vue 2 code shows `allmutualfunds` is set from an event (`setappbar-event`), not directly loaded
- The `mflist` endpoint may not exist or may require different parameters
- Should make this call optional or use event-based loading

**Solution:**
1. Make `loadMutualFundsData()` optional/non-blocking
2. Add error handling to gracefully handle 404
3. Allow mutual funds data to be loaded via event (like Vue 2)
4. Or use `mastermfapi` endpoint if available

### Fix 2: `ClientDetails` (401) Error

**Analysis:**
- `getClientDetails()` uses module-level `uid` and `tok` variables
- These variables need to be refreshed from `sessionStorage` before use
- `seyCheckwebsocket()` function exists but may not be called

**Solution:**
1. Update `getClientDetails()` to get fresh tokens from `sessionStorage` before API call
2. Ensure `uid` and `tok` are properly retrieved from session storage
3. Add fallback to Pinia stores if sessionStorage is empty

