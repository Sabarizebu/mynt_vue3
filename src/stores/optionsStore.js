import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOptionsStore = defineStore('options', () => {
  // Core Data
  const optionchainid = ref(true)
  const coractdata = ref(false)
  const coractloader = ref(true)
  
  // Stock Symbol Info
  const optionStockSymbol = ref('')
  const optionStockSpot = ref('')
  const optionStockSymbolInfo = ref({})
  const optionStockName = ref('')
  
  // Expiry & Chain Settings
  const lsexd = ref([]) // Expiry dates list
  const lsexdfilter = ref(0) // Selected expiry index
  const lsexdval = ref('') // Selected expiry value
  const daydiff = ref(null) // Days to expiry
  const ccfilter = ref(1) // Chain count filter index
  const chainCount = ref(null) // Selected chain count (5, 10, 15, 30, All)
  
  // Options Chain Data
  const chainStocksList = ref([]) // All options chain data
  const subscriptionchainStocksList = ref([]) // For WebSocket subscription
  const chainSpotdata = ref({}) // Spot price data
  const chainSpotPrice = ref({})
  
  // Segregated Options Data
  const upcallSO = ref([]) // Call options above spot
  const upputSO = ref([]) // Put options above spot
  const dwncallSO = ref([]) // Call options below spot
  const dwnputSO = ref([]) // Put options below spot
  const callsideopc = ref([]) // All call options
  const putsideopc = ref([]) // All put options
  
  // PCR (Put Call Ratio)
  const pcrRatio = ref(0.0)
  const pcrputRatio = ref(0.0)
  const pcrcallRatio = ref(0.0)
  
  // Bar Calculations
  const barCallsOi = ref(null)
  const barPutsOi = ref(null)
  
  // Column Visibility Settings
  const bitcheckbox = ref(true) // BID column
  const askcheckbox = ref(true) // ASK column
  const ivcheckbox = ref(false) // IV column
  const thetacheckbox = ref(false) // THETA column
  const vagacheckbox = ref(false) // VEGA column
  const gamacheckbox = ref(false) // GAMA column
  const deltacheckbox = ref(false) // DELTA column
  
  // Table Style Settings
  const opchtablehead = ref(10) // Column count for header
  const simtblwidth = ref('100%') // Table width
  const simtblscroll = ref('hidden') // Scroll behavior
  
  // Settings Drawer
  const drawer = ref(false)
  
  // Position Data
  const positiondata = ref([])
  const positions = ref(null)
  
  // Greeks Counter
  const greekCount = ref(0)
  
  // Data Processing Arrays
  const data1 = ref([]) // Processed expiry dates
  const tsym = ref([]) // Symbol list
  const optionchain = ref([]) // Raw option chain data
  const opexch = ref('') // Options exchange
  const securityinfo = ref([]) // Security information
  const opname = ref('') // Option name
  const exchange = ref('') // Exchange
  const scriptToken = ref('') // Script token
  const optoken = ref('') // Option token
  
  // User Session
  const userid = ref('')
  const usession = ref('')
  
  // Computed Properties
  const opdatabgs = computed(() => {
    // Calculate background color based on theme
    // Note: Will need to check theme from Vuetify theme or use CSS variable
    const isDark = document.documentElement.classList.contains('v-theme--dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches
    return `background-color: ${isDark ? '#1E222D' : '#F9FCFF'} !important;`
  })
  
  // Actions
  const clearOption = (flow) => {
    if (!flow) {
      optionchainid.value = false
    }
    chainStocksList.value = []
    greekCount.value = 0
    chainSpotdata.value = {}
    lsexd.value = []
    upcallSO.value = []
    upputSO.value = []
    dwncallSO.value = []
    dwnputSO.value = []
    daydiff.value = ''
    barCallsOi.value = null
    barPutsOi.value = null
    callsideopc.value = []
    putsideopc.value = []
    data1.value = []
    optionchain.value = []
    chainSpotPrice.value = {}
    dwncallSO.value = []
    dwnputSO.value = []
    upcallSO.value = []
    upputSO.value = []
    optionStockSymbolInfo.value = {}
    subscriptionchainStocksList.value = []
  }
  
  const setOptionChainData = (data) => {
    optionchain.value = data
    chainStocksList.value = data.values || []
    subscriptionchainStocksList.value = data.values || []
  }
  
  const calculatePCR = () => {
    const oitotalupcal = upcallSO.value.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const oitotaldowncal = dwncallSO.value.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const pcrcall = oitotalupcal + oitotaldowncal

    const oitotalupput = upputSO.value.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const oitotaldownput = dwnputSO.value.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const pcrput = oitotalupput + oitotaldownput

    if (pcrcall > 0) {
      pcrRatio.value = Number(pcrput / pcrcall).toFixed(2)
    } else {
      pcrRatio.value = 0.0
    }
    pcrcallRatio.value = Number(pcrcall).toFixed(2)
    pcrputRatio.value = Number(pcrput).toFixed(2)
  }
  
  const updateColumnVisibility = () => {
    // Calculate table width and column count based on visible columns
    // This is called from the component's simpleTablestyle() function
    let columnCount = 0

    // Base columns (always visible)
    columnCount += 2 // VOL
    columnCount += 2 // OI
    columnCount += 2 // CH
    columnCount += 2 // LTP
    columnCount += 4 // STRIKES

    // Optional columns
    if (bitcheckbox.value) columnCount += 1 // BID
    if (askcheckbox.value) columnCount += 1 // ASK
    if (ivcheckbox.value) columnCount += 1 // IV

    // Greeks (optional)
    if (thetacheckbox.value) columnCount += 1 // THETA
    if (vagacheckbox.value) columnCount += 1 // VEGA
    if (gamacheckbox.value) columnCount += 1 // GAMA
    if (deltacheckbox.value) columnCount += 1 // DELTA

    // Update column count for header
    opchtablehead.value = columnCount

    // Update table width based on column count
    const baseWidth = 400 // Base width for strike price and fixed columns
    const columnWidth = 60 // Average column width
    const calculatedWidth = baseWidth + (columnCount * columnWidth)

    if (calculatedWidth > (typeof window !== 'undefined' ? window.innerWidth - 100 : 1200)) {
      simtblwidth.value = '100%'
      simtblscroll.value = 'auto'
    } else {
      simtblwidth.value = `${calculatedWidth}px`
      simtblscroll.value = 'hidden'
    }
  }
  
  const loadColumnSettings = (uid) => {
    if (!uid) return
    
    try {
      const opdatstrue = JSON.parse(localStorage.getItem(`${uid}_opdatstrue`))
      const opvalstrue = JSON.parse(localStorage.getItem(`${uid}_opvalstrue`))
      
      if (opdatstrue) {
        ivcheckbox.value = opdatstrue.ivcheckbox || false
        vagacheckbox.value = opdatstrue.vagacheckbox || false
        thetacheckbox.value = opdatstrue.thetacheckbox || false
        gamacheckbox.value = opdatstrue.gamacheckbox || false
        deltacheckbox.value = opdatstrue.deltacheckbox || false
        bitcheckbox.value = opdatstrue.bitcheckbox !== undefined ? opdatstrue.bitcheckbox : true
        askcheckbox.value = opdatstrue.askcheckbox !== undefined ? opdatstrue.askcheckbox : true
      }
    } catch (error) {
      console.error('Error loading column settings:', error)
    }
  }
  
  const saveColumnSettings = (uid) => {
    if (!uid) return
    
    try {
      const opdatstrue = {
        ivcheckbox: ivcheckbox.value,
        vagacheckbox: vagacheckbox.value,
        thetacheckbox: thetacheckbox.value,
        gamacheckbox: gamacheckbox.value,
        deltacheckbox: deltacheckbox.value,
        bitcheckbox: bitcheckbox.value,
        askcheckbox: askcheckbox.value
      }
      localStorage.setItem(`${uid}_opdatstrue`, JSON.stringify(opdatstrue))
    } catch (error) {
      console.error('Error saving column settings:', error)
    }
  }
  
  return {
    // State
    optionchainid,
    coractdata,
    coractloader,
    optionStockSymbol,
    optionStockSpot,
    optionStockSymbolInfo,
    optionStockName,
    lsexd,
    lsexdfilter,
    lsexdval,
    daydiff,
    ccfilter,
    chainCount,
    chainStocksList,
    subscriptionchainStocksList,
    chainSpotdata,
    chainSpotPrice,
    upcallSO,
    upputSO,
    dwncallSO,
    dwnputSO,
    callsideopc,
    putsideopc,
    pcrRatio,
    pcrputRatio,
    pcrcallRatio,
    barCallsOi,
    barPutsOi,
    bitcheckbox,
    askcheckbox,
    ivcheckbox,
    thetacheckbox,
    vagacheckbox,
    gamacheckbox,
    deltacheckbox,
    opchtablehead,
    simtblwidth,
    simtblscroll,
    drawer,
    positiondata,
    positions,
    greekCount,
    data1,
    tsym,
    optionchain,
    opexch,
    securityinfo,
    opname,
    exchange,
    scriptToken,
    optoken,
    userid,
    usession,
    // Computed
    opdatabgs,
    // Actions
    clearOption,
    setOptionChainData,
    calculatePCR,
    updateColumnVisibility,
    loadColumnSettings,
    saveColumnSettings,
  }
})

