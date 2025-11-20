<template>
    <div>
        <!-- Toolbar -->
        <v-toolbar flat dense class="tool-sty my-1 pl-1 crd-trn">
            <v-btn :disabled="allbasketsdata && allbasketsdata.length >= 10"
                class="elevation-0 rounded-pill font-weight-bold text-none" variant="elevated" color="primary"
                height="40" @click="setSIPdialog(null)">+ Create SIP</v-btn>
            <v-spacer></v-spacer>
            <v-text-field elevation="0" rounded v-model="opensearch" prepend-inner-icon="mdi-magnify"
                placeholder="Search" variant="solo" density="compact" hide-details class="rounded mr-4"
                style="max-width: 220px" flat bg-color="secbg" />
            <v-icon :disabled="loading" :class="['ml-3 cursor-p', { 'reload-rotating': loading }]" @click="getOrderbook"
                color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <!-- SIP Orders Table -->
        <v-data-table :headers="orderheader" :items="filteredSIPs" fixed-header :hide-default-footer="true"
            :loading="loading" class="holdings-table mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;" height="480px"
            :items-per-page="10" :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })"
            @click:row="(_, { item }) => setviewSIP(item)">
            <template #item.sip_name="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.sip_name }}</span>
            </template>
            <template #item.reg_date="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.reg_date ? setDate(item.reg_date) : '-'
                    }}</span>
            </template>
            <template #item.internal="{ item }">
                <span class="font-weight-bold ws-p"
                    :class="item.internal?.active ? 'maingreen--text' : 'mainred--text'">{{
                        item.internal ? (item.internal.active ? 'Active' : 'Inactive') : '-' }}</span>
            </template>
            <template #item.frequency="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ getFrequencyDisplay(item.frequency) }}</span>
            </template>
            <template #item.end_period="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.internal ? item.internal.period : '-' }}/{{
                    item.end_period ? item.end_period : 0 }}</span>
            </template>
            <template #item.actions="{ item }">
                <div @click.stop>
                    <!-- Edit icon matching old app (custom SVG) -->
                    <v-btn icon size="small" class="text-align-center mr-1 mt-2 elevation-0"
                        style="background-color: transparent !important;" @click="setSIPdialog(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none">
                            <path
                                d="M5 18.7782C5.00006 18.481 5.11819 18.1959 5.32841 17.9858L17.8214 5.49281C17.9775 5.33658 18.1629 5.21264 18.3669 5.12808C18.571 5.04352 18.7897 5 19.0106 5C19.2315 5 19.4502 5.04352 19.6542 5.12808C19.8583 5.21264 20.0437 5.33658 20.1998 5.49281L23.0972 8.3902C23.2534 8.54634 23.3774 8.73173 23.4619 8.93578C23.5465 9.13983 23.59 9.35854 23.59 9.57942C23.59 9.8003 23.5465 10.019 23.4619 10.2231C23.3774 10.4271 23.2534 10.6125 23.0972 10.7686L10.6042 23.2616C10.3941 23.4718 10.109 23.5899 9.81179 23.59H6.12085C5.82358 23.59 5.53849 23.4719 5.32829 23.2617C5.11809 23.0515 5 22.7664 5 22.4692V18.7782ZM6.12085 18.7782V22.4692H9.81179L22.3047 9.9762C22.3569 9.92414 22.3983 9.8623 22.4266 9.79421C22.4548 9.72613 22.4694 9.65313 22.4694 9.57942C22.4694 9.5057 22.4548 9.43271 22.4266 9.36463C22.3983 9.29654 22.3569 9.2347 22.3047 9.18264L19.4074 6.28525C19.3553 6.23306 19.2935 6.19165 19.2254 6.1634C19.1573 6.13515 19.0843 6.12061 19.0106 6.12061C18.9369 6.12061 18.8639 6.13515 18.7958 6.1634C18.7277 6.19165 18.6659 6.23306 18.6138 6.28525L6.12085 18.7782Z"
                                fill="currentColor" />
                            <path
                                d="M16.3721 7.73451L20.8555 12.2179L21.649 11.4243L17.1657 6.94095L16.3721 7.73451ZM6.28448 17.8221L10.7679 22.3055L11.5614 21.512L7.07804 17.0286L6.28448 17.8221Z"
                                fill="currentColor" />
                            <path d="M18.6138 9.18265L8.52618 19.2703L9.31974 20.0638L19.4074 9.97621L18.6138 9.18265Z"
                                fill="currentColor" />
                        </svg>
                    </v-btn>
                    <!-- Delete icon matching old app (custom SVG) -->
                    <v-btn icon size="small" class="text-align-center mt-2 elevation-0"
                        style="background-color: transparent !important;" @click="openCancelDialog(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                            </path>
                        </svg>
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
        <v-dialog v-model="basketdialog" width="680" max-width="680" :scrim="false" scrollable>
            <v-card class="pb-6 px-6 rounded-lg" color="cardbg" style="max-height: 85vh;">
                <v-list-item-title class="font-weight-bold title maintext--text mt-4 pb-2"
                    style="border-bottom: 1px solid #EBEEF0;font-size: 20px !important;">
                    {{ setmode ? 'Create' : 'Edit' }} SIP order
                    <v-icon @click="closeSIPDialog" class="float-right" color="maintext"
                        :disabled="orderloader">mdi-close</v-icon>
                </v-list-item-title>
                <v-divider class="mb-2"></v-divider>
                <v-row class="pt-2 pb-4">
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">SIP name</p>
                        <v-text-field placeholder="name" @keypress="isLetter" hide-details height="40" variant="solo"
                            :bg-color="'secbg'" density="compact" flat rounded="xl" class=" mb-0" v-model="sip_name" />
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Start date</p>
                        <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition"
                            location="bottom" min-width="auto">
                            <template #activator="{ props }">
                                <v-text-field placeholder="DD-MM-YYYY" hide-details height="40" variant="solo"
                                    :bg-color="'secbg'" density="compact" flat rounded="xl" class=" mb-0"
                                    hide-spin-buttons :model-value="formattedDate" append-inner-icon="mdi-calendar"
                                    readonly v-bind="props" />
                            </template>
                            <v-date-picker v-model="sipdate" @update:model-value="menu2 = false" :min="maxdate" />
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Frequency</p>
                        <v-select placeholder="Daily, Weekly, Monthly" hide-details v-model="frequency"
                            :items="frequencylist" :bg-color="'secbg'" density="compact" variant="flat" block
                            rounded="xl" class="" item-title="title" item-value="value" />
                    </v-col>
                    <v-col cols="3">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">No.of SIPs</p>
                        <v-text-field placeholder="4" hide-details height="40" variant="solo" :bg-color="'secbg'"
                            density="compact" flat rounded="xl" class=" mb-0" type="number" hide-spin-buttons
                            v-model="sipinstall" />
                    </v-col>
                    <v-col cols="2">
                        <v-select @update:model-value="setSearchFilter" hide-details v-model="searchexch"
                            :items="['NSE', 'BSE']" height="40" variant="solo" :bg-color="'secbg'" density="compact"
                            flat block rounded="xl" class="sip-exchange-select" style="white-space: nowrap;" />
                    </v-col>
                    <!-- Phase 7: Add uppercase conversion on input matching old app -->
                    <v-col cols="10" class="ml-auto">
                        <!-- Autocomplete selection: @update:model-value fires when item is selected (matching old app @change behavior) -->
                        <v-autocomplete :disabled="model && model.set" @update:model-value="setListinbsk"
                            :loading="searchloading" item-title="tsym" return-object rounded="xl" class="" flat
                            variant="solo" :bg-color="'secbg'" density="compact" v-model="model" v-model:search="search"
                            hide-details placeholder="Search script" :items="sfilterdata"
                            prepend-inner-icon="mdi-magnify" append-icon="" no-filter clearable
                            @update:search="onSearchInputUppercase" />
                    </v-col>
                </v-row>

                <!-- Phase 7: Add must-sort and sort-by to match old app -->
                <!-- Table should always be visible, even after selecting from autocomplete (matching old app behavior) -->
                <v-data-table must-sort :sort-by="['idx']" :sort-desc="[true]" fixed-header :hide-default-footer="true"
                    :loading="loading" class="mt-0 rounded-lg overflow-y-auto" style="border: 1px solid #EBEEF0"
                    :height="getTableHeight" :headers="singlebskheader" :items="orderbookdata" :items-per-page="-1">
                    <template #item.tsym="{ item }">
                        <p class="font-weight-medium maintext--text mb-0 ws-p">
                            {{ item.tsym || '' }}
                            <span class="ml-1 txt-999 fs-10">{{ item.exch || '' }}</span>
                        </p>
                    </template>
                    <template #item.qty="{ item }">
                        <v-text-field v-if="item.invby === 'Qty'" height="20" hide-details density="compact"
                            style="border-radius: 10px !important;" rounded="lg" type="number" hide-spin-buttons
                            variant="outlined" v-model="item.qty" />
                        <span v-else>{{ '--' }}</span>
                    </template>
                    <template #item.prc="{ item }">
                        <v-text-field v-if="item.invby === 'Amount'" hide-details density="compact"
                            style="border-radius: 10px !important;" rounded="lg" type="number" hide-spin-buttons
                            variant="outlined" v-model="item.prc" />
                        <span v-else>{{ '--' }}</span>
                    </template>
                    <template #item.invby="{ item }">
                        <v-select @update:model-value="setInvestby(item)" height="20" hide-details density="compact"
                            v-model="item.invby" :items="['Qty', 'Amount']" variant="outlined"
                            style="border-radius: 10px !important;" rounded="lg" />
                    </template>
                    <!-- Phase 7: Use SVG icon matching old app -->
                    <template #item.actions="{ item }">
                        <div @click.stop>
                            <v-btn icon size="small" class="text-align-center mt-2 elevation-0"
                                style="background-color: transparent !important;" @click="setListcancel(item, 'pop')">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                                    <path fill="currentColor" fill-rule="evenodd"
                                        d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                                    </path>
                                </svg>
                            </v-btn>
                        </div>
                    </template>
                    <!-- Phase 7: Use v-col structure matching old app -->
                    <template #no-data>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                            </div>
                        </v-col>
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
                            :loading="orderloader" color="btnclr"
                            class="elevation-0 text-capitalize rounded-pill btntext--text" @click="setPlaceorder">{{
                                setmode ? 'Create' : 'Modify' }} </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <!-- Cancel Dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <div class="text-center">
                    <img src="@/assets/orderbook/cancel-icon.svg" width="50px" alt="cancel icon" />
                </div>
                <p class="font-weight-medium mt-3 lh-24 mb-8" style="font-size: 22px !important;">
                    Are you sure you want to<br />
                    delete this <b>{{ singledata?.sip_name || '' }}</b> SIP order?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6" class="px-2">
                        <v-btn @click="canceldialog = false; singledata = null" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6" class="px-2">
                        <v-btn @click="setcancelBSK" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import noDataImg from '@/assets/no data folder.svg'
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

// Format date from YYYY-MM-DD to DD-MM-YYYY for display
const formattedDate = computed(() => {
    if (!sipdate.value) return ''
    const date = new Date(sipdate.value)
    if (isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
})

// Calculate dynamic table height based on number of items
const getTableHeight = computed(() => {
    const itemCount = orderbookdata.value.length
    if (itemCount === 0) return 240 // Default height when no items
    // Each row is approximately 52px (including padding and input fields), header is 48px
    // Minimum height: 240px, Maximum height: 600px (to fit within dialog with scrolling)
    const rowHeight = 52 // Approximate row height with input fields
    const headerHeight = 48
    const calculatedHeight = headerHeight + (itemCount * rowHeight)
    // Cap at 600px max, but allow scrolling for more items
    return Math.min(Math.max(calculatedHeight, 240), 600)
})

function setDate(date) {
    const d = new Date(`${date.slice(2, 4)}/${date.slice(0, 2)}/${date.slice(4)}`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
    return d
}

// Map frequency from API response to display format
function getFrequencyDisplay(frequency) {
    if (!frequency && frequency !== 0) return '-'

    // Frequency map: API returns 0, 1, 2, 3 or string values
    const freqMap = {
        '0': 'Daily',
        '1': 'Weekly',
        '2': 'Fortnightly',
        '3': 'Monthly',
        'Daily': 'Daily',
        'Weekly': 'Weekly',
        'Fortnightly': 'Fortnightly',
        'Monthly': 'Monthly'
    }

    // Handle both string and number types
    const freqKey = String(frequency)
    return freqMap[freqKey] || frequency || '-'
}

function setSIPdialog(item) {
    if (item) {
        setmode.value = false
        sip_name.value = item.sip_name
        // Map frequency from API response (0,1,2,3 or string) to frequencylist value
        const freqMap = { '0': 'Daily', '1': 'Weekly', '2': 'Fortnightly', '3': 'Monthly' }
        const freqKey = String(item.frequency)
        const mappedFreq = freqMap[freqKey] || item.frequency
        frequency.value = frequencylist.find(f => f.value === mappedFreq)?.value || mappedFreq
        // Convert DDMMYYYY to YYYY-MM-DD for date picker
        if (item.start_date && item.start_date.length === 8) {
            const day = item.start_date.slice(0, 2)
            const month = item.start_date.slice(2, 4)
            const year = item.start_date.slice(4)
            sipdate.value = `${year}-${month}-${day}`
        } else {
            sipdate.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10)
        }
        sipinstall.value = item.end_period
        singledata.value = item
        // Phase 7: Add idx to each scrip for sorting
        if (item.Scrips && item.Scrips.length > 0) {
            for (let e = 0; e < item.Scrips.length; e++) {
                item.Scrips[e].invby = item.Scrips[e].qty && item.Scrips[e].qty > 0 ? 'Qty' : 'Amount'
                item.Scrips[e].idx = e // Phase 7: Add idx for sorting
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

// Phase 7: Handle uppercase conversion for search input
function onSearchInputUppercase(value) {
    if (value && typeof value === 'string') {
        search.value = value.toUpperCase()
    }
}

// Phase 6: Add scrip from search autocomplete (matching old app behavior)
// Flag to prevent duplicate calls
let isProcessingSelection = false

function setListinbsk() {
    // Prevent duplicate calls
    if (isProcessingSelection) {
        return
    }

    // Ensure model has a value and token (same as old app check)
    if (!model.value || !model.value.token) {
        return
    }

    // Set processing flag
    isProcessingSelection = true

    // Check for duplicates before adding (improvement over old app)
    const exists = orderbookdata.value.find(
        o => String(o.token) === String(model.value.token) && o.exch === model.value.exch
    )

    if (exists) {
        appStore.showSnackbar(2, `${model.value.tsym} is already in the SIP order`)
        // Clear model and search after showing error
        isClearingModel = true
        model.value = null
        search.value = null
        nextTick(() => {
            isClearingModel = false
            isProcessingSelection = false
        })
        return
    }

    // Store model values before clearing (needed for creating scrip object)
    const selectedModel = model.value

    // Add scrip with proper defaults matching old app format
    // Old app: { exch, invby: "Qty", prd: "C", qty: "1", token, tsym }
    const scrip = {
        exch: selectedModel.exch,
        tsym: selectedModel.tsym,
        token: selectedModel.token,
        prd: 'C', // Default to Delivery (same as old app)
        invby: 'Qty', // Default investment type (same as old app)
        qty: Number(selectedModel.ls || 1), // Default quantity to lot size or 1 (matching old app: qty: "1")
        idx: orderbookdata.value.length, // Add idx for sorting
    }

    // Add to orderbookdata first (same as old app: this.orderbookdata.push(...))
    orderbookdata.value.push(scrip)

    // Force reactivity update to ensure table refreshes and shows the new item
    orderbookdata.value = [...orderbookdata.value]

    // Clear model and search immediately after adding (same as old app: this.model = [])
    // Set flag to prevent watcher from triggering
    isClearingModel = true
    model.value = null
    search.value = null

    // Reset flags after clearing
    nextTick(() => {
        isClearingModel = false
        isProcessingSelection = false
    })
}

// Phase 6: Change investment type (Qty/Amount) for a scrip
function setInvestby(item) {
    const ind = orderbookdata.value.findIndex(o => String(o.token) === String(item.token) && o.exch === item.exch)
    if (ind >= 0) {
        if (item.invby === 'Qty') {
            // Switch to quantity-based: set default quantity, remove amount
            orderbookdata.value[ind].qty = Number(orderbookdata.value[ind].qty || orderbookdata.value[ind].ls || 1)
            delete orderbookdata.value[ind].prc
        } else if (item.invby === 'Amount') {
            // Switch to amount-based: set default amount, remove quantity
            orderbookdata.value[ind].prc = Number(orderbookdata.value[ind].prc || 1000)
            delete orderbookdata.value[ind].qty
        }
        // Force reactivity update
        orderbookdata.value = [...orderbookdata.value]
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
        appStore.showSnackbar(0, 'SIP Order have been Cancelled')
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

// Phase 6: Remove scrip from orderbookdata or open cancel dialog for SIP order
function setListcancel(item, type) {
    if (type === 'pop') {
        // Phase 6: Remove scrip from orderbookdata
        const did = orderbookdata.value.findIndex(o => String(o.token) === String(item.token) && o.exch === item.exch)
        if (did >= 0) {
            orderbookdata.value.splice(did, 1)
            // Force reactivity update
            orderbookdata.value = [...orderbookdata.value]
        }
    } else {
        // Open cancel dialog for SIP order deletion
        singledata.value = item
        canceldialog.value = true
    }
}

function isLetter(e) {
    const char = String.fromCharCode(e.keyCode)
    if (/^[A-Za-z]+$/.test(char) || char === ' ' || char === '-') return true
    else e.preventDefault()
}

function setviewSIP(item) {
    setSIPdialog(item)
    setmode.value = false
}

// Phase 3: Form Field Validation
function validateSIPForm() {
    const errors = []

    // 1. SIP Name validation
    if (!sip_name.value || !sip_name.value.trim()) {
        errors.push('SIP name is required')
    } else if (!/^[A-Za-z\s-]+$/.test(sip_name.value.trim())) {
        errors.push('SIP name can only contain letters, spaces, and hyphens')
    } else if (setmode.value) {
        // Check for duplicate SIP name (only in create mode)
        const ind = allbasketsdata.value.findIndex(o => o.sip_name === sip_name.value.trim())
        if (ind >= 0) {
            errors.push('SIP name already exists')
        }
    }

    // 2. Start Date validation
    if (!sipdate.value) {
        errors.push('Start date is required')
    } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startDate = new Date(sipdate.value)

        // Check if date is valid
        if (isNaN(startDate.getTime())) {
            errors.push('Start date is invalid')
        } else {
            startDate.setHours(0, 0, 0, 0)
            if (startDate < today) {
                errors.push('Start date must be today or later')
            }
        }
    }

    // 3. Frequency validation
    if (!frequency.value) {
        errors.push('Frequency is required')
    } else {
        const validFrequencies = ['Daily', 'Weekly', 'Fortnightly', 'Monthly']
        if (!validFrequencies.includes(frequency.value)) {
            errors.push('Frequency must be one of: Daily, Weekly, Fortnightly, Monthly')
        }
    }

    // 4. No. of SIPs validation
    if (!sipinstall.value) {
        errors.push('No. of SIPs is required')
    } else if (isNaN(Number(sipinstall.value))) {
        errors.push('No. of SIPs must be a number')
    } else if (Number(sipinstall.value) <= 0) {
        errors.push('No. of SIPs must be greater than zero')
    }

    // 5. Scrips validation
    if (!orderbookdata.value || orderbookdata.value.length === 0) {
        errors.push('At least one scrip is required')
    } else {
        // Validate each scrip
        orderbookdata.value.forEach((scrip, index) => {
            if (!scrip.token) {
                errors.push(`Scrip ${index + 1}: Token is required`)
            }
            if (!scrip.exch) {
                errors.push(`Scrip ${index + 1}: Exchange is required`)
            }
            if (!scrip.tsym) {
                errors.push(`Scrip ${index + 1}: Trading symbol is required`)
            }

            // Validate quantity or amount based on investment type
            if (scrip.invby === 'Qty') {
                if (!scrip.qty || Number(scrip.qty) <= 0) {
                    errors.push(`Scrip ${index + 1} (${scrip.tsym || 'Unknown'}): Quantity must be greater than zero`)
                }
            } else if (scrip.invby === 'Amount') {
                if (!scrip.prc || Number(scrip.prc) <= 0) {
                    errors.push(`Scrip ${index + 1} (${scrip.tsym || 'Unknown'}): Amount must be greater than zero`)
                }
            } else {
                errors.push(`Scrip ${index + 1} (${scrip.tsym || 'Unknown'}): Investment type must be Qty or Amount`)
            }
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

async function setPlaceorder() {
    // Phase 3: Validate form before proceeding
    const validation = validateSIPForm()

    if (!validation.isValid) {
        // Show first error message
        appStore.showSnackbar(2, validation.errors[0])
        return
    }

    const ind = allbasketsdata.value.findIndex(o => o.sip_name === sip_name.value.trim())
    if ((!setmode.value || (setmode.value && ind === -1)) && sipinstall.value > 0) {
        const date = new Date()
        const formattedDate = moment(date).format('DDMMYYYY')
        let item = {}
        const freqMap = { Daily: '0', Weekly: '1', Fortnightly: '2', Monthly: '3' }

        // Phase 4: Format Scrips array according to API requirements
        // Map orderbookdata to ensure proper format (qty/amount as strings, prd defaults to 'C')
        const formattedScrips = orderbookdata.value.map(scrip => {
            const formattedScrip = {
                exch: scrip.exch,
                tsym: scrip.tsym,
                token: scrip.token,
                prd: scrip.prd || 'C', // Default to Delivery if not specified
            }

            // Add qty or prc based on investment type
            if (scrip.invby === 'Qty') {
                // Quantity-based investment
                if (scrip.qty) {
                    formattedScrip.qty = String(scrip.qty)
                }
            } else if (scrip.invby === 'Amount') {
                // Amount-based investment
                if (scrip.prc) {
                    formattedScrip.prc = String(scrip.prc)
                }
            } else {
                // Default to quantity if investment type not set
                formattedScrip.qty = String(scrip.qty || 1)
            }

            return formattedScrip
        })

        if (setmode.value) {
            // Create new SIP order
            item = {
                uid: sessionStorage.getItem('userid'),
                actid: sessionStorage.getItem('userid'),
                reg_date: formattedDate,
                start_date: moment(sipdate.value).format('DDMMYYYY'),
                frequency: freqMap[frequency.value] || '0',
                end_period: sipinstall.value.toString(),
                sip_name: sip_name.value.trim(), // Trim whitespace
                Scrips: formattedScrips,
            }
        } else {
            // Modify existing SIP order
            item = {
                uid: sessionStorage.getItem('userid'),
                actid: sessionStorage.getItem('userid'),
                reg_date: singledata.value.reg_date,
                start_date: moment(sipdate.value).format('DDMMYYYY'),
                frequency: freqMap[frequency.value] || '0',
                end_period: sipinstall.value.toString(),
                sip_name: sip_name.value.trim(), // Trim whitespace
                internal: singledata.value.internal,
                Scrips: formattedScrips,
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
        // This should not happen due to validation, but keep as fallback
        appStore.showSnackbar(2, !(sipinstall.value > 0) ? 'No.of SIPs must be greater than zero' : 'SIP name already exists')
    }
}

// Watch model to handle autocomplete selection (matching old app @change behavior)
// This ensures items are added to table when selected from autocomplete
let isClearingModel = false // Flag to prevent watcher from triggering when we clear the model
watch(model, (newVal, oldVal) => {
    // Skip if we're in the process of clearing the model
    if (isClearingModel) {
        return
    }

    // Only trigger when a new item is selected (not when clearing)
    if (newVal && newVal.token && (!oldVal || !oldVal.token || oldVal.token !== newVal.token)) {
        // Call setListinbsk when model changes (same as old app @change="setListinbsk()")
        setListinbsk()
    }
}, { deep: true })

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

// Phase 2 & 6: Handle SIP order trigger from buy/sell dialog
// Match old code behavior: set default values and add security to orderbookdata
function handleSIPOrderTrigger(event) {
    const securityData = event.detail

    // Debug: Log to verify event is received
    // console.log('SIP order trigger received:', securityData)

    if (securityData && securityData.token) {
        // Initialize dialog in create mode (reset all fields)
        setSIPdialog(null)

        // Match old code: Set default values when triggered from buy/sell dialog
        // sip_name = tsym (stock symbol)
        sip_name.value = securityData.tsym || securityData.symbol || ''

        // frequency = "Daily" (default) - match old code
        const dailyFrequency = frequencylist.find(f => f.title === 'Daily' || f.value === 'Daily')
        frequency.value = dailyFrequency?.value || 'Daily'

        // sipinstall = 5 (default number of SIPs)
        sipinstall.value = 5

        // sipdate = 2 days from today (YYYY-MM-DD format)
        const today = new Date()
        const twoDaysLater = new Date(today)
        twoDaysLater.setDate(today.getDate() + 2)
        sipdate.value = twoDaysLater.toISOString().slice(0, 10)

        // Phase 6 & 7: Add the security to orderbookdata with proper defaults and idx for sorting
        const scrip = {
            exch: securityData.exch,
            tsym: securityData.tsym,
            token: securityData.token,
            prd: 'C', // Default to Delivery
            invby: 'Qty', // Default investment type
            qty: Number(securityData.ls || 1), // Default quantity to lot size (as number for editing)
            idx: orderbookdata.value.length, // Phase 7: Add idx for sorting
        }

        // Phase 6: Check if already exists (prevent duplicates)
        const exists = orderbookdata.value.find(
            o => String(o.token) === String(scrip.token) && o.exch === scrip.exch
        )

        if (!exists) {
            orderbookdata.value.push(scrip)
            // Force reactivity update
            orderbookdata.value = [...orderbookdata.value]
        } else {
            // Show message if duplicate
            appStore.showSnackbar(2, `${scrip.tsym} is already in the SIP order`)
        }

        // Dialog is already opened by setSIPdialog(null)
        // Verify dialog is opened
        // console.log('SIP dialog should be open. basketdialog:', basketdialog.value)

        // Clear URL query params after dialog opens (clean URL)
        // Use nextTick to ensure dialog is fully opened
        nextTick(() => {
            setTimeout(() => {
                const currentPath = window.location.pathname
                if (currentPath === '/orders' && window.location.search) {
                    // Clear query params from URL
                    window.history.replaceState({}, '', '/orders')
                    // console.log('[StockSIPorders] Cleared URL query params after dialog opened')
                }
            }, 200) // Small delay to ensure dialog is fully rendered
        })
    } else {
        // console.log('SIP order trigger received but no token found:', securityData)
    }
}

onMounted(() => {
    getOrderbook()
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    // Phase 2: Listen for SIP order trigger from buy/sell dialog
    window.addEventListener('siporder-trigger', handleSIPOrderTrigger)

    // Check for pending SIP data on mount (in case event was dispatched before component mounted)
    if (typeof window !== 'undefined' && window.__pendingSIPData) {
        // console.log('[StockSIPorders] Found pending SIP data on mount:', window.__pendingSIPData)
        // Wait a bit to ensure component is fully initialized
        setTimeout(() => {
            if (window.__pendingSIPData) {
                handleSIPOrderTrigger({ detail: window.__pendingSIPData })
                window.__pendingSIPData = null
            }
        }, 100)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
    // Phase 2: Clean up SIP order trigger event listener
    window.removeEventListener('siporder-trigger', handleSIPOrderTrigger)
})
</script>

<style scoped>
/* Prevent text truncation in exchange select */
:deep(.sip-exchange-select .v-field__input),
:deep(.sip-exchange-select .v-select__selection) {
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
}

:deep(.sip-exchange-select .v-field__input input) {
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
}

:deep(.sip-exchange-select .v-select__selection-text) {
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
}

/* Reload icon rotation animation */
.reload-rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.maintext--text {
    color: black !important;
}

:deep(.v-text-field input) {
    font-size: 14px !important;
}

/* Data table header font size */
:deep(.v-data-table thead th),
:deep(.v-data-table table thead th),
:deep(.v-data-table .v-data-table__wrapper table thead th),
:deep(.v-data-table.v-data-table--fixed-header thead th),
:deep(.v-data-table.v-data-table--fixed-header table thead th),
:deep(.holdings-table.v-data-table thead th),
:deep(.holdings-table.v-data-table table thead th),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header table thead th) {
    font-size: 13px !important;
}
</style>
