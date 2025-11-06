<template>
  <div class="positions-panel" :class="{ 'dark-mode': isDark, 'light-mode': !isDark }">
    <!-- Panel Header -->
    <div v-if="!compact" class="panel-header">
      <v-toolbar density="compact" color="cardbg">
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">Open Positions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip size="x-small" color="primary" variant="text" v-if="totalPnl !== null">
          P&L: {{ formatMoney(totalPnl) }}
        </v-chip>
      </v-toolbar>
    </div>

    <!-- Positions Content -->
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

      <!-- Positions Data -->
      <div v-else-if="positions.length > 0" class="positions-data">
        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">Total P&L</span>
            <span class="stat-value" :class="totalPnl >= 0 ? 'text-success' : 'text-error'">
              {{ formatMoney(totalPnl) }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Open Positions</span>
            <span class="stat-value">{{ openPositionsCount }}</span>
          </div>
        </div>

        <!-- Table Header -->
        <div class="table-header">
          <div class="header-cell symbol-col">Symbol</div>
          <div class="header-cell qty-col">Qty</div>
          <div class="header-cell avg-col">Avg</div>
          <div class="header-cell ltp-col">LTP</div>
          <div class="header-cell pnl-col">P&L</div>
        </div>

        <!-- Position Rows -->
        <div class="position-rows">
          <div
            v-for="(position, index) in filteredPositions"
            :key="`position-${index}`"
            class="position-row"
            @click="selectPosition(position)"
          >
            <div class="table-cell symbol-col">
              <div class="symbol-info">
                <span class="symbol-name">{{ position.tsym || position.symbol }}</span>
                <span class="symbol-exch">{{ position.exch }}</span>
              </div>
            </div>
            <div class="table-cell qty-col" :class="position.netqty >= 0 ? 'text-success' : 'text-error'">
              {{ formatNumber(Math.abs(position.netqty)) }}
            </div>
            <div class="table-cell avg-col">{{ formatPrice(position.avgprc || position.netavgprc) }}</div>
            <div class="table-cell ltp-col">{{ formatPrice(position.ltp || position.lp) }}</div>
            <div class="table-cell pnl-col" :class="position.rpnl >= 0 ? 'text-success' : 'text-error'">
              {{ formatMoney(position.rpnl) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <v-icon size="48" color="grey">mdi-chart-line</v-icon>
        <p class="text-body-2 mt-2">No open positions</p>
        <p class="text-caption mt-1">Your positions will appear here</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTradingStore } from '@/stores/tradingStore'
import { getMPosotion } from '@/components/mixins/getAPIdata'
import { subscribeOnStream, unsubscribeFromStream } from '@/components/mixins/webSocketstream'

export default {
  name: 'PositionsPanel',
  props: {
    instrument: {
      type: Object,
      default: null,
    },
    theme: {
      type: String,
      default: 'dark',
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update-subscription'],
  setup(props, { emit }) {
    const tradingStore = useTradingStore()

    // State
    const isLoading = ref(false)
    const error = ref(null)
    const positions = ref([])
    const selectedPosition = ref(null)

    // WebSocket subscription
    let wsListenerGuid = null

    // Computed
    const isDark = computed(() => props.theme === 'dark')

    const filteredPositions = computed(() => {
      // Filter positions based on selected instrument if provided
      if (props.instrument) {
        return positions.value.filter(
          (pos) => pos.token === props.instrument.token && pos.exch === props.instrument.exch
        )
      }
      // Show only open positions (netqty !== 0)
      return positions.value.filter((pos) => Number(pos.netqty) !== 0)
    })

    const openPositionsCount = computed(() => {
      return filteredPositions.value.length
    })

    const totalPnl = computed(() => {
      return filteredPositions.value.reduce((sum, pos) => {
        return sum + (Number(pos.rpnl) || 0)
      }, 0)
    })

    /**
     * Load initial positions data
     */
    const loadPositionsData = async () => {
      try {
        isLoading.value = true
        error.value = null

        // Fetch positions data
        const response = await getMPosotion(true)

        // getMPosotion returns { a: all, o: open, c: closed }
        if (response && (response.a || response.o || response.c)) {
          const allPositions = response.a || []
          positions.value = allPositions.map((pos) => ({
            ...pos,
            token: pos.token,
            exch: pos.exch,
            tsym: pos.tsym || pos.symbol,
            netqty: Number(pos.netqty || 0),
            avgprc: Number(pos.avgprc || pos.netavgprc || 0),
            ltp: Number(pos.ltp || pos.lp || 0),
            rpnl: Number(pos.rpnl || pos.crpnl || 0),
          }))

          // Subscribe to WebSocket for all positions
          subscribeToRealtimeData()
        } else {
          positions.value = []
        }
      } catch (err) {
        console.error('Error loading positions data:', err)
        error.value = 'Failed to load positions data'
        positions.value = []
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Subscribe to real-time WebSocket updates
     */
    const subscribeToRealtimeData = () => {
      if (positions.value.length === 0) return

      // Unsubscribe existing subscription
      if (wsListenerGuid) {
        unsubscribeFromStream(wsListenerGuid)
      }

      // Get unique instruments from positions
      const uniqueInstruments = positions.value.reduce((acc, pos) => {
        const key = `${pos.exch}-${pos.token}`
        if (!acc.has(key)) {
          acc.set(key, {
            name: `${pos.exch}:${pos.tsym}`,
            exchange: pos.exch,
            token: pos.token,
          })
        }
        return acc
      }, new Map())

      const symbolInfos = Array.from(uniqueInstruments.values())

      if (symbolInfos.length === 0) return

      wsListenerGuid = Date.now().toString()

      subscribeOnStream(
        symbolInfos,
        undefined,
        handleRealtimeData,
        wsListenerGuid,
        undefined,
        undefined,
        'positions-quotes'
      )

      // Notify parent for each unique instrument
      symbolInfos.forEach((symbolInfo) => {
        emit('update-subscription', {
          token: symbolInfo.token,
          exch: symbolInfo.exchange,
          tsym: symbolInfo.name.split(':')[1],
        })
      })
    }

    /**
     * Handle real-time data updates
     */
    const handleRealtimeData = (data) => {
      if (!data || !data.token) return

      try {
        // Update position with real-time data
        const positionIndex = positions.value.findIndex((pos) => pos.token === data.token)

        if (positionIndex !== -1) {
          const position = positions.value[positionIndex]

          // Update LTP
          if (data.lp || data.ltp) {
            position.ltp = Number(data.lp || data.ltp)
          }

          // Recalculate P&L if needed
          if (position.ltp && position.avgprc && position.netqty) {
            const qty = Number(position.netqty)
            const avg = Number(position.avgprc)
            const ltp = Number(position.ltp)
            const multplr = Number(position.mult) || 1
            const prcftr = Number(position.prcftr) || 1

            // Calculate unrealized P&L
            const unrealizedPnl = qty * prcftr * multplr * (ltp - avg)
            const bookedPnl = Number(position.crpnl || 0)
            position.rpnl = bookedPnl + unrealizedPnl
          }

          // Trigger reactivity
          positions.value = [...positions.value]
        }
      } catch (err) {
        console.error('Error processing real-time position data:', err)
      }
    }

    /**
     * Select position
     */
    const selectPosition = (position) => {
      selectedPosition.value = position
      // Could emit event to parent or navigate to position details
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
     * Format money
     */
    const formatMoney = (amount) => {
      if (amount === null || amount === undefined) return '--'
      const num = Number(amount)
      if (isNaN(num)) return '--'
      const sign = num >= 0 ? '+' : ''
      return `${sign}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

    // Load positions on mount
    onMounted(() => {
      loadPositionsData()
    })

    // Watch for instrument changes (if filtering by instrument)
    watch(() => props.instrument, (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        // Re-subscribe if needed
        subscribeToRealtimeData()
      }
    }, { deep: true })

    // Cleanup on unmount
    onBeforeUnmount(() => {
      cleanup()
    })

    return {
      isLoading,
      error,
      positions,
      selectedPosition,
      isDark,
      filteredPositions,
      openPositionsCount,
      totalPnl,
      selectPosition,
      formatPrice,
      formatNumber,
      formatMoney,
    }
  },
}
</script>

<style scoped>
.positions-panel {
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

.summary-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  opacity: 0.7;
  text-transform: uppercase;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.positions-data {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-header {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.7;
}

.header-cell {
  padding: 0 4px;
}

.symbol-col {
  flex: 2;
  min-width: 100px;
}

.qty-col,
.avg-col,
.ltp-col {
  flex: 1;
  min-width: 60px;
  text-align: right;
}

.pnl-col {
  flex: 1;
  min-width: 80px;
  text-align: right;
}

.position-rows {
  flex: 1;
  overflow-y: auto;
}

.position-row {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.position-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.table-cell {
  padding: 0 4px;
  display: flex;
  align-items: center;
}

.symbol-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.symbol-name {
  font-weight: 600;
}

.symbol-exch {
  font-size: 10px;
  opacity: 0.7;
}

.text-success {
  color: #26a69a;
  font-weight: 600;
}

.text-error {
  color: #ef5350;
  font-weight: 600;
}
</style>

