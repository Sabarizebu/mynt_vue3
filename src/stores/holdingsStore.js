import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export const useHoldingsStore = defineStore('holdings', () => {
    // State: Map of holdings keyed by `${exchange}|${token}`
    // Using a reactive object for O(1) lookups and deep reactivity
    const holdings = reactive({})

    // Helper to generate unique key
    const getKey = (exchange, token) => {
        if (!exchange || !token) return null
        return `${exchange}|${token}`
    }

    /**
     * Initialize holdings from API data
     * @param {Array} apiData - List of holding objects from API
     */
    /**
     * Initialize holdings from API data
     * @param {Array} apiData - List of holding objects from API
     */
    const setHoldings = (apiData) => {
        if (!Array.isArray(apiData)) return

        apiData.forEach(item => {
            const exchange = item.exch || item.exchange
            const token = item.token
            const key = getKey(exchange, token)

            if (key) {
                if (!holdings[key]) {
                    holdings[key] = {}
                }

                // 1. Preserve existing critical live data (WebSocket is usually more up-to-date than API snapshot)
                const oldLtp = Number(holdings[key].ltp)
                const oldPc = Number(holdings[key].pc || holdings[key].prev_close)

                // 2. Prepare clean object for merge
                const cleanItem = { ...item }

                // 3. Identify incoming LTP from various possible keys
                // API might send 'ltp', 'lp', 'lastPrice', etc.
                let newLtp = Number(cleanItem.ltp || cleanItem.lp || cleanItem.l || 0)

                // 4. Decision Logic for LTP
                if (newLtp > 0) {
                    // API has a value. 
                    // However, if we ALREADY have a valid live value (oldLtp), we should prefer the live value 
                    // because API snapshots are often slightly stale compared to the live WS feed we've been consuming.
                    // But if oldLtp is invalid/missing, we take the API value.
                    if (oldLtp > 0) {
                        cleanItem.ltp = oldLtp
                    } else {
                        cleanItem.ltp = newLtp
                    }
                } else {
                    // API has invalid price (0 or NaN). Definitely keep old value if exists.
                    if (oldLtp > 0) {
                        cleanItem.ltp = oldLtp
                    } else {
                        // If both are invalid, remove the field so we don't explicitly set 0
                        delete cleanItem.ltp
                        delete cleanItem.lp
                        delete cleanItem.l
                    }
                }

                // 5. Same for Previous Close
                let newPc = Number(cleanItem.pc || cleanItem.prev_close || cleanItem.c || 0)
                if (newPc > 0) {
                    // Prefer existing PC if we have it, or take API if we don't
                    if (oldPc > 0) {
                        cleanItem.pc = oldPc
                        cleanItem.prev_close = oldPc
                    } else {
                        cleanItem.pc = newPc
                        cleanItem.prev_close = newPc
                    }
                } else {
                    if (oldPc > 0) {
                        cleanItem.pc = oldPc
                        cleanItem.prev_close = oldPc
                    } else {
                        delete cleanItem.pc
                        delete cleanItem.prev_close
                        delete cleanItem.c
                    }
                }

                // 6. Merge
                Object.assign(holdings[key], cleanItem)

                // 7. Final check: If merge somehow resulted in 0, force restore
                if ((!holdings[key].ltp || holdings[key].ltp === 0) && oldLtp > 0) {
                    holdings[key].ltp = oldLtp
                }

                // 8. Ensure numeric fields are numbers for calculation
                holdings[key].qty = Number(holdings[key].qty || holdings[key].netqty || 0)
                holdings[key].avgPrice = Number(holdings[key].avgPrice || holdings[key].upldprc || 0)

                // 9. Trigger P&L calc
                calculatePnL(holdings[key])
            }
        })
    }     // Optional: Remove holdings that are no longer in the API response
    // Object.keys(holdings).forEach(k => {
    //     if (!newKeys.has(k)) delete holdings[k]
    // })


    /**
     * Load holdings from API
     * @param {Function} apiCall - Async function that returns the holdings list
     */
    const loadHoldings = async (apiCall) => {
        // If we already have holdings, the UI will show them immediately (Stale-While-Revalidate)
        // We just run the API call in background to update

        try {
            const response = await apiCall()
            if (response) {
                setHoldings(response)
            }
        } catch (error) {
            console.error("Failed to load holdings:", error)
        }
    }

    /**
     * Internal helper to calculate P&L
     */
    const calculatePnL = (holding) => {
        if (holding.ltp) {
            const qty = holding.qty || 0
            const avg = holding.avgPrice || 0

            const currentValue = holding.ltp * qty
            const investedValue = avg * qty

            holding.currentValue = currentValue
            holding.investedValue = investedValue
            holding.pnl = currentValue - investedValue
            holding.pnlPerc = investedValue > 0 ? (holding.pnl / investedValue) * 100 : 0

            // Calculate Day P&L if previous close is available
            if (holding.pc) {
                const dayChange = holding.ltp - holding.pc
                holding.dayPnl = dayChange * qty
                holding.dayPnlPerc = holding.pc > 0 ? (dayChange / holding.pc) * 100 : 0
            }
        }
    }

    /**
     * Update holdings with live WebSocket feed
     * @param {Object|Array} feed - WebSocket data packet(s)
     */
    /**
     * Update holdings with live WebSocket feed
     * @param {Object|Array} feed - WebSocket data packet(s)
     */
    const updateHoldings = (feed) => {
        const updates = Array.isArray(feed) ? feed : [feed]

        updates.forEach(update => {
            const exchange = update.exchange || update.exch || update.e
            const token = update.token || update.tk || update.t
            const key = getKey(exchange, token)

            if (key && holdings[key]) {
                const holding = holdings[key]

                // Deep merge / Update fields
                // We only update what's present in the tick

                // Update LTP - STRICT CHECK: Only update if valid number > 0
                const newLtp = Number(update.lp || update.ltp || update.l)
                if (!isNaN(newLtp) && newLtp > 0) {
                    holding.ltp = newLtp
                }

                // Update Previous Close (if available)
                const newPc = Number(update.pc || update.c || update.prev_close)
                if (!isNaN(newPc) && newPc > 0) {
                    holding.pc = newPc
                }

                // Update Change/Change% (if available)
                if (update.ch !== undefined && update.ch !== null) holding.ch = Number(update.ch)
                if (update.cp !== undefined && update.cp !== null) holding.chp = Number(update.cp)
                if (update.chp !== undefined && update.chp !== null) holding.chp = Number(update.chp)

                // --- Real-time P&L Calculation ---
                // If we have a valid LTP, recalculate P&L for this holding
                if (holding.ltp && holding.ltp > 0) {
                    calculatePnL(holding)
                }
            }
        })
    }

    // --- Getters ---

    // Return holdings as an array for v-for loops
    const holdingsList = computed(() => Object.values(holdings))

    // Total Portfolio Summary
    const portfolioSummary = computed(() => {
        let totalCurrent = 0
        let totalInvested = 0
        let totalDayPnl = 0

        Object.values(holdings).forEach(h => {
            totalCurrent += (h.currentValue || 0)
            totalInvested += (h.investedValue || 0)
            totalDayPnl += (h.dayPnl || 0)
        })

        const totalPnl = totalCurrent - totalInvested
        const totalPnlPerc = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
        const totalDayPnlPerc = totalInvested > 0 ? (totalDayPnl / totalInvested) * 100 : 0 // Approximation

        return {
            totalCurrent: totalCurrent.toFixed(2),
            totalInvested: totalInvested.toFixed(2),
            totalPnl: totalPnl.toFixed(2),
            totalPnlPerc: totalPnlPerc.toFixed(2),
            totalDayPnl: totalDayPnl.toFixed(2),
            totalDayPnlPerc: totalDayPnlPerc.toFixed(2)
        }
    })

    return {
        holdings,
        holdingsList,
        portfolioSummary,
        setHoldings,
        updateHoldings,
        loadHoldings
    }
})
