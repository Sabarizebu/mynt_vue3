<template>
    <div>
        <v-tabs v-model="tab" color="primary" fixed show-arrows density="compact" class="mb-4">
            <v-tab :value="'sip'" class="text-none">Active SIP's</v-tab>
            <v-tab :value="'orders'" class="text-none">Order Book</v-tab>
            <v-tab :value="'siphis'" class="text-none">SIP Order Book</v-tab>
        </v-tabs>

        <!-- Active SIP's -->
        <div v-if="tab === 'sip'">
            <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
                <p class="title font-weight-bold mb-0">Orders ({{ orderbooksip.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field style="max-width: 220px" v-model="opensearchsip" hide-details
                    prepend-inner-icon="mdi-magnify" label="Search" class="rounded-pill mr-2" variant="solo"
                    density="comfortable" :bg-color="'secbg'" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheadersip" :items="filteredSip" fixed-header :hide-default-footer="true"
                :loading="loading" class="mt-3 rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <template #item.name="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                </template>
                <template #item.InstallmentAmount="{ item }">
                    <span class="text-right d-inline-block w-100">₹{{ fmt(item.InstallmentAmount) }}</span>
                </template>
                <template #item.status="{ item }">
                    <p class="ws-p font-weight-medium maintext--text mb-0">{{ item.status || '' }}</p>
                </template>
                <template #item.action="{ item }">
                    <div class="d-inline-flex" @click.stop>
                        <v-btn v-if="item.status === 'ACTIVE'" size="small" class="mr-1" variant="tonal" color="secred"
                            @click="openCancel(item)">Cancel</v-btn>
                        <v-btn v-if="item.status === 'ACTIVE'" size="small" variant="tonal" color="primary"
                            @click="openPause(item)">Pause</v-btn>
                    </div>
                </template>
                <template #no-data>
                    <div class="text-center">
                        <div class="mx-auto py-16 mt-16">
                            <img class="mx-auto" width="80" :src="noDataImg" />
                            <h4 class="txt-999 font-weight-regular caption">There is no data here yet!</h4>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- Orders -->
        <div v-else-if="tab === 'orders'">
            <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
                <p class="title font-weight-bold mb-0">Orders ({{ orderbookdata.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field style="max-width: 220px" v-model="opensearch" hide-details
                    prepend-inner-icon="mdi-magnify" label="Search" class="rounded-pill mr-2" variant="solo"
                    density="comfortable" :bg-color="'secbg'" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheader" :items="filteredOrders" fixed-header :hide-default-footer="true"
                :loading="loading" class="mt-3 rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <template #item.name="{ item }">
                    <div>
                        <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                        <div class="d-flex mt-1">
                            <v-chip size="x-small" color="secbg" class="mr-1" text-color="subtext">
                                <span class="fs-10">{{ item.OrderType === 'NRM' ? 'Lumpsum' : 'SIP' }}</span>
                            </v-chip>
                            <v-chip size="x-small" color="secbg" text-color="subtext">
                                <span class="fs-10">Ord.no : {{ item.OrderId || '-' }}</span>
                            </v-chip>
                        </div>
                    </div>
                </template>
                <template #item.Amount="{ item }">
                    <span class="text-right d-inline-block w-100">₹{{ fmt(item.OrderVal) }}</span>
                </template>
                <template #item.status="{ item }">
                    <v-tooltip location="bottom" color="black">
                        <template #activator="{ props }">
                            <p v-bind="props" class="ws-p font-weight-medium maintext--text mb-0">{{ item.status || ''
                            }}</p>
                        </template>
                        <div style="max-width:300px">{{ item.Remarks || '-' }}</div>
                    </v-tooltip>
                </template>
                <template #item.action="{ item }">
                    <div class="d-inline-flex" @click.stop>
                        <v-btn v-if="item.status === 'PAYMENT NOT INITIATED' && item.Remarks !== 'ALLOTMENT DONE'"
                            size="small" variant="tonal" color="secred" @click="openCancelOrder(item)">
                            Cancel
                        </v-btn>
                    </div>
                </template>
                <template #no-data>
                    <div class="text-center">
                        <div class="mx-auto py-16 mt-16">
                            <img class="mx-auto" width="80" :src="noDataImg" />
                            <h4 class="txt-999 font-weight-regular caption">There is no data here yet!</h4>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- SIP Order Book history -->
        <div v-else>
            <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
                <p class="title font-weight-bold mb-0">Orders ({{ orderbooksiphis.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field style="max-width: 220px" v-model="opensearchsip" hide-details
                    prepend-inner-icon="mdi-magnify" label="Search" class="rounded-pill mr-2" variant="solo"
                    density="comfortable" :bg-color="'secbg'" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheadersiphis" :items="filteredSipHis" fixed-header :hide-default-footer="true"
                :loading="loading" class="mt-3 rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <template #item.name="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                </template>
                <template #item.InstallmentAmount="{ item }">
                    <span class="text-right d-inline-block w-100">₹{{ fmt(item.InstallmentAmount) }}</span>
                </template>
                <template #item.status="{ item }">
                    <p class="ws-p font-weight-medium maintext--text mb-0">{{ item.status || '' }}</p>
                </template>
                <template #no-data>
                    <div class="text-center">
                        <div class="mx-auto py-16 mt-16">
                            <img class="mx-auto" width="80" :src="noDataImg" />
                            <h4 class="txt-999 font-weight-regular caption">There is no data here yet!</h4>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- Cancel/Pause dialog -->
        <v-dialog v-model="canceldialog" max-width="420">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">{{ dialogHead || 'Cancel SIP order?' }}</p>
                <div class="px-6 mb-6" v-if="dialogHead === 'Pause SIP Order'">
                    <v-select v-model="sipInstalments" hide-details append-icon="mdi-chevron-down"
                        class="rounded-pill mb-2" :items="[...Array(30).keys()].map(n => (n + 1).toString())"
                        variant="solo" :bg-color="'secbg'" density="comfortable"
                        placeholder="Select No Of Instalment Amount" />
                </div>
                <v-row class="px-6">
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false; singledata = null; dialogHead = ''" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn :loading="loading" :disabled="dialogHead === 'Pause SIP Order' && !sipInstalments"
                            @click="confirmAction" color="btnclr"
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
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'
import { useAppStore } from '@/stores/appStore'
import { getMFlumsum_order, getmfsipnewapi, getmfsipnewapihisty, getMFcancellum, getMFcancelxsip, getMFcancelation, getmfpauseapi } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()

const tab = ref('sip')
const loading = ref(false)
const orderbookdata = ref([])
const orderbooksip = ref([])
const orderbooksiphis = ref([])
const opensearch = ref('')
const opensearchsip = ref('')
const canceldialog = ref(false)
const singledata = ref(null)
const dialogHead = ref('')
const sipInstalments = ref('')

const orderheader = [
    { title: 'Date', key: 'datetime' },
    { title: 'Fund name', key: 'name', width: '40%' },
    { title: '', key: 'action' },
    { title: 'Transaction Type', key: 'type' },
    { title: 'Invest amt', key: 'Amount', align: 'right' },
    { title: 'Folio no.', key: 'DPFolioNo' },
    { title: 'Status', key: 'status' },
]

const orderheadersip = [
    { title: 'SIP Register Date', key: 'SIPRegnDate' },
    { title: 'Start Date', key: 'StartDate' },
    { title: 'End Date', key: 'EndDate' },
    { title: 'Next SIP Date', key: 'NextSIPDate' },
    { title: 'Fund name', key: 'name' },
    { title: '', key: 'action' },
    { title: 'Frequency Type', key: 'FrequencyType' },
    { title: 'Installment amt', key: 'InstallmentAmount', align: 'right' },
    { title: 'SIP Register No.', key: 'SIPRegnNo' },
    { title: 'Status', key: 'status' },
]

const orderheadersiphis = [
    { title: 'SIP Register Date', key: 'SIPRegnDate' },
    { title: 'Start Date', key: 'StartDate' },
    { title: 'End Date', key: 'EndDate' },
    { title: 'Fund name', key: 'name' },
    { title: 'Frequency Type', key: 'FrequencyType' },
    { title: 'Installment amt', key: 'InstallmentAmount', align: 'right' },
    { title: 'SIP Register No.', key: 'SIPRegnNo' },
    { title: 'Status', key: 'status' },
]

const filteredSip = computed(() => {
    const q = opensearchsip.value?.toLowerCase()
    if (!q) return orderbooksip.value
    return orderbooksip.value.filter(o => (o.name || '').toLowerCase().includes(q))
})
const filteredSipHis = computed(() => {
    const q = opensearchsip.value?.toLowerCase()
    if (!q) return orderbooksiphis.value
    return orderbooksiphis.value.filter(o => (o.name || '').toLowerCase().includes(q))
})
const filteredOrders = computed(() => {
    const q = opensearch.value?.toLowerCase()
    if (!q) return orderbookdata.value
    return orderbookdata.value.filter(o => (o.name || '').toLowerCase().includes(q))
})

function fmt(v) { const n = Number(v); return isFinite(n) ? n.toFixed(2) : '0.00' }

async function getOrderbook() {
    loading.value = true
    orderbookdata.value = []
    orderbooksip.value = []
    orderbooksiphis.value = []
    const uid = sessionStorage.getItem('userid')
    try {
        const data = await getMFlumsum_order([uid, '', ''])
        const sip = await getmfsipnewapi()
        const siphis = await getmfsipnewapihisty()
        if (data?.stat === 'Ok' && Array.isArray(data.data)) orderbookdata.value = data.data
        if (sip?.stat === 'Ok' && Array.isArray(sip.data)) orderbooksip.value = sip.data
        if (siphis?.stat === 'Ok' && Array.isArray(siphis.data)) orderbooksiphis.value = siphis.data
    } catch (e) { appStore.showSnackbar(2, 'Failed to load MF orders') }
    loading.value = false
}

function openCancelOrder(item) { singledata.value = item; dialogHead.value = ''; canceldialog.value = true }
function openCancel(item) { singledata.value = item; dialogHead.value = ''; canceldialog.value = true }
function openPause(item) { singledata.value = item; dialogHead.value = 'Pause SIP Order'; canceldialog.value = true }

async function confirmAction() {
    try {
        loading.value = true
        if (dialogHead.value === 'Pause SIP Order') {
            const res = await getmfpauseapi([singledata.value.OrderId, singledata.value.SIPRegnNo, singledata.value.Scheme_Code, sipInstalments.value, ''])
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'SIP paused')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to pause')
        } else if (singledata.value?.OrderType === 'XSP') {
            // xsip cancel requires reason
            const reasons = await getMFcancelation(); const first = reasons?.data?.[0]?.id || '13'
            const res = await getMFcancelxsip([singledata.value.OrderId, singledata.value.SIPRegnNo, singledata.value.Scheme_Code, first, ''])
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'Order cancelled')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to cancel')
        } else {
            const res = await getMFcancellum(singledata.value.OrderId, singledata.value.buy_sell)
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'Order cancelled')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to cancel')
        }
        canceldialog.value = false; await getOrderbook()
    } finally { loading.value = false }
}

onMounted(() => { getOrderbook() })
</script>
