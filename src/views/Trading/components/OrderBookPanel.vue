<template>
  <div class="orderbook-panel" :class="{ 'dark-mode': isDark, 'light-mode': !isDark }">
    <!-- Panel Header -->
    <div class="panel-header">
      <v-toolbar density="compact" color="cardbg">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">Order Book</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip size="x-small" color="primary" variant="text" v-if="instrument">
          {{ formatInstrumentShort(instrument) }}
        </v-chip>
      </v-toolbar>
    </div>

    <!-- Order Book Content -->
    <div class="panel-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <v-alert type="error" density="compact" variant="text">
          {{ error }}
        </v-alert>
      </div>

      <!-- Order Book Data -->
      <div v-else-if="orderBookData" class="orderbook-data">
        <!-- Bid Side (Buy Orders) -->
        <div class="orderbook-side bid-side">
          <div class="side-header">
            <span class="side-label">Bid</span>
            <span class="side-total">Total: {{ formatNumber(totalBidQty) }}</span>
          </div>
          <div class="orderbook-rows">
            <div
              v-for="(bid, index) in sortedBids"
              :key="`bid-${index}`"
              class="orderbook-row bid-row"
              :style="{ width: `${(bid.volume / maxBidVolume) * 100}%` }"
            >
              <span class="price">{{ formatPrice(bid.price) }}</span>
              <span class="quantity">{{ formatNumber(bid.volume) }}</span>
            </div>
          </div>
        </div>

        <!-- Spread -->
        <div class="spread-section" v-if="bestBid && bestAsk">
          <div class="spread-info">
            <span class="spread-label">Spread</span>
            <span class="spread-value">{{ formatPrice(bestAsk.price - bestBid.price) }}</span>
          </div>
          <div class="ltp-info" v-if="ltp">
            <span class="ltp-label">LTP</span>
            <span class="ltp-value" :class="ltpClass">{{ formatPrice(ltp) }}</span>
          </div>
        </div>

        <!-- Ask Side (Sell Orders) -->
        <div class="orderbook-side ask-side">
          <div class="side-header">
            <span class="side-label">Ask</span>
            <span class="side-total">Total: {{ formatNumber(totalAskQty) }}</span>
          </div>
          <div class="orderbook-rows">
            <div
              v-for="(ask, index) in sortedAsks"
              :key="`ask-${index}`"
              class="orderbook-row ask-row"
              :style="{ width: `${(ask.volume / maxAskVolume) * 100}%` }"
            >
              <span class="price">{{ formatPrice(ask.price) }}</span>
              <span class="quantity">{{ formatNumber(ask.volume) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <v-icon size="48" color="grey">mdi-book-open-variant</v-icon>
        <p class="text-body-2 mt-2">No order book data available</p>
        <p class="text-caption mt-1">Select an instrument to view order book</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTradingStore } from '@/stores/tradingStore'
import { getLtpdata } from '@/components/mixins/getAPIdata'
import { subscribeOnStream, unsubscribeFromStream } from '@/components/mixins/webSocketstream'
import { formatInstrumentShort, isValidInstrument, hasRequiredFields } from '@/utils/instrumentHelpers'

export default {
  name: 'OrderBookPanel',
  props: {
    instrument: {
      type: Object,
      default: null,
    },
    theme: {
      type: String,
      default: 'dark',
    },
  },
  emits: ['update-subscription'],
  setup(props, { emit }) {
    const tradingStore = useTradingStore()

    // State
    const isLoading = ref(false)
    const error = ref(null)
    const orderBookData = ref(null)
    const ltp = ref(null)
    const depthData = ref(null)

    // WebSocket subscription
    let wsListenerGuid = null

    // Computed
    const isDark = computed(() => props.theme === 'dark')

    const sortedBids = computed(() => {
      if (!depthData.value || !depthData.value.bids) return []
      // Sort bids descending by price
      return [...depthData.value.bids].sort((a, b) => b.price - a.price).slice(0, 10)
    })

    const sortedAsks = computed(() => {
      if (!depthData.value || !depthData.value.asks) return []
      // Sort asks ascending by price
      return [...depthData.value.asks].sort((a, b) => a.price - b.price).slice(0, 10)
    })

    const bestBid = computed(() => {
      if (sortedBids.value.length === 0) return null
      return sortedBids.value[0]
    })

    const bestAsk = computed(() => {
      if (sortedAsks.value.length === 0) return null
      return sortedAsks.value[0]
    })

    const totalBidQty = computed(() => {
      return sortedBids.value.reduce((sum, bid) => sum + (bid.volume || 0), 0)
    })

    const totalAskQty = computed(() => {
      return sortedAsks.value.reduce((sum, ask) => sum + (ask.volume || 0), 0)
    })

    const maxBidVolume = computed(() => {
      if (sortedBids.value.length === 0) return 1
      return Math.max(...sortedBids.value.map(bid => bid.volume || 0))
    })

    const maxAskVolume = computed(() => {
      if (sortedAsks.value.length === 0) return 1
      return Math.max(...sortedAsks.value.map(ask => ask.volume || 0))
    })

    const ltpClass = computed(() => {
      if (!ltp.value || !bestBid.value || !bestAsk.value) return ''
      const midPrice = (bestBid.value.price + bestAsk.value.price) / 2
      if (ltp.value > midPrice) return 'text-success'
      if (ltp.value < midPrice) return 'text-error'
      return ''
    })

    // Debouncing for API calls
    let loadDataTimeout = null
    let isLoadingData = false

    /**
     * Load initial order book data
     * Debounced to prevent multiple calls
     */
    const loadOrderBookData = async () => {
      if (!props.instrument) {
        orderBookData.value = null
        depthData.value = null
        return
      }

      // Prevent multiple simultaneous calls
      if (isLoadingData) {
        console.log('OrderBookPanel: Already loading data, skipping...')
        return
      }

      // Validate instrument
      if (!isValidInstrument(props.instrument)) {
        error.value = 'Invalid instrument: missing required fields'
        return
      }

      // Check if instrument has required fields for API call
      if (!hasRequiredFields(props.instrument)) {
        error.value = 'Invalid instrument: missing exch, token, or tsym'
        return
      }

      // Clear any pending timeout
      if (loadDataTimeout) {
        clearTimeout(loadDataTimeout)
        loadDataTimeout = null
      }

      // Debounce the API call
      loadDataTimeout = setTimeout(async () => {
        try {
          isLoadingData = true
          isLoading.value = true
          error.value = null

          const response = await getLtpdata([{
            exch: props.instrument.exch,
            token: props.instrument.token,
            tsym: props.instrument.tsym,
          }])

          // Handle error response
          if (response && response.error) {
            error.value = response.error
            console.error('Error loading order book data:', response.error)
            return
          }

          // Handle successful response
          if (response && Array.isArray(response) && response.length > 0) {
            const data = response[0] // Get first item from response array
            
            // Extract depth data
            if (data.depth) {
              depthData.value = {
                bids: data.depth.bids || [],
                asks: data.depth.asks || [],
              }
            }

            // Extract LTP
            if (data.ltp || data.lp) {
              ltp.value = Number(data.ltp || data.lp)
            }

            orderBookData.value = data
          }
        } catch (err) {
          console.error('Error loading order book data:', err)
          error.value = 'Failed to load order book data'
        } finally {
          isLoading.value = false
          isLoadingData = false
        }
      }, 300) // 300ms debounce
    }

    /**
     * Subscribe to real-time WebSocket updates
     */
    const subscribeToRealtimeData = () => {
      if (!props.instrument) return

      // Unsubscribe existing subscription
      if (wsListenerGuid) {
        unsubscribeFromStream(wsListenerGuid)
      }

      const symbolInfo = {
        name: `${props.instrument.exch}:${props.instrument.tsym}`,
        exchange: props.instrument.exch,
        token: props.instrument.token,
      }

      wsListenerGuid = Date.now().toString()

      subscribeOnStream(
        [symbolInfo],
        undefined,
        handleRealtimeData,
        wsListenerGuid,
        undefined,
        undefined,
        'orderbook-quotes'
      )

      // Notify parent
      emit('update-subscription', props.instrument)
    }

    /**
     * Handle real-time data updates
     */
    const handleRealtimeData = (data) => {
      if (!data || !props.instrument || data.token !== props.instrument.token) return

      try {
        // Update LTP
        if (data.lp || data.ltp) {
          ltp.value = Number(data.lp || data.ltp)
        }

        // Update depth data
        if (data.depth) {
          depthData.value = {
            bids: data.depth.bids || [],
            asks: data.depth.asks || [],
          }
        }

        // Update order book data
        if (data) {
          orderBookData.value = { ...orderBookData.value, ...data }
        }
      } catch (err) {
        console.error('Error processing real-time order book data:', err)
      }
    }

    /**
     * Format price
     */
    const formatPrice = (price) => {
      if (!price && price !== 0) return '--'
      return Number(price).toFixed(2)
    }

    /**
     * Format number
     */
    const formatNumber = (num) => {
      if (!num && num !== 0) return '0'
      return Number(num).toLocaleString('en-IN')
    }

    /**
     * Cleanup subscriptions
     */
    const cleanup = () => {
      if (wsListenerGuid) {
        unsubscribeFromStream(wsListenerGuid)
        wsListenerGuid = null
      }
    }

    // Watch for instrument changes
    watch(() => props.instrument, (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        loadOrderBookData()
        subscribeToRealtimeData()
      } else if (!newVal) {
        cleanup()
        orderBookData.value = null
        depthData.value = null
        ltp.value = null
      }
    }, { deep: true, immediate: true })

    // Cleanup on unmount
    onBeforeUnmount(() => {
      // Clear any pending timeout
      if (loadDataTimeout) {
        clearTimeout(loadDataTimeout)
        loadDataTimeout = null
      }
      cleanup()
    })

    return {
      isLoading,
      error,
      orderBookData,
      depthData,
      ltp,
      isDark,
      sortedBids,
      sortedAsks,
      bestBid,
      bestAsk,
      totalBidQty,
      totalAskQty,
      maxBidVolume,
      maxAskVolume,
      ltpClass,
      formatPrice,
      formatNumber,
      formatInstrumentShort,
    }
  },
}
</script>

<style scoped>
.orderbook-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--v-background-base);
}

.panel-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px;
}

.orderbook-data {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.orderbook-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
}

.side-label {
  text-transform: uppercase;
}

.orderbook-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.orderbook-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  transition: width 0.3s ease;
  min-width: 50%;
}

.bid-row {
  background-color: rgba(38, 166, 154, 0.1);
  border-left: 2px solid #26a69a;
  margin-left: auto;
  text-align: right;
}

.ask-row {
  background-color: rgba(239, 83, 80, 0.1);
  border-right: 2px solid #ef5350;
  margin-right: auto;
  text-align: left;
}

.price {
  font-weight: 600;
  min-width: 80px;
}

.quantity {
  opacity: 0.8;
  min-width: 60px;
}

.spread-section {
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spread-info,
.ltp-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.spread-label,
.ltp-label {
  font-size: 10px;
  opacity: 0.7;
  text-transform: uppercase;
}

.spread-value,
.ltp-value {
  font-size: 14px;
  font-weight: 600;
}

.text-success {
  color: #26a69a;
}

.text-error {
  color: #ef5350;
}
</style>

