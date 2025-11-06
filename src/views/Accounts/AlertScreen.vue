<template>
    <div>
        <div style="position: sticky !important; top: 80px; z-index: 1;">
            <v-toolbar class="tool-sty elevation-0 pl-4" height="40px" style="background-color: white !important;"
                dense>
                <v-tabs v-model="bodytab" color="maintext" fixed show-arrows density="comfortable">
                    <v-tab value="notification" class=" py-3 text-none text-start min-w-fit">Notification</v-tab>
                    <v-tab value="exch_alert" class=" py-3 text-none text-start min-w-fit">Exch alert</v-tab>
                    <v-tab value="exch_status" class=" py-3 text-none text-start min-w-fit">Exch status</v-tab>
                    <v-tab value="pending_alert" class=" py-3 text-none text-start min-w-fit">Pending alert</v-tab>
                </v-tabs>
                <v-spacer />
                <v-icon class="ml-3 cursor-p" @click="getAllalerts" color="maintext" size="24">mdi-reload</v-icon>
            </v-toolbar>
            <v-progress-linear v-if="loader" color="primary" indeterminate rounded />
        </div>

        <!-- Tab contents -->
        <div v-if="bodytab === 'notification'" style="border-top: 1px solid #EBEEF0;">
            <div v-if="allalert.b && allalert.b.length">
                <v-card v-for="(n, e) in allalert.b" :key="e" class="crd-trn rounded-lg elevation-0 mb-0">
                    <v-list-item two-line class="px-2 pr-sm-3">
                        <v-list-item-content class="py-4">
                            <p class="fs-14 mb-2 text-rap-l2 lh-20" v-html="n.dmsg" />
                            <v-list-item-subtitle class="fs-12 font-weight-regular">{{ n.norentm
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider />
                </v-card>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no notification here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'exch_alert'">
            <div v-if="allalert.m && allalert.m.length">
                <v-card v-for="(n, e) in allalert.m" :key="e" class="crd-trn rounded-lg elevation-0 mb-0">
                    <v-list-item two-line class="px-2 pr-sm-3">
                        <v-list-item-content class="py-0">
                            <p class="fs-14 mb-2 text-rap-l2 lh-20">{{ n.exch }}: {{ n.exch_msg }}</p>
                            <v-list-item-subtitle class="fs-12 font-weight-regular">{{ n.exch_tm
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider />
                </v-card>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no exch alert here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'exch_status'">
            <div v-if="allalert.s && allalert.s.length">
                <v-card v-for="(n, e) in allalert.s" :key="e" class="crd-trn rounded-lg elevation-0 mb-0">
                    <v-list-item two-line class="px-2 pr-sm-3">
                        <v-list-item-content class="pb-3 pt-2">
                            <p class="fs-14 mb-1 mt-1 text-rap-l2 lh-20">{{ e + 1 }}. {{ n.exch }}</p>
                            <p class="font-weight-regular fs-13 mb-0 text-rap-l2 lh-20">
                                <span class="subtext--text">Status: </span>
                                <v-icon size="10" :color="n.exchstat.includes('OPEN') ? '#1FD601' : '#D60101'">
                                    mdi-checkbox-blank-circle
                                </v-icon>
                                {{ n.exchstat }} | <span class="subtext--text">Market type:</span> {{ n.exchtype }}
                            </p>
                            <v-list-item-subtitle class="fs-12 font-weight-regular mb-0">{{ n.description
                            }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider />
                </v-card>
            </div>
            <div v-else class="mx-auto text-center py-16">
                <img class="align-self-stretch mx-auto" width="80px" :src="noDataImg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no status here yet!</h5>
            </div>
        </div>

        <div v-else-if="bodytab === 'pending_alert'">
            <!-- Search field -->
            <v-text-field v-model="opensearch" variant="solo" density="comfortable" :bg-color="'secbg'"
                placeholder="Search by instrument, exchange, alert type..." hide-details class="mt-3 mx-3"
                prepend-inner-icon="mdi-magnify" clearable />

            <!-- Pending alerts table -->
            <v-data-table :loading="loader" must-sort :sort-by="[{ key: 'norentm', order: 'desc' }]" hide-default-footer
                fixed-header class="mt-3 rounded-lg overflow-y-auto"
                style="border-radius: 4px; border: 1px solid #EBEEF0;" height="480px" :headers="orderheader"
                :items="searchedPendingItems" :items-per-page="-1" :search="opensearch">
                <template #item.tsym="{ item }">
                    <div class="pos-rlt">
                        <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4">
                            {{ item.tsym || '' }}
                            <span class="ml-1 txt-999 fs-10">{{ item.exch || '' }}</span>
                        </p>
                        <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                            <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)"
                                min-width="20px" color="maingreen"
                                class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">B</v-btn>
                            <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)"
                                min-width="20px" color="mainred"
                                class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">S</v-btn>
                            <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                                style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                            </v-btn>
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props">
                                        <v-btn @click="setSSDtab('c-alert', item.token, item.exch, item.tsym, '', item)"
                                            style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                            class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                            <v-icon size="18" color="maintext">mdi-close</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span>Cancel</span>
                            </v-tooltip>
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props">
                                        <v-btn @click="setSSDtab('m-alert', item.token, item.exch, item.tsym, '', item)"
                                            style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                            class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                            <v-icon size="16" color="maintext">mdi-pen</v-icon>
                                        </v-btn>
                                    </div>
                                </template>
                                <span>Modify</span>
                            </v-tooltip>
                            <v-menu close-on-click :location="'bottom'" class="table-menu">
                                <template #activator="{ props }">
                                    <v-btn v-bind="props" style="border: 1px solid #EBEEF0" min-width="20px"
                                        color="mainbg" class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                        <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
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
                                                        :src="require(`@/assets/orderbook/${m.icon}.svg`)" />
                                                    <v-icon v-else :icon="m.icon" size="20" color="#506D84" />
                                                </template>
                                                <v-list-item-title class="subline--text font-weight-medium fs-14">{{
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
                    <p class="font-weight-medium maintext--text mb-0">
                        {{ item.alert_type || '' }}
                    </p>
                </template>
                <template #item.condition="{ item }">
                    <p class="font-weight-medium maintext--text mb-0">
                        {{ item.condition || '' }}
                    </p>
                </template>
                <template #item.d="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 text-right">{{ item.d || '' }}</p>
                </template>
                <template #item.al_id="{ item }">
                    <p class="font-weight-medium maintext--text mb-0 text-right">{{ item.al_id || '' }}</p>
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
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">
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
    { title: 'Order no', key: 'al_id', sortable: false, align: 'end' }
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
            includeSearch(item, ['tsym', 'exch', 'ai_t', 'd', 'al_id'], opensearch.value)
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
    if (type === 'c-alert') {
        singledata.value = item || {}
        canceldialog.value = true
    } else if (type === 'alert' || type === 'm-alert') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type, token, exch, tsym, trantype, item }
        }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' }
        }))
    } else {
        const path = [type, token, exch, tsym]
        router.push({ name: 'stocks details', params: { val: path } })
    }
}

async function setCancelalert() {
    loader.value = true
    const uid = sessionStorage.getItem('userid')
    if (!uid || !singledata.value.al_id) {
        appStore.showSnackbar(2, 'Invalid alert data')
        loader.value = false
        return
    }
    const data = { uid, al_id: singledata.value.al_id }
    const alert = await setMalert(data, 'cancel')
    if (alert.stat === 'OI deleted') {
        appStore.showSnackbar(1, `Alert has been Cancelled for ${singledata.value.tsym}`)
        await getAllalerts()
    } else {
        appStore.showSnackbar(2, alert.emsg || alert)
    }
    loader.value = false
    singledata.value = {}
    canceldialog.value = false
}

function onOrderbookUpdate(e) {
    if (e.detail === 'orders') {
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
