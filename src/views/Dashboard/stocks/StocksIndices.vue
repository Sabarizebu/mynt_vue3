<template>
    <div>
        <v-breadcrumbs class="pa-0 pt-2" :items="bcitems">
            <template v-slot:item="{ item }">
                <v-breadcrumbs-item :class="!item.disabled ? 'primary--text cursor-p' : ''"
                    @click="router.push(item.href)" :disabled="item.disabled">
                    {{ item.text == "exch" ? exchtype : item.text }}
                </v-breadcrumbs-item>
            </template>
            <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
            </template>
        </v-breadcrumbs>
        <v-toolbar flat density="compact" class="tool-sty crd-trn">
            <span class="title font-weight-bold">All Indices</span>
            <v-spacer></v-spacer>

            <div class="mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none">
                    <path d="M1.5 2.5H11.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M14.5 2.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M14.5 6.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M14.5 10.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M14.5 14.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M1.5 6.5H7.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M1.5 10.5H11.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                    <path d="M1.5 14.5H6.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <span class="subtitle-1 font-weight-bold">{{ totalcount }} Indices</span>
        </v-toolbar>
        <p class="fs-12 subtext--text mb-10">
            Stock market indexes represent a specific group of shares selected based on criteria like trading frequency
            and share size. These indexes serve as a way to track market direction and changes. serve as statistical
            indicators that measure fluctuations in financial markets. These indices provide
            performance insights for specific market segments or the overall market.
        </p>
        <div>
            <v-toolbar class="tool-sty elevation-0 mb-4 crd-trn" density="compact">
                <p class="font-weight-bold mb-0">{{ exchtype }} {{ exchcount[exchtype] ? exchcount[exchtype] : "0" }}
                    indices</p>

                <v-spacer></v-spacer>

                <v-select @update:model-value="setTabchange()" style="max-width: 180px" v-model="exchtype" hide-details
                    append-icon="mdi-chevron-down" prepend-inner-icon="mdi-playlist-check" class="rounded-pill mr-3"
                    density="compact" variant="solo" bg-color="secbg" :items="['NSE', 'BSE', 'MCX']" label="Filter"></v-select>

                <v-text-field style="max-width: 220px" :disabled="isloading" v-model="opensearch" hide-details
                    prepend-inner-icon="mdi-magnify" label="Search for Indices"
                    class="rounded-pill d-none d-sm-flex" density="compact" variant="solo" bg-color="secbg"></v-text-field>
            </v-toolbar>
            <v-data-table must-sort disable-sort fixed-header mobile :loading="isloading"
                class="rounded-lg overflow-y-auto mb-6" style="border-radius: 4px; border: 1px solid #EBEEF0"
                :headers="indiceheader" :search="opensearch" :items="filteredTablesecdata" :items-per-page="10">
                <template v-slot:[`item.tsym`]="{ item }">
                    <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                        class="font-weight-medium text-capitalize txt-dec-cust ws-p">{{ item.tsym }}</span>
                </template>

                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="font-weight-medium maintext--text">₹<span :id="`indi${item.token}ltp`">{{
                            item.ltp ? Number(item.ltp).toFixed(2) : '0.00' }}</span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`indi${item.token}chpclr`"
                            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
                            <span :id="`indi${item.token}ch`">{{ item.ch ? item.ch : '0.00' }} </span>
                            <span :id="`indi${item.token}chp`"> ({{ item.chp ? item.chp : '0.00' }}%)</span>
                        </span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`indi${item.token}vol`">{{
                        item.vol ? item.vol : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`indi${item.token}op`">{{
                        item.op ? item.op : "0.00" }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`indi${item.token}cp`">{{
                        item.cp ? item.cp : "0.00" }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`indi${item.token}high`">{{
                        item.high ? item.high : "0.00" }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`indi${item.token}low`">{{
                        item.low ? item.low : "0.00" }}</span>
                </template>
                <template v-slot:no-data>
                    <v-col cols="12" class="text-center pa-16">
                        <div class="mx-auto">
                            <img class="align-self-stretch mx-auto" width="80px"
                                src="/src/assets/no data folder.svg" alt="no data" />
                            <h5 class="txt-999 font-weight-regular">There is no Indices data here yet!</h5>
                        </div>
                    </v-col>
                </template>
            </v-data-table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore'
import { getIndexList, getLtpdata } from '@/components/mixins/getAPIdata'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Reactive data
const bcitems = ref([
    {
        text: "Stocks",
        disabled: false,
        href: "/stocks",
    },
    {
        text: "All indices",
        disabled: true,
        href: "/stocks/allindices",
    },
    {
        text: "exch",
        disabled: true,
        href: "/stocks/allindices?exch=NSE",
    },
])

const uid = ref(null)
const mtoken = ref(null)
const stoken = ref(null)

const isloading = ref(true)
const exchtype = ref("NSE")

const opensearch = ref(null)

const totalcount = ref(0)
const exchcount = ref({})
const allindicedata = ref([])
const tablesecdata = ref([])

// Computed
const indiceheader = computed(() => {
    return [
        { text: "Index name", value: "tsym", sortable: false, class: "ws-p" },
        { text: "Price", value: "ltp", sortable: false, align: "end", class: "ws-p" },
        { text: "Open", value: "op", align: "end", class: "ws-p" },
        { text: "High", value: "high", align: "end", class: "ws-p" },
        { text: "Low", value: "low", align: "end", class: "ws-p" },
        { text: "Close", value: "cp", align: "end", class: "ws-p" },
        { text: "Volume", value: "vol", align: "end", class: "ws-p" },
    ];
})

// Filtered data based on exchange type
const filteredTablesecdata = computed(() => {
    if (!exchtype.value) return tablesecdata.value
    return tablesecdata.value.filter(item => item.exch === exchtype.value)
})

// Methods
const setTabchange = () => {
    // Force reactivity update for filtered data
    const t = [...tablesecdata.value]
    tablesecdata.value = []
    setTimeout(() => {
        tablesecdata.value = t
    }, 1)
}

const setSinglestock = (tsym, item) => {
    if (uid.value) {
        let path = [0, item.token, item.exch, item.tsym]
        router.push({ name: "stocks details", params: { val: path } })
    } else {
        router.push({ name: "stocks advance decline", params: { abc: tsym, main: "find" } })
    }
}

const getAllindicedata = async () => {
    let data = await getIndexList()
    if (data && Object.keys(data).length > 0) {
        var wsdata = []
        allindicedata.value = []
        Object.entries(data).forEach(([key, value], i) => {
            if (i < 3) {
                for (let d = 0; d < value.length; d++) {
                    if (value[d] && value[d].idxname) {
                        wsdata.push({
                            exch: key,
                            token: value[d].token,
                            tsym: value[d].idxname,
                        })
                    }
                    allindicedata.value.push({
                        tsym: value[d].idxname,
                        token: value[d].token,
                        pe: 0,
                        pb: 0,
                        exch: key,
                    })
                }
            }
        })
        setWebsocket("sub", wsdata, "allind")
        totalcount.value = allindicedata.value.length
        tablesecdata.value = allindicedata.value

        exchcount.value = tablesecdata.value.reduce((acc, { exch }) => {
            acc[exch] = (acc[exch] || 0) + 1
            return acc
        }, {})
    } else {
        totalcount.value = 0
        allindicedata.value = []
    }
    isloading.value = false
}

const setWebsocket = async (flow, data, is) => {
    if (uid.value) {
        // Use Custom Events instead of EventBus
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow, data, is, page: 'stockINC' }
        }))
    } else {
        let raw = await getLtpdata(data)
        raw = raw.data
        for (let l = 0; l < allindicedata.value.length; l++) {
            let v = raw[allindicedata.value[l].token]
            if (v) {
                allindicedata.value[l]["ltp"] = Number(v.lp).toFixed(2)
                allindicedata.value[l]["ch"] = Number(allindicedata.value[l].ltp - Number(v.close)).toFixed(2)
                allindicedata.value[l]["chp"] = Number(v.change)
                allindicedata.value[l]["vol"] = v.vol ? Number(v.vol).toFixed(2) : (0).toFixed(2)
                allindicedata.value[l]["op"] = Number(v.open) ? Number(v.open).toFixed(2) : (0).toFixed(2)
                allindicedata.value[l]["cp"] = Number(v.close) ? Number(v.close).toFixed(2) : (0).toFixed(2)
                allindicedata.value[l]["high"] = Number(v.high) ? Number(v.high).toFixed(2) : (0).toFixed(2)
                allindicedata.value[l]["low"] = Number(v.low) ? Number(v.low).toFixed(2) : (0).toFixed(2)
            }
        }
    }
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (!token) return
    
    let p = allindicedata.value.findIndex((o) => o.token == token)
    if (p >= 0 && allindicedata.value[p].token == token) {
        allindicedata.value[p].ltp = Number(data.lp || data.ltp || 0).toFixed(2)
        allindicedata.value[p]["ch"] = Number(data.ch || data.c || 0) > 0 || Number(data.ch || data.c || 0) < 0 
            ? Number(data.ch || data.c || 0).toFixed(2) : (0).toFixed(2)
        allindicedata.value[p]["chp"] = Number(data.chp || 0).toFixed(2)
        allindicedata.value[p]["vol"] = Number(data.volume || data.vol || 0).toFixed(2)
        allindicedata.value[p]["op"] = Number(data.open_price || data.open || 0) ? Number(data.open_price || data.open || 0).toFixed(2) : (0).toFixed(2)
        allindicedata.value[p]["cp"] = Number(data.prev_close_price || data.close || 0) ? Number(data.prev_close_price || data.close || 0).toFixed(2) : (0).toFixed(2)
        allindicedata.value[p]["high"] = Number(data.high_price || data.high || 0) ? Number(data.high_price || data.high || 0).toFixed(2) : (0).toFixed(2)
        allindicedata.value[p]["low"] = Number(data.low_price || data.low || 0) ? Number(data.low_price || data.low || 0).toFixed(2) : (0).toFixed(2)

        let tag = document.getElementById(`indi${token}ltp`)
        if (tag) {
            document.getElementById(`indi${token}ltp`).innerHTML = allindicedata.value[p].ltp
            const chTag = document.getElementById(`indi${token}ch`)
            const chpTag = document.getElementById(`indi${token}chp`)
            const chpclrTag = document.getElementById(`indi${token}chpclr`)
            if (chTag) chTag.innerHTML = allindicedata.value[p].ch
            if (chpTag) chpTag.innerHTML = ` (${allindicedata.value[p].chp}%)`
            if (chpclrTag) {
                const ch = parseFloat(allindicedata.value[p].ch) || 0
                chpclrTag.className = ch > 0 
                    ? 'font-weight-medium fs-12 ws-p maingreen--text'
                    : ch < 0 
                        ? 'font-weight-medium fs-12 ws-p mainred--text'
                        : 'font-weight-medium fs-12 ws-p subtext--text'
            }
            const volTag = document.getElementById(`indi${token}vol`)
            const opTag = document.getElementById(`indi${token}op`)
            const cpTag = document.getElementById(`indi${token}cp`)
            const highTag = document.getElementById(`indi${token}high`)
            const lowTag = document.getElementById(`indi${token}low`)
            if (volTag) volTag.innerHTML = allindicedata.value[p].vol
            if (opTag) opTag.innerHTML = allindicedata.value[p].op
            if (cpTag) cpTag.innerHTML = allindicedata.value[p].cp
            if (highTag) highTag.innerHTML = allindicedata.value[p].high
            if (lowTag) lowTag.innerHTML = allindicedata.value[p].low
        }
    }
}

// WebSocket event handler
const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == "stockINC" && allindicedata.value && allindicedata.value.length > 0) {
            optionChainDataParse(data)
        }
    } else if (detail && typeof detail === 'object') {
        if (detail.page === 'stockINC' && (detail.token || detail.tk)) {
            optionChainDataParse(detail)
        }
    }
}

// User event handler
const handleUserEvent = () => {
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        if (!uid.value && !stoken.value) {
            mtoken.value = sessionStorage.getItem("msession")
            stoken.value = sessionStorage.getItem("usession")
            uid.value = sessionStorage.getItem("userid")
        }
    }
    getAllindicedata()
}

// Watch for exchange type changes from route
watch(() => route.query.exch, (newExch) => {
    if (newExch && ['NSE', 'BSE', 'MCX'].includes(newExch)) {
        exchtype.value = newExch
        bcitems.value[2].text = newExch
        bcitems.value[2].href = `/stocks/allindices?exch=${newExch}`
    }
}, { immediate: true })

// Watch auth store for login changes
watch(() => [authStore.uid, authStore.mtoken], ([newUid, newMtoken]) => {
    if (newUid && newMtoken) {
        uid.value = newUid
        mtoken.value = newMtoken
        stoken.value = sessionStorage.getItem("usession")
        getAllindicedata()
    }
}, { immediate: false })

// Lifecycle hooks
onMounted(() => {
    // Emit events using Custom Events
    window.dispatchEvent(new CustomEvent('tabBar-load'))
    window.dispatchEvent(new CustomEvent('login-event'))

    // Check if user is logged in
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        if (!uid.value && !stoken.value) {
            mtoken.value = sessionStorage.getItem("msession")
            stoken.value = sessionStorage.getItem("usession")
            uid.value = sessionStorage.getItem("userid")
        }
        getAllindicedata()
    } else {
        getAllindicedata()
    }

    // Listen for user events
    window.addEventListener('user-event', handleUserEvent)

    // Listen for WebSocket connection events
    window.addEventListener('web-scoketConn', handleWebSocketConnection)
})

onBeforeUnmount(() => {
    window.removeEventListener('user-event', handleUserEvent)
    window.removeEventListener('web-scoketConn', handleWebSocketConnection)
})
</script>

<style scoped>
.cursor-p {
    cursor: pointer;
}
</style>
