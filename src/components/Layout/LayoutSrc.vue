<template>
    <div>
        <div :class="!appStore.mainloader ? 'd-none' : ''" class="no-scroll no-xhide">
            <img class="pos-cent blinkimg" width="90px" :src="myntLogo" alt="wait" />
        </div>
        <div :class="appStore.mainloader ? 'd-none' : ''">
            <AppBar />
            <div>
                <v-container class="vcontainer" color="mainbg">
                    <div class="px-0 px-md-0 mb-12 mb-md-0">
                        <v-snackbars class="wsalert-snackbar" elevation="0" :objects="wsOrderObjects" bottom right>
                            <template v-slot:action="{ close }">
                                <v-icon @click="close()" class="float-right" color="#fff">mdi-close-circle</v-icon>
                            </template>
                            <template v-slot:default="{ message }">
                                <span class="font-weight-bold fs-14" v-html="message"></span>
                            </template>
                        </v-snackbars>
                        <v-snackbar class="d-none d-md-flex snakbar-sty rounded-pill"
                            transition="slide-x-reverse-transition" top right v-model="appStore.snackbar" timeout="4000"
                            :value="true" :color="appStore.snackcolor" absolute text-color="white"
                            style="top: 80px !important; right: 16px !important;">
                            <v-icon class="mr-2" color="#fff">mdi-alert-outline</v-icon>
                            {{ appStore.snacktxt }}
                            <v-icon @click="appStore.hideSnackbar()" class="float-right"
                                color="#fff">mdi-close-circle</v-icon>
                        </v-snackbar>

                        <v-snackbar class="d-md-none snakbar-sty rounded-pill" transition="slide-x-reverse-transition"
                            top right v-model="appStore.snackbar" timeout="4000" :value="true"
                            :color="appStore.snackcolor" absolute text-color="white"
                            style="top: 80px !important; right: 16px !important;">
                            <v-icon class="mr-2" color="#fff">mdi-alert-outline</v-icon>
                            {{ appStore.snacktxt }}
                            <v-icon @click="appStore.hideSnackbar()" class="float-right"
                                color="#fff">mdi-close-circle</v-icon>
                        </v-snackbar>
                        <v-row no-gutters class="pt-14" :class="appStore.wllayout ? 'flex-row-reverse' : ''">
                            <v-col cols="12" md="9" class="pt-6 pr-1 pl-2 pb-0 changescreen">
                                <router-view @snack="snackAlert" @menudialog="setMenudialog" @gologin="goSso"
                                    @loader="setLoaderstatus" />
                            </v-col>
                            <v-col cols="3" class="pos-rlt pb-0 px-1 pt-6 d-none d-md-block"
                                :class="authStore.uid ? appStore.wllayout ? 'sec-watchlist-r' : 'sec-watchlist-l' : ''"
                                style="width: 340px">
                                <div v-if="authStore.uid" class=""
                                    style="position: sticky !important; top: 80px; left: 0">
                                    <WatchList />
                                </div>
                                <div v-else class="pos-stk top-80">
                                    <v-card outlined rounded="lg"
                                        class=" ss-login-card bordercss px-10 pt-4 elevation-0  pos-rlt  d-flex"
                                        width="100%"  style="overflow: visible !important;">
                                        <div class="my-auto">
                                            <img :src="getAssetPath(`products-sec/${bodytab == 'Mutual funds' ? 'mutual-funds' : bodytab == 'IPOs' ? 'ipos' : bodytab == 'Bonds' ? 'bonds' : 'Stocks-ETFs'}.png`)"
                                                :alt="bodytab" class="" width="100%" />
                                            <p class="font-weight-bold fs-32 mb-3">Ready to invest in {{ bodytab }}?</p>
                                            <p class="subtext--text  fs-16 mb-8">
                                                Open your demat account <br /> effortlessly
                                                with our six-click process.
                                            </p>
                                            <v-card class="elevation-0 rounded-0 crd-trn" width="100%" style="overflow: visible !important;">
                                                <v-form ref="form" v-model="valid" lazy-validation
                                                    @submit.prevent="getCall()">
                                                    <v-row no-gutters>
                                                        <v-col cols="10" class="pr-0">
                                                            <v-text-field v-model="mobile" variant="plain"
                                                                @keypress="NumberValid($event)" @keyup.enter="getCall()"
                                                                :maxlength="10" :rules="numberis"
                                                                oninput="this.value = this.value.toUpperCase()" required
                                                                hide-spin-buttons flat hide-details solo single-line
                                                                background-color="secbg"
                                                                style="background-color: #F1F3F8 !important;"
                                                                class="sign-up-filed elevation-0 rounded-pill caption mb-3 px-3"
                                                                placeholder="Enter Client ID/Mobile to begin">
                                                                <template #prepend-inner>
                                                                    <img class="pt-0" :src="phoneIconSrc" width="16" height="16"
                                                                        alt="phone-icon" />
                                                                </template>
                                                            </v-text-field>
                                                        </v-col>
                                                        <v-col cols="2" class="d-flex align-center" style="margin-right: -48px; overflow: visible;">
                                                            <v-btn class="mb-3 elevation-0"  color="transparent"
                                                                @click="goSso(true)" fab small>
                                                                <v-icon size="24">
                                                                    mdi-qrcode-scan
                                                                </v-icon>
                                                            </v-btn>
                                                        </v-col>
                                                    </v-row>
                                                    <v-btn type="submit" block height="48px"   color="#FFF07E"
                                                        class="text-none rounded-pill elevation-0"><span
                                                            class="black--text font-weight-bold">Continue</span></v-btn>
                                                </v-form>
                                            </v-card>
                                        </div>
                                    </v-card>
                                </div>
                            </v-col>
                        </v-row>
                        <AlertSrceen />
                        <!-- StockOrderWindow moved to App.vue to prevent duplicate instances -->
                        <MutualFundOrderWindow />
                        <BondOrderWindow />
                        <IpoOrderWindow />
                        <v-dialog v-model="appStore.showalert" persistent hide-overlay width="380">
                            <v-card class="mx-auto pa-4 pb-6 text-right rounded-xl" width="100%">
                                <v-btn @click="appStore.hideAlert()" color="maintext" x-small fab outlined>
                                    <v-icon color="maintext">mdi-close</v-icon>
                                </v-btn>
                                <v-card-text class="text-left px-3">
                                    <p class="title maintext--text font-weight-bold mb-2">
                                        {{ appStore.showalertmsg ? appStore.showalertmsg.title : "" }}
                                    </p>

                                    <p class="fs-16 font-weight-medium mb-3">
                                        <span v-if="appStore.showalertmsg && appStore.showalertmsg.body"
                                            v-html="appStore.showalertmsg.body"></span>
                                    </p>
                                </v-card-text>
                                <v-btn v-if="appStore.showalertmsg && appStore.showalertmsg.callback"
                                    @click="appStore.showalertmsg.callback ? showAlertmode() : appStore.hideAlert()"
                                    color="#FFECB3" class="text-none warning--text elevation-0 rounded-pill mr-2"> Ok
                                </v-btn>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="riskdialog" persistent width="620">
                            <v-card class="elevation-0 py-4 px-2 rounded-xl">
                                <v-card-title class="title font-weight-bold ">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                        fill="none" class="mt-2">
                                        <path
                                            d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z"
                                            :stroke="theme.current.value.dark ? 'white' : 'black'" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <span class="ml-3 pb-2"> Risk disclosures on derivatives </span>
                                </v-card-title>
                                <v-divider class="mx-4"></v-divider>
                                <v-card-text class="px-4 px-md-8 py-7 riskpopup">
                                    <ul :class="theme.current.value.dark ? 'white--text' : 'black--text'"
                                        class="subtitle-1 mb-4 pl-6">
                                        <li style="line-height: 24px" class="mb-2">9 out of 10 individual traders in the
                                            equity Futures and
                                            Options
                                            (F&O) segment incurred net losses.</li>
                                        <li style="line-height: 24px" class="mb-2">On average, the loss-making traders
                                            registered a net
                                            trading loss
                                            close to ₹50,000.</li>
                                        <li style="line-height: 24px" class="mb-2">Over and above the net trading losses
                                            incurred, loss
                                            makers expended
                                            an additional 28% of net trading losses as transaction costs.</li>
                                        <li style="line-height: 24px">Those making net trading profits incurred between
                                            15% to 50% of such
                                            profits as
                                            transaction costs.</li>
                                    </ul>

                                    <p class="caption mb-0 fs-12">
                                        Source:
                                        <a target="_blank" style="text-decoration: none; color: #0037B7"
                                            href="https://www.sebi.gov.in/reports-and-statistics/research/jan-2023/study-analysis-of-profit-and-loss-of-individual-traders-dealing-in-equity-fando-segment_67525.html">
                                            SEBI study</a> dated January 25,
                                        2023, on "Analysis of Profit and Loss of Individual Traders dealing in equity
                                        Futures and Options
                                        (F&O)
                                        Segment," wherein Aggregate Level findings are based on annual Profit/Loss
                                        incurred by individual
                                        traders in
                                        equity F&O during FY 2021-22.
                                    </p>
                                </v-card-text>
                                <v-divider class="mx-4"></v-divider>
                                <v-card-actions class="mt-3">
                                    <v-spacer></v-spacer>
                                    <v-btn color="#0037B7" dark variant="elevated"
                                        class="elevation-0 text-none font-weight-bold rounded-pill px-4"
                                        @click="closeRisk()"> I Understand
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                </v-container>
                <v-overlay :value="appStore.subloader" class="rounded-0">
                    <div class="text-center">
                        <v-card width="70%" class="elevation-0 mx-auto crd-trn d-flex justify-center align-center"
                            style="position: relative; overflow: visible">
                            <div
                                style="position: relative; display: inline-flex; justify-content: center; align-items: center">
                                <v-progress-circular color="primary" :size="115" :width="4" indeterminate
                                    style="position: absolute; z-index: 0"> </v-progress-circular>
                                <img :src="myntLogo" alt="Logo" style="z-index: 1; width: 100px; height: 100px" />
                            </div>
                        </v-card>
                    </div>
                </v-overlay>
            </div>
            <v-footer padless style="position: fixed; bottom: 0px; left: 0; width: 100%; z-index: 10" color="cardbg"
                class="pb-1 d-sm-none">
                <v-row no-gutters>
                    <v-col @click="mobilemenu = true" cols="4" class="text-center pb-2">
                        <v-divider :color="sidetab == 0 ? '#0037B7' : ''" class="pt-1 mb-2"></v-divider>
                        <div>
                            <v-card class="elevation-0" color="transparent" height="24px">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20"
                                    fill="none">
                                    <path
                                        d="M16.459 10.9165C18.7372 10.9165 20.584 9.06968 20.584 6.7915C20.584 4.51333 18.7372 2.6665 16.459 2.6665C14.1808 2.6665 12.334 4.51333 12.334 6.7915C12.334 9.06968 14.1808 10.9165 16.459 10.9165Z"
                                        :stroke="sidetab == 0 ? '#0037B7' : '#506D84'" stroke-width="1.4"
                                        stroke-miterlimit="10" stroke-linecap="square" />
                                    <path d="M11.4167 12.75H5V19.1667H11.4167V12.75Z"
                                        :stroke="sidetab == 0 ? '#0037B7' : '#506D84'" stroke-width="1.4"
                                        stroke-miterlimit="10" stroke-linecap="square" />
                                    <path d="M1.33398 8.16667L5.00065 1.75L8.66732 8.16667H1.33398Z"
                                        :stroke="sidetab == 0 ? '#0037B7' : '#506D84'" stroke-width="1.4"
                                        stroke-miterlimit="10" stroke-linecap="square" />
                                </svg>
                            </v-card>
                            <div class="slider-wrapper fs-12 font-weight-medium text-none">
                                <div class="slider">
                                    <div v-for="(a, l) in mdashitems" :key="l"
                                        :class="`slider-text-${l} ${apptab == l ? 'primary--text' : 'maintext--text'}`">
                                        {{ a }}
                                    </div>
                                </div>
                                <v-icon size="20" :color="sidetab == 0 ? '#0037B7' : '#506D84'">
                                    mdi-chevron-down</v-icon>
                            </div>
                        </div>
                    </v-col>
                    <v-col @click="authStore.uid ? ($router.push(`/orders`), setTabway()) : goSso()" cols="4"
                        class="text-center pb-2">
                        <v-divider :color="sidetab == 1 ? '#0037B7' : ''" class="pt-1 mb-2"></v-divider>
                        <div>
                            <v-card class="elevation-0" color="transparent" height="24px">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.8" clip-path="url(#clip0_8033_1489)">
                                        <path d="M1.66797 4.16406H18.3346"
                                            :stroke="sidetab == 1 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" />
                                        <path
                                            d="M18.3346 19.1654H1.66797V4.16536L5.0013 0.832031H15.0013L18.3346 4.16536V19.1654Z"
                                            :stroke="sidetab == 1 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                        <path
                                            d="M14.1693 8.33203C14.1693 10.6654 12.3359 12.4987 10.0026 12.4987C7.66927 12.4987 5.83594 10.6654 5.83594 8.33203"
                                            :stroke="sidetab == 1 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_8033_1489">
                                            <rect width="20" height="20" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </v-card>
                            <p class="fs-12 font-weight-medium text-none mb-0"
                                :class="sidetab == 1 ? 'primary--text' : 'maintext--text'">
                                Orders</p>
                        </div>
                    </v-col>
                    <v-col @click="authStore.uid ? ($router.push(`/funds`), setTabway()) : goSso()" cols="4"
                        class="text-center pb-2">
                        <v-divider :color="sidetab == 2 ? '#0037B7' : ''" class="pt-1 mb-2"></v-divider>
                        <div>
                            <v-card class="elevation-0" color="transparent" height="24px">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g opacity="0.8" clip-path="url(#clip0_8033_1494)">
                                        <path
                                            d="M4.9987 2.5H2.4987C1.57786 2.5 0.832031 3.24583 0.832031 4.16667C0.832031 5.0875 1.57786 5.83333 2.4987 5.83333"
                                            :stroke="sidetab == 2 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                        <path d="M5 5.83203V0.832031H16.6667V5.83203"
                                            :stroke="sidetab == 2 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                        <path
                                            d="M19.1654 5.83073H2.4987C1.57786 5.83073 0.832031 5.0849 0.832031 4.16406V16.6641C0.832031 18.0449 1.9512 19.1641 3.33203 19.1641H19.1654V5.83073Z"
                                            :stroke="sidetab == 2 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                        <path
                                            d="M14.1667 14.1654C15.0871 14.1654 15.8333 13.4192 15.8333 12.4987C15.8333 11.5782 15.0871 10.832 14.1667 10.832C13.2462 10.832 12.5 11.5782 12.5 12.4987C12.5 13.4192 13.2462 14.1654 14.1667 14.1654Z"
                                            :stroke="sidetab == 2 ? '#0037B7' : '#506D84'" stroke-width="2"
                                            stroke-miterlimit="10" stroke-linecap="square" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_8033_1494">
                                            <rect width="20" height="20" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </v-card>
                            <p class="fs-12 font-weight-medium text-none mb-0"
                                :class="sidetab == 2 ? 'primary--text' : 'maintext--text'">
                                Funds</p>
                        </div>
                    </v-col>
                </v-row>
            </v-footer>
            <v-bottom-sheet v-model="mobilemenu" class="d-md-none">
                <v-sheet class="rounded-t-xl px-4" height="40vh">
                    <div @click="mobilemenu = false" class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="3" viewBox="0 0 32 3" fill="none">
                            <rect width="32" height="3" rx="1.5" fill="#DDDDDD" fill-opacity="0.866667" />
                        </svg>
                    </div>
                    <v-list-item v-for="(s, d) in dashitems" :key="d"
                        @click="sidetab <= 2 || s.idx != apptab ? ($router.push(s.path), (mobilemenu = false), setTabway()) : null">
                        <v-list-item-title
                            :class="s.idx == apptab && sidetab == 0 ? 'font-weight-medium primary--text' : ''">{{
                                s.txt
                            }}</v-list-item-title>
                    </v-list-item>
                </v-sheet>
            </v-bottom-sheet>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import VSnackbars from "v-snackbars"
import AppBar from "../AppBar.vue"
import WatchList from "../../views/Watchlist/WatchList.vue"
import AlertSrceen from "../Popups/AlertSrceen.vue"
// StockOrderWindow moved to App.vue to prevent duplicate instances
import MutualFundOrderWindow from "../Popups/MutualFundOrderWindow.vue"
import BondOrderWindow from "../Popups/BondOrderWindow.vue"
import IpoOrderWindow from "../Popups/IpoOrderWindow.vue"
import { useAppStore } from '../../stores/appStore'
import { useNavStore } from '../../stores/navStore'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useWebsocketStore } from '../../stores/websocketStore'
import { getActiveSession, getReSession, setOrdprefApi, getcallApi } from "../mixins/getAPIdata.js"
import { seyCheckwebsocket } from "../mixins/webSocketstream.js"
import { mynturl } from "../../apiurl.js"
import apiurl from "../../apiurl.js"
import { getAssetPath } from '../../utils/assetHelper.js'

// Import static assets for production compatibility
import myntLogo from '@/assets/MYNT App Logo_v2.svg'
import phoneIcon from '@/assets/phone-icon.svg'
import phoneIconDark from '@/assets/phone-icond.svg'

const appStore = useAppStore()
// Provide v-snackbars with a shallow copy to avoid it mutating our reactive array
const wsOrderObjects = computed(() => appStore.wsorderalertdata.slice())
const navStore = useNavStore()
const authStore = useAuthStore()
const sessionStore = useSessionStore()
const websocketStore = useWebsocketStore()

const route = useRoute()
const theme = useTheme()

// Computed property for phone icon based on theme
const phoneIconSrc = computed(() => {
    return theme.current.value.dark ? phoneIconDark : phoneIcon
})

// Reactive data
const bodytab = ref("Stocks")
const riskdialog = ref(false)
const mobilemenu = ref(false)
const apptab = ref(0)
const sidetab = ref(null)
const valid = ref(true)
const mobile = ref("")

const dashitems = ref([
    { txt: "Stocks", path: "/stocks", idx: 0 },
    { txt: "Mutual Fund", path: "/mutualfund", idx: 1 },
    { txt: "IPOs", path: "/ipo", idx: 2 },
    { txt: "Bonds", path: "/bonds", idx: 3 },
    { txt: "Collection", path: "/collection", idx: 4, type: "Beta" },
])

const mdashitems = ref([
    "Stocks",
    "Mutual Fund",
    "IPOs",
    "Bonds",
    "Collection",
])

const numberis = ref([
    (v) => !!v || "Your Client ID/Mobile is required",
    (v) => (v || "").indexOf(" ") < 0 || "No spaces are allowed"
])

// Methods
const snackAlert = (color, msg) => {
    appStore.showSnackbar(color, msg)
}

const setMenudialog = (type, token, exch, tsym, trantype, item) => {
    navStore.navigateToStockDetails(type, token, exch, tsym, trantype, item)
}

const showAlertmode = () => {
    window.location.reload()
}

const setLoaderstatus = (value) => {
    if (value == 0) {
        appStore.hideLoader()
    } else {
        appStore.showLoader()
    }
}

const NumberValid = ($event) => {
    if (mobile.value.length >= 10) {
        $event.preventDefault()
    }
}

const getCall = async () => {
    if (valid.value == true) {
        const isNumber = !isNaN(Number(mobile.value))
        const data = JSON.stringify({
            [isNumber ? 'mobile' : 'clientid']: isNumber ? mobile.value : mobile.value.toUpperCase(),
            password: "",
            device: "WEB"
        })
        let res = await getcallApi(data)
        if (res && res.stat == "Ok" && res.msg == "user valid") {
            window.location = `https://desk.zebuetrade.com/mynt/?cli=${mobile.value}&url=${window.location.origin + window.location.pathname}`
        } else {
            window.open(`https://oa.mynt.in/?ref=zws${isNumber ? `&mobile=${mobile.value}` : ''}`)
        }
    }
}

const goSso = (flow) => {
    navStore.triggerLogin(flow)
}

const setTabway = () => {
    const pathname = route.path
    // console.log(pathname, "-------------------")
    if (pathname.includes("stocks")) {
        bodytab.value = "Stocks"
        apptab.value = 0
    } else if (pathname.includes("mutualfund")) {
        bodytab.value = "Mutual funds"
        apptab.value = 1
    } else if (pathname.includes("ipo")) {
        bodytab.value = "IPOs"
        apptab.value = 2
    } else if (pathname.includes("bonds")) {
        bodytab.value = "Bonds"
        apptab.value = 3
    } else if (pathname.includes("collection")) {
        bodytab.value = "Collection"
        apptab.value = 4
    }

    if (pathname.includes("orders")) {
        sidetab.value = 1
    } else if (pathname.includes("funds")) {
        sidetab.value = 2
    } else {
        sidetab.value = 0
    }
}

const closeRisk = () => {
    sessionStorage.setItem("risk", 0)
    riskdialog.value = false
}

// WebSocket event handler for 'web-scoketOn' custom events
const handleWebSocketEvent = (event) => {
    const { flow, data, is, page } = event.detail
    websocketStore.handleWebSocketRequest(flow, data, is, page)
}

const getPublicIP = async () => {
    try {
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        localStorage.setItem("uuidipadd", data.ip)
    } catch (error) {
        // console.error(error)
    }
}

const getUserSession = async (k) => {
    appStore.showLoader()
    if (authStore.uid) {
        let sessvalid = await getActiveSession(authStore.uid)
        // console.log("🔍 Session validation result:", sessvalid)

        if (sessvalid && sessvalid.stat == "Ok" && sessvalid.apitoken && sessvalid.token) {
            // console.log("✅ Session valid, proceeding...")

            // IMPORTANT: Update mynturl BEFORE calling seyCheckwebsocket
            // Ensure clientid is added if not in sessvalid
            if (!sessvalid.clientid && authStore.uid) {
                sessvalid.clientid = authStore.uid
            }
            sessionStore.updateMyntUrl(sessvalid)

            // IMPORTANT: Set session status BEFORE calling WebSocket functions
            sessionStorage.setItem("c3RhdHVz", "dmFsaWR1c2Vy")

            // Listen for custom WebSocket events from components
            window.addEventListener('web-scoketOn', handleWebSocketEvent)

            await seyCheckwebsocket()

            var wllayout = localStorage.getItem(`${authStore.uid}_wllayout`)
            appStore.setWatchlistLayout(wllayout && wllayout == 'true' ? true : false)

            // Update authStore with validated session
            // Note: msession should remain as the original sess parameter, not be updated
            // The apitoken is used for API calls but msession stays as the original session token
            if (sessvalid.apitoken) {
                // Don't update msession - it should remain as the original sess from URL
                // authStore.mtoken should also remain as the original msession value
                // console.log("✅ Session validated with apitoken:", sessvalid.apitoken)
            }

            if (k) {
                var url = new URL(window.location.href)
                // Use replace instead of push to avoid adding to history
                window.history.replaceState({}, '', url.pathname)
            }

            let path = window.location
            let r = sessionStorage.getItem("risk")
            if (r != 0 && path.pathname.includes("stocks")) {
                riskdialog.value = true
            }

            // Update global uid in getAPIdata.js before calling API
            const { seyCheckwebsocket: seyCheckwebsocketAPI } = await import("../mixins/getAPIdata.js")
            await seyCheckwebsocketAPI()

            var ordpre = await setOrdprefApi()
            if (!(ordpre && ordpre.metadata && ordpre.metadata.mainpreitems)) {
                ordpre = JSON.parse(localStorage.getItem(`${authStore.uid}_ordpref`))
                var data = {}
                if (ordpre && ordpre.mainpreitems) {
                    data = ordpre
                    localStorage.removeItem(`${authStore.uid}_ordpref`)
                } else {
                    data = appStore.getOrderPref()
                }
                await setOrdprefApi({ "clientid": authStore.uid, "metadata": data, "source": "WEB" }, true)
            }

            // Hide loader after successful session validation
            // console.log("✅ Hiding loader...")
            appStore.setMainLoader(false)
            appStore.hideLoader()
            // console.log("✅ Loader hidden, mainloader value:", appStore.mainloader)

            // Clear the loader timeout since we've successfully loaded
            if (window.__loaderTimeout) {
                clearTimeout(window.__loaderTimeout)
                delete window.__loaderTimeout
            }

            // Note: Old app does NOT have periodic session monitoring
            // It only checks session on login, not periodically
        } else if (authStore.uid && authStore.token && sessvalid && sessvalid.emsg) {
            // Handle error case (exactly like old app: lines 712-717)
            // console.error("❌ Session validation failed:", sessvalid.emsg)

            // Use sessionStore to handle error (exact old app behavior)
            // Old app: this.snackAlert(2, sessvalid.emsg ? sessvalid.emsg : sessvalid);
            //         eventBus.$emit("storage-reset");
            //         this.mtoken = null; this.token = null; this.uid = null;
            sessionStore.handleSessionError(sessvalid, authStore, appStore)

            // Old app also sets mainloader = false (line 734)
            appStore.setMainLoader(false)
            appStore.hideLoader()

            // Clear timeout
            if (window.__loaderTimeout) {
                clearTimeout(window.__loaderTimeout)
                delete window.__loaderTimeout
            }
        } else {
            // console.log("⚠️ No valid session found")
            // Only clear session status if we have credentials but they're invalid
            if (authStore.token && authStore.uid) {
                sessionStorage.removeItem("c3RhdHVz")
                appStore.resetStorage()
                let path = window.location
                if (path.pathname != "/bonds" && path.pathname != "/stocks" && path.pathname != "/mutualfund" && path.pathname != "/mutualfund/categories" && path.pathname != "/ipo" && path.pathname != "/ipo/performance") {
                    appStore.showSnackbar(2, "Error: Request failed with status code 401")
                    setTimeout(() => {
                        goSso()
                    }, 2000)
                }
            }
            appStore.setMainLoader(false)
            appStore.hideLoader()

            // Clear timeout
            if (window.__loaderTimeout) {
                clearTimeout(window.__loaderTimeout)
                delete window.__loaderTimeout
            }
        }
    } else {
        appStore.setMainLoader(false)
        appStore.hideLoader()

        // Clear timeout
        if (window.__loaderTimeout) {
            clearTimeout(window.__loaderTimeout)
            delete window.__loaderTimeout
        }
    }
}

// Lifecycle
onMounted(async () => {
    // console.log("🚀 LayoutSrc onMounted starting...")
    // Don't remove session status here - only remove it on logout
    // sessionStorage.removeItem("c3RhdHVz")

    // Initialize theme - default to light
    var theme
    let t = localStorage.getItem("web.theme")
    if (t == "default" || !t) {
        // Default to light theme instead of system preference
        theme = "light"
    } else {
        theme = t == "dark" || t == "light" ? t : "light"
    }
    localStorage.setItem("web.theme", theme)

    // Update Vuetify theme
    if (window.Vuetify && window.vuetifyInstance) {
        vuetifyInstance.theme.dark = theme == "dark"
    }

    document.getElementById("theme-link")?.setAttribute("href", `theme-${theme}.css`)
    appStore.setMainLoader(true)

    // Fail-safe: Always hide loader after 30 seconds to prevent infinite loading
    window.__loaderTimeout = setTimeout(() => {
        // console.warn("⚠️ Loader timeout - force hiding loader")
        appStore.setMainLoader(false)
        appStore.hideLoader()
    }, 30000)

    // Initialize session
    await sessionStore.initializeConfig()

    // Check for shared session (sUserId and sToken) - Same logic as old app
    const url = new URL(window.location.href)
    var suser = url.searchParams.get("sUserId")
    var stoken = url.searchParams.get("sToken")

    // console.log("🔍 Checking for shared session parameters:", { suser, stoken })

    if (typeof suser == "string" && typeof stoken == "string") {
        // console.log("📡 Found shared session, calling redirect API...")
        let sessvalid = await getReSession([suser, stoken, url.pathname])
        // console.log("📡 Redirect API response:", sessvalid)

        if (sessvalid && sessvalid.stat == "Ok" && sessvalid.apitoken && sessvalid.token) {
            const redirectUrl = `${url.origin}${url.pathname}?uid=${sessvalid.clientid}&sess=${sessvalid.apitoken}&token=${sessvalid.token}&imei=${sessvalid.timei}&src=${sessvalid.source}`
            // console.log("✅ Redirecting to:", redirectUrl)
            window.location.assign(redirectUrl)
            return // Exit early to prevent further execution
        } else {
            // console.error("❌ Redirect API failed:", sessvalid.emsg)
            appStore.showSnackbar(2, sessvalid.emsg ? sessvalid.emsg : sessvalid)
        }
    } else {
        // console.log("✅ No shared session parameters found")
    }

    // Check for regular session parameters - Same logic as old app
    var actid = url.searchParams.get("uid")
    var token = url.searchParams.get("token")
    var sess = url.searchParams.get("sess")

    if (typeof actid == "string" && typeof token == "string") {
        // console.log("📥 Fresh login detected, setting up session...")
        // Clear cached profile data
        localStorage.removeItem("profile_data")

        // Set sessionStorage items (same as old app)
        sessionStorage.setItem("usession", token)
        sessionStorage.setItem("userid", actid)
        if (sess) {
            sessionStorage.setItem("msession", sess)
        }
        const imei = url.searchParams.get("imei")
        if (imei) {
            sessionStorage.setItem("imei", imei)
        }

        getPublicIP()

        // Update authStore from sessionStorage
        authStore.mtoken = sessionStorage.getItem("msession")
        authStore.token = sessionStorage.getItem("usession")
        authStore.uid = sessionStorage.getItem("userid")

        // Validate session
        await getUserSession(actid)
    } else {
        // No URL params, try to load from session
        authStore.loadFromSession()
        const uid = authStore.uid
        const token = authStore.token

        // Check if we have a valid session status indicator
        const sessionStatus = sessionStorage.getItem("c3RhdHVz")

        if (uid && token && sessionStatus === "dmFsaWR1c2Vy") {
            // console.log("✅ Valid session found, loading data without validation...")

            // Load mynturl from sessionStorage first
            const mynturlLoaded = sessionStore.loadMyntUrl(uid)
            // console.log("📦 mynturl loaded from sessionStorage:", mynturlLoaded ? "Yes" : "No")

            // If mynturl wasn't loaded, we need to fetch it
            if (!mynturlLoaded) {
                // console.log("⚠️ mynturl not in sessionStorage, calling getUserSession to fetch it...")
                await getUserSession(uid)
                return // Exit here, getUserSession will handle everything
            }

            // Session is valid, just load the data
            await sessionStore.initializeConfig()

            var logid = uid + new Date().toLocaleDateString()
            let log = sessionStorage.getItem(logid)
            if (log) {
                try {
                    log = JSON.parse(log)
                    appStore.snackalerts = log && log.length > 0 ? log : []
                } catch (e) {
                    // console.error("Error parsing alerts:", e)
                    appStore.snackalerts = []
                }
            }

            // Load watchlist layout preference
            var wllayout = localStorage.getItem(`${uid}_wllayout`)
            if (wllayout !== null) {
                appStore.setWatchlistLayout(wllayout === 'true')
            }

            // IMPORTANT: Initialize WebSocket listener for existing sessions too
            // console.log("🔌 Initializing WebSocket listener for existing session...")
            window.addEventListener('web-scoketOn', handleWebSocketEvent)

            // IMPORTANT: Load order preferences API (this was being skipped!)
            // console.log("📥 Loading order preferences...")

            // Update global uid variable for API calls
            await seyCheckwebsocket() // This updates the global uid variable

            // Import and call the wrapper to update uid/tok in getAPIdata.js
            const { seyCheckwebsocket: seyCheckwebsocketAPI } = await import("../mixins/getAPIdata.js")
            await seyCheckwebsocketAPI() // This updates uid in getAPIdata.js

            // console.log("✅ WebSocket session checked, mynturl stat:", apiurl.mynturl?.stat)

            var ordpre = await setOrdprefApi()
            if (!(ordpre && ordpre.metadata && ordpre.metadata.mainpreitems)) {
                ordpre = JSON.parse(localStorage.getItem(`${uid}_ordpref`))
                var data = {}
                if (ordpre && ordpre.mainpreitems) {
                    data = ordpre
                    localStorage.removeItem(`${uid}_ordpref`)
                } else {
                    data = appStore.getOrderPref()
                }
                await setOrdprefApi({ "clientid": uid, "metadata": data, "source": "WEB" }, true)
            }
            // console.log("✅ Order preferences loaded")

            // Note: Old app does NOT check session on page refresh
            // It only checks session on login, not when loading from sessionStorage
            // So we don't verify session here - just load the data

            appStore.setMainLoader(false)

            // Clear timeout
            if (window.__loaderTimeout) {
                clearTimeout(window.__loaderTimeout)
                delete window.__loaderTimeout
            }
        } else if (uid && token) {
            // Has credentials but no session status, validate it
            await getUserSession(null)
        } else {
            // No credentials at all
            appStore.setMainLoader(false)

            // Clear timeout
            if (window.__loaderTimeout) {
                clearTimeout(window.__loaderTimeout)
                delete window.__loaderTimeout
            }
        }
    }

    setTabway()

    // Setup keyboard handler for ESC key
    document.onkeydown = function (evt) {
        evt = evt || window.event
        var isEscape = false
        if ("key" in evt) {
            isEscape = evt.key === "Escape" || evt.key === "Esc"
        } else {
            isEscape = evt.keyCode === 27
        }
        if (isEscape) {
            if (appStore.snackbar) {
                appStore.hideSnackbar()
            }
            if (appStore.showalert) {
                appStore.hideAlert()
            }
        }
    }
})

// Watch for route changes and update tabs
watch(
    () => route.path,
    (newPath) => {
        setTabway()
    },
    { immediate: false }
)

// Watch for wsorderalertdata changes
watch(
    () => appStore.wsorderalertdata,
    (newVal) => {
        if (appStore.wsorderalertdata.length > 2) {
            if (appStore.wsorderalertdata[0]) {
                appStore.wsorderalertdata.shift()
            }
        }
    },
    { deep: true }
)

// Cleanup on unmount
onUnmounted(() => {
    // console.log("🧹 LayoutSrc unmounting, stopping session monitoring...")
    // Stop session monitoring
    sessionStore.stopSessionMonitoring()
    // Remove WebSocket event listener
    window.removeEventListener('web-scoketOn', handleWebSocketEvent)
})
</script>

<style>
@import "../../assets/style.css";

.v-tabs-bar {
    height: 40px !important;
}

.default-tab .v-tabs-bar {
    height: 48px !important;
}
</style>