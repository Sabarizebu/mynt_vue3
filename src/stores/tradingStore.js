import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Trading Page Store
 * Manages state for the advanced trading page including:
 * - Selected instrument
 * - Chart configurations (multiple panes)
 * - Layout settings
 * - Theme preferences
 * - WebSocket subscriptions
 */
export const useTradingStore = defineStore('trading', () => {
  // Selected Instrument State
  const selectedInstrument = ref(null) // { token, exch, tsym, name }
  
  // Chart Configuration State
  // Array of chart pane configurations (up to 4 charts)
  const chartPanes = ref([
    {
      id: 'chart-1',
      instrument: null, // Will use selectedInstrument if null
      timeframe: '5', // 1m, 5m, 15m, 1h, 1D
      chartType: 'candlestick', // candlestick, bar, line
      indicators: ['SMA'], // Array of indicator names
      visible: true,
    }
  ])
  
  // Layout Configuration
  const chartLayout = ref('single') // 'single', 'grid-2', 'grid-4'
  
  // UI Settings
  const showTradeMarkers = ref(true)
  const showOptionChain = ref(false)
  const showInstrumentNames = ref(true)
  const theme = ref('dark') // 'dark' or 'light'
  
  // WebSocket Subscription Tracking
  const activeSubscriptions = ref(new Set()) // Track subscribed tokens to avoid duplicates
  
  // Computed Properties
  const activeCharts = computed(() => {
    return chartPanes.value.filter(pane => pane.visible)
  })
  
  const maxCharts = computed(() => {
    return chartLayout.value === 'single' ? 1 : chartLayout.value === 'grid-2' ? 2 : 4
  })
  
  const canAddChart = computed(() => {
    return activeCharts.value.length < maxCharts.value
  })
  
  // Actions
  
  /**
   * Set the selected instrument for trading
   * @param {Object} instrument - { token, exch, tsym, name }
   */
  const setSelectedInstrument = (instrument) => {
    selectedInstrument.value = instrument
    
    // Update all panes that don't have a specific instrument
    chartPanes.value.forEach(pane => {
      if (!pane.instrument) {
        pane.instrument = instrument
      }
    })
  }
  
  /**
   * Add a new chart pane
   * @param {Object} config - Chart configuration
   */
  const addChartPane = (config = {}) => {
    if (!canAddChart.value) {
      console.warn('Maximum number of charts reached')
      return
    }
    
    const newPane = {
      id: `chart-${Date.now()}`,
      instrument: config.instrument || selectedInstrument.value,
      timeframe: config.timeframe || '5',
      chartType: config.chartType || 'candlestick',
      indicators: config.indicators || [],
      visible: true,
    }
    
    chartPanes.value.push(newPane)
  }
  
  /**
   * Remove a chart pane
   * @param {String} paneId - ID of pane to remove
   */
  const removeChartPane = (paneId) => {
    const index = chartPanes.value.findIndex(p => p.id === paneId)
    if (index !== -1) {
      chartPanes.value.splice(index, 1)
    }
  }
  
  /**
   * Update chart pane configuration
   * @param {String} paneId - ID of pane to update
   * @param {Object} updates - Partial configuration updates
   */
  const updateChartPane = (paneId, updates) => {
    const pane = chartPanes.value.find(p => p.id === paneId)
    if (pane) {
      Object.assign(pane, updates)
    }
  }
  
  /**
   * Set chart layout
   * @param {String} layout - 'single', 'grid-2', or 'grid-4'
   */
  const setChartLayout = (layout) => {
    chartLayout.value = layout
    
    // Hide excess charts if layout doesn't support them
    const max = layout === 'single' ? 1 : layout === 'grid-2' ? 2 : 4
    chartPanes.value.forEach((pane, index) => {
      pane.visible = index < max
    })
  }
  
  /**
   * Set timeframe for a chart pane
   * @param {String} paneId - ID of pane
   * @param {String} timeframe - Timeframe value
   */
  const setTimeframe = (paneId, timeframe) => {
    updateChartPane(paneId, { timeframe })
  }
  
  /**
   * Set chart type for a pane
   * @param {String} paneId - ID of pane
   * @param {String} chartType - 'candlestick', 'bar', or 'line'
   */
  const setChartType = (paneId, chartType) => {
    updateChartPane(paneId, { chartType })
  }
  
  /**
   * Toggle indicator on a chart pane
   * @param {String} paneId - ID of pane
   * @param {String} indicator - Indicator name (SMA, RSI, MACD)
   */
  const toggleIndicator = (paneId, indicator) => {
    const pane = chartPanes.value.find(p => p.id === paneId)
    if (pane) {
      const index = pane.indicators.indexOf(indicator)
      if (index > -1) {
        pane.indicators.splice(index, 1)
      } else {
        pane.indicators.push(indicator)
      }
    }
  }
  
  /**
   * Register a WebSocket subscription
   * @param {String} token - Token to subscribe
   */
  const registerSubscription = (token) => {
    if (token) {
      activeSubscriptions.value.add(token)
    }
  }
  
  /**
   * Unregister a WebSocket subscription
   * @param {String} token - Token to unsubscribe
   */
  const unregisterSubscription = (token) => {
    if (token) {
      activeSubscriptions.value.delete(token)
    }
  }
  
  /**
   * Get all unique tokens that need subscription
   * @returns {Array} Array of unique tokens
   */
  const getUniqueSubscriptions = () => {
    const tokens = new Set()
    
    // Add selected instrument token
    if (selectedInstrument.value?.token) {
      tokens.add(selectedInstrument.value.token)
    }
    
    // Add tokens from all chart panes
    chartPanes.value.forEach(pane => {
      if (pane.instrument?.token) {
        tokens.add(pane.instrument.token)
      }
    })
    
    return Array.from(tokens)
  }
  
  /**
   * Toggle theme
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  
  /**
   * Update UI settings
   * @param {Object} settings - Settings object
   */
  const updateSettings = (settings) => {
    if (settings.showTradeMarkers !== undefined) {
      showTradeMarkers.value = settings.showTradeMarkers
    }
    if (settings.showOptionChain !== undefined) {
      showOptionChain.value = settings.showOptionChain
    }
    if (settings.showInstrumentNames !== undefined) {
      showInstrumentNames.value = settings.showInstrumentNames
    }
  }
  
  /**
   * Reset store to initial state
   */
  const reset = () => {
    selectedInstrument.value = null
    chartPanes.value = [{
      id: 'chart-1',
      instrument: null,
      timeframe: '5',
      chartType: 'candlestick',
      indicators: ['SMA'],
      visible: true,
    }]
    chartLayout.value = 'single'
    showTradeMarkers.value = true
    showOptionChain.value = false
    showInstrumentNames.value = true
    activeSubscriptions.value.clear()
  }
  
  return {
    // State
    selectedInstrument,
    chartPanes,
    chartLayout,
    showTradeMarkers,
    showOptionChain,
    showInstrumentNames,
    theme,
    activeSubscriptions,
    
    // Computed
    activeCharts,
    maxCharts,
    canAddChart,
    
    // Actions
    setSelectedInstrument,
    addChartPane,
    removeChartPane,
    updateChartPane,
    setChartLayout,
    setTimeframe,
    setChartType,
    toggleIndicator,
    registerSubscription,
    unregisterSubscription,
    getUniqueSubscriptions,
    toggleTheme,
    updateSettings,
    reset,
  }
})

