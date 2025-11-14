import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const snackbar = ref(false)
  const snackcolor = ref('#121212')
  const snacktxt = ref('')
  const subloader = ref(false)
  const mainloader = ref(true)
  const showalert = ref(false)
  const showalertmsg = ref(null)
  const wllayout = ref(false)
  const snackalerts = ref([])
  const wsorderalertdata = ref([])
  const orderprefd = ref({
    stickysrc: false,
    quicksrc: false,
    expos: "MKT",
    mktpro: 5,
    qtypre: "0",
    mainpreitems: { 
      NSE: ["CNC", "LMT", "DAY", ""], 
      BSE: ["CNC", "LMT", "DAY", ""], 
      MCX: ["NRML", "LMT", "DAY", ""], 
      NFO: ["NRML", "LMT", "DAY", ""], 
      CDS: ["NRML", "LMT", "DAY", ""], 
      BFO: ["NRML", "LMT", "EOS", ""], 
      BCD: ["NRML", "LMT", "EOS", ""] 
    },
  })
  const onlinestat = ref(true)
  const onLinebanner = ref(false)
  const lowConnection = ref(false)

  // Actions
  const showSnackbar = (color, msg) => {
    const regex = /^Error Occurred : \d+ "no data"$/
    if (JSON.stringify(msg) == "[]" || regex.test(msg)) {
      // Do nothing
      return
    }
    
    // Extract message text if it's an object
    let messageText = msg
    if (typeof msg === 'object' && msg !== null) {
      messageText = msg.emsg || msg.message || msg.toString()
    }
    
    // Check if this is a genuine session expiry message (should be shown)
    const isSessionExpired = typeof messageText === 'string' && 
      (messageText.toLowerCase().includes('session expired') || 
       messageText.toLowerCase().includes('invalid session key') ||
       messageText.toLowerCase().includes('session expired : invalid session key'))
    
    // Check if this is just a WebSocket connection attempt (should be hidden)
    const isWebSocketAttempt = messageText === 'attempt' || 
                              (typeof messageText === 'string' && 
                               messageText.includes('attempt') && 
                               !isSessionExpired) ||
                              (typeof messageText === 'string' && 
                               messageText.includes('WebSocket') && 
                               !isSessionExpired)
    
    // Don't show snackbar for WebSocket connection attempts (but show session expired)
    if (isWebSocketAttempt && !isSessionExpired) {
      snackbar.value = false
      return
    }
    
    snackbar.value = true
    
    // Handle session expired messages - always show these
    if (isSessionExpired || 
        (msg && typeof msg === 'object' && msg.message == "Request failed with status code 401") ||
        (typeof messageText === 'string' && messageText.includes("Session Expired")) ||
        messageText == "mobile_unique not valid") {
      snackcolor.value = "warning"
      snacktxt.value = isSessionExpired ? messageText : "Session has expired. Please log in again."
      setTimeout(() => {
        resetStorage()
      }, 100)
    } else if (msg && !isWebSocketAttempt) {
      snackcolor.value = color == 0 ? "error" : color == 1 ? "success" : "warning"
      snacktxt.value = messageText == "500" ? "Network/Internal Server Error" : messageText
    }

    if (snackbar.value) {
      snackalerts.value.unshift({ 
        time: new Date().toLocaleTimeString("en-US"), 
        msg: snacktxt.value 
      })
      
      const uid = sessionStorage.getItem('userid')
      if (uid) {
        const logid = uid + new Date().toLocaleDateString()
        sessionStorage.setItem(logid, JSON.stringify(snackalerts.value))
      }
    }
  }

  const hideSnackbar = () => {
    snackbar.value = false
  }

  const showLoader = () => {
    subloader.value = true
  }

  const hideLoader = () => {
    subloader.value = false
  }

  const setMainLoader = (value) => {
    mainloader.value = value
  }

  const showAlert = (params) => {
    if (params && params.callback) {
      showalert.value = true
      showalertmsg.value = params
    }
  }

  const hideAlert = () => {
    showalert.value = false
    showalertmsg.value = null
  }

  const toggleWatchlistLayout = () => {
    wllayout.value = !wllayout.value
    const uid = sessionStorage.getItem('userid')
    if (uid) {
      localStorage.setItem(`${uid}_wllayout`, JSON.stringify(wllayout.value))
    }
  }

  const setWatchlistLayout = (value) => {
    wllayout.value = value
  }

  const resetStorage = () => {
    sessionStorage.removeItem("usession")
    sessionStorage.removeItem("userid")
    sessionStorage.removeItem("msession")
    sessionStorage.removeItem("imei")
    localStorage.removeItem("profile_data")
  }

  const addWSOrderAlert = (data) => {
    if (!data) return
    
    const msg = `Your ${data.trantype == "S" ? "SELL" : "BUY"} order ${data.norenordno} for <br> ${data.tsym} in ${data.exch} is ${data.status}`
    
    wsorderalertdata.value.push({
      message: msg,
      timeout: 3000,
      color: data.status == "COMPLETE" ? "success" : data.status == "REJECTED" || data.status == "CANCELED" ? "error" : "warning",
    })

    if (data && data.status) {
      const uid = sessionStorage.getItem('userid')
      if (uid) {
        snackalerts.value.unshift({ time: new Date().toLocaleTimeString("en-US"), msg: msg })
        const logid = uid + new Date().toLocaleDateString()
        sessionStorage.setItem(logid, JSON.stringify(snackalerts.value))
      }
    }
  }

  const getOrderPref = () => {
    return orderprefd.value
  }

  const setOrderPref = (pref) => {
    orderprefd.value = { ...orderprefd.value, ...pref }
  }

  const setConnectionStatus = (status) => {
    onlinestat.value = status
    if (onLinebanner.value && status) {
      document.title = "MYNT by Zebu - Invest & Trade"
      setTimeout(() => {
        onLinebanner.value = false
      }, 3000)
    } else {
      document.title = "❗MYNT by Zebu - Invest & Trade"
      onLinebanner.value = true
    }
  }

  const setLowConnection = (value) => {
    lowConnection.value = value
    document.title = `${value ? '❕' : ''}MYNT by Zebu - Invest & Trade`
    onLinebanner.value = value
  }

  const checkConnectionSpeed = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection && onlinestat.value) {
      const slowTypes = ['2g', 'slow-2g']
      setLowConnection(slowTypes.includes(connection.effectiveType))
    }
  }

  return {
    // State
    snackbar,
    snackcolor,
    snacktxt,
    subloader,
    mainloader,
    showalert,
    showalertmsg,
    wllayout,
    snackalerts,
    wsorderalertdata,
    orderprefd,
    onlinestat,
    onLinebanner,
    lowConnection,
    // Actions
    showSnackbar,
    hideSnackbar,
    showLoader,
    hideLoader,
    setMainLoader,
    showAlert,
    hideAlert,
    toggleWatchlistLayout,
    setWatchlistLayout,
    resetStorage,
    addWSOrderAlert,
    getOrderPref,
    setOrderPref,
    setConnectionStatus,
    setLowConnection,
    checkConnectionSpeed
  }
})

