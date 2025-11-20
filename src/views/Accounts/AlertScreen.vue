<template>
    <div>
        <div style="position: sticky !important; top: 80px; z-index: 1;">
            <v-toolbar class="tool-sty elevation-0 pl-4" height="40px" style="background-color: white !important;"
                dense>
                <v-tabs v-model="bodytab" color="#000" fixed show-arrows density="comfortable" class="alert-tabs">
                    <v-tab value="notification" class="alert-tab text-none">Notification</v-tab>
                    <v-tab value="exch_alert" class="alert-tab text-none">Exch alert</v-tab>
                    <v-tab value="exch_status" class="alert-tab text-none">Exch status</v-tab>
                    <v-tab value="pending_alert" class="alert-tab text-none">Pending alert</v-tab>
                </v-tabs>
                <v-spacer />
                <v-icon class="ml-3 cursor-p" @click="getAllalerts" color="maintext" size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-progress-linear v-if="loader" color="primary" indeterminate rounded />
        </div>

        <!-- Tab contents -->
        <div v-if="bodytab === 'notification'" style="border-top: 1px solid #EBEEF0; background-color: white;">
            <div v-if="allalert.b && allalert.b.length">
                <div v-for="(n, e) in allalert.b" :key="e"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 16px;">
                    <p style="font-size: 14px; line-height: 20px; color: #000; margin: 0 0 4px 0; font-weight: 400;"
                        v-html="n.dmsg" />
                    <p style="font-size: 12px; line-height: 16px; color: #999; margin: 0; font-weight: 400;">{{
                        n.norentm }}</p>
                </div>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no notification here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'exch_alert'" style="background-color: white;">
            <div v-if="allalert.m && allalert.m.length">
                <div v-for="(n, e) in allalert.m" :key="e"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 16px;">
                    <p style="font-size: 14px; line-height: 20px; color: #000; margin: 0 0 4px 0; font-weight: 400;">{{
                        n.exch }}: {{ n.exch_msg }}</p>
                    <p style="font-size: 12px; line-height: 16px; color: #999; margin: 0; font-weight: 400;">{{
                        n.exch_tm }}</p>
                </div>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no exch alert here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'exch_status'" style="background-color: white;">
            <div v-if="allalert.s && allalert.s.length">
                <div v-for="(n, e) in allalert.s" :key="e"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 16px;">
                    <p style="font-size: 14px; line-height: 20px; color: #000; margin: 0 0 6px 0; font-weight: 400;">{{
                        e + 1 }}. {{ n.exch }}</p>
                    <p style="font-size: 13px; line-height: 20px; color: #000; margin: 0 0 4px 0; font-weight: 400;">
                        <span style="color: #666;">Status: </span>
                        <v-icon size="10" :color="n.exchstat.includes('OPEN') ? '#1FD601' : '#D60101'"
                            style="margin: 0 4px;">
                            mdi-checkbox-blank-circle
                        </v-icon>
                        {{ n.exchstat }} | <span style="color: #666;">Market type:</span> {{ n.exchtype }}
                    </p>
                    <p style="font-size: 12px; line-height: 16px; color: #999; margin: 0; font-weight: 400;">{{
                        n.description }}</p>
                </div>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no status here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'pending_alert'" style="background-color: white;">
            <!-- Pending alerts table -->
            <v-data-table :loading="loader" must-sort :sort-by="[{ key: 'norentm', order: 'desc' }]" hide-default-footer
                fixed-header class="mt-3 alert-pending-table"
                style="border-radius: 4px; border: 1px solid #EBEEF0; background-color: white;" height="480px"
                :headers="orderheader" :items="searchedPendingItems" :items-per-page="-1" :search="opensearch">
                <template #item.tsym="{ item }">
                    <div class="pos-rlt instrument-cell">
                        <p class="table-hov-text ws-p instrument-name">
                            {{ item.tsym || '' }}
                            <span class="instrument-exchange">{{ item.exch || '' }}</span>
                        </p>
                        <div @click.stop class="pos-abs table-hov action-buttons">
                            <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)"
                                class="action-btn buy-btn elevation-0" size="x-small">B</v-btn>
                            <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)"
                                class="action-btn sell-btn elevation-0" size="x-small">S</v-btn>
                            <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                                class="action-btn icon-btn elevation-0" size="x-small">
                                <v-icon size="14" color="#000">mdi-chart-line-variant</v-icon>
                            </v-btn>
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props" @click.stop>
                                        <v-btn
                                            @click.stop="setSSDtab('c-alert', item.token, item.exch, item.tsym, '', item)"
                                            class="action-btn icon-btn elevation-0" size="x-small">
                                            <v-icon size="14" color="#000">mdi-close</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span>Cancel</span>
                            </v-tooltip>
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props" @click.stop>
                                        <v-btn
                                            @click.stop="setSSDtab('m-alert', item.token, item.exch, item.tsym, '', item)"
                                            class="action-btn icon-btn elevation-0" size="x-small">
                                            <v-icon size="12" color="#000">mdi-pen</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span>Modify</span>
                            </v-tooltip>
                            <v-menu close-on-click :location="'bottom'" class="table-menu">
                                <template #activator="{ props }">
                                    <v-btn v-bind="props" class="action-btn icon-btn elevation-0" size="x-small">
                                        <v-icon size="16" color="#000">mdi-dots-horizontal</v-icon>
                                    </v-btn>
                                </template>
                                <v-card class="table-menu-list">
                                    <v-list density="compact">
                                        <div v-for="(m, k) in menulist" :key="k">
                                            <v-list-item
                                                @click="m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, '', item) : null"
                                                class="pl-3 pr-6">
                                                <template #prepend>
                                                    <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                        color="#506D84" />
                                                    <img v-else-if="m.icon > 2" width="20px" class="pl-1"
                                                        :src="getIconPath(m.icon)" />
                                                    <v-icon v-else :icon="m.icon" size="20" color="#506D84" />
                                                </template>
                                                <v-list-item-title
                                                    class="subline--text ml-2 font-weight-medium fs-14">{{
                                                        m.name }}</v-list-item-title>
                                            </v-list-item>
                                            <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                        </div>
                                    </v-list>
                                </v-card>
                            </v-menu>
                        </div>
                    </div>
                </template>
                <template #item.alert_type="{ item }">
                    <p class="table-cell-text">{{ item.alert_type || '' }}</p>
                </template>
                <template #item.condition="{ item }">
                    <p class="table-cell-text">{{ item.condition || '' }}</p>
                </template>
                <template #item.d="{ item }">
                    <p class="table-cell-text value-cell">{{ item.d || '' }}</p>
                </template>
                <template #item.al_id="{ item }">
                    <p class="table-cell-text order-no-cell">{{ item.al_id || '' }}</p>
                </template>
                <template #no-data>
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImg" />
                        <h4 class="txt-999 font-weight-regular caption">There is no pending alert here yet!</h4>
                    </div>
                </template>
            </v-data-table>
        </div>

        <!-- Cancel Alert Dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" width="15%" class="mx-auto text-center" />
                <p class="font-weight-medium mt-5 fs-20 lh-24 mb-8">
                    Are you sure you want to <br> cancel <b>{{ singledata.tsym }}</b> alert?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false; singledata = {}" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40px">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="setCancelalert" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40px">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'
import { getAlertAPi, setMalert } from '@/components/mixins/getAPIdata'
import { useAppStore } from '@/stores/appStore'

// Import orderbook icons
import icon4 from '@/assets/orderbook/4.svg'
import icon5 from '@/assets/orderbook/5.svg'
import icon6 from '@/assets/orderbook/6.svg'
import icon7 from '@/assets/orderbook/7.svg'
import icon9 from '@/assets/orderbook/9.svg'
import icon10 from '@/assets/orderbook/10.svg'
import icon11 from '@/assets/orderbook/11.svg'
import icon12 from '@/assets/orderbook/12.svg'
import icon13 from '@/assets/orderbook/13.svg'
import icon31 from '@/assets/orderbook/31.svg'

// Icon mapping
const iconMap = {
    4: icon4,
    5: icon5,
    6: icon6,
    7: icon7,
    9: icon9,
    10: icon10,
    11: icon11,
    12: icon12,
    13: icon13,
    31: icon31
}

function getIconPath(iconNumber) {
    return iconMap[iconNumber] || ''
}

const appStore = useAppStore()
const router = useRouter()

const loader = ref(false)
const allalert = ref({ b: [], p: [], m: [], s: [] })
const bodytab = ref('notification')
const opensearch = ref('')
const canceldialog = ref(false)
const singledata = ref({})

const orderheader = [
    { title: 'Instrument', key: 'tsym', sortable: false },
    { title: 'Alert type', key: 'alert_type', sortable: false },
    { title: 'Condition', key: 'condition', sortable: false },
    { title: 'Value', key: 'd', sortable: false, align: 'end' },
    { title: 'Order no.', key: 'al_id', sortable: false, align: 'end' }
]

const menulist = [
    { name: 'Modify Alert', icon: 11, type: 'm-alert' },
    { name: 'Exit/Cancel Alert', icon: 12, type: 'c-alert', hr: true },
    { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
    { name: 'Create Alert', icon: 5, type: 'alert' },
    { name: 'Market Depth', icon: 6, type: 'depth' },
    { name: 'Chart', icon: 7, type: 'chart', hr: true },
    { name: 'Fundamentals', icon: 9, type: 'Funda' },
    { name: 'Details', icon: 10, type: '' }
]

const pendingItems = computed(() => Array.isArray(allalert.value.p) ? allalert.value.p : [])

function includeSearch(item, keys, term) {
    if (!term) return true
    const q = term.toLowerCase()
    return keys.some(k => item?.[k] !== undefined && String(item[k]).toLowerCase().includes(q))
}

const searchedPendingItems = computed(() => {
    let items = pendingItems.value
    if (opensearch.value) {
        items = items.filter(item =>
            includeSearch(item, ['tsym', 'exch', 'ai_t', 'd'], opensearch.value)
        )
    }
    // Add computed fields for display
    return items.map(item => ({
        ...item,
        alert_type: item.ai_t ? item.ai_t.split('_')[0] : '',
        condition: item.ai_t?.includes('_A') ? '>' : item.ai_t?.includes('_B') ? '<' : 'Select'
    }))
})

async function getAllalerts() {
    loader.value = true
    const alert = { b: [], p: [], m: [], s: [] }
    alert.b = await getAlertAPi('GetBrokerMsg')
    alert.p = await getAlertAPi('GetPendingAlert')
    alert.m = await getAlertAPi('ExchMsg')
    alert.s = await getAlertAPi('ExchStatus')
    allalert.value.b = Array.isArray(alert.b) ? alert.b.map(a => ({ ...a, dmsg: a.dmsg?.includes('href=') ? a.dmsg.replace('href=', 'target=_blank href=') : a.dmsg })) : []
    allalert.value.p = Array.isArray(alert.p) ? alert.p : []
    allalert.value.m = Array.isArray(alert.m) ? alert.m : []
    allalert.value.s = Array.isArray(alert.s) ? alert.s : []
    if (!Array.isArray(alert.b)) appStore.showSnackbar(2, alert.b?.emsg || alert.b)
    if (!Array.isArray(alert.p)) appStore.showSnackbar(2, alert.p?.emsg || alert.p)
    if (!Array.isArray(alert.m)) appStore.showSnackbar(2, alert.m?.emsg || alert.m)
    if (!Array.isArray(alert.s)) appStore.showSnackbar(2, alert.s?.emsg || alert.s)
    loader.value = false
}

function setSSDtab(type, token, exch, tsym, trantype, item) {
    // Use item data if parameters are missing
    const finalToken = token || item?.token
    const finalExch = exch || item?.exch
    const finalTsym = tsym || item?.tsym

    // Validate required parameters
    if (!finalToken || !finalExch || !finalTsym) {
        // console.error('Missing required parameters:', { type, token, exch, tsym, trantype, item })
        appStore.showSnackbar(2, 'Invalid instrument data')
        return
    }

    // Use validated values
    token = finalToken
    exch = finalExch
    tsym = finalTsym

    try {
        if (type === 'c-alert') {
            singledata.value = item || {}
            canceldialog.value = true
        } else if (type === 'alert' || type === 'm-alert') {
            // Open alert dialog
            window.dispatchEvent(new CustomEvent('menudialog', {
                detail: { type, token, exch, tsym, trantype, item }
            }))
        } else if (type === 'order') {
            // Open Stock Order Window in buy or sell mode
            // Ensure trantype is 'b' for buy or 's' for sell
            const orderType = (trantype === 'b' || trantype === 's') ? trantype : 'b'
            window.dispatchEvent(new CustomEvent('menudialog', {
                detail: { type: 'order', token, exch, tsym, trantype: orderType, item }
            }))
        } else if (type === 'cGTT') {
            // Open GTT order window
            window.dispatchEvent(new CustomEvent('menudialog', {
                detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' }
            }))
        } else if (type === 'chart') {
            // Open Chart window - route to stocks details page with proper params
            const path = [type, token, exch, tsym]

            // Store params in localStorage for persistence (required by StocksDetails)
            localStorage.setItem('ssdParams', JSON.stringify(path))
            localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
            localStorage.setItem('ssdtoken', token)

            // Check if already on stocks details page
            const currentRoute = router.currentRoute.value
            if (currentRoute.name === 'stocks details') {
                // If already on page, dispatch ssd-event to update chart
                window.dispatchEvent(new CustomEvent('ssd-event', {
                    detail: { type, token, exch, tsym }
                }))
            } else {
                // Navigate to stocks details page with params and query
                router.push({
                    name: 'stocks details',
                    params: { val: path },
                    query: { type, token, exch, tsym }
                })
            }
        } else {
            // Default: route to stocks details page
            const path = [type, token, exch, tsym]

            // Store params in localStorage for persistence
            localStorage.setItem('ssdParams', JSON.stringify(path))
            localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
            localStorage.setItem('ssdtoken', token)

            // Check if already on stocks details page
            const currentRoute = router.currentRoute.value
            if (currentRoute.name === 'stocks details') {
                // If already on page, dispatch ssd-event to update
                window.dispatchEvent(new CustomEvent('ssd-event', {
                    detail: { type, token, exch, tsym }
                }))
            } else {
                // Navigate to stocks details page with params and query
                router.push({
                    name: 'stocks details',
                    params: { val: path },
                    query: { type, token, exch, tsym }
                })
            }
        }
    } catch (error) {
        // console.error('Error in setSSDtab:', error)
        appStore.showSnackbar(2, 'Failed to open window')
    }
}

async function setCancelalert() {
    loader.value = true
    const uid = sessionStorage.getItem('userid')
    if (!uid || !singledata.value.al_id) {
        appStore.showSnackbar(2, 'Invalid alert data')
        loader.value = false
        canceldialog.value = false
        singledata.value = {}
        return
    }
    try {
        const data = { uid, al_id: singledata.value.al_id }
        const alert = await setMalert(data, 'cancel')
        if (alert.stat === 'OI deleted') {
            appStore.showSnackbar(1, `Alert has been Cancelled for ${singledata.value.tsym}`)
            await getAllalerts()
        } else {
            appStore.showSnackbar(2, alert.emsg || alert)
        }
    } catch (error) {
        // console.error('Error cancelling alert:', error)
        appStore.showSnackbar(2, 'Failed to cancel alert')
    } finally {
        loader.value = false
        canceldialog.value = false
        singledata.value = {}
    }
}

function onOrderbookUpdate(e) {
    // Handle both event formats: e.detail === 'orders' or e.detail.type === 'orders'
    if (e.detail === 'orders' || e.detail?.type === 'orders') {
        getAllalerts()
    }
}

onMounted(() => {
    getAllalerts()

    // Subscribe to WebSocket
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow: 'sub', data: [], is: 'alert', page: 'alert' }
    }))

    // Listen for orderbook updates
    window.addEventListener('orderbook-update', onOrderbookUpdate)
})

onBeforeUnmount(() => {
    // Unsubscribe from WebSocket
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow: 'unsub', data: [], is: 'alert', page: 'alert' }
    }))

    // Remove event listeners
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>

<style scoped>
/* Alert Pending Table Styles */
.alert-pending-table :deep(.v-data-table__wrapper) {
    background-color: white;
}

.alert-pending-table :deep(thead th) {
    background-color: #F1F3F8 !important;
    color: #666666 !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    line-height: 16px !important;
    border-bottom: 1px solid #EBEEF0 !important;
    padding: 12px 16px !important;
    text-transform: none !important;
    letter-spacing: normal !important;
}

.alert-pending-table :deep(tbody td) {
    color: #000 !important;
    font-size: 13px !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid #EBEEF0 !important;
    background-color: white !important;
    vertical-align: middle !important;
}

.alert-pending-table :deep(tbody tr) {
    transition: background-color 0.2s ease !important;
    cursor: pointer !important;
}

.alert-pending-table :deep(tbody tr:hover) {
    background-color: #E1E8F7 !important;
}

.alert-pending-table :deep(tbody tr:hover td) {
    background-color: #E1E8F7 !important;
}

.alert-pending-table :deep(tbody tr td) {
    overflow: visible !important;
    position: relative !important;
}

/* Instrument cell styling */
.instrument-cell {
    padding-right: 120px;
    position: relative;
}

.instrument-name {
    font-size: 13px;
    font-weight: 500;
    color: #000;
    margin: 0;
    line-height: 1.4;
}

.instrument-exchange {
    font-size: 10px;
    color: #999;
    margin-left: 4px;
}

/* Action buttons container */
.action-buttons {
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    display: none;
    align-items: center;
    gap: 4px;
    z-index: 10;
}

.alert-pending-table :deep(tbody tr:hover .action-buttons) {
    display: flex !important;
    align-items: center !important;
    opacity: 1 !important;
    visibility: visible !important;
}

.alert-pending-table :deep(tbody tr:hover .table-hov-text) {
    color: #0037B7 !important;
}

/* Action button styles */
.action-btn {
    min-width: 20px !important;
    width: 20px !important;
    height: 20px !important;
    padding: 0 !important;
    border-radius: 2px !important;
}

.buy-btn {
    background-color: #43A833 !important;
    color: white !important;
    font-size: 11px !important;
    font-weight: 700 !important;
}

.sell-btn {
    background-color: #FF1717 !important;
    color: white !important;
    font-size: 11px !important;
    font-weight: 700 !important;
}

.icon-btn {
    border: 1px solid #EBEEF0 !important;
    background-color: white !important;
}

/* Table cell text styling */
.table-cell-text {
    font-size: 13px;
    font-weight: 500;
    color: #000;
    margin: 0;
}

.value-cell {
    text-align: right;
}

.order-no-cell {
    text-align: right;
}

/* Tab styling */
.alert-tabs :deep(.v-tabs__wrapper) {
    min-height: 40px;
}

.alert-tabs :deep(.v-tab) {
    min-width: auto;
    padding: 0 16px;
    text-transform: none;
    font-size: 14px;
    font-weight: 400;
    color: #000;
    letter-spacing: normal;
    opacity: 1;
    transition: all 0.2s ease;
    height: 40px;
}

.alert-tabs :deep(.v-tab:hover) {
    color: #000;
    background-color: transparent;
}

.alert-tabs :deep(.v-tab--selected) {
    color: #000;
    font-weight: 700;
}

.alert-tabs :deep(.v-tab--selected .v-tab__text) {
    color: #000 !important;
    font-weight: 700 !important;
}

/* Active tab underline indicator - black underline */
.alert-tabs :deep(.v-tabs-slider-wrapper) {
    height: 2px !important;
    margin-bottom: 0 !important;
}

.alert-tabs :deep(.v-tabs-slider) {
    background-color: #000 !important;
    height: 2px !important;
    border-radius: 0 !important;
}

/* Remove default Vuetify tab indicator if present */
.alert-tabs :deep(.v-tab--active) {
    color: #000;
}

.alert-tabs :deep(.v-tab--active::before) {
    opacity: 0;
}

/* Tab spacing and alignment */
.alert-tabs :deep(.v-tabs__container) {
    height: 40px;
}

.alert-tabs :deep(.v-tab__content) {
    padding: 0;
}
</style>
