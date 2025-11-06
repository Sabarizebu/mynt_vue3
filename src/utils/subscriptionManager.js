/**
 * Subscription Manager
 * Manages WebSocket subscriptions with pooling, sharing, and throttling
 */

// Subscription pool: token -> { subscribers: Set, subscription: Object, lastUpdate: number }
const subscriptionPool = new Map()

// Throttle settings
const THROTTLE_DELAY = 100 // ms
const MAX_SUBSCRIPTIONS = 100 // Maximum concurrent subscriptions

// Throttle timers
const throttleTimers = new Map()

/**
 * Subscribe to an instrument
 * @param {Object} instrument - Instrument object with exch, token, tsym
 * @param {String} subscriberId - Unique ID for the subscriber (e.g., widget ID)
 * @param {Function} callback - Callback function for data updates
 * @param {Object} options - Subscription options
 * @returns {String} Subscription ID
 */
export function subscribe(instrument, subscriberId, callback, options = {}) {
    if (!instrument || !instrument.token) {
        // Don't log error if instrument is intentionally null/undefined (e.g., no instrument selected)
        // Only log if we're actually trying to subscribe with invalid data
        if (instrument !== null && instrument !== undefined) {
            console.warn('Invalid instrument for subscription:', instrument)
        }
        return null
    }

    const token = instrument.token
    const subscriptionId = `${token}-${subscriberId}`

    // Get or create subscription pool entry
    let poolEntry = subscriptionPool.get(token)
    if (!poolEntry) {
        poolEntry = {
            instrument,
            subscribers: new Map(),
            subscription: null,
            lastUpdate: Date.now(),
            callbacks: new Map(),
        }
        subscriptionPool.set(token, poolEntry)
    }

    // Add subscriber
    if (!poolEntry.subscribers.has(subscriberId)) {
        poolEntry.subscribers.set(subscriberId, {
            id: subscriberId,
            callback,
            options,
            subscribedAt: Date.now(),
        })
        poolEntry.callbacks.set(subscriberId, callback)
    } else {
        // Update callback if already subscribed
        poolEntry.callbacks.set(subscriberId, callback)
        poolEntry.subscribers.get(subscriberId).callback = callback
    }

    // Create or reuse subscription
    if (!poolEntry.subscription) {
        // Create new subscription
        poolEntry.subscription = {
            id: subscriptionId,
            instrument,
            active: true,
            createdAt: Date.now(),
        }

        // Trigger actual WebSocket subscription
        triggerSubscription(instrument, poolEntry)
    }

    return subscriptionId
}

/**
 * Unsubscribe from an instrument
 * @param {String} token - Instrument token
 * @param {String} subscriberId - Subscriber ID
 */
export function unsubscribe(token, subscriberId) {
    const poolEntry = subscriptionPool.get(token)
    if (!poolEntry) return

    // Remove subscriber
    poolEntry.subscribers.delete(subscriberId)
    poolEntry.callbacks.delete(subscriberId)

    // If no more subscribers, remove subscription
    if (poolEntry.subscribers.size === 0) {
        // Trigger actual WebSocket unsubscription
        triggerUnsubscription(poolEntry.instrument, poolEntry)

        // Remove from pool
        subscriptionPool.delete(token)
    }
}

/**
 * Trigger actual WebSocket subscription
 */
function triggerSubscription(instrument, poolEntry) {
    // Import WebSocket functions dynamically to avoid circular dependencies
    import('@/utils/webSocketEventBus').then(({ setWebsocket }) => {
        const subscriptionData = [{
            exch: instrument.exch,
            token: instrument.token,
            tsym: instrument.tsym,
        }]

        setWebsocket('sub', subscriptionData, 'trading')

        // Set up data handler
        setupDataHandler(instrument.token, poolEntry)
    })
}

/**
 * Trigger actual WebSocket unsubscription
 */
function triggerUnsubscription(instrument, poolEntry) {
    import('@/utils/webSocketEventBus').then(({ setWebsocket }) => {
        const subscriptionData = [{
            exch: instrument.exch,
            token: instrument.token,
            tsym: instrument.tsym,
        }]

        setWebsocket('unsub', subscriptionData, 'trading')
    })
}

/**
 * Set up data handler for subscription
 */
function setupDataHandler(token, poolEntry) {
    // Listen to WebSocket events for this token
    // This would typically be handled by the WebSocket event bus
    // For now, we'll set up a placeholder
    const handler = (data) => {
        if (data && data.token === token) {
            // Throttle updates
            throttleUpdate(token, data, poolEntry)
        }
    }

    // Store handler for cleanup
    poolEntry.dataHandler = handler

    // Register with WebSocket event bus (if available)
    if (window.webSocketEventBus) {
        window.webSocketEventBus.on(`data-${token}`, handler)
    }
}

/**
 * Throttle data updates
 */
function throttleUpdate(token, data, poolEntry) {
    const now = Date.now()
    const lastUpdate = poolEntry.lastUpdate

    // Check if we should throttle
    if (now - lastUpdate < THROTTLE_DELAY) {
        // Schedule delayed update
        if (throttleTimers.has(token)) {
            clearTimeout(throttleTimers.get(token))
        }

        const timer = setTimeout(() => {
            distributeUpdate(token, data, poolEntry)
            throttleTimers.delete(token)
        }, THROTTLE_DELAY - (now - lastUpdate))

        throttleTimers.set(token, timer)
    } else {
        // Update immediately
        distributeUpdate(token, data, poolEntry)
    }
}

/**
 * Distribute update to all subscribers
 */
function distributeUpdate(token, data, poolEntry) {
    poolEntry.lastUpdate = Date.now()

    // Call all callbacks
    poolEntry.callbacks.forEach((callback, subscriberId) => {
        try {
            callback(data)
        } catch (error) {
            console.error(`Error in subscription callback for ${subscriberId}:`, error)
        }
    })
}

/**
 * Get subscription info
 */
export function getSubscriptionInfo(token) {
    const poolEntry = subscriptionPool.get(token)
    if (!poolEntry) return null

    return {
        token,
        subscriberCount: poolEntry.subscribers.size,
        subscribers: Array.from(poolEntry.subscribers.keys()),
        lastUpdate: poolEntry.lastUpdate,
        active: poolEntry.subscription?.active || false,
    }
}

/**
 * Get all active subscriptions
 */
export function getAllSubscriptions() {
    const subscriptions = []
    subscriptionPool.forEach((poolEntry, token) => {
        subscriptions.push({
            token,
            subscriberCount: poolEntry.subscribers.size,
            subscribers: Array.from(poolEntry.subscribers.keys()),
            lastUpdate: poolEntry.lastUpdate,
        })
    })
    return subscriptions
}

/**
 * Clear all subscriptions
 */
export function clearAllSubscriptions() {
    subscriptionPool.forEach((poolEntry, token) => {
        triggerUnsubscription(poolEntry.instrument, poolEntry)
    })
    subscriptionPool.clear()
    throttleTimers.forEach((timer) => clearTimeout(timer))
    throttleTimers.clear()
}

/**
 * Update subscription data (called by WebSocket event bus)
 */
export function updateSubscriptionData(token, data) {
    const poolEntry = subscriptionPool.get(token)
    if (poolEntry) {
        throttleUpdate(token, data, poolEntry)
    }
}

