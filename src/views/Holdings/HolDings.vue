<template>
    <div>
        <div class="my-6">
            <!-- Stats Cards -->
            <v-row v-if="tab !== 'portfolio'">
                <v-col cols="12">
                    <v-card v-if="tab === 'stocks'"
                        class="px-2 stat-card rounded-md d-inline-flex pt-2 pb-1 overflow-hidden" width="100%">
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">Stocks
                                    Value</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span>{{ stats.stockvalue || '0.00' }}</span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">Day
                                    Change</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(stats.d_pnl) > 0 ? 'maingreen--text' : Number(stats.d_pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span>{{ stats.d_pnl || '0.00' }}</span>
                                    </span>
                                    <span class="fs-13"
                                        :class="Number(stats.d_cpnl) > 0 ? 'maingreen--text' : Number(stats.d_cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        (<span>{{ Number(stats.d_cpnl) > 0 || Number(stats.d_cpnl) < 0 ? stats.d_cpnl
                                            : '0.00' }}</span>%)
                                        </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle
                                    class="txt-5E6 mb-2 font-weight-medium">Invested</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span>{{ stats.invested || '0.00' }}</span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle
                                    class="txt-5E6 mb-2 font-weight-medium">Profit/Loss</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(stats.cpnl) > 0 ? 'maingreen--text' : Number(stats.cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span>{{ stats.pnl || '0.00' }}</span>
                                    </span>
                                    <span class="fs-13"
                                        :class="Number(stats.cpnl) > 0 ? 'maingreen--text' : Number(stats.cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        (<span>{{ Number(stats.cpnl) > 0 || Number(stats.cpnl) < 0 ? stats.cpnl : '0.00'
                                                }}</span>%)
                                        </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pb-0">
                                <v-list-item-subtitle class="txt-5E6 mb-0 font-weight-medium">Stock
                                    Position</v-list-item-subtitle>
                                <v-chip-group row>
                                    <v-chip class="mr-2 rounded-lg" color="secgreen" text-color="maingreen">
                                        <span class="caption">{{ stats.positive || 0 }}</span>&nbsp;Positive
                                    </v-chip>
                                    <v-chip height="16" class="mr-2 rounded-lg" color="secred" text-color="mainred">
                                        <span class="caption">{{ stats.negative || 0 }}</span>&nbsp;Negative
                                    </v-chip>
                                </v-chip-group>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                    <v-card v-else class="px-2 stat-card rounded-md d-inline-flex pt-2 pb-1 overflow-hidden"
                        width="100%">
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">Current
                                    Value</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span>{{ mfStats.totalValue || '0.00' }}</span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle
                                    class="txt-5E6 mb-2 font-weight-medium">Invested</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span>{{ mfStats.invested || '0.00' }}</span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle
                                    class="txt-5E6 mb-2 font-weight-medium">Profit/Loss</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(mfStats.pnl) > 0 ? 'maingreen--text' : Number(mfStats.pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span>{{ mfStats.pnl || '0.00' }}</span>
                                    </span>
                                    <span class="fs-13"
                                        :class="Number(mfStats.pnlPercent) > 0 ? 'maingreen--text' : Number(mfStats.pnlPercent) < 0 ? 'mainred--text' : 'subtext--text'">
                                        (<span>{{ Number(mfStats.pnlPercent) > 0 || Number(mfStats.pnlPercent) < 0 ?
                                            mfStats.pnlPercent : '0.00' }}</span>%)
                                        </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Toolbar -->
            <v-toolbar flat dense class="tool-sty my-6 pl-4 crd-trn">
                <v-tabs v-model="tab" color="primary" fixed show-arrows density="compact">
                    <v-tab value="stocks" class="font-weight-bold subtitle-1 mb-0 text-none">Stocks ({{ holdings.length
                        }})</v-tab>
                    <v-tab value="mutual" class="font-weight-bold subtitle-1 mb-0 text-none">Mutual Funds ({{
                        mfholdings.length }})</v-tab>
                </v-tabs>
                <v-spacer></v-spacer>

                <v-text-field v-if="tab === 'stocks'" v-model="opensearch" prepend-inner-icon="mdi-magnify"
                    label="Search" variant="solo-filled" color="primary" density="comfortable" hide-details
                    class="rounded-pill mr-4" style="max-width: 220px; background-color: #F1F3F8;" />


                <v-select v-if="tab === 'stocks'" style="max-width: 160px" v-model="exchtype" hide-details
                    item-title="txt" item-value="val" prepend-inner-icon="mdi-format-list-bulleted"
                    class="rounded-pill ml-4" variant="solo" density="comfortable" :bg-color="'secbg'"
                    :items="dashitems" label="Filter" />

                <v-btn v-if="tab === 'stocks' && edisbtn" @click="setdoEdis()"
                    class="elevation-0 rounded-pill font-weight-bold text-none ml-4" color="primary">E-DIS</v-btn>
                <v-icon v-if="tab !== 'portfolio'" :disabled="loading || mfLoading" class="ml-3 cursor-p"
                    @click="refresh" color="maintext" size="24">mdi-reload</v-icon>
            </v-toolbar>

            <!-- Stocks Table -->
            <div v-if="tab === 'stocks'">
                <v-data-table :headers="tableHeaders" :items="searchedHoldings" :loading="loading"
                    class="mt-3 rounded-lg overflow-y-auto" style="border-radius: 4px; border: 1px solid #EBEEF0"
                    height="480px" hide-default-footer fixed-header :item-value="'tokn'" :items-per-page="-1"
                    @click:row="(e, { item }) => setHoldingrowdata(item?.raw || item)">
                    <template #item.tsym="{ item }">
                        <div class="pos-rlt">
                            <p class="font-weight-medium maintext--text mb-0 table-hov-text mr-4">
                                {{ item.tsym }}
                                <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                            </p>
                            <div v-if="item && item.action" @click.stop class="pos-abs table-hov"
                                style="top: 15px; right: 0">
                                <v-btn @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 'b')"
                                    min-width="20px" color="maingreen"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small"> B
                                </v-btn>
                                <v-btn @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 's')"
                                    min-width="20px" color="mainred"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small"> S
                                </v-btn>
                                <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym)"
                                    style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                    class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                                </v-btn>
                                <v-tooltip location="bottom">
                                    <template #activator="{ props }">
                                        <div v-bind="props">
                                            <v-btn
                                                @click.stop="setSSDtab('exit-order', item.token, item.exch, item.tsym, item.netqty < 0 ? 'b' : 's', item)"
                                                style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                                class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                                <v-icon size="18" color="maintext">mdi-close</v-icon>
                                            </v-btn>
                                        </div>
                                    </template>
                                    <span>Exit</span>
                                </v-tooltip>
                                <v-menu close-on-click location="bottom" offset-y class="table-menu">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" style="border: 1px solid #EBEEF0" min-width="20px"
                                            color="mainbg" class="px-0 font-weight-bold elevation-0 mr-1"
                                            size="x-small">
                                            <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card class="table-menu-list">
                                        <v-list density="compact">
                                            <template v-for="(m, k) in menulist" :key="k">
                                                <v-list-item
                                                    @click="m.type != '' ? setSSDtab(m.type, item.token, item.exch, item.tsym, item.netqty < 0 ? 'b' : 's', item) : setHoldingrowdata(item)"
                                                    class="pl-3 pr-6">
                                                    <template #prepend>
                                                        <img v-if="typeof m.icon === 'number' && m.icon > 2"
                                                            width="20px" class="pl-1"
                                                            :src="`/src/assets/orderbook/${m.icon}.svg`" />
                                                        <v-icon v-else color="#506D84">{{ m.icon }}</v-icon>
                                                    </template>
                                                    <v-list-item-title class="subline--text font-weight-medium fs-14">{{
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
                    <template #item.netqty="{ item }">
                        <v-chip v-if="item && item.plgqty > 0" small class="table-hov-prd" color="secbg"
                            style="border-radius: 5px; padding: 10px 8px !important">
                            <v-icon color="primary" size="12">mdi-lock</v-icon>
                            <span class="font-weight-medium fs-12 primary--text">{{ item.plgqty }}</span>
                        </v-chip>
                        <v-chip v-if="item && item.btstqty > 0" small color="#FFD8B4" text-color="#E8862A"
                            :style="`border-radius: 5px; padding: 10px 8px !important; margin-left: 4px;`">
                            <span class="font-weight-medium fs-12">{{ `T1 ${item.btstqty}` }}</span>
                        </v-chip>
                        <v-chip small
                            :color="item && item.netqty > 0 ? 'secgreen' : item && item.netqty < 0 ? 'secred' : 'secbg'"
                            :text-color="item && item.netqty > 0 ? 'maingreen' : item && item.netqty < 0 ? 'mainred' : 'subtext'"
                            :style="`border: 1px solid ${item && item.netqty > 0 ? '#C1E7BA' : item && item.netqty < 0 ? '#FFCDCD' : '#DDD'}; border-radius: 5px; padding: 10px 8px !important;`">
                            <span class="font-weight-medium fs-12">{{ item && item.netqty > 0 ? `+${item.netqty}` : item
                                && item.netqty < 0 ? `${item.netqty}` : '0' }}</span>
                        </v-chip>
                    </template>
                    <template #item.rpnl="{ item }">
                        <span
                            :class="Number(item.rpnl) > 0 ? 'maingreen--text' : Number(item.rpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                            {{ formatMoney(item.rpnl) }}
                        </span>
                    </template>
                    <template #item.invested_val="{ item }">
                        <span>{{ formatMoney(item.invested_val) }}</span>
                    </template>
                    <template #item.current_val="{ item }">
                        <span>{{ formatMoney(item.current_val) }}</span>
                    </template>
                    <template #item.day_pnl="{ item }">
                        <span
                            :class="Number(item.day_pnl) > 0 ? 'maingreen--text' : Number(item.day_pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                            {{ formatMoney(item.day_pnl) }}
                        </span>
                    </template>
                    <template #item.day_pc="{ item }">
                        <span
                            :class="Number(item.day_pc) > 0 ? 'maingreen--text' : Number(item.day_pc) < 0 ? 'mainred--text' : 'subtext--text'">
                            {{ formatPct(item.day_pc) }}
                        </span>
                    </template>
                </v-data-table>
            </div>

            <!-- MF Table -->
            <div v-else-if="tab === 'mutual'">
                <v-data-table :headers="mfHeaders" :items="mfholdings" :loading="mfLoading"
                    class="mt-3 rounded-lg overflow-y-auto" style="border-radius: 4px; border: 1px solid #EBEEF0"
                    height="480px" hide-default-footer fixed-header :items-per-page="-1"
                    @click:row="(e, { item }) => setHoldingrowdata(item?.raw || item)">
                    <template #item.name="{ item }">
                        <div class="pos-rlt">
                            <p class="font-weight-medium maintext--text mb-0 table-hov-text mr-4">
                                {{ item.name || '-' }}
                            </p>
                            <div v-if="item && item.holdtype === 'mf'" @click.stop class="pos-abs table-hov"
                                style="top: 9px; right: 0">
                                <v-btn @click.stop="handleMenuDialog('mforder', 'redem', item)" small
                                    class="elevation-0 rounded-pill text-none primary--text font-weight-bold"
                                    color="secbg">Redeem</v-btn>
                            </div>
                        </div>
                    </template>
                    <template #item.profit_loss="{ item }">
                        <span
                            :class="Number(item.profit_loss) > 0 ? 'maingreen--text' : Number(item.profit_loss) < 0 ? 'mainred--text' : 'subtext--text'">
                            {{ item.profit_loss ?? '0.00' }}
                        </span>
                    </template>
                </v-data-table>
            </div>
        </div>

        <!-- Drawer -->
        <v-navigation-drawer v-model="holdingdrawer" location="right" temporary :scrim="true" width="360" color="cardbg"
            class="pt-2">
            <!-- Header -->
            <template #prepend>
                <v-toolbar density="compact" class="nav-drawer crd-trn">
                    <v-btn icon variant="text" density="comfortable" @click="closeDrawer" aria-label="Close drawer">
                        <v-icon color="maintext" size="20">mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">
                        Holding Details
                    </p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>

            <!-- Main content -->
            <v-list-item v-if="singledata && Object.keys(singledata).length > 0" class="py-3">
                <v-list-item-title v-if="singledata.holdtype === 'mf'" class="font-weight-medium maintext--text mb-3">
                    {{ singledata.name || '' }}
                </v-list-item-title>

                <v-list-item-title v-else class="font-weight-medium maintext--text mb-3">
                    {{ singledata.tsym || '' }}
                    <span class="ml-1 subtext--text fs-10">
                        {{ singledata.exchs || singledata.exch || '' }}
                    </span>
                </v-list-item-title>

                <!-- Current Value / LTP -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-medium fs-16 mb-1">
                    {{ singledata.current_value || '0.00' }}
                    <span :class="Number(singledata.profit_loss) > 0
                        ? 'maingreen--text'
                        : Number(singledata.profit_loss) < 0
                            ? 'mainred--text'
                            : 'subtext--text'" class="font-weight-medium fs-12">
                        {{ singledata.profit_loss || '0.00' }} ({{ singledata.changeprofitloss || '0.00' }}%)
                    </span>
                </v-list-item-title>

                <v-list-item-title v-else class="maintext--text font-weight-medium fs-16 mb-1">
                    {{ singledata.ltp || '0.00' }}
                    <span :class="Number(singledata.pnl) > 0
                        ? 'maingreen--text'
                        : Number(singledata.pnl) < 0
                            ? 'mainred--text'
                            : 'subtext--text'" class="font-weight-medium fs-12">
                        {{ singledata.pnl || '0.00' }} ({{ singledata.pnlc || '0.00' }}%)
                    </span>
                </v-list-item-title>
            </v-list-item>

            <div class="px-4" v-if="singledata && Object.keys(singledata).length > 0">
                <!-- EDIS / Exit Buttons -->
                <div class="pb-6" v-if="['NSE', 'BSE', 'MCX'].includes(singledata.exch)">
                    <v-row>
                        <v-col cols="6">
                            <v-btn v-if="edisbtn" class="elevation-0 rounded-pill font-weight-bold text-none"
                                color="primary" block>
                                E-DIS
                            </v-btn>
                            <v-btn v-else target="_blank"
                                :href="`https://profile.zebuetrade.in/deposltory/?uid=${uid}&token=${stoken}`"
                                class="elevation-0 rounded-pill font-weight-bold text-none" color="primary" block
                                height="40">
                                DO POA
                            </v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn @click="setSSDtab(
                                'exit-order',
                                singledata.token,
                                singledata.exch,
                                singledata.tsym,
                                singledata.netqty < 0 ? 'b' : 's',
                                singledata
                            )" class="rounded-pill text-none font-weight-bold" block height="40" variant="outlined">
                                <v-icon size="20">mdi-close</v-icon> Exit
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>

                <v-divider></v-divider>

                <!-- Quantity -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">
                    Quantity
                    <p class="float-right mb-0">
                        <v-chip v-if="singledata.holdtype === 'mf'" small :color="Number(singledata.avg_qty) > 0
                            ? 'secgreen'
                            : Number(singledata.avg_qty) < 0
                                ? 'secred'
                                : 'secbg'" :text-color="Number(singledata.avg_qty) > 0
                                    ? 'maingreen'
                                    : Number(singledata.avg_qty) < 0
                                        ? 'mainred'
                                        : 'subtext'" :style="`border: 1px solid ${Number(singledata.avg_qty) > 0
                                            ? '#C1E7BA'
                                            : Number(singledata.avg_qty) < 0
                                                ? '#FFCDCD'
                                                : '#DDD'
                                            }; border-radius: 5px; padding: 10px 8px !important;`">
                            <span class="font-weight-medium fs-12">
                                {{
                                    Number(singledata.avg_qty) > 0
                                        ? `+${singledata.avg_qty}`
                                        : Number(singledata.avg_qty) < 0 ? `${singledata.avg_qty}` : '0' }} </span>
                        </v-chip>

                        <v-chip v-else small :color="Number(singledata.netqty) > 0
                            ? 'secgreen'
                            : Number(singledata.netqty) < 0
                                ? 'secred'
                                : 'secbg'" :text-color="Number(singledata.netqty) > 0
                                    ? 'maingreen'
                                    : Number(singledata.netqty) < 0
                                        ? 'mainred'
                                        : 'subtext'" :style="`border: 1px solid ${Number(singledata.netqty) > 0
                                            ? '#C1E7BA'
                                            : Number(singledata.netqty) < 0
                                                ? '#FFCDCD'
                                                : '#DDD'
                                            }; border-radius: 5px; padding: 10px 8px !important;`">
                            <span class="font-weight-medium fs-12">
                                {{
                                    Number(singledata.netqty) > 0
                                        ? `+${singledata.netqty}`
                                        : Number(singledata.netqty) < 0 ? `${singledata.netqty}` : '0' }} </span>
                        </v-chip>
                    </p>
                </v-list-item-title>

                <v-divider></v-divider>

                <!-- Pledged Qty (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Pledged Qty
                    <p class="float-right mb-0">
                        <v-chip v-if="Number(singledata.plgqty) > 0" small class="table-hov-prd" text-color="#666"
                            style="border-radius: 5px; padding: 10px 8px !important">
                            <v-icon color="#999" size="12">mdi-lock</v-icon>
                            <span class="font-weight-medium fs-12">{{ singledata.plgqty }}</span>
                        </v-chip>
                        <span v-else>0</span>
                    </p>
                </v-list-item-title>
                <v-divider v-if="singledata.holdtype !== 'mf'"></v-divider>

                <!-- Avg NAV (MF) / Avg price (Stocks) -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Avg NAV
                    <p class="float-right mb-0">{{ singledata.avg_nav ? Number(singledata.avg_nav).toLocaleString() :
                        '0.00' }}
                    </p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-4">
                    Avg price
                    <p class="float-right mb-0">{{ singledata.upldprc || singledata.netavgprc ?
                        Number(singledata.upldprc || singledata.netavgprc).toLocaleString() : '0.00' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>

                <!-- NAV (MF) / Last trade price (Stocks) -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    NAV
                    <p class="float-right mb-0">{{ singledata.Cur_Nav || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-4">
                    Last trade price
                    <p class="float-right mb-0">{{ singledata.ltp || '0.00' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>

                <!-- Overall P&L -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Overall P&L
                    <p class="float-right mb-0">
                        {{ singledata.profit_loss || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.changeprofitloss) > 0 ? 'maingreen--text' : Number(singledata.changeprofitloss) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.changeprofitloss || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-4">
                    Overall P&L
                    <p class="float-right mb-0">
                        {{ singledata.pnl || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.pnlc) > 0 ? 'maingreen--text' : Number(singledata.pnlc) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.pnlc || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>
                <v-divider v-if="singledata.holdtype !== 'mf'"></v-divider>

                <!-- Day P&L (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Day P&L
                    <p class="float-right mb-0">
                        {{ singledata.d_pnl || singledata.day_pnl || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.d_cpnl || singledata.day_pc) > 0 ? 'maingreen--text' : Number(singledata.d_cpnl || singledata.day_pc) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.d_cpnl || singledata.day_pc || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>
                <v-divider></v-divider>

                <!-- Investment -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">
                    Investment
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.invested_value || ''
                    }}</p>
                    <p class="float-right mb-0" v-else>{{ singledata.inv || singledata.invested_val || '' }}</p>
                </v-list-item-title>
                <v-divider></v-divider>

                <!-- Current value -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">
                    Current value
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.current_value || '' }}
                    </p>
                    <p class="float-right mb-0" v-else>{{ singledata.curr || singledata.current_val || '' }}</p>
                </v-list-item-title>
                <v-divider v-if="singledata.holdtype !== 'mf'"></v-divider>

                <!-- Product (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Product
                    <p class="float-right mb-0">{{ singledata.prd ? (singledata.prd === 'I' ? 'INTRADAY' :
                        singledata.prd
                            === 'C' ? 'DELIVERY' : 'MARKET') : '' }}</p>
                </v-list-item-title>
                <v-divider v-if="singledata.holdtype !== 'mf'"></v-divider>

                <!-- Order type (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-4">
                    Order type
                    <p class="float-right mb-0">{{ singledata.s_prdt_ali || '-' }}</p>
                </v-list-item-title>
                <v-divider v-if="singledata.holdtype !== 'mf'"></v-divider>

                <!-- ISIN -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">
                    ISIN
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.ISIN || '-' }}</p>
                    <p class="float-right mb-0" v-else>{{ singledata.isin || '-' }}</p>
                </v-list-item-title>
            </div>

            <!-- Footer -->
            <template #append
                v-if="singledata && Object.keys(singledata).length && ['NSE', 'BSE', 'MCX'].includes(singledata.exch)">
                <v-divider></v-divider>
                <div class="pa-4">
                    <v-btn @click="handleMenuDialog(
                        'order',
                        singledata.token,
                        singledata.exch,
                        singledata.tsym,
                        singledata.netqty > 0 ? 'b' : 's'
                    )" class="rounded-pill text-none font-weight-bold elevation-0" :color="Number(singledata.netqty) > 0
                        ? 'secgreen'
                        : Number(singledata.netqty) < 0
                            ? 'secred'
                            : 'secbg'" :text-color="Number(singledata.netqty) > 0
                                ? 'maingreen'
                                : Number(singledata.netqty) < 0
                                    ? 'mainred'
                                    : 'subtext'" block height="40" :style="`border: 2px solid ${Number(singledata.netqty) > 0
                                        ? '#C1E7BA'
                                        : Number(singledata.netqty) < 0
                                            ? '#FFCDCD'
                                            : '#DDD'
                                        };`">
                        <v-icon size="20">mdi-plus</v-icon> Add
                    </v-btn>
                </div>
            </template>

            <template #append v-else>
                <v-divider></v-divider>
                <div class="pa-4">
                    <v-btn block color="primary" variant="tonal" class="text-none" @click="closeDrawer">
                        Close
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getMHoldings, getMMHoldings, getQuotesdata, getHsTokenapi } from '@/components/mixins/getAPIdata'
import CryptoJS from 'crypto-js'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(false)
const holdings = ref([])
const tab = ref('stocks')
const mfholdings = ref([])
const mfLoading = ref(false)
const opensearch = ref('')
const exchtype = ref('all')
const holdingdrawer = ref(false)
const singledata = ref({})
const edisbtn = ref(false)
const uid = ref("")
const stoken = ref("")

const dashitems = ref([
    { val: 'all', txt: 'All' },
    { val: 'NSE', txt: 'NSE' },
    { val: 'BSE', txt: 'BSE' },
    { val: 'MCX', txt: 'MCX' },
    { val: 'bond', txt: 'Bonds' }
])

const menulist = ref([
    { name: 'Add', icon: 'mdi-plus', type: 'order' },
    { name: 'Exit', icon: 'mdi-close', type: 'exit-order', hr: true },
    { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
    { name: 'Create Alert', icon: 5, type: 'alert' },
    { name: 'Market Depth', icon: 6, type: 'depth' },
    { name: 'Chart', icon: 7, type: 'chart', hr: true },
    { name: 'Fundamentals', icon: 9, type: 'Funda' },
    { name: 'Details', icon: 10, type: '' }
])

// Vuetify 3 headers
const preferredColumns = [
    { key: 'tsym', text: 'Instrument' },
    { key: 'netqty', text: 'Net Qty' },
    { key: 'netavgprc', text: 'Avg Price', align: 'right' },
    { key: 'ltp', text: 'LTP', align: 'right' },
    { key: 'invested_val', text: 'Invested', align: 'right' },
    { key: 'current_val', text: 'Current Value', align: 'right' },
    { key: 'day_pnl', text: 'Day P&L', align: 'right' },
    { key: 'day_pc', text: 'Day %', align: 'right' },
    { key: 'rpnl', text: 'P&L', align: 'right' }
]

const numericLike = new Set(['netqty', 'netavgprc', 'ltp', 'invested_val', 'current_val', 'day_pnl', 'day_pc', 'rpnl'])

function buildHeadersFrom(items) {
    const headers = []
    const sample = items && items.length ? items[0] : null
    preferredColumns.forEach(col => {
        if (!sample || Object.prototype.hasOwnProperty.call(sample, col.key)) {
            headers.push({ title: col.text, key: col.key, align: col.align || (numericLike.has(col.key) ? 'right' : undefined) })
        }
    })
    return headers
}

const tableHeaders = computed(() => buildHeadersFrom(holdings.value))

const mfHeaders = computed(() => [
    { title: 'Instrument', key: 'name' },
    { title: 'Qty', key: 'avg_qty', align: 'right' },
    { title: 'Avg NAV', key: 'avg_nav', align: 'right' },
    { title: 'NAV', key: 'Cur_Nav', align: 'right' },
    { title: 'Invested', key: 'invested_value', align: 'right' },
    { title: 'Current Value', key: 'current_value', align: 'right' },
    { title: 'Overall P&L', key: 'profit_loss', align: 'right' },
    { title: 'Overall %', key: 'changeprofitloss', align: 'right' }
])

const holdingsItems = computed(() => Array.isArray(holdings.value) ? holdings.value : [])

const stats = computed(() => {
    const list = holdings.value || []
    if (list.length === 0) {
        return {
            stockvalue: '0.00',
            invested: '0.00',
            pnl: '0.00',
            cpnl: '0.00',
            d_pnl: '0.00',
            d_cpnl: '0.00',
            positive: 0,
            negative: 0
        }
    }

    // Use old field names (inv, curr, pnl) to match old code logic
    const getTotal = (key) => list.reduce((acc, o) => acc + (Number(o[key]) || 0), 0)

    const totalInv = getTotal('inv')
    const totalCurr = getTotal('curr')
    const totalPnL = getTotal('pnl')
    const totalDPnl = getTotal('d_pnl')

    // Use pnlc (percentage) for positive/negative filtering (matching old code)
    const positive = list.filter(o => Number(o.pnlc) > 0).length
    const negative = list.filter(o => Number(o.pnlc) < 0).length

    // Format like old code: absView shows absolute value, sign in colors
    // d_pnl preserves sign (old code: stat.d_pnl = totalDPnl.toFixed(2))
    // pnl shows absolute value (old code: stat.pnl = absView(totalPnl))
    const absView = (value) => (value > 0 || value < 0 ? Math.abs(value).toFixed(2) : '0.00')

    return {
        stockvalue: absView(totalCurr),
        invested: absView(totalInv),
        pnl: absView(totalPnL),
        cpnl: totalInv > 0 ? ((totalPnL / totalInv) * 100).toFixed(2) : '0.00',
        d_pnl: totalDPnl.toFixed(2), // Preserve sign like old code
        d_cpnl: totalInv > 0 ? ((totalDPnl / totalInv) * 100).toFixed(2) : '0.00',
        positive,
        negative
    }
})

const mfStats = computed(() => {
    const list = mfholdings.value || []
    if (list.length === 0) {
        return {
            totalValue: '0.00',
            invested: '0.00',
            pnl: '0.00',
            pnlPercent: '0.00'
        }
    }

    const totalVal = list.reduce((a, o) => a + (Number(o.current_value) || 0), 0)
    const invested = list.reduce((a, o) => a + (Number(o.invested_value) || 0), 0)
    const pnl = totalVal - invested
    const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0.00'

    return {
        totalValue: formatMoney(totalVal),
        invested: formatMoney(invested),
        pnl: formatMoney(pnl),
        pnlPercent
    }
})

function formatMoney(v) {
    const n = Number(v)
    return isFinite(n) ? Number(n).toFixed(2) : '0.00'
}

function formatPct(v) {
    const n = Number(v)
    return isFinite(n) ? `${n.toFixed(2)} %` : '0.00 %'
}

function includeSearch(item, keys, term) {
    if (!term) return true
    const q = term.toLowerCase()
    return keys.some(k => item?.[k] !== undefined && String(item[k]).toLowerCase().includes(q))
}

function setHoldingsPayload(payload) {
    const list = payload?.response || []
    edisbtn.value = payload?.edis > 0

    list.forEach((d, i) => {
        d.tokn = `${d.token}_${i}`
        const ltp = Number(d.ltp)
        const prev = Number(d.close || d.prev_close_price)

        if (!isFinite(d.rpnl)) {
            const qty = Number(d.netqty) || 0
            const avg = Number(d.netavgprc || d.upldprc) || 0
            if (isFinite(ltp) && qty) d.rpnl = ((ltp - avg) * qty).toFixed(2)
            else d.rpnl = '0.00'
        }
        if (!isFinite(d.ltp) && isFinite(prev)) d.ltp = prev.toFixed(2)

        const qty = Number(d.netqty) || 0
        const avg = Number(d.netavgprc || d.upldprc) || 0
        const last = isFinite(ltp) ? ltp : avg
        const prevClose = isFinite(prev) ? prev : last
        const netQtyAbs = Math.abs(qty)

        // New field names for compatibility
        d.invested_val = (avg * netQtyAbs).toFixed(2)
        d.current_val = (last * netQtyAbs).toFixed(2)

        // Old field names for stats calculation (matching old code)
        d.inv = d.invested_val
        d.curr = d.current_val

        // P&L calculations (matching old code)
        d.pnl = (Number(d.curr) - Number(d.inv)).toFixed(2)
        d.pnlc = Number(d.inv) > 0 ? ((Number(d.pnl) / Number(d.inv)) * 100).toFixed(2) : '0.00'

        // Day P&L
        d.day_pnl = ((last - prevClose) * netQtyAbs).toFixed(2)
        d.d_pnl = d.day_pnl
        d.day_pc = prevClose ? (((last - prevClose) / prevClose) * 100).toFixed(2) : '0.00'
        d.d_cpnl = Number(d.inv) > 0 ? ((Number(d.d_pnl) / Number(d.inv)) * 100).toFixed(2) : '0.00'

        // Keep rpnl for backward compatibility
        d.rpnl = d.rpnl || d.pnl
    })

    holdings.value = list

    // Subscribe to WebSocket for live updates
    if (list.length > 0) {
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow: 'sub', data: list, is: 'hold', page: 'holding' }
        }))
    }
}

const filteredHoldings = computed(() => {
    if (exchtype.value === 'all') return holdingsItems.value
    return holdingsItems.value.filter(h => {
        if (exchtype.value === 'bond') {
            return h.exchs === 'T-BILL' || h.exchs === 'G-SEC' || h.exchs === 'SGB'
        }
        return h.exch === exchtype.value
    })
})

const searchedHoldings = computed(() => {
    const term = opensearch.value
    if (!term) return filteredHoldings.value
    return filteredHoldings.value.filter(h => includeSearch(h, ['tsym', 'exch'], term))
})

async function fetchHoldings() {
    loading.value = true
    const data = await getMHoldings(true)
    if (data && data.response && Array.isArray(data.response)) {
        setHoldingsPayload(data)
        // Cache for offline use
        sessionStorage.setItem('holdings_last', JSON.stringify(data))
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load holdings')
        // Try to load cached data
        const cached = sessionStorage.getItem('holdings_last')
        if (cached) {
            try {
                setHoldingsPayload(JSON.parse(cached))
            } catch (e) {
                console.error('Failed to load cached holdings', e)
            }
        }
    }
    loading.value = false
}

async function fetchMfHoldings() {
    mfLoading.value = true
    const data = await getMMHoldings()
    if (data && Array.isArray(data.data)) {
        mfholdings.value = data.data.map((d, idx) => ({ ...d, idx, holdtype: 'mf' }))
        // Cache for offline use
        sessionStorage.setItem('mfholdings_last', JSON.stringify(data))
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load MF holdings')
        // Try to load cached data
        const cached = sessionStorage.getItem('mfholdings_last')
        if (cached) {
            try {
                const parsed = JSON.parse(cached)
                mfholdings.value = parsed.data ? parsed.data.map((d, idx) => ({ ...d, idx, holdtype: 'mf' })) : []
            } catch (e) {
                console.error('Failed to load cached MF holdings', e)
            }
        }
    }
    mfLoading.value = false
}

function onTempUpdate(e) {
    const payload = e.detail
    if (payload?.response) {
        setHoldingsPayload(payload)
        // Keep drawer details fresh when temp data updates (like Positions)
        if (holdingdrawer.value && singledata.value && singledata.value.tokn) {
            const si = holdings.value.findIndex(o => o.tokn === singledata.value.tokn)
            if (si >= 0) {
                singledata.value = { ...holdings.value[si] }
            }
        }
    }
}

function onWsTick(e) {
    const t = e.detail
    if (!t?.token || !holdings.value?.length) return

    const idx = holdings.value.findIndex(x => x.token == t.token)
    if (idx >= 0) {
        const h = holdings.value[idx]
        const ltp = Number(t.lp || t.ltp)
        const prev = Number(t.close || t.prev_close_price || h.close)

        if (isFinite(ltp)) h.ltp = ltp.toFixed(2)
        if (isFinite(prev)) h.close = prev

        const qty = Number(h.netqty) || 0
        const avg = Number(h.netavgprc || h.upldprc) || 0
        const last = Number(h.ltp) || avg
        const prevClose = isFinite(prev) ? prev : last
        const netQtyAbs = Math.abs(qty)

        // New field names
        h.invested_val = (avg * netQtyAbs).toFixed(2)
        h.current_val = (last * netQtyAbs).toFixed(2)

        // Old field names for stats calculation (matching old code)
        h.inv = h.invested_val
        h.curr = h.current_val

        // P&L calculations (matching old code)
        h.pnl = (Number(h.curr) - Number(h.inv)).toFixed(2)
        h.pnlc = Number(h.inv) > 0 ? ((Number(h.pnl) / Number(h.inv)) * 100).toFixed(2) : '0.00'

        // Day P&L
        h.day_pnl = ((last - prevClose) * netQtyAbs).toFixed(2)
        h.d_pnl = h.day_pnl
        h.day_pc = prevClose ? (((last - prevClose) / prevClose) * 100).toFixed(2) : '0.00'
        h.d_cpnl = Number(h.inv) > 0 ? ((Number(h.d_pnl) / Number(h.inv)) * 100).toFixed(2) : '0.00'

        // Keep rpnl for backward compatibility
        if (qty) h.rpnl = ((last - avg) * qty).toFixed(2)
        else h.rpnl = h.pnl
    }
    // Keep drawer details fresh (like Positions)
    if (holdingdrawer.value && singledata.value && singledata.value.tokn) {
        const si = holdings.value.findIndex(o => o.tokn === singledata.value.tokn)
        if (si >= 0) {
            singledata.value = { ...holdings.value[si] }
        }
    }
    // Also check for MF holdings
    if (holdingdrawer.value && singledata.value && singledata.value.holdtype === 'mf') {
        const mfIdx = mfholdings.value.findIndex(m => m.idx === singledata.value.idx)
        if (mfIdx >= 0) {
            singledata.value = { ...mfholdings.value[mfIdx] }
        }
    }
}

function handleMenuDialog(type, token, exch, tsym, trans, item) {
    console.log("handleMenuDialog", type, token, exch, tsym, trans, item);
    holdingdrawer.value = false
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type, token, exch, tsym, trantype: trans, item }
    }))
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    console.log("setSSDtab", type, token, exch, tsym, trans, item);

    holdingdrawer.value = false

    if (type === 'alert') {
        handleMenuDialog('alert', token, exch, tsym)
    } else if (type === 'cGTT') {
        handleMenuDialog('order-GTT', token, exch, tsym, 'b')
    } else if (type === 'exit-order') {
        handleMenuDialog('exit-order', token, exch, tsym, trans, item)
    } else if (type === 'order') {
        handleMenuDialog('order', token, exch, tsym, item?.netqty < 0 ? 's' : 'b', item)
    } else {
        const path = [type, token, exch, tsym]
        router.push({ name: 'stocks details', params: { val: path } })
    }
}

async function setHoldingrowdata(item) {
    holdingdrawer.value = true
    if (!item) return
    const src = item && item.raw ? item.raw : item
    if (!src || !Object.keys(src).length) return
    singledata.value = { ...src }
    if (src.exch && src.token && !src.holdtype) {
        try {
            const quotes = await getQuotesdata(`${src.exch}|${src.token}`)
            singledata.value.quotes = quotes
        } catch (e) {
            console.error('Failed to fetch quotes', e)
        }
    }
}

async function setdoEdis() {
    try {
        const data = await getHsTokenapi()
        if (data && data.stat == 'Ok') {
            const beforehas = CryptoJS.enc.Utf8.parse(`sLoginId=${uid.value}&sAccountId=${uid.value}&prd=C&token=${data.hstk}&sBrokerId=ZEBU&open=edis`)
            const codeforedis = CryptoJS.enc.Base64.stringify(beforehas)
            window.open(`https://go.mynt.in/NorenEdis/NonPoaHoldings/?${codeforedis}`, '_blank')
        } else {
            appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to get E-DIS token')
        }
    } catch (e) {
        console.error('E-DIS error', e)
        appStore.showSnackbar(2, 'Failed to open E-DIS')
    }
}

function closeDrawer() {
    holdingdrawer.value = false
}

function refresh() {
    if (tab.value === 'stocks') fetchHoldings()
    else if (tab.value === 'mutual') fetchMfHoldings()
}

function onOrderbookUpdate(e) {
    if (e.detail === 'port-order') {
        fetchHoldings()
    }
}

onMounted(() => {
    uid.value = sessionStorage.getItem('userid')
    stoken.value = sessionStorage.getItem('usession')

    // Load cached data immediately for optimistic UI
    const cached = sessionStorage.getItem('holdings_last')
    if (cached) {
        try {
            const parsed = JSON.parse(cached)
            if (parsed.response && Array.isArray(parsed.response) && parsed.response.length > 0) {
                setHoldingsPayload(parsed)
            }
        } catch (e) {
            console.error('Failed to load cached holdings', e)
        }
    }

    // Fetch fresh data
    fetchHoldings()
    fetchMfHoldings()

    // Subscribe to updates
    window.addEventListener('tempdata-update', onTempUpdate)
    window.addEventListener('web-scoketConn', onWsTick)
    window.addEventListener('orderbook-update', onOrderbookUpdate)
})

onBeforeUnmount(() => {
    // Unsubscribe from WebSocket
    if (holdings.value.length > 0) {
        window.dispatchEvent(new CustomEvent('web-scoketOn', {
            detail: { flow: 'unsub', data: holdings.value, is: 'hold', page: 'holding' }
        }))
    }

    window.removeEventListener('tempdata-update', onTempUpdate)
    window.removeEventListener('web-scoketConn', onWsTick)
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
})
</script>
