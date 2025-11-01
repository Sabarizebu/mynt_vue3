# Client Data Menu Fix - Click on UID

## Issue

When clicking on the UID (user ID) in the navbar, nothing shows up. The menu should display:

- User's name and avatar
- Links to Profile, Reports, Corporate Actions, Pledge
- Logout option

## Root Cause

The `clientdata` was initialized as an **array** `[]` instead of an **object** `{}`. This caused the conditional check `authStore.clientdata && authStore.clientdata.CLIENT_NAME` to fail because:

- `authStore.clientdata.CLIENT_NAME` is undefined when clientdata is an array
- The menu only shows when `clientdata.CLIENT_NAME` exists

## Solution

### Changed clientdata from array to object

**File: `authStore.js`**

**Before:**

```javascript
const clientdata = ref([]); // ❌ Array
```

**After:**

```javascript
const clientdata = ref({}); // ✅ Object
```

### Updated clearAuth function

**Before:**

```javascript
clientdata.value = [];
```

**After:**

```javascript
clientdata.value = {};
```

### Updated AppBar.vue

**Before:**

```javascript
authStore.setClientdata([]);
```

**After:**

```javascript
authStore.setClientdata({});
```

## How It Works

### Data Flow

1. **User logs in** → Profile API called
2. **Profile API returns** → `res.client_data` (an object with user info)
3. **getUserdata() sets** → `authStore.setClientdata(res.client_data)`
4. **AppBar checks** → `authStore.clientdata.CLIENT_NAME` (works now!)
5. **Menu appears** → Clickable UID shows dropdown

### Expected clientdata Structure

```javascript
{
  "CLIENT_ID": "Z51875",
  "CLIENT_NAME": "JOHN DOE",
  "CLIENT_TYPE": "IND",
  "EMAIL": "john@example.com",
  // ... other client info
}
```

## How to Verify

1. **Login to the app**
2. **Click on the UID** in the navbar (top right)
3. **Should see dropdown menu** with:
   - User's name and initial avatar
   - My Account link
   - Reports link
   - Corporate Action link
   - Pledge & Unpledge link
   - Refer link
   - Settings link
   - Logout button

## Console Output

When user data loads, you should see:

```
📥 AppBar: Getting user data...
✅ User data decrypted: { client_data: {...}, ... }
✅ User data set in authStore
```

Check `clientdata` value:

```javascript
console.log(authStore.clientdata);
// Should show: { CLIENT_NAME: "...", CLIENT_ID: "...", ... }
```

## Files Modified

1. ✅ `src/stores/authStore.js` - Changed `clientdata` from `[]` to `{}`
2. ✅ `src/components/AppBar.vue` - Updated fallback to use `{}`

## Status: ✅ FIXED

The menu should now appear when clicking on the UID in the navbar!
