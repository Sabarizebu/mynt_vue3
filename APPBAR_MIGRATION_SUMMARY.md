# AppBar Migration to Pinia

## Overview

This document outlines the migration of AppBar component from the event bus pattern (SuperApp-FE-main-2) to Pinia-based state management (superApp_v4).

## Key Changes

### 1. Enhanced Stores

#### authStore.js

**Added State:**

- `userdata` - User profile data including client information
- `clientdata` - Client-specific data array
- `loading` - Loading state for profile data fetching

**Added Getters:**

- `useris()` - Check if user is logged in

**Added Actions:**

- `setUserdata(data)` - Set user profile data
- `setClientdata(data)` - Set client-specific data
- `setLoading(value)` - Update loading state

**Updated `clearAuth()`:**

- Now also clears userdata, clientdata, and resets loading state

#### appStore.js

**Added State:**

- `onlinestat` - Internet connectivity status
- `onLinebanner` - Control online/offline banner visibility
- `lowConnection` - Detect slow connection (2g, slow-2g)

**Added Actions:**

- `setConnectionStatus(status)` - Update online status and manage document title
- `setLowConnection(value)` - Set slow connection flag and update title
- `checkConnectionSpeed()` - Check connection speed using Network Information API

### 2. Updated AppBar.vue

#### Removed Event Bus Dependencies

- Removed all `eventBus.$on()` listeners
- Removed all `eventBus.$emit()` calls
- Replaced with Pinia store actions and reactive state

#### Key Functionality Ported

**User Profile Management:**

1. Profile data fetching via `getUserdata()`
2. Encryption/decryption functions for secure data transmission
3. Client data display in user menu
4. Profile data caching in localStorage

**Connection Monitoring:**

1. Real-time internet connectivity detection
2. Connection speed monitoring (2g, slow-2g, 4g)
3. Online/offline banner with automatic title updates
4. Network change event listeners

**User Menu:**

1. Complete user profile card with avatar
2. Quick links to:
   - My Account (external - profile.zebuetrade.com)
   - Reports (external - ledger.zebuetrade.com)
   - Corporate Action (external)
   - Pledge & Unpledge (external)
   - Refer (external)
   - Help & Support (external)
   - Settings (internal route)
   - Logout

**Logout Functionality:**

1. Calls `getDeskLogout()` API
2. Calls `getMyntLogout()` API
3. Clears all storage (sessionStorage, localStorage)
4. Resets auth state
5. Reloads application

**OptionZ Integration:**

1. Special handling for OptionZ route
2. Fetches HighSierra token via `getHsTokenapi()`
3. Generates SSO URL with encrypted token
4. Opens in new window

**Alert Banner:**

1. Shows warning when session is inactive
2. Shows success message when back online
3. Shows error message when offline
4. Shows slow connection warning
5. Auto-dismisses after 3 seconds when back online

### 3. Template Bindings

**Authentication State:**

- `authStore.useris()` - Check if user is logged in
- `authStore.uid` - User ID
- `authStore.token` - User token
- `authStore.clientdata` - Client information
- `authStore.CLIENT_NAME` - Client name for display

**Connection State:**

- `appStore.onlinestat` - Internet connectivity
- `appStore.onLinebanner` - Banner visibility
- `appStore.lowConnection` - Slow connection flag

**Alert State:**

- `appStore.showalert` - Alert banner visibility
- `appStore.showalertmsg` - Alert message content

## Migration Checklist

- ✅ Enhanced authStore with user data management
- ✅ Enhanced appStore with connection monitoring
- ✅ Replaced all event bus events with Pinia stores
- ✅ Migrated user profile fetching
- ✅ Migrated encryption/decryption functions
- ✅ Migrated logout functionality
- ✅ Migrated connection monitoring
- ✅ Added OptionZ integration
- ✅ Added alert banner management
- ✅ Fixed template references to use Pinia stores

## Benefits of Migration

1. **Centralized State Management**: All user and connection state managed through Pinia stores
2. **Reactive Updates**: Automatic UI updates when connection status changes
3. **Better Performance**: Reduced event bus overhead
4. **Improved Debugging**: Pinia DevTools support
5. **Type Safety**: Clear store structure provides interface for state access
6. **Maintainability**: Easier to extend and modify user management features

## Breaking Changes

- Event bus listeners removed - all components using event bus need to be updated
- Direct store access required - use Pinia stores instead of event bus
- Connection monitoring now handled through appStore
- Profile data fetching now handled through authStore

## Key Features

### User Authentication Display

- Shows login button when not authenticated
- Shows user menu with profile when authenticated
- Displays client name and ID
- Shows online/offline status

### Connection Monitoring

- Real-time internet connectivity detection
- Connection speed monitoring
- Automatic banner display for status changes
- Document title updates for status indication

### Profile Management

- Secure encryption/decryption of profile data
- LocalStorage caching for performance
- Client data display in user menu
- External links to profile services

### Logout Flow

1. Calls logout APIs (DeskLogout, MyntLogout)
2. Clears all session data
3. Resets auth state
4. Reloads application to ensure clean state

## Next Steps

1. Test all authentication flows
2. Test connection monitoring
3. Test logout functionality
4. Test OptionZ integration
5. Verify external links open correctly
6. Test profile data caching
