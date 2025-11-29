<template>
    <div>
        <!-- Sticky Toolbar with Tabs -->
        <div style="position: sticky !important; top: 80px; z-index: 1">
            <v-toolbar class="tool-sty elevation-0" height="40px" style="background-color: white !important;"
                density="compact">
                <v-tabs v-model="bodytab" @update:model-value="setSSDtabs()" show-arrows density="compact">
                    <v-tab v-for="(t, index) in dashitems" :key="index" :value="index"
                        class="text-none text-start min-w-fit" style="padding: 20px !important;" :disabled="!t.tab">
                        <span class="text-center font-weight-medium tab-txt">{{ t.txt }}</span>
                    </v-tab>
                </v-tabs>
                <v-spacer></v-spacer>

                <!-- Buy/Sell Buttons -->
                <v-btn
                    v-if="maindata && maindata.instname != 'UNDIND' && maindata.instname != 'COM' && ((currentTVChartLayoutType === 1 && !selectTVChartLayoutMenu) || (currentTVChartLayoutType === 1 && selectTVChartLayoutMenu))"
                    @click="handleMenuDialog('order', uniqkey[0], uniqkey[1], uniqkey[2], 's')" :disabled="ssdloader"
                    size="small" class="text-none font-weight-bold elevation-0 rounded-pill mr-2 fs-14" variant="tonal"
                    color="red">
                    Sell
                </v-btn>
                <v-btn
                    v-if="maindata && maindata.instname != 'UNDIND' && maindata.instname != 'COM' && ((currentTVChartLayoutType === 1 && !selectTVChartLayoutMenu) || (currentTVChartLayoutType === 1 && selectTVChartLayoutMenu))"
                    @click="handleMenuDialog('order', uniqkey[0], uniqkey[1], uniqkey[2], 'b')" :disabled="ssdloader"
                    size="small" variant="tonal" class="text-none font-weight-bold elevation-0 rounded-pill mr-2 fs-14"
                    color="green">
                    Buy
                </v-btn>

                <!-- Alert Button -->
                <v-tooltip location="top" color="black">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props">
                            <v-btn v-if="uniqkey && uniqkey.length > 0"
                                @click="handleMenuDialog('alert', uniqkey[0], uniqkey[1], uniqkey[2], 'a')"
                                :disabled="ssdloader" icon size="small">
                                <img width="18px" :src="alertIcon" />
                            </v-btn>
                        </div>
                    </template>
                    <span>Create Alert</span>
                </v-tooltip>

                <!-- GTT/GTC Button -->
                <v-tooltip location="top" color="black">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props">
                            <v-btn v-if="maindata && maindata.instname != 'UNDIND' && maindata.instname != 'COM'"
                                @click="handleMenuDialog('order-GTT', uniqkey[0], uniqkey[1], uniqkey[2], 'b')"
                                :disabled="ssdloader" icon size="small" class="ml-2">
                                <img width="18px" :src="gttIcon" />
                            </v-btn>
                        </div>
                    </template>
                    <span>Create GTT / GTC</span>
                </v-tooltip>

                <!-- Pop Chart Toggle -->
                <v-tooltip location="top" color="black" v-if="currentTVChartLayoutType == 1">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props">
                            <v-btn @click="setPopchart()" :disabled="ssdloader" size="small" class="mr-2 ml-2" icon>
                                <img width="20px"
                                    :src="!popchart ? toPipIcon : outPipIcon" />
                            </v-btn>
                        </div>
                    </template>
                    <span>Pop Chart</span>
                </v-tooltip>

                <!-- Multi Chart Layout Menu -->
                <v-tooltip v-if="selectTVChartLayoutMenu && popdialog" location="top" color="black">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props">
                            <v-menu v-model="chartLayoutMenu" location="bottom" offset="4">
                                <template v-slot:activator="{ props: menuProps }">
                                    <div v-bind="menuProps">
                                        <v-btn :disabled="ssdloader" size="small" class="mr-2" icon>
                                            <img width="20px"
                                                :src="getTvChartIconUrl(currentTVChartLayoutIcon)" />
                                        </v-btn>
                                    </div>
                                </template>
                                <v-list density="compact">
                                    <v-list-item class="pl-3" v-for="(layout, index) in tvChartLayoutType" :key="index">
                                        <p class="pl-3">{{ layout.id }}</p>
                                        <template v-slot:append>
                                            <v-btn @click.stop="changeSelectedTVChartLayout(layout)"
                                                :disabled="ssdloader" size="small" class="mr-0 elevation-0" icon>
                                                <img width="20px"
                                                    :src="getTvChartIconUrl(layout.icon)" />
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                    <span>Multi Chart <sup>beta</sup></span>
                </v-tooltip>
            </v-toolbar>
            <v-progress-linear v-if="ssdloader" color="primary" indeterminate rounded></v-progress-linear>
            <v-divider v-else></v-divider>
        </div>

        <!-- Tab Content -->
        <v-window v-model="bodytab" style="z-index: 0">
            <!-- Overview Tab -->
            <v-window-item :value="0">
                <StocksOverview v-if="dashitems[0].tab" />
                <div v-else class="text-center py-16">
                    <p class="subtext--text">Loading overview...</p>
                </div>
            </v-window-item>

            <!-- Chart Tab -->
            <v-window-item :value="1">
                <!-- Multi-Chart Layouts (2 or 4 charts) -->
                <div v-if="currentTVChartLayoutType != 1" style="display: flex; flex-wrap: wrap; gap: 4px;">
                    <!-- Layout Type 2: Two Charts Side by Side -->
                    <template v-if="currentTVChartLayoutType === 2">
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_1-${currentTVChartLayoutType}`"
                                containerId="tv_chart_1"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_2-${currentTVChartLayoutType}`"
                                containerId="tv_chart_2"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                    </template>
                    
                    <!-- Layout Type 4: Four Charts in 2x2 Grid -->
                    <template v-else-if="currentTVChartLayoutType === 4">
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_1-${currentTVChartLayoutType}`"
                                containerId="tv_chart_1"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_2-${currentTVChartLayoutType}`"
                                containerId="tv_chart_2"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_3-${currentTVChartLayoutType}`"
                                containerId="tv_chart_3"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                        <div style="flex: 1; min-width: 49%;">
                            <TVMultiChartContainer 
                                :key="`tv_chart_4-${currentTVChartLayoutType}`"
                                containerId="tv_chart_4"
                                :chartLayoutType="currentTVChartLayoutType"
                                v-if="!popchart" />
                        </div>
                    </template>
                </div>
                
                <!-- Single Chart Layout -->
                <div v-else>
                    <div v-if="popdialog">
                        <TVSingleChartContainer 
                            :key="`single-chart-${currentTVChartLayoutType}`"
                            v-if="!popchart" />
                    </div>
                    <v-container class="elevation-0" color="transparent" v-else>
                        <div class="my-16 py-16 text-center">
                            <img width="160px" :src="toPipLargeIcon" />
                            <br />
                            <span class="text-h6"><b>{{ uniqkey && uniqkey[2] ? uniqkey[2] : '' }}</b> on Pop
                                Chart</span>
                        </div>
                    </v-container>
                </div>
            </v-window-item>

            <!-- Fundamental Tab -->
            <v-window-item :value="2">
                <StockSingle v-if="dashitems[2].tab" />
                <div v-else class="text-center py-16">
                    <p class="subtext--text">Fundamental data not available for this instrument</p>
                </div>
            </v-window-item>

            <!-- Option Tab -->
            <v-window-item :value="3">
                <StocksOption v-if="dashitems[3].tab" />
                <div v-else class="text-center py-16">
                    <p class="subtext--text">Option chain not available for this instrument</p>
                </div>
            </v-window-item>

            <!-- Future Tab -->
            <v-window-item :value="4">
                <v-data-table v-if="futuredata && futuredata.length > 0" disable-sort hide-default-footer
                    class="rounded-0 overflow-y-auto futtable" fixed-header :headers="futurechainhead"
                    :items="futuredata">
                    <template v-slot:[`item.tsym`]="{ item }">
                        <td class="pos-rlt txt-000">
                            <span class="font-weight-medium">{{ item.tsym }}</span>
                            <div class="pos-abs futtable-hov"
                                style="top: 50%; left: 100%; transform: translate(-50%, -50%)">
                                <div @click="handleMenuDialog('order', item.token, item.exch, item.tsym, 'b')"
                                    style="min-width: 24px; background-color: #43A833; border-radius: 4px"
                                    class="px-2 pt-1 pb-1 font-weight-bold text-white elevation-0 mr-1 fs-10 text-center cursor-p">
                                    B</div>
                                <div @click="handleMenuDialog('order', item.token, item.exch, item.tsym, 's')"
                                    style="min-width: 24px; background-color: #F23645; border-radius: 4px"
                                    class="px-2 pt-1 pb-1 font-weight-bold text-white elevation-0 mr-1 fs-10 text-center cursor-p">
                                    S</div>
                                <v-btn @click.stop="handleAddToWatchlist(item)"
                                    style="border: 1px solid #EBEEF0; width: 25px; height: 25px; min-width: 25px; padding: 0;"
                                    color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1 rounded-lg"
                                    icon>
                                    <v-icon size="15" color="maintext">mdi-bookmark-outline</v-icon>
                                </v-btn>
                                <v-btn @click="handleSSDEvent('chart', item.token, item.exch, item.tsym)"
                                    style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1 rounded-lg" size="25"
                                    icon>
                                    <v-icon size="15" color="maintext">mdi-chart-line-variant</v-icon>
                                </v-btn>
                            </div>
                        </td>
                    </template>
                    <template v-slot:[`item.ltp`]="{ item }">
                        <p class="mb-0 ws-p">
                            <span :id="`futt${item.token}ltp`">{{ item.ltp }}</span>
                            <span :id="`futt${item.token}chsclr`" class="fs-12"
                                :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'maintext--text'">
                                <span :id="`futt${item.token}chs`">{{ item.ch }} ({{ item.chp }}%)</span>
                            </span>
                        </p>
                    </template>
                    <template v-slot:[`item.vol`]="{ item }">
                        <span :id="`futt${item.token}vol`">{{ item.vol }}</span>
                    </template>
                    <template v-slot:[`item.h_p`]="{ item }">
                        <span class="text-right" :id="`futt${item.token}h_p`">{{ item.h_p }}</span>
                    </template>
                    <template v-slot:[`item.l_p`]="{ item }">
                        <span class="text-right" :id="`futt${item.token}l_p`">{{ item.l_p }}</span>
                    </template>
                    <template v-slot:[`item.op`]="{ item }">
                        <span class="text-right" :id="`futt${item.token}op`">{{ item.op }}</span>
                    </template>
                    <template v-slot:[`item.cp`]="{ item }">
                        <span class="text-right" :id="`futt${item.token}cp`">{{ item.cp }}</span>
                    </template>
                    <template v-slot:[`item.ap`]="{ item }">
                        <span class="text-right" :id="`futt${item.token}ap`">{{ item.ap }}</span>
                    </template>
                    <template v-slot:no-data>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px"
                                    :src="noDataIcon" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no Future data here yet!</h5>
                            </div>
                        </v-col>
                    </template>
                </v-data-table>
                <div v-else class="no-scroll pos-rlt" style="height: calc(100vh - 118px)">
                    <div class="pos-cent">
                        <p class="mb-0 fs-14 maintext--text font-weight-medium text-center">
                            No Future data <br />
                            for <b>{{ uniqkey && uniqkey[1] && uniqkey[2] ? `${uniqkey[1]}:${uniqkey[2]}` : "" }}</b>
                        </p>
                    </div>
                </div>
            </v-window-item>

            <!-- Info Tab - Shows Security Info and Linked Scrips -->
            <v-window-item :value="5">
                <v-row no-gutters class="py-4">
                    <!-- Security Info Section -->
                    <v-col cols="12" v-if="securityinfos && Object.keys(securityinfos).length > 0">
                        <!-- <h3 class="font-weight-bold mb-4">Security Information </h3> -->
                        <v-row no-gutters>
                            <v-col cols="6" class="pa-0" v-for="(s, ids, d) in securityinfos" :key="d">
                                <v-list-item class="py-0">
                                    <v-list-item-subtitle class="fs-16 ">{{ ids
                                        }}</v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-list-item-title class=" font-weight-bold text-left">
                                            <span>{{ s != undefined ? s : "-" }}</span>
                                        </v-list-item-title>
                                    </template>
                                </v-list-item>
                            </v-col>
                        </v-row>
                    </v-col>

                    <!-- Linked Scrips Section (from Vue 2) -->
                    <!-- <v-col cols="12" v-if="linkedscrips" class="mt-4">
                        <v-divider class="mb-4"></v-divider>
                        <h3 class="font-weight-bold mb-4">Linked Scrips</h3> -->

                    <!-- Equity Section -->
                    <!-- <div v-if="linkedscrips.equls && linkedscrips.equls.length > 0">
                            <p class="font-weight-bold lh-16 mb-2">Equity</p>
                            <v-row>
                                <v-col cols="6" md="4" v-for="(a, s) in linkedscrips.equls" :key="s + a.tsym">
                                    <v-card class="elevation-0 rounded-lg py-3 px-4 mb-2" color="secgreen">
                                        <p class="font-weight-bold fs-14 mb-0">
                                            {{ a.tsym }} <span class="fs-10 font-weight-medium subtext--text">{{ a.exch
                                                }}</span>
                                        </p>
                                        <p class="mb-0 fs-14">
                                            <span class="font-weight-medium">{{ a.ltp ? a.ltp : "0.00" }}</span>
                                            <span class="fs-12"
                                                :class="a.ch > 0 ? 'maingreen--text' : a.ch < 0 ? 'mainred--text' : 'maintext--text'">
                                                <span>{{ a.ch ? a.ch : "0.00" }} ({{ a.chp ? a.chp : "0.00" }}%)</span>
                                            </span>
                                        </p>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div> -->

                    <!-- Options Section -->
                    <!-- <div v-if="linkedscrips.opt_exp && linkedscrips.opt_exp.length > 0">
                            <v-divider class="my-4"></v-divider>
                            <p class="font-weight-bold lh-16 mb-2">Options</p>
                            <v-row>
                                <v-col cols="6" md="4" v-for="(a, s) in linkedscrips.opt_exp" :key="s + a.tsym">
                                    <v-card class="elevation-0 rounded-lg py-3 px-4 mb-2" color="secbg">
                                        <p class="font-weight-bold fs-14 mb-0">
                                            {{ a.tsym }} <span class="fs-10 font-weight-medium subtext--text">{{ a.exch
                                                }}</span>
                                        </p>
                                        <p class="mb-0 fs-14">
                                            <span class="font-weight-medium">{{ a.ltp ? a.ltp : "0.00" }}</span>
                                            <span class="fs-12"
                                                :class="a.ch > 0 ? 'maingreen--text' : a.ch < 0 ? 'mainred--text' : 'maintext--text'">
                                                <span>{{ a.ch ? a.ch : "0.00" }} ({{ a.chp ? a.chp : "0.00" }}%)</span>
                                            </span>
                                        </p>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div> -->

                    <!-- Futures Section (using futuredata from parent) -->
                    <!-- <div v-if="futuredata && futuredata.length > 0">
                            <v-divider class="my-4"></v-divider>
                            <p class="font-weight-bold lh-16 mb-2">Futures</p>
                            <v-row>
                                <v-col cols="6" md="4" v-for="(a, s) in futuredata" :key="s + a.tsym">
                                    <v-card class="elevation-0 rounded-lg py-3 px-4 mb-2" color="secred">
                                        <p class="font-weight-bold fs-14 mb-0">
                                            {{ a.tsym }} <span class="fs-10 font-weight-medium subtext--text">{{ a.exch
                                                }}</span>
                                        </p>
                                        <p class="mb-0 fs-14">
                                            <span class="font-weight-medium">{{ a.ltp ? a.ltp : "0.00" }}</span>
                                            <span class="fs-12"
                                                :class="a.ch > 0 ? 'maingreen--text' : a.ch < 0 ? 'mainred--text' : 'maintext--text'">
                                                <span>{{ a.ch ? a.ch : "0.00" }} ({{ a.chp ? a.chp : "0.00" }}%)</span>
                                            </span>
                                        </p>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div> -->

                </v-row>
            </v-window-item>
        </v-window>

        <!-- Pop Chart (Floating Window) -->
        <div :class="popdialog ? 'd-none' : 'd-flex'" class="rounded-lg" v-if="currentTVChartLayoutType == 1">
            <v-card id="popdiv" width="28%" height="20%" class="rounded-lg overflow-hidden pos-rlt">
                <v-card class="pos-abs rounded-0 elevation-0" color="transparent"  width="100%"
                    id="popdivheader">
                    <v-btn @click="setPopchart()" :disabled="ssdloader" size="x-small"
                        class="mr-2 mt-2 float-right elevation-0" icon>
                        <v-icon size="20">mdi-close</v-icon>
                    </v-btn>
                </v-card>
                <TVSingleChartContainer v-if="popchart" />
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { analytics } from '@/firebase'
import { logEvent } from 'firebase/analytics'
import TVSingleChartContainer from '@/components/TVChartContainer.vue'
import TVMultiChartContainer from '@/components/TVMChartContainer.vue'
import StocksOverview from './StocksOverview.vue'
import StockSingle from './StockSingle.vue'
import StocksOption from './StocksOption.vue'
import { getssDetails, getQuotesdata, getLinkedScrips, getSecuritydata, getTechnicals, getMwatchlistset } from '@/components/mixins/getAPIdata.js'
import { useAppStore } from '@/stores/appStore'

import alertIcon from '/src/assets/orderbook/5.svg'
import gttIcon from '/src/assets/orderbook/4.svg'
import toPipIcon from '/src/assets/to-pip.svg'
import outPipIcon from '/src/assets/out-pip.svg'
import toPipLargeIcon from '/src/assets/topip.svg'
import noDataIcon from '/src/assets/no data folder.svg'
import { useWatchlistStore } from '@/stores/watchlistStore'
const getTvChartIconUrl = (iconName) => {
  return new URL(`/src/assets/tv_chart_icon/${iconName}.svg`, import.meta.url).href
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Chart Layout State
const activeChart = ref('tv_chart_1')
const currentTVChartLayoutType = ref(1)
const currentTVChartLayoutIcon = ref('single-chart')
const selectTVChartLayoutMenu = ref(false)
const tvChartLayoutType = ref([
    { id: 1, icon: 'single-chart' },
    { id: 2, icon: 'dio-chart' },
    { id: 4, icon: 'quadro-chart' },
])
const chartLayoutMenu = ref(false)

// Loading State
const ssdloader = ref(false)
const bodytab = ref(0)

// Tabs Configuration
const dashitems = ref([
    { tab: true, txt: 'Overview', class: 'ws-p' },
    { tab: true, txt: 'Chart', class: 'ws-p' },
    { tab: true, txt: 'Fundamental', class: 'ws-p' },
    { tab: true, txt: 'Option', class: 'ws-p' },
    { tab: true, txt: 'Future', class: 'ws-p' },
    { tab: true, txt: 'Info', class: 'ws-p' },
])

// Authentication
const uid = ref(null)
const stoken = ref(null)
const mtoken = ref(null)

// Data State
const equlsdata = ref([])
const optiondata = ref([])
const futuredata = ref([])
const securityinfos = ref({})
const uniqkey = ref(['', '', 'Your Script Symbol'])
const maindata = ref(null)
const linkedscrips = ref(null)

// Pop Chart State
const popchart = ref(false)
const popdialog = ref(true)

// Initialize global data cache
if (typeof window !== 'undefined' && !window.ssdreqdata) {
    window.ssdreqdata = { data: {} }
}
if (typeof window !== 'undefined') {
    window.ssddetail = []
}

// Computed: Future Chain Headers
const futurechainhead = computed(() => [
    { title: 'SYMBOL', key: 'tsym', class: 'ws-p' },
    { title: 'LTP CH(%)', key: 'ltp', class: 'ws-p' },
    { title: 'BID', key: 'bid', class: 'ws-p', align: 'end' },
    { title: 'ASK', key: 'ask', class: 'ws-p', align: 'end' },
    { title: 'AVG PRICE', key: 'ap', class: 'ws-p', align: 'end' },
    { title: 'HIGH', key: 'h_p', class: 'ws-p', align: 'end' },
    { title: 'LOW', key: 'l_p', class: 'ws-p', align: 'end' },
    { title: 'OPEN', key: 'op', class: 'ws-p', align: 'end' },
    { title: 'CLOSE', key: 'cp', class: 'ws-p', align: 'end' },
    { title: 'VOL', key: 'vol', class: 'ws-p' },
])

// Methods: Chart Layout
const changeSelectedTVChartLayout = (layout) => {
    // Close the menu immediately
    chartLayoutMenu.value = false
    
    // Update layout type and icon
    currentTVChartLayoutType.value = layout.id
    currentTVChartLayoutIcon.value = layout.icon
    
    // Ensure popdialog is true so charts can render
    popdialog.value = true
    
    // Use nextTick to ensure the DOM updates after changing layout
    nextTick(() => {
        // Dispatch event to notify chart components of layout change
        window.dispatchEvent(new CustomEvent('chart-layout-changed', {
            detail: {
                layoutType: layout.id,
                layoutIcon: layout.icon
            }
        }))
    })
}

// Methods: Tab Management
const setSSDtabs = () => {
    if (bodytab.value == 1) {
        selectTVChartLayoutMenu.value = true
    } else {
        selectTVChartLayoutMenu.value = false
    }
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('lwc-event', {
            detail: bodytab.value == 0 ? true : false
        }))
        // Ensure the TV chart has the correct symbol when switching to the chart tab
        if (bodytab.value == 1) {
            const { exch, tsym, token } = resolveCurrentSymbol()
            if (exch && tsym) {
                // Ensure localStorage is set BEFORE dispatching event (critical for chart init)
                const symbolKey = `${exch}:${tsym}`
                localStorage.setItem('ssdtsym', symbolKey)
                if (token) localStorage.setItem('ssdtoken', token)

                // Dispatch ssd-event with object format (not array) for TVChartContainer
                try {
                    window.dispatchEvent(new CustomEvent('ssd-event', {
                        detail: {
                            type: 'chart',
                            token: token || uniqkey.value[0],
                            exch,
                            tsym
                        }
                    }))
                } catch (e) { /* no-op */ }

                // Also set directly on widget with retry
                setChartSymbol(exch, tsym)
            }
        }
    }, 10)
}

// Ensure session is ready (prevents undefined uid/jKey in API payloads on refresh)
const ensureSessionReady = async (maxWaitMs = 4000) => {
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
        const stat = sessionStorage.getItem('c3RhdHVz')
        const u = sessionStorage.getItem('userid')
        const mk = sessionStorage.getItem('msession')
        if (stat === 'dmFsaWR1c2Vy' && u && mk) {
            uid.value = u
            mtoken.value = mk
            stoken.value = sessionStorage.getItem('usession')
            return true
        }
        await new Promise(r => setTimeout(r, 100))
    }
    // fallback set whatever exists
    uid.value = sessionStorage.getItem('userid')
    mtoken.value = sessionStorage.getItem('msession')
    stoken.value = sessionStorage.getItem('usession')
    return !!(uid.value && mtoken.value)
}

// Methods: Pop Chart (open only when the user clicks; no auto-open)
const setPopchart = () => {
    popdialog.value = !popdialog.value
    setTimeout(() => {
        popchart.value = !popchart.value
        if (popchart.value && document.getElementById('popdiv')) {
            dragElement(document.getElementById('popdiv'))
        }
    }, 10)
}

// Methods: Event Handlers
const handleMenuDialog = (type, token, exch, tsym, trantype, item) => {
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type, token, exch, tsym, trantype, item }
    }))
}


const store = useWatchlistStore()
const handleAddToWatchlist = async (item) => {
    // Ensure session is ready
    if (!(await ensureSessionReady())) {
        appStore.showSnackbar(0, 'Session not ready. Please login again.')
        return
    }

    // Get current watchlist name from localStorage or use default
    const currentUid = sessionStorage.getItem('userid')
    let watchlistName = 'Default'

    // Try to get the active/selected watchlist from localStorage
    try {
        const stored = localStorage.getItem(`${currentUid}_watchlists`)
        const stored1 = store.activeWatchlist
        console.log(stored1,"stored")
        if (stored1) {
             watchlistName = stored1
        }else if (stored) {
            const watchlists = JSON.parse(stored)
            if (watchlists && watchlists.length > 0) {
                if (typeof watchlists[0] === 'string') {
                    watchlistName = watchlists[0]
                    console.log(watchlistName,"watchlistName")
                } else if (watchlists[0] && (watchlists[0].key || watchlists[0].name)) {
                    watchlistName = watchlists[0].key || watchlists[0].name || 'Millionaire'
                }
            }
        }else{
            watchlistName = 'Millionaire'
        }
    } catch (e) {
        console.error('Error getting watchlist:', e)
    }

    // Add to watchlist
    try {
        const res = await getMwatchlistset(
            `jData={"uid":"${uid.value}","wlname":"${watchlistName}","scrips":"${item.exch}|${item.token}"}&jKey=${mtoken.value}`,
            "AddMultiScripsToMW"
        )

        if (res.stat === "Ok") {
            const scriptName = item.tsym || item.tsyms || 'Script'
            appStore.showSnackbar(1, `${scriptName} added to watchlist`)
            
            // Dispatch event to notify watchlist component to refresh
            window.dispatchEvent(new CustomEvent('watchlist-updated', {
                detail: { watchlistName, action: 'add', script: item }
            }))
        } else {
            appStore.showSnackbar(0, res.emsg || 'Failed to add to watchlist')
        }
    } catch (error) {
        console.error('Add to watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to add to watchlist')
    }
}

const handleSSDEvent = (type, token, exch, tsym) => {
    const path = [type, token, exch, tsym]
    // Store params for refresh persistence
    localStorage.setItem('ssdParams', JSON.stringify(path))
    localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
    localStorage.setItem('ssdtoken', token)
    // Use query params for persistence
    router.push({
        name: 'stocks details',
        params: { val: path },
        query: { type, token, exch, tsym }
    })
}

// Methods: Data Loading
const setLoadingdata = async (type, token, exch, tsym) => {
    setTabstat(type, token, exch, tsym)

    // Always store params for refresh persistence
    const params = [type, token, exch, tsym]
    localStorage.setItem('ssdParams', JSON.stringify(params))
    localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
    localStorage.setItem('ssdtoken', token)

    if (uniqkey.value[0] != token && uniqkey.value[2] != tsym) {
        let l, si
        uniqkey.value = Array.from([token, exch, tsym])

        // CRITICAL FIX: Always fetch fresh quote data, never use cache
        // Cache contains stale ch/chp values with single-digit precision
        // We can use cached linked scrips and security info, but NOT quote data
        let cachedLinkedScrips = null
        let cachedSecurityInfo = null
        if (window.ssdreqdata && window.ssdreqdata.data && window.ssdreqdata.data[token]) {
            cachedLinkedScrips = window.ssdreqdata.data[token].l
            cachedSecurityInfo = window.ssdreqdata.data[token].i
        }

        // Always fetch fresh data (at minimum, fresh quote data)
        {
            // PERFORMANCE FIX: Fetch all APIs in parallel instead of sequentially
            // This drastically reduces loading time by running all requests simultaneously
            try {
                // Run all 5 API calls in parallel (including technicals)
                const [q, s, linkedScripsData, si, tech] = await Promise.all([
                    getQuotesdata(`${exch}|${token}|${tsym}`),
                    (exch == 'BSE' || exch == 'NSE') ? getssDetails(`${exch}:${tsym}`) : Promise.resolve(null),
                    getLinkedScrips(`${exch}|${token}|${tsym}`),
                    getSecuritydata(`${exch}|${token}`),
                    (exch == 'NSE' || exch == 'BSE') ? getTechnicals(`${exch}|${token}|${encodeURIComponent(tsym)}`).catch(e => null) : Promise.resolve(null)
                ])

                l = linkedScripsData

                // CRITICAL FIX: Calculate ch and chp from ltp and close
                // Never trust API ch/chp values as they may be stale or single-digit precision
                if (q) {
                    const ltp = q.ltp !== undefined && q.ltp !== null ? Number(q.ltp) : null
                    const close = q.prev_close_price !== undefined && q.prev_close_price !== null ? Number(q.prev_close_price) :
                                 (q.close !== undefined && q.close !== null ? Number(q.close) : null)

                    if (ltp !== null && close !== null && close > 0) {
                        const ch = ltp - close
                        const chp = (ch / close) * 100
                        q.ch = ch.toFixed(2)
                        q.chp = chp.toFixed(2)
                    }

                    // Ensure 2 decimal precision for ltp
                    if (q.ltp !== undefined) q.ltp = Number(q.ltp).toFixed(2)
                }

                if (s && s.fundamental) {
                    dashitems.value[2].tab = true
                    window.ssddetail = [q, s, l, si]
                } else {
                    dashitems.value[2].tab = true
                    window.ssddetail = [q, 'no data', l, si]
                }
                // Store in cache WITHOUT ch/chp to avoid using stale calculated values
                window.ssdreqdata.data[token] = { q, s, l, t: tech, i: si }
                linkedscrips.value = l
                maindata.value = q
            } catch (error) {
                console.error('Error loading stock data:', error)
                appStore.showSnackbar(2, 'Failed to load stock data')
            }
        }

        await upScriptdata(token, exch, tsym, l)
        if (si) {
            setScriptinfo(si)
        }
    }
}

// Methods: Tab State Management
const setTabstat = (a, token, exch, tsym) => {
    if (a >= 0) {
        if (bodytab.value == 1) {
            setChartSymbol(exch, tsym)
        }
    } else if (a == 'chart' && bodytab.value == 1) {
        setChartSymbol(exch, tsym)
    } else if (a == 'detail' || a == 'Details' || a == 'depth') {
        bodytab.value = 0
    } else if (a == 'chart') {
        bodytab.value = 1
    } else if (a == 'Funda') {
        bodytab.value = 2
    } else if (a == 'option') {
        bodytab.value = 3
    }
    setSSDtabs()
    if (analytics) {
        logEvent(analytics, 'stock_details', {
            event_name: dashitems.value[bodytab.value].txt,
            value: 1
        })
    }
}

// Methods: Script Data Update
const upScriptdata = async (token, exch, tsym, l) => {
    const windata = window.ssdreqdata.data
    const data = l
    let tech

    if (exch == 'NSE' || exch == 'BSE') {
        if (windata && windata[token] && windata[token].t) {
            tech = windata[token].t
        } else {
            try {
                tech = await getTechnicals(`${exch}|${token}|${encodeURIComponent(tsym)}`)
                windata[token].t = tech
            } catch (error) {
                console.error('Error loading technicals:', error)
            }
        }
    }

    if (data && data.stat == 'Ok') {
        equlsdata.value = []
        if (maindata.value && maindata.value.instname != 'UNDIND' && maindata.value.instname != 'COM' && data.equls && data.equls.length > 0) {
            dashitems.value[2].tab = true
            // CRITICAL FIX: Calculate ch and chp from ltp and close for equities
            equlsdata.value = data.equls.map(item => {
                const ltp = item.ltp !== undefined && item.ltp !== null ? Number(item.ltp) : null
                const close = item.c !== undefined && item.c !== null ? Number(item.c) :
                             (item.cp !== undefined && item.cp !== null ? Number(item.cp) : null)

                if (ltp !== null && close !== null && close > 0) {
                    const ch = ltp - close
                    const chp = (ch / close) * 100
                    item.ch = ch.toFixed(2)
                    item.chp = chp.toFixed(2)
                }

                // Ensure 2 decimal precision
                if (item.ltp !== undefined) item.ltp = Number(item.ltp).toFixed(2)
                return item
            })
        } else {
            dashitems.value[2].tab = true
        }

        optiondata.value = []
        if (maindata.value && data.opt_exp && data.opt_exp.length > 0) {
            dashitems.value[3].tab = true
            // CRITICAL FIX: Calculate ch and chp from ltp and close for options
            optiondata.value = data.opt_exp.map(item => {
                const ltp = item.ltp !== undefined && item.ltp !== null ? Number(item.ltp) : null
                const close = item.c !== undefined && item.c !== null ? Number(item.c) :
                             (item.cp !== undefined && item.cp !== null ? Number(item.cp) : null)

                if (ltp !== null && close !== null && close > 0) {
                    const ch = ltp - close
                    const chp = (ch / close) * 100
                    item.ch = ch.toFixed(2)
                    item.chp = chp.toFixed(2)
                }

                // Ensure 2 decimal precision
                if (item.ltp !== undefined) item.ltp = Number(item.ltp).toFixed(2)
                return item
            })
        } else {
            dashitems.value[3].tab = true
        }

        futuredata.value = []
        if (maindata.value && maindata.value.instname != 'COM' && data.fut && data.fut.length > 0) {
            dashitems.value[4].tab = true
            for (let i = 0; i < data.fut.length; i++) {
                if (data.fut[i].exch == 'NFO' || data.fut[i].exch == 'BFO') {
                    // Future processing if needed
                }

                // CRITICAL FIX: Calculate ch and chp from ltp and close on initial load
                // Don't trust API values as they may be stale or single-digit precision
                const item = data.fut[i]
                const ltp = item.ltp !== undefined && item.ltp !== null ? Number(item.ltp) : null
                const close = item.c !== undefined && item.c !== null ? Number(item.c) :
                             (item.cp !== undefined && item.cp !== null ? Number(item.cp) : null)

                if (ltp !== null && close !== null && close > 0) {
                    const ch = ltp - close
                    const chp = (ch / close) * 100
                    item.ch = ch.toFixed(2)
                    item.chp = chp.toFixed(2)
                }

                // Ensure 2 decimal precision for all price fields
                if (item.ltp !== undefined) item.ltp = Number(item.ltp).toFixed(2)
                if (item.cp !== undefined) item.cp = Number(item.cp).toFixed(2)
                if (item.c !== undefined) item.c = Number(item.c).toFixed(2)

                futuredata.value.push(item)
                futuredata.value.sort((a, b) => new Date(a.exd) - new Date(b.exd))
            }
            setWebsocket('sub', futuredata.value, 'ssd')
        } else {
            dashitems.value[4].tab = true
        }
    }
    ssdloader.value = false
}

// Methods: Security Info
const setScriptinfo = (si) => {
    securityinfos.value = {
        'Company Name': si.cname,
        'Trading Symbol': si.tsym,
        'Symbol Name': si.symnam,
        'Exchange': si.exch,
        'Segment': si.seg,
        'Expiry Date': si.exd,
        'Intrument Name': si.instname,
        'Strike Price': si.strprc,
        'Option Type': si.optt,
        'ISIN': si.isin,
        'Tick Size': si.ti,
        'Lot Size': si.ls,
        'Price precision': si.pp,
        'Multiplier': si.mult,
        'gn/gd * pn/pd': si.gp_nd,
        'Price Units': si.prcunt,
        'Price Quote Qty': si.prcqqty,
        'Trade Units': si.trdunt,
        'Delivery Units': si.delunt,
        'Freeze Qty': si.frzqty,
        'scripupdate Gsm Ind': si.gsmind,
        'Elm Buy Margin': si.elmbmrg,
        'Elm Sell Margin': si.elmsmrg,
        'Additional Long Margin': si.addbmrg,
        'Additional Short Margin': si.addsmrg,
        'Special Long Margin': si.splbmrg,
        'Special Short Margin': si.splsmrg,
        'Delivery Margin': si.delmrg,
        'Tender Margin': si.tenmrg,
        'Tender Start Date': si.tenstrd,
        'Tender End Eate': si.tenendd,
        'Exercise Start Date': si.exestrd,
        'Exercise End Date': si.exeendd,
        'Market type': si.mkt_t,
        'Issue date': si.issue_d,
        'Listing date': si.listing_d,
        'last trading date': si.last_trd_d,
        'Elm Margin': si.elmmrg,
        'Var Margin': si.varmrg,
        'Exposure Margin': si.expmrg,
        '((GN / GD) * (PN/PD))': si.prcftr_d,
        'Non tradable instruments': si.nontrd,
        'Weekly Option, W1, W2, W3, W4 th week': si.weekly,
    }
}

// Methods: WebSocket
const setWebsocket = (flow, data, is) => {
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'stockSSD' }
    }))
}

// Methods: WebSocket Data Parser
const optionChainDataParse = (data) => {

    if (!Array.isArray(futuredata.value) || futuredata.value.length === 0) return

    const w = futuredata.value.findIndex((o) => o.token == data.token)
    if (w >= 0 && futuredata.value[w].token == data.token) {
        // Clean values by removing "+" prefix
        const cleanValue = (val) => {
            if (val === undefined || val === null) return null
            const cleaned = String(val).replace(/^\+/, '')
            const num = Number(cleaned)
            return isNaN(num) ? null : num
        }

        // Extract LTP and Close price
        const lp = cleanValue(data.lp)

        // CRITICAL: Get close price from existing data or WebSocket
        // WebSocket may not send close price on every tick, so preserve it
        let close = cleanValue(data.prev_close_price || data.c)
        if (close === null && futuredata.value[w].cp !== undefined && futuredata.value[w].cp !== null) {
            close = Number(futuredata.value[w].cp)
        }

        // CRITICAL FIX: Calculate ch and chp from ltp and close (same as watchlist/stocks page)
        // Never accept ch/chp directly from WebSocket as they may be stale
        let ch = null
        let chp = null

        if (lp !== null && close !== null && close > 0) {
            ch = lp - close
            chp = (ch / close) * 100
        }

        // Update futuredata reactively with proper 2 decimal formatting
        if (lp !== null) futuredata.value[w].ltp = lp.toFixed(2)
        if (ch !== null) futuredata.value[w].ch = ch.toFixed(2)
        if (chp !== null) futuredata.value[w].chp = chp.toFixed(2)

        // Update other fields
        if (data.volume !== undefined) futuredata.value[w].vol = Number(data.volume)
        if (data.high_price !== undefined) futuredata.value[w].h_p = Number(data.high_price).toFixed(2)
        if (data.low_price !== undefined) futuredata.value[w].l_p = Number(data.low_price).toFixed(2)
        if (data.open_price !== undefined) futuredata.value[w].op = Number(data.open_price).toFixed(2)
        if (close !== null) futuredata.value[w].cp = close.toFixed(2)
        if (data.ap !== undefined) futuredata.value[w].ap = Number(data.ap).toFixed(2)
        if (data.bid_qty !== undefined) futuredata.value[w].bid_qty = data.bid_qty
        if (data.bid !== undefined) futuredata.value[w].bid = Number(data.bid).toFixed(2)
        if (data.ask_qty !== undefined) futuredata.value[w].ask_qty = data.ask_qty
        if (data.ask !== undefined) futuredata.value[w].ask = Number(data.ask).toFixed(2)

        // REACTIVE VUE 3: Force reactivity update
        // Vue will automatically update the DOM through template bindings
        // No need for manual DOM manipulation (getElementById, innerHTML, etc.)
        futuredata.value = [...futuredata.value]
    }
}

// Drag Element Function (for pop chart)
const dragElement = (elmnt) => {
    if (!elmnt) return

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    const header = document.getElementById(elmnt.id + 'header')

    const dragMouseDown = (e) => {
        e = e || window.event
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    const elementDrag = (e) => {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
    }

    const closeDragElement = () => {
        document.onmouseup = null
        document.onmousemove = null
    }

    if (header) {
        header.onmousedown = dragMouseDown
    } else {
        elmnt.onmousedown = dragMouseDown
    }
}

// Event Handlers
const handleSectionClicked = (event) => {
    const containerId = event.detail
    if (containerId) {
        activeChart.value = containerId
    }
}

const handleUserEvent = () => {
    const res = sessionStorage.getItem('c3RhdHVz')
    if (res == 'dmFsaWR1c2Vy') {
        mtoken.value = sessionStorage.getItem('msession')
        stoken.value = sessionStorage.getItem('usession')
        uid.value = sessionStorage.getItem('userid')
    } else {
        router.push('/stocks')
    }
}

const handleSSDEventListener = (event) => {
    const { type, token, exch, tsym } = event.detail || {}
    const path = window.location

    // Store params in localStorage when event is received
    if (type && token && exch && tsym) {
        const val = [type, token, exch, tsym]
        localStorage.setItem('ssdParams', JSON.stringify(val))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)
        console.log('Stored params from ssd-event:', val)
    }

    if (path.pathname == '/stocks/details' && token && token != uniqkey.value[0]) {
        ssdloader.value = true
        setWebsocket('unsub-D', futuredata.value, 'ssd')
        window.ssddetail = []
        console.log('Loading data from ssd-event:', { type, token, exch, tsym })
        setLoadingdata(type, token, exch, tsym)
            .then(() => {
                try {
                    // Re-broadcast as array detail so children like StocksOverview update immediately
                    window.dispatchEvent(new CustomEvent('ssd-event', { detail: [type, token, exch, tsym] }))
                } catch (e) { /* no-op */ }
            })
    }
}

const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == 'stockSSD') {
            optionChainDataParse(data)
        }
    } else if (detail && detail.page == 'stockSSD') {
        optionChainDataParse(detail)
    }
}

// Lifecycle

// const store = useWatchlistStore();
onMounted(async () => {
console.log("Active WL:", store.getActiveWatchlist);
console.log(store.getActiveWatchlist);

    // Wait for auth/session to be ready to avoid undefined uid/jKey in API payloads
    await ensureSessionReady(4000)
    // Do not auto-open pop chart on mount
    popdialog.value = true
    popchart.value = false

    // Load route parameters - try multiple sources for persistence
    let params = route.params.val
    let queryParamsUsed = false
    console.log("Route params ::: ", params)
    console.log("Route query ::: ", route.query)

    // Try route params first
    if (!params || !Array.isArray(params) || params.length < 4) {
        // Try query params (persists on refresh)
        if (route.query.token && route.query.exch && route.query.tsym) {
            params = [
                route.query.type || 'detail',
                route.query.token,
                route.query.exch,
                route.query.tsym
            ]
            queryParamsUsed = true
            console.log('Loaded params from query:', params)
            // Store in localStorage for future use
            localStorage.setItem('ssdParams', JSON.stringify(params))
            localStorage.setItem('ssdtsym', `${route.query.exch}:${route.query.tsym}`)
            localStorage.setItem('ssdtoken', route.query.token)
        } else {
            // Try localStorage as fallback
            const storedParams = localStorage.getItem('ssdParams')
            if (storedParams) {
                try {
                    params = JSON.parse(storedParams)
                    console.log('Loaded params from localStorage:', params)
                } catch (err) {
                    console.error('Error parsing stored params:', err)
                }
            } else {
                // Try to reconstruct from ssdtsym and ssdtoken
                const ssdtsym = localStorage.getItem('ssdtsym')
                const ssdtoken = localStorage.getItem('ssdtoken')
                if (ssdtsym && ssdtoken) {
                    const [exch, tsym] = ssdtsym.split(':')
                    if (exch && tsym) {
                        params = ['detail', ssdtoken, exch, tsym]
                        console.log('Reconstructed params from ssdtsym/ssdtoken:', params)
                        localStorage.setItem('ssdParams', JSON.stringify(params))
                    }
                }
            }
        }
    } else {
        // Store route params in localStorage for refresh persistence
        localStorage.setItem('ssdParams', JSON.stringify(params))
    }

    if (params && Array.isArray(params) && params.length >= 4) {
        console.log('Loading stock data with params:', params)
        // Store params for refresh persistence
        localStorage.setItem('ssdParams', JSON.stringify(params))
        // Always clean URL (remove query params) after resolving params
        try {
            router.replace({ name: 'stocks details', params: { val: params }, query: {} })
        } catch (e) { /* no-op */ }

        await setLoadingdata(params[0], params[1], params[2], params[3])
        // Notify children (e.g., StocksOverview) about symbol change - array format for compatibility
        try {
            window.dispatchEvent(new CustomEvent('ssd-event', { detail: [params[0], params[1], params[2], params[3]] }))
            // Also dispatch object format for TVChartContainer
            window.dispatchEvent(new CustomEvent('ssd-event', { detail: { type: params[0], token: params[1], exch: params[2], tsym: params[3] } }))
        } catch (e) { /* no-op */ }
        // Ensure chart widget receives symbol if Chart tab is active
        if (bodytab.value == 1) {
            localStorage.setItem('ssdtsym', `${params[2]}:${params[3]}`)
            localStorage.setItem('ssdtoken', params[1])
            setChartSymbol(params[2], params[3])
        }
    } else {
        console.log('No valid params found, redirecting to /stocks')
        router.push('/stocks')
    }

    // Watch for route changes (when navigating to same route with different params)
    watch(() => [route.params, route.query, route.path], async ([newParams, newQuery, newPath], [oldParams, oldQuery, oldPath]) => {
        // CRITICAL: Only process query params if we're on the stocks details route
        // This prevents intercepting query params from other routes (like /orders)
        // If we're on /orders or any other route, ignore query params
        if (newPath && (newPath.startsWith('/orders') || newPath.startsWith('/mutualfund') || newPath.startsWith('/ipos') || newPath.startsWith('/bonds'))) {
            // We're not on stocks details route, ignore query params
            return
        }

        let params = null

        // Check query params first (they persist on refresh)
        // Only process if we're on stocks details route (path includes /stocks/details or related routes)
        if (newQuery && newQuery.token && newQuery.exch && newQuery.tsym && newPath && newPath.includes('/stocks/details')) {
            params = [
                newQuery.type || 'detail',
                newQuery.token,
                newQuery.exch,
                newQuery.tsym
            ]
            // Store for future use
            localStorage.setItem('ssdParams', JSON.stringify(params))
            localStorage.setItem('ssdtsym', `${newQuery.exch}:${newQuery.tsym}`)
            localStorage.setItem('ssdtoken', newQuery.token)

            // Remove query params from URL after reading them (for security)
            router.replace({
                name: 'stocks details',
                params: { val: params },
                query: {} // Remove query params
            })
        }
        // Check route params
        else if (newParams && newParams.val && Array.isArray(newParams.val) && newParams.val.length >= 4) {
            params = newParams.val
            localStorage.setItem('ssdParams', JSON.stringify(params))
        }
        // Check localStorage as fallback
        else {
            const storedParams = localStorage.getItem('ssdParams')
            if (storedParams) {
                try {
                    params = JSON.parse(storedParams)
                } catch (err) {
                    console.error('Error parsing stored params in watcher:', err)
                }
            }
        }

        if (params && Array.isArray(params) && params.length >= 4) {
            await ensureSessionReady(4000)
            // Check if these are different params than current
            if (uniqkey.value.length === 0 || uniqkey.value[0] !== params[1] || uniqkey.value[2] !== params[3]) {
                console.log('Route changed, loading new stock data:', params)
                await setLoadingdata(params[0], params[1], params[2], params[3])
                // Notify children about symbol change
                try {
                    window.dispatchEvent(new CustomEvent('ssd-event', { detail: [params[0], params[1], params[2], params[3]] }))
                } catch (e) { /* no-op */ }
                try {
                    router.replace({ name: 'stocks details', params: { val: params }, query: {} })
                } catch (e) { /* no-op */ }
                if (bodytab.value == 1) setChartSymbol(params[2], params[3])
            }
        }
    }, { immediate: false })

    // Event listeners
    window.addEventListener('section-clicked', handleSectionClicked)
    window.addEventListener('user-event', handleUserEvent)
    window.addEventListener('ssd-event', handleSSDEventListener)
    window.addEventListener('web-scoketConn', handleWebSocketConnection)

    // Emit events
    window.dispatchEvent(new CustomEvent('tabBar-load'))
    window.dispatchEvent(new CustomEvent('login-event'))

    // Initialize pop chart drag if needed
    await nextTick()
    if (popchart.value && document.getElementById('popdiv')) {
        dragElement(document.getElementById('popdiv'))
    }
})

onBeforeUnmount(() => {
    // Clean up event listeners
    window.removeEventListener('section-clicked', handleSectionClicked)
    window.removeEventListener('user-event', handleUserEvent)
    window.removeEventListener('ssd-event', handleSSDEventListener)
    window.removeEventListener('web-scoketConn', handleWebSocketConnection)

    // Unsubscribe from WebSocket
    if (futuredata.value && futuredata.value.length > 0) {
        setWebsocket('unsub-D', futuredata.value, 'ssd')
    }
})

// Helper: set chart symbol with retry guard to prevent undefined:undefined
async function setChartSymbol(exch, tsym, maxAttempts = 20, delayMs = 150) {
    if (!exch || !tsym) return
    let attempts = 0
    while (attempts < maxAttempts) {
        const widget = currentTVChartLayoutType.value == 1 ? window.tvWidget : window[activeChart.value]
        const canSet = widget && widget.activeChart && typeof widget.activeChart === 'function'
        if (canSet) {
            try {
                widget.activeChart().setSymbol(`${exch}:${tsym}`)
                return
            } catch (e) { /* retry */ }
        }
        attempts++
        await new Promise(r => setTimeout(r, delayMs))
    }
}

// Helper: resolve current symbol from uniqkey -> route -> localStorage
function resolveCurrentSymbol() {
    let token = null
    if (uniqkey.value && uniqkey.value.length >= 3) {
        return { exch: uniqkey.value[1], tsym: uniqkey.value[2], token: uniqkey.value[0] }
    }
    const q = route?.query
    if (q && q.exch && q.tsym) {
        return { exch: q.exch, tsym: q.tsym, token: q.token }
    }
    const p = route?.params?.val
    if (Array.isArray(p) && p.length >= 4) {
        return { exch: p[2], tsym: p[3], token: p[1] }
    }
    try {
        const ssdtsym = localStorage.getItem('ssdtsym')
        const ssdtoken = localStorage.getItem('ssdtoken')
        if (ssdtsym && ssdtsym.includes(':')) {
            const [exch, tsym] = ssdtsym.split(':')
            return { exch, tsym, token: ssdtoken }
        }
    } catch (_) { }
    return { exch: null, tsym: null, token: null }
}
</script>

<style scoped>
.futable {
    height: calc(100vh - 160px);
}


.pos-rlt {
    position: relative;
}

.pos-abs {
    position: absolute;
}

.pos-cent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.cursor-p {
    cursor: pointer;
}

.tab-txt {
    font-size: 15px !important;
}



.ws-p {
    white-space: nowrap;
}

.fs-10 {
    font-size: 10px;
}

.fs-12 {
    font-size: 12px;
}

.fs-14 {
    font-size: 14px;
}

.lh-16 {
    line-height: 16px;
}

.txt-999 {
    color: #999;
}

.maingreen--text {
    color: #43A833 !important;
}

.mainred--text {
    color: #F23645 !important;
}

.maintext--text {
    color: #000 !important;
}

.subtext--text {
    color: #666666 !important;
}

.no-scroll {
    overflow: hidden;
}

/* Make active tab text black */
:deep(.v-tabs .v-tab--selected),
:deep(.v-tabs .v-tab--selected .v-tab__text),
:deep(.v-tabs .v-tab--selected .tab-txt) {
    color: #000000 !important;
}

:deep(.v-tabs .v-tab--selected) {
    opacity: 1 !important;
}
</style>
