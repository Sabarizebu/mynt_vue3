<template>
    <div
        v-if="visible"
        class="chart-order-marker"
        :class="markerClass"
        :style="markerStyle"
        @mousedown.stop="handleMouseDown"
    >
        <div class="marker-line"></div>
        <div class="marker-label">
            <v-icon :icon="icon" size="small" class="mr-1"></v-icon>
            <span class="marker-text">{{ label }}</span>
            <span class="marker-price">₹{{ formatPrice(price) }}</span>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'

export default {
    name: 'ChartOrderMarker',
    props: {
        id: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            default: 'order', // 'order', 'stop-loss', 'take-profit', 'entry'
            validator: (value) => ['order', 'stop-loss', 'take-profit', 'entry'].includes(value),
        },
        side: {
            type: String,
            default: 'buy', // 'buy', 'sell'
            validator: (value) => ['buy', 'sell'].includes(value),
        },
        visible: {
            type: Boolean,
            default: true,
        },
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
    },
    emits: ['drag-start', 'click', 'remove'],
    setup(props, { emit }) {
        const markerClass = computed(() => {
            return {
                'marker-buy': props.side === 'buy',
                'marker-sell': props.side === 'sell',
                [`marker-${props.type}`]: true,
            }
        })

        const markerStyle = computed(() => {
            return {
                left: `${props.x}px`,
                top: `${props.y}px`,
            }
        })

        const icon = computed(() => {
            const icons = {
                order: props.side === 'buy' ? 'mdi-arrow-up' : 'mdi-arrow-down',
                'stop-loss': 'mdi-stop-circle',
                'take-profit': 'mdi-check-circle',
                entry: 'mdi-play-circle',
            }
            return icons[props.type] || 'mdi-circle'
        })

        const label = computed(() => {
            const labels = {
                order: props.side === 'buy' ? 'Buy' : 'Sell',
                'stop-loss': 'Stop Loss',
                'take-profit': 'Take Profit',
                entry: 'Entry',
            }
            return labels[props.type] || 'Order'
        })

        const formatPrice = (price) => {
            if (!price && price !== 0) return '0.00'
            return Number(price).toFixed(2)
        }

        const handleMouseDown = (e) => {
            emit('drag-start', { id: props.id, event: e })
        }

        return {
            markerClass,
            markerStyle,
            icon,
            label,
            formatPrice,
            handleMouseDown,
        }
    },
}
</script>

<style scoped>
.chart-order-marker {
    position: absolute;
    z-index: 10;
    cursor: move;
    pointer-events: all;
}

.marker-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: -100px;
    width: 2px;
    transform: translateX(-50%);
    background-color: currentColor;
    opacity: 0.5;
}

.marker-label {
    position: absolute;
    left: 50%;
    top: -20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    background-color: var(--v-background-base);
    border: 1px solid currentColor;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.marker-text {
    font-size: 11px;
}

.marker-price {
    font-size: 11px;
    font-weight: 700;
}

.marker-buy {
    color: #26a69a;
}

.marker-sell {
    color: #ef5350;
}

.marker-stop-loss {
    color: #ff9800;
}

.marker-take-profit {
    color: #4caf50;
}

.marker-entry {
    color: #2196f3;
}
</style>

