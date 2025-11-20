import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const uid = ref(null)
  const token = ref(null)
  const mtoken = ref(null)
  const user = ref(null)
  const sessionConfig = ref(null)
  const userdata = ref(null)
  const clientdata = ref({})
  const loading = ref(true)

  // Getters
  const isAuthenticated = () => {
    return !!uid.value && !!token.value
  }

  const useris = () => {
    return !!uid.value
  }

  // Actions
  const setAuth = (userId, userToken, msession) => {
    uid.value = userId
    token.value = userToken
    mtoken.value = msession
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const setSessionConfig = (config) => {
    sessionConfig.value = config
  }

  const setUserdata = (data) => {
    userdata.value = data
  }

  const setClientdata = (data) => {
    clientdata.value = data
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const clearAuth = () => {
    uid.value = null
    token.value = null
    mtoken.value = null
    user.value = null
    sessionConfig.value = null
    userdata.value = null
    clientdata.value = {}
    loading.value = true
    // Remove client_data from localStorage when clearing auth
    localStorage.removeItem("client_data")
  }

  const loadFromSession = () => {
    uid.value = sessionStorage.getItem("userid")
    token.value = sessionStorage.getItem("usession")
    mtoken.value = sessionStorage.getItem("msession")
    
    const profileData = localStorage.getItem("profile_data")
    if (profileData) {
      try {
        user.value = JSON.parse(profileData)
        // console.log(user.value, "user.value")
      } catch (e) {
        // console.error("Error parsing profile data:", e)
        user.value = null
      }
    }
    
    // Load clientdata from localStorage if available
    const storedClientData = localStorage.getItem("client_data")
    if (storedClientData && uid.value) {
      try {
        const parsedClientData = JSON.parse(storedClientData)
        // Only use if the uid matches (prevent using stale data from another user)
        if (parsedClientData.uid === uid.value && parsedClientData.data) {
          clientdata.value = parsedClientData.data
          // console.log("✅ Clientdata loaded from localStorage:", clientdata.value)
        }
      } catch (e) {
        // console.error("Error parsing client_data from localStorage:", e)
      }
    }
  }

  const loadFromUrl = () => {
    const url = new URL(window.location.href)
    const actid = url.searchParams.get("uid")
    const tokenParam = url.searchParams.get("token")
    const sess = url.searchParams.get("sess")

    if (typeof actid === "string" && typeof tokenParam === "string") {
      localStorage.removeItem("profile_data")
      sessionStorage.setItem("usession", tokenParam)
      sessionStorage.setItem("userid", actid)
      sessionStorage.setItem("msession", sess)
      sessionStorage.setItem("imei", url.searchParams.get("imei"))
      
      setAuth(actid, tokenParam, sess)
    }
  }

  const loadFromSharedSession = async () => {
    const url = new URL(window.location.href)
    const suser = url.searchParams.get("sUserId")
    const stoken = url.searchParams.get("sToken")

    if (typeof suser === "string" && typeof stoken === "string") {
      // This will be handled in the component with API call
      return { suser, stoken, pathname: url.pathname }
    }
    return null
  }

  const setupAuthFromUrl = () => {
    const url = new URL(window.location.href)
    const actid = url.searchParams.get("uid")
    const tokenParam = url.searchParams.get("token")
    const sess = url.searchParams.get("sess")

    if (typeof actid === "string" && typeof tokenParam === "string") {
      localStorage.removeItem("profile_data")
      sessionStorage.setItem("usession", tokenParam)
      sessionStorage.setItem("userid", actid)
      sessionStorage.setItem("msession", sess)
      sessionStorage.setItem("imei", url.searchParams.get("imei"))
      
      // Directly set the auth values instead of calling loadFromSession
      setAuth(actid, tokenParam, sess)
      return { actid, tokenParam }
    }
    return null
  }

  return {
    // State
    uid,
    token,
    mtoken,
    user,
    sessionConfig,
    userdata,
    clientdata,
    loading,
    // Getters
    isAuthenticated,
    useris,
    // Actions
    setAuth,
    setUser,
    setSessionConfig,
    setUserdata,
    setClientdata,
    setLoading,
    clearAuth,
    loadFromSession,
    loadFromUrl,
    loadFromSharedSession,
    setupAuthFromUrl
  }
})

