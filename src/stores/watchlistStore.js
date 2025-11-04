import { defineStore } from 'pinia'
import { getMwatchlistset, getGloabSearch, getMHoldingdata, getMHoldings, getPreDefinedMW, getClientDetails, getMFwatchlist, getIndexList, getLtpdata } from '../components/mixins/getAPIdata.js'
import { mynturl, myntappurl, params } from '../apiurl.js'

export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({
    // Watchlist management
    watchlists: ['Millionaire'],
    currentWatchlist: null,
    watchlistData: [],
    watchlistDataCache: {}, // { watchlistName: { data: [], timestamp: number } }
    
    // Loading states
    isLoading: true,
    mfisLoading: true,
    searchloading: false,
    
    // Filters and sorting
    mwfilter: null,
    mwfilters: [
      { key: "a", text: "Script - A to Z" },
      { key: "z", text: "Script - Z to A" },
      { key: "ltp-h", text: "Price - High to Low" },
      { key: "ltp-l", text: "Price - Low to High" },
      { key: "ch-h", text: "Per.chg - High to Low" },
      { key: "ch-l", text: "Per.chg - Low to High" },
    ],
    stocksexch: 0, // Exchange filter: 0=All, 1=Equity, 2=F&O, 3=Currency, 4=Commodities, 5=Indices
    exchfilter: ["All", "Equity", "F&O", "Currency", "Commodities", "Indices"],
    
    // Search
    search: '',
    items: [],
    allitems: [],
    nodata: null,
    
    // Predefined watchlists
    PreMWlist: [
      { key: "MY:HOLDINGS", text: "My stocks" },
      { key: "NIFTY50:NSE", text: "Nifty50" },
      { key: "NIFTYBANK:NSE", text: "Bank Nifty" },
      { key: "SENSEX:BSE", text: "Sensex" },
    ],
    PreDefinedMW: {},
    pdmwdata: [
      { key: "NIFTY50:NSE", exch: "NSE", token: "26000", tsym: "Nifty 50" },
      { key: "NIFTYBANK:NSE", exch: "NSE", token: "26009", tsym: "Nifty Bank" },
    ],
    
    // Mutual fund data
    mfuseritem: [],
    mfwatchlistdata: [],
    allmutualfunds: null,
    mfsearch: '',
    mfexch: 0,
    mfexchfilter: ["All", "Equity", "Debt", "Hybrid", "Other"],
    mffilter: null,
    mffilters: [
      { key: "a", text: "Script - A to Z" },
      { key: "z", text: "Script - Z to A" },
      { key: "nav-h", text: "NAV - High to Low" },
      { key: "nav-l", text: "NAV - Low to High" },
      { key: "y-h", text: "3yr rtn - High to Low" },
      { key: "y-l", text: "3yr rtn - Low to High" },
    ],
    
    // Options chain basket
    optchainbasket: false,
    optchainbasketdata: [],
    prdordplace: false, // false=MIS, true=NRML
    totalmargin: 0,
    postTrademargin: 0,
    orderloader: false,
    
    // Options search
    optsearch: false,
    optsearchdata: {},
    
    // Index management
    allindex: { NSE: [], BSE: [], MCX: [] },
    indexdialog: false,
    singleindex: {},
    indexpanel: 0,
    
    // Client details
    clientdetails: {},
    
    // Price caching
    priceCache: {},
    lastState: {}, // Per-token merged quote state
  }),
  
  getters: {
    // Filtered and sorted watchlist data
    filteredWatchlistData: (state) => {
      if (!state.mwfilter || !Array.isArray(state.watchlistData)) {
        return state.watchlistData
      }
      
      let filtered = [...state.watchlistData]
      
      switch (state.mwfilter) {
        case "a": // A to Z
          filtered.sort((a, b) => {
            const aName = (a.tsyms || a.tsym || '').toLowerCase()
            const bName = (b.tsyms || b.tsym || '').toLowerCase()
            return aName.localeCompare(bName)
          })
          break
        case "z": // Z to A
          filtered.sort((a, b) => {
            const aName = (a.tsyms || a.tsym || '').toLowerCase()
            const bName = (b.tsyms || b.tsym || '').toLowerCase()
            return bName.localeCompare(aName)
          })
          break
        case "ltp-h": // Price High to Low
          filtered.sort((a, b) => {
            const aPrice = parseFloat(a.ltp || 0)
            const bPrice = parseFloat(b.ltp || 0)
            return bPrice - aPrice
          })
          break
        case "ltp-l": // Price Low to High
          filtered.sort((a, b) => {
            const aPrice = parseFloat(a.ltp || 0)
            const bPrice = parseFloat(b.ltp || 0)
            return aPrice - bPrice
          })
          break
        case "ch-h": // Change % High to Low
          filtered.sort((a, b) => {
            const aChp = parseFloat(a.chp || 0)
            const bChp = parseFloat(b.chp || 0)
            return bChp - aChp
          })
          break
        case "ch-l": // Change % Low to High
          filtered.sort((a, b) => {
            const aChp = parseFloat(a.chp || 0)
            const bChp = parseFloat(b.chp || 0)
            return aChp - bChp
          })
          break
      }
      
      return filtered
    },
    
    // Check if current watchlist is predefined
    isPreDefinedWatchlist: (state) => {
      return state.PreMWlist.some(p => p.key === state.currentWatchlist)
    },
    
    // Check if current watchlist is MY:HOLDINGS
    isHoldingsWatchlist: (state) => {
      return state.currentWatchlist === 'MY:HOLDINGS'
    },
  },
  
  actions: {
    // Watchlist management
    async fetchWatchlists() {
      try {
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) return
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}"}&jKey=${mtoken}`,
          "GetMWlistset"
        )
        
        if (res && res.stat === "Ok" && res.wlname) {
          this.watchlists = res.wlname
          // Load first watchlist if none selected
          if (!this.currentWatchlist && res.wlname.length > 0) {
            this.currentWatchlist = res.wlname[0]
            await this.fetchWatchlistData(res.wlname[0])
          }
        }
      } catch (error) {
        console.error('Error fetching watchlists:', error)
      }
    },
    
    async selectWatchlist(wlName) {
      this.currentWatchlist = wlName
      
      // Check if it's a predefined watchlist
      if (this.PreMWlist.find(p => p.key === wlName)) {
        await this.setPreDefinedWatchlist()
      } else {
        await this.fetchWatchlistData(wlName)
      }
    },
    
    async fetchWatchlistData(wlName) {
      try {
        this.isLoading = true
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) {
          this.isLoading = false
          return
        }
        
        // Try to load from cache first
        const cached = this.loadWatchlistFromCache(wlName)
        if (cached && Array.isArray(cached) && cached.length > 0) {
          this.watchlistData = cached
          this.restorePriceStates(cached)
          this.isLoading = false
        }
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}","wlname":"${wlName}"}&jKey=${mtoken}`,
          "GetMWlistdata"
        )
        
        if (res && res.stat === "Ok" && res.values) {
          this.watchlistData = res.values || []
          this.saveWatchlistToCache(wlName, this.watchlistData)
          this.restorePriceStates(this.watchlistData)
        } else {
          this.watchlistData = 'no data'
        }
      } catch (error) {
        console.error('Error fetching watchlist data:', error)
        this.watchlistData = 'no data'
      } finally {
        this.isLoading = false
      }
    },
    
    async addSymbol(wlName, symbol) {
      try {
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) return false
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}","wlname":"${wlName}","scrips":"${symbol.exch}|${symbol.token}"}&jKey=${mtoken}`,
          "AddMultiScripsToMW"
        )
        
        if (res && res.stat === "Ok") {
          await this.fetchWatchlistData(wlName)
          return true
        }
        return false
      } catch (error) {
        console.error('Error adding symbol:', error)
        return false
      }
    },
    
    async removeSymbol(wlName, symbol) {
      try {
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) return false
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}","wlname":"${wlName}","scrips":"${symbol.exch}|${symbol.token}"}&jKey=${mtoken}`,
          "DeleteScripsFromMW"
        )
        
        if (res && res.stat === "Ok") {
          await this.fetchWatchlistData(wlName)
          return true
        }
        return false
      } catch (error) {
        console.error('Error removing symbol:', error)
        return false
      }
    },
    
    async createWatchlist(wlName) {
      try {
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) return false
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}","wlname":"${wlName}"}&jKey=${mtoken}`,
          "SetMWlistset"
        )
        
        if (res && res.stat === "Ok") {
          await this.fetchWatchlists()
          return true
        }
        return false
      } catch (error) {
        console.error('Error creating watchlist:', error)
        return false
      }
    },
    
    async deleteWatchlist(wlName) {
      try {
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) return false
        
        const res = await getMwatchlistset(
          `jData={"uid":"${uid}","wlname":"${wlName}"}&jKey=${mtoken}`,
          "DeleteMWlistset"
        )
        
        if (res && res.stat === "Ok") {
          await this.fetchWatchlists()
          if (this.currentWatchlist === wlName) {
            this.currentWatchlist = null
            this.watchlistData = []
          }
          return true
        }
        return false
      } catch (error) {
        console.error('Error deleting watchlist:', error)
        return false
      }
    },
    
    // Predefined watchlists
    async setPreDefinedWatchlist() {
      try {
        this.isLoading = true
        
        if (!this.PreDefinedMW || this.PreDefinedMW.stat !== "Ok") {
          this.PreDefinedMW = await getPreDefinedMW()
        }
        
        if (this.currentWatchlist === "MY:HOLDINGS") {
          let data = getMHoldingdata()
          
          if (!data || !Array.isArray(data) || data.length === 0) {
            try {
              const uid = sessionStorage.getItem('userid')
              const mtoken = sessionStorage.getItem('msession')
              
              if (uid && mtoken) {
                const holdingsResponse = await getMHoldings(true)
                if (holdingsResponse && holdingsResponse.response && Array.isArray(holdingsResponse.response) && holdingsResponse.response.length > 0) {
                  data = holdingsResponse.response
                }
              }
            } catch (error) {
              console.error('Error loading holdings data:', error)
            }
          }
          
          if (data && Array.isArray(data) && data.length > 0) {
            this.watchlistData = data.map((o) => o.exch_tsym?.[0]).filter(Boolean)
            this.restorePriceStates(this.watchlistData)
          } else {
            this.watchlistData = 'no data'
          }
        } else {
          // Handle other predefined watchlists (Nifty50, Bank Nifty, etc.)
          const pdmwItem = this.pdmwdata.find(p => p.key === this.currentWatchlist)
          if (pdmwItem) {
            // Load predefined watchlist data
            // Implementation depends on API structure
            this.watchlistData = []
          }
        }
      } catch (error) {
        console.error('Error setting predefined watchlist:', error)
        this.watchlistData = 'no data'
      } finally {
        this.isLoading = false
      }
    },
    
    // Filtering and sorting
    setFilter(filterKey) {
      this.mwfilter = filterKey
    },
    
    setExchangeFilter(exchIndex) {
      this.stocksexch = exchIndex
    },
    
    // Search
    async searchScript(searchText, category = '', optSearch = false) {
      try {
        this.searchloading = true
        const uid = sessionStorage.getItem('userid')
        const mtoken = sessionStorage.getItem('msession')
        
        if (!uid || !mtoken) {
          this.searchloading = false
          return
        }
        
        if (!this.clientdetails || Object.keys(this.clientdetails).length === 0) {
          this.clientdetails = await getClientDetails()
        }
        
        const query = `jData={"uid":"${uid}","stext":"${searchText}","fil":${JSON.stringify(this.clientdetails?.exarr || [])},"cat":"${category}","opt":"${optSearch ? "1" : "0"}"}&jKey=${mtoken}`
        
        const res = await getGloabSearch(query)
        
        if (res && res.stat === "Ok" && res.values && res.values.length > 0) {
          this.allitems = res.values
          
          // Mark items already in watchlist
          if (Array.isArray(this.watchlistData)) {
            this.allitems.forEach((so) => {
              if (this.watchlistData.some(o => o.token === so.token)) {
                so["watchlist"] = true
              }
            })
          }
          
          // Apply exchange filter
          this.applyExchangeFilter()
          this.nodata = null
        } else {
          this.items = []
          this.allitems = []
          this.nodata = "noooo"
        }
      } catch (error) {
        console.error('Search error:', error)
        this.items = []
        this.nodata = "noooo"
      } finally {
        this.searchloading = false
      }
    },
    
    applyExchangeFilter() {
      if (this.stocksexch === 0) {
        this.items = [...this.allitems]
      } else {
        const category = ["", "EQ", "FO", "CUR", "COM", "IDX"][this.stocksexch] || ""
        this.items = this.allitems.filter(item => {
          if (category === "EQ") return item.instname === "EQ"
          if (category === "FO") return ["FUT", "OPT"].includes(item.instname)
          if (category === "CUR") return ["CDS"].includes(item.exch)
          if (category === "COM") return ["NCOM", "BCOM", "MCX"].includes(item.exch)
          if (category === "IDX") return item.instname === "IND"
          return true
        })
      }
    },
    
    // Price caching
    loadWatchlistFromCache(wlName) {
      const uid = sessionStorage.getItem('userid')
      if (!uid) return null
      
      const cacheKey = `${uid}_watchlist_${wlName}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          // Cache valid for 5 minutes
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            return parsed.data
          }
        } catch (e) {
          console.error('Error parsing watchlist cache:', e)
        }
      }
      return null
    },
    
    saveWatchlistToCache(wlName, data) {
      const uid = sessionStorage.getItem('userid')
      if (!uid) return
      
      const cacheKey = `${uid}_watchlist_${wlName}`
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    },
    
    restorePriceStates(data) {
      if (!Array.isArray(data)) return
      
      data.forEach(item => {
        if (item.token && this.lastState[item.token]) {
          const state = this.lastState[item.token]
          item.ltp = state.ltp !== undefined ? state.ltp.toFixed(2) : (item.ltp || null)
          item.ch = state.ch !== undefined ? state.ch.toFixed(2) : (item.ch || null)
          item.chp = state.chp !== undefined ? state.chp.toFixed(2) : (item.chp || null)
        }
      })
    },
    
    // Update price from WebSocket
    updatePrice(token, priceData) {
      // Update in watchlistData
      if (Array.isArray(this.watchlistData)) {
        const item = this.watchlistData.find(w => w.token === token)
        if (item) {
          if (priceData.ltp !== undefined) item.ltp = parseFloat(priceData.ltp).toFixed(2)
          if (priceData.ch !== undefined) item.ch = parseFloat(priceData.ch).toFixed(2)
          if (priceData.chp !== undefined) item.chp = parseFloat(priceData.chp).toFixed(2)
        }
      }
      
      // Update in pdmwdata
      const pdmwItem = this.pdmwdata.find(p => p.token === token)
      if (pdmwItem) {
        if (priceData.ltp !== undefined) pdmwItem.ltp = parseFloat(priceData.ltp).toFixed(2)
        if (priceData.ch !== undefined) pdmwItem.ch = parseFloat(priceData.ch).toFixed(2)
        if (priceData.chp !== undefined) pdmwItem.chp = parseFloat(priceData.chp).toFixed(2)
      }
      
      // Update lastState for caching
      if (!this.lastState[token]) {
        this.lastState[token] = {}
      }
      Object.assign(this.lastState[token], priceData)
    },
    
    // WebSocket Subscription Helpers (Phase 3)
    subscribeToWatchlist() {
      if (!Array.isArray(this.watchlistData) || this.watchlistData.length === 0) {
        return
      }
      
      const subscriptionData = this.watchlistData.map(item => ({
        token: item.token,
        exch: item.exch,
        tsym: item.tsym || item.tsyms
      }))
      
      const event = new CustomEvent('web-scoketOn', {
        detail: {
          flow: 'sub',
          data: subscriptionData,
          is: 'wl',
          page: 'watchlist'
        }
      })
      window.dispatchEvent(event)
    },
    
    unsubscribeFromWatchlist() {
      if (!Array.isArray(this.watchlistData) || this.watchlistData.length === 0) {
        return
      }
      
      const subscriptionData = this.watchlistData.map(item => ({
        token: item.token,
        exch: item.exch,
        tsym: item.tsym || item.tsyms
      }))
      
      const event = new CustomEvent('web-scoketOn', {
        detail: {
          flow: 'unsub',
          data: subscriptionData,
          is: 'wl',
          page: 'watchlist'
        }
      })
      window.dispatchEvent(event)
    },
    
    subscribeToPdmwdata() {
      if (!Array.isArray(this.pdmwdata) || this.pdmwdata.length === 0) {
        return
      }
      
      const subscriptionData = this.pdmwdata.map(item => ({
        token: item.token,
        exch: item.exch,
        tsym: item.tsym
      }))
      
      const event = new CustomEvent('web-scoketOn', {
        detail: {
          flow: 'sub',
          data: subscriptionData,
          is: 'ssd',
          page: 'watchlist'
        }
      })
      window.dispatchEvent(event)
    },
    
    unsubscribeFromPdmwdata() {
      if (!Array.isArray(this.pdmwdata) || this.pdmwdata.length === 0) {
        return
      }
      
      const subscriptionData = this.pdmwdata.map(item => ({
        token: item.token,
        exch: item.exch,
        tsym: item.tsym
      }))
      
      const event = new CustomEvent('web-scoketOn', {
        detail: {
          flow: 'unsub',
          data: subscriptionData,
          is: 'ssd',
          page: 'watchlist'
        }
      })
      window.dispatchEvent(event)
    },
    
    // Handle WebSocket price update from 'web-scoketConn' event
    handleWebSocketPriceUpdate(wsData) {
      if (!wsData || !wsData.token) return
      
      const token = wsData.token
      const ltp = wsData.ltp || wsData.lp || wsData.l
      const ch = wsData.ch
      const chp = wsData.chp
      const prevClose = wsData.c || wsData.prev_close_price || wsData.close
      
      // Calculate change and change percent if not provided
      let finalCh = ch
      let finalChp = chp
      
      if (ltp !== undefined && prevClose !== undefined && prevClose > 0) {
        const ltpNum = parseFloat(ltp)
        const closeNum = parseFloat(prevClose)
        
        if (finalCh === undefined) {
          finalCh = ltpNum - closeNum
        }
        
        if (finalChp === undefined && closeNum > 0) {
          finalChp = (finalCh / closeNum) * 100
        }
      }
      
      const priceData = {
        ltp: ltp !== undefined ? parseFloat(ltp) : undefined,
        ch: finalCh !== undefined ? parseFloat(finalCh) : undefined,
        chp: finalChp !== undefined ? parseFloat(finalChp) : undefined,
      }
      
      // Remove undefined values
      Object.keys(priceData).forEach(key => {
        if (priceData[key] === undefined) {
          delete priceData[key]
        }
      })
      
      // Update price in store
      if (Object.keys(priceData).length > 0) {
        this.updatePrice(token, priceData)
      }
    },
  }
})
