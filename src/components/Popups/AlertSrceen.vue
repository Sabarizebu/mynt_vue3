<template>
    <div>
        <v-dialog v-if="menudata[0]" v-model="alertdialog" :scrim="false" width="480px">
            <v-card class="pb-6 overflow-hidden rounded-lg" color="cardbg">
                <v-card class="elevation-0 py-4 rounded-b-0" color="secbg">
                    <v-toolbar class="elevation-0 px-2 crd-trn" density="compact">
                        <v-list-item class="px-0">
                            <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-2">
                                {{ menudata[0] ? menudata[0].tsym : "" }}
                                <span class="ml-1 txt-999 fs-10">{{ menudata[0] ? menudata[0].exch : "" }}</span>
                            </v-list-item-title>
                            <v-list-item-title class="maintext--text font-weight-bold fs-14 mb-1">
                                ₹<span id="laypopltp">{{ menudata.ltp ? menudata.ltp : "0.00" }}</span> &nbsp;
                                <span class="fs-12" id="laypopchpclr"
                                    :class="menudata.ch > 0 ? 'maingreen--text' : menudata.ch < 0 ? 'mainred--text' : 'subtext--text'">
                                    <span id="laypopch">{{ menudata && menudata.ch ? `${menudata.ch}` : "0.00" }}</span>
                                    (<span id="laypopchp">{{ menudata && menudata.chp ? `${menudata.chp}` : "0.00"
                                    }}</span>%)
                                </span>
                            </v-list-item-title>
                        </v-list-item>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="alertloader" @click="closeMenudialog('alert')" size="small" icon>
                            <v-icon color="maintext">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-progress-linear v-if="alertloader" indeterminate></v-progress-linear>
                </v-card>

                <div class="px-6 pt-4 pb-2">
                    <p class="font-weight-bold fs-14">{{ menudata.malert ? "Modify" : "Set" }} alert Price</p>
                    <v-row no-gutters>
                        <v-col cols="4" class="pb-0">
                            <p class="font-weight-bold fs-14 mb-2">Alert me</p>
                            <v-select density="compact" @update:model-value="handleAlertTypeChange" v-model="alertis"
                                :items="alertitems" append-icon="mdi-chevron-down" bg-color="secbg" variant="flat"
                                class="rounded-pill" hide-details></v-select>
                        </v-col>
                        <v-col cols="4" class="pb-0">
                            <p class="font-weight-bold fs-14 mb-2">Condition</p>
                            <v-select density="compact" :disabled="alertis == 'VOLUME'" v-model="condition"
                                :items="['>', '<']" append-icon="mdi-chevron-down" bg-color="secbg" variant="flat"
                                class="rounded-pill" hide-details></v-select>
                        </v-col>
                        <v-col cols="4" class="pb-0">
                            <p class="font-weight-bold fs-14 mb-2">Enter Value</p>
                            <v-text-field density="compact" v-if="alertis != '52HIGH'" bg-color="secbg"
                                v-model.number="alertvalue" variant="flat" class="rounded-pill" type="number"
                                hide-spin-buttons min="0" hide-details></v-text-field>
                            <v-text-field v-else disabled bg-color="secbg" value="NA" variant="flat"
                                class="rounded-pill" type="text" hide-details></v-text-field>
                        </v-col>
                        <v-col cols="12" class="py-0">
                            <v-divider></v-divider>
                        </v-col>
                        <v-col cols="4" class="pb-0">
                            <p class="font-weight-bold fs-14 mb-2">Validity</p>
                            <v-text-field bg-color="secbg" readonly value="Good Till Trigger" variant="flat"
                                density="compact" class="rounded-pill" type="text" hide-details> </v-text-field>
                        </v-col>
                        <v-col cols="8" class="pb-0">
                            <p class="font-weight-bold fs-14 mb-2">Remarks</p>
                            <v-text-field bg-color="secbg" v-model="alertremarks" variant="flat" class="rounded-pill"
                                density="compact" type="text" hide-details> </v-text-field>
                        </v-col>
                    </v-row>
                    <v-btn @click="setAlert()" :disabled="alertis == '52HIGH' ? false : alertvalue == 0"
                        :loading="alertloader" color="maintext"
                        class="text-none rounded-pill elevation-0 white--text px-10 mt-4 float-right" height="40px">
                        {{ menudata.malert ? "Modify" : "Set" }} alert
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { getQuotesdata, setMalert } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const authStore = useAuthStore()

// Reactive state
const alertitems = ref(["LTP", "Perc. change", "ATP", "OI", "TOI", "52HIGH", "VOLUME"])
const alertis = ref("LTP")
const condition = ref(">")
const alertremarks = ref("")
const alertvalue = ref(0)
const alertdialog = ref(false)
const menudata = ref({})
const alertloader = ref(false)
const wsListenerAdded = ref(false)

// Handle alert type change
const handleAlertTypeChange = (value) => {
    if (value == 'VOLUME') {
        condition.value = '>'
    } else if (value == '52HIGH') {
        alertvalue.value = 0
    }
}

// Set WebSocket subscription
const setWebsocket = (flow, data, is) => {
    const event = new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'alerts' }
    })
    window.dispatchEvent(event)
}

// Handle menu dialog event
const handleMenuDialogEvent = async (event) => {
    const { type, token, exch, tsym, item } = event.detail || {}

    if (type === "alert" || type === "m-alert") {
        await setMenudialog(type, token, exch, item)
    }
}

// Set menu dialog
const setMenudialog = async (type, token, exch, item) => {
    appStore.showLoader()
    menudata.value = []

    try {
        let quotesdata = await getQuotesdata(`${exch}|${token}`)
        menudata.value.push(quotesdata)
        menudata.value["settype"] = null

        if (type == "m-alert") {
            // Modify alert mode - parse existing alert data
            condition.value = item.ai_t ? (item.ai_t.includes("_A") ? ">" : item.ai_t.includes("_B") ? "<" : ">") : ">"
            alertis.value = item.ai_t
                ? item.ai_t.includes("LTP_")
                    ? "LTP"
                    : item.ai_t.includes("CH_PER_")
                        ? "Perc. change"
                        : item.ai_t.includes("ATP_")
                            ? "ATP"
                            : item.ai_t.includes("OI_")
                                ? "OI"
                                : item.ai_t.includes("TOI_")
                                    ? "TOI"
                                    : item.ai_t.includes("_52HIGH")
                                        ? "52HIGH"
                                        : item.ai_t.includes("_52LOW")
                                            ? "52LOW"
                                            : item.ai_t.includes("VOLUME_")
                                                ? "VOLUME"
                                                : "LTP"
                : "LTP"
            alertvalue.value = item.d || 0
            menudata.value["malert"] = true
            menudata.value["alertd"] = item
        } else {
            // Create alert mode
            menudata.value["malert"] = false
            condition.value = ">"
            alertis.value = "LTP"
            alertvalue.value = item && item.price ? item.price : 0
        }

        alertdialog.value = true
        appStore.hideLoader()

        // Subscribe to WebSocket for real-time price updates
        let wsdata = [quotesdata]
        setWebsocket("sub", wsdata, "menu")

        // Initialize menudata properties
        menudata.value[0].ls = Number(quotesdata.ls)
        menudata.value[0].ti = Number(quotesdata.ti)
        menudata.value[0].lp = Number(quotesdata.lp)
        menudata.value[0]["wk52_l"] = menudata.value[0]["wk52_l"] && Number(menudata.value[0]["wk52_l"]) > 0
            ? Number(menudata.value[0]["wk52_l"]).toFixed(2).toLocaleString()
            : 0
        menudata.value[0]["wk52_h"] = menudata.value[0]["wk52_h"] && Number(menudata.value[0]["wk52_h"]) > 0
            ? Number(menudata.value[0]["wk52_h"]).toFixed(2).toLocaleString()
            : 0

        // Initialize menudata.ltp, ch, chp for display
        menudata.value["ltp"] = Number(quotesdata.lp || 0).toFixed(2)
        menudata.value["ch"] = Number(quotesdata.ch || 0).toFixed(2)
        menudata.value["chp"] = Number(quotesdata.chp || 0).toFixed(2)
    } catch (error) {
        console.error('Error setting menu dialog:', error)
        appStore.hideLoader()
        appStore.showSnackbar(2, 'Failed to load alert data')
    }
}

// Close menu dialog
const closeMenudialog = (type) => {
    if (type == "alert") {
        alertdialog.value = false
        // Unsubscribe from WebSocket
        if (menudata.value[0]) {
            setWebsocket("unsub", [menudata.value[0]], "menu")
        }
    }
    menudata.value = {}
}

// Set alert
const setAlert = async () => {
    alertloader.value = true

    const alertMap = {
        'LTP': { '>': 'LTP_A', '<': 'LTP_B' },
        'Perc. change': { '>': 'CH_PER_A', '<': 'CH_PER_B' },
        'ATP': { '>': 'ATP_A', '<': 'ATP_B' },
        'OI': { '>': 'OI_A', '<': 'OI_B' },
        'TOI': { '>': 'TOI_A', '<': 'TOI_B' },
        '52HIGH': { '>': 'LTP_A_52HIGH', '<': 'LTP_B_52LOW' },
        'VOLUME': { '>': 'VOLUME_A', '<': '' }
    }

    const alertType = alertMap[alertis.value]?.[condition.value] || ''

    const data = {
        uid: authStore.uid || sessionStorage.getItem('userid'),
        exch: menudata.value[0].exch,
        tsym: menudata.value[0].tsym,
        ai_t: alertType,
        validity: "GTT",
        d: alertvalue.value,
        remarks: alertremarks.value
    }

    if (menudata.value.malert) {
        data.al_id = menudata.value.alertd.al_id
    }

    try {
        const alert = await setMalert(data, menudata.value.malert)

        if (alert.stat === "OI created" || alert.stat === "OI replaced") {
            const action = menudata.value.malert ? "modified" : "set"
            appStore.showSnackbar(1, `Alert has been ${action} for ${menudata.value[0].tsym}`)
            // Trigger orderbook update
            window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
        } else {
            appStore.showSnackbar(2, alert.emsg || alert || 'Failed to set alert')
        }
    } catch (error) {
        console.error('Error setting alert:', error)
        appStore.showSnackbar(2, 'Failed to set alert')
    } finally {
        closeMenudialog("alert")
        alertloader.value = false
        alertis.value = "LTP"
        condition.value = ">"
        alertvalue.value = 0
        alertremarks.value = ""
    }
}

// Handle WebSocket data updates
const handleWebSocketUpdate = (event) => {
    const data = event.detail

    if (alertdialog.value && menudata.value[0]) {
        optionChainDataParse(data)
    }
}

// Parse WebSocket data for alert dialog
const optionChainDataParse = (data) => {
    // Handle different data formats
    let token = null
    let wsData = null

    // Check if data is array format [data, page]
    if (Array.isArray(data) && data.length >= 1) {
        wsData = data[0]
        token = wsData.token || wsData.tk || wsData.t
    } else if (data && typeof data === 'object') {
        wsData = data
        token = data.token || data.tk || data.t
    }

    if (menudata.value[0] && token && menudata.value[0].token == token) {
        // Extract price data
        const ltp = wsData.lp || wsData.ltp || wsData.l
        const ch = wsData.ch
        const chp = wsData.chp || wsData.chpct

        // Calculate change if needed
        let newCh = ch
        let newChp = chp
        const prevClose = menudata.value[0].c || (ltp && ch ? Number(ltp) - Number(ch) : 0)

        if (ltp !== undefined && ltp !== null) {
            menudata.value["ltp"] = Number(ltp).toFixed(2)

            // Calculate change if not provided
            if (newCh === undefined && prevClose > 0) {
                newCh = Number(ltp) - prevClose
            }
        }

        if (newCh !== undefined && newCh !== null) {
            menudata.value["ch"] = Number(newCh) > 0 || Number(newCh) < 0
                ? Number(newCh).toFixed(2)
                : (0).toFixed(2)

            // Calculate percentage change if not provided
            if (newChp === undefined && prevClose > 0) {
                newChp = (newCh / prevClose) * 100
            }
        }

        if (newChp !== undefined && newChp !== null) {
            menudata.value["chp"] = Number(newChp).toFixed(2)
        }

        // Update DOM elements for immediate visual feedback
        nextTick(() => {
            const ltpTag = document.getElementById('laypopltp')
            if (ltpTag) {
                ltpTag.innerHTML = menudata.value.ltp || "0.00"

                const chTag = document.getElementById('laypopch')
                const chpTag = document.getElementById('laypopchp')
                const chpclrTag = document.getElementById('laypopchpclr')

                if (chTag) chTag.innerHTML = menudata.value.ch || "0.00"
                if (chpTag) chTag.innerHTML = menudata.value.chp || "0.00"

                // Update color class
                if (chpclrTag) {
                    const ch = parseFloat(menudata.value.ch) || 0
                    const baseClasses = 'fs-12'
                    const colorClass = ch > 0
                        ? 'maingreen--text'
                        : ch < 0
                            ? 'mainred--text'
                            : 'subtext--text'
                    chpclrTag.className = `${baseClasses} ${colorClass}`
                }
            }
        })
    }
}

onMounted(() => {
    // Listen for menudialog events
    if (!wsListenerAdded.value) {
        window.addEventListener('menudialog', handleMenuDialogEvent)
        window.addEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = true
    }
})

onBeforeUnmount(() => {
    // Clean up event listeners
    if (wsListenerAdded.value) {
        window.removeEventListener('menudialog', handleMenuDialogEvent)
        window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = false
    }

    // Unsubscribe from WebSocket if dialog is open
    if (alertdialog.value && menudata.value[0]) {
        setWebsocket("unsub", [menudata.value[0]], "menu")
    }
})
</script>

<style scoped>
/* Alert dialog specific styles */
</style>
