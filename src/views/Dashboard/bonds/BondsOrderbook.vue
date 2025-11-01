<template>
    <div>
        <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
            <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="comfortable"
                @update:model-value="onTabChange">
                <v-tab :value="'open'" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Open Orders ({{ openorders.length }})
                </v-tab>
                <v-tab :value="'exec'" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Close Orders ({{ execorders.length }})
                </v-tab>
            </v-tabs>
            <v-spacer></v-spacer>
            <v-text-field style="max-width: 220px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search bonds" class="rounded-pill mr-4" variant="solo" density="comfortable"
                :bg-color="'secbg'" />
            <v-select style="max-width: 180px" v-model="filter" hide-details class="rounded-pill" clearable
                variant="solo" density="comfortable" :bg-color="'secbg'" item-title="series" item-value="series"
                :items="seriesList" label="Bond series" />
            <v-icon class="ml-3 cursor-p" :disabled="tableloader" @click="getOrderbook" color="maintext"
                size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table :headers="orderheader" :items="filteredRows" fixed-header :hide-default-footer="true"
            :loading="tableloader" class="mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 4px; border:1px solid var(--outline)" height="480" :items-per-page="-1"
            @click:row="(_, { item }) => setOrderrowdata(item)">
            <template #item.symbol="{ item }">
                <div class="pos-rlt">
                    <span class="table-hov-text maintext--text font-weight-medium">{{ item.symbol || '-' }}</span>
                    <span class="ml-1 subtext--text fs-10">{{ item.series || '' }}</span>
                    <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                        <v-menu close-on-click :location="'bottom'" class="table-menu">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" style="border: 1px solid var(--outline)" min-width="20px"
                                    color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                                    size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <v-list density="compact">
                                    <div v-for="(m, k) in (ordertab === 'open' ? menulist.open : menulist.exec)" :key="k">
                                        <v-list-item @click="m.type === 'new' ? router.push('/bonds') : m.type === 'cd' ? (canceldialog = true) : setOrderrowdata(item)"
                                            class="pl-3 pr-6">
                                            <template #prepend>
                                                <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                    color="#506D84" />
                                                <img v-else-if="m.icon > 2" width="20px" class="pl-1"
                                                    :src="require(`@/assets/orderbook/${m.icon}.svg`)" />
                                            </template>
                                            <v-list-item-title class="subline--text font-weight-medium fs-14">{{
                                                m.name }}</v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                    </div>
                                </v-list>
                            </v-card>
                        </v-menu>
                    </div>
                </div>
            </template>
            <template #item.investmentValue="{ item }">
                <p class="font-weight-medium text-right maintext--text mb-0">{{
                    item.investmentValue ? `₹${Number(item.investmentValue).toLocaleString()}` : '' }}</p>
            </template>
            <template #item.response_datetime="{ item }">
                <span class="font-weight-medium maintext--text">{{ (item.response_datetime || '').slice(0, 16) }}</span>
            </template>
            <template #item.reponse_status="{ item }">
                <p class="font-weight-medium maintext--text mb-0 text-capitalize">
                    <img width="20" class="mb-n02" v-if="item.appstatus === 'Success'" src="@/assets/success.svg" />
                    <img width="20" class="mb-n02" v-else-if="item.appstatus === 'Pending'" src="@/assets/warning.svg" />
                    <img width="20" class="mb-n02" v-else src="@/assets/error.svg" />
                    {{ item.appstatus || '' }}
                </p>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80" :src="noDataImg" />
                        <h4 class="txt-999 font-weight-regular caption">There is no {{ ordertab === 'exec' ? 'Close' : 'Open' }} order data here yet!</h4>
                    </div>
                </div>
            </template>
        </v-data-table>

        <!-- Drawer -->
        <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="true" width="360"
            color="cardbg" class="pt-2">
            <template v-slot:prepend>
                <v-toolbar class="nav-drawer" density="comfortable">
                    <v-btn icon variant="text" density="comfortable" @click="orderdrawer = false"><v-icon
                            color="subtext" size="20">mdi-close</v-icon></v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>
            <v-list-item class="pt-3">
                <v-list-item-title class="font-weight-medium maintext--text mb-3">{{ singledata.symbol || '' }} <span
                        class="ml-1 txt-999 fs-10">{{ singledata.series || '' }}</span></v-list-item-title>
                <v-list-item-title class="subtext--text font-weight-medium fs-16 mb-1">₹{{ singledata.investmentValue || '0.00' }}</v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-title class="subtext--text font-weight-medium fs-13 mb-1">Order</v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14">Entry Success
                    <p class="float-right mb-0">
                        <img width="20" class="mb-n02" src="@/assets/success.svg" />
                        <span> Success</span>
                    </p>
                </v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-title class="subtext--text font-weight-medium fs-13 mb-1">Verification</v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14">{{ verifyLabel(singledata.verificationStatus) }}
                    <p class="float-right mb-0">
                        <img width="20" class="mb-n02" v-if="singledata.verificationStatus === 'S'" src="@/assets/success.svg" />
                        <img width="20" class="mb-n02" v-else-if="singledata.verificationStatus === 'P'" src="@/assets/warning.svg" />
                        <img width="20" class="mb-n02" v-else src="@/assets/error.svg" />
                        <span> {{ verifyLabel(singledata.verificationStatus) }}</span>
                    </p>
                </v-list-item-title>
            </v-list-item>
            <v-list-item>
                <v-list-item-title class="subtext--text font-weight-medium fs-13 mb-1">Clearing</v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14">{{ singledata.clearingStatus || '' }}
                    <p class="float-right mb-0">
                        <img width="20" class="mb-n02"
                            v-if="singledata.clearingStatus === 'Allotted'" src="@/assets/success.svg" />
                        <img width="20" class="mb-n02"
                            v-else-if="singledata.clearingStatus === 'Fund Pending' || singledata.clearingStatus === 'Sent to NSCCL'"
                            src="@/assets/warning.svg" />
                        <img width="20" class="mb-n02" v-else src="@/assets/error.svg" />
                        <span> {{ clearingLabel(singledata.clearingStatus) }}</span>
                    </p>
                </v-list-item-title>
            </v-list-item>
            <v-divider class="pt-1 mt-2"></v-divider>
            <div class="px-4 pb-6">
                <v-btn v-if="singledata.way === 'exec'" @click="router.push('/bonds')" class="rounded-pill text-none font-weight-bold"
                    block height="40" variant="tonal">Place New order</v-btn>
                <v-row v-else>
                    <v-col cols="12">
                        <v-btn @click="orderdrawer = false; canceldialog = true" class="rounded-pill text-none font-weight-bold"
                            block height="40" variant="tonal">Cancel Order</v-btn>
                    </v-col>
                </v-row>
            </div>
            <v-divider class="pt-1"></v-divider>
            <div class="px-4 pt-1">
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">App no
                    <p class="float-right mb-0">{{ singledata.applicationNumber || '' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title v-if="singledata.series === 'SGB'" class="maintext--text font-weight-bold fs-14 py-4">Quantity
                    <p class="float-right mb-0">{{ singledata.quantity || '' }}</p>
                </v-list-item-title>
                <v-divider v-if="singledata.series === 'SGB'"></v-divider>
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Total amount
                    <p class="float-right mb-0">₹{{ (singledata.investmentValue || 0).toLocaleString() }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Price
                    <p class="float-right mb-0">₹{{ singledata.bid_detail?.price || '0.00' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Series
                    <p class="float-right mb-0">{{ singledata.series || '' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="maintext--text font-weight-bold fs-14 pt-4">Failed reason</v-list-item-title>
                <p class="fs-12 txt-444 font-weight-regular">{{ singledata.fail_reason || 'Order placed successfully' }}</p>
            </div>
        </v-navigation-drawer>

        <!-- Cancel Dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img src="@/assets/orderbook/cancel-icon.svg" alt="cancel icon" />
                <p class="font-weight-bold mt-3 fs-22 lh-24 mb-8">Are you sure you want to<br />cancel this
                    ({{ singledata.symbol || '' }}) order</p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false" color="secbg"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="ordCancel" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
    
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import { useAppStore } from '@/stores/appStore'
import { getBondbook, getBondsgbbook } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()

const uid = ref('')
const orderdrawer = ref(false)
const canceldialog = ref(false)
const singledata = ref({})
const tableloader = ref(true)
const ordertab = ref('open')
const opensearch = ref('')
const filter = ref(null)
const openorders = ref([])
const execorders = ref([])
const orderbookdata = ref([])

const menulist = {
    open: [
        { name: 'Cancel Order', icon: 12, type: 'cd' },
        { name: 'Order Status', icon: 3, type: '', hr: true },
        { name: 'Details', icon: 10, type: 'detail' },
    ],
    exec: [
        { name: 'New Order', icon: 'mdi-plus', type: 'new', trans: 'b' },
        { name: 'Order Status', icon: 3, type: '', hr: true },
        { name: 'Details', icon: 10, type: 'detail' },
    ],
}

const orderheader = [
    { title: 'Symbol', key: 'symbol' },
    { title: 'Order Number', key: 'orderNumber' },
    { title: 'Datetime', key: 'response_datetime' },
    { title: 'Amount', key: 'investmentValue', align: 'right' },
    { title: 'Reason', key: 'reason', width: '30%' },
    { title: 'Status', key: 'reponse_status' },
]

const seriesList = computed(() => {
    const all = orderbookdata.value || []
    const set = new Set(all.map(o => o.series).filter(Boolean))
    return Array.from(set).map(s => ({ series: s }))
})

const filteredRows = computed(() => {
    const list = (orderbookdata.value || []).filter(o => (ordertab.value ? o.way === ordertab.value : true))
    const bySeries = filter.value ? list.filter(o => o.series === filter.value) : list
    const term = opensearch.value?.toLowerCase()
    if (!term) return bySeries
    return bySeries.filter(o =>
        (o.symbol || '').toLowerCase().includes(term) ||
        (o.series || '').toLowerCase().includes(term) ||
        (o.orderNumber || '').toLowerCase().includes(term)
    )
})

function verifyLabel(v) {
    return v === 'S' ? 'Success' : v === 'P' ? 'Pending' : 'Failed'
}
function clearingLabel(v) {
    return v === 'Allotted' ? 'Success' : (v === 'Fund Pending' || v === 'Sent to NSCCL') ? 'Pending' : 'Failed'
}

function normalizeAndSplit(list) {
    const out = []
    for (let q = 0; q < list.length; q++) {
        const row = { ...list[q] }
        try { row.bid_detail = typeof row.bid_detail === 'string' ? eval('(' + row.bid_detail + ')') : row.bid_detail } catch { }
        if (typeof row.response_json === 'string') {
            let cleaned = row.response_json.replace(/'/g, '"').replace(/\bNone\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
            try { row.response_json = JSON.parse(cleaned) } catch { /* ignore */ }
        }
        if (typeof row.response_json === 'string') {
            let cleaned = row.response_json.trim()
            if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) cleaned = cleaned.slice(1, -1)
            try { row.response_json = JSON.parse(cleaned) } catch { /* ignore */ }
        }
        row.series = row.response_json?.series === 'TB' ? 'T-BILL' : row.response_json?.series === 'GS' ? 'G-SEC' : row.response_json?.series === 'GB' ? 'SGB' : (row.response_json?.series || row.series)
        row.fail_reason = row.bid_detail?.requestfor === 'REMOVE' ? 'Order was canceled by yourself.' : row.fail_reason
        row.appstatus = !row.fail_reason ? ((row.verificationStatus === 'S' && row.clearingStatus === 'Allotted') ? 'Success' : ((row.verificationStatus === 'P' && (row.clearingStatus === 'Sent to NSCCL' || row.clearingStatus === 'Fund Pending')) ? 'Pending' : 'Failed')) : 'Failed'
        row.way = (row.orderStatus === 'ES' && (row.verificationStatus === 'S' || row.verificationStatus === 'P') && row.clearingStatus !== 'Rejected') ? 'open' : 'exec'
        out.push(row)
    }
    return out
}

async function getOrderbook() {
    tableloader.value = true
    openorders.value = []
    execorders.value = []
    const currentUid = sessionStorage.getItem('userid')
    if (!currentUid) {
        tableloader.value = false
        orderbookdata.value = []
        return
    }
    uid.value = currentUid
    const datab = await getBondbook([currentUid])
    const datas = await getBondsgbbook([currentUid])
    let data = []
    if (Array.isArray(datab) && datab.length) data = datab
    if (Array.isArray(datas) && datas.length) data = data.length ? data.concat(datas) : datas
    if (Array.isArray(data) && data.length) {
        const normalized = normalizeAndSplit(data)
        orderbookdata.value = normalized
        openorders.value = normalized.filter(o => o.way === 'open')
        execorders.value = normalized.filter(o => o.way === 'exec')
    } else {
        orderbookdata.value = []
    }
    ordertab.value = 'open'
    tableloader.value = false
}

function onTabChange() {
    // keep for parity; counts update via computed
}

function setOrderrowdata(item) {
    orderdrawer.value = true
    singledata.value = { ...item }
}

function ordCancel() {
    // Emit cancel intent; consumer should handle
    window.dispatchEvent(new CustomEvent('bondmodify-event', { detail: singledata.value }))
    canceldialog.value = false
}

onMounted(() => {
    getOrderbook()
})
</script>
