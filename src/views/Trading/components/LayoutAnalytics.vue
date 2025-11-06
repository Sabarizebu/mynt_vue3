<template>
    <v-dialog v-model="dialog" max-width="900px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Layout Analytics</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <v-tabs v-model="activeTab" density="compact">
                    <v-tab value="usage">Usage Statistics</v-tab>
                    <v-tab value="performance">Performance</v-tab>
                    <v-tab value="recommendations">Recommendations</v-tab>
                    <v-tab value="preferences">Preferences</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" class="mt-4">
                    <!-- Usage Statistics Tab -->
                    <v-window-item value="usage">
                        <div class="usage-section">
                            <h3 class="text-h6 mb-4">Most Used Layouts</h3>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="(layout, index) in mostUsedLayouts"
                                    :key="layout.id"
                                >
                                    <template v-slot:prepend>
                                        <v-avatar color="primary" size="40">
                                            <span class="text-h6">{{ index + 1 }}</span>
                                        </v-avatar>
                                    </template>
                                    <v-list-item-title>Layout {{ layout.id }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        Used {{ layout.count }} times
                                    </v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-chip size="small" color="info">
                                            {{ formatDate(layout.lastUsed) }}
                                        </v-chip>
                                    </template>
                                </v-list-item>
                            </v-list>

                            <h3 class="text-h6 mt-6 mb-4">Most Used Widgets</h3>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="(widget, index) in mostUsedWidgets"
                                    :key="widget.type"
                                >
                                    <template v-slot:prepend>
                                        <v-avatar color="secondary" size="40">
                                            <span class="text-h6">{{ index + 1 }}</span>
                                        </v-avatar>
                                    </template>
                                    <v-list-item-title>{{ widget.type }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        Used {{ widget.count }} times
                                    </v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-chip size="small" color="success">
                                            Avg: {{ widget.avgDuration?.toFixed(0) || 0 }}ms
                                        </v-chip>
                                    </template>
                                </v-list-item>
                            </v-list>

                            <v-card variant="outlined" class="mt-4">
                                <v-card-title class="text-subtitle-1">Session Statistics</v-card-title>
                                <v-card-text>
                                    <div class="d-flex justify-space-between mb-2">
                                        <span>Layouts Switched:</span>
                                        <strong>{{ sessionData.layoutsSwitched }}</strong>
                                    </div>
                                    <div class="d-flex justify-space-between mb-2">
                                        <span>Widgets Added:</span>
                                        <strong>{{ sessionData.widgetsAdded }}</strong>
                                    </div>
                                    <div class="d-flex justify-space-between">
                                        <span>Widgets Removed:</span>
                                        <strong>{{ sessionData.widgetsRemoved }}</strong>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-window-item>

                    <!-- Performance Tab -->
                    <v-window-item value="performance">
                        <div class="performance-section">
                            <v-card variant="outlined" class="mb-4">
                                <v-card-title class="text-subtitle-1">Average Load Times</v-card-title>
                                <v-card-text>
                                    <div class="d-flex justify-space-between mb-2">
                                        <span>Layout Load Time:</span>
                                        <strong>{{ averageLayoutLoadTime.toFixed(2) }}ms</strong>
                                    </div>
                                    <div class="d-flex justify-space-between">
                                        <span>Widget Render Time:</span>
                                        <strong>{{ averageWidgetRenderTime.toFixed(2) }}ms</strong>
                                    </div>
                                </v-card-text>
                            </v-card>

                            <v-card variant="outlined">
                                <v-card-title class="text-subtitle-1">Performance Metrics</v-card-title>
                                <v-card-text>
                                    <div class="metric-item">
                                        <span class="metric-label">Total Layout Loads:</span>
                                        <span class="metric-value">{{ performanceMetrics.layoutLoadTime.length }}</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-label">Total Widget Renders:</span>
                                        <span class="metric-value">{{ performanceMetrics.widgetRenderTime.length }}</span>
                                    </div>
                                    <div class="metric-item">
                                        <span class="metric-label">Subscription Latency Measurements:</span>
                                        <span class="metric-value">{{ performanceMetrics.subscriptionLatency.length }}</span>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </div>
                    </v-window-item>

                    <!-- Recommendations Tab -->
                    <v-window-item value="recommendations">
                        <div class="recommendations-section">
                            <h3 class="text-h6 mb-4">Layout Recommendations</h3>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="(rec, index) in layoutRecommendations"
                                    :key="index"
                                >
                                    <template v-slot:prepend>
                                        <v-icon icon="mdi-lightbulb" color="warning"></v-icon>
                                    </template>
                                    <v-list-item-title>{{ rec.layoutId }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ rec.reason }}</v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-btn
                                            size="small"
                                            variant="outlined"
                                            @click="applyRecommendation(rec)"
                                        >
                                            Apply
                                        </v-btn>
                                    </template>
                                </v-list-item>
                            </v-list>

                            <h3 class="text-h6 mt-6 mb-4">Widget Recommendations</h3>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="(rec, index) in widgetRecommendations"
                                    :key="index"
                                >
                                    <template v-slot:prepend>
                                        <v-icon icon="mdi-widgets" color="primary"></v-icon>
                                    </template>
                                    <v-list-item-title>{{ rec.type }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ rec.reason }}</v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-btn
                                            size="small"
                                            variant="outlined"
                                            @click="addRecommendedWidget(rec.type)"
                                        >
                                            Add
                                        </v-btn>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-window-item>

                    <!-- Preferences Tab -->
                    <v-window-item value="preferences">
                        <div class="preferences-section">
                            <v-card variant="outlined" class="mb-4">
                                <v-card-title class="text-subtitle-1">User Preferences</v-card-title>
                                <v-card-text>
                                    <div class="preference-item">
                                        <span class="preference-label">Preferred Layouts:</span>
                                        <v-chip-group>
                                            <v-chip
                                                v-for="layoutId in userPreferences.preferredLayouts"
                                                :key="layoutId"
                                                size="small"
                                            >
                                                {{ layoutId }}
                                            </v-chip>
                                        </v-chip-group>
                                    </div>
                                    <div class="preference-item mt-4">
                                        <span class="preference-label">Preferred Widgets:</span>
                                        <v-chip-group>
                                            <v-chip
                                                v-for="widgetType in userPreferences.preferredWidgets"
                                                :key="widgetType"
                                                size="small"
                                            >
                                                {{ widgetType }}
                                            </v-chip>
                                        </v-chip-group>
                                    </div>
                                </v-card-text>
                            </v-card>

                            <v-btn
                                color="error"
                                variant="outlined"
                                @click="clearAnalytics"
                            >
                                <v-icon icon="mdi-delete" class="mr-2"></v-icon>
                                Clear Analytics Data
                            </v-btn>
                        </div>
                    </v-window-item>
                </v-window>
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
import { useAnalyticsStore } from '@/stores/analyticsStore'

export default {
    name: 'LayoutAnalytics',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'layout-selected', 'widget-selected'],
    setup(props, { emit }) {
        const analyticsStore = useAnalyticsStore()

        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const activeTab = ref('usage')

        const mostUsedLayouts = computed(() => analyticsStore.mostUsedLayouts)
        const mostUsedWidgets = computed(() => analyticsStore.mostUsedWidgets)
        const sessionData = computed(() => analyticsStore.sessionData)
        const performanceMetrics = computed(() => analyticsStore.performanceMetrics)
        const averageLayoutLoadTime = computed(() => analyticsStore.averageLayoutLoadTime)
        const averageWidgetRenderTime = computed(() => analyticsStore.averageWidgetRenderTime)
        const layoutRecommendations = computed(() => analyticsStore.getLayoutRecommendations())
        const widgetRecommendations = computed(() => analyticsStore.getWidgetRecommendations())
        const userPreferences = computed(() => analyticsStore.userPreferences)

        const formatDate = (timestamp) => {
            if (!timestamp) return 'Never'
            try {
                const date = new Date(timestamp)
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
            } catch (error) {
                return 'Invalid date'
            }
        }

        const applyRecommendation = (recommendation) => {
            emit('layout-selected', recommendation.layoutId)
        }

        const addRecommendedWidget = (widgetType) => {
            emit('widget-selected', widgetType)
        }

        const clearAnalytics = () => {
            if (confirm('Are you sure you want to clear all analytics data?')) {
                analyticsStore.clearAnalytics()
            }
        }

        const close = () => {
            dialog.value = false
        }

        return {
            dialog,
            activeTab,
            mostUsedLayouts,
            mostUsedWidgets,
            sessionData,
            performanceMetrics,
            averageLayoutLoadTime,
            averageWidgetRenderTime,
            layoutRecommendations,
            widgetRecommendations,
            userPreferences,
            formatDate,
            applyRecommendation,
            addRecommendedWidget,
            clearAnalytics,
            close,
        }
    },
}
</script>

<style scoped>
.usage-section,
.performance-section,
.recommendations-section,
.preferences-section {
    padding: 8px 0;
}

.metric-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.metric-label {
    font-weight: 500;
}

.metric-value {
    font-weight: 700;
    color: var(--v-theme-primary);
}

.preference-item {
    margin-bottom: 16px;
}

.preference-label {
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
}
</style>

