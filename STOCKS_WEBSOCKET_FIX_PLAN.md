# Stocks Page WebSocket Fix Plan

## Problem Analysis

### Issue 1: Top Indices Only First Two Columns Update
**Root Cause**: 
- `webSocketEventBus.js` only emits `web-scoketConn` events for 'watchlist' page
- It doesn't emit for 'stockDASH' or 'stocks' pages
- Top indices listen for `web-scoketConn` with page == "stockDASH", but events are never emitted with that page

**Location**: `webSocketEventBus.js` lines 204-233

### Issue 2: Sectors/Thematic Not Updating
**Root Cause**:
- Same issue - `webSocketEventBus.js` doesn't emit events for sectors/thematic
- Sectors subscribe to WebSocket but never receive updates
- `handleWebSocketConnection` in StocksSrc.vue checks for page == "stockDASH" but events are only emitted for "watchlist"

**Location**: `webSocketEventBus.js` lines 204-233

### Issue 3: WebSocket Event Bus Not Tracking Page
**Root Cause**:
- Old code: `LayoutSrc.vue` tracks `wsstocksdata.raw` to know which page is active
- New code: `webSocketEventBus.js` doesn't track which page is active
- When WebSocket data arrives, it doesn't know which page to emit to

**Location**: `webSocketEventBus.js` - needs to track active pages

## Implementation Plan

### Phase 1: Fix WebSocket Event Bus to Emit for All Pages (Priority 1)

#### 1.1 Track Active Pages in WebSocket Event Bus
- **File**: `webSocketEventBus.js`
- **Action**: Track which pages have active subscriptions
- **Changes**:
  ```javascript
  // Track active pages and their subscriptions
  this.activePages = new Map(); // page -> Set of tokens
  
  // In handleWebSocketRequest:
  if (flow === "sub" && data && Array.isArray(data) && data.length > 0) {
      // Track page and tokens
      if (!this.activePages.has(page)) {
          this.activePages.set(page, new Set());
      }
      data.forEach(item => {
          if (item && item.token && item.exch) {
              this.activePages.get(page).add(`${item.exch}|${item.token}`);
          }
      });
  }
  ```

#### 1.2 Emit web-scoketConn for All Active Pages
- **File**: `webSocketEventBus.js` (`optionChainDataParse` function)
- **Action**: Emit `web-scoketConn` events for all pages that have subscriptions for the token
- **Changes**:
  ```javascript
  optionChainDataParse(data) {
      // Handle different data formats
      let eventData = null;
      
      if (Array.isArray(data)) {
          eventData = data[0]?.v || data[0] || data;
      } else if (data?.v) {
          eventData = data.v;
      } else {
          eventData = data;
      }
      
      if (eventData) {
          const token = eventData.token || eventData.tk;
          const exchange = eventData.exchange || eventData.e || eventData.exch;
          
          // Find which pages have subscriptions for this token
          this.activePages.forEach((tokens, page) => {
              const channelString = `${exchange}|${token}#`;
              if (tokens.has(channelString)) {
                  // Emit web-scoketConn event for this page
                  const event = new CustomEvent('web-scoketConn', {
                      detail: [eventData, page]
                  });
                  window.dispatchEvent(event);
              }
          });
          
          // Also emit for watchlist (backward compatibility)
          const watchlistEvent = new CustomEvent('web-scoketConn', {
              detail: [eventData, 'watchlist']
          });
          window.dispatchEvent(watchlistEvent);
      }
  }
  ```

### Phase 2: Fix Top Indices WebSocket Updates (Priority 2)

#### 2.1 Verify WebSocket Subscription for All Top Indices
- **File**: `StocksSrc.vue` (`onMounted`)
- **Action**: Ensure all top indices are subscribed to WebSocket
- **Status**: Already implemented, but verify it works

#### 2.2 Verify WebSocket Event Handling
- **File**: `StocksSrc.vue` (`handleWebSocketConnection`)
- **Action**: Ensure it processes all top indices updates
- **Status**: Already implemented with `optionChainDataParse`

### Phase 3: Fix Sectors/Thematic WebSocket Updates (Priority 3)

#### 3.1 Verify WebSocket Subscription for Sectors
- **File**: `StocksSrc.vue` (`getADlistdata`)
- **Action**: Ensure sectors are subscribed to WebSocket
- **Status**: Already implemented, but verify it works

#### 3.2 Verify WebSocket Event Handling for Sectors
- **File**: `StocksSrc.vue` (`handleWebSocketConnection` and `optionChainDataParse`)
- **Action**: Ensure sectors receive WebSocket updates
- **Status**: Already implemented with `updateSectorData`

### Phase 4: Add Debugging and Logging (Priority 4)

#### 4.1 Add WebSocket Subscription Logging
- **File**: `webSocketEventBus.js`
- **Action**: Log when subscriptions are made and which pages are active
- **Changes**: Add console logs for debugging

## Migration Notes

### Old Code (Vue 2):
```javascript
// LayoutSrc.vue
optionChainDataParse(data) {
    if (this.wsstocksdata && this.wsstocksdata.tok && this.wsstocksdata.rawdata) {
        eventBus.$emit("web-scoketConn", data[0].v, this.wsstocksdata.raw);
    }
}
```
- `wsstocksdata.raw` is set to the page identifier (e.g., "stockDASH")
- Emits `web-scoketConn` with the current page

### New Code (Vue 3):
```javascript
// webSocketEventBus.js
optionChainDataParse(data) {
    // Only emits for 'watchlist' page
    const event = new CustomEvent('web-scoketConn', {
        detail: [eventData, 'watchlist']
    });
    window.dispatchEvent(event);
}
```
- Doesn't track which page is active
- Only emits for 'watchlist'

### Fix:
- Track active pages in `webSocketEventBus`
- Emit `web-scoketConn` events for all active pages
- Use token matching to determine which pages should receive updates

