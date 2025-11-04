<template>
    <div>
        <div v-if="optionsStore.optionchainid" class="tvcharts">
            <v-card color="cardbg" width="100%" class="rounded-md" style="overflow: hidden">
                <div>
                    <!-- Toolbar Section -->
                    <v-toolbar flat dense class="tool-sty crd-trn pr-4">
                        <!-- Search Button -->
                        <v-btn :readonly="optionsStore.coractloader" @click="handleOptionSearch"
                            class="elevation-0 rounded-lg mr-2" color="transparent">
                            <p class="font-weight-bold mb-0 lh-24 text-none">
                                <v-icon>mdi-magnify</v-icon>
                                {{ optionsStore.optionStockName || 'Search Option' }}
                            </p>
                        </v-btn>

                        <!-- Expiry Date Selector -->
                        <v-menu location="bottom" offset="4">
                            <template v-slot:activator="{ props }">
                                <div v-bind="props">
                                    <v-btn :readonly="optionsStore.coractloader" color="secbg"
                                        class="elevation-0 rounded-lg text-none fs-14 mr-4 px-2 text-capitalize">
                                        {{ optionsStore.lsexdval || '' }}
                                        <span class="ml-4 font-weight-bold fs-12">
                                            {{ optionsStore.lsexdval ? optionsStore.daydiff + '(D)' : '' }}
                                        </span>
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </v-btn>
                                </div>
                            </template>
                            <v-list density="compact" style="max-height: 320px; overflow-y: scroll">
                                <v-list-item-group v-model="optionsStore.lsexdfilter" active-class="primary--text"
                                    @update:model-value="optionChainDate">
                                    <v-list-item v-for="(item, index) in optionsStore.lsexd" :key="index" :value="index">
                                        <v-list-item-title>{{ item }}</v-list-item-title>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-menu>

                        <!-- Chain Count Selector -->
                        <v-menu location="bottom" offset="4">
                            <template v-slot:activator="{ props }">
                                <div v-bind="props">
                                    <v-btn :readonly="optionsStore.coractloader" color="secbg"
                                        class="elevation-0 rounded-lg text-none fs-14 px-2 text-capitalize">
                                        {{ optionsStore.chainCount ? (optionsStore.chainCount == '50' ? 'All' : optionsStore.chainCount) : '' }}
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </v-btn>
                                </div>
                            </template>
                            <v-list density="compact">
                                <v-list-item-group v-model="optionsStore.ccfilter" active-class="primary--text"
                                    @update:model-value="optionChainDate">
                                    <v-list-item v-for="(item, index) in ['5', '10', '15', '30', 'All']" :key="index"
                                        :value="index">
                                        <v-list-item-title>{{ item }}</v-list-item-title>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-menu>

                        <v-spacer></v-spacer>

                        <!-- Basket Order Button -->
                        <v-btn :readonly="optionsStore.coractloader" tile icon @click="setBaskorder('create')">
                            <img width="24px" src="/src/assets/usermenu/9opt.svg" />
                        </v-btn>

                        <!-- Settings Button -->
                        <v-btn :readonly="optionsStore.coractloader" v-if="!optionsStore.drawer" tile icon
                            @click="optionsStore.drawer = true">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
                                <g fill="currentColor" fill-rule="evenodd">
                                    <path fill-rule="nonzero"
                                        d="M14 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4z">
                                    </path>
                                    <path
                                        d="M5.005 16A1.003 1.003 0 0 1 4 14.992v-1.984A.998.998 0 0 1 5 12h1.252a7.87 7.87 0 0 1 .853-2.06l-.919-.925c-.356-.397-.348-1 .03-1.379l1.42-1.42a1 1 0 0 1 1.416.007l.889.882A7.96 7.96 0 0 1 12 6.253V5c0-.514.46-1 1-1h2c.557 0 1 .44 1 1v1.253a7.96 7.96 0 0 1 2.06.852l.888-.882a1 1 0 0 1 1.416-.006l1.42 1.42a.999.999 0 0 1 .029 1.377s-.4.406-.918.926a7.87 7.87 0 0 1 .853 2.06H23c.557 0 1 .447 1 1.008v1.984A.998.998 0 0 1 23 16h-1.252a7.87 7.87 0 0 1-.853 2.06l.882.888a1 1 0 0 1 .006 1.416l-1.42 1.42a1 1 0 0 1-1.415-.007l-.889-.882a7.96 7.96 0 0 1-2.059.852v1.248c0 .56-.45 1.005-1.008 1.005h-1.984A1.004 1.004 0 0 1 12 22.995v-1.248a7.96 7.96 0 0 1-2.06-.852l-.888.882a1 1 0 0 1-1.416.006l-1.42-1.42a1 1 0 0 1 .007-1.415l.882-.888A7.87 7.87 0 0 1 6.252 16H5.005zm3.378-6.193l-.227.34A6.884 6.884 0 0 0 7.14 12.6l-.082.4H5.005C5.002 13 5 13.664 5 14.992c0 .005.686.008 2.058.008l.082.4c.18.883.52 1.71 1.016 2.453l.227.34-1.45 1.46c-.004.003.466.477 1.41 1.422l1.464-1.458.34.227a6.959 6.959 0 0 0 2.454 1.016l.399.083v2.052c0 .003.664.005 1.992.005.005 0 .008-.686.008-2.057l.399-.083a6.959 6.959 0 0 0 2.454-1.016l.34-.227 1.46 1.45c.003.004.477-.466 1.422-1.41l-1.458-1.464.227-.34A6.884 6.884 0 0 0 20.86 15.4l.082-.4h2.053c.003 0 .005-.664.005-1.992 0-.005-.686-.008-2.058-.008l-.082-.4a6.884 6.884 0 0 0-1.016-2.453l-.227-.34 1.376-1.384.081-.082-1.416-1.416-1.465 1.458-.34-.227a6.959 6.959 0 0 0-2.454-1.016L15 7.057V5c0-.003-.664-.003-1.992 0-.005 0-.008.686-.008 2.057l-.399.083a6.959 6.959 0 0 0-2.454 1.016l-.34.227-1.46-1.45c-.003-.004-.477.466-1.421 1.408l1.457 1.466z">
                                    </path>
                                </g>
                            </svg>
                        </v-btn>
                    </v-toolbar>
                    <v-divider></v-divider>

                    <!-- Options Chain Table -->
                    <div>
                        <v-card v-if="optionsStore.coractdata" class="crd-trn elevation-0 rounded-0" style="overflow: hidden">
                            <v-table class="no-scroll crd-trn" fixed-header
                                :style="`--my-simtblwidth-var:${optionsStore.simtblwidth};--my-simtblscroll-var:${optionsStore.simtblscroll};`"
                                height="calc(100vh - 178px)" density="compact">
                                <thead class="secbg">
                                    <!-- Header Row 1: CALLS | PUTS -->
                                    <tr class="cardbg">
                                        <th :colspan="optionsStore.opchtablehead" class="px-0 text-center">
                                            <span class="font-weight-bold">CALLS</span>
                                        </th>
                                        <th colspan="4" class="text-center pa-0"></th>
                                        <th :colspan="optionsStore.opchtablehead" class="px-0 text-center">
                                            <span class="font-weight-bold">PUTS</span>
                                        </th>
                                    </tr>
                                    <!-- Header Row 2: Column Headers -->
                                    <tr>
                                        <!-- Call Side Headers -->
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">THETA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VEGA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">GAMA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">DELTA</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VOL<span class="optionchsty">(lac)</span></span>
                                            </v-card>
                                        </th>
                                        <th width="96px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">OI<span class="optionchsty">(ch)</span></span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">BID</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">ASK</span>
                                            </v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">CH</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">LTP</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">IV</span>
                                            </v-card>
                                        </th>
                                        <!-- Strike Price Header -->
                                        <th colspan="4"
                                            style="border-left: thin solid rgba(0, 0, 0, 0.12); border-right: thin solid rgba(0, 0, 0, 0.12)">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="mx-4 optionheadsty">STRIKES</span>
                                            </v-card>
                                        </th>
                                        <!-- Put Side Headers -->
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">IV</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">LTP</span>
                                            </v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">CH</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">BID</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">ASK</span>
                                            </v-card>
                                        </th>
                                        <th width="96px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">OI<span class="optionchsty">(ch)</span></span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VOL<span class="optionchsty">(lac)</span></span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">DELTA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">GAMA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VEGA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">THETA</span>
                                            </v-card>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Phase 1: Basic table structure - data rows will be added in Phase 2 -->
                                    <tr>
                                        <td :colspan="optionsStore.opchtablehead + 4 + optionsStore.opchtablehead"
                                            class="text-center py-16">
                                            <p class="subtext--text">Loading options chain data...</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card>

                        <!-- Loading State -->
                        <v-card color="transparent" v-if="optionsStore.coractloader" width="100%"
                            style="z-index: 0 !important" class="elevation-0 rounded-lg py-10 px-16">
                            <p class="pa-16 pb-0 text-center">Getting your Option Chain</p>
                            <v-card width="200px" class="elevation-0 mx-auto">
                                <v-progress-linear class="mb-12" color="primary" indeterminate rounded height="6">
                                </v-progress-linear>
                            </v-card>
                        </v-card>
                    </div>
                </div>
        </v-card>
        </div>
        <!-- No Data State -->
        <div v-else class="no-scroll pos-rlt" style="height: calc(100vh - 118px)">
            <div class="pos-cent">
                <p class="mb-0 fs-14 maintext--text font-weight-medium text-center">
                    No Option chain data <br />
                    for <b>{{ optionsStore.optionStockSymbol || '' }}</b>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useOptionsStore } from '@/stores/optionsStore'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getMasters, getOptionschain, getQuotesdata, getGreekoptions, getMPosotion } from '@/components/mixins/getAPIdata'

const route = useRoute()
const optionsStore = useOptionsStore()
const authStore = useAuthStore()
const appStore = useAppStore()

// Initialize global data cache if not exists
if (typeof window !== 'undefined' && !window.ssdreqdata) {
    window.ssdreqdata = { data: {} }
}
if (typeof window !== 'undefined' && !window.ssddetail) {
    window.ssddetail = []
}

// Phase 1: Basic data fetching functions
async function setWaiting(tsym, exit) {
    const token = localStorage.getItem('ssdtoken')
    const windata = window.ssdreqdata?.data
    let opt

    if ((windata && windata[token] && windata[token].l) || (window.ssddetail && window.ssddetail[0] && window.ssddetail[0].token == token)) {
        opt = windata && windata[token] && windata[token].l ? windata[token].l : window.ssddetail[2]
        let sym = tsym.toUpperCase()

        // Parse symbol to get underlying symbol
        if (sym.split(':')[0].match(/^NFO$/)) {
            optionsStore.optionStockSymbol = sym
        } else {
            let matchval = sym.match(/(\d{1,2})[a-zA-Z]{3}(\d{2,4})?/g)
            if (matchval) {
                let scriptList = sym.split(matchval[0])

                if (scriptList[0].split(':')[1]?.match(/^NIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY 50'
                } else if (scriptList[0].split(':')[1]?.match(/^BANKNIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY BANK'
                } else if (scriptList[0].split(':')[1]?.match(/^FINNIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY FIN SERVICE'
                } else if (scriptList[0].split(':')[0]?.match(/^NFO$/)) {
                    optionsStore.optionStockSymbol = `NSE:${scriptList[0].split(':')[1]}-EQ`
                } else {
                    optionsStore.optionStockSymbol = sym
                }
            } else {
                optionsStore.optionStockSymbol = sym
            }
        }

        let symbols = await getMasters(`${optionsStore.optionStockSymbol}`)
        if (symbols && opt && opt.opt_exp && opt.opt_exp.length > 0 && ((windata && windata[token] && windata[token].q) || window.ssddetail[0])) {
            optionsStore.optionStockSpot = 0
            optionsStore.lsexdfilter = 0
            await optionchainMet(exit ? exit : null, opt, token)
            optionsStore.optionchainid = true
            optionsStore.coractloader = true
            optionsStore.coractdata = false
        } else {
            optionsStore.clearOption()
            optionsStore.optionStockSymbol = sym
        }
    } else if (opt && opt.opt_exp && opt.opt_exp.length === 0) {
        optionsStore.clearOption()
    } else {
        setTimeout(() => {
            setWaiting(tsym, exit)
        }, 100)
    }
}

async function optionchainMet(exit, windata, tokenis) {
    if (exit == 'exit') {
        optionsStore.coractloader = true
        optionsStore.coractdata = false
    } else {
        // Load column visibility settings from localStorage
        optionsStore.loadColumnSettings(authStore.uid)
        optionsStore.drawer = false

        optionsStore.chainCount = ''
        optionsStore.chainSpotdata = {}
        optionsStore.lsexd = []
        optionsStore.upcallSO = []
        optionsStore.upputSO = []
        optionsStore.dwncallSO = []
        optionsStore.dwnputSO = []

        let symbols = await getMasters(`${optionsStore.optionStockSymbol}`)
        if (symbols && symbols.length > 0) {
            optionsStore.exchange = optionsStore.optionStockSymbol.split(':')[0]
            optionsStore.scriptToken = symbols[0]

            const winssd = window.ssdreqdata?.data?.[tokenis] ? window.ssdreqdata.data[tokenis].i : window.ssddetail?.[3]
            const winqut = window.ssdreqdata?.data?.[tokenis] ? window.ssdreqdata.data[tokenis].q : window.ssddetail?.[0]

            if (winssd) {
                optionsStore.securityinfo = winssd
                optionsStore.opname = winssd.symname || ''
                optionsStore.opexch = winssd.exch || ''
                optionsStore.optoken = winssd.token || ''

                // Process expiry dates
                let o = []
                if (windata.opt_exp && Array.isArray(windata.opt_exp)) {
                    windata.opt_exp.forEach((i) => {
                        o.push({ ...i })
                    })
                    o.sort((a, b) => new Date(a.exd) - new Date(b.exd))
                    optionsStore.data1 = o
                    optionsStore.lsexd = []
                    optionsStore.tsym = []
                    for (let i = 0; i < o.length; i++) {
                        optionsStore.lsexd.push(o[i].exd)
                        optionsStore.tsym.push(o[i].tsym)
                    }
                    optionsStore.lsexdval = optionsStore.lsexd[0] || ''
                }

                optionsStore.chainCount = '10'

                // Get spot price
                let qu
                if (winqut && winqut.und_exch && winqut.und_tk) {
                    qu = await getQuotesdata(`${winqut.und_exch}|${winqut.und_tk}`)
                } else {
                    qu = winqut
                }

                if (qu) {
                    optionsStore.subscriptionchainStocksList.push({
                        exch: qu.exch,
                        token: qu.token,
                        tsym: qu.tsym,
                    })
                    optionsStore.optionStockSymbolInfo = {
                        exch: qu.exch,
                        token: qu.token,
                        tsym: qu.tsym,
                    }
                    optionsStore.optionStockName = optionsStore.optionStockSymbolInfo.tsym || ''
                    optionsStore.optionStockSpot = qu.lp || 0
                    await optionChainDate()
                }
            } else {
                appStore.showSnackbar(0, 'The symbol has no tradable futures or options.')
            }
        }
    }
}

async function optionChainDate() {
    optionsStore.greekCount = 0
    optionsStore.daydiff = ''
    optionsStore.chainStocksList = []
    optionsStore.upcallSO = []
    optionsStore.dwncallSO = []
    optionsStore.upputSO = []
    optionsStore.dwnputSO = []
    optionsStore.chainSpotPrice = optionsStore.optionStockSpot
    optionsStore.lsexdval = optionsStore.lsexd[optionsStore.lsexdfilter] || ''
    const ccc = ['5', '10', '15', '30', '50']
    optionsStore.chainCount = ccc[optionsStore.ccfilter] || '10'

    let result = optionsStore.data1.find((item) => item.exd === optionsStore.lsexdval)
    if (optionsStore.lsexdval && result) {
        // Calculate days to expiry
        let fromdate = new Date(optionsStore.lsexdval)
        let fromdateof =
            (fromdate.getMonth() > 8 ? fromdate.getMonth() + 1 : '0' + (fromdate.getMonth() + 1)) +
            '/' +
            (fromdate.getDate() > 9 ? fromdate.getDate() : '0' + fromdate.getDate()) +
            '/' +
            fromdate.getFullYear()
        let todate = new Date()
        let todateof =
            (todate.getMonth() > 8 ? todate.getMonth() + 1 : '0' + (todate.getMonth() + 1)) +
            '/' +
            (todate.getDate() > 9 ? todate.getDate() : '0' + todate.getDate()) +
            '/' +
            todate.getFullYear()
        let d1 = new Date(todateof)
        let d2 = new Date(fromdateof)
        let diff = d2.getTime() - d1.getTime()
        let bfodaydiff = diff / (1000 * 60 * 60 * 24)
        optionsStore.daydiff = bfodaydiff + 1

        // Fetch options chain
        const userid = sessionStorage.getItem('userid')
        const usession = sessionStorage.getItem('msession')
        optionsStore.userid = userid || ''
        optionsStore.usession = usession || ''

        const tsymEncoded = result.tsym.includes('&') ? result.tsym.replace('&', '%26') : result.tsym
        const query = `jData={"uid":"${userid}","exch":"${result.exch}","tsym":"${tsymEncoded}","cnt":"${optionsStore.chainCount}","strprc":"${optionsStore.optionStockSpot}"}&jKey=${usession}`

        let ocdata = await getOptionschain(query)

        if (ocdata && ocdata.stat == 'Ok') {
            optionsStore.setOptionChainData(ocdata)
            optionsStore.chainStocksList = ocdata.values || []

            const spot = Number(optionsStore.optionStockSpot)

            // Process option chain data
            // Add complement options (CE/PE pairs)
            optionsStore.chainStocksList.forEach((el) => {
                const complementType = el.optt === 'PE' ? 'CE' : 'PE'
                const exists = optionsStore.chainStocksList.some(
                    (item) => item.optt === complementType && Number(item.strprc) === Number(el.strprc)
                )
                if (!exists) {
                    optionsStore.chainStocksList.push({
                        exch: el.exch,
                        token: '',
                        tsym: '',
                        optt: complementType,
                        pp: el.pp,
                        ls: el.ls,
                        ti: el.ti,
                        strprc: el.strprc,
                    })
                }
            })

            // Sort by strike price
            const myArray = [...optionsStore.chainStocksList].sort((a, b) => Number(a.strprc) - Number(b.strprc))

            // Separate calls and puts, above and below spot
            optionsStore.callsideopc = myArray.filter((item) => {
                if (item.optt === 'CE') {
                    if (spot > Number(item.strprc)) {
                        optionsStore.upcallSO.push({ ...item, p: '' })
                    } else {
                        optionsStore.dwncallSO.push({ ...item, p: '' })
                    }
                    return true
                }
                return false
            })

            optionsStore.putsideopc = myArray.filter((item) => {
                if (item.optt === 'PE') {
                    if (spot > Number(item.strprc)) {
                        optionsStore.upputSO.push({ ...item, p: '' })
                    } else {
                        optionsStore.dwnputSO.push({ ...item, p: '' })
                    }
                    return true
                }
                return false
            })

            // Calculate max OI for progress bars
            if (optionsStore.callsideopc.length > 0) {
                optionsStore.barCallsOi = Math.max(...optionsStore.callsideopc.map((o) => Number(o.oi || 0)))
            }
            if (optionsStore.putsideopc.length > 0) {
                optionsStore.barPutsOi = Math.max(...optionsStore.putsideopc.map((o) => Number(o.oi || 0)))
            }

            // Calculate PCR
            optionsStore.calculatePCR()

            // Scroll to spot price row
            setTimeout(() => {
                scrollToChainSpot()
            }, 10)

            // Subscribe to WebSocket
            optionsStore.subscriptionchainStocksList.push(optionsStore.optionStockSymbolInfo)
            setWebsocket('sub', optionsStore.subscriptionchainStocksList, 'ssd')

            optionsStore.coractdata = true
            optionsStore.coractloader = false
        } else {
            appStore.showSnackbar(0, ocdata?.emsg || 'Failed to fetch options chain')
        }
    }
}

function setWebsocket(flow, data, is) {
    const event = new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'stockSSD' },
    })
    window.dispatchEvent(event)
}

function scrollToChainSpot() {
    // Will be implemented when spot row is added
    nextTick(() => {
        // Implementation in Phase 2
    })
}

function handleOptionSearch() {
    // Will open option search dialog
    window.dispatchEvent(
        new CustomEvent('option-search', {
            detail: optionsStore.optionStockSymbolInfo,
        })
    )
}

function setBaskorder(type) {
    window.dispatchEvent(
        new CustomEvent('bskwatch-event', {
            detail: { type, data: optionsStore.optionStockSymbolInfo },
        })
    )
}

// Event Handlers
function handleSSDEvent(event) {
    const detail = event.detail
    let type, token, exch, tsym

    // Handle both array and object formats
    if (Array.isArray(detail)) {
        ;[type, token, exch, tsym] = detail
    } else if (detail && typeof detail === 'object') {
        type = detail.type
        token = detail.token
        exch = detail.exch
        tsym = detail.tsym
    }

    if (token && exch && tsym) {
        optionsStore.optionStockSymbol = tsym
        setWebsocket('unsub-D', optionsStore.chainStocksList, 'ssd')
        optionsStore.clearOption(true)
        optionsStore.coractloader = true
        optionsStore.coractdata = false
        setWaiting(`${exch}:${tsym}`, 'exit')
    }
}

function handleWebSocketUpdate(event) {
    // Will be implemented in Phase 4
    // For now, just log
    console.log('WebSocket update received:', event.detail)
}

// Lifecycle
onMounted(() => {
    // Initialize user session
    optionsStore.userid = sessionStorage.getItem('userid') || ''
    optionsStore.usession = sessionStorage.getItem('msession') || ''

    // Load symbol from localStorage
    let local = localStorage.getItem('ssdtsym')
    if (local && local.includes(':')) {
        setWaiting(local)
    }

    // Listen for ssd-event
    window.addEventListener('ssd-event', handleSSDEvent)

    // Listen for WebSocket updates
    window.addEventListener('web-scoketConn', handleWebSocketUpdate)

    // Listen for orderbook updates (for position data)
    window.addEventListener('orderbook-update', (event) => {
        const book = event.detail
        if (book == 'port-order') {
            // Will implement setPositionbook in Phase 5
            console.log('Position data updated')
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('ssd-event', handleSSDEvent)
    window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
})
</script>

<style scoped>
.opdatas {
    padding: 0 1px !important;
}

.opstrprcborder {
    border-left: thin solid rgba(0, 0, 0, 0.12);
    border-right: thin solid rgba(0, 0, 0, 0.12);
    padding: 0 1px;
}

.optionheadsty,
.optionhoversty {
    font-size: 12px !important;
    font-weight: 600 !important;
}

.optiondatasty {
    font-size: 12px !important;
    font-weight: 400 !important;
}

.optionchsty {
    font-size: 9px !important;
}

.opdatacalluphov {
    position: relative !important;
}

.no-scroll {
    overflow: hidden;
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

.fs-14 {
    font-size: 14px;
}

.lh-24 {
    line-height: 24px;
}

.fs-12 {
    font-size: 12px;
}

.maintext--text {
    color: var(--maintext) !important;
}

.subtext--text {
    color: var(--subtext) !important;
}

.tvcharts .v-table>.v-table__wrapper>table {
    width: var(--my-simtblwidth-var) !important;
    overflow-x: var(--my-simtblscroll-var);
}
</style>
