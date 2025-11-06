<template>
    <div class="mb-4">
        <v-row>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-3 pb-4 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;gap: 10px;">
                        <v-list-item-avatar tile size="24">
                            <img src="@/assets/stocks/holdings.svg" alt="">
                        </v-list-item-avatar>
                        <p class="font-weight-bold fs-16">Holdings</p>
                    </div>

                    <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg">
                        <div style="display: flex; align-items: center;justify-content: space-between;padding: 0 10px;">
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="holdstatinv">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Invested</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="holdstatval">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Current</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 30%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="holdstatpnlcclr" class="subtext--text">
                                        <span id="holdstatpnl">0.00</span>
                                    </span>
                                    <span class="fs-14 subtext--text">
                                        (<span id="holdstatpnlc">0.00</span>%)
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Total P&L</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 26%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="holdstatdpnlcclr" class="subtext--text">
                                        <span id="holdstatdpnl">0.00</span>
                                    </span>
                                    <span class="fs-13 subtext--text">
                                        (<span id="holdstatdpnlc">0.00</span>%)
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Today P&L</v-list-item-subtitle>
                            </v-list-item-content>
                        </div>
                    </v-card>
                    <div class="px-4 pt-4 pb-2 d-flex justify-space-between align-center">
                        <p class="subtext--text fs-14 mb-0">No of holdings - <b id="holdingsCount">0</b></p>
                        <v-btn to="/holdings" text class="fs-12 text-none px-0 primary--text" small dense variant="flat"
                            color="0">View
                            details</v-btn>
                    </div>
                    <!-- Adv/Dec bar for Holdings (migrated from Vue 2) -->
                    <div class="px-4">
                        <v-card :disabled="holdingsList.length === 0" class="elevation-0 d-inline-flex"
                            style="width: 100%; background-color: #F1F3F8;">
                            <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                                id="holdstatavdp" style="width: 0%">
                                <div v-for="n in 250" :key="`ph-${n}`">
                                    <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${holdingsList.length === 0 ? '#F1F3F8' : '#ECF8F1'};`"></v-card>
                                    <v-card v-else class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${holdingsList.length === 0 ? '#ffffff' : '#43A833'};`"></v-card>
                                </div>
                            </v-card>
                            <v-card class="elevation-0 rounded-0 crd-trn" style="width: 4px; min-width: 4px;">
                            </v-card>
                            <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                                id="holdstatavdn" style="width: 0%">
                                <div v-for="n in 250" :key="`nh-${n}`">
                                    <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${holdingsList.length === 0 ? '#F1F3F8' : '#ffcdcd90'};`"></v-card>
                                    <v-card v-else class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${holdingsList.length === 0 ? '#ffffff' : '#F23645'};`"></v-card>
                                </div>
                            </v-card>
                        </v-card>
                    </div>
                    <div class="px-4 pb-2 d-flex justify-start align-center">
                        <v-chip small class="mr-2" color="success" outlined>
                            <img src="@/assets/stocks/pos-icon.svg" alt="">
                            <span id="positiveHoldings">0</span> Positive
                        </v-chip>
                        <v-chip small color="error" outlined>
                            <img src="@/assets/stocks/neg-icon.svg" alt="">
                            <span id="negativeHoldings">0</span> Negative
                        </v-chip>
                    </div>
                </v-card>

            </v-col>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-3 pb-4 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;gap: 10px;">
                        <v-list-item-avatar tile size="24">
                            <img src="@/assets/stocks/position.svg" alt="">
                        </v-list-item-avatar>
                        <p class="font-weight-bold fs-16">Position </p>
                    </div>

                    <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg">

                        <div style="display: flex; align-items: center;justify-content: space-between;padding: 0 10px;">
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="poststatval">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Trade
                                    value</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="poststatmtmclr" class="subtext--text">
                                        <span id="poststatmtm">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">MTM</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 30%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="poststatpnlclr" class="subtext--text">
                                        <span id="poststatpnl">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Total P&L</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 26%;">
                                <v-list-item-title class="font-weight-medium fs-16">
                                    <span id="poststatopnlclr" class="subtext--text">
                                        <span id="poststatopnl">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-14 font-weight-regular">Open P&L</v-list-item-subtitle>
                            </v-list-item-content>
                        </div>

                    </v-card>
                    <div class="px-4 pt-4 pb-2 d-flex justify-space-between align-center">
                        <p class="subtext--text fs-14 mb-0">No of positions - <b id="positionsCount">0</b> / Open
                            positions - <b id="openPositionsCount">0</b></p>
                        <v-btn to="/positions" text class="fs-12 text-none px-0 primary--text" small dense
                            variant="flat" color="0">View details</v-btn>
                    </div>
                    <!-- Adv/Dec bar for Positions (migrated from Vue 2) -->
                    <div class="px-4">
                        <v-card :disabled="positionDataList.length === 0" class="elevation-0 d-inline-flex"
                            style="width: 100%; background-color: #F1F3F8;">
                            <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                                id="poststatavdp" style="width: 0%">
                                <div v-for="n in 250" :key="`pp-${n}`">
                                    <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${positionDataList.length === 0 ? '#F1F3F8' : '#ECF8F1'};`"></v-card>
                                    <v-card v-else class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${positionDataList.length === 0 ? '#ffffff' : '#43A833'};`"></v-card>
                                </div>
                            </v-card>
                            <v-card class="elevation-0 rounded-0 crd-trn" style="width: 4px; min-width: 4px;">
                            </v-card>
                            <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                                id="poststatavdn" style="width: 0%">
                                <div v-for="n in 250" :key="`np-${n}`">
                                    <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${positionDataList.length === 0 ? '#F1F3F8' : '#ffcdcd90'};`"></v-card>
                                    <v-card v-else class="elevation-0 rounded-0 py-4"
                                        :style="`width: 4px; min-width: 4px; background-color: ${positionDataList.length === 0 ? '#ffffff' : '#F23645'};`"></v-card>
                                </div>
                            </v-card>
                        </v-card>
                    </div>
                    <div class="px-4 pb-2 d-flex justify-start align-center">
                        <v-chip small class="mr-2" color="success" outlined>
                            <img src="@/assets/stocks/pos-icon.svg" alt="">
                            <span id="positivePositions">0</span>Positive
                        </v-chip>
                        <v-chip small color="error" outlined>
                            <img src="@/assets/stocks/neg-icon.svg" alt="">
                            <span id="negativePositions">0</span> Negative
                        </v-chip>
                    </div>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-1 pb-4 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;justify-content: space-between;">
                        <div style="display: flex; align-items: center;gap: 10px;">
                            <v-list-item-avatar tile size="20">
                                <img src="@/assets/stocks/orders.svg" alt="">
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-18">Orders</v-list-item-title>
                            </v-list-item-content>
                        </div>
                        <v-list-item-content>
                            <v-btn class="ml-auto" to="/orders" icon
                                style="background-color: transparent !important; box-shadow: none !important;color: #0037B7 !important;">
                                <v-icon size="26">mdi-arrow-right</v-icon>
                            </v-btn>
                        </v-list-item-content>
                    </div>
                    <v-card class="elevation-0 card-border py-3 mx-4 mt-2 cardbg">
                        <v-row>
                            <v-col cols="4">
                                <div class="text-center">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        <span id="statorders-0">0</span>
                                    </p>
                                    <span class="fs-14 font-weight-regular">Open Orders</span>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-center">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        <span id="statorders-1">0</span>
                                    </p>
                                    <span class="fs-14 font-weight-regular">Execute Orders</span>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-center">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        <span id="statorders-2">0</span>
                                    </p>
                                    <span class="fs-14 font-weight-regular">Rejected</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-card>
            </v-col>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-1 pb-4 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;justify-content: space-between;">
                        <div style="display: flex; align-items: center;gap: 10px;">
                            <v-list-item-avatar tile size="20">
                                <img src="@/assets/stocks/margin.svg" alt="">
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-18">Margins</v-list-item-title>
                            </v-list-item-content>
                        </div>
                        <v-list-item-content>
                            <v-btn class="ml-auto" to="/funds" icon
                                style="background-color: transparent !important; box-shadow: none !important;color: #0037B7 !important;">
                                <v-icon>mdi-arrow-right</v-icon>
                            </v-btn>
                        </v-list-item-content>
                    </div>
                    <v-card class="elevation-0 card-border py-3 mx-4 mt-2 cardbg">
                        <v-row>
                            <v-col cols="4">
                                <v-tooltip top color="black">
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <p id="statmargins-avbma-clr" class="fs-16 font-weight-bold mb-0">
                                                <span id="statmargins-avbma">0.00</span>
                                            </p>
                                            <span class="fs-14 font-weight-regular">Available balance</span>
                                        </div>
                                    </template>
                                    <span id="statmargins-avbma-tooltip">0.00</span>
                                </v-tooltip>
                            </v-col>
                            <v-col cols="4">
                                <v-tooltip top color="black">
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <p class="fs-16 font-weight-bold mb-0">
                                                <span id="statmargins-total">0.00</span>
                                            </p>
                                            <span class="fs-14 font-weight-regular">Total credits</span>
                                        </div>
                                    </template>
                                    <span id="statmargins-total-tooltip">0.00</span>
                                </v-tooltip>
                            </v-col>
                            <v-col cols="4">
                                <v-tooltip top color="black">
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <p class="fs-16 font-weight-bold mb-0">
                                                <span id="statmargins-marginused">0.00</span>
                                            </p>
                                            <span class="fs-14 font-weight-regular">Margin used</span>
                                        </div>
                                    </template>
                                    <span id="statmargins-marginused-tooltip">0.00</span>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
import { getMHoldings, getMPosotion, getMOrderbook, getMLimits } from '../../components/mixins/getAPIdata'

const holdingsList = ref([])
let holdingIndexByToken = {}
const positionDataList = ref([])

// Debounce/throttle variables for refreshMargins
let refreshMarginsTimeout = null
let isRefreshMarginsPending = false
const REFRESH_MARGINS_DEBOUNCE_MS = 2000 // 2 seconds debounce

// Handle orderbook updates (like old Vue 2 code - calls getStatboardapi which includes margins)
const handleOrderbookUpdate = (evt) => {
    if (evt.detail === 'port-order') {
        // Refresh all stats including margins (like old getStatboardapi)
        reloadAllStats()
    }
}

// Refresh all stats (holdings, positions, orders, margins)
async function reloadAllStats() {
    try {
        // Reload all data
        const [holdingsData, positionData, ordersData] = await Promise.all([
            getMHoldings(true).catch(() => null),
            getMPosotion(true).catch(() => null),
            getMOrderbook(true).catch(() => null)
        ])

        // Process holdings
        if (holdingsData && holdingsData.response && Array.isArray(holdingsData.response) && holdingsData.response.length > 0) {
            setTimeout(() => { handleTempEvent({ detail: holdingsData }) }, 100)
        }

        // Process positions
        if (positionData && (positionData.a || positionData.o)) {
            setTimeout(() => { handleTempEvent({ detail: positionData }) }, 150)
        }

        // Process orders
        if (ordersData && ordersData.stat && Array.isArray(ordersData.stat)) {
            setTimeout(() => { handleTempEvent({ detail: ordersData }) }, 200)
        }

        // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
    } catch (err) {
        console.error('❌ Error reloading all stats:', err)
    }
}

// Debounced version of refreshMargins to prevent excessive API calls
const refreshMarginsDebounced = () => {
    // Clear existing timeout
    if (refreshMarginsTimeout) {
        clearTimeout(refreshMarginsTimeout)
    }

    // Set new timeout
    refreshMarginsTimeout = setTimeout(() => {
        refreshMargins()
    }, REFRESH_MARGINS_DEBOUNCE_MS)
}

// Refresh margins data (like old getAllmargin function)
const refreshMargins = () => {
    // Prevent concurrent API calls
    if (isRefreshMarginsPending) {
        console.log('⏸️ Margin refresh already pending, skipping...')
        return
    }

    isRefreshMarginsPending = true
    getMLimits(false).then(data => {
        // console.log('📊 Margin API response:', data)
        if (data && data.stat === 'Ok') {
            // console.log('📊 Margin data received:', {
            //     avbma: data.avbma,
            //     total: data.total,
            //     marginused: data.marginused,
            //     cash: data.cash,
            //     collateral: data.collateral,
            //     brkcollamt: data.brkcollamt
            // })
            // Trigger the event handler which will call updateMarginsStats
            handleTempEvent({ detail: data })
        } else {
            console.warn('⚠️ Margin data not OK:', data)
        }
    }).catch(err => {
        console.error('❌ Error refreshing margins:', err)
    }).finally(() => {
        isRefreshMarginsPending = false
    })
}

const handleTempEvent = (evt) => {
    try {
        const payload = evt?.detail
        if (!payload) return
        if (Array.isArray(payload.response)) {
            // Holdings payload
            holdingsList.value = payload.response || []
            holdingIndexByToken = {}
            for (let i = 0; i < holdingsList.value.length; i++) {
                holdingIndexByToken[holdingsList.value[i].token] = i
            }
            updateHoldingsStats(holdingsList.value)
            // Subscribe to WS for live lp updates
            if (holdingsList.value.length) {
                try {
                    const ev = new CustomEvent('web-scoketOn', {
                        detail: { flow: 'sub', data: holdingsList.value, is: 'stat-hold', page: 'stocks' }
                    })
                    window.dispatchEvent(ev)
                } catch (_) { }
            }
        } else if (payload.a || payload.o) {
            // Positions payload
            updatePositionsStats(payload)
            // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
        } else if (payload.stat) {
            // Orders payload (has stat array: [open, execute, rejected])
            updateOrdersStats(payload.stat)
            // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
        } else if (payload.avbma !== undefined || payload.total !== undefined || payload.marginused !== undefined || payload.stat === 'Ok') {
            // Margins payload - check for marginused too or stat === 'Ok' from getMLimits
            // Also check if it has any margin-related fields
            if (payload.collateral !== undefined || payload.cash !== undefined || payload.marginused !== undefined) {
                console.log('📊 Detected margins payload in handleTempEvent:', payload)
                updateMarginsStats(payload)
            }
        }
    } catch (_) { }
}

const toNumber = (val, def = 0) => {
    const n = Number(val)
    return isFinite(n) ? n : def
}

const updateText = (id, text) => {
    const el = document.getElementById(id)
    if (el) el.innerText = text
}

const formatMoney = (amt) => {
    const n = toNumber(amt);
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
    if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(2)}K`;
    return `₹${n.toFixed(2)}`;
};

const updateHoldingsStats = (list) => {
    let invested = 0
    let current = 0
    let totalPnl = 0
    let totalPnlPct = 0
    let dayPnl = 0
    let dayPnlPct = 0
    let posCount = 0
    let negCount = 0

    for (const it of list) {
        const qty = toNumber(it.netqty ?? it.holdqty ?? it.qty)
        const avg = toNumber(it.avgprc ?? it.uravgprc ?? it.avgprc1)
        const ltp = toNumber(it.ltp ?? it.lp)
        const close = toNumber(it.close ?? it.cp ?? it.prev_close_price)

        invested += qty * avg
        current += qty * ltp
        const pnl = qty * (ltp - avg)
        totalPnl += pnl
        // daily change by close
        const dpnl = qty * (ltp - close)
        dayPnl += dpnl
        if (ltp - close > 0) posCount++
        else if (ltp - close < 0) negCount++
    }

    totalPnlPct = invested > 0 ? (totalPnl / invested) * 100 : 0
    dayPnlPct = current - dayPnl > 0 ? (dayPnl / (current - dayPnl)) * 100 : 0

    updateText('holdstatinv', formatMoney(invested))
    updateText('holdstatval', formatMoney(current))
    updateText('holdstatpnl', formatMoney(totalPnl))
    updateText('holdstatpnlc', toNumber(totalPnlPct).toFixed(2))
    updateText('holdstatdpnl', formatMoney(dayPnl))
    updateText('holdstatdpnlc', toNumber(dayPnlPct).toFixed(2))
    updateText('holdingsCount', String(list.length))
    updateText('positiveHoldings', String(posCount))
    updateText('negativeHoldings', String(negCount))

    // color updates
    const setColor = (id, val) => {
        const el = document.getElementById(id)
        if (!el) return
        el.classList.remove('maingreen--text', 'mainred--text', 'subtext--text')
        el.classList.add(val > 0 ? 'maingreen--text' : val < 0 ? 'mainred--text' : 'subtext--text')
    }
    setColor('holdstatpnlcclr', totalPnl)
    setColor('holdstatdpnlcclr', dayPnl)

    // Adv/Dec bar widths and colors for Holdings (migrated from Vue 2)
    nextTick(() => {
        const totalCount = list.length
        const pAdv = totalCount > 0 ? Math.round((posCount / totalCount) * 100) : 0
        const nAdv = 100 - pAdv
        const posBar = document.getElementById('holdstatavdp')
        const negBar = document.getElementById('holdstatavdn')

        // Update bar widths
        if (posBar) posBar.style.width = `${pAdv}%`
        if (negBar) negBar.style.width = `${nAdv}%`

        // Update colors directly via DOM (fallback to ensure colors show)
        if (totalCount > 0) {
            // Positive bar: update all stripes to green colors
            const posBarCards = posBar?.querySelectorAll('.v-card')
            if (posBarCards) {
                posBarCards.forEach((card, idx) => {
                    if (idx % 2 === 0) {
                        card.style.backgroundColor = '#ECF8F1'
                    } else {
                        card.style.backgroundColor = '#43A833'
                    }
                })
            }

            // Negative bar: update all stripes to red colors
            const negBarCards = negBar?.querySelectorAll('.v-card')
            if (negBarCards) {
                negBarCards.forEach((card, idx) => {
                    if (idx % 2 === 0) {
                        card.style.backgroundColor = '#ffcdcd90'
                    } else {
                        card.style.backgroundColor = '#F23645'
                    }
                })
            }
        } else {
            // No data: set to background colors
            const posBarCards = posBar?.querySelectorAll('.v-card')
            const negBarCards = negBar?.querySelectorAll('.v-card')
            if (posBarCards) {
                posBarCards.forEach((card, idx) => {
                    card.style.backgroundColor = idx % 2 === 0 ? '#F1F3F8' : '#ffffff'
                })
            }
            if (negBarCards) {
                negBarCards.forEach((card, idx) => {
                    card.style.backgroundColor = idx % 2 === 0 ? '#F1F3F8' : '#ffffff'
                })
            }
        }

        // console.log('📊 Holdings Adv/Dec Bar updated:', {
        //     totalCount,
        //     posCount,
        //     negCount,
        //     pAdv: `${pAdv}%`,
        //     nAdv: `${nAdv}%`
        // })
    })
}

const updatePositionsStats = (posPayload) => {
    try {
        const all = Array.isArray(posPayload.a) ? posPayload.a : []
        const open = Array.isArray(posPayload.o) ? posPayload.o : []

        // Store position data list for template reactivity
        positionDataList.value = all

        let tradeValue = 0
        let mtm = 0
        let totalPnl = 0
        let openPnl = 0
        let posCount = 0
        let negCount = 0

        for (const p of all) {
            const qty = toNumber(p.netqty)
            const avg = toNumber(p.avgprc ?? p.netavgprc ?? p.dayavgprc)
            const lp = toNumber(p.lp ?? p.ltp)
            const rpnl = toNumber(p.crpnl ?? p.rpnl)

            tradeValue += Math.abs(qty) * avg
            if (lp > 0 && avg > 0 && qty !== 0) {
                mtm += (lp - avg) * qty
            }
            totalPnl += rpnl

            // Count positive/negative based on rpnl (like old code)
            if (rpnl > 0) posCount++
            else if (rpnl < 0) negCount++
        }

        for (const p of open) {
            const qty = toNumber(p.netqty)
            const avg = toNumber(p.avgprc ?? p.netavgprc ?? p.dayavgprc)
            const lp = toNumber(p.lp ?? p.ltp)
            if (lp > 0 && avg > 0 && qty !== 0) {
                openPnl += (lp - avg) * qty
            }
        }

        updateText('poststatval', formatMoney(tradeValue))
        updateText('poststatmtm', formatMoney(mtm))
        updateText('poststatpnl', formatMoney(totalPnl))
        updateText('poststatopnl', formatMoney(openPnl))
        updateText('positionsCount', String(all.length))
        updateText('openPositionsCount', String(open.length))
        updateText('positivePositions', String(posCount))
        updateText('negativePositions', String(negCount))

        const setColor = (id, val) => {
            const el = document.getElementById(id)
            if (!el) return
            el.classList.remove('maingreen--text', 'mainred--text', 'subtext--text')
            el.classList.add(val > 0 ? 'maingreen--text' : val < 0 ? 'mainred--text' : 'subtext--text')
        }
        setColor('poststatmtmclr', mtm)
        setColor('poststatpnlclr', totalPnl)
        setColor('poststatopnlclr', openPnl)

        // Adv/Dec bar widths for Positions (migrated from Vue 2)
        nextTick(() => {
            const totalCount = all.length
            const pAdv = totalCount > 0 ? Math.round((posCount / totalCount) * 100) : 0
            const nAdv = 100 - pAdv
            const posBar = document.getElementById('poststatavdp')
            const negBar = document.getElementById('poststatavdn')

            if (posBar) posBar.style.width = `${pAdv}%`
            if (negBar) negBar.style.width = `${nAdv}%`
        })
    } catch (_) { }
}

const updateOrdersStats = (stat) => {
    try {
        if (!Array.isArray(stat) || stat.length < 3) return
        updateText('statorders-0', String(stat[0] || 0))
        updateText('statorders-1', String(stat[1] || 0))
        updateText('statorders-2', String(stat[2] || 0))
    } catch (_) { }
}

const updateMarginsStats = (limits) => {
    try {
        console.log('📊 Updating margins stats with limits:', limits)

        // Always recalculate from raw fields if they exist (more reliable)
        // This matches the logic in getMLimits
        let avbma, total, marginused

        if (limits.collateral !== undefined || limits.cash !== undefined) {
            // Recalculate from raw fields (like getMLimits does)
            const collateral = toNumber(limits.collateral)
            const brkcollamt = toNumber(limits.brkcollamt)
            const cash = toNumber(limits.cash)
            const payin = toNumber(limits.payin)
            const daycash = toNumber(limits.daycash)
            marginused = toNumber(limits.marginused)

            // Calculate total: collateral + brkcollamt + cash + payin - |daycash|
            total = collateral + brkcollamt + cash + payin - Math.abs(daycash)

            // Calculate avbma: collateral + brkcollamt + cash - marginused + payin - |daycash|
            avbma = collateral + brkcollamt + cash - marginused + payin - Math.abs(daycash)

            console.log('📊 Calculated from raw fields:', {
                collateral, brkcollamt, cash, payin, daycash, marginused,
                calculated: { avbma, total, marginused }
            })
        } else {
            // Fallback to provided computed values
            avbma = toNumber(limits.avbma)
            total = toNumber(limits.total)
            marginused = toNumber(limits.marginused)
            console.log('📊 Using provided computed values:', { avbma, total, marginused })
        }

        console.log('📊 Final margin values:', { avbma, total, marginused })

        // Use nextTick to ensure DOM is ready
        nextTick(() => {
            updateText('statmargins-avbma', formatMoney(avbma))
            updateText('statmargins-total', formatMoney(total))
            updateText('statmargins-marginused', formatMoney(marginused))

            // Update tooltips with full precision
            const tooltipElAvbma = document.getElementById('statmargins-avbma-tooltip')
            if (tooltipElAvbma) tooltipElAvbma.innerText = formatMoney(avbma)
            const tooltipElTotal = document.getElementById('statmargins-total-tooltip')
            if (tooltipElTotal) tooltipElTotal.innerText = formatMoney(total)
            const tooltipElMargin = document.getElementById('statmargins-marginused-tooltip')
            if (tooltipElMargin) tooltipElMargin.innerText = formatMoney(marginused)

            // Update color for available balance (negative = red)
            const avbmaEl = document.getElementById('statmargins-avbma-clr')
            if (avbmaEl) {
                avbmaEl.classList.remove('mainred--text', 'subtext--text')
                avbmaEl.classList.add(avbma < 0 ? 'mainred--text' : 'subtext--text')
            }

            console.log('✅ Margins updated successfully in DOM')
        })
    } catch (err) {
        console.error('❌ Error updating margins stats:', err)
    }
}

let sessionPoll = null
let initialLoaded = false

async function loadAll() {
    if (initialLoaded) return
    initialLoaded = true
    // Trigger API load; handlers will compute once responses arrive
    try {
        const holdingsData = await getMHoldings(true)
        if (holdingsData && holdingsData.response && Array.isArray(holdingsData.response) && holdingsData.response.length > 0) {
            setTimeout(() => { handleTempEvent({ detail: holdingsData }) }, 200)
        }
    } catch (_) { }

    try {
        const positionData = await getMPosotion(true)
        if (positionData && (positionData.a || positionData.o)) {
            setTimeout(() => { handleTempEvent({ detail: positionData }) }, 200)
        }
    } catch (_) { }

    try {
        const ordersData = await getMOrderbook(true)
        if (ordersData && ordersData.stat && Array.isArray(ordersData.stat)) {
            setTimeout(() => { handleTempEvent({ detail: ordersData }) }, 250)
        }
    } catch (_) { }

    try {
        const marginsData = await getMLimits(false)
        console.log('📊 Initial margin load:', marginsData)
        if (marginsData && marginsData.stat === 'Ok') {
            // Call updateMarginsStats directly to ensure it updates
            updateMarginsStats(marginsData)
            // Also trigger event handler for consistency
            setTimeout(() => { handleTempEvent({ detail: marginsData }) }, 300)
        }
    } catch (err) {
        console.error('❌ Error loading initial margins:', err)
    }
}

// Store handler references for cleanup
const statboardEventHandler = () => {
    reloadAllStats()
}
const positionUpdateHandler = () => {
    // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
}
const fundsUpdateHandler = () => {
    // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
}

onMounted(async () => {
    // Set up listeners FIRST before calling APIs
    window.addEventListener('tempdata-update', handleTempEvent)
    window.addEventListener('web-scoketConn', handleWsUpdate)
    window.addEventListener('orderbook-update', handleOrderbookUpdate)
    // Listen for statboard refresh event (like old Vue 2 code)
    window.addEventListener('statboard-event', statboardEventHandler)
    // Listen for position updates that might affect margins
    window.addEventListener('position-update', positionUpdateHandler)
    // Listen for fund/balance updates
    window.addEventListener('funds-update', fundsUpdateHandler)

    // Small delay to ensure listeners are registered
    await new Promise(resolve => setTimeout(resolve, 100))

    // If session is ready, load immediately; else poll briefly until ready
    const uid = sessionStorage.getItem('userid')
    const tok = sessionStorage.getItem('msession')
    if (uid && tok) {
        loadAll()
        // NOTE: Removed automatic 30-second interval refresh - Limits API called only once on initial load
    } else {
        let tries = 0
        sessionPoll = setInterval(() => {
            tries++
            const u = sessionStorage.getItem('userid')
            const t = sessionStorage.getItem('msession')
            if (u && t) {
                clearInterval(sessionPoll)
                sessionPoll = null
                loadAll()
                // NOTE: Removed automatic 30-second interval refresh - Limits API called only once on initial load
            } else if (tries > 40) { // ~12s max
                clearInterval(sessionPoll)
                sessionPoll = null
            }
        }, 300)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('tempdata-update', handleTempEvent)
    window.removeEventListener('web-scoketConn', handleWsUpdate)
    window.removeEventListener('orderbook-update', handleOrderbookUpdate)
    window.removeEventListener('statboard-event', statboardEventHandler)
    window.removeEventListener('position-update', positionUpdateHandler)
    window.removeEventListener('funds-update', fundsUpdateHandler)
    if (sessionPoll) clearInterval(sessionPoll)
    // Clear debounce timeout
    if (refreshMarginsTimeout) {
        clearTimeout(refreshMarginsTimeout)
        refreshMarginsTimeout = null
    }
})

// Handle websocket ticks to refresh holdings totals using latest lp
const handleWsUpdate = (event) => {
    try {
        const detail = event.detail
        if (!Array.isArray(detail) || detail.length < 1) return
        const data = detail[0]
        const token = data.tk || data.token
        if (!token || holdingIndexByToken[token] == null) return

        const idx = holdingIndexByToken[token]
        const ltp = Number(data.lp || data.ltp)
        const prev = Number(data.c || data.prev_close_price)
        if (isFinite(ltp) && holdingsList.value[idx]) holdingsList.value[idx].ltp = ltp
        if (isFinite(prev) && holdingsList.value[idx]) holdingsList.value[idx].close = prev
        updateHoldingsStats(holdingsList.value)
    } catch (_) { }
}
</script>
