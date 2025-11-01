<template>
    <div>
        <v-toolbar flat dense class="tool-sty crd-trn">
            <p class="title font-weight-bold mb-0">Tradebook ({{ orderbookdata.length }})</p>
            <v-spacer></v-spacer>
            <v-text-field style="max-width: 220px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search for Stocks" class="rounded-pill mr-4" variant="solo" density="comfortable"
                :bg-color="'secbg'" />
            <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table :headers="orderheader" :items="filteredItems" fixed-header :hide-default-footer="true"
            :loading="loading" class="mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 4px; border: 1px solid var(--outline)" height="480" :items-per-page="-1"
            @click:row="(_, { item }) => setOrderrowdata(item)">
            <template #item.norentm="{ item }">
                <span class="font-weight-medium maintext--text">{{ timeStr(item.norentm) }}</span>
            </template>
            <template #item.trantype="{ item }">
                <v-chip small :color="item.trantype === 'B' ? 'secgreen' : 'secred'"
                    :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                    :style="`border: 1px solid ${item.trantype === 'B' ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;`">
                    <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                </v-chip>
            </template>
            <template #item.tsym="{ item }">
                <div class="pos-rlt">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exchs || item.exch || '' }}</span>
                    </p>
                    <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                        <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)"
                            min-width="20px" color="maingreen" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                            size="x-small"> B </v-btn>
                        <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)"
                            min-width="20px" color="mainred" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                            size="x-small"> S </v-btn>
                        <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                        </v-btn>
                        <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, item.trantype?.toLowerCase(), item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-autorenew</v-icon>
                        </v-btn>
                        <v-menu close-on-click :location="'bottom'" class="table-menu">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" style="border: 1px solid var(--outline)" min-width="20px"
                                    color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <v-list density="compact">
                                    <div v-for="(m, k) in menulist" :key="k">
                                        <v-list-item
                                            @click="m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, m.trans || item.trantype?.toLowerCase(), item) : setOrderrowdata(item)"
                                            class="pl-3 pr-6">
                                            <template #prepend>
                                                <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                    color="#506D84" />
                                                <img v-else-if="m.icon > 2" width="20px" class="pl-1"
                                                    :src="require(`@/assets/orderbook/${m.icon}.svg`)" />
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
            <template #item.s_prdt_ali="{ item }">
                <v-chip v-if="item.s_prdt_ali" small class="table-hov-prd" text-color="subtext"
                    style="border-radius: 5px; padding: 10px 8px !important">
                    <span class="font-weight-medium fs-12">{{ item.s_prdt_ali }}</span>
                </v-chip>
            </template>
            <template #item.flqty="{ item }">
                <p class="font-weight-medium maintext--text mb-0">
                    {{ item.flqty ? (item.flqty / (item.exch === 'MCX' ? item.ls : 1)) : '' }}
                </p>
            </template>
            <template #item.flprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.flprc) }}</p>
            </template>
            <template #item.avgprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.flqty * item.flprc) }}</p>
            </template>
            <template #item.norenordno="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ item.norenordno || '' }}</p>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImg" />
                        <h4 class="subtext--text font-weight-regular caption">
                            There is no order <br>data here yet!
                        </h4>
                    </div>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import { useAppStore } from '@/stores/appStore'
import { getMTradebook } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()

const loading = ref(false)
const opensearch = ref('')
const orderbookdata = ref([])

const menulist = [
    { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
    { name: 'Create Alert', icon: 5, type: 'alert' },
    { name: 'Market Depth', icon: 6, type: 'depth' },
    { name: 'Chart', icon: 7, type: 'chart', hr: true },
    { name: 'Fundamentals', icon: 9, type: 'Funda' },
    { name: 'Details', icon: 10, type: '' }
]

const orderheader = [
    { title: 'Time', key: 'norentm', sortable: true },
    { title: 'Type', key: 'trantype', sortable: true },
    { title: 'Instrument', key: 'tsym', sortable: true },
    { title: 'Product', key: 's_prdt_ali', sortable: true },
    { title: 'Qty', key: 'flqty', sortable: true, align: 'right' },
    { title: 'Price', key: 'flprc', sortable: true, align: 'right' },
    { title: 'Trade value', key: 'avgprc', sortable: true, align: 'right' },
    { title: 'Order no', key: 'norenordno', sortable: true, align: 'right' },
]

const filteredItems = computed(() => {
    const term = opensearch.value?.toLowerCase()
    if (!term) return orderbookdata.value
    return orderbookdata.value.filter(o =>
        o.tsym?.toLowerCase().includes(term) ||
        o.exch?.toLowerCase().includes(term) ||
        o.norenordno?.toLowerCase().includes(term)
    )
})

function fmt(v) {
    const n = Number(v)
    return isFinite(n) ? n.toFixed(2) : '0.00'
}

function timeStr(v) {
    if (!v) return '-'
    const s = String(v)
    if (s.includes(':')) return s.slice(0, 8)
    const num = Number(s)
    if (!isFinite(num)) return s
    const d = new Date(num)
    return isFinite(d.getTime()) ? d.toTimeString().slice(0, 8) : s
}

async function getOrderbook() {
    loading.value = true
    const uid = sessionStorage.getItem('userid')
    const tok = sessionStorage.getItem('msession')
    if (!uid || !tok) {
        appStore.showSnackbar(2, 'Session expired. Please login again.')
        loading.value = false
        return
    }
    const data = `jData={"uid":"${uid}","actid":"${uid}"}&jKey=${tok}`
    const config = await getMTradebook(data)
    if (config && Array.isArray(config) && config.length > 0) {
        orderbookdata.value = config
    } else {
        orderbookdata.value = []
        if (config && config.emsg) {
            appStore.showSnackbar(2, config.emsg)
        }
    }
    loading.value = false
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'alert', token, exch, tsym } }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' } }))
    } else if (type === 'order' || type === 're-order') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order', token, exch, tsym, trantype: trans, item } }))
    } else {
        const path = [type, token, exch, tsym]
        router.push({ name: 'stocks details', params: { val: path } })
    }
}

function setOrderrowdata(item) {
    // Could open a drawer similar to orders book if needed
    console.log('Trade item:', item)
}

function onOrderbookUpdate() {
    getOrderbook()
}

onMounted(() => {
    getOrderbook()
    window.addEventListener('orderbook-update', onOrderbookUpdate)
})

onBeforeUnmount(() => {
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>
