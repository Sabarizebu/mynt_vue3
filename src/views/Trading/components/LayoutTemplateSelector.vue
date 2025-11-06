<template>
    <div class="template-selector">
        <div class="template-grid">
            <v-card
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                elevation="2"
                @click="selectTemplate(template)"
            >
                <v-card-title class="template-title">
                    <v-icon :icon="getTemplateIcon(template.category)" class="mr-2"></v-icon>
                    {{ template.name }}
                </v-card-title>
                <v-card-subtitle class="template-description">
                    {{ template.description }}
                </v-card-subtitle>
                <v-card-text class="template-preview">
                    <div class="preview-grid" :style="getPreviewStyle(template)">
                        <div
                            v-for="(widget, index) in template.widgets.slice(0, 6)"
                            :key="index"
                            class="preview-widget"
                            :style="getWidgetPreviewStyle(widget, template)"
                        >
                            <v-icon :icon="getWidgetIcon(widget.type)" size="small"></v-icon>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        variant="flat"
                        size="small"
                        @click.stop="selectTemplate(template)"
                    >
                        Apply
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
    name: 'LayoutTemplateSelector',
    emits: ['select-template'],
    setup(props, { emit }) {
        const templates = ref([])

        const loadTemplates = async () => {
            try {
                // Load preset templates using fetch
                const templateFiles = [
                    'stock-trading.json',
                    'day-trading.json',
                    'market-monitoring.json',
                    'options-trading.json',
                    'swing-trading.json',
                ]

                const loadedTemplates = []
                for (const file of templateFiles) {
                    try {
                        const response = await fetch(`/src/views/Trading/layouts/presets/${file}`)
                        if (response.ok) {
                            const json = await response.json()
                            loadedTemplates.push(json)
                        } else {
                            // Fallback: try with different path
                            const fallbackResponse = await fetch(`./layouts/presets/${file}`)
                            if (fallbackResponse.ok) {
                                const json = await fallbackResponse.json()
                                loadedTemplates.push(json)
                            }
                        }
                    } catch (error) {
                        console.error(`Error loading template ${file}:`, error)
                    }
                }

                // If no templates loaded, use hardcoded templates
                if (loadedTemplates.length === 0) {
                    templates.value = getDefaultTemplates()
                } else {
                    templates.value = loadedTemplates
                }
            } catch (error) {
                console.error('Error loading templates:', error)
                templates.value = getDefaultTemplates()
            }
        }

        const getDefaultTemplates = () => {
            // Return default templates if fetch fails
            return [
                {
                    id: 'preset-stock-trading',
                    name: 'Stock Trading',
                    description: 'Optimized layout for stock trading',
                    category: 'trading',
                    widgets: [
                        { id: 'chart-1', type: 'chart', title: 'Chart', icon: 'mdi-chart-line', x: 0, y: 0, width: 960, height: 600, zIndex: 1 },
                        { id: 'orderbook-1', type: 'orderbook', title: 'Order Book', icon: 'mdi-book-open-variant', x: 960, y: 0, width: 320, height: 300, zIndex: 2 },
                        { id: 'orderwindow-1', type: 'orderwindow', title: 'Order Window', icon: 'mdi-cart', x: 960, y: 300, width: 320, height: 300, zIndex: 3 },
                    ],
                },
                {
                    id: 'preset-day-trading',
                    name: 'Day Trading',
                    description: 'Fast-paced layout for day trading',
                    category: 'trading',
                    widgets: [
                        { id: 'chart-1', type: 'chart', title: 'Chart', icon: 'mdi-chart-line', x: 0, y: 0, width: 896, height: 600, zIndex: 1 },
                        { id: 'orderbook-1', type: 'orderbook', title: 'Level 2 Order Book', icon: 'mdi-book-open-variant', x: 896, y: 0, width: 384, height: 600, zIndex: 2 },
                    ],
                },
                {
                    id: 'preset-market-monitoring',
                    name: 'Market Monitoring',
                    description: 'Monitor multiple instruments',
                    category: 'monitoring',
                    widgets: [
                        { id: 'chart-1', type: 'chart', title: 'Chart 1', icon: 'mdi-chart-line', x: 0, y: 0, width: 640, height: 450, zIndex: 1 },
                        { id: 'chart-2', type: 'chart', title: 'Chart 2', icon: 'mdi-chart-line', x: 640, y: 0, width: 640, height: 450, zIndex: 2 },
                        { id: 'chart-3', type: 'chart', title: 'Chart 3', icon: 'mdi-chart-line', x: 0, y: 450, width: 640, height: 450, zIndex: 3 },
                        { id: 'chart-4', type: 'chart', title: 'Chart 4', icon: 'mdi-chart-line', x: 640, y: 450, width: 640, height: 450, zIndex: 4 },
                    ],
                },
                {
                    id: 'preset-options-trading',
                    name: 'Options Trading',
                    description: 'Optimized layout for options trading',
                    category: 'options',
                    widgets: [
                        { id: 'orderbook-1', type: 'orderbook', title: 'Options Chain', icon: 'mdi-view-grid', x: 0, y: 0, width: 400, height: 600, zIndex: 1 },
                        { id: 'chart-1', type: 'chart', title: 'Price Chart', icon: 'mdi-chart-line', x: 400, y: 0, width: 800, height: 400, zIndex: 2 },
                        { id: 'orderwindow-1', type: 'orderwindow', title: 'Order Window', icon: 'mdi-window-open', x: 400, y: 400, width: 400, height: 200, zIndex: 3 },
                        { id: 'calculator-1', type: 'calculator', title: 'Greeks Calculator', icon: 'mdi-calculator', x: 800, y: 400, width: 400, height: 200, zIndex: 4 },
                        { id: 'positions-1', type: 'positions', title: 'Positions', icon: 'mdi-chart-line', x: 0, y: 600, width: 1200, height: 400, zIndex: 5 },
                    ],
                },
                {
                    id: 'preset-swing-trading',
                    name: 'Swing Trading',
                    description: 'Layout for swing trading with multiple timeframes',
                    category: 'trading',
                    widgets: [
                        { id: 'chart-1', type: 'chart', title: 'Daily Chart', icon: 'mdi-chart-line', x: 0, y: 0, width: 600, height: 400, zIndex: 1, timeframe: '1D' },
                        { id: 'chart-2', type: 'chart', title: '4H Chart', icon: 'mdi-chart-line', x: 600, y: 0, width: 600, height: 400, zIndex: 2, timeframe: '240' },
                        { id: 'marketwatch-1', type: 'marketwatch', title: 'Watchlist', icon: 'mdi-view-dashboard', x: 0, y: 400, width: 400, height: 400, zIndex: 3 },
                        { id: 'positions-1', type: 'positions', title: 'Positions', icon: 'mdi-chart-line', x: 400, y: 400, width: 400, height: 400, zIndex: 4 },
                        { id: 'orderwindow-1', type: 'orderwindow', title: 'Order Window', icon: 'mdi-window-open', x: 800, y: 400, width: 400, height: 400, zIndex: 5 },
                    ],
                },
            ]
        }

        const selectTemplate = (template) => {
            emit('select-template', template)
        }

        const getTemplateIcon = (category) => {
            const icons = {
                trading: 'mdi-chart-line',
                monitoring: 'mdi-view-dashboard',
                options: 'mdi-chart-timeline-variant',
            }
            return icons[category] || 'mdi-view-dashboard'
        }

        const getWidgetIcon = (type) => {
            const icons = {
                chart: 'mdi-chart-line',
                orderbook: 'mdi-book-open-variant',
                tradebook: 'mdi-swap-horizontal',
                positions: 'mdi-chart-line',
                marketwatch: 'mdi-view-dashboard',
                orderwindow: 'mdi-cart',
                calculator: 'mdi-calculator',
                ipos: 'mdi-trending-up',
                notes: 'mdi-note-text',
                pomodoro: 'mdi-timer',
            }
            return icons[type] || 'mdi-widgets'
        }

        const getPreviewStyle = (template) => {
            // Calculate preview container size based on widgets
            const maxX = Math.max(...template.widgets.map(w => w.x + w.width))
            const maxY = Math.max(...template.widgets.map(w => w.y + w.height))
            const scale = Math.min(200 / maxX, 150 / maxY, 1)
            
            return {
                width: `${maxX * scale}px`,
                height: `${maxY * scale}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
            }
        }

        const getWidgetPreviewStyle = (widget, template) => {
            const maxX = Math.max(...template.widgets.map(w => w.x + w.width))
            const maxY = Math.max(...template.widgets.map(w => w.y + w.height))
            const scale = Math.min(200 / maxX, 150 / maxY, 1)
            
            return {
                position: 'absolute',
                left: `${widget.x * scale}px`,
                top: `${widget.y * scale}px`,
                width: `${widget.width * scale}px`,
                height: `${widget.height * scale}px`,
            }
        }

        onMounted(() => {
            loadTemplates()
        })

        return {
            templates,
            selectTemplate,
            getTemplateIcon,
            getWidgetIcon,
            getPreviewStyle,
            getWidgetPreviewStyle,
        }
    },
}
</script>

<style scoped>
.template-selector {
    padding: 8px 0;
}

.template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

.template-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.template-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.template-title {
    font-size: 16px;
    font-weight: 600;
    padding-bottom: 4px;
}

.template-description {
    font-size: 12px;
    opacity: 0.7;
    padding-bottom: 8px;
}

.template-preview {
    min-height: 150px;
    position: relative;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-grid {
    position: relative;
    width: 100%;
    height: 100%;
}

.preview-widget {
    position: absolute;
    background-color: rgba(var(--v-theme-primary), 0.2);
    border: 1px solid rgba(var(--v-theme-primary), 0.4);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}
</style>

