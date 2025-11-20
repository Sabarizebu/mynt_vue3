<template>
    <div>
        <div class="my-6">
            <!-- Stats Cards -->
            <v-row v-if="tab !== 'portfolio'">
                <v-col cols="12">
                    <v-card v-if="tab === 'stocks'" class="stat-card rounded-lg pa-4" elevation="0">
                        <div class="d-flex justify-space-between align-center flex-wrap" style="gap: 16px;">
                            <!-- Stocks Value -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Stocks Value</div>
                                <div class="stat-value maintext--text font-weight-medium"
                                    style="font-size: 16px !important; ">
                                    {{ stats.stockvalue || '0.00' }}
                                </div>
                            </div>

                            <!-- Day Change -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Day Change</div>
                                <div class="stat-value font-weight-medium" style="font-size: 16px !important;"
                                    :class="Number(stats.d_pnl) > 0 ? 'maingreen--text' : Number(stats.d_pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                    {{ stats.d_pnl || '0.00' }}<span style="font-size: 13px !important;"
                                        class="ml-1">({{ Number(stats.d_cpnl) > 0 ||
                                            Number(stats.d_cpnl) < 0 ? stats.d_cpnl : '0.00' }}%)</span>
                                </div>
                            </div>

                            <!-- Invested -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Invested</div>
                                <div class="stat-value maintext--text font-weight-medium"
                                    style="font-size: 16px !important;">
                                    {{ stats.invested || '0.00' }}
                                </div>
                            </div>

                            <!-- Profit/Loss -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Profit/Loss</div>
                                <div class="stat-value font-weight-medium" style="font-size: 16px !important;"
                                    :class="Number(stats.cpnl) > 0 ? 'maingreen--text' : Number(stats.cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                    {{ stats.pnl || '0.00' }}<span style="font-size: 13px !important;" class="ml-1">({{
                                        Number(stats.cpnl) > 0 ||
                                            Number(stats.cpnl) < 0 ? stats.cpnl : '0.00' }}%)</span>
                                </div>
                            </div>

                            <!-- Stock Position -->
                            <div class="stat-item " style="min-width: 140px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Stock Position</div>
                                <div class="d-flex align-center" style="gap: 8px;">
                                    <v-chip size="large" class="rounded-lg maingreen--text">
                                        <span class="fs-14 font-weight-regular">{{ stats.positive || 0 }}
                                            Positive</span>
                                    </v-chip>
                                    <v-chip size="large" class="rounded-lg mainred--text">
                                        <span class="fs-14 font-weight-regular">{{ stats.negative || 0 }}
                                            Negative</span>
                                    </v-chip>
                                </div>
                            </div>
                        </div>
                    </v-card>

                    <!-- Mutual Funds Stats -->
                    <v-card v-else class="stat-card rounded-lg pa-4" elevation="0">
                        <div class="d-flex justify-space-between align-center flex-wrap" style="gap: 16px;">
                            <!-- Current Value -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Current Value</div>
                                <div class="stat-value maintext--text fs-16 font-weight-bold">
                                    {{ mfStats.totalValue || '0.00' }}
                                </div>
                            </div>

                            <!-- Invested -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Invested</div>
                                <div class="stat-value maintext--text fs-16 font-weight-bold">
                                    {{ mfStats.invested || '0.00' }}
                                </div>
                            </div>

                            <!-- Profit/Loss -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Profit/Loss</div>
                                <div class="stat-value fs-16 font-weight-bold"
                                    :class="Number(mfStats.pnl) > 0 ? 'maingreen--text' : Number(mfStats.pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                    {{ mfStats.pnl || '0.00' }}<span class="fs-13 ml-1">({{ Number(mfStats.pnlPercent) >
                                        0 || Number(mfStats.pnlPercent) < 0 ? mfStats.pnlPercent : '0.00' }}%)</span>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Toolbar -->
            <v-toolbar flat dense class="tool-sty my-0 pl-4 crd-trn">
                <v-tabs v-model="tab" color="primary" fixed show-arrows density="compact">
                    <v-tab value="stocks" class="font-weight-bold subtitle-1 mb-0 text-none">Stocks ({{ holdings.length
                    }})</v-tab>
                    <v-tab value="mutual" class="font-weight-bold subtitle-1 mb-0 text-none">Mutual Funds ({{
                        mfholdings.length }})</v-tab>
                </v-tabs>
                <v-spacer></v-spacer>

                <!-- <v-text-field rounded v-model="peersearch" hide-details prepend-inner-icon="mdi-magnify" placeholder="Search" class="rounded-pill d-none d-md-flex"
                 density="compact" variant="solo" flat bg-color="secbg"></v-text-field> -->

                <v-text-field elevation="0" rounded v-if="tab === 'stocks'" v-model="opensearch"
                    prepend-inner-icon="mdi-magnify" placeholder="Search" variant="solo" density="compact" hide-details
                    class="rounded mr-4" style="max-width: 150px !important;font-size: 14px !important;" flat
                    bg-color="secbg" />

                <v-text-field v-if="tab === 'mutual'" v-model="mfsearch" prepend-inner-icon="mdi-magnify"
                    placeholder="Search" variant="solo" density="compact" hide-details rounded="pill" class=" mr-4"
                    style="max-width: 150px !important; font-size: 14px !important;" flat bg-color="secbg" />


                <v-select v-if="tab === 'stocks'" style="max-width: 160px" v-model="exchtype" rounded hide-details
                    item-title="txt" item-value="val" prepend-inner-icon="mdi-format-list-bulleted"
                    class="rounded-pill ml-4" variant="solo" density="compact" flat bg-color="secbg" elevation="0"
                    :items="dashitems" />

                <v-btn v-if="tab === 'stocks' && edisbtn" @click="setdoEdis()"
                    class="elevation-0 rounded-pill font-weight-bold text-none ml-4"
                    style="background-color: #01409F; color: #fff;">E-DIS</v-btn>
                <v-icon v-if="tab !== 'portfolio'" :disabled="loading || mfLoading" class="ml-3 cursor-p"
                    @click="refresh" color="maintext" size="24">mdi-reload</v-icon>
            </v-toolbar>

            <!-- Stocks Table -->
            <v-window v-model="tab" style="z-index:0">
                <v-window-item value="stocks">
                    <v-data-table :headers="tableHeaders" :items="searchedHoldings" :loading="loading"
                        class="holdings-table mt-3 rounded-lg overflow-y-auto"
                        style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;"
                        height="480px" hide-default-footer fixed-header :item-value="'tokn'" :items-per-page="-1"
                        :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })"
                        @click:row="(e, { item }) => setHoldingrowdata(item?.raw || item)">
                        <template #item.tsym="{ item }">
                            <div class="pos-rlt" style="min-height: 40px; padding-right: 30px;">
                                <p class="font-weight-medium fs-13 txt-162 black--text mb-0 table-hov-text"
                                    style="margin-right: 0; white-space: nowrap;">
                                    {{ item.tsym }}
                                    <span class="ml-1 subtext--text fs-10">{{ item.exch || '' }}</span>
                                </p>
                                <div v-if="item" @click.stop class="pos-abs table-hov"
                                    style="top: 50%; transform: translateY(-50%); right: 0; z-index: 10; gap: 4px; pointer-events: auto; display: flex; align-items: center;">
                                    <v-btn
                                        @click.stop="handleMenuDialog('order', item.token, item.exch || item.exchs, item.tsym, 'b')"
                                        min-width="20px" height="20px"
                                        style="background-color: #43A833; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                                        class="font-weight-bold elevation-0 mr-1" size="x-small"> B
                                    </v-btn>
                                    <v-btn
                                        @click.stop="handleMenuDialog('order', item.token, item.exch || item.exchs, item.tsym, 's')"
                                        min-width="20px" height="20px"
                                        style="background-color: #F23645; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                                        class="font-weight-bold elevation-0 mr-1" size="x-small"> S
                                    </v-btn>
                                    <v-btn
                                        @click.stop="setSSDtab('chart', item.token, item.exch || item.exchs, item.tsym, null, item)"
                                        style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                        min-width="20px" color="mainbg" class="font-weight-bold elevation-0 mr-1"
                                        size="x-small">
                                        <v-icon size="14" color="#666666">mdi-chart-line-variant</v-icon>
                                    </v-btn>
                                    <v-tooltip location="bottom">
                                        <template #activator="{ props }">
                                            <div v-bind="props">
                                                <v-btn
                                                    @click.stop="setSSDtab('exit-order', item.token, item.exch || item.exchs, item.tsym, 's', item)"
                                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                                    min-width="20px" color="mainbg"
                                                    class="font-weight-bold elevation-0 mr-1" size="x-small">
                                                    <v-icon size="14" color="#666666">mdi-close</v-icon>
                                                </v-btn>
                                            </div>
                                        </template>
                                        <span>Exit</span>
                                    </v-tooltip>
                                    <v-menu close-on-click location="bottom" offset-y class="table-menu">
                                        <template #activator="{ props }">
                                            <v-btn v-bind="props"
                                                style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                                min-width="20px" color="mainbg"
                                                class="font-weight-bold elevation-0 mr-1" size="x-small">
                                                <v-icon size="14" color="#666666">mdi-dots-horizontal</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="table-menu-list">
                                            <v-list density="compact" class="pa-0">
                                                <template v-for="(m, k) in menulist" :key="k">
                                                    <v-list-item
                                                        @click="m.type != '' ? setSSDtab(m.type, item.token, item.exch || item.exchs, item.tsym, item.netqty < 0 ? 'b' : 's', item) : setHoldingrowdata(item)"
                                                        class="px-3 py-2">
                                                        <template #prepend>
                                                            <div class="d-flex align-center justify-center"
                                                                style="min-width: 24px;">
                                                                <img v-if="typeof m.icon === 'number' && m.icon > 2"
                                                                    width="20px" height="20px"
                                                                    :src="getOrderbookIconUrl(m.icon)" />
                                                                <v-icon v-else color="#506D84" size="20">{{ m.icon
                                                                }}</v-icon>
                                                            </div>
                                                        </template>
                                                        <v-list-item-title
                                                            class="subline--text font-weight-medium fs-14 ml-2">{{
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
                            <v-chip v-if="item && item.plgqty > 0" small class="table-hov-prd maingreen--text"
                                style="border-radius: 4px; padding: 4px 8px !important;background-color: #43A833; margin-right: 4px;">
                                <v-icon color="#ffffff" size="12">mdi-lock</v-icon>
                                <span class="font-weight-medium fs-12" style="color: #ffffff;">{{ item.plgqty }}</span>
                            </v-chip>
                            <v-chip v-if="item && item.btstqty > 0" small color="#FFD8B4" text-color="#E8862A"
                                :style="`border-radius: 4px; padding: 4px 8px !important; margin-left: 4px;`">
                                <span class="font-weight-medium fs-12">{{ `T1 ${item.btstqty}` }}</span>
                            </v-chip>
                            <v-chip size="small"
                                style="background-color: #E6F5EA; color: #43A833; border-radius: 4px; padding: 4px 8px; font-weight: 500;"
                                class="netqty-chip">
                                <span class="font-weight-medium fs-12" style="color: #43A833;">{{ item && item.netqty >
                                    0 ?
                                    `+${item.netqty}` : item
                                        && item.netqty < 0 ? `${item.netqty}` : '0' }}</span>
                            </v-chip>
                        </template>
                        <template #item.netavgprc="{ item }">
                            <span class=" fs-13 txt-162 black--text" style="text-align: right; display: block;">{{
                                formatMoney(item.netavgprc ||
                                    item.upldprc)
                            }}</span>
                        </template>
                        <template #item.ltp="{ item }">
                            <span class="font-weight-medium fs-13 txt-162"
                                style="text-align: right; display: block;color: black !important;">{{
                                    formatMoney(item.ltp) }}</span>
                        </template>
                        <template #item.rpnl="{ item }">
                            <span class="font-weight-medium fs-13"
                                style="text-align: right; display: block;color: black !important;">
                                {{ formatMoney(item.rpnl) }}
                            </span>
                        </template>
                        <template #item.invested_val="{ item }">
                            <span class="font-weight-medium fs-13 txt-162"
                                style="text-align: right; display: block;color: black !important;">{{
                                    formatMoney(item.invested_val) }}</span>
                        </template>
                        <template #item.current_val="{ item }">
                            <span class="font-weight-medium fs-13 txt-162"
                                style="text-align: right; display: block;color: black !important;">{{
                                    formatMoney(item.current_val) }}</span>
                        </template>
                        <template #item.day_pnl="{ item }">
                            <span class="font-weight-medium fs-13"
                                style="text-align: right; display: block;color: black !important;">
                                {{ formatMoney(item.day_pnl) }}
                            </span>
                        </template>
                        <template #item.day_pc="{ item }">
                            <span class="font-weight-medium fs-13"
                                :class="Number(item.day_pc) > 0 ? 'maingreen--text' : Number(item.day_pc) < 0 ? 'mainred--text' : 'subtext--text'"
                                :style="Number(item.day_pc) > 0 ? 'color: #43A833 !important;' : Number(item.day_pc) < 0 ? 'color: #F23645 !important;' : 'color: black !important;'"
                                style="text-align: right; display: block;">
                                {{ formatPct(item.day_pc) }}
                            </span>
                        </template>
                        <template #item.pnlc="{ item }">
                            <span class="font-weight-medium fs-13"
                                :class="Number(item.pnlc) > 0 ? 'maingreen--text' : Number(item.pnlc) < 0 ? 'mainred--text' : 'subtext--text'"
                                style="text-align: right; display: block;">
                                {{ formatPct(item.pnlc) }}
                            </span>
                        </template>
                    </v-data-table>
                </v-window-item>

                <!-- MF Table -->
                <v-window-item value="mutual">
                    <v-data-table :headers="mfHeaders" :items="searchedMFHoldings" :loading="mfLoading"
                        class="holdings-table mt-3 rounded-lg overflow-y-auto"
                        style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;"
                        height="480px" hide-default-footer fixed-header :items-per-page="-1" :item-value="'idx'"
                        :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })"
                        @click:row="(e, { item }) => setHoldingrowdata(item?.raw || item)">
                        <template #item.name="{ item }">
                            <div class="pos-rlt"
                                style="min-height: 40px; padding-right: 10px;margin-top: 10px !important;margin-bottom: -10px !important;">
                                <p class="font-weight-medium fs-13 txt-162 black--text mb-0 table-hov-text"
                                    style="margin-right: 0; white-space: nowrap;">
                                    {{ item.name || '-' }}
                                </p>
                                <div v-if="item && item.holdtype === 'mf'" @click.stop class="pos-abs table-hov"
                                    style="top: 20%; transform: translateY(-50%); right: 0; z-index: 10; gap: 4px; pointer-events: auto; display: flex; align-items: center;">
                                    <v-btn @click.stop="handleMFOrder('mforder', 'redem', item)" rounded="pill"
                                        size="small"
                                        style="background-color: #F1F3F8; color: blue; padding: 5px  10px !important;font-size: 12px !important;z-index: 999;"
                                        class="font-weight-bold elevation-0 mr-1 text-none ">
                                        Redeem
                                    </v-btn>
                                </div>
                            </div>
                        </template>
                        <template #item.avg_qty="{ item }">
                            <div class="d-flex justify-end">
                                <v-chip size="small"
                                    style="background-color: #E6F5EA; color: #43A833; border-radius: 4px; padding: 4px 8px; font-weight: 500;"
                                    class="netqty-chip">
                                    <span class="font-weight-medium fs-12" style="color: #43A833;">{{ item &&
                                        item.avg_qty >
                                        0 ?
                                        `+${item.avg_qty}` : item && item.avg_qty < 0 ? `${item.avg_qty}` : '0'
                                    }}</span>
                                </v-chip>
                            </div>
                        </template>
                        <template #item.avg_nav="{ item }">
                            <span class="font-weight-medium fs-13 txt-162 black--text"
                                style="text-align: right; display: block;">{{ formatMoney(item.avg_nav) }}</span>
                        </template>
                        <template #item.Cur_Nav="{ item }">
                            <span class="font-weight-medium fs-13 txt-162 black--text"
                                style="text-align: right; display: block;">{{ formatMoney(item.Cur_Nav) }}</span>
                        </template>
                        <template #item.invested_value="{ item }">
                            <span class="font-weight-medium fs-13 txt-162 black--text"
                                style="text-align: right; display: block;">{{ formatMoney(item.invested_value) }}</span>
                        </template>
                        <template #item.current_value="{ item }">
                            <span class="font-weight-medium fs-13 txt-162 black--text"
                                style="text-align: right; display: block;">{{ formatMoney(item.current_value) }}</span>
                        </template>
                        <template #item.overall_pnl="{ item }">
                            <span class="font-weight-medium fs-13 "
                                style="text-align: right; display: block;color: black !important;">{{
                                    formatMoney(item.overall_pnl) }}</span>
                        </template>
                        <template #item.profit_loss="{ item }">
                            <span class="font-weight-medium fs-13"
                                style="text-align: right; display: block;color: black !important;">
                                {{ formatMoney(item.profit_loss) }}
                            </span>
                        </template>
                        <template #item.changeprofitloss="{ item }">
                            <span class="font-weight-medium fs-13"
                                :class="Number(item.changeprofitloss) > 0 ? 'maingreen--text' : Number(item.changeprofitloss) < 0 ? 'mainred--text' : 'subtext--text'"
                                style="text-align: right; display: block;">
                                {{ formatPct(item.changeprofitloss) }}
                            </span>
                        </template>
                    </v-data-table>
                </v-window-item>
            </v-window>
        </div>

        <!-- Drawer -->
        <v-navigation-drawer v-model="holdingdrawer" location="right" temporary :scrim="false" width="360"
            color="cardbg">
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
            <v-list-item v-if="singledata && Object.keys(singledata).length > 0" class="pt-3">
                <v-list-item-title v-if="singledata.holdtype === 'mf'" style="font-size: 16px !important;"
                    class="font-weight-medium fs-20 maintext--text  pt-3 ">
                    {{ singledata.name || '' }}
                </v-list-item-title>

                <v-list-item-title v-else class=" maintext--text mb-0 py-3 "
                    style="font-size: 16px !important;font-weight: 500;">
                    {{ singledata.tsym || '' }}
                    <span class="ml-1" style="font-size: 12px !important;">
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
                <div class="pb-6" v-if="['NSE', 'BSE', 'MCX'].includes(singledata.exch || singledata.exchs)">
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
                                singledata.exch || singledata.exchs,
                                singledata.tsym,
                                's',
                                singledata
                            )" class="rounded-pill text-none font-weight-bold" block height="40" variant="outlined">
                                <v-icon size="20">mdi-close</v-icon> Exit
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>

                <!-- Quantity -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Quantity
                    <p class="float-right mb-0">
                        <v-chip v-if="singledata.holdtype === 'mf'" small
                            :style="`background-color: ${Number(singledata.avg_qty) > 0 ? '#E6F5EA' : Number(singledata.avg_qty) < 0 ? '#FCF3F3' : '#F5F5F5'}; color: ${Number(singledata.avg_qty) > 0 ? '#43A833' : Number(singledata.avg_qty) < 0 ? '#F23645' : '#666666'}; border-radius: 4px; padding: 4px 8px; font-weight: 500;`"
                            class="netqty-chip">
                            <span class="font-weight-medium fs-12"
                                :style="`color: ${Number(singledata.avg_qty) > 0 ? '#43A833' : Number(singledata.avg_qty) < 0 ? '#F23645' : '#666666'};`">
                                {{
                                    Number(singledata.avg_qty) > 0
                                        ? `+${singledata.avg_qty}`
                                        : Number(singledata.avg_qty) < 0 ? `${singledata.avg_qty}` : '0' }} </span>
                        </v-chip>

                        <v-chip v-else small
                            :style="`background-color: ${Number(singledata.netqty) > 0 ? '#E6F5EA' : Number(singledata.netqty) < 0 ? '#FCF3F3' : '#F5F5F5'}; color: ${Number(singledata.netqty) > 0 ? '#43A833' : Number(singledata.netqty) < 0 ? '#F23645' : '#666666'}; border-radius: 4px; padding: 4px 8px; font-weight: 500;`"
                            class="netqty-chip">
                            <span class="font-weight-medium fs-12"
                                :style="`color: ${Number(singledata.netqty) > 0 ? '#43A833' : Number(singledata.netqty) < 0 ? '#F23645' : '#666666'};`">
                                {{
                                    Number(singledata.netqty) > 0
                                        ? `+${singledata.netqty}`
                                        : Number(singledata.netqty) < 0 ? `${singledata.netqty}` : '0' }} </span>
                        </v-chip>
                    </p>
                </v-list-item-title>

                <!-- Pledged Qty (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-3" style="border-bottom: 1px solid #EBEEF0;">
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

                <!-- Avg NAV (MF) / Avg price (Stocks) -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-3" style="border-bottom: 1px solid #EBEEF0;">
                    Avg NAV
                    <p class="float-right mb-0">{{ singledata.avg_nav ? Number(singledata.avg_nav).toLocaleString() :
                        '0.00' }}
                    </p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Avg price
                    <p class="float-right mb-0">{{ singledata.upldprc || singledata.netavgprc ?
                        Number(singledata.upldprc || singledata.netavgprc).toLocaleString() : '0.00' }}</p>
                </v-list-item-title>

                <!-- NAV (MF) / Last trade price (Stocks) -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-3" style="border-bottom: 1px solid #EBEEF0;">
                    NAV
                    <p class="float-right mb-0">{{ singledata.Cur_Nav || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Last trade price
                    <p class="float-right mb-0">{{ singledata.ltp || '0.00' }}</p>
                </v-list-item-title>

                <!-- Overall P&L -->
                <v-list-item-title v-if="singledata.holdtype === 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-3" style="border-bottom: 1px solid #EBEEF0;">
                    Overall P&L
                    <p class="float-right mb-0">
                        {{ singledata.profit_loss || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.changeprofitloss) > 0 ? 'maingreen--text' : Number(singledata.changeprofitloss) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.changeprofitloss || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>
                <v-list-item-title v-else class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Overall P&L
                    <p class="float-right mb-0">
                        {{ singledata.pnl || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.pnlc) > 0 ? 'maingreen--text' : Number(singledata.pnlc) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.pnlc || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>

                <!-- Day P&L (stocks only) -->
                <v-list-item-title v-if="singledata.holdtype !== 'mf'"
                    class="maintext--text font-weight-bold fs-14 py-3" style="border-bottom: 1px solid #EBEEF0;">
                    Day P&L
                    <p class="float-right mb-0">
                        {{ singledata.d_pnl || singledata.day_pnl || '0.00' }} <span class="fs-12"
                            :class="Number(singledata.d_cpnl || singledata.day_pc) > 0 ? 'maingreen--text' : Number(singledata.d_cpnl || singledata.day_pc) < 0 ? 'mainred--text' : 'subtext--text'">
                            ({{ singledata.d_cpnl || singledata.day_pc || '0.00' }}%)</span>
                    </p>
                </v-list-item-title>

                <!-- Investment -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Investment
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.invested_value || ''
                    }}</p>
                    <p class="float-right mb-0" v-else>{{ singledata.inv || singledata.invested_val || '' }}</p>
                </v-list-item-title>

                <!-- Current value -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Current value
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.current_value || '' }}
                    </p>
                    <p class="float-right mb-0" v-else>{{ singledata.curr || singledata.current_val || '' }}</p>
                </v-list-item-title>

                <!-- Product -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Product
                    <p class="float-right mb-0">{{ singledata.prd ? (singledata.prd === 'I' ? 'INTRADAY' :
                        singledata.prd
                            === 'C' ? 'DELIVERY' : 'MARKET') : '' }}</p>
                </v-list-item-title>

                <!-- Order type -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    Order type
                    <p class="float-right mb-0">{{ singledata.s_prdt_ali || '-' }}</p>
                </v-list-item-title>

                <!-- ISIN -->
                <v-list-item-title class="maintext--text font-weight-bold fs-14 py-3"
                    style="border-bottom: 1px solid #EBEEF0;">
                    ISIN
                    <p class="float-right mb-0" v-if="singledata.holdtype === 'mf'">{{ singledata.ISIN || '-' }}</p>
                    <p class="float-right mb-0" v-else>{{ singledata.isin || '-' }}</p>
                </v-list-item-title>
            </div>

            <!-- Footer -->
            <template #append
                v-if="singledata && Object.keys(singledata).length && ['NSE', 'BSE', 'MCX'].includes(singledata.exch || singledata.exchs)">
                <v-divider></v-divider>
                <div class="pa-4">
                    <v-btn @click="handleMenuDialog(
                        'order',
                        singledata.token,
                        singledata.exch || singledata.exchs,
                        singledata.tsym,
                        singledata.netqty > 0 ? 'b' : 's'
                    )" class="rounded-pill text-none font-weight-bold elevation-0"
                        style="background-color: #ECF8F1 !important; color: #000000 !important;" block height="40">
                        <v-icon size="20" style="color: #000000 !important;">mdi-plus</v-icon> Add
                    </v-btn>
                </div>
            </template>


        </v-navigation-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getMHoldings, getMMHoldings, getQuotesdata, getHsTokenapi } from '@/components/mixins/getAPIdata'
import CryptoJS from 'crypto-js'
import { color } from 'echarts'

const router = useRouter()
const appStore = useAppStore()

const getOrderbookIconUrl = (iconName) => {
    return new URL(`/src/assets/orderbook/${iconName}.svg`, import.meta.url).href
}

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
const mfsearch = ref('')

const searchedMFHoldings = computed(() => {
    const term = mfsearch.value
    if (!term) return mfholdings.value

    const q = term.toLowerCase()
    return mfholdings.value.filter(m =>
        String(m.name).toLowerCase().includes(q) ||
        String(m.ISIN || '').toLowerCase().includes(q)
    )
})


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
    { key: 'tsym', text: 'Instrument', sortable: true },
    { key: 'netqty', text: 'Net Qty', sortable: true },
    { key: 'netavgprc', text: 'Avg Price', align: 'right', sortable: true },
    { key: 'ltp', text: 'LTP', align: 'right', sortable: true },
    { key: 'invested_val', text: 'Invested', align: 'right', sortable: true },
    { key: 'current_val', text: 'Current Value', align: 'right', sortable: true },
    { key: 'day_pnl', text: 'Day P&L', align: 'right', sortable: true },
    { key: 'day_pc', text: 'Day %', align: 'right', sortable: true },
    { key: 'rpnl', text: 'Overall P&L', align: 'right', sortable: true },
    { key: 'pnlc', text: 'Overall %', align: 'right', sortable: true }
]

const numericLike = new Set(['netqty', 'netavgprc', 'ltp', 'invested_val', 'current_val', 'day_pnl', 'day_pc', 'rpnl', 'pnlc'])

function buildHeadersFrom() {
    const headers = []
    preferredColumns.forEach(col => {
        headers.push({
            title: col.text,
            key: col.key,
            align: col.align || (numericLike.has(col.key) ? 'right' : undefined),
            sortable: col.sortable !== false
        })
    })
    return headers
}

const tableHeaders = computed(() => buildHeadersFrom())

const mfHeaders = computed(() => [
    { title: 'Instrument', key: 'name', align: 'start' },
    { title: 'Qty', key: 'avg_qty', align: 'end' },
    { title: 'Avg NAV', key: 'avg_nav', align: 'end' },
    { title: 'NAV', key: 'Cur_Nav', align: 'end' },
    { title: 'Invested', key: 'invested_value', align: 'end' },
    { title: 'Current Value', key: 'current_value', align: 'end' },
    { title: 'Overall P&L', key: 'profit_loss', align: 'end' },
    { title: 'Overall %', key: 'changeprofitloss', align: 'end' }
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
        const prev = Number(d.close || d.prev_close_price || d.previous_close || d.prevclose)

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
        const prevClose = isFinite(prev) ? prev : (isFinite(Number(d.previous_close)) ? Number(d.previous_close) : last)
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

        // Day P&L - Check if API provides it directly, otherwise calculate
        if (d.d_pnl !== undefined && d.d_pnl !== null && d.d_pnl !== '') {
            // Use API provided day P&L if available
            d.day_pnl = Number(d.d_pnl).toFixed(2)
            d.d_pnl = d.day_pnl
        } else if (d.day_pnl !== undefined && d.day_pnl !== null && d.day_pnl !== '') {
            // Use day_pnl if provided directly
            d.day_pnl = Number(d.day_pnl).toFixed(2)
            d.d_pnl = d.day_pnl
        } else {
            // Calculate Day P&L only if we have valid prevClose (different from last)
            if (isFinite(prevClose) && prevClose !== last && prevClose > 0) {
                d.day_pnl = ((last - prevClose) * netQtyAbs).toFixed(2)
                d.d_pnl = d.day_pnl
            } else {
                d.day_pnl = '0.00'
                d.d_pnl = '0.00'
            }
        }

        // Day P&L Percentage - Check if API provides it directly, otherwise calculate
        if (d.d_cpnl !== undefined && d.d_cpnl !== null && d.d_cpnl !== '' && Number(d.d_cpnl) !== 0) {
            d.day_pc = Number(d.d_cpnl).toFixed(2)
        } else if (d.day_pc !== undefined && d.day_pc !== null && d.day_pc !== '' && Number(d.day_pc) !== 0) {
            d.day_pc = Number(d.day_pc).toFixed(2)
        } else if (isFinite(prevClose) && prevClose > 0 && prevClose !== last) {
            d.day_pc = (((last - prevClose) / prevClose) * 100).toFixed(2)
        } else {
            d.day_pc = '0.00'
        }

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
                // console.error('Failed to load cached holdings', e)
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
                // console.error('Failed to load cached MF holdings', e)
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
    const detail = e.detail
    if (!detail || !holdings.value?.length) return

    // CRITICAL: Only process WebSocket events for holdings, ignore watchlist and other pages
    // Check if this event is specifically for holdings (is: 'hold')
    let isForHoldings = false
    let data = null
    let token = null

    // Handle object format with flow property - check is property first
    if (detail && typeof detail === 'object' && detail.flow === 'data') {
        // Only process if is === 'hold', ignore 'wl' (watchlist), 'pd' (pdmwdata), etc.
        if (detail.is === 'hold') {
            isForHoldings = true
            data = detail.data || detail
            token = data.token || data.tk || data.t
        } else {
            // This event is for another page (watchlist, pdmwdata, etc.), ignore it
            return
        }
    }
    // Handle array format: [data, page] - check if token matches holdings
    else if (Array.isArray(detail) && detail.length >= 2) {
        const [wsData, page] = detail
        // Only process if page is 'holding' or if token matches holdings
        if (page === 'holding' || (wsData && (wsData.token || wsData.tk || wsData.t))) {
            const testToken = wsData.token || wsData.tk || wsData.t
            // Only process if this token exists in holdings (not watchlist)
            if (testToken && holdings.value.some(h => h.token == testToken)) {
                // Double-check: make sure this token is NOT in watchlist to avoid conflicts
                // If it's in holdings, process it
                isForHoldings = true
                data = wsData
                token = testToken
            }
        }
    }
    // Handle direct data format - only if token matches holdings
    else if (detail && (detail.token || detail.tk || detail.t)) {
        const testToken = detail.token || detail.tk || detail.t
        // Only process if this token exists in holdings
        // This is a fallback for direct format, but we check token ownership
        if (testToken && holdings.value.some(h => h.token == testToken)) {
            // Make sure we're not accidentally processing watchlist tokens
            // Only process if explicitly in holdings
            isForHoldings = true
            data = detail
            token = testToken
        }
    }

    // Early return if not for holdings or missing data
    if (!isForHoldings || !token || !data) return

    const idx = holdings.value.findIndex(x => x.token == token)
    if (idx >= 0) {
        const h = holdings.value[idx]
        const ltp = Number(data.lp || data.ltp || data.l)
        const prev = Number(data.close || data.prev_close_price || data.cp || h.close || h.prev_close_price)

        if (isFinite(ltp)) h.ltp = ltp.toFixed(2)
        if (isFinite(prev)) {
            h.close = prev
            h.prev_close_price = prev
        }

        const qty = Number(h.netqty) || 0
        const avg = Number(h.netavgprc || h.upldprc) || 0
        const last = Number(h.ltp) || avg
        const prevClose = isFinite(prev) ? prev : (isFinite(Number(h.previous_close)) ? Number(h.previous_close) : last)
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

        // Day P&L - Check if WebSocket data provides it directly, otherwise calculate
        const wsDayPnl = Number(data.d_pnl || data.day_pnl || data.dpnl || '')
        if (isFinite(wsDayPnl) && wsDayPnl !== 0) {
            // Use WebSocket provided day P&L if available
            h.day_pnl = wsDayPnl.toFixed(2)
            h.d_pnl = h.day_pnl
        } else if (isFinite(prevClose) && prevClose !== last && prevClose > 0) {
            // Calculate Day P&L only if we have valid prevClose (different from last)
            h.day_pnl = ((last - prevClose) * netQtyAbs).toFixed(2)
            h.d_pnl = h.day_pnl
        } else {
            // Keep existing value if calculation would be invalid
            h.day_pnl = h.day_pnl || '0.00'
            h.d_pnl = h.d_pnl || h.day_pnl
        }

        // Day P&L Percentage - Check if WebSocket data provides it directly, otherwise calculate
        const wsDayPc = Number(data.d_cpnl || data.day_pc || data.dpc || '')
        if (isFinite(wsDayPc) && wsDayPc !== 0) {
            h.day_pc = wsDayPc.toFixed(2)
        } else if (isFinite(prevClose) && prevClose > 0 && prevClose !== last) {
            h.day_pc = (((last - prevClose) / prevClose) * 100).toFixed(2)
        } else {
            h.day_pc = h.day_pc || '0.00'
        }

        h.d_cpnl = Number(h.inv) > 0 ? ((Number(h.d_pnl) / Number(h.inv)) * 100).toFixed(2) : '0.00'

        // Keep rpnl for backward compatibility
        if (qty) h.rpnl = ((last - avg) * qty).toFixed(2)
        else h.rpnl = h.pnl

        // Force Vue 3 reactivity update by reassigning the array
        // This ensures the template and computed properties (stats) update immediately
        holdings.value = [...holdings.value]
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
    // console.log("handleMenuDialog", type, token, exch, tsym, trans, item);
    holdingdrawer.value = false
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type, token, exch, tsym, trantype: trans, item }
    }))
}

function handleMFOrder(type, action, item) {
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type, action, item }
    }))
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    // console.log("setSSDtab", type, token, exch, tsym, trans, item);

    holdingdrawer.value = false

    if (type === 'alert') {
        handleMenuDialog('alert', token, exch, tsym)
    } else if (type === 'cGTT') {
        handleMenuDialog('order-GTT', token, exch, tsym, 'b')
    } else if (type === 'exit-order') {
        // For holdings: holdings are always long positions (netqty > 0), so to exit we always sell ('s')
        // Check for BO/CO orders (matching Positions page logic)
        if (item && (item.s_prdt_ali === 'BO' || item.s_prdt_ali === 'CO')) {
            appStore.showSnackbar(2, 'Cover/Bracket orders can\'t exist here; exit on the order book.')
            return
        }

        // For holdings exit: always sell to exit (holdings are long positions)
        // Always use 's' (sell) for holdings exit, regardless of netqty
        const exitTrans = 's'

        // CRITICAL: Set item.trantype to 'S' so StockOrderWindow uses it correctly
        // StockOrderWindow checks item.trantype for exit-order, so we must set it
        const exitItem = item ? { ...item, trantype: 'S' } : null

        // Emit menudialog event to open order window (matching Positions page behavior)
        handleMenuDialog('exit-order', token, exch, tsym, exitTrans, exitItem)
    } else if (type === 'order') {
        handleMenuDialog('order', token, exch, tsym, item?.netqty < 0 ? 's' : 'b', item)
    } else if (type === 'chart' || type === 'depth' || type === 'Funda') {
        // Navigate to stock details page with proper validation (matching Positions page)
        try {
            // Validate and convert token to string (it might be a number)
            const validToken = token ? String(token).trim() : null
            // Handle both 'exch' and 'exchs' field names (holdings might use either)
            const validExch = (exch || (item && (item.exch || item.exchs))) ? String(exch || item.exch || item.exchs).trim() : null
            const validTsym = tsym ? String(tsym).trim() : null

            // Validate all required fields are present and non-empty
            if (!validToken || !validExch || !validTsym) {
                appStore.showSnackbar(2, 'Invalid stock data. Cannot open stock details.')
                // console.error('Invalid stock data for navigation:', { token: validToken, exch: validExch, tsym: validTsym, item })
                return
            }

            // Create path array with validated values
            const path = [type, validToken, validExch, validTsym]

            // Store params in localStorage for persistence (required by StocksDetails)
            localStorage.setItem('ssdParams', JSON.stringify(path))
            localStorage.setItem('ssdtsym', `${validExch}:${validTsym}`)
            localStorage.setItem('ssdtoken', validToken)

            // Check if already on stocks details page
            const currentRoute = router.currentRoute.value
            if (currentRoute.name === 'stocks details') {
                // If already on page, dispatch ssd-event to update chart/depth/fundamentals
                window.dispatchEvent(new CustomEvent('ssd-event', {
                    detail: { type, token: validToken, exch: validExch, tsym: validTsym }
                }))
                // Also dispatch array format for compatibility
                window.dispatchEvent(new CustomEvent('ssd-event', {
                    detail: path
                }))
            } else {
                // Navigate to stocks details page with params and query
                router.push({
                    name: 'stocks details',
                    params: { val: path },
                    query: { type, token: validToken, exch: validExch, tsym: validTsym }
                }).catch((error) => {
                    // console.error('Navigation error:', error)
                    appStore.showSnackbar(2, 'Failed to open stock details page')
                })
            }
        } catch (error) {
            // console.error('Error in setSSDtab for chart/depth/Funda:', error)
            appStore.showSnackbar(2, 'Failed to open stock details page')
        }
    } else {
        // Fallback for other types - ensure all parameters are valid before routing
        try {
            const validToken = token ? String(token).trim() : null
            const validExch = (exch || (item && (item.exch || item.exchs))) ? String(exch || item.exch || item.exchs).trim() : null
            const validTsym = tsym ? String(tsym).trim() : null

            if (!validToken || !validExch || !validTsym) {
                appStore.showSnackbar(2, 'Invalid stock data. Cannot open stock details.')
                // console.error('Missing parameters for routing:', { type, token: validToken, exch: validExch, tsym: validTsym })
                return
            }

            const path = [type, validToken, validExch, validTsym]
            localStorage.setItem('ssdParams', JSON.stringify(path))
            localStorage.setItem('ssdtsym', `${validExch}:${validTsym}`)
            localStorage.setItem('ssdtoken', validToken)

            router.push({
                name: 'stocks details',
                params: { val: path },
                query: { type, token: validToken, exch: validExch, tsym: validTsym }
            }).catch((error) => {
                // console.error('Navigation error:', error)
                appStore.showSnackbar(2, 'Failed to open stock details page')
            })
        } catch (error) {
            // console.error('Error in setSSDtab fallback:', error)
            appStore.showSnackbar(2, 'Failed to open stock details page')
        }
    }
}

async function setHoldingrowdata(item) {
    holdingdrawer.value = !holdingdrawer.value
    if (!item) return
    const src = item && item.raw ? item.raw : item
    if (!src || !Object.keys(src).length) return
    singledata.value = { ...src }
    if (src.exch && src.token && !src.holdtype) {
        try {
            const quotes = await getQuotesdata(`${src.exch}|${src.token}`)
            singledata.value.quotes = quotes
        } catch (e) {
            // console.error('Failed to fetch quotes', e)
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
        // console.error('E-DIS error', e)
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
            // console.error('Failed to load cached holdings', e)
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


<style>
.maingreen--text {
    color: #43A833 !important;
}

.mainred--text {
    color: #F23645 !important;
}

/* Make table rows clickable */
:deep(.table-row) {
    cursor: pointer;
}

:deep(.table-row:hover) {
    background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Prevent text wrapping in table headers and cells */
:deep(.holdings-table th) {
    white-space: nowrap !important;
    min-width: fit-content !important;
}

:deep(.holdings-table td) {
    white-space: nowrap !important;
    min-width: fit-content !important;
}

:deep(.holdings-table .v-data-table__th) {
    white-space: nowrap !important;
    min-width: fit-content !important;
}

:deep(.holdings-table .v-data-table__td) {
    white-space: nowrap !important;
    min-width: fit-content !important;
}

/* Enable horizontal scrolling */
:deep(.holdings-table) {
    overflow-x: auto !important;
    display: block !important;
}

:deep(.holdings-table .v-table__wrapper) {
    overflow-x: auto !important;
}

:deep(.holdings-table table) {
    width: max-content !important;
    min-width: 100% !important;
}

.fs-12 {
    font-size: 12px !important;
}

.fs-16 {
    font-size: 16px !important;
}
</style>

<style scoped>
:deep(.v-text-field input) {
    font-size: 14px !important;
}
</style>