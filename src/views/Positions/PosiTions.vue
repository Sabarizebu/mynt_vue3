<template>
    <div>
        <div class="mt-6 mb-6">
            <v-row>
                <v-col cols="12">
                    <v-card class="px-2 stat-card rounded-md d-inline-flex pt-2 pb-1 overflow-hidden" width="100%">
                        <v-list-item v-if="ordertab !== 'all'">
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">MTM</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(statposition.mtm) > 0 ? 'maingreen--text' : Number(statposition.mtm) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span id="poststatmtm">{{ statposition.mtm || '0.00' }}</span>
                                    </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle
                                    class="txt-5E6 mb-2 font-weight-medium">Profit/Loss</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(statposition.pnl) > 0 ? 'maingreen--text' : Number(statposition.pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span id="poststatpnl">{{ statposition.pnl || '0.00' }}</span>
                                    </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">Trade
                                    Value</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span id="poststatval">{{ statposition.tradeval || '0.00' }}</span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                            <v-list-item-content class="pt-0">
                                <v-list-item-subtitle class="txt-5E6 mb-2 font-weight-medium">Open
                                    Position</v-list-item-subtitle>
                                <v-list-item-title class="maintext--text font-weight-medium">
                                    <span
                                        :class="Number(statposition.oppnl) > 0 ? 'maingreen--text' : Number(statposition.oppnl) < 0 ? 'mainred--text' : 'subtext--text'">
                                        <span id="poststatopnl">{{ statposition.oppnl || '0.00' }}</span>
                                    </span>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                            <v-list-item-content class="pb-0">
                                <v-list-item-subtitle class="txt-5E6 mb-0 font-weight-medium">Trade
                                    Positions</v-list-item-subtitle>
                                <v-chip-group row>
                                    <v-chip class="mr-2 rounded-lg" color="secgreen" text-color="maingreen">
                                        <span class="caption" id="poststatP">{{ statposition.positive?.length || 0
                                        }}</span>&nbsp;Positive
                                    </v-chip>
                                    <v-chip height="16" class="mr-2 rounded-lg" color="secred" text-color="mainred">
                                        <span class="caption" id="poststatN">{{ statposition.negative?.length || 0
                                        }}</span>&nbsp;Negative
                                    </v-chip>
                                    <v-chip height="16" class="rounded-lg" color="card-bg" text-color="subtext">
                                        <span class="caption" id="poststatC">{{ statposition.close?.length || 0
                                        }}</span>&nbsp;Closed
                                    </v-chip>
                                </v-chip-group>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                </v-col>
            </v-row>

            <v-toolbar flat dense class="tool-sty pl-4 crd-trn my-6">
                <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="compact" @change="onTabChange">
                    <v-tab value="positions" class="font-weight-bold subtitle-1 mb-0 text-none">Positions ({{
                        positiondata.length || 0 }})</v-tab>
                    <v-tab value="all" class="font-weight-bold subtitle-1 mb-0 text-none">All Positions ({{
                        expositiondata.length || 0 }})</v-tab>
                    <!-- <v-tab value="group" class="font-weight-bold subtitle-1 mb-0 text-none">Group Positions</v-tab> -->
                </v-tabs>

                <v-spacer></v-spacer>
                <v-text-field v-if="ordertab !== 'group'" style="max-width: 220px;background-color: #F1F3F8;"
                    v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify" elevation="0" label="Search"
                    class="rounded-pill mr-4" density="comfortable" :bg-color="'secbg'" />

                <v-select v-if="ordertab !== 'group'" v-model="exchtype" :items="dashitems" item-title="txt"
                    item-value="val" density="comfortable" class="rounded-pill"
                    style="max-width: 150px;background-color: #F1F3F8;" :bg-color="'secbg'"
                    prepend-inner-icon="mdi-format-list-bulleted" hide-details label="Filter" />


                <v-btn v-if="ordertab === 'positions'" :disabled="!hasOpenPositions" @click="exitdialog = true"
                    class="elevation-0 rounded-pill font-weight-bold text-none ml-4" color="primary">Exit {{
                        posdselected.length === positiondata.length ? 'all' : posdselected.length > 0 ? posdselected.length
                            : 'all' }}</v-btn>
                <v-icon :disabled="loading || exloading" class="ml-3 cursor-p" @click="refresh" color="maintext"
                    size="24">mdi-reload</v-icon>
            </v-toolbar>

            <div v-if="ordertab === 'positions'" style="z-index: 0">
                <div style="overflow-x:auto;">
                    <v-data-table show-select v-model="posdselected" must-sort :item-value="'tokn'" :sort-by="['way']"
                        :sort-desc="[true]" :loading="loading" density="compact" mobile-breakpoint="900" fixed-header
                        height="480px" class="rounded-lg overflow-y-auto"
                        style="border-radius: 4px; border: 1px solid #EBEEF0; min-width:660px;"
                        :headers="positionHeaders" :hide-default-footer="true" :search="opensearch"
                        :items="filteredPositions" :items-per-page="-1"
                        @click:row="(event, { item }) => setPositionrowdata(item?.raw || item)">
                        <template v-slot:no-data>
                            <v-row justify="center" align="center" class="py-10">
                                <v-icon color="grey lighten-1" size="45">mdi-database-off</v-icon>
                                <div class="ml-4 caption txt-999">There are no positions here yet.</div>
                            </v-row>
                        </template>
                        <template v-slot:loading>
                            <v-skeleton-loader type="table" :loading="loading" class="mx-auto my-6"
                                style="max-width:90vw;" :height="44" />
                        </template>
                        <template #item.tsym="{ item }">
                            <template v-if="item && item.tsym">
                                <v-tooltip open-delay="250" location="bottom">
                                    <template #activator="{ props }">
                                        <span class="ellipsis" v-bind="props"
                                            style="display:inline-block; max-width:140px;">
                                            {{ item.tsym }} <span class="subtext--text fs-10">{{ item.exch }}</span>
                                        </span>
                                    </template>
                                    <span>{{ item.tsym }}<span v-if="item.exch"> ({{ item.exch }})</span></span>
                                </v-tooltip>
                            </template>
                            <span v-else class="ellipsis" style="display:inline-block; max-width:140px;">-</span>
                        </template>
                        <template #item.actions="{ item }">
                            <div v-if="item" class="d-flex" style="gap:6px; justify-content:flex-end;">
                                <v-btn v-if="item && item.way === 'open'"
                                    @click.stop="setSSDtab('exit-order', item.token, item.exch, item.tsym, item.netqty < 0 ? 'b' : 's', item)"
                                    size="x-small" variant="tonal" icon>
                                    <v-icon size="18">mdi-close</v-icon>
                                </v-btn>
                                <v-btn v-if="item && item.way === 'open'" @click.stop="setPosConvert(item)"
                                    size="x-small" variant="tonal" icon>
                                    <v-icon size="18">mdi-autorenew</v-icon>
                                </v-btn>
                            </div>
                        </template>
                    </v-data-table>
                </div>
            </div>

            <div v-else-if="ordertab === 'all'">
                <div style="overflow-x:auto;">
                    <v-data-table must-sort :item-value="'tokn'" :sort-by="['way']" :sort-desc="[true]"
                        :loading="exloading" :hide-default-footer="true" density="compact" mobile-breakpoint="900"
                        fixed-header height="480px" class="rounded-lg overflow-y-auto"
                        style="border-radius: 4px; border: 1px solid #EBEEF0; min-width:660px;"
                        :headers="expositionHeaders" :search="opensearch" :items="expositiondata" :items-per-page="-1">
                        <template v-slot:no-data>
                            <v-row justify="center" align="center" class="py-10">
                                <v-icon color="grey lighten-1" size="45">mdi-database-off</v-icon>
                                <div class="ml-4 caption txt-999">There are no exposures yet.</div>
                            </v-row>
                        </template>
                        <template v-slot:loading>
                            <v-skeleton-loader type="table" :loading="exloading" class="mx-auto my-6"
                                style="max-width:90vw;" :height="44" />
                        </template>
                    </v-data-table>
                </div>
            </div>
            <v-dialog v-model="exitdialog" max-width="400">
                <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                    <img :src="noDataImg" alt="icon" />
                    <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">
                        Do you want to <b>Square Off</b><br />
                        {{ posdselected.length === positiondata.length ? 'all' : posdselected.length > 0 ?
                            posdselected.length :
                            'all' }}
                        open Positions?
                    </p>
                    <v-row class="px-6" no-gluttters>
                        <v-col cols="6">
                            <v-btn :disabled="orderloader" @click="exitdialog = false" color="#F1F3F8"
                                class="rounded-pill text-none txt-666 font-weight-bold elevation-0" block
                                height="40px">Close</v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn :loading="orderloader" @click="setColseposition(0)" color="#000"
                                class="rounded-pill text-none white--text font-weight-bold elevation-0" block
                                height="40px">Exit
                                Order</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

            <v-dialog v-model="convertdialog" max-width="480px">
                <v-card class="pb-6 overflow-hidden" color="cardbg">
                    <v-card class="elevation-0 py-4" color="secbg">
                        <v-toolbar class="nav-drawer elevation-0 px-2 crd-trn" dense>
                            <v-list-item class="px-0">
                                <v-list-item-content>
                                    <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-2">{{
                                        singledata?.tsym || ''
                                    }}<span class="ml-1 subtext--text fs-10">{{ singledata?.exch || ''
                                        }}</span></v-list-item-title>
                                    <v-list-item-title class="maintext--text font-weight-bold fs-14 mb-1">{{
                                        singledata?.ltp ||
                                        '0.00' }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-spacer></v-spacer>
                            <v-btn :disabled="convertloader" @click="convertdialog = false; singledata = {}" small icon>
                                <v-icon color="maintext">mdi-close</v-icon>
                            </v-btn>
                        </v-toolbar>
                        <v-progress-linear v-if="convertloader" indeterminate></v-progress-linear>
                    </v-card>
                    <div class="px-6 pt-4 pb-2">
                        <p class="font-weight-bold fs-16">Position Conversion</p>
                        <v-row no-glutters>
                            <v-col cols="5" class="pb-0">
                                <p class="font-weight-bold fs-14 mb-2">Convert from</p>
                                <v-text-field readonly dense v-model="singledata.s_prdt_ali" background-color="secbg"
                                    flat class="rounded-pill" solo></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pa-0"></v-col>
                            <v-col cols="5" class="pb-0">
                                <p class="font-weight-bold fs-14 mb-2">Converting to</p>
                                <v-select dense v-model="convtype"
                                    :items="[singledata.s_prdt_ali !== 'MIS' || singledata.s_prdt_ali === 'NRML' ? 'MIS' : (singledata.exch === 'NSE' || singledata.exch === 'BSE') ? 'CNC' : 'NRML']"
                                    append-icon="mdi-chevron-down" background-color="secbg" flat class="rounded-pill"
                                    solo></v-select>
                            </v-col>
                            <v-col cols="5" class="py-0">
                                <p class="font-weight-bold fs-14 mb-2">Total Qty</p>
                                <v-text-field readonly dense background-color="secbg" :value="singledata.defaultqty"
                                    flat class="rounded-pill" solo></v-text-field>
                            </v-col>
                            <v-col cols="2" class="pa-0"></v-col>
                            <v-col cols="5" class="py-0">
                                <p class="font-weight-bold fs-14 mb-2">Converting Qty</p>
                                <v-text-field dense background-color="secbg" v-model.number="convqty"
                                    :placeholder="singledata.netqty" flat class="rounded-pill" solo type="number"
                                    min="1" :max="singledata.defaultqty"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn @click="setPosConvert()"
                            :disabled="!(convqty > 0 && convqty <= singledata.defaultqty && convtype)"
                            :loading="convertloader" color="btnclr"
                            class="text-none rounded-pill elevation-0 btntext--text px-10 mt-4 float-right"
                            height="40px">Convert</v-btn>
                    </div>
                </v-card>
            </v-dialog>
            <v-navigation-drawer v-model="positiondrawer" temporary location="right" :scrim="true" width="360"
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
                                <v-btn :disabled="orderloader"
                                    @click="setSSDtab('exit-order', singledata.token, singledata.exch, singledata.tsym, singledata.netqty < 0 ? 'b' : 's', singledata)"
                                    class="rounded-pill text-none font-weight-bold" block height="40px" outlined>
                                    <v-icon size="20">mdi-close</v-icon> Exit
                                </v-btn>
                            </v-col>
                            <v-col cols="6">
                                <v-btn :disabled="convertloader" @click="setPosConvert(singledata)"
                                    class="rounded-pill text-none font-weight-bold" block height="40px" outlined>
                                    <v-icon size="20">mdi-autorenew</v-icon> Conversion
                                </v-btn>
                            </v-col>
                        </v-row>
                    </div>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Quantity <p
                            class="float-right mb-0">
                            <v-chip small
                                :color="singledata.netqty > 0 ? 'secgreen' : singledata.netqty < 0 ? 'secred' : 'secbg'"
                                :text-color="singledata.netqty > 0 ? 'maingreen' : singledata.netqty < 0 ? 'mainred' : 'subtext'"
                                :style="`border: 1px solid ${singledata.netqty > 0 ? '#C1E7BA' : singledata.netqty < 0 ? '#FFCDCD' : '#DDD'}; border-radius: 5px; padding: 10px 8px !important;`">
                                <span class="font-weight-medium fs-12">{{ singledata.netqty > 0 ? `+${singledata.netqty
                                    /
                                    (singledata.exch === 'MCX' ? singledata.ls : 1)}` : singledata.netqty < 0 ?
                                    `${singledata.netqty / (singledata.exch === 'MCX' ? singledata.ls : 1)}` : '0'
                                        }}</span>
                            </v-chip>
                        </p></v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Avg price <p
                            class="float-right mb-0">{{
                                singledata.avgprc ? singledata.avgprc.toLocaleString() : '0.00' }}</p></v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Net Avg price <p
                            class="float-right mb-0">
                            {{ (singledata.NetAvgPrc ?? singledata.netavgprc) ? (singledata.NetAvgPrc ??
                                singledata.netavgprc).toLocaleString() : '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Upload price <p
                            class="float-right mb-0">
                            {{ singledata.upldprc ? singledata.upldprc.toLocaleString() : '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Netupload price <p
                            class="float-right mb-0">{{ singledata.netupldprc ? singledata.netupldprc.toLocaleString() :
                                '0.00' }}
                        </p></v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Last trade price <p
                            class="float-right mb-0">{{ singledata.ltp || '0.00' }}</p></v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Product <p
                            class="float-right mb-0">
                            {{ singledata.prd ? (singledata.prd === 'I' ? 'INTRADAY'
                                : singledata.prd === 'C' ?
                                    'DELIVERY'
                                    : 'CARRY FORWARD') : ''
                            }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Order type <p
                            class="float-right mb-0">{{
                                singledata.s_prdt_ali || '-' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day buy Qty <p
                            class="float-right mb-0">{{
                                singledata.daybuyqty ? (singledata.daybuyqty / (singledata.exch === 'MCX' ? singledata.ls :
                                    1)) : '0' }}
                        </p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day sell Qty <p
                            class="float-right mb-0">
                            {{ singledata.daysellqty ? (singledata.daysellqty / (singledata.exch === 'MCX' ?
                                singledata.ls : 1)) :
                                '0' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day buy Avg <p
                            class="float-right mb-0">{{
                                singledata.daybuyavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day sell Avg <p
                            class="float-right mb-0">
                            {{ singledata.daysellavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day Avg price <p
                            class="float-right mb-0">
                            {{ singledata.dayavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day buy Amt <p
                            class="float-right mb-0">{{
                                singledata.daybuyamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Day sell Amt <p
                            class="float-right mb-0">
                            {{ singledata.daysellamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF buy Qty <p
                            class="float-right mb-0">{{
                                singledata.cfbuyqty ? (singledata.cfbuyqty / (singledata.exch === 'MCX' ? singledata.ls :
                                    1)) : '0' }}
                        </p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF sell Qty <p
                            class="float-right mb-0">{{
                                singledata.cfsellqty ? (singledata.cfsellqty / (singledata.exch === 'MCX' ? singledata.ls :
                                    1)) : '0' }}
                        </p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF buy Avg <p
                            class="float-right mb-0">{{
                                singledata.cfbuyavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF sell Avg <p
                            class="float-right mb-0">{{
                                singledata.cfsellavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF buy Amt <p
                            class="float-right mb-0">{{
                                singledata.cfbuyamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">CF sell Amt <p
                            class="float-right mb-0">{{
                                singledata.cfsellamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open buy Qty <p
                            class="float-right mb-0">
                            {{ singledata.openbuyqty ? (singledata.openbuyqty / (singledata.exch === 'MCX' ?
                                singledata.ls : 1)) :
                                '0' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open sell Qty <p
                            class="float-right mb-0">
                            {{ singledata.opensellqty ? (singledata.opensellqty / (singledata.exch === 'MCX' ?
                                singledata.ls : 1)) :
                                '0' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open buy Avg <p
                            class="float-right mb-0">
                            {{ singledata.openbuyavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open sell Avg <p
                            class="float-right mb-0">
                            {{ singledata.opensellavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open buy Amt <p
                            class="float-right mb-0">
                            {{ singledata.openbuyamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Open sell Amt <p
                            class="float-right mb-0">
                            {{ singledata.opensellamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Total buy Avg <p
                            class="float-right mb-0">
                            {{ singledata.totbuyavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Total sell Avg <p
                            class="float-right mb-0">{{ singledata.totsellavgprc || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Total buy Amt <p
                            class="float-right mb-0">
                            {{ singledata.totbuyamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="maintext--text font-weight-bold fs-14 py-4">Total sell Amt <p
                            class="float-right mb-0">{{ singledata.totsellamt || '0.00' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                </div>
                <template v-slot:append>
                    <v-divider></v-divider>
                    <div class="pa-4">
                        <v-btn block color="primary" variant="tonal" class="text-none" @click="positiondrawer = false">
                            Close
                        </v-btn>
                    </div>
                </template>
            </v-navigation-drawer>


        </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getMPosotion, getEXPosition, getMPosotionCon, getPlaceOrder, getQuotesdata, getPostPnL } from '@/components/mixins/getAPIdata'
import noDataImg from '@/assets/no data folder.svg'
import * as echarts from 'echarts'

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
                console.log('Loaded cached positions')
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
                console.log('Loaded cached exposures')
            }
        }
    } catch (e) { }
}

// Watch for group change, fetch & render chart data
watch(liveposgrp, async (newVal) => {
    if (!newVal || !postgroups.value[newVal]) return
    try {
        const tysms = postgroups.value[newVal].tysm
        const result = await getPostPnL(tysms)
        if (result && Array.isArray(result.mtm)) {
            chartData.value.x = result.mtm.map(d => new Date(d.name).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            chartData.value.y = result.mtm.map(d => d.value)
            renderEChart()
        }
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
    { key: 'netupldprc', text: 'Act Avg Price', align: 'right' },
    { key: 'ltp', text: 'LTP', align: 'right' },
    { key: 'rpnl', text: 'P&L', align: 'right' },
    { key: 'avgprc', text: 'Avg Price', align: 'right' },
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
    { key: 'avgprc', text: 'Avg Price', align: 'right' },
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

// Enable Exit button iff there is at least one open row in the current dataset
const hasOpenPositions = computed(() => {
    try {
        // Enable if user selected at least one row (even if later filtered to open-only in the flow)
        if (posdselected.value && posdselected.value.length > 0) return true
        // Or if there is any open position in the current dataset
        return (positiondata.value || []).some(p => p && p.way === 'open' && Number(p.netqty) !== 0)
    } catch (_) { return false }
})

const searchedPositions = computed(() => {
    const base = filteredPositions.value || []
    return base.filter(item => includeSearch(item, positionFilterKeys, opensearch.value))
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

function setSSDtab(type, token, exch, tsym, trans, item) {
    if (type === 'exit-order') {
        // placeholder hook for future order dialog integration
        // open confirm dialog prefilled with selection
        exitdialog.value = true
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
    console.log('settempDatas -> counts', {
        close: closeposition.value.length,
        open: openposition.value.length,
        all: positiondata.value.length
    })
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
    const data = await getMPosotion(true)
    if (data && (data.a?.length || data.o?.length || data.c?.length)) {
        settempDatas(data)
    } else {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : data)
    }
    loading.value = false
}

async function getexPositionbook() {
    exloading.value = true
    const data = await getEXPosition()
    expositiondata.value = []
    if (data && data.length > 0) {
        for (let q = 0; q < data.length; q++) {
            const d = data[q]
            d.idx = q
            d.way = Number(d.netqty) === 0 ? 'close' : 'open'
            d.disabled = d.way === 'open' ? false : null
            d.avgprc = d.NetAvgPrc
            d.tokn = `${d.token}_${q}`
        }
        expositiondata.value = [...data]
        updateExpoHeaders()
        const event = new CustomEvent('web-scoketOn', { detail: { flow: 'sub', data: expositiondata.value, is: 'pos', page: 'position' } })
        window.dispatchEvent(event)
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : data)
    }
    // Only recompute stats if the "All Positions" tab is active
    if (ordertab.value === 'all') computeStats()
    saveCacheExposures()
    exloading.value = false
}

function selectAllToggle() {
    // keep legacy helper but make it a no-op; v-data-table handles select all
    posdselected.value = [...posdselected.value]
}

function setColseposition(i) {
    orderloader.value = true
    const open = positiondata.value.filter(p => p.way === 'open')
    // prioritize explicit selection from table
    const selected = (posdselected.value || []).filter(p => p.way === 'open')
    const queue = selected.length ? selected : open
    if (i <= queue.length - 1) {
        setPlaceorder(i, queue[i])
    } else {
        appStore.showSnackbar(1, 'All your open positions have been Squared off.')
        orderloader.value = false
        exitdialog.value = false
        positiondata.value.forEach(p => (p.disabled = false))
        posdselected.value = []
    }
}

async function setPlaceorder(i, raw) {
    try {
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
        const frz = Math.floor(Number(raw.frzqty) / Number(raw.ls || 1)) * Number(raw.ls || 1)
        const qty = Number(item.qty)
        const frzqty = frz || qty
        const fullOrders = Math.floor(qty / frzqty)
        const remainingQty = qty % frzqty
        for (let k = 0; k < fullOrders; k++) {
            item.qty = frzqty.toString()
            data = await getPlaceOrder(item)
        }
        if (remainingQty > 0 || qty < frzqty) {
            item.qty = (remainingQty || qty).toString()
            data = await getPlaceOrder(item)
        }
        if (data.stat !== 'Ok') {
            appStore.showSnackbar(2, data && data.emsg ? data.emsg : data)
            orderloader.value = false
            return
        }
        setTimeout(() => setColseposition(i + 1), 100)
    } catch (e) {
        orderloader.value = false
        appStore.showSnackbar(2, 'Failed to place exit order')
    }
}

async function setPosConvert(item) {
    if (item) {
        singledata.value = { ...item }
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
    positiondrawer.value = true
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

// Sync table selection with our legacy `disabled` flags for open positions
// Also update drawer when a single item is selected
watch(posdselected, (sel) => {
    try {
        const selectedTokns = new Set((sel || []).map((i) => i?.tokn || i))
        positiondata.value.forEach((p) => {
            if (p.way === 'open') {
                p.disabled = selectedTokns.has(p.tokn)
            }
        })
        // If a single item is selected, update the drawer with full position data
        if (sel && sel.length === 1) {
            const selectedItem = sel[0]
            const toknToFind = selectedItem?.tokn || selectedItem
            const foundItem = positiondata.value.find(p => p.tokn === toknToFind)
            if (foundItem) {
                singledata.value = { ...foundItem }
                positiondrawer.value = true
            }
        }
    } catch (e) {
        // no-op; defensive guard
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
    window.addEventListener('resize', resizeChart)
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('web-scoketConn', onWebSocketConn)
    window.removeEventListener('tempdata-update', onTempDataUpdate)
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
</style>
