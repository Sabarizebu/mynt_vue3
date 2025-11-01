<template>
    <div>
        <!-- Top multi-tab navigation -->
        <v-tabs v-model="topTab" color="primary" fixed show-arrows density="compact" class="mb-2">
            <v-tab v-for="t in navTabs" :key="t.label" class="font-weight-bold subtitle-1 mb-0 text-none" :value="t.to"
                :disabled="t.disabled" @click="go(t)">
                {{ t.label }}
            </v-tab>
        </v-tabs>

        <v-toolbar flat dense class="tool-sty pl-4 crd-trn my-4">
            <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="compact" @change="onTabChange">
                <v-tab value="orders" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Open Orders ({{ openorders.length }})
                </v-tab>
                <v-tab value="executed" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Executed Orders ({{ execorders.length }})
                </v-tab>
            </v-tabs>
            <v-spacer />
            <v-text-field v-if="ordertab === 'orders'" style="max-width: 220px" v-model="opensearch" hide-details
                prepend-inner-icon="mdi-magnify" label="Search" class="rounded-pill mr-4" variant="solo"
                density="comfortable" :bg-color="'secbg'" />
            <v-icon :disabled="loading" class="ml-3 cursor-p" @click="getOrderbook" color="maintext"
                size="24">mdi-reload</v-icon>
        </v-toolbar>

        <div v-if="ordertab === 'orders'" style="z-index:0">
            <v-data-table :headers="openHeaders" :items="searchedOpen" :loading="loading" :hide-default-footer="true"
                fixed-header class="rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid var(--outline)" height="520" :items-per-page="-1">
                <template #item.tsym="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                    </p>
                </template>
                <template #item.qty="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.qty || item.tradedqty || 0 }}</span>
                </template>
                <template #item.prc="{ item }">
                    <span class="text-right d-inline-block w-100">{{ fmt(item.prc) }}</span>
                </template>
                <template #item.prctyp="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.prctyp || '-' }}</span>
                </template>
                <template #item.status="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.rejreason || item.status || '-' }}</span>
                </template>
                <template #item.exch_tm="{ item }">
                    <span class="text-right d-inline-block w-100">{{ timeStr(item.exch_tm || item.norentm) }}</span>
                </template>
                <template #no-data>
                    <div class="text-center">
                        <div class="mx-auto py-16 mt-16">
                            <img class="mx-auto" width="80px" :src="noDataImg" />
                            <h4 class="txt-999 font-weight-regular caption">No orders found</h4>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </div>
        <div v-else-if="ordertab === 'executed'">
            <v-data-table :headers="execHeaders" :items="execItems" :loading="loading" :hide-default-footer="true"
                fixed-header class="rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid var(--outline)" height="520" :items-per-page="-1">
                <template #item.tsym="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                    </p>
                </template>
                <template #item.tradedqty="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.tradedqty || 0 }}</span>
                </template>
                <template #item.avgprc="{ item }">
                    <span class="text-right d-inline-block w-100">{{ fmt(item.avgprc) }}</span>
                </template>
                <template #item.prctyp="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.prctyp || '-' }}</span>
                </template>
                <template #item.status="{ item }">
                    <span class="text-right d-inline-block w-100">{{ item.status || '-' }}</span>
                </template>
                <template #item.exch_tm="{ item }">
                    <span class="text-right d-inline-block w-100">{{ timeStr(item.exch_tm || item.norentm) }}</span>
                </template>
                <template #no-data>
                    <div class="text-center">
                        <div class="mx-auto py-16 mt-16">
                            <img class="mx-auto" width="80px" :src="noDataImg" />
                            <h4 class="txt-999 font-weight-regular caption">No executed orders</h4>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import { useAppStore } from '@/stores/appStore'
import { getMOrderbook } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const ordertab = ref('orders')
const loading = ref(false)
const opensearch = ref('')
const orderbookdata = ref([])
const openorders = ref([])
const execorders = ref([])
const navTabs = ref([
    { label: 'Orders Book', to: '/orders/book' },
    { label: 'Trade Book', to: '/orders/trade' },
    { label: 'GTT Order', to: '/orders/gtt' },
    { label: 'Basket Order', to: '/orders/basket' },
    { label: 'SIP Order', to: '/orders/sip' },
    { label: 'Mutual funds', to: '/mutualfund' },
    { label: 'IPOs', to: '/ipo/orderbook' },
    { label: 'Bonds', to: '/bonds/orderbook' },
])
const topTab = ref(route.path.startsWith('/orders') ? route.path : '/orders/book')
const orderItems = computed(() => Array.isArray(orderbookdata.value) ? orderbookdata.value : [])
const openItems = computed(() => Array.isArray(openorders.value) ? openorders.value : [])
const execItems = computed(() => Array.isArray(execorders.value) ? execorders.value : [])
const searchedOpen = computed(() => {
    const term = opensearch.value?.toLowerCase()
    if (!term) return openItems.value
    return openItems.value.filter(o => includeSearch(o, ['tsym', 'exch', 'status', 'rejreason', 'prctyp'], term))
})

const openHeaders = [
    { title: 'Instrument', key: 'tsym' },
    { title: 'Qty', key: 'qty', align: 'right' },
    { title: 'Price', key: 'prc', align: 'right' },
    { title: 'Type', key: 'prctyp', align: 'right' },
    { title: 'Status/Reason', key: 'status', align: 'right' },
    { title: 'Time', key: 'exch_tm', align: 'right' }
]

const execHeaders = [
    { title: 'Instrument', key: 'tsym' },
    { title: 'Qty', key: 'tradedqty', align: 'right' },
    { title: 'Avg Price', key: 'avgprc', align: 'right' },
    { title: 'Type', key: 'prctyp', align: 'right' },
    { title: 'Status', key: 'status', align: 'right' },
    { title: 'Time', key: 'exch_tm', align: 'right' }
]

function fmt(v) {
    const n = Number(v)
    return isFinite(n) ? n.toFixed(2) : '0.00'
}

function timeStr(v) {
    // Accepts strings like '10:15:30' or timestamps; returns as-is for known formats
    if (!v) return '-'
    const s = String(v)
    if (s.includes(':')) return s
    const num = Number(s)
    if (!isFinite(num)) return s
    const d = new Date(num)
    return isFinite(d.getTime()) ? d.toTimeString().slice(0, 8) : s
}

function includeSearch(item, keys, term) {
    if (!term) return true
    const q = String(term).toLowerCase()
    return keys.some(k => item?.[k] !== undefined && String(item[k]).toLowerCase().includes(q))
}

function setOrderPayload(payload) {
    const all = payload?.response || []
    orderbookdata.value = all
    openorders.value = payload?.openorders || all.filter(o => o.way === 'open')
    execorders.value = payload?.execorders || all.filter(o => o.way !== 'open')
    try {
        sessionStorage.setItem('orders_last', JSON.stringify(payload))
    } catch (e) { }
}

async function getOrderbook() {
    loading.value = true
    const data = await getMOrderbook(true)
    if (data && (Array.isArray(data.response) || Array.isArray(data.openorders))) {
        setOrderPayload(data)
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load orders')
    }
    loading.value = false
}

function onTempUpdate(e) {
    const p = e.detail
    if (p && p.stat) { // orders payload carries stat array
        setOrderPayload(p)
    }
}

function onOrderbookUpdate() {
    getOrderbook()
}

function onTabChange() {
    // no-op, but kept for parity and future behaviors
}

function go(t) {
    if (t && t.to) router.push(t.to)
}

watch(() => route.path, (p) => {
    topTab.value = p.startsWith('/orders') ? p : topTab.value
})

onMounted(() => {
    // load cached for optimistic UI
    try {
        const cached = sessionStorage.getItem('orders_last')
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed && (parsed.response || parsed.openorders)) setOrderPayload(parsed)
        }
    } catch (e) { }

    getOrderbook()
    window.addEventListener('tempdata-update', onTempUpdate)
    window.addEventListener('orderbook-update', onOrderbookUpdate)
})

onBeforeUnmount(() => {
    window.removeEventListener('tempdata-update', onTempUpdate)
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>
