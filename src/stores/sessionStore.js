import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiurl from '../apiurl'
import fire from '../firebase'
import router from '../router'

export const useSessionStore = defineStore('session', () => {
  // State
  const mynturl = ref({})
  const firebaseConfig = ref(null)
  const source = ref(null)
  
  // Session management state
  const sessionStatus = ref(null) // 'valid' | 'invalid' | 'logged_out_another_system' | null
  const lastSessionCheck = ref(null) // timestamp of last check
  const sessionCheckInterval = ref(null) // interval ID for periodic checks
  const checkInterval = ref(5 * 60 * 1000) // 5 minutes

  // Actions
  const initializeConfig = async () => {
    if (firebaseConfig.value && firebaseConfig.value.source) {
      source.value = firebaseConfig.value.source
    } else {
      try {
        await fire.get(fire.child(fire.ref(fire.db), `desk/`)).then((snapshot) => {
          if (snapshot.exists()) {
            firebaseConfig.value = snapshot.val()
            source.value = firebaseConfig.value.source
          } else {
            firebaseConfig.value = 'WEB'
            source.value = "WEB"
          }
        }).catch((error) => {
          // console.error(error)
          firebaseConfig.value = 'WEB'
          source.value = "WEB"
        })

        const url = new URL(window.location.href)
        const soc = url.searchParams.get("src")
        const mainsoc = soc ? soc : sessionStorage.getItem(`socsrc`)
        
        if (mainsoc) {
          source.value = mainsoc
          firebaseConfig.value.source = mainsoc
          sessionStorage.setItem(`socsrc`, source.value)
        }
      } catch (error) {
        // console.error('Error initializing config:', error)
        firebaseConfig.value = 'WEB'
        source.value = "WEB"
      }
    }
  }

  const updateMyntUrl = (config) => {
    // console.log("🔄 updateMyntUrl called with config:", config)
    mynturl.value = {
      ...mynturl.value,
      myntapi: config.url,
      source: config.source,
      wss: config.wss,
      stat: 1
    }
    apiurl.mynturl = mynturl.value
    
    // Store in sessionStorage for persistence
    if (config.clientid) {
      sessionStorage.setItem(`mynturl_${config.clientid}`, JSON.stringify(mynturl.value))
    } else {
      // console.error("❌ No clientid provided, cannot save to sessionStorage")
    }
  }
  
  const loadMyntUrl = (uid) => {
    const stored = sessionStorage.getItem(`mynturl_${uid}`)
    // console.log("🔍 Looking for mynturl in sessionStorage with key:", `mynturl_${uid}`)
    // console.log("🔍 Stored value exists:", !!stored)
    if (stored) {
      // console.log("🔍 Stored value content:", stored.substring(0, 100))
    }
    if (stored) {
      try {
        mynturl.value = JSON.parse(stored)
        apiurl.mynturl = mynturl.value
        // console.log("✅ Successfully loaded mynturl with stat:", mynturl.value.stat)
        return true
      } catch (e) {
        // console.error("Error loading mynturl from sessionStorage:", e)
      }
    }
    // console.log("❌ No mynturl found in sessionStorage for uid:", uid)
    return false
  }

  const getSource = () => {
    return source.value
  }

  const resetConfig = () => {
    mynturl.value = {}
    firebaseConfig.value = null
    source.value = null
  }

  // Session checking and monitoring
  const checkSession = async (uid) => {
    if (!uid) return null
    
    try {
      const { getActiveSession } = await import('../components/mixins/getAPIdata.js')
      const result = await getActiveSession(uid)
      lastSessionCheck.value = Date.now()
      
      if (result && result.stat === "Ok" && result.apitoken && result.token) {
        sessionStatus.value = 'valid'
        return { valid: true, data: result }
      } else if (result && result.emsg) {
        sessionStatus.value = 'invalid'
        return { valid: false, error: result.emsg, data: result }
      } else {
        sessionStatus.value = 'invalid'
        return { valid: false, error: 'Session validation failed', data: result }
      }
    } catch (error) {
      sessionStatus.value = 'error'
      // console.error('Session check error:', error)
      return { valid: false, error: error.message }
    }
  }

  const handleSessionError = (error, authStore, appStore) => {
    // Extract error message (exact same as old app: line 713)
    const errorMsg = error.emsg ? error.emsg : (typeof error === 'string' ? error : "Session expired : Invalid Session Key")

    // Check if it's "another system" error or session expired
    const isAnotherSystem = typeof errorMsg === 'string' &&
      (errorMsg.includes('another system') ||
       errorMsg.includes('already logged in') ||
       errorMsg.includes('logged in on') ||
       errorMsg.includes('Session Expired') ||
       errorMsg.includes('Invalid Session Key'))

    // console.log("🔄 Session error detected, logging out user:", errorMsg);

    // IMPORTANT: Clear sessionStorage FIRST so components reading from it get null immediately
    sessionStorage.removeItem("c3RhdHVz")
    sessionStorage.removeItem("userid")
    sessionStorage.removeItem("usession")
    sessionStorage.removeItem("msession")

    // CRITICAL FIX: Clear user-specific cache data
    sessionStorage.removeItem("holdings_last")
    sessionStorage.removeItem("mfholdings_last")
    sessionStorage.removeItem("positions_last")
    sessionStorage.removeItem("exposures_last")

    // Clear user-related data from localStorage
    localStorage.removeItem("profile_data")
    localStorage.removeItem("client_data")

    // CRITICAL FIX: Clear Pinia stores to prevent data leak between users
    // Import and clear positions and holdings stores
    try {
      const { usePositionsStore } = require('./positionsStore')
      const { useHoldingsStore } = require('./holdingsStore')

      const positionsStore = usePositionsStore()
      const holdingsStore = useHoldingsStore()

      positionsStore.clearPositions()
      holdingsStore.clearHoldings()

      console.log('🧹 [SESSION] Cleared positions and holdings stores on logout')
    } catch (e) {
      // Stores might not be available in all contexts
      console.log('⚠️ [SESSION] Could not clear stores:', e.message)
    }

    // Clear auth store completely (removes all login functionality)
    // This will trigger watchers in components that watch authStore.uid
    authStore.clearAuth()

    // Reset storage
    appStore.resetStorage()
    
    // Show snackbar message FIRST before any navigation or cleanup
    // This ensures the user sees the message
    appStore.showSnackbar(2, errorMsg)
    
    // Small delay to ensure snackbar is visible before navigation
    setTimeout(() => {
      // Emit storage-reset event (exact same as old app: line 714)
      // In Vue 3, we dispatch a custom event instead of eventBus
      window.dispatchEvent(new CustomEvent('storage-reset'))
      
      // Immediate navigation to stocks page
      // This ensures user is logged out immediately and navigated to the page shown before login
      // console.log("🔄 Immediate logout and navigation to stocks page due to session end");
      
      // Navigate immediately to stocks page (the page shown before login)
      router.push('/stocks').catch((err) => {
        // Ignore navigation errors (e.g., already on stocks page)
        if (err.name !== 'NavigationDuplicated') {
          // console.error('Navigation error:', err);
        }
      });
    }, 100);
    
    // Refresh the app after a short delay to ensure complete reset
    // This ensures UI is completely reset to initial state
    setTimeout(() => {
      // console.log("🔄 Refreshing app due to session expiration or invalid key");
      // Force full page reload to reset all app state
      window.location.reload();
    }, 500);
  }

  // Note: Old app does NOT have periodic session monitoring
  // It only checks session on login, not periodically
  // So we don't need startSessionMonitoring or stopSessionMonitoring
  // Keeping these functions for potential future use, but not calling them
  const startSessionMonitoring = (uid, authStore, appStore) => {
    // Old app does NOT have periodic monitoring
    // Only check on login, not periodically
    // console.log("ℹ️ Session monitoring not used - old app only checks on login")
  }

  const stopSessionMonitoring = () => {
    // Old app does NOT have periodic monitoring
    // console.log("ℹ️ Session monitoring not used - old app only checks on login")
  }

  return {
    // State
    mynturl,
    firebaseConfig,
    source,
    sessionStatus,
    lastSessionCheck,
    sessionCheckInterval,
    checkInterval,
    // Actions
    initializeConfig,
    updateMyntUrl,
    loadMyntUrl,
    getSource,
    resetConfig,
    checkSession,
    handleSessionError,
    startSessionMonitoring,
    stopSessionMonitoring
  }
})

