import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMarketDataStore } from './marketDataStore'
import { useHoldingsStore } from './holdingsStore'

// Advanced throttling system with per-token batching
class WebSocketThrottler {
    constructor(batchDelay = 100) {
        this.batchDelay = batchDelay
        this.tokenBatches = new Map() // token -> latest data
        this.batchTimer = null
        this.criticalQueue = [] // Immediate dispatch for critical messages
    }

    // Add data to batch (throttled)
    addToBatch(token, data, page) {
        const key = `${token}_${page}`
        // Store latest data for this token (overwrites old data)
        this.tokenBatches.set(key, { token, data, page })

        // Schedule batch dispatch if not already scheduled
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.flushBatch()
            }, this.batchDelay)
        }
    }

    // Dispatch critical message immediately (no throttle/batch)
    dispatchCritical(data, page) {
        const event = new CustomEvent('web-scoketConn', {
            detail: [data, page]
        })
        window.dispatchEvent(event)
    }

    // Flush all batched updates
    flushBatch() {
        if (this.tokenBatches.size === 0) {
            this.batchTimer = null
            return
        }

        // Dispatch all batched updates
        this.tokenBatches.forEach(({ data, page }) => {
            const event = new CustomEvent('web-scoketConn', {
                detail: [data, page]
            })
            window.dispatchEvent(event)
        })

        // Clear batch
        this.tokenBatches.clear()
        this.batchTimer = null
    }

    // Force flush (useful for cleanup)
    forceFush() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer)
            this.flushBatch()
        }
    }
}

export const useWebsocketStore = defineStore('websocket', () => {
    // WebSocket subscription data state
    const marketDataStore = useMarketDataStore()
    const holdingsStore = useHoldingsStore()

    const wsstocksdata = ref({
        raw: null,        // current page
        rawdata: [],      // current page data
        wl: [],           // watchlist data
        pd: [],           // positions data
        ssdpd: [],        // top indices data (ssd-pd) - persistent across pages
        tok: []           // all subscribed tokens
    })

    // Create advanced throttler instance
    const throttler = new WebSocketThrottler(100) // 100ms batch window

    // Subscription queue for requests that arrive before WebSocket is ready
    const pendingSubscriptions = []
    let isWebSocketReady = false

    // Flush all pending subscriptions once WebSocket is ready
    const flushPendingSubscriptions = () => {
        if (pendingSubscriptions.length === 0) {
            console.log('[WS-STORE] No pending subscriptions to flush')
            return
        }

        console.log(`[WS-STORE] 🔥 Flushing ${pendingSubscriptions.length} pending subscriptions`)

        // Process all pending subscriptions
        const subscriptionsToProcess = [...pendingSubscriptions]
        pendingSubscriptions.length = 0 // Clear the queue

        // Add small delay to ensure connectionStatus in webSocketstream.js is true
        setTimeout(() => {
            subscriptionsToProcess.forEach(({ flow, data, is }, index) => {
                setWebsocket(flow, data, is)
            })
            console.log('[WS-STORE] ✅ Flush complete')
        }, 50) // 50ms delay to ensure WebSocket is fully ready
    }

    // Mark WebSocket as ready and flush pending subscriptions
    const markWebSocketReady = () => {
        if (!isWebSocketReady) {
            isWebSocketReady = true
            flushPendingSubscriptions()
        }
    }

    // Reset WebSocket ready state (called when connection drops)
    const resetWebSocketReady = () => {
        console.log('[WS-STORE] ⚠️ resetWebSocketReady called - setting isReady = false')
        isWebSocketReady = false
    }

    // Check if a token is active in other pages (watchlist, positions, or indices)
    const isActiveInOtherPages = (_currentPage, token, exch) => {
        // Check if in watchlist
        const isInWatchlist = wsstocksdata.value.wl.some(
            item => item.token === token && item.exch === exch
        )

        // Check if in positions
        const isInPositions = wsstocksdata.value.pd.some(
            item => item.token === token && item.exch === exch
        )

        // Check if in top indices (ssd-pd) - these are persistent across all pages
        const isInIndices = wsstocksdata.value.ssdpd.some(
            item => item.token === token && item.exch === exch
        )

        return isInWatchlist || isInPositions || isInIndices
    }

    // Handle WebSocket subscription requests
    const handleWebSocketRequest = (flow, data, is, page) => {
        
        // For unsubscribe requests, check if the data is still needed elsewhere
        if (flow === "unsub" && data && Array.isArray(data) && data.length > 0) {
            const filteredData = data.filter(item => {
                if (item && item.token && item.exch) {
                    return !isActiveInOtherPages(page, item.token, item.exch)
                }
                return true
            })

            // Only proceed with unsubscribe if there's data to unsubscribe
            if (filteredData.length > 0) {
                setWebsocket(flow, filteredData, is)
            }
            return
        }

        // Unsubscribe if page is different and not watchlist, but preserve persistent subscriptions
        if (
            wsstocksdata.value.raw !== null &&
            wsstocksdata.value.raw !== page &&
            page !== "watchlist" &&
            page !== "stocks" && // Allow multiple subscriptions on stocks page
            flow !== "unsub"
        ) {
            if (
                wsstocksdata.value.rawdata?.length > 0 &&
                is !== "wl" &&
                is !== "pd" &&
                is !== "ssd-pd"
            ) {
                // Build set of persistent tokens (wl, pd, ssdpd) that should never be unsubscribed
                const watchlistTokens = wsstocksdata.value.wl || []
                const predefinedTokens = wsstocksdata.value.pd || []
                const indicesTokens = wsstocksdata.value.ssdpd || []
                const persistentTokens = [...watchlistTokens, ...predefinedTokens, ...indicesTokens]
                const persistentTokenSet = new Set(persistentTokens.map(item => item.token))

                // Filter out tokens that are still needed OR are persistent
                const tokensToUnsubscribe = wsstocksdata.value.rawdata.filter(item => {
                    if (item && item.token && item.exch) {
                        // Keep persistent tokens
                        if (persistentTokenSet.has(item.token)) {
                            return false
                        }
                        // Unsubscribe if not active in other pages
                        return !isActiveInOtherPages(page, item.token, item.exch)
                    }
                    return true
                })

                if (tokensToUnsubscribe.length > 0) {
                    setWebsocket("unsub", tokensToUnsubscribe, "is")
                }

                // Keep only persistent tokens in rawdata
                wsstocksdata.value.rawdata = wsstocksdata.value.rawdata.filter(item =>
                    persistentTokenSet.has(item.token)
                )
                wsstocksdata.value.raw = page
            }
        } else if (page !== "watchlist") {
            wsstocksdata.value.raw = page
        }

        // Update the appropriate data array based on 'is' parameter and add to tok
        if (flow === "sub" && data && Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                if (item && item.token && item.exch) {
                    const info = { exch: item.exch, token: item.token, tsym: item.tsym }

                    // Add to specific arrays based on 'is' parameter
                    if (is === "wl") {
                        const exists = wsstocksdata.value.wl.some(o => o.token === item.token)
                        if (!exists) {
                            wsstocksdata.value.wl.push(info)
                        }
                    } else if (is === "pd") {
                        const exists = wsstocksdata.value.pd.some(o => o.token === item.token)
                        if (!exists) {
                            wsstocksdata.value.pd.push(info)
                        }
                    } else if (is === "ssd-pd") {
                        // Store indices subscriptions in ssdpd array (persistent)
                        const exists = wsstocksdata.value.ssdpd.some(o => o.token === item.token)
                        if (!exists) {
                            wsstocksdata.value.ssdpd.push(info)
                            }
                    }

                    // Add to tok if not already there
                    const tokExists = wsstocksdata.value.tok.some(o => o.token === item.token)
                    if (!tokExists) {
                        wsstocksdata.value.tok.push(info)
                    }

                    // Add to rawdata if not present
                    const rawExists = wsstocksdata.value.rawdata.some(o => o.token === item.token)
                    if (!rawExists) {
                        wsstocksdata.value.rawdata.push(info)
                    }
                }
            })
        }

        // Call the WebSocket subscription function
        setWebsocket(flow, data, is)
    }

    // Set WebSocket subscription (calls the actual WebSocket stream functions)
    const setWebsocket = async (flow, data, is) => {
        const wsstat = sessionStorage.getItem("wsstat")

        
        // If WebSocket not ready, queue the subscription for later
        if (wsstat !== "Ok" || !isWebSocketReady) {
            pendingSubscriptions.push({ flow, data, is })
            return
        }

        
        try {
            // Dynamically import to avoid circular dependencies
            const { subscribeOnStream, websocketUnsubscriptionChain } = await import('../components/mixins/webSocketstream.js')

            if (flow === "sub") {
                // Subscribe to WebSocket stream
                if (Array.isArray(data) && data.length > 0) {
                    // Update the global token list
                    data.forEach(item => {
                        if (item && item.token && item.exch) {
                            const exists = wsstocksdata.value.tok.some(
                                t => t.token === item.token && t.exch === item.exch
                            )
                            if (!exists) {
                                wsstocksdata.value.tok.push(item)
                            }
                        }
                    })

                    // Transform data structure to match what subscribeOnStream expects
                    const transformedData = data.flat(1).map(item => ({
                        exchange: item.exch,  // Transform 'exch' to 'exchange'
                        token: item.token,
                        name: item.tsym || item.name,
                        tsym: item.tsym
                    }))

                    // Subscribe each symbol individually with a unique ID to avoid overwriting subscriptions
                    // This is necessary because guidToSubscription map can only store one channelString per subscribeUID
                    transformedData.forEach((symbol, index) => {
                        const subscribeUID = `wsstore-${is}-${symbol.token}-${Date.now()}-${index}`
                        subscribeOnStream(
                            [symbol],  // Subscribe one at a time
                            undefined,
                            optionChainDataParse,
                            subscribeUID,  // Unique ID for each subscription
                            undefined,
                            undefined,
                            'quotes'
                        )
                    })
                    }
            } else if (flow === "unsub") {
                // Unsubscribe from WebSocket stream
                if (Array.isArray(data) && data.length > 0) {
                    // Remove from global token list
                    data.forEach(item => {
                        if (item && item.token && item.exch) {
                            const index = wsstocksdata.value.tok.findIndex(
                                t => t.token === item.token && t.exch === item.exch
                            )
                            if (index > -1) {
                                wsstocksdata.value.tok.splice(index, 1)
                            }
                        }
                    })

                    // Build unsubscribe list in format "exch|token#exch|token#"
                    let unsubscribeList = ""
                    data.forEach((symbol) => {
                        unsubscribeList += `${symbol.exch}|${symbol.token}#`
                    })

                    // Unsubscribe from the stream
                    await websocketUnsubscriptionChain(unsubscribeList)
                }
            }
        } catch (error) {
            console.error("Error in setWebsocket:", error)
        }
    }

    // Parse incoming WebSocket data and dispatch events
    const optionChainDataParse = (data) => {
        if (wsstocksdata.value.tok && wsstocksdata.value.tok.length > 0) {
            // Emit web-scoketConn event with actual data
            const eventData = Array.isArray(data) ? data[0]?.v : data

            // Process data in MarketDataStore
            if (eventData) {
                marketDataStore.processFeed(eventData)
                holdingsStore.updateHoldings(eventData)
            }

            const currentPage = wsstocksdata.value.raw

            // Check message type - identify critical messages
            const messageType = eventData?.t || data?.t
            const isCriticalMessage = messageType === 'o' || messageType === 'om' || messageType === 'ok'

            // Get token for batching (use token or tk field)
            const token = eventData?.token || eventData?.tk || 'unknown'

            if (isCriticalMessage) {
                // CRITICAL MESSAGES - Dispatch immediately, no throttle/batch
                throttler.dispatchCritical(eventData, currentPage)

                // Also dispatch to orders page if not already there
                if (currentPage !== 'orders') {
                    throttler.dispatchCritical(eventData, 'orders')
                }

                throttler.dispatchCritical(eventData, 'watchlist')
            } else {
                // PRICE/QUOTE DATA - Use per-token batching with throttle
                // Add to batch for current page
                throttler.addToBatch(token, eventData, currentPage)

                // Add to batch for orders page if different
                if (currentPage !== 'orders') {
                    throttler.addToBatch(token, eventData, 'orders')
                }

                // Add to batch for watchlist
                throttler.addToBatch(token, eventData, 'watchlist')
            }
        }
    }

    return {
        wsstocksdata,
        handleWebSocketRequest,
        optionChainDataParse,
        isActiveInOtherPages,
        markWebSocketReady,
        resetWebSocketReady,
        flushPendingSubscriptions
    }
})
