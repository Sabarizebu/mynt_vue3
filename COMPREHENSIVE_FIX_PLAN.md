# Comprehensive Vue 3 Migration Fix Plan

## Issues Identified

### Issue 1: WebSocket Data Not Updated After Login

**Problem**: WebSocket subscriptions don't work immediately after login in mounting stage
**Impact**: Users see stale data until page refresh
**Priority**: High

### Issue 2: Watchlist Hover Options Not Showing

**Problem**: Hover options and delete button don't show sometimes, requires refresh
**Impact**: Poor UX, functionality not available
**Priority**: High

### Issue 3: Top Indices Only First Two Columns Update

**Problem**: Only Nifty 50 and Nifty Bank update, others stay static
**Impact**: Incomplete data display
**Priority**: High

### Issue 4: CSS Variables Not Applying (White Background)

**Problem**: CSS variables disappear, white background shows, requires refresh
**Impact**: Poor visual appearance
**Priority**: Medium

### Issue 5: Watchlist Holdings & Top Indices White on Mount

**Problem**: First two columns of top indices show white, holdings not showing correctly
**Impact**: Data not visible on initial load
**Priority**: High

## Implementation Plan

### Phase 1: Fix WebSocket Subscription After Login (Priority 1)

#### 1.1 Add Login Event Listener

- **File**: `StocksSrc.vue`, `WatchList.vue`
- **Action**: Listen for login events and re-subscribe WebSocket
- **Changes**:
  ```javascript
  // Watch for uid changes (login/logout)
  watch(
    uid,
    async (newUid, oldUid) => {
      if (newUid && !oldUid) {
        // User just logged in - re-subscribe to WebSocket
        console.log("User logged in, re-subscribing WebSocket");
        await nextTick();
        setWebsocket("sub", pdmwdata.value, "ssd-pd");
        if (Object.keys(advdecitems.wsdata || {}).length > 0) {
          setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
        }
        // Re-fetch initial data
        fetchInitialIndicesData();
      }
    },
    { immediate: false }
  );
  ```

#### 1.2 Ensure WebSocket Re-subscription on Login

- **File**: `StocksSrc.vue` (`onMounted`)
- **Action**: Add delayed re-subscription after login check
- **Changes**: Check if user logs in after mount and re-subscribe

### Phase 2: Fix Watchlist Hover Options (Priority 2)

#### 2.1 Fix PreDefinedMW Reactivity

- **File**: `WatchList.vue`
- **Action**: Ensure `PreDefinedMW` is reactive and properly initialized
- **Changes**:

  ```javascript
  // Ensure PreDefinedMW is reactive
  const PreDefinedMW = reactive({
    is: false,
    // ... other properties
  });

  // Watch for changes and force re-render
  watch(
    () => PreDefinedMW.is,
    () => {
      nextTick(() => {
        // Force component re-render
      });
    }
  );
  ```

#### 2.2 Fix UID Reactivity for Hover Options

- **File**: `WatchList.vue`
- **Action**: Ensure `uid` reactivity triggers hover options visibility
- **Changes**:
  ```javascript
  // Watch uid changes
  watch(uid, (newUid) => {
    if (newUid) {
      // Force re-render of watchlist items
      nextTick(() => {
        // Hover options should now show
      });
    }
  });
  ```

#### 2.3 Fix Conditional Rendering

- **File**: `WatchList.vue` (template)
- **Action**: Ensure `v-if="uid"` and `v-if="!PreDefinedMW.is"` work correctly
- **Changes**: Add key to force re-render when uid/PreDefinedMW changes

### Phase 3: Fix Top Indices All Columns Update (Priority 3)

#### 3.1 Verify Token Matching (Already Fixed)

- **Status**: ✅ Already implemented with string conversion
- **Action**: Verify it's working correctly

#### 3.2 Ensure All Tokens Are Subscribed

- **File**: `StocksSrc.vue`
- **Action**: Verify all 8 tokens are subscribed on mount
- **Changes**: Add logging to confirm all subscriptions

### Phase 4: Fix CSS Variables Not Applying (Priority 4)

#### 4.1 Ensure CSS Variables Are Loaded

- **File**: `index.html` or main entry point
- **Action**: Ensure theme CSS files are loaded before component mount
- **Changes**: Verify CSS import order

#### 4.2 Fix CSS Variable Scoping

- **File**: Component styles
- **Action**: Ensure CSS variables are accessible in component scope
- **Changes**: Use `:root` or proper scoping

#### 4.3 Add Force CSS Variable Refresh

- **File**: `App.vue` or main component
- **Action**: Force CSS variable refresh on mount
- **Changes**:
  ```javascript
  onMounted(() => {
    // Force CSS variable refresh
    const root = document.documentElement;
    const style = getComputedStyle(root);
    // Re-apply CSS variables if needed
  });
  ```

### Phase 5: Fix Initial Data Loading (Priority 5)

#### 5.1 Fix Top Indices White Display on Mount

- **File**: `StocksSrc.vue`
- **Action**: Ensure initial data is loaded before display
- **Changes**:

  ```javascript
  // Load initial data before mount
  onBeforeMount(async () => {
    await fetchInitialIndicesData();
  });

  // Or use loading state
  const indicesLoading = ref(true);
  onMounted(async () => {
    await fetchInitialIndicesData();
    indicesLoading.value = false;
  });
  ```

#### 5.2 Fix Watchlist Holdings Display

- **File**: `WatchList.vue`
- **Action**: Ensure holdings data is loaded and displayed correctly
- **Changes**: Check data loading and rendering logic

## Detailed Implementation Steps

### Step 1: WebSocket Re-subscription After Login

**Files to Modify**:

1. `StocksSrc.vue` - Add watch for uid changes
2. `WatchList.vue` - Add watch for uid changes

**Implementation**:

```javascript
// In StocksSrc.vue
import { watch, nextTick } from "vue";

// Watch for uid changes
watch(
  uid,
  async (newUid, oldUid) => {
    if (newUid && !oldUid) {
      // User just logged in
      console.log("User logged in, re-subscribing WebSocket");
      await nextTick();

      // Re-subscribe to WebSocket
      setWebsocket("sub", pdmwdata.value, "ssd-pd");
      if (Object.keys(advdecitems.wsdata || {}).length > 0) {
        setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
      }

      // Re-fetch initial data
      await fetchInitialIndicesData();
      await getADlistdata();
    } else if (!newUid && oldUid) {
      // User logged out - clear subscriptions if needed
      console.log("User logged out");
    }
  },
  { immediate: false }
);
```

### Step 2: Fix Watchlist Hover Options

**Files to Modify**:

1. `WatchList.vue` - Fix PreDefinedMW and uid reactivity

**Implementation**:

```javascript
// Ensure PreDefinedMW is reactive
const PreDefinedMW = reactive({
  is: false,
  // ... other properties
});

// Watch for uid changes
watch(
  uid,
  (newUid) => {
    if (newUid) {
      // Force re-render of watchlist items
      nextTick(() => {
        // Component should re-render with hover options
      });
    }
  },
  { immediate: true }
);

// Watch for PreDefinedMW changes
watch(
  () => PreDefinedMW.is,
  () => {
    nextTick(() => {
      // Force re-render
    });
  }
);
```

**Template Changes**:

```vue
<!-- Add key to force re-render when uid/PreDefinedMW changes -->
<div
  v-if="uid"
  @click.stop
  class="pos-abs table-hov"
  :key="`hover-${uid}-${PreDefinedMW.is}`"
>
    <!-- Hover options -->
</div>
```

### Step 3: Fix CSS Variables

**Files to Modify**:

1. `main.js` or `App.vue` - Ensure CSS is loaded
2. Component styles - Ensure proper scoping

**Implementation**:

```javascript
// In main.js or App.vue
import { onMounted } from "vue";

onMounted(() => {
  // Force CSS variable refresh
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  // Verify CSS variables are loaded
  const mainGreen = computedStyle.getPropertyValue("--maingreen");
  const mainRed = computedStyle.getPropertyValue("--mainred");

  if (!mainGreen || !mainRed) {
    console.warn("CSS variables not loaded, reloading theme");
    // Reload theme CSS if needed
  }
});
```

### Step 4: Fix Initial Data Loading

**Files to Modify**:

1. `StocksSrc.vue` - Load data before mount
2. `WatchList.vue` - Load holdings data correctly

**Implementation**:

```javascript
// In StocksSrc.vue
const indicesLoading = ref(true);

onBeforeMount(async () => {
  // Load initial data before mount
  try {
    await fetchInitialIndicesData();
  } catch (error) {
    console.error("Error loading initial indices data:", error);
  }
});

onMounted(async () => {
  // Continue with other initialization
  indicesLoading.value = false;
});
```

## Testing Checklist

### Phase 1 Testing:

- [ ] Login and verify WebSocket re-subscribes immediately
- [ ] Verify data updates without refresh
- [ ] Check console logs for re-subscription

### Phase 2 Testing:

- [ ] Verify hover options show immediately after login
- [ ] Verify delete button shows when not predefined watchlist
- [ ] Test without refresh after login

### Phase 3 Testing:

- [ ] Verify all 8 top indices update in real-time
- [ ] Check all columns (LTP, ch, chp) update
- [ ] Verify colors change dynamically

### Phase 4 Testing:

- [ ] Verify CSS variables apply on initial load
- [ ] Test without refresh
- [ ] Verify colors don't disappear

### Phase 5 Testing:

- [ ] Verify top indices show data immediately (not white)
- [ ] Verify watchlist holdings show correctly
- [ ] Test initial page load

## Timeline

1. **Phase 1 (WebSocket Re-subscription)**: 2 hours
2. **Phase 2 (Watchlist Hover)**: 2 hours
3. **Phase 3 (Top Indices)**: 1 hour (mostly done)
4. **Phase 4 (CSS Variables)**: 2 hours
5. **Phase 5 (Initial Data)**: 2 hours

**Total Estimated Time**: 9 hours
