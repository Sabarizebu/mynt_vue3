<template>
    <div
        v-if="enabled"
        class="chart-trading-overlay"
        @click="handleChartClick"
        @contextmenu.prevent="handleRightClick"
        @dblclick="handleDoubleClick"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
    >
        <!-- Order Markers -->
        <ChartOrderMarker
            v-for="marker in orderMarkers"
            :key="marker.id"
            :id="marker.id"
            :price="marker.price"
            :type="marker.type"
            :side="marker.side"
            :visible="marker.visible"
            :x="marker.x"
            :y="marker.y"
            @drag-start="handleMarkerDragStart"
            @click="handleMarkerClick"
            @remove="handleMarkerRemove"
        />

        <!-- Quick Order Entry Overlay -->
        <v-card
            v-if="showOrderEntry"
            class="quick-order-overlay"
            :style="orderEntryStyle"
            elevation="4"
        >
            <v-card-title class="d-flex justify-space-between align-center pa-2">
                <span class="text-subtitle-2">Quick Order</span>
                <v-btn icon="mdi-close" variant="text" size="x-small" @click="closeOrderEntry"></v-btn>
            </v-card-title>
            <v-card-text class="pa-2">
                <v-text-field
                    v-model.number="orderQuantity"
                    label="Quantity"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                ></v-text-field>
                <v-text-field
                    v-model.number="orderPrice"
                    label="Price"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                ></v-text-field>
                <v-select
                    v-model="orderType"
                    :items="orderTypes"
                    label="Order Type"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                ></v-select>
                <div class="d-flex gap-2">
                    <v-btn
                        block
                        color="success"
                        variant="flat"
                        size="small"
                        @click="placeOrder('buy')"
                    >
                        Buy
                    </v-btn>
                    <v-btn
                        block
                        color="error"
                        variant="flat"
                        size="small"
                        @click="placeOrder('sell')"
                    >
                        Sell
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <!-- Right-Click Context Menu -->
        <v-menu
            v-model="showContextMenu"
            :location="contextMenuLocation"
            :activator="contextMenuActivator"
        >
            <v-list density="compact">
                <v-list-item @click="openOrderEntry('buy')">
                    <v-list-item-title>Buy at {{ formatPrice(clickedPrice) }}</v-list-item-title>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-arrow-up" color="success" size="small"></v-icon>
                    </template>
                </v-list-item>
                <v-list-item @click="openOrderEntry('sell')">
                    <v-list-item-title>Sell at {{ formatPrice(clickedPrice) }}</v-list-item-title>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-arrow-down" color="error" size="small"></v-icon>
                    </template>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="setStopLoss">
                    <v-list-item-title>Set Stop Loss</v-list-item-title>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-stop-circle" size="small"></v-icon>
                    </template>
                </v-list-item>
                <v-list-item @click="setTakeProfit">
                    <v-list-item-title>Set Take Profit</v-list-item-title>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-check-circle" size="small"></v-icon>
                    </template>
                </v-list-item>
                <v-list-item @click="createBracketOrder">
                    <v-list-item-title>Create Bracket Order</v-list-item-title>
                    <template v-slot:prepend>
                        <v-icon icon="mdi-brackets" size="small"></v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import ChartOrderMarker from './ChartOrderMarker.vue'

export default {
    name: 'ChartTradingOverlay',
    components: {
        ChartOrderMarker,
    },
    props: {
        enabled: {
            type: Boolean,
            default: true,
        },
        instrument: {
            type: Object,
            default: null,
        },
        currentPrice: {
            type: Number,
            default: 0,
        },
        chartHeight: {
            type: Number,
            default: 400,
        },
        chartWidth: {
            type: Number,
            default: 800,
        },
    },
    emits: ['place-order', 'set-stop-loss', 'set-take-profit', 'create-bracket-order'],
    setup(props, { emit }) {
        const showOrderEntry = ref(false)
        const showContextMenu = ref(false)
        const contextMenuLocation = ref({ x: 0, y: 0 })
        const contextMenuActivator = ref(null)
        const clickedPrice = ref(0)
        const clickedX = ref(0)
        const clickedY = ref(0)

        const orderQuantity = ref(1)
        const orderPrice = ref(0)
        const orderType = ref('LMT')
        const orderTypes = ['LMT', 'MKT', 'SL', 'SL-M']

        const orderMarkers = ref([])
        const isDragging = ref(false)
        const dragStartMarker = ref(null)
        const dragStartY = ref(0)

        const orderEntryStyle = computed(() => {
            return {
                position: 'absolute',
                left: `${clickedX.value}px`,
                top: `${clickedY.value}px`,
                minWidth: '250px',
                zIndex: 1000,
            }
        })

        /**
         * Convert chart Y coordinate to price
         */
        const yToPrice = (y, minPrice, maxPrice, chartHeight) => {
            const ratio = (chartHeight - y) / chartHeight
            return minPrice + (maxPrice - minPrice) * ratio
        }

        /**
         * Convert price to chart Y coordinate
         */
        const priceToY = (price, minPrice, maxPrice, chartHeight) => {
            const ratio = (price - minPrice) / (maxPrice - minPrice)
            return chartHeight - (ratio * chartHeight)
        }

        /**
         * Format price
         */
        const formatPrice = (price) => {
            if (!price && price !== 0) return '0.00'
            return Number(price).toFixed(2)
        }

        /**
         * Handle chart click
         */
        const handleChartClick = (e) => {
            if (showContextMenu.value) return
            if (isDragging.value) return

            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Calculate price from Y coordinate (simplified - would need actual chart price range)
            const price = yToPrice(y, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight)

            clickedPrice.value = price
            clickedX.value = x
            clickedY.value = y

            // Open quick order entry
            openOrderEntry('buy', price)
        }

        /**
         * Handle right-click
         */
        const handleRightClick = (e) => {
            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Calculate price from Y coordinate
            const price = yToPrice(y, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight)

            clickedPrice.value = price
            clickedX.value = x
            clickedY.value = y

            contextMenuLocation.value = { x: e.clientX, y: e.clientY }
            contextMenuActivator.value = e.currentTarget
            showContextMenu.value = true
        }

        /**
         * Handle double-click
         */
        const handleDoubleClick = (e) => {
            // Open full order window
            emit('open-order-window', {
                instrument: props.instrument,
                price: clickedPrice.value,
            })
        }

        /**
         * Handle mouse down (for dragging)
         */
        const handleMouseDown = (e) => {
            // Check if clicking on a marker
            if (e.target.closest('.chart-order-marker')) {
                return
            }

            // Start drag for bracket order
            isDragging.value = true
            dragStartY.value = e.clientY
        }

        /**
         * Handle mouse move (for dragging)
         */
        const handleMouseMove = (e) => {
            if (!isDragging.value) return

            // Update drag position
            const rect = e.currentTarget.getBoundingClientRect()
            const y = e.clientY - rect.top
            const price = yToPrice(y, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight)

            // Update temporary marker
            if (dragStartMarker.value) {
                dragStartMarker.value.price = price
                dragStartMarker.value.y = y
            }
        }

        /**
         * Handle mouse up (end drag)
         */
        const handleMouseUp = (e) => {
            if (!isDragging.value) return

            isDragging.value = false

            if (dragStartMarker.value) {
                // Finalize bracket order
                createBracketOrder()
            }
        }

        /**
         * Handle marker drag start
         */
        const handleMarkerDragStart = (data) => {
            const marker = orderMarkers.value.find((m) => m.id === data.id)
            if (marker) {
                dragStartMarker.value = marker
            }
        }

        /**
         * Handle marker click
         */
        const handleMarkerClick = (markerId) => {
            const marker = orderMarkers.value.find((m) => m.id === markerId)
            if (marker) {
                openOrderEntry(marker.side, marker.price)
            }
        }

        /**
         * Handle marker remove
         */
        const handleMarkerRemove = (markerId) => {
            const index = orderMarkers.value.findIndex((m) => m.id === markerId)
            if (index > -1) {
                orderMarkers.value.splice(index, 1)
            }
        }

        /**
         * Open order entry
         */
        const openOrderEntry = (side = 'buy', price = null) => {
            orderPrice.value = price || props.currentPrice
            orderQuantity.value = 1
            orderType.value = 'LMT'
            showOrderEntry.value = true
            showContextMenu.value = false
        }

        /**
         * Close order entry
         */
        const closeOrderEntry = () => {
            showOrderEntry.value = false
        }

        /**
         * Place order
         */
        const placeOrder = (side) => {
            if (!props.instrument) return

            const order = {
                instrument: props.instrument,
                side: side,
                quantity: orderQuantity.value,
                price: orderPrice.value,
                orderType: orderType.value,
            }

            emit('place-order', order)

            // Add order marker
            addOrderMarker({
                id: `order-${Date.now()}`,
                type: 'order',
                side: side,
                price: orderPrice.value,
                x: clickedX.value,
                y: priceToY(orderPrice.value, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            closeOrderEntry()
        }

        /**
         * Set stop loss
         */
        const setStopLoss = () => {
            if (!props.instrument) return

            const stopLossPrice = clickedPrice.value * 0.98 // 2% below clicked price

            emit('set-stop-loss', {
                instrument: props.instrument,
                price: stopLossPrice,
            })

            addOrderMarker({
                id: `stop-loss-${Date.now()}`,
                type: 'stop-loss',
                side: 'sell',
                price: stopLossPrice,
                x: clickedX.value,
                y: priceToY(stopLossPrice, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            showContextMenu.value = false
        }

        /**
         * Set take profit
         */
        const setTakeProfit = () => {
            if (!props.instrument) return

            const takeProfitPrice = clickedPrice.value * 1.02 // 2% above clicked price

            emit('set-take-profit', {
                instrument: props.instrument,
                price: takeProfitPrice,
            })

            addOrderMarker({
                id: `take-profit-${Date.now()}`,
                type: 'take-profit',
                side: 'sell',
                price: takeProfitPrice,
                x: clickedX.value,
                y: priceToY(takeProfitPrice, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            showContextMenu.value = false
        }

        /**
         * Create bracket order
         */
        const createBracketOrder = () => {
            if (!props.instrument) return

            const entryPrice = clickedPrice.value
            const stopLossPrice = entryPrice * 0.98
            const takeProfitPrice = entryPrice * 1.02

            emit('create-bracket-order', {
                instrument: props.instrument,
                entryPrice: entryPrice,
                stopLossPrice: stopLossPrice,
                takeProfitPrice: takeProfitPrice,
            })

            // Add markers
            addOrderMarker({
                id: `entry-${Date.now()}`,
                type: 'entry',
                side: 'buy',
                price: entryPrice,
                x: clickedX.value,
                y: priceToY(entryPrice, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            addOrderMarker({
                id: `stop-loss-${Date.now()}`,
                type: 'stop-loss',
                side: 'sell',
                price: stopLossPrice,
                x: clickedX.value,
                y: priceToY(stopLossPrice, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            addOrderMarker({
                id: `take-profit-${Date.now()}`,
                type: 'take-profit',
                side: 'sell',
                price: takeProfitPrice,
                x: clickedX.value,
                y: priceToY(takeProfitPrice, props.currentPrice * 0.9, props.currentPrice * 1.1, props.chartHeight),
            })

            showContextMenu.value = false
            isDragging.value = false
            dragStartMarker.value = null
        }

        /**
         * Add order marker
         */
        const addOrderMarker = (marker) => {
            orderMarkers.value.push({
                ...marker,
                visible: true,
            })
        }

        /**
         * Remove order marker
         */
        const removeOrderMarker = (markerId) => {
            const index = orderMarkers.value.findIndex((m) => m.id === markerId)
            if (index > -1) {
                orderMarkers.value.splice(index, 1)
            }
        }

        return {
            showOrderEntry,
            showContextMenu,
            contextMenuLocation,
            contextMenuActivator,
            clickedPrice,
            clickedX,
            clickedY,
            orderQuantity,
            orderPrice,
            orderType,
            orderTypes,
            orderMarkers,
            isDragging,
            orderEntryStyle,
            formatPrice,
            handleChartClick,
            handleRightClick,
            handleDoubleClick,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
            handleMarkerDragStart,
            handleMarkerClick,
            handleMarkerRemove,
            openOrderEntry,
            closeOrderEntry,
            placeOrder,
            setStopLoss,
            setTakeProfit,
            createBracketOrder,
            removeOrderMarker,
        }
    },
}
</script>

<style scoped>
.chart-trading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    pointer-events: all;
    cursor: crosshair;
}

.quick-order-overlay {
    position: absolute;
    z-index: 1000;
    background-color: var(--v-background-base);
    border: 1px solid rgba(255, 255, 255, 0.12);
}
</style>

