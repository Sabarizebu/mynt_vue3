import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Analytics Store
 * Tracks layout usage, performance metrics, and user preferences
 */
export const useAnalyticsStore = defineStore('analytics', () => {
    // Layout usage tracking
    const layoutUsage = ref({}) // { layoutId: { count: number, lastUsed: timestamp } }
    const widgetUsage = ref({}) // { widgetType: { count: number, avgDuration: number } }
    const sessionData = ref({
        startTime: Date.now(),
        layoutsSwitched: 0,
        widgetsAdded: 0,
        widgetsRemoved: 0,
    })

    // Performance metrics
    const performanceMetrics = ref({
        layoutLoadTime: [],
        widgetRenderTime: [],
        subscriptionLatency: [],
    })

    // User preferences
    const userPreferences = ref({
        preferredLayouts: [],
        preferredWidgets: [],
        preferredTimeframes: [],
        preferredChartTypes: [],
    })

    // Computed properties
    const mostUsedLayouts = computed(() => {
        return Object.entries(layoutUsage.value)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    })

    const mostUsedWidgets = computed(() => {
        return Object.entries(widgetUsage.value)
            .map(([type, data]) => ({ type, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    })

    const averageLayoutLoadTime = computed(() => {
        const times = performanceMetrics.value.layoutLoadTime
        if (times.length === 0) return 0
        return times.reduce((sum, time) => sum + time, 0) / times.length
    })

    const averageWidgetRenderTime = computed(() => {
        const times = performanceMetrics.value.widgetRenderTime
        if (times.length === 0) return 0
        return times.reduce((sum, time) => sum + time, 0) / times.length
    })

    /**
     * Track layout usage
     */
    const trackLayoutUsage = (layoutId) => {
        if (!layoutUsage.value[layoutId]) {
            layoutUsage.value[layoutId] = {
                count: 0,
                lastUsed: null,
                firstUsed: Date.now(),
            }
        }

        layoutUsage.value[layoutId].count++
        layoutUsage.value[layoutId].lastUsed = Date.now()

        // Save to localStorage
        saveAnalytics()
    }

    /**
     * Track widget usage
     */
    const trackWidgetUsage = (widgetType, duration = 0) => {
        if (!widgetUsage.value[widgetType]) {
            widgetUsage.value[widgetType] = {
                count: 0,
                totalDuration: 0,
                avgDuration: 0,
            }
        }

        widgetUsage.value[widgetType].count++
        if (duration > 0) {
            widgetUsage.value[widgetType].totalDuration += duration
            widgetUsage.value[widgetType].avgDuration =
                widgetUsage.value[widgetType].totalDuration / widgetUsage.value[widgetType].count
        }

        // Save to localStorage
        saveAnalytics()
    }

    /**
     * Track layout switch
     */
    const trackLayoutSwitch = () => {
        sessionData.value.layoutsSwitched++
        saveAnalytics()
    }

    /**
     * Track widget added
     */
    const trackWidgetAdded = (widgetType) => {
        sessionData.value.widgetsAdded++
        trackWidgetUsage(widgetType)
        saveAnalytics()
    }

    /**
     * Track widget removed
     */
    const trackWidgetRemoved = () => {
        sessionData.value.widgetsRemoved++
        saveAnalytics()
    }

    /**
     * Track layout load time
     */
    const trackLayoutLoadTime = (loadTime) => {
        performanceMetrics.value.layoutLoadTime.push(loadTime)
        // Keep only last 100 measurements
        if (performanceMetrics.value.layoutLoadTime.length > 100) {
            performanceMetrics.value.layoutLoadTime.shift()
        }
        saveAnalytics()
    }

    /**
     * Track widget render time
     */
    const trackWidgetRenderTime = (renderTime) => {
        performanceMetrics.value.widgetRenderTime.push(renderTime)
        // Keep only last 100 measurements
        if (performanceMetrics.value.widgetRenderTime.length > 100) {
            performanceMetrics.value.widgetRenderTime.shift()
        }
        saveAnalytics()
    }

    /**
     * Track subscription latency
     */
    const trackSubscriptionLatency = (latency) => {
        performanceMetrics.value.subscriptionLatency.push(latency)
        // Keep only last 100 measurements
        if (performanceMetrics.value.subscriptionLatency.length > 100) {
            performanceMetrics.value.subscriptionLatency.shift()
        }
        saveAnalytics()
    }

    /**
     * Update user preferences
     */
    const updatePreferences = (preferences) => {
        Object.assign(userPreferences.value, preferences)
        saveAnalytics()
    }

    /**
     * Get layout recommendations
     */
    const getLayoutRecommendations = () => {
        const recommendations = []

        // Recommend most used layouts
        mostUsedLayouts.value.slice(0, 3).forEach((layout) => {
            recommendations.push({
                type: 'most-used',
                layoutId: layout.id,
                reason: `Used ${layout.count} times`,
            })
        })

        // Recommend based on time of day
        const hour = new Date().getHours()
        if (hour >= 9 && hour <= 15) {
            recommendations.push({
                type: 'time-based',
                layoutId: 'day-trading',
                reason: 'Recommended for market hours',
            })
        }

        return recommendations
    }

    /**
     * Get widget recommendations
     */
    const getWidgetRecommendations = () => {
        const recommendations = []

        // Recommend most used widgets
        mostUsedWidgets.value.slice(0, 5).forEach((widget) => {
            recommendations.push({
                type: widget.type,
                reason: `Used ${widget.count} times`,
            })
        })

        return recommendations
    }

    /**
     * Save analytics to localStorage
     */
    const saveAnalytics = () => {
        try {
            localStorage.setItem('trading_analytics', JSON.stringify({
                layoutUsage: layoutUsage.value,
                widgetUsage: widgetUsage.value,
                userPreferences: userPreferences.value,
                performanceMetrics: performanceMetrics.value,
            }))
        } catch (error) {
            console.error('Error saving analytics:', error)
        }
    }

    /**
     * Load analytics from localStorage
     */
    const loadAnalytics = () => {
        try {
            const saved = localStorage.getItem('trading_analytics')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.layoutUsage) layoutUsage.value = data.layoutUsage
                if (data.widgetUsage) widgetUsage.value = data.widgetUsage
                if (data.userPreferences) userPreferences.value = data.userPreferences
                if (data.performanceMetrics) performanceMetrics.value = data.performanceMetrics
            }
        } catch (error) {
            console.error('Error loading analytics:', error)
        }
    }

    /**
     * Clear analytics
     */
    const clearAnalytics = () => {
        layoutUsage.value = {}
        widgetUsage.value = {}
        performanceMetrics.value = {
            layoutLoadTime: [],
            widgetRenderTime: [],
            subscriptionLatency: [],
        }
        saveAnalytics()
    }

    /**
     * Get analytics summary
     */
    const getAnalyticsSummary = () => {
        return {
            totalLayoutsUsed: Object.keys(layoutUsage.value).length,
            totalWidgetsUsed: Object.keys(widgetUsage.value).length,
            mostUsedLayout: mostUsedLayouts.value[0],
            mostUsedWidget: mostUsedWidgets.value[0],
            averageLayoutLoadTime: averageLayoutLoadTime.value,
            averageWidgetRenderTime: averageWidgetRenderTime.value,
            sessionData: sessionData.value,
        }
    }

    // Initialize
    loadAnalytics()

    return {
        // State
        layoutUsage,
        widgetUsage,
        sessionData,
        performanceMetrics,
        userPreferences,

        // Computed
        mostUsedLayouts,
        mostUsedWidgets,
        averageLayoutLoadTime,
        averageWidgetRenderTime,

        // Methods
        trackLayoutUsage,
        trackWidgetUsage,
        trackLayoutSwitch,
        trackWidgetAdded,
        trackWidgetRemoved,
        trackLayoutLoadTime,
        trackWidgetRenderTime,
        trackSubscriptionLatency,
        updatePreferences,
        getLayoutRecommendations,
        getWidgetRecommendations,
        saveAnalytics,
        loadAnalytics,
        clearAnalytics,
        getAnalyticsSummary,
    }
})

