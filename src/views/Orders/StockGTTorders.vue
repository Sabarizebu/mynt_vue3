<template>
    <div>
        <!-- Toolbar -->
        <v-toolbar flat dense class="tool-sty mt-3 pl-4 crd-trn">
            <v-spacer />
            <v-text-field elevation="0" rounded v-model="opensearch" prepend-inner-icon="mdi-magnify"
                placeholder="Search" variant="flat" density="compact" hide-details class="rounded mr-4"
                style="max-width: 220px;font-size: 14px !important;" bg-color="secbg" />
            <v-icon :disabled="loading" :class="['ml-1 cursor-p', { 'reload-rotating': loading }]" @click="getOrderbook"
                color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <!-- GTT Orders Table -->
        <v-data-table fixed-header :hide-default-footer="true" :loading="loading"
            class=" rounded-lg overflow-y-auto"
            style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;" height="480px"
            :headers="headers" :items="searchedItems" :items-per-page="-1" :item-class="() => 'table-row'"
            :row-props="() => ({ class: 'table-row' })" @click:row="(event, { item }) => setOrderrowdata(item)">

            <template #item.tsym="{ item }">
                <div class="pos-rlt">
                    <p @click="setOrderrowdata(item)"
                        class="cursor-pointer font-weight-medium maintext--text mb-0 ws-p">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                    </p>
                </div>
            </template>

            <template #item.orderType="{ item }">
                <div class="pos-rlt d-flex align-center">
                    <p class="font-weight-medium maintext--text mb-0">{{ item.orderType || '' }}</p>
                    <div @click.stop class="pos-abs table-hov" style="right: 0">
                        <!-- Buy Button -->
                        <v-btn @click.stop="onOrder(item, 'b')" min-width="20px"
                            style="background-color: #43A833; color: #ffffff; border-radius: 4px; height: 20px; padding: 0 4px;"
                            class="font-weight-bold elevation-0 mr-1" size="x-small"> B
                        </v-btn>

                        <!-- Sell Button -->
                        <v-btn @click.stop="onOrder(item, 's')" min-width="20px"
                            style="background-color: #FF1717; color: #ffffff; border-radius: 4px; height: 20px; padding: 0 4px;"
                            class="font-weight-bold elevation-0 mr-1" size="x-small"> S
                        </v-btn>

                        <!-- Chart Button -->
                        <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym)"
                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                            min-width="20px" class="elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                        </v-btn>

                        <!-- Menu (3 dots) -->
                        <v-menu location="bottom" class="table-menu">
                            <template #activator="{ props }">
                                <v-btn v-bind="props"
                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                    class="elevation-0 mr-1" size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <v-list density="compact">
                                    <template v-for="(m, k) in menulist" :key="k">
                                        <v-list-item
                                            @click="m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym) : setOrderrowdata(item)">
                                            <template #prepend>
                                                <div class="d-flex align-center justify-center mr-3"
                                                    style="width: 20px; min-width: 20px;">
                                                    <img v-if="m.icon > 2" width="20px" height="20px"
                                                        :src="getIconUrl(m.icon)" style="object-fit: contain;" />
                                                    <v-icon v-else :icon="m.icon" size="20" color="#506D84" />
                                                </div>
                                            </template>
                                            <v-list-item-title class="  fs-14">{{
                                                m.name }}</v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                    </template>
                                </v-list>
                            </v-card>
                        </v-menu>

                    </div>
                </div>
            </template>

            <template #item.trantype="{ item }">
                <div class="d-flex align-center">
                    <v-chip @click="setOrderrowdata(item)" small :color="item.trantype === 'B' ? 'green' : 'red'"
                        :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                        :style="`border: 1px solid ${item.trantype === 'B' ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;cursor: pointer;color: ${item.trantype === 'B' ? 'maingreen' : 'mainred'};`">
                        <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                    </v-chip>
                </div>
            </template>

            <template #item.qty="{ item }">
                <div class="d-flex align-center justify-end">
                    <v-chip @click="setOrderrowdata(item)" small class="table-hov-prd" variant="flat"  text-color="#666"
                        style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer; background-Color: #F1F3F8 !important;
                                color: #666666"
                                >
                        <span class="font-weight-medium fs-12">{{ item.qty }}</span>
                    </v-chip>
                </div>
            </template>

            <template #item.condition="{ item }">
                <div class="d-flex align-center justify-center">
                    <p @click="setOrderrowdata(item)" class="cursor-pointer font-weight-medium maintext--text mb-0">{{
                        item.condition || '' }}</p>
                </div>
            </template>

            <template #item.trigValue="{ item }">
                <p @click="setOrderrowdata(item)"
                    class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ item.trigValue || '' }}
                </p>
            </template>

            <template #item.actions="{ item }">
                <div @click.stop class="d-flex align-center justify-end">
                    <v-btn icon size="small" class="mr-1 elevation-0" style="background-color: transparent !important;"
                        @click="onModify(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none">
                            <path
                                d="M5 18.7782C5.00006 18.481 5.11819 18.1959 5.32841 17.9858L17.8214 5.49281C17.9775 5.33658 18.1629 5.21264 18.3669 5.12808C18.571 5.04352 18.7897 5 19.0106 5C19.2315 5 19.4502 5.04352 19.6542 5.12808C19.8583 5.21264 20.0437 5.33658 20.1998 5.49281L23.0972 8.3902C23.2534 8.54634 23.3774 8.73173 23.4619 8.93578C23.5465 9.13983 23.59 9.35854 23.59 9.57942C23.59 9.8003 23.5465 10.019 23.4619 10.2231C23.3774 10.4271 23.2534 10.6125 23.0972 10.7686L10.6042 23.2616C10.3941 23.4718 10.109 23.5899 9.81179 23.59H6.12085C5.82358 23.59 5.53849 23.4719 5.32829 23.2617C5.11809 23.0515 5 22.7664 5 22.4692V18.7782ZM6.12085 18.7782V22.4692H9.81179L22.3047 9.9762C22.3569 9.92414 22.3983 9.8623 22.4266 9.79421C22.4548 9.72613 22.4694 9.65313 22.4694 9.57942C22.4694 9.5057 22.4548 9.43271 22.4266 9.36463C22.3983 9.29654 22.3569 9.2347 22.3047 9.18264L19.4074 6.28525C19.3553 6.23306 19.2935 6.19165 19.2254 6.1634C19.1573 6.13515 19.0843 6.12061 19.0106 6.12061C18.9369 6.12061 18.8639 6.13515 18.7958 6.1634C18.7277 6.19165 18.6659 6.23306 18.6138 6.28525L6.12085 18.7782Z"
                                fill="currentColor" />
                            <path
                                d="M16.3721 7.73451L20.8555 12.2179L21.649 11.4243L17.1657 6.94095L16.3721 7.73451ZM6.28448 17.8221L10.7679 22.3055L11.5614 21.512L7.07804 17.0286L6.28448 17.8221Z"
                                fill="currentColor" />
                            <path d="M18.6138 9.18265L8.52618 19.2703L9.31974 20.0638L19.4074 9.97621L18.6138 9.18265Z"
                                fill="currentColor" />
                        </svg>
                    </v-btn>
                    <v-btn icon size="small" class="elevation-0" style="background-color: transparent !important;"
                        @click="confirmCancel(item)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                            <path fill="currentColor" fill-rule="evenodd"
                                d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                            </path>
                        </svg>
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
        <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="false" width="360" color="cardbg"
            class="pt-0">
            <template v-slot:prepend>
                <v-toolbar class="nav-drawer crd-trn" density="comfortable" style="border-bottom: 1px solid #EBEEF0;">
                    <v-btn icon variant="text" density="comfortable" @click="orderdrawer = false">
                        <v-icon color="maintext" size="20">mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>

            <div v-if="singledata" class="d-flex flex-column" style="height: calc(100% - 64px);">
                <!-- Instrument and Price Section -->
                <div class="px-4 pt-4 pb-5" style="border-bottom: 1px solid #EBEEF0;">
                    <p class="font-weight-bold maintext--text fs-18 mb-2">
                        {{ singledata.tsym || '' }}
                        <span class="ml-1 txt-999 fs-12">{{ singledata.exch || '' }}</span>
                    </p>
                    <p class="txt-000 font-weight-medium fs-16 mb-1">₹{{ fmt(singledata.ltp || 0) }}</p>
                    <p class="subtext--text font-weight-medium fs-12 mb-0">
                        {{ singledata.ch ? `${singledata.ch > 0 ? '+' : ''}${fmt(singledata.ch)}` : '0.00' }} ({{
                            singledata.chp
                                ? `${singledata.chp > 0 ? '+' : ''}${fmt(singledata.chp)}` : '0.00' }}%)
                    </p>
                </div>

                <!-- Order Id Section -->
                <div class="px-4 py-5">
                    <p class="subtext--text font-weight-medium fs-13 mb-1">Order Id</p>
                    <div class="d-flex justify-space-between align-center">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.al_id || '-' }}</p>
                        <v-btn icon variant="text" size="small" class="elevation-0"
                            style="min-width: 24px; width: 24px; height: 24px;">
                            <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                        </v-btn>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="px-4 py-5" style="border-bottom: 1px solid #EBEEF0;">
                    <v-row no-gutters>
                        <v-col cols="6" class="pr-1">
                            <v-btn rounded="pill" class="text-none font-weight-bold" block height="40"
                                variant="outlined" style=" border: 1px solid #000;" @click="onModify(singledata)">Modify
                                Order</v-btn>
                        </v-col>
                        <v-col cols="6" class="pl-1">
                            <v-btn rounded="pill" class="text-none font-weight-bold" block height="40"
                                variant="outlined" style="border: 1px solid #000;"
                                @click="confirmCancel(singledata)">Cancel
                                Order</v-btn>
                        </v-col>
                    </v-row>
                </div>

                <!-- Details Section -->
                <div class="px-4 flex-grow-1" style="overflow-y: auto;">
                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Quantity</p>
                        <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.qty || '0' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Total trade price</p>
                        <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ fmt(getTotalTradePrice()) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Last trade price</p>
                        <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ fmt(singledata.ltp || 0) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Exchange</p>
                        <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.exch || '-' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Validity</p>
                        <p class="txt-000 font-weight-bold fs-14 mb-0">{{ getValidity() }}</p>
                    </div>
                </div>
            </div>
        </v-navigation-drawer>

        <!-- Cancel dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <div class="text-center">
                    <img src="@/assets/orderbook/cancel-icon.svg" width="50px" alt="cancel icon" />
                </div>
                <p class="font-weight-medium mt-3 lh-24 mb-8" style="font-size: 22px !important;">
                    Are you sure you want to<br />
                    cancel this <b>GTT order</b>?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6" class="px-2">
                        <v-btn @click="canceldialog = false" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6" class="px-2">
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
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import { useAppStore } from '@/stores/appStore'
import { getGttorderbook, setCancelGTT, getQuotesdata } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()

const loading = ref(false)
const opensearch = ref('')
const orderbookdata = ref([])
const orderdrawer = ref(false)
const canceldialog = ref(false)
const singledata = ref({})
const cancelTarget = ref(null)

const headers = [
    { title: 'Instrument', key: 'tsym', align: 'start' },
    { title: 'Buy/Sell', key: 'trantype', align: 'start' },
    { title: 'Product type', key: 'orderType', align: 'start' },
    { title: 'Qty', key: 'qty', align: 'end' },
    { title: 'Condition', key: 'condition', align: 'center' },
    { title: 'Trig Value', key: 'trigValue', align: 'end' },
    { title: '', key: 'actions', sortable: false, align: 'end' }
]

const menulist = [
    { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
    { name: 'Create Alert', icon: 5, type: 'alert' },
    { name: 'Market Depth', icon: 6, type: 'depth' },
    { name: 'Chart', icon: 7, type: 'chart', hr: true },
    { name: 'Fundamentals', icon: 9, type: 'Funda' },
    { name: 'Details', icon: 10, type: '' },
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

function confirmCancel(item) {
    orderdrawer.value = false
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
    orderdrawer.value = !orderdrawer.value
    singledata.value = { ...item }
    try {
        const quotes = await getQuotesdata(`${item.exch}|${item.token}`)
        singledata.value.ltp = quotes?.lp || quotes?.ltp || singledata.value.ltp
        singledata.value.ch = quotes?.ch || 0
        singledata.value.chp = quotes?.chp || 0
    } catch { /* no-op */ }
}

function getIconUrl(iconNumber) {
    return new URL(`/src/assets/orderbook/${iconNumber}.svg`, import.meta.url).href
}

function fmt(value) {
    if (value === null || value === undefined || value === '') return '0.00'
    const num = Number(value)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
}

function getTotalTradePrice() {
    if (!singledata.value) return 0
    const qty = Number(singledata.value.qty || 0)
    // For GTT orders, use the order price from place_order_params
    // If not available, use trigger value as fallback
    let price = 0
    if (singledata.value.res?.place_order_params?.prc) {
        price = Number(singledata.value.res.place_order_params.prc)
    } else if (singledata.value.res?.prc) {
        price = Number(singledata.value.res.prc)
    } else if (singledata.value.trigValue) {
        // Use trigger value as fallback
        price = Number(singledata.value.trigValue)
    }
    // If price is 0 or market order, use LTP
    if (price === 0 && singledata.value.ltp) {
        price = Number(singledata.value.ltp)
    }
    const total = qty * price
    return isNaN(total) || total <= 0 ? 0 : total
}

function getValidity() {
    if (!singledata.value) return 'END'
    // GTT orders typically show 'END' (End of Session) or 'GTT'
    const ret = singledata.value.res?.place_order_params?.ret || singledata.value.res?.ret
    // Map common validity values
    if (ret === 'EOS') return 'END'
    if (ret === 'DAY') return 'DAY'
    if (ret === 'IOC') return 'IOC'
    // Default for GTT orders
    return 'END'
}

function onOrder(item, trantype) {
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: {
            type: 'order',
            token: item.token,
            exch: item.exch,
            tsym: item.tsym,
            trantype,
            item
        }
    }))
}

function onModify(item) {
    orderdrawer.value = false
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: {
            type: 'mod-GTT',
            token: item.token,
            exch: item.exch,
            tsym: item.tsym,
            trantype: (item.trantype || '').toLowerCase(),
            item
        }
    }))
}

function setSSDtab(type, token, exch, tsym) {
    if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type: 'alert', token, exch, tsym }
        }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' }
        }))
    } else if (type === 'chart' || type === 'depth' || type === 'Funda' || type === '') {
        const path = [type || 'detail', token, exch, tsym]

        // Store in localStorage for persistence
        localStorage.setItem('ssdParams', JSON.stringify(path))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)

        router.push({
            name: 'stocks details',
            params: { val: path },
            query: {
                type: type || 'detail',
                token: token,
                exch: exch,
                tsym: tsym
            }
        })
    }
}

function onHistory(item) {
    // Implement history functionality if needed
    // console.log('Order history:', item)
}

function onOrderbookUpdate(e) {
    const book = e.detail
    // Check if detail is an object with type property, or if it's a string directly
    if ((book?.type === 'gtt' || book?.type === 'orders') || book === 'gtt' || book === 'orders') {
        getOrderbook()
    }
}

// Function to close drawer and clear data
function closeDrawerAndClearData() {
    orderdrawer.value = false
    singledata.value = null
}

// Event handler for closing drawer when parent tab changes
function onCloseAllDrawers(event) {
    // console.log('[StockGTTorders] Close all drawers event received:', event.detail)
    closeDrawerAndClearData()
}

onMounted(() => {
    getOrderbook()
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    // Listen for parent tab change to close drawer
    window.addEventListener('close-all-order-drawers', onCloseAllDrawers)
})

onBeforeUnmount(() => {
    // Close drawer and clear data before unmounting
    closeDrawerAndClearData()
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
    window.removeEventListener('close-all-order-drawers', onCloseAllDrawers)
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

:deep(.v-text-field input) {
    font-size: 14px !important;
}

:deep(.v-text-field input::placeholder) {
    color: black !important;
}

/* Hover options styling */
.pos-rlt {
    position: relative;
}

.pos-abs {
    position: absolute;
}

.table-hov {
    display: none;
    z-index: 1;
}

:deep(.table-row:hover) .table-hov {
    display: flex !important;
    align-items: center;
}

.ws-p {
    white-space: pre-wrap;
}

.cursor-pointer {
    cursor: pointer;
}

/* Make table rows clickable - match old app row styling */
:deep(.holdings-table .table-row),
:deep(.holdings-table tbody tr) {
    cursor: pointer;
    height: auto !important;
    min-height: 48px !important;
}

:deep(.holdings-table .table-row:hover),
:deep(.holdings-table tbody tr:hover) {
    background-color: #CFD9F2 !important;
}

/* Match old app table row spacing */
:deep(.holdings-table tbody tr) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

:deep(.holdings-table tbody tr:last-child) {
    border-bottom: none !important;
}

.maintext--text {
    color: black !important;
}

/* Align headers and cells properly based on header align property */
/* Match old app table row padding and positioning (Vuetify 2 default was ~8px 16px) */
:deep(.holdings-table .v-data-table__th),
:deep(.holdings-table .v-data-table__td) {
    padding: 8px 16px !important;
    height: auto !important;
    min-height: 48px !important;
    vertical-align: middle !important;
    line-height: 1.5 !important;
}

/* Right-aligned columns (Qty, Trig Value, Actions) */
:deep(.holdings-table .v-data-table__th:nth-child(4)),
:deep(.holdings-table .v-data-table__td:nth-child(4)),
:deep(.holdings-table .v-data-table__th:nth-child(6)),
:deep(.holdings-table .v-data-table__td:nth-child(6)),
:deep(.holdings-table .v-data-table__th:nth-child(7)),
:deep(.holdings-table .v-data-table__td:nth-child(7)) {
    text-align: right !important;
}

/* Center-aligned column (Condition) */
:deep(.holdings-table .v-data-table__th:nth-child(5)),
:deep(.holdings-table .v-data-table__td:nth-child(5)) {
    text-align: center !important;
}

/* Left-aligned columns (Instrument, Buy/Sell, Product type) */
:deep(.holdings-table .v-data-table__th:nth-child(1)),
:deep(.holdings-table .v-data-table__td:nth-child(1)),
:deep(.holdings-table .v-data-table__th:nth-child(2)),
:deep(.holdings-table .v-data-table__td:nth-child(2)),
:deep(.holdings-table .v-data-table__th:nth-child(3)),
:deep(.holdings-table .v-data-table__td:nth-child(3)) {
    text-align: left !important;
}

/* Drawer styling */
:deep(.v-navigation-drawer) {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-navigation-drawer .v-btn--variant-outlined) {
    border-color: #000 !important;
    color: #000 !important;
}

:deep(.v-navigation-drawer .v-btn--variant-outlined:hover) {
    background-color: rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-text-field input) {
    font-size: 14px !important;
}

/* Data table header font size */
:deep(.v-data-table thead th),
:deep(.v-data-table table thead th),
:deep(.v-data-table .v-data-table__wrapper table thead th),
:deep(.v-data-table.v-data-table--fixed-header thead th),
:deep(.v-data-table.v-data-table--fixed-header table thead th),
:deep(.holdings-table.v-data-table thead th),
:deep(.holdings-table.v-data-table table thead th),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header table thead th) {
    font-size: 13px !important;
    color: #666666 !important;
}
</style>
