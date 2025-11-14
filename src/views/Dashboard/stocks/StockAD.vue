<template>
    <div>
        <v-breadcrumbs class="pa-0 pt-2" :items="bcitems">
            <template v-slot:item="{ item }">
                <v-breadcrumbs-item :class="!item.disabled ? 'primary--text cursor-p' : ''"
                    @click="router.push(item.href)" :disabled="item.disabled">
                    {{ item.text == "thisi" ? (advdecisi ? advdecisi.split("-")[0] : "") : item.text == "this" ?
                        advdecis : item.text == "sec" ? (advdeclistis ? advdeclistis.split("-")[0] : "Indices") : item.text
                    }}
                </v-breadcrumbs-item>
            </template>
            <template v-slot:divider>
                <v-icon>mdi-chevron-right</v-icon>
            </template>
        </v-breadcrumbs>
        <v-card style="border: thin solid #EBEEF0 !important" variant="outlined" class="rounded-lg mt-4 mb-8"
            color="cardbg">
            <v-toolbar ref="adcp" id="adcp" class="elevation-0 my-4 px-3" density="compact" color="transparent">
                <!-- <img width="40px" :src="srcmIcon" alt="srcm" class="mr-2" /> -->
                <div>
                    <p class="title font-weight-bold mb-0" style="color: black !important;">
                        {{ advdecis ? advdecis.split("-")[0] : "" }} <span
                            class="caption subtext--text font-weight-bold">({{
                                advdecstat.sum ? advdecstat.sum : ".." }})</span>
                    </p>
                    <p class="fs-14 maintext--text font-weight-medium mb-0 lh-16">
                        <span :id="`savddec${advdecstat.token}ltp`" class="black--text">{{ advdecstat.ltp
                            ?
                            advdecstat.ltp :
                            "0.00"
                        }}</span>&nbsp;
                        <span class="fs-12" :id="`savddec${advdecstat.token}chpclr`"
                            :class="advdecstat.ch > 0 ? 'maingreen--text' : advdecstat.ch < 0 ? 'mainred--text' : 'subtext--text'"
                            :style="{ color: advdecstat.ch > 0 ? 'green' : advdecstat.ch < 0 ? 'red' : 'gray' }">
                            <span :id="`savddec${advdecstat.token}ch`">{{ advdecstat.ch ? advdecstat.ch : '0.00'
                            }}</span>
                            <span :id="`savddec${advdecstat.token}chp`"> ({{ advdecstat.chp ? advdecstat.chp : '0.00'
                            }}%)</span>
                        </span>
                    </p>
                </div>
                <v-spacer></v-spacer>

                <div class="d-flex align-center justify-end d-none d-sm-flex" style="gap: 12px;">
                    <v-select v-model="advdecisi" @update:model-value="getADindicesdata('main')" :readonly="isloading"
                        :items="mainIndicesItems" item-title="title" item-value="value" hide-details
                        menu-icon="mdi-chevron-down" variant="flat" density="compact"
                        class="rounded-pill align-center elevation-0" style="
                        max-width: 180px;
                        min-width: 140px;
                        height: 36px;
                        background-color: #f1f3f8;
                        color: #000;
                        font-weight: 500;
                        font-size: 14px;
                        border-radius: 9999px;
                        overflow: hidden;
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        align-self: center;
                        " />


                    <v-autocomplete v-model="advdecis" @update:model-value="getADindicesdata('yes')"
                        :readonly="isloading" :items="subIndicesItems" item-title="title" item-value="value"
                        hide-details menu-icon="mdi-chevron-down" density="compact" variant="flat"
                        class="rounded-pill align-center" style="
    max-width: 180px;
    min-width: 140px;
    height: 36px;
    background-color: #f1f3f8;
    color: #000;
    font-weight: 500;
    font-size: 14px;
    border-radius: 9999px;
    margin-top: 0 !important;
    padding-top: 0 !important;
  " />



                    <v-text-field v-model="opensearch" :disabled="isloading" variant="solo" density="compact"
                        prepend-inner-icon="mdi-magnify" placeholder="Search" hide-details rounded="pill" flat
                        bg-color="secbg" class="search-bar mx-auto" style="transition: width 0.3s ease;"
                        @focus="focused = true" @blur="focused = false" />
                </div>
            </v-toolbar>

            <v-toolbar class="elevation-0 my-4 d-sm-none px-3" density="compact" color="transparent">
                <div class="d-flex align-center" style="gap: 8px; width: 100%;">
                    <v-select @update:model-value="getADindicesdata('main')" :readonly="isloading" v-model="advdecisi"
                        variant="plain" density="comfortable" hide-details menu-icon="mdi-chevron-down"
                        class="rounded-pill flex-grow-1" :items="mainIndicesItems" item-title="title" item-value="value"
                        style="
                            height: 36px;
                            background-color: #f1f3f8;
                            color: #000;
                            font-weight: 500;
                            font-size: 14px;
                            border-radius: 9999px;
                            " />

                    <v-autocomplete @update:model-value="getADindicesdata('yes')" :readonly="isloading"
                        v-model="advdecis" variant="plain" density="comfortable" hide-details
                        menu-icon="mdi-chevron-down" class="rounded-pill flex-grow-1" :items="subIndicesItems"
                        item-title="title" item-value="value" style="
                            height: 36px;
                            background-color: #f1f3f8;
                            color: #000;
                            font-weight: 500;
                            font-size: 14px;
                            border-radius: 9999px;
                            " />
                </div>
            </v-toolbar>
            <v-divider></v-divider>

            <div class="px-4">
                <v-card width="100%" class="elevation-0 pa-3 rounded-lg mb-3" height="60px" color="secbg">
                    <v-row no-gutters>
                        <v-col cols="12" class="d-inline-flex">
                            <v-card class="elevation-0 rounded-lg crd-trn" :style="{ width: advdecstat.adp || '0%' }">
                                <v-card class="elevation-0 rounded-lg py-1" color="maingreen" width="100%"></v-card>
                                <p v-if="advdecstat.Positive > 0" class="mb-0 lh-16 mt-2 subtitle-2">
                                    <v-icon color="maingreen" size="18">mdi-arrow-top-right</v-icon>
                                    {{ advdecstat.Positive }}
                                </p>
                            </v-card>
                            <v-card v-if="advdecstat.Negative > 0 || advdecstat.Neutral > 0"
                                class="elevation-0 rounded-lg px-1 crd-trn" :style="{ width: advdecstat.adn || '0%' }">
                                <v-card class="elevation-0 rounded-lg py-1" color="#D9D9D9" width="100%"></v-card>
                            </v-card>
                            <v-card class="elevation-0 rounded-lg crd-trn" :style="{ width: advdecstat.adm || '0%' }">
                                <v-card class="elevation-0 rounded-lg py-1" color="mainred" width="100%"></v-card>
                                <p v-if="advdecstat.Negative > 0" class="mb-0 lh-16 mt-2 subtitle-2 text-right">
                                    {{ advdecstat.Negative }}
                                    <v-icon color="mainred" size="18">mdi-arrow-bottom-right</v-icon>
                                </p>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>
            </div>

            <v-data-table must-sort :sort-by="['change']" :sort-desc="[true]" hide-default-footer fixed-header
                :loading="isloading" class="rounded-lg overflow-y-auto" :headers="tradeheader" :search="opensearch"
                :items="advdectabel" :items-per-page="10">
                <template v-slot:[`item.SYMBOL`]="{ item }">
                    <p class="mb-0 lh-16">
                        <span @click="setSinglestock(item.SYMBOL.split(':')[1].split('-')[0], item)"
                            class="font-weight-medium text-capitalize txt-dec-cust ws-p"
                            style="font-size: 12px !important;">{{ item.SYMBOL.split(":")[1]
                            }}</span>
                        <br /><span class="caption subtext--text ws-p">{{ item.Industry ? item.Industry : "" }}</span>
                    </p>
                </template>
                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="font-weight-medium maintext--text black--text"><span :id="`avddec${item.Token}ltp`"
                                v-text="item.ltp ? Number(item.ltp).toFixed(2) : '0.00'"></span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`avddec${item.Token}chpclr`"
                            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'"
                            :style="{ color: item.ch > 0 ? 'green' : item.ch < 0 ? 'red' : 'gray' }">
                            <span :id="`avddec${item.Token}ch`" v-text="item.ch ? item.ch : '0.00'"> </span>
                            <span :id="`avddec${item.Token}chp`"
                                v-text="` (${item.chp ? item.chp : '0.00'}%)`"></span></span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`avddec${item.Token}vol`">{{
                        item.vol ? item.vol : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`avddec${item.Token}op`">{{
                        item.op ? item.op :
                            "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`avddec${item.Token}cp`">{{
                        item.cp ? item.cp :
                            "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`avddec${item.Token}high`">{{
                        item.high ? item.high :
                            "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`avddec${item.Token}low`">{{
                        item.low ? item.low :
                            "0.00"
                    }}</span>
                </template>
                <template v-slot:no-data>
                    <v-col cols="12" class="text-center pa-16">
                        <div>
                            <img width="80px" :src="noDataFolder" alt="no data" />
                            <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                        </div>
                    </v-col>
                </template>
            </v-data-table>
            <v-divider></v-divider>
        </v-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore'
import { getADindices, getADindice, getLtpdata } from '@/components/mixins/getAPIdata'
import srcmIcon from '@/assets/stocks/srcm.svg'
import noDataFolder from '@/assets/no data folder.svg'

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
        text: "sec",
        disabled: true,
        href: "/stocks/advance_decline",
    },
    {
        text: "Advance & Decline",
        disabled: true,
        href: "/stocks/advance_decline",
    },
    {
        text: "thisi",
        disabled: true,
    },
    {
        text: "this",
        disabled: true,
    },
])

const uid = ref(null)
const mtoken = ref(null)
const stoken = ref(null)

const advdecisi = ref("Nifty-Indices")
const advdecis = ref("NIFTY 50")
const advdecstat = ref({})
const advdecfilter = ref({})
const advdecitems = ref([])
const advdectabel = ref([])
const adindiceslist = ref({})
const advdeclistis = ref(null)
const isloading = ref(true)
const opensearch = ref(null)

const wsdata = ref([])

// Computed
const tradeheader = computed(() => {
    return [
        { title: "Symbol", key: "SYMBOL", sortable: false, class: "ws-p" },
        { title: "Price", key: "ltp", sortable: false, align: "end", class: "ws-p" },
        { title: "Open", key: "op", align: "end", class: "ws-p" },
        { title: "High", key: "high", align: "end", class: "ws-p" },
        { title: "Low", key: "low", align: "end", class: "ws-p" },
        { title: "Close", key: "cp", align: "end", class: "ws-p" },
        { title: "Volume", key: "vol", align: "end", class: "ws-p" },
    ];
})

const advdecisiKey = computed(() => {
    if (Array.isArray(advdecisi.value)) {
        return advdecisi.value[0]
    } else if (typeof advdecisi.value === 'object' && advdecisi.value?.title) {
        return advdecisi.value.title
    }
    return advdecisi.value
})

const mainIndicesItems = computed(() => {
    return Object.entries(adindiceslist.value).map(([key, val]) => ({
        title: key,
        value: key
    }))
})

const subIndicesItems = computed(() => {
    const key = advdecisiKey.value
    if (!key || !adindiceslist.value[key]) {
        return []
    }
    return adindiceslist.value[key].map(item => ({
        title: typeof item === 'string' ? item : (item.name || item),
        value: typeof item === 'string' ? item : (item.name || item)
    }))
})

// Methods
const setSinglestock = (tsym, item) => {
    if (uid.value) {
        let path = [0, item.Token, "NSE", item.SYMBOL.split(":")[1]]
        router.push({ name: "stocks details", params: { val: path } })
    } else {
        router.push(`/stocks/${tsym.toLowerCase()}`)
    }
}

const getADlistdata = async () => {
    isloading.value = true
    let list = await getADindice()
    if (Object.entries(list).length > 0) {
        adindiceslist.value = list
    }
    let data = await getADindices()
    if (data && data != 500) {
        advdecfilter.value = data
        delete advdecfilter.value["Company"]
        getADindicesdata()
    } else {
        isloading.value = false
    }
}

const getADindicesdata = async (change) => {
    // Get the key from computed property
    const currentKey = advdecisiKey.value

    if (change == "main") {
        // When main category changes, set first item from that category
        if (adindiceslist.value[currentKey] && adindiceslist.value[currentKey].length > 0) {
            const firstItem = adindiceslist.value[currentKey][0]
            advdecis.value = typeof firstItem === 'string' ? firstItem : (firstItem.name || firstItem)
        }
    }

    // Handle advdecis - it should be a string now
    const advdecisValue = typeof advdecis.value === 'string' ? advdecis.value : (advdecis.value?.name || advdecis.value || '')

    let fill = advdecfilter.value[advdecisValue]
    if (fill) {
        if (change == "yes") {
            setWebsocket("unsub-D", wsdata.value, "ta")
        }
        isloading.value = true
        advdectabel.value = []
        advdecstat.value = {}
        let data = await getADindice(advdecisValue)
        advdecstat.value = setStatAD(advdecfilter.value[advdecisValue])
        if (data && data.length > 0) {
            advdectabel.value = data
            let wsdataArr = []
            data.forEach((o) => {
                wsdataArr.push({ exch: o.SYMBOL.split(":")[0], token: o.Token, tsym: o.SYMBOL.split(":")[1] })
            })
            if (advdecstat.value.token) {
                wsdataArr.push({ exch: "NSE", token: advdecstat.value.token, tsym: advdecisValue })
            }
            setWebsocket("sub", wsdataArr, "ta")
            wsdata.value = wsdataArr
        }

        // Find which category contains this index
        Object.entries(adindiceslist.value).forEach(([key, value]) => {
            for (let c = 0; c < value.length; c++) {
                const itemName = typeof value[c] === 'string' ? value[c] : (value[c].name || value[c])
                if (itemName === advdecisValue) {
                    advdeclistis.value = key
                    // Update breadcrumbs
                    bcitems.value[1].text = key
                    bcitems.value[3].text = currentKey || key
                    bcitems.value[4].text = advdecisValue
                    break
                }
            }
        })
        isloading.value = false
    }
}

const setStatAD = (data) => {
    if (!data) return {}
    const result = { ...data }
    result["sum"] = (data.Negative || 0) + (data.Neutral || 0) + (data.Positive || 0)
    result["adp"] = result.sum > 0 ? `${Math.round((data.Positive / result.sum) * 100)}%` : "0%"
    result["adm"] = result.sum > 0 ? `${Math.round((data.Negative / result.sum) * 100)}%` : "0%"
    result["adn"] = result.sum > 0 ? `${Math.round((data.Neutral / result.sum) * 100)}%` : "0%"
    return result
}

const setWebsocket = async (flow, data, is) => {
    if (uid.value) {
        // Use Custom Events instead of EventBus
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow, data, is, page: 'stockAD' }
        }))
    } else {
        let raw = await getLtpdata(data)
        raw = raw.data
        if (raw) {
            // Update table data
            for (let l = 0; l < advdectabel.value.length; l++) {
                let v = raw[advdectabel.value[l].Token]
                if (v) {
                    advdectabel.value[l]["ltp"] = Number(v.lp).toFixed(2)
                    advdectabel.value[l]["ch"] = Number(advdectabel.value[l].ltp - Number(v.close)).toFixed(2)
                    advdectabel.value[l]["chp"] = Number(v.change)
                    advdectabel.value[l]["vol"] = v.vol ? Number(v.vol).toFixed(2) : (0).toFixed(2)
                    advdectabel.value[l]["op"] = Number(v.open) ? Number(v.open).toFixed(2) : (0).toFixed(2)
                    advdectabel.value[l]["cp"] = Number(v.close) ? Number(v.close).toFixed(2) : (0).toFixed(2)
                    advdectabel.value[l]["high"] = Number(v.high) ? Number(v.high).toFixed(2) : (0).toFixed(2)
                    advdectabel.value[l]["low"] = Number(v.low) ? Number(v.low).toFixed(2) : (0).toFixed(2)
                    advdectabel.value[l]["oi"] = v.oi ? Number(v.oi).toFixed(2) : (0).toFixed(2)
                }
            }
            // Update stat data
            if (advdecstat.value.token) {
                let v = raw[advdecstat.value.token]
                if (v) {
                    advdecstat.value["ltp"] = Number(v.lp).toFixed(2)
                    advdecstat.value["ch"] = Number(advdecstat.value.ltp - Number(v.close)).toFixed(2)
                    advdecstat.value["chp"] = Number(v.change)
                }
            }
        }
    }
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (!token) return

    // Update table data
    let p = advdectabel.value.findIndex((o) => o.Token == token)
    if (p >= 0 && advdectabel.value[p].Token == token) {
        advdectabel.value[p].ltp = Number(data.lp || data.ltp || 0).toFixed(2)
        advdectabel.value[p]["ch"] = Number(data.ch || data.c || 0) > 0 || Number(data.ch || data.c || 0) < 0 ? Number(data.ch || data.c || 0).toFixed(2) : (0).toFixed(2)
        advdectabel.value[p]["chp"] = Number(data.chp || 0).toFixed(2)
        advdectabel.value[p]["vol"] = Number(data.volume || data.vol || 0)
        advdectabel.value[p]["op"] = Number(data.open_price || data.open || 0) ? Number(data.open_price || data.open || 0).toFixed(2) : (0).toFixed(2)
        advdectabel.value[p]["cp"] = Number(data.prev_close_price || data.close || 0) ? Number(data.prev_close_price || data.close || 0).toFixed(2) : (0).toFixed(2)
        advdectabel.value[p]["high"] = Number(data.high_price || data.high || 0) ? Number(data.high_price || data.high || 0).toFixed(2) : (0).toFixed(2)
        advdectabel.value[p]["low"] = Number(data.low_price || data.low || 0) ? Number(data.low_price || data.low || 0).toFixed(2) : (0).toFixed(2)

        let tag = document.getElementById(`avddec${token}ltp`)
        if (tag) {
            document.getElementById(`avddec${token}ltp`).innerHTML = advdectabel.value[p].ltp
            const chTag = document.getElementById(`avddec${token}ch`)
            const chpTag = document.getElementById(`avddec${token}chp`)
            const chpclrTag = document.getElementById(`avddec${token}chpclr`)
            if (chTag) chTag.innerHTML = advdectabel.value[p].ch
            if (chpTag) chpTag.innerHTML = ` (${advdectabel.value[p].chp}%)`
            if (chpclrTag) {
                const ch = parseFloat(advdectabel.value[p].ch) || 0
                chpclrTag.className = ch > 0
                    ? 'font-weight-medium fs-12 ws-p maingreen--text'
                    : ch < 0
                        ? 'font-weight-medium fs-12 ws-p mainred--text'
                        : 'font-weight-medium fs-12 ws-p subtext--text'
            }
            const volTag = document.getElementById(`avddec${token}vol`)
            const opTag = document.getElementById(`avddec${token}op`)
            const cpTag = document.getElementById(`avddec${token}cp`)
            const highTag = document.getElementById(`avddec${token}high`)
            const lowTag = document.getElementById(`avddec${token}low`)
            if (volTag) volTag.innerHTML = advdectabel.value[p].vol
            if (opTag) opTag.innerHTML = advdectabel.value[p].op
            if (cpTag) cpTag.innerHTML = advdectabel.value[p].cp
            if (highTag) highTag.innerHTML = advdectabel.value[p].high
            if (lowTag) lowTag.innerHTML = advdectabel.value[p].low
        }
    }

    // Update stat data
    if (advdecstat.value.token == token) {
        advdecstat.value["ltp"] = Number(data.lp || data.ltp || 0).toFixed(2)
        advdecstat.value["ch"] = Number(data.ch || data.c || 0) > 0 || Number(data.ch || data.c || 0) < 0 ? Number(data.ch || data.c || 0).toFixed(2) : (0).toFixed(2)
        advdecstat.value["chp"] = Number(data.chp || 0).toFixed(2)

        let tag = document.getElementById(`savddec${token}ltp`)
        if (tag) {
            document.getElementById(`savddec${token}ltp`).innerHTML = advdecstat.value.ltp
            const chTag = document.getElementById(`savddec${token}ch`)
            const chpTag = document.getElementById(`savddec${token}chp`)
            const chpclrTag = document.getElementById(`savddec${token}chpclr`)
            if (chTag) chTag.innerHTML = advdecstat.value.ch
            if (chpTag) chpTag.innerHTML = ` (${advdecstat.value.chp}%)`
            if (chpclrTag) {
                const ch = parseFloat(advdecstat.value.ch) || 0
                chpclrTag.className = ch > 0
                    ? 'fs-12 maingreen--text'
                    : ch < 0
                        ? 'fs-12 mainred--text'
                        : 'fs-12 subtext--text'
            }
        }
    }
}

// WebSocket event handler
const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == "stockAD" && advdectabel.value && Array.isArray(advdectabel.value)) {
            optionChainDataParse(data)
        }
    } else if (detail && typeof detail === 'object') {
        if (detail.page === 'stockAD' && (detail.token || detail.tk)) {
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
    getADlistdata()
}

// Watch route params for initial values
watch(() => route.params, (newParams) => {
    if (newParams.abc) {
        if (newParams.main == "find") {
            advdecisi.value = "find"
        } else if (newParams.main == "Sectors") {
            advdecisi.value = "Sectoral-Indices"
        } else if (newParams.main == "Thematic") {
            advdecisi.value = "Thematic-Indices"
        }
        advdecis.value = newParams.abc
        // Update breadcrumbs
        bcitems.value[1].text = newParams.main || "sec"
        bcitems.value[3].text = advdecisi.value
        bcitems.value[4].text = newParams.abc
    }
}, { immediate: true })

// Watch advdecisi changes
watch(() => advdecisi.value, (newVal) => {
    bcitems.value[3].text = newVal ? newVal.split("-")[0] : "thisi"
})

// Watch auth store for login changes
watch(() => [authStore.uid, authStore.mtoken], ([newUid, newMtoken]) => {
    if (newUid && newMtoken) {
        uid.value = newUid
        mtoken.value = newMtoken
        stoken.value = sessionStorage.getItem("usession")
        getADlistdata()
    }
}, { immediate: false })

// Lifecycle hooks
onMounted(() => {
    // Emit events using Custom Events
    window.dispatchEvent(new CustomEvent('tabBar-load'))
    window.dispatchEvent(new CustomEvent('login-event'))

    // Check route params
    if (route.params.abc) {
        if (route.params.main == "find") {
            advdecisi.value = "find"
        } else if (route.params.main == "Sectors") {
            advdecisi.value = "Sectoral-Indices"
        } else if (route.params.main == "Thematic") {
            advdecisi.value = "Thematic-Indices"
        }
        advdecis.value = route.params.abc
        // Update breadcrumbs
        bcitems.value[1].text = route.params.main || "sec"
        bcitems.value[3].text = advdecisi.value
        bcitems.value[4].text = route.params.abc
    }

    // Check if user is logged in
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        if (!uid.value && !stoken.value) {
            mtoken.value = sessionStorage.getItem("msession")
            stoken.value = sessionStorage.getItem("usession")
            uid.value = sessionStorage.getItem("userid")
        }
        getADlistdata()
    } else {
        getADlistdata()
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

.search-bar {
    width: 180px;
    /* default width */
    max-width: 400px;
    /* cap the max width */
}

.search-bar:focus-within {
    /* width: 320px; */
    /* expands smoothly on focus */
}
</style>
