import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiurl from '../apiurl'
import fire from '../firebase'

export const useSessionStore = defineStore('session', () => {
  // State
  const mynturl = ref({})
  const firebaseConfig = ref(null)
  const source = ref(null)

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
          console.error(error)
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
        console.error('Error initializing config:', error)
        firebaseConfig.value = 'WEB'
        source.value = "WEB"
      }
    }
  }

  const updateMyntUrl = (config) => {
    console.log("🔄 updateMyntUrl called with config:", config)
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
      console.error("❌ No clientid provided, cannot save to sessionStorage")
    }
  }
  
  const loadMyntUrl = (uid) => {
    const stored = sessionStorage.getItem(`mynturl_${uid}`)
    console.log("🔍 Looking for mynturl in sessionStorage with key:", `mynturl_${uid}`)
    console.log("🔍 Stored value exists:", !!stored)
    if (stored) {
      console.log("🔍 Stored value content:", stored.substring(0, 100))
    }
    if (stored) {
      try {
        mynturl.value = JSON.parse(stored)
        apiurl.mynturl = mynturl.value
        console.log("✅ Successfully loaded mynturl with stat:", mynturl.value.stat)
        return true
      } catch (e) {
        console.error("Error loading mynturl from sessionStorage:", e)
      }
    }
    console.log("❌ No mynturl found in sessionStorage for uid:", uid)
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

  return {
    // State
    mynturl,
    firebaseConfig,
    source,
    // Actions
    initializeConfig,
    updateMyntUrl,
    loadMyntUrl,
    getSource,
    resetConfig
  }
})

