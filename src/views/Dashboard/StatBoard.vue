<template>
    <div class="mb-2">
        <v-row>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-3 pb-4 px-1 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;gap: 10px;" class="ml-4">
                        <v-list-item-avatar tile size="24">
                            <img src="@/assets/stocks/holdings.svg" alt="">
                        </v-list-item-avatar>
                        <p class="font-weight-bold fs-18">Holdings</p>
                    </div>

                    <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg px-2 py-3">
                        <div style="display: flex; align-items: center;justify-content: space-between;padding: 0 10px;">
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="holdstatinv">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px;">Invested</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="holdstatval">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px;">Current</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 30%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="holdstatpnlcclr" class="subtext--text">
                                        <span id="holdstatpnl">0.00</span>
                                    </span>
                                    <span class="subtext--text" style="font-size: 14px !important;">
                                        (<span id="holdstatpnlc">0.00</span>%)
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">Total
                                    P&L</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 26%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="holdstatdpnlcclr" class="subtext--text">
                                        <span id="holdstatdpnl">0.00</span>
                                    </span>
                                    <span class="subtext--text" style="font-size: 14px !important;">
                                        (<span id="holdstatdpnlc">0.00</span>%)
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">Today
                                    P&L</v-list-item-subtitle>
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
                    <div class="px-4 pb-2 d-flex justify-start align-center mt-3">
                        <v-chip small class="mr-2" color="success" style="border: 1px solid #43A833;" outlined>
                            <img src="@/assets/stocks/pos-icon.svg" class="mr-1" alt="">
                            <span id="positiveHoldings" class="mr-1">0</span> Positive
                        </v-chip>
                        <v-chip small color="error" style="border: 1px solid #F23645;" outlined>
                            <img src="@/assets/stocks/neg-icon.svg" class="mr-1" alt="">
                            <span id="negativeHoldings" class="mr-1">0</span> Negative
                        </v-chip>
                    </div>
                </v-card>

            </v-col>
            <v-col sm="6" cols="12">
                <v-card class="elevation-0 px-2 pt-3 pb-4 px-1 rounded-0 stat-card rounded">
                    <div style="display: flex; align-items: center;gap: 10px;" class="ml-4">
                        <v-list-item-avatar tile size="20">
                            <img src="@/assets/stocks/position.svg" width="22" alt="">
                        </v-list-item-avatar>
                        <p class="font-weight-bold fs-18">Position </p>
                    </div>

                    <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg px-2 py-3">

                        <div style="display: flex; align-items: center;justify-content: space-between;padding: 0 10px;">
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="poststatval">0.00</span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">Trade
                                    value</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 22%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="poststatmtmclr" class="subtext--text">
                                        <span id="poststatmtm">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">MTM</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 30%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="poststatpnlclr" class="subtext--text">
                                        <span id="poststatpnl">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">Total
                                    P&L</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-content style="max-width: 26%;">
                                <v-list-item-title class="font-weight-medium" style="font-size: 16px !important;">
                                    <span id="poststatopnlclr" class="subtext--text">
                                        <span id="poststatopnl">0.00</span>
                                    </span>
                                </v-list-item-title>
                                <v-list-item-subtitle class="font-weight-regular"
                                    style="font-size: 14px !important;">Open
                                    P&L</v-list-item-subtitle>
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
                    <div class="px-4 pb-2 d-flex justify-start align-center mt-3">
                        <v-chip small class="mr-2" color="success" style="border: 1px solid #43A833;" outlined>
                            <img src="@/assets/stocks/pos-icon.svg" class="mr-1" alt="">
                            <span id="positivePositions" class="mr-1">0</span>Positive
                        </v-chip>
                        <v-chip small color="error" style="border: 1px solid #F23645;" outlined>
                            <img src="@/assets/stocks/neg-icon.svg" class="mr-1" alt="">
                            <span id="negativePositions" class="mr-1">0</span> Negative
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
                                <v-list-item-title class="font-weight-medium"
                                    style="font-size: 18px !important;">Orders</v-list-item-title>
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
                                <div class="text-center cursor-pointer" @click="navigateToOrders('orders', null)">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        {{ orderCounts.open || 0 }}
                                    </p>
                                    <span class="fs-14 font-weight-regular">Open Orders</span>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-center cursor-pointer" @click="navigateToOrders('executed', null)">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        {{ orderCounts.executed || 0 }}
                                    </p>
                                    <span class="fs-14 font-weight-regular">Execute Orders</span>
                                </div>
                            </v-col>
                            <v-col cols="4">
                                <div class="text-center cursor-pointer"
                                    @click="navigateToOrders('executed', 'REJECTED')">
                                    <p class="fs-16 font-weight-bold mb-0">
                                        {{ orderCounts.rejected || 0 }}
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
                                <v-list-item-title class="font-weight-medium"
                                    style="font-size: 18px !important;">Margins</v-list-item-title>
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
                                            <p style="color: black !important;"
                                                :class="['fs-16 font-weight-bold mb-0', margins.avbma < 0 ? 'mainred--text' : 'subtext--text']">
                                                {{ formattedAvbma || 0 }}
                                            </p>
                                            <span class="fs-14 font-weight-regular">Available balance</span>
                                        </div>
                                    </template>
                                    <span>{{ formattedAvbma || 0 }}</span>
                                </v-tooltip>
                            </v-col>
                            <v-col cols="4">
                                <v-tooltip top color="black">
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <p class="fs-16 font-weight-bold mb-0">
                                                {{ formattedTotal || 0 }}
                                            </p>
                                            <span class="fs-14 font-weight-regular">Total credits</span>
                                        </div>
                                    </template>
                                    <span>{{ formattedTotal || 0 }}</span>
                                </v-tooltip>
                            </v-col>
                            <v-col cols="4">
                                <v-tooltip top color="black">
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on" class="text-center">
                                            <p class="fs-16 font-weight-bold mb-0">
                                                {{ formattedMarginused || 0 }}
                                            </p>
                                            <span class="fs-14 font-weight-regular">Margin used</span>
                                        </div>
                                    </template>
                                    <span>{{ formattedMarginused || 0 }}</span>
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
import { onMounted, onBeforeUnmount, nextTick, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { useMarginsStore } from '@/stores/marginsStore'
import { getMHoldings, getMPosotion, getMOrderbook, getMLimits } from '../../components/mixins/getAPIdata'
import { storeToRefs } from 'pinia'

const router = useRouter()
const orderStore = useOrderStore()
const marginsStore = useMarginsStore()
const { orderCounts } = storeToRefs(orderStore)
const { margins } = storeToRefs(marginsStore)

// Computed formatted values for margins
const formattedAvbma = computed(() => marginsStore.formattedAvbma)
const formattedTotal = computed(() => marginsStore.formattedTotal)
const formattedMarginused = computed(() => marginsStore.formattedMarginused)

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
        if (ordersData) {
            // Update store immediately when orders are reloaded
            if (ordersData.stat && Array.isArray(ordersData.stat) && ordersData.stat.length >= 3) {
                orderStore.setOrderCounts(ordersData.stat)
            } else if (ordersData.openorders || ordersData.execorders || ordersData.response) {
                // Calculate counts from order arrays if stat is not available
                const all = ordersData.response || []
                const openorders = ordersData.openorders || all.filter(o => o.way === 'open' || o.status === 'PENDING' || o.status === 'OPEN' || o.status === 'TRIGGER_PENDING')
                const execorders = ordersData.execorders || all.filter(o => o.way !== 'open')
                const openCount = openorders.length
                const execCount = execorders.filter(o => o.status === 'COMPLETE').length
                const rejectedCount = execorders.filter(o => o.status === 'REJECTED' || o.status === 'CANCELED').length
                orderStore.setOrderCounts([openCount, execCount, rejectedCount])
            }
            // Also trigger event handler for consistency
            if (ordersData.stat && Array.isArray(ordersData.stat)) {
                setTimeout(() => { handleTempEvent({ detail: ordersData }) }, 200)
            }
        }

        // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
    } catch (err) {
        // console.error('❌ Error reloading all stats:', err)
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
        // console.log('⏸️ Margin refresh already pending, skipping...')
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
            // console.warn('⚠️ Margin data not OK:', data)
        }
    }).catch(err => {
        // console.error('❌ Error refreshing margins:', err)
    }).finally(() => {
        isRefreshMarginsPending = false
    })
}

const handleTempEvent = (evt) => {
    try {
        const payload = evt?.detail
        if (!payload) return
        if (Array.isArray(payload.response)) {
            // Holdings payload - filter out invalid holdings (zero quantity or missing required fields)
            const validHoldings = (payload.response || []).filter((h) => {
                const netqty = toNumber(h.netqty ?? h.holdqty ?? h.qty);
                // Only include holdings with non-zero quantity and valid token
                return netqty !== 0 && h.token && h.token !== '';
            });

            holdingsList.value = validHoldings;
            holdingIndexByToken = {}
            for (let i = 0; i < holdingsList.value.length; i++) {
                if (holdingsList.value[i].token) {
                    holdingIndexByToken[holdingsList.value[i].token] = i
                }
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
        } else if (payload.stat && Array.isArray(payload.stat)) {
            // Orders payload (has stat array: [open, execute, rejected])
            updateOrdersStats(payload.stat)
            // NOTE: Removed automatic margin refresh - Limits API called only once on initial load
        } else if (payload.avbma !== undefined || payload.total !== undefined || payload.marginused !== undefined || payload.stat === 'Ok') {
            // Margins payload - check for marginused too or stat === 'Ok' from getMLimits
            // Also check if it has any margin-related fields
            if (payload.collateral !== undefined || payload.cash !== undefined || payload.marginused !== undefined) {
                // console.log('📊 Detected margins payload in handleTempEvent:', payload)
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

// Format number exactly like old code's setFormatNumber
const formatMoney = (amt) => {
    const n = toNumber(amt);
    if (n > 9999999) {
        return `${(n / 10000000).toFixed(2)}Cr`;
    } else if (n > 99999) {
        return `${(n / 100000).toFixed(2)}L`;
    } else if (n > 9999) {
        return `${(n / 1000).toFixed(2)}K`;
    } else if (n > 0) {
        return Number(n).toFixed(2);
    }
    if (n < 0) {
        return `-${formatMoney(Math.abs(n))}`;
    }
    return n;
};

// Calculate holdings stats exactly like old code (lines 429-496)
const updateHoldingsStats = (list) => {
    // Filter out invalid holdings (zero quantity, missing token, or invalid data)
    const validList = list.filter((it) => {
        const netqty = toNumber(it.netqty ?? it.holdqty ?? it.qty);
        return netqty !== 0 && it.token && it.token !== '';
    });

    // If no valid holdings, reset everything to zero
    if (validList.length === 0) {
        updateText('holdstatinv', '0.00');
        updateText('holdstatval', '0.00');
        updateText('holdstatpnl', '0.00');
        updateText('holdstatpnlc', '0.00');
        updateText('holdstatdpnl', '0.00');
        updateText('holdstatdpnlc', '0.00');
        updateText('holdingsCount', '0');
        updateText('positiveHoldings', '0');
        updateText('negativeHoldings', '0');

        // Reset colors
        const setColor = (id, val) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.classList.remove('maingreen--text', 'mainred--text', 'subtext--text');
            el.classList.add('subtext--text');
        };
        setColor('holdstatpnlcclr', 0);
        setColor('holdstatdpnlcclr', 0);

        // Reset bars
        nextTick(() => {
            const posBar = document.getElementById('holdstatavdp');
            const negBar = document.getElementById('holdstatavdn');
            if (posBar) posBar.setAttribute("style", `width: 0% !important;`);
            if (negBar) negBar.setAttribute("style", `width: 0% !important;`);
        });
        return;
    }

    // First, ensure each item has inv, curr, pnl, pnlc, d_pnl, d_cpnl fields (like old code)
    const processedList = validList.map((it) => {
        const netqty = toNumber(it.netqty ?? it.holdqty ?? it.qty);
        const netqtyAbs = Math.abs(netqty);
        const upldprc = toNumber(it.upldprc ?? it.avgprc ?? it.uravgprc ?? it.avgprc1);
        const ltp = toNumber(it.ltp ?? it.lp);
        const prevClose = toNumber(it.close ?? it.cp ?? it.prev_close_price ?? it.previous_close);

        // Use upldprc if available and > 0, otherwise use ltp (matching old code line 437)
        const avgPrice = upldprc !== 0 ? upldprc : ltp;

        // Calculate inv and curr exactly like old code (lines 437-438)
        const inv = (avgPrice * netqtyAbs).toFixed(2);
        const curr = (ltp * netqtyAbs).toFixed(2);

        // Calculate pnl and pnlc exactly like old code (lines 440-441)
        const pnl = (Number(curr) - Number(inv)).toFixed(2);
        const pnlc = Number(inv) > 0 ? ((Number(pnl) / Number(inv)) * 100).toFixed(2) : "0.00";

        // Calculate d_pnl and d_cpnl exactly like old code (lines 442-443)
        const d_pnl = ((ltp - prevClose) * netqtyAbs).toFixed(2);
        const d_cpnl = Number(inv) > 0 ? ((Number(d_pnl) / Number(inv)) * 100).toFixed(2) : "0.00";

        return {
            ...it,
            inv: Number(inv),
            curr: Number(curr),
            pnl: Number(pnl),
            pnlc: Number(pnlc),
            d_pnl: Number(d_pnl),
            d_cpnl: Number(d_cpnl)
        };
    });

    // Calculate totals exactly like old code (lines 453-464)
    const stockvalue = processedList.reduce((acc, o) => acc + (Number(o.curr) || 0), 0);
    const invested = processedList.reduce((acc, o) => acc + (Number(o.inv) || 0), 0);
    const totalPnl = processedList.reduce((acc, o) => acc + (Number(o.pnl) || 0), 0);
    const totalDPnl = processedList.reduce((acc, o) => acc + (Number(o.d_pnl) || 0), 0);

    // Format values exactly like old code (lines 454, 456, 459, 463)
    const formattedStockvalue = stockvalue > 0 || stockvalue < 0 ? formatMoney(Math.abs(stockvalue)) : "0.00";
    const formattedInvested = invested > 0 || invested < 0 ? formatMoney(Math.abs(invested)) : "0.00";
    const formattedDPnl = totalDPnl > 0 || totalDPnl < 0 ? Math.abs(totalDPnl).toFixed(2) : "0.00";
    const formattedPnl = totalPnl > 0 || totalPnl < 0 ? formatMoney(Math.abs(totalPnl)) : "0.00";

    // Calculate percentages exactly like old code (lines 460, 464)
    const d_cpnl = totalDPnl > 0 || totalDPnl < 0
        ? ((totalDPnl / invested) * 100).toFixed(2)
        : "0.00";
    const cpnl = totalPnl > 0 || totalPnl < 0
        ? ((totalPnl / invested) * 100).toFixed(2)
        : "0.00";

    // Count positive/negative based on pnlc exactly like old code (lines 450-451)
    const positive = processedList.filter((x) => x.pnlc > 0);
    const negative = processedList.filter((x) => x.pnlc < 0);

    // Update DOM elements exactly like old code (lines 469-488)
    updateText('holdstatinv', formattedInvested);
    updateText('holdstatval', formattedStockvalue);
    updateText('holdstatpnl', formattedPnl);
    updateText('holdstatpnlc', cpnl);
    updateText('holdstatdpnl', formattedDPnl);
    updateText('holdstatdpnlc', d_cpnl);
    updateText('holdingsCount', String(validList.length));
    updateText('positiveHoldings', String(positive.length));
    updateText('negativeHoldings', String(negative.length));

    // Color updates exactly like old code (lines 479-487)
    const setColor = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('maingreen--text', 'mainred--text', 'subtext--text');
        el.classList.add(val > 0 ? 'maingreen--text' : val < 0 ? 'mainred--text' : 'subtext--text');
    };
    setColor('holdstatpnlcclr', Number(cpnl));
    setColor('holdstatdpnlcclr', Number(d_cpnl));

    // Adv/Dec bar calculation exactly like old code (lines 489-494)
    nextTick(() => {
        const totalCount = validList.length;
        const pAdv = totalCount > 0 ? Math.round((positive.length / totalCount) * 100) : 0;
        const nAdv = Math.round(100 - pAdv);
        const posBar = document.getElementById('holdstatavdp');
        const negBar = document.getElementById('holdstatavdn');

        // Update bar widths exactly like old code (line 492-493)
        if (posBar) posBar.setAttribute("style", `width: ${pAdv}% !important;`);
        if (negBar) negBar.setAttribute("style", `width: ${nAdv}% !important;`);

        // Update colors directly via DOM
        if (totalCount > 0) {
            const posBarCards = posBar?.querySelectorAll('.v-card');
            if (posBarCards) {
                posBarCards.forEach((card, idx) => {
                    if (idx % 2 === 0) {
                        card.style.backgroundColor = '#ECF8F1';
                    } else {
                        card.style.backgroundColor = '#43A833';
                    }
                });
            }

            const negBarCards = negBar?.querySelectorAll('.v-card');
            if (negBarCards) {
                negBarCards.forEach((card, idx) => {
                    if (idx % 2 === 0) {
                        card.style.backgroundColor = '#ffcdcd90';
                    } else {
                        card.style.backgroundColor = '#F23645';
                    }
                });
            }
        } else {
            const posBarCards = posBar?.querySelectorAll('.v-card');
            const negBarCards = negBar?.querySelectorAll('.v-card');
            if (posBarCards) {
                posBarCards.forEach((card, idx) => {
                    card.style.backgroundColor = idx % 2 === 0 ? '#F1F3F8' : '#ffffff';
                });
            }
            if (negBarCards) {
                negBarCards.forEach((card, idx) => {
                    card.style.backgroundColor = idx % 2 === 0 ? '#F1F3F8' : '#ffffff';
                });
            }
        }
    });
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
        // Update the store with order counts
        orderStore.setOrderCounts(stat)
    } catch (_) { }
}

const updateMarginsStats = (limits) => {
    try {
        // Update the store with margins data
        marginsStore.setMargins(limits)
    } catch (err) {
        // console.error('❌ Error updating margins stats:', err)
    }
}

let sessionPoll = null
let initialLoaded = false

// Navigate to orders page with appropriate filter
function navigateToOrders(tab, filterType) {
    // Set the filter in the store
    orderStore.setOrderFilter(tab, filterType)
    // Navigate to orders page
    router.push('/orders/book')
}

async function loadAll() {
    if (initialLoaded) return
    initialLoaded = true
    // Trigger API load; handlers will compute once responses arrive
    try {
        const holdingsData = await getMHoldings(true)
        // Always process holdings data, even if empty, to reset display
        if (holdingsData && holdingsData.response && Array.isArray(holdingsData.response)) {
            setTimeout(() => { handleTempEvent({ detail: holdingsData }) }, 200)
        } else {
            // If no data or invalid response, reset to zero
            setTimeout(() => {
                holdingsList.value = []
                holdingIndexByToken = {}
                updateHoldingsStats([])
            }, 200)
        }
    } catch (_) {
        // On error, reset to zero
        holdingsList.value = []
        holdingIndexByToken = {}
        updateHoldingsStats([])
    }

    try {
        const positionData = await getMPosotion(true)
        if (positionData && (positionData.a || positionData.o)) {
            setTimeout(() => { handleTempEvent({ detail: positionData }) }, 200)
        }
    } catch (_) { }

    try {
        const ordersData = await getMOrderbook(true)
        if (ordersData) {
            // Update store immediately when orders are loaded
            if (ordersData.stat && Array.isArray(ordersData.stat) && ordersData.stat.length >= 3) {
                orderStore.setOrderCounts(ordersData.stat)
            } else if (ordersData.openorders || ordersData.execorders || ordersData.response) {
                // Calculate counts from order arrays if stat is not available
                const all = ordersData.response || []
                const openorders = ordersData.openorders || all.filter(o => o.way === 'open' || o.status === 'PENDING' || o.status === 'OPEN' || o.status === 'TRIGGER_PENDING')
                const execorders = ordersData.execorders || all.filter(o => o.way !== 'open')
                const openCount = openorders.length
                const execCount = execorders.filter(o => o.status === 'COMPLETE').length
                const rejectedCount = execorders.filter(o => o.status === 'REJECTED' || o.status === 'CANCELED').length
                orderStore.setOrderCounts([openCount, execCount, rejectedCount])
            }
            // Also trigger event handler for consistency
            if (ordersData.stat && Array.isArray(ordersData.stat)) {
                setTimeout(() => { handleTempEvent({ detail: ordersData }) }, 250)
            }
        }
    } catch (_) { }

    try {
        const marginsData = await getMLimits(false)
        if (marginsData && marginsData.stat === 'Ok') {
            // Update store immediately when margins are loaded
            marginsStore.setMargins(marginsData)
            // Also trigger event handler for consistency
            setTimeout(() => { handleTempEvent({ detail: marginsData }) }, 300)
        }
    } catch (err) {
        // console.error('❌ Error loading initial margins:', err)
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

// Handle websocket ticks exactly like old code's optionChainHoldDataParse (lines 429-497)
const handleWsUpdate = (event) => {
    try {
        const detail = event.detail
        if (!Array.isArray(detail) || detail.length < 1) return
        const data = detail[0]
        const token = data.tk || data.token
        if (!token || holdingIndexByToken[token] == null) return

        const idx = holdingIndexByToken[token]
        const holding = holdingsList.value[idx]
        if (!holding) return

        // Handle MF (Mutual Fund) case exactly like old code (lines 433-436)
        if (holding.exchs === "MF") {
            data["lp"] = holding.quotes && holding.quotes.nav ? holding.quotes.nav : 0;
        }

        // Update raw fields - updateHoldingsStats will recalculate inv, curr, pnl, etc.
        holding.ltp = holding.exchs === "MF" ? Number(data.lp) : Number(data.lp).toFixed(2);

        // Update close price for future calculations
        const prevClose = Number(data.prev_close_price || data.c || data.close);
        if (isFinite(prevClose)) {
            holding.close = prevClose;
            holding.prev_close_price = prevClose;
        }

        // Recalculate stats with updated data (this will recalculate inv, curr, pnl, pnlc, d_pnl, d_cpnl)
        updateHoldingsStats(holdingsList.value)
    } catch (_) { }
}
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.cursor-pointer:hover {
    opacity: 0.7;
}
</style>
