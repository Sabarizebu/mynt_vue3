<template>
    <div>
        <div v-if="uid">
            <StatBoard />
        </div>
        <!-- <img src="@/assets/stat.svg" width="100%" alt=""> -->
        <v-card v-else class="elevation-0 mb-4 mb-md-14 pa-4 pa-md-6 rounded-lg pos-rlt" color="#51FFB6"
            style="overflow: visible; height: 168px;">
            <v-row>
                <!-- Text Column -->
                <v-col cols="12" md="4">
                    <p class="fs-26 d-md-none font-weight-bold lh-24 black--text">Simple. <br /> Insightful. <br />
                        Incremental.</p>
                    <p class="fs-36 d-none d-md-flex font-weight-bold lh-40 black--text">Simple. <br /> Insightful.
                        <br />
                        Incremental.
                    </p>
                </v-col>
            </v-row>

            <!-- Three Cards Div - Position Absolute -->
            <div class="pos-abs d-none d-md-flex align-stretch"
                style="right: 16px; top: 125px; transform: translateY(-50%); gap: 12px;">
                <v-card width="170px" class="pb-4    stk-land-crds text-center d-flex flex-column"
                    style="height: 200px; border-radius: 15px;">
                    <img :src="mainCard1" class="px-2 " alt="main-card-1" width="100%" />
                    <p class="fs-16 font-weight-bold lh-16 pl-4 mt-1 mb-0 maintext--text text-left">
                        Buy stocks<br />
                        with a click.
                    </p>
                </v-card>
                <v-card width="170px" class="pb-4 stk-land-crds  text-center d-flex flex-column"
                    style="height: 200px; border-radius: 15px;">
                    <img :src="mainCard2" class="px-2" alt="main-card-2" width="100%" />
                    <p class="fs-16 font-weight-bold lh-16 pl-4 mt-1 mb-0 maintext--text text-left">
                        Invest safely<br />
                        in bonds.
                    </p>
                </v-card>
                <v-card width="170px" class="pb-4 stk-land-crds  text-center d-flex flex-column"
                    style="height: 200px; border-radius: 15px;">
                    <img :src="mainCard3" class="px-2" alt="main-card-3" width="100%" />
                    <p class="fs-16 font-weight-bold lh-16 pl-4 mt-1 mb-0 maintext--text text-left">
                        Discover IPO<br />
                        early winners.
                    </p>
                </v-card>
            </div>
        </v-card>
        <v-toolbar class="tool-sty elevation-0 crd-trn pt-10 pb-3" density="compact">
            <img width="32px" :src="indIcon" alt="ind" class="mr-1 pa-1" />
            <p class=" font-weight-bold fs-20 mb-0 mr-3">Top indices</p>
            <v-spacer></v-spacer>
            <v-btn @click="scrollToo('indices', -600)" width="26px" height="26px" class="mr-2" variant="outlined" icon
                size="small">
                <v-icon size="24">mdi-chevron-left</v-icon> </v-btn>
            <v-btn @click="scrollFrom('indices', 600)" class="mr-1" width="26px" height="26px" icon size="small"
                variant="outlined"> <v-icon size="24">mdi-chevron-right</v-icon> </v-btn>
        </v-toolbar>
        <v-card id="indices" v-dragscroll.x class="crd-trn d-inline-flex overflow-x-auto elevation-0 no-scroll mb-2"
            width="100%">
            <v-card v-for="(s, l) in pdmwdata" :key="l"
                @click="() => { setSSDtab('Details', s.token, s.exch, s.tsym); }"
                class="px-3 py-2 crd-trn pos-rlt table-row" :class="l != pdmwdata.length - 1 ? 'mr-4' : ''"
                min-width="160px" style="border: 1px solid #EBEEF0 !important;">
                <div v-if="uid" @click.stop class="pos-abs table-hov" style="bottom: 35px; right: 4px;">
                    <v-btn :disabled="!s.too" @click="navigateToAdvanceDecline(s.too)" min-width="20px" color="mainbg"
                        class="px-0 font-weight-bold white--text elevation-0 mr-1" size="23">
                        <v-icon size="18" color="maintext">mdi-format-line-weight</v-icon>
                    </v-btn>
                </div>
                <div v-if="uid" @click.stop class="pos-abs table-hov" style="bottom: 8px; right: 4px;">
                    <v-btn @click="setSSDtab('option', s.token, s.exch, s.tsym)" min-width="20px" color="mainbg"
                        class="px-0 font-weight-bold white--text elevation-0 mr-1" size="23">
                        <v-icon size="18" color="maintext">mdi-link-variant</v-icon>
                    </v-btn>
                    <v-btn @click="setSSDtab('chart', s.token, s.exch, s.tsym)" min-width="20px" color="mainbg"
                        class="px-0 font-weight-bold white--text elevation-0 mr-1" size="23">
                        <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                    </v-btn>
                </div>

                <p class="mb-2 ws-p font-weight-bold" style="font-size: 14px;" v-text="s.tsym ? s.tsym : ''"></p>
                <v-card class="pt-02 mb-3 elevation-0 rounded-pill" width="30%" color="maintext"></v-card>
                <p class="fs-14 txt-000 font-weight-medium mb-0">
                    ₹<span :id="`ssdpd${s.token}ltp`">{{ s.ltp ? Number(s.ltp).toFixed(2) : "0.00" }}</span>
                </p>
                <p class="fs-12 font-weight-medium mb-0" :id="`ssdpd${s.token}chpclr`"
                    :style="s.ch > 0 ? 'color: #43A833;' : s.ch < 0 ? 'color: #FF0000;' : 'color: #000000;'">
                    <span :id="`ssdpd${s.token}ch`">{{ s.ch ? Number(s.ch).toFixed(2) : "0.00" }}</span>
                    <span :id="`ssdpd${s.token}chp`"> ({{ s.chp ? Number(s.chp).toFixed(2) : "0.00" }}%)</span>
                </p>
            </v-card>
        </v-card>
        <v-btn to="/stocks/allindices" text variant="flat" class="text-none px-0 primary--text mb-6">See all
            indices</v-btn>

        <v-row no-gutters class="mb-4">
            <v-col cols="12" sm="6">
                <v-row no-gutters>
                    <template v-for="(l, v, p) in advdecitems">
                        <v-col @click="advdectab = (p === 0 ? 'sectors' : 'thematic')" cols="6" v-if="p < 2" :key="p"
                            class="text-center cursor-p">
                            <div class="d-inline-flex align-center">
                                <img width="28px" :src="advIcons[p]" :alt="advLabels[p]" class="mr-1" />
                                <p class="font-weight-bold mb-0" style="font-size: 20px !important;">{{ v }}</p>
                            </div>
                            <v-card class="elevation-0 mx-auto"
                                :color="(advdectab === (p === 0 ? 'sectors' : 'thematic')) ? 'primary' : 'transparent'"
                                height="2px" style="max-width: 120px;"></v-card>
                        </v-col>
                    </template>
                </v-row>
                <v-divider class="mb-2"></v-divider>

                <!-- Tabs content with slider effect -->
                <div class="tab-slider-container" style="overflow: hidden; position: relative;">
                    <div class="tab-slider-wrapper"
                        :style="{ transform: `translateX(-${advdectab === 'sectors' ? 0 : 100}%)` }">
                        <!-- Sectors Tab -->
                        <div class="tab-slide" style="width: 100%; flex-shrink: 0;">
                            <v-card v-for="(i, o) in advdecitems.Sectors.slice(0, 6)" :key="o"
                                @click="i.data && i.data.token && advdecitems.wsdata[i.data.token] ? setSSDtab('Details', i.data.token, 'NSE', advdecitems.wsdata[i.data.token].tsym) : null"
                                width="100%" class="elevation-0 px-3 py-2 rounded-lg" :class="o < 5 ? 'mb-2' : ''"
                                bg-color="secbg" style="background-color: #F1F3F8 !important;">
                                <v-row no-gutters>
                                    <v-col cols="5" sm="4" class="pr-0">
                                        <p class="mb-0fs-14 ">
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
                                                    :id="`ssdad${i.data.token}chpclr`">
                                                    <span :id="`ssdad${i.data.token}ch`" :style="{
                                                        color: advdecitems.wsdata[i.data.token] && advdecitems.wsdata[i.data.token].ch ?
                                                            (Number(advdecitems.wsdata[i.data.token].ch) > 0 ? '#43A833' :
                                                                Number(advdecitems.wsdata[i.data.token].ch) < 0 ? '#FF0000' : '#000000') : '#000000'
                                                    }">{{
                                                        advdecitems.wsdata[i.data.token] ?
                                                            `${advdecitems.wsdata[i.data.token].ch}` :
                                                            "0.00"
                                                    }}</span>
                                                    <span :id="`ssdad${i.data.token}chp`" :style="{
                                                        color: advdecitems.wsdata[i.data.token] && advdecitems.wsdata[i.data.token].chp ?
                                                            (Number(advdecitems.wsdata[i.data.token].chp) > 0 ? '#43A833' :
                                                                Number(advdecitems.wsdata[i.data.token].chp) < 0 ? '#FF0000' : '#000000') : '#000000'
                                                    }"> ({{
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
                                        <v-row no-gutters>
                                            <v-col cols="6" class="pt-1">
                                                <p v-if="i.data.Positive > 0" class="mb-0 lh-16 mt-0 subtitle-2">
                                                    <v-icon color="maingreen" size="18">mdi-arrow-top-right</v-icon>
                                                    {{ i.data.Positive }}
                                                </p>
                                            </v-col>
                                            <v-col cols="6" class="pt-1">
                                                <p v-if="i.data.Negative > 0"
                                                    class="mb-0 lh-16 mt-0 subtitle-2 text-right">
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
                        <!-- Thematic Tab -->
                        <div class="tab-slide" style="width: 100%; flex-shrink: 0;">
                            <v-card v-for="(i, o) in advdecitems.Thematic.slice(0, 6)" :key="o"
                                @click="i.data && i.data.token && advdecitems.wsdata[i.data.token] ? setSSDtab('Details', i.data.token, 'NSE', advdecitems.wsdata[i.data.token].tsym) : null"
                                width="100%" class="elevation-0 px-3 py-1 rounded-lg" :class="o < 5 ? 'mb-2' : ''"
                                bg-color="secbg" style="background-color: #F1F3F8 !important;">
                                <v-row no-gutters>
                                    <!-- duplicate same inner layout -->
                                    <v-col cols="5" sm="4" class="pr-0">
                                        <p class="mb-0  fs-14">
                                            {{ i.title }} <span class="caption subtext-text font-weight-bold">({{ i.data
                                                &&
                                                i.data.sum ?
                                                i.data.sum : ".." }})</span>
                                        </p>
                                        <p class="fs-14 maintext--text font-weight-medium mb-0 lh-16">
                                            <span
                                                v-if="advdecitems.wsdata && i.data && i.data.token && advdecitems.wsdata[i.data.token]">
                                                <span :id="`ssdad${i.data.token}ltp`">₹{{
                                                    advdecitems.wsdata[i.data.token].ltp
                                                    || '0.00'
                                                }}</span> &nbsp;<span class="fs-12"
                                                    :class="getSectorColorClass(i.data.token)"
                                                    :id="`ssdad${i.data.token}chpclr`"><span
                                                        :id="`ssdad${i.data.token}ch`">{{
                                                            advdecitems.wsdata[i.data.token].ch || "0.00"
                                                        }}</span>
                                                    <span :id="`ssdad${i.data.token}chp`"> ({{
                                                        advdecitems.wsdata[i.data.token].chp ?
                                                            `${Number(advdecitems.wsdata[i.data.token].chp).toFixed(2)}` :
                                                            "0.00"
                                                    }}%)</span></span>
                                            </span>
                                            <span v-else class="fs-12">₹0.00 <span class="fs-9"> 0.00
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
                                        <v-row no-gutters>
                                            <v-col cols="6" class="pt-1">
                                                <p v-if="i.data.Positive > 0" class="mb-0 lh-16 mt-2 subtitle-2">
                                                    <v-icon color="maingreen" size="18">mdi-arrow-top-right</v-icon>
                                                    {{ i.data.Positive }}
                                                </p>
                                            </v-col>
                                            <v-col cols="6" class="pt-1">
                                                <p v-if="i.data.Negative > 0"
                                                    class="mb-0 lh-16 mt-2 subtitle-2 text-right">
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
                    </div>
                </div>
                <!-- </template> -->
                <div class="text-center mt-2">
                    <v-btn v-if="advdecitems && (advdecitems.Sectors || advdecitems.Thematic)"
                        @click="$router.push({ name: 'stocks advance decline', params: { abc: advdectab === 'sectors' ? advdecitems.Sectors[0].key : advdecitems.Thematic[0].key, main: advdectab === 'sectors' ? 'Sectors' : 'Thematic' } })"
                        text variant="flat" size="small" block class="text-none primary--text px-2">See all</v-btn>
                </div>
            </v-col>
            <v-col cols="12" sm="6" class="pt-md-0">
                <div class="elevation-0 mx-auto"
                    style="display: flex;justify-content: space-between;align-items: center;width: 90%;">
                    <p class="fs-20 font-weight-bold mb-0" style="flex-grow: 1;">Heatmap</p>
                    <!-- <v-spacer></v-spacer> -->

                    <v-select v-model="treemaps" :items="treemapitem" @update:model-value="setStatavddec()"
                        :readonly="issloading" variant="flat" rounded="pill" density="compact" hide-details bg-color="secbg"
                        class="w-100 rounded-pill fs-14  mb-1 select-left text-left pl-0" style="color: white; max-width: 50%;"></v-select>


                </div>
                <v-card height="500px" width="100%" id="avddecchart"
                    class="crd-trn rounded-lg elevation-0 px-6 pt-1 pb-16 pos-rlt">
                    <div v-if="heatmapError" class="d-flex align-center justify-center pos-abs" style="inset:0;">
                        <div class="text-center">
                            <p class="mb-2 title font-weight-bold">Service temporarily unavailable</p>
                            <p class="mb-4 subtext--text">Unable to load heatmap data. We will retry shortly.</p>
                            <v-btn size="small" color="primary" variant="plain" class="text-none"
                                @click="setStatavddec()">Retry
                                now</v-btn>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-toolbar class="tool-sty elevation-0 my-3" ref="ttt" id="ttt" density="compact" color="transparent">
            <p class="fs-20 font-weight-bold mb-0 mr-3">Today's trade action</p>
            <v-spacer></v-spacer>


            <v-btn @click="scrollToo('market', -600)" width="26px" height="26px" class="mx-2" icon size="small"
                variant="outlined"> <v-icon size="24">mdi-chevron-left</v-icon> </v-btn>
            <v-btn @click="scrollFrom('market', 600)" width="26px" height="26px" class="mr-1" icon size="small"
                variant="outlined"> <v-icon size="24">mdi-chevron-right</v-icon> </v-btn>
        </v-toolbar>


        <div id="market" v-dragscroll.x class="d-inline-flex overflow-x-auto no-scroll mb-12" style="width: 100%">
            <div v-for="(tabel, l) in isloading ? [[], [], [], []] : tradeactionitem" :key="l"
                :class="l == 3 ? 'mr-1' : 'mr-4'">
                <v-card style="border: thin solid #EBEEF0 !important" class="rounded-lg elevation-0" color="cardbg">
                    <v-toolbar class="elevation-0 mb-0 mt-1 px-3" density="compact" color="transparent">
                        <img width="24px" :src="tradeIcons[l]" :alt="tradeLabels[l]" class="mr-2" />
                        <p class="font-weight-bold subtitle-2 mb-0 text-none">
                            {{ l == 3 ? "Most active" : l == 0
                                ? "Top gainer"
                                : l == 1 ? "Top losers" : l == 2 ? "Volume breakout" : "" }}</p>

                        <v-spacer></v-spacer>
                        <v-btn :disabled="isloading" @click="navigateToMarket(l)" text
                            class="text-none px-0 primary--text" size="small">See all</v-btn>
                    </v-toolbar>
                    <v-data-table hide-default-footer fixed-header :loading="isloading"
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

                                <span class="font-weight-medium maintext--text black--text">₹<span
                                        :id="`ssdta${item.token}ltp`"
                                        v-text="item.lp ? Number(item.lp).toFixed(2) : '0.00'"></span></span> <br />
                                <span class="font-weight-medium fs-12 ws-p" :id="`ssdta${item.token}chpclr`"
                                    :style="{ color: item.ch > 0 ? 'green' : item.ch < 0 && 'red' }">
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

        <v-card style="border: thin solid #EBEEF0 !important" variant="outlined" class="rounded-lg mb-8" color="cardbg">
            <v-toolbar ref="smcp" id="smcp" class="elevation-0 my-4 px-3" density="compact" color="transparent">
                <img width="40px" :src="srcmIcon" alt="srcm" class="mr-2" />
                <p class="title fs-20 font-weight-bold mb-0 " style="color: black;">Stock monitor</p>
                <v-spacer></v-spacer>

                <v-row class="d-flex align-center justify-end px-4" no-gutters>
                    <v-select v-model="screent0" :items="screent0item" item-title="text" item-value="value"
                        variant="flat" density="compact" hide-details menu-icon="mdi-chevron-down"
                        :readonly="issloading" class="rounded-pill d-none d-sm-flex text-center mr-3 elevation-0" style="
                        max-width: 180px;
                        height: 36px;
                        background-color: #f1f3f8;
                        color: #000;
                        font-weight: 500;
                        font-size: 14px;
                        padding: 0 15px;
                        border-radius: 9999px;
                        align-items: center;
                        justify-content: center;
                        display: flex;
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        
                        " @update:model-value="getContentlistdata('yes')" />


                    <v-select v-model="screent1" :items="screent1item" item-title="text" item-value="value"
                        variant="flat" density="compact" hide-details menu-icon="mdi-chevron-down"
                        :readonly="issloading" class="rounded-pill d-none d-sm-flex align-center text-center" style="
                            max-width: 140px;
                            height: 36px;
                            background-color: #f1f3f8;
                            color: #000;
                            font-weight: 500;
                            font-size: 14px;
                            padding: 0 15px;
                            text-align: center;
                            border-radius: 9999px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                             margin-top: 0 !important;
                        padding-top: 0 !important;
                        " @update:model-value="getContentlistdata('yes')" />
                </v-row>
            </v-toolbar>

            <v-data-table must-sort :sort-by="['chp']" :sort-desc="[true]" hide-default-footer fixed-header
                :loading="issloading" class="rounded-lg overflow-y-auto" :headers="screenheader" :search="opensearch"
                :items="screentitems" :items-per-page="10">
                <template v-slot:[`item.tsym`]="{ item }">
                    <span @click="setSinglestock(item.tsym.split('-')[0], item)"
                        class="font-weight-medium text-capitalize txt-dec-cust ws-p" style="font-size: 12px !important;"
                        v-text="item.tsym"></span>
                </template>

                <template v-slot:[`item.ltp`]="{ item }">
                    <p class="mb-0 lh-18">
                        <span class="d-none" v-if="!uid">{{ setScrpitCH("", item,
                            "SCR")
                            }}</span>

                        <span class="font-weight-medium maintext--text black--text">₹<span :id="`ssdsc${item.token}ltp`"
                                v-text="item.lp ? Number(item.lp).toFixed(2) : '0.00'"></span></span> <br />
                        <span class="font-weight-medium fs-12 ws-p" :id="`ssdsc${item.token}chpclr`"
                            :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'"
                            :style="{ color: item.ch > 0 ? 'green' : item.ch < 0 ? 'red' : 'gray' }">
                            <span :id="`ssdsc${item.token}ch`" v-text="item.ch ? item.ch : '0.00'"> </span>
                            <span :id="`ssdsc${item.token}chp`"
                                v-text="` (${item.chp ? item.chp : item.pc}%)`"></span></span>
                    </p>
                </template>

                <template v-slot:[`item.vol`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text">{{ item.v ? item.v : "0.00" }}</span>
                </template>
                <template v-slot:[`item.op`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`ssdsc${item.token}op`">{{ item.ap
                        ? item.ap :
                        "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.cp`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`ssdsc${item.token}cp`">{{ item.c ?
                        item.c :
                        "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.high`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`ssdsc${item.token}high`">{{ item.h
                        ? item.h :
                        "0.00"
                    }}</span>
                </template>
                <template v-slot:[`item.low`]="{ item }">
                    <span class="font-weight-medium maintext--text black--text" :id="`ssdsc${item.token}low`">{{ item.l
                        ? item.l :
                        "0.00"
                    }}</span>
                </template>

                <template v-slot:no-data>
                    <v-col v-if="screentidata" cols="12" class="text-center pa-0">
                        <v-container fill-height>
                            <v-btn block class="elevation-0 text-center rounded-xl" height="300px" text
                                color="transparent" @click="getContentlistdata">
                                <div class="mx-auto py-16">
                                    <img width="60px" :src="smIcon" class="mb-3">
                                    <h3 class="primary--text font-weight-medium mb-2 text-none">Stock monitor</h3>
                                    <p class="subtext--text mb-0 text-none">Click to load the Market monitor data</p>
                                </div>
                            </v-btn>
                        </v-container>
                    </v-col>
                    <v-col v-else cols="12" class="text-center pa-16">
                        <div>
                            <img width="80px" :src="noDataFolder" alt="no data" />
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

        <v-row ref="eve" id="eve" class="mb-6">
            <v-col cols="12" md="6" class="py-md-0 ">
                <v-card style="border: thin solid #EBEEF0 !important"
                    class="crd-trn elevation-0 overflow-hidden rounded-lg" width="100%">
                    <div class="px-4 py-4">
                        <p class="font-weight-bold title mb-md-4 mb-6">Corporate Action ({{ allcropact &&
                            allcropact.length > 0
                            ?
                            allcropact.length : ".." }})</p>
                        <div v-if="croploading">
                            <v-container fill-height class="d-flex justify-center align-center">
                                <v-card class=" elevation-0 mx-auto py-16 d-block">
                                    <v-progress-circular size="80" indeterminate color="#1e53e5"></v-progress-circular>

                                </v-card>
                            </v-container>
                        </div>
                        <div v-else-if="allcropact && allcropact.length > 0">
                            <v-card variant="outlined" v-for="(d, e, f) in allcropact.slice(0, 5)" :key="f"
                                class="mb-3 rounded-lg"
                                style="background-color: #F1F3F8 !important;border: none !important;">
                                <v-row no-gutters>
                                    <v-col cols="4" class="pa-3">
                                        <p class="txt-5E6 mb-1 mb-2 font-weight-medium fs-12 text-capitalize">
                                            {{ d.symbol }}
                                        </p>
                                        <p class="maintext--text mb-0 font-weight-medium fs-10 text-capitalize">{{
                                            d.registrar }} <span class="fs-10">({{ d.issueType
                                                }})</span></p>
                                    </v-col>

                                    <v-col cols="4" class="pa-3">
                                        <p class="txt-5E6 mb-1 mb-2 font-weight-medium fs-12 text-capitalize">
                                            Listing date
                                        </p>
                                        <p class="maintext--text mb-0 font-weight-medium fs-10 text-capitalize">{{
                                            d.biddingStartDate ? d.biddingStartDate.slice(0, 5) : "" }} <span
                                                class="fs-10 text-lowercase">to</span> {{ d.biddingEndDate
                                                }}</p>
                                    </v-col>
                                    <v-col cols="4" class="pa-3">
                                        <p class="txt-5E6 mb-1 mb-2 font-weight-medium fs-12 text-capitalize">
                                            Price offered
                                        </p>
                                        <p class="maintext--text mb-0 font-weight-medium fs-10 text-capitalize">₹{{
                                            d.minPrice ? Number(d.minPrice).toFixed(2) : "0.00"
                                            }}</p>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </div>
                        <div v-else-if="allcropact == null">
                            <v-container fill-height>
                                <v-btn block class="elevation-0 text-center rounded-xl" height="200px" text
                                    color="primary" @click="getCorpationaction">
                                    <div class="mx-auto py-16">
                                        <img width="60px" :src="caIcon" class="mb-3">
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
                                <v-card class=" elevation-0 mx-auto py-16 text-center">
                                    <div class="mx-auto ">
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
                <v-card style="border: thin solid #EBEEF0 !important"
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
                                <v-row no-gutters>
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
                                        <img width="60px" :src="newsIcon" class="mb-3">
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

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { dragscroll } from "vue-dragscroll";
import StatBoard from "../StatBoard.vue";
import { getADindice, getADindices, getHLbreakers, getTopList, getConTentList, getLtpdata, getSectordata, getssNews, getCorporateact } from "../../../components/mixins/getAPIdata";
import { useAppStore } from '../../../stores/appStore';
import { useAuthStore } from '../../../stores/authStore';
import { useNavStore } from '../../../stores/navStore';
import { websocketSubscription, websocketUnsubscriptionChain } from '../../../components/mixins/webSocketstream';
import * as echarts from "echarts";
// import datadiskData from '../../../datadiskData.json'
import ic_tg from '@/assets/stocks/tg.svg'
import ic_tl from '@/assets/stocks/tl.svg'
import ic_vb from '@/assets/stocks/vb.svg'
import ic_ma from '@/assets/stocks/ma.svg'
import ic_sect from '@/assets/stocks/sect.svg'
import ic_them from '@/assets/stocks/them.svg'

// Import static assets for production compatibility
import mainCard1 from '@/assets/stocks/main-card-1.svg'
import mainCard2 from '@/assets/stocks/main-card-2.svg'
import mainCard3 from '@/assets/stocks/main-card-3.svg'
import indIcon from '@/assets/stocks/ind.svg'
import srcmIcon from '@/assets/stocks/srcm.svg'
import smIcon from '@/assets/sm_icon.svg'
import apiurl from '../../../apiurl'
import noDataFolder from '@/assets/no data folder.svg'
import caIcon from '@/assets/ca_icon.svg'
import newsIcon from '@/assets/news_icon.svg'

// Router and Theme
const router = useRouter()
const theme = useTheme()

// Reactive data - Authentication
const uid = ref(null)
const mtoken = ref(null)
const stoken = ref(null)

// Storage reset handler - defined at module level for cleanup
let storageResetHandler = null

// Loading states
const tradeaction = ref(0)
const isloading = ref(false)
const issloading = ref(false)
const isssloading = ref(true)
const issssloading = ref(true)

// Search states
const opensearch = ref(null)
const openHsearch = ref(null)

// PDMW Data (Top Indices)
const pdmwdata = ref([
    { exch: "NSE", token: "26000", tsym: "Nifty 50", too: "NIFTY 50" },
    { exch: "NSE", token: "26009", tsym: "Nifty Bank", too: "NIFTY BANK" },
    { exch: "NSE", token: "26017", tsym: "India VIX", too: "" },
    { exch: "BSE", token: "1", tsym: "SENSEX", too: "" },
    { exch: "NSE", token: "26013", tsym: "Nifty Next 50", too: "NIFTY NEXT 50" },
    { exch: "NSE", token: "26060", tsym: "NIFTY MIDCAP 150", too: "NIFTY MIDCAP 150" },
    { exch: "NSE", token: "26062", tsym: "NIFTY SMLCAP 250", too: "NIFTY SMALLCAP 250" },
    { exch: "NSE", token: "26076", tsym: "NIFTY MICROCAP250", too: "NIFTY MICROCAP 250" },
])

// Screener data
const screent0item = ref([
    { text: "Volume & Price Up", value: "VolUpPriceUp" },
    { text: "Volume & Price Down", value: "VolUpPriceDown" },
    { text: "Open High", value: "OpenHigh" },
    { text: "Open Low", value: "OpenLow" },
    { text: "High Break", value: "HighBreak" },
    { text: "Low Break", value: "LowBreak" },
])
const screent0 = ref("VolUpPriceUp")
const screent1item = ref([
    { text: "All", value: "A" },
    { text: "Nifty 50", value: "NIFTY50" },
    { text: "Nifty 500", value: "NIFTY500" },
    { text: "Nifty MIDCAP 50", value: "NIFTYMCAP50" },
    { text: "Nifty SMLCAP 50", value: "NIFTYSMCAP50" },
])
const screent1 = ref("A")
const screentitems = ref([])
const screentidata = ref(true)

// Heatmap data
const treemaps = ref("NIFTY 50")
const treemapitem = ref([
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
])
const heatmapLoading = ref(false)
const heatmapError = ref(false)

// Trade action data
const trader1item = ref([
    { text: "NSE", value: "NSEALL" },
    { text: "NFO", value: "NFOALL" },
])
const trader1 = ref("NSEALL")
const tradeactionitem = ref([[], [], [], []])

// Pre-imported icons for trade action header: 0=tg,1=tl,2=vb,3=ma
const tradeIcons = [ic_tg, ic_tl, ic_vb, ic_ma]
const tradeLabels = ['tg', 'tl', 'vb', 'ma']
// Icons for AD Segments: 0=sect, 1=them
const advIcons = [ic_sect, ic_them]
const advLabels = ['sect', 'them']

// Sector data
const sectoritems = ref([])
const sectorwslist = ref([])
const sectorwapper = ref([])

// Market breakers
const mrkbreakers = ref([])

// Advance/Decline data
const advdecitems = reactive({
    Sectors: [],
    Thematic: [],
    wsdata: {}
})
const advdectab = ref('sectors')

// News data
const totalnews = ref(0)
const allnews = ref(null)
const newsloading = ref(false)

// Corporate action data
const allcropact = ref(null)
const croploading = ref(false)

// Scroll and lifecycle refs
const elscrollview = ref(true)
const unwatchAuth = ref(null)
const sessionCheckInterval = ref(null)
const pdmwdataPollInterval = ref(null)
const heatmapResizeObserver = ref(null)
const visibilityChangeHandler = ref(null)
const windowFocusHandler = ref(null)

// Flag to prevent duplicate fetchInitialIndicesData calls
const initialIndicesDataCalled = ref(false)
const initialIndicesDataPending = ref(false)

// Throttle for setWebsocket calls to prevent rapid successive API calls
const lastSetWebsocketCall = ref(0)
const setWebsocketThrottleMs = 1000 // Minimum 1 second between calls

// State tracking for WebSocket updates (like watchlist)
const lastState = ref({})

// Merge tick data function (like watchlist mergeTick)
const mergeTick = (token, patch) => {
    const prev = lastState.value[token] || {}
    const out = { ...prev }

    // Normalize numbers
    const num = (v) => {
        const n = parseFloat(v)
        return isFinite(n) ? n : undefined
    }

    const ltp = num(patch.ltp ?? patch.lp ?? patch.l)
    const prevClose = num(patch.c ?? patch.prev_close_price ?? patch.close)
    const chIn = num(patch.ch)
    const chpIn = num(patch.chp ?? patch.pc)

    if (typeof ltp !== 'undefined') out.ltp = ltp
    if (typeof prevClose !== 'undefined') out.prevClose = prevClose
    if (typeof chIn !== 'undefined') out.ch = chIn
    if (typeof chpIn !== 'undefined') out.chp = chpIn

    // Derive missing values
    if (typeof out.ch === 'undefined' && typeof out.ltp !== 'undefined' && typeof out.prevClose !== 'undefined') {
        out.ch = out.ltp - out.prevClose
    }
    if (typeof out.chp === 'undefined' && typeof out.ch !== 'undefined' && typeof out.prevClose !== 'undefined' && out.prevClose > 0) {
        out.chp = (out.ch / out.prevClose) * 100
    }

    lastState.value[token] = out
    return out
}

// Computed properties
const tradeheader = computed(() => {
    return [
        { title: "Symbol", key: "tsym", sortable: false, class: "ws-p" },
        { title: "Price", key: "ltp", sortable: false, align: "end", class: "ws-p" },
    ]
})

const highheader = computed(() => {
    return [
        { title: "Symbol", key: "tsym", sortable: false, class: "ws-p" },
        { title: "Last 50 minutes", key: "ltp", sortable: false, width: "80%", class: "ws-p" },
    ]
})

const screenheader = computed(() => {
    return [
        { title: "Symbol", key: "tsym", sortable: false, class: "ws-p" },
        { title: "Price", key: "ltp", sortable: false, align: "end", class: "ws-p" },
        { title: "Open", key: "op", align: "end", class: "ws-p" },
        { title: "High", key: "high", align: "end", class: "ws-p" },
        { title: "Low", key: "low", align: "end", class: "ws-p" },
        { title: "Close", key: "cp", align: "end", class: "ws-p" },
        { title: "Volume", key: "vol", align: "end", class: "ws-p" },
    ]
})
// Watchers
watch(treemaps, () => {
    // Ensure heatmap refreshes whenever the condition changes
    // Avoid overlapping renders
    if (heatmapLoading.value) return
    setStatavddec()
})
// Initialize sectors and thematic data (run once on setup)
advdecitems.Sectors = [
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
]
advdecitems.Thematic = [
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
]

// Lifecycle hooks
onMounted(() => {
    const appStore = useAppStore();
    const authStore = useAuthStore();

    // Check if user is logged in
    let res = sessionStorage.getItem("c3RhdHVz");
    if (res == "dmFsaWR1c2Vy") {
        if (!uid.value && !stoken.value) {
            mtoken.value = sessionStorage.getItem("msession");
            stoken.value = sessionStorage.getItem("usession");
            uid.value = sessionStorage.getItem("userid");
        }

    }

    // Listen for WebSocket price updates
    window.addEventListener('websocket-quote-update', handleQuoteUpdate);

    // Listen for WebSocket connection events (similar to old eventBus)
    window.addEventListener('web-scoketConn', handleWebSocketConnection);

    // Note: We don't load pdmwdata array structure from localStorage to preserve full 8-item default array
    // Only prices are cached/restored, not the array structure itself

    // Don't clear values - just ensure fresh data is fetched
    // Clearing values causes "0.00" to show immediately which is not desired

    // Initialize data loading
    // Subscribe pdmwdata to WebSocket immediately (like Vue 2 line 855)
    // This MUST happen before cache restore to ensure WebSocket subscription is active
    // For logged-in users, subscribe to WebSocket; for non-logged-in users, skip (we use fetchInitialIndicesData instead)
    if (uid.value) {
        setWebsocket("sub", pdmwdata.value, "ssd-pd");
    }

    // Fetch initial indices data on mount (works for both logged in and logged out users)
    // This ensures fresh data is available immediately instead of waiting for WebSocket
    // Always fetch fresh data on page refresh - don't rely on cache
    // Force refresh on page load to ensure we get latest data
    fetchInitialIndicesData(true).then(() => {
        // After fresh data is loaded, cache will be updated with fresh data
        // This ensures next refresh will have recent cache, but we still fetch fresh data
    }).catch((error) => {
        // console.error('Error fetching initial indices data:', error);
        // Retry after a short delay
        setTimeout(() => {
            fetchInitialIndicesData(true);
        }, 1000);
    });
    getADlistdata();
    setStatavddec();
    if (res != "dmFsaWR1c2Vy") {
        getToplistdata();
        getContentlistdata();
    }
    // Load news and corporate actions on mount
    getNews();
    getCorpationaction();
    // Defensive re-subscribe shortly after mount to handle socket warm-up on hard refresh
    // Only for logged-in users (non-logged-in users already have data from fetchInitialIndicesData)
    setTimeout(() => {
        if (uid.value) {
            // Re-subscribe pdmwdata for logged-in users
            setWebsocket('sub', pdmwdata.value, 'ssd-pd');
            if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
            }
        }
        // Note: Removed cache restoration here - fresh data from fetchInitialIndicesData should be used
        // Cache is only used as fallback in fetchInitialIndicesData if API fails
    }, 1200);

    // For non-logged-in users, set up periodic refresh to ensure data stays fresh
    // For logged-in users, WebSocket will handle updates in real-time
    if (!uid.value) {
        // Refresh data every 30 seconds for non-logged-in users
        pdmwdataPollInterval.value = setInterval(() => {
            fetchInitialIndicesData(true);
        }, 30000); // 30 seconds
    }

    // Add visibility change listener to refresh data when tab becomes visible
    visibilityChangeHandler.value = () => {
        if (!document.hidden) {
            // Tab became visible - refresh data to ensure it's up to date
            fetchInitialIndicesData(true);
        }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler.value);

    // Also refresh on window focus (when user switches back to the tab)
    windowFocusHandler.value = () => {
        fetchInitialIndicesData(true);
    };
    window.addEventListener('focus', windowFocusHandler.value);

    checkVisibility();
    // setInterval(() => {
    //   getMrkBreakerdata();
    // }, 50000)
    if (elscrollview.value) {
        nextTick(() => {
            window.addEventListener('scroll', checkVisibility);
        });
    }

    // Phase 1: Watch for uid changes to re-subscribe WebSocket after login
    watch(uid, async (newUid, oldUid) => {
        if (newUid && !oldUid) {
            // User just logged in - re-subscribe WebSocket immediately
            await nextTick();

            // Stop polling interval if it exists (switch from polling to WebSocket)
            if (pdmwdataPollInterval.value) {
                clearInterval(pdmwdataPollInterval.value);
                pdmwdataPollInterval.value = null;
            }

            // Re-subscribe pdmwdata to WebSocket immediately
            setWebsocket("sub", pdmwdata.value, "ssd-pd");

            // Re-subscribe sectors/thematic if data exists
            if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
            }

            // Re-fetch initial data immediately
            await fetchInitialIndicesData();
            await getADlistdata();

            // Defensive re-subscription after short delay to ensure connection is ready
            setTimeout(() => {
                setWebsocket('sub', pdmwdata.value, 'ssd-pd');
                if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                    setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                }
            }, 500);

            // Second re-subscription for robustness
            setTimeout(() => {
                setWebsocket('sub', pdmwdata.value, 'ssd-pd');
                if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                    setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                }
            }, 1200);
        } else if (!newUid && oldUid) {
            // User logged out - clear subscriptions if needed
            // Note: Removed polling for non-logged-in users
            // Data is already available from initial fetch on mount
            // If fresh data is needed, user can refresh the page
        }
    }, { immediate: false });

    // React to login after mount: start data loads and WS without refresh
    const initializeLoggedInData = async () => {
        const loggedIn = sessionStorage.getItem('c3RhdHVz') === 'dmFsaWR1c2Vy'
        const nUid = authStore.uid || sessionStorage.getItem('userid')
        const nMtok = authStore.mtoken || sessionStorage.getItem('msession')

        // Only initialize if we have credentials and they're different from current
        if (loggedIn && nUid && nMtok && (uid.value !== nUid || mtoken.value !== nMtok)) {
            const wasLoggedOut = !uid.value
            uid.value = nUid;
            mtoken.value = nMtok;
            stoken.value = sessionStorage.getItem('usession');

            // Note: We preserve the full 8-item pdmwdata array, not loading from localStorage

            // Stop polling interval if it exists (switch from polling to WebSocket)
            if (pdmwdataPollInterval.value) {
                clearInterval(pdmwdataPollInterval.value);
                pdmwdataPollInterval.value = null;
            }

            // Subscribe and load sections with WebSocket
            if (wasLoggedOut) {
                // First time login on this page
                // CRITICAL: Subscribe pdmwdata IMMEDIATELY after login (like Vue 2 line 855)
                // This ensures WebSocket updates start flowing immediately
                setWebsocket('sub', pdmwdata.value, 'ssd-pd');

                // Fetch initial indices data IMMEDIATELY after login
                // This ensures data is available right away before WebSocket kicks in
                await fetchInitialIndicesData();

                await getADlistdata();
                setStatavddec();
                await getToplistdata();
                await getContentlistdata();

                // CRITICAL: Re-fetch initial data after short delay to ensure we have latest prices
                setTimeout(async () => {
                    await fetchInitialIndicesData();
                    setWebsocket('sub', pdmwdata.value, 'ssd-pd');
                    if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                        setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                    }
                }, 500);

                // Second re-subscription and data fetch for robustness (like Vue 2 timeout pattern)
                setTimeout(async () => {
                    await fetchInitialIndicesData();
                    setWebsocket('sub', pdmwdata.value, 'ssd-pd');
                    if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                        setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                    }
                }, 1500);
            } else {
                // Note: We preserve the full 8-item pdmwdata array, not loading from localStorage

                // Fetch initial indices data immediately after login
                // This ensures data is available right away
                await fetchInitialIndicesData();

                // Re-subscribe WebSocket when credentials change
                // CRITICAL: Always subscribe pdmwdata first (like Vue 2 line 855)
                // This ensures WebSocket updates start flowing immediately after login
                setWebsocket('sub', pdmwdata.value, 'ssd-pd');

                if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                    setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                }
                if (tradeactionitem.value && tradeactionitem.value.length > 0) {
                    const arr = tradeactionitem.value[0]?.concat(tradeactionitem.value[1]?.concat(tradeactionitem.value[2]?.concat(tradeactionitem.value[3] || [])) || []) || [];
                    if (arr.length > 0) {
                        const wsdata = arr.map((o) => ({ exch: o.exch, token: o.token, tsym: o.tsym }));
                        setWebsocket('sub', wsdata, 'ta');
                    }
                }
                if (screentitems.value && screentitems.value.length > 0) {
                    setWebsocket('sub', screentitems.value, 'sc');
                }

                // CRITICAL: Re-subscribe after delay to ensure WebSocket connection is active
                setTimeout(() => {
                    setWebsocket('sub', pdmwdata.value, 'ssd-pd');
                    if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                        setWebsocket('sub', Object.values(advdecitems.wsdata), 'adv');
                    }
                }, 1000);
            }
        }
    };

    // Initialize immediately if already logged in
    nextTick(() => {
        initializeLoggedInData();
    });

    // Watch for login/logout changes
    unwatchAuth.value = watch(
        () => [authStore.uid, authStore.mtoken],
        async ([nUid, nMtok], [oldUid, oldMtok]) => {
            if (nUid && nMtok) {
                // User logged in
                await nextTick();
                await initializeLoggedInData();
            } else if (!nUid && oldUid) {
                // User logged out - clear local uid ref
                uid.value = null;
                mtoken.value = null;
                stoken.value = null;
                // console.log("🔄 User logged out, cleared local uid ref");
            }
        },
        { immediate: false }
    );

    // Listen for storage-reset event (triggered on session expiry)
    storageResetHandler = () => {
        // Clear local uid ref when storage is reset
        uid.value = null;
        mtoken.value = null;
        stoken.value = null;
        // console.log("🔄 Storage reset event received, cleared local uid ref");
    };

    window.addEventListener('storage-reset', storageResetHandler);

    // Also listen for sessionStorage changes (fallback)
    const intervalId = setInterval(() => {
        const loggedIn = sessionStorage.getItem('c3RhdHVz') === 'dmFsaWR1c2Vy'
        if (loggedIn && !uid.value) {
            initializeLoggedInData();
        }
    }, 500);
    sessionCheckInterval.value = intervalId;
})

// Cleanup on unmount
onBeforeUnmount(() => {
    window.removeEventListener('scroll', checkVisibility);
    window.removeEventListener('websocket-quote-update', handleQuoteUpdate);
    window.removeEventListener('web-scoketConn', handleWebSocketConnection);
    // Remove storage-reset listener
    if (storageResetHandler) {
        window.removeEventListener('storage-reset', storageResetHandler);
        storageResetHandler = null;
    }
    if (visibilityChangeHandler.value) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler.value);
        visibilityChangeHandler.value = null;
    }
    // Remove focus handler
    if (windowFocusHandler.value) {
        window.removeEventListener('focus', windowFocusHandler.value);
        windowFocusHandler.value = null;
    }
    if (unwatchAuth.value) {
        unwatchAuth.value();
        unwatchAuth.value = null;
    }
    if (sessionCheckInterval.value) {
        clearInterval(sessionCheckInterval.value);
        sessionCheckInterval.value = null;
    }
    if (pdmwdataPollInterval.value) {
        clearInterval(pdmwdataPollInterval.value);
        pdmwdataPollInterval.value = null;
    }
    if (heatmapResizeObserver.value) {
        try { heatmapResizeObserver.value.disconnect(); } catch (_) { }
        heatmapResizeObserver.value = null;
    }
})

// Methods
// Cache functions for pdmwdata prices
const savePdmwdataCache = () => {
    // Save current pdmwdata prices to cache
    try {
        const cache = {}
        for (let i = 0; i < pdmwdata.value.length; i++) {
            const item = pdmwdata.value[i]
            if (item.token && (item.ltp || item.ch || item.chp)) {
                cache[item.token] = {
                    ltp: item.ltp || null,
                    ch: item.ch || null,
                    chp: item.chp || null,
                    timestamp: Date.now()
                }
            }
        }
        if (Object.keys(cache).length > 0) {
            localStorage.setItem(`${uid.value || 'guest'}_pdmwdata_cache`, JSON.stringify(cache))
        }
    } catch (err) {
        // Silent error handling for cache save
    }
}

const loadPdmwdataCache = () => {
    // Load cached prices for pdmwdata
    try {
        const cacheKey = `${uid.value || 'guest'}_pdmwdata_cache`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }
    } catch (err) {
        // Silent error handling for cache load
    }
    return null
}

const updatePdmwdataFromCache = () => {
    // Restore cached prices to pdmwdata array (only if current value is missing/zero)
    // This is used as a fallback when API fails, not as primary data source
    const cache = loadPdmwdataCache()
    if (cache) {
        // Check cache age - only use if cache is less than 5 minutes old
        const maxCacheAge = 5 * 60 * 1000; // 5 minutes in milliseconds
        const now = Date.now();

        for (let i = 0; i < pdmwdata.value.length; i++) {
            const item = pdmwdata.value[i]
            if (item.token && cache[item.token]) {
                const cached = cache[item.token]
                // Check if cache is too old
                const cacheAge = cached.timestamp ? (now - cached.timestamp) : Infinity;
                if (cacheAge > maxCacheAge) {
                    continue; // Skip old cache entries
                }

                // Only use cache if current value is missing, null, or 0
                // This ensures fresh data always takes precedence
                if (!item.ltp || item.ltp === "0.00" || item.ltp === "0" || item.ltp === 0) {
                    if (cached.ltp) item.ltp = cached.ltp
                }
                if (!item.ch || item.ch === "0.00" || item.ch === "0" || item.ch === 0) {
                    if (cached.ch) item.ch = cached.ch
                }
                if (!item.chp || item.chp === "0.00" || item.chp === "0" || item.chp === 0) {
                    if (cached.chp) item.chp = cached.chp
                }
                // Update DOM elements with cached values
                const ltpTag = document.getElementById(`ssdpd${item.token}ltp`)
                if (ltpTag) {
                    ltpTag.innerHTML = item.ltp || "0.00"
                    const chTag = document.getElementById(`ssdpd${item.token}ch`)
                    const chpTag = document.getElementById(`ssdpd${item.token}chp`)
                    const chpclrTag = document.getElementById(`ssdpd${item.token}chpclr`)
                    if (chTag) chTag.innerHTML = item.ch || "0.00"
                    if (chpTag) chpTag.innerHTML = ` (${item.chp || "0.00"}%)`
                    if (chpclrTag) {
                        const ch = parseFloat(item.ch) || 0
                        chpclrTag.className = ch > 0
                            ? 'd-inline-flex font-weight-medium fs-12 px-2 maingreen--text'
                            : ch < 0
                                ? 'd-inline-flex font-weight-medium fs-12 px-2 mainred--text'
                                : 'd-inline-flex font-weight-medium fs-12 px-2 subtext--text'
                    }
                }
            }
        }
    }
}

const handleQuoteUpdate = (event) => {
    // Handle WebSocket quote updates (like watchlist)
    const data = event.detail;
    if (data) {
        // Check if this quote update is for any token in pdmwdata
        const token = data.token || data.tk;
        const exchange = data.exchange || data.e || data.exch || data.market_segment_id;

        if (token) {
            // Check if this token is in pdmwdata (by token and optionally by exchange)
            const pIndex = pdmwdata.value.findIndex((o) => {
                if (o.token == token) {
                    // If exchange is provided, also match by exchange
                    if (exchange) {
                        return o.exch === exchange;
                    }
                    return true;
                }
                return false;
            });

            if (pIndex >= 0) {
                // This is a pdmwdata token, process the update
                // Use mergeTick to handle data merging (like watchlist)
                optionChainDataParse(data);
            }
        } else {
            // If no token, try to parse anyway (might be for other data)
            optionChainDataParse(data);
        }
    }
}

const handleWebSocketConnection = (event) => {
    // Handle WebSocket connection events (like watchlist handleWebSocketUpdate)
    // Like Vue 2 line 870-874: checks page == "stockDASH" and calls optionChainDataParse
    const detail = event.detail;

    // Handle pdmwdata updates (like watchlist line 2114-2158)
    if (detail && (detail.token || detail.tk)) {
        const data = detail;
        const token = data.token || data.tk;
        const tokenStr = String(token);

        // Update pdmwdata if token matches (like watchlist)
        // Use string comparison to handle both string and number formats
        if (pdmwdata.value && Array.isArray(pdmwdata.value)) {
            const pIndex = pdmwdata.value.findIndex((o) => String(o.token) === tokenStr);
            if (pIndex >= 0 && String(pdmwdata.value[pIndex].token) === tokenStr) {
                // Process the update using optionChainDataParse (which uses mergeTick)
                optionChainDataParse(data);
            }
        }
    }

    // The old implementation expects (data, page) parameters
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail;
        // Check for "stockDASH" like Vue 2, or "stocks" for compatibility
        if ((page === "stockDASH" || page === "stocks" || page === "stockINC") && data) {
            // Handle pdmwdata updates (top indices)
            if (pdmwdata.value && Array.isArray(pdmwdata.value)) {
                // Handle both single data object and array of data
                if (Array.isArray(data)) {
                    // If data is array, process each item
                    for (let i = 0; i < data.length; i++) {
                        if (data[i] && (data[i].token || data[i].tk)) {
                            optionChainDataParse(data[i]);
                        }
                    }
                } else if (data.token || data.tk) {
                    // Single data object
                    optionChainDataParse(data);
                }
            }

            // Handle sectors/thematic updates (advdecitems.wsdata)
            if (page === "stocks" && advdecitems.wsdata && data && (data.token || data.tk)) {
                const token = data.token || data.tk;
                if (advdecitems.wsdata[token]) {
                    // This is a sector/thematic update
                    updateSectorData(data);
                }
            }
        }
    } else if (detail && typeof detail === 'object') {
        // Check if detail has page property
        if (detail.page === "stockDASH" || detail.page === "stocks" || detail.page === "stockINC") {
            // This is a page-specific event
            if (detail.token || detail.tk) {
                optionChainDataParse(detail);
            }
        } else if (detail.token || detail.tk) {
            // Fallback for direct data - check if it matches pdmwdata tokens or sector tokens
            const token = detail.token || detail.tk;
            const tokenStr = String(token);

            // Check if it's a top indices token (pdmwdata) - use string comparison
            const pIndex = pdmwdata.value.findIndex((o) => String(o.token) === tokenStr);
            if (pIndex >= 0) {
                optionChainDataParse(detail);
            }

            // Check if it's a sector/thematic token (advdecitems.wsdata) - use string comparison
            if (advdecitems.wsdata && advdecitems.wsdata[tokenStr]) {
                updateSectorData(detail);
            }
        } else if (detail.t === 'dk' || detail.t === 'df') {
            // Handle WebSocket feed format (t: 'dk' or 'df')
            // Map tk to token, lp to lp, etc.
            const token = detail.tk || detail.token;
            if (token) {
                const tokenStr = String(token);
                // Use string comparison for token matching
                const pIndex = pdmwdata.value.findIndex((o) => String(o.token) === tokenStr);
                if (pIndex >= 0) {
                    // Map WebSocket feed format to optionChainDataParse format
                    const mappedData = {
                        token: token,
                        tk: detail.tk,
                        lp: detail.lp,
                        ch: detail.ch || (detail.lp && detail.c ? detail.lp - detail.c : null),
                        chp: detail.chp || detail.pc || (detail.c && detail.lp ? ((detail.lp - detail.c) / detail.c * 100) : null),
                        c: detail.c,
                        exchange: detail.e,
                        exch: detail.e
                    };
                    optionChainDataParse(mappedData);

                    // Also check if it's a sector/thematic token - use string comparison
                    if (advdecitems.wsdata && advdecitems.wsdata[tokenStr]) {
                        updateSectorData(mappedData);
                    }
                } else {
                    // console.warn('handleWebSocketConnection: WebSocket feed token not found in pdmwdata', tokenStr);
                }
            }
        } else {
            // If no token, try to parse anyway (might be for other data)
            // But only if it's not a page-specific event that we're not handling
            if (!detail.page || detail.page === "stockDASH" || detail.page === "stocks" || detail.page === "stockINC") {
                optionChainDataParse(detail);
            }
        }
    }
}

const checkVisibility = () => {
    const ids = {
        elo: document.getElementById('ttt'),
        elt: document.getElementById('smcp'),
        elr: document.getElementById('eve'),
    };
    if (isVisible(ids.elo) && tradeactionitem.value[0]?.length === 0) {
        getToplistdata();
    }

    if (isVisible(ids.elt) && screentidata.value) {
        screentidata.value = false;
        getContentlistdata();
    }

    if (isVisible(ids.elr)) {
        if (!allnews.value) getNews();
        if (!allcropact.value) getCorpationaction();
        elscrollview.value = false;
    }
}

const isVisible = (el) => {
    if (!el) return false;
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const w = window.innerWidth || document.documentElement.clientWidth;
    const h = window.innerHeight || document.documentElement.clientHeight;
    return top >= 0 && left >= 0 && bottom <= h && right <= w;
}

const setSinglestock = (tsym, item) => {
    if (uid.value) {
        // For logged-in users: use the detailed stocks view with trading features
        let path = [0, item.token, item.exch, item.tsym];
        // Store params for refresh persistence
        
        
        localStorage.setItem('ssdParams', JSON.stringify(path));
        localStorage.setItem('ssdtsym', `${item.exch}:${item.tsym}`);
        localStorage.setItem('ssdtoken', item.token);
        // Use query params to force route change detection
        router.push({
            name: "stocks details",
            params: { val: path },
            query: {
                type: '0',
                token: item.token,
                exch: item.exch,
                tsym: item.tsym
            }
        });
    } else if (item.exch == "NSE" && item.tsym.slice(-2) ==  "EQ" ) {
        router.push(`/stocks/${tsym.toLowerCase()}`);
        console.log("else iffffffffff");
        
    }
    else{
        router.push(`/stocks`);
       
        
    }
}


const scrollToo = (id, value) => {
    const element = document.getElementById(`${id}`);
    element.scrollBy({
        left: value,
        behavior: "smooth",
    });
}

const scrollFrom = (id, value) => {
    const element = document.getElementById(`${id}`);
    element.scrollBy({
        left: value,
        behavior: "smooth",
    });
}

const setScrpitCH = (x, i, a, l) => {
    if (a == "TA") {
        let f = tradeactionitem.value[x].findIndex((o) => o.token == i.token);
        tradeactionitem.value[x][f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0;
        tradeactionitem.value[x][f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0;
    } else if (a == "SCR") {
        let f = screentitems.value.findIndex((o) => o.token == i.token);
        screentitems.value[f]["ch"] = Number(i.lp) && Number(i.c) ? (Number(i.lp) - Number(i.c)).toFixed(2) : 0;
        screentitems.value[f]["chp"] = Number(i.ch) && Number(i.lp) ? ((Number(i.ch) / Number(i.lp)) * 100).toFixed(2) : 0;
    } else if (a == "st" && l < 5) {
        let g = sectorwapper.value.indexOf(`${x}|${l}`);
        if (sectorwslist.value && sectorwslist.value.length == 20) {
            setWebsocket("sub", sectorwslist.value, a);
            sectorwslist.value = [];
        } else if (g == -1) {
            sectorwslist.value.push({ exch: i.Symbol.split(":")[0], token: i.Token ? i.Token : "0" });
            sectorwapper.value.push(`${x}|${l}`);
        }
    }
}

// Fetch initial price data for top indices (pdmwdata)
const fetchInitialIndicesData = async (forceRefresh = false) => {
    // Prevent duplicate calls unless forced refresh
    if (initialIndicesDataPending.value && !forceRefresh) {
        return;
    }

    if (!pdmwdata.value || pdmwdata.value.length === 0) {
        return;
    }

    // Set pending flag
    initialIndicesDataPending.value = true;

    try {
        // Prepare data array for API call
        const indicesData = pdmwdata.value.map(item => ({
            exch: item.exch,
            token: item.token,
            tsym: item.tsym
        }));

        // Fetch LTP data for all indices
        const response = await getLtpdata(indicesData);
        const raw = response?.data;

        if (raw) {
            let anyUpdated = false;
            for (let l = 0; l < pdmwdata.value.length; l++) {
                const item = pdmwdata.value[l];
                const v = raw[item.token];

                if (v) {
                    const newLtp = Number(v.lp).toFixed(2);
                    const newCh = Number(newLtp - Number(v.close)).toFixed(2);
                    const newChp = Number(v.change).toFixed(2);

                    // Always update - don't check if changed, just update
                    // Use object spread to ensure Vue reactivity works properly
                    pdmwdata.value[l] = {
                        ...pdmwdata.value[l],
                        ltp: newLtp,
                        ch: newCh,
                        chp: newChp
                    };
                    anyUpdated = true;

                    // Update DOM elements immediately using nextTick to ensure DOM is ready
                    await nextTick();
                    const ltpTag = document.getElementById(`ssdpd${item.token}ltp`);
                    if (ltpTag) {
                        ltpTag.innerHTML = newLtp;
                        const chTag = document.getElementById(`ssdpd${item.token}ch`);
                        const chpTag = document.getElementById(`ssdpd${item.token}chp`);
                        const chpclrTag = document.getElementById(`ssdpd${item.token}chpclr`);
                        if (chTag) chTag.innerHTML = newCh;
                        if (chpTag) chpTag.innerHTML = ` (${newChp}%)`;
                        if (chpclrTag) {
                            const ch = parseFloat(newCh) || 0;
                            chpclrTag.className = ch > 0
                                ? 'font-weight-medium fs-12 ws-p maingreen--text'
                                : ch < 0
                                    ? 'font-weight-medium fs-12 ws-p mainred--text'
                                    : 'font-weight-medium fs-12 ws-p subtext--text';
                            // Also update inline style for color
                            chpclrTag.style.color = ch > 0 ? '#008000' : ch < 0 ? '#FF0000' : '#000000';
                        }
                    }
                }
            }

            // Save to cache after updating all prices
            if (anyUpdated) {
                savePdmwdataCache();
            }
        } else {
            // Try to load from cache only if API returns no data
            // But only use cache if it's recent (less than 5 minutes old)
            const cache = loadPdmwdataCache();
            if (cache) {
                updatePdmwdataFromCache();
            }
        }
    } catch (error) {
        // console.error('fetchInitialIndicesData: Error fetching initial indices data:', error);
        // Try to load from cache on error, but only if cache is recent
        try {
            const cache = loadPdmwdataCache();
            if (cache) {
                updatePdmwdataFromCache();
            }
        } catch (cacheError) {
            // console.error('fetchInitialIndicesData: Error loading cache:', cacheError);
        }
    } finally {
        // Reset pending flag
        initialIndicesDataPending.value = false;
        initialIndicesDataCalled.value = true;
    }
}

const getToplistdata = async () => {
    tradeactionitem.value = [];
    isloading.value = true;
    let lsto = await getTopList([trader1.value == "NSEALL" ? "NSE" : "NFO", trader1.value, "mostActive"]);
    let lstt = await getTopList([trader1.value == "NSEALL" ? "NSE" : "NFO", trader1.value, "topG_L"]);

    if (lsto.stat == "Ok" && lstt.stat == "Ok") {
        tradeactionitem.value.push(lstt.topGainers);
        tradeactionitem.value.push(lstt.topLosers);
        tradeactionitem.value.push(lsto.byVolume);
        tradeactionitem.value.push(lsto.byValue);

        let arr = tradeactionitem.value[0].concat(tradeactionitem.value[1].concat(tradeactionitem.value[2].concat(tradeactionitem.value[3])));
        let wsdata = [];
        arr.map((o) => wsdata.push({ exch: o.exch, token: o.token, tsym: o.tsym }));
        if (uid.value) {
            setWebsocket("sub", wsdata, "ta");
        }
    }
    isloading.value = false;
}

const getContentlistdata = async (change) => {
    if (change == "yes" && uid.value) {
        setWebsocket("unsub-D", screentitems.value, "sc");
    }
    issloading.value = true;
    screentitems.value = [];
    let data = await getConTentList(["NSE", screent1.value, screent0.value]);
    if (data && data.length > 0) {
        screentitems.value = data.slice(0, 10);
        if (uid.value) {
            setWebsocket("sub", data, "sc");
        }
    }
    screentidata.value = false;
    issloading.value = false;
}

const getSectorlistdata = async () => {
    isssloading.value = true;
    sectoritems.value = [];
    let data = await getSectordata();
    if (data && data.Bank) {
        sectoritems.value.push({ txt: "Banking", data: data.Bank });
        sectoritems.value.push({ txt: "Finance", data: data.Finance });
        sectoritems.value.push({ txt: "Healthcare", data: data.Healthcare });
        sectoritems.value.push({ txt: "Realty", data: data.Realty });
    }
    isssloading.value = false;
}

const getMrkBreakerdata = async () => {
    mrkbreakers.value = [];
    issssloading.value = true;
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
            mrkbreakers.value.push({ tsym: key, data: value });
        });
    }
    // this.mrkbreaker = data;
    issssloading.value = false;
}

const getADlistdata = async () => {
    try {
        let data = await getADindices();

        if (data && data != 500) {
            // Process sectors data with Vue 3 reactivity
            // Always call setStatAD for all sectors, even if API doesn't return data (handles missing data gracefully)
            advdecitems.Sectors.forEach((sector, index) => {
                const processedData = setStatAD(data[sector.key] || null, sector.key);
                advdecitems.Sectors[index].data = processedData;

                // Log missing data for debugging
                if (!data[sector.key]) {
                    // console.warn(`Missing API data for sector: ${sector.key} (${sector.title})`);
                }
            });

            // Process thematic data with Vue 3 reactivity
            // Always call setStatAD for all thematic, even if API doesn't return data
            advdecitems.Thematic.forEach((thematic, index) => {
                const processedData = setStatAD(data[thematic.key] || null, thematic.key);
                advdecitems.Thematic[index].data = processedData;

                // Log missing data for debugging
                if (!data[thematic.key]) {
                    // console.warn(`Missing API data for thematic: ${thematic.key} (${thematic.title})`);
                }
            });

            // Fetch initial LTP data for all sector/thematic indices if they don't have it
            if (Object.keys(advdecitems.wsdata || {}).length > 0) {
                const sectorTokens = Object.values(advdecitems.wsdata).filter(item =>
                    item && item.token && (!item.ltp || item.ltp === '0.00' || item.ltp === null)
                ).map(item => ({
                    exch: item.exch || 'NSE',
                    token: item.token,
                    tsym: item.tsym
                }));

                if (sectorTokens.length > 0) {
                    if (uid.value) {
                        // For logged-in users, subscribe to WebSocket
                        setWebsocket("sub", sectorTokens, "adv");
                        // Re-subscribe after delay to ensure connection is ready
                        setTimeout(() => {
                            setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
                        }, 1200);
                    } else {
                        // For non-logged-in users, fetch LTP data via API
                        try {
                            const ltpData = await getLtpdata(sectorTokens);
                            if (ltpData && ltpData.data) {
                                Object.keys(advdecitems.wsdata).forEach(token => {
                                    const wsItem = advdecitems.wsdata[token];
                                    const apiData = ltpData.data[token];
                                    if (apiData && wsItem) {
                                        const newLtp = Number(apiData.lp || 0).toFixed(2);
                                        const newCh = Number(apiData.lp - apiData.close || 0).toFixed(2);
                                        const newChp = Number(apiData.change || 0).toFixed(2);

                                        wsItem.ltp = newLtp;
                                        wsItem.ch = newCh;
                                        wsItem.chp = newChp;

                                        // Update DOM elements immediately
                                        const ltpTag = document.getElementById(`ssdad${token}ltp`);
                                        if (ltpTag) {
                                            ltpTag.innerHTML = newLtp;
                                            const chTag = document.getElementById(`ssdad${token}ch`);
                                            const chpTag = document.getElementById(`ssdad${token}chp`);
                                            const chpclrTag = document.getElementById(`ssdad${token}chpclr`);
                                            if (chTag) chTag.innerHTML = newCh;
                                            if (chpTag) chpTag.innerHTML = ` (${newChp}%)`;
                                            if (chpclrTag) {
                                                const chp = parseFloat(newChp) || 0;
                                                chpclrTag.className = chp > 0 ? 'maingreen--text' : chp < 0 ? 'mainred--text' : 'subtext--text';
                                            }
                                        }
                                    }
                                });
                            }
                        } catch (error) {
                            // console.error('Error fetching LTP data for sectors:', error);
                        }
                    }
                }

                // Subscribe to WebSocket for real-time updates (for all sectors)
                if (uid.value && Object.keys(advdecitems.wsdata || {}).length > 0) {
                    setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
                    // Re-subscribe after delay to ensure connection is ready
                    setTimeout(() => {
                        setWebsocket("sub", Object.values(advdecitems.wsdata), "adv");
                    }, 1200);
                }
            }

            // Sort by market cap
            advdecitems.Sectors.sort((a, b) => Number(b.data?.marketCap || 0) - Number(a.data?.marketCap || 0));
            advdecitems.Thematic.sort((a, b) => Number(b.data?.marketCap || 0) - Number(a.data?.marketCap || 0));
        } else {
            // console.warn('getADlistdata: Invalid response from getADindices API:', data);
        }
        // Initialize tab only if not yet chosen
        if (advdectab.value === null || advdectab.value === undefined) {
            advdectab.value = 'sectors';
        }
    } catch (error) {
        // console.error('getADlistdata: Error loading sectors/thematic data:', error);
    }
}

const setStatavddec = async () => {
    // graceful handling when API is down
    heatmapLoading.value = true;
    heatmapError.value = false;

    const chartEl = document.getElementById("avddecchart");
    if (chartEl) {
        echarts.dispose(chartEl);
    }

    try {
        let serdata = [];
        let data = await getADindice(treemaps.value);
        if (!data || data == 500 || !Array.isArray(data) || data.length === 0) {
            heatmapError.value = true;
            heatmapLoading.value = false;
            // auto retry after a short delay
            setTimeout(() => setStatavddec(), 30000);
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
        convertData(serdata);
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
                alwaysShowContent: false,
                hideDelay: 0,
                extraCssText: 'max-width: 200px;',
                formatter: function (info) {
                    let value = info.value;
                    return [
                        '<div class="tooltip-title font-weight-bold black--text" style="word-wrap: break-word; white-space: normal;">' + value[4] + "</div>",
                        // 'Market cap: &nbsp;&nbsp;' + Number(value[0]).toFixed(2) + '<br>',
                        '<p class="mb-0 font-weight-medium black--text fs-14" style="white-space: nowrap;">' + `${value[1]}` + "</p>",
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
                            color: theme.global.name.value === 'dark' ? ["#FF1717", "#999", "#1BBC00"] : ["#FF1717", "#999", "#43A833"],
                            colorMappingBy: "value",
                        },
                    ],
                    data: serdata,
                },
            ],
        };
        option && myChart.setOption(option);

        myChart.on("click", function (params) {
            // Hide tooltip immediately on click
            myChart.dispatchAction({
                type: 'hideTip'
            });
            // Use setSSDtab to navigate to stock details with proper parameters
            const stockData = params.value[5];
                if (uid.value) {
                console.log("User not logged in");
                setSSDtab('Details', stockData.token, stockData.exch, stockData.tsym);
            }
             else{

         
            router.push('/stocks');
            
            console.log("0987654321");
             }
            
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
            heatmapResizeObserver.value = new ResizeObserver(() => {
                myChart.resize();
            });
            heatmapResizeObserver.value.observe(chartContainer);
        }
        heatmapLoading.value = false;
        heatmapError.value = false;
    } catch (e) {
        heatmapLoading.value = false;
        heatmapError.value = true;
        setTimeout(() => setStatavddec(), 30000);
    }
}

const convertData = (originList) => {
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
                convertData(node.children);
            }
        }
    }
}

const setStatAD = (data, tsym) => {
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

    // Add to WebSocket data - initialize with API data if available, otherwise use defaults
    if (processedData.token) {
        advdecitems.wsdata[processedData.token] = {
            exch: "NSE",
            token: processedData.token,
            tsym: tsym,
            ltp: data.ltp || data.ltp_price || data.lp || '0.00',
            ch: data.ch || data.change || data.chg || '0.00',
            chp: data.chp || data.change_percent || data.chp || '0.00'
        };
    }

    return processedData;
}

// Helper function to get sector color class (like watchlist)
const getSectorColorClass = (token) => {
    if (!token || !advdecitems.wsdata || !advdecitems.wsdata[token]) {
        return 'subtext--text';
    }
    const chp = parseFloat(advdecitems.wsdata[token].chp) || 0;
    return chp > 0 ? 'maingreen--text' : chp < 0 ? 'mainred--text' : 'subtext--text';
}

// Update sector data from WebSocket (like watchlist updateWatchlistData)
const updateSectorData = (data) => {
    const token = data.token || data.tk;
    if (!token || !advdecitems.wsdata || !advdecitems.wsdata[token]) {
        return;
    }

    // Use mergeTick to merge data (like watchlist)
    const merged = mergeTick(token, data);

    // Update wsdata
    const current = { ...advdecitems.wsdata[token] };
    if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2);
    if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2);
    if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2);

    // Update reactive data using spread operator (like watchlist)
    advdecitems.wsdata[token] = { ...advdecitems.wsdata[token], ...current };

    // Update DOM elements immediately (like watchlist)
    const ltpTag = document.getElementById(`ssdad${token}ltp`);
    if (ltpTag) {
        ltpTag.innerHTML = current.ltp || '0.00';

        const chTag = document.getElementById(`ssdad${token}ch`);
        if (chTag) {
            chTag.innerHTML = current.ch || '0.00';
        }

        const chpTag = document.getElementById(`ssdad${token}chp`);
        if (chpTag) {
            chpTag.innerHTML = ` (${current.chp ? Number(current.chp).toFixed(2) : '0.00'}%)`;
        }

        // Update color class dynamically
        const chpclrTag = document.getElementById(`ssdad${token}chpclr`);
        if (chpclrTag) {
            const chp = parseFloat(current.chp) || 0;
            chpclrTag.className = chp > 0 ? 'maingreen--text' : chp < 0 ? 'mainred--text' : 'subtext--text';
        }
    }
}

const newsPage = (n) => {
    if (n) {
        window.open(n.link, "_blank");
    }
}

const getNews = async () => {
    try {
        newsloading.value = true;
        allnews.value = [];
        totalnews.value = 0;
        let config = await getssNews();
        if (config && config.data && config.data.length > 0) {
            let data = config.data;
            for (let v = 0; v < data.length; v++) {
                data[v]["isdate"] = `${new Date(data[v].pubDate).toDateString().slice(3)} ${new Date(data[v].pubDate).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })} IST`;
                allnews.value.push(data[v]);
            }
            totalnews.value = config.newsCount || 0;
        } else {
            // console.warn('[StocksSrc] getssNews returned no data:', config);
        }
    } catch (error) {
        // console.error('[StocksSrc] Error fetching news:', error);
        allnews.value = [];
        totalnews.value = 0;
    } finally {
        newsloading.value = false;
    }
}

const getCorpationaction = async () => {
    croploading.value = true;
    allcropact.value = [];

    try {
        // Use direct fetch to avoid timeout issues (wait indefinitely for response)
        const response = await fetch(apiurl.iposapi + "getCorporateAction", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: ""
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.corporateAction && data.corporateAction.length > 0) {
                allcropact.value = data.corporateAction;
            }
        }
    } catch (error) {
        // console.error('Error fetching corporate actions:', error);
    }

    croploading.value = false;
}

const setSSDtab = (type, token, exch, tsym) => {
    if (type == "alert") {
        // eventBus.$emit("menudialog", "alert", token, exch, tsym);
    } else if (type == "cGTT") {
        // eventBus.$emit("menudialog", "order-GTT", token, exch, tsym, "b");
    } else {
        // Use query params since route doesn't have :val param defined
        // StocksDetails.vue reads from route.query first, then falls back to localStorage
        try {
            router.push({
                name: "stocks details",
                query: {
                    type: type || 'detail',
                    token: token,
                    exch: exch,
                    tsym: tsym
                }
            }).catch((error) => {
                // console.error('[StocksSrc] Navigation error:', error);
            });
        } catch (error) {
            // console.error('[StocksSrc] Navigation exception:', error);
        }
    }
}

const navigateToAdvanceDecline = (indexName) => {
    if (indexName) {
        router.push({
            name: 'stocks advance decline',
            params: { abc: indexName }
        }).catch((error) => {
            // console.error('[StocksSrc] Navigation error:', error);
        });
    }
}

const navigateToMarket = (categoryIndex) => {
    router.push({
        name: 'stocks market',
        params: { abc: categoryIndex }
    }).catch((error) => {
        // console.error('[StocksSrc] Navigation error:', error);
    });
}



const setWebsocket = async (flow, data, is) => {
    if (uid.value) {
        // User is logged in - emit WebSocket request via event bus
        // Use "stockDASH" as page identifier for pdmwdata (like Vue 2 expects "stockDASH")
        // Use "stocks" for sectors/thematic (adv) to match old code behavior
        const pageId = is === 'ssd-pd' ? 'stockDASH' : (is === 'adv' ? 'stocks' : 'stocks')
        const event = new CustomEvent('web-scoketOn', {
            detail: { flow, data, is, page: pageId }
        });
        window.dispatchEvent(event);
    } else {
        // Throttle API calls for non-logged-in users to prevent rapid successive calls
        const now = Date.now();
        const timeSinceLastCall = now - lastSetWebsocketCall.value;
        if (timeSinceLastCall < setWebsocketThrottleMs) {
            return;
        }
        lastSetWebsocketCall.value = now;

        let raw = await getLtpdata(data);
        raw = raw.data;
        if (is == "ssd-pd" && raw) {
            let anyUpdated = false;
            for (let l = 0; l < pdmwdata.value.length; l++) {
                let v = raw[pdmwdata.value[l].token];
                if (v) {
                    const newLtp = Number(v.lp).toFixed(2);
                    const newCh = Number(newLtp - Number(v.close)).toFixed(2);
                    const newChp = Number(v.change).toFixed(2);

                    // Always update - don't check if changed, just update to trigger reactivity
                    pdmwdata.value[l]["ltp"] = newLtp;
                    pdmwdata.value[l]["ch"] = newCh;
                    pdmwdata.value[l]["chp"] = newChp;
                    anyUpdated = true;

                    // Update DOM elements immediately
                    const ltpTag = document.getElementById(`ssdpd${pdmwdata.value[l].token}ltp`)
                    if (ltpTag) {
                        ltpTag.innerHTML = Number(pdmwdata.value[l].ltp || 0).toFixed(2)
                        const chTag = document.getElementById(`ssdpd${pdmwdata.value[l].token}ch`)
                        const chpTag = document.getElementById(`ssdpd${pdmwdata.value[l].token}chp`)
                        const chpclrTag = document.getElementById(`ssdpd${pdmwdata.value[l].token}chpclr`)
                        if (chTag) chTag.innerHTML = Number(pdmwdata.value[l].ch || 0).toFixed(2)
                        if (chpTag) chpTag.innerHTML = ` (${Number(pdmwdata.value[l].chp || 0).toFixed(2)}%)`
                        if (chpclrTag) {
                            const ch = parseFloat(pdmwdata.value[l].ch) || 0
                            chpclrTag.className = ch > 0
                                ? 'fs-12 font-weight-medium mb-0 maingreen--text'
                                : ch < 0
                                    ? 'fs-12 font-weight-medium mb-0 mainred--text'
                                    : 'fs-12 font-weight-medium mb-0 subtext--text'
                        }
                    }
                }
            }
            // Trigger Vue reactivity by updating array reference
            if (anyUpdated) {
                // Create new array reference to trigger reactivity
                pdmwdata.value = [...pdmwdata.value]
                // Save to cache after updating all prices
                savePdmwdataCache()
            }
        } else if (is == "ta" && raw) {
            for (let x = 0; x < tradeactionitem.value.length; x++) {
                for (let x_is = 0; x_is < tradeactionitem.value[x].length; x_is++) {
                    let data = raw[tradeactionitem.value[x][x_is].token];
                    if (data) {
                        tradeactionitem.value[x][x_is].ltp = Number(data.lp) ? Number(data.lp).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["ch"] = Number(data.lp) && Number(data.close) ? (Number(data.lp) - Number(data.close)).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["chp"] = Number(data.change).toFixed(2);
                        tradeactionitem.value[x][x_is]["vol"] = Number(data.vol).toFixed(2);
                        tradeactionitem.value[x][x_is]["op"] = Number(data.open) ? Number(data.open).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["cp"] = Number(data.close) ? Number(data.close).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["high"] = Number(data.high) ? Number(data.high).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["low"] = Number(data.low) ? Number(data.low).toFixed(2) : 0;
                        tradeactionitem.value[x][x_is]["oi"] = data.oi ? Number(data.oi).toFixed(2) : 0;
                    }
                }
            }
        } else if (is == "adv" && raw) {
            // Phase 2.2: Update sector data from non-logged-in user API response
            var f = Object.entries(advdecitems.wsdata);
            for (let l = 0; l < f.length; l++) {
                let v = raw[f[l][0]];
                if (v && f[l][0]) {
                    const token = f[l][0];
                    const newLtp = Number(v.lp).toFixed(2);
                    const newCh = Number(newLtp - Number(v.close)).toFixed(2);
                    const newChp = Number(v.change).toFixed(2);

                    advdecitems.wsdata[token]["ltp"] = newLtp;
                    advdecitems.wsdata[token]["ch"] = newCh;
                    advdecitems.wsdata[token]["chp"] = newChp;

                    // Update DOM elements immediately
                    const ltpTag = document.getElementById(`ssdad${token}ltp`);
                    if (ltpTag) {
                        ltpTag.innerHTML = newLtp;
                        const chTag = document.getElementById(`ssdad${token}ch`);
                        const chpTag = document.getElementById(`ssdad${token}chp`);
                        const chpclrTag = document.getElementById(`ssdad${token}chpclr`);
                        if (chTag) chTag.innerHTML = newCh;
                        if (chpTag) chpTag.innerHTML = ` (${newChp}%)`;
                        if (chpclrTag) {
                            const chp = parseFloat(newChp) || 0;
                            chpclrTag.className = chp > 0 ? 'maingreen--text' : chp < 0 ? 'mainred--text' : 'subtext--text';
                        }
                    }
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
}

const optionChainDataParse = (data) => {
    // Handle token from data.token or data.tk
    const token = data.token || data.tk;
    if (!token) {
        // console.warn('optionChainDataParse: No token found in data', data);
        return;
    }

    // Convert token to string for reliable comparison (handle string/number mismatch)
    const tokenStr = String(token);

    // Check if it's a top indices token (pdmwdata)
    // Use string comparison to handle both string and number token formats
    let p = pdmwdata.value.findIndex((o) => String(o.token) === tokenStr);
    if (p >= 0 && String(pdmwdata.value[p].token) === tokenStr) {
        // Use mergeTick to merge data (like watchlist)
        const merged = mergeTick(token, data);

        // Create updated item with merged data
        const current = { ...pdmwdata.value[p] };
        if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2);
        if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2);
        if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2);

        // Update reactive data using spread operator (like watchlist)
        pdmwdata.value[p] = { ...pdmwdata.value[p], ...current };

        // Update DOM elements immediately (like watchlist)
        const ltpTag = document.getElementById(`ssdpd${token}ltp`);
        if (ltpTag) {
            // Update ltp
            ltpTag.innerHTML = current.ltp || "0.00";

            // Update ch
            const chTag = document.getElementById(`ssdpd${token}ch`);
            if (chTag) {
                chTag.innerHTML = current.ch || "0.00";
            }

            // Update chp
            const chpTag = document.getElementById(`ssdpd${token}chp`);
            if (chpTag) {
                chpTag.innerHTML = ` (${current.chp || "0.00"}%)`;
            }

            // Update color class dynamically (like watchlist)
            const chpclrTag = document.getElementById(`ssdpd${token}chpclr`);
            if (chpclrTag) {
                const ch = parseFloat(current.ch) || 0;
                chpclrTag.className = ch > 0
                    ? 'fs-12 font-weight-medium mb-0 maingreen--text'
                    : ch < 0
                        ? 'fs-12 font-weight-medium mb-0 mainred--text'
                        : 'fs-12 font-weight-medium mb-0 subtext--text';
            }
        }

        // Trigger Vue reactivity by updating array reference (like watchlist)
        pdmwdata.value = [...pdmwdata.value];

        // Save to cache after update
        savePdmwdataCache();
    }

    // Check if it's a sector token (advdecitems.wsdata)
    // Use string comparison for token matching
    if (advdecitems.wsdata && advdecitems.wsdata[tokenStr]) {
        updateSectorData(data);
    }
    let s = screentitems.value.findIndex((o) => o.token == token);
    if (s >= 0 && screentitems.value[s].token == token) {
        // Handle ltp
        if (data.lp !== undefined && data.lp !== null) {
            screentitems.value[s].ltp = Number(data.lp).toFixed(2);
        } else if (data.ltp !== undefined && data.ltp !== null) {
            screentitems.value[s].ltp = Number(data.ltp).toFixed(2);
        } else if (data.l !== undefined && data.l !== null) {
            screentitems.value[s].ltp = Number(data.l).toFixed(2);
        }

        // Handle ch
        if (data.ch !== undefined && data.ch !== null) {
            screentitems.value[s]["ch"] = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2);
        } else if (data.c !== undefined && data.c !== null && data.lp !== undefined && data.lp !== null) {
            const change = Number(data.lp) - Number(data.c);
            screentitems.value[s]["ch"] = change > 0 || change < 0 ? change.toFixed(2) : (0).toFixed(2);
        }

        // Handle chp
        if (data.chp !== undefined && data.chp !== null) {
            screentitems.value[s]["chp"] = Number(data.chp).toFixed(2);
        } else if (data.c !== undefined && data.c !== null && screentitems.value[s]["ch"]) {
            const closePrice = Number(data.c);
            if (closePrice > 0) {
                const changePercent = (Number(screentitems.value[s]["ch"]) / closePrice) * 100;
                screentitems.value[s]["chp"] = changePercent.toFixed(2);
            }
        }

        // Handle volume
        if (data.volume !== undefined && data.volume !== null) {
            screentitems.value[s]["vol"] = Number(data.volume);
        } else if (data.vol !== undefined && data.vol !== null) {
            screentitems.value[s]["vol"] = Number(data.vol);
        }

        // Handle open price
        if (data.open_price !== undefined && data.open_price !== null) {
            screentitems.value[s]["op"] = Number(data.open_price) ? Number(data.open_price).toFixed(2) : (0).toFixed(2);
        } else if (data.open !== undefined && data.open !== null) {
            screentitems.value[s]["op"] = Number(data.open) ? Number(data.open).toFixed(2) : (0).toFixed(2);
        }

        // Handle close price
        if (data.prev_close_price !== undefined && data.prev_close_price !== null) {
            screentitems.value[s]["cp"] = Number(data.prev_close_price) ? Number(data.prev_close_price).toFixed(2) : (0).toFixed(2);
        } else if (data.close !== undefined && data.close !== null) {
            screentitems.value[s]["cp"] = Number(data.close) ? Number(data.close).toFixed(2) : (0).toFixed(2);
        } else if (data.c !== undefined && data.c !== null) {
            screentitems.value[s]["cp"] = Number(data.c) ? Number(data.c).toFixed(2) : (0).toFixed(2);
        }

        // Handle high price
        if (data.high_price !== undefined && data.high_price !== null) {
            screentitems.value[s]["high"] = Number(data.high_price) ? Number(data.high_price).toFixed(2) : (0).toFixed(2);
        } else if (data.high !== undefined && data.high !== null) {
            screentitems.value[s]["high"] = Number(data.high) ? Number(data.high).toFixed(2) : (0).toFixed(2);
        }

        // Handle low price
        if (data.low_price !== undefined && data.low_price !== null) {
            screentitems.value[s]["low"] = Number(data.low_price) ? Number(data.low_price).toFixed(2) : (0).toFixed(2);
        } else if (data.low !== undefined && data.low !== null) {
            screentitems.value[s]["low"] = Number(data.low) ? Number(data.low).toFixed(2) : (0).toFixed(2);
        }

        let tag = document.getElementById(`ssdsc${token}ltp`);
        if (tag) {
            document.getElementById(`ssdsc${token}ltp`).innerHTML = screentitems.value[s].ltp;
            const chTag = document.getElementById(`ssdsc${token}ch`);
            const chpTag = document.getElementById(`ssdsc${token}chp`);
            const opTag = document.getElementById(`ssdsc${token}op`);
            const cpTag = document.getElementById(`ssdsc${token}cp`);
            const highTag = document.getElementById(`ssdsc${token}high`);
            const lowTag = document.getElementById(`ssdsc${token}low`);
            if (chTag) chTag.innerHTML = screentitems.value[s].ch;
            if (chpTag) chpTag.innerHTML = ` (${screentitems.value[s].chp}%)`;
            if (opTag) opTag.innerHTML = screentitems.value[s].op;
            if (cpTag) cpTag.innerHTML = screentitems.value[s].cp;
            if (highTag) highTag.innerHTML = screentitems.value[s].high;
            if (lowTag) lowTag.innerHTML = screentitems.value[s].low;
        }
    }
    if (tradeactionitem.value.length == 4) {
        let o = tradeactionitem.value[0].findIndex((o) => o.token == token);
        let t = tradeactionitem.value[1].findIndex((o) => o.token == token);
        let r = tradeactionitem.value[2].findIndex((o) => o.token == token);
        let f = tradeactionitem.value[3].findIndex((o) => o.token == token);

        if (o >= 0 || t >= 0 || r >= 0 || f >= 0) {
            for (let x = 0; x < tradeactionitem.value.length; x++) {
                let x_is = x == 0 && o >= 0 ? o : x == 1 && t >= 0 ? t : x == 2 && r >= 0 ? r : x == 3 && f >= 0 ? f : null;
                if (x_is >= 0 && tradeactionitem.value[x] && tradeactionitem.value[x][x_is] && tradeactionitem.value[x][x_is].token == token) {
                    tradeactionitem.value[x][x_is].ltp = Number(data.lp).toFixed(2);
                    tradeactionitem.value[x][x_is]["ch"] = Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2);
                    tradeactionitem.value[x][x_is]["chp"] = Number(data.chp).toFixed(2);
                    tradeactionitem.value[x][x_is]["vol"] = Number(data.volume);

                    let tag = document.getElementById(`ssdta${token}ltp`);
                    if (tag) {
                        document.getElementById(`ssdta${token}ltp`).innerHTML = tradeactionitem.value[x][x_is].ltp;
                        const chTag = document.getElementById(`ssdta${token}ch`);
                        const chpTag = document.getElementById(`ssdta${token}chp`);
                        if (chTag) chTag.innerHTML = tradeactionitem.value[x][x_is].ch;
                        if (chpTag) chpTag.innerHTML = ` (${tradeactionitem.value[x][x_is].chp}%)`;
                    }
                    let tagv = document.getElementById(`ssdta${token}vol`);
                    if (tagv) {
                        document.getElementById(`ssdta${token}vol`).innerHTML = `Vol. : ${tradeactionitem.value[x][x_is].vol}`;
                    }
                }
            }
        }
    }
    if (advdecitems && advdecitems.wsdata) {
        var f = Object.entries(advdecitems.wsdata);
        let a = f.findIndex((o) => o[0] == data.token);
        if (a >= 0 && advdecitems.wsdata[f[a][0]] && advdecitems.wsdata[f[a][0]].token == data.token) {
            // Update reactive data
            const tokenKey = f[a][0];
            const updatedData = {
                ...advdecitems.wsdata[tokenKey],
                ltp: Number(data.lp).toFixed(2),
                ch: Number(data.ch) > 0 || Number(data.ch) < 0 ? Number(data.ch).toFixed(2) : (0).toFixed(2),
                chp: Number(data.chp).toFixed(2)
            };
            advdecitems.wsdata[tokenKey] = updatedData;

            // DOM updates for immediate rendering (backup)
            nextTick(() => {
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
        if (advdectab.value == null || advdectab.value === undefined) {
            advdectab.value = 'sectors';
        }
    }
}
</script>

<style>
.black--text {
    color: black !important;
}

/* Ensure ECharts container stretches fully */
#avddecchart {
    width: 100% !important;
}

#avddecchart>div {
    width: 100% !important;
}



.v-field__input {
    justify-content: center !important;
}

.v-select__selection-text {
    text-align: center;
}

.v-field__append-inner {
    margin-right: 4px;
}

.custom-pill-select .v-field__input {
    justify-content: center !important;
    /* centers the text horizontally */
    padding: 0 8px !important;
}

.custom-pill-select .v-select__selection-text {
    text-align: center !important;
}

.custom-pill-select .v-field__append-inner {
    margin-right: 4px !important;
    /* small right padding for the icon */
}

.custom-pill-select .v-field {
    box-shadow: none !important;
    /* remove shadow when focused */
}

.custom-pill-select .v-field__outline {
    display: none !important;
    /* hides default Vuetify border */
}



/* Tab Slider Effect */
.tab-slider-container {
    overflow: hidden;
    position: relative;
    width: 100%;
}

.tab-slider-wrapper {
    display: flex;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
}

.tab-slide {
    width: 100%;
    flex-shrink: 0;
}

.select-left .v-select__selection-text {
    text-align: left !important;
    justify-content: flex-start !important;
}
.select-left .v-field__input {
    justify-content: flex-start !important;
      font-size: 14px !important;
}

.select-left .v-select__selection-text {
    text-align: left !important;
}
</style>
