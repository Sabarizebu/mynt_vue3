<template>
    <div>
        <!-- Toolbar -->
        <v-toolbar flat dense class="tool-sty my-6 pl-4 crd-trn">
            <v-spacer />
            <v-text-field elevation="0" rounded v-model="opensearch"
                prepend-inner-icon="mdi-magnify" placeholder="Search" variant="solo" density="compact" hide-details
                class="rounded mr-4" style="max-width: 220px" flat bg-color="secbg" />
            <v-icon :disabled="loading" :class="['ml-3 cursor-p', { 'reload-rotating': loading }]" @click="getOrderbook"
                color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <!-- GTT Orders Table -->
        <v-data-table fixed-header :hide-default-footer="true" :loading="loading"
            class="holdings-table mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;"
            height="480px" :headers="headers" :items="searchedItems" :items-per-page="-1"
            :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })">

            <template #item.tsym="{ item }">
                <div class="pos-rlt" style="min-height: 40px; padding-right: 200px;">
                    <p class="font-weight-bold fs-13 txt-162 black--text mb-0 table-hov-text"
                        style="margin-right: 0; white-space: nowrap;">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                    </p>
                </div>
            </template>

            <template #item.trantype="{ item }">
                <v-chip small :color="item.trantype === 'B' ? 'secgreen' : 'secred'"
                    :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                    :style="`border: 1px solid ${item.trantype === 'B' ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;`">
                    <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                </v-chip>
            </template>

            <template #item.qty="{ item }">
                <v-chip small class="table-hov-prd" text-color="#666"
                    style="border-radius: 5px; padding: 10px 8px !important">
                    <span class="font-weight-medium fs-12">{{ item.qty }}</span>
                </v-chip>
            </template>

            <template #item.actions="{ item }">
                <div class="d-inline-flex" @click.stop>
                    <v-btn icon size="small" class="mr-1" @click="onModify(item)">
                        <v-icon size="18" color="maintext">mdi-square-edit-outline</v-icon>
                    </v-btn>
                    <v-btn icon size="small" @click="confirmCancel(item)">
                        <v-icon size="18" color="maintext">mdi-trash-can-outline</v-icon>
                    </v-btn>
                </div>
            </template>

            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80" :src="noDataImg" />
                        <h4 class="txt-999 font-weight-regular caption">There is no order data here yet!</h4>
                    </div>
                </div>
            </template>
        </v-data-table>

        <!-- Drawer: GTT details -->
        <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="true" width="360" color="cardbg"
            class="pt-2">
            <template v-slot:prepend>
                <v-toolbar class="nav-drawer crd-trn" density="comfortable">
                    <v-btn icon variant="text" density="comfortable" @click="orderdrawer = false">
                        <v-icon color="maintext" size="20">mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>

            <v-list-item class="py-3">
                <v-list-item-title class="font-weight-medium maintext--text mb-3">
                    {{ singledata.tsym || '' }}
                    <span class="ml-1 txt-999 fs-10">{{ singledata.exch || '' }}</span>
                </v-list-item-title>
                <v-list-item-title class="txt-000 font-weight-medium fs-16 mb-1">₹{{ singledata.ltp || '0.00'
                }}</v-list-item-title>
            </v-list-item>
            <v-divider class="pt-1"></v-divider>
            <div class="px-4 pt-1">
                <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Quantity
                    <p class="float-right mb-0">{{ singledata.qty || '0' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Condition
                    <p class="float-right mb-0">{{ singledata.condition || '-' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Trig Value
                    <p class="float-right mb-0">{{ singledata.trigValue || '-' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Product
                    <p class="float-right mb-0">{{ singledata.orderType || '-' }}</p>
                </v-list-item-title>
            </div>
            <v-divider class="pt-1"></v-divider>

            <div class="px-4 pt-3 pb-4">
                <v-btn class="rounded-pill text-none font-weight-bold" block height="40" variant="tonal"
                    @click="onHistory(singledata)"><v-icon class="mr-2">mdi-history</v-icon> Order history</v-btn>
            </div>
        </v-navigation-drawer>

        <!-- Cancel dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">Are you sure you want to cancel this GTT order?</p>
                <v-row class="px-6" no-gluttters>
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="doCancel()" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'
import { useAppStore } from '@/stores/appStore'
import { getGttorderbook, setCancelGTT, getQuotesdata } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()

const loading = ref(false)
const opensearch = ref('')
const orderbookdata = ref([])
const orderdrawer = ref(false)
const canceldialog = ref(false)
const singledata = ref({})
const cancelTarget = ref(null)

const headers = [
    { title: 'Instrument', key: 'tsym' },
    { title: 'Buy/Sell', key: 'trantype' },
    { title: 'Product type', key: 'orderType' },
    { title: 'Qty', key: 'qty', align: 'right' },
    { title: 'Condition', key: 'condition' },
    { title: 'Trig Value', key: 'trigValue', align: 'right' },
    { title: '', key: 'actions', sortable: false, align: 'right' }
]

const searchedItems = computed(() => {
    const term = opensearch.value?.toLowerCase()
    if (!term) return orderbookdata.value
    return orderbookdata.value.filter(o => includeSearch(o, ['tsym', 'exch', 'orderType', 'condition'], term))
})

function includeSearch(item, keys, term) {
    const q = String(term).toLowerCase()
    return keys.some(k => item?.[k] !== undefined && String(item[k]).toLowerCase().includes(q))
}

async function getOrderbook() {
    loading.value = true
    orderbookdata.value = []
    const data = await getGttorderbook()
    // Handle different response structures:
    // 1. Array with first element having stat === 'Ok'
    // 2. Array of order objects directly
    // 3. Response object with data array
    if (Array.isArray(data)) {
        // Check if first element has stat property (old format)
        if (data[0] && data[0].stat === 'Ok') {
            // Process all items in the array (skip the first one if it's just a status object)
            const orders = data.filter(d => d.al_id) // Filter out status objects, keep only orders
            const mapped = orders.map(d => ({
                trigValue: d.d,
                condition: d.ai_t?.includes('_A_O') ? '>' : d.ai_t?.includes('_B_O') ? '<' : 'Select',
                qty: d.qty,
                orderType: d.prd === 'C' ? 'Delivery (CNC)' : d.prd === 'M' ? 'Carry Forward (NRML)' : d.prd === 'I' ? 'Intraday' : 'Select',
                trantype: d.trantype,
                tsym: d.tsym,
                exch: d.exch,
                token: d.token,
                al_id: d.al_id,
                res: d,
            }))
            orderbookdata.value = mapped
        } else {
            // Direct array of orders (new format or when stat is not on first element)
            const mapped = data
                .filter(d => d && d.al_id) // Only process items that have al_id (actual orders)
                .map(d => ({
                    trigValue: d.d,
                    condition: d.ai_t?.includes('_A_O') ? '>' : d.ai_t?.includes('_B_O') ? '<' : 'Select',
                    qty: d.qty,
                    orderType: d.prd === 'C' ? 'Delivery (CNC)' : d.prd === 'M' ? 'Carry Forward (NRML)' : d.prd === 'I' ? 'Intraday' : 'Select',
                    trantype: d.trantype,
                    tsym: d.tsym,
                    exch: d.exch,
                    token: d.token,
                    al_id: d.al_id,
                    res: d,
                }))
            orderbookdata.value = mapped
        }
    }
    loading.value = false
}

function onModify(item) {
    window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'mod-GTT', token: item.token, exch: item.exch, tsym: item.tsym, trantype: (item.trantype || '').toLowerCase(), item } }))
}

function confirmCancel(item) {
    cancelTarget.value = item
    canceldialog.value = true
}

async function doCancel() {
    const item = cancelTarget.value
    if (!item) { canceldialog.value = false; return }
    try {
        const uid = sessionStorage.getItem('userid')
        const tok = sessionStorage.getItem('msession')
        const resp = await setCancelGTT(`jData={"uid":"${uid}","al_id":"${item.al_id}"}&jKey=${tok}`)
        if (resp && resp.stat === 'OI deleted') {
            appStore.showSnackbar(0, 'GTT Order has been cancelled')
            const idx = orderbookdata.value.findIndex(x => x.al_id === item.al_id)
            if (idx >= 0) orderbookdata.value.splice(idx, 1)
        } else {
            appStore.showSnackbar(2, resp && resp.emsg ? resp.emsg : 'Failed to cancel GTT')
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to cancel GTT')
    } finally {
        canceldialog.value = false
        cancelTarget.value = null
    }
}

async function setOrderrowdata(item) {
    orderdrawer.value = true
    singledata.value = { ...item }
    try {
        const quotes = await getQuotesdata(`${item.exch}|${item.token}`)
        singledata.value.ltp = quotes?.lp || quotes?.ltp || singledata.value.ltp
    } catch { /* no-op */ }
}

function onOrderbookUpdate(e) {
    const book = e.detail
    // Check if detail is an object with type property, or if it's a string directly
    if ((book?.type === 'gtt' || book?.type === 'orders') || book === 'gtt' || book === 'orders') {
        getOrderbook()
    }
}

onMounted(() => {
    getOrderbook()
    window.addEventListener('orderbook-update', onOrderbookUpdate)
})

onBeforeUnmount(() => {
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>

<style scoped>
/* Reload icon rotation animation */
.reload-rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
