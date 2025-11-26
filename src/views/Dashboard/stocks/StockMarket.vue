<template>
    <div>
        <v-breadcrumbs class="pa-0 pt-2" :items="bcitems">
            <template v-slot:item="{ item }">
                <v-breadcrumbs-item :class="!item.disabled ? 'primary--text cursor-p' : ''"
                    @click="router.push(item.href)" :disabled="item.disabled">
                    {{ item.text == "this" ? getTradeActionLabel(tradeaction) : item.text }}
                </v-breadcrumbs-item>
            </template>
            <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
            </template>
        </v-breadcrumbs>
        <v-card style="border: thin solid #EBEEF0 !important" variant="outlined" class="rounded-lg mt-4 mb-8 crd-trn">
            <v-toolbar class="elevation-0 pb-0  pa-4" density="compact" color="transparent">
                <img width="40px" :src="getTradeActionIcon(tradeaction)" :alt="getTradeActionIconAlt(tradeaction)"
                    class="mr-2" />
                <p class="font-weight-bold title mb-0 text-none">{{ getTradeActionLabel(tradeaction) }}</p>
                <v-spacer></v-spacer>

                <v-select @update:model-value="getToplistdata('yes')" :readonly="isloading" style="max-width: 140px"
                    v-model="trader1" hide-details  class="rounded-pill mr-0 d-none d-sm-flex"
                    density="compact" rounded="pill" variant="flat" bg-color="secbg" :items="trader1item" ></v-select>

                <v-select @update:model-value="setTabchange()" :readonly="isloading" style="max-width: 220px;" v-model="tradeaction"
                    hide-details append-icon="mdi-chevron-down" class="rounded-pill d-sm-none" density="compact"
                    variant="flat" bg-color="secbg" :items="tradeActionItems"></v-select>
                  <v-text-field style="max-width: 220px;" :disabled="isloading" v-model="opensearch" hide-details
                    prepend-inner-icon="mdi-magnify" label="Search" single-line
                    class="d-none d-sm-block" density="compact" variant="flat" rounded="pill" bg-color="secbg"></v-text-field>
            </v-toolbar>
            <v-tabs class="d-none d-sm-flex " color="maintext" v-model="tradeaction" @update:model-value="setTabchange()">
                <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">Top gainer</v-tab>
                <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">Top losers</v-tab>
                <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">Volume breakout</v-tab>
                <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">Most active</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <v-data-table must-sort :sort-by="[tradeaction == 2 ? 'vol' : 'chp']"
                :sort-desc="tradeaction != 1 ? [true] : [false]"  fixed-header :loading="isloading"
                class="rounded-lg overflow-y-auto" :headers="tradeheader" :search="opensearch" :items="traditems"
                :items-per-page="10">
                <template v-slot:[`item.tsym`]="{ item }">
                    <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                        class="font-weight-medium text-capitalize txt-dec-cust ws-p">{{ item.tsym }}</span>
                </template>

                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="font-weight-medium txt-000">₹<span :id="`stkmrk${item.token}ltp`">{{
                            item.ltp != null ? Number(item.ltp).toFixed(2) : '0.00' }}</span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`stkmrk${item.token}chpclr`"
                            :class="Number(item.ch || 0) > 0 ? 'maingreen--text' : Number(item.ch || 0) < 0 ? 'mainred--text' : 'subtext--text'">
                            <span :id="`stkmrk${item.token}ch`">{{ item.ch != null ? item.ch : '0.00' }} </span>
                            <span :id="`stkmrk${item.token}chp`"> ({{ item.chp != null ? item.chp : '0.00' }}%)</span>
                        </span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium txt-000" :id="`stkmrk${item.token}vol`">{{
                        item.vol != null ? item.vol : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium txt-000" :id="`stkmrk${item.token}op`">{{
                        item.op != null ? item.op : "0.00" }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium txt-000" :id="`stkmrk${item.token}cp`">{{
                        item.cp != null ? item.cp : "0.00" }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium txt-000" :id="`stkmrk${item.token}high`">{{
                        item.high != null ? item.high : "0.00" }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium txt-000" :id="`stkmrk${item.token}low`">{{
                        item.low != null ? item.low : "0.00" }}</span>
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore'
import { getTopList, getLtpdata } from '@/components/mixins/getAPIdata'
import ic_tg from '@/assets/stocks/tg.svg'
import ic_tl from '@/assets/stocks/tl.svg'
import ic_vb from '@/assets/stocks/vb.svg'
import ic_ma from '@/assets/stocks/ma.svg'

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
        text: "Markets",
        disabled: true,
        href: "/stocks/market",
    },
    {
        text: "this",
        disabled: true,
    },
])

const uid = ref(null)
const mtoken = ref(null)
const stoken = ref(null)

const trader1item = ref([
    { title: "NSE", value: "NSEALL" },
    { title: "NFO", value: "NFOALL" },
])
const trader1 = ref("NSEALL")

const tradeaction = ref(0)
const traditems = ref([])
const tradeactionitem = ref([])
const isloading = ref(true)
const opensearch = ref(null)

const wsdata = ref([])

// Trade action items for mobile select
const tradeActionItems = computed(() => [
    { title: 'Top gainer', value: 0 },
    { title: 'Top losers', value: 1 },
    { title: 'Volume breakout', value: 2 },
    { title: 'Most active', value: 3 },
])

// Computed
const tradeheader = computed(() => {
    return [
        { title: "Symbol", key: "tsym", sortable: false, class: "ws-p" },
        { title: "Price", key: "ltp", sortable: false, align: "end", class: "ws-p" },
        { title: "Open", key: "op", align: "end", class: "ws-p" },
        { title: "High", key: "high", align: "end", class: "ws-p" },
        { title: "Low", key: "low", align: "end", class: "ws-p" },
        { title: "Close", key: "cp", align: "end", class: "ws-p" },
        { title: "Volume", key: "vol", align: "end", class: "ws-p" },
    ];
})

// Helper functions
const getTradeActionLabel = (action) => {
    switch (action) {
        case 0: return "Top gainer"
        case 1: return "Top losers"
        case 2: return "Volume breakout"
        case 3: return "Most active"
        default: return ""
    }
}

const getTradeActionIcon = (action) => {
    switch (action) {
        case 0: return ic_tg
        case 1: return ic_tl
        case 2: return ic_vb
        case 3: return ic_ma
        default: return ic_tg
    }
}

const getTradeActionIconAlt = (action) => {
    switch (action) {
        case 0: return "tg"
        case 1: return "tl"
        case 2: return "vb"
        case 3: return "ma"
        default: return "tg"
    }
}

// Methods
const setTabchange = () => {
    traditems.value = []
    setTimeout(() => {
        if (tradeactionitem.value && tradeactionitem.value.length > tradeaction.value) {
            traditems.value = tradeactionitem.value[tradeaction.value] || []
        }
    }, 1)
    // Update breadcrumb
    bcitems.value[2].text = getTradeActionLabel(tradeaction.value)
}
const setSinglestock = (tsym, item) => {
    if (uid.value) {
        // For logged-in users: use the detailed stocks view with trading features
        let path = [0, item.token, item.exch, item.tsym];
        // Store params for refresh persistence
        
        
        localStorage.setItem('ssdParams', JSON.stringify(path));
        localStorage.setItem('ssdtsym', `${item.exch}:${item.tsym}`);
        localStorage.setItem('ssdtoken', item.token);
        // Use query params to force route change detection
        router.push({
            name: "stocks details",
            params: { val: path },
            query: {
                type: '0',
                token: item.token,
                exch: item.exch,
                tsym: item.tsym
            }
        });
    } else if (item.exch == "NSE" && item.tsym.slice(-2) ==  "EQ" ) {
        router.push(`/stocks/${tsym.toLowerCase()}`);
        console.log("else iffffffffff");
        
    }
    else{
        router.push(`/stocks`);
       
        
    }
}

const getToplistdata = async (change) => {
    if (change == "yes") {
        setWebsocket("unsub-D", wsdata.value, "mkt")
    }
    tradeactionitem.value = []
    traditems.value = []
    isloading.value = true
    let lsto = await getTopList([trader1.value == "NSEALL" ? "NSE" : "NFO", trader1.value, "mostActive"])
    let lstt = await getTopList([trader1.value == "NSEALL" ? "NSE" : "NFO", trader1.value, "topG_L"])

    if (lsto.stat == "Ok" && lstt.stat == "Ok") {
        tradeactionitem.value.push(lstt.topGainers)
        tradeactionitem.value.push(lstt.topLosers)
        tradeactionitem.value.push(lsto.byVolume)
        tradeactionitem.value.push(lsto.byValue)

        let arr = tradeactionitem.value[0].concat(
            tradeactionitem.value[1].concat(
                tradeactionitem.value[2].concat(tradeactionitem.value[3])
            )
        )
        
        // Always fetch initial LTP data via REST API to ensure immediate display
        let raw = await getLtpdata(arr)
        raw = raw.data
        if (raw) {
            for (let x = 0; x < tradeactionitem.value.length; x++) {
                for (let x_is = 0; x_is < tradeactionitem.value[x].length; x_is++) {
                    let data = raw[tradeactionitem.value[x][x_is].token]
                    if (data) {
                        tradeactionitem.value[x][x_is].ltp = Number(data.lp) ? Number(data.lp).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["ch"] = Number(data.lp) && Number(data.close) ? (Number(data.lp) - Number(data.close)).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["chp"] = Number(data.change).toFixed(2)
                        tradeactionitem.value[x][x_is]["vol"] = Number(data.vol).toFixed(2)
                        tradeactionitem.value[x][x_is]["op"] = Number(data.open) ? Number(data.open).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["cp"] = Number(data.close) ? Number(data.close).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["high"] = Number(data.high) ? Number(data.high).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["low"] = Number(data.low) ? Number(data.low).toFixed(2) : (0).toFixed(2)
                    }
                }
            }
        }
        
        // Subscribe to WebSocket for real-time updates (for logged-in users)
        if (uid.value) {
            setWebsocket("sub", arr, "mkt")
        }
        wsdata.value = arr
        traditems.value = tradeactionitem.value[tradeaction.value] || []
    }
    isloading.value = false
}

const setWebsocket = async (flow, data, is) => {
    if (uid.value) {
        // Use Custom Events instead of EventBus
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow, data, is, page: 'stockMKT' }
        }))
    } else {
        let raw = await getLtpdata(data)
        raw = raw.data
        if (raw) {
            for (let x = 0; x < tradeactionitem.value.length; x++) {
                for (let x_is = 0; x_is < tradeactionitem.value[x].length; x_is++) {
                    let data = raw[tradeactionitem.value[x][x_is].token]
                    if (data) {
                        tradeactionitem.value[x][x_is].ltp = Number(data.lp) ? Number(data.lp).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["ch"] = Number(data.lp) && Number(data.close) ? (Number(data.lp) - Number(data.close)).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["chp"] = Number(data.change).toFixed(2)
                        tradeactionitem.value[x][x_is]["vol"] = Number(data.vol).toFixed(2)
                        tradeactionitem.value[x][x_is]["op"] = Number(data.open) ? Number(data.open).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["cp"] = Number(data.close) ? Number(data.close).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["high"] = Number(data.high) ? Number(data.high).toFixed(2) : (0).toFixed(2)
                        tradeactionitem.value[x][x_is]["low"] = Number(data.low) ? Number(data.low).toFixed(2) : (0).toFixed(2)
                    }
                }
            }
            // Update displayed items
            if (tradeactionitem.value && tradeactionitem.value.length > tradeaction.value) {
                traditems.value = tradeactionitem.value[tradeaction.value] || []
            }
        }
    }
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (!token) return

    let o = tradeactionitem.value[0]?.findIndex((o) => o.token == token) ?? -1
    let t = tradeactionitem.value[1]?.findIndex((o) => o.token == token) ?? -1
    let r = tradeactionitem.value[2]?.findIndex((o) => o.token == token) ?? -1
    let f = tradeactionitem.value[3]?.findIndex((o) => o.token == token) ?? -1

    if (o >= 0 || t >= 0 || r >= 0 || f >= 0) {
        for (let x = 0; x < tradeactionitem.value.length; x++) {
            let x_is = x == 0 && o >= 0 ? o : x == 1 && t >= 0 ? t : x == 2 && r >= 0 ? r : x == 3 && f >= 0 ? f : null
            if (x_is >= 0 && tradeactionitem.value[x] && tradeactionitem.value[x][x_is] && tradeactionitem.value[x][x_is].token == token) {
                tradeactionitem.value[x][x_is].ltp = Number(data.lp || data.ltp || 0).toFixed(2)
                tradeactionitem.value[x][x_is]["ch"] = Number(data.ch || data.c || 0) > 0 || Number(data.ch || data.c || 0) < 0 ? Number(data.ch || data.c || 0).toFixed(2) : (0).toFixed(2)
                tradeactionitem.value[x][x_is]["chp"] = Number(data.chp || 0).toFixed(2)
                tradeactionitem.value[x][x_is]["vol"] = Number(data.volume || data.vol || 0)
                tradeactionitem.value[x][x_is]["op"] = Number(data.open_price || data.open || 0) ? Number(data.open_price || data.open || 0).toFixed(2) : (0).toFixed(2)
                tradeactionitem.value[x][x_is]["cp"] = Number(data.prev_close_price || data.close || 0) ? Number(data.prev_close_price || data.close || 0).toFixed(2) : (0).toFixed(2)
                tradeactionitem.value[x][x_is]["high"] = Number(data.high_price || data.high || 0) ? Number(data.high_price || data.high || 0).toFixed(2) : (0).toFixed(2)
                tradeactionitem.value[x][x_is]["low"] = Number(data.low_price || data.low || 0) ? Number(data.low_price || data.low || 0).toFixed(2) : (0).toFixed(2)

                let tag = document.getElementById(`stkmrk${token}ltp`)
                if (tag) {
                    document.getElementById(`stkmrk${token}ltp`).innerHTML = tradeactionitem.value[x][x_is].ltp
                    const chTag = document.getElementById(`stkmrk${token}ch`)
                    const chpTag = document.getElementById(`stkmrk${token}chp`)
                    const chpclrTag = document.getElementById(`stkmrk${token}chpclr`)
                    if (chTag) chTag.innerHTML = tradeactionitem.value[x][x_is].ch
                    if (chpTag) chpTag.innerHTML = ` (${tradeactionitem.value[x][x_is].chp}%)`
                    if (chpclrTag) {
                        const ch = parseFloat(tradeactionitem.value[x][x_is].ch) || 0
                        chpclrTag.className = ch > 0 
                            ? 'font-weight-medium fs-12 ws-p maingreen--text'
                            : ch < 0 
                                ? 'font-weight-medium fs-12 ws-p mainred--text'
                                : 'font-weight-medium fs-12 ws-p subtext--text'
                    }
                    const volTag = document.getElementById(`stkmrk${token}vol`)
                    const opTag = document.getElementById(`stkmrk${token}op`)
                    const cpTag = document.getElementById(`stkmrk${token}cp`)
                    const highTag = document.getElementById(`stkmrk${token}high`)
                    const lowTag = document.getElementById(`stkmrk${token}low`)
                    if (volTag) volTag.innerHTML = tradeactionitem.value[x][x_is].vol
                    if (opTag) opTag.innerHTML = tradeactionitem.value[x][x_is].op
                    if (cpTag) cpTag.innerHTML = tradeactionitem.value[x][x_is].cp
                    if (highTag) highTag.innerHTML = tradeactionitem.value[x][x_is].high
                    if (lowTag) lowTag.innerHTML = tradeactionitem.value[x][x_is].low
                }
            }
        }
        // Update displayed items if current tab
        if (tradeactionitem.value && tradeactionitem.value.length > tradeaction.value) {
            traditems.value = tradeactionitem.value[tradeaction.value] || []
        }
    }
}

// WebSocket event handler
const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == "stockMKT" && tradeactionitem.value && tradeactionitem.value.length == 4) {
            optionChainDataParse(data)
        }
    } else if (detail && typeof detail === 'object') {
        if (detail.page === 'stockMKT' && (detail.token || detail.tk)) {
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
    getToplistdata()
}

// Watch route params for tradeaction
watch(() => route.params.abc, (newAbc) => {
    if (newAbc !== undefined && !isNaN(newAbc) && newAbc >= 0 && newAbc <= 3) {
        tradeaction.value = parseInt(newAbc)
        setTabchange()
    }
}, { immediate: true })

// Watch auth store for login changes
watch(() => [authStore.uid, authStore.mtoken], ([newUid, newMtoken]) => {
    if (newUid && newMtoken) {
        uid.value = newUid
        mtoken.value = newMtoken
        stoken.value = sessionStorage.getItem("usession")
        getToplistdata()
    }
}, { immediate: false })

// Lifecycle hooks
onMounted(() => {
    // Emit events using Custom Events
    window.dispatchEvent(new CustomEvent('tabBar-load'))
    window.dispatchEvent(new CustomEvent('login-event'))

    // Check route params
    if (route.params.abc !== undefined && !isNaN(route.params.abc) && route.params.abc >= 0 && route.params.abc <= 3) {
        tradeaction.value = parseInt(route.params.abc)
    }

    // Check if user is logged in
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        if (!uid.value && !stoken.value) {
            mtoken.value = sessionStorage.getItem("msession")
            stoken.value = sessionStorage.getItem("usession")
            uid.value = sessionStorage.getItem("userid")
        }
        getToplistdata()
    } else {
        getToplistdata()
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

/* Remove data table border */
:deep(.v-data-table) {
    border: none !important;
}

/* Remove divider padding */
:deep(.v-divider) {
    margin: 0 !important;
}

/* Remove outline from footer dropdown and add underline */
:deep(.v-data-table-footer__items-per-page .v-field__outline) {
    display: none !important;
    padding: 0 !important;  
}

:deep(.v-data-table-footer__items-per-page .v-field) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
    border-radius: 0 !important;
    padding: 0 !important;
}

:deep(.v-data-table-footer__items-per-page .v-field__input) {
    padding: 0 !important;
    min-height: auto !important;
}
</style>
