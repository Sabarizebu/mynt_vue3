// WebSocket Event Bus - Replacement for Vue 2 eventBus for WebSocket events
// This provides a global event system for WebSocket-related communications

class WebSocketEventBus {
    constructor() {
        this.listeners = new Map();
        this.wsstocksdata = {
            raw: null,
            rawdata: [],
            wl: [],
            pd: [],
            tok: []
        };
    }

    // Subscribe to events (similar to eventBus.$on)
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    // Unsubscribe from events (similar to eventBus.$off)
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Emit events (similar to eventBus.$emit)
    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in WebSocket event listener for ${event}:`, error);
                }
            });
        }
        
        // Also dispatch as DOM event for components using addEventListener
        // For web-scoketConn, maintain the old format with multiple parameters
        const customEvent = new CustomEvent(event, {
            detail: args
        });
        window.dispatchEvent(customEvent);
    }

    // Handle WebSocket subscription requests (similar to old LayoutSrc.vue logic)
    handleWebSocketRequest(flow, data, is, page) {

        // For unsubscribe requests, check if the data is still needed elsewhere
        // CRITICAL: Ensure data is an array before calling filter
        if (flow === "unsub" && data && Array.isArray(data) && data.length > 0) {
            const filteredData = data.filter(item => {
                if (item && item.token && item.exch) {
                    return !this.isActiveInOtherPages(page, item.token, item.exch);
                }
                return true; // Keep items without token/exch (shouldn't happen)
            });

            // Only proceed with unsubscribe if there's data to unsubscribe
            if (filteredData.length > 0) {
                this.setWebsocket(flow, filteredData, is);
            }
            return; // Exit early
        }

        // Unsubscribe if page is different and not watchlist
        if (
            this.wsstocksdata.raw !== null &&
            this.wsstocksdata.raw !== page &&
            page !== "watchlist" &&
            flow !== "unsub" // Don't unsubscribe everything when a specific component is just unsubscribing its own data
        ) {
            if (
                this.wsstocksdata.rawdata?.length > 0 &&
                is !== "wl" &&
                is !== "pd"
            ) {
                // Filter out tokens that are still needed by other components
                const tokensToUnsubscribe = this.wsstocksdata.rawdata.filter(item => {
                    if (item && item.token && item.exch) {
                        return !this.isActiveInOtherPages(page, item.token, item.exch);
                    }
                    return true; // Keep items without token/exch (shouldn't happen)
                });

                if (tokensToUnsubscribe.length > 0) {
                    this.setWebsocket("unsub", tokensToUnsubscribe, "is");
                }

                this.wsstocksdata.rawdata = [];
                this.wsstocksdata.raw = page;
            }
        } else if (page !== "watchlist") {
            this.wsstocksdata.raw = page;
        }

        // For subscribe requests, register and proceed
        // CRITICAL: Ensure data is an array before calling forEach
        if (flow === "sub" && data && Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                if (item && item.token && item.exch) {
                    // Add to appropriate collections based on the 'is' parameter
                    const info = { exch: item.exch, token: item.token, tsym: item.tsym };

                    // Add to wl or pd if applicable
                    if (is === "wl" || is === "pd") {
                        // Check if already exists to avoid duplicates
                        const exists = this.wsstocksdata[is].some(o => o.token === item.token);
                        if (!exists) {
                            this.wsstocksdata[is].push(info);
                        }

                        // Add to tok if not already there
                        const tokExists = this.wsstocksdata.tok.some(o => o.token === item.token);
                        if (!tokExists) {
                            this.wsstocksdata.tok.push(info);
                        }
                    }

                    // Add to rawdata if not present
                    const rawExists = this.wsstocksdata.rawdata.some(o => o.token === item.token);
                    if (!rawExists) {
                        this.wsstocksdata.rawdata.push(info);
                    }
                }
            });

            this.setWebsocket(flow, data, is);
        } else if (flow === "sub") {
            // Emit connection event for empty subscribe requests
            this.emit("web-scoketConn");
        }
    }

    // Placeholder for WebSocket manager functionality
    isActiveInOtherPages(currentPage, token, exch) {
        // This would need to be implemented based on your WebSocketManager logic
        // For now, return false to allow unsubscription
        return false;
    }

    // Method to trigger WebSocket connection events for components
    triggerWebSocketConnection(data, page) {
        
        // Dispatch custom event for components listening to web-scoketConn
        const event = new CustomEvent('web-scoketConn', {
            detail: [data, page]
        })
        window.dispatchEvent(event)
    }

    // Set WebSocket subscription (similar to old LayoutSrc.vue setWebsocket method)
    async setWebsocket(flow, data, is) {
        
        const wsstat = sessionStorage.getItem("wsstat");
        if (wsstat == "Ok") {
            // Import WebSocket functions dynamically to avoid circular dependencies
            try {
                const { subscribeOnStream, unsubscribeFromStream } = await import('../components/mixins/webSocketstream.js');
                
                if (flow == "sub") {
                    // Transform data structure to match what subscribeOnStream expects
                    const transformedData = data.flat(1).map(item => ({
                        exchange: item.exch,  // Transform 'exch' to 'exchange'
                        token: item.token,
                        name: item.tsym || item.name,
                        tsym: item.tsym
                    }));
                    
                    
                    // Subscribe using the subscribeOnStream method with callback
                    subscribeOnStream(transformedData, undefined, this.optionChainDataParse.bind(this), undefined, undefined, undefined, 'quotes');
                } else if (flow == "unsub") {
                    // Build unsubscribe list
                    let unsubscribeList = "";
                    data.map((symbol) => {
                        return (unsubscribeList += `${symbol.exch}|${symbol.token}#`);
                    });
                    
                    const { websocketUnsubscriptionChain } = await import('../components/mixins/webSocketstream.js');
                    await websocketUnsubscriptionChain(unsubscribeList);
                }
            } catch (error) {
                console.error("Error in WebSocket subscription:", error);
            }
        } else {
            // Retry if WebSocket not ready
            setTimeout(() => {
                this.setWebsocket(flow, data, is);
            }, 1000);
        }
    }

    // WebSocket data parsing callback (similar to old LayoutSrc.vue optionChainDataParse)
    optionChainDataParse(data) {
        
        // Handle different data formats (like old LayoutSrc.vue line 838-841)
        let eventData = null;
        
        if (Array.isArray(data)) {
            // Handle array format - extract the actual quote data (like old code: data[0].v)
            eventData = data[0]?.v || data[0] || data;
        } else if (data?.v) {
            // Handle wrapped format
            eventData = data.v;
        } else {
            // Handle direct format
            eventData = data;
        }
        
        // Emit web-scoketConn event with the current page (like old LayoutSrc.vue line 840)
        // Old code: eventBus.$emit("web-scoketConn", data[0].v, this.wsstocksdata.raw);
        if (eventData && this.wsstocksdata && this.wsstocksdata.tok && this.wsstocksdata.rawdata) {
            const currentPage = this.wsstocksdata.raw;
            const token = eventData.token || eventData.tk;
            
            // Emit for the current page (like old code)
            if (currentPage) {
                const event = new CustomEvent('web-scoketConn', {
                    detail: [eventData, currentPage]
                });
                window.dispatchEvent(event);
                
                // Also emit through the event bus
                this.emit("web-scoketConn", eventData, currentPage);
            }
            
            // Also emit for watchlist (backward compatibility)
            const watchlistEvent = new CustomEvent('web-scoketConn', {
                detail: [eventData, 'watchlist']
            });
            window.dispatchEvent(watchlistEvent);
        } else if (eventData) {
            // Fallback: emit for watchlist if no page is tracked
            const event = new CustomEvent('web-scoketConn', {
                detail: [eventData, 'watchlist']
            });
            window.dispatchEvent(event);
        }
    }
}

// Create singleton instance
const webSocketEventBus = new WebSocketEventBus();

// Set up global event listener for web-scoketOn events
window.addEventListener('web-scoketOn', (event) => {
    const { flow, data, is, page } = event.detail;
    webSocketEventBus.handleWebSocketRequest(flow, data, is, page);
});

export default webSocketEventBus;

// Legacy Event Bus Adapter — support eventBus.$emit for 'web-scoketOn'
if (typeof window !== 'undefined') {
  window.eventBus = window.eventBus || {};
  window.eventBus.$emit = function(event, ...args) {
    if (event === 'web-scoketOn') {
      const detail = Array.isArray(args[0])
        ? args[0]
        : (typeof args[0] === 'object' ? args[0] : { flow: args[0], data: args[1], is: args[2], page: args[3] });
      window.dispatchEvent(new CustomEvent('web-scoketOn', { detail }));
    }
    // optionally add more event types here
  };
}
