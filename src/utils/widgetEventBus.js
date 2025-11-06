/**
 * Widget Event Bus
 * Handles communication between widgets for linking and synchronization
 */
class WidgetEventBus {
    constructor() {
        this.listeners = new Map()
        this.linkGroups = new Map() // Map of linkGroupId -> Set of widgetIds
        this.widgetLinks = new Map() // Map of widgetId -> link configuration
    }

    /**
     * Subscribe to widget events
     * @param {String} widgetId - Widget ID
     * @param {String} eventType - Event type (instrument-change, timeframe-change, etc.)
     * @param {Function} callback - Callback function
     */
    subscribe(widgetId, eventType, callback) {
        const key = `${widgetId}:${eventType}`
        if (!this.listeners.has(key)) {
            this.listeners.set(key, [])
        }
        this.listeners.get(key).push(callback)
    }

    /**
     * Unsubscribe from widget events
     * @param {String} widgetId - Widget ID
     * @param {String} eventType - Event type
     * @param {Function} callback - Callback function (optional, removes all if not provided)
     */
    unsubscribe(widgetId, eventType, callback = null) {
        const key = `${widgetId}:${eventType}`
        if (!this.listeners.has(key)) return

        if (callback) {
            const callbacks = this.listeners.get(key)
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        } else {
            this.listeners.delete(key)
        }
    }

    /**
     * Emit event to all subscribers
     * @param {String} widgetId - Widget ID that emitted the event
     * @param {String} eventType - Event type
     * @param {*} data - Event data
     */
    emit(widgetId, eventType, data) {
        // Get all widgets in the same link group
        const linkGroupId = this.getLinkGroupId(widgetId)
        if (!linkGroupId) return

        const linkedWidgets = this.linkGroups.get(linkGroupId)
        if (!linkedWidgets) return

        // Emit to all linked widgets except the source
        linkedWidgets.forEach((linkedWidgetId) => {
            if (linkedWidgetId !== widgetId) {
                const key = `${linkedWidgetId}:${eventType}`
                const callbacks = this.listeners.get(key)
                if (callbacks) {
                    callbacks.forEach((callback) => {
                        try {
                            callback(data, widgetId)
                        } catch (error) {
                            console.error(`Error in widget event callback for ${linkedWidgetId}:`, error)
                        }
                    })
                }
            }
        })
    }

    /**
     * Create a link between widgets
     * @param {String} linkGroupId - Link group ID
     * @param {Array<String>} widgetIds - Array of widget IDs to link
     * @param {Object} config - Link configuration (syncInstrument, syncTimeframe, syncChartType, etc.)
     */
    createLink(linkGroupId, widgetIds, config = {}) {
        // Remove widgets from existing groups
        widgetIds.forEach((widgetId) => {
            this.removeWidgetFromGroups(widgetId)
        })

        // Create or update link group
        this.linkGroups.set(linkGroupId, new Set(widgetIds))

        // Store link configuration for each widget
        widgetIds.forEach((widgetId) => {
            this.widgetLinks.set(widgetId, {
                linkGroupId,
                config: {
                    syncInstrument: config.syncInstrument !== false,
                    syncTimeframe: config.syncTimeframe !== false,
                    syncChartType: config.syncChartType !== false,
                    syncIndicators: config.syncIndicators !== false,
                    ...config,
                },
            })
        })
    }

    /**
     * Break link for a widget
     * @param {String} widgetId - Widget ID
     */
    breakLink(widgetId) {
        const linkConfig = this.widgetLinks.get(widgetId)
        if (!linkConfig) return

        const linkGroupId = linkConfig.linkGroupId
        const linkGroup = this.linkGroups.get(linkGroupId)
        if (linkGroup) {
            linkGroup.delete(widgetId)
            if (linkGroup.size === 0) {
                this.linkGroups.delete(linkGroupId)
            } else if (linkGroup.size === 1) {
                // If only one widget left, break the link
                const remainingWidgetId = Array.from(linkGroup)[0]
                this.widgetLinks.delete(remainingWidgetId)
                this.linkGroups.delete(linkGroupId)
            }
        }

        this.widgetLinks.delete(widgetId)
    }

    /**
     * Get link group ID for a widget
     * @param {String} widgetId - Widget ID
     * @returns {String|null} - Link group ID or null
     */
    getLinkGroupId(widgetId) {
        const linkConfig = this.widgetLinks.get(widgetId)
        return linkConfig ? linkConfig.linkGroupId : null
    }

    /**
     * Get all widgets in a link group
     * @param {String} linkGroupId - Link group ID
     * @returns {Set<String>} - Set of widget IDs
     */
    getLinkedWidgets(linkGroupId) {
        return this.linkGroups.get(linkGroupId) || new Set()
    }

    /**
     * Get link configuration for a widget
     * @param {String} widgetId - Widget ID
     * @returns {Object|null} - Link configuration or null
     */
    getLinkConfig(widgetId) {
        return this.widgetLinks.get(widgetId) || null
    }

    /**
     * Check if widget is linked
     * @param {String} widgetId - Widget ID
     * @returns {Boolean} - True if widget is linked
     */
    isLinked(widgetId) {
        return this.widgetLinks.has(widgetId)
    }

    /**
     * Get all linked widgets for a widget
     * @param {String} widgetId - Widget ID
     * @returns {Array<String>} - Array of linked widget IDs (excluding the widget itself)
     */
    getLinkedWidgetIds(widgetId) {
        const linkGroupId = this.getLinkGroupId(widgetId)
        if (!linkGroupId) return []

        const linkGroup = this.linkGroups.get(linkGroupId)
        if (!linkGroup) return []

        return Array.from(linkGroup).filter((id) => id !== widgetId)
    }

    /**
     * Remove widget from all link groups
     * @param {String} widgetId - Widget ID
     */
    removeWidgetFromGroups(widgetId) {
        const linkConfig = this.widgetLinks.get(widgetId)
        if (linkConfig) {
            const linkGroupId = linkConfig.linkGroupId
            const linkGroup = this.linkGroups.get(linkGroupId)
            if (linkGroup) {
                linkGroup.delete(widgetId)
                if (linkGroup.size === 0) {
                    this.linkGroups.delete(linkGroupId)
                }
            }
        }
        this.widgetLinks.delete(widgetId)
    }

    /**
     * Clear all links and listeners
     */
    clear() {
        this.listeners.clear()
        this.linkGroups.clear()
        this.widgetLinks.clear()
    }
}

// Create singleton instance
const widgetEventBus = new WidgetEventBus()

export default widgetEventBus

// Export convenience functions
export const subscribeToWidget = (widgetId, eventType, callback) => {
    widgetEventBus.subscribe(widgetId, eventType, callback)
}

export const unsubscribeFromWidget = (widgetId, eventType, callback) => {
    widgetEventBus.unsubscribe(widgetId, eventType, callback)
}

export const emitWidgetEvent = (widgetId, eventType, data) => {
    widgetEventBus.emit(widgetId, eventType, data)
}

export const createWidgetLink = (linkGroupId, widgetIds, config) => {
    widgetEventBus.createLink(linkGroupId, widgetIds, config)
}

export const breakWidgetLink = (widgetId) => {
    widgetEventBus.breakLink(widgetId)
}

export const getWidgetLinkConfig = (widgetId) => {
    return widgetEventBus.getLinkConfig(widgetId)
}

export const isWidgetLinked = (widgetId) => {
    return widgetEventBus.isLinked(widgetId)
}

export const getLinkedWidgetIds = (widgetId) => {
    return widgetEventBus.getLinkedWidgetIds(widgetId)
}

