# API Integration Migration Summary

## Overview

Complete migration of getAPIdata.js from SuperApp-FE-main-2 (eventBus) to superApp_v4 (Pinia).

## ✅ Key Changes Made

### 1. Event Bus Removal

**Before:**

```javascript
import eventBus from "../../eventBus";
eventBus.$emit("snack-event", 2, data.emsg);
eventBus.$emit("tempdata-update", holdingsdata);
```

**After:**

```javascript
import { useAppStore } from "../../stores/appStore";
const store = getAppStore();
store.showSnackbar(2, data.emsg);
window.dispatchEvent(
  new CustomEvent("tempdata-update", { detail: holdingsdata })
);
```

### 2. All API Functions Migrated

#### Authentication APIs

- ✅ `getActiveSession()` - Validate active session
- ✅ `getReSession()` - Reconnect shared session
- ✅ `getValidSession()` - Validate session key
- ✅ `getcallApi()` - Mobile login
- ✅ `getProfiledata()` - Get user profile
- ✅ `getDeskLogout()` - Logout from desk
- ✅ `getMyntLogout()` - Logout from Mynt
- ✅ `getKambalaAuth()` - Kambala authentication
- ✅ `getHsTokenapi()` - Get HighSierra token
- ✅ `getLoggedIn()` - Get logged in sessions
- ✅ `getToken()` - Get session token

#### Trading APIs

- ✅ `getPlaceOrder()` - Place order (CNC/LMT/DAY)
- ✅ `getMOrderbook()` - Get order book
- ✅ `getMTradebook()` - Get trade book
- ✅ `getSingleorderbook()` - Get single order
- ✅ `getSIPOrderset()` - Place SIP order
- ✅ `getGTTPlaceOrder()` - Place GTT order
- ✅ `getGttorderbook()` - Get GTT order book
- ✅ `setCancelGTT()` - Cancel GTT order
- ✅ `setMalert()` - Set/modify/cancel alert

#### Portfolio APIs

- ✅ `getMHoldings()` - Get holdings
- ✅ `getMMHoldings()` - Get MF holdings
- ✅ `getMPosotion()` - Get positions
- ✅ `getMPosotionCon()` - Product conversion
- ✅ `getMHoldingdata()` - Get cached holdings

#### Quote & Market Data APIs

- ✅ `getQuotesdata()` - Get quotes
- ✅ `getMFQuotesdata()` - Get MF quotes
- ✅ `getQuotedata()` - Get quote data
- ✅ `getOptionschain()` - Get options chain
- ✅ `getSecuritydata()` - Get security info
- ✅ `getTechnicals()` - Get technical data
- ✅ `getLinkedScrips()` - Get linked scripts
- ✅ `getOrderMargin()` - Get order margin
- ✅ `getBSKMargin()` - Get basket margin
- ✅ `getBrokerage()` - Get brokerage

#### Account & Limits APIs

- ✅ `getMLimits()` - Get limits
- ✅ `getClientDetails()` - Get client details
- ✅ `getUserDetails()` - Get user details
- ✅ `getApikeyreq()` - Request API key
- ✅ `getUserApikeyreq()` - Get user API key
- ✅ `getTotpreq()` - Get secret key
- ✅ `getEXPosition()` - Get exchange position
- ✅ `getOIbars()` - Get OI bars

#### Mutual Fund APIs

- ✅ `getMFalldata()` - Get all MF data
- ✅ `getnewBestMF()` - Get best MF baskets
- ✅ `gettopfirstapi()` - Get top schemes
- ✅ `getnewcatgreapi()` - Get category schemes
- ✅ `getBestMF()` - Get best MF
- ✅ `getMFmandate()` - Get mandate details
- ✅ `getMFAddmandate()` - Add mandate
- ✅ `getMFsipvalue()` - Get SIP value
- ✅ `getMFlumsum_order()` - Get lumpsum order
- ✅ `getmfsipnewapi()` - Get SIP (active)
- ✅ `getmfsipnewapihisty()` - Get SIP (history)
- ✅ `getMFholdings()` - Get MF holdings
- ✅ `getMFBankdetails()` - Get bank details
- ✅ `getMFwatchlist()` - Get MF watchlist
- ✅ `getMFnofdata()` - Get NFO data
- ✅ `getMFsheetdata()` - Get fact sheet
- ✅ `getMFNAVchart()` - Get NAV chart
- ✅ `getMFSchemePeers()` - Get scheme peers
- ✅ `getMFsheetchart()` - Get fact sheet chart
- ✅ `getMFrollschart()` - Get rolling returns
- ✅ `getXsiporder()` - Get child order
- ✅ `getMFcancellum()` - Cancel lumpsum
- ✅ `getMFcancelxsip()` - Cancel XSIP
- ✅ `getMFcancelation()` - Get cancel reasons
- ✅ `getmfpauseapi()` - Pause SIP
- ✅ `getMFplaceoredr()` - Place MF order
- ✅ `getMFallpayments()` - Get all payments
- ✅ `getsendpaymentrequt()` - Send payment request
- ✅ `getcheckpaystatus()` - Check payment status
- ✅ `mastermfapi()` - MF master data

#### Bonds APIs

- ✅ `getBondGsec()` - Get G-SEC
- ✅ `getBondTbill()` - Get T-Bill
- ✅ `getBondSdl()` - Get SDL
- ✅ `getBondSgb()` - Get SGB
- ✅ `getBondOrder()` - Place bond order
- ✅ `getBondLedger()` - Get bond ledger
- ✅ `getBondbook()` - Get NCB order book
- ✅ `getBondsgbbook()` - Get SGB order book

#### IPOs APIs

- ✅ `getIposIpo()` - Get IPO list
- ✅ `getIposPerform()` - Get IPO performance
- ✅ `getIposSme()` - Get SME IPO list
- ✅ `getIposbook()` - Get IPO order book
- ✅ `getIposorders()` - Get IPO orders
- ✅ `getIposorder()` - Place IPO order

#### Collections APIs

- ✅ `getCollections()` - Get collections
- ✅ `getCollsingledata()` - Get single basket
- ✅ `getCollchartdata()` - Get chart data
- ✅ `getCollstockdata()` - Get stock data
- ✅ `getCollLtpdata()` - Get LTP data
- ✅ `getCollplaceorder()` - Place collection order

#### Market Data APIs

- ✅ `getssNews()` - Get news
- ✅ `getCorporateact()` - Get corporate actions
- ✅ `getssDetails()` - Get stock details
- ✅ `getSectordata()` - Get sector data
- ✅ `getIndexList()` - Get index list
- ✅ `getTopList()` - Get top list
- ✅ `getConTentList()` - Get content list
- ✅ `getADindices()` - Get advance/decline indices
- ✅ `getADindice()` - Get specific index A/D
- ✅ `getHLbreakers()` - Get 52-week H/L breakers
- ✅ `getGreekoptions()` - Get option Greeks
- ✅ `getOIbars()` - Get OI bars

#### Other APIs

- ✅ `getMwatchlistset()` - Watchlist operations
- ✅ `getGloabSearch()` - Global search
- ✅ `getKambalaSearch()` - Kambala search
- ✅ `getInvHoldings()` - Investment holdings
- ✅ `getFundsupis()` - Fund UPI IDs
- ✅ `getUpivpa()` - Check UPI VPA
- ✅ `getLtpdata()` - Get LTP data
- ✅ `getPostPnL()` - Post P&L
- ✅ `setIndicators()` - Set indicators
- ✅ `getIndicators()` - Get indicators
- ✅ `getPreDefinedMW()` - Get predefined MW
- ✅ `getMasters()` - Get master data

### 3. Data Caching

Maintains in-memory caching for:

- `holdingsdata` - Holdings cache
- `positiondata` - Positions cache
- `ordersdata` - Orders cache
- `clientdetails` - Client details cache
- `orderprefdata` - Order preferences cache
- `sllmasters` - Masters cache

### 4. Encryption Functions

- ✅ `seteEcryption()` - Encrypt data
- ✅ `setDecryption()` - Decrypt data

### 5. Helper Functions

- ✅ `fetchMyntAPI()` - Main API fetch function
- ✅ `fetchMyntjson()` - JSON fetch function
- ✅ `FetchsearchData()` - Search data fetch
- ✅ `saveApiLog()` - Save API logs
- ✅ `getDateOnly()` - Extract date from timestamp
- ✅ `setHeaderauth()` - Set auth headers
- ✅ `seyCheckwebsocket()` - Check WebSocket session

## Event Handling Migration

### Before (Event Bus)

```javascript
eventBus.$emit("snack-event", 2, "Error message");
eventBus.$emit("tempdata-update", data);
```

### After (Pinia + Custom Events)

```javascript
const store = getAppStore();
store.showSnackbar(2, "Error message");
window.dispatchEvent(new CustomEvent("tempdata-update", { detail: data }));
```

## API Request Flow

### Standard Flow

1. Set request body in `requestOptions` or `requestMOption`
2. Call `fetchMyntAPI(path, requestOptions)`
3. Response is parsed and returned
4. Error handling with automatic snackbar notifications
5. API logs saved to localStorage

### Special Headers

- **Auth Headers**: Automatically added via `setHeaderauth()`
- **Content-Type**: Set to JSON or text/plain
- **Custom Headers**: Added per API requirement

## Error Handling

### Session Expired

- Automatically detected in `fetchMyntAPI()`
- Shows snackbar notification via `store.showSnackbar()`
- Handles 401 errors gracefully

### API Logging

- All API calls logged to localStorage
- Format: `{status} || t: {requestTime} - {responseTime} || {path} || m: {message}`
- Logs organized by date

## Integration Points

### LayoutSrc.vue

- Uses `getActiveSession()` for session validation
- Uses `seyCheckwebsocket()` for WebSocket initialization
- Uses `setOrdprefApi()` for order preferences
- Uses `getcallApi()` for mobile login

### AppBar.vue

- Uses `getProfiledata()` for user profile
- Uses `getDeskLogout()` and `getMyntLogout()` for logout

### WebSocket Integration

- Uses session validation for connection
- Tracks API logs for debugging

## File Size Comparison

**SuperApp-FE-main-2:** ~1,184 lines  
**superApp_v4:** ~900 lines (removed eventBus dependencies, more efficient)

## Benefits

1. **Centralized State Management** - All notifications go through Pinia
2. **Better Type Safety** - Clear store interfaces
3. **Improved Debugging** - Pinia DevTools support
4. **No Event Bus Overhead** - Direct store actions
5. **Easier Testing** - Isolated API functions
6. **Better Error Handling** - Consistent error flow

## Testing Checklist

- ✅ Authentication APIs
- ✅ Trading APIs
- ✅ Portfolio APIs
- ⏳ Market Data APIs
- ⏳ MF APIs
- ⏳ Bonds APIs
- ⏳ IPO APIs
- ⏳ Collections APIs
- ⏳ WebSocket integration
- ⏳ Error handling
- ⏳ Session management

## Next Steps

1. Test all API calls individually
2. Verify WebSocket integration
3. Test error handling scenarios
4. Verify session management
5. Test order placement flow
6. Verify real-time data updates
