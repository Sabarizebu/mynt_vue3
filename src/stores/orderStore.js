import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
    state: () => ({
        // Dialog visibility and mode
        orderDialog: false,
        sliceDialog: false,
        isQuickOrder: false,
        isStickyDialog: false,

        // Core order state
        menudata: [], // [0] quote, [1] security, plus flags
        buyOrSellIsSell: false,
        orderType: 0, // 0=Normal, 1=Cover, 2=Bracket, 3=GTT
        investType: 'I', // I, C, M
        priceType: 'LMT', // MKT, LMT, SL-MKT, SL-LMT
        quantity: 0,
        price: 0,
        triggerPrice: 0,
        stopLossPrice: 0,
        targetPrice: 0,
        disclosedQty: 0,
        afterMarket: false,

        // Calculations
        margin: 0,
        orderMargin: 0,
        cashAvailable: 0,
        charges: 0,
        allCharges: null,

        // Loaders
        isPlacingOrder: false,
        isCalculating: false,

        // Order counts [open, executed, rejected]
        orderCounts: [0, 0, 0],

        // Filter settings for navigation
        orderFilterTab: null,
        orderFilterType: null,

        // Order Book Data
        orders: [],
        openOrders: [],
        executedOrders: [],
    }),
    actions: {
        openOrderDialog() {
            this.orderDialog = true
        },
        closeOrderDialog() {
            this.orderDialog = false
            this.sliceDialog = false
            this.menudata = []
            this.isPlacingOrder = false
        },
        setMenudata(data) {
            this.menudata = data
        },
        setPreferences({ quick, sticky }) {
            if (typeof quick === 'boolean') this.isQuickOrder = quick
            if (typeof sticky === 'boolean') this.isStickyDialog = sticky
        },
        setOrderCounts(counts) {
            if (Array.isArray(counts) && counts.length >= 3) {
                this.orderCounts = [counts[0] || 0, counts[1] || 0, counts[2] || 0]
            }
        },
        setOrderFilter(tab, type) {
            this.orderFilterTab = tab
            this.orderFilterType = type
        },
        clearOrderFilter() {
            this.orderFilterTab = null
            this.orderFilterType = null
        },

        // Order Book Actions
        async fetchOrders() {
            this.isCalculating = true
            try {
                // Dynamic import to avoid circular dependencies if any
                const { getMOrderbook } = await import('../components/mixins/getAPIdata.js')
                const res = await getMOrderbook() // No argument to avoid event dispatch

                if (res && res.response) {
                    this.orders = res.response
                    this.openOrders = res.openorders || []
                    this.executedOrders = res.execorders || []
                    if (res.stat) {
                        this.setOrderCounts(res.stat)
                    }
                }
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                this.isCalculating = false
            }
        },

        updateOrderPrice(data) {
            if (!data || !this.orders.length) return

            // Update main orders list
            this.orders.forEach(item => {
                if (item.token == data.tk || item.token == data.token) {
                    if (data.lp || data.ltp) {
                        item.ltp = data.lp || data.ltp
                    }
                    if (data.pc || data.chp) {
                        item.pnlc = data.pc || data.chp
                    }
                }
            })

            // Update open orders list
            this.openOrders.forEach(item => {
                if (item.token == data.tk || item.token == data.token) {
                    if (data.lp || data.ltp) {
                        item.ltp = data.lp || data.ltp
                    }
                    if (data.pc || data.chp) {
                        item.pnlc = data.pc || data.chp
                    }
                }
            })
        },

        async handleOrderUpdate() {
            await this.fetchOrders()
        }
    },
})


