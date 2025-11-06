<template>
    <v-dialog v-model="dialog" max-width="900px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Widget Library</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <!-- Search -->
                <v-text-field
                    v-model="searchQuery"
                    label="Search widgets"
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-4"
                ></v-text-field>

                <!-- Category Filter -->
                <v-chip-group
                    v-model="selectedCategory"
                    mandatory
                    class="mb-4"
                >
                    <v-chip
                        v-for="category in categories"
                        :key="category.value"
                        :value="category.value"
                        size="small"
                    >
                        {{ category.label }}
                    </v-chip>
                </v-chip-group>

                <!-- Widget Grid -->
                <v-row dense>
                    <v-col
                        v-for="widget in filteredWidgets"
                        :key="widget.type"
                        cols="12"
                        sm="6"
                        md="4"
                    >
                        <v-card
                            class="widget-card"
                            :class="{ 'widget-selected': selectedWidget === widget.type }"
                            @click="selectWidget(widget.type)"
                            @mouseenter="hoveredWidget = widget.type"
                            @mouseleave="hoveredWidget = null"
                        >
                            <v-card-title class="d-flex align-center">
                                <v-icon :icon="widget.icon" class="mr-2"></v-icon>
                                <span class="text-subtitle-2">{{ widget.title }}</span>
                            </v-card-title>
                            <v-card-text>
                                <div class="widget-preview">
                                    <v-icon :icon="widget.icon" size="48" :color="widget.color"></v-icon>
                                </div>
                                <p class="text-caption mt-2">{{ widget.description }}</p>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    size="small"
                                    variant="flat"
                                    color="primary"
                                    @click.stop="addWidget(widget.type)"
                                >
                                    Add Widget
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Empty State -->
                <v-alert
                    v-if="filteredWidgets.length === 0"
                    type="info"
                    density="compact"
                    variant="tonal"
                    class="mt-4"
                >
                    No widgets found matching your search.
                </v-alert>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, computed } from 'vue'

export default {
    name: 'WidgetLibrary',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'widget-selected'],
    setup(props, { emit }) {
        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const searchQuery = ref('')
        const selectedCategory = ref('all')
        const selectedWidget = ref(null)
        const hoveredWidget = ref(null)

        const categories = [
            { label: 'All', value: 'all' },
            { label: 'Charts', value: 'charts' },
            { label: 'Trading', value: 'trading' },
            { label: 'Market Data', value: 'market' },
            { label: 'Tools', value: 'tools' },
        ]

        const widgets = [
            {
                type: 'chart',
                title: 'Chart',
                icon: 'mdi-chart-line',
                description: 'Interactive price chart with technical indicators',
                category: 'charts',
                color: 'primary',
            },
            {
                type: 'orderbook',
                title: 'Order Book',
                icon: 'mdi-book-open-variant',
                description: 'Real-time order book depth',
                category: 'trading',
                color: 'info',
            },
            {
                type: 'tradebook',
                title: 'Trade Book',
                icon: 'mdi-swap-horizontal',
                description: 'Recent trades and transaction history',
                category: 'trading',
                color: 'success',
            },
            {
                type: 'positions',
                title: 'Positions',
                icon: 'mdi-chart-line',
                description: 'Open positions and P&L',
                category: 'trading',
                color: 'warning',
            },
            {
                type: 'marketwatch',
                title: 'Marketwatch',
                icon: 'mdi-view-dashboard',
                description: 'Watchlist, positions, and holdings',
                category: 'market',
                color: 'primary',
            },
            {
                type: 'orderwindow',
                title: 'Order Window',
                icon: 'mdi-window-open',
                description: 'Place and manage orders',
                category: 'trading',
                color: 'error',
            },
            {
                type: 'calculator',
                title: 'Calculator',
                icon: 'mdi-calculator',
                description: 'Trading calculator for P&L and margin',
                category: 'tools',
                color: 'secondary',
            },
            {
                type: 'ipos',
                title: 'IPOs',
                icon: 'mdi-trending-up',
                description: 'Upcoming and past IPOs',
                category: 'market',
                color: 'info',
            },
            {
                type: 'notes',
                title: 'Notes',
                icon: 'mdi-note-text',
                description: 'Trading notes and reminders',
                category: 'tools',
                color: 'grey',
            },
            {
                type: 'pomodoro',
                title: 'Pomodoro Timer',
                icon: 'mdi-timer',
                description: 'Focus timer for trading sessions',
                category: 'tools',
                color: 'purple',
            },
        ]

        const filteredWidgets = computed(() => {
            let filtered = widgets

            // Filter by category
            if (selectedCategory.value !== 'all') {
                filtered = filtered.filter((w) => w.category === selectedCategory.value)
            }

            // Filter by search query
            if (searchQuery.value) {
                const query = searchQuery.value.toLowerCase()
                filtered = filtered.filter(
                    (w) =>
                        w.title.toLowerCase().includes(query) ||
                        w.description.toLowerCase().includes(query) ||
                        w.type.toLowerCase().includes(query)
                )
            }

            return filtered
        })

        const selectWidget = (widgetType) => {
            selectedWidget.value = widgetType
        }

        const addWidget = (widgetType) => {
            emit('widget-selected', widgetType)
            close()
        }

        const close = () => {
            dialog.value = false
            searchQuery.value = ''
            selectedCategory.value = 'all'
            selectedWidget.value = null
        }

        return {
            dialog,
            searchQuery,
            selectedCategory,
            selectedWidget,
            hoveredWidget,
            categories,
            widgets,
            filteredWidgets,
            selectWidget,
            addWidget,
            close,
        }
    },
}
</script>

<style scoped>
.widget-card {
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.widget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-color: rgba(var(--v-theme-primary), 0.5);
}

.widget-card.widget-selected {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.1);
}

.widget-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
</style>

