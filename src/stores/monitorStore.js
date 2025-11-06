import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getCurrentMonitor,
    getAllMonitors,
    detectAndStoreMonitor,
    getMonitorLayout,
    saveMonitorLayout,
    syncLayoutAcrossMonitors,
    watchMonitorChanges,
} from '@/utils/monitorDetector'

/**
 * Monitor Store
 * Manages multi-monitor configurations and layouts
 */
export const useMonitorStore = defineStore('monitor', () => {
    // Current monitor
    const currentMonitor = ref(null)
    const previousMonitorId = ref(null)

    // All detected monitors
    const monitors = ref([])

    // Layout sync settings
    const syncLayouts = ref(false)
    const monitorLayouts = ref({})

    // Computed properties
    const isPrimaryMonitor = computed(() => currentMonitor.value?.isPrimary ?? true)
    const hasMultipleMonitors = computed(() => monitors.value.length > 1)
    const currentMonitorId = computed(() => currentMonitor.value?.id ?? 'primary')

    /**
     * Initialize monitor detection
     */
    const initialize = () => {
        // Detect current monitor
        const monitor = detectAndStoreMonitor()
        currentMonitor.value = monitor
        previousMonitorId.value = monitor.id

        // Load all monitors
        monitors.value = getAllMonitors()

        // Load current monitor layout
        loadCurrentMonitorLayout()

        // Start watching for monitor changes
        const cleanup = watchMonitorChanges((newMonitor, oldMonitorId) => {
            handleMonitorChange(newMonitor, oldMonitorId)
        })

        return cleanup
    }

    /**
     * Handle monitor change
     */
    const handleMonitorChange = (newMonitor, oldMonitorId) => {
        previousMonitorId.value = oldMonitorId
        currentMonitor.value = newMonitor

        // Load layout for new monitor
        loadCurrentMonitorLayout()

        // Emit event for components to react
        window.dispatchEvent(
            new CustomEvent('monitor-changed', {
                detail: { newMonitor, oldMonitorId },
            })
        )
    }

    /**
     * Load layout for current monitor
     */
    const loadCurrentMonitorLayout = () => {
        if (!currentMonitor.value) return

        const layout = getMonitorLayout(currentMonitor.value.id)
        if (layout) {
            monitorLayouts.value[currentMonitor.value.id] = layout
        }
    }

    /**
     * Save layout for current monitor
     */
    const saveCurrentMonitorLayout = (layout) => {
        if (!currentMonitor.value) return false

        const success = saveMonitorLayout(currentMonitor.value.id, layout)
        if (success) {
            monitorLayouts.value[currentMonitor.value.id] = layout

            // Sync across monitors if enabled
            if (syncLayouts.value) {
                syncLayoutAcrossMonitors(layout)
            }
        }

        return success
    }

    /**
     * Get layout for specific monitor
     */
    const getLayoutForMonitor = (monitorId) => {
        if (monitorLayouts.value[monitorId]) {
            return monitorLayouts.value[monitorId]
        }

        const layout = getMonitorLayout(monitorId)
        if (layout) {
            monitorLayouts.value[monitorId] = layout
        }

        return layout
    }

    /**
     * Save layout for specific monitor
     */
    const saveLayoutForMonitor = (monitorId, layout) => {
        const success = saveMonitorLayout(monitorId, layout)
        if (success) {
            monitorLayouts.value[monitorId] = layout
        }
        return success
    }

    /**
     * Toggle layout sync
     */
    const toggleSyncLayouts = () => {
        syncLayouts.value = !syncLayouts.value

        // If enabling sync, sync current layout to all monitors
        if (syncLayouts.value && currentMonitor.value) {
            const currentLayout = monitorLayouts.value[currentMonitor.value.id]
            if (currentLayout) {
                syncLayoutAcrossMonitors(currentLayout)
            }
        }
    }

    /**
     * Refresh monitor list
     */
    const refreshMonitors = () => {
        monitors.value = getAllMonitors()
    }

    /**
     * Add monitor manually
     */
    const addMonitor = (monitor) => {
        const existingIndex = monitors.value.findIndex((m) => m.id === monitor.id)
        if (existingIndex >= 0) {
            monitors.value[existingIndex] = monitor
        } else {
            monitors.value.push(monitor)
        }
    }

    /**
     * Remove monitor
     */
    const removeMonitor = (monitorId) => {
        const index = monitors.value.findIndex((m) => m.id === monitorId)
        if (index >= 0) {
            monitors.value.splice(index, 1)
        }

        // Remove layout
        delete monitorLayouts.value[monitorId]

        // Remove from localStorage
        try {
            localStorage.removeItem(`trading_layout_${monitorId}`)
        } catch (error) {
            console.error('Error removing monitor layout:', error)
        }
    }

    return {
        // State
        currentMonitor,
        previousMonitorId,
        monitors,
        syncLayouts,
        monitorLayouts,

        // Computed
        isPrimaryMonitor,
        hasMultipleMonitors,
        currentMonitorId,

        // Methods
        initialize,
        handleMonitorChange,
        loadCurrentMonitorLayout,
        saveCurrentMonitorLayout,
        getLayoutForMonitor,
        saveLayoutForMonitor,
        toggleSyncLayouts,
        refreshMonitors,
        addMonitor,
        removeMonitor,
    }
})

