<template>
    <div>
        <div v-if="uid">
            <StatBoard />
        </div>
        <!-- <img src="@/assets/stat.svg" width="100%" alt=""> -->
        <v-card v-else class="elevation-0 mb-6 mb-sm-16 px-6 py-4 pa-sm-6 rounded-lg" color="#51FFB6">
            <v-row no-glutters>
                <v-col cols="3">
                    <p class="fs-36 font-weight-bold black--text lh-40 mb-0 d-none d-sm-flex">
                        Simple. <br />
                        Insightful. <br />
                        Incremental.
                    </p>
                    <p class="fs-32 font-weight-bold black--text lh-28 mb-0 d-sm-none">
                        Simple. <br />
                        Insightful. <br />
                        Incremental.
                    </p>

                </v-col>
                <v-col cols="8" class="pos-rlt mr-4 ml-auto d-none d-sm-flex">
                    <div style="width: 100%;" no-glutters class="pos-abs d-inline-flex flex-row-reverse">
                        <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl">
                            <img src="@/assets/stocks/main-card-3.svg" class="px-2" alt="main-card-3" width="100%" />
                            <p class="fs-16 font-weight-bold lh-16 px-4 mb-0">
                                Discover IPO <br />
                                early winners.
                            </p>
                        </v-card>

                        <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl">
                            <img src="@/assets/stocks/main-card-2.svg" class="px-2" alt="main-card-2" width="100%" />
                            <p class="fs-16 font-weight-bold lh-16 px-4 mb-0">
                                Invest safely <br />
                                in bonds.
                            </p>
                        </v-card>
                        <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl">
                            <img src="@/assets/stocks/main-card-1.svg" class="px-2" alt="main-card-1" width="100%" />
                            <p class="fs-16 font-weight-bold lh-16 px-4 mb-0">
                                Buy stocks <br />
                                with a click.
                            </p>
                        </v-card>
                        <!-- </v-col> -->
                    </div>
                </v-col>
            </v-row>
        </v-card>
        <v-toolbar class="tool-sty elevation-0 crd-trn" dense>
            <img width="32px" src="@/assets/stocks/ind.svg" alt="ind" class="mr-1 pa-1" />
            <p class="title font-weight-bold mb-0 mr-3">Top indices</p>
            <v-spacer></v-spacer>
            <v-btn @click="scrollToo('indices', -600)" class="mr-2" icon small outlined> <v-icon
                    size="24">mdi-chevron-left</v-icon> </v-btn>
            <v-btn @click="scrollFrom('indices', 600)" class="mr-1" icon small outlined> <v-icon
                    size="24">mdi-chevron-right</v-icon> </v-btn>
        </v-toolbar>
        <v-card id="indices" v-dragscroll.x class="crd-trn d-inline-flex overflow-x-auto elevation-0 no-scroll mb-2"
            width="100%">
            <v-card v-for="(s, l) in pdmwdata" :key="l" @click="setSSDtab('Details', s.token, s.exch, s.tsym)"
                class="px-3 py-2 crd-trn pos-rlt table-row" :class="l != pdmwdata.length - 1 ? 'mr-4' : ''"
                min-width="160px" outlined>
                <div v-if="uid" @click.stop class="pos-abs table-hov" style="bottom: 32px; right: 4px;">
                    <v-btn :disabled="!s.too"
                        @click="$router.push({ name: 'stocks advance decline', params: { abc: s.too } })"
                        min-width="20px" color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                        x-small>
                        <v-icon size="18" color="maintext">mdi-format-line-weight</v-icon>
                    </v-btn>
                </div>
                <div v-if="uid" @click.stop class="pos-abs table-hov" style="bottom: 8px; right: 4px;">
                    <v-btn @click="setSSDtab('option', s.token, s.exch, s.tsym)" min-width="20px" color="mainbg"
                        class="px-0 font-weight-bold white--text elevation-0 mr-1" x-small>
                        <v-icon size="18" color="maintext">mdi-link-variant</v-icon>
                    </v-btn>
                    <v-btn @click="setSSDtab('chart', s.token, s.exch, s.tsym)" min-width="20px" color="mainbg"
                        class="px-0 font-weight-bold white--text elevation-0 mr-1" x-small>
                        <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                    </v-btn>
                </div>

                <p class="subtitle-2 font-weight-bold mb-2 ws-p" v-text="s.tsym ? s.tsym : ''"></p>
                <v-card class="pt-02 mb-3 elevation-0 rounded-pill" width="30%" color="maintext"></v-card>
                <p class="fs-14 txt-000 font-weight-medium mb-0">
                    ₹<span :id="`ssdpd${s.token}ltp`">{{ s.ltp ? s.ltp : "0.00" }}</span>
                </p>
                <p class="fs-12 font-weight-medium mb-0" :id="`ssdpd${s.token}chpclr`"
                    :class="s.chp > 0 ? 'maingreen--text' : s.chp < 0 ? 'mainred--text' : 'subtext--text'">
                    <span :id="`ssdpd${s.token}ch`">{{ s.ch ? s.ch : "0.00" }}</span>
                    <span :id="`ssdpd${s.token}chp`"> ({{ s.chp ? s.chp : "0.00" }}%)</span>
                </p>
            </v-card>
        </v-card>
        <v-btn to="/stocks/allindices" text variant="flat" class="text-none px-0 primary--text mb-6">See all
            indices</v-btn>

        <v-row no-glutters class="mb-4">
            <v-col cols="12" sm="6">
                <v-row no-glutters>
                    <template v-for="(l, v, p) in advdecitems">
                        <v-col @click="advdectab = (p === 0 ? 'sectors' : 'thematic')" cols="6" v-if="p < 2" :key="p"
                            class="text-center cursor-p">
                            <div class="d-inline-flex align-center">
                                <img width="28px" :src="advIcons[p]" :alt="advLabels[p]" class="mr-1" />
                                <p class="subtitle-1 font-weight-bold mb-0">{{ v }}</p>
                            </div>
                            <v-card class="elevation-0 mx-auto"
                                :color="(advdectab === (p === 0 ? 'sectors' : 'thematic')) ? 'primary' : 'transparent'"
                                height="2px" style="max-width: 120px;"></v-card>
                        </v-col>
                    </template>
                </v-row>
                <v-divider class="mb-2"></v-divider>

                <!-- Tabs content replicated using explicit state like notifications page -->
                <div v-if="advdectab === 'sectors'">
                    <v-card v-for="(i, o) in advdecitems.Sectors.slice(0, 6)" :key="o"
                        @click="setSSDtab('Details', i.data.token, 'NSE', advdecitems.wsdata[i.data.token].tsym)"
                        width="100%" class="elevation-0 pa-3 rounded-lg" :class="o < 5 ? 'mb-' : ''" height=""
                        color="secbg">
                        <v-row no-glutters>
                            <v-col cols="5" sm="4" class="pr-0">
                                <p class="mb-0 subtitle-2 font-weight-medium lh-16">
                                    {{ i.title }} <span class="caption subtext-text font-weight-bold">({{ i.data
                                        && i.data.sum ?
                                        i.data.sum :
                                        ".." }})</span>
                                </p>
                                <p class="fs-14 maintext--text font-weight-medium mb-0 lh-16">
                                    <span
                                        v-if="advdecitems.wsdata && i.data && i.data.token && advdecitems.wsdata[i.data.token]">
                                        <span :id="`ssdad${i.data.token}ltp`">₹{{ advdecitems.wsdata && i.data
                                            && i.data.token
                                            &&
                                            advdecitems.wsdata[i.data.token] &&
                                            advdecitems.wsdata[i.data.token].ltp ?
                                            `${advdecitems.wsdata[i.data.token].ltp}` : "" }}</span> &nbsp;<span
                                            class="fs-12"
                                            :class="advdecitems.wsdata[i.data.token] ? (advdecitems.wsdata[i.data.token].chp > 0 ? 'maingreen--text' : advdecitems.wsdata[i.data.token].chp < 0 ? 'mainred--text' : 'subtext--text') : 'subtext--text'"
                                            :id="`ssdad${i.data.token}chpclr`"><span :id="`ssdad${i.data.token}ch`">{{
                                                advdecitems.wsdata[i.data.token] ?
                                                    `${advdecitems.wsdata[i.data.token].ch}` :
                                                    "0.00"
                                            }}</span>
                                            <span :id="`ssdad${i.data.token}chp`"> ({{
                                                advdecitems.wsdata[i.data.token] &&
                                                    advdecitems.wsdata[i.data.token].chp ?
                                                    `${Number(advdecitems.wsdata[i.data.token].chp).toFixed(2)}`
                                                    : "0.00" }}%)</span></span>
                                    </span>
                                    <span v-else class="fs-12">0.00 <span class="fs-9"> 0.00
                                            (0.00%)</span></span>
                                </p>
                            </v-col>
                            <v-col cols="7" sm="8" v-if="i.data">
                                <v-card color="transparent" width="100%" class="elevation-0 d-inline-flex"
                                    style="height: 8px;">
                                    <v-card class="elevation-0 rounded-lg crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adp || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="maingreen"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                    <v-card v-if="i.data.Negative > 0 || i.data.Neutral > 0"
                                        class="elevation-0 rounded-lg px-1 crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adn || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="#D9D9D9"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                    <v-card class="elevation-0 rounded-lg crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adm || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="mainred"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                </v-card>
                                <v-row no-glutters>
                                    <v-col cols="6" class="pt-1">
                                        <p v-if="i.data.Positive > 0" class="mb-0 lh-16 mt-2 subtitle-2">
                                            <v-icon color="maingreen" size="18">mdi-arrow-top-right</v-icon>
                                            {{ i.data.Positive }}
                                        </p>
                                    </v-col>
                                    <v-col cols="6" class="pt-1">
                                        <p v-if="i.data.Negative > 0" class="mb-0 lh-16 mt-2 subtitle-2 text-right">
                                            {{ i.data.Negative }}
                                            <v-icon color="mainred" size="18">mdi-arrow-bottom-right</v-icon>
                                        </p>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="8" v-else>
                                <v-skeleton-loader height="8px" width="100%" type="card"></v-skeleton-loader>
                            </v-col>
                        </v-row>
                    </v-card>
                </div>
                <div v-else-if="advdectab === 'thematic'">
                    <v-card v-for="(i, o) in advdecitems.Thematic.slice(0, 6)" :key="o"
                        @click="setSSDtab('Details', i.data.token, 'NSE', advdecitems.wsdata[i.data.token].tsym)"
                        width="100%" class="elevation-0 pa-3 rounded-lg" :class="o < 5 ? 'mb-' : ''" height=""
                        color="secbg">
                        <v-row no-glutters>
                            <!-- duplicate same inner layout -->
                            <v-col cols="5" sm="4" class="pr-0">
                                <p class="mb-0 subtitle-2 font-weight-medium lh-16">
                                    {{ i.title }} <span class="caption subtext-text font-weight-bold">({{ i.data &&
                                        i.data.sum ?
                                        i.data.sum : ".." }})</span>
                                </p>
                                <p class="fs-14 maintext--text font-weight-medium mb-0 lh-16">
                                    <span
                                        v-if="advdecitems.wsdata && i.data && i.data.token && advdecitems.wsdata[i.data.token]">
                                        <span :id="`ssdad${i.data.token}ltp`">₹{{ advdecitems.wsdata && i.data &&
                                            i.data.token &&
                                            advdecitems.wsdata[i.data.token] && advdecitems.wsdata[i.data.token].ltp ?
                                            `${advdecitems.wsdata[i.data.token].ltp}` : "" }}</span> &nbsp;<span
                                            class="fs-12"
                                            :class="advdecitems.wsdata[i.data.token] ? (advdecitems.wsdata[i.data.token].chp > 0 ? 'maingreen--text' : advdecitems.wsdata[i.data.token].chp < 0 ? 'mainred--text' : 'subtext--text') : 'subtext--text'"
                                            :id="`ssdad${i.data.token}chpclr`"><span :id="`ssdad${i.data.token}ch`">{{
                                                advdecitems.wsdata[i.data.token] ?
                                                    `${advdecitems.wsdata[i.data.token].ch}` : "0.00"
                                            }}</span>
                                            <span :id="`ssdad${i.data.token}chp`"> ({{ advdecitems.wsdata[i.data.token]
                                                &&
                                                advdecitems.wsdata[i.data.token].chp ?
                                                `${Number(advdecitems.wsdata[i.data.token].chp).toFixed(2)}` : "0.00"
                                            }}%)</span></span>
                                    </span>
                                    <span v-else class="fs-12">0.00 <span class="fs-9"> 0.00 (0.00%)</span></span>
                                </p>
                            </v-col>
                            <v-col cols="7" sm="8" v-if="i.data">
                                <v-card color="transparent" width="100%" class="elevation-0 d-inline-flex"
                                    style="height: 8px;">
                                    <v-card class="elevation-0 rounded-lg crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adp || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="maingreen"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                    <v-card v-if="i.data.Negative > 0 || i.data.Neutral > 0"
                                        class="elevation-0 rounded-lg px-1 crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adn || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="#D9D9D9"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                    <v-card class="elevation-0 rounded-lg crd-trn d-inline-flex overflow-hidden"
                                        :style="{ width: i.data.adm || '0%', height: '8px', display: 'inline-flex' }">
                                        <v-card class="elevation-0 rounded-lg py-1" color="mainred"
                                            style="width: 100%;"></v-card>
                                    </v-card>
                                </v-card>
                                <v-row no-glutters>
                                    <v-col cols="6" class="pt-1">
                                        <p v-if="i.data.Positive > 0" class="mb-0 lh-16 mt-2 subtitle-2">
                                            <v-icon color="maingreen" size="18">mdi-arrow-top-right</v-icon>
                                            {{ i.data.Positive }}
                                        </p>
                                    </v-col>
                                    <v-col cols="6" class="pt-1">
                                        <p v-if="i.data.Negative > 0" class="mb-0 lh-16 mt-2 subtitle-2 text-right">
                                            {{ i.data.Negative }}
                                            <v-icon color="mainred" size="18">mdi-arrow-bottom-right</v-icon>
                                        </p>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="8" v-else>
                                <v-skeleton-loader height="8px" width="100%" type="card"></v-skeleton-loader>
                            </v-col>
                        </v-row>
                    </v-card>
                </div>
                <!-- </template> -->
                <div class="text-center mt-2">
                    <v-btn v-if="advdecitems && (advdecitems.Sectors || advdecitems.Thematic)"
                        @click="$router.push({ name: 'stocks advance decline', params: { abc: advdectab === 'sectors' ? advdecitems.Sectors[0].key : advdecitems.Thematic[0].key, main: advdectab === 'sectors' ? 'Sectors' : 'Thematic' } })"
                        text variant="flat" small block class="text-none primary--text px-2">See all</v-btn>
                </div>
            </v-col>
            <v-col cols="12" sm="6" class="pt-md-0">
                <v-toolbar class="elevation-0" dense color="transparent">
                    <p class="title font-weight-bold mb-0">Heatmap</p>
                    <v-spacer></v-spacer>

                    <v-select @change="setStatavddec('yes')" :readonly="issloading" style="max-width: 50%"
                        v-model="treemaps" hide-details append-icon="mdi-chevron-down"
                        class="rounded-pill d-none d-sm-flex" dense flat solo background-color="secbg"
                        :items="treemapitem" label="Condition"></v-select>
                </v-toolbar>
                <v-card height="500px" width="100%" id="avddecchart"
                    class="crd-trn rounded-lg elevation-0 px-6 pt-1 pb-16 pos-rlt">
                    <div v-if="heatmapError" class="d-flex align-center justify-center pos-abs" style="inset:0;">
                        <div class="text-center">
                            <p class="mb-2 title font-weight-bold">Service temporarily unavailable</p>
                            <p class="mb-4 subtext--text">Unable to load heatmap data. We will retry s
                                rtly.</p>
                            <v-btn small color="primary" class="text-none" @click="setStatavddec()">Retry now</v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-toolbar class="tool-sty elevation-0 my-3" ref="ttt" id="ttt" dense color="transparent">
            <p class="title font-weight-bold mb-0 mr-3">Today's trade action</p>
            <v-spacer></v-spacer>


            <v-btn @click="scrollToo('market', -600)" class="mx-2" icon small outlined> <v-icon
                    size="24">mdi-chevron-left</v-icon> </v-btn>
            <v-btn @click="scrollFrom('market', 600)" class="mr-1" icon small outlined> <v-icon
                    size="24">mdi-chevron-right</v-icon> </v-btn>
        </v-toolbar>


        <div id="market" v-dragscroll.x class="d-inline-flex overflow-x-auto no-scroll mb-12" style="width: 100%">
            <div v-for="(tabel, l) in isloading ? [[], [], [], []] : tradeactionitem" :key="l"
                :class="l == 3 ? 'mr-1' : 'mr-4'">
                <v-card style="border: thin solid var(--outline) !important" class="rounded-lg elevation-0"
                    color="cardbg">
                    <v-toolbar class="elevation-0 mb-0 mt-1" dense color="transparent">
                        <img width="24px" :src="tradeIcons[l]" :alt="tradeLabels[l]" class="mr-2" />
                        <p class="font-weight-bold subtitle-2 mb-0 text-none">
                            {{ l == 3 ? "Most active" : l == 0
                                ? "Top gainer"
                                : l == 1 ? "Top losers" : l == 2 ? "Volume breakout" : "" }}</p>

                        <v-spacer></v-spacer>
                        <v-btn :disabled="isloading"
                            @click="$router.push({ name: 'stocks market', params: { abc: l } })" text
                            class="text-none px-0 primary--text" small>See all</v-btn>
                    </v-toolbar>
                    <v-data-table must-sort :sort-by="[l == 2 ? 'vol' : 'chp']" :sort-desc="l != 1 ? [true] : [false]"
                        mobile-breakpoint hide-default-footer fixed-header :loading="isloading"
                        class="rounded-lg overflow-y-auto" style="min-width: 330px" :headers="tradeheader"
                        :search="opensearch" :items="tabel" :items-per-page="5">
                        <template v-slot:[`item.tsym`]="{ item }">
                            <p class="mb-0 lh-16">
                                <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                                    class="font-weight-medium text-capitalize txt-dec-cust" v-text="item.tsym"></span>
                                <br />
                                <span v-if="l == 2" class="fs-12 subtext-text" :id="`ssdta${item.token}vol`"
                                    v-text="`Vol. : ${item.v}`"></span>
                            </p>
                        </template>
                        <template v-slot:[`item.ltp`]="{ item }">
                            <p class="mb-0 lh-18">
                                <span class="d-none" v-if="!uid">{{ setScrpitCH(l, item, "TA") }}</span>

                                <span class="font-weight-medium maintext--text">₹<span :id="`ssdta${item.token}ltp`"
                                        v-text="item.lp ? Number(item.lp).toFixed(2) : '0.00'"></span></span> <br />
                                <span class="font-weight-medium fs-12 ws-p" :id="`ssdta${item.token}chpclr`"
                                    :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
                                    <span :id="`ssdta${item.token}ch`" v-text="item.ch ? item.ch : '0.00'"> </span>
                                    <span :id="`ssdta${item.token}chp`"
                                        v-text="` (${item.chp ? item.chp : item.pc}%)`"></span></span>
                            </p>
                        </template>
                        <template v-slot:no-data>
                            <v-col cols="12" class="text-center pa-0">
                                <v-container fill-height>
                                    <v-btn block class="elevation-0 text-center rounded-xl" height="240px" text
                                        color="transparent" @click="getToplistdata">
                                        <div class="mx-auto py-16">
                                            <img width="60px" :src="tradeIcons[l]" :alt="tradeLabels[l]"
                                                class="mb-2 opc-05" />
                                            <!-- <img width="60px" src="@/assets/sm_icon.svg" class="mb-3"> -->
                                            <h3 class="primary--text font-weight-medium mb-2 text-none">{{ l == 3 ?
                                                "Most active" : l == 0 ? "Top gainer" : l == 1 ? "Top losers" : l == 2 ?
                                                    "Volume breakout" : "" }}</h3>
                                            <p class="subtext--text mb-0 text-none">Click to load the Trade action</p>
                                        </div>
                                    </v-btn>
                                </v-container>
                            </v-col>

                        </template>
                    </v-data-table>
                </v-card>
            </div>
        </div>

        <v-card style="border: thin solid var(--outline) !important" outlined class="rounded-lg mb-8" color="cardbg">
            <v-toolbar ref="smcp" id="smcp" class="elevation-0 my-4" dense color="transparent">
                <img width="40px" src="@/assets/stocks/srcm.svg" alt="srcm" class="mr-2" />
                <p class="title font-weight-bold mb-0">Stock monitor</p>
                <v-spacer></v-spacer>
                <v-select v-model="screent0" :items="screent0item" item-title="text" item-value="value"
                    label="Condition" variant="flat" density="comfortable" hide-details menu-icon="mdi-chevron-down"
                    :readonly="issloading" class="rounded-pill mr-3 d-none d-sm-flex"
                    style="max-width: 180px; background-color: var(--secbg);"
                    @update:model-value="getContentlistdata('yes')" />

                <v-select v-model="screent1" :items="screent1item" item-title="text" item-value="value"
                    label="Condition" variant="flat" density="comfortable" hide-details menu-icon="mdi-chevron-down"
                    :readonly="issloading" class="rounded-pill d-none d-sm-flex"
                    style="max-width: 140px; background-color: var(--secbg);"
                    @update:model-value="getContentlistdata('yes')" />

            </v-toolbar>

            <v-data-table must-sort :sort-by="['chp']" mobile-breakpoint :sort-desc="[true]" hide-default-footer
                fixed-header :loading="issloading" class="rounded-lg overflow-y-auto" :headers="screenheader"
                :search="opensearch" :items="screentitems" :items-per-page="10">
                <template v-slot:[`item.tsym`]="{ item }">
                    <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                        class="font-weight-medium text-capitalize txt-dec-cust ws-p" v-text="item.tsym"></span>
                </template>

                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="d-none" v-if="!uid">{{ setScrpitCH("", item, "SCR") }}</span>

                        <span class="font-weight-medium maintext--text">₹<span :id="`ssdsc${item.token}ltp`"
                                v-text="item.lp ? Number(item.lp).toFixed(2) : '0.00'"></span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`ssdsc${item.token}chpclr`"
                            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
                            <span :id="`ssdsc${item.token}ch`" v-text="item.ch ? item.ch : '0.00'"> </span>
                            <span :id="`ssdsc${item.token}chp`"
                                v-text="` (${item.chp ? item.chp : item.pc}%)`"></span></span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium maintext--text">{{ item.v ? item.v : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}op`">{{ item.ap ? item.ap :
                        "0.00"
                        }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}cp`">{{ item.c ? item.c :
                        "0.00"
                        }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}high`">{{ item.h ? item.h :
                        "0.00"
                        }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium maintext--text" :id="`ssdsc${item.token}low`">{{ item.l ? item.l :
                        "0.00"
                        }}</span>
                </template>

                <template v-slot:no-data>
                    <v-col v-if="screentidata" cols="12" class="text-center pa-0">
                        <v-container fill-height>
                            <v-btn block class="elevation-0 text-center rounded-xl" height="300px" text
                                color="transparent" @click="getContentlistdata">
                                <div class="mx-auto py-16">
                                    <img width="60px" src="@/assets/sm_icon.svg" class="mb-3">
                                    <h3 class="primary--text font-weight-medium mb-2 text-none">Stock monitor</h3>
                                    <p class="subtext--text mb-0 text-none">Click to load the Market monitor data</p>
                                </div>
                            </v-btn>
                        </v-container>
                    </v-col>
                    <v-col v-else cols="12" class="text-center pa-16">
                        <div>
                            <img width="80px" src="@/assets/no data folder.svg" alt="no data" />
                            <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                        </div>
                    </v-col>
                </template>
            </v-data-table>
            <v-divider></v-divider>
            <v-btn v-if="screentitems && screentitems.length > 0" :disabled="issloading" to="/stocks/screener" block
                text class="text-none primary--text" height="48px">See
                all</v-btn>
        </v-card>

        <v-row ref="eve" id="eve" no-glutters class="mb-6">
            <v-col cols="12" md="6" class="py-md-0">
                <v-card style="border: thin solid var(--outline) !important"
                    class="crd-trn elevation-0 overflow-hidden rounded-lg" width="100%">
                    <div class="px-4 py-4">
                        <p class="font-weight-bold title mb-md-4 mb-6">Corporate Action ({{ allcropact &&
                            allcropact.length > 0
                            ?
                            allcropact.length : ".." }})</p>
                        <div v-if="croploading">
                            <v-container fill-height>
                                <v-card class="crd-trn elevation-0 mx-auto py-16">
                                    <v-progress-circular size="80" indeterminate color="#1e53e5"></v-progress-circular>
                                </v-card>
                            </v-container>
                        </div>
                        <div v-else-if="allcropact && allcropact.length > 0">
                            <v-card outlined v-for="(d, e, f) in allcropact.slice(0, 5)" :key="f"
                                class="mb-3 rounded-lg" color="secbg">
                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title
                                            class="txt-5E6 mb-1 mb-2 font-weight-medium fs-14 text-capitalize">
                                            {{ d.symbol }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle
                                            class="maintext--text mb-0 font-weight-medium fs-13 text-capitalize">{{
                                                d.registrar }} <span class="fs-10">({{ d.issueType
                                                }})</span></v-list-item-subtitle>
                                    </v-list-item-content>

                                    <v-list-item-content>
                                        <v-list-item-title
                                            class="txt-5E6 mb-1 mb-2 font-weight-medium fs-14 text-capitalize">
                                            Listing date
                                        </v-list-item-title>
                                        <v-list-item-subtitle
                                            class="maintext--text mb-0 font-weight-medium fs-13 text-capitalize">{{
                                                d.biddingStartDate ? d.biddingStartDate.slice(0, 5) : "" }} <span
                                                class="fs-10 text-lowercase">to</span> {{ d.biddingEndDate
                                                }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                    <v-list-item-content>
                                        <v-list-item-title
                                            class="txt-5E6 mb-1 mb-2 font-weight-medium fs-14 text-capitalize">
                                            Price offered
                                        </v-list-item-title>
                                        <v-list-item-subtitle
                                            class="maintext--text mb-0 font-weight-medium fs-13 text-capitalize">₹{{
                                                d.minPrice ? Number(d.minPrice).toFixed(2) : "0.00"
                                            }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-card>
                        </div>
                        <div v-else-if="allcropact == null">
                            <v-container fill-height>
                                <v-btn block class="elevation-0 text-center rounded-xl" height="200px" text
                                    color="primary" @click="getCorpationaction">
                                    <div class="mx-auto py-16">
                                        <img width="60px" src="@/assets/ca_icon.svg" class="mb-3">
                                        <h3 class="primary--text font-weight-medium mb-2 text-none">Corporate Actions
                                        </h3>
                                        <p class="subtext--text mb-0 text-none">Click to load the corporate action data
                                        </p>
                                    </div>
                                </v-btn>
                            </v-container>
                        </div>
                        <div v-else>
                            <v-container fill-height>
                                <v-card class="crd-trn elevation-0 mx-auto py-16 text-center">
                                    <div class="mx-auto">
                                        <img class="align-self-stretch mx-auto" width="80px"
                                            src="@/assets/no data folder.svg" alt="no data" />
                                        <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
                                    </div>
                                </v-card>
                            </v-container>
                        </div>
                    </div>
                    <v-btn v-if="allcropact && allcropact.length > 0 && uid"
                        :href="`https://profile.zebuetrade.com/corporateaction?uid=${uid}&token=${stoken}`"
                        target="_blank" block text class="text-none primary--text rounded-t-0 rounded-b-lg"
                        height="48px">See
                        all</v-btn>
                </v-card>
            </v-col>
            <v-col cols="12" md="6" class="py-md-0">
                <v-card style="border: thin solid var(--outline) !important"
                    class="crd-trn elevation-0 overflow-hidden rounded-lg" width="100%">
                    <div class="px-4 py-4">
                        <p class="font-weight-bold title mb-md-4 mb-6">News ({{ allnews && allnews.length > 0 ?
                            allnews.length :
                            ".."
                            }})</p>
                        <div v-if="newsloading">
                            <v-container fill-height>
                                <v-card class="crd-trn elevation-0 mx-auto py-16">
                                    <v-progress-circular size="80" indeterminate color="#1e53e5"></v-progress-circular>
                                </v-card>
                            </v-container>
                        </div>
                        <div v-else-if="allnews && allnews.length > 0">
                            <div v-for="(n, e) in allnews.slice(0, 5)" :key="e" class="mb-0 cursor-p"
                                @click="newsPage(n)">
                                <v-row no-glutters>
                                    <v-col cols="4" sm="3" xl="2">
                                        <v-card class="rounded-lg elevation-0">
                                            <img :src="n.image" width="100%" height="60px" class="rounded-lg"
                                                :alt="n.image" />
                                        </v-card>
                                    </v-col>
                                    <v-col cols="8" sm="9" xl="10" class="pl-0 pl-sm-2 pt-2">
                                        <v-list-item two-line class="px-0 pr-sm-3">
                                            <v-list-item-content class="py-0">
                                                <p class="font-weight-medium fs-14 mb-2 text-rap-l2 lh-20">
                                                    {{ n.title }}
                                                </p>
                                                <v-list-item-subtitle class="fs-12 font-weight-regular">{{ n.isdate
                                                    }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                        <div v-else-if="allnews == null">
                            <v-container fill-height>
                                <v-btn block class="elevation-0 text-center rounded-xl" height="200px" text
                                    color="primary" @click="getNews">
                                    <div class="mx-auto py-16">
                                        <img width="60px" src="@/assets/news_icon.svg" class="mb-3">
                                        <h3 class="primary--text font-weight-medium mb-2 text-none">News</h3>
                                        <p class="subtext--text mb-0 text-none">Click to load the latest news</p>
                                    </div>
                                </v-btn>
                            </v-container>
                        </div>
                        <div v-else>
                            <v-container fill-height>
                                <v-card class="crd-trn elevation-0 mx-auto py-16 text-center">
                                    <div class="mx-auto">
                                        <img class="align-self-stretch mx-auto" width="80px"
                                            src="@/assets/no data folder.svg" alt="no data" />
                                        <h5 class="txt-999 font-weight-regular">There is no news data here yet!</h5>
                                    </div>
                                </v-card>
                            </v-container>
                        </div>
                    </div>
                    <v-btn v-if="allnews && allnews.length > 0" href="https://zebuetrade.com/news" target="_blank" block
                        text class="text-none primary--text rounded-t-0 rounded-b-lg" height="48px">See all</v-btn>
                </v-card>
            </v-col>
        </v-row>

    </div>
</template>

<script>
import * as echarts from "echarts";
import { watch } from 'vue'
import { dragscroll } from "vue-dragscroll";
import StatBoard from "../StatBoard.vue";
import { getADindice, getADindices, getHLbreakers, getTopList, getConTentList, getLtpdata, getSectordata, getssNews, getCorporateact } from "../../../components/mixins/getAPIdata";
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { useNavStore } from '../../../stores/navStore';
import { websocketSubscription, websocketUnsubscriptionChain } from '../../../components/mixins/webSocketstream';
// import datadiskData from '../../../datadiskData.json'
import ic_tg from '@/assets/stocks/tg.svg'
import ic_tl from '@/assets/stocks/tl.svg'
import ic_vb from '@/assets/stocks/vb.svg'
import ic_ma from '@/assets/stocks/ma.svg'
import ic_sect from '@/assets/stocks/sect.svg'
import ic_them from '@/assets/stocks/them.svg'

export default {
    directives: {
        dragscroll,
    },
    /* eslint-disable */
    data: () => ({
        uid: null,
        mtoken: null,
        stoken: null,

        tradeaction: 0,
        isloading: false,
        issloading: false,
        isssloading: true,
        issssloading: true,

        opensearch: null,
        openHsearch: null,

        pdmwdata: [
            { exch: "NSE", token: "26000", tsym: "Nifty 50", too: "NIFTY 50" },
            { exch: "NSE", token: "26009", tsym: "Nifty Bank", too: "NIFTY BANK" },
            { exch: "NSE", token: "26017", tsym: "India VIX", too: "" },
            { exch: "BSE", token: "1", tsym: "SENSEX", too: "" },
            { exch: "NSE", token: "26013", tsym: "Nifty Next 50", too: "NIFTY NEXT 50" },
            { exch: "NSE", token: "26060", tsym: "NIFTY MIDCAP 150", too: "NIFTY MIDCAP 150" },
            { exch: "NSE", token: "26062", tsym: "NIFTY SMLCAP 250", too: "NIFTY SMALLCAP 250" },
            { exch: "NSE", token: "26076", tsym: "NIFTY MICROCAP250", too: "NIFTY MICROCAP 250" },
        ],

        screent0item: [
            { text: "Volume & Price Up", value: "VolUpPriceUp" },
            { text: "Volume & Price Down", value: "VolUpPriceDown" },
            { text: "Open High", value: "OpenHigh" },
            { text: "Open Low", value: "OpenLow" },
            { text: "High Break", value: "HighBreak" },
            { text: "Low Break", value: "LowBreak" },
        ],
        screent0: "VolUpPriceUp",
        screent1item: [
            { text: "All", value: "A" },
            { text: "Nifty 50", value: "NIFTY50" },
            { text: "Nifty 500", value: "NIFTY500" },
            { text: "Nifty MIDCAP 50", value: "NIFTYMCAP50" },
            { text: "Nifty SMLCAP 50", value: "NIFTYSMCAP50" },
        ],
        screent1: "A",
        screentitems: [],
        screentidata: true,

        treemaps: "NIFTY 50",
        treemapitem: [
            "NIFTY 50",
            "NIFTY NEXT 50",
            "NIFTY 100",
            "NIFTY 200",
            "Nifty Total Market",
            "NIFTY 500",
            "NIFTY500 MULTICAP 50 25 25",
            "NIFTY MIDCAP 150",
            "NIFTY MIDCAP 50",
            "Nifty Midcap Select",
            "NIFTY Midcap 100",
            "NIFTY SMALLCAP 250",
            "NIFTY SMALLCAP 50",
            "NIFTY FULL SMALL CAP 100",
            "NIFTY MICROCAP 250",
            "NIFTY LargeMidcap 250",
            "NIFTY MIDSMALLCAP 400",
            "NIFTY COMMODITIES",
        ],
        heatmapLoading: false,
        heatmapError: false,

        trader1item: [
            { text: "NSE", value: "NSEALL" },
            { text: "NFO", value: "NFOALL" },
        ],
        trader1: "NSEALL",
        tradeactionitem: [[], [], [], []],
        // Pre-imported icons for trade action header: 0=tg,1=tl,2=vb,3=ma
        tradeIcons: [ic_tg, ic_tl, ic_vb, ic_ma],
        tradeLabels: ['tg', 'tl', 'vb', 'ma'],
        // Icons for AD Segments: 0=sect, 1=them
        advIcons: [ic_sect, ic_them],
        advLabels: ['sect', 'them'],

        sectoritems: [],
        sectorwslist: [],
        sectorwapper: [],

        // mrkbreaker: [],
        mrkbreakers: [],

        advdecitems: {
            Sectors: [],
            Thematic: [],
            wsdata: {}
        },
        advdectab: 'sectors',

        totalnews: 0,
        allnews: null,
        newsloading: false,

        allcropact: null,
        croploading: false,

        elscrollview: true,
        unwatchAuth: null,
        sessionCheckInterval: null,
        heatmapResizeObserver: null,
    }),
    computed: {
        tradeheader() {
            return [
                { text: "Symbol", value: "tsym", sortable: false, class: "ws-p" },
                { text: "Price", value: "ltp", sortable: false, align: "right", class: "ws-p" },
            ];
        },
        highheader() {
            return [
                { text: "Symbol", value: "tsym", sortable: false, class: "ws-p" },
                { text: "Last 50 minutes", value: "ltp", sortable: false, width: "80%", class: "ws-p" },
            ];
        },
        screenheader() {
            return [
                { text: "Symbol", value: "tsym", sortable: false, class: "ws-p" },
                { text: "Price", value: "ltp", sortable: false, align: "right", class: "ws-p" },
                { text: "Open", value: "op", align: "right", class: "ws-p" },
                { text: "High", value: "high", align: "right", class: "ws-p" },
                { text: "Low", value: "low", align: "right", class: "ws-p" },
                { text: "Close", value: "cp", align: "right", class: "ws-p" },
                { text: "Volume", value: "vol", align: "right", class: "ws-p" },
            ];
        },
    },
    watch: {
        // Ensure heatmap refreshes whenever the condition changes
        treemaps() {
            // Avoid overlapping renders
            if (this.heatmapLoading) return;
            this.setStatavddec();
        }
    },
    created() {
        // Initialize sectors and thematic data
        this.advdecitems.Sectors = [
            { title: "Bank", key: "NIFTY BANK" },
            { title: "Auto", key: "NIFTY AUTO" },
            { title: "Financial Services", key: "NIFTY FINANCIAL SERVICES" },
            { title: "FMCG", key: "NIFTY FMCG" },
            { title: "Health Care", key: "Nifty HEALTHCARE" },
            { title: "Pharma", key: "NIFTY PHARMA" },
            { title: "IT", key: "NIFTY IT" },
            { title: "Media", key: "NIFTY MEDIA" },
            { title: "Metal", key: "NIFTY METAL" },
            { title: "Realty", key: "NIFTY REALTY" },
            { title: "Consumer Durables", key: "NIFTY CONSUMER DURABLES" },
            { title: "Oil & Gas", key: "NIFTY OIL AND GAS INDEX" },
        ];
        this.advdecitems.Thematic = [
            { title: "Core Housing", key: "Nifty Core Housing" },
            { title: "Energy", key: "NIFTY ENERGY" },
            { title: "Consumption", key: "NIFTY INDIA CONSUMPTION" },
            { title: "Defence", key: "Nifty India Defence" },
            { title: "Digital", key: "Nifty India Digital" },
            { title: "Manufacturing", key: "Nifty India Manufacturing" },
            { title: "Infrastructure", key: "NIFTY INFRASTRUCTURE" },
            { title: "MNC", key: "NIFTY MNC" },
            { title: "Mobility", key: "Nifty Mobility" },
            { title: "Transportation & Logistics", key: "Nifty Transportation & Logistics" },
            { title: "PSE", key: "NIFTY PSE" },
            { title: "REITs & InvITs", key: "Nifty REITs & InvITs" },
            { title: "SME Emerge", key: "NIFTY SME EMERGE" },
        ];
    },
    mounted() {
        const appStore = useAppStore();
        const authStore = useAuthStore();

        // Check if user is logged in
        let res = sessionStorage.getItem("c3RhdHVz");
        if (res == "dmFsaWR1c2Vy") {
            if (!this.uid && !this.stoken) {
                this.mtoken = sessionStorage.getItem("msession");
                this.stoken = sessionStorage.getItem("usession");
                this.uid = sessionStorage.getItem("userid");
            }

        }

        // Listen for WebSocket price updates
        window.addEventListener('websocket-quote-update', this.handleQuoteUpdate);

        // Listen for WebSocket connection events (similar to old eventBus)
        window.addEventListener('web-scoketConn', this.handleWebSocketConnection);

        // Initialize data loading
        this.setWebsocket("sub", this.pdmwdata, "ssd-pd");
        this.getADlistdata();
        this.setStatavddec();
        if (res != "dmFsaWR1c2Vy") {
            this.getToplistdata();
            this.getContentlistdata();
        }
        // Defensive re-subscribe shortly after mount to handle socket warm-up on hard refresh
        setTimeout(() => {
            if (this.uid) {
                this.setWebsocket('sub', this.pdmwdata, 'ssd-pd');
                if (Object.keys(this.advdecitems.wsdata || {}).length > 0) {
                    this.setWebsocket('sub', Object.values(this.advdecitems.wsdata), 'adv');
                }
            }
        }, 1200);
        this.checkVisibility();
        // setInterval(() => {
        //   this.getMrkBreakerdata();
        // }, 50000)
        if (this.elscrollview) {
            this.$nextTick(() => {
                window.addEventListener('scroll', this.checkVisibility);
            });
        }

        // React to login after mount: start data loads and WS without refresh
        const initializeLoggedInData = async () => {
            const loggedIn = sessionStorage.getItem('c3RhdHVz') === 'dmFsaWR1c2Vy'
            const nUid = authStore.uid || sessionStorage.getItem('userid')
            const nMtok = authStore.mtoken || sessionStorage.getItem('msession')

            // Only initialize if we have credentials and they're different from current
            if (loggedIn && nUid && nMtok && (this.uid !== nUid || this.mtoken !== nMtok)) {
                const wasLoggedOut = !this.uid
                this.uid = nUid;
                this.mtoken = nMtok;
                this.stoken = sessionStorage.getItem('usession');

                // Force Vue to recognize the change
                this.$forceUpdate();

                // Subscribe and load sections with WebSocket
                if (wasLoggedOut) {
                    // First time login on this page
                    await this.getADlistdata();
                    this.setWebsocket('sub', this.pdmwdata, 'ssd-pd');
                    this.setStatavddec();
                    await this.getToplistdata();
                    await this.getContentlistdata();
                    // Re-subscribe once more after a short delay to survive socket init races
                    setTimeout(() => {
                        this.setWebsocket('sub', this.pdmwdata, 'ssd-pd');
                        if (Object.keys(this.advdecitems.wsdata || {}).length > 0) {
                            this.setWebsocket('sub', Object.values(this.advdecitems.wsdata), 'adv');
                        }
                    }, 1000);
                } else {
                    // Re-subscribe WebSocket when credentials change
                    this.setWebsocket('sub', this.pdmwdata, 'ssd-pd');
                    if (Object.keys(this.advdecitems.wsdata || {}).length > 0) {
                        this.setWebsocket('sub', Object.values(this.advdecitems.wsdata), 'adv');
                    }
                    if (this.tradeactionitem && this.tradeactionitem.length > 0) {
                        const arr = this.tradeactionitem[0]?.concat(this.tradeactionitem[1]?.concat(this.tradeactionitem[2]?.concat(this.tradeactionitem[3] || [])) || []) || [];
                        if (arr.length > 0) {
                            const wsdata = arr.map((o) => ({ exch: o.exch, token: o.token, tsym: o.tsym }));
                            this.setWebsocket('sub', wsdata, 'ta');
                        }
                    }
                    if (this.screentitems && this.screentitems.length > 0) {
                        this.setWebsocket('sub', this.screentitems, 'sc');
                    }
                }
            }
        };

        // Initialize immediately if already logged in
        this.$nextTick(() => {
            initializeLoggedInData();
        });

        // Watch for login changes
        this.unwatchAuth = watch(
            () => [authStore.uid, authStore.mtoken],
            async ([nUid, nMtok]) => {
                if (nUid && nMtok) {
                    await this.$nextTick();
                    await initializeLoggedInData();
                }
            },
            { immediate: false }
        );

        // Also listen for sessionStorage changes (fallback)
        const sessionCheckInterval = setInterval(() => {
            const loggedIn = sessionStorage.getItem('c3RhdHVz') === 'dmFsaWR1c2Vy'
            if (loggedIn && !this.uid) {
                initializeLoggedInData();
            }
        }, 500);
        this.sessionCheckInterval = sessionCheckInterval;
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.checkVisibility);
        window.removeEventListener('websocket-quote-update', this.handleQuoteUpdate);
        window.removeEventListener('web-scoketConn', this.handleWebSocketConnection);
        if (this.unwatchAuth) {
            this.unwatchAuth();
            this.unwatchAuth = null;
        }
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
        if (this.heatmapResizeObserver) {
            try { this.heatmapResizeObserver.disconnect(); } catch (_) { }
            this.heatmapResizeObserver = null;
        }
    },
    methods: {
        handleQuoteUpdate(event) {
            // Handle WebSocket quote updates
            const data = event.detail;
            if (data) {
                this.optionChainDataParse(data);
            }
        },
        handleWebSocketConnection(event) {
            // Handle WebSocket connection events (similar to old eventBus web-scoketConn)
            const detail = event.detail;

            // The old implementation expects (data, page) parameters
            if (Array.isArray(detail) && detail.length >= 2) {
                const [data, page] = detail;
                if (page === "stocks" && data) {
                    this.optionChainDataParse(data);
                }
            } else if (detail && typeof detail === 'object') {
                // Fallback for direct data
                this.optionChainDataParse(detail);
            }
        },
        checkVisibility() {
            const ids = {
                elo: document.getElementById('ttt'),
                elt: document.getElementById('smcp'),
                elr: document.getElementById('eve'),
            };
            if (this.isVisible(ids.elo) && this.tradeactionitem[0]?.length === 0) {
                this.getToplistdata();
            }

            if (this.isVisible(ids.elt) && this.screentidata) {
                this.screentidata = false;
                this.getContentlistdata();
            }

            if (this.isVisible(ids.elr)) {
                if (!this.allnews) this.getNews();
                if (!this.allcropact) this.getCorpationaction();
                this.elscrollview = false;
            }
        },
        isVisible(el) {
            if (!el) return false;
            const { top, left, bottom, right } = el.getBoundingClientRect();
            const w = window.innerWidth || document.documentElement.clientWidth;
            const h = window.innerHeight || document.documentElement.clientHeight;
            return top >= 0 && left >= 0 && bottom <= h && right <= w;
        },
        setSinglestock(tsym, item) {
            if (this.uid) {
                let path = [0, item.token, item.exch, item.tsym];
                this.$router.push({ name: "stocks details", params: { val: path } });
            } else if (item.exch == "NSE") {
                this.$router.push(`/stocks/${tsym.toLowerCase()}`);
            }
        },
        scrollToo(id, value) {
            const element = document.getElementById(`${id}`);
            element.scrollBy({
                left: value,
                behavior: "smooth",
            });
        },

        scrollFrom(id, value) {
            const element = document.getElementById(`${id}`);
            element.scrollBy({
                left: value,
                behavior: "smooth",
            });
        },
        setScrpitCH(x, i, a, l) {
            if (a == "TA") {
                let f = this.tradeactionitem[x].findIndex((o) => o.token == i.token);
                this.tradeactionitem[x][f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0;
                this.tradeactionitem[x][f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0;
            } else if (a == "SCR") {
                let f = this.screentitems.findIndex((o) => o.token == i.token);
                this.screentitems[f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0;
                this.screentitems[f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0;
            } else if (a == "st" && l < 5) {
                let g = this.sectorwapper.indexOf(`${x}|${l}`);
                if (this.sectorwslist && this.sectorwslist.length == 20) {
                    this.setWebsocket("sub", this.sectorwslist, a);
                    this.sectorwslist = [];
                } else if (g == -1) {
                    this.sectorwslist.push({ exch: i.Symbol.split(":")[0], token: i.Token ? i.Token : "0" });
                    this.sectorwapper.push(`${x}|${l}`);
                }
            }
        },
        async getToplistdata() {
            this.tradeactionitem = [];
            this.isloading = true;
            let lsto = await getTopList([this.trader1 == "NSEALL" ? "NSE" : "NFO", this.trader1, "mostActive"]);
            let lstt = await getTopList([this.trader1 == "NSEALL" ? "NSE" : "NFO", this.trader1, "topG_L"]);

            if (lsto.stat == "Ok" && lstt.stat == "Ok") {
                this.tradeactionitem.push(lstt.topGainers);
                this.tradeactionitem.push(lstt.topLosers);
                this.tradeactionitem.push(lsto.byVolume);
                this.tradeactionitem.push(lsto.byValue);

                let arr = this.tradeactionitem[0].concat(this.tradeactionitem[1].concat(this.tradeactionitem[2].concat(this.tradeactionitem[3])));
                let wsdata = [];
                arr.map((o) => wsdata.push({ exch: o.exch, token: o.token, tsym: o.tsym }));
                if (this.uid) {
                    this.setWebsocket("sub", wsdata, "ta");
                }
            }
            this.isloading = false;
        },
        async getContentlistdata(change) {
            if (change == "yes" && this.uid) {
                this.setWebsocket("unsub-D", this.screentitems, "sc");
            }
            this.issloading = true;
            this.screentitems = [];
            let data = await getConTentList(["NSE", this.screent1, this.screent0]);
            if (data && data.length > 0) {
                this.screentitems = data.slice(0, 10);
                if (this.uid) {
                    this.setWebsocket("sub", data, "sc");
                }
            }
            this.screentidata = false;
            this.issloading = false;
        },
        async getSectorlistdata() {
            this.isssloading = true;
            this.sectoritems = [];
            let data = await getSectordata();
            if (data && data.Bank) {
                this.sectoritems.push({ txt: "Banking", data: data.Bank });
                this.sectoritems.push({ txt: "Finance", data: data.Finance });
                this.sectoritems.push({ txt: "Healthcare", data: data.Healthcare });
                this.sectoritems.push({ txt: "Realty", data: data.Realty });
                // this.tradeactionitem['Power'] = data.Power;
                // this.tradeactionitem['FMCG'] = data.FMCG;
            }
            this.isssloading = false;
        },
        async getMrkBreakerdata() {
            this.mrkbreaker = [];
            this.issssloading = true;
            let data;
            // data = hig
            data = await getHLbreakers();
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    value = value.slice(-10);
                    if (value && value.length < 10) {
                        let l = 10 - value.length;
                        for (let a = 0; a < l; a++) {
                            var now = new Date(value[value.length - 1].time);
                            now.setMinutes(now.getMinutes() + 5);
                            const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
                            now = [padL(now.getMonth() + 1), padL(now.getDate()), now.getFullYear()].join("-") + " " + [padL(now.getHours()), padL(now.getMinutes()), padL(now.getSeconds())].join(":");
                            value.push({ time: now, lowbreak: false, highbreak: false, points: 0.0, percentage: 0.0, Symbol: value[0].Symbol, Token: value[0].Token });
                        }
                    }
                    let max = Math.max(...value.map((o) => o.points));
                    let min = Math.min(...value.map((o) => o.points));
                    for (let v = 0; v < value.length; v++) {
                        value[v]["color"] = value[v].points == 0 ? "#FAFBFF" : value[v].points > 0 ? (value[v].points <= max / 3 ? "#caedc4" : value[v].points <= max / 2 ? "#a6e19d" : "#83d576") : value[v].points <= min / 3 ? "#ff4d4d" : value[v].points <= min / 2 ? "#ff8080" : "#ffb3b3";
                    }
                    this.mrkbreakers.push({ tsym: key, data: value });
                });
            }
            // this.mrkbreaker = data;
            this.issssloading = false;
        },
        async getADlistdata() {
            try {
                let data = await getADindices();
                if (data && data != 500) {
                    // Process sectors data with Vue 3 reactivity (automatic in Options API)
                    this.advdecitems.Sectors.forEach((sector, index) => {
                        if (data[sector.key]) {
                            const processedData = this.setStatAD(data[sector.key], sector.key);
                            // Vue 3 Options API: direct assignment is reactive
                            this.advdecitems.Sectors[index].data = processedData;
                        }
                    });

                    // Process thematic data with Vue 3 reactivity (automatic in Options API)
                    this.advdecitems.Thematic.forEach((thematic, index) => {
                        if (data[thematic.key]) {
                            const processedData = this.setStatAD(data[thematic.key], thematic.key);
                            // Vue 3 Options API: direct assignment is reactive
                            this.advdecitems.Thematic[index].data = processedData;
                        }
                    });

                    // Subscribe to WebSocket for real-time updates
                    if (this.uid && Object.keys(this.advdecitems.wsdata || {}).length > 0) {
                        this.setWebsocket("sub", Object.values(this.advdecitems.wsdata), "adv");
                    }

                    // Sort by market cap - Vue 3 Options API: direct assignment is reactive
                    this.advdecitems.Sectors.sort((a, b) => Number(b.data?.marketCap || 0) - Number(a.data?.marketCap || 0));
                    this.advdecitems.Thematic.sort((a, b) => Number(b.data?.marketCap || 0) - Number(a.data?.marketCap || 0));
                }
                // Initialize tab only if not yet chosen
                if (this.advdectab === null || this.advdectab === undefined) {
                    this.advdectab = 'sectors';
                }
            } catch (error) {
                console.error('Error loading sectors/thematic data:', error);
            }
        },
        async setStatavddec() {
            // graceful handling when API is down
            this.heatmapLoading = true;
            this.heatmapError = false;

            const chartEl = document.getElementById("avddecchart");
            if (chartEl) {
                echarts.dispose(chartEl);
            }

            try {
                let serdata = [];
                let data = await getADindice(this.treemaps);
                if (!data || data == 500 || !Array.isArray(data) || data.length === 0) {
                    this.heatmapError = true;
                    this.heatmapLoading = false;
                    // auto retry after a short delay
                    setTimeout(() => this.setStatavddec(), 30000);
                    return;
                }

                for (let c = 0; c < data.length; c++) {
                    serdata.push({
                        name: data[c]["SYMBOL"].split(":")[1],
                        value: [
                            Number(data[c].market_cap),
                            `₹${data[c].ltp} <span class="fs-12 ${Number(data[c].change) > 0 ? "maingreen--text" : Number(data[c].change) < 0 ? "mainred--text" : "maintext--text"}" >${Number(data[c].ltp - Number(data[c].close)).toFixed(2)} (${data[c].change}%) </span>`,
                            Number(data[c].change),
                            0,
                            data[c]["Company Name"],
                            { token: data[c].Token, exch: data[c]["SYMBOL"].split(":")[0], tsym: data[c]["SYMBOL"].split(":")[1] },
                        ],
                    });
                }
                this.convertData(serdata);
                var chartContainer = document.getElementById("avddecchart");
                var myChart = echarts.init(chartContainer);
                var option = {
                    title: false,
                    // {
                    //   show: true,
                    //   left: "center",
                    //   text: "NIFTY 50 Heatmap",
                    //   textStyle: {
                    //     color: this.$vuetify.theme.dark ? "white" : "black",
                    //   },
                    // },
                    tooltip: {
                        confine: true,
                        appendToBody: true,
                        extraCssText: 'width:auto;max-width:none;white-space:nowrap;',
                        formatter: function (info) {
                            let value = info.value;
                            return [
                                '<div class="tooltip-title font-weight-bold black--text">' + value[4] + "</div>",
                                // 'Market cap: &nbsp;&nbsp;' + Number(value[0]).toFixed(2) + '<br>',
                                '<p class="mb-0 font-weight-medium black--text fs-14">' + `${value[1]}` + "</p>",
                            ].join("");
                        },
                    },

                    legend: false,
                    series: [
                        {
                            roam: false,
                            nodeClick: undefined,
                            breadcrumb: false,
                            name: "NIFTY 50",
                            type: "treemap",
                            visualMin: -100,
                            visualMax: 100,
                            visualDimension: 3,
                            label: {
                                show: true,
                                formatter: "{b}",
                            },
                            top: "0%", // Reduce top gap
                            left: "0%", // Reduce left gap
                            right: "0%", // Reduce right gap
                            bottom: "0%", // Reduce bottom gap
                            nodeGap: 2, // Decrease gap between nodes
                            levels: [
                                {
                                    color: this.$vuetify.theme.dark ? ["#FF1717", "#999", "#1BBC00"] : ["#FF1717", "#999", "#43A833"],
                                    colorMappingBy: "value",
                                },
                            ],
                            data: serdata,
                        },
                    ],
                };
                option && myChart.setOption(option);
                var self = this;

                myChart.on("click", function (params) {
                    self.setSinglestock(params.value[5].tsym.split("-")[0], params.value[5]);
                });

                // Ensure full-width rendering: resize on container/layout changes
                window.addEventListener("resize", function () {
                    myChart.resize();
                });
                // Resize after layout settles
                setTimeout(() => myChart.resize(), 0);
                setTimeout(() => myChart.resize(), 300);
                // Observe container size changes
                if (window.ResizeObserver && chartContainer) {
                    this.heatmapResizeObserver = new ResizeObserver(() => {
                        myChart.resize();
                    });
                    this.heatmapResizeObserver.observe(chartContainer);
                }
                this.heatmapLoading = false;
                this.heatmapError = false;
            } catch (e) {
                this.heatmapLoading = false;
                this.heatmapError = true;
                setTimeout(() => this.setStatavddec(), 30000);
            }
        },
        convertData(originList) {
            const visualMin = -100;
            const visualMax = 100;
            const visualMinBound = -40;
            const visualMaxBound = 40;

            let min = Infinity;
            let max = -Infinity;
            for (let i = 0; i < originList.length; i++) {
                let node = originList[i];
                if (node) {
                    let value = node.value;
                    value[2] != null && value[2] < min && (min = value[2]);
                    value[2] != null && value[2] > max && (max = value[2]);
                }
            }
            for (let i = 0; i < originList.length; i++) {
                let node = originList[i];
                if (node) {
                    let value = node.value;
                    // Scale value for visual effect
                    if (value[2] != null && value[2] > 0) {
                        value[3] = echarts.number.linearMap(value[2], [0, max], [visualMaxBound, visualMax], true);
                    } else if (value[2] != null && value[2] < 0) {
                        value[3] = echarts.number.linearMap(value[2], [min, 0], [visualMin, visualMinBound], true);
                    } else {
                        value[3] = 0;
                    }
                    if (!isFinite(value[3])) {
                        value[3] = 0;
                    }
                    if (node.children) {
                        this.convertData(node.children);
                    }
                }
            }
        },
        setStatAD(data, tsym) {
            if (!data) {
                return {
                    sum: 0,
                    adp: "0%",
                    adm: "0%",
                    adn: "0%",
                    token: null,
                    Positive: 0,
                    Negative: 0,
                    Neutral: 0,
                    marketCap: 0
                };
            }

            // Create a new object to ensure Vue 3 reactivity
            const processedData = {
                ...data,
                sum: (data.Negative || 0) + (data.Neutral || 0) + (data.Positive || 0),
                Positive: data.Positive || 0,
                Negative: data.Negative || 0,
                Neutral: data.Neutral || 0,
                marketCap: data.marketCap || 0
            };

            // Calculate percentages
            processedData.adp = processedData.sum > 0 ? `${Math.round((processedData.Positive / processedData.sum) * 100)}%` : "0%";
            processedData.adm = processedData.sum > 0 ? `${Math.round((processedData.Negative / processedData.sum) * 100)}%` : "0%";
            processedData.adn = processedData.sum > 0 ? `${Math.round((processedData.Neutral / processedData.sum) * 100)}%` : "0%";

            // Add to WebSocket data - Vue 3 Options API: direct assignment is reactive
            if (processedData.token) {
                this.advdecitems.wsdata[processedData.token] = {
                    exch: "NSE",
                    token: processedData.token,
                    tsym: tsym,
                    ltp: null,
                    ch: null,
                    chp: null
                };
            }

            return processedData;
        },
        newsPage(n) {
            if (n) {
                window.open(n.link, "_blank");
            }
        },
        async getNews() {
            this.newsloading = true;
            this.allnews = [];
            this.totalnews = 0;
            let config = await getssNews();
            if (config.data && config.data.length > 0) {
                let data = config.data;
                for (let v = 0; v < data.length; v++) {
                    data[v]["isdate"] = `${new Date(data[v].pubDate).toDateString().slice(3)} ${new Date(data[v].pubDate).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })} IST`;
                    this.allnews.push(data[v]);
                }
                this.totalnews = config.newsCount;
                this.pagecount = config.Totalpages;
            }
            this.newsloading = false;
        },
        async getCorpationaction() {
            this.croploading = true;
            this.allcropact = [];
            let data = await getCorporateact();
            if (data.corporateAction && data.corporateAction.length > 0) {
                this.allcropact = data.corporateAction;
            }
            this.croploading = false;
        },

        setSSDtab(type, token, exch, tsym) {
            // console.log('tsym', type, token, exch, tsym)
            if (type == "alert") {
                // eventBus.$emit("menudialog", "alert", token, exch, tsym);
            } else if (type == "cGTT") {
                // eventBus.$emit("menudialog", "order-GTT", token, exch, tsym, "b");
            } else {
                let path = window.location;
                path["val"] = [type, token, exch, tsym];
                if (path.pathname != "/stocks/details") {
                    this.$router.push({ name: "stocks details", params: { val: path.val } });
                } else {
                    // eventBus.$emit("ssd-event", type, token, exch, tsym);
                }
            }
        },

        async setWebsocket(flow, data, is) {

            if (this.uid) {
                // User is logged in - emit WebSocket request via event bus
                const event = new CustomEvent('web-scoketOn', {
                    detail: { flow, data, is, page: 'stocks' }
                });
                window.dispatchEvent(event);
            } else {
                let raw = await getLtpdata(data);
                raw = raw.data;
                if (is == "ssd-pd" && raw) {
                    for (let l = 0; l < this.pdmwdata.length; l++) {
                        let v = raw[this.pdmwdata[l].token];
                        if (v) {
                            this.pdmwdata[l]["ltp"] = Number(v.lp).toFixed(2);
                            this.pdmwdata[l]["ch"] = Number(this.pdmwdata[l].ltp - Number(v.close)).toFixed(2);
                            this.pdmwdata[l]["chp"] = Number(v.change);
                            // this.$set(this.pdmwdata, l, this.pdmwdata[l]);
                        }
                    }
                } else if (is == "ta" && raw) {
                    for (let x = 0; x < this.tradeactionitem.length; x++) {
                        for (let x_is = 0; x_is < this.tradeactionitem[x].length; x_is++) {
                            let data = raw[this.tradeactionitem[x][x_is].token];
                            if (data) {
                                this.tradeactionitem[x][x_is].ltp = Number(data.lp) ? Number(data.lp).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["ch"] = Number(data.lp) && Number(data.close) ? (Number(data.lp) - Number(data.close)).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["chp"] = Number(data.change).toFixed(2);
                                this.tradeactionitem[x][x_is]["vol"] = Number(data.vol).toFixed(2);
                                this.tradeactionitem[x][x_is]["op"] = Number(data.open) ? Number(data.open).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["cp"] = Number(data.close) ? Number(data.close).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["high"] = Number(data.high) ? Number(data.high).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["low"] = Number(data.low) ? Number(data.low).toFixed(2) : 0;
                                this.tradeactionitem[x][x_is]["oi"] = data.oi ? Number(data.oi).toFixed(2) : 0;
                                // this.$set(this.tradeactionitem[x], x_is, this.tradeactionitem[x][x_is]);
                            }
                        }
                    }
                } else if (is == "adv" && raw) {
                    var f = Object.entries(this.advdecitems.wsdata);
                    for (let l = 0; l < f.length; l++) {
                        let v = raw[f[l][0]];
                        if (v && f[l][0]) {
                            this.advdecitems.wsdata[f[l][0]]["ltp"] = Number(v.lp).toFixed(2);
                            this.advdecitems.wsdata[f[l][0]]["ch"] = Number(this.advdecitems.wsdata[f[l][0]].ltp - Number(v.close)).toFixed(2);
                            this.advdecitems.wsdata[f[l][0]]["chp"] = Number(v.change);
                            // this.$set(this.advdecitems.wsdata, f[l][0], this.advdecitems.wsdata[f[l][0]]);
                        }
                    }
                }

                // else if (is == 'st' && raw) {
                //   Object.entries(this.sectoritems).forEach(([key, value]) => {
                //     for (let l = 0; l < value.data.length; l++) {
                //       let v = raw[value.data[l].Token];
                //       if (v) {
                //         this.sectoritems[key].data[l]['ltp'] = Number(v.lp).toFixed(2);
                //         this.sectoritems[key].data[l]['ch'] = Number(this.sectoritems[key].data[l].ltp - Number(v.close)).toFixed(2);
                //         this.sectoritems[key].data[l]['chp'] = Number(v.change);
                //         this.$set(this.sectoritems[key].data, l, this.sectoritems[key].data[l]);
                //       }
                //     }
                //   })
                // }
            }
        },
        optionChainDataParse(data) {
            let p = this.pdmwdata.findIndex((o) => o.token == data.token);
            if (p >= 0 && this.pdmwdata[p].token == data.token) {
                this.pdmwdata[p].ltp = Number(data.lp).toFixed(2);
                this.pdmwdata[p]["ch"] = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2);
                this.pdmwdata[p]["chp"] = Number(data.chp).toFixed(2);
                let tag = document.getElementById(`ssdpd${data.token}ltp`);
                if (tag) {
                    document.getElementById(`ssdpd${data.token}ltp`).innerHTML = this.pdmwdata[p].ltp;
                    document.getElementById(`ssdpd${data.token}ch`).innerHTML = this.pdmwdata[p].ch;
                    document.getElementById(`ssdpd${data.token}chp`).innerHTML = ` (${this.pdmwdata[p].chp}%)`;
                    // eventBus.$emit("color-event", `ssdpd${data.token}chpclr`, this.pdmwdata[p].ch > 0 ? "maingreen--text" : this.pdmwdata[p].ch < 0 ? "mainred--text" : "subtext--text");
                }
                // this.$set(this.pdmwdata, p, this.pdmwdata[p]);
            }
            let s = this.screentitems.findIndex((o) => o.token == data.token);
            if (s >= 0 && this.screentitems[s].token == data.token) {
                this.screentitems[s].ltp = Number(data.lp).toFixed(2);
                this.screentitems[s]["ch"] = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2);
                this.screentitems[s]["chp"] = Number(data.chp).toFixed(2);
                this.screentitems[s]["vol"] = Number(data.volume);
                this.screentitems[s]["op"] = Number(data.open_price) ? Number(data.open_price).toFixed(2) : (0).toFixed(2);
                this.screentitems[s]["cp"] = Number(data.prev_close_price) ? Number(data.prev_close_price).toFixed(2) : (0).toFixed(2);
                this.screentitems[s]["high"] = Number(data.high_price) ? Number(data.high_price).toFixed(2) : (0).toFixed(2);
                this.screentitems[s]["low"] = Number(data.low_price) ? Number(data.low_price).toFixed(2) : (0).toFixed(2);

                let tag = document.getElementById(`ssdsc${data.token}ltp`);
                if (tag) {
                    document.getElementById(`ssdsc${data.token}ltp`).innerHTML = this.screentitems[s].ltp;
                    document.getElementById(`ssdsc${data.token}ch`).innerHTML = this.screentitems[s].ch;
                    document.getElementById(`ssdsc${data.token}chp`).innerHTML = ` (${this.screentitems[s].chp}%)`;
                    // eventBus.$emit("color-event", `ssdsc${data.token}chpclr`, this.screentitems[s].ch > 0 ? "maingreen--text" : this.screentitems[s].ch < 0 ? "mainred--text" : "subtext--text");
                    document.getElementById(`ssdsc${data.token}op`).innerHTML = this.screentitems[s].op;
                    document.getElementById(`ssdsc${data.token}cp`).innerHTML = this.screentitems[s].cp;
                    document.getElementById(`ssdsc${data.token}high`).innerHTML = this.screentitems[s].high;
                    document.getElementById(`ssdsc${data.token}low`).innerHTML = this.screentitems[s].low;
                }
                // this.$set(this.pdmwdata, p, this.pdmwdata[p]);
            }
            if (this.tradeactionitem.length == 4) {
                let o = this.tradeactionitem[0].findIndex((o) => o.token == data.token);
                let t = this.tradeactionitem[1].findIndex((o) => o.token == data.token);
                let r = this.tradeactionitem[2].findIndex((o) => o.token == data.token);
                let f = this.tradeactionitem[3].findIndex((o) => o.token == data.token);

                if (o >= 0 || t >= 0 || r >= 0 || f >= 0) {
                    for (let x = 0; x < this.tradeactionitem.length; x++) {
                        let x_is = x == 0 && o >= 0 ? o : x == 1 && t >= 0 ? t : x == 2 && r >= 0 ? r : x == 3 && f >= 0 ? f : null;
                        if (x_is >= 0 && this.tradeactionitem[x] && this.tradeactionitem[x][x_is] && this.tradeactionitem[x][x_is].token == data.token) {
                            this.tradeactionitem[x][x_is].ltp = Number(data.lp).toFixed(2);
                            this.tradeactionitem[x][x_is]["ch"] = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2);
                            this.tradeactionitem[x][x_is]["chp"] = Number(data.chp).toFixed(2);
                            this.tradeactionitem[x][x_is]["vol"] = Number(data.volume);

                            let tag = document.getElementById(`ssdta${data.token}ltp`);
                            if (tag) {
                                document.getElementById(`ssdta${data.token}ltp`).innerHTML = this.tradeactionitem[x][x_is].ltp;
                                document.getElementById(`ssdta${data.token}ch`).innerHTML = this.tradeactionitem[x][x_is].ch;
                                document.getElementById(`ssdta${data.token}chp`).innerHTML = ` (${this.tradeactionitem[x][x_is].chp}%)`;
                                // eventBus.$emit("color-event", `ssdta${data.token}chpclr`, this.tradeactionitem[x][x_is].ch > 0 ? "maingreen--text" : this.tradeactionitem[x][x_is].ch < 0 ? "mainred--text" : "subtext--text");
                            }
                            let tagv = document.getElementById(`ssdta${data.token}vol`);
                            if (tagv) {
                                document.getElementById(`ssdta${data.token}vol`).innerHTML = `Vol. : ${this.tradeactionitem[x][x_is].vol}`;
                            }
                            // this.$set(this.tradeactionitem[x], x_is, this.tradeactionitem[x][x_is]);
                        }
                    }
                }
            }
            if (this.advdecitems && this.advdecitems.wsdata) {
                var f = Object.entries(this.advdecitems.wsdata);
                let a = f.findIndex((o) => o[0] == data.token);
                if (a >= 0 && this.advdecitems.wsdata[f[a][0]] && this.advdecitems.wsdata[f[a][0]].token == data.token) {
                    // Update reactive data - Vue 3 Options API: direct assignment is reactive
                    const tokenKey = f[a][0];
                    const updatedData = {
                        ...this.advdecitems.wsdata[tokenKey],
                        ltp: Number(data.lp).toFixed(2),
                        ch: Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2),
                        chp: Number(data.chp).toFixed(2)
                    };
                    // Vue 3 Options API: direct assignment triggers reactivity automatically
                    this.advdecitems.wsdata[tokenKey] = updatedData;

                    // DOM updates for immediate rendering (backup)
                    this.$nextTick(() => {
                        let tag = document.getElementById(`ssdad${data.token}ltp`);
                        if (tag) {
                            document.getElementById(`ssdad${data.token}ltp`).innerHTML = updatedData.ltp;
                            document.getElementById(`ssdad${data.token}ch`).innerHTML = updatedData.ch;
                            document.getElementById(`ssdad${data.token}chp`).innerHTML = ` (${updatedData.chp}%)`;

                            // Update color class dynamically
                            const colorTag = document.getElementById(`ssdad${data.token}chpclr`);
                            if (colorTag) {
                                colorTag.classList.remove('maingreen--text', 'mainred--text', 'subtext--text');
                                if (Number(updatedData.ch) > 0) {
                                    colorTag.classList.add('maingreen--text');
                                } else if (Number(updatedData.ch) < 0) {
                                    colorTag.classList.add('mainred--text');
                                } else {
                                    colorTag.classList.add('subtext--text');
                                }
                            }
                        }
                    });
                }
                if (this.advdectab == null || this.advdectab === undefined) {
                    this.advdectab = 'sectors';
                }
            }
        },
    },
    components: { StatBoard },

};
</script>

<style>
.stk-land-crds {
    background-color: linear-gradient(270deg, #fff 77.04%, #f6f6f6 115%), #fff !important;
    box-shadow: 0px 38.519px 25.482px 0px rgba(83, 30, 0, 0.04), 0px 20px 13px 0px rgba(83, 30, 0, 0.04), 0px 8.148px 6.519px 0px rgba(83, 30, 0, 0.03), 0px 1.852px 3.148px 0px rgba(83, 30, 0, 0.02) !important;
}

/* Ensure ECharts container stretches fully */
#avddecchart {
    width: 100% !important;
}

#avddecchart>div {
    width: 100% !important;
}
</style>
