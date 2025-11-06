<template>
    <div class="tradebook-panel" :class="{ 'dark-mode': isDark, 'light-mode': !isDark }">
        <!-- Panel Header -->
        <div class="panel-header">
            <v-toolbar density="compact" color="cardbg">
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">Recent Trades</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip size="x-small" color="primary" variant="text" v-if="instrument">
                    {{ formatInstrumentShort(instrument) }}
                </v-chip>
            </v-toolbar>
        </div>

        <!-- Trade Book Content -->
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

            <!-- Trade Book Data -->
            <div v-else-if="trades.length > 0" class="tradebook-data">
                <!-- Table Header -->
                <div class="table-header">
                    <div class="header-cell time-col">Time</div>
                    <div class="header-cell price-col">Price</div>
                    <div class="header-cell qty-col">Qty</div>
                    <div class="header-cell side-col">Side</div>
                </div>

                <!-- Trade Rows -->
                <div class="trade-rows">
                    <div v-for="(trade, index) in sortedTrades" :key="`trade-${index}`" class="trade-row"
                        :class="trade.side === 'BUY' ? 'buy-trade' : 'sell-trade'">
                        <div class="table-cell time-col">{{ formatTime(trade.time) }}</div>
                        <div class="table-cell price-col" :class="trade.side === 'BUY' ? 'text-success' : 'text-error'">
                            {{ formatPrice(trade.price) }}
                        </div>
                        <div class="table-cell qty-col">{{ formatNumber(trade.quantity) }}</div>
                        <div class="table-cell side-col">
                            <v-chip :color="trade.side === 'BUY' ? 'success' : 'error'" size="x-small" variant="flat"
                                density="compact">
                                {{ trade.side }}
                            </v-chip>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
                <v-icon size="48" color="grey">mdi-swap-horizontal</v-icon>
                <p class="text-body-2 mt-2">No recent trades</p>
                <p class="text-caption mt-1">Trades will appear here when available</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTradingStore } from '@/stores/tradingStore'
import { getMTradebook } from '@/components/mixins/getAPIdata'
import { subscribeOnStream, unsubscribeFromStream } from '@/components/mixins/webSocketstream'
import { formatInstrumentShort, isValidInstrument, hasRequiredFields } from '@/utils/instrumentHelpers'

export default {
    name: 'TradeBookPanel',
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
        const trades = ref([])

        // WebSocket subscription
        let wsListenerGuid = null

        // Computed
        const isDark = computed(() => props.theme === 'dark')

        const sortedTrades = computed(() => {
            // Sort trades by time descending (most recent first)
            return [...trades.value].sort((a, b) => {
                const timeA = new Date(a.time || 0).getTime()
                const timeB = new Date(b.time || 0).getTime()
                return timeB - timeA
            }).slice(0, 50) // Limit to 50 most recent trades
        })

        /**
         * Load initial trade book data
         */
        const loadTradeBookData = async () => {
            if (!props.instrument) {
                trades.value = []
                return
            }

            try {
                isLoading.value = true
                error.value = null

                // Get credentials from sessionStorage
                const currentUid = sessionStorage.getItem('userid')
                const currentTok = sessionStorage.getItem('msession')

                if (!currentUid || !currentTok) {
                    error.value = 'Not authenticated'
                    return
                }

                // Fetch trade book data
                // Note: This is a placeholder - you'll need to implement based on your API
                const requestBody = `jData={"uid":"${currentUid}","actid":"${currentUid}","exch":"${props.instrument.exch}","tsym":"${props.instrument.tsym}"}&jKey=${currentTok}`

                const response = await getMTradebook(requestBody)

                if (response && Array.isArray(response)) {
                    // Transform API response to trade format
                    trades.value = response.map((trade) => ({
                        time: trade.norentm || trade.time || Date.now(),
                        price: Number(trade.fillprc || trade.price || 0),
                        quantity: Number(trade.fillqty || trade.quantity || 0),
                        side: trade.trantype === 'B' ? 'BUY' : 'SELL',
                        orderId: trade.norenordno || trade.orderId,
                    }))
                } else {
                    trades.value = []
                }
            } catch (err) {
                console.error('Error loading trade book data:', err)
                error.value = 'Failed to load trade book data'
                trades.value = []
            } finally {
                isLoading.value = false
            }
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
                'tradebook-quotes'
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
                // Process real-time trade data
                // This is a simplified version - adapt based on your actual WebSocket message format
                if (data.ltq && data.ltp) {
                    // Add new trade to the beginning of the array
                    const newTrade = {
                        time: Date.now(),
                        price: Number(data.ltp || data.lp || 0),
                        quantity: Number(data.ltq || 0),
                        side: data.trantype === 'B' ? 'BUY' : 'SELL',
                        orderId: data.norenordno || null,
                    }

                    // Add to beginning of array
                    trades.value.unshift(newTrade)

                    // Keep only last 100 trades
                    if (trades.value.length > 100) {
                        trades.value = trades.value.slice(0, 100)
                    }
                }
            } catch (err) {
                console.error('Error processing real-time trade data:', err)
            }
        }

        /**
         * Format time
         */
        const formatTime = (timestamp) => {
            if (!timestamp) return '--'
            const date = new Date(timestamp)
            return date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
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
                loadTradeBookData()
                subscribeToRealtimeData()
            } else if (!newVal) {
                cleanup()
                trades.value = []
            }
        }, { deep: true, immediate: true })

        // Cleanup on unmount
        onBeforeUnmount(() => {
            cleanup()
        })

        return {
            isLoading,
            error,
            trades,
            isDark,
            sortedTrades,
            formatTime,
            formatPrice,
            formatNumber,
            formatInstrumentShort,
        }
    },
}
</script>

<style scoped>
.tradebook-panel {
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

.tradebook-data {
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

.time-col {
    flex: 1;
    min-width: 80px;
}

.price-col {
    flex: 1;
    min-width: 80px;
    text-align: right;
}

.qty-col {
    flex: 1;
    min-width: 60px;
    text-align: right;
}

.side-col {
    flex: 0 0 60px;
    text-align: center;
}

.trade-rows {
    flex: 1;
    overflow-y: auto;
}

.trade-row {
    display: flex;
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 12px;
    transition: background-color 0.2s ease;
}

.trade-row:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.buy-trade {
    border-left: 2px solid #26a69a;
}

.sell-trade {
    border-left: 2px solid #ef5350;
}

.table-cell {
    padding: 0 4px;
    display: flex;
    align-items: center;
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
