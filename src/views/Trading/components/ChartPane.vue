<template>
    <div class="chart-pane" :class="{ 'dark-mode': isDark, 'light-mode': !isDark }">
        <!-- Chart Header -->
        <div class="chart-header" v-if="showInstrumentName && instrument">
            <div class="instrument-info">
                <span class="instrument-name">{{ formatInstrumentName(instrument) }}</span>
                <span class="instrument-timeframe">{{ timeframe }}</span>
            </div>
            <v-btn v-if="canRemove" icon="mdi-close" variant="text" size="x-small" @click="handleRemove"></v-btn>
        </div>

        <!-- Chart Container -->
        <div :ref="chartContainerRef" class="chart-container"
            :style="{ height: showInstrumentName ? 'calc(100% - 40px)' : '100%' }">
            <!-- Trading Overlay -->
            <ChartTradingOverlay
                v-if="showTradeMarkers && instrument"
                :enabled="tradingEnabled"
                :instrument="instrument"
                :current-price="currentPrice"
                :chart-height="chartHeight"
                :chart-width="chartWidth"
                @place-order="handlePlaceOrder"
                @set-stop-loss="handleSetStopLoss"
                @set-take-profit="handleSetTakeProfit"
                @create-bracket-order="handleCreateBracketOrder"
                @open-order-window="handleOpenOrderWindow"
            />
        </div>

        <!-- Loading Overlay -->
        <v-overlay v-model="isLoading" contained class="chart-loading">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        </v-overlay>

        <!-- Error Message -->
        <div v-if="error" class="chart-error">
            <v-alert type="error" density="compact" variant="text">
                {{ error }}
            </v-alert>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { createChart, ColorType } from 'lightweight-charts'
import { useTradingStore } from '@/stores/tradingStore'
import { getLtpdata } from '@/components/mixins/getAPIdata'
import { subscribeOnStream, unsubscribeFromStream } from '@/components/mixins/webSocketstream'
import { emitWidgetEvent } from '@/utils/widgetEventBus'
import { formatInstrumentName, isValidInstrument, hasRequiredFields } from '@/utils/instrumentHelpers'
import ChartTradingOverlay from './ChartTradingOverlay.vue'

export default {
    name: 'ChartPane',
    components: {
        ChartTradingOverlay,
    },
    props: {
        paneId: {
            type: String,
            required: true,
        },
        instrument: {
            type: Object,
            default: null,
        },
        timeframe: {
            type: String,
            default: '5',
        },
        chartType: {
            type: String,
            default: 'candlestick',
            validator: (value) => ['candlestick', 'bar', 'line'].includes(value),
        },
        indicators: {
            type: Array,
            default: () => [],
        },
        showInstrumentName: {
            type: Boolean,
            default: true,
        },
        showTradeMarkers: {
            type: Boolean,
            default: true,
        },
        theme: {
            type: String,
            default: 'dark',
            validator: (value) => ['dark', 'light'].includes(value),
        },
    },
    emits: ['remove', 'update-subscription', 'place-order', 'set-stop-loss', 'set-take-profit', 'create-bracket-order', 'open-order-window'],
    setup(props, { emit }) {
        const tradingStore = useTradingStore()

        // Refs
        const chartContainerRef = ref(null)
        const chart = ref(null)
        const series = ref(null)
        const isLoading = ref(false)
        const error = ref(null)
        const canRemove = ref(false)

        // WebSocket subscription tracking
        let wsListenerGuid = null
        const candleData = ref([])
        const currentPrice = ref(0)
        const chartHeight = ref(400)
        const chartWidth = ref(800)
        const tradingEnabled = ref(true)
        
        // Debouncing for API calls
        let loadDataTimeout = null
        let isLoadingData = false

        // Theme computed
        const isDark = computed(() => props.theme === 'dark')

        /**
         * Initialize chart
         */
        const initChart = async () => {
            if (!chartContainerRef.value || !props.instrument) {
                return
            }

            try {
                isLoading.value = true
                error.value = null

                // Clean up existing chart
                if (chart.value) {
                    chart.value.remove()
                    chart.value = null
                    series.value = null
                }

                // Ensure container has dimensions
                const containerWidth = chartContainerRef.value.clientWidth || 800
                const containerHeight = chartContainerRef.value.clientHeight || 400
                
                // Update dimensions
                chartWidth.value = containerWidth
                chartHeight.value = containerHeight

                // Create chart instance
                const chartOptions = {
                    layout: {
                        background: { type: ColorType.Solid, color: isDark.value ? '#121212' : '#ffffff' },
                        textColor: isDark.value ? '#ffffff' : '#000000',
                    },
                    grid: {
                        vertLines: { color: isDark.value ? '#222222' : '#EBEEF0' },
                        horzLines: { color: isDark.value ? '#222222' : '#EBEEF0' },
                    },
                    crosshair: {
                        mode: 0,
                    },
                    rightPriceScale: {
                        borderColor: isDark.value ? '#333333' : '#CCCCCC',
                    },
                    timeScale: {
                        borderColor: isDark.value ? '#333333' : '#CCCCCC',
                        timeVisible: true,
                        secondsVisible: false,
                    },
                    width: containerWidth,
                    height: containerHeight,
                }

                chart.value = createChart(chartContainerRef.value, chartOptions)

                // Create series based on chart type
                if (props.chartType === 'candlestick') {
                    series.value = chart.value.addCandlestickSeries({
                        upColor: '#26a69a',
                        downColor: '#ef5350',
                        borderVisible: false,
                        wickUpColor: '#26a69a',
                        wickDownColor: '#ef5350',
                    })
                } else if (props.chartType === 'bar') {
                    series.value = chart.value.addBarSeries({
                        upColor: '#26a69a',
                        downColor: '#ef5350',
                        borderVisible: false,
                    })
                } else {
                    series.value = chart.value.addLineSeries({
                        color: '#2962FF',
                        lineWidth: 2,
                    })
                }

                // Add indicators
                addIndicators()

                // Load initial data
                await loadHistoricalData()

                // Subscribe to real-time updates
                subscribeToRealtimeData()

                // Handle resize
                let resizeObserver = null
                let resizeHandler = null

                if (window.ResizeObserver) {
                    resizeObserver = new ResizeObserver(() => {
                        if (chart.value && chartContainerRef.value) {
                            chartWidth.value = chartContainerRef.value.clientWidth
                            chartHeight.value = chartContainerRef.value.clientHeight
                            chart.value.applyOptions({
                                width: chartWidth.value,
                                height: chartHeight.value,
                            })
                        }
                    })

                    resizeObserver.observe(chartContainerRef.value)
                } else {
                    // Fallback for browsers without ResizeObserver
                    resizeHandler = () => {
                        if (chart.value && chartContainerRef.value) {
                            chart.value.applyOptions({
                                width: chartContainerRef.value.clientWidth,
                                height: chartContainerRef.value.clientHeight,
                            })
                        }
                    }
                    window.addEventListener('resize', resizeHandler)
                }

                // Store for cleanup
                if (resizeObserver) {
                    // Cleanup will be handled in cleanup function
                    chart.value._resizeObserver = resizeObserver
                }
                if (resizeHandler) {
                    chart.value._resizeHandler = resizeHandler
                }

                isLoading.value = false
            } catch (err) {
                console.error('Error initializing chart:', err)
                error.value = 'Failed to initialize chart'
                isLoading.value = false
            }
        }

        /**
         * Load historical data for chart
         * Debounced to prevent multiple calls
         */
        const loadHistoricalData = async () => {
            if (!props.instrument || !series.value) return
            
            // Prevent multiple simultaneous calls
            if (isLoadingData) {
                console.log('ChartPane: Already loading data, skipping...')
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

                    // Fetch initial data from API
                    const response = await getLtpdata([{
                        exch: props.instrument.exch,
                        token: props.instrument.token,
                        tsym: props.instrument.tsym,
                    }])

                    // Handle error response
                    if (response && response.error) {
                        error.value = response.error
                        console.error('Error loading chart data:', response.error)
                        return
                    }

                    // Handle successful response
                    if (response && Array.isArray(response) && response.length > 0) {
                        const data = response[0] // Get first item from response array

                        if (data) {
                            // Update current price
                            if (data.ltp || data.lp) {
                                currentPrice.value = Number(data.ltp || data.lp || 0)
                            }

                            // Convert to candlestick format
                            const candles = transformToCandles(data)
                            candleData.value = candles

                            if (series.value) {
                                series.value.setData(candles)
                            }
                        }
                    } else {
                        error.value = 'No data returned from API'
                    }
                } catch (err) {
                    console.error('Error loading historical data:', err)
                    error.value = err.message || 'Failed to load chart data'
                } finally {
                    isLoading.value = false
                    isLoadingData = false
                }
            }, 300) // 300ms debounce
        }

        /**
         * Transform API data to candlestick format
         * Creates candlestick data from LTP response or generates sample data
         */
        const transformToCandles = (data) => {
            if (!data) return []

            const candles = []
            const now = Math.floor(Date.now() / 1000) // Current time in seconds
            const currentPrice = Number(data.ltp || data.lp || data.c || 0)
            const open = Number(data.o || data.open_price || currentPrice)
            const high = Number(data.h || data.high_price || currentPrice)
            const low = Number(data.l || data.low_price || currentPrice)
            const close = currentPrice
            const volume = Number(data.v || data.volume || 0)

            // If we have OHLC data, use it
            if (open && high && low && close) {
                candles.push({
                    time: now,
                    open: open,
                    high: high,
                    low: low,
                    close: close,
                    volume: volume,
                })
            } else if (currentPrice > 0) {
                // Generate sample historical data from current price
                // Create 50 candles going back in time
                for (let i = 50; i >= 0; i--) {
                    const time = now - (i * 60) // 1 minute intervals
                    const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
                    const basePrice = currentPrice * (1 + variation)
                    
                    candles.push({
                        time: time,
                        open: basePrice * (1 + (Math.random() - 0.5) * 0.01),
                        high: basePrice * (1 + Math.abs((Math.random() - 0.5) * 0.02)),
                        low: basePrice * (1 - Math.abs((Math.random() - 0.5) * 0.02)),
                        close: basePrice,
                        volume: Math.floor(Math.random() * 1000000),
                    })
                }
            }

            return candles
        }

        /**
         * Subscribe to real-time WebSocket data
         */
        const subscribeToRealtimeData = () => {
            if (!props.instrument) return

            // Subscribe via websocket stream
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
                'chart-quotes'
            )

            // Notify parent
            emit('update-subscription', props.instrument)
        }

        /**
         * Handle real-time data updates
         */
        const handleRealtimeData = (data) => {
            if (!data || !series.value) return

            try {
                // Process real-time tick data
                // Update last candle or add new candle based on timeframe
                // This is a simplified version - you'll need to implement proper candle aggregation

                if (data.lp || data.ltp) {
                    const price = Number(data.lp || data.ltp)
                    currentPrice.value = price
                    const time = Math.floor(Date.now() / 1000) // Current time in seconds

                    // For line chart, just update the line
                    if (props.chartType === 'line' && series.value) {
                        series.value.update({
                            time,
                            value: price,
                        })
                    }
                    // For candlestick/bar, you'll need to aggregate into candles
                    // This requires more complex logic based on your timeframe
                }
            } catch (err) {
                console.error('Error processing real-time data:', err)
            }
        }

        /**
         * Add technical indicators
         */
        const addIndicators = () => {
            if (!chart.value || !series.value) return

            // Add indicators based on props.indicators array
            props.indicators.forEach((indicator) => {
                if (indicator === 'SMA') {
                    // Add SMA indicator
                    // Implementation depends on your indicator logic
                } else if (indicator === 'RSI') {
                    // Add RSI indicator
                } else if (indicator === 'MACD') {
                    // Add MACD indicator
                }
            })
        }

        /**
         * Handle remove chart
         */
        const handleRemove = () => {
            cleanup()
            emit('remove', props.paneId)
        }

        /**
         * Cleanup chart and subscriptions
         */
        const cleanup = () => {
            // Unsubscribe from WebSocket
            if (wsListenerGuid) {
                try {
                    unsubscribeFromStream(wsListenerGuid)
                } catch (err) {
                    console.error('Error unsubscribing from stream:', err)
                }
                wsListenerGuid = null
            }

            // Cleanup resize observer
            if (chart.value) {
                if (chart.value._resizeObserver) {
                    try {
                        chart.value._resizeObserver.disconnect()
                    } catch (err) {
                        console.error('Error disconnecting resize observer:', err)
                    }
                    chart.value._resizeObserver = null
                }
                if (chart.value._resizeHandler) {
                    try {
                        window.removeEventListener('resize', chart.value._resizeHandler)
                    } catch (err) {
                        console.error('Error removing resize handler:', err)
                    }
                    chart.value._resizeHandler = null
                }
            }

            // Remove chart
            if (chart.value) {
                try {
                    chart.value.remove()
                } catch (err) {
                    console.error('Error removing chart:', err)
                }
                chart.value = null
                series.value = null
            }
        }

        // Watch for prop changes
        watch(() => props.instrument, (newVal, oldVal) => {
            if (newVal && newVal !== oldVal) {
                // Emit instrument change event for linked widgets
                emitWidgetEvent(props.paneId, 'instrument-change', { widgetId: props.paneId, instrument: newVal })
                nextTick(() => {
                    initChart()
                })
            } else if (!newVal) {
                cleanup()
            }
        }, { deep: true })

        watch(() => props.chartType, (newVal, oldVal) => {
            if (newVal !== oldVal && props.instrument) {
                // Emit chart type change event for linked widgets
                emitWidgetEvent(props.paneId, 'chart-type-change', { widgetId: props.paneId, chartType: newVal })
                nextTick(() => {
                    initChart()
                })
            }
        })

        watch(() => props.timeframe, (newVal, oldVal) => {
            if (newVal !== oldVal && props.instrument && series.value) {
                // Emit timeframe change event for linked widgets
                emitWidgetEvent(props.paneId, 'timeframe-change', { widgetId: props.paneId, timeframe: newVal })
                // Debounced call to prevent multiple API calls
                loadHistoricalData()
            }
        })

        watch(() => props.indicators, (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal) && chart.value) {
                // Emit indicators change event for linked widgets
                emitWidgetEvent(props.paneId, 'indicators-change', { widgetId: props.paneId, indicators: newVal })
                // Re-add indicators
                addIndicators()
            }
        }, { deep: true })

        watch(() => props.theme, (newVal, oldVal) => {
            if (newVal !== oldVal && chart.value) {
                chart.value.applyOptions({
                    layout: {
                        background: { type: ColorType.Solid, color: isDark.value ? '#121212' : '#ffffff' },
                        textColor: isDark.value ? '#ffffff' : '#000000',
                    },
                    grid: {
                        vertLines: { color: isDark.value ? '#222222' : '#EBEEF0' },
                        horzLines: { color: isDark.value ? '#222222' : '#EBEEF0' },
                    },
                })
            }
        })

        /**
         * Trading event handlers
         */
        const handlePlaceOrder = (order) => {
            emit('place-order', order)
        }

        const handleSetStopLoss = (data) => {
            emit('set-stop-loss', data)
        }

        const handleSetTakeProfit = (data) => {
            emit('set-take-profit', data)
        }

        const handleCreateBracketOrder = (data) => {
            emit('create-bracket-order', data)
        }

        const handleOpenOrderWindow = (data) => {
            emit('open-order-window', data)
        }

        // Initialize on mount
        onMounted(() => {
            // Allow removal if more than one chart
            const activeCharts = tradingStore.activeCharts
            canRemove.value = activeCharts.length > 1

            // Update chart dimensions
            if (chartContainerRef.value) {
                chartWidth.value = chartContainerRef.value.clientWidth
                chartHeight.value = chartContainerRef.value.clientHeight
            }

            if (props.instrument) {
                nextTick(() => {
                    initChart()
                })
            }
        })

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
            chartContainerRef,
            isLoading,
            error,
            canRemove,
            isDark,
            currentPrice,
            chartHeight,
            chartWidth,
            tradingEnabled,
            handleRemove,
            handlePlaceOrder,
            handleSetStopLoss,
            handleSetTakeProfit,
            handleCreateBracketOrder,
            handleOpenOrderWindow,
            formatInstrumentName,
        }
    },
}
</script>

<style scoped>
.chart-pane {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--v-background-base);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    background-color: var(--v-cardbg-base);
}

.instrument-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.instrument-name {
    font-weight: 600;
    font-size: 14px;
}

.instrument-timeframe {
    font-size: 12px;
    opacity: 0.7;
}

.chart-container {
    flex: 1;
    position: relative;
    width: 100%;
    min-height: 300px;
    height: 100%;
}

.chart-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
}

.chart-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
}
</style>
