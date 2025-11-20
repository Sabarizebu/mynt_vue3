<template>
    <div>
        <v-dialog v-if="menudata[0]" v-model="alertdialog" :scrim="false" width="480px" persistent>
            <v-card class="alert-dialog-card overflow-hidden" color="cardbg">
                <!-- Header Section -->
                <v-card class="elevation-0 alert-dialog-header" color="secbg">
                    <div class="d-flex align-center justify-space-between pa-4">
                        <div class="flex-grow-1">
                            <div class="alert-instrument-name mb-2">
                                {{ menudata[0] ? menudata[0].tsym : "" }}
                                <span class="alert-instrument-exchange">{{ menudata[0] ? menudata[0].exch : "" }}</span>
                            </div>
                            <div class="alert-price-info">
                                <span class="alert-price">₹<span id="laypopltp">{{ menudata.ltp ? menudata.ltp : "0.00"
                                        }}</span></span>
                                <span class="alert-price-change" id="laypopchpclr"
                                    :class="menudata.ch > 0 ? 'maingreen--text' : menudata.ch < 0 ? 'mainred--text' : 'subtext--text'">
                                    <span id="laypopch">{{ menudata && menudata.ch ? `${menudata.ch}` : "0.00" }}</span>
                                    (<span id="laypopchp">{{ menudata && menudata.chp ? `${menudata.chp}` : "0.00"
                                        }}</span>%)
                                </span>
                            </div>
                        </div>
                        <v-btn :disabled="alertloader" @click="closeMenudialog('alert')" elevation="0" size="small" icon
                            class="alert-close-btn">
                            <v-icon color="maintext" size="20">mdi-close</v-icon>
                        </v-btn>
                    </div>
                    <v-progress-linear v-if="alertloader" indeterminate color="primary"></v-progress-linear>
                </v-card>

                <!-- Content Section -->
                <div class="alert-dialog-content pa-6">
                    <p class="alert-section-title mb-4">{{ menudata.malert ? "Modify" : "Set" }} alert Price</p>

                    <v-row no-gutters class="mb-3">
                        <v-col cols="4" class="pr-2">
                            <p class="alert-field-label mb-2">Alert me</p>
                            <v-select density="compact" @update:model-value="handleAlertTypeChange" v-model="alertis"
                                :items="alertitems" bg-color="secbg" variant="flat" class="alert-select-field"
                                hide-details></v-select>
                        </v-col>
                        <v-col cols="4" class="px-1">
                            <p class="alert-field-label mb-2">Condition</p>
                            <v-select density="compact" :disabled="alertis == 'VOLUME'" v-model="condition"
                                :items="['>', '<']" bg-color="secbg" variant="flat" class="alert-select-field"
                                hide-details></v-select>
                        </v-col>
                        <v-col cols="4" class="pl-2">
                            <p class="alert-field-label mb-2">Enter Value</p>
                            <v-text-field density="compact" v-if="alertis != '52HIGH'" bg-color="secbg"
                                v-model.number="alertvalue" variant="flat" class="alert-input-field" type="number"
                                hide-spin-buttons min="0" hide-details></v-text-field>
                            <v-text-field v-else disabled bg-color="secbg" value="NA" variant="flat"
                                class="alert-input-field" type="text" hide-details></v-text-field>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <v-row no-gutters class="mb-4">
                        <v-col cols="4" class="pr-2">
                            <p class="alert-field-label mb-2">Validity</p>

                            <v-text-field density="compact" bg-color="secbg" variant="flat" class="alert-input-field"
                                value="Good Till Trigger" readonly hide-spin-buttons min="0"
                                hide-details></v-text-field>

                        </v-col>
                        <v-col cols="8" class="pl-2">
                            <p class="alert-field-label mb-2">Remarks</p>
                            <v-text-field bg-color="secbg" v-model="alertremarks" variant="flat"
                                class="alert-input-field" density="compact" type="text" hide-details></v-text-field>
                        </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-4">
                        <v-btn @click="setAlert()" :disabled="alertis == '52HIGH' ? false : alertvalue == 0"
                            :loading="alertloader" color="maintext"
                            class="alert-submit-btn text-none elevation-0 white--text" height="40px">
                            {{ menudata.malert ? "Modify" : "Set" }} alert
                        </v-btn>
                    </div>
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
const isMounted = ref(false)

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
            alertremarks.value = item.remarks || ""
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
        // console.error('Error setting menu dialog:', error)
        appStore.hideLoader()
        appStore.showSnackbar(2, 'Failed to load alert data')
    }
}

// Close menu dialog
const closeMenudialog = (type) => {
    if (type == "alert") {
        alertdialog.value = false
        // Unsubscribe from WebSocket
        if (menudata.value[0] && isMounted.value) {
            try {
                setWebsocket("unsub", [menudata.value[0]], "menu")
            } catch (error) {
                // console.debug('WebSocket unsubscribe error:', error)
            }
        }
    }
    // Only clear menudata if component is still mounted
    if (isMounted.value) {
        menudata.value = {}
    }
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
        d: alertvalue.value.toString(),
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
            // Trigger orderbook update to refresh pending alerts
            // Dispatch event to refresh pending alerts list in AlertScreen
            window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'orders' }))
        } else {
            appStore.showSnackbar(2, alert.emsg || alert || 'Failed to set alert')
        }
    } catch (error) {
        // console.error('Error setting alert:', error)
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
    // Only process if component is mounted and dialog is open
    if (!isMounted.value || !alertdialog.value || !menudata.value[0]) {
        return
    }

    const data = event.detail
    optionChainDataParse(data)
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
        // Only update if component is mounted and dialog is open
        if (isMounted.value && alertdialog.value) {
            nextTick(() => {
                // Double-check dialog is still open before DOM manipulation
                if (!alertdialog.value || !isMounted.value) return

                try {
                    const ltpTag = document.getElementById('laypopltp')
                    if (ltpTag) {
                        ltpTag.innerHTML = menudata.value.ltp || "0.00"

                        const chTag = document.getElementById('laypopch')
                        const chpTag = document.getElementById('laypopchp')
                        const chpclrTag = document.getElementById('laypopchpclr')

                        if (chTag) chTag.innerHTML = menudata.value.ch || "0.00"
                        if (chpTag) chpTag.innerHTML = menudata.value.chp || "0.00"

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
                } catch (error) {
                    // Silently handle DOM errors if component is unmounting
                    // console.debug('DOM update skipped:', error)
                }
            })
        }
    }
}

onMounted(() => {
    isMounted.value = true
    // Listen for menudialog events
    if (!wsListenerAdded.value) {
        window.addEventListener('menudialog', handleMenuDialogEvent)
        window.addEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = true
    }
})

onBeforeUnmount(() => {
    // Mark component as unmounting
    isMounted.value = false

    // Close dialog if open to prevent navigation issues
    if (alertdialog.value) {
        alertdialog.value = false
    }

    // Clean up event listeners
    if (wsListenerAdded.value) {
        window.removeEventListener('menudialog', handleMenuDialogEvent)
        window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = false
    }

    // Unsubscribe from WebSocket if dialog was open
    if (menudata.value[0]) {
        try {
            setWebsocket("unsub", [menudata.value[0]], "menu")
        } catch (error) {
            // console.debug('WebSocket unsubscribe error:', error)
        }
    }

    // Clear menudata
    menudata.value = {}
})
</script>

<style scoped>
/* Alert Dialog Styles */
.alert-dialog-card {
    border-radius: 8px;
}

.alert-dialog-header {
    border-bottom: 1px solid #EBEEF0;
}

.alert-instrument-name {
    font-size: 16px;
    font-weight: 700;
    color: #000;
    line-height: 1.5;
}

.alert-instrument-exchange {
    font-size: 10px;
    color: #999;
    margin-left: 4px;
    font-weight: 400;
}

.alert-price-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
}

.alert-price {
    font-size: 14px;
    font-weight: 700;
    color: #000;
}

.alert-price-change {
    font-size: 12px;
    font-weight: 400;
}

.alert-close-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
}

.alert-dialog-content {
    background-color: white;
}

.alert-section-title {
    font-size: 14px;
    font-weight: 700;
    color: #000;
    margin: 0;
}

.alert-field-label {
    font-size: 14px;
    font-weight: 700;
    color: #000;
    margin: 0;
    line-height: 1.4;
}

.alert-select-field :deep(.v-field) {
    border-radius: 20px;
    min-height: 36px;
}

.alert-select-field :deep(.v-field__input) {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 36px;
}

.alert-select-field :deep(.v-select__selection) {
    font-size: 13px;
    color: #000;
}

.alert-input-field :deep(.v-field) {
    border-radius: 20px;
    min-height: 36px;
}

.alert-input-field :deep(.v-field__input) {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 36px;
}

.alert-input-field :deep(input) {
    font-size: 13px;
    color: #000;
}

.alert-validity-btn {
    width: 100%;
    height: 36px;
    border-radius: 20px;
    text-transform: none;
    font-size: 13px;
    font-weight: 400;
    color: #000;
    pointer-events: none;
}

.alert-submit-btn {
    min-width: 140px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    text-transform: none;
    padding: 0 24px;
}

.alert-submit-btn:disabled {
    opacity: 0.5;
}
</style>
