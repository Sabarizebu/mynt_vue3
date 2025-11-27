<template>
    <div>
        <div class="my-6">
            <!-- Stats Cards -->
            <v-row>
                <v-col cols="12">
                    <v-card class="stat-card rounded-lg pa-4" elevation="0">
                        <div class="d-flex justify-space-between align-center flex-wrap" style="gap: 16px;">
                            <!-- MTM -->
                            <div v-if="ordertab !== 'all'" class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">MTM</div>
                                <div class="stat-value fs-16 font-weight-medium"
                                    :class="Number(statposition.mtm) > 0 ? 'txt-gre' : Number(statposition.mtm) < 0 ? 'txt-red' : 'subtext--text'">
                                    <span id="poststatmtm">{{ statposition.mtm || '0.00' }}</span>
                                </div>
                            </div>

                            <!-- Profit/Loss -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Profit/Loss</div>
                                <div class="stat-value fs-16 font-weight-medium"
                                    :class="Number(statposition.pnl) > 0 ? 'txt-gre' : Number(statposition.pnl) < 0 ? 'txt-red' : 'subtext--text'">
                                    <span id="poststatpnl">{{ statposition.pnl || '0.00' }}</span>
                                </div>
                            </div>

                            <!-- Trade Value -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Trade Value</div>
                                <div class="stat-value maintext--text fs-16 font-weight-medium">
                                    <span id="poststatval">{{ statposition.tradeval || '0.00' }}</span>
                                </div>
                            </div>

                            <!-- Open Position -->
                            <div class="stat-item flex-grow-1" style="min-width: 120px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Open Position</div>
                                <div class="stat-value fs-16 font-weight-medium"
                                    :class="Number(statposition.oppnl) > 0 ? 'txt-gre' : Number(statposition.oppnl) < 0 ? 'txt-red' : 'subtext--text'">
                                    <span id="poststatopnl">{{ statposition.oppnl || '0.00' }}</span>
                                </div>
                            </div>

                            <!-- Trade Positions -->
                            <div class="stat-item " style="min-width: 140px;">
                                <div class="stat-label txt-5E6 fs-14 mb-1">Trade Positions</div>
                                <div class="d-flex align-center" style="gap: 8px;">
                                    <v-chip size="large" class="rounded-lg txt-gre">
                                        <span class="fs-14 font-weight-medium" id="poststatP">{{
                                            statposition.positive?.length || 0 }} Positive</span>
                                    </v-chip>
                                    <v-chip size="large" class="rounded-lg txt-red">
                                        <span class="fs-14 font-weight-medium" id="poststatN">{{
                                            statposition.negative?.length || 0 }} Negative</span>
                                    </v-chip>
                                    <v-chip size="large" class="rounded-lg" color="card-bg" text-color="subtext">
                                        <span class="fs-14 font-weight-medium" id="poststatC">{{
                                            statposition.close?.length || 0 }} Closed</span>
                                    </v-chip>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Toolbar -->
            <v-toolbar flat density="compact" class="tool-sty my-2 py-3 crd-trn">
                <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="compact" @change="onTabChange">
                    <v-tab value="positions" class="font-weight-bold subtitle-1 mb-0 text-none">Positions ({{
                        positiondata.length || 0 }})</v-tab>
                    <v-tab value="all" class="font-weight-bold subtitle-1 mb-0 text-none">All Positions ({{
                        expositiondata.length || 0 }})</v-tab>
                </v-tabs>
                <v-spacer></v-spacer>

                <v-text-field elevation="0" rounded v-if="ordertab !== 'group'" v-model="opensearch"
                    prepend-inner-icon="mdi-magnify" placeholder="Search" variant="flat" density="compact" hide-details
                    class="rounded mr-4" style="max-width: 220px" flat bg-color="secbg" />

                <v-select v-if="ordertab !== 'group'" style="max-width: 160px" v-model="exchtype" rounded hide-details
                    item-title="txt" item-value="val" prepend-inner-icon="mdi-format-list-bulleted"   menu-icon="mdi-chevron-down"
                    class="rounded-pill ml-4" variant="solo" density="compact" flat bg-color="secbg" elevation="0"
                    :items="dashitems" />

                <v-btn v-if="ordertab === 'positions'" :disabled="!hasOpenPositions" @click="exitdialog = true"
                    class="elevation-0 rounded-pill font-weight-bold text-none ml-4" variant="elevated"
                    :color="!hasOpenPositions ? 'gray' : 'secondary'">Exit {{
                        posdselected.length === positiondata.length ? 'all' :
                            posdselected.length > 0 ? posdselected.length : 'all'
                    }}</v-btn>
                <v-icon :disabled="loading || exloading"
                    :class="['ml-3 cursor-p', { 'reload-rotating': loading || exloading }]" @click="refresh"
                    color="maintext" size="24">mdi-reload</v-icon>
            </v-toolbar>

            <!-- Positions Table -->
            <v-window v-model="ordertab" style="z-index:0">
                <v-window-item value="positions">
                    <v-data-table :show-select="hasOpenPositions" v-model="posdselected" :item-value="'tokn'"
                        :loading="loading" density="compact" mobile-breakpoint="900" fixed-header height="480px"
                        class="holdings-table mt-3 rounded-lg overflow-y-auto"
                        style="border-radius: 8px; border: 1px solid #EBEEF0; min-width:660px;"
                        :headers="positionHeaders" :hide-default-footer="true" :search="opensearch"
                        :items="sortedPositions" :items-per-page="-1"
                        :item-class="(item) => item.way != 'open' ? 'table-row closed-position' : 'table-row'"
                        :row-props="(data) => {
                            const item = data.item
                            return {
                                style: item.way != 'open' ? {
                                    backgroundColor: '#F1F3F8 !important'
                                } : {}
                            }
                        }" :selectable="(item) => item.way == 'open'"
                        @click:row="(event, { item }) => setPositionrowdata(item?.raw || item)">
                        <template v-slot:no-data>
                            <div class="text-center mx-auto py-16 mt-16">
                                <img class="mx-auto" width="80px" :src="noDataImg" alt="no data" />
                                <h4 class="txt-999 font-weight-regular caption mt-4">There is no trading data here yet!
                                </h4>
                            </div>
                        </template>
                        <template v-slot:loading>
                            <div class="text-center py-16">
                                <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
                                <p class="mt-4 subtext--text">Loading positions...</p>
                            </div>
                        </template>
                        <template #item.data-table-select="{ item }">
                            <v-checkbox v-if="!isExitedPosition(item)" :model-value="posdselected.some(sel => {
                                const selTokn = typeof sel === 'object' ? sel?.tokn : sel
                                return selTokn === item.tokn
                            })" @update:model-value="(value) => {
                                if (value) {
                                    if (!posdselected.some(sel => {
                                        const selTokn = typeof sel === 'object' ? sel?.tokn : sel
                                        return selTokn === item.tokn
                                    })) {
                                        posdselected.push(item)
                                    }
                                } else {
                                    const index = posdselected.findIndex(sel => {
                                        const selTokn = typeof sel === 'object' ? sel?.tokn : sel
                                        return selTokn === item.tokn
                                    })
                                    if (index > -1) posdselected.splice(index, 1)
                                }
                            }" hide-details density="compact" color="primary"></v-checkbox>
                        </template>
                        <template #item.s_prdt_ali="{ item }">
                            <v-chip v-if="item && item.s_prdt_ali" small
                                :color="item.way != 'open' ? 'mainbg' : 'secbg'" :style="{
                                    backgroundColor: item.way === 'open' ? '#F1F3F8' : '#FFFFFF'
                                }" text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important;">
                                <span class="font-weight-medium subtext--text fs-12">{{ item.s_prdt_ali }}</span>
                            </v-chip>
                        </template>
                        <template #item.tsym="{ item }">
                            <div class="pos-rlt" style="padding-right: 40px;">
                                <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">
                                    {{ item.tsym ? item.tsym : "" }}
                                    <span class="ml-1 subtext--text fs-10">{{ item.exch ? item.exch : "" }}</span>
                                </p>
                                <div @click.stop class="pos-abs table-hov" style="top: -3px; right: 0">
                                    <v-btn
                                        @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 'b')"
                                        min-width="20px" height="20px"
                                        style="background-color: #43A833; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                                        class="font-weight-bold elevation-0 " size="x-small"> B
                                    </v-btn>
                                    <v-btn
                                        @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 's')"
                                        min-width="20px" height="20px"
                                        style="background-color: #F23645; color: #ffffff; border-radius: 4px; min-width: 20px; padding: 0 4px;"
                                        class="font-weight-bold elevation-0" size="x-small"> S
                                    </v-btn>
                                    <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym)"
                                        style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                        min-width="20px" color="mainbg" class="font-weight-bold elevation-0"
                                        size="x-small">
                                        <v-icon size="14" color="#666666">mdi-chart-line-variant</v-icon>
                                    </v-btn>
                                    <v-tooltip location="bottom">
                                        <template #activator="{ props }">
                                            <div v-bind="props">
                                                <v-btn v-if="item.way == 'open'"
                                                    @click.stop="setSSDtab('exit-order', item.token, item.exch, item.tsym, item.netqty < 0 ? 'b' : 's', item)"
                                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                                    min-width="20px" color="mainbg"
                                                    class="font-weight-bold elevation-0 " size="x-small">
                                                    <v-icon size="14" color="#666666">mdi-close</v-icon>
                                                </v-btn>
                                            </div>
                                        </template>
                                        <span>Exit</span>
                                    </v-tooltip>
                                    <v-tooltip location="bottom">
                                        <template #activator="{ props }">
                                            <div v-bind="props">
                                                <v-btn v-if="item.way == 'open'" @click.stop="setPosConvert(item)"
                                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                                    min-width="20px" color="mainbg"
                                                    class="font-weight-bold elevation-0 " size="x-small">
                                                    <v-icon size="14" color="#666666">mdi-autorenew</v-icon>
                                                </v-btn>
                                            </div>
                                        </template>
                                        <span>Conversion</span>
                                    </v-tooltip>
                                    <v-menu close-on-click location="bottom" offset-y class="table-menu">
                                        <template #activator="{ props }">
                                            <v-btn v-bind="props"
                                                style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                                min-width="20px" color="mainbg" class="font-weight-bold elevation-0 "
                                                size="x-small">
                                                <v-icon size="14" color="#666666">mdi-dots-horizontal</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="table-menu-list">
                                            <v-list density="compact" class="pa-0">
                                                <template v-for="(m, k) in item.way == 'open' ? menulist.o : menulist.c"
                                                    :key="k">
                                                    <v-list-item
                                                        @click="m.type == 'convert' ? setPosConvert(item) : m.type != '' ? setSSDtab(m.type, item.token, item.exch, item.tsym, (m.name == 'Exit' ? item.netqty < 0 ? 'b' : 's' : item.netqty < 0 ? 's' : 'b'), item) : setPositionrowdata(item)"
                                                        class="px-3 py-2">
                                                        <template #prepend>
                                                            <div class="d-flex align-center" style="min-width: 24px;">
                                                                <img v-if="typeof m.icon === 'number' && m.icon > 2"
                                                                    width="20px" height="20px"
                                                                    :src="`/src/assets/orderbook/${m.icon}.svg`" />
                                                                <v-icon v-else color="#506D84" size="20">{{ m.icon
                                                                }}</v-icon>
                                                            </div>
                                                        </template>
                                                        <v-list-item-title
                                                            class="subline--text font-weight-medium fs-14 ml-2">{{
                                                                m.name }}</v-list-item-title>
                                                    </v-list-item>
                                                    <v-divider v-if="m.hr" class="mx-0"></v-divider>
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
                                :color="item.netqty > 0 ? 'secgreen' : item.netqty < 0 ? 'secred' : item.way != 'open' ? 'mainbg' : 'secbg'"
                                :class="item.netqty > 0 ? 'maingreen--text' : item.netqty < 0 ? 'mainred--text' : 'subtext--text'"
                                :style="`border: 1px solid ${item.netqty > 0 ? '#C1E7BA' : item.netqty < 0 ? '#FFCDCD' : '#DDD'}; border-radius: 5px; padding: 10px 8px !important;`"
                                class="netqty-chip">
                                <span class="font-weight-medium fs-12"
                                    :class="item.netqty > 0 ? 'maingreen--text' : item.netqty < 0 ? 'mainred--text' : 'subtext--text'">{{
                                        item && item.netqty >
                                            0 ?
                                            `+${item.netqty / (item.exch == "MCX" ? item.ls : 1)}` : item
                                                && item.netqty < 0 ? `${item.netqty / (item.exch == "MCX" ? item.ls : 1)}` : '0'
                                    }}</span>
                            </v-chip>
                        </template>
                        <template #item.netupldprc="{ item }">
                            <span class="font-weight-medium maintext--text"
                                style="text-align: right; display: block;">{{ item.netupldprc ? item.netupldprc : ""
                                }}</span>
                        </template>
                        <template #item.ltp="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                <span :id="`post${item.tokn}ltp`"> {{ item.ltp ? item.ltp : "0.00" }}</span>
                            </span>
                        </template>
                        <template #item.rpnl="{ item }">
                            <span class="font-weight-medium mb-0" :id="`post${item.tokn}pnlclr`"
                                :class="item.rpnl > 0 ? 'maingreen--text' : item.rpnl < 0 ? 'mainred--text' : 'subtext--text'"
                                style="text-align: right; display: block;">
                                <span :id="`post${item.tokn}rpnl`">{{ item.rpnl ? item.rpnl : "0.00" }}</span>
                            </span>
                        </template>
                        <template #item.avgprc="{ item }">
                            <span class="font-weight-medium maintext--text"
                                style="text-align: right; display: block;">{{ item.avgprc ?
                                    Math.abs(item.avgprc).toFixed(2)
                                    : "" }}</span>
                        </template>
                        <template #item.mtm="{ item }">
                            <span class="font-weight-medium mb-0" :id="`post${item.tokn}mtmclr`"
                                :class="item.mtm > 0 ? 'maingreen--text' : item.mtm < 0 ? 'mainred--text' : 'subtext--text'"
                                style="text-align: right; display: block;">
                                <span :id="`post${item.tokn}mtm`"> {{ item.mtm ? item.mtm : "0.00" }}</span>
                            </span>
                        </template>
                        <template #item.daybuyqty="{ item }">
                            <div class="qty-pill" :class="{ openbg: item.way === 'open' }">
                                {{
                                    item.daybuyqty != 0 && item.daysellqty != 0
                                        ? item.daybuyqty / (item.exch == 'MCX' ? item.ls : 1)
                                        : item.netqty > 0
                                            ? item.netqty / (item.exch == 'MCX' ? item.ls : 1)
                                            : '0'
                                }}
                            </div>
                        </template>

                        <template #item.daysellqty="{ item }">
                            <div class="qty-pill" :class="{ openbg: item.way === 'open' }">
                                {{
                                    item.daysellqty != 0 && item.daybuyqty != 0
                                        ? item.daysellqty / (item.exch == 'MCX' ? item.ls : 1)
                                        : item.netqty < 0 ? item.netqty / (item.exch == 'MCX' ? item.ls : 1) : '0' }} </div>
                        </template>
                        <template #item.totbuyavgprc="{ item }">
                            <span class="font-weight-medium maintext--text"
                                style="text-align: right; display: block;">{{ item.totbuyavgprc ? item.totbuyavgprc : ""
                                }}
                            </span>
                        </template>
                        <template #item.totsellavgprc="{ item }">
                            <span class="font-weight-medium maintext--text"
                                style="text-align: right; display: block;">{{ item.totsellavgprc ? item.totsellavgprc :
                                    "" }}
                            </span>
                        </template>
                    </v-data-table>
                </v-window-item>

                <!-- All Positions Table -->
                <v-window-item value="all">
                    <v-data-table must-sort :item-value="'tokn'" :sort-by="['way']" :sort-desc="[true]"
                        :loading="exloading" :hide-default-footer="true" density="compact" mobile-breakpoint="900"
                        fixed-header height="480px" class="holdings-table mt-3 rounded-lg overflow-y-auto"
                        style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important; min-width:660px;"
                        :headers="expositionHeaders" :search="opensearch" :items="expositiondata" :items-per-page="-1"
                        :item-class="() => 'table-row'" :row-props="(data) => ({
                            class: 'table-row',
                            style: data.item.way != 'open' ? { backgroundColor: '#F1F3F8 !important' } : {}
                        })">
                        <template v-slot:no-data>
                            <div class="text-center mx-auto py-16 mt-16">
                                <img class="mx-auto" width="80px" :src="noDataImg" alt="no data" />
                                <h4 class="txt-999 font-weight-regular caption mt-4">There is no trading data here yet!
                                </h4>
                            </div>
                        </template>
                        <template v-slot:loading>
                            <div class="text-center py-16">
                                <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
                                <p class="mt-4 subtext--text">Loading all positions...</p>
                            </div>
                        </template>
                        <template #item.tsym="{ item }">
                            <div class="pos-rlt">
                                <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p">
                                    {{ item.tsym ? item.tsym : "" }}
                                    <span class="ml-1 subtext--text fs-10">{{ item.exch ? item.exch : "" }}</span>
                                </p>
                            </div>
                        </template>
                        <template #item.netqty="{ item }">
                            <div class="qty-pill" :class="{
                                openbg: item.way === 'open',
                                pos: item.netqty > 0,
                                neg: item.netqty < 0
                            }">
                                {{ item.netqty > 0 ? `+${item.netqty}` : item.netqty < 0 ? item.netqty : '0' }} </div>
                        </template>


                        <template #item.ltp="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.ltp ? Number(item.ltp).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.rpnl="{ item }">
                            <span class="font-weight-medium"
                                :class="item.rpnl > 0 ? 'maingreen--text' : item.rpnl < 0 ? 'mainred--text' : 'subtext--text'"
                                style="text-align: right; display: block;">
                                {{ item.rpnl ? Number(item.rpnl).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.avgprc="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.avgprc ? Number(item.avgprc).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.BuyQuantity="{ item }">
                            <div class="qty-pill" :class="{ openbg: item.way === 'open' }">
                                {{ item.BuyQuantity || '0' }}
                            </div>
                        </template>


                        <template #item.SellQuantity="{ item }">
                            <div class="qty-pill" :class="{ openbg: item.way === 'open' }">
                                {{ item.SellQuantity || '0' }}
                            </div>
                        </template>


                        <template #item.BuyPrice="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.BuyPrice ? Number(item.BuyPrice).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.BuyValue="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.BuyValue ? Number(item.BuyValue).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.SellPrice="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.SellPrice ? Number(item.SellPrice).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                        <template #item.SellValue="{ item }">
                            <span class="font-weight-medium maintext--text" style="text-align: right; display: block;">
                                {{ item.SellValue ? Number(item.SellValue).toFixed(2) : "0.00" }}
                            </span>
                        </template>
                    </v-data-table>
                </v-window-item>
            </v-window>
        </div>
        <v-dialog v-model="exitdialog" max-width="430">
            <v-card style="border-radius: 18px !important;">
                <!-- <div class="d-flex justify-space-between align-center pa-4" style="border-bottom: 1px solid #EBEEF0;">
                    <div class="font-weight-bold fs-16 maintext--text">Confirmation</div>
                    <v-btn icon variant="text" density="comfortable" @click="exitdialog = false"
                        style="min-width: 32px; width: 32px; height: 32px; background-color: #F23645; border-radius: 50%;">
                        <v-icon color="#FFFFFF" size="18">mdi-close</v-icon>
                    </v-btn>
                </div> -->
                <div class="pa-6 text-center">
                    <img src="@/assets/orderbook/cancel-icon.svg" alt="cancel icon" />
                    <p class="font-weight-medium mb-6 maintext--text mt-2" style="font-size: 22px !important;">
                        Do you want to <strong>Square Off</strong> <br /> {{
                            posdselected.length === positiondata.length ? 'all' :
                                posdselected.length > 0 ? posdselected.length : 'all'
                        }} open Positions?
                    </p>
                    <div class="d-flex justify-space-between px-5" style="gap: 12px;">
                        <v-btn :disabled="orderloader" @click="exitdialog = false"
                            class="rounded-pill text-none w-50 font-weight-bold elevation-0"
                            style="background-color: #F1F3F8; color: #000000;" height="40px">
                            Close
                        </v-btn>
                        <v-btn :loading="orderloader" @click="setColseposition(0)"
                            class="rounded-pill text-none font-weight-bold elevation-0 w-50"
                            style="background-color: #000000; color: #FFFFFF;" height="40px">
                            Exit Order
                        </v-btn>
                    </div>
                </div>
            </v-card>
        </v-dialog>

        <v-dialog v-model="convertdialog" max-width="480px">
            <v-card class="pb-6 overflow-hidden" color="cardbg" style="border-radius: 18px !important;">
                <v-card class="elevation-0 px-6 pt-4 pb-3" color="#F1F3F8">
                    <div class="d-flex justify-space-between align-start mb-3">
                        <div>
                            <p class="font-weight-bold fs-16 maintext--text mb-1">
                                {{ singledata?.tsym || '' }}<span class="ml-1 subtext--text fs-10">{{ singledata?.exch
                                    || ''
                                }}</span>
                            </p>
                            <div class="d-flex align-center">
                                <span class="font-weight-bold fs-14 maintext--text mr-2">{{ singledata?.ltp || '0.00'
                                }}</span>
                                <span
                                    :class="singledata?.pnlc && Number(singledata.pnlc) >= 0 ? 'maingreen--text' : 'mainred--text'"
                                    class="fs-12 font-weight-medium">
                                    {{ singledata?.ltp && singledata?.avgprc ?
                                        ((Number(singledata.ltp) - Number(singledata.avgprc)) >= 0 ? '+' : '') +
                                        (Number(singledata.ltp) - Number(singledata.avgprc)).toFixed(2) : '0.00' }}
                                    ({{ singledata?.pnlc ?
                                        (Number(singledata.pnlc) >= 0 ? '+' : '') + Number(singledata.pnlc).toFixed(2) :
                                        '0.00' }}%)
                                </span>
                            </div>
                        </div>
                        <v-btn :disabled="convertloader" @click="convertdialog = false; singledata = {}" icon
                            variant="text" size="small" class="mt-0">
                            <v-icon color="maintext" size="20">mdi-close</v-icon>
                        </v-btn>
                    </div>
                    <v-progress-linear v-if="convertloader" indeterminate color="primary"></v-progress-linear>
                </v-card>
                <div class="px-6 pt-2 pb-4">
                    <p class="font-weight-bold fs-16 mb-4">Position Conversion</p>
                    <v-row no-gutters>
                        <v-col cols="5" class="pb-3">
                            <p class="font-weight-bold fs-14 mb-2">Convert from</p>
                            <v-text-field readonly density="compact" v-model="singledata.s_prdt_ali"
                                style="background-color: #F1F3F8 !important;" variant="flat" hide-details
                                class="rounded-pill"></v-text-field>
                        </v-col>
                        <v-col cols="2" class="pa-0"></v-col>
                        <v-col cols="5" class="pb-3">
                            <p class="font-weight-bold fs-14 mb-2">Converting to</p>
                            <v-select density="compact" v-model="convtype"
                                :items="singledata.s_prdt_ali !== 'MIS' && singledata.s_prdt_ali !== 'NRML' ? ['MIS'] : (singledata.exch === 'NSE' || singledata.exch === 'BSE') ? ['CNC'] : ['NRML']"
                                style="background-color: #F1F3F8 !important;" variant="flat" hide-details
                                class="rounded-pill"></v-select>
                        </v-col>
                        <v-col cols="5" class="pb-3">
                            <p class="font-weight-bold fs-14 mb-2">Total Qty</p>
                            <v-text-field readonly density="compact" :value="singledata.defaultqty"
                                style="background-color: #F1F3F8 !important;" variant="flat" hide-details
                                class="rounded-pill"></v-text-field>
                        </v-col>
                        <v-col cols="2" class="pa-0"></v-col>
                        <v-col cols="5" class="pb-3">
                            <p class="font-weight-bold fs-14 mb-2">Converting Qty</p>
                            <v-text-field density="compact" v-model.number="convqty" :placeholder="singledata.netqty"
                                style="background-color: #F1F3F8 !important;" variant="flat" type="number" min="1"
                                :max="singledata.defaultqty" hide-details class="rounded-pill"></v-text-field>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-4">
                        <v-btn @click="setPosConvert()"
                            :disabled="!(convqty > 0 && convqty <= singledata.defaultqty && convtype)"
                            :loading="convertloader" color="btnclr"
                            class="text-none rounded-pill elevation-0 btntext--text px-10" height="40px">Convert</v-btn>
                    </div>
                </div>
            </v-card>
        </v-dialog>
        <v-navigation-drawer v-model="positiondrawer" temporary location="right" :scrim="false" width="360"
            color="cardbg" class="pt-2">
            <!-- Header -->
            <template v-slot:prepend>
                <v-toolbar dense class="nav-drawer crd-trn">
                    <v-btn icon variant="text" density="comfortable" @click="closeDrawer" aria-label="Close drawer">
                        <v-icon color="maintext" size="20">mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Position Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>
            <v-list-item class="py-3">
                <v-list-item-content>
                    <v-list-item-title class="font-weight-medium maintext--text mb-3">
                        {{ singledata.tsym || '' }}<span class="ml-1 subtext--text fs-10">{{ singledata.exch || ''
                        }}</span>
                    </v-list-item-title>
                    <v-list-item-title class="maintext--text font-weight-medium fs-16 mb-1">
                        {{ singledata.ltp || '0.00' }}
                        <span
                            :class="Number(singledata.rpnl) > 0 ? 'maingreen--text' : Number(singledata.rpnl) < 0 ? 'mainred--text' : 'subtext--text'"
                            class="font-weight-medium fs-12">
                            {{ singledata.rpnl || '0.00' }} ({{ singledata.pnlc || '0.00' }}%)
                        </span>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <div class="px-4">
                <div v-if="singledata.way === 'open'" class="pb-6">
                    <v-row>
                        <v-col cols="6">
                            <v-btn :disabled="orderloader" variant="outlined"
                                @click="setSSDtab('exit-order', singledata.token, singledata.exch, singledata.tsym, singledata.netqty < 0 ? 'b' : 's', singledata)"
                                class="rounded-pill text-none font-weight-bold" block height="40px" outlined>
                                <v-icon size="20">mdi-close</v-icon> Exit
                            </v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn :disabled="convertloader" variant="outlined" @click="setPosConvert(singledata)"
                                class="rounded-pill text-none font-weight-bold" block height="40px" outlined>
                                <v-icon size="20">mdi-autorenew</v-icon> Conversion
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; border-top: 1px solid #EBEEF0;padding: 12px 0;">Quantity <p
                        class="float-right mb-0">
                        <v-chip v-if="singledata && singledata.plgqty > 0" small class="table-hov-prd maingreen--text"
                            style="border-radius: 4px; padding: 4px 8px !important;background-color: #43A833; margin-right: 4px;">
                            <v-icon color="#ffffff" size="12">mdi-lock</v-icon>
                            <span class="font-weight-medium fs-12" style="color: #ffffff;">{{ singledata.plgqty
                            }}</span>
                        </v-chip>
                        <v-chip v-if="singledata && singledata.btstqty > 0" small color="#FFD8B4" text-color="#E8862A"
                            :style="`border-radius: 4px; padding: 4px 8px !important; margin-left: 4px;`">
                            <span class="font-weight-medium fs-12">{{ `T1 ${singledata.btstqty}` }}</span>
                        </v-chip>
                        <v-chip size="small"
                            :style="`background-color: ${singledata && singledata.netqty > 0 ? '#E6F5EA' : singledata && singledata.netqty < 0 ? '#FFEBEE' : '#F5F5F5'}; color: ${singledata && singledata.netqty > 0 ? '#43A833' : singledata && singledata.netqty < 0 ? '#F23645' : '#666666'}; border-radius: 4px; padding: 4px 8px; font-weight: 500;`"
                            class="netqty-chip">
                            <span class="font-weight-medium fs-12"
                                :style="`color: ${singledata && singledata.netqty > 0 ? '#43A833' : singledata && singledata.netqty < 0 ? '#F23645' : '#666666'};`">{{
                                    singledata && singledata.netqty >
                                        0 ?
                                        `+${singledata.netqty / (singledata.exch === 'MCX' ? singledata.ls : 1)}` : singledata
                                            && singledata.netqty < 0 ? `${singledata.netqty / (singledata.exch === 'MCX' ?
                                                singledata.ls : 1)}` : '0' }}</span>
                        </v-chip>
                    </p></v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Avg price <p class="float-right mb-0">{{
                        singledata.avgprc ? singledata.avgprc.toLocaleString() : '0.00' }}</p></v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Net Avg price <p
                        class="float-right mb-0">
                        {{ (singledata.NetAvgPrc ?? singledata.netavgprc) ? (singledata.NetAvgPrc ??
                            singledata.netavgprc).toLocaleString() : '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Upload price <p class="float-right mb-0">
                        {{ singledata.upldprc ? singledata.upldprc.toLocaleString() : '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Netupload price <p
                        class="float-right mb-0">{{
                            singledata.netupldprc ? singledata.netupldprc.toLocaleString() :
                                '0.00' }}
                    </p></v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Last trade price <p
                        class="float-right mb-0">{{
                            singledata.ltp || '0.00' }}</p></v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Product <p class="float-right mb-0">
                        {{ singledata.prd ? (singledata.prd === 'I' ? 'INTRADAY'
                            : singledata.prd === 'C' ?
                                'DELIVERY'
                                : 'CARRY FORWARD') : ''
                        }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Order type <p class="float-right mb-0">{{
                        singledata.s_prdt_ali || '-' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day buy Qty <p class="float-right mb-0">
                        {{
                            singledata.daybuyqty ? (singledata.daybuyqty / (singledata.exch === 'MCX' ? singledata.ls :
                                1)) : '0' }}
                    </p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day sell Qty <p class="float-right mb-0">
                        {{ singledata.daysellqty ? (singledata.daysellqty / (singledata.exch === 'MCX' ?
                            singledata.ls : 1)) :
                            '0' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day buy Avg <p class="float-right mb-0">
                        {{
                            singledata.daybuyavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day sell Avg <p class="float-right mb-0">
                        {{ singledata.daysellavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day Avg price <p
                        class="float-right mb-0">
                        {{ singledata.dayavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day buy Amt <p class="float-right mb-0">
                        {{
                            singledata.daybuyamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Day sell Amt <p class="float-right mb-0">
                        {{ singledata.daysellamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF buy Qty <p class="float-right mb-0">{{
                        singledata.cfbuyqty ? (singledata.cfbuyqty / (singledata.exch === 'MCX' ? singledata.ls :
                            1)) : '0' }}
                    </p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF sell Qty <p class="float-right mb-0">
                        {{
                            singledata.cfsellqty ? (singledata.cfsellqty / (singledata.exch === 'MCX' ? singledata.ls :
                                1)) : '0' }}
                    </p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF buy Avg <p class="float-right mb-0">{{
                        singledata.cfbuyavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF sell Avg <p class="float-right mb-0">
                        {{
                            singledata.cfsellavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF buy Amt <p class="float-right mb-0">{{
                        singledata.cfbuyamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">CF sell Amt <p class="float-right mb-0">
                        {{
                            singledata.cfsellamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open buy Qty <p class="float-right mb-0">
                        {{ singledata.openbuyqty ? (singledata.openbuyqty / (singledata.exch === 'MCX' ?
                            singledata.ls : 1)) :
                            '0' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open sell Qty <p
                        class="float-right mb-0">
                        {{ singledata.opensellqty ? (singledata.opensellqty / (singledata.exch === 'MCX' ?
                            singledata.ls : 1)) :
                            '0' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open buy Avg <p class="float-right mb-0">
                        {{ singledata.openbuyavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open sell Avg <p
                        class="float-right mb-0">
                        {{ singledata.opensellavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open buy Amt <p class="float-right mb-0">
                        {{ singledata.openbuyamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Open sell Amt <p
                        class="float-right mb-0">
                        {{ singledata.opensellamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Total buy Avg <p
                        class="float-right mb-0">
                        {{ singledata.totbuyavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Total sell Avg <p
                        class="float-right mb-0">{{
                            singledata.totsellavgprc || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Total buy Amt <p
                        class="float-right mb-0">
                        {{ singledata.totbuyamt || '0.00' }}</p>
                </v-list-item-title>
                <v-list-item-title class="maintext--text font-weight-bold fs-14"
                    style="border-bottom: 1px solid #EBEEF0; padding: 12px 0;">Total sell Amt <p
                        class="float-right mb-0">{{
                            singledata.totsellamt || '0.00' }}</p>
                </v-list-item-title>
            </div>
            <template v-slot:append>
                <v-divider></v-divider>
                <div class="pa-4">
                    <v-btn
                        @click="handleMenuDialog('order', singledata.token, singledata.exch, singledata.tsym, singledata.netqty < 0 ? 's' : 'b', singledata)"
                        class="rounded-pill text-none font-weight-bold elevation-0"
                        :color="singledata.netqty > 0 ? 'secgreen' : singledata.netqty < 0 ? 'secred' : 'secbg'" block
                        :text-color="singledata.netqty > 0 ? 'maingreen' : singledata.netqty < 0 ? 'mainred' : 'subtext'"
                        height="40px">
                        <v-icon size="20">mdi-plus</v-icon> Add
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getMPosotion, getEXPosition, getMPosotionCon, getPlaceOrder, getQuotesdata } from '@/components/mixins/getAPIdata'
import noDataImg from '@/assets/no data folder.svg'
import * as echarts from 'echarts'

const router = useRouter()

const authStore = useAuthStore()
const appStore = useAppStore()

const uid = ref(null)
const mtoken = ref(null)

const ordertab = ref('positions')
const opensearch = ref('')
const exchtype = ref('all')
const dashitems = ref([
    { val: 'all', txt: 'All' },
    { val: 'stocks', txt: 'Stocks' },
    { val: 'fno', txt: 'F&O' },
    { val: 'comm', txt: 'Commodities' },
    { val: 'curr', txt: 'Currency' }
])

const loading = ref(false)
const exloading = ref(false)

const currentSort = ref(null)
const currentExSort = ref(null)

const positiondata = ref([])
const expositiondata = ref([])
const openposition = ref([])
const closeposition = ref([])

const posdselected = ref([])

const statposition = ref({ mtm: '0.00', pnl: '0.00', tradeval: '0.00', oppnl: '0.00', positive: [], negative: [], close: [], open: [] })

const postgroups = ref({})
const liveposgrp = ref(null)
const grpdialog = ref(false)

// dialogs and actions state
const exitdialog = ref(false)
const orderloader = ref(false)
const convertdialog = ref(false)
const convertloader = ref(false)
const convtype = ref('')
const convqty = ref(0)
const singledata = ref({})
const positiondrawer = ref(false)

// Chart refs/state
const chartInstance = ref(null)
const chartData = ref({ x: [], y: [] })

// Search helpers
const positionFilterKeys = ['tsym', 'exch', 's_prdt_ali', 'instname']
const expoFilterKeys = ['tsym', 'exch']
function includeSearch(item, keys, term) {
    if (!term) return true
    const q = String(term).toLowerCase()
    for (const k of keys) {
        const v = item && item[k]
        if (v !== undefined && v !== null && String(v).toLowerCase().includes(q)) return true
    }
    return false
}

// Cache helpers: persist last good data in sessionStorage to show when WS is idle
function saveCachePositions() {
    try {
        sessionStorage.setItem('positions_last', JSON.stringify({ a: positiondata.value, o: openposition.value, c: closeposition.value }))
    } catch (e) { }
}
function saveCacheExposures() {
    try {
        sessionStorage.setItem('exposures_last', JSON.stringify(expositiondata.value))
    } catch (e) { }
}
function loadCachePositions() {
    try {
        const raw = sessionStorage.getItem('positions_last')
        if (raw) {
            const cached = JSON.parse(raw)
            if (cached && (cached.a?.length || cached.o?.length || cached.c?.length)) {
                settempDatas(cached)
                // console.log('Loaded cached positions')
            }
        }
    } catch (e) { }
}
function loadCacheExposures() {
    try {
        const raw = sessionStorage.getItem('exposures_last')
        if (raw) {
            const cached = JSON.parse(raw)
            if (Array.isArray(cached) && cached.length) {
                expositiondata.value = cached
                updateExpoHeaders()
                if (ordertab.value === 'all') computeStats()
                // console.log('Loaded cached exposures')
            }
        }
    } catch (e) { }
}

// Watch for group change, fetch & render chart data
// Removed getPostPnL API call - it was causing 401 errors
watch(liveposgrp, async (newVal) => {
    if (!newVal || !postgroups.value[newVal]) return
    try {
        // Chart data is now empty - API call removed due to 401 errors
        chartData.value = { x: [], y: [] }
        if (chartInstance.value) chartInstance.value.clear()
    } catch (e) {
        chartData.value = { x: [], y: [] }
        if (chartInstance.value) chartInstance.value.clear()
    }
}, { immediate: true })

function renderEChart() {
    if (!document.getElementById('mtmchart') || !window.echarts) return
    if (!chartInstance.value) {
        chartInstance.value = echarts.init(document.getElementById('mtmchart'))
    }
    const option = {
        title: { text: 'Group MTM (Realtime)', left: 'center', top: 8, textStyle: { fontSize: 14 } },
        xAxis: {
            type: 'category',
            data: chartData.value.x,
            boundaryGap: false,
            axisLabel: { fontSize: 11 }
        },
        yAxis: { type: 'value', splitLine: { show: false } },
        grid: { top: 38, left: 30, right: 12, bottom: 20 },
        tooltip: { trigger: 'axis' },
        series: [{
            data: chartData.value.y,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0.05 }
        }]
    }
    chartInstance.value.setOption(option)
    chartInstance.value.resize()
}

function resizeChart() {
    if (chartInstance.value) { chartInstance.value.resize() }
}

// Preferred columns (order) and display names
const preferredPositionColumns = [
    { key: 's_prdt_ali', text: 'Product' },
    { key: 'tsym', text: 'Instrument' },
    { key: 'netqty', text: 'Qty' },
    { key: 'netupldprc', text: 'Act Avg price', align: 'right' },
    { key: 'ltp', text: 'LTP', align: 'right' },
    { key: 'rpnl', text: 'P&L', align: 'right' },
    { key: 'avgprc', text: 'Avg price', align: 'right' },
    { key: 'mtm', text: 'MTM', align: 'right' },
    { key: 'daybuyqty', text: 'Buy Qty' },
    { key: 'daysellqty', text: 'Sell Qty' },
    { key: 'totbuyavgprc', text: 'Buy Avg', align: 'right' },
    { key: 'totsellavgprc', text: 'Sell Avg', align: 'right' }
]
const preferredExpoColumns = [
    { key: 'tsym', text: 'Instrument' },
    { key: 'netqty', text: 'Qty' },
    { key: 'ltp', text: 'LTP', align: 'right' },
    { key: 'rpnl', text: 'P&L', align: 'right' },
    { key: 'avgprc', text: 'Avg price', align: 'right' },
    { key: 'BuyQuantity', text: 'Buy Qty' },
    { key: 'SellQuantity', text: 'Sell Qty' },
    { key: 'BuyPrice', text: 'Buy Avg', align: 'right' },
    { key: 'BuyValue', text: 'Buy Amt', align: 'right' },
    { key: 'SellPrice', text: 'Sell Avg', align: 'right' },
    { key: 'SellValue', text: 'Sell Amt', align: 'right' }
]

const numericLike = new Set(['netqty', 'netupldprc', 'ltp', 'rpnl', 'avgprc', 'mtm', 'daybuyqty', 'daysellqty', 'totbuyavgprc', 'totsellavgprc', 'BuyQuantity', 'SellQuantity', 'BuyPrice', 'BuyValue', 'SellPrice', 'SellValue'])

function buildHeadersFrom(items, preferred, addActions = false) {
    const headers = []
    if (!items || !items.length) {
        // fallback: use preferred list directly
        preferred.forEach(col => headers.push({ title: col.text, key: col.key, align: col.align || (numericLike.has(col.key) ? 'right' : undefined) }))
    } else {
        const sample = items[0]
        preferred.forEach(col => {
            if (Object.prototype.hasOwnProperty.call(sample, col.key)) {
                headers.push({ title: col.text, key: col.key, align: col.align || (numericLike.has(col.key) ? 'right' : undefined) })
            }
        })
    }
    // if (addActions) headers.push({ title: 'Actions', key: 'actions', sortable: false, align: 'right' })
    return headers
}

const positionHeaders = ref(buildHeadersFrom([], preferredPositionColumns, true))
const expositionHeaders = ref(buildHeadersFrom([], preferredExpoColumns, false))

// legacy static (kept but unused now)
// const positionheader = computed(() => [...])
// const expositionheader = computed(() => [...])

// After data set, rebuild headers
function updatePositionHeaders() {
    positionHeaders.value = buildHeadersFrom(positiondata.value, preferredPositionColumns, true)
}
function updateExpoHeaders() {
    expositionHeaders.value = buildHeadersFrom(expositiondata.value, preferredExpoColumns, false)
}

const filteredPositions = computed(() => {
    if (exchtype.value === 'all') return positiondata.value
    if (exchtype.value === 'stocks') return positiondata.value.filter(o => ['A', 'EQ'].includes(o.instname))
    if (exchtype.value === 'fno') return positiondata.value.filter(o => ['FUTIDX', 'FUTSTK', 'OPTIDX', 'OPTSTK'].includes(o.instname))
    if (exchtype.value === 'comm') return positiondata.value.filter(o => ['AUCSO', 'FUTCOM', 'FUTIDX', 'OPTFUT'].includes(o.instname))
    if (exchtype.value === 'curr') return positiondata.value.filter(o => ['FUTCUR', 'FUTIRC', 'FUTIRT', 'OPTCUR', 'OPTIRC'].includes(o.instname))
    return positiondata.value
})

// Helper function to check if a position is exited/closed
function isExitedPosition(item) {
    if (!item) return false
    // console.log("isExitedPosition", item)
    return item.way === 'close' || Number(item.netqty) === 0
}

// Enable Exit button iff there is at least one open position (matching old code logic)
const hasOpenPositions = computed(() => {
    try {
        // Check if there are any open positions (matching old code: openposition && openposition.length == 0)
        return openposition.value && openposition.value.length > 0
    } catch (_) { return false }
})

const searchedPositions = computed(() => {
    const base = filteredPositions.value || []
    return base.filter(item => includeSearch(item, positionFilterKeys, opensearch.value))
})

// Sort positions: open positions first, then closed/exited positions
const sortedPositions = computed(() => {
    const positions = searchedPositions.value || []
    return [...positions].sort((a, b) => {
        const aIsExited = isExitedPosition(a)
        const bIsExited = isExitedPosition(b)

        // Open positions (not exited) come first
        if (!aIsExited && bIsExited) return -1
        if (aIsExited && !bIsExited) return 1

        // If both are same type, maintain original order or sort by way
        if (a.way === 'open' && b.way === 'close') return -1
        if (a.way === 'close' && b.way === 'open') return 1

        return 0
    })
})

const searchedExpositions = computed(() => {
    const base = expositiondata.value || []
    return base.filter(item => includeSearch(item, expoFilterKeys, opensearch.value))
})

function differentView(view) {
    const v = Number(view)
    return v || v === 0 ? v.toFixed(2) : '0.00'
}

function computeStats() {
    const src = ordertab.value !== 'all' ? positiondata.value : expositiondata.value
    if (!src || !src.length) {
        statposition.value = { mtm: '0.00', pnl: '0.00', tradeval: '0.00', oppnl: '0.00', positive: [], negative: [], close: [], open: [] }
        return
    }
    const positive = src.filter(x => Number(x.rpnl) > 0)
    const negative = src.filter(x => Number(x.rpnl) < 0)
    const close = src.filter(x => Number(x.netqty) === 0)
    const open = src.filter(x => Number(x.netqty) !== 0)
    const tradeval = src.reduce((acc, o) => acc + (Number(o.val) > 0 ? Number(o.val) : 0), 0)
    const oppnl = open.reduce((acc, o) => acc + (Number(o.rpnl) || 0), 0)
    const pnl = src.reduce((acc, o) => acc + (Number(o.rpnl) || 0), 0)
    const mtm = src.reduce((acc, o) => acc + (Number(o.mtm) || 0), 0)
    statposition.value = {
        positive, negative, close, open,
        tradeval: differentView(Math.abs(tradeval)),
        oppnl: differentView(Math.abs(oppnl)),
        pnl: differentView(pnl),
        mtm: differentView(mtm)
    }
}

const menulist = ref({
    o: [
        { name: 'Add', icon: 'mdi-plus', type: 'order' },
        { name: 'Conversion', icon: 'mdi-autorenew', type: 'convert' },
        { name: 'Exit', icon: 'mdi-close', type: 'exit-order', hr: true },
        { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
        { name: 'Create Alert', icon: 5, type: 'alert' },
        { name: 'Market Depth', icon: 6, type: 'depth' },
        { name: 'Chart', icon: 7, type: 'chart', hr: true },
        { name: 'Fundamentals', icon: 9, type: 'Funda' },
        { name: 'Details', icon: 10, type: '' }
    ],
    c: [
        { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
        { name: 'Create Alert', icon: 5, type: 'alert' },
        { name: 'Market Depth', icon: 6, type: 'depth' },
        { name: 'Chart', icon: 7, type: 'chart', hr: true },
        { name: 'Fundamentals', icon: 9, type: 'Funda' },
        { name: 'Details', icon: 10, type: '' }
    ]
})

function handleMenuDialog(type, token, exch, tsym, trans, item) {
    if (type === 'order') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type, token, exch, tsym, trantype: trans, item }
        }))
    }
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    if (type === 'exit-order') {
        // Check for BO/CO orders (matching old code logic)
        if (item && (item.s_prdt_ali === 'BO' || item.s_prdt_ali === 'CO')) {
            appStore.showSnackbar(2, 'Cover/Bracket orders can\'t exist here; exit on the order book.')
            return
        }

        // For single position exit, emit menudialog event (matching old code behavior)
        // This opens the order window for single position exit
        if (item) {
            window.dispatchEvent(new CustomEvent('menudialog', {
                detail: { type, token, exch, tsym, trantype: trans, item }
            }))
        } else {
            // Batch exit - dialog already opened from button
            exitdialog.value = true
        }
    } else if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type: 'alert', token, exch, tsym }
        }))
    } else if (type === 'cGTT') {
        positiondrawer.value = false
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' }
        }))
    } else if (type === 'order') {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: { type, token, exch, tsym, trantype: item?.netqty < 0 ? 's' : 'b', item }
        }))
    } else if (type === 'chart' || type === 'depth' || type === 'Funda') {
        // Navigate to stock details page with proper validation
        try {
            // Validate and convert token to string (it might be a number)
            const validToken = token ? String(token).trim() : null
            const validExch = exch ? String(exch).trim() : null
            const validTsym = tsym ? String(tsym).trim() : null

            // Validate all required fields are present and non-empty
            if (!validToken || !validExch || !validTsym) {
                appStore.showSnackbar(2, 'Invalid stock data. Cannot open stock details.')
                // console.error('Invalid stock data for navigation:', { token: validToken, exch: validExch, tsym: validTsym })
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
    }
}

function sortTable(column) {
    if (currentSort.value && currentSort.value.column === column) {
        currentSort.value.desc = !currentSort.value.desc
    } else {
        currentSort.value = { column, desc: false }
    }
    const numeric = ['netqty', 'netupldprc', 'ltp', 'rpnl', 'avgprc', 'mtm', 'totbuyavgprc', 'totsellavgprc']
    const dir = currentSort.value.desc ? -1 : 1
    positiondata.value = [...positiondata.value].sort((a, b) => {
        if (column === 'way') return dir * (a.way === 'open' ? -1 : 1)
        if (numeric.includes(column)) return dir * ((parseFloat(a[column]) || 0) - (parseFloat(b[column]) || 0))
        const av = a[column] || ''
        const bv = b[column] || ''
        return dir * (typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : (av > bv ? 1 : av < bv ? -1 : 0))
    })
}

function sortExTable(column) {
    if (currentExSort.value && currentExSort.value.column === column) {
        currentExSort.value.desc = !currentExSort.value.desc
    } else {
        currentExSort.value = { column, desc: false }
    }
    const numeric = ['netqty', 'ltp', 'rpnl', 'avgprc', 'BuyQuantity', 'SellQuantity', 'BuyPrice', 'BuyValue', 'SellPrice', 'SellValue']
    const dir = currentExSort.value.desc ? -1 : 1
    expositiondata.value = [...expositiondata.value].sort((a, b) => {
        if (column === 'way') return dir * (a.way === 'open' ? -1 : 1)
        if (numeric.includes(column)) return dir * ((parseFloat(a[column]) || 0) - (parseFloat(b[column]) || 0))
        const av = a[column] || ''
        const bv = b[column] || ''
        return dir * (typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : (av > bv ? 1 : av < bv ? -1 : 0))
    })
}

function settempDatas(data) {
    // replace all three lists atomically to avoid stale mixes on refresh
    closeposition.value = Array.isArray(data.c) ? data.c : []
    openposition.value = Array.isArray(data.o) ? data.o : []
    positiondata.value = Array.isArray(data.a) ? data.a : []
    // console.log('settempDatas -> counts', {
    //     close: closeposition.value.length,
    //     open: openposition.value.length,
    //     all: positiondata.value.length
    // })
    updatePositionHeaders()
    // Recompute summary only if we are on Positions tab to avoid being overwritten by exposure fetch
    if (ordertab.value !== 'all') computeStats()
    saveCachePositions()
    // subscribe for WS updates
    if (positiondata.value && positiondata.value.length) {
        const event = new CustomEvent('web-scoketOn', { detail: { flow: 'sub', data: positiondata.value, is: 'pos', page: 'position' } })
        window.dispatchEvent(event)
    }
}

async function getPositionbook() {
    loading.value = true
    try {
        const data = await getMPosotion(true)
        // Check if data is valid (not an error code)
        if (data !== 500 && data !== null && data !== undefined) {
            // Valid response - always update data (even if empty arrays)
            // Empty arrays are valid - user might have no positions
            if (data.a !== undefined || data.o !== undefined || data.c !== undefined) {
                settempDatas(data)
            } else if (data.emsg) {
                // API returned an error message
                appStore.showSnackbar(2, data.emsg)
            }
            // If data has no a/o/c properties and no emsg, keep existing data silently
        } else if (data === 500) {
            // Network error - keep existing data, show error
            appStore.showSnackbar(2, 'Network error. Please check your connection.')
        }
        // Keep existing data visible if API call fails
    } catch (error) {
        // console.error('Error loading positions:', error)
        appStore.showSnackbar(2, 'Failed to load positions')
        // Keep existing data on error
    } finally {
        loading.value = false
    }
}

async function getexPositionbook() {
    exloading.value = true
    try {
        const data = await getEXPosition()
        // Check if data is valid (not an error code)
        if (data !== 500 && data !== null && data !== undefined) {
            // Check if it's an array (valid response - empty array is valid)
            if (Array.isArray(data)) {
                // Process data first before updating - prevents empty flash
                const processedData = []
                for (let q = 0; q < data.length; q++) {
                    const d = { ...data[q] } // Create a copy to avoid mutating original
                    d.idx = q
                    d.way = Number(d.netqty) === 0 ? 'close' : 'open'
                    d.disabled = d.way === 'open' ? false : null
                    d.avgprc = d.NetAvgPrc
                    d.tokn = `${d.token}_${q}`
                    processedData.push(d)
                }
                // Only update after processing is complete - prevents empty flash
                // Empty array is valid - user might have no exposures
                expositiondata.value = processedData
                updateExpoHeaders()
                if (processedData.length > 0) {
                    const event = new CustomEvent('web-scoketOn', { detail: { flow: 'sub', data: expositiondata.value, is: 'pos', page: 'position' } })
                    window.dispatchEvent(event)
                }
                // Only recompute stats if the "All Positions" tab is active
                if (ordertab.value === 'all') computeStats()
                saveCacheExposures()
            } else if (data && typeof data === 'object' && data.emsg) {
                // API returned an error message (not an array)
                appStore.showSnackbar(2, data.emsg)
                // Keep existing data on error
            }
            // If data is not an array and has no emsg, keep existing data silently
        } else if (data === 500) {
            // Network error - keep existing data, show error
            appStore.showSnackbar(2, 'Network error. Please check your connection.')
        }
        // Keep existing data visible if API call fails
    } catch (error) {
        // console.error('Error loading exposures:', error)
        appStore.showSnackbar(2, 'Failed to load exposures')
        // Keep existing data on error
    } finally {
        exloading.value = false
    }
}

// Computed property to get selected open positions (matching old code's posselected logic)
const posselected = computed(() => {
    return positiondata.value.filter((p) => {
        return p.way === 'open' && p.disabled
    })
})

function selectAllToggle(props) {
    // Matching old code logic exactly
    if (props) {
        if (posdselected.value.length === openposition.value.length) {
            posdselected.value = [...positiondata.value]
        }
        if (posdselected.value.length === positiondata.value.length) {
            posdselected.value = []
            positiondata.value.forEach((p) => {
                p.disabled = false
            })
        } else {
            positiondata.value.forEach((p) => {
                p.disabled = props.value
                if (p.way === 'open' && p.disabled) {
                    if (!posdselected.value.some(sel => {
                        const selTokn = typeof sel === 'object' ? sel?.tokn : sel
                        return selTokn === p.tokn
                    })) {
                        posdselected.value.push(p)
                    }
                } else if (p.way === 'open') {
                    const index = posdselected.value.findIndex(sel => {
                        const selTokn = typeof sel === 'object' ? sel?.tokn : sel
                        return selTokn === p.tokn
                    })
                    if (index > -1) {
                        posdselected.value.splice(index, 1)
                    }
                }
            })
            if (posdselected.value.length === openposition.value.length) {
                posdselected.value = [...positiondata.value]
            }
        }
    } else {
        posdselected.value = positiondata.value.filter((p) => {
            if (p.way === 'open' && p.disabled) {
                return true
            }
        })
        if (posdselected.value.length === openposition.value.length) {
            posdselected.value = [...positiondata.value]
        }
        if (posdselected.value.length === 0) {
            positiondata.value.forEach((p) => {
                p.disabled = false
            })
        }
    }
}

function setColseposition(i) {
    orderloader.value = true

    // Get selected positions (matching old code logic)
    const selected = posselected.value || []
    const open = openposition.value || []

    // Prioritize selected positions, then fall back to all open positions if nothing selected
    if (i <= selected.length - 1) {
        setPlaceorder(i, selected[i])
    } else if (selected.length === 0 && posdselected.value.length === 0 && i <= open.length - 1) {
        setPlaceorder(i, open[i])
    } else {
        appStore.showSnackbar(1, 'All your open positions have been Squared off.')
        // Emit orderbook-update event to refresh order book (matching old code)
        window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'port-order' }))
        orderloader.value = false
        exitdialog.value = false
        posdselected.value = []
        positiondata.value.forEach(p => {
            if (p.way === 'open') {
                p.disabled = false
            }
        })
    }
}

async function setPlaceorder(i, raw) {
    let data = {}
    const item = {
        uid: uid.value,
        actid: uid.value,
        exch: raw.exch,
        prctyp: 'MKT',
        prd: raw.prd,
        prc: '0',
        qty: String(Math.abs(raw.netqty)),
        ret: 'DAY',
        tsym: raw.tsym,
        trantype: Number(raw.netqty) > 0 ? 'S' : 'B'
    }

    // Calculate freeze quantity (matching old code logic exactly)
    // Modify raw.frzqty directly like old code
    raw.frzqty = Math.floor(Number(raw.frzqty || 0) / Number(raw.ls || 1)) * Number(raw.ls || 1)

    const qty = Number(item.qty)
    let frzqty = Number(raw.frzqty)
    // Handle case when frzqty is 0 or invalid (use qty as fallback)
    if (!frzqty || frzqty <= 0) {
        frzqty = qty
    }
    const fullOrders = Math.floor(qty / frzqty)
    const remainingQty = qty % frzqty

    // Place full orders (matching old code - no early return on error)
    for (let k = 0; k < fullOrders; k++) {
        item.qty = frzqty.toString()
        data = await getPlaceOrder(item)
    }

    // Place remaining quantity if any (matching old code)
    if (remainingQty > 0 || qty < frzqty) {
        item.qty = (remainingQty || qty).toString()
        data = await getPlaceOrder(item)
    }

    // Check error after all orders placed (matching old code behavior)
    if (data.stat !== 'Ok') {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : data)
        orderloader.value = false
    } else {
        // Continue with next position (matching old code)
        setTimeout(() => setColseposition(i + 1), 100)
    }
}

async function setPosConvert(item) {
    if (item) {
        singledata.value = { ...item }
        positiondrawer.value = false
        convertdialog.value = true
        singledata.value.index = positiondata.value.indexOf(item)
        const lot = item.exch === 'MCX' ? item.ls : 1
        convqty.value = Math.abs(item.netqty) / lot
        convtype.value = item.s_prdt_ali !== 'MIS' || item.s_prdt_ali === 'NRML' ? 'MIS' : (item.exch === 'NSE' || item.exch === 'BSE') ? 'CNC' : 'NRML'
        singledata.value.defaultqty = Math.abs(item.netqty) / lot
    } else if (convqty.value > 0 && convqty.value <= singledata.value.defaultqty && convtype.value) {
        convertloader.value = true
        const list = {
            uid: uid.value,
            actid: uid.value,
            exch: singledata.value.exch,
            tsym: singledata.value.tsym,
            qty: String(convqty.value * (singledata.value.exch === 'MCX' ? singledata.value.ls : 1)),
            prd: convtype.value === 'CNC' ? 'C' : convtype.value === 'MIS' ? 'I' : convtype.value === 'NRML' ? 'M' : '',
            prevprd: singledata.value.s_prdt_ali === 'CNC' ? 'C' : singledata.value.s_prdt_ali === 'MIS' ? 'I' : singledata.value.s_prdt_ali === 'NRML' ? 'M' : '',
            trantype: Number(singledata.value.netqty) > 0 ? 'B' : 'S',
            postype: 'DAY',
            ordersource: 'web'
        }
        const data = await getMPosotionCon(list)
        if (data.stat === 'Ok') {
            appStore.showSnackbar(1, 'Successfully Converted Position')
            if (typeof singledata.value.index === 'number') {
                positiondata.value[singledata.value.index].s_prdt_ali = convtype.value
            }
        } else {
            appStore.showSnackbar(2, data && data.emsg ? data.emsg : data)
        }
        convertdialog.value = false
        convertloader.value = false
        singledata.value = {}
    }
}

function onWebSocketConn(e) {
    const { detail } = e
    // detail can be [data, page] or data object
    const data = Array.isArray(detail) ? detail[0] : detail
    if (!data || !data.token) return
    // console.log('WS tick', { token: data.token, lp: data.lp })
    // update positions using old logic parity
    if (positiondata.value?.length) {
        const idxs = positiondata.value.map((p, i) => (p.token === data.token ? i : -1)).filter(i => i >= 0)
        for (const w of idxs) {
            const p = positiondata.value[w]
            const ltp = Number(data.lp)
            p.ltp = ltp.toFixed(2)
            p.val = (Number(p.avgprc) * Math.abs(Number(p.netqty))).toFixed(2)
            const qty = Number(p.netqty)
            const multplr = Number(p.mult) || 1
            const prcftr = Number(p.prcftr) || 1
            const NetBuyQty = (Number(p.daybuyqty) || 0) + (Number(p.cfbuyqty) || 0)
            const NetSellQty = (Number(p.daysellqty) || 0) + (Number(p.cfsellqty) || 0)
            const upldprc = Number(p.upldprc) || 0
            const netupldprc = Number(p.netupldprc) || 0
            const netavgprc = Number(p.netavgprc) || 0
            const ActualBuyAvgPrice = NetBuyQty !== 0 ? (((Number(p.daybuyamt) || 0) / multplr) + (upldprc * prcftr * (Number(p.cfbuyqty) || 0))) / (NetBuyQty * prcftr) : 0
            const ActualSellAvgPrice = NetSellQty !== 0 ? (((Number(p.daysellamt) || 0) / multplr) + (upldprc * prcftr * (Number(p.cfsellqty) || 0))) / (NetSellQty * prcftr) : 0
            const closedQty = Math.min(NetBuyQty, NetSellQty)
            const ActualBookedPNL = (ActualSellAvgPrice - ActualBuyAvgPrice) * closedQty * multplr
            const avgprcForUnrealized = netupldprc !== 0 ? netupldprc : netavgprc
            const ActualUnrealizedMtoM = qty * prcftr * multplr * (ltp - avgprcForUnrealized)
            const PnL = ActualBookedPNL + ActualUnrealizedMtoM
            const crpnl = Number(p.crpnl) || 0
            const mtm = qty === 0
                ? crpnl
                : (ltp - netavgprc) * ((['NFO', 'BFO', 'NSE', 'BSE'].includes(p.exch) ? qty * prcftr : (multplr * qty) * prcftr)) + crpnl
            p.mtm = Number(mtm).toFixed(2)
            p.rpnl = Number(PnL).toFixed(2)
            p.pnlc = Number(p.avgprc) > 0 ? (((Number(p.avgprc) - ltp) / Number(p.avgprc)) * 100).toFixed(2) : '0.00'
            p.hp = Number(data.high_price || 0) * Math.abs(qty)
            p.lp = Number(data.low_price || 0) * Math.abs(qty)
        }
    }
    // exposition parity
    const x = expositiondata.value.findIndex(o => o.token === data.token)
    if (x >= 0) {
        const ex = expositiondata.value[x]
        const ltp = Number(data.lp)
        ex.ltp = ltp.toFixed(2)
        ex.rpnl = ex.netqty && Number(ex.netqty) !== 0 ? ((ltp - ex.avgprc) * ex.netqty).toFixed(2) : (Number(ex.SellValue) - Number(ex.BuyValue)).toFixed(2)
        ex.val = (ex.avgprc * Math.abs(Number(ex.netqty))).toFixed(2)
    }
    computeStats()
    // keep drawer details fresh
    if (positiondrawer.value && singledata.value && singledata.value.tokn) {
        const si = positiondata.value.findIndex(o => o.tokn === singledata.value.tokn)
        if (si >= 0) {
            singledata.value = { ...positiondata.value[si] }
        }
    }
    saveCachePositions()
}

function onTempDataUpdate(e) {
    settempDatas(e.detail)
}

function onTabChange() {
    computeStats()
}

function onOrderbookUpdate(e) {
    // Refresh positions when orders are placed that could affect positions
    const detail = e?.detail
    const shouldRefresh =
        detail === 'orders' ||
        detail === 'port-order' ||
        (detail && detail.type === 'orders')

    if (shouldRefresh) {
        // Unsubscribe from current WebSocket subscriptions to avoid duplicate ticks
        const currentList = ordertab.value !== 'all' ? positiondata.value : expositiondata.value
        if (Array.isArray(currentList) && currentList.length) {
            const ev = new CustomEvent('web-scoketOn', { detail: { flow: 'unsub', data: currentList, is: 'pos', page: 'position' } })
            window.dispatchEvent(ev)
        }
        // Add a small delay to ensure API has processed the order
        setTimeout(() => {
            if (ordertab.value !== 'all') {
                getPositionbook()
            } else {
                getexPositionbook()
            }
        }, 500)
    }
}

function refresh() {
    // proactively unsubscribe current list to avoid duplicate/ghost ticks on refresh
    const currentList = ordertab.value !== 'all' ? positiondata.value : expositiondata.value
    if (Array.isArray(currentList) && currentList.length) {
        const ev = new CustomEvent('web-scoketOn', { detail: { flow: 'unsub', data: currentList, is: 'pos', page: 'position' } })
        window.dispatchEvent(ev)
    }
    if (ordertab.value !== 'all') getPositionbook(); else getexPositionbook();
}

function setPositionrowdata(item) {
    if (!item) return
    // Handle both raw item (from click:row) and direct item (from selection)
    const itemData = item?.raw || item
    // Ensure we get the actual item from positiondata if tokn matches
    if (itemData?.tokn) {
        const foundItem = positiondata.value.find(p => p.tokn === itemData.tokn)
        if (foundItem) {
            singledata.value = { ...foundItem }
        } else {
            singledata.value = { ...itemData }
        }
    } else {
        singledata.value = { ...itemData }
    }
    positiondrawer.value = !positiondrawer.value
}

function groupPositions() {
    // mapping based on tsym/instrument prefix, same as legacy
    const groups = {}
    positiondata.value.forEach(pos => {
        const token = pos.tsym
        const match = token.match(/(.*?)-|\s/)
        const groupKey = match ? match[1] : token.slice(0, 4) // fallback to 1st part or prefix
        if (!groups[groupKey]) {
            groups[groupKey] = { data: [], tysm: [], color: 'secbg', mtm: '0.00', text: 'maintext--text' }
        }
        groups[groupKey].data.push(pos)
        groups[groupKey].tysm.push(pos.tsym)
    })
    // Recalculate MTM and color for each group
    for (const k in groups) setGrpmtm(groups[k].data, k, groups)
    postgroups.value = groups
    // Set default group to first key if not present
    if (!liveposgrp.value && Object.keys(groups).length > 0) {
        liveposgrp.value = Object.keys(groups)[0]
    }
}
function setGrpmtm(arr, k, groups = postgroups.value) {
    const mtm = arr.reduce((sum, p) => sum + Number(p.mtm || 0), 0)
    groups[k].color = mtm > 0 ? 'secgreen' : mtm < 0 ? 'secred' : 'secbg'
    groups[k].text = mtm > 0 ? 'maingreen--text' : mtm < 0 ? 'mainred--text' : 'maintext--text'
    groups[k].mtm = mtm.toFixed(2)
}
function setChangesGrp(k) {
    liveposgrp.value = k
}
watch(positiondata, groupPositions, { immediate: true })

// Close position drawer when convert dialog opens
watch(convertdialog, (newVal) => {
    if (newVal) {
        positiondrawer.value = false
    }
})

// Sync table selection with our legacy `disabled` flags for open positions
// Also update drawer when a single item is selected
// Filter out exited positions from selection
watch(posdselected, (sel) => {
    try {
        // Remove any exited positions from selection
        const validSelection = (sel || []).filter(item => {
            const position = typeof item === 'object' ? item : positiondata.value.find(p => p.tokn === item)
            return position && !isExitedPosition(position)
        })
        if (validSelection.length !== sel?.length) {
            posdselected.value = validSelection
            return
        }

        // Sync disabled flags with selection (matching old code logic)
        const selectedTokns = new Set((sel || []).map((i) => {
            const item = typeof i === 'object' ? i : positiondata.value.find(p => p.tokn === i)
            return item?.tokn || i
        }))

        positiondata.value.forEach((p) => {
            if (p.way === 'open' && !isExitedPosition(p)) {
                // Set disabled flag based on selection (matching old code)
                p.disabled = selectedTokns.has(p.tokn)
            } else if (p.way === 'close' || isExitedPosition(p)) {
                // Ensure closed positions are never disabled/selected
                p.disabled = false
            }
        })

        // If a single item is selected, update the drawer with full position data
        if (sel && sel.length === 1) {
            const selectedItem = sel[0]
            const toknToFind = typeof selectedItem === 'object' ? selectedItem.tokn : selectedItem
            const foundItem = positiondata.value.find(p => p.tokn === toknToFind)
            if (foundItem && !isExitedPosition(foundItem)) {
                singledata.value = { ...foundItem }
                positiondrawer.value = true
            }
        } else if (sel && sel.length === 0) {
            // Close drawer if no items selected
            positiondrawer.value = false
        }
    } catch (e) {
        // console.error('Error in posdselected watch:', e)
    }
})

function onKeydown(e) {
    if (e.key === 'Escape' && positiondrawer.value) positiondrawer.value = false
}

function closeDrawer() {
    positiondrawer.value = false
}

onMounted(async () => {
    // ensure store state is hydrated on hard refresh
    try { authStore.loadFromSession && authStore.loadFromSession() } catch (e) { }
    // Optimistic UI: show cached last good data instantly, real data will replace
    loadCachePositions()
    loadCacheExposures()
    const res = sessionStorage.getItem('c3RhdHVz')
    if (res === 'dmFsaWR1c2Vy') {
        uid.value = authStore.uid || sessionStorage.getItem('userid')
        mtoken.value = authStore.mtoken || sessionStorage.getItem('msession')
        setTimeout(() => {
            getPositionbook()
            getexPositionbook()
        }, 100)
    }

    window.addEventListener('web-scoketConn', onWebSocketConn)
    window.addEventListener('tempdata-update', onTempDataUpdate)
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    window.addEventListener('resize', resizeChart)
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('web-scoketConn', onWebSocketConn)
    window.removeEventListener('tempdata-update', onTempDataUpdate)
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
    window.removeEventListener('resize', resizeChart)
    window.removeEventListener('keydown', onKeydown)
    // Unsubscribe any active tokens to prevent duplicate ticks after refresh/navigation
    try {
        const data = ordertab.value !== 'all' ? positiondata.value : expositiondata.value
        if (Array.isArray(data) && data.length) {
            const ev = new CustomEvent('web-scoketOn', { detail: { flow: 'unsub', data, is: 'pos', page: 'position' } })
            window.dispatchEvent(ev)
        }
    } catch (e) { }
    if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
    }
})
</script>

<style scoped>
.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.fs-14 {
    font-size: 14px !important;
}

/* Position relative/absolute for action buttons */
.pos-rlt {
    position: relative;
}

.pos-abs {
    position: absolute;
}

/* Table hover effects */
.table-hov {
    opacity: 0;
    transition: opacity 0.2s;
}

.table-row:hover .table-hov {
    opacity: 1;
}

/* Make table rows clickable */
:deep(.table-row) {
    cursor: pointer;
}

:deep(.table-row:hover) {
    background-color: rgba(0, 0, 0, 0.02) !important;
}

.table-hov-text {
    transition: color 0.2s;
}

.table-hov-prd {
    transition: background-color 0.2s;
}

.ws-p {
    white-space: nowrap;
}

/* Add padding to table rows */
:deep(.v-data-table__tr) {
    padding: 5px 0 !important;
}

:deep(.v-data-table__td) {
    padding: 5px 16px !important;
}

:deep(.v-data-table__th) {
    padding: 5px 16px !important;
    white-space: nowrap !important;
}

:deep(.v-data-table__th .v-data-table-header__content) {
    white-space: nowrap !important;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.v-text-field input) {
    font-size: 16px !important;
}

/* Exited/Closed position styling - light grey background */
/* Override global white background rules with higher specificity */
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.closed-position),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.table-row.closed-position),
:deep(.holdings-table.v-data-table table tbody tr.closed-position),
:deep(.holdings-table.v-data-table table tbody tr.table-row.closed-position),
:deep(.holdings-table .v-data-table__tr.closed-position),
:deep(.holdings-table table tbody tr.closed-position) {
    background-color: #F5F5F5 !important;
}

:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.closed-position:hover),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.table-row.closed-position:hover),
:deep(.holdings-table.v-data-table table tbody tr.closed-position:hover),
:deep(.holdings-table.v-data-table table tbody tr.table-row.closed-position:hover),
:deep(.holdings-table .v-data-table__tr.closed-position:hover),
:deep(.holdings-table table tbody tr.closed-position:hover) {
    background-color: #EEEEEE !important;
}

/* Apply background to all cells in closed position rows - override global td white background */
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.closed-position td),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.table-row.closed-position td),
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.closed-position > td),
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.table-row.closed-position > td),
:deep(.holdings-table.v-data-table table tbody tr.closed-position td),
:deep(.holdings-table.v-data-table table tbody tr.table-row.closed-position td),
:deep(.holdings-table .v-data-table__tr.closed-position .v-data-table__td),
:deep(.holdings-table table tbody tr.closed-position td) {
    background-color: #F5F5F5 !important;
}

:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.closed-position:hover td),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.table-row.closed-position:hover td),
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.closed-position:hover > td),
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.table-row.closed-position:hover > td),
:deep(.holdings-table.v-data-table table tbody tr.closed-position:hover td),
:deep(.holdings-table.v-data-table table tbody tr.table-row.closed-position:hover td),
:deep(.holdings-table .v-data-table__tr.closed-position:hover .v-data-table__td),
:deep(.holdings-table table tbody tr.closed-position:hover td) {
    background-color: #EEEEEE !important;
}

/* Override global hover styles for closed positions - prevent blue hover on closed rows */
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.closed-position:hover),
:deep(.holdings-table.v-data-table > .v-data-table__wrapper > table > tbody > tr.table-row.closed-position:hover),
:deep(.holdings-table.v-data-table table tbody tr.closed-position:hover),
:deep(.holdings-table.v-data-table table tbody tr.table-row.closed-position:hover),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.closed-position:hover),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table tbody tr.table-row.closed-position:hover) {
    background-color: #EEEEEE !important;
}

/* Completely hide checkbox column for exited positions */
:deep(.holdings-table .v-data-table__tr.closed-position .v-data-table__td:first-child),
:deep(.holdings-table table tbody tr.closed-position td:first-child),
:deep(.holdings-table .v-data-table__wrapper table tbody tr.closed-position td:first-child) {
    display: none !important;
    width: 0 !important;
    padding: 0 !important;
    min-width: 0 !important;
    max-width: 0 !important;
    visibility: hidden !important;
    border: none !important;
}

:deep(.holdings-table .v-data-table__tr.closed-position .v-data-table__td:first-child *),
:deep(.holdings-table table tbody tr.closed-position td:first-child *),
:deep(.holdings-table .v-data-table__wrapper table tbody tr.closed-position td:first-child *) {
    display: none !important;
    visibility: hidden !important;
}
</style>


<style scoped>
.txt-red {
    color: #F03B4A !important;
}

.fs-16 {
    font-size: 16px !important;
}

.maintext--text {
    color: black !important;
}

/* Increase table row padding */
.holdings-table :deep(td) {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.holdings-table :deep(th) {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
}

/* Hide default skeleton loader */
.holdings-table :deep(.v-data-table__progress) {
    display: none !important;
}

.holdings-table :deep(.v-skeleton-loader) {
    display: none !important;
}

.qty-pill {
    background: #ffffff;
    border: 1px solid #ebeff3;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 500;
    color: #666666;
    display: inline-block;
    min-width: 32px;
    text-align: center;
    white-space: nowrap;
}

.openbg {
    background: #f1f3f8 !important;
}

.qty-pill {
    background: #ffffff;
    border: 1px solid #ebeff3;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 500;
    color: #666666;
    display: inline-block;
    min-width: 32px;
    text-align: center;
    white-space: nowrap;
}

.openbg {
    background: #f1f3f8 !important;
}



.qty-pill {
    display: inline-block;
    min-width: 32px;
    padding: 4px 10px;
    border: 1px solid #EBEEF0;
    border-radius: 6px;
    background: #ffffff;
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    color: #152935;
}

.qty-pill.openbg {
    background: #F1F3F8;
}

.qty-pill.pos {
    color: #1b8f3a;
    border-color: #C1E7BA;
    background: #ECF8F1;
}

.qty-pill.neg {
    color: #d32f2f;
    border-color: #FFCDCD;
    background: #FFEBEE;
}
</style>