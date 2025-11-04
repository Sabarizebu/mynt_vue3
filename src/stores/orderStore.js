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
    },
})


