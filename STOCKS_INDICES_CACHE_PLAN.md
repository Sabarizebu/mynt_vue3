# Stocks Page Top Indices Cache and WebSocket Update Plan

## Problem Analysis

### Issue 1: Top Indices Show Zero Instead of Cached Data
- When WebSocket doesn't provide values immediately, indices show "0.00"
- Previous data should be shown from cache instead of zero
- User wants smooth experience without seeing zeros

### Issue 2: WebSocket Data Not Showing at Mounting Stage
- Some indices don't update until page switch
- WebSocket data should show immediately at mounting stage after login
- All indices should update in real-time without refresh

---

## Solution Plan

### Phase 1: Implement Caching System ✅

**1.1 Create Cache Storage:**
- Store `pdmwdata` prices (ltp, ch, chp) in localStorage/sessionStorage
- Cache key: `${uid}_pdmwdata_cache` or similar
- Cache format: `{ [token]: { ltp, ch, chp, timestamp } }`

**1.2 Cache on WebSocket Update:**
- When WebSocket provides new prices, save to cache
- Update cache with latest values in `optionChainDataParse()`
- Save timestamp for cache expiry if needed

**1.3 Restore from Cache:**
- On mount, load cached data for pdmwdata
- If cached data exists, use it to populate initial display
- Only show "0.00" if no cache AND no WebSocket data

---

### Phase 2: Fix WebSocket Updates at Mount ✅

**2.1 Ensure Subscription on Mount:**
- Subscribe `pdmwdata` to WebSocket immediately on mount
- Don't wait for login (subscription works without login via getLtpdata)
- Re-subscribe in timeout for socket warm-up

**2.2 Ensure Subscription After Login:**
- Subscribe `pdmwdata` immediately after login detected
- Load from cache first, then subscribe for real-time updates
- Don't clear cache on login (keep previous values visible)

**2.3 Fix WebSocket Handler:**
- Handler should update all indices correctly
- Update cache whenever WebSocket provides new data
- Ensure DOM elements update correctly

---

### Phase 3: Display Logic ✅

**3.1 Priority Order for Display:**
1. WebSocket real-time data (latest)
2. Cached data (if WebSocket not available)
3. Default values (0.00) only if neither available

**3.2 Initial Load:**
- Load from cache immediately on mount
- Display cached values while WebSocket connects
- Update with WebSocket data when it arrives

**3.3 After Login:**
- Restore cached data immediately
- Subscribe to WebSocket for real-time updates
- Keep cached data visible until WebSocket updates arrive

---

## Implementation Steps

### Step 1: Add Cache Functions

**Functions needed:**
- `savePdmwdataCache()` - Save pdmwdata prices to cache
- `loadPdmwdataCache()` - Load cached prices for pdmwdata
- `updatePdmwdataFromCache()` - Restore cached values to pdmwdata array

### Step 2: Update WebSocket Handler

**In `optionChainDataParse()`:**
- Save prices to cache when WebSocket updates arrive
- Update cache with latest ltp, ch, chp values

### Step 3: Restore Cache on Mount

**In `mounted()`:**
- Load cached data before subscribing to WebSocket
- Restore cached prices to pdmwdata array
- Display cached values immediately

### Step 4: Restore Cache After Login

**In `initializeLoggedInData()`:**
- Load cached data after login
- Restore cached prices to pdmwdata array
- Subscribe to WebSocket for real-time updates

### Step 5: Ensure WebSocket Updates Show Immediately

**In WebSocket handler:**
- Ensure handler checks for "stockDASH" page identifier
- Ensure all indices get updated (not just some)
- Update cache whenever data arrives

---

## Expected Outcome

After implementation:
✅ Top indices show cached data instead of zero
✅ Cached data displays immediately on mount
✅ Cached data displays immediately after login
✅ WebSocket updates show at mounting stage
✅ All indices update in real-time
✅ Smooth experience without zeros

---

## Code Changes Required

### 1. Add Cache Functions
- `savePdmwdataCache(data)` - Save prices to localStorage
- `loadPdmwdataCache()` - Load prices from localStorage
- `updatePdmwdataFromCache()` - Apply cached prices to pdmwdata

### 2. Update `mounted()` Hook
- Load cache before subscription
- Restore cached values to pdmwdata
- Subscribe to WebSocket for updates

### 3. Update `initializeLoggedInData()` Function
- Load cache after login
- Restore cached values to pdmwdata
- Subscribe to WebSocket

### 4. Update `optionChainDataParse()` Function
- Save prices to cache when WebSocket updates arrive
- Ensure all indices get updated

### 5. Update `setWebsocket()` Function
- For non-logged in users (getLtpdata), save to cache after getting data

