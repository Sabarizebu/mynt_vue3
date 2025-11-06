<template>
    <v-card
        class="trading-widget"
        :class="{ 'widget-minimized': isMinimized, 'widget-maximized': isMaximized }"
        :style="widgetStyle"
        elevation="2"
        @mousedown="handleMouseDown"
    >
        <!-- Widget Header -->
        <v-card-title class="widget-header" @mousedown.stop="startDrag">
            <div class="widget-title">
                <v-icon :icon="icon" size="small" class="mr-2"></v-icon>
                <span>{{ title }}</span>
            </div>
            <v-spacer></v-spacer>
            <div class="widget-actions">
                <LinkIndicator
                    :widget-id="widgetId"
                    :is-active="isFocused"
                    class="mr-1"
                />
                <WidgetLinkManager
                    :widget-id="widgetId"
                    :available-widgets="availableWidgets"
                    @link-created="handleLinkCreated"
                    @link-broken="handleLinkBroken"
                />
                <v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="toggleMinimize"
                ></v-btn>
                <v-btn
                    :icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'"
                    size="x-small"
                    variant="text"
                    @click.stop="toggleMaximize"
                ></v-btn>
                <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click.stop="close"
                ></v-btn>
            </div>
        </v-card-title>

        <!-- Widget Tabs -->
        <WidgetTabs
            v-if="enableTabs && tabs.length > 0"
            :tabs="tabs"
            :active-tab-id="activeTabId"
            :can-add-tab="canAddTab"
            :max-tabs="maxTabs"
            @tab-selected="handleTabSelected"
            @tab-closed="handleTabClosed"
            @tab-added="handleTabAdded"
            @tab-reordered="handleTabReordered"
        />

        <!-- Widget Content -->
        <v-card-text v-if="!isMinimized" class="widget-content" :style="contentStyle">
            <div v-if="enableTabs && tabs.length > 0" class="tab-content">
                <slot :name="`tab-${activeTabId}`">
                    <slot></slot>
                </slot>
            </div>
            <slot v-else></slot>
        </v-card-text>

        <!-- Resize Handle -->
        <div
            v-if="!isMinimized && !isMaximized"
            class="widget-resize-handle"
            @mousedown.stop="startResize"
        ></div>
    </v-card>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import LinkIndicator from './LinkIndicator.vue'
import WidgetLinkManager from './WidgetLinkManager.vue'
import WidgetTabs from './WidgetTabs.vue'
import { subscribeToWidget, unsubscribeFromWidget, emitWidgetEvent } from '@/utils/widgetEventBus'

export default {
    name: 'TradingWidget',
    components: {
        LinkIndicator,
        WidgetLinkManager,
        WidgetTabs,
    },
    props: {
        widgetId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: 'mdi-widgets',
        },
        defaultX: {
            type: Number,
            default: 0,
        },
        defaultY: {
            type: Number,
            default: 0,
        },
        defaultWidth: {
            type: Number,
            default: 400,
        },
        defaultHeight: {
            type: Number,
            default: 300,
        },
        minWidth: {
            type: Number,
            default: 200,
        },
        minHeight: {
            type: Number,
            default: 150,
        },
        zIndex: {
            type: Number,
            default: 1,
        },
        snapToGrid: {
            type: Boolean,
            default: true,
        },
        gridSize: {
            type: Number,
            default: 16,
        },
        availableWidgets: {
            type: Array,
            default: () => [],
        },
        enableTabs: {
            type: Boolean,
            default: false,
        },
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTabId: {
            type: String,
            default: null,
        },
        canAddTab: {
            type: Boolean,
            default: true,
        },
        maxTabs: {
            type: Number,
            default: 10,
        },
    },
    emits: ['close', 'update:position', 'update:size', 'focus', 'link-created', 'link-broken', 'tab-selected', 'tab-closed', 'tab-added', 'tab-reordered'],
    setup(props, { emit }) {
        const isMinimized = ref(false)
        const isMaximized = ref(false)
        const isDragging = ref(false)
        const isResizing = ref(false)

        const x = ref(props.defaultX)
        const y = ref(props.defaultY)
        const width = ref(props.defaultWidth)
        const height = ref(props.defaultHeight)

        const dragStartX = ref(0)
        const dragStartY = ref(0)
        const resizeStartX = ref(0)
        const resizeStartY = ref(0)
        const resizeStartWidth = ref(0)
        const resizeStartHeight = ref(0)

        const widgetStyle = computed(() => {
            if (isMaximized.value) {
                return {
                    position: 'fixed',
                    top: '56px',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    width: '100%',
                    height: 'calc(100vh - 56px)',
                    zIndex: 1000 + props.zIndex,
                }
            }
            return {
                position: 'absolute',
                top: `${y.value}px`,
                left: `${x.value}px`,
                width: `${width.value}px`,
                height: isMinimized.value ? 'auto' : `${height.value}px`,
                zIndex: props.zIndex + (isDragging.value ? 1000 : 0),
            }
        })

        const contentStyle = computed(() => {
            if (isMinimized.value) {
                return { display: 'none' }
            }
            return {
                height: isMaximized.value ? 'calc(100% - 48px)' : `${height.value - 48}px`,
                overflow: 'auto',
            }
        })

        const startDrag = (e) => {
            if (isMaximized.value) return
            isDragging.value = true
            dragStartX.value = e.clientX - x.value
            dragStartY.value = e.clientY - y.value
            document.addEventListener('mousemove', onDrag)
            document.addEventListener('mouseup', stopDrag)
        }

        const snapToGridValue = (value, gridSize) => {
            if (!props.snapToGrid) return value
            return Math.round(value / gridSize) * gridSize
        }

        const onDrag = (e) => {
            if (!isDragging.value) return
            let newX = e.clientX - dragStartX.value
            let newY = e.clientY - dragStartY.value

            // Snap to grid if enabled
            if (props.snapToGrid) {
                newX = snapToGridValue(newX, props.gridSize)
                newY = snapToGridValue(newY, props.gridSize)
            }

            // Constrain to viewport
            const maxX = window.innerWidth - width.value
            const maxY = window.innerHeight - 48 // Account for header

            x.value = Math.max(0, Math.min(newX, maxX))
            y.value = Math.max(56, Math.min(newY, maxY)) // Account for toolbar

            emit('update:position', { x: x.value, y: y.value })
        }

        const stopDrag = () => {
            isDragging.value = false
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', stopDrag)
            savePosition()
        }

        const startResize = (e) => {
            if (isMaximized.value) return
            isResizing.value = true
            resizeStartX.value = e.clientX
            resizeStartY.value = e.clientY
            resizeStartWidth.value = width.value
            resizeStartHeight.value = height.value
            document.addEventListener('mousemove', onResize)
            document.addEventListener('mouseup', stopResize)
        }

        const onResize = (e) => {
            if (!isResizing.value) return
            let deltaX = e.clientX - resizeStartX.value
            let deltaY = e.clientY - resizeStartY.value

            // Snap to grid if enabled
            if (props.snapToGrid) {
                deltaX = snapToGridValue(deltaX, props.gridSize)
                deltaY = snapToGridValue(deltaY, props.gridSize)
            }

            width.value = Math.max(props.minWidth, snapToGridValue(resizeStartWidth.value + deltaX, props.gridSize))
            height.value = Math.max(props.minHeight, snapToGridValue(resizeStartHeight.value + deltaY, props.gridSize))

            emit('update:size', { width: width.value, height: height.value })
        }

        const stopResize = () => {
            isResizing.value = false
            document.removeEventListener('mousemove', onResize)
            document.removeEventListener('mouseup', stopResize)
            saveSize()
        }

        const toggleMinimize = () => {
            isMinimized.value = !isMinimized.value
            if (isMaximized.value) isMaximized.value = false
        }

        const toggleMaximize = () => {
            isMaximized.value = !isMaximized.value
            if (isMinimized.value) isMinimized.value = false
        }

        const close = () => {
            emit('close', props.widgetId)
        }

        const handleMouseDown = () => {
            // Bring widget to front
            emit('focus', props.widgetId)
        }

        const isFocused = ref(false)

        const handleLinkCreated = (data) => {
            emit('link-created', data)
        }

        const handleLinkBroken = (widgetId) => {
            emit('link-broken', widgetId)
        }

        // Subscribe to widget events for synchronization
        const handleInstrumentChange = (data, sourceWidgetId) => {
            // Handle instrument change from linked widget
            emit('instrument-changed', data)
        }

        const handleTimeframeChange = (data, sourceWidgetId) => {
            // Handle timeframe change from linked widget
            emit('timeframe-changed', data)
        }

        const handleChartTypeChange = (data, sourceWidgetId) => {
            // Handle chart type change from linked widget
            emit('chart-type-changed', data)
        }

        const handleIndicatorsChange = (data, sourceWidgetId) => {
            // Handle indicators change from linked widget
            emit('indicators-changed', data)
        }

        /**
         * Tab event handlers
         */
        const handleTabSelected = (tabId) => {
            emit('tab-selected', { widgetId: props.widgetId, tabId })
        }

        const handleTabClosed = (tabId) => {
            emit('tab-closed', { widgetId: props.widgetId, tabId })
        }

        const handleTabAdded = () => {
            emit('tab-added', { widgetId: props.widgetId })
        }

        const handleTabReordered = (data) => {
            emit('tab-reordered', { widgetId: props.widgetId, ...data })
        }

        onMounted(() => {
            // Subscribe to widget events
            subscribeToWidget(props.widgetId, 'instrument-change', handleInstrumentChange)
            subscribeToWidget(props.widgetId, 'timeframe-change', handleTimeframeChange)
            subscribeToWidget(props.widgetId, 'chart-type-change', handleChartTypeChange)
            subscribeToWidget(props.widgetId, 'indicators-change', handleIndicatorsChange)
        })

        onBeforeUnmount(() => {
            // Unsubscribe from widget events
            unsubscribeFromWidget(props.widgetId, 'instrument-change', handleInstrumentChange)
            unsubscribeFromWidget(props.widgetId, 'timeframe-change', handleTimeframeChange)
            unsubscribeFromWidget(props.widgetId, 'chart-type-change', handleChartTypeChange)
            unsubscribeFromWidget(props.widgetId, 'indicators-change', handleIndicatorsChange)
        })

        const savePosition = () => {
            try {
                const positions = JSON.parse(localStorage.getItem('trading_widget_positions') || '{}')
                positions[props.widgetId] = { x: x.value, y: y.value }
                localStorage.setItem('trading_widget_positions', JSON.stringify(positions))
            } catch (err) {
                console.error('Error saving widget position:', err)
            }
        }

        const saveSize = () => {
            try {
                const sizes = JSON.parse(localStorage.getItem('trading_widget_sizes') || '{}')
                sizes[props.widgetId] = { width: width.value, height: height.value }
                localStorage.setItem('trading_widget_sizes', JSON.stringify(sizes))
            } catch (err) {
                console.error('Error saving widget size:', err)
            }
        }

        const loadPosition = () => {
            try {
                const positions = JSON.parse(localStorage.getItem('trading_widget_positions') || '{}')
                if (positions[props.widgetId]) {
                    x.value = positions[props.widgetId].x
                    y.value = positions[props.widgetId].y
                }
            } catch (err) {
                console.error('Error loading widget position:', err)
            }
        }

        const loadSize = () => {
            try {
                const sizes = JSON.parse(localStorage.getItem('trading_widget_sizes') || '{}')
                if (sizes[props.widgetId]) {
                    width.value = sizes[props.widgetId].width
                    height.value = sizes[props.widgetId].height
                }
            } catch (err) {
                console.error('Error loading widget size:', err)
            }
        }

        onMounted(() => {
            loadPosition()
            loadSize()
        })

        onBeforeUnmount(() => {
            document.removeEventListener('mousemove', onDrag)
            document.removeEventListener('mouseup', stopDrag)
            document.removeEventListener('mousemove', onResize)
            document.removeEventListener('mouseup', stopResize)
        })

        return {
            isMinimized,
            isMaximized,
            isDragging,
            isResizing,
            widgetStyle,
            contentStyle,
            startDrag,
            startResize,
            toggleMinimize,
            toggleMaximize,
            close,
            handleMouseDown,
            isFocused,
            handleLinkCreated,
            handleLinkBroken,
            handleTabSelected,
            handleTabClosed,
            handleTabAdded,
            handleTabReordered,
        }
    },
}
</script>

<style scoped>
.trading-widget {
    user-select: none;
    transition: none;
}

.trading-widget.widget-dragging {
    transition: none;
}

.widget-header {
    cursor: move;
    padding: 8px 12px;
    background-color: rgba(var(--v-theme-cardbg), 1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    min-height: 48px;
}

.widget-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
}

.widget-actions {
    display: flex;
    gap: 4px;
}

.widget-content {
    padding: 8px;
    overflow: auto;
}

.widget-resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    background: linear-gradient(
        -45deg,
        transparent 0%,
        transparent 30%,
        rgba(255, 255, 255, 0.3) 30%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 50%,
        transparent 100%
    );
}

.widget-resize-handle:hover {
    background: linear-gradient(
        -45deg,
        transparent 0%,
        transparent 30%,
        rgba(255, 255, 255, 0.5) 30%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 50%,
        transparent 100%
    );
}

.widget-minimized .widget-content {
    display: none;
}
</style>

