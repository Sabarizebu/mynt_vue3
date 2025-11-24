<template>
    <div>
        <p class="font-weight-bold fs-22 mb-0 mt-4">Settings</p>
        <p class="subtitle-2 subtext--text mb-4">Catch the log, setting up preference, get API key, and change themes.
        </p>

        <v-card class="mb-8 rounded-lg elevation-0  crd-trn" style="border: 1px solid #e0e0e0;" variant="outlined"
            width="100%">
            <v-expansion-panels v-model="panel" multiple flat>
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16 ">User details</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <v-row no-gutters>
                            <v-col cols="2">Name</v-col>
                            <v-col cols="10">: <span class="fs-14 subtext--text pl-2">{{ clientdata.cliname
                                ?
                                clientdata.cliname : "-" }}</span></v-col>

                            <v-col cols="2">Mobile no</v-col>
                            <v-col cols="10">: <span class="fs-14 subtext--text pl-2">{{ clientdata.m_num ?
                                clientdata.m_num : "-" }}</span></v-col>

                            <v-col cols="2">Email</v-col>
                            <v-col cols="10">: <span class="fs-14 subtext--text pl-2">{{ clientdata.email ?
                                clientdata.email : "-" }}</span></v-col>

                            <v-col cols="12" class="mt-2"
                                v-if="clientdata.bankdetails && clientdata.bankdetails.length">Bank:-</v-col>
                            <v-col cols="10" v-for="(a, s) in (clientdata.bankdetails || [])" :key="s">
                                Name:<span class="fs-14 subtext--text pl-2">{{ a.bankn }}</span> | Account
                                no:<span class="fs-14 subtext--text pl-2">{{ a.acctnum }}</span></v-col>

                            <v-col cols="12" class="mt-2"
                                v-if="clientdata.dp_acct_num && clientdata.dp_acct_num.length">DP no:-</v-col>
                            <v-col cols="10" v-for="(a, s) in (clientdata.dp_acct_num || [])" :key="s">
                                {{ s + 1 }}: <span class="fs-14 subtext--text pl-2">{{ a.dpnum
                                }}</span></v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16">API key</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <v-tabs v-model="ordertype" color="maintext" class="px-0">
                            <v-tab v-for="(t, index) in orderselect" :key="index" class="text-none text-start"
                                style="min-width: fit-content">
                                <span class="text-center"
                                    style="font-size: 14px; letter-spacing: -0.7px; font-weight: 469; line-height: 10px; width: fit-content;">
                                    {{ t }}
                                </span>
                            </v-tab>
                        </v-tabs>
                        <v-window v-model="ordertype">
                            <v-window-item>
                                <div>
                                    <v-row v-if="keydata != null" no-gutters class="mt-7">
                                        <v-col cols="2">Generate API</v-col>
                                        <v-col cols="10">: <span class="font-weight-medium subtext--text pl-2"
                                                :style="{ color: keydata && keydata.apistatus == 'EXPIRED' ? 'red !important' : 'black' }">{{
                                                    keydata && keydata.apistatus ?
                                                        keydata.apistatus : "-" }}</span></v-col>

                                        <v-col cols="2">Expire date</v-col>
                                        <v-col cols="10">:
                                            <span class="font-weight-medium subtext--text pl-2">{{ keydata &&
                                                keydata.exp ? keydata.exp : "-" }}
                                                <span v-if="keydata && keydata.dd">({{ keydata.dd }}
                                                    days)</span></span></v-col>

                                        <v-col cols="2">Vender code(vc)</v-col>
                                        <v-col cols="10">: <span class="font-weight-medium subtext--text pl-2">{{
                                            keydata && keydata.uid ?
                                                keydata.uid : "-" }}</span></v-col>

                                        <v-col cols="2" class="d-flex align-center">API key</v-col>
                                        <v-col cols="10">: <span class="font-weight-medium subtext--text pl-2">{{
                                            keydata && keydata.apikey ?
                                                keydata.apikey : "-" }}</span>
                                            <v-btn @click="setCopyText(keydata.apikey, 'API key')"
                                                v-if="keydata && keydata.apikey" variant="text" size="small"
                                                class="primary--text font-weight-medium px-0 text-none ml-1"><v-icon
                                                    size="12">mdi-content-copy</v-icon> {{ keydata.time ? "Copied" :
                                                        "Copy" }}</v-btn></v-col>
                                    </v-row>
                                    <p v-if="(keydata && keydata.apistatus == 'EXPIRED') || (keydata && keydata.status == 'NOT_PRESENT')"
                                        class="font-weight-medium subtext--text mb-0 mt-5 "
                                        style="color: red !important;">Your API key has expired, please generate a new
                                        one.</p>

                                    <v-row no-gutters
                                        v-if="(keydata && keydata.apistatus == 'EXPIRED') || (keydata && keydata.status == 'NOT_PRESENT')"
                                        class="mt-3">
                                        <v-col cols="3">
                                            <v-select bg-color="secbg" append-inner-icon="mdi-chevron-down"
                                                v-model="selectexp" density="compact" :items="expitems" hide-details
                                                class="rounded-pill mr-3" variant="solo" flat></v-select>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-btn
                                                @click="setUserAPikeydata(keydata && keydata.status ? keydata.status : null)"
                                                color="btnclr"
                                                class="font-weight-bold text-none rounded-pill elevation-0 btntext--text px-6">
                                                Generate API key
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-window-item>
                            <v-window-item>
                                <newapikey />
                            </v-window-item>
                        </v-window>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16 ">TOTP</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <div v-if="totpdata && totpdata.pwd">

                            <p class="font-weight-bold fs-14 mb-2">Authenticator QR</p>
                            <div class="mb-4">
                                <qrcode-vue :size="180" :value="totpqr"></qrcode-vue>
                            </div>

                            <v-divider class="mb-2"></v-divider>
                            <p class="font-weight-bold fs-14 mb-2">Authenticator Key</p>
                            <v-text-field
                                :model-value="totpeye ? '••••••••••••••••••••••••••••••••••••••••••••••••' : totpdata.pwd"
                                readonly variant="outlined" density="compact" class="mb-4" max-width="500px"
                                :type="totpeye ? 'password' : 'text'">
                                <template v-slot:append-inner>
                                    <v-btn @click="totpeye = !totpeye" elevation="0" icon variant="text" size="small"
                                        class="mr-1">
                                        <v-icon size="20">{{ !totpeye ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                                    </v-btn>
                                    <v-btn @click="setCopyText(totpdata.pwd, 'Auth key')" elevation="0" icon
                                        variant="text" size="small">
                                        <v-icon size="20">mdi-content-copy</v-icon>
                                    </v-btn>
                                </template>
                            </v-text-field>
                            <v-divider class="my-4"></v-divider>

                            <p class="font-weight-bold fs-14 mb-2">Your TOTP</p>


                            <v-btn @click="setCopyText(totpis, 'OTP')" elevation="0" variant="text">
                                <p class="font-weight-bold fs-20 mb-0">{{ totpis ? `${totpis.slice(0, 3)}
                                    ${totpis.slice(3, 6)} ` :
                                    "*** *** " }}</p>
                                <v-icon size="20">mdi-content-copy</v-icon>
                            </v-btn>

                            <p class="subtext--text fs-12">This OTP will automatically update every 30 seconds.</p>
                        </div>

                        <v-btn v-else variant="text" class="text-none pa-1 rounded-lg" color="primary"
                            @click="setTotpdata(true)">Click to
                            generated new code</v-btn>

                    </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16 ">Password &
                        Security</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14 pt-0">
                        <v-btn @click="setChangepws()" class="text-none font-weight-bold elevation-0"
                            color="secbg">Change
                            Password</v-btn>

                        <v-divider class="my-4"></v-divider>

                        <p class="font-weight-medium subtext--text">Loggedin sessions</p>
                        <v-data-table :headers="sessionheader" :items="logsitems" :items-per-page="5"
                            class="elevation-0 session-table" disable-sort hide-default-footer>
                            <template v-slot:[`item.uid`]="{ item }">
                                <span class="txt-000">{{ item.uid }}</span>
                            </template>

                            <template v-slot:[`item.actions`]="{ item }">
                                <v-btn variant="text" class="font-weight-bold text-none px-0" color="primary"
                                    @click="setLogoutseee(item)">
                                    Logout</v-btn>
                            </template>

                            <template v-slot:[`item.llt`]="{ item }">
                                <span class="txt-000"> {{ new Date(item.llt * 1000).toLocaleString() }}</span>
                            </template>

                            <template v-slot:[`item.source`]="{ item }">
                                <v-badge color="primary" dot :model-value="item.source == source">
                                    <span class="txt-000"> {{ item.source }}</span>
                                </v-badge>
                            </template>
                        </v-data-table>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <!-- <v-expansion-panel flat>
                    <v-expansion-panel-title class="fs-16">Themes</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <v-radio-group @update:model-value="setChangeTheme()" v-model="themeradio">
                            <v-row>
                                <v-col cols="6" md="2"><v-card variant="outlined" height="60px"
                                        style="border: 1px solid #e0e0e0;" class="pa-3 rounded-lg" width="100%">
                                        <v-radio label="Light" value="light"></v-radio>
                                    </v-card></v-col>
                                <v-col cols="6" md="2"><v-card variant="outlined" height="60px"
                                        style="border: 1px solid #e0e0e0;" class="pa-3 rounded-lg" width="100%">
                                        <v-radio label="Dark" value="dark"></v-radio>
                                    </v-card></v-col>
                                <v-col cols="6" md="2"><v-card variant="outlined" height="60px"
                                        style="border: 1px solid #e0e0e0;" class="pa-3 rounded-lg" width="100%">
                                        <v-radio label="Default" value="default"></v-radio>
                                    </v-card></v-col>
                            </v-row>
                        </v-radio-group>
                    </v-expansion-panel-text>
                </v-expansion-panel> -->
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16">Order Preference</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <p class="subtext--text fs-14 mb-5">Exchange default values</p>
                        <v-row class="mb-6">
                            <v-col cols="12" sm="6" md="3">
                                <v-select v-model="exchtype" :items="exchitems" label="Exchange"  rounded="lg"
                                    variant="outlined" hide-details density="compact" class="rounded-lg">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-select v-model="qtypreitems[exchtype][0]"
                                    :items="['NSE', 'BSE'].includes(exchtype) ? prditemso : prditemst" 
                                    label="Product" variant="outlined" hide-details density="compact" 
                                    rounded="lg">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-select v-model="qtypreitems[exchtype][1]" item-title="txt" item-value="val"
                                    :items="['CO', 'BO'].includes(qtypreitems[exchtype][0]) ? ordtypeitemst : ordtypeitemso"
                                    label="Order type" variant="outlined" hide-details density="compact" 
                                    rounded="lg">
                                </v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-select v-model="qtypreitems[exchtype][2]"
                                    :items="['BFO', 'BCD'].includes(exchtype) ? duritemst : ['BSE'].includes(exchtype) ? duritemsr : duritemso"
                                    label="Duration" variant="outlined" hide-details density="compact" 
                                    rounded="lg">
                                </v-select>
                            </v-col>
                        </v-row>

                        <p class="subtext--text fs-14 mb-3">Quantity preferences</p>
                        <v-radio-group v-model="qtypre" class="mb-2 ml-0 pl-0" inline hide-details>
                            <v-radio label="Minimum quantity" value="0"></v-radio>
                            <v-radio label="Set no.of market lots" value="1"></v-radio>
                        </v-radio-group>
                        <v-row class="mb-6">
                            <v-col cols="6" sm="4" md="2" v-for="(e, x) in qtypreitems" :key="x">
                                <v-text-field :disabled="qtypre == '0'" v-model="qtypreitems[x][3]"
                                    :label="x" type="number" placeholder="1" hide-spin-buttons 
                                    variant="outlined" rounded="lg" hide-details density="compact">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <p class="subtext--text fs-14 mb-5">Market protection % preferences</p>
                        <v-text-field v-model="mktpro" label="Market protection %" 
                            type="number" hide-spin-buttons variant="outlined" hide-details
                            density="compact" rounded="lg" class=" mb-6" style="max-width: 280px;"
                            append-inner-icon="mdi-percent">
                        </v-text-field>

                        <p class="subtext--text fs-14 mb-5">Position exit</p>
                        <v-select v-model="expos" item-title="txt" item-value="val" 
                            :items="ordtypeitemex" label="Order type" variant="outlined" 
                            hide-details density="compact" rounded="lg" class=" mb-6" 
                            style="max-width: 280px;">
                        </v-select>

                        <p class="subtext--text fs-14 mb-5">Order screen</p>
                        <v-row class="mb-6">
                            <v-col cols="12" md="6">
                                <div class="d-flex align-center">
                                    <v-switch v-model="ordsrcpop" hide-details  
                                        density="compact" class="mr-2">
                                    </v-switch>
                                    <span class="txt-000 fs-14">Sticky {{ ordsrcpop ? "Off" : "On" }}</span>
                                    <v-tooltip location="top" color="black">
                                        <template v-slot:activator="{ props }">
                                            <v-icon v-bind="props" size="16" class="ml-1" color="subtext">
                                                mdi-information-outline
                                            </v-icon>
                                        </template>
                                        <span>The order screen stays<br />open after order placement.</span>
                                    </v-tooltip>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="d-flex align-center">
                                    <v-switch v-model="quickord" hide-details  
                                        density="compact" class="mr-2">
                                    </v-switch>
                                    <span class="txt-000 fs-14">Quick Order screen {{ quickord ? "enable" : "disable" }}</span>
                                    <v-tooltip location="top" color="black">
                                        <template v-slot:activator="{ props }">
                                            <v-icon v-bind="props" size="16" class="ml-1" color="subtext">
                                                mdi-information-outline
                                            </v-icon>
                                        </template>
                                        <span>The Quick Order screen<br />will enable default</span>
                                    </v-tooltip>
                                </div>
                            </v-col>
                        </v-row>

                        <v-row class="mt-4">
                            <v-col cols="auto" class="pt-0">
                                <v-btn @click="setSaveperf()" color="btnclr"
                                    class="text-none rounded-pill elevation-0 btntext--text mr-3 px-8">
                                    Apply
                                </v-btn>
                                <v-btn @click="setSaveperf(true)" variant="outlined"
                                    class="text-none rounded-pill elevation-0 px-8">
                                    Reset
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel class="crd-trn" flat>
                    <v-expansion-panel-title class="fs-16">Layout
                        Preference</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <p class="font-weight-medium subtext--text pb-0">WatchList</p>
                        <v-radio-group @update:model-value="setWLlayout()" v-model="wllayoutradio">
                            <v-row>
                                <v-col cols="6" md="2"><v-card height="60px" style="border: 1px solid #e0e0e0;"
                                        variant="outlined" class="pa-3 rounded-lg" width="100%"> <v-radio label="Left"
                                            value="false"></v-radio>
                                    </v-card></v-col>
                                <v-col cols="6" md="2"><v-card height="60px" style="border: 1px solid #e0e0e0;"
                                        variant="outlined" class="pa-3 rounded-lg" width="100%"> <v-radio label="Right"
                                            value="true"></v-radio>
                                    </v-card></v-col>
                            </v-row>
                        </v-radio-group>
                    </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel class="" flat>
                    <v-expansion-panel-title class="fs-16 font-weight-medium">Log</v-expansion-panel-title>
                    <v-expansion-panel-text class="fs-14">
                        <v-data-table hide-default-footer :headers="snackheaders" :items="snacklogs"
                            must-sort class="logs-table">
                            <template v-slot:[`item.time`]="{ item }">
                                <span class="txt-000">{{ item.time }}</span>
                            </template>
                            <template v-slot:[`item.msg`]="{ item }">
                                <span class="txt-000">{{ item.msg }}</span>
                            </template>
                        </v-data-table>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from 'vuetify'
import QrcodeVue from 'qrcode.vue'
import { useAppStore } from "@/stores/appStore"
import { getApikeyreq, getLoggedIn, getMyntLogout, getDeskLogout, getClientDetails, getUserApikeyreq, getTotpreq, setOrdprefApi } from "@/components/mixins/getAPIdata.js"
import { mynturl } from "@/apiurl.js"
import newapikey from "./NewApiKey.vue"

const appStore = useAppStore()

const theme = useTheme()

// Reactive state
const quickord = ref(false)
const ordsrcpop = ref(false)

const totpqr = ref("")
const uid = ref(null)
const token = ref(null)

const panel = ref([])

const keydata = ref(null)
const themeradio = ref(null)
const wllayoutradio = ref(null)
const snacklogs = ref([])
const snackheaders = ref([
    { title: "time", key: "time" },
    { title: "message", key: "msg", sortable: false },
])

const qtypreitems = reactive({ NSE: "", BSE: "", MCX: "", NFO: "", CDS: "", BFO: "", BCD: "" })

const exchitems = ref(["NSE", "BSE", "MCX", "NFO", "CDS", "BFO", "BCD"])
const prditemso = ref(["MIS", "CNC", "CO", "BO"]) //NSE, BSE
const prditemst = ref(["NRML", "MIS", "CO", "BO"])

const ordtypeitemso = ref([
    { txt: "Market", val: "MKT" },
    { txt: "Limit", val: "LMT" },
    { txt: "SL Limit", val: "SL-LMT" },
    { txt: "SL Mkt", val: "SL-MKT" },
])
const ordtypeitemst = ref([
    { txt: "Market", val: "MKT" },
    { txt: "Limit", val: "LMT" },
    { txt: "SL Limit", val: "SL-LMT" },
])

const ordtypeitemex = ref([
    { txt: "Market", val: "MKT" },
    { txt: "Limit", val: "LMT" },
])

const duritemso = ref(["IOC", "DAY"])
const duritemst = ref(["IOC", "EOS"]) // BFO, BCD
const duritemsr = ref(["DAY"]) //BSE

const exchtype = ref("NSE")
const expos = ref("MKT")

const qtypre = ref("0")
const mktpro = ref(5)

const orderpref = reactive({})

const sessionheader = ref([
    { title: "User Id", align: "start", sortable: false, key: "uid" ,class:"txt-000"},
    { title: "Source", key: "source", sortable: false },
    { title: "Last loggedin time", key: "llt", sortable: false },
    { title: "Actions", key: "actions", align: "start", sortable: false },
])
const logsitems = ref([])
const clientdata = reactive({})

const source = ref(null)

const selectexp = ref('1 month')

const expitems = ref([
    '1 month',
    '3 month',
    '6 month',
    '10 years',
])

const totpdata = reactive({})
const totpeye = ref(true)
const totpis = ref(null)

const intervalId = ref(null)
const ordertype = ref(0) // active tab index
const orderselect = ref(['Base Key', 'OAuth Key'])

// Methods
const setWebsocket = (flow, data) => {
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow, data, type: 'is', source: 'settings' }
    }))
}

const setWLlayout = () => {
    // Convert string value to boolean (now: false = Left, true = Right)
    const layoutValue = wllayoutradio.value === 'true'
    
    // Update the app store (this triggers reactive updates)
    appStore.setWatchlistLayout(layoutValue)
    
    // Save to localStorage
    localStorage.setItem(`${uid.value}_wllayout`, wllayoutradio.value)
    
    // Dispatch event with the layout value for any components listening
    window.dispatchEvent(new CustomEvent('wllayout-event', { 
        detail: { layout: layoutValue } 
    }))
    
  
}

const setClientdata = async () => {
    let res = await getClientDetails()
    if (res && res.stat == "Ok") {
        Object.assign(clientdata, res)
    } else {
        appStore.showSnackbar(3, "Failed to fetch client logs.")
    }
}

const setOrderpre = async (type) => {
    let res = {}
    if (!type) {
        res = await setOrdprefApi()
    }
    if (res && res.metadata && res.metadata.mainpreitems) {
        Object.assign(orderpref, res.metadata)
    } else {
        Object.assign(orderpref, {
            stickysrc: false,
            quicksrc: false,
            expos: "MKT",
            mktpro: 5,
            qtypre: "0",
            mainpreitems: { NSE: ["CNC", "LMT", "DAY", ""], BSE: ["CNC", "LMT", "DAY", ""], MCX: ["NRML", "LMT", "DAY", ""], NFO: ["NRML", "LMT", "DAY", ""], CDS: ["NRML", "LMT", "DAY", ""], BFO: ["NRML", "LMT", "EOS", ""], BCD: ["NRML", "LMT", "EOS", ""] },
        })
        await setOrdprefApi({ "clientid": uid.value, "metadata": orderpref, "source": "WEB" }, true)
    }
    ordsrcpop.value = toBool(orderpref.stickysrc)
    quickord.value = toBool(orderpref.quicksrc)
    expos.value = orderpref.expos
    qtypre.value = orderpref.qtypre
    mktpro.value = orderpref.mktpro
    Object.assign(qtypreitems, orderpref.mainpreitems)
}

const toBool = (val) => {
    return String(val).toLowerCase() === "true"
}

const setSaveperf = async (type) => {
    if (type) {
        setOrderpre(type)
        appStore.showSnackbar(2, "Order preference has been reset.")
    } else {
        orderpref["qtypre"] = qtypre.value
        orderpref["mktpro"] = mktpro.value
        orderpref["mainpreitems"] = qtypreitems
        orderpref["expos"] = expos.value
        orderpref["quicksrc"] = quickord.value
        orderpref["stickysrc"] = ordsrcpop.value
        var data = {
            "clientid": uid.value,
            "metadata": orderpref,
            "source": "WEB"
        }
        let res = await setOrdprefApi(data, true)
        if (res && res.status && res.status == "updated") {
            appStore.showSnackbar(1, "Order preference has been changed.")
        } else {
            appStore.showSnackbar(2, res && res.emsg ? res.emsg : res)
        }
    }
}

const setChangepws = () => {
    window.location = `https://desk.zebuetrade.com/change_password/?url=${window.location.origin + window.location.pathname}&uid=${uid.value}`
}

const setChangeTheme = () => {
    var themeValue = null
    if (themeradio.value == "default") {
        themeValue = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        theme.global.name.value = themeValue
    } else {
        theme.global.name.value = themeradio.value
        themeValue = themeradio.value
    }
    localStorage.setItem("web.theme", themeradio.value)
    const themeLink = document.getElementById("theme-link")
    if (themeLink) {
        themeLink.setAttribute("href", `theme-${themeValue}.css`)
    }
}

const setUserAPikeydata = async (status) => {
    let key = await getUserApikeyreq(selectexp.value, status)
    if ((key && key.apistatus == "EXPIRED") || (key && key.status == 'ISSUED') || (key && key.status == 'NOT_PRESENT')) {
        setAPikeydata()
        appStore.showSnackbar(1, "API key as generated")
    } else {
        appStore.showSnackbar(2, key && key.status ? key.status : 'Unknown error')
    }
}

const setAPikeydata = async () => {
    let key = await getApikeyreq()
    if (key && key.uid && key.apistatus) {
        key["exp"] = new Date(key.exd * 1000).toDateString()
        key["dd"] = Math.round(Math.abs(new Date(key.exp) - new Date()) / (1000 * 60 * 60 * 24) + 1)
        key["time"] = false
        keydata.value = key
    } else if (key && key.uid && key.status) {
        keydata.value = key
    } else {
        keydata.value = null
    }

    var logid = uid.value + new Date().toLocaleDateString()
    let log = sessionStorage.getItem(logid)
    if (log) {
        snacklogs.value = JSON.parse(log)
    }

    var logs = await getLoggedIn()
    if (logs) {
        logsitems.value = logs
    }
}

const setTotpdata = async (bool) => {
    const data = await getTotpreq(bool)
    if (data.uid && data.pwd) {
        Object.assign(totpdata, data)
        totpqr.value = `otpauth://totp/MYNT:${data.uid}?secret=${data.pwd}&issuer=MYNT WEB`
        generateTOTP(data.pwd)

        intervalId.value = setInterval(() => {
            generateTOTP(data.pwd)
        }, 5000)
    }
}

const setCopyText = (key, text) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key)
            .then(() => {
                appStore.showSnackbar(1, `📋 ${text} copied to clipboard!`)
            })
            .catch(err => {
                console.error('Clipboard API failed:', err)
                fallbackCopyText(key, text)
            })
    } else {
        // Fallback for older browsers or non-HTTPS contexts
        fallbackCopyText(key, text)
    }
}

const fallbackCopyText = (text, label) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
        const successful = document.execCommand('copy')
        if (successful) {
            appStore.showSnackbar(1, `📋 ${label} copied to clipboard!`)
        } else {
            appStore.showSnackbar(2, 'Failed to copy to clipboard')
        }
    } catch (err) {
        console.error('Fallback copy failed:', err)
        appStore.showSnackbar(2, 'Copy not supported in this browser')
    } finally {
        document.body.removeChild(textArea)
    }
}

const setLogoutseee = async (item) => {
    await getMyntLogout(item.source)
    if (item.source == mynturl.source) {
        await getDeskLogout([uid.value, token.value])
        window.dispatchEvent(new CustomEvent('storage-reset', {
            detail: { reset: true }
        }))
    } else {
        setAPikeydata()
    }
}

const base32ToHex = (base32) => {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    let hex = ''

    for (let i = 0; i < base32.length; i++) {
        const val = base32Chars.indexOf(base32.charAt(i).toUpperCase())
        bits += val.toString(2).padStart(5, '0')
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
        const byte = bits.substr(i, 8)
        hex += parseInt(byte, 2).toString(16).padStart(2, '0')
    }

    return hex
}

const hexToUint8Array = (hex) => {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    return new Uint8Array(bytes)
}

const generateTOTP = async (pwd) => {
    const secretKey = pwd
    const key = base32ToHex(secretKey)

    const epoch = Math.floor(new Date().getTime() / 1000.0)
    const time = Math.floor(epoch / 30).toString(16).padStart(16, '0')
    const timeBuffer = hexToUint8Array(time)

    const keyBuffer = hexToUint8Array(key)

    const cryptoKey = await window.crypto.subtle.importKey(
        'raw', keyBuffer, { name: 'HMAC', hash: { name: 'SHA-1' } },
        false, ['sign']
    )
    const signature = await window.crypto.subtle.sign(
        'HMAC', cryptoKey, timeBuffer
    )

    const hash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0')).join('')

    const offset = parseInt(hash.substring(hash.length - 1), 16)
    const otp = (parseInt(hash.substr(offset * 2, 8), 16) & 0x7fffffff) % 1000000

    totpis.value = otp.toString().padStart(6, '0')
}

// Helper function to load user data
const loadUserData = async () => {
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        token.value = sessionStorage.getItem("msession")
        uid.value = sessionStorage.getItem("userid")
        if (uid.value) {
            await setOrderpre()
            await setAPikeydata()
            let t = localStorage.getItem("web.theme")
            themeradio.value = t
            await setClientdata()
            await setTotpdata()
            let wll = localStorage.getItem(`${uid.value}_wllayout`)
            wllayoutradio.value = wll && wll == 'true' ? 'true' : 'false'
        }
    } else {
        window.dispatchEvent(new CustomEvent('login'))
    }
}

const userEventHandler = () => {
    loadUserData()
}

// Lifecycle hooks
onMounted(() => {
    source.value = mynturl.source

    // Try to load data directly first
    loadUserData()

    // Also listen for user-event
    window.dispatchEvent(new CustomEvent('login-event'))

    window.addEventListener('user-event', userEventHandler)

    setWebsocket('unsub', [])
})

onBeforeUnmount(() => {
    window.removeEventListener('user-event', userEventHandler)
    if (intervalId.value) {
        clearInterval(intervalId.value)
    }
})
</script>

<style scoped>
.session-table :deep(thead tr th) {
    background-color: transparent !important;
    color: grey !important;
}

.logs-table :deep(thead tr th) {
    background-color: transparent !important;
    color: grey !important;
}

.v-label {
  color: black !important;
}
</style>
