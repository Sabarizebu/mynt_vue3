# Login Functionality Migration to Pinia

## Overview

This document outlines the migration of login functionality from the event bus pattern (SuperApp-FE-main-2) to Pinia-based state management (superApp_v4).

## Key Changes

### 1. Enhanced Stores

#### authStore.js

- **Added**: `sessionConfig` state for storing session configuration
- **Added**: `setSessionConfig()` action to update session config
- **Added**: `loadFromSharedSession()` for handling shared session tokens (sUserId, sToken)
- **Added**: `setupAuthFromUrl()` for extracting auth params from URL

#### appStore.js

- **Added**: `wsorderalertdata` state for WebSocket order alerts
- **Added**: `orderprefd` state for order preferences
- **Added**: `addWSOrderAlert()` action to add WebSocket order alerts
- **Added**: `getOrderPref()` and `setOrderPref()` actions for order preference management

#### sessionStore.js (NEW)

- **Created**: New store for managing session configuration and API URLs
- **State**:
  - `mynturl` - Mynt API URL configuration
  - `firebaseConfig` - Firebase configuration
  - `source` - API source identifier
- **Actions**:
  - `initializeConfig()` - Initialize configuration from Firebase
  - `updateMyntUrl()` - Update Mynt URL with session data
  - `getSource()` - Get current API source
  - `resetConfig()` - Reset configuration

### 2. Updated LayoutSrc.vue

#### Removed Event Bus Dependencies

- Removed all `eventBus.$on()` listeners
- Removed all `eventBus.$emit()` calls
- Replaced with Pinia store actions and watchers

#### Key Functionality Ported

**Initialization Flow:**

1. Theme detection and initialization
2. Session configuration initialization from Firebase
3. Shared session handling (sUserId, sToken)
4. Regular session handling (uid, token, sess)
5. User session validation via `getActiveSession()`
6. Watchlist layout preference loading
7. Order preferences management
8. Risk disclosure dialog for stocks

**Authentication Flow:**

- `getUserSession()` - Validates active session and configures Mynt URLs
- `getReSession()` - Handles shared session tokens
- `getPublicIP()` - Tracks user's public IP address
- `getCall()` - Handles mobile/Client ID login flow

**UI State Management:**

- Snackbar alerts (converted to appStore)
- Loader states (converted to appStore)
- Alert dialogs (converted to appStore)
- Watchlist layout toggle (converted to appStore)
- Mobile menu state

**WebSocket Integration:**

- WebSocket order alerts stored in appStore
- Alert data persistence in sessionStorage

### 3. Component Integration

#### Pinia Store Usage:

```javascript
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";
import { useNavStore } from "../../stores/navStore";
import { useSessionStore } from "../../stores/sessionStore";

const appStore = useAppStore();
const authStore = useAuthStore();
const navStore = useNavStore();
const sessionStore = useSessionStore();
```

#### Template Bindings:

- `appStore.mainloader` - Main loader visibility
- `appStore.subloader` - Sub loader visibility
- `appStore.snackbar` - Snackbar state
- `appStore.snacktxt` - Snackbar message
- `appStore.snackcolor` - Snackbar color
- `appStore.wsorderalertdata` - WebSocket order alerts
- `appStore.wllayout` - Watchlist layout
- `authStore.uid` - User ID
- `authStore.isAuthenticated()` - Auth status

## Migration Checklist

- ✅ Enhanced authStore with session management
- ✅ Created sessionStore for API configuration
- ✅ Enhanced appStore with order alerts and preferences
- ✅ Replaced all event bus events with Pinia stores
- ✅ Migrated login flow logic
- ✅ Migrated session validation logic
- ✅ Migrated WebSocket order alerts
- ✅ Migrated theme initialization
- ✅ Migrated public IP tracking
- ✅ Fixed template references to use Pinia stores

## Benefits of Migration

1. **Centralized State Management**: All login-related state is now managed through Pinia stores
2. **Better Type Safety**: Store structure provides clear interface for state access
3. **Improved Debugging**: Pinia DevTools support for better debugging
4. **Scalability**: Easier to extend and maintain
5. **Reactive Updates**: Automatic reactivity without manual event management
6. **Testing**: Easier unit testing with isolated stores

## Breaking Changes

- Event bus listeners removed - all components using event bus need to be updated
- Direct store access required - use Pinia stores instead of event bus
- Session management now handled through stores

## Next Steps

1. Update child components that use event bus to use Pinia stores
2. Test all authentication flows
3. Test WebSocket order alerts
4. Test session persistence across page reloads
5. Update any other components that depend on the old event bus pattern
