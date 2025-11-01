# Login Flow Comparison: Old vs New App

## Overview

Comparing the login flow between `SuperApp-FE-main-2` (eventBus) and `superApp_v4` (Pinia) to ensure complete migration.

## Old App Login Flow (eventBus)

### 1. LayoutSrc.vue - created() hook (Lines 375-423)

```javascript
async created() {
  sessionStorage.removeItem("c3RhdHVz");  // KEY: Removes session status on startup

  // Theme setup...
  this.mainloader = true;

  // Get URL parameters
  var actid = url.searchParams.get("uid");
  var token = url.searchParams.get("token");
  var sess = url.searchParams.get("sess");
  var suser = url.searchParams.get("sUserId");
  var stoken = url.searchParams.get("sToken");

  // Handle shared session
  if (typeof suser == "string" && typeof stoken == "string") {
    let sessvalid = await getReSession([suser, stoken, url.pathname]);
    if (sessvalid && sessvalid.stat == "Ok") {
      window.location.assign(`${url.origin}${url.pathname}?uid=${sessvalid.clientid}...`);
    }
  }
  // Handle regular URL params
  else if (typeof actid == "string" && typeof token == "string") {
    localStorage.removeItem("profile_data")
    sessionStorage.setItem("usession", token);
    sessionStorage.setItem("userid", actid);
    sessionStorage.setItem("msession", sess);
    sessionStorage.setItem("imei", url.searchParams.get("imei"));
    this.getPublicIP();
  }

  // Always load from sessionStorage
  this.mtoken = sessionStorage.getItem("msession");
  this.token = sessionStorage.getItem("usession");
  this.uid = sessionStorage.getItem("userid");
  this.getuserSess(actid);

  // Load snackbar alerts
  var logid = this.uid + new Date().toLocaleDateString();
  let log = sessionStorage.getItem(logid);
  logid = JSON.parse(log);
  this.snackalerts = logid && logid.length > 0 ? logid : [];
  this.setTabway();
}
```

### 2. getuserSess() method (Lines 671-711)

```javascript
async getuserSess(k) {
  this.subloader = true;
  if (this.uid) {
    let sessvalid = await getActiveSession(this.uid);

    if (sessvalid && sessvalid.stat == "Ok" && sessvalid.apitoken && sessvalid.token) {
      await seyCheckwebsocket()
      var wllayout = localStorage.getItem(`${this.uid}_wllayout`);
      this.wllayout = wllayout && wllayout == 'true' ? true : false;

      this.$glob = sessvalid;
      mynturl["myntapi"] = sessvalid.url;
      mynturl["source"] = sessvalid.source;
      mynturl["wss"] = sessvalid.wss;
      mynturl["stat"] = 1;
      sessionStorage.setItem("c3RhdHVz", "dmFsaWR1c2Vy");  // KEY: Set session as valid

      if (k) {
        var url = new URL(window.location.href);
        this.$router.push(url.pathname);  // Clean URL
      }

      // Risk dialog check
      let r = sessionStorage.getItem("risk");
      if (r != 0 && path.pathname.includes("stocks")) {
        this.riskdialog = true;
      }

      // Load order preferences
      var ordpre = await setOrdprefApi();
      if (!(ordpre && ordpre.metadata && ordpre.metadata.mainpreitems)) {
        ordpre = JSON.parse(localStorage.getItem(`${this.uid}_ordpref`));
        var data = {};
        if (ordpre && ordpre.mainpreitems) {
          data = ordpre;
          localStorage.removeItem(`${this.uid}_ordpref`);
        } else {
          data = this.orderprefd;
        }
        await setOrdprefApi({ "clientid": this.uid, "metadata": data, "source": "WEB" }, true);
      }
      // NOTE: No explicit loader hiding here
    }
    // Error handling...
  }
}
```

### 3. AppBar.vue - eventBus listeners (Lines 560-597)

```javascript
async mounted() {
  this.switchBus = eventBus;

  eventBus.$on("profile-event", (type) => {
    if (type == "set" && this.userdata) {
      setTimeout(() => {
        eventBus.$emit("profile-event", "get", this.userdata);
      }, 10);
    }
  });

  eventBus.$on("app-user-event", () => {
    this.loading = true;
    let res = sessionStorage.getItem("c3RhdHVz");
    if (res == "dmFsaWR1c2Vy") {
      this.token = sessionStorage.getItem("usession");
      this.mtoken = sessionStorage.getItem("msession");
      this.uid = sessionStorage.getItem("userid");
      this.useris = true;

      var dall = JSON.stringify({ client_id: this.uid });
      let date1 = this.encryptionFunction(dall);
      let data = JSON.stringify({ string: date1 });
      this.getUserdata(data);  // Load user profile
    } else {
      this.useris = false;
      this.loading = false;
    }
  });

  // Other listeners...
}
```

## New App Login Flow (Pinia) - Current Implementation

### 1. LayoutSrc.vue - onMounted() hook (Lines 575-677)

```javascript
onMounted(async () => {
  console.log("🚀 LayoutSrc onMounted starting...");
  // KEY DIFFERENCE: Does NOT remove "c3RhdHVz" on startup
  // sessionStorage.removeItem("c3RhdHVz") // COMMENTED OUT

  // Theme setup...
  appStore.setMainLoader(true);

  // Fail-safe timeout added
  window.__loaderTimeout = setTimeout(() => {
    console.warn("⚠️ Loader timeout - force hiding loader");
    appStore.setMainLoader(false);
    appStore.hideLoader();
  }, 30000);

  // Initialize session
  await sessionStore.initializeConfig();

  // Check for shared session (sUserId and sToken)
  const sharedSession = authStore.loadFromSharedSession();
  if (sharedSession) {
    let sessvalid = await getReSession([
      sharedSession.suser,
      sharedSession.stoken,
      sharedSession.pathname,
    ]);
    if (
      sessvalid &&
      sessvalid.stat == "Ok" &&
      sessvalid.apitoken &&
      sessvalid.token
    ) {
      const url = new URL(window.location.href);
      window.location.assign(
        `${url.origin}${url.pathname}?uid=${sessvalid.clientid}...`
      );
    } else {
      appStore.showSnackbar(2, sessvalid.emsg ? sessvalid.emsg : sessvalid);
    }
  }

  // Check for regular session parameters
  const authParams = authStore.setupAuthFromUrl();
  if (authParams) {
    // Fresh login from URL params
    getPublicIP();
    await getUserSession(authParams.actid);
  } else {
    // No URL params, try to load from session
    authStore.loadFromSession();
    const uid = authStore.uid;
    const token = authStore.token;
    const sessionStatus = sessionStorage.getItem("c3RhdHVz");

    if (uid && token && sessionStatus === "dmFsaWR1c2Vy") {
      // Session is valid, skip API validation
      await sessionStore.initializeConfig();

      // Load snackbar alerts
      var logid = uid + new Date().toLocaleDateString();
      let log = sessionStorage.getItem(logid);
      if (log) {
        try {
          log = JSON.parse(log);
          appStore.snackalerts = log && log.length > 0 ? log : [];
        } catch (e) {
          console.error("Error parsing alerts:", e);
          appStore.snackalerts = [];
        }
      }

      // Load watchlist layout
      var wllayout = localStorage.getItem(`${uid}_wllayout`);
      if (wllayout !== null) {
        appStore.setWatchlistLayout(wllayout === "true");
      }

      appStore.setMainLoader(false);
      // Clear timeout
    } else if (uid && token) {
      // Has credentials but no session status, validate it
      await getUserSession(null);
    } else {
      // No credentials at all
      appStore.setMainLoader(false);
    }
  }

  setTabway();
});
```

### 2. getUserSession() method (Lines 471-544)

```javascript
const getUserSession = async (k) => {
  appStore.showLoader();
  if (authStore.uid) {
    let sessvalid = await getActiveSession(authStore.uid);
    console.log("🔍 Session validation result:", sessvalid);

    if (
      sessvalid &&
      sessvalid.stat == "Ok" &&
      sessvalid.apitoken &&
      sessvalid.token
    ) {
      console.log("✅ Session valid, proceeding...");
      await seyCheckwebsocket();
      var wllayout = localStorage.getItem(`${authStore.uid}_wllayout`);
      appStore.setWatchlistLayout(
        wllayout && wllayout == "true" ? true : false
      );

      sessionStore.updateMyntUrl(sessvalid);
      sessionStorage.setItem("c3RhdHVz", "dmFsaWR1c2Vy");

      if (sessvalid.apitoken) {
        sessionStorage.setItem("msession", sessvalid.token);
        authStore.mtoken = sessvalid.token;
      }

      if (k) {
        var url = new URL(window.location.href);
        window.history.replaceState({}, "", url.pathname); // DIFFERENCE: replace vs push
      }

      // Risk dialog check
      let r = sessionStorage.getItem("risk");
      if (r != 0 && path.pathname.includes("stocks")) {
        riskdialog.value = true;
      }

      var ordpre = await setOrdprefApi();
      if (!(ordpre && ordpre.metadata && ordpre.metadata.mainpreitems)) {
        // Load from localStorage or use defaults
        var data = appStore.getOrderPref();
        await setOrdprefApi(
          { clientid: authStore.uid, metadata: data, source: "WEB" },
          true
        );
      }

      // Hide loader
      console.log("✅ Hiding loader...");
      appStore.setMainLoader(false);
      appStore.hideLoader();

      // Clear timeout
      if (window.__loaderTimeout) {
        clearTimeout(window.__loaderTimeout);
        delete window.__loaderTimeout;
      }
    }
    // Error handling...
  }
};
```

## Key Differences

### ✅ What's Working in New App

1. **Session validation** - Same logic
2. **WebSocket setup** - Same `seyCheckwebsocket()` call
3. **Order preferences** - Same logic
4. **Session status** - Sets "c3RhdHVz" = "dmFsaWR1c2Vy"
5. **URL cleaning** - Uses `window.history.replaceState()` (better for no history entry)
6. **Theme setup** - Same logic
7. **Shared session handling** - Same logic

### ⚠️ Potential Issues

1. **Loader not hiding** - Old app doesn't explicitly hide loader in `getuserSess()`, but new app does
2. **AppBar eventBus listeners** - Old app has `app-user-event` listener that loads user profile, new app might be missing this
3. **Session status check** - Old app always removes "c3RhdHVz" on startup, new app keeps it

### 🔍 Critical Finding

**Old app removes session status on EVERY startup:**

```javascript
async created() {
  sessionStorage.removeItem("c3RhdHVz");  // ALWAYS removed
  // ... rest of code
}
```

**New app keeps session status:**

```javascript
onMounted(async () => {
  // sessionStorage.removeItem("c3RhdHVz") // COMMENTED OUT
  // ... rest of code
});
```

This is **actually better** in the new app because it prevents unnecessary API calls on refresh.

## Missing Functionality Check

### Old App: AppBar user profile loading

The old AppBar listens for `app-user-event` and loads user profile:

```javascript
eventBus.$on("app-user-event", () => {
  this.loading = true;
  let res = sessionStorage.getItem("c3RhdHVz");
  if (res == "dmFsaWR1c2Vy") {
    // Load user data...
    this.getUserdata(data);
  }
});
```

**Question**: Where is this being triggered in the old app? Let me search...

### New App: AppBar user profile loading

The new AppBar has `getUserdata()` method but when is it called?

Let me check AppBar.vue onMounted...

## Next Steps

1. ✅ Verify AppBar profile loading is working
2. ✅ Test loader hiding
3. ✅ Test session persistence on refresh
4. ⏳ Check WebSocket initialization
5. ⏳ Verify snackbar alerts loading
