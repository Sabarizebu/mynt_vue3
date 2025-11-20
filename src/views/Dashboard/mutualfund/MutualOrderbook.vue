<template>
    <div>
        <v-tabs v-model="tab" color="primary" fixed show-arrows density="compact" class="mt-1">
            <v-tab :value="'sip'" class="text-none">Active SIP's</v-tab>
            <v-tab :value="'orders'" class="text-none">Order Book</v-tab>
            <v-tab :value="'siphis'" class="text-none">SIP Order Book</v-tab>
        </v-tabs>

        <!-- Active SIP's -->
        <div v-if="tab === 'sip'">
            <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
                <p class="title font-weight-bold fs-20 mb-0">Orders ({{ orderbooksip.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field style="max-width: 220px" flat bg-color="secbg" rounded v-model="opensearchsip"
                    hide-details prepend-inner-icon="mdi-magnify" placeholder="Search" class="rounded mr-2"
                    variant="solo" density="compact" :bg-color="'secbg'" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheadersip" :items="filteredSip" fixed-header :hide-default-footer="true"
                :loading="loading"
                class=" tabletextnew  holdings-table tabletextnew rounded-lg overflow-y-auto row-hover-actions row-hover-actions"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <template #item.name="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                </template>
                <template #item.InstallmentAmount="{ item }">
                    <span class="text-right d-inline-block w-100">₹{{ fmt(item.InstallmentAmount) }}</span>
                </template>
                <template #item.status="{ item }">
                    <div class="d-flex">
                        <svg v-if="item.status == 'CANCELLED'" xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                            viewBox="0 0 20 15" fill="none">
                            <rect width="20" height="15" rx="7" fill="#DC2626" />
                            <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"
                            fill="none">
                            <rect width="20" height="15" rx="7" fill="#2DB266" />
                            <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p class="ws-p ml-2 font-weight-medium maintext--text mb-0">{{ item.status || '' }}</p>
                    </div>
                </template>
                <template #item.action="{ item }">
                    <div class="d-inline-flex" @click.stop>
                        <v-btn v-if="item.status === 'ACTIVE'" size="small" class="mr-1 secgreen" variant="tonal"
                            style="background-color: #F9E2E8;" @click="openCancel(item)"> <span
                                style="color: #F23545;">Cancel</span> </v-btn>
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
                <p class=" font-weight-bold fs-20 mb-0">Orders ({{ orderbookdata.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field variant="solo" flat bg-color="secbg" style="max-width: 220px" rounded v-model="opensearch"
                    hide-details prepend-inner-icon="mdi-magnify" placeholder="Search" class=" mr-2" density="compact"
                    :bg-color="'secbg'" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheader" :items="paginatedOrders" fixed-header :hide-default-footer="true"
                :loading="loading" class=" tabletextnew holdings-table tabletextnew rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <!-- <template #item.datetime="{ item }">
                    <span class="tabletextnew">{{ item.datetime || '-' }}</span>
                </template> -->
                <template #item.datetime="{ item }">
                    <span class="tabletextnew nowrap">{{ item.datetime || '-' }}</span>
                </template>
                <template #item.name="{ item }">
                    <div>
                        <p class="font-weight-medium tabletextnew mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                        <div class="d-flex mt-1">
                            <v-chip size="x-small" label variant="flat" class="mr-1" :style="{
                                backgroundColor: '#F1F3F8 !important',
                                color: '#666666',
                                borderRadius: '5px'
                            }">
                                <span class="fs-10">{{ item.OrderType === 'NRM' ? 'Lumpsum' : 'SIP' }}</span>
                            </v-chip>

                            <!-- <v-chip size="x-small" label variant="flat" :style="{
                                backgroundColor: '#F1F3F8 !important',
                                color: '#666666',
                                borderRadius: '5px'
                            }"> -->

                            <v-chip size="x-small" label variant="flat" :style="{
                                backgroundColor: '#F1F3F8 !important',
                                color: '#666666',
                                borderRadius: '5px'
                            }">
                                <span class="fs-10">Ord.no : {{ item.OrderId || '-' }}</span>
                            </v-chip>
                        </div>
                    </div>
                </template>
                <!-- <template #item.type="{ item }"> -->
                <!-- <div class="tabletextnew">
                        <span>{{ item.buy_sell ? (item.buy_sell == 'P' ? 'Purchase' : 'Reduction') : '-' }}</span>
                        <br v-if="item.buy_sell && item.buy_sell != 'P'" />
                        <span v-if="item.buy_sell && item.buy_sell != 'P'">Units - {{ item.Orderqty ?
                            Number(item.Orderqty).toFixed(2) : '0.00' }}</span>
                    </div>
                </template> -->
                <template #item.type="{ item }">
                    <div class="tabletextnew">
                        <span>{{ item.buy_sell ? (item.buy_sell == 'P' ? 'Purchase' : 'Reduction') : '-' }}</span>
                        <br v-if="item.buy_sell && item.buy_sell != 'P'" />
                        <span v-if="item.buy_sell && item.buy_sell != 'P'">Units - {{ item.Orderqty ?
                            Number(item.Orderqty).toFixed(2) : '0.00' }}</span>
                    </div>
                </template>
                <template #item.Amount="{ item }">
                    <span class="text-right tabletextnew tabletextnew d-inline-block w-100">₹{{ fmt(item.OrderVal)
                        }}</span>
                </template>
                <template #item.DPFolioNo="{ item }">
                    <span class="tabletextnew">{{ item.DPFolioNo || '-' }}</span>
                </template>
                <!-- <template #item.DPFolioNo="{ item }">
                    <span class="tabletextnew">{{ item.DPFolioNo || '-' }}</span>
                </template> -->
                <template #item.status="{ item }">
                    <v-tooltip location="bottom" color="black">
                        <template #activator="{ props }">
                            <div v-bind="props">
                                <p class="ws-p font-weight-medium maintext--text mb-0 d-flex align-center"
                                    style="gap: 6px;">
                                    <svg v-if="item.status == 'ALLOCATED'" xmlns="http://www.w3.org/2000/svg" width="20"
                                        height="15" viewBox="0 0 20 15" fill="none">
                                        <rect width="20" height="15" rx="7" fill="#2DB266" />
                                        <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <svg v-else-if="item.status == 'REJECTED' || item.status == 'CANCELLED'"
                                        xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"
                                        fill="none">
                                        <rect width="20" height="15" rx="7" fill="#DC2626" />
                                        <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                                        viewBox="0 0 20 15" fill="none">
                                        <rect width="20" height="15" rx="7" fill="#FFB038" />
                                        <path
                                            d="M5.3125 8.75C6.00286 8.75 6.5625 8.19036 6.5625 7.5C6.5625 6.80964 6.00286 6.25 5.3125 6.25C4.62214 6.25 4.0625 6.80964 4.0625 7.5C4.0625 8.19036 4.62214 8.75 5.3125 8.75Z"
                                            fill="white" />
                                        <path
                                            d="M10.3125 8.75C11.0029 8.75 11.5625 8.19036 11.5625 7.5C11.5625 6.80964 11.0029 6.25 10.3125 6.25C9.62214 6.25 9.0625 6.80964 9.0625 7.5C9.0625 8.19036 9.62214 8.75 10.3125 8.75Z"
                                            fill="white" />
                                        <path
                                            d="M15.3125 8.75C16.0029 8.75 16.5625 8.19036 16.5625 7.5C16.5625 6.80964 16.0029 6.25 15.3125 6.25C14.6221 6.25 14.0625 6.80964 14.0625 7.5C14.0625 8.19036 14.6221 8.75 15.3125 8.75Z"
                                            fill="white" />
                                    </svg>
                                    <span class="tabletextnew">{{ item.status ? item.status : '' }}</span>
                                </p>
                            </div>
                        </template>
                        <div style="max-width: 300px">{{ item.Remarks ? item.Remarks : '-' }}</div>
                    </v-tooltip>
                </template>
                <template #item.action="{ item }">
                    <div class="font-weight-medium" style="min-width: 80px" @click.stop>
                        <div class="table-hov">
                            <!-- <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props">
                                        <v-btn v-if="item.OrderStatus == 'Success' && item.type != 'X-SIP'" @click="setModification(item)" style="border: 1px solid var(--outline)" min-width="20px" color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                            <v-icon size="16" color="maintext">mdi-pencil</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
        <span>Modify order</span>
        </v-tooltip> -->
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props">
                                        <v-btn
                                            v-if="item.status == 'PAYMENT NOT INITIATED' && item.Remarks != 'ALLOTMENT DONE'"
                                            @click="openCancelOrder(item)" style="border: 1px solid var(--outline)"
                                            min-width="20px" color="mainbg"
                                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                            <v-icon size="18" color="maintext">mdi-close</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span>Cancel {{ item.buy_sell == 'R' ? 'redemption' : 'order' }}</span>
                            </v-tooltip>
                        </div>
                        <!-- && item.type == 'X-SIP' -->
                        <!-- <v-btn v-if="item.OrderStatus == 'Success' && item.type != 'X-SIP'" @click="setModification(item)" color="secbg" class="rounded-pill text-none subtext--text font-weight-bold elevation-0" small>Modify</v-btn> -->
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
                <!-- Show More Button -->
                <template #bottom>
                    <div v-if="filteredOrders.length > displayLimit" class="text-center py-2">
                        <v-btn variant="text" color="primary" @click="loadMore" :loading="loading" class="text-none">
                            Show More
                        </v-btn>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- SIP Order Book history -->
        <div v-else>
            <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
                <p class="title font-weight-bold mb-0 fs-22">Orders ({{ orderbooksiphis.length }})</p>
                <v-spacer></v-spacer>
                <v-text-field style="max-width: 220px" v-model="opensearchsip" hide-details flat bg-color="secbg"
                    rounded prepend-inner-icon="mdi-magnify" class="rounded-pill mr-2" variant="solo" density="compact"
                    :bg-color="'secbg'" placeholder="Search" />
                <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-data-table :headers="orderheadersiphis" :items="filteredSipHis" fixed-header :hide-default-footer="true"
                :loading="loading" class=" tabletextnew holdings-table fs-13 tabletextnew rounded-lg overflow-y-auto"
                style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
                <template #item.name="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">{{ item.name || '' }}</p>
                </template>
                <template #item.InstallmentAmount="{ item }">
                    <span class="text-right d-inline-block w-100">₹{{ fmt(item.InstallmentAmount) }}</span>
                </template>
                <template #item.status="{ item }">


                    <div class="d-flex">
                        <svg v-if="item.status == 'CANCELLED'" xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                            viewBox="0 0 20 15" fill="none">
                            <rect width="20" height="15" rx="7" fill="#DC2626" />
                            <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"
                            fill="none">
                            <rect width="20" height="15" rx="7" fill="#2DB266" />
                            <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p class="ws-p ml-2 font-weight-medium maintext--text mb-0">{{ item.status || '' }}</p>
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

        <!-- Cancel/Pause dialog -->
        <v-dialog v-model="canceldialog" persistent max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" class="mx-auto text-center" width="13%" />
                <p class="font-weight-medium mt-3  mb-4" style="font-size: 22px !important;">
                    Are you sure you want to <br />
                    cancel
                    {{
                        (singledata?.buy_sell == 'R') ? 'Redemption Order' : (singledata?.OrderType == 'NRM' &&
                            singledata?.buy_sell == 'P') ? 'Lumpsum order' : dialogHead == 'Pause SIP Order' ? 'Pause SIP Order'
                            : 'SIP order' }}?
                </p>
                <div class="px-6 mb-6" v-if="singledata && singledata.OrderType == 'XSP' && dialogHead == ''">
                    <v-select rounded v-model="cancelis" hide-details class="rounded-pill mb-4" density="compact"
                        variant="solo" bg-color="secbg" :items="canceleds" item-title="reason_name" item-value="id" flat
                        placeholder="Cancelation reason"></v-select>
                    <v-text-field v-if="cancelis == 13" flat bg-color="secbg" v-model="cancelremark" hide-details
                        placeholder="Your cancelation reason" class="rounded-pill" density="compact" rounded
                        variant="solo"></v-text-field>
                </div>
                <div class="px-6 mb-6" v-if="dialogHead == 'Pause SIP Order'">
                    <v-select v-model="sipInstalments" hide-details rounded flat rouned class="rounded mb-4"
                        density="compact" variant="solo" bg-color="secbg"
                        :items="[...Array(30).keys()].map(n => (n + 1).toString())"
                        placeholder="Select No Of Instalment Amount"></v-select>
                </div>
                <v-row class="px-6">
                    <v-col cols="6">
                        <v-btn :disabled="loading" @click="canceldialog = false; singledata = null; dialogHead = ''"
                            color="outline" class="rounded-pill text-none subtext--text font-weight-bold elevation-0"
                            block height="40px">No</v-btn>
                    </v-col>
                    <v-col cols="6" v-if="dialogHead == ''">
                        <v-btn :loading="loading"
                            :disabled="singledata && singledata.OrderType == 'XSP' ? !(((cancelis == 13 || cancelis == '13') && cancelremark) || (cancelis && cancelis != 13 && cancelis != '13')) : false"
                            @click="setExition(true)" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40px">Yes</v-btn>
                    </v-col>
                    <v-col cols="6" v-else>
                        <v-btn :loading="loading" :disabled="sipInstalments == ''"
                            @click="setExition('pauseorderplace')" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40px">Yes</v-btn>
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
const cancelis = ref('')
const cancelremark = ref('')
const canceleds = ref([])
const displayLimit = ref(50)
// const cancelis = ref('')
// const cancelremark = ref('')
// const canceleds = ref([])

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

const paginatedOrders = computed(() => {
    return filteredOrders.value.slice(0, displayLimit.value)
})

function loadMore() {
    displayLimit.value += 50
}

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
        if (data?.stat === 'Ok' && Array.isArray(data.data)) {
            orderbookdata.value = data.data
            displayLimit.value = 50 // Reset limit when refreshing
        }
        if (sip?.stat === 'Ok' && Array.isArray(sip.data)) orderbooksip.value = sip.data
        if (siphis?.stat === 'Ok' && Array.isArray(siphis.data)) orderbooksiphis.value = siphis.data
    } catch (e) { appStore.showSnackbar(2, 'Failed to load MF orders') }
    loading.value = false
}

async function openCancelOrder(item) {
    console.log("itemmmmm", item);

    singledata.value = item
    dialogHead.value = ''
    cancelis.value = ''
    cancelremark.value = ''
    if (item?.OrderType === 'XSP') {
        try {
            const reasons = await getMFcancelation()
            if (reasons?.stat === 'Ok' && Array.isArray(reasons.data)) {
                canceleds.value = reasons.data
            }
        } catch (e) {
            console.error('Failed to load cancellation reasons', e)
        }
    }
    canceldialog.value = true
}

async function openCancel(item) {
    console.log("itemmmmm", item);

    singledata.value = item;
    dialogHead.value = '';
    canceldialog.value = true;

    if (item?.OrderType === 'XSP') {
        try {
            const reasons = await getMFcancelation();
            if (reasons?.stat === 'Ok' && Array.isArray(reasons.data)) {
                canceleds.value = reasons.data;
            }
        } catch (e) {
            console.error('Failed to load cancellation reasons', e);
        }
    }
}

function openPause(item) { singledata.value = item; dialogHead.value = 'Pause SIP Order'; canceldialog.value = true }

async function setExition(action) {
    try {
        loading.value = true
        if (action === 'pauseorderplace') {
            const res = await getmfpauseapi([singledata.value.OrderId, singledata.value.SIPRegnNo, singledata.value.Scheme_Code, sipInstalments.value, ''])
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'SIP paused')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to pause')
        } else if (singledata.value?.OrderType === 'XSP') {
            // xsip cancel requires reason
            const reasonId = cancelis.value || '13'
            const remark = cancelis.value == 13 || cancelis.value == '13' ? cancelremark.value : ''
            const res = await getMFcancelxsip([singledata.value.OrderId, singledata.value.SIPRegnNo, singledata.value.Scheme_Code, reasonId, remark])
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'Order cancelled')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to cancel')
        } else {
            const res = await getMFcancellum(singledata.value.OrderId, singledata.value.buy_sell)
            if (res?.stat === 'Ok') appStore.showSnackbar(1, res.msg || 'Order cancelled')
            else appStore.showSnackbar(2, res?.emsg || 'Failed to cancel')
        }
        canceldialog.value = false
        cancelis.value = ''
        cancelremark.value = ''
        await getOrderbook()
    } finally { loading.value = false }
}

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
<style>
.row-hover-actions tbody tr .v-btn {
    visibility: hidden;
}

.row-hover-actions tbody tr:hover .v-btn {
    visibility: visible;
}

.tabletextnew {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #000000 !important;
}
</style>
<style>
.row-hover-actions tbody tr .v-btn {
    visibility: hidden;
}

.row-hover-actions tbody tr:hover .v-btn {
    visibility: visible;
}

.tabletextnew {
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #000000 !important;
}

.tabletextnew thead th {
    white-space: nowrap !important;
}

.nowrap {
    white-space: nowrap;
}
</style>