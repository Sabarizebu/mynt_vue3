# Stocks Details - Overview Tab Migration Boilerplate Code

## Pinia Store Boilerplate (Optional)

```javascript
// stores/stocksOverviewStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMHoldingdata } from '@/components/mixins/getAPIdata'

export const useStocksOverviewStore = defineStore('stocksOverview', () => {
  // State
  const menudata = ref([])
  const imageicon = ref(null)
  const stockreturns = ref([])
  const stkltp = ref(0)
  const lwchartis = ref(false)
  const mainloader = ref(true)

  // Getters
  const hasStockData = computed(() => menudata.value.length > 0 && menudata.value[0])
  const hasFundamentalData = computed(() => menudata.value.f && Object.keys(menudata.value.f).length > 0)
  const hasReturnsData = computed(() => stockreturns.value.length > 0)
  const hasPivotData = computed(() => menudata.value.pivot && menudata.value.pivot.length > 0)

  // Actions
  const setSingleData = async (token, exch, tsym) => {
    const windata = window.ssddetail
    if (!windata || !windata[0]) return

    imageicon.value = `${apiurl.imgicon}${tsym.split("-")[0]}.png`
    menudata.value = []
    const data = windata[1] || {}
    mainloader.value = false
    menudata.value.push(windata[0])

    if (data && data.fundamental && data.fundamental[0]) {
      menudata.value.f = data.fundamental[0]
    } else {
      menudata.value.f = []
    }

    getReturns(token)
    setHoldbadge(token)
    stkltp.value = menudata.value[0]?.token || 0
  }

  const getReturns = (token) => {
    const windata = window.ssdreqdata?.data
    if (windata && windata[token] && windata[token].t) {
      const tech = windata[token].t
      stockreturns.value = [
        { type: "1 day", returns: menudata.value[0]?.close_price || 0 },
        { type: "1 week", returns: Number(tech.wk1_c) || 0 },
        { type: "2 week", returns: Number(tech.wk2_c) || 0 },
        { type: "1 month", returns: Number(tech.mnth1_c) || 0 },
        { type: "3 month", returns: Number(tech.mnth3_c) || 0 },
        { type: "1 year", returns: Number(tech.wk52_c) || 0 },
      ]

      // Pivot levels
      if (Number(tech.sup_3) > 0 && Number(tech.res_3) > 0) {
        menudata.value.pivot = [
          { color: "#FF1717", name: "S3", value: Number(tech.sup_3) || 0 },
          { color: "#D34645", name: "S2", value: Number(tech.sup_2) || 0 },
          { color: "#E38988", name: "S1", value: Number(tech.sup_1) || 0 },
          { color: "#84C89D", name: "R1", value: Number(tech.res_1) || 0 },
          { color: "#3FA965", name: "R2", value: Number(tech.res_2) || 0 },
          { color: "#43A833", name: "R3", value: Number(tech.res_3) || 0 },
        ]
        menudata.value.pivotpoint = Number(tech.pivot_point) || 0
      } else {
        menudata.value.pivot = []
      }
    } else {
      stockreturns.value = []
      setTimeout(() => getReturns(token), 100)
    }
  }

  const setHoldbadge = (tk) => {
    const data = getMHoldingdata()
    if (!data?.length) return
    const ct = data.find(x => x.token == tk)
    if (ct?.netqty > 0) {
      menudata.value[0]['sucase'] = ct.netqty
    }
  }

  const clearData = () => {
    imageicon.value = null
    menudata.value = []
    stockreturns.value = []
    stkltp.value = 0
  }

  const updateWebSocketData = (data) => {
    if (!menudata.value[0] || menudata.value[0].token !== data.token) return
    
    // Update price data
    if (data.lp) menudata.value[0].ltp = Number(data.lp).toFixed(2)
    if (data.ch !== undefined) menudata.value[0].ch = Number(data.ch).toFixed(2)
    if (data.chp !== undefined) menudata.value[0].chp = Number(data.chp).toFixed(2)
    
    // Update other fields...
    // (Complete implementation based on optionChainDataParse)
  }

  return {
    // State
    menudata,
    imageicon,
    stockreturns,
    stkltp,
    lwchartis,
    mainloader,
    // Getters
    hasStockData,
    hasFundamentalData,
    hasReturnsData,
    hasPivotData,
    // Actions
    setSingleData,
    getReturns,
    setHoldbadge,
    clearData,
    updateWebSocketData
  }
})
```

---

## Composable Functions Boilerplate

```javascript
// composables/useStocksOverview.js
import { ref, computed } from 'vue'
import { default as apiurl } from '@/apiurl'
import { getMHoldingdata } from '@/components/mixins/getAPIdata'

/**
 * Stock Data Management Composable
 */
export function useStockData() {
  const menudata = ref([])
  const imageicon = ref(null)
  const mainloader = ref(true)

  const setSingleData = async (token, exch, tsym) => {
    const windata = window.ssddetail
    if (!windata || !windata[0]) return

    imageicon.value = `${apiurl.imgicon}${tsym.split("-")[0]}.png`
    menudata.value = []
    const data = windata[1] || {}
    mainloader.value = false
    menudata.value.push(windata[0])

    if (data && data.fundamental && data.fundamental[0]) {
      menudata.value.f = data.fundamental[0]
    } else {
      menudata.value.f = []
    }
  }

  const clearData = () => {
    imageicon.value = null
    menudata.value = []
    mainloader.value = true
  }

  const imageLoadError = () => {
    imageicon.value = null
  }

  return {
    menudata,
    imageicon,
    mainloader,
    setSingleData,
    clearData,
    imageLoadError
  }
}

/**
 * WebSocket Updates Composable
 */
export function useWebSocketUpdates() {
  const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
      const [data, page] = detail
      if (page === 'stockSSD') {
        optionChainDataParse(data)
      }
    } else if (detail && typeof detail === 'object' && (detail.page === 'stockSSD' || detail.token || detail.tk)) {
      optionChainDataParse(detail)
    }
  }

  const optionChainDataParse = (data) => {
    // Complete implementation based on existing optionChainDataParse
    // This should update menudata with WebSocket data
  }

  const setWebsocket = (flow, data, is) => {
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
      detail: { flow, data, is, page: 'stockSSD' }
    }))
  }

  return {
    handleWebSocketConnection,
    optionChainDataParse,
    setWebsocket
  }
}

/**
 * Overview Calculations Composable
 */
export function useOverviewCalculations() {
  const stockreturns = ref([])
  const stkltp = ref(0)

  const computeReturnPercent = (baseValue, currentLtp) => {
    const ltp = Number(currentLtp || 0)
    const base = Number(baseValue || 0)
    if (!ltp || !base || base <= 0) return '0.00'
    const pct = ((ltp - base) / base) * 100
    return isFinite(pct) ? pct.toFixed(2) : '0.00'
  }

  const getReturns = (token, menudata) => {
    const windata = window.ssdreqdata?.data
    if (windata && windata[token] && windata[token].t) {
      const tech = windata[token].t
      stockreturns.value = [
        { type: "1 day", returns: menudata[0]?.close_price || 0 },
        { type: "1 week", returns: Number(tech.wk1_c) || 0 },
        { type: "2 week", returns: Number(tech.wk2_c) || 0 },
        { type: "1 month", returns: Number(tech.mnth1_c) || 0 },
        { type: "3 month", returns: Number(tech.mnth3_c) || 0 },
        { type: "1 year", returns: Number(tech.wk52_c) || 0 },
      ]

      // Pivot levels
      if (Number(tech.sup_3) > 0 && Number(tech.res_3) > 0) {
        menudata.pivot = [
          { color: "#FF1717", name: "S3", value: Number(tech.sup_3) || 0 },
          { color: "#D34645", name: "S2", value: Number(tech.sup_2) || 0 },
          { color: "#E38988", name: "S1", value: Number(tech.sup_1) || 0 },
          { color: "#84C89D", name: "R1", value: Number(tech.res_1) || 0 },
          { color: "#3FA965", name: "R2", value: Number(tech.res_2) || 0 },
          { color: "#43A833", name: "R3", value: Number(tech.res_3) || 0 },
        ]
        menudata.pivotpoint = Number(tech.pivot_point) || 0
      } else {
        menudata.pivot = []
      }
    } else {
      stockreturns.value = []
      setTimeout(() => getReturns(token, menudata), 100)
    }
  }

  return {
    stockreturns,
    stkltp,
    computeReturnPercent,
    getReturns
  }
}

/**
 * Holdings Badge Composable
 */
export function useHoldingsBadge() {
  const setHoldbadge = (tk, menudata) => {
    const data = getMHoldingdata()
    if (!data?.length) return
    const ct = data.find(x => x.token == tk)
    if (ct?.netqty > 0 && menudata[0]) {
      menudata[0]['sucase'] = ct.netqty
    }
  }

  return {
    setHoldbadge
  }
}

/**
 * Price Cache Management Composable
 */
export function usePriceCache() {
  const getPriceCache = () => {
    try {
      return JSON.parse(localStorage.getItem('price_cache') || '{}')
    } catch {
      return {}
    }
  }

  const setPriceCache = (cache) => {
    try {
      localStorage.setItem('price_cache', JSON.stringify(cache))
    } catch (e) {
      console.error('Error setting price cache:', e)
    }
  }

  const updatePriceCache = (token, priceData) => {
    const cache = getPriceCache()
    cache[token] = {
      ltp: priceData.ltp,
      ch: priceData.ch,
      chp: priceData.chp,
      high_price: priceData.high_price,
      low_price: priceData.low_price,
      open_price: priceData.open_price,
      close_price: priceData.close_price
    }
    setPriceCache(cache)
  }

  return {
    getPriceCache,
    setPriceCache,
    updatePriceCache
  }
}
```

---

## Component Usage Example

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useStockData } from '@/composables/useStocksOverview'
import { useWebSocketUpdates } from '@/composables/useStocksOverview'
import { useOverviewCalculations } from '@/composables/useStocksOverview'
import { useHoldingsBadge } from '@/composables/useStocksOverview'
import { usePriceCache } from '@/composables/useStocksOverview'
import LightweightChart from '@/components/LightweightChart.vue'

// Use composables
const { menudata, imageicon, mainloader, setSingleData, clearData, imageLoadError } = useStockData()
const { handleWebSocketConnection, setWebsocket } = useWebSocketUpdates()
const { stockreturns, stkltp, computeReturnPercent, getReturns } = useOverviewCalculations()
const { setHoldbadge } = useHoldingsBadge()
const { getPriceCache, updatePriceCache } = usePriceCache()

const lwchartis = ref(false)

// Initialize data from localStorage
const setWaiting = (token, exch, tsym) => {
  if (window.ssddetail && window.ssddetail[0] && window.ssddetail[0].token == token) {
    setSingleData(token, exch, tsym)
    getReturns(token, menudata.value)
    setHoldbadge(token, menudata.value)
    setWebsocket('sub', [{ token, exch, tsym }], 'ssd')
    stkltp.value = menudata.value[0]?.token || 0
  } else {
    setTimeout(() => setWaiting(token, exch, tsym), 100)
  }
}

// Event handlers
const handleSSDEvent = (event) => {
  const { detail } = event
  if (Array.isArray(detail) && detail.length >= 4) {
    const [type, token, exch, tsym] = detail
    if (menudata.value[0]) {
      setWebsocket('unsub-D', [{ token: menudata.value[0].token, exch: menudata.value[0].exch, tsym: menudata.value[0].tsym }], 'ssd')
    }
    mainloader.value = true
    clearData()
    setWaiting(token, exch, tsym)
  }
}

const handleLWCEvent = (event) => {
  const { detail } = event
  lwchartis.value = detail
}

// Lifecycle
onMounted(() => {
  const local = localStorage.getItem('ssdtsym')
  if (local && local.includes(':')) {
    mainloader.value = true
    clearData()
    setWaiting(localStorage.getItem('ssdtoken'), local.split(':')[0], local.split(':')[1])
  }

  window.addEventListener('ssd-event', handleSSDEvent)
  window.addEventListener('lwc-event', handleLWCEvent)
  window.addEventListener('web-scoketConn', handleWebSocketConnection)
})

onBeforeUnmount(() => {
  window.removeEventListener('ssd-event', handleSSDEvent)
  window.removeEventListener('lwc-event', handleLWCEvent)
  window.removeEventListener('web-scoketConn', handleWebSocketConnection)
})
</script>
```

---

## Vuetify 2 → 3 Component Migration Examples

### Example 1: Chip Group
```vue
<!-- Vue 2 -->
<v-chip-group mandatory active-class="primary--text" v-model="toggle" @change="setData(toggle)">
  <v-chip outlined small>1D</v-chip>
</v-chip-group>

<!-- Vue 3 -->
<v-chip-group mandatory active-class="primary--text" v-model="toggle" @update:model-value="setData(toggle)">
  <v-chip variant="outlined" size="small">1D</v-chip>
</v-chip-group>
```

### Example 2: Progress Linear
```vue
<!-- Vue 2 -->
<v-progress-linear :value="menudata[0].bid_qty"></v-progress-linear>

<!-- Vue 3 -->
<v-progress-linear :model-value="menudata[0].bid_qty"></v-progress-linear>
```

### Example 3: List Item
```vue
<!-- Vue 2 -->
<v-list-item>
  <v-list-item-avatar>
    <img :src="imageicon" />
  </v-list-item-avatar>
  <v-list-item-content>
    <v-list-item-title>{{ title }}</v-list-item-title>
    <v-list-item-subtitle>{{ subtitle }}</v-list-item-subtitle>
  </v-list-item-content>
</v-list-item>

<!-- Vue 3 -->
<div class="d-flex align-center">
  <v-avatar>
    <img :src="imageicon" />
  </v-avatar>
  <div class="ml-3">
    <div class="font-weight-bold">{{ title }}</div>
    <div class="text-caption">{{ subtitle }}</div>
  </div>
</div>
```

---

## Testing Helper Functions

```javascript
// helpers/testHelpers.js

/**
 * Mock WebSocket data for testing
 */
export const mockWebSocketData = {
  token: 12345,
  lp: 150.50,
  ch: 2.50,
  chp: 1.68,
  high_price: 152.00,
  low_price: 148.00,
  open_price: 149.00,
  prev_close_price: 148.00,
  volume: 1000000,
  ap: 150.25,
  oi: 50000,
  uc: 160.00,
  lc: 140.00,
  ltt: '15:30:00',
  ltq: 100,
  tbq: 50000,
  tsq: 30000,
  depth: {
    bids: [
      { volume: 1000, price: 150.00 },
      { volume: 2000, price: 149.50 },
    ],
    asks: [
      { volume: 1500, price: 151.00 },
      { volume: 2500, price: 151.50 },
    ]
  }
}

/**
 * Mock window.ssddetail for testing
 */
export const mockSSDDetail = [
  {
    token: 12345,
    exch: 'NSE',
    tsym: 'RELIANCE-EQ',
    cname: 'Reliance Industries',
    symname: 'RELIANCE',
    ltp: 150.50,
    ch: 2.50,
    chp: 1.68,
    high_price: 152.00,
    low_price: 148.00,
    open_price: 149.00,
    close_price: 148.00,
    volume: 1000000,
    ap: 150.25,
    oi: 50000,
    uc: 160.00,
    lc: 140.00,
    w52h: 160.00,
    w52l: 140.00,
    instname: 'EQ'
  },
  {
    fundamental: [{
      industry: 'Oil & Gas',
      market_cap_type: 'Large Cap',
      market_cap: 1000000
    }]
  }
]

/**
 * Mock window.ssdreqdata for testing
 */
export const mockSSDReqData = {
  data: {
    12345: {
      t: {
        wk1_c: 145.00,
        wk2_c: 140.00,
        mnth1_c: 135.00,
        mnth3_c: 130.00,
        wk52_c: 120.00,
        sup_3: 130.00,
        sup_2: 140.00,
        sup_1: 145.00,
        res_1: 155.00,
        res_2: 160.00,
        res_3: 165.00,
        pivot_point: 148.00
      }
    }
  }
}
```

---

## Notes

- These boilerplate examples are **optional** - the current implementation using global cache works fine
- Consider migrating to composables/store if you want better code organization
- The current direct DOM manipulation approach is fine for performance-critical real-time updates
- Test thoroughly after implementing any changes

---

**Last Updated**: 2024

