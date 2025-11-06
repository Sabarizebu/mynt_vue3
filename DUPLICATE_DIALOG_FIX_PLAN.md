# Duplicate Dialog Opening Fix Plan

## Problem
When clicking Buy/Sell buttons, the `StockOrderWindow` dialog opens twice. This happens because the component is mounted multiple times or event listeners are registered multiple times.

## Root Cause Analysis

### Issue 1: Multiple Component Instances
- `StockOrderWindow.vue` is imported in `App.vue` (global instance)
- `StockOrderWindow.vue` is also imported in `LayoutSrc.vue` (potentially another instance)
- Each instance registers an event listener in `onMounted()`
- When `menudialog` event is dispatched, both instances handle it, causing duplicate dialogs

### Issue 2: Event Listener Not Properly Guarded
- The `handleMenuDialogEvent` function doesn't check if the dialog is already open
- No debouncing mechanism to prevent rapid-fire events
- Multiple event dispatches from the same action could trigger multiple handlers

### Issue 3: Component Lifecycle Issues
- If the component is kept alive (keep-alive), `onMounted` might not fire, but `onBeforeUnmount` might
- Event listeners might accumulate if component is not properly unmounted

## Solution Plan

### Phase 1: Add Dialog State Guard
**Objective**: Prevent opening dialog if it's already open

**Implementation**:
1. Check if `orderDialog.value` is already `true` at the start of `handleMenuDialogEvent`
2. If open, ignore the event or close and reopen with new data
3. Add a flag to prevent concurrent dialog opening

**Location**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`
- Modify `handleMenuDialogEvent` function (around line 671)

### Phase 2: Debounce Event Handler
**Objective**: Prevent rapid consecutive events from opening multiple dialogs

**Implementation**:
1. Add a debounce mechanism using a ref flag
2. Set flag when dialog is opening, clear after timeout
3. Ignore events while flag is set

**Location**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`
- Add `isOpeningDialog` ref flag
- Modify `handleMenuDialogEvent` to check flag

### Phase 3: Ensure Single Component Instance
**Objective**: Ensure only one instance of StockOrderWindow is rendered

**Implementation**:
1. Check if `StockOrderWindow` is rendered in both `App.vue` and `LayoutSrc.vue`
2. Remove duplicate instance (prefer keeping it in `App.vue` as it's global)
3. Verify only one instance exists in the DOM

**Location**: 
- `superApp_v4/src/App.vue` (line 6)
- `superApp_v4/src/components/Layout/LayoutSrc.vue` (line 330)

### Phase 4: Improve Event Listener Management
**Objective**: Ensure event listeners are properly managed

**Implementation**:
1. Check if listener already exists before adding
2. Use `once` option for one-time events (if applicable)
3. Add cleanup in `onBeforeUnmount` to ensure listeners are removed
4. Add guard to prevent double registration

**Location**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`
- Modify `onMounted` hook (around line 1142)
- Modify `onBeforeUnmount` hook (around line 1255)

### Phase 5: Add Event Source Tracking
**Objective**: Track event source to prevent duplicate handling

**Implementation**:
1. Add unique event ID or timestamp to event detail
2. Track last processed event ID
3. Ignore duplicate events with same ID

**Location**: `superApp_v4/src/components/Popups/StockOrderWindow.vue`
- Modify `handleMenuDialogEvent` function

## Implementation Steps

### Step 1: Add Dialog State Guard (Priority: HIGH)
```javascript
async function handleMenuDialogEvent(event) {
    // Guard: If dialog is already open, close it first or ignore
    if (orderDialog.value) {
        // Option 1: Close and reopen with new data
        closeOrderDialog()
        await nextTick()
        // Continue with new data
        
        // Option 2: Ignore if already open
        // return
    }
    
    // Rest of the function...
}
```

### Step 2: Add Debounce Flag (Priority: HIGH)
```javascript
const isOpeningDialog = ref(false)

async function handleMenuDialogEvent(event) {
    if (isOpeningDialog.value) {
        console.warn('Dialog is already opening, ignoring duplicate event')
        return
    }
    
    isOpeningDialog.value = true
    try {
        // Existing logic...
    } finally {
        setTimeout(() => {
            isOpeningDialog.value = false
        }, 500)
    }
}
```

### Step 3: Check Component Instances (Priority: MEDIUM)
1. Search for all `<StockOrderWindow>` or `StockOrderWindow` usages
2. Ensure only one instance is rendered
3. Remove duplicate instances

### Step 4: Improve Event Listener (Priority: MEDIUM)
```javascript
let eventListenerAdded = false

onMounted(() => {
    if (!eventListenerAdded) {
        window.addEventListener('menudialog', handleMenuDialogEvent)
        eventListenerAdded = true
    }
    // ... rest
})

onBeforeUnmount(() => {
    if (eventListenerAdded) {
        window.removeEventListener('menudialog', handleMenuDialogEvent)
        eventListenerAdded = false
    }
})
```

### Step 5: Add Event Deduplication (Priority: LOW)
```javascript
let lastProcessedEventId = null

async function handleMenuDialogEvent(event) {
    const eventId = event.detail?.eventId || `${Date.now()}-${Math.random()}`
    
    if (lastProcessedEventId === eventId) {
        console.warn('Duplicate event ignored:', eventId)
        return
    }
    
    lastProcessedEventId = eventId
    // ... rest of logic
}
```

## Testing Checklist

- [ ] Click Buy button once - dialog should open once
- [ ] Click Sell button once - dialog should open once
- [ ] Rapidly click Buy/Sell multiple times - only one dialog should open
- [ ] Open dialog, click Buy again - should close and reopen with new data (or ignore)
- [ ] Navigate between pages - dialog should work correctly
- [ ] Check console for duplicate event warnings
- [ ] Verify only one StockOrderWindow component in DOM
- [ ] Test with multiple tabs/windows if applicable

## Expected Outcome

After implementation:
- Dialog opens only once per click
- No duplicate dialogs
- Proper cleanup of event listeners
- Better user experience with no flickering or multiple dialogs

## Files to Modify

1. `superApp_v4/src/components/Popups/StockOrderWindow.vue`
   - Add dialog state guard
   - Add debounce flag
   - Improve event listener management
   - Add event deduplication

2. `superApp_v4/src/App.vue` (if needed)
   - Verify StockOrderWindow is only rendered once

3. `superApp_v4/src/components/Layout/LayoutSrc.vue` (if needed)
   - Remove duplicate StockOrderWindow if present

## Priority Order

1. **HIGH**: Add dialog state guard and debounce flag (Steps 1 & 2)
2. **MEDIUM**: Check and fix component instances (Step 3)
3. **MEDIUM**: Improve event listener management (Step 4)
4. **LOW**: Add event deduplication (Step 5)

