import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBSKMargin, getSecuritydata, getKambalaSearch } from '@/components/mixins/getAPIdata.js'
import { useAuthStore } from './authStore.js'
import { useAppStore } from './appStore.js'

export const useBasketStore = defineStore('basket', () => {
  const authStore = useAuthStore()
  const appStore = useAppStore()

  // State
  const allBaskets = ref([])
  const activeBasket = ref(null)
  const basketItems = ref([])
  const loading = ref(false)
  const searchLoading = ref(false)
  const orderLoader = ref(false)
  
  // Form state
  const selectedScript = ref(null)
  const buyOrSell = ref(false)
  const investType = ref('I')
  const priceType = ref('LMT')
  const quantity = ref(0)
  const price = ref(0)
  const triggerPrice = ref(0)
  const marketProtection = ref(5)
  const afterMarket = ref(false)
  const editMode = ref(false)
  const editItem = ref(null)
  
  // Search
  const searchItems = ref([])
  const searchQuery = ref('')
  const noData = ref(null)
  
  // Margin
  const basketMargin = ref({})
  const totalMargin = ref('0.00')
  const postTradeMargin = ref('0.00')
  
  // Dialogs
  const createDialog = ref(false)
  const basketDialog = ref(false)
  const deleteDialog = ref(false)
  const basketName = ref('')
  const editTarget = ref(null)
  
  // Investment type options
  const investItems = {
    0: [
      { txt: 'Intraday', val: 'I' },
      { txt: 'Delivery', val: 'C' },
    ],
    1: [
      { txt: 'Intraday', val: 'I' },
      { txt: 'Carry Forward', val: 'M' },
    ],
    I: 'Intraday',
    C: 'Delivery',
    M: 'Carry Forward',
    H: 'Cover order',
    B: 'Bracket order',
  }
  
  // Price type options
  const priceItems = [
    { txt: 'Limit', val: 'LMT' },
    { txt: 'Market', val: 'MKT' },
    { txt: 'SL Limit', val: 'SL-LMT' },
    { txt: 'SL Mkt', val: 'SL-MKT' },
  ]
  
  // Getters
  const filteredBaskets = computed(() => {
    const query = searchQuery.value?.toLowerCase()
    if (!query) return allBaskets.value
    return allBaskets.value.filter(b => b.name && b.name.toLowerCase().includes(query))
  })
  
  const canCreateBasket = computed(() => {
    return allBaskets.value.length < 10
  })
  
  const canAddItem = computed(() => {
    return basketItems.value.length < 20
  })
  
  // Actions
  function loadBaskets() {
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) {
        allBaskets.value = []
        return
      }
      const raw = localStorage.getItem(`${uid}_basketorder`)
      allBaskets.value = raw ? JSON.parse(raw) : []
    } catch (e) {
      console.error('Error loading baskets:', e)
      allBaskets.value = []
    }
  }
  
  function saveBaskets() {
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) return
      localStorage.setItem(`${uid}_basketorder`, JSON.stringify(allBaskets.value))
    } catch (e) {
      console.error('Error saving baskets:', e)
    }
  }
  
  function createBasket(name) {
    const trimmedName = name?.trim()
    if (!trimmedName) return false
    
    // Check if basket name already exists
    const existingIndex = allBaskets.value.findIndex(b => b.name === trimmedName)
    if (existingIndex >= 0) {
      appStore.showSnackbar(2, `${trimmedName}, script is already exists.`)
      return false
    }
    
    const basket = {
      name: trimmedName,
      date: new Date().toDateString(),
      idx: Date.now(),
      list: [],
    }
    
    allBaskets.value.push(basket)
    saveBaskets()
    appStore.showSnackbar(1, 'Basket have been Created')
    return true
  }
  
  function updateBasket(basket, name) {
    const trimmedName = name?.trim()
    if (!trimmedName || !basket) return false
    
    const index = allBaskets.value.findIndex(b => b.idx === basket.idx)
    if (index >= 0) {
      allBaskets.value[index].name = trimmedName
      saveBaskets()
      return true
    }
    return false
  }
  
  function deleteBasket(basket) {
    if (!basket) return false
    const index = allBaskets.value.findIndex(b => b.idx === basket.idx)
    if (index >= 0) {
      allBaskets.value.splice(index, 1)
      saveBaskets()
      appStore.showSnackbar(2, 'Basket Order have been Cancelled')
      return true
    }
    return false
  }
  
  function openBasket(basket) {
    if (!basket) return
    
    // Clean expired items (check expiry dates)
    const cleanedList = (basket.list || []).filter(item => {
      if (item[0] && item[0].exd) {
        const exd = new Date(item[0].exd)
        const today = new Date()
        exd.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        return today <= exd
      }
      return true
    })
    
    // Update basket if items were removed
    if (cleanedList.length !== basket.list.length) {
      const index = allBaskets.value.findIndex(b => b.idx === basket.idx)
      if (index >= 0) {
        allBaskets.value[index].list = cleanedList
        saveBaskets()
      }
    }
    
    activeBasket.value = { ...basket, list: cleanedList }
    basketItems.value = [...cleanedList]
    basketDialog.value = true
  }
  
  function closeBasket() {
    basketDialog.value = false
    activeBasket.value = null
    basketItems.value = []
    selectedScript.value = null
    resetItemForm()
  }
  
  function addItemToBasket(item) {
    if (!activeBasket.value || !item) return false
    
    const index = allBaskets.value.findIndex(b => b.idx === activeBasket.value.idx)
    if (index >= 0) {
      if (!allBaskets.value[index].list) {
        allBaskets.value[index].list = []
      }
      allBaskets.value[index].list.push(item)
      basketItems.value.push(item)
      activeBasket.value.list = [...allBaskets.value[index].list]
      saveBaskets()
      return true
    }
    return false
  }
  
  function updateItemInBasket(item) {
    if (!activeBasket.value || !item) return false
    
    const basketIndex = allBaskets.value.findIndex(b => b.idx === activeBasket.value.idx)
    if (basketIndex >= 0) {
      const itemIndex = allBaskets.value[basketIndex].list.findIndex(i => i.token === item.token && i.idx === item.idx)
      if (itemIndex >= 0) {
        allBaskets.value[basketIndex].list[itemIndex] = { ...item }
        basketItems.value[itemIndex] = { ...item }
        activeBasket.value.list = [...allBaskets.value[basketIndex].list]
        saveBaskets()
        return true
      }
    }
    return false
  }
  
  function removeItemFromBasket(item) {
    if (!activeBasket.value || !item) return false
    
    const basketIndex = allBaskets.value.findIndex(b => b.idx === activeBasket.value.idx)
    if (basketIndex >= 0) {
      const itemIndex = allBaskets.value[basketIndex].list.findIndex(i => i.token === item.token && i.idx === item.idx)
      if (itemIndex >= 0) {
        allBaskets.value[basketIndex].list.splice(itemIndex, 1)
        basketItems.value.splice(itemIndex, 1)
        activeBasket.value.list = [...allBaskets.value[basketIndex].list]
        saveBaskets()
        return true
      }
    }
    return false
  }
  
  function duplicateItem(item) {
    if (!activeBasket.value || !item) return false
    
    const duplicated = {
      ...item,
      idx: Date.now(),
    }
    return addItemToBasket(duplicated)
  }
  
  async function searchScript(query) {
    if (!query || query.length <= 2) {
      searchItems.value = []
      noData.value = null
      return
    }
    
    searchLoading.value = true
    noData.value = null
    
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      const mtoken = authStore.mtoken || sessionStorage.getItem('msession')
      
      if (!uid || !mtoken) {
        searchItems.value = []
        return
      }
      
      const res = await getKambalaSearch(`jData={"uid":"${uid}","stext":"${query.replace('&', '%26')}"}&jKey=${mtoken}`)
      
      if (res.stat === 'Ok' || res.values) {
        let data = res.values || []
        
        // Filter out items already in basket
        for (let i = 0; i < basketItems.value.length; i++) {
          const index = data.findIndex(script => script.token === basketItems.value[i].token)
          if (index >= 0) {
            data.splice(index, 1)
          }
        }
        
        searchItems.value = data
      } else {
        searchItems.value = []
        noData.value = 'noooo'
      }
    } catch (e) {
      console.error('Error searching scripts:', e)
      searchItems.value = []
      noData.value = 'noooo'
    } finally {
      searchLoading.value = false
    }
  }
  
  async function calculateMargin() {
    if (!basketItems.value || basketItems.value.length === 0) {
      totalMargin.value = '0.00'
      postTradeMargin.value = '0.00'
      basketMargin.value = {}
      return
    }
    
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) return
      
      let item = null
      
      for (let i = 0; i < basketItems.value.length; i++) {
        const basketItem = basketItems.value[i]
        
        if (i === 0) {
          item = {
            uid: uid,
            actid: uid,
            discqty: '0',
            exch: basketItem.exch,
            pCode: basketItem.investype,
            prctyp: basketItem.prctype,
            prd: basketItem.investype,
            prc: basketItem.prctype,
            qty: String(basketItem.qty),
            ret: 'DAY',
            symbol_id: basketItem.token,
            tsym: basketItem.tsym,
            trantype: basketItem.buyrsell ? 'S' : 'B',
            trgprc: (basketItem.prctype === 'SL-LMT' || basketItem.prctype === 'SL-MKT') ? String(basketItem.trgprice || 0) : '0',
            basketlists: [],
          }
        } else {
          item.basketlists.push({
            uid: uid,
            actid: uid,
            discqty: '0',
            exch: basketItem.exch,
            pCode: basketItem.investype,
            prctyp: basketItem.prctype,
            prd: basketItem.investype,
            prc: basketItem.prctype,
            qty: String(basketItem.qty),
            ret: 'DAY',
            symbol_id: basketItem.token,
            tsym: basketItem.tsym,
            trantype: basketItem.buyrsell ? 'S' : 'B',
            trgprc: (basketItem.prctype === 'SL-LMT' || basketItem.prctype === 'SL-MKT') ? String(basketItem.trgprice || 0) : '0',
          })
        }
      }
      
      if (item) {
        const marginData = await getBSKMargin(item)
        totalMargin.value = marginData.marginused == undefined ? '0.00' : String(marginData.marginused || '0.00')
        postTradeMargin.value = marginData.marginusedtrade == undefined ? '0.00' : String(marginData.marginusedtrade || '0.00')
        basketMargin.value = marginData
      }
    } catch (e) {
      console.error('Error calculating margin:', e)
      totalMargin.value = '0.00'
      postTradeMargin.value = '0.00'
      basketMargin.value = {}
    }
  }
  
  function placeBasketOrder() {
    if (!basketItems.value || basketItems.value.length === 0) return
    
    // Split slice orders if needed
    const splitItems = basketItems.value.flatMap(item => {
      if (item.slicetimes && item[0] && item[0].frzqty) {
        const so = { ...item, qty: item[0].frzqty }
        const slice0 = item.slice[0] || 0
        const slice1 = item.slice[1] || 0
        
        if (slice0 > 0) {
          const filled = Array(slice0).fill(so)
          if (slice1 > 0) {
            return [...filled, { ...so, qty: slice1 }]
          }
          return filled
        }
        if (slice1 > 0) {
          return [{ ...so, qty: slice1 }]
        }
      }
      return item
    })
    
    // Emit event
    window.dispatchEvent(new CustomEvent('place-bskord', {
      detail: splitItems
    }))
    
    basketDialog.value = false
  }
  
  function subscribeWebSocket(items) {
    if (!items || items.length === 0) return
    
    const flow = 'sub'
    const data = items.map(item => ({
      exch: item.exch,
      token: item.token
    }))
    
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
      detail: { flow, data, page: 'bsk' }
    }))
  }
  
  function unsubscribeWebSocket(items) {
    if (!items || items.length === 0) return
    
    const flow = 'unsub'
    const data = items.map(item => ({
      exch: item.exch,
      token: item.token
    }))
    
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
      detail: { flow, data, page: 'bsk' }
    }))
  }
  
  function updatePrice(data) {
    if (!data || !data.token) return
    
    // Update selected script price if it matches
    if (selectedScript.value && selectedScript.value.token === data.token) {
      if (!selectedScript.value.ws) {
        selectedScript.value.ws = {}
      }
      selectedScript.value.ws.lp = Number(data.lp).toFixed(2)
      selectedScript.value.ws.ch = Number(data.ch || 0).toFixed(2)
      selectedScript.value.ws.chp = Number(data.chp || 0).toFixed(2)
      
      // Auto-update price if LMT or SL-LMT
      if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
        price.value = Number(data.lp).toFixed(2)
      }
    }
    
    // Update basket items
    for (let i = 0; i < basketItems.value.length; i++) {
      if (basketItems.value[i].token === data.token) {
        basketItems.value[i].ltp = Number(data.lp).toFixed(2)
        basketItems.value[i].ch = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : '0.00'
        basketItems.value[i].chp = data.chp ? Number(data.chp).toFixed(2) : '0.00'
      }
    }
    
    // Update active basket list
    if (activeBasket.value && activeBasket.value.list) {
      for (let i = 0; i < activeBasket.value.list.length; i++) {
        if (activeBasket.value.list[i].token === data.token) {
          activeBasket.value.list[i].ltp = Number(data.lp).toFixed(2)
          activeBasket.value.list[i].ch = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : '0.00'
          activeBasket.value.list[i].chp = data.chp ? Number(data.chp).toFixed(2) : '0.00'
        }
      }
    }
    
    // Update all baskets storage
    if (activeBasket.value) {
      const index = allBaskets.value.findIndex(b => b.idx === activeBasket.value.idx)
      if (index >= 0) {
        allBaskets.value[index].list = [...basketItems.value]
        saveBaskets()
      }
    }
  }
  
  function resetItemForm() {
    selectedScript.value = null
    buyOrSell.value = false
    investType.value = 'I'
    priceType.value = 'LMT'
    quantity.value = 0
    price.value = 0
    triggerPrice.value = 0
    marketProtection.value = 5
    afterMarket.value = false
    editMode.value = false
    editItem.value = null
    searchItems.value = []
    searchQuery.value = ''
    noData.value = null
  }
  
  function setEditItem(item) {
    if (!item) return
    
    editMode.value = true
    editItem.value = item
    selectedScript.value = { ...item }
    buyOrSell.value = item.buyrsell || false
    quantity.value = Number(item.qty || 0)
    investType.value = item.investype || 'I'
    priceType.value = item.prctype || 'LMT'
    price.value = item.price || 0
    triggerPrice.value = item.trgprice || 0
    marketProtection.value = item.mktprdordqty || 5
    afterMarket.value = item.addmktord || false
  }
  
  return {
    // State
    allBaskets,
    activeBasket,
    basketItems,
    loading,
    searchLoading,
    orderLoader,
    selectedScript,
    buyOrSell,
    investType,
    priceType,
    quantity,
    price,
    triggerPrice,
    marketProtection,
    afterMarket,
    editMode,
    editItem,
    searchItems,
    searchQuery,
    noData,
    basketMargin,
    totalMargin,
    postTradeMargin,
    createDialog,
    basketDialog,
    deleteDialog,
    basketName,
    editTarget,
    investItems,
    priceItems,
    // Getters
    filteredBaskets,
    canCreateBasket,
    canAddItem,
    // Actions
    loadBaskets,
    saveBaskets,
    createBasket,
    updateBasket,
    deleteBasket,
    openBasket,
    closeBasket,
    addItemToBasket,
    updateItemInBasket,
    removeItemFromBasket,
    duplicateItem,
    searchScript,
    calculateMargin,
    placeBasketOrder,
    subscribeWebSocket,
    unsubscribeWebSocket,
    updatePrice,
    resetItemForm,
    setEditItem,
  }
})

