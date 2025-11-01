# EventBus to Pinia Migration

## Summary

Successfully migrated from EventBus-based state management to Pinia stores throughout the application.

## Changes Made

### 1. Created New Pinia Stores

#### `src/stores/appStore.js`

- Manages application-wide state: snackbars, loaders, alerts, watchlist layout
- Actions:
  - `showSnackbar(color, msg)` - Display snackbar notifications
  - `hideSnackbar()` - Hide snackbar
  - `showLoader()` / `hideLoader()` - Control sub-loader
  - `setMainLoader(value)` - Control main loader
  - `showAlert(params)` / `hideAlert()` - Display modal alerts
  - `toggleWatchlistLayout()` - Toggle watchlist layout
  - `setWatchlistLayout(value)` - Set watchlist layout
  - `resetStorage()` - Clear session and local storage

#### `src/stores/navStore.js`

- Manages navigation state and actions
- Actions:
  - `navigateToStockDetails(type, token, exch, tsym, trantype, item)` - Navigate to stock details
  - `triggerLogin(flow)` - Trigger login flow

#### `src/stores/authStore.js`

- Manages authentication state
- State: `uid`, `token`, `mtoken`, `user`
- Actions:
  - `setAuth(userId, userToken, msession)` - Set authentication data
  - `setUser(userData)` - Set user profile
  - `clearAuth()` - Clear authentication data
  - `loadFromSession()` - Load auth from session storage
  - `loadFromUrl()` - Load auth from URL parameters
  - `isAuthenticated()` - Check authentication status

### 2. Updated Components

#### `src/components/Layout/LayoutSrc.vue`

- Replaced `useEventBusStore()` with three new stores
- Removed all `eventBus.$on()` and `eventBus.$off()` calls
- Updated template to use store state directly
- Replaced local refs with store state where applicable
- Template changes:
  - `snackbar` → `appStore.snackbar`
  - `snackcolor` → `appStore.snackcolor`
  - `snacktxt` → `appStore.snacktxt`
  - `subloader` → `appStore.subloader`
  - `mainloader` → `appStore.mainloader`
  - `showalert` → `appStore.showalert`
  - `showalertmsg` → `appStore.showalertmsg`
  - `wllayout` → `appStore.wllayout`
  - `uid` → `authStore.uid`
  - `useris` → `authStore.user`

#### `src/components/AppBar.vue`

- Removed `useEventBusStore` import
- Added `useAuthStore` import
- Replaced local `useris` ref with `authStore.user`
- Updated template to use `authStore.user` instead of `useris`

#### `src/components/mixins/getAPIdata.js`

- Removed `useEventBusStore` import

### 3. Removed Files

- `src/stores/eventBus.js` - Deleted entirely

## Migration Pattern

### Before (EventBus)

```javascript
import { useEventBusStore } from "../../stores/eventBus";
const eventBus = useEventBusStore();

// Listen to events
eventBus.$on("snack-event", (color, msg) => {
  snackAlert(color, msg);
});

// Emit events
eventBus.$emit("snack-event", color, msg);

// Cleanup
eventBus.$off("snack-event");
```

### After (Pinia)

```javascript
import { useAppStore } from "../../stores/appStore";
const appStore = useAppStore();

// Call actions directly
appStore.showSnackbar(color, msg);

// Or access state directly in template
// {{ appStore.snackbar }}
```

## Benefits

1. **Type Safety**: Better TypeScript support with Pinia
2. **Developer Tools**: Better debugging with Vue DevTools
3. **Performance**: More efficient reactivity system
4. **Maintainability**: Clear separation of concerns with dedicated stores
5. **Testability**: Easier to test with isolated stores
6. **Scalability**: Better structure for future state management needs

## Notes

- All EventBus event handlers have been converted to Pinia store actions
- State is now managed centrally in dedicated stores
- No event listeners needed - direct method calls
- No cleanup needed - Pinia handles state lifecycle automatically
