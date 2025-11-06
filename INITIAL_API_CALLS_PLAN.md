# Initial API Calls After Login - Fix Plan

## 🎯 Objective
Ensure the new Vue 3 app makes **all the same API calls** as the old app during the mounting stage after login, matching the network log exactly.

---

## 📊 API Calls Identified from Network Log

Based on the network log image, these API calls are made in the old app after login:

### **Session & Config APIs**
1. ✅ `webConfig` - Firebase configuration (likely automatic)
2. ✅ `get_sessions` - Session validation (via `getActiveSession`)
3. ✅ `getpreference?clientid=Z65871&source=W...` - User preferences

### **User Data APIs**
4. ✅ `ClientDetails` - Client details (via `getClientDetails`)
5. ✅ `MWList` - Market watch lists (via `getMwatchlistset` with "MWList") - **FIXED**

### **Trading Data APIs**
6. ⚠️ `PositionBook` - Positions (via `getMPosotion`)
7. ⚠️ `Holdings` - Holdings (via `getMHoldings`)
8. ⚠️ `OrderBook` - Orders (via `getMOrderbook`)
9. ⚠️ `Limits` - Margin limits (via `getMLimits`)

### **Market Data APIs**
10. ⚠️ `getadindices` - Advance/decline indices (via `getIndexList`)
11. ⚠️ `watchlist_for_mobile` - Mobile watchlist (via `getMFwatchlist`)
12. ⚠️ `getadindicesAdvdec` - Advance/decline data
13. ✅ `MarketWatch` - Market watch data (via `getMwatchlistset` with "MarketWatch") - **Already called**

---

## 🔍 Current State Analysis

### **Old App Flow (Vue 2)**

**WatchList.vue mounted()** (line 922-948):
- Emits `login-event`
- Listens for `app-user-event`
- When user logged in:
  1. `getClientexch()` → `ClientDetails` API
  2. `getWatchlist()` → `MWList` API → `MarketWatch` API
  3. `getusedMutual()` → `watchlist_for_mobile` API

**Other components (AppBar, LayoutSrc, etc.)**:
- `get_sessions` → via `getActiveSession` in LayoutSrc
- `getpreference` → via `setOrdprefApi` in LayoutSrc
- `PositionBook`, `Holdings`, `OrderBook`, `Limits` → called from various components (StatBoard, Positions, Holdings, etc.)

**getadindices & getadindicesAdvdec**:
- Called from Dashboard components (StocksSrc, StocksIndices)

### **New App Flow (Vue 3)**

**WatchList.vue onMounted()** (line 3202-3329):
- ✅ `getClientexch()` → `ClientDetails` API
- ✅ `getWatchlist()` → `MWList` API → `MarketWatch` API (FIXED)
- ✅ `getusedMutual()` → `watchlist_for_mobile` API
- ✅ `getAllindicedata()` → might call `getadindices`

**Missing/Unverified**:
- ⚠️ `PositionBook` - Not called in WatchList
- ⚠️ `Holdings` - Not called in WatchList
- ⚠️ `OrderBook` - Not called in WatchList
- ⚠️ `Limits` - Not called in WatchList
- ⚠️ `getadindices` - Need to verify if called
- ⚠️ `getadindicesAdvdec` - Need to verify if called

---

## 📋 Implementation Plan

### **Phase 1: Verify Current API Calls** ✅

1. **Check WatchList.vue**:
   - ✅ `getClientexch()` - Calls `ClientDetails`
   - ✅ `getWatchlist()` - Calls `MWList` then `MarketWatch`
   - ✅ `getusedMutual()` - Calls `watchlist_for_mobile`
   - ✅ `getAllindicedata()` - Need to verify calls `getadindices`

2. **Check AppBar/Layout/Auth**:
   - ⚠️ `get_sessions` - Need to verify
   - ⚠️ `getpreference` - Need to verify

3. **Check Dashboard/StatBoard**:
   - ⚠️ `PositionBook` - Need to verify
   - ⚠️ `Holdings` - Need to verify
   - ⚠️ `OrderBook` - Need to verify
   - ⚠️ `Limits` - Need to verify
   - ⚠️ `getadindicesAdvdec` - Need to verify

### **Phase 2: Identify Missing Calls** 🔍

1. **Search for API function calls in new app**:
   - `getMPosotion` → `PositionBook`
   - `getMHoldings` → `Holdings`
   - `getMOrderbook` → `OrderBook`
   - `getMLimits` → `Limits`
   - `getIndexList` → `getadindices`
   - `getadindicesAdvdec` → Need to find function

2. **Check where these should be called**:
   - In `WatchList.vue` onMounted?
   - In a Pinia store action?
   - In AppBar/Layout component?
   - In Dashboard component?

### **Phase 3: Implement Missing Calls** 🔧

#### **Option A: Call from WatchList.vue (Recommended)**
If these APIs are needed for the watchlist page, call them in `onMounted` after login check.

#### **Option B: Call from Pinia Store**
Create a store action that fetches all initial data after login.

#### **Option C: Call from AppBar/Layout**
Call these APIs at the app level when user logs in.

**Recommendation**: **Option A** - Call from `WatchList.vue` after login, similar to old app pattern.

### **Phase 4: Ensure Correct Sequencing** ⏱️

1. **Session/Config APIs** (First):
   - `webConfig` (automatic)
   - `get_sessions` (via `getActiveSession`)
   - `getpreference` (via `setOrdprefApi`)

2. **User Data APIs** (Second):
   - `ClientDetails`
   - `MWList`
   - `MarketWatch`

3. **Trading Data APIs** (Third - can be parallel):
   - `PositionBook`
   - `Holdings`
   - `OrderBook`
   - `Limits`

4. **Market Data APIs** (Fourth - can be parallel):
   - `getadindices`
   - `watchlist_for_mobile`
   - `getadindicesAdvdec`

### **Phase 5: Add Debugging & Logging** 📊

1. **Add console logs** for each API call:
   ```javascript
   console.log('[API] Calling PositionBook...')
   const res = await getMPosotion()
   console.log('[API] PositionBook Response:', res)
   ```

2. **Verify in Network tab**:
   - All calls appear in correct order
   - All calls return 200 status
   - Response structure matches old app

---

## 🔧 Implementation Steps

### **Step 1: Add Trading Data APIs to WatchList.vue**

Add these calls in `onMounted` after login check:

```javascript
// After getWatchlist() and getusedMutual()
if (sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value) {
    // ... existing calls ...
    
    // NEW: Call trading data APIs
    await Promise.all([
        getPositionbook(),  // PositionBook
        getHoldingbook(),   // Holdings
        getOrderbook(),     // OrderBook
        getLimits(),        // Limits
    ])
}
```

### **Step 2: Verify Market Data APIs**

Check if `getAllindicedata()` calls:
- `getadindices`
- `getadindicesAdvdec`

If not, add these calls.

### **Step 3: Verify Session/Config APIs**

Check if these are called in:
- AppBar component
- Layout component
- Auth store

### **Step 4: Test & Verify**

1. Open browser Network tab
2. Login to app
3. Filter by "Fetch/XHR"
4. Verify all API calls from network log appear
5. Check order and timing

---

## 📝 Code Changes Required

### **1. Add Trading Data Functions to WatchList.vue**

```javascript
import { getMPosotion, getMHoldings, getMOrderbook, getMLimits } from '../../components/mixins/getAPIdata.js'

const getPositionbook = async () => {
    try {
        console.log('[API] Calling PositionBook...')
        const data = await getMPosotion(true)
        console.log('[API] PositionBook Response:', data)
        // Store in Pinia store if needed
    } catch (error) {
        console.error('[API] PositionBook Error:', error)
    }
}

const getHoldingbook = async () => {
    try {
        console.log('[API] Calling Holdings...')
        const data = await getMHoldings(true)
        console.log('[API] Holdings Response:', data)
        // Store in Pinia store if needed
    } catch (error) {
        console.error('[API] Holdings Error:', error)
    }
}

const getOrderbook = async () => {
    try {
        console.log('[API] Calling OrderBook...')
        const data = await getMOrderbook()
        console.log('[API] OrderBook Response:', data)
        // Store in Pinia store if needed
    } catch (error) {
        console.error('[API] OrderBook Error:', error)
    }
}

const getLimits = async () => {
    try {
        console.log('[API] Calling Limits...')
        const data = await getMLimits(true)
        console.log('[API] Limits Response:', data)
        // Store in Pinia store if needed
    } catch (error) {
        console.error('[API] Limits Error:', error)
    }
}
```

### **2. Call These Functions in onMounted**

```javascript
onMounted(async () => {
    // ... existing code ...
    
    if (sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value) {
        // ... existing calls ...
        await getWatchlist()
        await getusedMutual()
        
        // NEW: Call trading data APIs in parallel
        await Promise.all([
            getPositionbook(),
            getHoldingbook(),
            getOrderbook(),
            getLimits(),
        ])
        
        // ... rest of code ...
    }
})
```

### **3. Verify getadindices & getadindicesAdvdec**

Check `getAllindicedata()` function and ensure it calls:
- `getIndexList()` → `getadindices`
- `getadindicesAdvdec()` function (if exists)

---

## ✅ Success Criteria

1. ✅ All API calls from network log appear in new app's Network tab
2. ✅ All calls return 200 status (or appropriate status)
3. ✅ Calls are made in correct sequence (or parallel where appropriate)
4. ✅ Response structure matches old app
5. ✅ No console errors related to API calls
6. ✅ Data is properly stored in Pinia stores or component state

---

## 🔍 Verification Checklist

- [ ] `webConfig` - Appears in Network tab
- [ ] `get_sessions` - Appears in Network tab
- [ ] `getpreference` - Appears in Network tab
- [ ] `ClientDetails` - Appears in Network tab
- [ ] `MWList` - Appears in Network tab (FIXED)
- [ ] `PositionBook` - Appears in Network tab
- [ ] `Holdings` - Appears in Network tab
- [ ] `OrderBook` - Appears in Network tab
- [ ] `Limits` - Appears in Network tab
- [ ] `getadindices` - Appears in Network tab
- [ ] `watchlist_for_mobile` - Appears in Network tab
- [ ] `getadindicesAdvdec` - Appears in Network tab
- [ ] `MarketWatch` - Appears in Network tab (Already working)

---

## 📚 Related Files

- **Old App**: `SuperApp-FE-main-2/src/views/Watchlist/WatchList.vue`
- **New App**: `superApp_v4/src/views/Watchlist/WatchList.vue`
- **API Functions**: `superApp_v4/src/components/mixins/getAPIdata.js`
- **Pinia Stores**: `superApp_v4/src/stores/`

---

## 🚀 Priority Order

1. **HIGH**: `PositionBook`, `Holdings`, `OrderBook`, `Limits` - Core trading data
2. **MEDIUM**: `getadindices`, `getadindicesAdvdec` - Market data
3. **LOW**: `get_sessions`, `getpreference` - Verify if already called elsewhere

---

## 📝 Notes

- These APIs might be called from other components (AppBar, Dashboard, etc.)
- Need to verify if data is actually needed in WatchList component
- Some APIs might be called on-demand rather than on mount
- Consider using Pinia stores to cache data and avoid duplicate calls

