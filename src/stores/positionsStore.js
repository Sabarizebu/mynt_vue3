import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'

export const usePositionsStore = defineStore('positions', () => {
    // State: Map of positions keyed by `${exchange}|${token}`
    // Using a reactive object for O(1) lookups and deep reactivity
    const positions = reactive({})

    // Helper to generate unique key
    const getKey = (exchange, token) => {
        if (!exchange || !token) return null
        return `${exchange}|${token}`
    }

    /**
     * Initialize positions from API data
     * @param {Array} apiData - List of position objects from API (data.a array)
     */
    const setPositions = (apiData) => {
        if (!Array.isArray(apiData)) return

        apiData.forEach(item => {
            const exchange = item.exch || item.exchange
            const token = item.token
            const key = getKey(exchange, token)

            if (key) {
                if (!positions[key]) {
                    positions[key] = {}
                }

                // 1. Preserve existing critical live data (WebSocket is usually more up-to-date than API snapshot)
                const oldLtp = Number(positions[key].ltp)
                const oldLp = Number(positions[key].lp)

                // 2. Prepare clean object for merge
                const cleanItem = { ...item }

                // 3. Identify incoming LTP from various possible keys
                let newLtp = Number(cleanItem.ltp || cleanItem.lp || cleanItem.l || 0)

                // 4. Decision Logic for LTP
                if (newLtp > 0) {
                    // API has a value.
                    // However, if we ALREADY have a valid live value (oldLtp), we should prefer the live value
                    // because API snapshots are often slightly stale compared to the live WS feed we've been consuming.
                    if (oldLtp > 0) {
                        cleanItem.ltp = oldLtp
                        cleanItem.lp = oldLtp
                    } else if (oldLp > 0) {
                        cleanItem.ltp = oldLp
                        cleanItem.lp = oldLp
                    } else {
                        cleanItem.ltp = newLtp
                        cleanItem.lp = newLtp
                    }
                } else {
                    // API has invalid price (0 or NaN). Definitely keep old value if exists.
                    if (oldLtp > 0) {
                        cleanItem.ltp = oldLtp
                        cleanItem.lp = oldLtp
                    } else if (oldLp > 0) {
                        cleanItem.ltp = oldLp
                        cleanItem.lp = oldLp
                    } else {
                        // If both are invalid, remove the field so we don't explicitly set 0
                        delete cleanItem.ltp
                        delete cleanItem.lp
                        delete cleanItem.l
                    }
                }

                // 5. Merge
                Object.assign(positions[key], cleanItem)

                // 6. Final check: If merge somehow resulted in 0, force restore
                if ((!positions[key].ltp || positions[key].ltp === 0) && oldLtp > 0) {
                    positions[key].ltp = oldLtp
                    positions[key].lp = oldLtp
                }
                if ((!positions[key].lp || positions[key].lp === 0) && oldLp > 0) {
                    positions[key].lp = oldLp
                }

                // 7. Ensure numeric fields are numbers for calculation
                positions[key].netqty = Number(positions[key].netqty || 0)
                positions[key].avgprc = Number(positions[key].avgprc || 0)
                positions[key].prcftr = Number(positions[key].prcftr || 1)

                // 8. Trigger P&L calc
                calculatePnL(positions[key])
            }
        })
    }

    /**
     * Load positions from API
     * @param {Function} apiCall - Async function that returns the positions data
     */
    const loadPositions = async (apiCall) => {
        // If we already have positions, the UI will show them immediately (Stale-While-Revalidate)
        // We just run the API call in background to update

        try {
            const response = await apiCall()
            if (response && response.a && Array.isArray(response.a)) {
                setPositions(response.a)
            }
        } catch (error) {
            console.error("Failed to load positions:", error)
        }
    }

    /**
     * Internal helper to calculate P&L for a position
     */
    const calculatePnL = (position) => {
        const netqty = Number(position.netqty || 0)
        const avgprc = Number(position.avgprc || 0)
        const prcftr = Number(position.prcftr || 1)
        const ltp = Number(position.ltp || position.lp || 0)

        if (ltp > 0 && netqty !== 0) {
            // MTM calculation
            let cmtm = 0
            if (netqty > 0) {
                // Long position
                cmtm = (ltp - avgprc) * netqty * prcftr
            } else {
                // Short position
                cmtm = (avgprc - ltp) * Math.abs(netqty) * prcftr
            }

            position.cmtm = cmtm
            position.urmtom = cmtm

            // Realized P&L (for closed positions)
            if (netqty === 0) {
                const cfbuyqty = Number(position.cfbuyqty || 0)
                const cfsellqty = Number(position.cfsellqty || 0)
                const daybuyqty = Number(position.daybuyqty || 0)
                const daysellqty = Number(position.daysellqty || 0)
                const daybuyavgprc = Number(position.daybuyavgprc || 0)
                const daysellavgprc = Number(position.daysellavgprc || 0)

                if (cfbuyqty != 0) {
                    position.rpnl = daysellavgprc * (daysellqty * prcftr) -
                                   ((cfbuyqty * prcftr) * avgprc +
                                    (daybuyqty * prcftr) * daybuyavgprc)
                } else if (cfsellqty != 0) {
                    position.rpnl = (daysellqty * prcftr) * daysellavgprc +
                                   (cfsellqty * prcftr) * avgprc -
                                   daybuyavgprc * (daybuyqty * prcftr)
                } else {
                    position.rpnl = 0
                }
            }
        }
    }

    /**
     * Update positions with live WebSocket feed
     * @param {Object|Array} feed - WebSocket data packet(s)
     */
    const updatePositions = (feed) => {
        const updates = Array.isArray(feed) ? feed : [feed]

        updates.forEach(update => {
            const exchange = update.exchange || update.exch || update.e
            const token = update.token || update.tk || update.t
            const key = getKey(exchange, token)

            if (key && positions[key]) {
                const position = positions[key]

                // Update LTP - STRICT CHECK: Only update if valid number > 0
                const newLtp = Number(update.lp || update.ltp || update.l)
                if (!isNaN(newLtp) && newLtp > 0) {
                    position.ltp = newLtp
                    position.lp = newLtp
                }

                // Update other real-time fields
                if (update.v !== undefined && update.v !== null) position.v = Number(update.v)
                if (update.oi !== undefined && update.oi !== null) position.oi = Number(update.oi)

                // --- Real-time P&L Calculation ---
                // If we have a valid LTP, recalculate P&L for this position
                if (position.ltp && position.ltp > 0) {
                    calculatePnL(position)
                }
            }
        })
    }

    // --- Getters ---

    // Return positions as an array for v-for loops
    const positionsList = computed(() => Object.values(positions))

    // Portfolio MTM Summary
    const portfolioMTM = computed(() => {
        let totalMTM = 0
        let totalRealizedPnL = 0
        let openPositions = 0
        let closedPositions = 0

        Object.values(positions).forEach(p => {
            const netqty = Number(p.netqty || 0)
            if (netqty !== 0) {
                openPositions++
                totalMTM += (p.cmtm || 0)
            } else {
                closedPositions++
                totalRealizedPnL += (p.rpnl || 0)
            }
        })

        const totalPnL = totalMTM + totalRealizedPnL

        return {
            totalMTM: totalMTM.toFixed(2),
            totalRealizedPnL: totalRealizedPnL.toFixed(2),
            totalPnL: totalPnL.toFixed(2),
            openPositions,
            closedPositions
        }
    })

    return {
        positions,
        positionsList,
        portfolioMTM,
        setPositions,
        updatePositions,
        loadPositions
    }
})
