# WebSocket Connection Fix

## Issue

WebSocket is not connecting after login.

## Root Cause

`seyCheckwebsocket()` was being called **BEFORE** `sessionStore.updateMyntUrl()` which sets `mynturl.stat = 1`.

The websocket check requires:

```javascript
if (res == "dmFsaWR1c2Vy" && userId && mynturl && mynturl.stat == 1) {
  establishSocketConnection(type);
}
```

Since `mynturl.stat` was not set yet, the websocket never connected.

## Solution

### Changed the Order

**Before (Line 479-483):**

```javascript
if (
  sessvalid &&
  sessvalid.stat == "Ok" &&
  sessvalid.apitoken &&
  sessvalid.token
) {
  await seyCheckwebsocket(); // ❌ Called BEFORE updateMyntUrl
  // ...
  sessionStore.updateMyntUrl(sessvalid); // ❌ mynturl.stat set AFTER websocket
}
```

**After:**

```javascript
if (
  sessvalid &&
  sessvalid.stat == "Ok" &&
  sessvalid.apitoken &&
  sessvalid.token
) {
  // IMPORTANT: Update mynturl BEFORE calling seyCheckwebsocket
  sessionStore.updateMyntUrl(sessvalid); // ✅ mynturl.stat set FIRST
  console.log("✅ mynturl updated with stat:", apiurl.mynturl);

  await seyCheckwebsocket(); // ✅ Now mynturl.stat == 1 exists
  // ...
}
```

## What updateMyntUrl() Does

```javascript
const updateMyntUrl = (config) => {
  mynturl.value = {
    ...mynturl.value,
    myntapi: config.url,
    source: config.source,
    wss: config.wss,
    stat: 1, // ✅ Critical for websocket connection!
  };
  apiurl.mynturl = mynturl.value; // Updates global mynturl
};
```

## WebSocket Connection Flow

1. **User logs in** → `getActiveSession()` validates session
2. **Session valid** → `sessvalid` contains session info
3. **Update mynturl** → `sessionStore.updateMyntUrl(sessvalid)` sets `stat: 1`
4. **Connect websocket** → `seyCheckwebsocket()` checks `mynturl.stat == 1` ✅
5. **WebSocket connects** → Real-time data flows

## Debug Console Output

Expected logs:

```
✅ Session valid, proceeding...
✅ mynturl updated with stat: { myntapi: "...", source: "...", wss: "...", stat: 1 }
✅ WebSocket session checked, mynturl stat: 1
```

## Files Modified

- `src/components/Layout/LayoutSrc.vue` - Moved `updateMyntUrl()` call before `seyCheckwebsocket()`

## Verification

After this fix:

1. Login to the app
2. Check console for "mynturl updated with stat: 1"
3. WebSocket should connect automatically
4. Real-time data should start flowing

## Status: ✅ FIXED

WebSocket should now connect properly after login!
