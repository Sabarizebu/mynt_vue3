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
    // Match old code: simpleTablestyle() logic exactly
    let truecount = [
      ivcheckbox.value,
      vagacheckbox.value,
      thetacheckbox.value,
      gamacheckbox.value,
      deltacheckbox.value,
      bitcheckbox.value,
      askcheckbox.value
    ]
    
    let truemap = truecount.reduce((cnt, cur) => {
      cnt[cur] = (cnt[cur] || 0) + 1
      return cnt
    }, {})
    
    // Match old code: exact width and column count logic
    if (truemap.true === 7) {
      opchtablehead.value = 15
      simtblwidth.value = '1580px'
      simtblscroll.value = 'scroll'
    } else if (truemap.true === 6) {
      opchtablehead.value = 14
      simtblwidth.value = '1460px'
      simtblscroll.value = 'scroll'
    } else if (truemap.true === 5) {
      opchtablehead.value = 13
      simtblwidth.value = '1340px'
      simtblscroll.value = 'scroll'
    } else if (truemap.true === 4) {
      opchtablehead.value = 12
      simtblwidth.value = '1220px'
      simtblscroll.value = 'scroll'
    } else if (truemap.true === 3) {
      opchtablehead.value = 11
      simtblwidth.value = '1100px'
      simtblscroll.value = 'scroll'
    } else if (truemap.true === 1 || truemap.false === 7 || truemap.true === 2) {
      simtblwidth.value = '100%'
      simtblscroll.value = 'hidden'
      if (truemap.true === 2) {
        opchtablehead.value = 10
        simtblscroll.value = 'scroll'
      } else if (truemap.true === 1) {
        opchtablehead.value = 9
      } else if (truemap.false === 7) {
        opchtablehead.value = 8
      }
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
        
        // Match old code: Call defltTablestyle() after loading settings
        if (opvalstrue) {
          defltTablestyle(opvalstrue)
        }
      }
    } catch (error) {
      // console.error('Error loading column settings:', error)
    }
  }
  
  // Match old code: defltTablestyle() - uses saved opvalstrue instead of calculating
  const defltTablestyle = (opvalstrue) => {
    if (!opvalstrue) return
    
    // Match old code: exact logic from defltTablestyle()
    if (opvalstrue.true === '7' || opvalstrue.true === 7) {
      opchtablehead.value = 15
      simtblwidth.value = '1580px'
      simtblscroll.value = 'scroll'
    } else if (opvalstrue.true === '6' || opvalstrue.true === 6) {
      opchtablehead.value = 14
      simtblwidth.value = '1460px'
      simtblscroll.value = 'scroll'
    } else if (opvalstrue.true === '5' || opvalstrue.true === 5) {
      opchtablehead.value = 13
      simtblwidth.value = '1340px'
      simtblscroll.value = 'scroll'
    } else if (opvalstrue.true === '4' || opvalstrue.true === 4) {
      opchtablehead.value = 12
      simtblwidth.value = '1220px'
      simtblscroll.value = 'scroll'
    } else if (opvalstrue.true === '3' || opvalstrue.true === 3) {
      opchtablehead.value = 11
      simtblwidth.value = '1100px'
      simtblscroll.value = 'scroll'
    } else if (opvalstrue.false === '5' || opvalstrue.false === 5) {
      opchtablehead.value = 10
      simtblwidth.value = '100%'
      simtblscroll.value = 'hidden'
    } else if (opvalstrue.true === '1' || opvalstrue.true === 1 || opvalstrue.false === '7' || opvalstrue.false === 7) {
      simtblwidth.value = '100%'
      simtblscroll.value = 'hidden'
      if (opvalstrue.true === '2' || opvalstrue.true === 2) {
        opchtablehead.value = 10
        simtblscroll.value = 'scroll'
      } else if (opvalstrue.true === '1' || opvalstrue.true === 1) {
        opchtablehead.value = 9
      } else if (opvalstrue.false === '7' || opvalstrue.false === 7) {
        opchtablehead.value = 8
      }
    }
  }
  
  const saveColumnSettings = (uid) => {
    if (!uid) return
    
    try {
      // Match old code: Calculate truemap for saving
      let truecount = [
        ivcheckbox.value,
        vagacheckbox.value,
        thetacheckbox.value,
        gamacheckbox.value,
        deltacheckbox.value,
        bitcheckbox.value,
        askcheckbox.value
      ]
      
      let truemap = truecount.reduce((cnt, cur) => {
        cnt[cur] = (cnt[cur] || 0) + 1
        return cnt
      }, {})
      
      // Match old code: Save opdatstrue and opvalstrue
      const opdatstrue = JSON.stringify({
        ivcheckbox: ivcheckbox.value,
        vagacheckbox: vagacheckbox.value,
        thetacheckbox: thetacheckbox.value,
        gamacheckbox: gamacheckbox.value,
        deltacheckbox: deltacheckbox.value,
        askcheckbox: askcheckbox.value,
        bitcheckbox: bitcheckbox.value
      })
      
      const opvalstrue = JSON.stringify({
        true: String(truemap.true || 0),
        false: String(truemap.false || 0)
      })
      
      localStorage.setItem(`${uid}_opdatstrue`, opdatstrue)
      localStorage.setItem(`${uid}_opvalstrue`, opvalstrue)
    } catch (error) {
      // console.error('Error saving column settings:', error)
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
    defltTablestyle,
  }
})

