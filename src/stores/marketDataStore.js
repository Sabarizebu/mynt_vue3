import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export const useMarketDataStore = defineStore('marketData', () => {
    // State: Key is `${exchange}|${token}`
    // We use a reactive object as a Map for O(1) access and automatic reactivity
    const liveData = reactive({})

    /**
     * Generates a unique key for the script
     * @param {string} exchange - The exchange name (e.g., 'NSE', 'BSE')
     * @param {string} token - The token identifier
     * @returns {string} Unique key
     */
    const getKey = (exchange, token) => {
        if (!exchange || !token) return null
        return `${exchange}|${token}`
    }

    /**
     * Deep merges source object into target object
     * Preserves existing keys in target if missing in source
     * Handles nested objects recursively
     * @param {Object} target - The existing state object
     * @param {Object} source - The new incoming data
     */
    const deepMerge = (target, source) => {
        for (const key in source) {
            const sourceValue = source[key]
            const targetValue = target[key]

            // Skip undefined or null values in source if we want to strictly preserve
            // (Adjust logic if null is a valid update value, e.g. to reset a field)
            if (sourceValue === undefined) continue

            if (
                sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue)
            ) {
                // If target doesn't have this object, create it
                if (!targetValue || typeof targetValue !== 'object') {
                    target[key] = {}
                }
                // Recursively merge
                deepMerge(target[key], sourceValue)
            } else {
                // Primitive value or Array: overwrite target
                target[key] = sourceValue
            }
        }
        return target
    }

    /**
     * Clean value by removing "+" prefix if present
     * Preserves negative sign and numeric value
     * @param {string|number} value - The value to clean
     * @returns {string|number} Cleaned value
     */
    const cleanValue = (value) => {
        if (value === undefined || value === null) return value
        const strValue = String(value)
        // Remove leading "+" if present
        return strValue.startsWith('+') ? strValue.substring(1) : strValue
    }

    /**
     * Process incoming WebSocket feed updates
     * @param {Object|Array} feed - The incoming data packet(s)
     */
    const processFeed = (feed) => {
        // Normalize to array
        const updates = Array.isArray(feed) ? feed : [feed]

        updates.forEach(update => {
            // Handle variations of exchange/token keys
            const exchange = update.exchange || update.exch || update.e
            const token = update.token || update.tk || update.t

            const key = getKey(exchange, token)
            if (!key) return

            // If entry doesn't exist, initialize it
            if (!liveData[key]) {
                liveData[key] = {}
            }

            // Normalize fields to standard names and clean "+" prefixes
            const normalizedUpdate = { ...update }

            // Map LTP (Last Traded Price) and clean
            if (update.lp !== undefined) normalizedUpdate.ltp = cleanValue(update.lp)
            if (update.l !== undefined) normalizedUpdate.ltp = cleanValue(update.l)

            // Map Previous Close and clean
            if (update.pc !== undefined) normalizedUpdate.prev_close = cleanValue(update.pc)
            if (update.c !== undefined) normalizedUpdate.prev_close = cleanValue(update.c)

            // CRITICAL FIX: Don't accept ch/chp from feed - we'll calculate them
            // Only accept ltp and close, then calculate ch = ltp - close, chp = (ch/close)*100
            // This prevents stale/incorrect ch/chp values from the feed
            // if (update.ch !== undefined) normalizedUpdate.ch = cleanValue(update.ch)
            // if (update.cp !== undefined) normalizedUpdate.chp = cleanValue(update.cp)
            // if (update.chp !== undefined) normalizedUpdate.chp = cleanValue(update.chp)

            // Merge normalized data into existing state (without ch/chp from feed)
            deepMerge(liveData[key], normalizedUpdate)

            // --- Calculation Logic ---
            // Calculate derived values (ch, chp) using the latest merged state
            // This ensures we have values even if the feed only sends LTP
            const currentData = liveData[key]

            const ltp = parseFloat(currentData.ltp)
            const prevClose = parseFloat(currentData.prev_close || currentData.c || currentData.pc)

            if (!isNaN(ltp)) {
                // Format LTP to 2 decimal places
                currentData.ltp = ltp.toFixed(2)

                // If prev_close is missing, try to derive it from LTP and Change
                // This is useful when seeding data from API which might have LTP and CH but not explicit PC
                if ((isNaN(prevClose) || prevClose === 0) && currentData.ch !== undefined) {
                    const initialCh = parseFloat(currentData.ch)
                    if (!isNaN(initialCh)) {
                        const derivedPrevClose = ltp - initialCh
                        if (derivedPrevClose > 0) {
                            currentData.prev_close = derivedPrevClose.toFixed(2)
                            // Update local variable for immediate use in this cycle if needed
                            // prevClose = derivedPrevClose 
                        }
                    }
                }

                // Re-fetch prevClose after potential derivation
                const effectivePrevClose = parseFloat(currentData.prev_close || currentData.c || currentData.pc)

                if (!isNaN(effectivePrevClose) && effectivePrevClose !== 0) {
                    const ch = ltp - effectivePrevClose
                    const chp = (ch / effectivePrevClose) * 100

                    // Update store with calculated values (already cleaned of "+" by cleanValue)
                    currentData.ch = ch.toFixed(2)
                    currentData.chp = chp.toFixed(2)
                }
            }
        })
    }

    /**
     * Get reactive data for a specific script
     * @param {string} exchange 
     * @param {string} token 
     * @returns {Object} Reactive data object
     */
    const getScriptData = (exchange, token) => {
        const key = getKey(exchange, token)
        return liveData[key] || {}
    }

    /**
     * Get a specific field for a script, falling back to default
     */
    const getField = (exchange, token, field, defaultValue = null) => {
        const data = getScriptData(exchange, token)
        return data[field] !== undefined ? data[field] : defaultValue
    }

    return {
        liveData,
        processFeed,
        getScriptData,
        getField
    }
})
