<template>
    <div>
        <div v-if="dataloaded" :class="!dataloaded ? 'd-none' : ''">
            <v-card id="fun" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                <v-card color="secbg" class="elevation-0 rounded-0 pt-2 px-md-0 px-3">
                    <v-row no-gutters style="background-color: #F1F3F8 !important;">
                        <v-col cols="12" md="7" class="pb-1 pb-md-2">
                            <div class="d-flex align-center px-0 px-md-4 pt-3 pb-2">
                                <!-- Left Avatar Section -->
                                <v-avatar color="#fbfbfb" size="56" class="my-0">
                                    <img v-if="imageicon" :src="imageicon" @error="imageLoadError" class="pa-1"
                                        :alt="imageicon" width="56px" />
                                    <span v-else class="headline font-weight-bold">
                                        {{ menudata[0] ? (menudata[0].cname ? menudata[0].cname :
                                            menudata[0].symname).slice(0, 1) : "" }}
                                    </span>
                                </v-avatar>

                                <!-- Title + Chips Section -->
                                <div class="d-flex flex-column justify-center w-100 ml-3">
                                    <!-- Title -->
                                    <div :class="menudata[0] ? 'maintext--text' : 'txt-trn'"
                                        class="font-weight-bold mb-0 text-capitalize lh-14"
                                        style="font-size: 16px !important;">
                                        {{ menudata[0] ? (menudata[0].cname ? menudata[0].cname : menudata[0].tsym) :
                                            "abcd" }}
                                    </div>

                                    <!-- Chips Row -->
                                    <v-chip-group class="my-0 py-0 d-flex flex-wrap align-center" column>
                                        <v-chip size="x-small" variant="flat"
                                            style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;"
                                            class="fs-10">
                                            <span class="fs-10">
                                                {{ menudata.f && menudata.f.industry ? menudata.f.industry : "Industry"
                                                }}
                                            </span>
                                        </v-chip>

                                        <v-chip size="x-small" variant="flat"
                                            style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;"
                                            class="fs-10">
                                            <span class="fs-10">
                                                {{ menudata.f && menudata.f.market_cap_type ? menudata.f.market_cap_type
                                                    :
                                                    "Marketcap type" }}
                                            </span>
                                        </v-chip>

                                        <v-chip v-if="menudata[0]?.sucase" size="x-small" variant="flat"
                                            style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;"
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
                                {{ menudata[0] && Number(menudata[0].ltp) ? `₹${menudata[0].ltp}` : "0.00" }} <br
                                    class="d-none d-md-block" />
                                <span class="fs-12"
                                    :class="menudata[0] ? (menudata[0].ch > 0 ? 'txt-gre' : menudata[0].ch < 0 ? 'txt-red' : 'txt-444') : 'txt-444'">
                                    {{ menudata[0] && menudata[0].ch ? `${menudata[0].ch}` : "0.00" }}
                                    ({{ menudata[0] && menudata[0].chp ? `${menudata[0].chp}` : "0.00" }}%)</span>
                            </p>
                        </v-col>
                    </v-row>
                </v-card>
                <div class="py-3 py-md-1">
                    <v-toolbar class="nav-drawer elevation-0  crd-trn pa-3" density="compact">
                        <v-list-item class="px-0">
                            <v-list-item-title class="font-weight-bold title mb-1 ">Fundamental
                                ratios</v-list-item-title>
                            <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">
                                Fundamental breakdown of
                                {{ menudata[0] ? menudata[0].symname : "" }}
                                information
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-toolbar>

                    <v-row class="px-4 mt-md-4 mt-2">
                        <v-col cols="4" class="pb-0 fs-13" v-for="(t, d, l) in Fundamentalsfield" :key="l">
                            <v-text-field class="funda-field fs-13 " variant="underlined" density="compact" readonly
                                color="maintext" :label="d" :model-value="t ? t : '-'">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </div>
            </v-card>
            <v-card id="fin" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                <div class="pt-md-4  px-4">
                    <v-list-item class="px-0 pt-0">
                        <v-list-item-title class="font-weight-bold title mb-1">Financial</v-list-item-title>
                        <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">
                            Financial breakdown of
                            {{ menudata[0] ? menudata[0].symname : "" }}
                            information
                        </v-list-item-subtitle>
                    </v-list-item>
                    <v-chip-group v-model="financialtab" mandatory class="mb-2" @update:model-value="setFinchartdata()">
                        <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                            :color="financialtab == 0 ? 'maintext' : 'subtext'"> Income </v-chip>
                        <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                            :color="financialtab == 1 ? 'maintext' : 'subtext'"> Balance Sheet </v-chip>
                        <v-chip variant="outlined" class="font-weight-medium fs-14 maintext--text"
                            :color="financialtab == 2 ? 'maintext' : 'subtext'"> Cashflow </v-chip>
                    </v-chip-group>
                </div>
                <v-card height="420px" id="financialchart" class="crd-trn rounded-lg pt-4 elevation-0"> </v-card>
                <div class="pb-4 px-4">
                    <v-divider class="my-md-6 my-3"></v-divider>
                    <v-toolbar flat density="compact" class="tool-sty crd-trn">
                        <v-list-item class="px-0">
                            <v-list-item-title class="font-weight-bold fs-16">
                                {{ financialtab == 2 ? "Cashflow" : financialtab == 0 ? "Income" : "Balance Sheet"
                                }}
                                Statement
                            </v-list-item-title>
                            <v-list-item-subtitle class="subtext--text font-weight-medium fs-12">All Figures in
                                Cr.</v-list-item-subtitle>
                        </v-list-item>
                        <v-spacer></v-spacer>

                        <v-select @update:model-value="setFinchartdata()" hide-details rounded="pill"
                            v-model="fin_fiter" :items="[
                                { key: 'Standalone', val: 'stockFinancialsStandalone' },
                                { key: 'Consolidated', val: 'stockFinancialsConsolidated' },
                            ]" item-title="key" item-value="val" class=" max-w-160" density="compact" variant="flat"
                            bg-color="secbg" label="Filter"></v-select>
                    </v-toolbar>
                </div>
                <v-data-table item-key="name" must-sort :sort-by="[financialtab != 2 ? 'idx' : 'name']"
                    :sort-desc="[false]" hide-default-footer fixed-header class="financialtabel rounded-0"
                    :headers="financialheader" :search="financialsearch"
                    :items="financialitem[fin_fiter] ? (financialtab == 0 ? financialitem[fin_fiter].incomeSheet : financialtab == 1 ? financialitem[fin_fiter].balanceSheet : financialitem[fin_fiter].cashflowSheet) : []"
                    :items-per-page="-1">
                    <template v-slot:[`header.exp`]>
                        <th class="text-left pl-4">
                            <span class="font-weight-bold">Financial Years</span>
                        </th>
                    </template>
                    <template v-slot:[`header.y1`]>
                        <th class="text-left pl-4">
                            <span>{{ financialHeaderDates.y1 }}</span>
                        </th>
                    </template>
                    <template v-slot:[`header.y2`]>
                        <th class="text-left pl-4">
                            <span>{{ financialHeaderDates.y2 }}</span>
                        </th>
                    </template>
                    <template v-slot:[`header.y3`]>
                        <th class="text-left pl-4">
                            <span>{{ financialHeaderDates.y3 }}</span>
                        </th>
                    </template>
                    <template v-slot:[`header.y4`]>
                        <th class="text-left pl-4">
                            <span>{{ financialHeaderDates.y4 }}</span>
                        </th>
                    </template>
                    <template v-slot:[`header.y5`]>
                        <th class="text-left pl-4 pr-4">
                            <span>{{ financialHeaderDates.y5 }}</span>
                        </th>
                    </template>
                    <template v-slot:[`item.exp`]="{ item }">
                        <td class="pl-4">
                            <span class="font-weight-medium  text-capitalize txt-000"
                                :class="finKeyname(item.name).includes('-') ? 'txt-red' : ''">{{ finKeyname(item.name)
                                }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.y1`]="{ item }">
                        <td class="pl-4 d-none d-md-table-cell txt-000" :class="item.y1 < 0 ? 'txt-red' : ''">
                            {{ item.sym == "₹" ? item.sym : "" }}{{ item.y1 }}
                            {{ item.sym == "%" ? item.sym : "" }}
                        </td>
                    </template>

                    <template v-slot:[`item.y2`]="{ item }">
                        <td class="pl-4 d-none d-md-table-cell txt-000" :class="item.y2 < 0 ? 'txt-red' : ''">
                            {{ item.sym == "₹" ? item.sym : "" }}{{ item.y2 }}
                            {{ item.sym == "%" ? item.sym : "" }}
                        </td>
                    </template>
                    <template v-slot:[`item.y3`]="{ item }">
                        <td class="pl-4 d-none d-md-table-cell txt-000" :class="item.y3 < 0 ? 'txt-red' : ''">
                            {{ item.sym == "₹" ? item.sym : "" }}{{ item.y3 }}
                            {{ item.sym == "%" ? item.sym : "" }}
                        </td>
                    </template>
                    <template v-slot:[`item.y4`]="{ item }">
                        <td class="pl-4 d-none d-md-table-cell txt-000" :class="item.y4 < 0 ? 'txt-red' : ''">
                            {{ item.sym == "₹" ? item.sym : "" }}{{ item.y4 }}
                            {{ item.sym == "%" ? item.sym : "" }}
                        </td>
                    </template>
                    <template v-slot:[`item.y5`]="{ item }">
                        <td class="pl-4 pr-4 d-none d-md-table-cell txt-000" :class="item.y5 < 0 ? 'txt-red' : ''">
                            {{ item.sym == "₹" ? item.sym : "" }}{{ item.y5 }}
                            {{ item.sym == "%" ? item.sym : "" }}
                        </td>
                    </template>
                    <template v-slot:no-data>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px"
                                    src="/src/assets/no data folder.svg" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no Financial data here yet!</h5>
                            </div>
                        </v-col>
                    </template>
                </v-data-table>
                <v-divider class="d-md-none"></v-divider>
            </v-card>
            <v-card id="peers" class="crd-trn ss-cards overflow-hidden mb-md-4 pt-3" width="100%">
                <v-toolbar class="elevation-0 px-0 crd-trn" density="compact">
                    <v-list-item class="pa-4">
                        <v-list-item-title class="font-weight-bold title mb-1">Peers Comparison</v-list-item-title>
                        <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">Peers Comparison
                            breakdown of {{
                                peeritem[0] ? peeritem[0].industry : "" }} information</v-list-item-subtitle>
                    </v-list-item>
                    <v-spacer></v-spacer>
                    <v-text-field rounded="pill" v-model="peersearch" hide-details prepend-inner-icon="mdi-magnify"
                        label="Search" class="pwidth rounded-pill mr-4 d-none d-md-flex search-field-center"
                        density="compact" variant="flat" bg-color="secbg"></v-text-field>
                </v-toolbar>

                <v-data-table must-sort :sort-by="['']" :sort-desc="[false]" hide-default-footer fixed-header
                    class="rounded-0 overflow-y-auto mt-4" :headers="peerheader" height="334px" width="800px"
                    :search="peersearch" :items="peeritem" :items-per-page="peeritem.length">

                    <template v-slot:[`item.company_name`]="{ item }">
                        <td class="pl-0">
                            <span class="txt-000 font-weight-medium text-capitalize">
                                {{ item.SYMBOL.split(":")[1] }}
                            </span>
                        </td>
                    </template>
                    <template v-slot:[`item.ltp`]="{ item }">
                        <td class="pl-0 d-none d-md-table-cell">
                            <span class="txt-000">{{ item.ltp && item.ltp.lp ? Number(item.ltp.lp).toFixed(2) : "0.00"
                            }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.market_cap`]="{ item }">
                        <td class="pl-0 d-none d-md-table-cell">
                            <span class="txt-000">{{ item.market_cap ? item.market_cap.toFixed(2) : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.pe`]="{ item }">
                        <td class=" d-none d-md-table-cell">
                            <span class="txt-000">{{ item.pe ? item.pe : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.price_book_value`]="{ item }">
                        <td class=" d-none d-md-table-cell">
                            <span class="txt-000">{{ item.price_book_value ? item.price_book_value : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.roce_percent`]="{ item }">
                        <td class="d-none d-md-table-cell">
                            <span class="txt-000">{{ item.roce_percent ? item.roce_percent : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.ev_ebitda`]="{ item }">
                        <td class=" d-none d-md-table-cell">
                            <span class="txt-000">{{ item.ev_ebitda ? item.ev_ebitda : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.debt_to_equity`]="{ item }">
                        <td class=" d-none d-md-table-cell">
                            <span class="txt-000">{{ item.debt_to_equity ? item.debt_to_equity : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.dividend_yield_percent`]="{ item }">
                        <td class=" d-none d-md-table-cell">
                            <span class="txt-000">{{ item.dividend_yield_percent ? `${item.dividend_yield_percent}%` :
                                "---" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.peers`]="{ item }">
                        <td class=" d-md-none">
                            <span class="txt-000" v-if="peer_table == 'dividend_yield_percent'">{{
                                item.dividend_yield_percent ?
                                    `${item.dividend_yield_percent}%` : "---" }}</span>
                            <span class="txt-000" v-else-if="peer_table == 'ltp'">
                                {{ item.ltp && item.ltp.lp ? Number(item.ltp.lp).toFixed(2) : "0.00" }}
                            </span>
                            <span class="txt-000" v-else>{{ item[peer_table] ? item[peer_table] : "" }}</span>
                        </td>
                    </template>
                    <template v-slot:no-data>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px"
                                    src="/src/assets/no data folder.svg" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no Peers comparison data here yet!</h5>
                            </div>
                        </v-col>
                    </template>
                </v-data-table>
                <v-divider class="d-md-none"></v-divider>
            </v-card>
           <v-card id="price" class="crd-trn ss-cards mb-md-4">

                <div class="pt-4 pb-2 pl-4">
                    <v-toolbar flat density="compact" class="tool-sty mb-5 crd-trn">
                        <v-list-item class="px-0">
                            <v-list-item-title class="font-weight-bold title mb-1">Price
                                Comparison</v-list-item-title>
                            <v-list-item-subtitle class="subtext--text font-weight-medium fs-12">
                                Compare <span class="primary--text">{{ menudata[0] ? menudata[0].symname : "" }}
                                </span> with
                                other stocks
                            </v-list-item-subtitle>
                        </v-list-item>
                        <v-spacer></v-spacer>
                    </v-toolbar>
                    <v-card height="460px" width="100%" id="pricechart" class="crd-trn rounded-lg elevation-0">
                    </v-card>
                </div>
            </v-card>
            <v-card id="hold" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                <div class="pt-4 pb-md-4 pb-8 px-4  ">
                    <v-row no-gutters>
                        <v-col cols="12" md="7" class="pa-0">
                            <p class="font-weight-bold fs-20 title mb-md-2 mb-0">Holdings</p>
                            <v-chip-group v-if="shareholdings.all" v-model="holdtab" mandatory class="mb-2"
                                @update:model-value="shareholdings.x = holdtab">
                                <v-chip v-for="(h, j) in shareholdings.all" variant="outlined"
                                    class="font-weight-medium fs-14 maintext--text"
                                    :color="holdtab == j ? 'maintext' : 'subtext'" :key="j">
                                    {{
                                        h.date
                                            ? new Date(h.date).toLocaleString("default", {
                                                month: "short",
                                                year: "2-digit",
                                            })
                                            : "MMM YYYY"
                                    }}
                                </v-chip>
                            </v-chip-group>
                            <p class="font-weight-bold fs-16   mb-2">Shareholding Breakdown</p>
                            <v-card width="100%" color="secbg" height="36px"
                                class="d-inline-flex elevation-0 rounded-0 mb-3">
                                <v-card v-for="(s, b) in shareholdings.table" height="36px" :width="`${(
                                    (shareholdings.all[shareholdings.x][s.shares] /
                                        (shareholdings.all[shareholdings.x].dii + shareholdings.all[shareholdings.x].fii_fpi + shareholdings.all[shareholdings.x]['mutual funds'] + shareholdings.all[shareholdings.x].promoters + shareholdings.all[shareholdings.x].retail_and_others)) *
                                    100
                                ).toFixed(0)}%`" class="elevation-0 rounded-0" :color="s.color" :key="b">
                                </v-card>
                            </v-card>
                            <v-data-table hide-default-footer class="rounded-0 overflow-y-auto" fixed-header
                                :headers="holdingheader" :items="shareholdings.table">
                                <template v-slot:[`item.investor`]="{ item }">
                                    <p class="font-weight-medium maintext--text txt-000 mb-0 d-inline-flex"><v-card
                                            :color="item.color" class="mt-1 mr-2 elevation-0" width="12px"
                                            height="12px"></v-card> {{ item.investor }}</p>
                                </template>
                                <template v-slot:[`item.holding`]="{ item }">
                                    <span class="maintext--text txt-000">{{ shareholdings.table && item.shares ?
                                        shareholdings.all[shareholdings.x][item.shares].toFixed(2) : "0.00" }} %</span>
                                </template>
                                <template v-slot:no-data>
                                    <v-col cols="12" class="text-center pa-16">
                                        <div class="mx-auto">
                                            <img class="align-self-stretch mx-auto" width="80px"
                                                src="/src/assets/no data folder.svg" alt="no data" />
                                            <h5 class="txt-999 font-weight-regular">There is no Holdings data here yet!
                                            </h5>
                                        </div>
                                    </v-col>
                                </template>
                            </v-data-table>
                            <v-divider class="d-md-none"></v-divider>
                        </v-col>
                        <v-col cols="12" md="5" class="pr-md-0 pl-md-4 px-0 pb-0">
                            <v-card variant="outlined" class="bordercss pa-3 rounded-lg">
                                <p class="font-weight-bold fs-16  mb-1">Shareholding History</p>
                                <p class="subtext--text mb-4 fs-12">Select a segment from the breakdowns
                                    to see its
                                    pattern here</p>
                                <v-select hide-details v-model="shareholdings.y" rounded="pill"
                                    :items="shareholdings.table || []" item-title="investor" item-value="shares" block
                                    class="mt-2 text-left" density="compact" variant="flat" bg-color="secbg"
                                    label="Filter" @update:model-value="setHoldchartdata()">
                                    <template v-slot:selection="{ item }">
                                        <span style="text-align: left; width: 100%; display: block; padding-left: 0;">{{
                                            item.raw?.investor || item.title }}</span>
                                    </template>
                                </v-select>
                                <v-card height="294px" width="100%" id="holdchart"
                                    class="crd-trn rounded-lg elevation-0"> </v-card>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <v-divider class="my-4 d-none d-md-flex"></v-divider>
                <v-toolbar flat density="compact" class="tool-sty px-4 mb-4 crd-trn">
                    <v-list-item class="px-0">
                        <v-list-item-title class="font-weight-bold fs-16 mb-1">Mutual Funds Holding
                            Trend</v-list-item-title>
                        <v-list-item-subtitle class="subtext--text mb-0 font-weight-medium fs-12">In last 3 months,
                            mutual fund
                            holding
                            of the
                            company has almost stayed constant</v-list-item-subtitle>
                    </v-list-item>
                    <v-spacer></v-spacer>
                    <v-text-field rounded="pill" v-model="mfsearch" hide-details prepend-inner-icon="mdi-magnify"
                        label="Search" class="pwidth rounded-pill mr-4 d-none d-md-flex search-field-center"
                        density="compact" variant="flat" bg-color="secbg"></v-text-field>
                </v-toolbar>

                <v-data-table must-sort :sort-by="['market_cap_Held']" :sort-desc="[true]" hide-default-footer
                    fixed-header class="rounded-0 holdings-table" :headers="mfholdheader" :items="mfholdings" :search="mfsearch"
                    :items-per-page="mfholdings.length">
                    <template v-slot:[`item.mutual_fund`]="{ item }">
                        <td class="">
                            <span class="txt-000 font-weight-medium text-capitalize"> {{
                                item.mutual_fund.split("-") ? item.mutual_fund.split("-")[0] : item.mutual_fund
                                }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.market_cap_Held`]="{ item }">
                        <td class="text-right  d-none d-md-table-cell">
                            <span class="txt-000">{{ item.market_cap_Held ? `${item.market_cap_Held.toFixed(4)}` :
                                "0.0000" }}%</span>
                        </td>
                    </template>
                    <template v-slot:[`item.mf_holding_percent`]="{ item }">
                        <td class="pr-4 text-right d-none d-md-table-cell">
                            <span class="txt-000">{{ item.mf_holding_percent ? `${item.mf_holding_percent.toFixed(2)}` :
                                "0.00"
                            }}%</span>
                        </td>
                    </template>
                    <template v-slot:[`item.mf_aum`]="{ item }">
                        <td class="text-right pr-4 d-none d-md-table-cell">
                            <span class="txt-000">{{ item.mf_aum ? `${item.mf_aum.toFixed(2)}` : "0.00" }}</span>
                        </td>
                    </template>
                    <template v-slot:[`item.mftrend`]="{ item }">
                        <td class="pr-4 text-right d-md-none">
                            <span v-if="mf_table == 'market_cap_Held'" class="txt-000"> {{ item.market_cap_Held ?
                                `${item.market_cap_Held.toFixed(4)}` : "0.0000" }}%</span>
                            <span v-else-if="mf_table == 'mf_holding_percent'" class="txt-000"> {{
                                item.mf_holding_percent ?
                                    `${item.mf_holding_percent.toFixed(2)}` : "0.00" }}% </span>
                            <span v-else class="txt-000">{{ item[mf_table] ? item[mf_table].toFixed(2) : "0.00"
                            }}</span>
                        </td>
                    </template>
                    <template v-slot:no-data>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px"
                                    src="/src/assets/no data folder.svg" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no Peers comparison data here yet!</h5>
                            </div>
                        </v-col>
                    </template>
                </v-data-table>
                <v-divider class="d-md-none"></v-divider>
            </v-card>
            <v-card id="event" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
                <div class="pt-6 pb-4 px-4">
                    <p class="font-weight-bold title mb-md-2 mb-0">Events</p>
                    <v-chip-group v-if="menudata.events" v-model="eventtab" mandatory class="mb-4"
                        @update:model-value="eventchip = Object.keys(menudata.events)[eventtab]">
                        <v-chip v-for="(a, b, c) in menudata.events" variant="outlined"
                            :color="eventtab == c ? 'maintext' : 'subtext'"
                            class="font-weight-medium fs-14 text-capitalize" :key="c">
                            {{ b }}
                        </v-chip>
                    </v-chip-group>

                    <div v-if="menudata.events && menudata.events[eventchip] && menudata.events[eventchip].length > 0">
                        <v-card style="background-color: #F1F3F8;" variant="outlined"
                            v-for="(d, e, f) in menudata.events[eventchip]" :key="f" class="mb-3 rounded-lg px-4 py-3"
                            color="secbg">
                            <v-row align="start">
                                <v-col v-for="(g, h, i) in d" :key="i" :cols="12 / Object.keys(d).length"
                                    class="d-flex flex-column">
                                    <!-- Header -->
                                    <div class="txt-5E6 font-weight-medium fs-13 text-capitalize mb-1">
                                        {{ finKeyname(h) }}
                                    </div>

                                    <!-- Value -->
                                    <div class="txt-000 font-weight-medium fs-14 text-capitalize">
                                        <template v-if="h.includes('date')">
                                            {{ new Date(g).toISOString().slice(0, 10) }}
                                        </template>
                                        <template v-else>
                                            {{ truncateText(g) }}
                                        </template>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card>


                    </div>
                    <div v-else>
                        <v-col cols="12" class="text-center pa-16">
                            <div class="mx-auto">
                                <img class="align-self-stretch mx-auto" width="80px"
                                    src="/src/assets/no data folder.svg" alt="no data" />
                                <h5 class="txt-999 font-weight-regular">There is no {{ eventchip }} events data here
                                    yet!</h5>
                            </div>
                        </v-col>
                    </div>
                </div>
            </v-card>
            <v-card id="news" class="crd-trn ss-cards overflow-hidden" width="100%">
                <div class="pt-md-6 pb-4 px-4">
                    <p class="font-weight-bold title mb-md-2 mb-0">News</p>
                    <div class="d-inline-flex mb-6">
                        <v-chip-group v-if="menudata.events" v-model="newstab" mandatory class="mb-0"
                            @update:model-value="setFiltere(newstypes[newstab])">
                            <v-chip v-for="(p, b) in newstypes" :color="newstab == b ? 'maintext' : 'subtext'" :key="b"
                                variant="outlined" class="font-weight-medium fs-14 maintext--text text-capitalize">
                                {{ p.txt }}
                            </v-chip>
                        </v-chip-group>
                    </div>
                    <div v-if="newsloading">
                        <v-container fill-height>
                            <v-card class="crd-trn elevation-0 mx-auto py-16">
                                <v-progress-circular size="80" indeterminate color="#1e53e5"></v-progress-circular>
                            </v-card>
                        </v-container>
                    </div>
                    <div v-else-if="allnews.length > 0">
                        <v-row>
                            <v-col cols="12" md="6" v-for="(n, e) in allnews" :key="e">
                                <v-card class="crd-trn rounded-lg elevation-0 mb-2" @click="newsPage(n)">
                                    <v-row no-gutters>
                                        <v-col cols="4" sm="3" xl="2">
                                            <v-card class="rounded-lg elevation-0">
                                                <img :src="n.image" width="100%" height="60px" class="rounded-lg"
                                                    :alt="n.image" />
                                            </v-card>
                                        </v-col>
                                        <v-col cols="8" sm="9" xl="10" class="pl-0 pl-sm-2 pt-2">
                                            <v-list-item class="px-0 pr-sm-3 py-0">
                                                <v-list-item-title
                                                    class="font-weight-medium fs-14 mb-2 text-rap-l2 lh-20">
                                                    {{ n.title }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle class="fs-12 font-weight-regular">{{ n.isdate
                                                    }}</v-list-item-subtitle>
                                            </v-list-item>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-else>
                        <v-container fill-height>
                            <v-card class="elevation-0 mx-auto py-16 text-center">
                                <div class="mx-auto">
                                    <img class="align-self-stretch mx-auto" width="80px"
                                        src="/src/assets/no data folder.svg" alt="no data" />
                                    <h5 class="txt-999 font-weight-regular">There is no news data here yet!</h5>
                                </div>
                            </v-card>
                        </v-container>
                    </div>
                </div>
            </v-card>
        </div>
        <div :class="dataloaded ? 'd-none' : ''" class="no-scroll pos-rlt" style="height: calc(100vh - 118px)">
            <div class="pos-cent">
                <p class="mb-0 fs-14 maintext--text font-weight-medium text-center">
                    No Fundamental data <br />
                    for <b>{{ menudata[0] ? menudata[0].cname : "" }}</b>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { default as apiurl } from '@/apiurl'
import { getLtpdata, getssNews } from '@/components/mixins/getAPIdata'

// Reactive data
const mainloader = ref(true)
const menudata = reactive({})
const imageicon = ref('')
// Simple token→price cache shared with overview
const getPriceCache = () => { try { return JSON.parse(localStorage.getItem('price_cache') || '{}') } catch { return {} } }
const setPriceCache = (c) => { try { localStorage.setItem('price_cache', JSON.stringify(c)) } catch { } }

const Fundamentalsfield = reactive({
    'PE Ratio': '',
    'Sector PE': '',
    EVEBITDA: '',
    'PB Ratio': '',
    'EPS': '',
    'Dividend Yield': '',
    ROCE: '',
    ROE: '',
    'Debt to equity': '',
    'Price to Sale': '',
    'Book Value': '',
    'Face Value': ''
})

const financialtab = ref(0)
const financialsearch = ref(null)
const financialitem = reactive({})
const fin_fiter = ref('stockFinancialsStandalone')
const fin_table = ref('y5')
const financialHeaderDates = reactive({
    y5: 'MM YYYY',
    y4: 'MM YYYY',
    y3: 'MM YYYY',
    y2: 'MM YYYY',
    y1: 'MM YYYY'
})

const peerstab = ref(0)
const peersearch = ref(null)
const peeritem = ref([])
const peer_table = ref('dividend_yield_percent')

const pricecompar = reactive({
    dates: [],
    script: [],
    closes: []
})

const holdtab = ref(0)
const shareholdings = reactive({
    all: [],
    table: [],
    x: 0,
    y: 'promoters'
})
const mfholdings = ref([])
const mfsearch = ref(null)
const mf_table = ref('mf_holding_percent')

const eventtab = ref(0)
const eventchip = ref('announcement')

const fff = {
    l: {
        n: ['secured_loans', 'unsecured_loans', 'deferred_tax_assets__and__liabilities', 'other_long_term_liabilities', 'long_term_trade_payables'],
        c: ['trade_payables', 'other_current_liabilities', 'short_term_borrowings', 'short_term_provisions']
    },
    a: {
        n: ['gross_block', 'non_current_investments', 'long_term_loans__and__advances', 'other_non_current_assets'],
        c: ['currents_investments', 'inventories', 'sundry_debtors', 'cash_and_bank', 'other_current_assets', 'short_term_loans_and_advances']
    },
    r: ['sales_turnover', 'less_inter_divisional_transfers', 'less_sales_returns', 'less_excise'],
    o: ['revenue', 'expenditure'],
    t: ['increase_and_decrease_in_stock', 'raw_material_consumed', 'power__and__fuel_cost', 'employee_cost', 'general_and_administration_expenses', 'selling_and_distribution_expenses', 'miscellaneous_expenses', 'less_expenses_capitalised', 'operating__and__manufacturing_expenses'],
    p: ['profit_before_tax', 'provision_for_tax']
}
const finexpanded = ref([])

const newstypes = [
    { txt: 'Daily', key: 'day', tit: "Today's" },
    { txt: 'Weekly', key: 'weekly', tit: "Week's" },
    { txt: 'Monthly', key: 'monthly', tit: "Month's" }
]
const totalnews = ref(0)
const allnews = ref([])
const newstab = ref(0)
const newschip = ref({})
const newsloading = ref(false)

const stockreturns = ref([])
const dataloaded = ref(true)

// ECharts instances
const myCharto = ref(null)
const myChartt = ref(null)
const myChartr = ref(null)

// Computed properties
const financialheader = computed(() => {
    return [
        { title: 'Financial Years', key: 'exp', filter: setFinexpand, sortable: false, align: 'start', class: 'fin-w-head pl-4' },
        { title: financialHeaderDates.y1, key: 'y1', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: financialHeaderDates.y2, key: 'y2', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: financialHeaderDates.y3, key: 'y3', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: financialHeaderDates.y4, key: 'y4', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: financialHeaderDates.y5, key: 'y5', sortable: false, align: 'start', class: 'pl-4 pr-4 d-none d-md-table-cell' }
    ]
})

const peerheader = computed(() => {
    return [
        { title: 'Stocks', key: 'company_name', sortable: false, align: 'start', class: 'peer-w-head pl-4' },
        { title: 'LTP', key: 'ltp', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: 'Mkt. Cap', key: 'market_cap', sortable: false, align: 'start', class: 'ws-p d-none d-md-table-cell pl-4' },
        { title: 'PE Ratio', key: 'pe', sortable: false, align: 'start', class: 'ws-p d-none d-md-table-cell pl-4' },
        { title: 'PB Ratio', key: 'price_book_value', sortable: false, align: 'start', class: 'ws-p d-none d-md-table-cell pl-4' },
        { title: 'ROCE%', key: 'roce_percent', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: 'Evebitda', key: 'ev_ebitda', sortable: false, align: 'start', class: 'd-none d-md-table-cell pl-4' },
        { title: 'Debt to EQ', key: 'debt_to_equity', sortable: false, align: 'start', class: 'ws-p d-none d-md-table-cell pl-4' },
        { title: 'Div yield', key: 'dividend_yield_percent', sortable: false, align: 'start', class: 'pl-4 ws-p d-none d-md-table-cell' },
        // { title: 'Peers', key: 'peers', sortable: false, align: 'start', class: 'pl-4 ws-p d-md-none' }
    ]
})

const holdingheader = computed(() => {
    return [
        { title: 'Investor', key: 'investor', sortable: false, class: 'hold-w-head' },
        { title: 'Holding %', key: 'holding', sortable: false, align: 'end' }
    ]
})

const mfholdheader = computed(() => {
    return [
        { title: 'Funds', key: 'mutual_fund', sortable: false, align: 'start', class: 'mf-w-head pl-4' },
        { title: 'Mkt. cap held%', key: 'market_cap_Held', sortable: false, align: 'start', class: 'ws-p d-none d-md-table-cell pr-4' },
        { title: 'AUM', key: 'mf_aum', sortable: false, align: 'start', class: 'd-none d-md-table-cell pr-4' },
        { title: 'Weight%', key: 'mf_holding_percent', sortable: false, align: 'start', class: 'pr-4 d-none d-md-table-cell' },
        // { title: 'Trend', key: 'mftrend', sortable: false, align: 'end', class: 'pr-4 d-md-none' }
    ]
})

// Methods
const setWaiting = (token, exch, tsym) => {
    if (window.ssddetail && window.ssddetail[0] && window.ssddetail[1] && window.ssddetail[0].token == token) {
        setSingleData(token, exch, tsym)
    } else if (window.ssddetail && window.ssddetail[0] && window.ssddetail[0].token == token && window.ssddetail[1] == 'no data') {
        mainloader.value = false
    } else {
        setTimeout(() => {
            setWaiting(token, exch, tsym)
        }, 100)
    }
}

const imageLoadError = () => {
    imageicon.value = null
}

// WebSocket subscribe/unsubscribe helper (aligns with app-wide event schema)
const setWebsocket = (flow, data, is) => {
    window.dispatchEvent(new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'stockSSD' }
    }))
}

// Track last subscribed symbol to avoid duplicate subs
const lastSubscribed = ref({ token: null, exch: null, tsym: null })

const setSingleData = async (token, exch, tsym) => {
    let windata = window.ssddetail
    imageicon.value = `${apiurl.imgicon}${tsym.split('-')[0]}.png`

    // Clear menudata
    Object.keys(menudata).forEach(key => delete menudata[key])

    var data = windata[1]
    mainloader.value = false
    menudata[0] = windata[0]

    // Prime header with initial quote to avoid showing 0.00 until WS updates
    try {
        const q = menudata[0] || {}
        const lp = Number(q.lp || q.ltp || 0)
        const close = Number(q.close_price || q.close || 0)
        if (!isNaN(lp) && lp > 0) q.ltp = lp.toFixed(2)
        if (!isNaN(close) && close > 0) {
            const ch = lp - close
            q.ch = isFinite(ch) ? ch.toFixed(2) : '0.00'
            const chp = (ch / close) * 100
            q.chp = isFinite(chp) ? chp.toFixed(2) : '0.00'
        }
        menudata[0] = q
    } catch (e) { /* no-op */ }

    // If any are still zero, hydrate from cache
    const cache = getPriceCache()
    const c = cache[token]
    if (c) {
        const apply = (k) => { if (!menudata[0][k] || Number(menudata[0][k]) === 0) menudata[0][k] = c[k] }
            ;['ltp', 'ch', 'chp', 'high_price', 'low_price', 'open_price', 'close_price'].forEach(apply)
    }

    if (data && data.fundamental && data.fundamental[0]) {
        menudata.f = data.fundamental[0]
        console.log(Fundamentalsfield,"Fundamentalsfield")
        Object.assign(Fundamentalsfield, {
            'PE Ratio': data.fundamental[0].pe || '',
            'Sector PE': data.fundamental[0].sector_pe || '',
            EVEBITDA: data.fundamental[0].ev_ebitda || '',
            'PB Ratio': data.fundamental[0].price_book_value || '',
            // 'Sector PB': '',
            'EPS': data.fundamental[0].eps || '',
            'Dividend Yield': data.fundamental[0].dividend_yield_percent || '',
            ROCE: data.fundamental[0].roce_percent || '',
            ROE: data.fundamental[0].roe_percent || '',
            'Debt to equity': data.fundamental[0].debt_to_equity || '',
            'Price to Sale': data.fundamental[0].sales_to_working_capital || '',
            'Book Value': data.fundamental[0].book_value || '',
            'Face Value': data.fundamental[0].fv || ''
        })
        dataloaded.value = true
    } else {
        dataloaded.value = false
        Object.keys(Fundamentalsfield).forEach(key => Fundamentalsfield[key] = '')
    }

    if (data.returns) {
        stockreturns.value = data.returns
    } else {
        stockreturns.value = []
    }

    if (data.stockFinancialsConsolidated && data.stockFinancialsStandalone && Object.keys(data.stockFinancialsConsolidated).length == 3 && Object.keys(data.stockFinancialsStandalone).length == 3) {
        financialitem.stockFinancialsConsolidated = {}
        financialitem.stockFinancialsStandalone = {}

        for (const [keysss, valuesss] of Object.entries(financialitem)) {
            // Skip if the value is not an object (e.g., chart: false)
            if (typeof valuesss !== 'object' || valuesss === null || Array.isArray(valuesss)) {
                continue
            }
            financialitem[keysss].balanceSheet = []
            financialitem[keysss].cashflowSheet = []
            financialitem[keysss].incomeSheet = []

            for (const [keyss, valuess] of Object.entries(data[keysss])) {
                for (const [keys, values] of Object.entries(valuess)) {
                    for (const [key, value] of Object.entries(values)) {
                        var index = financialitem[keysss][keyss].findIndex((p) => p.name == key)
                        if (keyss && keys && key != 'year_end_date' && index == -1) {
                            financialitem[keysss][keyss].push({
                                name: key,
                                sym: key.includes('_percent') ? '%' : '₹',
                                y1: valuess[0] && Number(valuess[0][key]) ? Number(valuess[0][key]).toFixed(2) : 0,
                                y2: valuess[1] && Number(valuess[1][key]) ? Number(valuess[1][key]).toFixed(2) : 0,
                                y3: valuess[2] && Number(valuess[2][key]) ? Number(valuess[2][key]).toFixed(2) : 0,
                                y4: valuess[3] && Number(valuess[3][key]) ? Number(valuess[3][key]).toFixed(2) : 0,
                                y5: valuess[4] && Number(valuess[4][key]) ? Number(valuess[4][key]).toFixed(2) : 0,
                                exp: keyss == 'balanceSheet'
                                    ? (menudata.f?.industry?.includes('Bank')
                                        ? (key == 'total_assets' ? 'total_assets' : key == 'total_liabilities' ? 'total_liabilities' : '')
                                        : (key == 'total_current_assets' ? 'total_current_assets'
                                            : key == 'total_non_current_assets' ? 'total_non_current_assets'
                                                : key == 'total_current_liabilities' ? 'total_current_liabilities'
                                                    : key == 'total_non-current_liabilities' ? 'total_non-current_liabilities'
                                                        : ''))
                                    : keyss == 'incomeSheet'
                                        ? (key == 'revenue' ? 'Revenue'
                                            : key == 'operating_profit' ? 'operating_profit'
                                                : key == 'expenditure' ? 'Expenditure'
                                                    : key == 'profit_before_tax' ? 'profit_before_tax'
                                                        : key == 'tax' ? 'Tax'
                                                            : key == 'profit_after_tax' ? 'Profit_After_Tax'
                                                                : '')
                                        : '',
                                idx: keyss == 'incomeSheet'
                                    ? (key == 'revenue' ? '0'
                                        : key == 'operating_profit' ? '2'
                                            : key == 'expenditure' ? '1'
                                                : key == 'profit_before_tax' ? '3'
                                                    : key == 'tax' ? '4'
                                                        : key == 'profit_after_tax' ? '5'
                                                            : '')
                                    : keyss == 'balanceSheet'
                                        ? (key == 'total_current_assets' ? '0'
                                            : key == 'total_non_current_assets' ? '1'
                                                : key == 'total_current_liabilities' ? '2'
                                                    : key == 'total_non-current_liabilities' ? '3'
                                                        : '')
                                        : ''
                            })
                            financialitem[keysss].valuevalue = value + valuesss
                        } else if (key == 'year_end_date') {
                            // Update financial header dates
                            if (valuess[0]) {
                                financialHeaderDates.y5 = new Date(valuess[0][key]).toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                            if (valuess[1]) {
                                financialHeaderDates.y4 = new Date(valuess[1][key]).toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                            if (valuess[2]) {
                                financialHeaderDates.y3 = new Date(valuess[2][key]).toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                            if (valuess[3]) {
                                financialHeaderDates.y2 = new Date(valuess[3][key]).toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                            if (valuess[4]) {
                                financialHeaderDates.y1 = new Date(valuess[4][key]).toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                        }
                    }
                }
            }
        }
        setFinchartdata()
    } else {
        Object.keys(financialitem).forEach(key => delete financialitem[key])
    }

    if (data.peersComparison && data.peersComparison.peers && data.peersComparison.peers.length > 0) {
        let peers = []
        data.peersComparison.peers.map((element) => {
            peers.push({ token: element.zebuToken ? element.zebuToken : '0', exch: element.SYMBOL.split(':')[0] })
        })
        let ltpraws = await getLtpdata(peers)
        data.peersComparison.peers.map((element) => {
            element.ltp = (element.zebuToken && ltpraws && ltpraws.data && ltpraws.data[element.zebuToken]) ? ltpraws.data[element.zebuToken] : null
        })
        peeritem.value = data.peersComparison.peers
        if (data.peersComparison.stock && data.peersComparison.stock[0]) {
            data.peersComparison.stock[0].ltp = menudata[0]?.ltp || menudata[0]?.lp || 0
            peeritem.value.unshift(data.peersComparison.stock[0])
        }
    } else {
        peeritem.value = []
    }

    if (data.peerComparisonChart && Object.keys(data.peerComparisonChart).length > 0) {
        console.log("FINAL PeerComp Data:", JSON.stringify(data.peerComparisonChart, null, 2))

        pricecompar.dates = []
        pricecompar.script = []
        pricecompar.closes = []
        var colors = ['#148564', '#7CD36E', '#F9CD6C', '#FDEBC4', '#DEDEDE']
        Object.entries(data.peerComparisonChart).forEach(([key, value], i) => {
            if (!value || !value.date || !Array.isArray(value.date) || !value.close || !Array.isArray(value.close)) {
                return
            }
            try {
                pricecompar.script.push(key.split(':')[1].split('-')[0])
                if (value.date.length > 0 && pricecompar.dates.length === 0) {
                    value.date.map((ele) => {
                        pricecompar.dates.push(new Date(ele).toLocaleString('default', { month: 'short', year: '2-digit' }))
                    })
                }
                // pricecompar.closes.push({
                //     name: key.split(':')[1].split('-')[0],
                //     type: 'line',
                //     symbol: 'none',
                //     sampling: 'lttb',
                //     data: value.close.slice(1),
                //     color: colors[i] || '#148564',
                //     areaStyle: {
                //         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //             { offset: 0, color: (colors[i] || '#148564') + '20' },
                //             { offset: 1, color: colors[i] || '#148564' }
                //         ])
                //     }
                // })
                pricecompar.closes.push({
                    name: key.split(':')[1].split('-')[0],
                    type: 'line',
                    symbol: 'none',
                    sampling: 'lttb',
                    data: value.close.slice(1),
                    color: colors[i] || '#148564'
                })
            } catch (e) {
                console.error('Error processing peer comparison chart data:', e)
            }
        })
        if (pricecompar.closes.length > 0) {
            nextTick(() => {
                setPricechart()
            })
        }
    } else {
        pricecompar.dates = []
        pricecompar.script = []
        pricecompar.closes = []
    }

    if (data.shareholdings && data.shareholdings.length > 0) {
        shareholdings.all = data.shareholdings
        shareholdings.table = [
            { color: '#148564', holding: 100, shares: 'promoters', investor: 'Total Promoter Holding' },
            { color: '#7CD36E', holding: 100, shares: 'fii_fpi', investor: 'Foreign Institutions' },
            { color: '#F9CD6C', holding: 100, shares: 'dii', investor: 'Other Domestic Institutions' },
            { color: '#FDEBC4', holding: 100, shares: 'retail_and_others', investor: 'Retail and other' },
            { color: '#DEDEDE', holding: 100, shares: 'mutual funds', investor: 'Mutual Funds' }
        ]
        shareholdings.x = 0
        shareholdings.y = 'promoters'
        setHoldchartdata()
    } else {
        shareholdings.all = []
        shareholdings.table = []
    }

    if (data.MFholdings && data.MFholdings.length > 0) {
        mfholdings.value = data.MFholdings
    } else {
        mfholdings.value = []
    }

    if (data.stockEvents && Object.keys(data.stockEvents).length > 0) {
        menudata.events = data.stockEvents
    } else {
        menudata.events = {}
    }
    window.scrollTo(0, 0)
    getNews()
}

const clearData = (token, exch, tsym) => {
    Object.keys(menudata).forEach(key => delete menudata[key])
    Object.keys(Fundamentalsfield).forEach(key => Fundamentalsfield[key] = '')
    stockreturns.value = []
    Object.keys(financialitem).forEach(key => delete financialitem[key])
    peeritem.value = []
    pricecompar.dates = []
    pricecompar.script = []
    pricecompar.closes = []
    shareholdings.all = []
    shareholdings.table = []
    mfholdings.value = []

    // Reset financial header dates
    financialHeaderDates.y5 = 'MM YYYY'
    financialHeaderDates.y4 = 'MM YYYY'
    financialHeaderDates.y3 = 'MM YYYY'
    financialHeaderDates.y2 = 'MM YYYY'
    financialHeaderDates.y1 = 'MM YYYY'

    if (token && exch && tsym) {
        setWaiting(token, exch, tsym)
    }

    // Unsubscribe previous symbol if different
    if (lastSubscribed.value.token && (lastSubscribed.value.token !== token || lastSubscribed.value.exch !== exch)) {
        setWebsocket('unsub', [{ token: lastSubscribed.value.token, exch: lastSubscribed.value.exch, tsym: lastSubscribed.value.tsym }], 'ssd')
    }
    // Subscribe to live quotes for this symbol
    setWebsocket('sub', [{ token: token, exch: exch, tsym: tsym }], 'ssd')
    lastSubscribed.value = { token, exch, tsym }
}

const setFinchartdata = () => {
    let dates = []
    let values = { 0: [], 1: [], 2: [] }
    financialitem.chart = true

    if (financialitem[fin_fiter.value]?.balanceSheet?.length > 0 && financialitem[fin_fiter.value]?.cashflowSheet?.length > 0 && financialitem[fin_fiter.value]?.incomeSheet?.length > 0) {
        let head = financialheader.value.slice(1, 6)
        let o = null
        let t = null
        let r = null
        var tab = financialtab.value

        if (financialtab.value != 2) {
            o = financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : 'balanceSheet'].findIndex((x) => x.name == (tab == 0 ? 'revenue' : 'total_assets'))
            t = financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : 'balanceSheet'].findIndex((x) => x.name == (tab == 0 ? 'expenditure' : 'total_liabilities'))
            r = financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : 'balanceSheet'].findIndex((x) => x.name == (tab == 0 ? 'profit_after_tax' : 'deferred_tax_assets__and__liabilities'))
        }

        for (let b = 0; b < head.length; b++) {
            dates.push(head[b].text)
            values[0].unshift(financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : tab == 1 ? 'balanceSheet' : 'cashflowSheet'][tab == 2 ? 2 : o]?.[`y${b + 1}`] || 0)
            values[1].unshift(financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : tab == 1 ? 'balanceSheet' : 'cashflowSheet'][tab == 2 ? 1 : t]?.[`y${b + 1}`] || 0)
            values[2].unshift(financialitem[fin_fiter.value][tab == 0 ? 'incomeSheet' : tab == 1 ? 'balanceSheet' : 'cashflowSheet'][tab == 2 ? 0 : r]?.[`y${b + 1}`] || 0)
        }
        financialitem.chart = false
    }
    putFinancialUpdates(dates, values)
}

const setFinancialchart = (dates, values) => {
    const chartEl = document.getElementById('financialchart')
    if (!chartEl) return

    // If the element is not yet visible (width 0), delay initialization
    if (chartEl.offsetWidth === 0 || chartEl.offsetHeight === 0) {
        setTimeout(() => setFinancialchart(dates, values), 150)
        return
    }

    // Re-init safely when switching tabs or symbols
    if (myChartr.value) {
        try { myChartr.value.dispose() } catch { }
        myChartr.value = null
    }
    myChartr.value = echarts.init(chartEl)

    // Ensure dates is an array
    const validDates = Array.isArray(dates) && dates.length > 0 ? dates : []

    // Build series array with valid data only
    const seriesArray = []

    // Series 1
    if (values && Array.isArray(values[0]) && values[0].length > 0) {
        seriesArray.push({
            name: financialtab.value == 0 ? 'Revenue' : financialtab.value == 1 ? 'Assets' : 'Operating',
            type: 'bar',
            label: { show: false },
            emphasis: {
                focus: 'series'
            },
            data: values[0]
        })
    }

    // Series 2
    if (values && Array.isArray(values[1]) && values[1].length > 0) {
        seriesArray.push({
            name: financialtab.value == 0 ? 'Expenditure' : financialtab.value == 1 ? 'Liabilities' : 'Investing',
            type: 'bar',
            label: { show: false },
            emphasis: {
                focus: 'series'
            },
            data: values[1]
        })
    }

    // Series 3 (only for tab 0 and 2, not tab 1)
    if (financialtab.value != 1 && values && Array.isArray(values[2]) && values[2].length > 0) {
        seriesArray.push({
            name: financialtab.value == 0 ? 'Profit After Tax' : 'Financing',
            type: financialtab.value == 2 ? 'bar' : 'line',
            label: { show: false },
            emphasis: {
                focus: 'series'
            },
            data: values[2]
        })
    }

    if (seriesArray.length === 0 || validDates.length === 0) {
        return
    }

    var option = {
        grid: {
            left: 64,
            right: 24,
            y: '4%'
        },
        color: ['#148564', '#7CD36E', '#F9CD6C'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: financialtab.value == 0 ? ['Revenue', 'Expenditure', 'Profit After Tax'] : financialtab.value == 1 ? ['Assets', 'Liabilities'] : ['Operating', 'Investing', 'Financing'],
            orient: 'horizontal',
            bottom: 24,
            top: 'bottom'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center'
        },
        xAxis: [
            {
                type: 'category',
                axisTick: { show: false },
                data: validDates
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: (val) => `${val / 1000} K`
                }
            }
        ],
        series: seriesArray
    }

    try {
        // Use notMerge to completely replace old option and avoid undefined series
        myChartr.value.setOption(option, { notMerge: true })
    } catch (e) {
        console.error('Error setting financial chart option:', e)
    }

    // Remove old resize handler if it exists
    if (window._financialChartResizeHandler) {
        window.removeEventListener('resize', window._financialChartResizeHandler)
    }

    // Add new resize handler with error handling
    window._financialChartResizeHandler = () => {
        try {
            // Validate chart instance exists and is not disposed
            if (!myChartr.value) return

            // Check if chart element still exists in DOM
            const chartEl = document.getElementById('financialchart')
            if (!chartEl) return

            // Verify chart is not disposed by checking if it has internal state
            // ECharts throws error if we try to access disposed chart
            try {
                // Try to get option to verify chart is still valid
                const option = myChartr.value.getOption()
                if (!option || !option.series) return
            } catch {
                // Chart is disposed or invalid, don't resize
                return
            }

            // All checks passed, safe to resize
            myChartr.value.resize()
        } catch (e) {
            // Silently handle resize errors - chart might be in invalid state
            // Don't log to avoid console spam
        }
    }
    window.addEventListener('resize', window._financialChartResizeHandler)
}

const putFinancialUpdates = (dates, values) => {
    setFinancialchart(dates, values)
}

const setPricechart = () => {
    const chartEl = document.getElementById('pricechart')
    if (!chartEl) return

    // If the element is not yet visible (width 0), delay initialization
    if (chartEl.offsetWidth === 0 || chartEl.offsetHeight === 0) {
        setTimeout(() => setPricechart(), 150)
        return
    }

    if (myCharto.value) {
        try { myCharto.value.dispose() } catch { }
        myCharto.value = null
    }
    myCharto.value = echarts.init(chartEl)

    // Filter out any undefined or invalid series entries
    const validSeries = pricecompar.closes.filter(series =>
        series &&
        typeof series === 'object' &&
        series.type &&
        Array.isArray(series.data) &&
        series.data.length > 0
    )

    // Ensure dates array is valid
    const validDates = Array.isArray(pricecompar.dates) && pricecompar.dates.length > 1
        ? pricecompar.dates.slice(1)
        : []

    // If no valid data, clear the chart
    if (validSeries.length === 0 || validDates.length === 0) {
        try {
            // Clear the chart by setting an empty option
            myCharto.value.setOption({
                series: []
            }, { notMerge: true, lazyUpdate: true })
        } catch (e) {
            console.error('Error clearing price chart:', e)
        }
        return
    }

    var option = {
        grid: {
            left: 44,
            right: 24,
            y: '4%'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: pricecompar.script || [],
            orient: 'horizontal',
            bottom: 240,
            top: 'bottom'
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center'
        },
        xAxis: {
            type: 'category',
            data: validDates
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} %'
            }
        },
        series: validSeries
    }

    try {
        // Use notMerge to completely replace old option and avoid undefined series
        myCharto.value.setOption(option, { notMerge: true, lazyUpdate: false })
    } catch (e) {
        console.error('Error setting price chart option:', e)
        // If setting option fails, try to clear the chart
        try {
            myCharto.value.setOption({ series: [] }, { notMerge: true })
        } catch (clearError) {
            console.error('Error clearing price chart after failure:', clearError)
        }
    }

    // Remove old resize handler if it exists
    if (window._priceChartResizeHandler) {
        window.removeEventListener('resize', window._priceChartResizeHandler)
    }

    // Add new resize handler with error handling and validation
    window._priceChartResizeHandler = () => {
        try {
            // Validate chart instance exists and is not disposed
            if (!myCharto.value) return

            // Check if chart element still exists in DOM
            const chartEl = document.getElementById('pricechart')
            if (!chartEl) return

            // Verify chart is not disposed by checking if it has internal state
            try {
                // Try to get option to verify chart is still valid
                const option = myCharto.value.getOption()
                if (!option || !option.series) return
            } catch {
                // Chart is disposed or invalid, don't resize
                return
            }

            // All checks passed, safe to resize
            myCharto.value.resize()
        } catch (e) {
            // Silently handle resize errors - chart might be in invalid state
            // Don't log to avoid console spam
        }
    }
    window.addEventListener('resize', window._priceChartResizeHandler)
}

const setHoldchartdata = () => {
    let dates = []
    let values = []

    if (shareholdings.all && shareholdings.all.length > 0) {
        for (let b = 0; b < shareholdings.all.length; b++) {
            values.unshift(Number(shareholdings.all[b][shareholdings.y]?.toFixed(2) || 0))
            dates.unshift(new Date(shareholdings.all[b].date).toLocaleString('default', { month: 'short', year: '2-digit' }))
        }

        let clrIndex = shareholdings.table.findIndex((x) => x.shares == shareholdings.y)
        let clr = clrIndex >= 0 ? shareholdings.table[clrIndex].color : '#148564'
        putHoldingUpdates(dates, values, clr)
    }
}

const setHoldingchart = (dates, values, clr) => {
    if (!myChartt.value) {
        const chartEl = document.getElementById('holdchart')
        if (chartEl) {
            myChartt.value = echarts.init(chartEl)
        }
    }

    if (!myChartt.value) return

    // Validate data
    const validDates = Array.isArray(dates) ? dates : []
    const validValues = Array.isArray(values) ? values : []
    const validColor = clr || '#148564'

    // If no valid data, clear the chart
    if (validDates.length === 0 || validValues.length === 0) {
        try {
            // Clear the chart by setting an empty option
            myChartt.value.setOption({
                series: []
            }, { notMerge: true, lazyUpdate: true })
        } catch (e) {
            console.error('Error clearing holdings chart:', e)
        }
        return
    }

    var option = {
        color: validColor,
        xAxis: {
            type: 'category',
            data: validDates,
            splitLine: {
                show: false
            },
            scale: false,
            axisLine: {}
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false
            },
            max: 100
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: '<b>{c}%</b> on {b}'
        },
        grid: {
            left: 28,
            containLabel: false,
            bottom: 32,
            top: 32,
            right: 8
        },
        series: [
            {
                data: validValues,
                type: 'bar',
                label: {
                    show: true,
                    formatter: '{c}%',
                    precision: 1,
                    position: 'top',
                    valueAnimation: true
                }
            }
        ]
    }

    try {
        // Use notMerge to completely replace old option and avoid undefined series
        myChartt.value.setOption(option, { notMerge: true, lazyUpdate: false })
    } catch (e) {
        console.error('Error setting holdings chart option:', e)
        // If setting option fails, try to clear the chart
        try {
            myChartt.value.setOption({ series: [] }, { notMerge: true })
        } catch (clearError) {
            console.error('Error clearing holdings chart after failure:', clearError)
        }
    }

    // Remove old resize handler if it exists
    if (window._holdingsChartResizeHandler) {
        window.removeEventListener('resize', window._holdingsChartResizeHandler)
    }

    // Add new resize handler with error handling and validation
    window._holdingsChartResizeHandler = () => {
        try {
            // Validate chart instance exists and is not disposed
            if (!myChartt.value) return

            // Check if chart element still exists in DOM
            const chartEl = document.getElementById('holdchart')
            if (!chartEl) return

            // Verify chart is not disposed by checking if it has internal state
            try {
                // Try to get option to verify chart is still valid
                const option = myChartt.value.getOption()
                if (!option || !option.series) return
            } catch {
                // Chart is disposed or invalid, don't resize
                return
            }

            // All checks passed, safe to resize
            myChartt.value.resize()
        } catch (e) {
            // Silently handle resize errors - chart might be in invalid state
            // Don't log to avoid console spam
        }
    }
    window.addEventListener('resize', window._holdingsChartResizeHandler)
}

const putHoldingUpdates = (dates, values, clr) => {
    setHoldingchart(dates, values, clr)
}

const getNews = async () => {
    try {
        newsloading.value = true

        if (window.storenews && window.storenews.data) {
            allnews.value = window.storenews.data
            totalnews.value = window.storenews.newsCount || 0
            newsloading.value = false
        } else {
            allnews.value = []
            totalnews.value = 0

            let config = await getssNews()
            if (config && config.data && config.data.length > 0) {
                let data = config.data
                for (let v = 0; v < data.length; v++) {
                    if (data[v].pubDate) {
                        data[v].isdate = `${new Date(data[v].pubDate).toDateString().slice(3)} ${new Date(data[v].pubDate).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} IST`
                    }
                    allnews.value.push(data[v])
                }
                totalnews.value = config.newsCount || 0
            } else {
                console.warn('[StockSingle] getssNews returned no data:', config)
                allnews.value = []
                totalnews.value = 0
            }
            newsloading.value = false
        }
    } catch (error) {
        console.error('[StockSingle] Error fetching news:', error)
        allnews.value = []
        totalnews.value = 0
        newsloading.value = false
    }
}

const differentDate = (date) => {
    var date1 = new Date(date)
    var date2 = new Date()
    var ov = Math.abs(date2.getTime() - date1.getTime())
    var mt = Math.round(ov / 3600000)
    var dd = mt > 60 ? Math.round(mt / 24) : 0
    var mm = dd > 30.4166667 ? Math.round(dd / 30.4166667) : 0
    var yy = mm > 12 ? Math.round(dd / 365) : 0
    return `${yy != 0 ? yy : mm != 0 ? mm : dd != 0 ? dd : mt != 0 ? mt : 0} ${yy != 0 ? (yy > 1 ? 'years' : 'year') : mm != 0 ? (mm > 1 ? 'months' : 'month') : dd != 0 ? (dd > 1 ? 'days' : 'day') : mt > 1 ? 'hours' : 'minutes'} ago`
}

const newsPage = (n) => {
    if (n) {
        window.open(n.link, '_blank')
    }
}

const setFiltere = (p) => {
    newschip.value = p
    getNews()
}

const finKeyname = (key) => {
    var abc = key.toLowerCase().replace('_percent', ' in %')
    abc = abc.replace(/[._-]/g, ' ')
    abc = abc.replace(/less|total/gi, '')
    return abc
}

const truncateText = (text, maxWords = 5) => {
    if (!text || typeof text !== 'string') return text
    const words = text.trim().split(/\s+/)
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '...'
}

const setFinexpand = (value) => {
    if (value || financialtab.value == 2) {
        return true
    }
    return value
}

const optionChainDataParse = (data) => {
    const token = data.token || data.tk
    if (menudata[0] && menudata[0].token == token) {
        if (menudata[0]) {
            const liveNum = Number(data.lp || data.ltp || 0)
            if (!isNaN(liveNum) && liveNum > 0) {
                const livePrice = liveNum.toFixed(2)
                // Keep both properties synced so all sections read the same value
                menudata[0].lp = livePrice
                menudata[0].ltp = livePrice
            }
            const chIn = Number(data.ch || data.c)
            if (!isNaN(chIn)) menudata[0].ch = chIn.toFixed(2)
            const chpIn = Number(data.chp)
            if (!isNaN(chpIn)) menudata[0].chp = chpIn.toFixed(2)

            // Save latest to cache for fallback
            const cache = getPriceCache()
            cache[token] = {
                ltp: menudata[0].ltp,
                ch: menudata[0].ch,
                chp: menudata[0].chp,
                high_price: menudata[0].high_price,
                low_price: menudata[0].low_price,
                open_price: menudata[0].open_price,
                close_price: menudata[0].close_price
            }
            setPriceCache(cache)
        }
    }
}

// Event handlers
const handleSSDEvent = (event) => {
    const { detail } = event
    if (Array.isArray(detail) && detail.length >= 4) {
        const [type, token, exch, tsym] = detail
        mainloader.value = true
        clearData(token, exch, tsym)
    }
}

const handleWebSocketConnection = (event) => {
    const { detail } = event
    if (detail && typeof detail === 'object' && (detail.token || detail.tk)) {
        optionChainDataParse(detail)
    } else if (Array.isArray(detail) && detail.length > 0) {
        optionChainDataParse(detail[0])
    }
}

// Lifecycle hooks
onMounted(() => {

    let local = localStorage.getItem('ssdtsym')
    if (local && local.includes(':')) {
        mainloader.value = true
        clearData()
        setWaiting(localStorage.getItem('ssdtoken'), local.split(':')[0], local.split(':')[1])
    }

    // Listen for Custom Events
    window.addEventListener('ssd-event', handleSSDEvent)
    window.addEventListener('web-scoketConn', handleWebSocketConnection)

    newschip.value = newstypes[0]
    // Load news on component mount
    getNews()
})

onBeforeUnmount(() => {
    window.removeEventListener('ssd-event', handleSSDEvent)
    window.removeEventListener('web-scoketConn', handleWebSocketConnection)

    // Remove resize handlers
    if (window._financialChartResizeHandler) {
        window.removeEventListener('resize', window._financialChartResizeHandler)
        window._financialChartResizeHandler = null
    }
    if (window._priceChartResizeHandler) {
        window.removeEventListener('resize', window._priceChartResizeHandler)
        window._priceChartResizeHandler = null
    }
    if (window._holdingsChartResizeHandler) {
        window.removeEventListener('resize', window._holdingsChartResizeHandler)
        window._holdingsChartResizeHandler = null
    }

    // Unsubscribe from live quotes for current symbol
    if (menudata[0] && menudata[0].token) {
        setWebsocket('unsub', [{ token: menudata[0].token, exch: menudata[0].exch, tsym: menudata[0].tsym }], 'ssd')
    }

    // Dispose ECharts instances
    if (myChartr.value) {
        try {
            myChartr.value.dispose()
        } catch (e) {
            console.error('Error disposing financial chart:', e)
        }
        myChartr.value = null
    }
    if (myCharto.value) {
        try {
            myCharto.value.dispose()
        } catch (e) {
            console.error('Error disposing price chart:', e)
        }
        myCharto.value = null
    }
    if (myChartt.value) {
        try {
            myChartt.value.dispose()
        } catch (e) {
            console.error('Error disposing holdings chart:', e)
        }
        myChartt.value = null
    }
})

// Watch financialtab and fin_fiter for chart updates
watch([financialtab, fin_fiter], () => {
    if (Object.keys(financialitem).length > 0) {
        setFinchartdata()
    }
})

// Watch holdtab for holdings chart updates
watch([holdtab, () => shareholdings.x], () => {
    if (shareholdings.all && shareholdings.all.length > 0) {
        setHoldchartdata()
    }
})

// Watch shareholdings.y for chart updates
watch(() => shareholdings.y, () => {
    if (shareholdings.all && shareholdings.all.length > 0) {
        setHoldchartdata()
    }
})
</script>

<style scoped>
.financialtabel {
    height: auto;
    max-height: 500px;
}

.fin-w-head {
    min-width: 200px;
}

.peer-w-head {
    min-width: 150px;
}

.hold-w-head {
    min-width: 200px;
}

.mf-w-head {
    min-width: 200px;
}

.max-w-160 {
    max-width: 160px;
}

/* Additional utility classes */
.nav-drawer {
    background-color: transparent !important;
}

.tool-sty {
    background-color: transparent !important;
}

/* Vuetify 3 specific updates - ensure data-table works correctly */
:deep(.v-data-table__td) {
    padding: 8px 16px;
}

:deep(.v-data-table__th) {
    padding: 8px 16px;
}

/* Chart containers */
#financialchart,
#pricechart,
#holdchart {
    width: 100%;
    height: 100%;
}

/* Ensure proper spacing for chip groups */
.v-chip-group {
    gap: 8px;
}

/* Data table scroll styling */
.financialtabel :deep(.v-data-table__wrapper) {
    max-height: 500px;
    overflow-y: auto;
}

/* Force left alignment for financial table headers */
.financialtabel :deep(.v-data-table__th) {
    text-align: left !important;
}

.financialtabel :deep(.v-data-table__th.text-left) {
    text-align: left !important;
}

/* List item styling for Vuetify 3 */
:deep(.v-list-item__content) {
    padding: 0;
}

/* Ensure select text is left-aligned */
:deep(.v-select .v-field__input) {
    text-align: left !important;
    padding-left: 12px !important;
    padding-bottom: 10px !important;
}

:deep(.v-select .v-field__input input) {
    text-align: left !important;
}

:deep(.v-select .v-select__selection) {
    text-align: left !important;
    justify-content: flex-start !important;
    width: 100%;
}

:deep(.v-select .v-field__input .v-select__selection-text) {
    text-align: left !important;
    width: 100%;
}

/* Ensure proper alignment for text fields */
.funda-field :deep(.v-input__control) {
    min-height: 40px;
}

/* News card hover effect */
.v-card:hover {
    cursor: pointer;
    opacity: 0.9;
    transition: opacity 0.2s ease;
}

/* Event card styling */
.v-card.variant--outlined {
    border: thin solid #EBEEF0 !important;
}

/* Ensure proper text truncation */
.text-rap-l2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
}

/* Vertically center text in peer search input */
.peer-search-input :deep(.v-field) {
    display: flex;
    align-items: center;
}

.peer-search-input :deep(.v-field__input) {
    display: flex;
    align-items: center;
    padding-top: 0;
    padding-bottom: 0;
}

.peer-search-input :deep(.v-field__input input) {
    line-height: 1.5;
    padding-top: 0;
    padding-bottom: 0;
    margin: 0;
}
</style>
