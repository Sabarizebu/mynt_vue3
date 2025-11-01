<template>
    <div>
        <v-toolbar flat dense class="tool-sty crd-trn">
            <v-btn :disabled="allbasketsdata && allbasketsdata.length >= 10"
                class="elevation-0 rounded-pill font-weight-bold text-none" color="primary" height="40"
                @click="setSIPdialog(null)">+ Create SIP</v-btn>
            <v-spacer></v-spacer>
            <v-text-field style="max-width: 220px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search" class="rounded-pill mr-2" variant="solo" density="comfortable" :bg-color="'secbg'" />
            <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table :headers="orderheader" :items="filteredSIPs" fixed-header :hide-default-footer="true"
            :loading="loading" class="mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 4px; border: 1px solid var(--outline)" height="480" :items-per-page="10"
            @click:row="(_, { item }) => setviewSIP(item)">
            <template #item.sip_name="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.sip_name }}</span>
            </template>
            <template #item.reg_date="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.reg_date ? setDate(item.reg_date) : '-' }}</span>
            </template>
            <template #item.internal="{ item }">
                <span class="font-weight-bold ws-p"
                    :class="item.internal?.active ? 'success--text' : 'warning--text'">{{
                        item.internal ? (item.internal.active ? 'Active' : 'Inactive') : '-' }}</span>
            </template>
            <template #item.frequency="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.frequency ? frequencylist[item.frequency] : '-' }}</span>
            </template>
            <template #item.end_period="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.internal ? item.internal.period : '-' }}/{{ item.end_period ? item.end_period : 0 }}</span>
            </template>
            <template #item.actions="{ item }">
                <div @click.stop>
                    <v-btn icon size="small" class="mr-1" @click="setSIPdialog(item)">
                        <v-icon>mdi-square-edit-outline</v-icon>
                    </v-btn>
                    <v-btn icon size="small" @click="openCancelDialog(item)">
                        <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                </div>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImg" />
                        <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                    </div>
                </div>
            </template>
        </v-data-table>

        <!-- SIP Dialog -->
        <v-dialog v-model="basketdialog" width="680" scrollable>
            <v-card class="pb-6 px-6 overflow-hidden rounded-lg" color="cardbg">
                <v-list-item-title class="font-weight-bold title maintext--text mt-4 mb-1">
                    {{ setmode ? 'Create' : 'Edit' }} SIP order
                    <v-icon @click="closeSIPDialog" class="float-right" color="maintext"
                        :disabled="orderloader">mdi-close</v-icon>
                </v-list-item-title>
                <v-divider class="mb-2"></v-divider>
                <v-row class="pt-2 pb-4">
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">SIP name</p>
                        <v-text-field placeholder="name" @keypress="isLetter" hide-details height="40" variant="solo"
                            :bg-color="'secbg'" density="comfortable" flat class="rounded-pill mb-0" v-model="sip_name" />
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Start date</p>
                        <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition"
                            location="bottom" min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field placeholder="YYYY-MM-DD" hide-details height="40" variant="solo"
                                    :bg-color="'secbg'" density="comfortable" flat class="rounded-pill mb-0"
                                    hide-spin-buttons v-model="sipdate" append-icon="mdi-calendar" readonly
                                    v-bind="props" />
                            </template>
                            <v-date-picker v-model="sipdate" @update:model-value="menu2 = false"
                                :min="maxdate" />
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Frequency</p>
                        <v-select placeholder="Daily, Weekly, Monthly" hide-details v-model="frequency"
                            :items="frequencylist" height="40" append-icon="mdi-chevron-down" variant="solo"
                            :bg-color="'secbg'" density="comfortable" flat block class="rounded-pill"
                            item-title="title" item-value="value" />
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">No.of SIPs</p>
                        <v-text-field placeholder="4" hide-details height="40" variant="solo" :bg-color="'secbg'"
                            density="comfortable" flat class="rounded-pill mb-0" type="number" hide-spin-buttons
                            v-model="sipinstall" />
                    </v-col>
                    <v-col cols="2">
                        <v-select @update:model-value="setSearchFilter" hide-details v-model="searchexch"
                            :items="['NSE', 'BSE']" height="40" append-icon="mdi-chevron-down" variant="solo"
                            :bg-color="'secbg'" density="comfortable" flat block class="rounded-pill"
                            item-title="title" item-value="value" />
                    </v-col>
                    <v-col cols="10" class="ml-auto">
                        <v-autocomplete :disabled="model && model.set" @update:model-value="setListinbsk"
                            :loading="searchloading" item-title="tsym" return-object class="rounded-pill" flat
                            variant="solo" :bg-color="'secbg'" density="comfortable" v-model="model"
                            v-model:search="search" hide-details label="Search script" :items="sfilterdata"
                            prepend-inner-icon="mdi-magnify" append-icon="" no-filter clearable />
                    </v-col>
                </v-row>

                <v-data-table v-if="!model || !model.token" fixed-header :hide-default-footer="true"
                    :loading="loading" class="mt-0 rounded-lg overflow-y-auto"
                    style="border: 1px solid var(--outline)" height="240" :headers="singlebskheader"
                    :items="orderbookdata" :items-per-page="20">
                    <template #item.tsym="{ item }">
                        <p class="font-weight-medium maintext--text mb-0 ws-p">
                            {{ item.tsym || '' }}
                            <span class="ml-1 txt-999 fs-10">{{ item.exch || '' }}</span>
                        </p>
                    </template>
                    <template #item.qty="{ item }">
                        <v-text-field v-if="item.invby === 'Qty'" height="30" hide-details dense
                            class="rounded-lg" type="number" hide-spin-buttons variant="outlined"
                            v-model="item.qty" />
                        <span v-else>{{ '--' }}</span>
                    </template>
                    <template #item.prc="{ item }">
                        <v-text-field v-if="item.invby === 'Amount'" hide-details dense class="rounded-lg"
                            type="number" hide-spin-buttons variant="outlined" v-model="item.prc" />
                        <span v-else>{{ '--' }}</span>
                    </template>
                    <template #item.invby="{ item }">
                        <v-select @update:model-value="setInvestby(item)" hide-details v-model="item.invby"
                            :items="['Qty', 'Amount']" dense append-icon="mdi-chevron-down" variant="outlined"
                            class="rounded-lg" />
                    </template>
                    <template #item.actions="{ item, index }">
                        <div @click.stop>
                            <v-btn icon size="small" @click="setListcancel(item, 'pop')">
                                <v-icon>mdi-trash-can-outline</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <template #no-data>
                        <div class="text-center">
                            <div class="mx-auto py-16 mt-16">
                                <img class="mx-auto" width="80px" :src="noDataImg" />
                                <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                            </div>
                        </div>
                    </template>
                </v-data-table>
                <v-row class="pt-3">
                    <v-col cols="9">
                        <p class="fs-13 mb-0">
                            Your SIP will be placed at 9:30 on the due date, <br />
                            if the due date is a market holiday, order will be placed on the next trading day.
                        </p>
                    </v-col>
                    <v-col cols="3" class="text-right">
                        <v-btn
                            :disabled="!sip_name || !frequency || !sipdate || !sipinstall || orderbookdata.length === 0"
                            :loading="orderloader" color="btnclr" class="elevation-0 text-capitalize rounded-pill btntext--text"
                            @click="setPlaceorder">{{ setmode ? 'Create' : 'Modify' }} </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <!-- Cancel Dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">
                    Are you sure you want to <br />
                    delete this <b>{{ singledata?.sip_name || '' }}</b> SIP order?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false; singledata = null" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="setcancelBSK" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'
import { useAppStore } from '@/stores/appStore'
import { getSiporderbook, getSIPOrderset, getKambalaSearch } from '@/components/mixins/getAPIdata'
import moment from 'moment'

const appStore = useAppStore()

const loading = ref(false)
const orderloader = ref(false)
const opensearch = ref('')
const basketdialog = ref(false)
const canceldialog = ref(false)
const setmode = ref(true)
const singledata = ref(null)
const allbasketsdata = ref([])
const orderbookdata = ref([])

const searchexch = ref('NSE')
const maxdate = ref(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10))
const sipdate = ref(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10))
const sip_name = ref(null)
const frequencylist = [
    { title: 'Daily', value: 'Daily' },
    { title: 'Weekly', value: 'Weekly' },
    { title: 'Fortnightly', value: 'Fortnightly' },
    { title: 'Monthly', value: 'Monthly' },
]
const frequency = ref(null)
const sipinstall = ref(null)
const menu2 = ref(false)

const searchloading = ref(false)
const items = ref([])
const sfilterdata = ref([])
const model = ref(null)
const search = ref(null)

const orderheader = [
    { title: 'SIP Name', key: 'sip_name', sortable: false },
    { title: 'Registered on', key: 'reg_date' },
    { title: 'Status', key: 'internal' },
    { title: 'Frequency', key: 'frequency', sortable: false },
    { title: 'Instalments', key: 'end_period', sortable: false },
    { title: '', key: 'actions', sortable: false, align: 'right' },
]

const singlebskheader = [
    { title: 'Instrument', key: 'tsym' },
    { title: 'Invest by', key: 'invby', width: '24%', sortable: false },
    { title: 'Amount', key: 'prc', width: '20%', sortable: false },
    { title: 'Qty', key: 'qty', width: '20%', sortable: false },
    { title: '', key: 'actions', sortable: false, align: 'right' },
]

const filteredSIPs = computed(() => {
    const term = opensearch.value?.toLowerCase()
    if (!term) return allbasketsdata.value
    return allbasketsdata.value.filter(s =>
        s.sip_name?.toLowerCase().includes(term) ||
        s.frequency?.toLowerCase().includes(term)
    )
})

function setDate(date) {
    const d = new Date(`${date.slice(2, 4)}/${date.slice(0, 2)}/${date.slice(4)}`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
    return d
}

function setSIPdialog(item) {
    if (item) {
        setmode.value = false
        sip_name.value = item.sip_name
        frequency.value = frequencylist.find(f => f.value === item.frequency)?.value || frequencylist[item.frequency]?.value
        sipdate.value = `${item.start_date.slice(4)}-${item.start_date.slice(2, 4)}-${item.start_date.slice(0, 2)}`
        sipinstall.value = item.end_period
        singledata.value = item
        if (item.Scrips && item.Scrips.length > 0) {
            for (let e = 0; e < item.Scrips.length; e++) {
                item.Scrips[e].invby = item.Scrips[e].qty && item.Scrips[e].qty > 0 ? 'Qty' : 'Amount'
            }
            orderbookdata.value = item.Scrips
        } else {
            orderbookdata.value = []
        }
    } else {
        setmode.value = true
        sip_name.value = null
        frequency.value = null
        sipdate.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10)
        sipinstall.value = null
        singledata.value = null
        orderbookdata.value = []
    }
    basketdialog.value = true
}

function closeSIPDialog() {
    basketdialog.value = false
    getOrderbook()
}

function setSearchFilter() {
    if (items.value && items.value.length > 0) {
        sfilterdata.value = items.value.filter(i => searchexch.value === i.exch)
    } else {
        sfilterdata.value = []
    }
}

function setListinbsk() {
    if (model.value && model.value.token) {
        orderbookdata.value.push({
            exch: model.value.exch,
            invby: 'Qty',
            prd: 'C',
            qty: '1',
            token: model.value.token,
            tsym: model.value.tsym
        })
        model.value = null
        search.value = null
    }
}

function setInvestby(item) {
    const ind = orderbookdata.value.findIndex(o => o.token === item.token)
    if (ind >= 0) {
        if (item.invby === 'Qty') {
            orderbookdata.value[ind].qty = 1
            delete orderbookdata.value[ind].prc
        } else {
            orderbookdata.value[ind].prc = 1000
            delete orderbookdata.value[ind].qty
        }
    }
}

async function getOrderbook() {
    loading.value = true
    const uid = sessionStorage.getItem('userid')
    const tok = sessionStorage.getItem('msession')
    if (!uid || !tok) {
        appStore.showSnackbar(2, 'Session expired. Please login again.')
        loading.value = false
        return
    }
    const data = `jData={"uid":"${uid}","actid":"${uid}"}&jKey=${tok}`
    const config = await getSiporderbook(data)
    if (config.SipDetails && config.SipDetails.length > 0) {
        allbasketsdata.value = config.SipDetails
    } else {
        allbasketsdata.value = []
        if (config.emsg) {
            appStore.showSnackbar(2, config.emsg)
        }
    }
    loading.value = false
}

async function setcancelBSK() {
    if (!singledata.value || !singledata.value.internal) {
        canceldialog.value = false
        return
    }
    const item = { SipId: singledata.value.internal.SipId }
    const odata = await getSIPOrderset(item, 'CancelSipOrder')
    if (odata.ReqStatus === 'OK') {
        appStore.showSnackbar(1, 'SIP Order have been Cancelled')
        getOrderbook()
    } else {
        appStore.showSnackbar(2, odata.emsg || 'Failed to cancel SIP order')
    }
    canceldialog.value = false
    singledata.value = null
}

function openCancelDialog(item) {
    singledata.value = item
    canceldialog.value = true
}

function setListcancel(item, type) {
    if (type === 'pop') {
        const did = orderbookdata.value.findIndex(o => o.token === item.token)
        if (did >= 0) orderbookdata.value.splice(did, 1)
    } else {
        singledata.value = item
        canceldialog.value = true
    }
}

function isLetter(e) {
    const char = String.fromCharCode(e.keyCode)
    if (/^[A-Za-z]+$/.test(char) || char === ' ') return true
    else e.preventDefault()
}

function setviewSIP(item) {
    setSIPdialog(item)
    setmode.value = false
}

async function setPlaceorder() {
    const ind = allbasketsdata.value.findIndex(o => o.sip_name === sip_name.value)
    if ((!setmode.value || (setmode.value && ind === -1)) && sipinstall.value > 0) {
        const date = new Date()
        const formattedDate = moment(date).format('DDMMYYYY')
        let item = {}
        const freqMap = { Daily: '0', Weekly: '1', Fortnightly: '2', Monthly: '3' }
        if (setmode.value) {
            item = {
                uid: sessionStorage.getItem('userid'),
                actid: sessionStorage.getItem('userid'),
                reg_date: formattedDate,
                start_date: moment(sipdate.value).format('DDMMYYYY'),
                frequency: freqMap[frequency.value] || '0',
                end_period: sipinstall.value.toString(),
                sip_name: sip_name.value,
                Scrips: orderbookdata.value,
            }
        } else {
            item = {
                uid: sessionStorage.getItem('userid'),
                actid: sessionStorage.getItem('userid'),
                reg_date: singledata.value.reg_date,
                start_date: moment(sipdate.value).format('DDMMYYYY'),
                frequency: freqMap[frequency.value] || '0',
                end_period: sipinstall.value.toString(),
                sip_name: sip_name.value,
                internal: singledata.value.internal,
                Scrips: orderbookdata.value,
            }
        }
        orderloader.value = true
        const odata = await getSIPOrderset(item, setmode.value ? 'PlaceSipOrder' : 'ModifySipOrder')
        if (odata.ReqStatus === 'OK') {
            appStore.showSnackbar(1, setmode.value ? 'SIP Order have been Placed' : 'SIP Order have been Modified')
            getOrderbook()
            basketdialog.value = false
        } else {
            appStore.showSnackbar(2, odata.emsg || 'Failed to place/modify SIP order')
        }
        orderloader.value = false
    } else {
        appStore.showSnackbar(2, !(sipinstall.value > 0) ? 'No.of SIPs not be zero' : 'SIP name is already exists')
    }
}

watch(search, async (val) => {
    if (val && val.length > 2) {
        searchloading.value = true
        const uid = sessionStorage.getItem('userid')
        const tok = sessionStorage.getItem('msession')
        if (!uid || !tok) {
            searchloading.value = false
            return
        }
        const res = await getKambalaSearch(`jData={"uid":"${uid}","stext":"${val.replace('&', '%26')}"}&jKey=${tok}`)
        if (res.stat === 'Ok' || res.values) {
            let data = res.values
            for (let c = 0; c < orderbookdata.value.length; c++) {
                const Index = data.findIndex(script => script.token === orderbookdata.value[c].token)
                if (Index >= 0) {
                    data.splice(Index, 1)
                }
            }
            items.value = data
        } else {
            items.value = []
            sfilterdata.value = []
        }
        searchloading.value = false
        setSearchFilter()
    }
})

function onOrderbookUpdate() {
    getOrderbook()
}

onMounted(() => {
    getOrderbook()
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    window.addEventListener('siporder-trigger', (e) => {
        const { item, type } = e.detail
        if (type && item) {
            setSIPdialog(null)
            sip_name.value = item.tsym
            frequency.value = 'Daily'
            sipinstall.value = 5
            sipdate.value = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2).toISOString().slice(0, 10)
            orderbookdata.value.push({
                exch: item.exch,
                invby: 'Qty',
                prd: 'C',
                qty: '1',
                token: item.token,
                tsym: item.tsym
            })
        }
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>
