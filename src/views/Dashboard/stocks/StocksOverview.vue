<template>
    <div>
        <!-- :loading="mainloader"  -->
        <v-card class="crd-trn ss-cards mb-4 overflow-hidden" width="100%">
            <v-card color="secbg" height="93px" class="elevation-0 rounded-0 pt-2 px-md-0 px-3">
                <v-row no-gutters style="background-color: #F1F3F8 !important;">
                    <v-col cols="12" md="7" class="pb-1 pb-md-2">
                        <div class="d-flex align-center px-0 px-md-4">
                            <!-- Left Avatar Section -->
                            <v-avatar color="mainbg" size="56" class="my-0">
                                <img v-if="imageicon" :src="imageicon" @error="imageLoadError" class="pa-1"
                                    :alt="menudata[0]?.cname || 'stock'" width="56px" />
                                <span v-else class="headline maintext--text font-weight-bold">
                                    {{ menudata[0] ? (menudata[0].cname ? menudata[0].cname :
                                        menudata[0].symname).slice(0, 1) : "" }}
                                </span>
                            </v-avatar>

                            <!-- Title + Chips -->
                            <div class="d-flex flex-column justify-center w-100 ml-3">
                                <!-- Title -->
                                <div :class="menudata[0] ? 'maintext--text' : 'txt-trn'"
                                    style="font-size: 16px !important;"
                                    class="font-weight-bold mb-0 text-capitalize lh-14 pt-3">
                                    {{ menudata[0] ? (menudata[0].cname ? menudata[0].cname : menudata[0].tsym) : "abcd"
                                    }}
                                </div>

                                <!-- Chips Row -->
                                <v-chip-group class="my-0 py-0 d-flex flex-wrap align-center" column>
                                    <v-chip label size="small" color="0" style="color: 0 !important;"
                                        class="font-weight-medium fs-10">
                                        {{ menudata.f && menudata.f.industry ? menudata.f.industry : "Industry" }}
                                    </v-chip>

                                    <v-chip label size="small" color="black" style="color: black !important;"
                                        class="font-weight-medium fs-10">
                                        {{ menudata.f && menudata.f.market_cap_type ? menudata.f.market_cap_type :
                                            "Marketcap type" }}
                                    </v-chip>

                                    <v-chip v-if="menudata[0]?.sucase" label size="small" color="white"
                                        class="font-weight-medium px-2">
                                        <span class="d-flex align-center">
                                            <img width="14px" src="/src/assets/suitcase.svg"
                                                style="margin-right: 4px;" />
                                            <span class="primary--text fs-12 pt-1">{{ menudata[0].sucase }}</span>
                                        </span>
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </div>

                    </v-col>
                    <v-col cols="12" md="5" class="text-md-right text-left pt-0 pt-md-5 pb-2 pl-4 pl-md-3">
                        <p class="mb-0 mr-md-4 subtitle-1 font-weight-bold lh-24">
                            ₹<span :id="`ssdove${stkltp}ltp`"> {{ menudata[0] && menudata[0].ltp ? menudata[0].ltp :
                                "0.00" }}</span>
                            <br class="d-none d-md-block" />
                            <span class="fs-12" :id="`ssdove${stkltp}chpclr`"
                                :style="{ color: menudata[0] ? (menudata[0].ch > 0 ? '#43A833' : menudata[0].ch < 0 ? '#F23645' : '#676767') : '#676767' }"
                                :class="menudata[0] ? (menudata[0].ch > 0 ? 'maingreen--text' : menudata[0].ch < 0 ? 'mainred--text' : 'subtext-text') : 'subtext-text'">
                                <span :id="`ssdove${stkltp}ch`">{{ menudata[0] && menudata[0].ch ? `${menudata[0].ch}` :
                                    "0.00" }}
                                </span>
                                (<span :id="`ssdove${stkltp}chp`">{{ menudata[0] && menudata[0].chp ?
                                    `${menudata[0].chp}` : "0.00"
                                }}</span>%)</span>
                        </p>
                    </v-col>
                </v-row>
            </v-card>
            <div v-if="lwchartis && menudata && menudata[0]" class="px-4">
                <LightweightChart :propstsym="menudata[0] ? menudata[0] : {}" />
            </div>
            <div v-else>
                <v-card height="46vh"></v-card>
            </div>
        </v-card>

        <v-card class="crd-trn ss-cards mb-4 pt-4 overflow-hidden" width="100%">
            <div>
                <v-row class="pt-md-3 pl-md-4 pr-md-7 flex-column-reverse flex-md-row">
                    <v-col cols="12" md="4" class="px-7 pl-md-3 pr-md-5 pb-0">
                        <v-row no-gutters>
                            <v-col cols="6" class="pt-0">
                                <v-list-item class="px-0">
                                    <v-list-item-subtitle
                                        class="font-weight-regular fs-10 subtext--text mb-2 py-0">Market Cap
                                    </v-list-item-subtitle>
                                    <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-0"> {{
                                        menudata.f &&
                                            menudata.f.market_cap ? `${Number(menudata.f.market_cap).toLocaleString()}` :
                                            "0.00"
                                    }}</v-list-item-title>
                                </v-list-item>
                                <v-divider></v-divider>
                            </v-col>
                            <v-col cols="6" class="pt-0">
                                <v-list-item class="px-0">
                                    <v-list-item-subtitle
                                        class="font-weight-regular fs-10 subtext--text mb-2 py-0">Volume
                                    </v-list-item-subtitle>
                                    <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-0"
                                        :id="`ssdove${stkltp}vol`">
                                        {{ menudata[0] && menudata[0].volume ? `${menudata[0].volume.toLocaleString()}`
                                            : "0.00"
                                        }}</v-list-item-title>
                                </v-list-item>
                                <v-divider></v-divider>
                            </v-col>
                            <v-col cols="6">
                                <v-list-item class="px-0">
                                    <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 pb-0">Open
                                    </v-list-item-subtitle>
                                    <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 pb-0">
                                        ₹<span :id="`ssdove${stkltp}op`"> {{ menudata[0] && menudata[0].open_price ?
                                            menudata[0].open_price : "0.00" }}</span></v-list-item-title>
                                </v-list-item>
                                <v-divider></v-divider>
                            </v-col>
                            <v-col cols="6">
                                <v-list-item class="px-0">
                                    <v-list-item-subtitle
                                        class="font-weight-regular fs-10 subtext--text mb-2 pb-0">Close
                                    </v-list-item-subtitle>
                                    <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 pb-0">
                                        ₹<span :id="`ssdove${stkltp}cp`">{{ menudata[0] && menudata[0].close_price ?
                                            menudata[0].close_price : "0.00" }}</span></v-list-item-title>
                                </v-list-item>
                                <v-divider></v-divider>
                            </v-col>

                            <v-col cols="12">
                                <p class="font-weight-regular fs-10 subtext--text mb-0">High - Low</p>
                                <div class="d-flex flex-row mb-1">
                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24">
                                        ₹<span :id="`ssdove${stkltp}hp`"> {{ menudata[0] && menudata[0].high_price ?
                                            menudata[0].high_price
                                            : "0.00" }}</span>
                                    </span>
                                    <v-card
                                        v-if="menudata[0] && menudata[0].ltp > menudata[0].low_price && menudata[0].ltp < menudata[0].high_price"
                                        width="100%" class="crd-trn elevation-0 px-2 rot-180">
                                        <v-slider hide-details thumb-color="maintext" color="subtext"
                                            v-model="menudata[0].ltp" readonly :min="menudata[0].low_price"
                                            :max="menudata[0].high_price" track-color="subtext"></v-slider>
                                    </v-card>
                                    <span v-else class="fs-12 pt-1 lh-24">&nbsp;-&nbsp;</span>
                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24 float-right">
                                        ₹<span :id="`ssdove${stkltp}lp`"> {{ menudata[0] && menudata[0].low_price ?
                                            menudata[0].low_price :
                                            "0.00" }}</span>
                                    </span>
                                </div>
                                <v-divider></v-divider>
                            </v-col>
                            <v-col cols="12">
                                <p class="font-weight-regular fs-10 subtext--text mb-0">52 Weeks high - 52 Weeks low</p>
                                <div class="d-flex flex-row mb-1">
                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24">
                                        {{ menudata[0] && menudata[0].w52h ? `₹${menudata[0].w52h}` : "0.00" }}
                                    </span>
                                    <v-card
                                        v-if="menudata[0] && menudata[0].ltp > menudata[0].w52l && menudata[0].ltp < menudata[0].w52h"
                                        width="100%" class="crd-trn elevation-0 px-2 rot-180">
                                        <v-slider hide-details thumb-color="maintext" color="subtext"
                                            v-model="menudata[0].ltp" readonly :min="menudata[0].w52l"
                                            :max="menudata[0].w52h" track-color="subtext"></v-slider>
                                    </v-card>
                                    <span v-else class="fs-12 pt-1 lh-24">&nbsp;-&nbsp;</span>
                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24 float-right">
                                        {{ menudata[0] && menudata[0].w52l ? `₹${menudata[0].w52l}` : "0.00" }}
                                    </span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" md="8" class="pa-md-0 pt-4 pb-0 px-6 pos-rlt">
                        <v-card class="crd-trn elevation-0 rounded-0 ss-adv-chart mt-auto" v-if="menudata[0]"
                            width="100%">
                            <div class="pt-5">
                                <p class="font-weight-bold fs-16 mb-0">Market Depth</p>
                                <v-list-item class="px-0">
                                    <v-list-item-subtitle
                                        class="font-weight-regular fs-12 subtext--text mb-1 text-uppercase py-0">Buy
                                        order
                                        Qty </v-list-item-subtitle>
                                    <v-list-item-title class="font-weight-medium fs-14 mb-1 py-0">{{ menudata[0].bid_qty
                                        > 0 ?
                                        menudata[0].bid_qty : "0.00" }}%</v-list-item-title>
                                    <template v-slot:append>
                                        <div class="text-right">
                                            <v-list-item-subtitle
                                                class="font-weight-regular fs-12 subtext--text mb-1 text-uppercase py-0">Sell
                                                order
                                                Qty </v-list-item-subtitle>
                                            <v-list-item-title class="font-weight-medium fs-14 mb-1 py-0">{{
                                                menudata[0].ask_qty > 0 ?
                                                    menudata[0].ask_qty : "0.00" }}%</v-list-item-title>
                                        </div>
                                    </template>
                                </v-list-item>
                                <v-progress-linear
                                    v-if="(menudata[0] && menudata[0].bid_qty > 0) || menudata[0].ask_qty > 0"
                                    class="market-depth" color="maingreen"
                                    :model-value="menudata[0].bid_qty"></v-progress-linear>
                                <v-progress-linear v-else color="#D9DBDC" :model-value="100"></v-progress-linear>

                                <v-row no-gutters class="mt-3" v-if="menudata[0] && menudata[0].depth">
                                    <v-col cols="6" class="py-0 pr-4"
                                        style="border-right: thin dashed #d9dbdc !important">
                                        <p class="subtext--text fs-12 font-weight-medium mb-2">Quantity <span
                                                class="float-right maingreen--text">Bid</span></p>
                                        <div class="pos-rlt mb-2 depthrow-b" v-for="(n, k) in menudata[0].depth.bids"
                                            :key="k">
                                            <v-card class="elevation-0 px-2 crd-trn" style="z-index: 1">
                                                <p class="mb-0 subtext--text fs-14 font-weight-medium">
                                                    {{ n.volume.toLocaleString() }} <span class="float-right">{{
                                                        n.price?.toFixed(2) }}</span>
                                                </p>
                                            </v-card>
                                            <v-card class="elevation-0 rounded-0 py-3 pos-abs"
                                                style="left: 0; top: -1px; z-index: 0" color="secgreen"
                                                :width="`${(((n.volume - menudata[0].bitmax) / menudata[0].bitmax) * 100 + 100).toFixed(0)}%`">
                                            </v-card>
                                        </div>
                                    </v-col>
                                    <v-col cols="6" class="py-0 pl-4"
                                        style="border-left: thin dashed #d9dbdc !important">
                                        <p class="subtext--text fs-12 font-weight-medium text-right mb-2"><span
                                                class="float-left mainred--text">Ask</span> Quantity</p>
                                        <div class="pos-rlt mb-2 depthrow-a" v-for="(n, k) in menudata[0].depth.asks"
                                            :key="k">
                                            <v-card class="elevation-0 px-2 crd-trn" style="z-index: 1">
                                                <p class="mb-0 subtext--text fs-14 font-weight-medium text-right">
                                                    <span class="float-left">{{ n.price?.toFixed(2) }}</span> {{
                                                        n.volume.toLocaleString() }}
                                                </p>
                                            </v-card>
                                            <v-card class="elevation-0 rounded-0 py-3 pos-abs"
                                                style="right: 0; top: -1px; z-index: 0" color="secred"
                                                :width="`${(((n.volume - menudata[0].askmax) / menudata[0].askmax) * 100 + 100).toFixed(0)}%`">
                                            </v-card>
                                        </div>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-card>
                        <v-card
                            v-if="menudata[0] && menudata[0].instname && (menudata[0].instname == 'UNDIND' || menudata[0].instname == 'COM')"
                            class="pos-abs md-glasscard elevation-0" height="270px" width="100%">
                            <div class="pos-cent">
                                <p class="mb-0 fs-14 maintext--text font-weight-bold text-center">
                                    Non-tradable symbol, <br />
                                    no market depth data
                                </p>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row no-gutters class="px-4 pt-0">
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">Avg price
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}ap`">{{ menudata[0] && menudata[0].ap ? menudata[0].ap :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">OI
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}oi`">{{ menudata[0] && menudata[0].oi ? menudata[0].oi :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">Upper
                                circuit level
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}uc`">{{ menudata[0] && menudata[0].uc ? menudata[0].uc :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">Lower
                                circuit level
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}lc`">{{ menudata[0] && menudata[0].lc ? menudata[0].lc :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">Last trade
                                qty
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}ltq`">{{ menudata[0] && menudata[0].ltq ? menudata[0].ltq :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                    <v-col cols="2">
                        <v-list-item class="px-0">
                            <v-list-item-subtitle class="font-weight-regular fs-10 subtext--text mb-2 py-1">Last trade
                                time
                            </v-list-item-subtitle>
                            <v-list-item-title class="maintext--text font-weight-medium fs-12 mb-1 py-1">
                                <span :id="`ssdove${stkltp}ltt`">{{ menudata[0] && menudata[0].ltt ? menudata[0].ltt :
                                    "0.00"
                                }}</span></v-list-item-title>
                        </v-list-item>
                        <v-divider></v-divider>
                    </v-col>
                </v-row>
            </div>
        </v-card>

        <v-card class="crd-trn ss-cards mb-2 overflow-hidden" width="100%">
            <div class="px-4 pt-4" v-if="stockreturns">
                <p class="font-weight-bold subtitle-2 mb-1">Returns</p>
                <v-row no-gutters class="mt-0 pb-6">
                    <v-col cols="6" md="2" v-for="(r, l) in stockreturns ? stockreturns : 6" :key="l" class="pt-0">
                        <v-card v-if="l == 0" :id="`ssdove${stkltp}rbg`"
                            :color="menudata[0].ch > 0 ? 'secgreen' : menudata[0].ch < 0 ? 'secred' : 'secbg'"
                            class="rounded-lg px-3 py-2 elevation-0 brd-1-solid-ccc text-center" width="100%">
                            <p :id="`ssdove${stkltp}rchpclr`"
                                :class="menudata[0].ch > 0 ? 'maingreen--text' : menudata[0].ch < 0 ? 'mainred--text' : 'subtext--text'"
                                class="fs-18 font-weight-bold mb-2">
                                <span :id="`ssdove${stkltp}rchp`">{{ computeReturnPercent(r.returns) }}</span>%
                            </p>
                            <p class="mb-0 fs-10 text-uppercase font-weight-medium">
                                {{ r.type ? r.type : "---" }}
                            </p>
                        </v-card>
                        <v-card v-else
                            :color="((menudata[0].ltp - r.returns) / r.returns) * 100 > 0 ? 'secgreen' : ((menudata[0].ltp - r.returns) / r.returns) * 100 < 0 ? 'secred' : 'secbg'"
                            class="rounded-lg px-3 py-2 elevation-0 brd-1-solid-ccc text-center" width="100%">
                            <p :class="Number(computeReturnPercent(r.returns)) > 0 ? 'maingreen--text' : Number(computeReturnPercent(r.returns)) < 0 ? 'mainred--text' : 'subtext--text'"
                                class="fs-18 font-weight-bold mb-2">
                                {{ computeReturnPercent(r.returns) }}%
                            </p>
                            <p class="mb-0 fs-10 text-uppercase font-weight-medium">
                                {{ r.type ? r.type : "---" }}
                            </p>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
            <div class="px-4 pb-4" v-if="menudata.pivot && menudata.pivot.length > 0">
                <p class="font-weight-bold subtitle-2 mb-1">Pivot levels</p>
                <v-row no-gutters class="px-2">
                    <v-col cols="2" class="px-0" v-for="(p, l) in menudata.pivot" :key="l">
                        <v-card width="100%" class="crd-trn elevation-0 px-1">
                            <p class="fs-14 mb-0 font-weight-medium pos-rlt" :class="l <= 2 ? '' : 'text-right'">{{
                                p.name }}
                                <span v-if="l == 2" class="pos-abs" style="right: -10px">P</span>
                            </p>
                            <v-card width="100%" :color="p.color" height="8px" class="elevation-0 pos-rlt">
                                <v-icon
                                    v-if="menudata.pivot[l - 1] && menudata[0].ltp <= p.value && menudata[0].ltp >= menudata.pivot[l - 1].value"
                                    class="pos-abs" style="top: -4px"
                                    :style="`left: ${Math.trunc(((p.value - menudata[0].ltp) / p.value) * 100)}%;`"
                                    color="maintext" size="16">mdi-checkbox-blank-circle</v-icon>
                            </v-card>
                            <p class="fs-12 mb-0 font-weight-medium pos-rlt" :class="l <= 2 ? '' : 'text-right'">
                                {{ Number(p.value) ? Number(p.value).toFixed(2) : "" }} <span v-if="l == 2"
                                    class="pos-abs" style="right: -32px">{{ Number(menudata.pivotpoint) ?
                                        Number(menudata.pivotpoint).toFixed(2)
                                        : ""
                                    }}</span>
                            </p>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </v-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { default as apiurl } from '@/apiurl'
import LightweightChart from '@/components/LightweightChart.vue'
import { getMHoldingdata } from '@/components/mixins/getAPIdata'

// Reactive data
const mainloader = ref(true)
const menudata = ref([])
const imageicon = ref(null)
const stockreturns = ref([])
const stkltp = ref(0)
const lwchartis = ref(false)
// Simple token→price cache in localStorage to avoid showing zeros on first paint
const getPriceCache = () => {
    try { return JSON.parse(localStorage.getItem('price_cache') || '{}') } catch { return {} }
}
const setPriceCache = (cache) => {
    try { localStorage.setItem('price_cache', JSON.stringify(cache)) } catch { }
}

// Helpers
const computeReturnPercent = (baseValue) => {
    const ltp = Number(menudata.value && menudata.value[0] && menudata.value[0].ltp ? menudata.value[0].ltp : 0)
    const base = Number(baseValue)
    if (!ltp || !base || base <= 0) return '0.00'
    const pct = ((ltp - base) / base) * 100
    if (!isFinite(pct)) return '0.00'
    return pct.toFixed(2)
}

// Methods
const setWaiting = (token, exch, tsym) => {
    if (window.ssddetail && window.ssddetail[0] && window.ssddetail[0].token == token) {
        setSingleData(token, exch, tsym)
    } else {
        setTimeout(() => {
            setWaiting(token, exch, tsym)
        }, 100)
    }
}

const imageLoadError = () => {
    imageicon.value = null
}

const setSingleData = async (token, exch, tsym) => {
    let windata = window.ssddetail
    imageicon.value = `${apiurl.imgicon}${tsym.split("-")[0]}.png`

    menudata.value = []
    var data = windata[1] ? windata[1] : ""
    mainloader.value = false
    menudata.value.push(windata[0])

    if (data && data.fundamental && data.fundamental[0]) {
        menudata.value["f"] = data.fundamental[0]
    } else {
        menudata.value["f"] = []
    }

    getReturns(token)
    setWebsocket("sub", [{ token: token, exch: exch, tsym: tsym }], "ssd")
    stkltp.value = menudata.value[0] && menudata.value[0].token ? menudata.value[0].token : 0
    setHoldbadge(token)
    // Initialize UI values immediately from existing quote to avoid zeros until WS arrives
    initializeOverviewFromQuote(menudata.value[0])

    // If still zero, hydrate from cache
    const cache = getPriceCache()
    if (menudata.value && menudata.value[0] && token) {
        const c = cache[token]
        if (c) {
            const apply = (k) => {
                if (!menudata.value[0][k] || Number(menudata.value[0][k]) === 0) menudata.value[0][k] = c[k]
            }
                ;['ltp', 'ch', 'chp', 'high_price', 'low_price', 'open_price', 'close_price'].forEach(apply)
            const setText = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.innerHTML = val }
            setText(`ssdove${token}ltp`, menudata.value[0].ltp)
            setText(`ssdove${token}ch`, menudata.value[0].ch)
            setText(`ssdove${token}chp`, menudata.value[0].chp)
        }
    }
}

const getReturns = (token) => {
    var windata = window.ssdreqdata?.data
    if (windata && windata[token] && windata[token].t) {
        stockreturns.value = [
            { type: "1 day", returns: menudata.value[0]?.close_price || 0 },
            { type: "1 week", returns: Number(windata[token].t.wk1_c) ? Number(windata[token].t.wk1_c) : 0 },
            { type: "2 week", returns: Number(windata[token].t.wk2_c) ? Number(windata[token].t.wk2_c) : 0 },
            { type: "1 month", returns: Number(windata[token].t.mnth1_c) ? Number(windata[token].t.mnth1_c) : 0 },
            { type: "3 month", returns: Number(windata[token].t.mnth3_c) ? Number(windata[token].t.mnth3_c) : 0 },
            { type: "1 year", returns: Number(windata[token].t.wk52_c) ? Number(windata[token].t.wk52_c) : 0 },
        ]
        menudata.value["pivot"] =
            Number(windata[token].t.sup_3) > 0 && Number(windata[token].t.sup_2) > 0 && Number(windata[token].t.sup_1) > 0 && Number(windata[token].t.res_1) > 0 && Number(windata[token].t.res_2) > 0 && Number(windata[token].t.res_3) > 0
                ? [
                    { color: "#FF1717", name: "S3", value: Number(windata[token].t.sup_3) ? Number(windata[token].t.sup_3) : 0 },
                    { color: "#D34645", name: "S2", value: Number(windata[token].t.sup_2) ? Number(windata[token].t.sup_2) : 0 },
                    { color: "#E38988", name: "S1", value: Number(windata[token].t.sup_1) ? Number(windata[token].t.sup_1) : 0 },
                    { color: "#84C89D", name: "R1", value: Number(windata[token].t.res_1) ? Number(windata[token].t.res_1) : 0 },
                    { color: "#3FA965", name: "R2", value: Number(windata[token].t.res_2) ? Number(windata[token].t.res_2) : 0 },
                    { color: "#43A833", name: "R3", value: Number(windata[token].t.res_3) ? Number(windata[token].t.res_3) : 0 },
                ]
                : []
        menudata.value["pivotpoint"] = Number(windata[token].t.pivot_point) ? Number(windata[token].t.pivot_point) : 0
    } else {
        stockreturns.value = []
        setTimeout(() => {
            getReturns(token)
        }, 100)
    }
}

const clearData = () => {
    imageicon.value = null
    menudata.value = []
    stockreturns.value = []
}

// Initialize overview UI values from an initial quote payload
const initializeOverviewFromQuote = (q) => {
    if (!q) return
    const token = q.token
    const n2 = (v) => (v || v === 0) ? Number(v).toFixed(2) : '0.00'
    const n0 = (v) => (v || v === 0) ? Number(v) : 0

    menudata.value[0].ltp = n2(q.lp || q.ltp)
    menudata.value[0].ch = n2(q.ch)
    menudata.value[0].chp = n2(q.chp)
    menudata.value[0].high_price = n2(q.high_price || q.high)
    menudata.value[0].low_price = n2(q.low_price || q.low)
    menudata.value[0].open_price = n2(q.open_price || q.open)
    menudata.value[0].close_price = n2(q.prev_close_price || q.close)
    menudata.value[0].vol = n0(q.volume || q.vol)
    menudata.value[0].ap = n2(q.ap)
    menudata.value[0].oi = n0(q.oi)
    menudata.value[0].uc = n2(q.uc)
    menudata.value[0].lc = n2(q.lc)
    menudata.value[0].ltt = q.ltt || '00:00:00'
    menudata.value[0].ltq = n0(q.ltq)

    const setText = (id, val) => {
        const el = document.getElementById(id)
        if (el) el.innerHTML = val
    }
    if (token) {
        setText(`ssdove${token}ltp`, menudata.value[0].ltp)
        setText(`ssdove${token}ch`, menudata.value[0].ch)
        setText(`ssdove${token}chp`, menudata.value[0].chp)
        setText(`ssdove${token}hp`, menudata.value[0].high_price)
        setText(`ssdove${token}lp`, menudata.value[0].low_price)
        setText(`ssdove${token}op`, menudata.value[0].open_price)
        setText(`ssdove${token}cp`, menudata.value[0].close_price)
        setText(`ssdove${token}vol`, menudata.value[0].vol)
        setText(`ssdove${token}ap`, menudata.value[0].ap)
        setText(`ssdove${token}oi`, menudata.value[0].oi)
        setText(`ssdove${token}uc`, menudata.value[0].uc)
        setText(`ssdove${token}lc`, menudata.value[0].lc)
        setText(`ssdove${token}ltt`, menudata.value[0].ltt)
        setText(`ssdove${token}ltq`, menudata.value[0].ltq)
    }
}

const setWebsocket = (flow, data, is) => {
    // Use Custom Events instead of EventBus
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'stockSSD' }
    }))
}

const setHoldbadge = (tk) => {
    const data = getMHoldingdata()
    if (!data?.length) return null
    const ct = data.find(x => x.token == tk)
    if (ct?.netqty > 0) {
        menudata.value[0]['sucase'] = ct.netqty
    }
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (!token || !menudata.value[0] || menudata.value[0].token != token) return

    const newLpVal = Number(data.lp || data.ltp || 0)
    // Do not overwrite with zero/invalid; keep last known value so it matches Watchlist
    if (!isNaN(newLpVal) && newLpVal > 0) {
        menudata.value[0]["ltp"] = newLpVal.toFixed(2)
    }
    menudata.value[0].lp = menudata.value[0]["ltp"]

    const chIn = Number(data.ch || data.c)
    if (!isNaN(chIn)) menudata.value[0]["ch"] = chIn.toFixed(2)
    const chpIn = Number(data.chp)
    if (!isNaN(chpIn)) menudata.value[0]["chp"] = chpIn.toFixed(2)
    const hIn = Number(data.high_price || data.high)
    if (!isNaN(hIn)) menudata.value[0]["high_price"] = hIn.toFixed(2)
    const lIn = Number(data.low_price || data.low)
    if (!isNaN(lIn)) menudata.value[0]["low_price"] = lIn.toFixed(2)
    const w52hIn = Number(data["w52h"])
    if (!isNaN(w52hIn)) menudata.value[0]["w52h"] = w52hIn.toFixed(2)
    const w52lIn = Number(data["w52l"])
    if (!isNaN(w52lIn)) menudata.value[0]["w52l"] = w52lIn.toFixed(2)
    const oIn = Number(data.open_price || data.open)
    if (!isNaN(oIn)) menudata.value[0]["open_price"] = oIn.toFixed(2)
    const cIn = Number(data.prev_close_price || data.close)
    if (!isNaN(cIn)) menudata.value[0]["close_price"] = cIn
    const volIn = Number(data.socketVolume || data.volume || data.vol)
    if (!isNaN(volIn)) menudata.value[0]["vol"] = volIn
    const apIn = Number(data.ap)
    if (!isNaN(apIn)) menudata.value[0]["ap"] = apIn.toFixed(2)

    const oiIn = Number(data.oi)
    if (!isNaN(oiIn)) menudata.value[0]["oi"] = oiIn
    const ucIn = Number(data.uc)
    if (!isNaN(ucIn)) menudata.value[0]["uc"] = ucIn
    const lcIn = Number(data.lc)
    if (!isNaN(lcIn)) menudata.value[0]["lc"] = lcIn
    if (data.ltt) menudata.value[0]["ltt"] = data.ltt
    const ltqIn = Number(data.ltq)
    if (!isNaN(ltqIn)) menudata.value[0]["ltq"] = ltqIn

    if (data.tbq && data.tsq) {
        menudata.value[0]["bid_qty"] = data.tbq > 0 || data.tsq > 0 ? (((data.tbq - (data.tbq + data.tsq)) / (data.tbq + data.tsq)) * 100 + 100).toFixed(2) : 0
        menudata.value[0]["ask_qty"] = data.tbq > 0 || data.tsq > 0 ? Math.abs(100 - menudata.value[0].bid_qty).toFixed(2) : 0
    }
    if (data.depth) {
        menudata.value[0]["depth"] = data.depth
        if (menudata.value[0].depth.bids && menudata.value[0].depth.bids.length > 0) {
            menudata.value[0]["bitmax"] = Math.max(...menudata.value[0].depth.bids.map((o) => o.volume))
        }
        if (menudata.value[0].depth.asks && menudata.value[0].depth.asks.length > 0) {
            menudata.value[0]["askmax"] = Math.max(...menudata.value[0].depth.asks.map((o) => o.volume))
        }
    }

    // Save to cache for next mount/fallback
    const cache = getPriceCache()
    cache[token] = {
        ltp: menudata.value[0].ltp,
        ch: menudata.value[0].ch,
        chp: menudata.value[0].chp,
        high_price: menudata.value[0].high_price,
        low_price: menudata.value[0].low_price,
        open_price: menudata.value[0].open_price,
        close_price: menudata.value[0].close_price
    }
    setPriceCache(cache)

    // Direct DOM updates for real-time display
    let tag = document.getElementById(`ssdove${token}ltp`)
    if (tag) {
        if (menudata.value[0].ltp && Number(menudata.value[0].ltp) > 0) {
            tag.innerHTML = menudata.value[0].ltp
        }
        const chTag = document.getElementById(`ssdove${token}ch`)
        const chpTag = document.getElementById(`ssdove${token}chp`)
        const chpclrTag = document.getElementById(`ssdove${token}chpclr`)
        if (chTag && menudata.value[0].ch !== undefined) chTag.innerHTML = menudata.value[0].ch
        if (chpTag && menudata.value[0].chp !== undefined) chpTag.innerHTML = menudata.value[0].chp
        if (chpclrTag) {
            const ch = parseFloat(menudata.value[0].ch) || 0
            chpclrTag.className = ch > 0
                ? 'fs-12 maingreen--text'
                : ch < 0
                    ? 'fs-12 mainred--text'
                    : 'fs-12 subtext-text'
        }
        const oiTag = document.getElementById(`ssdove${token}oi`)
        const ucTag = document.getElementById(`ssdove${token}uc`)
        const lcTag = document.getElementById(`ssdove${token}lc`)
        const lttTag = document.getElementById(`ssdove${token}ltt`)
        const ltqTag = document.getElementById(`ssdove${token}ltq`)
        const volTag = document.getElementById(`ssdove${token}vol`)
        const apTag = document.getElementById(`ssdove${token}ap`)
        const hpTag = document.getElementById(`ssdove${token}hp`)
        const lpTag = document.getElementById(`ssdove${token}lp`)
        const opTag = document.getElementById(`ssdove${token}op`)
        const cpTag = document.getElementById(`ssdove${token}cp`)
        if (oiTag) oiTag.innerHTML = menudata.value[0].oi
        if (ucTag) ucTag.innerHTML = menudata.value[0].uc
        if (lcTag) lcTag.innerHTML = menudata.value[0].lc
        if (lttTag) lttTag.innerHTML = menudata.value[0].ltt
        if (ltqTag) ltqTag.innerHTML = menudata.value[0].ltq
        if (volTag) volTag.innerHTML = menudata.value[0].vol
        if (apTag) apTag.innerHTML = menudata.value[0].ap
        if (hpTag) hpTag.innerHTML = menudata.value[0].high_price
        if (lpTag) lpTag.innerHTML = menudata.value[0].low_price
        if (opTag) opTag.innerHTML = menudata.value[0].open_price
        if (cpTag) cpTag.innerHTML = menudata.value[0].close_price
    }

    let tago = document.getElementById(`ssdove${token}rbg`)
    if (tago && stockreturns.value.length > 0) {
        const rchpTag = document.getElementById(`ssdove${token}rchp`)
        const rchpclrTag = document.getElementById(`ssdove${token}rchpclr`)
        if (rchpTag && stockreturns.value[0]) {
            rchpTag.innerHTML = stockreturns.value[0].returns ? (((menudata.value[0].ltp - stockreturns.value[0].returns) / stockreturns.value[0].returns) * 100).toFixed(2) : "0.00"
        }
        if (rchpclrTag) {
            const ch = parseFloat(menudata.value[0].ch) || 0
            rchpclrTag.className = ch > 0
                ? 'fs-18 font-weight-bold mb-2 maingreen--text'
                : ch < 0
                    ? 'fs-18 font-weight-bold mb-2 mainred--text'
                    : 'fs-18 font-weight-bold mb-2 subtext--text'
        }
        const ch = parseFloat(menudata.value[0].ch) || 0
        tago.style.backgroundColor = ch > 0 ? "#FBFFFA" : ch < 0 ? "#FFFCFB" : "#FAFAFA"
    }
}

// Event handlers
const handleSSDEvent = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 4) {
        const [type, token, exch, tsym] = detail
        if (menudata.value[0]) {
            setWebsocket("unsub-D", [{ token: menudata.value[0].token, exch: menudata.value[0].exch, tsym: menudata.value[0].tsym }], "ssd")
        }
        mainloader.value = true
        clearData()
        setWaiting(token, exch, tsym)
    }
}

const handleLWCEvent = (event) => {
    const { detail } = event
    lwchartis.value = detail
}

const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail
        if (page == "stockSSD") {
            optionChainDataParse(data)
        }
    } else if (detail && typeof detail === 'object' && (detail.page === 'stockSSD' || detail.token || detail.tk)) {
        optionChainDataParse(detail)
    }
}

// Lifecycle hooks
onMounted(() => {
    let local = localStorage.getItem("ssdtsym")
    if (local && local.includes(":")) {
        mainloader.value = true
        clearData()
        setWaiting(localStorage.getItem("ssdtoken"), local.split(":")[0], local.split(":")[1])
    }

    // Listen for Custom Events
    window.addEventListener('ssd-event', handleSSDEvent)
    window.addEventListener('lwc-event', handleLWCEvent)
    window.addEventListener('web-scoketConn', handleWebSocketConnection)
})

onBeforeUnmount(() => {
    window.removeEventListener('lwc-event', handleLWCEvent)
    window.removeEventListener('ssd-event', handleSSDEvent)
    window.removeEventListener('web-scoketConn', handleWebSocketConnection)
})
</script>

<style>
.depthrow-b,
.depthrow-a {
    border: 1px solid transparent !important;
    cursor: pointer !important;
    border-radius: 3px !important;
}

.depthrow-b:hover {
    border: 1px solid #43A833 !important;
}

.depthrow-a:hover {
    border: 1px solid #F23645 !important;
}

.pivot .v-slider--horizontal .v-slider__track-container {
    height: 8px !important;
}

.pivot .v-slider--horizontal {
    min-height: 16px !important;
}
</style>
