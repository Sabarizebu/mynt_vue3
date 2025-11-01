<template>
    <div class="stock-details-container">
        <!-- Stock Header -->
        <v-card v-if="stockData" class="elevation-0 mb-4" color="cardbg">
            <v-card-title class="pb-2">
                <div class="d-flex align-center justify-space-between w-100">
    <div>
                        <h2 class="font-weight-bold">{{ stockData.tsym }}</h2>
                        <p class="text--secondary mb-0">{{ stockData.exch }} • Token: {{ stockData.token }}</p>
                    </div>
                    <div class="text-right">
                        <h3 class="font-weight-bold">₹{{ stockData.ltp || '0.00' }}</h3>
                        <div class="d-flex align-center justify-end">
                            <span class="font-weight-medium mr-2" :class="getPriceChangeClass(stockData.ch)">
                                {{ formatPriceChange(stockData.ch) }}
                            </span>
                            <span class="font-weight-medium" :class="getPriceChangeClass(stockData.chp)">
                                ({{ formatPercentageChange(stockData.chp) }})
                            </span>
                        </div>
                        <p class="text--secondary mb-0">Last Price</p>
                    </div>
                </div>
            </v-card-title>
        </v-card>

        <!-- TradingView Chart -->
        <v-card class="elevation-0 rounded-xl" color="cardbg">
            <v-card-title class="pb-2">
                <v-icon left>mdi-chart-line</v-icon>
                <span class="font-weight-bold">Live Chart</span>
            </v-card-title>
            <v-card-text class="pa-0">
                <div class="chart-wrapper">
                    <TVChartContainer :symbol="chartSymbol" :containerId="chartContainerId" :key="chartKey" />
                </div>
            </v-card-text>
        </v-card>

        <!-- Loading State -->
        <v-card v-if="!stockData" class="elevation-0 text-center py-8" color="cardbg">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-4">Loading stock details...</p>
        </v-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { analytics } from '@/firebase'
import { logEvent } from 'firebase/analytics'
import TVChartContainer from '@/components/TVChartContainer.vue'

const route = useRoute()
const stockData = ref(null)
const chartContainerId = ref('stock_details_chart')
const chartKey = ref(0)

// Helper functions for price formatting
const getPriceChangeClass = (value) => {
    if (!value) return 'neutral'
    const numValue = parseFloat(value)
    if (numValue > 0) return 'positive'
    if (numValue < 0) return 'negative'
    return 'neutral'
}

const formatPriceChange = (value) => {
    if (!value) return '0.00'
    const numValue = parseFloat(value)
    return numValue > 0 ? `+${numValue.toFixed(2)}` : numValue.toFixed(2)
}

const formatPercentageChange = (value) => {
    if (!value) return '0.00%'
    const numValue = parseFloat(value)
    const formatted = numValue > 0 ? `+${numValue.toFixed(2)}` : numValue.toFixed(2)
    return `${formatted}%`
}

// Computed chart symbol
const chartSymbol = computed(() => {
    if (stockData.value) {
        return `${stockData.value.exch}:${stockData.value.token}`
    }
    return localStorage.getItem('ssdtsym') || 'NSE:26000'
})

// Load stock data from localStorage or route params
const loadStockData = () => {
    try {
        // First try to get from localStorage (set by watchlist)
        const storedData = localStorage.getItem('stockDetailsData')
        if (storedData) {
            stockData.value = JSON.parse(storedData)
            return
        }

        // Fallback to route query parameters
        if (route.query.token && route.query.exch) {
            stockData.value = {
                token: route.query.token,
                exch: route.query.exch,
                tsym: route.query.tsym || 'Unknown',
                ltp: route.query.ltp || '0.00'
            }
            return
        }

        // Last fallback - try to parse from ssdtsym
        const ssdtsym = localStorage.getItem('ssdtsym')
        if (ssdtsym) {
            const [exch, token] = ssdtsym.split(':')
            stockData.value = {
                token: token,
                exch: exch,
                tsym: `${exch}:${token}`,
                ltp: '0.00'
            }
        }
    } catch (error) {
        console.error('Error loading stock data:', error)
    }
}

// Force chart refresh
const refreshChart = () => {
    chartKey.value += 1
}

// WebSocket data update handler for real-time price updates
const handleWebSocketUpdate = (event) => {
    const detail = event.detail
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail

        if (data && stockData.value) {
            // Check if this data is for our current stock
            const token = data.tk || data.token
            const exchange = data.e || data.exchange

            if (token === stockData.value.token && exchange === stockData.value.exch) {

                // Update stock data with real-time prices
                const ltp = parseFloat(data.lp || data.ltp || stockData.value.ltp || 0)
                const prevClose = parseFloat(data.c || data.prev_close_price || 0)
                const ch = ltp - prevClose
                const chp = prevClose > 0 ? ((ch / prevClose) * 100) : 0

                stockData.value = {
                    ...stockData.value,
                    ltp: ltp.toFixed(2),
                    ch: ch.toFixed(2),
                    chp: chp.toFixed(2)
                }

            }
        }
    }
}

// Subscribe to WebSocket updates for this stock
const subscribeToWebSocket = () => {
    if (stockData.value) {
        const event = new CustomEvent('web-scoketOn', {
            detail: {
                flow: 'sub',
                data: [{
                    token: stockData.value.token,
                    exch: stockData.value.exch,
                    tsym: stockData.value.tsym
                }],
                is: 'chart',
                page: 'stockdetails'
            }
        })
        window.dispatchEvent(event)
    }
}

// Unsubscribe from WebSocket updates
const unsubscribeFromWebSocket = () => {
    if (stockData.value) {
        const event = new CustomEvent('web-scoketOn', {
            detail: {
                flow: 'unsub',
                data: [{
                    token: stockData.value.token,
                    exch: stockData.value.exch,
                    tsym: stockData.value.tsym
                }],
                is: 'chart',
                page: 'stockdetails'
            }
        })
        window.dispatchEvent(event)
    }
}

// Firebase analytics integration
onMounted(() => {
    loadStockData()

    // Set up WebSocket listener for real-time updates
    window.addEventListener('web-scoketConn', handleWebSocketUpdate)

    // Emit ssd-event to update chart with correct symbol
    if (stockData.value) {
        const event = new CustomEvent('ssd-event', {
            detail: {
                type: 'chart',
                token: stockData.value.token,
                exch: stockData.value.exch,
                tsym: stockData.value.tsym
            }
        })
        window.dispatchEvent(event)

        // Subscribe to WebSocket for real-time updates
        setTimeout(() => {
            subscribeToWebSocket()
        }, 1000)

        // Refresh chart after data is loaded
        setTimeout(refreshChart, 500)
    }

    // Analytics
    if (analytics) {
        logEvent(analytics, "stock_details_view", {
        event_name: "Stock Details",
            symbol: stockData.value?.tsym || 'unknown',
        value: 1
    })
    }
})

onUnmounted(() => {
    // Clean up WebSocket subscription
    unsubscribeFromWebSocket()

    // Remove event listener
    window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
})
</script>

<style scoped>
.stock-details-container {
    padding: 16px;
    max-width: 100%;
}

.chart-wrapper {
    height: 600px;
    width: 100%;
    position: relative;
}

/* Price change colors */
.positive {
    color: #35d05d !important;
}

.negative {
    color: #ff5252 !important;
}

.neutral {
    color: var(--subtext) !important;
}

@media (max-width: 768px) {
    .chart-wrapper {
        height: 400px;
    }

    .stock-details-container {
        padding: 8px;
    }
}
</style>