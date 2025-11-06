<template>
    <v-container fluid class="trading-page pa-0" :class="{ 'dark-mode': isDark, 'light-mode': !isDark }">
        <!-- Top Toolbar -->
        <v-toolbar density="compact" color="cardbg" class="trading-toolbar" fixed top>
            <!-- Instrument Selector -->
            <v-autocomplete v-model="selectedInstrument" :items="instrumentOptions" :loading="searching"
                v-model:search="searchInput" item-title="displayName" item-value="token"
                placeholder="Search instrument..." density="compact" variant="outlined" hide-details
                class="instrument-selector" style="max-width: 300px;" return-object
                @update:model-value="onInstrumentSelected">
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                        :title="item.raw.displayName || item.raw.name || `${item.raw.exch || ''}:${item.raw.tsym || ''}`"
                        :subtitle="item.raw.exch && item.raw.tsym ? `${item.raw.exch} - ${item.raw.tsym}` : (item.raw.exch || item.raw.tsym || '')" />
                </template>
                <template v-slot:selection="{ item }">
                    <span v-if="item.raw">{{ item.raw.displayName || item.raw.name || `${item.raw.exch ||
                        ''}:${item.raw.tsym || ''}` }}</span>
                    <span v-else>Select instrument...</span>
                </template>
            </v-autocomplete>

            <v-spacer></v-spacer>

            <!-- Timeframe Selector -->
            <v-btn-toggle v-model="selectedTimeframe" mandatory density="compact" variant="outlined"
                class="timeframe-selector" @update:model-value="onTimeframeChange">
                <v-btn value="1" size="small">1m</v-btn>
                <v-btn value="5" size="small">5m</v-btn>
                <v-btn value="15" size="small">15m</v-btn>
                <v-btn value="60" size="small">1h</v-btn>
                <v-btn value="1D" size="small">1D</v-btn>
            </v-btn-toggle>

            <v-divider vertical class="mx-2"></v-divider>

            <!-- Chart Type Selector -->
            <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-chart-line" variant="text" size="small"></v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item @click="chartType = 'candlestick'">
                        <v-list-item-title>Candlestick</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="chartType = 'bar'">
                        <v-list-item-title>Bar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="chartType = 'line'">
                        <v-list-item-title>Line</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <!-- Indicators Menu -->
            <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-chart-timeline-variant" variant="text" size="small"></v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item @click="toggleIndicator('SMA')">
                        <v-list-item-title>SMA</v-list-item-title>
                        <template v-slot:append>
                            <v-icon v-if="indicators.includes('SMA')" color="primary">mdi-check</v-icon>
                        </template>
                    </v-list-item>
                    <v-list-item @click="toggleIndicator('RSI')">
                        <v-list-item-title>RSI</v-list-item-title>
                        <template v-slot:append>
                            <v-icon v-if="indicators.includes('RSI')" color="primary">mdi-check</v-icon>
                        </template>
                    </v-list-item>
                    <v-list-item @click="toggleIndicator('MACD')">
                        <v-list-item-title>MACD</v-list-item-title>
                        <template v-slot:append>
                            <v-icon v-if="indicators.includes('MACD')" color="primary">mdi-check</v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-divider vertical class="mx-2"></v-divider>

            <!-- Layout Toolbar -->
            <LayoutToolbar v-model="selectedLayoutId" @layout-selected="onLayoutSelected"
                @save-layout="saveCurrentLayout" @load-layout="openLayoutManager" @show-templates="showTemplates = true"
                @undo="undoLayout" @redo="redoLayout" />

            <v-divider vertical class="mx-2"></v-divider>

            <!-- Layout Sharing Button -->
            <v-btn icon="mdi-share-variant" variant="text" size="small" title="Share Layout"
                @click="showLayoutSharing = true"></v-btn>

            <!-- Analytics Button -->
            <v-btn icon="mdi-chart-line" variant="text" size="small" title="Analytics"
                @click="showAnalytics = true"></v-btn>

            <v-divider vertical class="mx-2"></v-divider>

            <!-- Add Widget Menu -->
            <v-menu v-model="showAddWidgetMenu" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-plus" variant="text" size="small"></v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item @click="showWidgetLibrary = true; showAddWidgetMenu = false">
                        <v-list-item-title>Widget Library</v-list-item-title>
                        <template v-slot:prepend>
                            <v-icon icon="mdi-widgets" size="small"></v-icon>
                        </template>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="addWidget('chart'); showAddWidgetMenu = false">
                        <v-list-item-title>Chart</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('orderbook'); showAddWidgetMenu = false">
                        <v-list-item-title>Order Book</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('tradebook'); showAddWidgetMenu = false">
                        <v-list-item-title>Trade Book</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('positions'); showAddWidgetMenu = false">
                        <v-list-item-title>Positions</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('marketwatch'); showAddWidgetMenu = false">
                        <v-list-item-title>Marketwatch</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('orderwindow'); showAddWidgetMenu = false">
                        <v-list-item-title>Order Window</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('calculator'); showAddWidgetMenu = false">
                        <v-list-item-title>Calculator</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('ipos'); showAddWidgetMenu = false">
                        <v-list-item-title>IPOs</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('notes'); showAddWidgetMenu = false">
                        <v-list-item-title>Notes</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="addWidget('pomodoro'); showAddWidgetMenu = false">
                        <v-list-item-title>Pomodoro Timer</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-divider vertical class="mx-2"></v-divider>

            <!-- Theme Toggle -->
            <v-btn :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'" variant="text" size="small"
                @click="toggleTheme"></v-btn>

            <!-- Settings Menu -->
            <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small"></v-btn>
                </template>
                <v-list density="compact">
                    <v-list-item>
                        <v-list-item-title>Show Trade Markers</v-list-item-title>
                        <template v-slot:append>
                            <v-switch v-model="showTradeMarkers" density="compact" hide-details></v-switch>
                        </template>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-title>Show Instrument Names</v-list-item-title>
                        <template v-slot:append>
                            <v-switch v-model="showInstrumentNames" density="compact" hide-details></v-switch>
                        </template>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-toolbar>

        <!-- Widget Container -->
        <div class="widget-container" :style="{ paddingTop: '56px' }">
            <!-- Grid Overlay -->
            <GridOverlay :enabled="gridEnabled" :size="gridSize" />

            <!-- Layout Manager Dialog -->
            <LayoutManager v-model="showLayoutManager" @layout-loaded="onLayoutLoaded"
                @template-applied="onTemplateApplied" />

            <!-- Monitor Manager Dialog -->
            <MonitorManager v-model="showMonitorManager" @layout-loaded="onMonitorLayoutLoaded" />

            <!-- Widget Library Dialog -->
            <WidgetLibrary v-model="showWidgetLibrary" @widget-selected="handleWidgetSelected" />

            <!-- Layout Sharing Dialog -->
            <LayoutSharing v-model="showLayoutSharing" @layout-imported="handleLayoutImported" />

            <!-- Analytics Dialog -->
            <LayoutAnalytics v-model="showAnalytics" @layout-selected="onLayoutSelected"
                @widget-selected="handleWidgetSelected" />

            <!-- Template Selector Dialog -->
            <v-dialog v-model="showTemplates" max-width="900px" scrollable>
                <v-card>
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span class="text-h6">Select Template</span>
                        <v-btn icon="mdi-close" variant="text" size="small" @click="showTemplates = false"></v-btn>
                    </v-card-title>
                    <v-card-text>
                        <LayoutTemplateSelector @select-template="applyTemplate" />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn variant="text" @click="showTemplates = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <TradingWidget v-for="widget in activeWidgets" :key="widget.id" :widget-id="widget.id" :title="widget.title"
                :icon="widget.icon" :default-x="widget.x" :default-y="widget.y" :default-width="widget.width"
                :default-height="widget.height" :z-index="widget.zIndex" :snap-to-grid="layoutStore?.snapToGrid ?? true"
                :grid-size="layoutStore?.gridSize ?? 16" :available-widgets="activeWidgets" @close="removeWidget"
                @focus="focusWidget" @link-created="handleLinkCreated" @link-broken="handleLinkBroken"
                @instrument-changed="handleWidgetInstrumentChange" @timeframe-changed="handleWidgetTimeframeChange"
                @chart-type-changed="handleWidgetChartTypeChange" @indicators-changed="handleWidgetIndicatorsChange">
                <!-- Chart Widget -->
                <ChartPane v-if="widget.type === 'chart'" :pane-id="widget.id"
                    :instrument="widget.instrument || selectedInstrument"
                    :timeframe="widget.timeframe || selectedTimeframe" :chart-type="widget.chartType || chartType"
                    :indicators="widget.indicators || indicators" :show-instrument-name="showInstrumentNames"
                    :show-trade-markers="showTradeMarkers" :theme="theme"
                    @update-subscription="(instrument) => handleSubscriptionUpdate(instrument, widget.id)"
                    @place-order="handlePlaceOrder" @set-stop-loss="handleSetStopLoss"
                    @set-take-profit="handleSetTakeProfit" @create-bracket-order="handleCreateBracketOrder"
                    @open-order-window="handleOpenOrderWindow" />

                <!-- Order Book Widget -->
                <OrderBookPanel v-else-if="widget.type === 'orderbook'"
                    :instrument="widget.instrument || selectedInstrument" :theme="theme"
                    @update-subscription="(instrument) => handleSubscriptionUpdate(instrument, widget.id)" />

                <!-- Trade Book Widget -->
                <TradeBookPanel v-else-if="widget.type === 'tradebook'"
                    :instrument="widget.instrument || selectedInstrument" :theme="theme"
                    @update-subscription="(instrument) => handleSubscriptionUpdate(instrument, widget.id)" />

                <!-- Positions Widget -->
                <PositionsPanel v-else-if="widget.type === 'positions'"
                    :instrument="widget.instrument || selectedInstrument" :theme="theme"
                    @update-subscription="(instrument) => handleSubscriptionUpdate(instrument, widget.id)" />

                <!-- Marketwatch Widget -->
                <MarketwatchPanel v-else-if="widget.type === 'marketwatch'" :theme="theme"
                    :active-tab="widget.activeTab || 'watchlist'" @update:active-tab="widget.activeTab = $event"
                    @select-instrument="onInstrumentSelected" />

                <!-- Order Window Widget -->
                <OrderWindowPanel v-else-if="widget.type === 'orderwindow'"
                    :instrument="widget.instrument || selectedInstrument" :theme="theme" />

                <!-- Calculator Widget -->
                <CalculatorPanel v-else-if="widget.type === 'calculator'" :theme="theme" />

                <!-- IPOs Widget -->
                <IPOsPanel v-else-if="widget.type === 'ipos'" :theme="theme" />

                <!-- Notes Widget -->
                <NotesPanel v-else-if="widget.type === 'notes'" :theme="theme" />

                <!-- Pomodoro Widget -->
                <PomodoroTimer v-else-if="widget.type === 'pomodoro'" :theme="theme" />
            </TradingWidget>

            <!-- Empty State -->
            <div v-if="activeWidgets.length === 0" class="empty-state">
                <v-icon size="64" color="grey">mdi-widgets</v-icon>
                <p class="text-h6 mt-4">No widgets added</p>
                <p class="text-body-2 mt-2">Click the + button to add widgets</p>
            </div>
        </div>

        <!-- Loading Overlay -->
        <v-overlay v-model="isLoading" class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-overlay>

        <!-- Quick Order Entry Dialog -->
        <QuickOrderEntry v-model="showQuickOrder" :instrument="quickOrderInstrument" :default-price="quickOrderPrice"
            :default-side="quickOrderSide" @order-placed="handleOrderPlaced" />

        <!-- Error Snackbar -->
        <v-snackbar v-model="showError" color="error" timeout="5000">
            {{ errorMessage }}
            <template v-slot:actions>
                <v-btn variant="text" @click="showError = false">Close</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTradingStore } from '@/stores/tradingStore'
import { useLayoutStore } from '@/stores/layoutStore'
import { useMonitorStore } from '@/stores/monitorStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useAppStore } from '@/stores/appStore'
import { emitWidgetEvent } from '@/utils/widgetEventBus'
import { formatInstrumentName, normalizeInstrument, isValidInstrument } from '@/utils/instrumentHelpers'
import { subscribe, unsubscribe, updateSubscriptionData } from '@/utils/subscriptionManager'
import LazyWidget from '@/components/LazyWidget.vue'
import TradingWidget from './components/TradingWidget.vue'
import LayoutManager from './components/LayoutManager.vue'
import LayoutTemplateSelector from './components/LayoutTemplateSelector.vue'
import LayoutToolbar from './components/LayoutToolbar.vue'
import GridOverlay from './components/GridOverlay.vue'
import MonitorManager from './components/MonitorManager.vue'
import WidgetLibrary from './components/WidgetLibrary.vue'
import LayoutSharing from './components/LayoutSharing.vue'
import LayoutAnalytics from './components/LayoutAnalytics.vue'
import ChartPane from './components/ChartPane.vue'
import QuickOrderEntry from './components/QuickOrderEntry.vue'
import OrderBookPanel from './components/OrderBookPanel.vue'
import TradeBookPanel from './components/TradeBookPanel.vue'
import PositionsPanel from './components/PositionsPanel.vue'
import MarketwatchPanel from './components/MarketwatchPanel.vue'
import OrderWindowPanel from './components/OrderWindowPanel.vue'
import CalculatorPanel from './components/CalculatorPanel.vue'
import IPOsPanel from './components/IPOsPanel.vue'
import NotesPanel from './components/NotesPanel.vue'
import PomodoroTimer from './components/PomodoroTimer.vue'
import { getMasters } from '@/components/mixins/getAPIdata'
import { setWebsocket } from '@/utils/webSocketEventBus'

export default {
    name: 'TradingPage',
    components: {
        LazyWidget,
        TradingWidget,
        LayoutManager,
        LayoutTemplateSelector,
        LayoutToolbar,
        GridOverlay,
        MonitorManager,
        WidgetLibrary,
        LayoutSharing,
        LayoutAnalytics,
        ChartPane,
        QuickOrderEntry,
        OrderBookPanel,
        TradeBookPanel,
        PositionsPanel,
        MarketwatchPanel,
        OrderWindowPanel,
        CalculatorPanel,
        IPOsPanel,
        NotesPanel,
        PomodoroTimer,
    },
    setup() {
        const tradingStore = useTradingStore()
        const layoutStore = useLayoutStore()
        const monitorStore = useMonitorStore()
        const analyticsStore = useAnalyticsStore()
        const appStore = useAppStore()

        // Local state
        const searching = ref(false)
        const searchInput = ref('')
        const instrumentOptions = ref([])
        const isLoading = ref(false)
        const showError = ref(false)
        const errorMessage = ref('')
        const selectedTimeframe = ref('1D')
        const chartType = ref('candlestick')
        const indicators = ref(['SMA'])
        const showTradeMarkers = ref(true)
        const showInstrumentNames = ref(true)

        // Layout state
        const showLayoutManager = ref(false)
        const showTemplates = ref(false)
        const showMonitorManager = ref(false)
        const showWidgetLibrary = ref(false)
        const showLayoutSharing = ref(false)
        const showAnalytics = ref(false)
        const showAddWidgetMenu = ref(false)
        const selectedLayoutId = ref(null)

        // Trading state
        const showQuickOrder = ref(false)
        const quickOrderInstrument = ref(null)
        const quickOrderPrice = ref(0)
        const quickOrderSide = ref('buy')

        // Widgets state
        const widgets = ref([])
        const widgetCounter = ref(0)
        const focusedWidgetId = ref(null)
        const visibleWidgets = ref(new Set()) // Track visible widgets for lazy loading
        const widgetSubscriptions = ref(new Map()) // Track widget subscriptions

        // Grid settings
        const gridEnabled = computed(() => layoutStore?.gridEnabled ?? true)
        const gridSize = computed(() => layoutStore?.gridSize ?? 16)
        const canUndo = computed(() => layoutStore?.canUndo ?? false)
        const canRedo = computed(() => layoutStore?.canRedo ?? false)

        // Chart instruments
        const selectedInstrument = ref(null)

        // Computed
        const theme = computed(() => tradingStore.theme)
        const isDark = computed(() => theme.value === 'dark')

        const activeWidgets = computed(() => {
            return widgets.value.map((widget, index) => ({
                ...widget,
                zIndex: widget.id === focusedWidgetId.value ? 1000 : index + 1,
            }))
        })

        // Widget configurations
        const widgetConfigs = {
            chart: { title: 'Chart', icon: 'mdi-chart-line', width: 600, height: 400 },
            orderbook: { title: 'Order Book', icon: 'mdi-book-open-variant', width: 400, height: 300 },
            tradebook: { title: 'Recent Trades', icon: 'mdi-swap-horizontal', width: 400, height: 300 },
            positions: { title: 'Open Positions', icon: 'mdi-chart-line', width: 500, height: 400 },
            marketwatch: { title: 'Marketwatch', icon: 'mdi-view-dashboard', width: 350, height: 500 },
            orderwindow: { title: 'Order Window', icon: 'mdi-cart', width: 400, height: 350 },
            calculator: { title: 'Calculator', icon: 'mdi-calculator', width: 300, height: 400 },
            ipos: { title: 'Upcoming IPOs', icon: 'mdi-trending-up', width: 350, height: 300 },
            notes: { title: 'Notes', icon: 'mdi-note-text', width: 350, height: 300 },
            pomodoro: { title: 'Pomodoro Timer', icon: 'mdi-timer', width: 300, height: 300 },
        }

        /**
         * Add a new widget
         */
        const addWidget = (type) => {
            try {
                const config = widgetConfigs[type]
                if (!config) {
                    console.warn(`Widget config not found for type: ${type}`)
                    return
                }

                const startTime = Date.now()
                widgetCounter.value++
                const widget = {
                    id: `${type}-${widgetCounter.value}`,
                    type,
                    title: config.title,
                    icon: config.icon,
                    x: 50 + (widgets.value.length * 30),
                    y: 100 + (widgets.value.length * 30),
                    width: config.width,
                    height: config.height,
                    instrument: type === 'chart' || type === 'orderbook' || type === 'tradebook' || type === 'orderwindow' ? selectedInstrument.value : null,
                    activeTab: type === 'marketwatch' ? 'watchlist' : null,
                }

                widgets.value.push(widget)
                console.log(`Widget added: ${widget.id}`, widget)
                console.log(`Total widgets: ${widgets.value.length}`, widgets.value)
                saveWidgets()

                // Track analytics (with error handling)
                try {
                    const renderTime = Date.now() - startTime
                    if (analyticsStore && typeof analyticsStore.trackWidgetAdded === 'function') {
                        analyticsStore.trackWidgetAdded(type)
                    }
                    if (analyticsStore && typeof analyticsStore.trackWidgetRenderTime === 'function') {
                        analyticsStore.trackWidgetRenderTime(renderTime)
                    }
                } catch (analyticsError) {
                    console.warn('Error tracking analytics:', analyticsError)
                    // Don't fail widget addition if analytics fails
                }
            } catch (error) {
                console.error('Error adding widget:', error)
                showError.value = true
                errorMessage.value = `Failed to add widget: ${error.message}`
            }
        }

        /**
         * Remove a widget
         */
        const removeWidget = (widgetId) => {
            const index = widgets.value.findIndex(w => w.id === widgetId)
            if (index !== -1) {
                const widget = widgets.value[index]

                // Unsubscribe using subscription manager
                const subscription = widgetSubscriptions.value.get(widgetId)
                if (subscription && subscription.instrument) {
                    unsubscribe(subscription.instrument.token, widgetId)
                    widgetSubscriptions.value.delete(widgetId)
                }

                // Also unsubscribe from WebSocket (legacy)
                if (widget.instrument) {
                    const subscriptionData = [{
                        exch: widget.instrument.exch,
                        token: widget.instrument.token,
                        tsym: widget.instrument.tsym,
                    }]
                    setWebsocket('unsub', subscriptionData, 'trading')
                    tradingStore.unregisterSubscription(widget.instrument.token)
                }

                // Remove from visible widgets
                visibleWidgets.value.delete(widgetId)

                widgets.value.splice(index, 1)
                saveWidgets()
            }
        }

        /**
         * Focus a widget (bring to front)
         */
        const focusWidget = (widgetId) => {
            focusedWidgetId.value = widgetId
        }

        /**
         * Save widgets to localStorage and layout store
         */
        const saveWidgets = () => {
            try {
                localStorage.setItem('trading_widgets', JSON.stringify(widgets.value))
                // Add to layout history
                if (layoutStore) {
                    layoutStore.addToHistory(widgets.value)
                }
                // Save to current monitor
                if (monitorStore) {
                    monitorStore.saveCurrentMonitorLayout({
                        widgets: widgets.value,
                        timestamp: Date.now(),
                    })
                }
            } catch (err) {
                console.error('Error saving widgets:', err)
            }
        }

        /**
         * Load widgets from localStorage
         */
        const loadWidgets = () => {
            try {
                const saved = localStorage.getItem('trading_widgets')
                if (saved) {
                    widgets.value = JSON.parse(saved)
                    // Update widget counter
                    const maxId = widgets.value.reduce((max, w) => {
                        const match = w.id.match(/-(\d+)$/)
                        return match ? Math.max(max, parseInt(match[1])) : max
                    }, 0)
                    widgetCounter.value = maxId
                } else {
                    // Add default widgets
                    addWidget('chart')
                    addWidget('marketwatch')
                    addWidget('orderbook')
                }
            } catch (err) {
                console.error('Error loading widgets:', err)
                // Add default widgets on error
                addWidget('chart')
                addWidget('marketwatch')
            }
        }

        /**
         * Search instruments with debounce
         */
        let searchTimeout = null
        const watchSearchInput = (newValue) => {
            if (searchTimeout) clearTimeout(searchTimeout)
            if (!newValue || newValue.length < 2) {
                instrumentOptions.value = []
                return
            }

            searchTimeout = setTimeout(async () => {
                searching.value = true
                try {
                    const results = await getMasters(newValue)
                    if (results && Array.isArray(results) && results.length > 0) {
                        instrumentOptions.value = results.map((item) => {
                            // Normalize and ensure all fields exist
                            const normalized = normalizeInstrument({
                                token: item.token,
                                exch: item.exch,
                                tsym: item.tsym || item.name || item.cname || '',
                                name: item.name || item.cname || item.tsym || '',
                                pp: item.pp,
                                ls: item.ls,
                                ti: item.ti,
                            })

                            return {
                                ...normalized,
                                displayName: formatInstrumentName(normalized),
                            }
                        }).filter(item => isValidInstrument(item)) // Filter out invalid instruments
                    } else {
                        instrumentOptions.value = []
                    }
                } catch (error) {
                    console.error('Error searching instruments:', error)
                    showError.value = true
                    errorMessage.value = 'Failed to search instruments'
                    instrumentOptions.value = []
                } finally {
                    searching.value = false
                }
            }, 300)
        }

        /**
         * Handle instrument selection
         */
        const onInstrumentSelected = (instrument) => {
            if (!instrument) return

            // Normalize instrument before using
            const normalized = normalizeInstrument(instrument)
            if (!isValidInstrument(normalized)) {
                console.warn('Invalid instrument selected:', instrument)
                showError.value = true
                errorMessage.value = 'Invalid instrument selected'
                return
            }

            // Update selected instrument with normalized data
            selectedInstrument.value = normalized
            tradingStore.setSelectedInstrument(normalized)

            // Update widgets that need the instrument
            widgets.value.forEach(widget => {
                if (['chart', 'orderbook', 'tradebook', 'orderwindow'].includes(widget.type)) {
                    widget.instrument = normalized
                    // Emit instrument change for chart widgets
                    if (widget.type === 'chart') {
                        emitInstrumentChange(widget.id, normalized)
                    }
                }
            })

            subscribeToInstrument(normalized)
            saveWidgets()
        }

        /**
         * Subscribe to WebSocket for instrument
         */
        const subscribeToInstrument = (instrument) => {
            if (!instrument || !instrument.token || !instrument.exch) return

            const subscriptionData = [{
                exch: instrument.exch,
                token: instrument.token,
                tsym: instrument.tsym,
            }]

            setWebsocket('sub', subscriptionData, 'trading')
            tradingStore.registerSubscription(instrument.token)
        }

        /**
         * Handle WebSocket subscription updates
         */
        /**
         * Handle subscription update with optimized subscription manager
         */
        const handleSubscriptionUpdate = (instrument, widgetId) => {
            if (!instrument) return

            // If widgetId is provided, use subscription manager
            if (widgetId) {
                const subscriptionId = subscribe(
                    instrument,
                    widgetId,
                    (data) => {
                        // Distribute data to widget
                        emitWidgetEvent(widgetId, 'data-update', { instrument, data })
                    },
                    { throttle: true }
                )

                // Store subscription ID
                if (subscriptionId) {
                    widgetSubscriptions.value.set(widgetId, {
                        subscriptionId,
                        instrument,
                    })
                }
            }

            // Also register in trading store for tracking
            if (instrument.token) {
                tradingStore.registerSubscription(instrument.token)
            }
        }

        /**
         * Handle widget visibility for lazy loading
         */
        const handleWidgetVisible = (widgetId) => {
            visibleWidgets.value.add(widgetId)

            // Restore subscriptions for visible widget
            const subscription = widgetSubscriptions.value.get(widgetId)
            if (subscription && subscription.instrument) {
                handleSubscriptionUpdate(subscription.instrument, widgetId)
            }
        }

        /**
         * Handle widget hidden for lazy loading
         */
        const handleWidgetHidden = (widgetId) => {
            visibleWidgets.value.delete(widgetId)

            // Optionally unsubscribe when hidden (for memory management)
            // Uncomment if you want to unsubscribe hidden widgets
            // const subscription = widgetSubscriptions.value.get(widgetId)
            // if (subscription && subscription.instrument) {
            //     unsubscribe(subscription.instrument.token, widgetId)
            //     widgetSubscriptions.value.delete(widgetId)
            // }
        }

        /**
         * Handle timeframe change
         */
        const onTimeframeChange = (timeframe) => {
            // Timeframe is already updated via v-model
            // Emit timeframe change for all chart widgets
            widgets.value.forEach((widget) => {
                if (widget.type === 'chart') {
                    emitTimeframeChange(widget.id, timeframe)
                }
            })
        }

        /**
         * Toggle indicator
         */
        const toggleIndicator = (indicator) => {
            const index = indicators.value.indexOf(indicator)
            if (index > -1) {
                indicators.value.splice(index, 1)
            } else {
                indicators.value.push(indicator)
            }
            // Emit indicators change for all chart widgets
            widgets.value.forEach((widget) => {
                if (widget.type === 'chart') {
                    emitIndicatorsChange(widget.id, indicators.value)
                }
            })
        }

        /**
         * Toggle theme
         */
        const toggleTheme = () => {
            tradingStore.toggleTheme()
        }

        /**
         * Layout management functions
         */
        const openLayoutManager = () => {
            showLayoutManager.value = true
        }

        const openMonitorManager = () => {
            showMonitorManager.value = true
        }

        const onMonitorLayoutLoaded = ({ monitorId, layout }) => {
            // Load layout for the specified monitor
            if (layout && layout.widgets) {
                widgets.value = JSON.parse(JSON.stringify(layout.widgets))
                saveWidgets()
            }
        }

        /**
         * Handle layout selection from toolbar
         */
        const onLayoutSelected = (layoutId) => {
            if (!layoutId || !layoutStore) return

            try {
                const startTime = Date.now()
                const layout = layoutStore.loadLayout(layoutId)
                if (layout && layout.widgets) {
                    widgets.value = JSON.parse(JSON.stringify(layout.widgets))
                    saveWidgets()
                    selectedLayoutId.value = layoutId

                    // Track analytics
                    const loadTime = Date.now() - startTime
                    analyticsStore.trackLayoutUsage(layoutId)
                    analyticsStore.trackLayoutLoadTime(loadTime)
                    analyticsStore.trackLayoutSwitch()
                }
            } catch (error) {
                console.error('Error loading layout:', error)
                showError.value = true
                errorMessage.value = 'Failed to load layout'
            }
        }

        /**
         * Handle widget selection from library
         */
        const handleWidgetSelected = (widgetType) => {
            try {
                addWidget(widgetType)
                showWidgetLibrary.value = false
            } catch (error) {
                console.error('Error adding widget from library:', error)
                showError.value = true
                errorMessage.value = 'Failed to add widget from library'
            }
        }

        /**
         * Handle layout imported from sharing
         */
        const handleLayoutImported = (importedLayout) => {
            if (importedLayout && importedLayout.widgets) {
                widgets.value = JSON.parse(JSON.stringify(importedLayout.widgets))
                saveWidgets()
                selectedLayoutId.value = importedLayout.id
            }
        }

        const saveCurrentLayout = () => {
            if (!layoutStore) {
                console.error('Layout store not initialized')
                return
            }
            const name = prompt('Enter layout name:', layoutStore.currentLayoutName || 'My Layout')
            if (name) {
                try {
                    layoutStore.saveLayout(name, widgets.value)
                    layoutStore.setCurrentLayoutName(name)
                    alert('Layout saved successfully!')
                } catch (error) {
                    console.error('Error saving layout:', error)
                    alert('Error saving layout')
                }
            }
        }

        const applyTemplate = (template) => {
            if (!layoutStore) {
                console.error('Layout store not initialized')
                return
            }
            try {
                if (!template || !template.widgets || !Array.isArray(template.widgets)) {
                    console.error('Invalid template:', template)
                    showError.value = true
                    errorMessage.value = 'Invalid template format'
                    return
                }

                // Reset widget counter to ensure unique IDs
                const maxId = widgets.value.reduce((max, w) => {
                    const match = w.id.match(/-(\d+)$/)
                    return match ? Math.max(max, parseInt(match[1])) : max
                }, 0)
                widgetCounter.value = maxId

                // Clone template widgets and ensure unique IDs
                const clonedWidgets = template.widgets.map((widget, index) => {
                    widgetCounter.value++
                    return {
                        ...widget,
                        id: `${widget.type}-${widgetCounter.value}`,
                        x: widget.x || 50 + (index * 30),
                        y: widget.y || 100 + (index * 30),
                        width: widget.width || 400,
                        height: widget.height || 300,
                        instrument: widget.instrument || (['chart', 'orderbook', 'tradebook', 'orderwindow'].includes(widget.type) ? selectedInstrument.value : null),
                        activeTab: widget.activeTab || (widget.type === 'marketwatch' ? 'watchlist' : null),
                    }
                })

                layoutStore.applyTemplate(template)
                widgets.value = clonedWidgets
                saveWidgets()
                showTemplates.value = false
                console.log(`Template applied: ${template.name} with ${clonedWidgets.length} widgets`)
            } catch (error) {
                console.error('Error applying template:', error)
                showError.value = true
                errorMessage.value = `Failed to apply template: ${error.message}`
            }
        }

        const onLayoutLoaded = (layoutId) => {
            if (!layoutStore) {
                console.error('Layout store not initialized')
                return
            }
            try {
                const layout = layoutStore.loadLayout(layoutId)
                if (!layout || !layout.widgets || !Array.isArray(layout.widgets)) {
                    console.error('Invalid layout:', layout)
                    showError.value = true
                    errorMessage.value = 'Invalid layout format'
                    return
                }

                // Reset widget counter to ensure unique IDs
                const maxId = layout.widgets.reduce((max, w) => {
                    const match = w.id ? w.id.match(/-(\d+)$/) : null
                    return match ? Math.max(max, parseInt(match[1])) : max
                }, 0)
                widgetCounter.value = maxId

                // Clone layout widgets and ensure unique IDs
                const clonedWidgets = layout.widgets.map((widget, index) => {
                    widgetCounter.value++
                    return {
                        ...widget,
                        id: widget.id || `${widget.type}-${widgetCounter.value}`,
                        x: widget.x || 50 + (index * 30),
                        y: widget.y || 100 + (index * 30),
                        width: widget.width || 400,
                        height: widget.height || 300,
                        instrument: widget.instrument || (['chart', 'orderbook', 'tradebook', 'orderwindow'].includes(widget.type) ? selectedInstrument.value : null),
                        activeTab: widget.activeTab || (widget.type === 'marketwatch' ? 'watchlist' : null),
                    }
                })

                widgets.value = clonedWidgets
                saveWidgets()
                showLayoutManager.value = false
                console.log(`Layout loaded: ${layoutId} with ${clonedWidgets.length} widgets`)
            } catch (error) {
                console.error('Error loading layout:', error)
                showError.value = true
                errorMessage.value = `Failed to load layout: ${error.message}`
            }
        }

        const onTemplateApplied = (template) => {
            // Template already applied in applyTemplate, but ensure it's properly handled
            if (template && template.widgets) {
                applyTemplate(template)
            }
        }

        const undoLayout = () => {
            if (!layoutStore) return
            if (layoutStore.undo()) {
                widgets.value = JSON.parse(JSON.stringify(layoutStore.currentLayout))
            }
        }

        const redoLayout = () => {
            if (!layoutStore) return
            if (layoutStore.redo()) {
                widgets.value = JSON.parse(JSON.stringify(layoutStore.currentLayout))
            }
        }

        /**
         * Widget linking functions
         */
        const handleLinkCreated = (data) => {
            // Link created, widgets will sync automatically via event bus
            console.log('Widget link created:', data)
        }

        const handleLinkBroken = (widgetId) => {
            // Link broken
            console.log('Widget link broken:', widgetId)
        }

        /**
         * Handle widget synchronization events
         */
        const handleWidgetInstrumentChange = (data) => {
            // Update widget instrument
            const widget = widgets.value.find((w) => w.id === data.widgetId)
            if (widget && data.instrument) {
                widget.instrument = data.instrument
                saveWidgets()
            }
        }

        const handleWidgetTimeframeChange = (data) => {
            // Update widget timeframe
            const widget = widgets.value.find((w) => w.id === data.widgetId)
            if (widget && data.timeframe) {
                widget.timeframe = data.timeframe
                saveWidgets()
            }
        }

        const handleWidgetChartTypeChange = (data) => {
            // Update widget chart type
            const widget = widgets.value.find((w) => w.id === data.widgetId)
            if (widget && data.chartType) {
                widget.chartType = data.chartType
                saveWidgets()
            }
        }

        const handleWidgetIndicatorsChange = (data) => {
            // Update widget indicators
            const widget = widgets.value.find((w) => w.id === data.widgetId)
            if (widget && data.indicators) {
                widget.indicators = data.indicators
                saveWidgets()
            }
        }

        /**
         * Emit widget events for synchronization
         */
        const emitInstrumentChange = (widgetId, instrument) => {
            emitWidgetEvent(widgetId, 'instrument-change', { widgetId, instrument })
        }

        const emitTimeframeChange = (widgetId, timeframe) => {
            emitWidgetEvent(widgetId, 'timeframe-change', { widgetId, timeframe })
        }

        const emitChartTypeChange = (widgetId, chartType) => {
            emitWidgetEvent(widgetId, 'chart-type-change', { widgetId, chartType })
        }

        const emitIndicatorsChange = (widgetId, indicators) => {
            emitWidgetEvent(widgetId, 'indicators-change', { widgetId, indicators })
        }

        /**
         * Trading event handlers
         */
        const handlePlaceOrder = (order) => {
            console.log('Place order:', order)
            // Open quick order entry or place order directly
            quickOrderInstrument.value = order.instrument
            quickOrderPrice.value = order.price
            quickOrderSide.value = order.side || 'buy'
            showQuickOrder.value = true
        }

        const handleSetStopLoss = (data) => {
            console.log('Set stop loss:', data)
            // Handle stop loss
        }

        const handleSetTakeProfit = (data) => {
            console.log('Set take profit:', data)
            // Handle take profit
        }

        const handleCreateBracketOrder = (data) => {
            console.log('Create bracket order:', data)
            // Handle bracket order
            quickOrderInstrument.value = data.instrument
            quickOrderPrice.value = data.entryPrice
            quickOrderSide.value = 'buy'
            showQuickOrder.value = true
        }

        const handleOpenOrderWindow = (data) => {
            console.log('Open order window:', data)
            // Open full order window
            quickOrderInstrument.value = data.instrument
            quickOrderPrice.value = data.price || 0
            quickOrderSide.value = 'buy'
            showQuickOrder.value = true
        }

        const handleOrderPlaced = (order) => {
            console.log('Order placed:', order)
            showQuickOrder.value = false
            // Show success message
            showError.value = false
            errorMessage.value = 'Order placed successfully!'
            setTimeout(() => {
                showError.value = false
            }, 3000)
        }

        /**
         * Cleanup subscriptions
         */
        const cleanupSubscriptions = () => {
            if (selectedInstrument.value) {
                const subscriptionData = [{
                    exch: selectedInstrument.value.exch,
                    token: selectedInstrument.value.token,
                    tsym: selectedInstrument.value.tsym,
                }]
                setWebsocket('unsub', subscriptionData, 'trading')
                tradingStore.unregisterSubscription(selectedInstrument.value.token)
            }
        }

        // Monitor cleanup function
        let monitorCleanup = null

        // Initialize on mount
        onMounted(async () => {
            // Initialize monitor store
            monitorCleanup = monitorStore.initialize()

            // Load layout for current monitor
            const currentLayout = monitorStore.getLayoutForMonitor(monitorStore.currentMonitorId)
            if (currentLayout && currentLayout.widgets) {
                widgets.value = JSON.parse(JSON.stringify(currentLayout.widgets))
            } else {
                loadWidgets()
            }

            // Try to load last selected instrument
            const lastInstrument = localStorage.getItem('trading_last_instrument')
            if (lastInstrument) {
                try {
                    const instrument = JSON.parse(lastInstrument)
                    onInstrumentSelected(instrument)
                } catch (error) {
                    console.error('Failed to load last instrument:', error)
                }
            }

            // Watch search input
            watch(searchInput, watchSearchInput, { immediate: false })

            // Watch for monitor changes
            window.addEventListener('monitor-changed', handleMonitorChange)
        })

        /**
         * Handle monitor change
         */
        const handleMonitorChange = (event) => {
            const { newMonitor } = event.detail

            // Save current layout to previous monitor
            if (monitorStore.previousMonitorId) {
                monitorStore.saveLayoutForMonitor(monitorStore.previousMonitorId, {
                    widgets: widgets.value,
                    timestamp: Date.now(),
                })
            }

            // Load layout for new monitor
            const newLayout = monitorStore.getLayoutForMonitor(newMonitor.id)
            if (newLayout && newLayout.widgets) {
                widgets.value = JSON.parse(JSON.stringify(newLayout.widgets))
                saveWidgets()
            }
        }

        // Cleanup on unmount
        onBeforeUnmount(() => {
            cleanupSubscriptions()
            if (searchTimeout) clearTimeout(searchTimeout)
            if (monitorCleanup) monitorCleanup()
            window.removeEventListener('monitor-changed', handleMonitorChange)
        })

        // Save selected instrument
        watch(selectedInstrument, (newInstrument) => {
            if (newInstrument) {
                try {
                    localStorage.setItem('trading_last_instrument', JSON.stringify(newInstrument))
                } catch (err) {
                    console.error('Error saving instrument:', err)
                }
            }
        }, { deep: true })

        return {
            // State
            searching,
            searchInput,
            instrumentOptions,
            isLoading,
            showError,
            errorMessage,
            selectedTimeframe,
            chartType,
            indicators,
            showTradeMarkers,
            showInstrumentNames,
            selectedInstrument,
            widgets,
            activeWidgets,
            focusedWidgetId,

            // Computed
            theme,
            isDark,

            // Layout state
            showLayoutManager,
            showTemplates,
            showMonitorManager,
            showWidgetLibrary,
            showLayoutSharing,
            showAnalytics,
            showAddWidgetMenu,
            selectedLayoutId,
            gridEnabled,
            gridSize,
            canUndo,
            canRedo,

            // Trading state
            showQuickOrder,
            quickOrderInstrument,
            quickOrderPrice,
            quickOrderSide,

            // Methods
            onInstrumentSelected,
            onTimeframeChange,
            toggleIndicator,
            toggleTheme,
            handleSubscriptionUpdate,
            addWidget,
            removeWidget,
            focusWidget,
            openLayoutManager,
            openMonitorManager,
            onMonitorLayoutLoaded,
            saveCurrentLayout,
            applyTemplate,
            onLayoutLoaded,
            onTemplateApplied,
            undoLayout,
            redoLayout,
            handleLinkCreated,
            handleLinkBroken,
            handleWidgetInstrumentChange,
            handleWidgetTimeframeChange,
            handleWidgetChartTypeChange,
            handleWidgetIndicatorsChange,
            emitInstrumentChange,
            emitTimeframeChange,
            emitChartTypeChange,
            emitIndicatorsChange,
            handlePlaceOrder,
            handleSetStopLoss,
            handleSetTakeProfit,
            handleCreateBracketOrder,
            handleOpenOrderWindow,
            handleOrderPlaced,
            handleWidgetVisible,
            handleWidgetHidden,
            onLayoutSelected,
            handleWidgetSelected,
            handleLayoutImported,
            formatInstrumentName,
        }
    },
}
</script>

<style scoped>
.trading-page {
    height: 100vh;
    overflow: hidden;
    position: relative;
}

.trading-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2000;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.widget-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: var(--v-background-base);
}

.empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: 0.5;
}

/* Dark/Light mode styles */
.trading-page.dark-mode {
    background-color: #121212;
    color: #ffffff;
}

.trading-page.light-mode {
    background-color: #f5f5f5;
    color: #000000;
}
</style>
