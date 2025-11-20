import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBSKMargin, getSecuritydata, getKambalaSearch, getPlaceOrder } from '@/components/mixins/getAPIdata.js'
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
  const priceManuallyEdited = ref(false)
  
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
    return true // No limit on basket items
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
      // console.error('Error loading baskets:', e)
      allBaskets.value = []
    }
  }
  
  function saveBaskets() {
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) return
      localStorage.setItem(`${uid}_basketorder`, JSON.stringify(allBaskets.value))
    } catch (e) {
      // console.error('Error saving baskets:', e)
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
    
    // Initialize ws object for items that have cached data but no ws object
    const itemsWithWS = cleanedList.map(item => {
      // If item already has ws object with valid data, keep it
      if (item.ws && item.ws.lp && Number(item.ws.lp) > 0) {
        return item
      }
      
      // Otherwise, initialize ws from cached ltp/lp data
      const cachedLTP = item.ltp || item.lp
      if (cachedLTP && Number(cachedLTP) > 0) {
        if (!item.ws) {
          item.ws = {}
        }
        item.ws.lp = Number(cachedLTP).toFixed(2)
        item.ws.ch = item.ch && !isNaN(Number(item.ch)) ? Number(item.ch).toFixed(2) : '0.00'
        item.ws.chp = item.chp && !isNaN(Number(item.chp)) ? Number(item.chp).toFixed(2) : '0.00'
      }
      
      return item
    })
    
    // Update basket if items were removed
    if (cleanedList.length !== basket.list.length) {
      const index = allBaskets.value.findIndex(b => b.idx === basket.idx)
      if (index >= 0) {
        allBaskets.value[index].list = itemsWithWS
        saveBaskets()
      }
    }
    
    activeBasket.value = { ...basket, list: itemsWithWS }
    basketItems.value = [...itemsWithWS]
    basketDialog.value = true
    calculateMargin()
  }
  
  function closeBasket() {
    basketDialog.value = false
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
      // console.error('Error searching scripts:', e)
      searchItems.value = []
      noData.value = 'noooo'
    } finally {
      searchLoading.value = false
    }
  }
  
  function validateBasketItem(item) {
    const errors = []
    const q = item
    const sec = item[0] || item['0']
    
    if (!q) {
      errors.push('Symbol not loaded')
      return errors
    }

    // Basket size limit removed

    // Product type validation - only allow I, C, M (Delivery, Intraday, Carry-forward)
    const allowedProductTypes = ['I', 'C', 'M']
    if (!allowedProductTypes.includes(item.investype)) {
      errors.push(`Product type ${item.investype} is not supported. Only Delivery, Intraday, and Carry-forward are allowed.`)
    }

    // Order type validation - only allow LMT, MKT, SL-LMT, SL-MKT
    const allowedOrderTypes = ['LMT', 'MKT', 'SL-LMT', 'SL-MKT']
    if (!allowedOrderTypes.includes(item.prctype)) {
      errors.push(`Order type ${item.prctype} is not supported. Only Limit, Market, SL Limit, and SL Market are allowed.`)
    }

    // Quantity validation
    const qty = Number(item.qty || 0)
    if (!(qty > 0)) {
      errors.push('Quantity must be greater than zero')
    }

    if (sec) {
      // Check maximum quantity limit (freeze quantity * 40)
      if (sec.frzqty) {
        const maxQty = Number(sec.frzqty) * 40
        if (qty > maxQty) {
          errors.push(`Your max slice order limit Quantity is ${maxQty}`)
        }
      }
      const freezeQty = Number(sec.frzqty || 0)
      const lotSize = Number(q.ls || 1)
      const isMCX = q.exch === 'MCX'

      // Removed 40 times limit validation

      // Lot size validation
      if (q.exch !== 'MCX' && (qty % lotSize !== 0)) {
        errors.push(`Quantity must be a multiple of lot size ${lotSize}`)
      }
    }

    // Price validation for LMT and SL-LMT
    if ((item.prctype === 'LMT' || item.prctype === 'SL-LMT') && (!item.price || Number(item.price) <= 0)) {
      errors.push('Price must be greater than zero')
    }

    // Trigger price validation for SL-LMT
    if (item.prctype === 'SL-LMT') {
      const triggerPriceNum = Number(item.trgprice || 0)
      const priceNum = Number(item.price || 0)

      if (triggerPriceNum <= 0) {
        errors.push('Trigger price must be greater than zero')
      } else {
        const lc = Number(q.lc)
        const uc = Number(q.uc)
        if (isFinite(lc) && isFinite(uc)) {
          if (triggerPriceNum < lc || triggerPriceNum > uc) {
            errors.push(`Trigger must be within circuit limits ${lc} - ${uc}`)
          }
        }

        // Buy/Sell validation for SL-LMT trigger price
        const isSell = item.buyrsell
        if (isSell) {
          // For Sell orders: trigger must be greater than limit price
          if (triggerPriceNum > 0 && priceNum > 0 && triggerPriceNum <= priceNum) {
            errors.push('For SELL orders, Trigger price must be greater than Limit price')
          }
        } else {
          // For Buy orders: trigger must be less than limit price
          if (triggerPriceNum > 0 && priceNum > 0 && triggerPriceNum >= priceNum) {
            errors.push('For BUY orders, Trigger price must be less than Limit price')
          }
        }
      }
    }

    // Trigger price validation for SL-MKT
    if (item.prctype === 'SL-MKT') {
      const triggerPriceNum = Number(item.trgprice || 0)
      const ltp = Number(item.ltp || item.lp || 0)

      if (triggerPriceNum <= 0) {
        errors.push('Trigger price must be greater than zero')
      } else {
        const lc = Number(q.lc)
        const uc = Number(q.uc)
        if (isFinite(lc) && isFinite(uc)) {
          if (triggerPriceNum < lc || triggerPriceNum > uc) {
            errors.push(`Trigger must be within circuit limits ${lc} - ${uc}`)
          }
        }

        // Buy/Sell validation for SL-MKT trigger price
        const isSell = item.buyrsell
        if (isSell) {
          // For Sell orders: trigger must be less than LTP
          if (triggerPriceNum > 0 && ltp > 0 && triggerPriceNum >= ltp) {
            errors.push('For SELL orders, Trigger price must be less than LTP')
          }
        } else {
          // For Buy orders: trigger must be greater than LTP
          if (triggerPriceNum > 0 && ltp > 0 && triggerPriceNum <= ltp) {
            errors.push('For BUY orders, Trigger price must be greater than LTP')
          }
        }
      }
    }

    // Market Protection validation (only for Market orders)
    if (item.prctype === 'MKT' || item.prctype === 'SL-MKT') {
      const mpValue = Number(item.mktprdordqty || 0)
      // Market Protection must be greater than 0
      if (mpValue <= 0) {
        errors.push('Market Protection must be greater than zero')
      } 
      // Market Protection must not exceed 20
      else if (mpValue > 20) {
        errors.push('Market Protection cannot exceed 20%')
      }
    }

    // Tick size validation
    const ti = Number(q.ti || 0)
    if (ti > 0) {
      const isTickMultiple = (val) => Math.abs(val / ti - Math.round(val / ti)) < 1e-6
      
      if (item.prctype === 'LMT' || item.prctype === 'SL-LMT') {
        const priceNum = Number(item.price || 0)
        if (priceNum > 0 && !isTickMultiple(priceNum)) {
          errors.push(`Price should be multiple of tick size ${ti}`)
        }
      }
      
      if (item.prctype === 'SL-LMT' || item.prctype === 'SL-MKT') {
        const triggerPriceNum = Number(item.trgprice || 0)
        if (triggerPriceNum > 0 && !isTickMultiple(triggerPriceNum)) {
          errors.push(`Trigger should be multiple of tick size ${ti}`)
        }
      }
    }

    // Circuit limits validation
    if (sec) {
      const lc = Number(q.lc)
      const uc = Number(q.uc)
      if (isFinite(lc) && isFinite(uc)) {
        if (item.prctype === 'LMT' || item.prctype === 'SL-LMT') {
          const priceNum = Number(item.price || 0)
          if (priceNum > 0 && (priceNum < lc || priceNum > uc)) {
            errors.push(`Price must be within circuit limits ${lc} - ${uc}`)
          }
        }
      }
    }

    return errors
  }

  async function calculateMargin() {
    if (!basketItems.value || basketItems.value.length === 0) {
      totalMargin.value = '0.00'
      postTradeMargin.value = '0.00'
      basketMargin.value = {}
      return
    }

    // Validate all items and collect errors
    const allErrors = []
    for (let i = 0; i < basketItems.value.length; i++) {
      const item = basketItems.value[i]
      const errors = validateBasketItem(item)
      if (errors.length > 0) {
        const itemName = item.tsym || `Item ${i + 1}`
        errors.forEach(error => {
          allErrors.push(`${itemName}: ${error}`)
        })
      }
    }

    // If there are validation errors, show them in remarks
    if (allErrors.length > 0) {
      basketMargin.value = {
        stat: 'Not_Ok',
        remarks: allErrors.join('; ')
      }
      totalMargin.value = '0.00'
      postTradeMargin.value = '0.00'
      return
    }
    
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) return
      
      // Helper function to determine ret value based on investment type
      const getRetValue = (investType) => {
        if (investType === 'I') return 'DAY' // Intraday
        if (investType === 'C') return 'DAY' // Delivery
        if (investType === 'M') return 'EOS' // Carry Forward
        return 'DAY' // Default
      }
      
      // Helper function to create basket item object
      const createBasketItem = (basketItem) => {
        // Determine price value based on order type
        let priceValue = '0'
        if (basketItem.prctype === 'LMT' || basketItem.prctype === 'SL-LMT') {
          priceValue = String(basketItem.price || 0)
        } else {
          priceValue = '0' // Market order
        }
        
        const itemObj = {
          uid: uid,
          actid: uid,
          discqty: '0',
          exch: basketItem.exch,
          pCode: basketItem.investype,
          prctyp: basketItem.prctype,
          prd: basketItem.investype,
          prc: priceValue,
          qty: String(basketItem.qty),
          ret: getRetValue(basketItem.investype),
          symbol_id: basketItem.token,
          tsym: encodeURIComponent(basketItem.tsym || ''),
          trantype: basketItem.buyrsell ? 'S' : 'B',
          trgprc: (basketItem.prctype === 'SL-LMT' || basketItem.prctype === 'SL-MKT') ? String(basketItem.trgprice || 0) : '0',
        }
        
        // Add market protection quantity for market orders
        if (basketItem.prctype === 'MKT' || basketItem.prctype === 'SL-MKT') {
          itemObj.mktprdordqty = String(basketItem.mktprdordqty || 5)
        }
        
        // Add after market order flag if set
        if (basketItem.addmktord) {
          itemObj.addmktord = basketItem.addmktord
        }
        
        return itemObj
      }
      
      // Build the request object - first item as main, rest in basketlists
      let item = null
      
      for (let i = 0; i < basketItems.value.length; i++) {
        const basketItem = basketItems.value[i]
        const itemObj = createBasketItem(basketItem)
        
        if (i === 0) {
          item = {
            ...itemObj,
            basketlists: [],
          }
        } else {
          item.basketlists.push(itemObj)
        }
      }
      
      if (item) {
        const marginData = await getBSKMargin(item)
        
        // Log the response for debugging
        // console.log('GetBasketMargin response:', marginData)
        
        if (marginData && marginData.stat === 'Ok') {
          totalMargin.value = marginData.marginused == undefined ? '0.00' : String(marginData.marginused || '0.00')
          postTradeMargin.value = marginData.marginusedtrade == undefined ? '0.00' : String(marginData.marginusedtrade || '0.00')
          basketMargin.value = marginData
        } else {
          // API returned error - extract error message from various possible fields
          let errorMsg = 'Failed to calculate margin'
          
          if (marginData) {
            // Prioritize emsg and remarks fields (most common error fields)
            // console.log('Margin data:', marginData)
            if (marginData.emsg) {
              // console.log('Margin data emsg:', marginData.emsg)
              errorMsg = marginData.emsg
            } else if (marginData.remarks) {
              // console.log('Margin data remarks:', marginData.remarks)
              errorMsg = marginData.remarks
            } else if (marginData.message) {
              // console.log('Margin data message:', marginData.message)
              errorMsg = marginData.message
            } else if (marginData.error) {
              // console.log('Margin data error:', marginData.error)
              errorMsg = marginData.error
            } else if (marginData.stat && marginData.stat !== 'Ok') {
              // console.log('Margin data stat:', marginData.stat)
              errorMsg = `API returned status: ${marginData.stat}`
            }
          } else {
            // marginData is null/undefined
            errorMsg = 'No response from margin calculation API'
          }
          
          basketMargin.value = {
            stat: 'Not_Ok',
            remarks: errorMsg,
            emsg: errorMsg
          }
          totalMargin.value = '0.00'
          postTradeMargin.value = '0.00'
        }
      } else {
        // No item to calculate margin for
        basketMargin.value = {
          stat: 'Not_Ok',
          remarks: 'No items in basket to calculate margin'
        }
        totalMargin.value = '0.00'
        postTradeMargin.value = '0.00'
      }
    } catch (e) {
      // console.error('Error calculating margin:', e)
      // Extract error message from various possible error formats
      let errorMsg = 'Failed to calculate margin'
      
      // Check if error has response data
      if (e?.response?.data) {
        const errorData = e.response.data
        errorMsg = errorData.emsg || 
                  errorData.remarks || 
                  errorData.message || 
                  errorData.error ||
                  (errorData.stat && errorData.stat !== 'Ok' ? errorData.stat : null) ||
                  errorMsg
      } 
      // Check if error has a direct message
      else if (e?.message) {
        errorMsg = e.message
      } 
      // Check if error is a string
      else if (typeof e === 'string') {
        errorMsg = e
      }
      // Check if error object itself has emsg or remarks
      else if (e?.emsg || e?.remarks) {
        errorMsg = e.emsg || e.remarks
      }
      
      basketMargin.value = {
        stat: 'Not_Ok',
        remarks: errorMsg,
        emsg: errorMsg
      }
      totalMargin.value = '0.00'
      postTradeMargin.value = '0.00'
    }
  }
  
  async function placeBasketOrder() {
    if (!basketItems.value || basketItems.value.length === 0) {
      basketMargin.value = {
        stat: 'Not_Ok',
        remarks: 'Basket is empty'
      }
      return
    }

    // Validate all items
    const allErrors = []
    for (let i = 0; i < basketItems.value.length; i++) {
      const item = basketItems.value[i]
      const errors = validateBasketItem(item)
      if (errors.length > 0) {
        const itemName = item.tsym || `Item ${i + 1}`
        errors.forEach(error => {
          allErrors.push(`${itemName}: ${error}`)
        })
      }
    }

    // If there are validation errors, show them in remarks
    if (allErrors.length > 0) {
      basketMargin.value = {
        stat: 'Not_Ok',
        remarks: allErrors.join('; ')
      }
      return
    }
    
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
    
    // Place orders sequentially
    orderLoader.value = true
    try {
      const uid = authStore.uid || sessionStorage.getItem('userid')
      if (!uid) {
        appStore.showSnackbar(2, 'User not authenticated')
        orderLoader.value = false
        return
      }

      let successCount = 0
      let failCount = 0
      const errorMessages = []

      for (let i = 0; i < splitItems.length; i++) {
        const item = splitItems[i]
        const sec = item[0] || item['0']
        
        const orderItem = {
          uid: uid,
          actid: uid,
          discqty: '0',
          exch: item.exch,
          pCode: item.investype,
          prctyp: item.prctype,
          prd: item.investype,
          prc: item.prctype,
          qty: String(item.qty),
          ret: 'DAY',
          symbol_id: item.token,
          tsym: item.tsym,
          trantype: item.buyrsell ? 'S' : 'B',
          trgprc: (item.prctype === 'SL-LMT' || item.prctype === 'SL-MKT') ? String(item.trgprice || 0) : '0',
        }

        // Add price for limit orders
        if (item.prctype === 'LMT' || item.prctype === 'SL-LMT') {
          orderItem.prc = String(item.price || 0)
        } else {
          orderItem.prc = '0' // Market order
        }

        // Add market protection for market orders
        if ((item.prctype === 'MKT' || item.prctype === 'SL-MKT') && item.mktprdordqty) {
          orderItem.mktProt = String(item.mktprdordqty)
        }

        // Add AMO flag
        if (item.addmktord) {
          orderItem.amo = 'Yes'
        }

        try {
          const result = await getPlaceOrder(orderItem, 'place')
          if (result?.stat === 'Ok') {
            successCount++
          } else {
            failCount++
            const errorMsg = result?.emsg || 'Order failed'
            errorMessages.push(`${item.tsym}: ${errorMsg}`)
          }
        } catch (error) {
          failCount++
          errorMessages.push(`${item.tsym}: ${error.message || 'Failed to place order'}`)
        }

        // Small delay between orders to avoid rate limiting
        if (i < splitItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      orderLoader.value = false

      if (failCount === 0) {
        appStore.showSnackbar(1, `Basket order placed successfully (${successCount} orders)`)
        window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'orders' }))
        basketDialog.value = false
      } else if (successCount > 0) {
        appStore.showSnackbar(2, `${successCount} orders placed, ${failCount} failed. ${errorMessages.join('; ')}`)
      } else {
        appStore.showSnackbar(2, `All orders failed. ${errorMessages.join('; ')}`)
        basketMargin.value = {
          stat: 'Not_Ok',
          remarks: errorMessages.join('; ')
        }
      }
    } catch (error) {
      orderLoader.value = false
      // console.error('Error placing basket order:', error)
      appStore.showSnackbar(2, 'Failed to place basket order')
    }
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
    if (!data) return
    
    // Handle different data formats from websocket
    const token = data.token || data.tk || data.t
    if (!token) return
    
    const lp = data.lp || data.ltp || data.l || 0
    const ch = data.ch || data.c || 0
    const chp = data.chp || 0
    
    // Update selected script price if it matches
    if (selectedScript.value && selectedScript.value.token == token) {
      if (!selectedScript.value.ws) {
        selectedScript.value.ws = {}
      }
      selectedScript.value.ws.lp = Number(lp).toFixed(2)
      selectedScript.value.ws.ch = Number(ch || 0).toFixed(2)
      selectedScript.value.ws.chp = Number(chp || 0).toFixed(2)
      
      // Auto-update price if LMT or SL-LMT, but only if user hasn't manually edited it
      if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
        // Only auto-update if price is 0 or not set, and user hasn't manually edited
        if ((!price.value || price.value === 0) && !priceManuallyEdited.value) {
          price.value = Number(lp).toFixed(2)
        }
      }
      
      // Also update ltp, lp, ch, chp directly on script for compatibility
      selectedScript.value.ltp = Number(lp).toFixed(2)
      selectedScript.value.lp = Number(lp).toFixed(2)
      selectedScript.value.ch = Number(ch || 0).toFixed(2)
      selectedScript.value.chp = Number(chp || 0).toFixed(2)
    }
    
    // Update basket items - only update if values are valid (> 0), preserve existing values otherwise
    for (let i = 0; i < basketItems.value.length; i++) {
      if (basketItems.value[i].token == token) {
        // Ensure ws object exists and is initialized from cached data if needed
        if (!basketItems.value[i].ws) {
          basketItems.value[i].ws = {}
        }
        
        // If ws.lp doesn't exist or is invalid, initialize from cached data
        const existingLTP = basketItems.value[i].ltp || basketItems.value[i].lp
        if ((!basketItems.value[i].ws.lp || Number(basketItems.value[i].ws.lp) <= 0) && existingLTP && Number(existingLTP) > 0) {
          basketItems.value[i].ws.lp = Number(existingLTP).toFixed(2)
          if (!basketItems.value[i].ws.ch || basketItems.value[i].ws.ch === '0.00') {
            basketItems.value[i].ws.ch = basketItems.value[i].ch && !isNaN(Number(basketItems.value[i].ch)) 
              ? Number(basketItems.value[i].ch).toFixed(2) 
              : '0.00'
          }
          if (!basketItems.value[i].ws.chp || basketItems.value[i].ws.chp === '0.00') {
            basketItems.value[i].ws.chp = basketItems.value[i].chp && !isNaN(Number(basketItems.value[i].chp)) 
              ? Number(basketItems.value[i].chp).toFixed(2) 
              : '0.00'
          }
        }
        
        // Only update ltp/lp if the new value is valid (> 0)
        if (lp && Number(lp) > 0) {
          basketItems.value[i].ltp = Number(lp).toFixed(2)
          basketItems.value[i].lp = Number(lp).toFixed(2)
          basketItems.value[i].ws.lp = Number(lp).toFixed(2)
        }
        // If invalid update, preserve existing ws.lp value (don't overwrite with 0)
        
        // Update change values (can be negative, so check for valid number)
        if (ch !== undefined && ch !== null && !isNaN(Number(ch))) {
          basketItems.value[i].ch = Number(ch).toFixed(2)
          basketItems.value[i].ws.ch = Number(ch).toFixed(2)
        }
        // If invalid change, preserve existing ws.ch value
        
        if (chp !== undefined && chp !== null && !isNaN(Number(chp))) {
          basketItems.value[i].chp = Number(chp).toFixed(2)
          basketItems.value[i].ws.chp = Number(chp).toFixed(2)
        }
        // If invalid change percent, preserve existing ws.chp value
      }
    }
    
    // Update active basket list - only update if values are valid (> 0), preserve existing values otherwise
    if (activeBasket.value && activeBasket.value.list) {
      for (let i = 0; i < activeBasket.value.list.length; i++) {
        if (activeBasket.value.list[i].token == token) {
          // Ensure ws object exists and is initialized from cached data if needed
          if (!activeBasket.value.list[i].ws) {
            activeBasket.value.list[i].ws = {}
          }
          
          // If ws.lp doesn't exist or is invalid, initialize from cached data
          const existingLTP = activeBasket.value.list[i].ltp || activeBasket.value.list[i].lp
          if ((!activeBasket.value.list[i].ws.lp || Number(activeBasket.value.list[i].ws.lp) <= 0) && existingLTP && Number(existingLTP) > 0) {
            activeBasket.value.list[i].ws.lp = Number(existingLTP).toFixed(2)
            if (!activeBasket.value.list[i].ws.ch || activeBasket.value.list[i].ws.ch === '0.00') {
              activeBasket.value.list[i].ws.ch = activeBasket.value.list[i].ch && !isNaN(Number(activeBasket.value.list[i].ch)) 
                ? Number(activeBasket.value.list[i].ch).toFixed(2) 
                : '0.00'
            }
            if (!activeBasket.value.list[i].ws.chp || activeBasket.value.list[i].ws.chp === '0.00') {
              activeBasket.value.list[i].ws.chp = activeBasket.value.list[i].chp && !isNaN(Number(activeBasket.value.list[i].chp)) 
                ? Number(activeBasket.value.list[i].chp).toFixed(2) 
                : '0.00'
            }
          }
          
          // Only update ltp/lp if the new value is valid (> 0)
          if (lp && Number(lp) > 0) {
            activeBasket.value.list[i].ltp = Number(lp).toFixed(2)
            activeBasket.value.list[i].lp = Number(lp).toFixed(2)
            activeBasket.value.list[i].ws.lp = Number(lp).toFixed(2)
          }
          // If invalid update, preserve existing ws.lp value (don't overwrite with 0)
          
          // Update change values (can be negative, so check for valid number)
          if (ch !== undefined && ch !== null && !isNaN(Number(ch))) {
            activeBasket.value.list[i].ch = Number(ch).toFixed(2)
            activeBasket.value.list[i].ws.ch = Number(ch).toFixed(2)
          }
          // If invalid change, preserve existing ws.ch value
          
          if (chp !== undefined && chp !== null && !isNaN(Number(chp))) {
            activeBasket.value.list[i].chp = Number(chp).toFixed(2)
            activeBasket.value.list[i].ws.chp = Number(chp).toFixed(2)
          }
          // If invalid change percent, preserve existing ws.chp value
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
    priceManuallyEdited.value = false
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

