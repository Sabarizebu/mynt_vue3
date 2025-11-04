<template>
    <div>
        <v-breadcrumbs class="pa-0 pt-2" :items="bcitems">
            <template v-slot:item="{ item }">
                <v-breadcrumbs-item :class="!item.disabled ? 'primary--text cursor-p' : ''"
                    @click="router.push(item.href)" :disabled="item.disabled">
                    {{ item.text == "this" ? screent0 : item.text }}
                </v-breadcrumbs-item>
            </template>
            <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
            </template>
        </v-breadcrumbs>
        <v-card style="border: thin solid var(--outline) !important" variant="outlined"
            class="rounded-lg mt-4 mb-8 crd-trn">
            <v-toolbar class="elevation-0 my-4" density="compact" color="transparent">
                <img width="40px" src="@/assets/stocks/srcm.svg" alt="srcm" class="mr-2" />
                <p class="title font-weight-bold mb-0">Stock monitor</p>
                <v-spacer class="d-none d-sm-flex"></v-spacer>
                <v-select @update:model-value="getContentlistdata('yes')" :readonly="issloading" style="max-width: 180px"
                    v-model="screent0" hide-details append-icon="mdi-chevron-down"
                    class="rounded-pill mr-3 d-none d-sm-flex" density="compact" variant="solo" bg-color="secbg"
                    :items="screent0item" label="Condition"></v-select>

                <v-select @update:model-value="getContentlistdata('yes')" :readonly="issloading" style="max-width: 140px"
                    v-model="screent1" hide-details append-icon="mdi-chevron-down" class="rounded-pill d-none d-sm-flex"
                    density="compact" variant="solo" bg-color="secbg" :items="screent1item" label="Condition"></v-select>
            </v-toolbar>

            <v-toolbar class="elevation-0 my-4 d-sm-none" density="compact" color="transparent">
                <v-select @update:model-value="getContentlistdata('yes')" :readonly="issloading" v-model="screent0" hide-details
                    append-icon="mdi-chevron-down" class="rounded-pill mr-1" density="compact" variant="solo"
                    bg-color="secbg" :items="screent0item" label="Condition"></v-select>

                <v-select @update:model-value="getContentlistdata('yes')" :readonly="issloading" v-model="screent1" hide-details
                    append-icon="mdi-chevron-down" class="rounded-pill ml-1" density="compact" variant="solo"
                    bg-color="secbg" :items="screent1item" label="Condition"></v-select>
            </v-toolbar>
            <v-divider></v-divider>
            <v-data-table must-sort :sort-by="['chp']" :sort-desc="[true]" mobile fixed-header
                :loading="issloading" class="rounded-lg overflow-y-auto" :headers="screenheader" :search="opensearch"
                :items="screentitems" :items-per-page="10">
                <template v-slot:[`item.tsym`]="{ item }">
                    <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                        class="font-weight-medium text-capitalize txt-dec-cust ws-p">{{ item.tsym }}</span>
                </template>

                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="d-none" v-if="!uid">{{ setScrpitCH("", item, "SCR") }}</span>

                        <span class="font-weight-medium maintext--text">₹<span :id="`ssdsc${item.token}ltp`">{{
                            item.lp ? Number(item.lp).toFixed(2) : '0.00' }}</span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`ssdsc${item.token}chpclr`"
                            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
                            <span :id="`ssdsc${item.token}ch`">{{ item.ch ? item.ch : '0.00' }} </span>
                            <span :id="`ssdsc${item.token}chp`"> ({{ item.chp ? item.chp : '0.00' }}%)</span>
                        </span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium maintext--text">{{ item.v ? item.v : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}op`">{{
                        item.ap ? item.ap : "0.00" }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}cp`">{{
                        item.c ? item.c : "0.00" }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}high`">{{
                        item.h ? item.h : "0.00" }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}low`">{{
                        item.l ? item.l : "0.00" }}</span>
                </template>

                <template v-slot:no-data>
                    <v-col cols="12" class="text-center pa-16">
                        <div class="mx-auto">
                            <img class="align-self-stretch mx-auto" width="80px"
                                src="/src/assets/no data folder.svg" alt="no data" />
                            <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                        </div>
                    </v-col>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore'
import { getConTentList, getLtpdata } from '@/components/mixins/getAPIdata'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const bcitems = ref([
    {
        text: "Stocks",
        disabled: false,
        href: "/stocks",
    },
    {
        text: "Screener",
        disabled: true,
        href: "/stocks/screener",
    },
    {
        text: "this",
        disabled: true,
    },
])

const uid = ref(null)
const mtoken = ref(null)
const stoken = ref(null)

const screent0item = ref([
    { text: "Volume & Price Up", value: "VolUpPriceUp" },
    { text: "Volume & Price Down", value: "VolUpPriceDown" },
    { text: "Weekly Volume Perc", value: "WeeklyVolPerc" },
    { text: "Weekly Volume Perc Potential", value: "WeeklyVolPercPotential" },
    { text: "2Day Price Perc Up", value: "2DayPricePercUp" },
    { text: "2Day Price Perc Down", value: "2DayPricePercDown" },
    { text: "Upper Circuit", value: "UpperCircuit" },
    { text: "Lower Circuit", value: "LowerCircuit" },
    { text: "Open High", value: "OpenHigh" },
    { text: "Open Low", value: "OpenLow" },
    { text: "High Break", value: "HighBreak" },
    { text: "Low Break", value: "LowBreak" },
    { text: "Weekly High Break", value: "W1HighBreak" },
    { text: "Weekly Low Break", value: "W1LowBreak" },
    { text: "2 Weeks High Break", value: "W2HighBreak" },
    { text: "2 Weeks Low Break", value: "W2LowBreak" },
    { text: "Monthly High Break", value: "M1HighBreak" },
    { text: "Monthly Low Break", value: "M1LowBreak" },
    { text: "3 Months High Break", value: "M3HighBreak" },
    { text: "3 Months Low Break", value: "M3LowBreak" },
    { text: "52 Weeks High Break", value: "W52HighBreak" },
    { text: "52 Weeks Low Break", value: "W52LowBreak" },
    { text: "R3 Break", value: "R3Break" },
    { text: "R2 Break", value: "R2Break" },
    { text: "R1 Break", value: "R1Break" },
    { text: "Pivot Break", value: "PivotBreak" },
    { text: "S1 Break", value: "S1Break" },
    { text: "S2 Break", value: "S2Break" },
    { text: "S3 Break", value: "S3Break" },
])
const screent0 = ref("VolUpPriceUp")
const screent1item = ref([
    { text: "All", value: "A" },
    { text: "Nifty 50", value: "NIFTY50" },
    { text: "Nifty 500", value: "NIFTY500" },
    { text: "Nifty MIDCAP 50", value: "NIFTYMCAP50" },
    { text: "Nifty SMLCAP 50", value: "NIFTYSMCAP50" },
])
const screent1 = ref("A")
const screentitems = ref([])

const issloading = ref(true)
const opensearch = ref(null)

// Computed
const screenheader = computed(() => {
    return [
        { text: "Symbol", value: "tsym", sortable: false, class: "ws-p" },
        { text: "Price", value: "ltp", sortable: false, align: "end", class: "ws-p" },
        { text: "Open", value: "op", align: "end", class: "ws-p" },
        { text: "High", value: "high", align: "end", class: "ws-p" },
        { text: "Low", value: "low", align: "end", class: "ws-p" },
        { text: "Close", value: "cp", align: "end", class: "ws-p" },
        { text: "Volume", value: "vol", align: "end", class: "ws-p" },
    ];
})

// Methods
const setSinglestock = (tsym, item) => {
    if (uid.value) {
        let path = [0, item.token, item.exch, item.tsym]
        router.push({ name: "stocks details", params: { val: path } })
    } else {
        router.push(`/stocks/${tsym.toLowerCase()}`)
    }
}

const setScrpitCH = (x, i, a) => {
    let f = screentitems.value.findIndex((o) => o.token == i.token)
    if (f >= 0) {
        screentitems.value[f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : (0).toFixed(2)
        screentitems.value[f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : (0).toFixed(2)
    }
}

const getContentlistdata = async (change) => {
    if (change == "yes") {
        setWebsocket("unsub-D", screentitems.value, "sc")
    }
    issloading.value = true
    let data = await getConTentList(["NSE", screent1.value, screent0.value])
    if (data && data.length > 0) {
        screentitems.value = data
        setWebsocket("sub", data, "sc")
    } else {
        screentitems.value = []
    }
    issloading.value = false
}

const setWebsocket = async (flow, data, is) => {
    if (uid.value) {
        // Use Custom Events instead of EventBus
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow, data, is, page: 'stockSCR' }
        }))
    } else {
        let raw = await getLtpdata(data)
        raw = raw.data
        // Update data for non-logged-in users if needed
        if (raw) {
            for (let i = 0; i < screentitems.value.length; i++) {
                let v = raw[screentitems.value[i].token]
                if (v) {
                    screentitems.value[i].lp = Number(v.lp).toFixed(2)
                    screentitems.value[i]["ch"] = Number(v.lp) && Number(v.close) ? (Number(v.lp) - Number(v.close)).toFixed(2) : (0).toFixed(2)
                    screentitems.value[i]["chp"] = Number(v.change).toFixed(2)
                    screentitems.value[i]["vol"] = v.vol ? Number(v.vol).toFixed(2) : (0).toFixed(2)
                    screentitems.value[i]["op"] = Number(v.open) ? Number(v.open).toFixed(2) : (0).toFixed(2)
                    screentitems.value[i]["cp"] = Number(v.close) ? Number(v.close).toFixed(2) : (0).toFixed(2)
                    screentitems.value[i]["high"] = Number(v.high) ? Number(v.high).toFixed(2) : (0).toFixed(2)
                    screentitems.value[i]["low"] = Number(v.low) ? Number(v.low).toFixed(2) : (0).toFixed(2)
                }
            }
        }
    }
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (!token) return

    let s = screentitems.value.findIndex((o) => o.token == token)
    if (s >= 0 && screentitems.value[s].token == token) {
        screentitems.value[s].ltp = Number(data.lp || data.ltp || 0).toFixed(2)
        screentitems.value[s]["ch"] = Number(data.ch || data.c || 0) > 0 || Number(data.ch || data.c || 0) < 0 ? Number(data.ch || data.c || 0).toFixed(2) : (0).toFixed(2)
        screentitems.value[s]["chp"] = Number(data.chp || 0).toFixed(2)
        screentitems.value[s]["vol"] = Number(data.volume || data.vol || 0)
        screentitems.value[s]["op"] = Number(data.open_price || data.open || 0) ? Number(data.open_price || data.open || 0).toFixed(2) : (0).toFixed(2)
        screentitems.value[s]["cp"] = Number(data.prev_close_price || data.close || 0) ? Number(data.prev_close_price || data.close || 0).toFixed(2) : (0).toFixed(2)
        screentitems.value[s]["high"] = Number(data.high_price || data.high || 0) ? Number(data.high_price || data.high || 0).toFixed(2) : (0).toFixed(2)
        screentitems.value[s]["low"] = Number(data.low_price || data.low || 0) ? Number(data.low_price || data.low || 0).toFixed(2) : (0).toFixed(2)

        let tag = document.getElementById(`ssdsc${token}ltp`)
        if (tag) {
            document.getElementById(`ssdsc${token}ltp`).innerHTML = screentitems.value[s].ltp
            const chTag = document.getElementById(`ssdsc${token}ch`)
            const chpTag = document.getElementById(`ssdsc${token}chp`)
            const chpclrTag = document.getElementById(`ssdsc${token}chpclr`)
            if (chTag) chTag.innerHTML = screentitems.value[s].ch
            if (chpTag) chpTag.innerHTML = ` (${screentitems.value[s].chp}%)`
            if (chpclrTag) {
                const ch = parseFloat(screentitems.value[s].ch) || 0
                chpclrTag.className = ch > 0 
                    ? 'font-weight-medium fs-12 ws-p maingreen--text'
                    : ch < 0 
                        ? 'font-weight-medium fs-12 ws-p mainred--text'
                        : 'font-weight-medium fs-12 ws-p subtext--text'
            }
            const opTag = document.getElementById(`ssdsc${token}op`)
            const cpTag = document.getElementById(`ssdsc${token}cp`)
            const highTag = document.getElementById(`ssdsc${token}high`)
            const lowTag = document.getElementById(`ssdsc${token}low`)
            if (opTag) opTag.innerHTML = screentitems.value[s].op
            if (cpTag) cpTag.innerHTML = screentitems.value[s].cp
            if (highTag) highTag.innerHTML = screentitems.value[s].high
            if (lowTag) lowTag.innerHTML = screentitems.value[s].low
        }
    }
}

// WebSocket event handler
const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == "stockSCR" && screentitems.value && Array.isArray(screentitems.value)) {
            optionChainDataParse(data)
        }
    } else if (detail && typeof detail === 'object') {
        if (detail.page === 'stockSCR' && (detail.token || detail.tk)) {
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
    getContentlistdata()
}

// Watch screent0 for breadcrumb update
watch(() => screent0.value, (newVal) => {
    const selectedItem = screent0item.value.find(item => item.value === newVal)
    if (selectedItem) {
        bcitems.value[2].text = selectedItem.text
    }
}, { immediate: true })

// Watch auth store for login changes
watch(() => [authStore.uid, authStore.mtoken], ([newUid, newMtoken]) => {
    if (newUid && newMtoken) {
        uid.value = newUid
        mtoken.value = newMtoken
        stoken.value = sessionStorage.getItem("usession")
        getContentlistdata()
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
        getContentlistdata()
    } else {
        getContentlistdata()
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
