import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useNavStore = defineStore('navigation', () => {
  const router = useRouter()
  const menudata = ref({})

  // Action to navigate to single stock details
  const navigateToStockDetails = (type, token, exch, tsym, trantype, item) => {
    console.log(type, token, exch, tsym, trantype, item)
    if (type === "detail") {
      router.push({ 
        name: "single stocks", 
        params: { token: token, tsym: tsym, exch: exch } 
      })
    }
  }

  // Action to trigger login
  const triggerLogin = (flow) => {
    window.location.assign(
      `https://desk.zebuetrade.com/mynt/?${flow ? 'mode=QR&' : ''}url=${window.location.origin + window.location.pathname}`
    )
  }

  return {
    menudata,
    navigateToStockDetails,
    triggerLogin
  }
})

