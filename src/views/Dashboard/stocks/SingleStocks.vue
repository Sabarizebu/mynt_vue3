<template>
    <div>
        <div class="overflow-y-auto h91vh ss-cust-scroll overflow-x-hidden" @scroll.passive="handleScroll">
            <div class="body-part">
                <div class="mb-6 pos-rlt">
                    <!-- Desktop Navigation Tabs -->
                    <v-toolbar class="d-none d-md-block px-0 pos-stk z-i3" style="top: 0px" flat dense color="cardbg">
                        <v-tabs v-model="bodytab" @update:model-value="setbodyTab" color="maintext" show-arrows
                            density="compact">
                            <v-tab v-for="(t, index) in dashitems" :key="index" class="text-none text-start min-w-fit">
                                <span class="text-center tab-txt">{{ t.txt }}</span>
                            </v-tab>
                        </v-tabs>
                    </v-toolbar>

                    <v-divider class="mb-md-4 mb-3 d-none d-md-flex pos-stk z-i3" style="top: 48px"></v-divider>

                    <div>
                        <!-- Overview Section -->
                        <v-card id="overview" :loading="mainloader" class="crd-trn ss-cards overflow-hidden mb-md-6"
                            width="100%">
                            <!-- Company Header -->
                            <v-card color="secbg" class="elevation-0 rounded-0 pt-2 px-md-2 px-3">
                                <v-row no-gutters>
                                    <v-col cols="12" md="7" class="pb-1 pb-md-2">
                                        <v-list-item class="px-0 px-md-4">
                                            <template v-slot:prepend>
                                                <v-avatar color="#fbfbfb" size="56">
                                                    <img v-if="imageicon" :src="imageicon" @error="imageLoadError"
                                                        class="pa-1" :alt="imageicon" width="100%" />
                                                    <span class="headline font-weight-bold" v-else>
                                                        {{ menudata[0] ? (menudata[0].cname ? menudata[0].cname :
                                                            menudata[0].symname).slice(0, 1) : "" }}
                                                    </span>
                                                </v-avatar>
                                            </template>

                                            <v-list-item-title :class="menudata[0] ? 'maintext--text' : 'txt-trn'"
                                                class="fs-18 font-weight-bold mb-0 text-capitalize lh-14">
                                                {{ menudata[0] ? menudata[0].cname : "Loading..." }}
                                            </v-list-item-title>

                                            <v-chip-group class="my-0 py-0">
                                                <v-chip label size="small" color="cardbg"
                                                    class="font-weight-medium fs-10">
                                                    {{ menudata.f ? menudata.f.industry : "Industry" }}
                                                </v-chip>
                                                <v-chip label size="small" color="cardbg"
                                                    class="font-weight-medium fs-10">
                                                    {{ menudata.f ? menudata.f.market_cap_type : "Market cap type" }}
                                                </v-chip>
                                            </v-chip-group>
                                        </v-list-item>
                                    </v-col>

                                    <v-col cols="12" md="5"
                                        class="text-md-right text-left pt-0 pt-md-5 pb-2 pl-4 pl-md-3">
                                        <p class="mb-0 mr-md-4 subtitle-1 font-weight-bold lh-24">
                                            {{ menudata.g && Number(menudata.g.lp) ?
                                                `₹${Number(menudata.g.lp).toFixed(2)}` : "0.00" }}
                                            <br class="d-none d-md-block" />
                                            <span class="fs-12" :class="priceChangeClass">
                                                {{ menudata.ch ? `${menudata.ch}` : "0.00" }}
                                                ({{ menudata.g ? `${menudata.g.change}` : "0.00" }}%)
                                            </span>
                                        </p>
                                    </v-col>
                                </v-row>
                            </v-card>

                            <!-- Price Chart Section -->
                            <div class="py-3 py-md-6">
                                <v-toolbar class="nav-drawer elevation-0 px-md-2 px-0 crd-trn" density="compact">
                                    <p class="wid-160 font-weight-bold title mb-0">Price Chart</p>
                                    <v-spacer></v-spacer>
                                </v-toolbar>
                                <v-divider></v-divider>

                                <v-row class="pt-md-6 pb-md-3 pl-md-6 pr-md-8 flex-column-reverse flex-md-row">
                                    <!-- Key Metrics -->
                                    <v-col cols="12" md="4" class="px-7 px-md-3">
                                        <v-row no-gutters>
                                            <v-col cols="6">
                                                <v-list-item class="px-0">
                                                    <v-list-item-subtitle
                                                        class="font-weight-regular fs-10 subtext--text mb-2">Market
                                                        Cap</v-list-item-subtitle>
                                                    <v-list-item-title
                                                        class="maintext--text font-weight-medium fs-12 mb-1">
                                                        {{ menudata.f ?
                                                            `${Number(menudata.f.market_cap).toLocaleString()}` : "0.00" }}
                                                        Cr
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                            </v-col>

                                            <v-col cols="6">
                                                <v-list-item class="px-0">
                                                    <v-list-item-subtitle
                                                        class="font-weight-regular fs-10 subtext--text mb-2">Volume</v-list-item-subtitle>
                                                    <v-list-item-title
                                                        class="maintext--text font-weight-medium fs-12 mb-1">
                                                        {{ menudata[0] && menudata[0].v ?
                                                            `${Number(menudata[0].v).toLocaleString()}` : "0.00" }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                            </v-col>

                                            <v-col cols="6">
                                                <v-list-item class="px-0">
                                                    <v-list-item-subtitle
                                                        class="font-weight-regular fs-10 subtext--text mb-2">Open</v-list-item-subtitle>
                                                    <v-list-item-title
                                                        class="maintext--text font-weight-medium fs-12 mb-1">
                                                        {{ menudata[0] && Number(menudata[0].o) ?
                                                            `₹${Number(menudata[0].o).toFixed(2)}` : "0.00" }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                            </v-col>

                                            <v-col cols="6">
                                                <v-list-item class="px-0">
                                                    <v-list-item-subtitle
                                                        class="font-weight-regular fs-10 subtext--text mb-2">Close</v-list-item-subtitle>
                                                    <v-list-item-title
                                                        class="maintext--text font-weight-medium fs-12 mb-1">
                                                        {{ menudata[0] && Number(menudata[0].c) ?
                                                            `₹${Number(menudata[0].c).toFixed(2)}` : "0.00" }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                            </v-col>

                                            <!-- High-Low Range -->
                                            <v-col cols="12">
                                                <p class="font-weight-regular fs-10 subtext--text mb-0">High - Low</p>
                                                <div class="d-flex flex-row mb-1">
                                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24">
                                                        {{ menudata[0] && Number(menudata[0].h) ?
                                                            `₹${Number(menudata[0].h).toFixed(2)}` : "0.00" }}
                                                    </span>
                                                    <v-card v-if="menudata[0]" width="100%"
                                                        class="crd-trn elevation-0 px-2">
                                                        <v-slider hide-details thumb-color="maintext" color="subtext"
                                                            :model-value="menudata[0].lp" readonly
                                                            :min="Number(menudata[0].l)" :max="Number(menudata[0].h)"
                                                            track-color="maintext"></v-slider>
                                                    </v-card>
                                                    <span
                                                        class="maintext--text font-weight-medium fs-12 pt-1 lh-24 float-right">
                                                        {{ menudata[0] && Number(menudata[0].l) ?
                                                            `₹${Number(menudata[0].l).toFixed(2)}` : "0.00" }}
                                                    </span>
                                                </div>
                                                <v-divider></v-divider>
                                            </v-col>

                                            <!-- 52 Week Range -->
                                            <v-col cols="12">
                                                <p class="font-weight-regular fs-10 subtext--text mb-0">52 Weeks high -
                                                    52 Weeks low</p>
                                                <div class="d-flex flex-row mb-1">
                                                    <span class="maintext--text font-weight-medium fs-12 pt-1 lh-24">
                                                        {{ menudata[0] && Number(menudata[0].wk52_h) ?
                                                            `₹${Number(menudata[0].wk52_h).toFixed(2)}` :
                                                            "0.00" }}
                                                    </span>
                                                    <v-card v-if="menudata[0]" width="100%"
                                                        class="crd-trn elevation-0 px-2">
                                                        <v-slider hide-details thumb-color="maintext" color="subtext"
                                                            :model-value="menudata[0].lp" readonly
                                                            :min="Number(menudata[0].wk52_l)"
                                                            :max="Number(menudata[0].wk52_h)"
                                                            track-color="maintext"></v-slider>
                                                    </v-card>
                                                    <span
                                                        class="maintext--text font-weight-medium fs-12 pt-1 lh-24 float-right">
                                                        {{ menudata[0] && Number(menudata[0].wk52_l) ?
                                                            `₹${Number(menudata[0].wk52_l).toFixed(2)}` :
                                                            "0.00" }}
                                                    </span>
                                                </div>
                                                <v-divider></v-divider>
                                            </v-col>
                                        </v-row>
                                    </v-col>

                                    <!-- TradingView Chart -->
                                    <v-col cols="12" md="8" class="pa-md-0 pt-4 pb-0 px-6">
                                        <v-card class="elevation-0 rounded-0 ss-adv-chart" v-if="menudata[0]">
                                            <iframe v-if="chartUrl" :src="chartUrl" class="brd-0" width="100%"
                                                height="100%"></iframe>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </div>

                            <!-- Stock Overview & Returns -->
                            <div class="px-md-6 px-4">
                                <v-divider class="mb-4 d-none d-md-flex"></v-divider>
                                <p class="font-weight-bold title mb-1 text-capitalize">
                                    {{ menudata[0] ? menudata[0].symname : "" }} Stock overview
                                </p>
                                <p class="fs-12 subtext--text txt-x-j">{{ menudata.d ? menudata.d : "" }}</p>

                                <p class="font-weight-bold subtitle-2 mb-1">Returns</p>
                                <v-row no-gutters class="mt-0 pb-6">
                                    <v-col cols="6" md="2" v-for="(r, l) in stockreturns" :key="l" class="pt-0">
                                        <v-card :color="r.returns > 0 ? 'secgreen' : r.returns < 0 ? 'secred' : 'secbg'"
                                            class="rounded-lg px-3 py-2 elevation-0 brd-1-solid-ccc text-center"
                                            width="100%">
                                            <p :class="returnsClass(r.returns)" class="fs-18 font-weight-bold mb-2">
                                                {{ Number(r.returns) ? r.returns : "0.00" }}%
                                            </p>
                                            <p class="mb-0 fs-10 text-uppercase font-weight-medium">
                                                {{ r.type ? r.type : "---" }}
                                            </p>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-card>

                        <!-- Fundamental Ratios Section -->
                        <v-card id="fun" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                            <div class="py-3 py-md-6">
                                <v-toolbar class="elevation-0 px-md-2 px-0 crd-trn" density="compact">
                                    <v-list-item class="px-0">
                                        <v-list-item-title class="font-weight-bold title mb-2">Fundamental
                                            ratios</v-list-item-title>
                                        <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">
                                            Fundamental breakdown of {{ menudata[0] ? menudata[0].symname : "" }}
                                            information
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                </v-toolbar>

                                <v-row class="px-4 px-md-6 mt-md-4 mt-2">
                                    <v-col cols="4" class="pb-0" v-for="(t, d, l) in Fundamentalsfield" :key="l">
                                        <v-text-field class="funda-field" readonly color="maintext" :label="d"
                                            :model-value="t ? t : '-'" variant="outlined"
                                            density="compact"></v-text-field>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-card>

                        <!-- Financials Section -->
                        <v-card id="fin" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                            <div class="pt-md-6 pt-4 px-4 px-md-6">
                                <v-list-item class="px-0">
                                    <v-list-item-title class="font-weight-bold title mb-2">Financial</v-list-item-title>
                                    <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">
                                        Financial breakdown of {{ menudata[0] ? menudata[0].symname : "" }} information
                                    </v-list-item-subtitle>
                                </v-list-item>
                                <v-chip-group v-model="financialtab" mandatory class="mb-2"
                                    @update:model-value="setFinchartdata">
                                    <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                                        :color="financialtab == 0 ? 'maintext' : 'subtext'">Income</v-chip>
                                    <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                                        :color="financialtab == 1 ? 'maintext' : 'subtext'">Balance Sheet</v-chip>
                                    <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                                        :color="financialtab == 2 ? 'maintext' : 'subtext'">Cashflow</v-chip>
                                </v-chip-group>
                            </div>
                            <v-card height="420px" id="financialchart"
                                class="crd-trn rounded-lg pt-4 elevation-0"></v-card>
                            <div class="pb-4 px-md-6 px-4">
                                <v-divider class="my-md-6 my-3"></v-divider>
                                <v-toolbar flat density="compact" class="tool-sty crd-trn">
                                    <v-list-item class="px-0">
                                        <v-list-item-title class="font-weight-bold fs-16">
                                            {{ financialStatementTitle }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="subtext--text font-weight-medium fs-12">All Figures
                                            in
                                            Cr.</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-spacer></v-spacer>
                                    <v-select v-model="fin_fiter" @update:model-value="setFinchartdata" hide-details
                                        append-inner-icon="mdi-chevron-down"
                                        :items="[{ title: 'Standalone', value: 'stockFinancialsStandalone' }, { title: 'Consolidated', value: 'stockFinancialsConsolidated' }]"
                                        item-title="title" item-value="value" class="rounded-pill max-w-160"
                                        density="compact" variant="solo" flat bg-color="secbg"
                                        label="Filter"></v-select>
                                </v-toolbar>
                            </div>
                            <v-data-table :headers="financialheader"
                                :items="financialitem[fin_fiter] ? (financialtab == 0 ? financialitem[fin_fiter].incomeSheet : financialtab == 1 ? financialitem[fin_fiter].balanceSheet : financialitem[fin_fiter].cashflowSheet) : []"
                                :search="financialsearch" class="financialtabel rounded-0" :items-per-page="-1"
                                hide-default-footer>
                                <template v-slot:[`item.exp`]="{ item }">
                                    <span class="font-weight-medium maintext--text text-capitalize"
                                        :class="finKeyname(item.name).includes('-') ? 'mainred--text' : ''">{{
                                            finKeyname(item.name) }}</span>
                                </template>
                                <template v-slot:[`item.y1`]="{ item }">
                                    <span :class="item.y1 < 0 ? 'mainred--text' : ''">
                                        {{ item.sym == "₹" ? item.sym : "" }}{{ item.y1 }}{{ item.sym == "%" ? item.sym
                                            : "" }}
                                    </span>
                                </template>
                                <template v-slot:[`item.y2`]="{ item }">
                                    <span :class="item.y2 < 0 ? 'mainred--text' : ''">
                                        {{ item.sym == "₹" ? item.sym : "" }}{{ item.y2 }}{{ item.sym == "%" ? item.sym
                                            : "" }}
                                    </span>
                                </template>
                                <template v-slot:[`item.y3`]="{ item }">
                                    <span :class="item.y3 < 0 ? 'mainred--text' : ''">
                                        {{ item.sym == "₹" ? item.sym : "" }}{{ item.y3 }}{{ item.sym == "%" ? item.sym
                                            : "" }}
                                    </span>
                                </template>
                                <template v-slot:[`item.y4`]="{ item }">
                                    <span :class="item.y4 < 0 ? 'mainred--text' : ''">
                                        {{ item.sym == "₹" ? item.sym : "" }}{{ item.y4 }}{{ item.sym == "%" ? item.sym
                                            : "" }}
                                    </span>
                                </template>
                                <template v-slot:[`item.y5`]="{ item }">
                                    <span :class="item.y5 < 0 ? 'mainred--text' : ''">
                                        {{ item.sym == "₹" ? item.sym : "" }}{{ item.y5 }}{{ item.sym == "%" ? item.sym
                                            : "" }}
                                    </span>
                                </template>
                            </v-data-table>
                        </v-card>

                        <!-- Peers Section -->
                        <v-card id="peers" class="crd-trn ss-cards overflow-hidden mb-md-6 pt-6" width="100%">
                            <v-toolbar class="elevation-0 px-md-2 px-0 crd-trn" density="compact">
                                <v-list-item class="px-0">
                                    <v-list-item-title class="font-weight-bold title mb-2">Peers
                                        Comparison</v-list-item-title>
                                    <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">
                                        Peers Comparison breakdown of {{ peeritem[0] ? peeritem[0].industry : "" }}
                                        information
                                    </v-list-item-subtitle>
                                </v-list-item>
                                <v-spacer></v-spacer>
                                <v-text-field v-model="peersearch" hide-details prepend-inner-icon="mdi-magnify"
                                    label="Search" class="rounded-pill mb-2 d-none d-md-flex" density="compact"
                                    variant="solo" flat bg-color="secbg"></v-text-field>
                            </v-toolbar>
                            <v-data-table :headers="peerheader" :items="peeritem" :search="peersearch"
                                class="rounded-0 overflow-y-auto mt-4" hide-default-footer>
                                <template v-slot:[`item.SYMBOL`]="{ item }">
                                    <span class="font-weight-medium maintext--text text-capitalize">
                                        {{ item.SYMBOL.split(":")[1] }}
                                    </span>
                                </template>
                                <template v-slot:[`item.ltp`]="{ item }">
                                    {{ item.ltp && item.ltp.lp ? Number(item.ltp.lp).toFixed(2) : "0.00" }}
                                </template>
                                <template v-slot:[`item.dividend_yield_percent`]="{ item }">
                                    <span>{{ item.dividend_yield_percent ? `${item.dividend_yield_percent}%` : "---"
                                        }}</span>
                                </template>
                            </v-data-table>
                        </v-card>

                        <v-card id="price" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                            <div class="pt-6 pb-4 pl-md-6 pl-4">
                                <v-toolbar flat density="compact" class="tool-sty mb-5 crd-trn">
                                    <v-list-item class="px-0">
                                        <v-list-item-title class="font-weight-bold title mb-2">Price
                                            Comparison</v-list-item-title>
                                        <v-list-item-subtitle class="subtext--text font-weight-medium fs-12">Compare
                                            <span class="primary--text">{{ menudata[0] ? menudata[0].symname : ""
                                                }}</span>
                                            with other stocks</v-list-item-subtitle>
                                    </v-list-item>
                                </v-toolbar>
                                <v-card height="460px" width="100%" id="pricechart"
                                    class="crd-trn rounded-lg elevation-0"></v-card>
                            </div>
                        </v-card>

                        <!-- Holdings Section -->
                        <v-card id="hold" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                            <div class="pt-6 pb-md-4 pb-8 px-md-9 px-7">
                                <v-row no-gutters>
                                    <v-col cols="12" md="7" class="pa-0">
                                        <p class="font-weight-bold title mb-md-2 mb-0">Holdings</p>
                                        <v-chip-group v-if="shareholdings.all" v-model="holdtab" mandatory class="mb-2">
                                            <v-chip v-for="(h, j) in shareholdings.all" :key="j" variant="outlined"
                                                class="font-weight-medium fs-14 maintext--text"
                                                :color="holdtab == j ? 'maintext' : 'subtext'"
                                                @click="shareholdings.x = j">
                                                {{ h.date ? new Date(h.date).toLocaleString("default", {
                                                    month: "short",
                                                    year: "2-digit"
                                                }) : "MMM YYYY" }}
                                            </v-chip>
                                        </v-chip-group>

                                        <p class="font-weight-bold subtitle-1 font-weight-medium mb-2">Shareholding
                                            Breakdown</p>
                                        <v-card width="100%" color="#DEDEDE" height="36px"
                                            class="d-inline-flex elevation-0 rounded-0 mb-3">
                                            <v-card v-for="(s, b) in shareholdings.table" :key="b" height="36px"
                                                :width="`${((shareholdings.all[shareholdings.x][s.shares] / (shareholdings.all[shareholdings.x].dii + shareholdings.all[shareholdings.x].fii_fpi + shareholdings.all[shareholdings.x]['mutual funds'] + shareholdings.all[shareholdings.x].promoters + shareholdings.all[shareholdings.x].retail_and_others)) * 100).toFixed(0)}%`"
                                                class="elevation-0 rounded-0" :color="s.color"></v-card>
                                        </v-card>

                                        <v-data-table :headers="holdingheader" :items="shareholdings.table || []"
                                            hide-default-footer class="rounded-0 overflow-y-auto">
                                            <template v-slot:[`item.investor`]="{ item }">
                                                <p class="font-weight-medium maintext--text mb-0 d-inline-flex">
                                                    <v-card :color="item.color" class="mt-1 mr-2 elevation-0"
                                                        width="12px" height="12px"></v-card> {{ item.investor }}
                                                </p>
                                            </template>
                                            <template v-slot:[`item.holding`]="{ item }">
                                                <span class="maintext--text">{{ shareholdings.table && item.shares ?
                                                    shareholdings.all[shareholdings.x][item.shares].toFixed(2) : "0.00"
                                                    }}
                                                    %</span>
                                            </template>
                                        </v-data-table>
                                    </v-col>

                                    <v-col cols="12" md="5" class="pr-md-0 pl-md-4 px-0 pb-0">
                                        <v-card variant="outlined" class="crd-trn pa-3 rounded-lg">
                                            <p class="font-weight-bold subtitle-1 font-weight-medium mb-1">Shareholding
                                                History</p>
                                            <v-select v-model="shareholdings.y" @update:model-value="setHoldchartdata"
                                                :items="shareholdings.table" item-title="investor" item-value="shares"
                                                density="compact" variant="solo" flat bg-color="secbg" label="Filter"
                                                hide-details append-inner-icon="mdi-chevron-down"
                                                class="rounded-pill"></v-select>
                                            <v-card height="294px" width="100%" id="holdchart"
                                                class="crd-trn rounded-lg elevation-0"></v-card>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </div>

                            <v-divider class="my-4 d-none d-md-flex"></v-divider>
                            <v-toolbar flat density="compact" class="tool-sty px-md-6 px-4 mb-4 crd-trn">
                                <v-list-item class="px-0">
                                    <v-list-item-title class="font-weight-bold fs-16 mb-2">Mutual Funds Holding
                                        Trend</v-list-item-title>
                                </v-list-item>
                                <v-spacer></v-spacer>
                                <v-text-field v-model="mfsearch" hide-details prepend-inner-icon="mdi-magnify"
                                    label="Search" class="rounded-pill mb-2 d-none d-md-flex" density="compact"
                                    variant="solo" flat bg-color="secbg"></v-text-field>
                            </v-toolbar>
                            <v-data-table :headers="mfholdheader" :items="mfholdings" :search="mfsearch"
                                hide-default-footer class="rounded-0">
                                <template v-slot:[`item.mutual_fund`]="{ item }">
                                    <span class="font-weight-medium maintext--text text-capitalize"> {{
                                        item.mutual_fund.split("-") ? item.mutual_fund.split("-")[0] : item.mutual_fund
                                        }}</span>
                                </template>
                                <template v-slot:[`item.market_cap_Held`]="{ item }">
                                    <span>{{ item.market_cap_Held ? `${item.market_cap_Held.toFixed(4)}` : "0.0000"
                                        }}%</span>
                                </template>
                                <template v-slot:[`item.mf_holding_percent`]="{ item }">
                                    <span>{{ item.mf_holding_percent ? `${item.mf_holding_percent.toFixed(2)}` : "0.00"
                                        }}%</span>
                                </template>
                                <template v-slot:[`item.mf_aum`]="{ item }">
                                    <span>{{ item.mf_aum ? `${item.mf_aum.toFixed(2)}` : "0.00" }}</span>
                                </template>
                            </v-data-table>
                        </v-card>

                        <!-- Events Section -->
                        <v-card id="event" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                            <div class="pt-6 pb-4 px-md-6 px-4">
                                <p class="font-weight-bold title mb-md-2 mb-0">Events</p>
                                <v-chip-group v-if="stockEvents" v-model="eventtab" mandatory class="mb-4">
                                    <v-chip v-for="(a, b, c) in stockEvents" :key="c" variant="outlined"
                                        @click="eventchip = b" :color="eventtab === c ? 'maintext' : 'subtext'"
                                        class="font-weight-medium fs-14 text-capitalize">
                                        {{ b }}
                                    </v-chip>
                                </v-chip-group>

                                <div v-if="stockEvents && stockEvents[eventchip] && stockEvents[eventchip].length > 0">
                                    <v-card v-for="(d, e, f) in stockEvents[eventchip]" :key="f" variant="outlined"
                                        class="mb-3 rounded-lg" color="secbg">
                                        <v-list-item>
                                            <template v-for="(g, h, i) in d" :key="i">
                                                <v-list-item-subtitle
                                                    class="txt-5E6 mb-2 font-weight-medium fs-13 text-capitalize">
                                                    {{ finKeyname(h) }}
                                                </v-list-item-subtitle>
                                                <v-list-item-title
                                                    class="txt-000 font-weight-medium fs-14 text-capitalize mb-3">
                                                    <span v-if="h.includes('date')">{{ formatDate(g) }}</span>
                                                    <span v-else>{{ g }}</span>
                                                </v-list-item-title>
                                            </template>
                                        </v-list-item>
                                    </v-card>
                                </div>

                                <div v-else>
                                    <v-col cols="12" class="text-center pa-16">
                                        <div class="mx-auto">
                                            <v-icon size="80" color="grey-lighten-1">mdi-folder-open-outline</v-icon>
                                            <h5 class="txt-999 font-weight-regular mt-4">
                                                There is no {{ eventchip }} events data here yet!
                                            </h5>
                                        </div>
                                    </v-col>
                                </div>
                            </div>
                        </v-card>

                        <!-- News Section -->
                        <v-card id="news" class="crd-trn ss-cards overflow-hidden" width="100%">
                            <div class="pt-md-6 pb-4 px-md-6 px-4">
                                <p class="font-weight-bold title mb-md-2 mb-0">News</p>
                                <div class="d-inline-flex mb-6">
                                    <v-chip-group v-model="newstab" mandatory class="mb-0">
                                        <v-chip v-for="(p, b) in newstypes" :key="b" @click="setFiltere(p)"
                                            :color="newstab === b ? 'maintext' : 'subtext'" variant="outlined"
                                            class="font-weight-medium fs-14 maintext--text text-capitalize">
                                            {{ p.txt }}
                                        </v-chip>
                                    </v-chip-group>
                                </div>

                                <!-- Loading State -->
                                <div v-if="newsloading">
                                    <v-container>
                                        <v-card class="crd-trn elevation-0 mx-auto py-16 text-center">
                                            <v-progress-circular size="80" indeterminate
                                                color="primary"></v-progress-circular>
                                        </v-card>
                                    </v-container>
                                </div>

                                <!-- News Cards -->
                                <div v-else-if="allnews.length > 0">
                                    <v-row>
                                        <v-col cols="12" md="6" v-for="(n, e) in allnews" :key="e">
                                            <v-card class="crd-trn rounded-lg elevation-0 mb-2 cursor-pointer"
                                                @click="newsPage(n)">
                                                <v-row no-gutters>
                                                    <v-col cols="4" sm="3" xl="2">
                                                        <v-card class="rounded-lg elevation-0">
                                                            <v-img :src="n.image" width="100%" height="60px"
                                                                class="rounded-lg" :alt="n.image" cover></v-img>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="8" sm="9" xl="10" class="pl-0 pl-sm-2 pt-2">
                                                        <v-list-item two-line class="px-0 pr-sm-3">
                                                            <v-list-item-title
                                                                class="font-weight-medium fs-14 mb-2 text-rap-l2 lh-20">
                                                                {{ n.title }}
                                                            </v-list-item-title>
                                                            <v-list-item-subtitle class="fs-12 font-weight-regular">
                                                                {{ n.isdate }}
                                                            </v-list-item-subtitle>
                                                        </v-list-item>
                                                    </v-col>
                                                </v-row>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </div>

                                <!-- Empty State -->
                                <div v-else>
                                    <v-container>
                                        <v-card class="elevation-0 mx-auto py-16 text-center">
                                            <div class="mx-auto">
                                                <v-icon size="80"
                                                    color="grey-lighten-1">mdi-folder-open-outline</v-icon>
                                                <h5 class="txt-999 font-weight-regular mt-4">There is no news data here
                                                    yet!</h5>
                                            </div>
                                        </v-card>
                                    </v-container>
                                </div>
                            </div>
                        </v-card>
                    </div>
                </div>

                <!-- Loading Overlay -->
                <v-overlay :model-value="mainloader" color="mainbg" opacity="0.1" class="rounded-0"></v-overlay>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { analytics } from '@/firebase'
import { logEvent } from 'firebase/analytics'
import { getToken, getLtpdata, getssDetails, getQuotedata, getssNews } from '@/components/mixins/getAPIdata.js'
import apiurl from '@/apiurl.js'
import * as echarts from 'echarts'

// ============================================================================
// REACTIVE STATE
// ============================================================================

const route = useRoute()
const router = useRouter()
const theme = useTheme()

// Main state
const mainloader = ref(true)
const bodytab = ref(0)
const menudata = ref({})
const usdata = ref(null)
const imageicon = ref('')

// Dashboard navigation items
const dashitems = ref([
    { txt: 'Overview' },
    { txt: 'Fundamental' },
    { txt: 'Financials' },
    { txt: 'Peers' },
    { txt: 'Holdings' },
    { txt: 'Events' },
    { txt: 'News' }
])

// Stock data
const stockreturns = ref([])
const Fundamentalsfield = ref({
    'PE Ratio': '',
    'Sector PE': '',
    'EVEBITDA': '',
    'PB Ratio': '',
    'Sector PB': '',
    'Dividend Yield': '',
    'ROCE': '',
    'ROE': '',
    'Debt to equity': '',
    'Price to Sale': '',
    'Book Value': '',
    'Face Value': ''
})

// Events state
const stockEvents = ref({})
const eventtab = ref(0)
const eventchip = ref('bonus')

// News state
const newsloading = ref(false)
const newstab = ref(0)
const allnews = ref([])
const newstypes = ref([
    { txt: 'Daily', val: 1 },
    { txt: 'Weekly', val: 7 },
    { txt: 'Monthly', val: 30 }
])

// Financials state
const financialtab = ref(0)
const financialsearch = ref(null)
const financialitem = ref({})
const fin_fiter = ref('stockFinancialsStandalone')
const fin_table = ref('y5')
const finexpanded = ref([])

// Peers state
const peerstab = ref(0)
const peersearch = ref(null)
const peeritem = ref([])
const peer_table = ref('dividend_yield_percent')
const pricecompar = ref([])

// Holdings state
const holdtab = ref(0)
const shareholdings = ref({})
const mfholdings = ref([])
const mfsearch = ref(null)
const mf_table = ref('mf_holding_percent')

// Constants
const fff = {
    l: {
        n: ["secured_loans", "unsecured_loans", "deferred_tax_assets__and__liabilities", "other_long_term_liabilities", "long_term_trade_payables"],
        c: ["trade_payables", "other_current_liabilities", "short_term_borrowings", "short_term_provisions"],
    },
    a: {
        n: ["gross_block", "non_current_investments", "long_term_loans__and__advances", "other_non_current_assets"],
        c: ["currents_investments", "inventories", "sundry_debtors", "cash_and_bank", "other_current_assets", "short_term_loans_and_advances"],
    },
    // revenue
    r: ["sales_turnover", "less_inter_divisional_transfers", "less_sales_returns", "less_excise"],
    // operating_profit
    o: ["revenue", "expenditure"],
    // expenditure
    t: ["increase_and_decrease_in_stock", "raw_material_consumed", "power__and__fuel_cost", "employee_cost", "general_and_administration_expenses", "selling_and_distribution_expenses", "miscellaneous_expenses", "less_expenses_capitalised", "operating__and__manufacturing_expenses"],
    // profit_after_tax
    p: ["profit_before_tax", "provision_for_tax"],
}

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const financialheader = ref([
    { title: "Financial Years", key: "exp", sortable: false, class: "fin-w-head pl-md-6 pl-4" },
    { title: "MM YYYY", key: "y5", sortable: false, align: "end", class: "d-none d-md-table-cell" },
    { title: "MM YYYY", key: "y4", sortable: false, align: "end", class: "d-none d-md-table-cell" },
    { title: "MM YYYY", key: "y3", sortable: false, align: "end", class: "d-none d-md-table-cell" },
    { title: "MM YYYY", key: "y2", sortable: false, align: "end", class: "d-none d-md-table-cell" },
    { title: "MM YYYY", key: "y1", sortable: false, align: "end", class: "pr-md-6 pr-4 d-none d-md-table-cell" },
    { title: "MM YYYY", key: "y0", sortable: false, align: "end", class: "pr-4 d-md-none" },
])

const financialStatementTitle = computed(() => {
    if (financialtab.value == 2) return "Cashflow Statement"
    if (financialtab.value == 0) return "Income Statement"
    return "Balance Sheet Statement"
})

const peerheader = computed(() => {
    return [
        { title: "Stocks", key: "SYMBOL", sortable: false, class: "peer-w-head pl-md-6 pl-4" },
        { title: "LTP", key: "ltp", sortable: false, align: "end", class: "d-none d-md-table-cell" },
        { title: "Mkt. Cap", key: "market_cap", sortable: false, align: "end", class: "ws-p d-none d-md-table-cell" },
        { title: "PE Ratio", key: "pe", sortable: false, align: "end", class: "ws-p d-none d-md-table-cell" },
        { title: "PB Ratio", key: "price_book_value", sortable: false, align: "end", class: "ws-p d-none d-md-table-cell" },
        { title: "ROCE%", key: "roce_percent", sortable: false, align: "end", class: "d-none d-md-table-cell" },
        { title: "Evebitda", key: "ev_ebitda", sortable: false, align: "end", class: "d-none d-md-table-cell" },
        { title: "Debt to EQ", key: "debt_to_equity", sortable: false, align: "end", class: "ws-p d-none d-md-table-cell" },
        { title: "Div yield", key: "dividend_yield_percent", sortable: false, align: "end", class: "pr-md-6 pr-4 ws-p d-none d-md-table-cell" },
        { title: "Peers", key: "peers", sortable: false, align: "end", class: "pr-md-6 pr-4 ws-p d-md-none" },
    ]
})

const holdingheader = computed(() => {
    return [
        { title: "Investor", key: "investor", sortable: false, class: "pl-md-9 pl-7" },
        { title: "Holding %", key: "holding", sortable: false, align: "end", class: "pr-md-9 pr-7" },
    ]
})

const mfholdheader = computed(() => {
    return [
        { title: "Mutual Fund", key: "mutual_fund", sortable: false, class: "pl-md-6 pl-4" },
        { title: "Mkt. Cap Held", key: "market_cap_Held", sortable: true, align: "end", class: "d-none d-md-table-cell" },
        { title: "Holding %", key: "mf_holding_percent", sortable: false, align: "end", class: "pr-md-6 pr-4 d-none d-md-table-cell" },
        { title: "AUM", key: "mf_aum", sortable: false, align: "end", class: "d-none d-md-table-cell" },
        { title: "Trend", key: "mftrend", sortable: false, align: "end", class: "pr-4 d-md-none" },
    ]
})

const chartUrl = computed(() => {
    if (menudata.value.length && menudata.value[0] && menudata.value[0].exch && menudata.value[0].tsym) {
        const lp = menudata.value.g && Number(menudata.value.g.lp) ? Number(menudata.value.g.lp).toFixed(2) :
            '0.00'
        const isDark = theme.global.current.value.dark
        return `https://mynt-oi-option-data.web.app/web?tsym=${menudata.value[0].exch}:${menudata.value[0].tsym}&lp=${lp}&theme=${isDark}`
    }
    return ''
})

const priceChangeClass = computed(() => {
    if (menudata.value.ch > 0) return 'maingreen--text'
    if (menudata.value.ch < 0) return 'mainred--text'
    return 'subtext--text'
})

const returnsClass = (returns) => {
    if (returns > 0) return 'maingreen--text'
    if (returns < 0) return 'mainred--text'
    return 'subtext--text'
}

const imageLoadError = () => {
    imageicon.value = null
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const finKeyname = (key) => {
    return key.replace(/_/g, ' ')
}

const setFiltere = (p) => {
    getNews()
}

const newsPage = (n) => {
    if (n) {
        window.open(n.link, "_blank")
    }
}

const setbodyTab = () => {
    const ids = ['overview', 'fun', 'fin', 'peers', 'hold', 'event', 'news']
    const id = ids[bodytab.value]
    if (id) {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ block: "start", behavior: "smooth", inline: "start" })
        }
    }
}

const handleScroll = (e) => {
    var scrollPos = e.target.scrollTop
    const ids = ['overview', 'fun', 'fin', 'peers', 'hold', 'event', 'news']
    const offsets = ids.map(id => {
        const el = document.getElementById(id)
        return el ? el.offsetTop - 216 : 0
    })

    for (let i = 0; i < offsets.length; i++) {
        if (offsets[i] && scrollPos >= offsets[i]) {
            if (i === offsets.length - 1 || (offsets[i + 1] && scrollPos < offsets[i + 1])) {
                bodytab.value = i
                break
            }
        }
    }
}

const updateParams = async () => {
    usdata.value = await getToken()
    let path = `NSE:${route.path.split("/stocks/")[1].toUpperCase()}-EQ`
    let local = localStorage.getItem("Cdfgh=")
    if (path) {
        checkScript(path)
    } else if (local && local.includes(":")) {
        checkScript(local)
    } else {
        router.push(`/symbol_not_found`)
    }
}

const checkScript = async (params) => {
    let quotesdata = await getQuotedata(params.tsym ? params.tsym : params)
    if (quotesdata && quotesdata.symname && !quotesdata.msg) {
        setSingleData(quotesdata.token, quotesdata.exch, quotesdata.tsym, quotesdata)
        localStorage.setItem("Cdfgh=", params.tsym ? params.tsym : params)
    } else {
        router.push(`/symbol_not_found`)
    }
}

const setFinchartdata = () => {
    let dates = []
    let values = { 0: [], 1: [], 2: [] }

    if (financialitem.value[fin_fiter.value] && financialitem.value[fin_fiter.value].balanceSheet.length > 0 && financialitem.value[fin_fiter.value].cashflowSheet.length > 0 && financialitem.value[fin_fiter.value].incomeSheet.length > 0) {
        let head = financialheader.value.slice(1, 6)
        let o = null
        let t = null
        let r = null
        var tab = financialtab.value

        if (financialtab.value != 2) {
            o = financialitem.value[fin_fiter.value][tab == 0 ? "incomeSheet" : "balanceSheet"].findIndex((x) => x.name == (tab == 0 ? "revenue" : "total_assets"))
            t = financialitem.value[fin_fiter.value][tab == 0 ? "incomeSheet" : "balanceSheet"].findIndex((x) => x.name == (tab == 0 ? "expenditure" : "total_liabilities"))
            r = financialitem.value[fin_fiter.value][tab == 0 ? "incomeSheet" : "balanceSheet"].findIndex((x) => x.name == (tab == 0 ? "profit_after_tax" : "deferred_tax_assets__and__liabilities"))
        }

        for (let b = 0; b < head.length; b++) {
            dates.push(head[b].title)
            const sheetName = tab == 0 ? "incomeSheet" : tab == 1 ? "balanceSheet" : "cashflowSheet"
            const sheet = financialitem.value[fin_fiter.value][sheetName]

            if (sheet) {
                values[0].unshift(sheet[tab == 2 ? 2 : o][`y${b + 1}`])
                values[1].unshift(sheet[tab == 2 ? 1 : t][`y${b + 1}`])
                values[2].unshift(sheet[tab == 2 ? 0 : r][`y${b + 1}`])
            }
        }
    }
    putFinancialUpdates(dates, values)
}

const setFinancialchart = (dates, values) => {
    const chartDom = document.getElementById("financialchart")
    if (!chartDom) return
    var myChart = echarts.init(chartDom)
    var option = {
        grid: {
            left: 64,
            right: 24,
            y: "4%",
        },
        color: ["#148564", "#7CD36E", "#F9CD6C"],
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
        },
        legend: {
            data: financialtab.value == 0 ? ["Revenue", "Expenditure", "Profit After Tax"] : financialtab.value == 1 ? ["Assets", "Liabilities"] : ["Operating", "Investing", "Financing"],
            orient: "horizontal",
            bottom: 24,
            top: "bottom",
        },
        toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
        },
        xAxis: [
            {
                type: "category",
                axisTick: { show: false },
                data: dates ? dates : false,
            },
        ],
        yAxis: [
            {
                type: "value",
                axisLabel: {
                    formatter: (val) => `${val / 1000} K`,
                },
            },
        ],
        series: [
            {
                name: financialtab.value == 0 ? "Revenue" : financialtab.value == 1 ? "Assets" : "Operating",
                type: "bar",
                label: false,
                emphasis: {
                    focus: "series",
                },
                data: values && values[0] ? values[0] : false,
            },
            {
                name: financialtab.value == 0 ? "Expenditure" : financialtab.value == 1 ? "Liabilities" : "Investing",
                type: "bar",
                label: false,
                emphasis: {
                    focus: "series",
                },
                data: values && values[1] ? values[1] : false,
            },
            {
                name: financialtab.value == 0 ? "Profit After Tax" : financialtab.value == 1 ? "Debt to assets" : "Financing",
                type: financialtab.value == 2 ? "bar" : "line",
                label: false,
                emphasis: {
                    focus: "series",
                },
                data: financialtab.value != 1 ? (values && values[2] ? values[2] : []) : false,
            },
        ],
    }
    option && myChart.setOption(option)

    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

const putFinancialUpdates = (dates, values) => {
    const chartDom = document.getElementById("financialchart")
    if (chartDom) echarts.dispose(chartDom)
    setFinancialchart(dates, values)
}

const setPricechart = () => {
    const chartDom = document.getElementById("pricechart")
    if (!chartDom) return
    var myChart = echarts.init(chartDom)

    var option = {
        grid: {
            left: 44,
            right: 24,
            y: "4%",
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
        },
        legend: {
            data: pricecompar.value.script,
            orient: "horizontal",
            bottom: 240,
            top: "bottom",
        },
        toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
        },
        xAxis: {
            type: "category",
            data: pricecompar.value.dates.slice(1),
        },
        yAxis: {
            type: "value",
            axisLabel: {
                formatter: "{value} %",
            },
        },
        series: pricecompar.value.closes,
    }
    option && myChart.setOption(option)

    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

const setHoldchartdata = () => {
    let dates = []
    let values = []
    if (shareholdings.value.all) {
        for (let b = 0; b < shareholdings.value.all.length; b++) {
            values.unshift(Number(shareholdings.value.all[b][shareholdings.value.y].toFixed(2)))
            dates.unshift(new Date(shareholdings.value.all[b].date).toLocaleString("default", { month: "short", year: "2-digit" }))
        }

        let clrIndex = shareholdings.value.table.findIndex((x) => x.shares == shareholdings.value.y)
        let clr = shareholdings.value.table[clrIndex].color
        putHoldingUpdates(dates, values, clr)
    }
}

const setHoldingchart = (dates, values, clr) => {
    const chartDom = document.getElementById("holdchart")
    if (!chartDom) return
    var myChart = echarts.init(chartDom)

    var option = {
        color: clr,
        xAxis: {
            type: "category",
            data: dates,
            splitLine: {
                show: false,
            },
            scale: false,
            axisLine: {},
        },
        yAxis: {
            type: "value",
            splitLine: {
                show: false,
            },
            max: 100,
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            formatter: "<b>{c}%</b> on {b}",
        },
        grid: {
            left: 28,
            containLabel: false,
            bottom: 32,
            top: 32,
            right: 8,
        },

        series: [
            {
                data: values,
                type: "bar",
                label: {
                    show: true,
                    formatter: "{c}%",
                    precision: 1,
                    position: "top",
                    valueAnimation: true,
                },
            },
        ],
    }
    option && myChart.setOption(option)

    window.addEventListener("resize", function () {
        myChart.resize()
    })
}

const putHoldingUpdates = (dates, values, clr) => {
    const chartDom = document.getElementById("holdchart")
    if (chartDom) echarts.dispose(chartDom)
    setHoldingchart(dates, values, clr)
}

const setSingleData = async (token, exch, tsym, quotesdata) => {
    imageicon.value = `${apiurl.imgicon}${tsym.split("-")[0]}.png`
    menudata.value = []
    if (usdata.value) {
        usdata.value["mas"] = [quotesdata.token, quotesdata.symname, quotesdata.ti,
        quotesdata.ls, ""]
    }

    let ltpraw = await getLtpdata([{ token: token, exch: exch }])
    var data = await getssDetails(`${exch}:${tsym}`)

    menudata.value.push(quotesdata)
    if (ltpraw && ltpraw.data) {
        menudata.value["g"] = ltpraw.data[`${token}`]
    } else {
        menudata.value["g"] = {} // Fallback to empty object or handle appropriately
    }
    menudata.value[0].lp = Number(quotesdata.lp) ? Number(quotesdata.lp) :
        Number(menudata.value.g.lp)
    menudata.value["ch"] = menudata.value.g ? (Number(menudata.value.g.lp) -
        Number(menudata.value.g.close)).toFixed(2) : ""
    menudata.value["d"] = data.stockDescription ? data.stockDescription : ""

    if (data && data.fundamental && data.fundamental[0]) {
        menudata.value["f"] = data.fundamental[0]
        Fundamentalsfield.value = {
            "PE Ratio": data.fundamental[0]["pe"],
            "Sector PE": data.fundamental[0]["sector_pe"],
            EVEBITDA: data.fundamental[0]["ev_ebitda"],
            "PB Ratio": data.fundamental[0]["price_book_value"],
            "Dividend Yield": data.fundamental[0]["dividend_yield_percent"],
            ROCE: data.fundamental[0]["roce_percent"],
            ROE: data.fundamental[0]["roe_percent"],
            "Debt to equity": data.fundamental[0]["debt_to_equity"],
            "Price to Sale": data.fundamental[0]["sales_to_working_capital"],
            "Book Value": data.fundamental[0]["book_value"],
            "Face Value": data.fundamental[0]["fv"],
        }
    }

    if (data.returns) {
        stockreturns.value = data.returns
    } else {
        stockreturns.value = []
    }

    // Financials Logic
    if (data.stockFinancialsStandalone || data.stockFinancialsConsolidated) {
        const sourceData = JSON.parse(JSON.stringify(data));
        financialitem.value = data
        for (const [keysss, valuesss] of Object.entries(sourceData)) {
            if (keysss == "stockFinancialsStandalone" || keysss == "stockFinancialsConsolidated") {
                financialitem.value[keysss]["balanceSheet"] = []
                financialitem.value[keysss]["cashflowSheet"] = []
                financialitem.value[keysss]["incomeSheet"] = []

                for (const [keyss, valuess] of Object.entries(valuesss)) {
                    if (!valuess || !["balanceSheet", "cashflowSheet", "incomeSheet"].includes(keyss)) continue;
                    for (const [keys, values] of Object.entries(valuess)) {
                        if (!values) continue;
                        for (const [key, value] of Object.entries(values)) {
                            var index = financialitem.value[keysss][keyss].findIndex((p) => p.name == key)
                            if (keyss && keys && key != "year_end_date" && index == -1) {
                                financialitem.value[keysss][keyss].push({
                                    name: key,
                                    sym: key.includes("_percent") ? "%" : "₹",
                                    y1: valuess[0] && Number(valuess[0][key]) ? Number(valuess[0][key]).toFixed(2) : 0,
                                    y2: valuess[1] && Number(valuess[1][key]) ? Number(valuess[1][key]).toFixed(2) : 0,
                                    y3: valuess[2] && Number(valuess[2][key]) ? Number(valuess[2][key]).toFixed(2) : 0,
                                    y4: valuess[3] && Number(valuess[3][key]) ? Number(valuess[3][key]).toFixed(2) : 0,
                                    y5: valuess[4] && Number(valuess[4][key]) ? Number(valuess[4][key]).toFixed(2) : 0,
                                    exp: keyss == "balanceSheet"
                                        ? menudata.value.f.industry.includes("Bank")
                                            ? key == "total_assets" ? "total_assets" : key == "total_liabilities" ? "total_liabilities" : ""
                                            : key == "total_current_assets" ? "total_current_assets" : key == "total_non_current_assets" ? "total_non_current_assets" : key == "total_current_liabilities" ? "total_current_liabilities" : key == "total_non-current_liabilities" ? "total_non-current_liabilities" : ""
                                        : keyss == "incomeSheet"
                                            ? key == "revenue" ? "Revenue" : key == "operating_profit" ? "operating_profit" : key == "expenditure" ? "Expenditure" : key == "profit_before_tax" ? "profit_before_tax" : key == "tax" ? "Tax" : key == "profit_after_tax" ? "Profit_After_Tax" : ""
                                            : "",
                                    idx: keyss == "incomeSheet"
                                        ? key == "revenue" ? "0" : key == "operating_profit" ? "2" : key == "expenditure" ? "1" : key == "profit_before_tax" ? "3" : key == "tax" ? "4" : key == "profit_after_tax" ? "5" : ""
                                        : keyss == "balanceSheet"
                                            ? key == "total_current_assets" ? "0" : key == "total_non_current_assets" ? "1" : key == "total_current_liabilities" ? "2" : key == "total_non-current_liabilities" ? "3" : ""
                                            : "",
                                })
                            } else if (key == "year_end_date") {
                                financialheader.value[5].title = valuess[0] ? new Date(valuess[0][key]).toLocaleString("default", { month: "short", year: "numeric" }) : "MM YYYY"
                                financialheader.value[4].title = valuess[1] ? new Date(valuess[1][key]).toLocaleString("default", { month: "short", year: "numeric" }) : "MM YYYY"
                                financialheader.value[3].title = valuess[2] ? new Date(valuess[2][key]).toLocaleString("default", { month: "short", year: "numeric" }) : "MM YYYY"
                                financialheader.value[2].title = valuess[3] ? new Date(valuess[3][key]).toLocaleString("default", { month: "short", year: "numeric" }) : "MM YYYY"
                                financialheader.value[1].title = valuess[4] ? new Date(valuess[4][key]).toLocaleString("default", { month: "short", year: "numeric" }) : "MM YYYY"
                            }
                        }
                    }
                }
            }
        }
        setFinchartdata()
    } else {
        financialitem.value = []
    }

    // Peers Logic
    if (data.peersComparison && data.peersComparison.peers && data.peersComparison.peers.length > 0) {
        let peers = []
        data.peersComparison.peers.map((element) => {
            peers.push({ token: element.zebuToken ? element.zebuToken : "0", exch: element.SYMBOL.split(":")[0] })
        })
        let ltpraws = await getLtpdata(peers)
        data.peersComparison.peers.map((element) => {
            element["ltp"] = (ltpraws && ltpraws.data && element.zebuToken) ? ltpraws.data[element.zebuToken] : null
        })
        peeritem.value = data.peersComparison.peers
        if (ltpraw && ltpraw.data) {
            data.peersComparison.stock[0]["ltp"] = ltpraw.data[`${token}`]
        }
        peeritem.value.unshift(data.peersComparison.stock[0])
    } else {
        peeritem.value = []
    }

    if (data.peerComparisonChart && Object.keys(data.peerComparisonChart).length > 0) {
        pricecompar.value = { dates: [], script: [], closes: [] }
        var colors = ["#148564", "#7CD36E", "#F9CD6C", "#FDEBC4", "#DEDEDE"]
        Object.entries(data.peerComparisonChart).forEach(([key, value], i) => {
            pricecompar.value.script.push(key.split(":")[1].split("-")[0])
            if (value.date.length == 61 && pricecompar.value.dates.length != 61) {
                value.date.map((ele) => {
                    pricecompar.value.dates.push(new Date(ele).toLocaleString("default", { month: "short", year: "2-digit" }))
                })
            }
            pricecompar.value.closes.push({
                name: key.split(":")[1].split("-")[0],
                type: "line",
                symbol: "none",
                sampling: "lttb",
                data: value.close.slice(1),
                color: colors[i],
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: colors[i] + "20" },
                        { offset: 1, color: colors[i] },
                    ]),
                },
            })
        })
        setPricechart()
    } else {
        pricecompar.value = []
    }

    // Holdings Logic
    if (data.shareholdings && data.shareholdings.length > 0) {
        shareholdings.value["all"] = data.shareholdings
        shareholdings.value["table"] = [
            { color: "#148564", holding: 100, shares: "promoters", investor: "Total Promoter Holding" },
            { color: "#7CD36E", holding: 100, shares: "fii_fpi", investor: "Foreign Institutions" },
            { color: "#F9CD6C", holding: 100, shares: "dii", investor: "Other Domestic Institutions" },
            { color: "#FDEBC4", holding: 100, shares: "retail_and_others", investor: "Retail and other" },
            { color: "#DEDEDE", holding: 100, shares: "mutual funds", investor: "Mutual Funds" },
        ]
        shareholdings.value["x"] = 0
        shareholdings.value["y"] = "promoters"
        setHoldchartdata()
    } else {
        shareholdings.value = {}
    }

    if (data.MFholdings && data.MFholdings.length > 0) {
        mfholdings.value = data.MFholdings
    } else {
        mfholdings.value = []
    }

    if (data.stockEvents && Object.keys(data.stockEvents).length > 0) {
        stockEvents.value = data.stockEvents
        eventchip.value = Object.keys(data.stockEvents)[0]
    } else {
        stockEvents.value = {}
    }

    mainloader.value = false
    getNews()
}

const getNews = async () => {
    newsloading.value = true
    allnews.value = []
    let config = await getssNews()
    if (config.data && config.data.length > 0) {
        let data = config.data
        for (let v = 0; v < data.length; v++) {
            data[v]["isdate"] = `${new Date(data[v].pubDate).toDateString().slice(3)} ${new Date(data[v].pubDate).toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true })} IST`
            allnews.value.push(data[v])
        }
    }
    newsloading.value = false
}
watch(() => route.path, (newPath, oldPath) => {
    if (newPath !== oldPath && newPath.includes('/stocks/')) {
        // Reset state
        mainloader.value = true
        bodytab.value = 0
        menudata.value = {}
        stockreturns.value = []
        Fundamentalsfield.value = {}
        imageicon.value = ''
        allnews.value = []
        stockEvents.value = {}
        eventtab.value = 0
        eventchip.value = 'bonus'

        // Fetch new data
        updateParams()
    }
})

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
    // Firebase analytics
    logEvent(analytics, 'single_stock_view', {
        event_name: 'Single Stock',
        value: 1
    })

    // Initial data fetch
    await updateParams()
})

onBeforeUnmount(() => {
    // Cleanup if needed
})
</script>

<style scoped>
.ss-adv-chart {
    min-height: 480px;
}

.ss-adv-chart iframe {
    border: 0;
    min-height: 480px;
}

.h91vh {
    height: calc(100vh - 64px);
}

.pos-rlt {
    position: relative;
}

.pos-stk {
    position: sticky;
}

.z-i3 {
    z-index: 3;
}

.crd-trn {
    background: transparent !important;
}

.ss-cards {
    margin-bottom: 1.5rem;
}

.txt-trn {
    color: transparent;
    background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.txt-x-j {
    text-align: justify;
}

.txt-5E6 {
    color: #5e6c84;
}

.txt-000 {
    color: #000;
}

.txt-999 {
    color: #999;
}

.lh-14 {
    line-height: 1.4;
}

.lh-24 {
    line-height: 2.4;
}

.lh-20 {
    line-height: 2.0;
}

.fs-10 {
    font-size: 10px !important;
}

.fs-12 {
    font-size: 12px !important;
}

.fs-13 {
    font-size: 13px !important;
}

.fs-14 {
    font-size: 14px !important;
}

.fs-18 {
    font-size: 18px !important;
}

.brd-0 {
    border: 0;
}

.brd-1-solid-ccc {
    border: 1px solid #ccc;
}

.min-w-fit {
    min-width: fit-content;
}

.wid-160 {
    width: 160px;
}

.cursor-pointer {
    cursor: pointer;
}

.text-rap-l2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ss-cust-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.ss-cust-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.ss-cust-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.ss-cust-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>
