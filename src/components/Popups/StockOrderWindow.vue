<template>
    <div>
        <!-- Slice Order Dialog (minimal scaffold) -->
        <v-dialog v-model="sliceDialog" persistent :scrim="false" width="380px">
            <v-card class="mx-auto py-2 pb-4 text-right rounded-xl elevation-0" color="cardbg" width="100%">
                <v-toolbar class="elevation-0 mb-0" color="transparent" density="compact">
                    <span class="font-weight-bold fs-14">Slice Order</span>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isPlacingOrder" @click="(sliceDialog = false), (orderDialog = true)"
                        color="maintext" size="x-small" variant="outlined" icon>
                        <v-icon color="maintext">mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider class="mb-2"></v-divider>
                <div class="px-4">
                    <v-btn block @click="placeOrder(true)" :loading="isPlacingOrder"
                        :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                        class="text-none rounded-pill elevation-0 white--text px-6" height="40px">
                        {{ buyOrSellIsSell ? 'Sell' : 'Buy' }}
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>

        <!-- Main Order Dialog -->
        <v-card v-if="orderDialog" id="maindiv"
            :class="['pb-5 overflow-hidden rounded-lg', isStickyDialog ? 'sticky-dialog' : '']" :style="dialogStyle"
            color="cardbg" width="540px">
            <v-card id="maindivheader" :loading="isPlacingOrder" class="elevation-0 rounded-b-0 pt-4 pb-2"
                :color="!buyOrSellIsSell ? 'secgreen' : 'secred'">
                <v-toolbar class="elevation-0 crd-trn px-2" density="compact">
                    <v-list-item class="px-0">
                        <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-0">
                            {{ menudata[0]?.tsym || '' }} <span class="ml-1 subtext--text fs-10">{{ menudata[0]?.exch ||
                                '' }}</span>
                        </v-list-item-title>
                        <v-list-item-title class="maintext--text font-weight-bold fs-14 mb-1">₹<span>{{ ltpDisplay
                        }}</span>
                            <span class="fs-12 ml-2" :class="chColor">{{ chDisplay }} ({{ chpDisplay }}%)</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-spacer></v-spacer>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text mr-4 mt-n5"
                        color="maingreen">B</v-card>
                    <v-switch v-model="buyOrSellIsSell" inset></v-switch>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text ml-1 mt-n5"
                        color="mainred">S</v-card>
                </v-toolbar>
            </v-card>

            <div v-if="menudata[0]" style="height: calc(100vh - 320px)" class="overflow-y-auto pos-rlt no-scroll">
                <div class="pt-4 px-6 pb-2">
                    <!-- Order Type Tabs: Regular / Cover / Bracket / GTT / SIP -->
                    <v-tabs v-model="orderType" density="compact" class="mb-2" @update:model-value="onOrderTypeChanged">
                        <v-tab :value="0" class="text-none">Regular</v-tab>
                        <v-tab :value="1" class="text-none">Cover</v-tab>
                        <v-tab :value="2" class="text-none">Bracket</v-tab>
                        <v-tab :value="3" class="text-none">GTT</v-tab>
                        <v-tab v-if="menudata[0]?.exch === 'NSE' || menudata[0]?.exch === 'BSE'" :value="4"
                            class="text-none">SIP</v-tab>
                    </v-tabs>

                    <!-- Investment Type (hidden for SIP and GTT) -->
                    <div v-if="orderType !== 3 && orderType !== 4">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Investment type</p>
                        <v-radio-group @update:model-value="onOrderTypeChanged" v-model="investType" inline
                            hide-details>
                            <v-radio color="maintext" label="Intraday" value="I"></v-radio>
                            <v-radio v-if="menudata[0].exch === 'NSE' || menudata[0].exch === 'BSE'" color="maintext"
                                label="Delivery" value="C"></v-radio>
                            <v-radio v-else color="maintext" label="Carry Forward" value="M"></v-radio>
                        </v-radio-group>
                    </div>

                    <!-- Price Type (hidden for SIP and GTT) -->
                    <div v-if="orderType !== 3 && orderType !== 4">
                        <p class="subtext--text fs-14 font-weight-regular mb-0 mt-2">Select order type</p>
                        <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row>
                            <v-chip value="LMT" :color="priceType === 'LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'LMT' ? 'mainbg' : 'maintext'">
                                Limit
                            </v-chip>
                            <v-chip value="MKT" :color="priceType === 'MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'MKT' ? 'mainbg' : 'maintext'">
                                Market
                            </v-chip>
                            <v-chip value="SL-LMT" :color="priceType === 'SL-LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-LMT' ? 'mainbg' : 'maintext'">
                                SL Limit
                            </v-chip>
                            <v-chip value="SL-MKT" :color="priceType === 'SL-MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-MKT' ? 'mainbg' : 'maintext'">
                                SL Mkt
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <!-- Quantity -->
                    <div class="d-flex justify-space-between mt-2">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                        <p class="font-weight-regular fs-14 subtext--text mb-2 mr-2 text-right">MLot: {{ menudata[0]?.ls
                            ?? '-' }}</p>
                    </div>
                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill" type="number"
                        v-model.number="quantity" hide-details @input="computeMarginAndBrokerage">
                        <template #append>
                            <v-btn @click="increaseQuantity()" icon class="elevation-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M12 8V16" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>
                        <template #prepend-inner>
                            <v-btn @click="decreaseQuantity()" icon class="elevation-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>
                    </v-text-field>
                    <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-1">Freeze qty: {{ menudata[1]?.frzqty
                        ?? '-' }}</p>

                    <!-- Price / Trigger / SL / TP -->
                    <div class="d-flex justify-space-between mt-4">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Price</p>
                        <p class="font-weight-regular fs-14 subtext--text mb-2 mr-2 text-right">
                            <span class="mr-2">MLot: {{ menudata[0]?.ls ?? '-' }}</span>
                            Tick: {{ menudata[0]?.ti ?? '-' }}
                        </p>
                    </div>
                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill" type="number"
                        :readonly="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="price" hide-details
                        @input="computeMarginAndBrokerage">
                        <template #append>
                            <svg v-if="priceType === 'MKT' || priceType === 'SL-MKT'" xmlns="http://www.w3.org/2000/svg"
                                width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M10.0625 4.8125H9.1875V3.0625C9.1875 1.85456 8.20794 0.875 7 0.875C5.79206 0.875 4.8125 1.85456 4.8125 3.0625V4.8125H3.9375V3.0625C3.9375 1.37112 5.30862 0 7 0C8.69137 0 10.0625 1.37112 10.0625 3.0625V4.8125Z"
                                    fill="#999999" />
                                <path
                                    d="M11.5938 5.6875H2.40625C1.80206 5.6875 1.3125 6.17706 1.3125 6.78125V12.9062C1.3125 13.5104 1.80206 14 2.40625 14H11.5938C12.1979 14 12.6875 13.5104 12.6875 12.9062V6.78125C12.6875 6.17706 12.1979 5.6875 11.5938 5.6875ZM7.4375 10.8754V11.8125C7.4375 12.054 7.2415 12.25 7 12.25C6.7585 12.25 6.5625 12.054 6.5625 11.8125V10.8754C5.62669 10.6339 5.06406 9.67925 5.30556 8.74344C5.54706 7.80763 6.50169 7.245 7.4375 7.4865C8.37331 7.728 8.93594 8.68263 8.69444 9.61844C8.53519 10.2349 8.05394 10.7161 7.4375 10.8754Z"
                                    fill="#999999" />
                            </svg>
                        </template>
                    </v-text-field>
                    <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-1">Circuit level: {{ menudata[1]?.lc
                        ?? '-' }} - {{
                            menudata[1]?.uc ?? '-' }}</p>

                    <v-text-field v-if="priceType === 'SL-LMT' || priceType === 'SL-MKT'" class="mt-2" density="compact"
                        bg-color="secbg" variant="flat" type="number" v-model.number="triggerPrice"
                        label="Trigger price" hide-details />

                    <!-- Cover / Bracket Fields -->
                    <div v-if="orderType === 1 || orderType === 2" class="mt-2">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Stop Loss</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                            type="number" v-model.number="stopLossPrice" hide-details />
                    </div>
                    <div v-if="orderType === 2" class="mt-2">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Target</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                            type="number" v-model.number="targetPrice" hide-details />
                    </div>

                    <!-- GTT Fields -->
                    <div v-if="orderType === 3" class="mt-2">
                        <div class="d-flex">
                            <v-select class="mr-2" density="compact" variant="flat" bg-color="secbg" :items="['LTP']"
                                v-model="gttAlertType" label="Alert Type" hide-details />
                            <v-select class="mr-2" density="compact" variant="flat" bg-color="secbg" :items="['>', '<']"
                                v-model="gttCond" label="Condition" hide-details />
                            <v-text-field density="compact" variant="flat" bg-color="secbg" v-model.number="gttValue"
                                type="number" label="Trigger Value" hide-details />
                        </div>
                    </div>

                    <!-- SIP Tab - Handled by onOrderTypeChanged function -->
                    <!-- No content needed here as SIP tab click is handled automatically -->

                    <!-- Validity & Disclosed Qty -->
                    <div v-if="orderType !== 3 && orderType !== 4" class="mt-3">
                        <v-checkbox color="maintext" v-model="addValidityQty" hide-details>
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">Add Validity & Disclosed Qty</p>
                            </template>
                        </v-checkbox>
                        <div v-if="addValidityQty" class="mt-2">
                            <v-row no-gutters>
                                <v-col cols="6" class="pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Validity</p>
                                    <v-chip-group v-model="validityType" @update:model-value="computeMarginAndBrokerage"
                                        column>
                                        <v-chip v-if="menudata[0]?.exch !== 'BSE'" value="IOC"
                                            :color="validityType === 'IOC' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'IOC' ? 'mainbg' : 'maintext'">IOC</v-chip>
                                        <v-chip
                                            v-if="(menudata[0]?.exch === 'BFO' || menudata[0]?.exch === 'BCD') && menudata[0]?.exch !== 'BSE'"
                                            value="EOS" :color="validityType === 'EOS' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'EOS' ? 'mainbg' : 'maintext'">EOS</v-chip>
                                        <v-chip value="DAY" :color="validityType === 'DAY' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'DAY' ? 'mainbg' : 'maintext'">Day</v-chip>
                                    </v-chip-group>
                                </v-col>
                                <v-col cols="6" class="pl-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Disclosed Qty</p>
                                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                                        type="number" hide-spin-buttons min="0" v-model.number="disclosedQty"
                                        hide-details />
                                </v-col>
                            </v-row>
                        </div>
                    </div>

                    <!-- After Market Order -->
                    <div class="d-flex align-center mt-3">
                        <v-checkbox color="maintext" v-model="afterMarket" hide-details>
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">After market order (AMO)</p>
                            </template>
                        </v-checkbox>
                    </div>

                    <!-- Quick Order Link -->
                    <div class="mt-3">
                        <v-btn text block color="primary" variant="text" class="rounded-pill text-none"
                            @click="isQuickOrder = !isQuickOrder">
                            {{ !isQuickOrder ? 'Quick order ' : 'Advanced order ' }}
                            <v-icon size="16">{{ isQuickOrder ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'
                            }}</v-icon>
                        </v-btn>
                    </div>

                    <!-- Margin Preview -->
                    <v-divider class="my-3"></v-divider>
                    <div class="d-flex align-center">
                        <p class="font-weight-medium fs-12 subtext--text mb-0">
                            <span>Margin </span>
                            <span class="ml-1 primary--text">
                                <b>₹{{ orderMarginDisplay }}</b>
                                <span class="ml-1"> + </span>
                                <span class="ml-1 primary--text">
                                    <b>₹{{ chargesDisplay }}</b>
                                </span>
                            </span>
                            <v-icon class="ml-1" size="14" color="maintext">mdi-information-outline</v-icon>
                        </p>
                    </div>
                    <div class="d-flex align-center mt-2">
                        <p class="font-weight-medium fs-12 subtext--text mb-0">
                            <span>Avail </span>
                            <span class="ml-1 primary--text">
                                <b>₹{{ cashAvailableDisplay }}</b>
                            </span>
                            <span class="ml-1 primary--text cursor-pointer" @click="router.push('/funds')">+ Add
                                fund</span>
                            <v-icon class="ml-1" size="14" color="mainred">mdi-alert-octagon</v-icon>
                        </p>
                    </div>
                </div>
            </div>

            <v-divider></v-divider>
            <div class="px-6 py-3">
                <v-row no-gutters>
                    <v-col cols="6" class="pr-2">
                        <v-btn block @click.stop.prevent="closeOrderDialog()" @mousedown.stop.prevent color="secbg"
                            :disabled="isPlacingOrder" class="text-none rounded-pill elevation-0 subtext--text"
                            height="40px">Cancel</v-btn>
                    </v-col>
                    <v-col cols="6" class="pl-2">
                        <v-btn block @click.stop.prevent="placeOrder()" @mousedown.stop.prevent
                            :loading="isPlacingOrder" :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                            class="text-none rounded-pill elevation-0 white--text" height="40px">
                            {{ buyOrSellIsSell ? 'Sell' : 'Buy' }}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-card>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getQuotesdata, getSecuritydata, getPlaceOrder, getOrderMargin, getBrokerage, setOrdprefApi, getGTTPlaceOrder } from '@/components/mixins/getAPIdata'

const router = useRouter()

// Local state (can be replaced/augmented by Pinia orderStore later)
const orderDialog = ref(false)
const sliceDialog = ref(false)
const menudata = ref([])
const buyOrSellIsSell = ref(false)
const investType = ref('I')
const priceType = ref('LMT')
const orderType = ref(0) // 0=Regular,1=Cover,2=Bracket,3=GTT,4=SIP
const quantity = ref(0)
const price = ref(0)
const triggerPrice = ref(0)
const isPlacingOrder = ref(false)
// GTT
const gttAlertType = ref('LTP')
const gttCond = ref('>')
const gttValue = ref(0)
const stopLossPrice = ref(0)
const targetPrice = ref(0)
const disclosedQty = ref(0)
const afterMarket = ref(false)
const marketProtection = ref(5)
const orderContextType = ref('order')
const existingOrderItem = ref(null)
const isStickyDialog = ref(false)
const isQuickOrder = ref(false)
const dialogStyle = ref({})
const addValidityQty = ref(false)
const validityType = ref('DAY')
const charges = ref(0)

const appStore = useAppStore()

const ltpDisplay = computed(() => {
    return (menudata.value?.ltp || menudata.value[0]?.lp || 0).toString()
})
const chDisplay = computed(() => (menudata.value?.ch ?? 0).toString())
const chpDisplay = computed(() => (menudata.value?.chp ?? 0).toString())
const chColor = computed(() => {
    const ch = Number(menudata.value?.ch || 0)
    return ch > 0 ? 'maingreen--text' : ch < 0 ? 'mainred--text' : 'subtext--text'
})

// Margin / Brokerage preview state
const orderMargin = ref(0)
const cashAvailable = ref(0)
const orderMarginDisplay = computed(() => Number(orderMargin.value || 0).toFixed(2))
const cashAvailableDisplay = computed(() => Number(cashAvailable.value || 0).toFixed(2))
const chargesDisplay = computed(() => Number(charges.value || 0).toFixed(2))

async function computeMarginAndBrokerage() {
    const q = menudata.value[0]
    if (!q || !quantity.value) {
        orderMargin.value = 0
        return
    }
    try {
        const item = {
            exch: q.exch,
            tsym: encodeURIComponent(q.tsym),
            qty: (quantity.value * Number(q.ls || 1)),
            prc: price.value,
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
            trgprc: (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') ? triggerPrice.value : 0,
        }
        const m = await getOrderMargin(item)
        if (m && m.stat === 'Ok') {
            orderMargin.value = Number(m.ordermargin || 0)
            cashAvailable.value = Number(m.avbal || m.avbma || 0)
        }
        const b = await getBrokerage(item).catch(() => { })
        if (b && b.charges) {
            charges.value = Number(b.charges || 0)
        }
    } catch (e) {
        // silent
    }
}

function onOrderTypeChanged() {
    // Handle SIP tab click (orderType === 4)
    if (orderType.value === 4) {
        // SIP tab clicked - redirect to orders page or trigger SIP dialog
        const currentPath = router.currentRoute.value.path

        // Phase 8: Navigate to orders page with security data (menudata[1])
        // Use /orders/sip route to ensure SIP tab is shown
        if (currentPath !== '/orders' && !currentPath.startsWith('/orders/')) {
            // Navigate to SIP orders page with security data
            router.push({
                path: '/orders/sip',
                query: {
                    // Pass security data as query params for better compatibility
                    token: menudata.value[1]?.token,
                    tsym: menudata.value[1]?.tsym,
                    exch: menudata.value[1]?.exch,
                    ls: menudata.value[1]?.ls || 1,
                }
            }).then(() => {
                // Navigation will trigger handleRouteParams in StockOrderSrc
                // which will switch to SIP tab and trigger the event
                // No need to emit event here as it will be handled by route params
            })
        } else {
            // Already on orders page - switch to SIP tab and emit event
            // Emit event to switch to SIP tab (index 4)
            window.dispatchEvent(new CustomEvent('order-tab', {
                detail: 4
            }))

            // Trigger SIP order dialog with security data
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('siporder-trigger', {
                    detail: menudata.value[1] || {}
                }))
            }, 100)
        }

        // Close order dialog
        closeOrderDialog()
        return
    }

    // Handle other order types (Regular, Cover, Bracket, GTT)
    if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
        price.value = 0
    } else if (menudata.value[0]?.lp && (priceType.value === 'LMT' || priceType.value === 'SL-LMT')) {
        price.value = Number(menudata.value[0].lp)
    }
    if (priceType.value !== 'SL-LMT' && priceType.value !== 'SL-MKT') {
        triggerPrice.value = 0
    }
    computeMarginAndBrokerage()
}

async function handleMenuDialogEvent(event) {
    const { type, token, exch, tsym, trantype, item } = event.detail || {}
    if (!type || !token || !exch || !tsym) return

    // Handle cancel order directly (no dialog needed)
    if (type === 'cancel-order' && item) {
        await cancelOrder(item)
        return
    }

    try {
        orderContextType.value = type
        existingOrderItem.value = item || null
        // Fetch quote and security
        const q = await getQuotesdata(`${exch}|${token}`)
        let s = null
        if (q && q.instname !== 'UNDIND' && q.instname !== 'COM') {
            s = await getSecuritydata(`${exch}|${token}`)
        }
        menudata.value = []
        menudata.value.push(q)
        if (s) menudata.value.push(s)

        // Defaults
        buyOrSellIsSell.value = (trantype || '').toLowerCase() === 's'
        investType.value = (exch === 'NSE' || exch === 'BSE') ? 'C' : 'I'
        priceType.value = 'LMT'
        orderType.value = 0
        quantity.value = Number(q?.ls || 1)
        price.value = Number(q?.lp || 0)
        triggerPrice.value = 0
        stopLossPrice.value = 0
        targetPrice.value = 0
        disclosedQty.value = 0
        afterMarket.value = false
        marketProtection.value = 5

        // Modify / Re-order / Exit prefill
        if (item && (type === 'mod-order' || type === 're-order' || type === 'exit-order')) {
            priceType.value = item.prctyp || 'LMT'
            quantity.value = Number(Math.abs(item.qty) / Number(q?.ls || 1)) || Number(q?.ls || 1)
            price.value = (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? 0 : Number(item.prc || q?.lp || 0)
            triggerPrice.value = (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') ? Number(item.trgprc || 0) : 0
            buyOrSellIsSell.value = (item.trantype || '').toUpperCase() === 'S'
        }

        // GTT modify prefill
        if (item && (type === 'mod-GTT' || type === 'order-GTT')) {
            if (type === 'mod-GTT') {
                gttAlertType.value = item.alert_type || 'LTP'
                gttCond.value = item.cond || '>'
                gttValue.value = Number(item.value || 0)
                quantity.value = Number(Math.abs(item.qty) / Number(q?.ls || 1)) || Number(q?.ls || 1)
                price.value = (item.prctyp === 'MKT' || item.prctyp === 'SL-MKT') ? 0 : Number(item.prc || q?.lp || 0)
                priceType.value = item.prctyp || 'LMT'
                buyOrSellIsSell.value = (item.trantype || '').toUpperCase() === 'S'
                orderType.value = 3
            } else if (type === 'order-GTT') {
                orderType.value = 3
            }
        }

        // Load preferences (best-effort)
        try {
            const pref = await setOrdprefApi({}, false)
            if (pref && pref.stat === 'Ok') {
                if (pref.quickord !== undefined) isQuickOrder.value = pref.quickord
                if (pref.ordsrcpop !== undefined) isStickyDialog.value = pref.ordsrcpop
                if (pref.investype) investType.value = pref.investype
                if (pref.prc) priceType.value = pref.prc
                if (pref.ordqty) quantity.value = Number(pref.ordqty) || quantity.value
            }
        } catch (e) { }

        orderDialog.value = true
        console.log(orderDialog.value)
        await nextTick()
        restoreDialogPosition()
        setupDragFunctionality()
        computeMarginAndBrokerage()
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to open order window')
    }
}

// Cancel order function - handles cancel-order directly without opening dialog
async function cancelOrder(item) {
    if (!item || !item.norenordno) {
        appStore.showSnackbar(2, 'Invalid order data')
        return
    }

    try {
        isPlacingOrder.value = true

        // Determine cancel type: 'can' for regular cancel, 'can-ex' for exit order
        const cancelType = item.exord ? 'can-ex' : 'can'

        // Build cancel item based on type
        const cancelItem = {
            uid: sessionStorage.getItem('userid'),
        }

        if (cancelType === 'can-ex') {
            // Exit order (SNO order) - needs snonum and prd
            cancelItem.norenordno = item.snonum || item.norenordno
            cancelItem.prd = item.prd || 'I'
        } else {
            // Regular cancel order - needs norenordno
            cancelItem.norenordno = item.norenordno
        }

        // Call cancel order API
        const res = await getPlaceOrder(cancelItem, cancelType)

        if (res?.stat !== 'Ok') {
            appStore.showSnackbar(2, res?.emsg || 'Failed to cancel order')
        } else {
            appStore.showSnackbar(1, cancelType === 'can-ex' ? 'Order exited successfully' : 'Order cancelled successfully')
            // Trigger orderbook update to refresh the orders list
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to cancel order')
        console.error('Cancel order error:', e)
    } finally {
        isPlacingOrder.value = false
    }
}

function increaseQuantity() {
    const q = menudata.value[0]
    if (!q) return
    const ls = Number(q.ls || 1)
    const step = q.exch === 'MCX' ? 1 : ls
    let adjustedQty = Math.round(Number(quantity.value) / ls) * ls
    quantity.value = Number(quantity.value) !== adjustedQty ? adjustedQty : Number(quantity.value) + step
    computeMarginAndBrokerage()
}

function decreaseQuantity() {
    const q = menudata.value[0]
    if (!q) return
    const ls = Number(q.ls || 1)
    const step = q.exch === 'MCX' ? 1 : ls
    let adjustedQty = Math.floor(Number(quantity.value) / ls) * ls
    if (Number(quantity.value) !== adjustedQty) {
        quantity.value = adjustedQty
    } else if (Number(quantity.value) > step) {
        quantity.value -= step
    }
    computeMarginAndBrokerage()
}

function closeOrderDialog() {
    // Clear any active drag handlers that might interfere
    if (document.onmouseup) {
        document.onmouseup = null
    }
    if (document.onmousemove) {
        document.onmousemove = null
    }

    // Set orderDialog to false immediately (do this first to close dialog immediately)
    orderDialog.value = false

    // Reset all state after dialog is closed
    menudata.value = []
    quantity.value = 0
    price.value = 0
    buyOrSellIsSell.value = false
    orderType.value = 0
    investType.value = 'I'
    priceType.value = 'LMT'
    addValidityQty.value = false
    validityType.value = 'DAY'
    disclosedQty.value = 0
    afterMarket.value = false
    triggerPrice.value = 0
    stopLossPrice.value = 0
    targetPrice.value = 0
    gttAlertType.value = 'LTP'
    gttCond.value = '>'
    gttValue.value = 0

    console.log('closeOrderDialog ---------- >', orderDialog.value)

}

watch(orderDialog, (newVal) => {
    orderDialog.value = newVal
    console.log('orderDialog ---------- >', orderDialog.value)
})

function validateOrder() {
    const q = menudata.value[0]
    if (!q) return 'Symbol not loaded'
    if (!(quantity.value > 0)) return 'Quantity must be greater than zero'
    if ((priceType.value === 'LMT' || priceType.value === 'SL-LMT') && (price.value <= 0)) return 'Price must be greater than zero'
    if ((priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') && (triggerPrice.value <= 0)) return 'Trigger price must be greater than zero'
    // Lot size multiple validation (except MCX where step=1)
    const ls = Number(q.ls || 1)
    if (q.exch !== 'MCX' && (quantity.value % ls !== 0)) return `Quantity must be a multiple of lot size ${ls}`
    // Tick size multiple validation
    const ti = Number(q.ti || 0)
    if (ti > 0) {
        const isTickMultiple = (val) => Math.abs(val / ti - Math.round(val / ti)) < 1e-6
        if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            if (!isTickMultiple(Number(price.value || 0))) return `Price should be multiple of tick size ${ti}`
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            if (!isTickMultiple(Number(triggerPrice.value || 0))) return `Trigger should be multiple of tick size ${ti}`
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value && !isTickMultiple(Number(stopLossPrice.value))) return `Stop loss should be multiple of tick size ${ti}`
            if (orderType.value === 2 && targetPrice.value && !isTickMultiple(Number(targetPrice.value))) return `Target should be multiple of tick size ${ti}`
        }
    }
    // Circuit limits validation
    const lc = Number(q.lc)
    const uc = Number(q.uc)
    if (isFinite(lc) && isFinite(uc)) {
        if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            const p = Number(price.value || 0)
            if (p < lc || p > uc) return `Price must be within circuit limits ${lc} - ${uc}`
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            const t = Number(triggerPrice.value || 0)
            if (t < lc || t > uc) return `Trigger must be within circuit limits ${lc} - ${uc}`
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value) {
                const sl = Number(stopLossPrice.value)
                if (sl < lc || sl > uc) return `Stop loss must be within circuit limits ${lc} - ${uc}`
            }
            if (orderType.value === 2 && targetPrice.value) {
                const tp = Number(targetPrice.value)
                if (tp < lc || tp > uc) return `Target must be within circuit limits ${lc} - ${uc}`
            }
        }
    }
    // Cover/Bracket requirements
    if (orderType.value === 1 && !(stopLossPrice.value > 0)) return 'Stop loss is required for Cover orders'
    if (orderType.value === 2) {
        if (!(stopLossPrice.value > 0)) return 'Stop loss is required for Bracket orders'
        if (!(targetPrice.value > 0)) return 'Target is required for Bracket orders'
    }
    return null
}

async function placeOrder(loop) {
    const q = menudata.value[0]
    if (!q) return
    const err = validateOrder()
    if (err) {
        appStore.showSnackbar(2, err)
        return
    }
    try {
        isPlacingOrder.value = true
        // If GTT order, call GTT API
        if (orderType.value === 3) {
            const gttItem = {
                exch: q.exch,
                tsym: q.tsym,
                trantype: buyOrSellIsSell.value ? 'S' : 'B',
                alert_type: gttAlertType.value,
                cond: gttCond.value,
                value: String(gttValue.value || 0),
                qty: String(quantity.value * Number(q.ls || 1)),
                prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(price.value || 0),
                prctyp: priceType.value,
            }
            // Handle GTT modify
            const gttUrl = (orderContextType.value === 'mod-GTT' && existingOrderItem.value?.norenordno)
                ? 'ModifyGTTOrder' : 'PlaceGTTOrder'
            if (gttUrl === 'ModifyGTTOrder') {
                gttItem['norenordno'] = existingOrderItem.value.norenordno
            }

            const resGtt = await getGTTPlaceOrder(gttItem, gttUrl)
            if (resGtt?.stat !== 'Ok') {
                appStore.showSnackbar(2, resGtt?.emsg || 'GTT order failed')
            } else {
                appStore.showSnackbar(1, gttUrl === 'ModifyGTTOrder' ? 'GTT order modified' : 'GTT order placed')
                try { window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } })) } catch (_) { }
                if (!loop && !isStickyDialog.value) { orderDialog.value = false }
            }
            return
        }

        const item = {
            uid: sessionStorage.getItem('userid'),
            actid: sessionStorage.getItem('userid'),
            exch: q.exch,
            tsym: q.tsym,
            ret: addValidityQty.value ? validityType.value : 'DAY',
            qty: (quantity.value).toString(),
            prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(price.value),
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            item['trgprc'] = String(triggerPrice.value)
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value) item['blprc'] = String(stopLossPrice.value)
        }
        if (orderType.value === 2) {
            if (targetPrice.value) item['bpprc'] = String(targetPrice.value)
        }
        if (disclosedQty.value) item['dscqty'] = String(disclosedQty.value)
        if (afterMarket.value) item['amo'] = 'Yes'
        if (marketProtection.value && (priceType.value === 'MKT' || priceType.value === 'SL-MKT')) item['mktProt'] = String(marketProtection.value)

        let typeArg = 'place'
        if (orderContextType.value === 'mod-order') typeArg = 'mod'
        if (orderContextType.value === 'exit-order') typeArg = 'can-ex'
        if (orderContextType.value === 're-order') typeArg = 're'
        if (typeArg === 'mod' || typeArg === 'can-ex') {
            const nor = existingOrderItem.value?.norenordno
            if (nor) item['norenordno'] = nor
        }

        const res = await getPlaceOrder(item, typeArg)
        if (res?.stat !== 'Ok') {
            appStore.showSnackbar(2, res?.emsg || 'Order failed')
        } else {
            appStore.showSnackbar(1, 'Order placed successfully')
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }
            // Save preferences on successful order
            if (orderContextType.value === 'order') {
                try {
                    await setOrdprefApi({
                        quickord: isQuickOrder.value,
                        ordsrcpop: isStickyDialog.value,
                        investype: investType.value,
                        prc: priceType.value,
                        ordqty: quantity.value
                    }, true)
                } catch (e) { }
            }
            if (!loop && !isStickyDialog.value) {
                orderDialog.value = false
            }
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to place order')
    } finally {
        isPlacingOrder.value = false
    }
}

onMounted(() => {
    window.addEventListener('menudialog', handleMenuDialogEvent)
    window.addEventListener('web-scoketConn', (ev) => {
        const data = ev.detail
        if (!data || !menudata.value[0]) return
        if (data.token === menudata.value[0].token) {
            menudata.value['ltp'] = Number(data.lp).toFixed(2)
            menudata.value['ch'] = Number(data.ch || 0).toFixed(2)
            menudata.value['chp'] = Number(data.chp || 0).toFixed(2)
            computeMarginAndBrokerage()
        }
    })
})

// Drag functionality
function setupDragFunctionality() {
    setTimeout(() => {
        const elmnt = document.getElementById('maindiv')
        if (!elmnt) return

        dragElement(elmnt)
    }, 100)
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    const header = document.getElementById(elmnt.id + 'header')

    const dragMouseDown = (e) => {
        e = e || window.event
        // Don't interfere with button clicks
        const target = e.target || e.srcElement
        if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.v-btn'))) {
            return
        }
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    const elementDrag = (e) => {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.position = 'fixed'
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
        elmnt.style.zIndex = '9999'
    }

    const closeDragElement = () => {
        document.onmouseup = null
        document.onmousemove = null
        saveDialogPosition(elmnt)
    }

    if (header) {
        header.onmousedown = dragMouseDown
    } else {
        elmnt.onmousedown = dragMouseDown
    }
}

function saveDialogPosition(element) {
    const position = {
        top: element.style.top || element.offsetTop + 'px',
        left: element.style.left || element.offsetLeft + 'px'
    }
    if (position.top && position.left && (position.top !== '0px' || position.left !== '0px')) {
        localStorage.setItem('stockOrderWindow_position', JSON.stringify(position))
    }
}

function restoreDialogPosition() {
    const savedPosition = localStorage.getItem('stockOrderWindow_position')
    if (!savedPosition) return

    try {
        const position = JSON.parse(savedPosition)
        if (position.top && position.left) {
            dialogStyle.value = {
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: '9999'
            }

            nextTick(() => {
                const elmnt = document.getElementById('maindiv')
                if (!elmnt) return

                requestAnimationFrame(() => {
                    const rect = elmnt.getBoundingClientRect()
                    const vw = window.innerWidth
                    const vh = window.innerHeight

                    if (rect.right > vw) dialogStyle.value.left = (vw - rect.width) + 'px'
                    if (rect.bottom > vh) dialogStyle.value.top = (vh - rect.height) + 'px'
                    if (rect.left < 0) dialogStyle.value.left = '0px'
                    if (rect.top < 0) dialogStyle.value.top = '0px'
                })
            })
        }
    } catch (e) {
        localStorage.removeItem('stockOrderWindow_position')
    }
}

onBeforeUnmount(() => {
    window.removeEventListener('menudialog', handleMenuDialogEvent)
})
</script>


<style>
:deep(.v-chip.v-chip--link:focus-visible),
:deep(.v-chip.v-chip--link:focus) {
    outline: 2px solid black !important;
    outline-offset: 2px;
}

/* Optional: add hover effect too */
:deep(.v-chip:hover) {
    box-shadow: 0 0 0 2px black inset !important;
}
</style>