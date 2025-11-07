<template>
    <div>
        <v-app-bar color="cardbg" width="100%" permanent class="cust-appbar">
            <img @click="toHome()" :src="`/src/assets/${$vuetify.theme.dark ? 'logod' : 'logo'}.svg`" width="80px"
                alt="zebulogo" class="mr-4" />

            <v-btn :to="t.path != '/optionz' ? t.path : ''" @click="appMainPage(t)" v-for="(t, index) in dashitems"
                :key="index" text plain exact
                :class="['menu-btn', 'text-capitalize', 'd-none', 'd-sm-flex', { 'menu-btn-active': isRouteActive(t.path) }]"
                :active="isRouteActive(t.path)">
                <!-- <v-badge color="primary" :content="t.type" :value="t.type ? true : false"> -->
                <span active-class="font-weight-bold" class="menu-text-sty">{{ t.txt }}</span>
                <!-- </v-badge> -->
            </v-btn>
            <v-spacer></v-spacer>

            <v-menu v-if="authStore.useris()" close-on-click offset-y max-width="240px" class="table-menu">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" text small
                        class="mx-1 elevation-0 text-none font-weight-medium subtitle-1 d-none d-md-none d-sm-flex px-2">
                        More <v-icon class="ml-1">mdi-chevron-down</v-icon>
                    </v-btn>
                </template>
                <v-card class="table-menu-list">
                    <v-list>
                        <v-list-item to="/positions">
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Positions</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item to="/holdings">
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Holdings</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider class="mx-3"></v-divider>
                        <v-list-item to="/orders">
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Orders</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item to="/funds">
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Fund</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item to="/notification">
                            <v-list-item-content>
                                <v-list-item-title
                                    class="font-weight-medium fs-14 mb-0">Notification</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-menu>

            <v-btn v-if="authStore.useris()" to="/positions" text plain exact
                :class="['menu-btn', 'text-capitalize', 'd-none', 'd-md-flex', { 'menu-btn-active': isPositionsActive }]"
                :active="isPositionsActive">
                <span class="menu-text-sty">Positions</span></v-btn>
            <v-btn v-if="authStore.useris()" to="/holdings" text plain exact
                :class="['menu-btn', 'text-capitalize', 'd-none', 'd-md-flex', { 'menu-btn-active': isHoldingsActive }]"
                :active="isHoldingsActive">
                <span class="menu-text-sty">Holdings</span></v-btn>
            <v-btn v-if="authStore.useris()" to="/orders" text plain exact
                :class="['menu-btn', 'text-capitalize', 'd-none', 'd-md-flex', { 'menu-btn-active': isOrdersActive }]"
                :active="isOrdersActive">
                <span class="menu-text-sty">Orders</span></v-btn>
            <v-btn v-if="authStore.useris()" to="/funds" text plain exact
                :class="['menu-btn', 'text-capitalize', 'd-none', 'd-md-flex', { 'menu-btn-active': isFundsActive }]"
                :active="isFundsActive">
                <span class="menu-text-sty">Fund</span></v-btn>

            <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">
                        <v-btn v-if="authStore.useris()" to="/notification" icon small exact
                            :class="['ml-1', 'mr-2', 'd-none', 'd-md-flex', { 'notification-active': isNotificationActive }]"
                            :active="isNotificationActive">
                            <img :src="`/src/assets/${$vuetify.theme.dark ? 'notificationd' : 'notification'}.svg`" />
                        </v-btn>
                    </div>
                </template>
                <span>Notification</span>
            </v-tooltip>

            <v-tooltip color="black" bottom v-if="appStore.showalert && appStore.showalertmsg.callback">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn @click="setConnection()" v-bind="attrs" v-on="on" fab color="warning" small
                        class="mx-1 elevation-0">
                        <v-icon>mdi-spin mdi-sync-alert</v-icon>
                    </v-btn>
                </template>
                <span class="warning--text font-weight-bold">Session is inactive, Click to refresh</span>
            </v-tooltip>

            <v-menu v-else-if="showUserMenu" close-on-click offset-y class="table-menu" v-model="menuOpen">
                <template v-slot:activator="{ on, attrs }">
                    <v-tooltip bottom color="black" :value="tooltipVisible">
                        <template v-slot:activator="{ on: tooltipOn, attrs: tooltipAttrs }">
                            <div v-bind="tooltipAttrs" v-on="tooltipOn">
                                <v-btn v-bind="attrs" v-on="on" @click="handleUserIdClick" color="secbg"
                                    style="background-color: #F1F3F8 !important;color: black !important;" small
                                    class="mx-1 elevation-0">
                                    <span class="font-weight-medium fs-14">
                                        {{ authStore.clientdata?.CLIENT_ID || authStore.uid || "-" }}
                                    </span>
                                </v-btn>
                            </div>
                        </template>
                        <span>{{ authStore.clientdata?.CLIENT_NAME || authStore.clientdata?.CLIENT_ID || authStore.uid
                            || "User" }}</span>
                    </v-tooltip>
                </template>

                <v-card class="table-menu-list">
                    <v-list>
                        <v-list-item class="mb-2">
                            <v-list-item-avatar color="secbg">
                                <span class="title font-weight-bold">
                                    {{ authStore.clientdata?.CLIENT_NAME ? authStore.clientdata.CLIENT_NAME.slice(0, 1)
                                        :
                                        "-" }}
                                </span>
                            </v-list-item-avatar>

                            <v-list-item-content>
                                <v-list-item-title class="fs-14 font-weight-bold mb-1">
                                    {{ authStore.clientdata?.CLIENT_NAME ? authStore.clientdata.CLIENT_NAME : "-" }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="fs-12 subtext--text">
                                    User ID {{ authStore.clientdata?.CLIENT_ID ? authStore.clientdata.CLIENT_ID : "" }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>

                        <v-list-item
                            :href="`https://profile.zebuetrade.com/profile?uid=${authStore.uid}&token=${authStore.token}`"
                            target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="24px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? '1d' : '1'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">My Account</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Profile, Bank, Segment, MTF,
                                    Closure,
                                    Downloads</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider class="mx-3"></v-divider>
                        <v-list-item
                            :href="`https://profile.zebuetrade.com/ledger?uid=${authStore.uid}&token=${authStore.token}`"
                            target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? 'reportsd' : 'reports'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Reports</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Ledger, Holdings, PnL, Tax,
                                    Downloads</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider class="mx-3"></v-divider>
                        <v-list-item
                            :href="`https://profile.zebuetrade.com/corporateaction?uid=${authStore.uid}&token=${authStore.token}`"
                            target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? 'coad' : 'coa'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Corporation
                                    Action</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Buyback, Delisting, Takeover,
                                    OFS</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item
                            :href="`https://profile.zebuetrade.com/pledge?uid=${authStore.uid}&token=${authStore.token}`"
                            target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="24px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? 'pledged' : 'pledge'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Pledge &
                                    Unpledge</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Stocks held by various
                                    accounts</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider class="mx-3"></v-divider>
                        <v-list-item href="https://zebuetrade.com/referral" target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? 'referald' : 'referal'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Refer</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Refer your family &
                                    friends</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item href="https://zebuetrade.com/contactus" target="_blank">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? '6d' : '6'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Help &
                                    Support</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">Sales, Support &
                                    Desk</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item to="/settings">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? '7d' : '7'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14 mb-0">Setting</v-list-item-title>
                                <v-list-item-subtitle class="fs-10 subtext--text">API key, Change password, Themes,
                                    Log</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider class="mx-3"></v-divider>
                        <v-list-item @click="logOut()">
                            <v-list-item-icon class="mr-3 text-center">
                                <img width="22px" class="pl-1"
                                    :src="`/src/assets/usermenu/${$vuetify.theme.dark ? '8d' : '8'}.svg`" />
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="font-weight-medium fs-14">Logout</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-menu>
            <v-tooltip bottom color="black" v-else>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn @click="goLogin()" :disabled="authStore.useris()" v-bind="attrs" v-on="on" fab color="secbg"
                        small class="mx-1 elevation-0">
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19 7.5C19 9.70914 17.2091 11.5 15 11.5V13.5C18.3137 13.5 21 10.8137 21 7.5H19ZM15 11.5C12.7909 11.5 11 9.70914 11 7.5H9C9 10.8137 11.6863 13.5 15 13.5V11.5ZM11 7.5C11 5.29086 12.7909 3.5 15 3.5V1.5C11.6863 1.5 9 4.18629 9 7.5H11ZM15 3.5C17.2091 3.5 19 5.29086 19 7.5H21C21 4.18629 18.3137 1.5 15 1.5V3.5ZM11.25 17.25H18.75V15.25H11.25V17.25ZM18.75 25.25H11.25V27.25H18.75V25.25ZM11.25 25.25C9.04086 25.25 7.25 23.4591 7.25 21.25H5.25C5.25 24.5637 7.93629 27.25 11.25 27.25V25.25ZM22.75 21.25C22.75 23.4591 20.9591 25.25 18.75 25.25V27.25C22.0637 27.25 24.75 24.5637 24.75 21.25H22.75ZM18.75 17.25C20.9591 17.25 22.75 19.0409 22.75 21.25H24.75C24.75 17.9363 22.0637 15.25 18.75 15.25V17.25ZM11.25 15.25C7.93629 15.25 5.25 17.9363 5.25 21.25H7.25C7.25 19.0409 9.04086 17.25 11.25 17.25V15.25Z"
                                :fill="$vuetify.theme.dark ? '#2E65F6' : '#0037B7'" />
                        </svg>
                    </v-btn>
                </template>
                <span>Login with ZEBU</span>
            </v-tooltip>
        </v-app-bar>
        <v-slide-y-transition>
            <v-app-bar v-show="appStore.onLinebanner"
                :color="appStore.lowConnection ? 'yellow darken-2' : appStore.onlinestat ? 'success' : 'error'"
                width="100%" height="32px" class="cust-appbar-alert" dense flat>
                <div class="mx-auto">
                    <span class="white--text font-weight-bold fs-14">
                        <v-icon color="white" size="20">{{ !appStore.lowConnection && appStore.onlinestat ?
                            'mdi-check-circle-outline' :
                            'mdi-alert-outline' }}</v-icon>
                        {{ appStore.lowConnection ? 'Connection is slow. App performance may vary.' :
                            appStore.onlinestat ?
                                'You are back online. All good now!' : 'No internet.Check connection and try again.' }}
                    </span>
                </div>
            </v-app-bar>
        </v-slide-y-transition>
        <v-slide-y-transition>
            <v-app-bar v-show="appStore.showalert && appStore.showalertmsg.callback" color="primary lighten-4"
                width="100%" height="70px" class="cust-appbar-alerts" dense flat>
                <v-list-item class="px-0" three-line>
                    <v-list-item-content>
                        <v-list-item-title class="font-weight-bold mainbg--text fs-14 mb-0 lh-0">
                            <span>{{ appStore.showalertmsg ? appStore.showalertmsg.title : "" }}</span>
                        </v-list-item-title>
                        <v-list-item-subtitle class="font-weight-medium mainbg--text fs-13 lh-0">
                            <span v-if="appStore.showalertmsg && appStore.showalertmsg.body"
                                v-html="appStore.showalertmsg.body"></span>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-spacer></v-spacer>
                <v-btn icon @click="appStore.hideAlert()">
                    <v-icon color="mainbg" size="18">mdi-close</v-icon>
                </v-btn>
            </v-app-bar>
        </v-slide-y-transition>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useAppStore } from '../stores/appStore'
import { useNavStore } from '../stores/navStore'
import { useSessionStore } from '../stores/sessionStore'
import { getProfiledata, getDeskLogout, getMyntLogout, getHsTokenapi } from "./mixins/getAPIdata.js"
import { mynturl } from "../apiurl.js"
import CryptoJS from "crypto-js"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()
const navStore = useNavStore()
const sessionStore = useSessionStore()

// Session check interval for polling session status
let sessionCheckInterval = null

// Tooltip visibility control
const tooltipVisible = ref(false)
// Menu open state
const menuOpen = ref(false)

// Handle user ID click
const handleUserIdClick = (event) => {
    console.log('🔵 User ID/Client ID clicked:', {
        uid: authStore.uid,
        clientId: authStore.clientdata?.CLIENT_ID,
        clientName: authStore.clientdata?.CLIENT_NAME,
        displayedValue: authStore.clientdata?.CLIENT_ID || authStore.uid || "-",
        timestamp: new Date().toISOString()
    })

    // Show tooltip on click
    tooltipVisible.value = true

    // Ensure menu opens (v-on="on" should handle this, but we ensure it as fallback)
    menuOpen.value = true

    // Hide tooltip after 3 seconds
    setTimeout(() => {
        tooltipVisible.value = false
    }, 3000)
}

// Show user menu as soon as we have a logged-in user (CLIENT_ID or uid)
const showUserMenu = computed(() => {
    const isLoggedIn = authStore.useris()
    const hasId = !!(authStore.clientdata?.CLIENT_ID || authStore.uid)
    return isLoggedIn && hasId
})

// Computed properties for exact route matching
const isPositionsActive = computed(() => route.path === '/positions')
const isHoldingsActive = computed(() => route.path === '/holdings')
const isOrdersActive = computed(() => route.path.startsWith('/orders'))
const isFundsActive = computed(() => route.path === '/funds')
const isNotificationActive = computed(() => route.path === '/notification')

// Computed properties for main navigation buttons (with sub-route support)
const isStocksActive = computed(() => route.path === '/stocks' || route.path.startsWith('/stocks/'))
const isMutualFundActive = computed(() => route.path === '/mutualfund' || route.path.startsWith('/mutualfund/'))
const isIpoActive = computed(() => route.path === '/ipo' || route.path.startsWith('/ipo/'))
const isBondsActive = computed(() => route.path === '/bonds' || route.path.startsWith('/bonds/'))
const isCollectionActive = computed(() => route.path === '/collection' || route.path.startsWith('/collection/'))

// Computed property for Trading route
const isTradingActive = computed(() => route.path === '/trading' || route.path.startsWith('/trading/'))

// Helper function to check if a route is active
const isRouteActive = (path) => {
    if (path === '/stocks') return isStocksActive.value
    if (path === '/mutualfund') return isMutualFundActive.value
    if (path === '/ipo') return isIpoActive.value
    if (path === '/bonds') return isBondsActive.value
    if (path === '/collection') return isCollectionActive.value
    if (path === '/trading') return isTradingActive.value
    return false
}

const dashitems = ref([
    { txt: "Stocks", path: "/stocks", idx: 0 },
    { txt: "Mutual Fund", path: "/mutualfund", idx: 1 },
    { txt: "IPOs", path: "/ipo", idx: 2 },
    { txt: "Bonds", path: "/bonds", idx: 3 },
    { txt: "Collection", path: "/collection", idx: 4, type: "Beta" },
    { txt: "OptionZ", path: "/optionz", idx: 5 },
    // { txt: "Trading", path: "/trading", idx: 6 },
])

const encryptionFunction = (payld) => {
    const payload = payld
    var derived_key = CryptoJS.enc.Base64.parse(btoa("N#j2L^8pq9Fb$d@1"))
    var iv = CryptoJS.enc.Utf8.parse("3790514682037125")
    var test = CryptoJS.AES.encrypt(payload, derived_key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
    }).toString()
    return test
}

const decryptionFunction = (payld) => {
    const payload = payld
    const derived_key = CryptoJS.enc.Base64.parse(btoa("N#j2L^8pq9Fb$d@1"))
    const iv = CryptoJS.enc.Utf8.parse("3790514682037125")
    const encryptedData = payload
    const decrypted = CryptoJS.AES.decrypt(encryptedData, derived_key, {
        iv,
        mode: CryptoJS.mode.CBC,
    })
    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8)
    return decryptedData
}

const getUserdata = async (data) => {
    console.log("📥 AppBar: Getting user data...")
    console.log("📥 Parameters being sent:", {
        data,
        uid: authStore.uid,
        token: authStore.token ? "***" : "undefined"
    })

    const cachedConfig = localStorage.getItem("profile_data")
    console.log("📦 Cached profile_data:", cachedConfig ? "Exists" : "None")

    let config = cachedConfig || await getProfiledata([data, authStore.uid, authStore.token])


    config = config?.includes?.('str') ? JSON.parse(config) : config

    console.log("🔍 Config after parse:", config)
    console.log("🔍 config.emsg:", config?.emsg)
    console.log("🔍 config.str:", config?.str ? "Exists" : "Missing")

    if (config?.str && config.emsg !== "invalid token") {
        const res = JSON.parse(decryptionFunction(config.str))
        console.log("✅ User data decrypted:", res)
        console.log("📋 client_data:", res?.client_data)

        if (res?.client_data) {
            console.log("✅ Setting clientdata with:", res.client_data)
            authStore.setClientdata(res.client_data)
            authStore.setUserdata(res)
            config['uid'] = authStore.uid
            localStorage.setItem("profile_data", JSON.stringify(config))
            // Store clientdata separately in localStorage for quick restoration
            localStorage.setItem("client_data", JSON.stringify({
                uid: authStore.uid,
                data: res.client_data
            }))
            console.log("✅ User data set in authStore")
            console.log("✅ clientdata.CLIENT_NAME:", authStore.clientdata?.CLIENT_NAME)
            console.log("✅ clientdata.CLIENT_ID:", authStore.clientdata?.CLIENT_ID)
        } else {
            authStore.setUserdata(null)
            authStore.setClientdata({})
            localStorage.removeItem("client_data")
            console.log("⚠️ No client_data in response")
        }
    } else {
        console.log("⚠️ No valid profile data")
    }
    console.log("✅ Setting loading to false")
    authStore.setLoading(false)
}

const toHome = () => {
    router.push("/stocks")
}

const appMainPage = async (t) => {
    if (t.path === "/optionz") {
        if (!authStore.useris()) {
            goLogin()
            return
        }

        const data = await getHsTokenapi()
        if (data?.stat === "Ok") {
            const beforehas = CryptoJS.enc.Utf8.parse(`sLoginId=${authStore.uid}&sAccountId=${authStore.uid}&token=${data.hstk}&sBrokerId=ZEBU`)
            const codeforedis = CryptoJS.enc.Base64.stringify(beforehas)
            window.open(`https://sso.mynt.in/sso?vc=instaoptions&key=${codeforedis}`, "_blank")
        } else {
            appStore.showSnackbar(2, data?.emsg || data)
        }
    }
}

const goLogin = () => {
    navStore.triggerLogin()
}

const logOut = async () => {
    await getDeskLogout([authStore.uid, authStore.token])
    await getMyntLogout(sessionStore.source || "WEB")
    // Clear session status indicator
    sessionStorage.removeItem("c3RhdHVz")
    appStore.resetStorage()
    authStore.clearAuth()
    window.location.reload()
}

const setConnection = () => {
    window.location.reload()
}

const checkUserSession = async () => {
    console.log("🔍 AppBar: Checking user session...")
    let res = sessionStorage.getItem("c3RhdHVz")
    console.log("🔍 Session status:", res)

    if (res == "dmFsaWR1c2Vy") {
        console.log("✅ Valid session found, loading user data...")
        authStore.token = sessionStorage.getItem("usession")
        authStore.mtoken = sessionStorage.getItem("msession")
        authStore.uid = sessionStorage.getItem("userid")

        // Only fetch if we don't already have clientdata loaded
        if (!authStore.clientdata?.CLIENT_ID && authStore.uid) {
            var dall = JSON.stringify({
                client_id: authStore.uid,
            })
            let date1 = encryptionFunction(dall)

            let data = JSON.stringify({
                string: date1,
            })

            await getUserdata(data)
        } else {
            console.log("✅ Clientdata already loaded:", authStore.clientdata?.CLIENT_NAME)
            authStore.setLoading(false)
        }
    } else {
        console.log("❌ No valid session, setting loading to false")
        authStore.setLoading(false)
    }
}

const status = (ele) => {
    appStore.setConnectionStatus(ele)
}

// Lifecycle
onMounted(() => {
    authStore.loadFromSession()
    checkUserSession()

    // Setup connection monitoring
    appStore.checkConnectionSpeed()
    if (navigator.connection) {
        navigator.connection.addEventListener("change", appStore.checkConnectionSpeed)
    }
    window.addEventListener('online', () => { status(true) })
    window.addEventListener('offline', () => { status(false) })

    // Poll for session status changes (for when login completes after mount)
    sessionCheckInterval = setInterval(() => {
        const sessionStatus = sessionStorage.getItem("c3RhdHVz")
        if (sessionStatus === "dmFsaWR1c2Vy" && authStore.uid && !authStore.clientdata?.CLIENT_ID) {
            console.log("🔔 Session status is valid, checking user session...")
            checkUserSession()
            // Clear interval once we've checked and found valid session
            if (sessionCheckInterval) {
                clearInterval(sessionCheckInterval)
                sessionCheckInterval = null
            }
        }
    }, 500)

    // Stop polling after 10 seconds (session should be set by then)
    setTimeout(() => {
        if (sessionCheckInterval) {
            clearInterval(sessionCheckInterval)
            sessionCheckInterval = null
        }
    }, 10000)
})

onUnmounted(() => {
    if (navigator.connection) {
        navigator.connection.removeEventListener("change", appStore.checkConnectionSpeed)
    }
    window.removeEventListener('online', () => { status(true) })
    window.removeEventListener('offline', () => { status(false) })

    // Cleanup interval
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
        sessionCheckInterval = null
    }
})

// Watch for user status changes
watch(
    () => authStore.uid,
    () => {
        if (authStore.uid) {
            // Check session after a short delay to allow session status to be set
            setTimeout(() => {
                checkUserSession()
            }, 200)
        }
    }
)

</script>

<style scoped>
.cust-appbar {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}


/* Default state: black text */
.menu-btn .v-btn__content,
.menu-text-sty {
    font-size: 12px;
    font-weight: 500 !important;
    color: #000 !important;
    opacity: 1 !important;
}

/* Active/Selected state: primary color, bold - NO background */
/* Only apply active styles when menu-btn-active class is present */
.menu-btn-active.menu-btn .v-btn__content,
.menu-btn-active.menu-btn .menu-text-sty,
.menu-btn-active .menu-text-sty {
    color: var(--v-primary-base, #0037B7) !important;
    /* font-weight: 700 !important; */
    background-color: transparent !important;
}

/* Override Vuetify's default active state for router links - only allow exact match */
.menu-btn.router-link-exact-active:not(.router-link-active) .menu-text-sty,
.menu-btn.router-link-exact-active:not(.router-link-active) .v-btn__content {
    color: var(--v-primary-base, #0037B7) !important;
    /* font-weight: 700 !important; */
    background-color: transparent !important;
}

/* Explicitly disable active state for buttons that shouldn't be active */
.menu-btn:not(.menu-btn-active).v-btn--active .menu-text-sty,
.menu-btn:not(.menu-btn-active).router-link-active:not(.router-link-exact-active) .menu-text-sty,
.menu-btn:not(.menu-btn-active).v-btn--active .v-btn__content {
    color: #000 !important;
    font-weight: 500 !important;
}

/* Remove any background or hover effects from inactive buttons */
.menu-btn:not(.menu-btn-active)::before,
.menu-btn:not(.menu-btn-active):hover::before {
    opacity: 0 !important;
    background-color: transparent !important;
}

/* Notification button active state */
.notification-active {
    opacity: 1 !important;
}

.notification-active img {
    filter: brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(7471%) hue-rotate(220deg) brightness(96%) contrast(92%);
    transition: filter 0.2s ease;
}

/* Ensure transparent background always - no background colors */
.menu-btn,
.menu-btn::before {
    background-color: transparent !important;
}

/* Remove any background highlighting from Vuetify's active states */
.menu-btn.v-btn--active::before,
.menu-btn.router-link-active::before,
.menu-btn-active::before,
.menu-btn-active.v-btn--active::before {
    opacity: 0 !important;
    background-color: transparent !important;
}

/* Remove hover background effects */
.menu-btn:hover::before,
.menu-btn-active:hover::before {
    opacity: 0 !important;
    background-color: transparent !important;
}


.table-menu-list {
    width: 100% !important;
    border-radius: 8px !important;
    z-index: 9999 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.table-menu {
    top: 64px;
    position: fixed;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    width: 100% !important;
}

.cust-appbar-alert {
    position: fixed;
    top: 64px;
    z-index: 999;
}

.cust-appbar-alerts {
    position: fixed;
    top: 64px;
    z-index: 999;
}
</style>
