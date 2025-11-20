import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMarketDataStore } from './marketDataStore'
import { useHoldingsStore } from './holdingsStore'

export const useWebsocketStore = defineStore('websocket', () => {
    // WebSocket subscription data state
    const marketDataStore = useMarketDataStore()
    const holdingsStore = useHoldingsStore()

    const wsstocksdata = ref({
        raw: null,        // current page
        rawdata: [],      // current page data
        wl: [],           // watchlist data
        pd: [],           // positions data
        tok: []           // all subscribed tokens
    })

    // Check if a token is active in other pages (watchlist or positions)
    const isActiveInOtherPages = (currentPage, token, exch) => {
        // Check if in watchlist
        const isInWatchlist = wsstocksdata.value.wl.some(
            item => item.token === token && item.exch === exch
        )

        // Check if in positions
        const isInPositions = wsstocksdata.value.pd.some(
            item => item.token === token && item.exch === exch
        )

        return isInWatchlist || isInPositions
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

        // Unsubscribe if page is different and not watchlist
        if (
            wsstocksdata.value.raw !== null &&
            wsstocksdata.value.raw !== page &&
            page !== "watchlist" &&
            flow !== "unsub"
        ) {
            if (
                wsstocksdata.value.rawdata?.length > 0 &&
                is !== "wl" &&
                is !== "pd"
            ) {
                // Filter out tokens that are still needed by other components
                const tokensToUnsubscribe = wsstocksdata.value.rawdata.filter(item => {
                    if (item && item.token && item.exch) {
                        return !isActiveInOtherPages(page, item.token, item.exch)
                    }
                    return true
                })

                if (tokensToUnsubscribe.length > 0) {
                    setWebsocket("unsub", tokensToUnsubscribe, "is")
                }

                wsstocksdata.value.rawdata = []
                wsstocksdata.value.raw = page
            }
        }

        // Update the appropriate data array based on 'is' parameter
        if (is === "wl") {
            wsstocksdata.value.wl = data || []
        } else if (is === "pd") {
            wsstocksdata.value.pd = data || []
        } else {
            wsstocksdata.value.rawdata = data || []
            wsstocksdata.value.raw = page
        }

        // Call the WebSocket subscription function
        setWebsocket(flow, data, is)
    }

    // Set WebSocket subscription (calls the actual WebSocket stream functions)
    const setWebsocket = async (flow, data, is) => {
        const wsstat = sessionStorage.getItem("wsstat")
        if (wsstat !== "Ok") {
            // Retry if WebSocket not ready
            setTimeout(() => {
                setWebsocket(flow, data, is)
            }, 1000)
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

                    // Subscribe to the stream with optionChainDataParse callback
                    subscribeOnStream(
                        transformedData,
                        undefined,
                        optionChainDataParse,
                        undefined,
                        undefined,
                        undefined,
                        'quotes'
                    )
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
        if (wsstocksdata.value.tok && wsstocksdata.value.rawdata) {
            // Emit web-scoketConn event with actual data
            const eventData = Array.isArray(data) ? data[0]?.v : data

            // Process data in MarketDataStore
            if (eventData) {
                marketDataStore.processFeed(eventData)
                holdingsStore.updateHoldings(eventData)
            }

            const currentPage = wsstocksdata.value.raw

            // Dispatch to window for components listening via addEventListener
            const event = new CustomEvent('web-scoketConn', {
                detail: [eventData, currentPage]
            })
            window.dispatchEvent(event)

            // Also dispatch for 'orders' and 'watchlist' pages
            if (currentPage !== 'orders') {
                const ordersEvent = new CustomEvent('web-scoketConn', {
                    detail: [eventData, 'orders']
                })
                window.dispatchEvent(ordersEvent)
            }

            const watchlistEvent = new CustomEvent('web-scoketConn', {
                detail: [eventData, 'watchlist']
            })
            window.dispatchEvent(watchlistEvent)
        }
    }

    return {
        wsstocksdata,
        handleWebSocketRequest,
        optionChainDataParse,
        isActiveInOtherPages
    }
})
