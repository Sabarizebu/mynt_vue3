import { defineStore } from 'pinia'

export const useMarginsStore = defineStore('margins', {
    state: () => ({
        // Margin values for StatBoard and Funds page
        margins: {
            avbma: 0,        // Available balance to trade
            total: 0,         // Total credits
            marginused: 0,   // Margin used
        },
        // Raw margin data for detailed view
        rawData: null,
    }),
    actions: {
        setMargins(data) {
            // data can be an object with avbma, total, marginused
            // or a limits object with raw fields that need calculation
            if (data && typeof data === 'object') {
                // Store raw data
                this.rawData = data

                // Calculate or use provided values
                let avbma, total, marginused

                const toNumber = (val, def = 0) => {
                    const n = Number(val)
                    return isFinite(n) ? n : def
                }

                if (data.collateral !== undefined || data.cash !== undefined) {
                    // Recalculate from raw fields
                    const collateral = toNumber(data.collateral)
                    const brkcollamt = toNumber(data.brkcollamt)
                    const cash = toNumber(data.cash)
                    const payin = toNumber(data.payin)
                    const daycash = toNumber(data.daycash)
                    marginused = toNumber(data.marginused)

                    // Calculate total: collateral + brkcollamt + cash + payin - |daycash|
                    total = collateral + brkcollamt + cash + payin - Math.abs(daycash)

                    // Calculate avbma: collateral + brkcollamt + cash - marginused + payin - |daycash|
                    avbma = collateral + brkcollamt + cash - marginused + payin - Math.abs(daycash)
                } else {
                    // Use provided computed values
                    avbma = toNumber(data.avbma)
                    total = toNumber(data.total)
                    marginused = toNumber(data.marginused)
                }

                this.margins.avbma = avbma
                this.margins.total = total
                this.margins.marginused = marginused
            }
        },
    },
    getters: {
        // Formatted values for display
        formattedAvbma: (state) => {
            const n = state.margins.avbma
            if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)}Cr`
            if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2)}L`
            if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
            return `${n.toFixed(2)}`
        },
        formattedTotal: (state) => {
            const n = state.margins.total
            if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)}Cr`
            if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2)}L`
            if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
            return `${n.toFixed(2)}`
        },
        formattedMarginused: (state) => {
            const n = state.margins.marginused
            if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(2)}Cr`
            if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(2)}L`
            if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
            return `${n.toFixed(2)}`
        },
    },
})

