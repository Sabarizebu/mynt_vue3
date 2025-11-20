<template>
    <div>
        <!-- Header Section -->
        <v-toolbar flat dense class="tradebook-header" style="background-color: #ffffff;">
            <p class="title font-weight-bold mb-0" style="font-size: 20px; color: #000000; margin-left: 0;">
                Tradebook ({{ orderbookdata.length }})
            </p>
            <v-spacer></v-spacer>
            <v-text-field rounded density="compact" style="max-width: 220px" v-model="opensearch" hide-details
                prepend-inner-icon="mdi-magnify" label="search for stocks" class="rounded-pill mr-4" variant="solo"
                bg-color="secbg" flat elevation="0" />
            <v-icon :class="['ml-3 cursor-p', { 'reload-rotating': loading }]" :disabled="loading" @click="getOrderbook"
                color="#666666" size="24" style="cursor: pointer; display: inline-block; transform-origin: center;">
                mdi-reload
            </v-icon>
        </v-toolbar>

        <!-- Tradebook Table -->
        <v-data-table :headers="orderheader" :items="filteredItems" fixed-header :hide-default-footer="true"
            :loading="loading" class="tradebook-table holdings-table mt-3"
            style="border-radius: 4px; border: 1px solid #EBEEF0; background-color: #ffffff;" height="480"
            :items-per-page="-1" :sort-by="[{ key: 'norentm', order: 'desc' }]" must-sort item-value="token"
            @click:row="(_, { item }) => setOrderrowdata(item)">
            <!-- Time Column -->
            <template #item.norentm="{ item }">
                <span class="font-weight-medium" style="font-size: 13px; color: #000000;">
                    {{ timeStr(item.norentm) }}
                </span>
            </template>
            <!-- Type Column -->
            <template #item.trantype="{ item }">
                <div
                    :style="`background-color: ${item.trantype === 'B' ? '#ECFDF5' : '#FEF2F2'}; color: ${item.trantype === 'B' ? '#10B981' : '#EF4444'}; border-radius: 4px; padding: 4px 12px; display: inline-block; border: 1px solid ${item.trantype === 'B' ? '#D1FAE5' : '#FEE2E2'};`">
                    <span class="font-weight-bold" style="font-size: 11px; letter-spacing: 0.5px;">
                        {{ item.trantype === 'B' ? 'BUY' : 'SELL' }}
                    </span>
                </div>
            </template>
            <!-- Instrument Column -->
            <template #item.tsym="{ item }">
                <div class="pos-rlt tradebook-instrument-cell"
                    style="min-height: 40px; padding-right: 200px; position: relative;">
                    <p class="font-weight-bold mb-0 tradebook-instrument-text"
                        style="font-size: 13px; color: #000000ff; margin-right: 0; white-space: nowrap; line-height: 1.5; cursor: pointer;"
                        @click="setOrderrowdata(item)">
                        {{ item.tsym || '' }}
                        <span class="ml-1" style="font-size: 10px; color: #999999;">
                            {{ item.exchs || item.exch || '' }}
                        </span>
                    </p>
                    <div @click.stop class="pos-abs tradebook-hover-icons"
                        style="top: 50%; transform: translateY(-50%); right: 0; z-index: 10; gap: 4px; pointer-events: auto; display: flex; align-items: center; opacity: 0; transition: opacity 0.2s;">
                        <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)"
                            min-width="20px" height="20px"
                            style="background-color: #43A833; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                            class="font-weight-bold elevation-0 mr-1" size="x-small">
                            B
                        </v-btn>
                        <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)"
                            min-width="20px" height="20px"
                            style="background-color: #FF1717; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                            class="font-weight-bold elevation-0 mr-1" size="x-small">
                            S
                        </v-btn>
                        <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                            min-width="20px" color="mainbg" class="font-weight-bold elevation-0 mr-1" size="x-small">
                            <v-icon size="14" color="#666666">mdi-chart-line-variant</v-icon>
                        </v-btn>
                        <v-btn
                            @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, item.trantype?.toLowerCase(), item)"
                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                            min-width="20px" color="mainbg" class="font-weight-bold elevation-0 mr-1" size="x-small">
                            <v-icon size="14" color="#666666">mdi-refresh</v-icon>
                        </v-btn>
                        <v-menu :model-value="activeMenuId === item.norenordno"
                            @update:model-value="(val) => !val && (activeMenuId = null)" close-on-content-click
                            location="bottom" offset-y class="table-menu">
                            <template #activator="{ props: menuProps }">
                                <v-btn v-bind="getActivatorProps(menuProps)" @click.stop="toggleMenu(item.norenordno)"
                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                    min-width="20px" color="mainbg" class="font-weight-bold elevation-0 mr-1"
                                    size="x-small">
                                    <v-icon size="14" color="#666666">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list"
                                style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <v-list density="compact" style="padding: 8px 0;">
                                    <div v-for="(m, k) in menulist" :key="k">
                                        <v-list-item @click.stop.prevent="handleMenuItemClick(item, m)"
                                            class="pl-3 pr-6" style="min-height: 40px; cursor: pointer;">
                                            <template #prepend>
                                                <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                    color="#506D84" style="margin-right: 12px;" />
                                                <img v-else-if="m.icon > 2" width="20px" height="20px" class="pl-1"
                                                    style="margin-right: 12px;" :src="getIconImage(m.icon)" />
                                            </template>
                                            <v-list-item-title class="font-weight-medium"
                                                style="font-size: 14px; color: #506D84;">
                                                {{ m.name }}
                                            </v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="m.hr" class="mx-3" style="margin: 4px 0;"></v-divider>
                                    </div>
                                </v-list>
                            </v-card>
                        </v-menu>
                    </div>
                </div>
            </template>
            <!-- Product Column -->
            <template #item.s_prdt_ali="{ item }">
                <div v-if="item.s_prdt_ali"
                    style="background-color: #F3F4F6; border-radius: 4px; padding: 4px 12px; display: inline-block;">
                    <span class="font-weight-bold" style="font-size: 11px; color: #6B7280; letter-spacing: 0.5px;">
                        {{ item.s_prdt_ali }}
                    </span>
                </div>
            </template>

            <!-- Qty Column -->
            <template #item.flqty="{ item }">
                <p class="font-weight-medium mb-0" style="font-size: 13px; color: #000000;">
                    {{ item.flqty ? (item.flqty / (item.exch === 'MCX' ? item.ls : 1)) : '' }}
                </p>
            </template>

            <!-- Price Column -->
            <template #item.flprc="{ item }">
                <p class="text-right font-weight-medium mb-0" style="font-size: 13px; color: #000000;">
                    {{ fmt(item.flprc) }}
                </p>
            </template>

            <!-- Trade value Column -->
            <template #item.avgprc="{ item }">
                <p class="text-right font-weight-medium mb-0" style="font-size: 13px; color: #000000;">
                    {{ fmt(item.flqty * item.flprc) }}
                </p>
            </template>

            <!-- Order no Column -->
            <template #item.norenordno="{ item }">
                <p class="text-right font-weight-medium mb-0" style="font-size: 13px; color: #000000;">
                    {{ item.norenordno || '' }}
                </p>
            </template>
            <template #no-data>
                <div class="text-center" v-if="!loading">
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import icon4 from '@/assets/orderbook/4.svg'
import icon5 from '@/assets/orderbook/5.svg'
import icon6 from '@/assets/orderbook/6.svg'
import icon7 from '@/assets/orderbook/7.svg'
import icon9 from '@/assets/orderbook/9.svg'
import icon10 from '@/assets/orderbook/10.svg'
import { useAppStore } from '@/stores/appStore'
import { getMTradebook } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()

const loading = ref(false)
const opensearch = ref('')
const orderbookdata = ref([])
const activeMenuId = ref(null) // Track which menu is open using unique order ID

// Icon mapping for menu items
const iconUrlMap = {
    4: icon4,
    5: icon5,
    6: icon6,
    7: icon7,
    9: icon9,
    10: icon10,
}

function getIconImage(iconNum) {
    return iconUrlMap[iconNum] || ''
}

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
    // Close any open menus when an action is triggered
    activeMenuId.value = null

    if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'alert', token, exch, tsym } }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' } }))
    } else if (type === 'order' || type === 're-order') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order', token, exch, tsym, trantype: trans, item } }))
    } else {
        // For chart and other navigation types, ensure proper route update
        const path = [type, token, exch, tsym]
        const routeParams = { val: path }

        // CRITICAL: Update localStorage BEFORE navigation so StocksDetails can read it immediately
        localStorage.setItem('ssdParams', JSON.stringify(path))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)

        // Dispatch ssd-event immediately with both formats (array and object) for compatibility
        // This ensures chart components receive the update even before route navigation completes
        try {
            window.dispatchEvent(new CustomEvent('ssd-event', {
                detail: { type, token, exch, tsym }
            }))
            window.dispatchEvent(new CustomEvent('ssd-event', {
                detail: [type, token, exch, tsym]
            }))
        } catch (e) {
            console.error('Error dispatching ssd-event:', e)
        }

        // Check if we're already on the stocks details page
        const currentRoute = router.currentRoute.value
        const isAlreadyOnStocksDetails = currentRoute.name === 'stocks details'

        // Use replace to force navigation even if params are similar
        // Add timestamp to query to ensure Vue Router treats it as a new navigation
        const timestamp = Date.now()
        const navigationPromise = router.replace({
            name: 'stocks details',
            params: routeParams,
            query: { _t: timestamp, type, token, exch, tsym }
        }).catch((err) => {
            // Handle NavigationDuplicated error (Vue Router 4)
            if (err.name === 'NavigationDuplicated' || err.message?.includes('duplicated')) {
                // Force navigation by pushing with a new timestamp
                return router.replace({
                    name: 'stocks details',
                    params: routeParams,
                    query: { _t: Date.now(), type, token, exch, tsym }
                })
            }
            // If already on the page, dispatch event again to force update
            if (isAlreadyOnStocksDetails) {
                // Dispatch again after a small delay to ensure component has processed route change
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ssd-event', {
                        detail: { type, token, exch, tsym }
                    }))
                    window.dispatchEvent(new CustomEvent('ssd-event', {
                        detail: [type, token, exch, tsym]
                    }))
                }, 50)
            }
            return Promise.resolve()
        })

        // Clean up query params after navigation completes to keep URL clean
        navigationPromise.then(() => {
            nextTick(() => {
                const currentRouteAfterNav = router.currentRoute.value
                if (currentRouteAfterNav.name === 'stocks details' && currentRouteAfterNav.query._t) {
                    // Small delay before cleanup to ensure component has processed the change
                    setTimeout(() => {
                        router.replace({
                            name: 'stocks details',
                            params: routeParams,
                            query: {}
                        }).catch(() => {
                            // Ignore errors during cleanup
                        })
                    }, 100)
                }
            })
        })
    }
}


function toggleMenu(id) {
    if (activeMenuId.value === id) {
        activeMenuId.value = null
    } else {
        activeMenuId.value = id
    }
}

function getActivatorProps(props) {
    // Filter out onClick to prevent double toggling or conflict with our manual toggle
    const { onClick, ...rest } = props
    return rest
}

function handleMenuItemClick(item, menuItem) {
    // Close menu first
    activeMenuId.value = null
    // Use nextTick to ensure menu closes before action executes
    nextTick(() => {
        // Then execute the action
        if (menuItem.type) {
            setSSDtab(menuItem.type, item.token, item.exch, item.tsym, menuItem.trans || item.trantype?.toLowerCase(), item)
        } else {
            setOrderrowdata(item)
        }
    })
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

<style scoped>
/* Tradebook Table Styling */
:deep(.tradebook-table) {
    background-color: #ffffff !important;
}

:deep(.tradebook-table .v-data-table__thead) {
    background-color: #F1F3F8 !important;
}

:deep(.tradebook-table .v-data-table__thead th) {
    font-size: 13px !important;
    color: #374151 !important;
    font-weight: 600 !important;
    padding: 12px 16px !important;
    border-bottom: 1px solid #EBEEF0 !important;
    background-color: #F1F3F8 !important;
}

:deep(.tradebook-table .v-data-table__tbody tr) {
    border-bottom: 1px solid #EBEEF0;
}

:deep(.tradebook-table .v-data-table__tbody tr:hover) {
    background-color: #f8f9fa !important;
}



:deep(.tradebook-table .v-data-table__tbody td) {
    padding: 12px 16px !important;
    font-size: 13px !important;
}

/* Hover icons visibility */
.tradebook-instrument-cell:hover .tradebook-hover-icons {
    opacity: 1 !important;
}

.tradebook-hover-icons {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

:deep(.tradebook-table .v-data-table__tbody tr:hover .tradebook-hover-icons) {
    opacity: 1 !important;
}

/* Table cell text alignment for right-aligned columns */
:deep(.tradebook-table .v-data-table__tbody .text-right) {
    text-align: right !important;
}

/* Menu styling */
:deep(.table-menu-list) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    overflow: hidden;
}

:deep(.table-menu-list .v-list-item) {
    min-height: 40px;
    padding: 8px 16px;
}

:deep(.table-menu-list .v-list-item:hover) {
    background-color: #f5f5f5;
}

/* Header styling */
.tradebook-header {
    background-color: #ffffff !important;
}

/* Position utilities */
.pos-rlt {
    position: relative;
}

.pos-abs {
    position: absolute;
}

.cursor-p {
    cursor: pointer;
}

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
