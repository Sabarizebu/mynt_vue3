# Stock Monitor Table Migration Plan - Vue 3 + Vuetify 3 + Pinia

## Overview
This document outlines the plan to migrate the Stock Monitor table from the old Vue 2 app to the new Vue 3 app using Vuetify 3 and Pinia, maintaining all original functionality and behavior.

## Current State Analysis

### Old App (Vue 2) Implementation

**File**: `SuperApp-FE-main-2/src/views/Dashboard/stocks/StocksSrc.vue`

#### Key Features:
1. **Table Structure** (Lines 325-407):
   - `v-card` container with toolbar
   - Two filter dropdowns (`screent0` and `screent1`)
   - `v-data-table` with 7 columns: Symbol, Price, Open, High, Low, Close, Volume
   - Sorting by `chp` (change percentage) descending
   - Fixed header, mobile breakpoint
   - Loading state
   - Empty state handling
   - "See all" button to navigate to screener page

2. **Data Structure** (Lines 710-728):
   ```javascript
   screent0item: [
     { text: "VolUpPriceUp", value: "VolUpPriceUp" },
     { text: "VolUpPriceDown", value: "VolUpPriceDown" },
     // ... more items
   ],
   screent0: "VolUpPriceUp",
   screent1item: [
     { text: "All", value: "A" },
     { text: "Nifty 50", value: "NIFTY50" },
     // ... more items
   ],
   screent1: "A",
   screentitems: [],
   screentidata: true,
   ```

3. **Table Headers** (Lines 791-801):
   ```javascript
   screenheader() {
     return [
       { text: "Symbol", value: "tsym", sortable: false, class: "ws-p" },
       { text: "Price", value: "ltp", sortable: false, align: "right", class: "ws-p" },
       { text: "Open", value: "op", align: "right", class: "ws-p" },
       { text: "High", value: "high", align: "right", class: "ws-p" },
       { text: "Low", value: "low", align: "right", class: "ws-p" },
       { text: "Close", value: "cp", align: "right", class: "ws-p" },
       { text: "Volume", value: "vol", align: "right", class: "ws-p" },
     ];
   }
   ```

4. **API Call** (Lines 982-996):
   ```javascript
   async getContentlistdata(change) {
     if (change == "yes" && this.uid) {
       this.setWebsocket("unsub-D", this.screentitems, "sc");
     }
     this.issloading = true;
     this.screentitems = [];
     let data = await getConTentList(["NSE", this.screent1, this.screent0]);
     if (data && data.length > 0) {
       this.screentitems = data.slice(0, 10);
       if (this.uid) {
         this.setWebsocket("sub", data, "sc");
       }
     }
     this.screentidata = false;
     this.issloading = false;
   }
   ```

5. **WebSocket Updates** (Lines 941-959):
   ```javascript
   setScrpitCH(x, i, a, l) {
     if (a == "SCR") {
       let f = this.screentitems.findIndex((o) => o.token == i.token);
       this.screentitems[f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0;
       this.screentitems[f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0;
     }
   }
   ```

6. **Table Slots** (Lines 344-380):
   - `item.tsym`: Clickable symbol with navigation
   - `item.ltp`: Price with change and change percentage
   - `item.vol`: Volume
   - `item.op`: Open price
   - `item.cp`: Close price
   - `item.high`: High price
   - `item.low`: Low price
   - `no-data`: Empty state with click to load

### New App (Vue 3) Current State

**File**: `superApp_v4/src/views/Dashboard/stocks/StocksSrc.vue`

#### Current Implementation:
- Has basic table structure (Lines 378-468)
- Has filter dropdowns (Lines 383-393)
- Has table headers (Lines 826-836)
- Has API call function (needs verification)
- Has WebSocket integration (needs verification)
- Missing some features or not fully migrated

## Implementation Plan

### Phase 1: Verify and Fix Table Structure

**File**: `superApp_v4/src/views/Dashboard/stocks/StocksSrc.vue`

#### Tasks:
1. **Verify Table Component**:
   - Ensure `v-data-table` uses Vuetify 3 syntax
   - Check `must-sort`, `sort-by`, `sort-desc` props
   - Verify `mobile-breakpoint` → `mobile` prop
   - Verify `fixed-header` prop
   - Verify `hide-default-footer` prop
   - Verify `items-per-page` prop

2. **Verify Table Headers**:
   - Ensure headers match old app exactly
   - Verify alignment (right for numeric columns)
   - Verify `sortable: false` for all columns
   - Verify `class: "ws-p"` for all columns

3. **Verify Filter Dropdowns**:
   - Ensure `v-select` uses Vuetify 3 syntax
   - Verify `item-title` and `item-value` (Vue 3)
   - Verify `@update:model-value` (Vue 3)
   - Verify styling matches old app

### Phase 2: Verify and Fix Data Management

#### Tasks:
1. **Verify Reactive State**:
   - Ensure `screentitems` is `ref([])`
   - Ensure `screent0` and `screent1` are `ref()`
   - Ensure `issloading` is `ref(false)`
   - Ensure `screentidata` is `ref(true)`

2. **Verify API Integration**:
   - Ensure `getConTentList` is imported correctly
   - Verify API call parameters: `["NSE", screent1.value, screent0.value]`
   - Verify data slicing: `data.slice(0, 10)`
   - Verify error handling

3. **Verify Filter Options**:
   - Ensure `screent0item` matches old app exactly
   - Ensure `screent1item` matches old app exactly
   - Verify default values

### Phase 3: Verify and Fix WebSocket Integration

#### Tasks:
1. **Verify WebSocket Subscription**:
   - Ensure subscription on data load: `setWebsocket("sub", data, "sc")`
   - Ensure unsubscription on filter change: `setWebsocket("unsub-D", screentitems.value, "sc")`
   - Verify WebSocket event handling

2. **Verify WebSocket Updates**:
   - Ensure `handleWebSocketUpdate` processes "sc" data
   - Verify token matching logic
   - Verify data field mapping:
     - `lp` → `ltp`
     - `c` → `cp` (close)
     - `ch` → `ch` (change)
     - `chp` → `chp` (change percentage)
     - `v` → `vol` (volume)
     - `ap` → `op` (open)
     - `h` → `high`
     - `l` → `low`

3. **Verify Real-time Updates**:
   - Ensure DOM updates for all fields
   - Verify color changes based on `ch` value
   - Verify reactivity with Vue 3

### Phase 4: Verify and Fix Table Slots

#### Tasks:
1. **Verify Symbol Slot**:
   - Ensure clickable symbol
   - Verify navigation: `setSinglestock(item.tsym.split('-')[0], item)`
   - Verify styling: `font-weight-medium text-capitalize txt-dec-cust ws-p`

2. **Verify Price Slot**:
   - Ensure price display: `₹{ltp}`
   - Ensure change display: `{ch} ({chp}%)`
   - Verify color classes based on `ch` value
   - Verify DOM IDs: `ssdsc${item.token}ltp`, `ssdsc${item.token}ch`, `ssdsc${item.token}chp`, `ssdsc${item.token}chpclr`

3. **Verify Other Slots**:
   - Verify Open slot: `ssdsc${item.token}op`
   - Verify Close slot: `ssdsc${item.token}cp`
   - Verify High slot: `ssdsc${item.token}high`
   - Verify Low slot: `ssdsc${item.token}low`
   - Verify Volume slot: `item.v`

4. **Verify Empty State**:
   - Ensure "Click to load" state when `screentidata === true`
   - Ensure "No data" state when `screentidata === false`
   - Verify styling matches old app

### Phase 5: Verify and Fix Navigation

#### Tasks:
1. **Verify "See All" Button**:
   - Ensure button shows when `screentitems.length > 0`
   - Verify navigation: `to="/stocks/screener"`
   - Verify disabled state: `:disabled="issloading"`
   - Verify styling matches old app

2. **Verify Symbol Click Navigation**:
   - Ensure `setSinglestock` function works correctly
   - Verify navigation to stock details page

### Phase 6: Verify and Fix Styling

#### Tasks:
1. **Verify Card Styling**:
   - Ensure border: `border: thin solid var(--outline) !important`
   - Verify `rounded-lg` class
   - Verify `color="cardbg"`

2. **Verify Toolbar Styling**:
   - Ensure icon: `@/assets/stocks/srcm.svg`
   - Verify title: "Stock monitor"
   - Verify filter dropdowns styling

3. **Verify Table Styling**:
   - Ensure `rounded-lg` class
   - Verify `overflow-y-auto` class
   - Verify spacing and padding

## Detailed Implementation Steps

### Step 1: Verify Table Structure

```vue
<v-card style="border: thin solid var(--outline) !important" variant="outlined" class="rounded-lg mb-8" color="cardbg">
    <v-toolbar ref="smcp" id="smcp" class="elevation-0 my-4" density="compact" color="transparent">
        <img width="40px" src="@/assets/stocks/srcm.svg" alt="srcm" class="mr-2" />
        <p class="title font-weight-bold mb-0">Stock monitor</p>
        <v-spacer></v-spacer>
        <v-select 
            v-model="screent0" 
            :items="screent0item" 
            item-title="text" 
            item-value="value"
            label="Condition" 
            variant="flat" 
            density="comfortable" 
            hide-details 
            menu-icon="mdi-chevron-down"
            :readonly="issloading" 
            class="rounded-pill mr-3 d-none d-sm-flex"
            style="max-width: 180px; background-color: #F1F3F8;"
            @update:model-value="getContentlistdata('yes')" />
        <v-select 
            v-model="screent1" 
            :items="screent1item" 
            item-title="text" 
            item-value="value"
            label="Condition" 
            variant="flat" 
            density="comfortable" 
            hide-details 
            menu-icon="mdi-chevron-down"
            :readonly="issloading" 
            class="rounded-pill d-none d-sm-flex"
            style="max-width: 140px; background-color: #F1F3F8;"
            @update:model-value="getContentlistdata('yes')" />
    </v-toolbar>

    <v-data-table 
        must-sort 
        :sort-by="['chp']" 
        mobile 
        :sort-desc="[true]" 
        hide-default-footer 
        fixed-header
        :loading="issloading" 
        class="rounded-lg overflow-y-auto" 
        :headers="screenheader" 
        :search="opensearch"
        :items="screentitems" 
        :items-per-page="10">
        <!-- Slots will be added in next step -->
    </v-data-table>
    
    <v-divider></v-divider>
    <v-btn 
        v-if="screentitems && screentitems.length > 0" 
        :disabled="issloading" 
        to="/stocks/screener" 
        block
        text 
        class="text-none primary--text" 
        height="48px">
        See all
    </v-btn>
</v-card>
```

### Step 2: Add Table Slots

```vue
<template v-slot:[`item.tsym`]="{ item }">
    <span 
        @click="setSinglestock(item.tsym.split('-')[0], item)"
        class="font-weight-medium text-capitalize txt-dec-cust ws-p" 
        v-text="item.tsym">
    </span>
</template>

<template v-slot:[`item.ltp`]="{ item }">
    <p class="mb-0 lh-18">
        <span class="d-none" v-if="!uid">{{ setScrpitCH("", item, "SCR") }}</span>
        <span class="font-weight-medium maintext--text">
            ₹<span :id="`ssdsc${item.token}ltp`" v-text="item.lp ? Number(item.lp).toFixed(2) : '0.00'"></span>
        </span> <br />
        <span 
            class="font-weight-medium fs-12 ws-p" 
            :id="`ssdsc${item.token}chpclr`"
            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
            <span :id="`ssdsc${item.token}ch`" v-text="item.ch ? item.ch : '0.00'"> </span>
            <span :id="`ssdsc${item.token}chp`" v-text="` (${item.chp ? item.chp : item.pc}%)`"></span>
        </span>
    </p>
</template>

<template v-slot:[`item.vol`]="{ item }">
    <span class="font-weight-medium maintext--text">{{ item.v ? item.v : "0.00" }}</span>
</template>

<template v-slot:[`item.op`]="{ item }">
    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}op`">
        {{ item.ap ? item.ap : "0.00" }}
    </span>
</template>

<template v-slot:[`item.cp`]="{ item }">
    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}cp`">
        {{ item.c ? item.c : "0.00" }}
    </span>
</template>

<template v-slot:[`item.high`]="{ item }">
    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}high`">
        {{ item.h ? item.h : "0.00" }}
    </span>
</template>

<template v-slot:[`item.low`]="{ item }">
    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}low`">
        {{ item.l ? item.l : "0.00" }}
    </span>
</template>

<template v-slot:no-data>
    <v-col v-if="screentidata" cols="12" class="text-center pa-0">
        <v-container fill-height>
            <v-btn 
                block 
                class="elevation-0 text-center rounded-xl" 
                height="300px" 
                text 
                color="transparent"
                @click="getContentlistdata">
                <div class="mx-auto py-16">
                    <img width="60px" src="@/assets/sm_icon.svg" class="mb-3">
                    <h3 class="primary--text font-weight-medium mb-2 text-none">Stock monitor</h3>
                    <p class="subtext--text mb-0 text-none">Click to load the Market monitor data</p>
                </div>
            </v-btn>
        </v-container>
    </v-col>
    <v-col v-else cols="12" class="text-center pa-16">
        <div>
            <img width="80px" src="@/assets/no data folder.svg" alt="no data" />
            <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
        </div>
    </v-col>
</template>
```

### Step 3: Verify Reactive State

```javascript
// In script setup
const screent0item = ref([
    { text: "VolUpPriceUp", value: "VolUpPriceUp" },
    { text: "VolUpPriceDown", value: "VolUpPriceDown" },
    { text: "VolDownPriceUp", value: "VolDownPriceUp" },
    { text: "VolDownPriceDown", value: "VolDownPriceDown" },
    { text: "PriceUp", value: "PriceUp" },
    { text: "PriceDown", value: "PriceDown" },
    { text: "VolUp", value: "VolUp" },
    { text: "VolDown", value: "VolDown" },
    { text: "52WeekHigh", value: "52WeekHigh" },
    { text: "52WeekLow", value: "52WeekLow" },
])

const screent0 = ref("VolUpPriceUp")

const screent1item = ref([
    { text: "All", value: "A" },
    { text: "Nifty 50", value: "NIFTY50" },
    { text: "Nifty 500", value: "NIFTY500" },
    { text: "Nifty MIDCAP 50", value: "NIFTYMCAP50" },
    { text: "Nifty SMLCAP 50", value: "NIFTYSMCAP50" },
])

const screent1 = ref("A")
const screentitems = ref([])
const screentidata = ref(true)
const issloading = ref(false)
```

### Step 4: Verify API Call Function

```javascript
const getContentlistdata = async (change) => {
    if (change == "yes" && uid.value) {
        // Unsubscribe from old data
        setWebsocket("unsub-D", screentitems.value, "sc")
    }
    
    issloading.value = true
    screentitems.value = []
    
    try {
        let data = await getConTentList(["NSE", screent1.value, screent0.value])
        
        if (data && data.length > 0) {
            screentitems.value = data.slice(0, 10)
            
            // Subscribe to WebSocket for real-time updates
            if (uid.value) {
                setWebsocket("sub", data, "sc")
            }
        }
        
        screentidata.value = false
    } catch (error) {
        console.error("Error loading stock monitor data:", error)
        screentidata.value = false
    } finally {
        issloading.value = false
    }
}
```

### Step 5: Verify WebSocket Update Handler

```javascript
// In handleWebSocketUpdate function
// Add handling for "sc" data type
if (is === 'sc' && data) {
    // Process WebSocket updates for stock monitor
    if (Array.isArray(data)) {
        data.forEach((item) => {
            const token = item.token || item.tk
            if (token && screentitems.value && Array.isArray(screentitems.value)) {
                const index = screentitems.value.findIndex((o) => o.token == token)
                if (index >= 0) {
                    // Update fields
                    if (item.lp !== undefined) {
                        screentitems.value[index].lp = Number(item.lp).toFixed(2)
                    }
                    if (item.c !== undefined) {
                        screentitems.value[index].c = Number(item.c).toFixed(2)
                    }
                    if (item.ch !== undefined) {
                        screentitems.value[index].ch = Number(item.ch).toFixed(2)
                    }
                    if (item.chp !== undefined || item.pc !== undefined) {
                        screentitems.value[index].chp = Number(item.chp || item.pc).toFixed(2)
                    }
                    if (item.v !== undefined) {
                        screentitems.value[index].v = Number(item.v).toFixed(2)
                    }
                    if (item.ap !== undefined) {
                        screentitems.value[index].ap = Number(item.ap).toFixed(2)
                    }
                    if (item.h !== undefined) {
                        screentitems.value[index].h = Number(item.h).toFixed(2)
                    }
                    if (item.l !== undefined) {
                        screentitems.value[index].l = Number(item.l).toFixed(2)
                    }
                    
                    // Calculate change and change percentage if not provided
                    if (item.lp && item.c && !item.ch) {
                        screentitems.value[index].ch = Number(item.lp - item.c).toFixed(2)
                    }
                    if (item.lp && item.ch && !item.chp) {
                        screentitems.value[index].chp = Number((item.ch / item.lp) * 100).toFixed(2)
                    }
                    
                    // Force reactivity
                    screentitems.value = [...screentitems.value]
                    
                    // Update DOM elements immediately
                    await nextTick()
                    updateStockMonitorDOM(token, screentitems.value[index])
                }
            }
        })
    }
}

// Helper function to update DOM
const updateStockMonitorDOM = (token, item) => {
    const ltpTag = document.getElementById(`ssdsc${token}ltp`)
    if (ltpTag) {
        ltpTag.innerHTML = item.lp ? Number(item.lp).toFixed(2) : '0.00'
        
        const chTag = document.getElementById(`ssdsc${token}ch`)
        const chpTag = document.getElementById(`ssdsc${token}chp`)
        const chpclrTag = document.getElementById(`ssdsc${token}chpclr`)
        
        if (chTag) chTag.innerHTML = item.ch ? item.ch : '0.00'
        if (chpTag) chpTag.innerHTML = ` (${item.chp || item.pc || '0.00'}%)`
        if (chpclrTag) {
            const ch = parseFloat(item.ch) || 0
            const baseClasses = 'font-weight-medium fs-12 ws-p'
            const colorClass = ch > 0 ? 'maingreen--text' : ch < 0 ? 'mainred--text' : 'subtext--text'
            chpclrTag.className = `${baseClasses} ${colorClass}`
        }
        
        const opTag = document.getElementById(`ssdsc${token}op`)
        const cpTag = document.getElementById(`ssdsc${token}cp`)
        const highTag = document.getElementById(`ssdsc${token}high`)
        const lowTag = document.getElementById(`ssdsc${token}low`)
        
        if (opTag) opTag.innerHTML = item.ap ? item.ap : "0.00"
        if (cpTag) cpTag.innerHTML = item.c ? item.c : "0.00"
        if (highTag) highTag.innerHTML = item.h ? item.h : "0.00"
        if (lowTag) lowTag.innerHTML = item.l ? item.l : "0.00"
    }
}
```

### Step 6: Verify setScrpitCH Function

```javascript
const setScrpitCH = (x, i, a, l) => {
    if (a == "SCR") {
        // Update stock monitor items
        let f = screentitems.value.findIndex((o) => o.token == i.token)
        if (f >= 0) {
            screentitems.value[f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0
            screentitems.value[f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0
            
            // Force reactivity
            screentitems.value = [...screentitems.value]
        }
    }
    // Handle other cases (TA, st) if needed
}
```

### Step 7: Verify Table Headers

```javascript
const screenheader = computed(() => {
    return [
        { title: "Symbol", key: "tsym", sortable: false, class: "ws-p" },
        { title: "Price", key: "ltp", sortable: false, align: "end", class: "ws-p" },
        { title: "Open", key: "op", sortable: false, align: "end", class: "ws-p" },
        { title: "High", key: "high", sortable: false, align: "end", class: "ws-p" },
        { title: "Low", key: "low", sortable: false, align: "end", class: "ws-p" },
        { title: "Close", key: "cp", sortable: false, align: "end", class: "ws-p" },
        { title: "Volume", key: "vol", sortable: false, align: "end", class: "ws-p" },
    ]
})
```

### Step 8: Verify Initialization

```javascript
// In onMounted or appropriate lifecycle hook
onMounted(async () => {
    // ... existing code ...
    
    // Load stock monitor data if visible
    if (isVisible('smcp') && screentidata.value) {
        screentidata.value = false
        await getContentlistdata()
    }
})
```

## API Integration

### getConTentList API

**Endpoint**: `apiurl.eqapi + "GetContentList"`

**Request Format**:
```javascript
["NSE", screent1, screent0]
// Example: ["NSE", "A", "VolUpPriceUp"]
```

**Response Format**:
```javascript
[
    {
        token: "...",
        tsym: "...",
        lp: 123.45,      // Last price
        c: 120.00,       // Close price
        ch: 3.45,        // Change
        chp: 2.88,      // Change percentage
        pc: 2.88,       // Percentage change (alternative)
        v: 1234567,     // Volume
        ap: 121.00,     // Open price (ap = average price)
        h: 125.00,      // High
        l: 119.00,      // Low
        exch: "NSE",
        // ... other fields
    },
    // ... more items
]
```

## WebSocket Integration

### Subscription

**When to Subscribe**:
- After loading data successfully
- Only if user is logged in (`uid.value`)

**Subscription Format**:
```javascript
setWebsocket("sub", data, "sc")
// data: Array of items with { exch, token, tsym }
// is: "sc" (stock monitor identifier)
```

### Unsubscription

**When to Unsubscribe**:
- When filter changes (`change == "yes"`)
- Only if user is logged in

**Unsubscription Format**:
```javascript
setWebsocket("unsub-D", screentitems.value, "sc")
```

### WebSocket Data Format

**Incoming Data**:
```javascript
{
    token: "...",
    lp: 123.45,      // Last price
    c: 120.00,       // Close price
    ch: 3.45,        // Change
    chp: 2.88,       // Change percentage
    v: 1234567,     // Volume
    ap: 121.00,      // Open price
    h: 125.00,       // High
    l: 119.00,       // Low
    // ... other fields
}
```

## Data Field Mapping

| Old App Field | New App Field | Description |
|--------------|---------------|-------------|
| `lp` | `lp` | Last price |
| `c` | `c` | Close price |
| `ch` | `ch` | Change |
| `chp` or `pc` | `chp` | Change percentage |
| `v` | `v` | Volume |
| `ap` | `ap` | Open price (average price) |
| `h` | `h` | High |
| `l` | `l` | Low |
| `token` | `token` | Token |
| `tsym` | `tsym` | Trading symbol |

## Testing Checklist

- [ ] Table displays correctly with all columns
- [ ] Filter dropdowns work correctly
- [ ] Data loads on mount
- [ ] Data loads when filters change
- [ ] WebSocket subscription works
- [ ] WebSocket updates work in real-time
- [ ] All fields update correctly (ltp, ch, chp, vol, op, cp, high, low)
- [ ] Color changes based on ch value (green/red/gray)
- [ ] Sorting by chp works correctly
- [ ] Empty state shows correctly
- [ ] "Click to load" state shows correctly
- [ ] "See all" button navigates correctly
- [ ] Symbol click navigation works
- [ ] Mobile responsiveness works
- [ ] Loading state shows correctly
- [ ] Error handling works correctly

## Migration Notes

1. **Vuetify 3 Changes**:
   - `item-text` → `item-title`
   - `item-value` → `item-value` (same)
   - `@change` → `@update:model-value`
   - `mobile-breakpoint` → `mobile`
   - `text` → `title` in headers
   - `align: "right"` → `align: "end"`

2. **Vue 3 Changes**:
   - `this.screentitems` → `screentitems.value`
   - `computed()` → `computed(() => { ... })`
   - `methods` → regular functions
   - `data()` → `ref()` or `reactive()`

3. **Reactivity**:
   - Use `ref()` for primitive values
   - Use `reactive()` or `ref()` for objects/arrays
   - Force reactivity with spread operator: `array.value = [...array.value]`
   - Use `nextTick()` for DOM updates

4. **WebSocket**:
   - Use `window.dispatchEvent` for custom events
   - Use `web-scoketOn` event name
   - Handle data in `handleWebSocketUpdate` function

## Files to Modify

1. ✅ `superApp_v4/src/views/Dashboard/stocks/StocksSrc.vue` - Main implementation
2. ⚠️ `superApp_v4/src/components/mixins/getAPIdata.js` - Verify `getConTentList` function
3. ⚠️ `superApp_v4/src/utils/webSocketEventBus.js` - Verify WebSocket handling for "sc" type

## Next Steps

1. Verify current implementation matches this plan
2. Fix any discrepancies
3. Test all functionality
4. Verify WebSocket integration
5. Test real-time updates
6. Verify styling matches old app

