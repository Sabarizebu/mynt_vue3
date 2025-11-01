# User Menu Debugging

## Issue

Clicking on the UID in navbar doesn't show the menu.

## Changes Made

### 1. Changed clientdata from Array to Object

- `authStore.js`: `const clientdata = ref({})` instead of `ref([])`
- This is necessary because API returns object, not array

### 2. Added Debug Logging

Added console logs to track when clientdata is being set:

- In `getUserdata()` function
- Shows what `res.client_data` contains
- Shows what gets set in authStore

### 3. Added Computed Property

Added `showUserMenu` computed property that logs the state:

- Shows if clientdata exists
- Shows if CLIENT_NAME exists
- Logs the full clientdata object

## What to Check in Console

When you login and the app loads, you should see:

```
📥 AppBar: Getting user data...
✅ User data decrypted: { client_data: {...}, ... }
📋 client_data: { CLIENT_NAME: "...", CLIENT_ID: "...", ... }
✅ Setting clientdata with: { CLIENT_NAME: "...", CLIENT_ID: "...", ... }
✅ User data set in authStore
✅ clientdata.CLIENT_NAME: "JOHN DOE"
✅ clientdata.CLIENT_ID: "Z51875"
✅ Setting loading to false
```

And in the computed property:

```
🎯 showUserMenu: {
  hasClientData: true,
  hasClientName: "JOHN DOE",
  clientdata: { CLIENT_NAME: "...", ... },
  CLIENT_NAME: "JOHN DOE"
}
```

## Expected Behavior

1. User logs in
2. Profile API called
3. User data loaded
4. `clientdata` set in authStore
5. `showUserMenu` becomes `true`
6. UID button appears in navbar
7. Clicking UID opens dropdown menu

## If Menu Still Doesn't Show

Check console for:

1. Is `hasClientData` true?
2. Is `hasClientName` defined?
3. What is the value of `clientdata`?

## Next Steps

1. Open browser console
2. Login to the app
3. Look for the debug logs above
4. Share the console output so we can see what's in clientdata
