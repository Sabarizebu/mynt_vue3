<template>
    <div>
        <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
            <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="compact"
                @update:model-value="onTabChange">
                <v-tab value="orders" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Open Orders ({{ filteredOpen.length }})
                </v-tab>
                <v-tab value="executed" class="font-weight-bold subtitle-1 mb-0 text-none">
                    Executed Orders ({{ filteredExec.length }})
                </v-tab>
            </v-tabs>
            <v-spacer></v-spacer>
            <v-text-field v-if="ordertab === 'orders'" style="max-width: 220px" v-model="opensearch" hide-details
                prepend-inner-icon="mdi-magnify" label="Search for Stocks" class="rounded-pill mr-4" variant="solo"
                density="comfortable" :bg-color="'secbg'" />
            <v-select v-if="ordertab === 'orders'" style="max-width: 180px" v-model="filter" hide-details
                append-icon="mdi-chevron-down" prepend-inner-icon="mdi-playlist-check" class="rounded-pill mr-2"
                variant="solo" density="comfortable" :bg-color="'secbg'" :items="filterso" item-title="title"
                item-value="value" @update:model-value="filtercount = 0" />
            <v-select v-else style="max-width: 180px" v-model="filter" hide-details append-icon="mdi-chevron-down"
                prepend-inner-icon="mdi-playlist-check" class="rounded-pill mr-2" variant="solo" density="comfortable"
                :bg-color="'secbg'" :items="filterse" item-title="title" item-value="value"
                @update:model-value="filtercount = 0" />
            <v-btn v-if="ordertab === 'orders'" :disabled="!openorders.length" @click="openCancelDialog('all')"
                class="elevation-0 rounded-pill font-weight-bold text-none ml-2" color="primary">
                Cancel {{ orddselected.length === openorders.length ? 'all' : orddselected.length > 0 ?
                    orddselected.length : 'all' }}
            </v-btn>
            <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext"
                size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table v-if="ordertab === 'orders'" v-model="orddselected" :headers="orderheader"
            :items="filteredOpenSorted" :loading="loading" fixed-header :hide-default-footer="true" :items-per-page="-1"
            class="mt-3 rounded-lg overflow-y-auto" style="border-radius: 4px; border: 1px solid var(--outline)"
            height="480" item-key="norenordno" show-select @click:row="(_, { item }) => setOrderrowdata(item)">
            <template #item.norentm="{ item }">
                <span class="font-weight-medium maintext--text">{{ timeStr(item.norentm) }}</span>
            </template>
            <template #item.trantype="{ item }">
                <v-chip small :color="item.trantype === 'B' ? 'secgreen' : 'secred'"
                    :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                    :style="`border: 1px solid ${item.trantype === 'B' ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;`">
                    <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                </v-chip>
            </template>
            <template #item.tsym="{ item }">
                <div class="pos-rlt">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exchs || item.exch || '' }}</span>
                    </p>
                    <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                        <v-btn
                            v-if="item.status !== 'COMPLETE' && item.status !== 'CANCELED' && item.status !== 'REJECTED'"
                            @click="onModify(item)" style="border: 1px solid var(--outline)" min-width="20px"
                            color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-pen</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="item.status !== 'COMPLETE' && item.status !== 'CANCELED' && item.status !== 'REJECTED'"
                            @click="openCancelDialog(item)" style="border: 1px solid var(--outline)" min-width="20px"
                            color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-close-circle-outline</v-icon>
                        </v-btn>
                        <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                        </v-btn>
                        <v-btn
                            @click="setSSDtab('order', item.token, item.exch, item.tsym, item.trantype.toLowerCase(), item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-autorenew</v-icon>
                        </v-btn>
                        <v-menu close-on-click :location="'bottom'" class="table-menu">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" style="border: 1px solid var(--outline)" min-width="20px"
                                    color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                                    size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <v-list density="compact">
                                    <div v-for="(m, k) in menulist.open" :key="k">
                                        <v-list-item
                                            @click="m.type === 'cancel' ? openCancelDialog(item) : m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, m.trans || item.trantype?.toLowerCase(), item) : setOrderrowdata(item)"
                                            class="pl-3 pr-6">
                                            <template #prepend>
                                                <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                    color="#506D84" />
                                                <img v-else-if="m.icon > 2" width="20px" class="pl-1"
                                                    :src="require(`@/assets/orderbook/${m.icon}.svg`)" />
                                            </template>
                                            <v-list-item-title class="subline--text font-weight-medium fs-14">{{
                                                m.name }}</v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                    </div>
                                </v-list>
                            </v-card>
                        </v-menu>
                    </div>
                </div>
            </template>
            <template #item.s_prdt_ali="{ item }">
                <v-chip v-if="item.s_prdt_ali" small class="table-hov-prd" text-color="subtext"
                    style="border-radius: 5px; padding: 10px 8px !important">
                    <span class="font-weight-medium fs-12">{{ item.s_prdt_ali }}</span>
                </v-chip>
                <v-chip v-else-if="item.ordersource === 'ESIP'" small class="table-hov-prd" text-color="subtext"
                    style="border-radius: 5px; padding: 10px 8px !important">
                    <span class="font-weight-medium fs-12">{{ item.ordersource }}</span>
                </v-chip>
            </template>
            <template #item.qty="{ item }">
                <p class="font-weight-medium maintext--text mb-0">
                    {{ item.fillshares && Number(item.fillshares) > 0 ? `${item.fillshares / (item.exch === 'MCX' ?
                        item.ls : 1)}/` : '' }}{{ item.qty ? (item.qty / (item.exch === 'MCX' ? item.ls : 1)) : '0' }}
                </p>
            </template>
            <template #item.rprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.avgprc || item.rprc) }}</p>
            </template>
            <template #item.ltp="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">
                    <span :id="`ord${item.idx || item.norenordno}|${item.token}ltp`">{{ fmt(item.ltp) }}</span>
                </p>
            </template>
            <template #item.prc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.prc) }}</p>
            </template>
            <template #item.trgprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.trgprc) }}</p>
            </template>
            <template #item.value="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.value) }}</p>
            </template>
            <template #item.status="{ item }">
                <div class="ws-p font-weight-medium maintext--text align-center">
                    <v-tooltip location="top" color="black">
                        <template #activator="{ props }">
                            <div v-bind="props" class="d-inline-flex">
                                <svg v-if="item.status === 'COMPLETE'" xmlns="http://www.w3.org/2000/svg" width="20"
                                    height="15" viewBox="0 0 20 15" fill="none">
                                    <rect width="20" height="15" rx="7" fill="#2DB266" />
                                    <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg v-else-if="item.status === 'CANCELED' || item.status === 'REJECTED'"
                                    xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"
                                    fill="none">
                                    <rect width="20" height="15" rx="7" fill="#DC2626" />
                                    <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="12"
                                    viewBox="0 0 17 12" fill="none">
                                    <path
                                        d="M0.941406 6C0.941406 2.68629 3.6277 0 6.94141 0H10.9416C14.2553 0 16.9416 2.68629 16.9416 6C16.9416 9.31371 14.2553 12 10.9416 12H6.9414C3.62769 12 0.941406 9.31371 0.941406 6Z"
                                        fill="#FFB038" />
                                    <path
                                        d="M5.19143 7C5.74373 7 6.19145 6.55228 6.19145 6C6.19145 5.44772 5.74373 5 5.19143 5C4.63914 5 4.19142 5.44772 4.19142 6C4.19142 6.55228 4.63914 7 5.19143 7Z"
                                        fill="white" />
                                    <path
                                        d="M9.19149 7C9.74378 7 10.1915 6.55228 10.1915 6C10.1915 5.44772 9.74378 5 9.19149 5C8.63919 5 8.19147 5.44772 8.19147 6C8.19147 6.55228 8.63919 7 9.19149 7Z"
                                        fill="white" />
                                    <path
                                        d="M13.1915 7C13.7438 7 14.1915 6.55228 14.1915 6C14.1915 5.44772 13.7438 5 13.1915 5C12.6392 5 12.1915 5.44772 12.1915 6C12.1915 6.55228 12.6392 7 13.1915 7Z"
                                        fill="white" />
                                </svg>
                                {{ item.status || '' }}
                            </div>
                        </template>
                        <span>{{ item.rejreason || item.st_intrn || '' }}</span>
                    </v-tooltip>
                </div>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImg" />
                        <h4 class="subtext--text font-weight-regular caption">
                            There is no Open order <br />data here yet!
                        </h4>
                    </div>
                </div>
            </template>
        </v-data-table>

        <v-data-table v-else :headers="orderheader" :items="filteredExecSorted" :loading="loading" fixed-header
            :hide-default-footer="true" :items-per-page="-1" class="mt-3 rounded-lg overflow-y-auto"
            style="border-radius: 4px; border: 1px solid var(--outline)" height="480"
            @click:row="(_, { item }) => setOrderrowdata(item)">
            <template #item.norentm="{ item }">
                <span class="font-weight-medium maintext--text">{{ timeStr(item.norentm) }}</span>
            </template>
            <template #item.trantype="{ item }">
                <v-chip small :color="item.trantype === 'B' ? 'secgreen' : 'secred'"
                    :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                    :style="`border: 1px solid ${item.trantype === 'B' ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;`">
                    <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                </v-chip>
            </template>
            <template #item.tsym="{ item }">
                <div class="pos-rlt">
                    <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4">
                        {{ item.tsym || '' }}
                        <span class="ml-1 subtext--text fs-10">{{ item.exchs || item.exch || '' }}</span>
                    </p>
                    <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                        <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)" min-width="20px"
                            color="maingreen" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            B </v-btn>
                        <v-btn @click="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)" min-width="20px"
                            color="mainred" class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small"> S
                        </v-btn>
                        <v-btn @click="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                        </v-btn>
                        <v-btn
                            @click="setSSDtab('order', item.token, item.exch, item.tsym, item.trantype?.toLowerCase(), item)"
                            style="border: 1px solid var(--outline)" min-width="20px" color="mainbg"
                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                            <v-icon size="18" color="maintext">mdi-autorenew</v-icon>
                        </v-btn>
                        <v-menu close-on-click :location="'bottom'" class="table-menu">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" style="border: 1px solid var(--outline)" min-width="20px"
                                    color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                                    size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <v-list density="compact">
                                    <div v-for="(m, k) in menulist.exec" :key="k">
                                        <v-list-item
                                            @click="m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, m.trans || item.trantype?.toLowerCase(), item) : setOrderrowdata(item)"
                                            class="pl-3 pr-6">
                                            <template #prepend>
                                                <v-icon v-if="typeof m.icon === 'string'" :icon="m.icon" size="20"
                                                    color="#506D84" />
                                                <img v-else-if="m.icon > 2" width="20px" class="pl-1"
                                                    :src="require(`@/assets/orderbook/${m.icon}.svg`)" />
                                            </template>
                                            <v-list-item-title class="subline--text font-weight-medium fs-14">{{
                                                m.name }}</v-list-item-title>
                                        </v-list-item>
                                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                    </div>
                                </v-list>
                            </v-card>
                        </v-menu>
                    </div>
                </div>
            </template>
            <template #item.s_prdt_ali="{ item }">
                <v-chip v-if="item.s_prdt_ali" small class="table-hov-prd" text-color="subtext"
                    style="border-radius: 5px; padding: 10px 8px !important">
                    <span class="font-weight-medium fs-12">{{ item.s_prdt_ali }}</span>
                </v-chip>
            </template>
            <template #item.qty="{ item }">
                <p class="font-weight-medium maintext--text mb-0">{{ item.fillshares && Number(item.fillshares) > 0 ?
                    `${item.fillshares / (item.exch === 'MCX' ? item.ls : 1)}/` : '' }}{{ item.qty ? (item.qty /
                        (item.exch === 'MCX' ? item.ls : 1)) : '0' }}</p>
            </template>
            <template #item.rprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.avgprc || item.rprc) }}</p>
            </template>
            <template #item.ltp="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.ltp) }}</p>
            </template>
            <template #item.prc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.prc) }}</p>
            </template>
            <template #item.trgprc="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.trgprc) }}</p>
            </template>
            <template #item.value="{ item }">
                <p class="text-right font-weight-medium maintext--text mb-0">{{ fmt(item.value) }}</p>
            </template>
            <template #item.status="{ item }">
                <div class="ws-p font-weight-medium maintext--text align-center">
                    <svg v-if="item.status === 'COMPLETE'" xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                        viewBox="0 0 20 15" fill="none">
                        <rect width="20" height="15" rx="7" fill="#2DB266" />
                        <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else-if="item.status === 'CANCELED' || item.status === 'REJECTED'"
                        xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15" fill="none">
                        <rect width="20" height="15" rx="7" fill="#DC2626" />
                        <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    {{ item.status || '' }}
                </div>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImg" />
                        <h4 class="subtext--text font-weight-regular caption">
                            There is no Executed order <br />data here yet!
                        </h4>
                    </div>
                </div>
            </template>
        </v-data-table>

        <!-- Order Details Drawer -->
        <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="true" width="360" color="cardbg"
            class="pt-2">
            <template v-slot:prepend>
                <v-toolbar class="nav-drawer crd-trn" density="comfortable">
                    <v-btn icon variant="text" density="comfortable" @click="orderdrawer = false" color="maintext"
                        size="20">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>

            <div v-if="singledata">
                <v-list-item class="pt-3 pb-0">
                    <v-list-item-title class="font-weight-medium maintext--text mb-3">
                        {{ singledata.tsym || '' }}
                        <span class="ml-1 txt-999 fs-10">{{ singledata.exch || '' }}</span>
                    </v-list-item-title>
                    <v-list-item-title class="txt-000 font-weight-medium fs-16 mb-1">₹{{ fmt(singledata.raw?.lp ||
                        singledata.ltp)
                    }}</v-list-item-title>
                    <v-list-item-title
                        :class="singledata.rpnl > 0 ? 'maingreen--text' : singledata.rpnl < 0 ? 'mainred--text' : 'subtext--text'"
                        class="font-weight-medium fs-12">
                        {{ fmt(singledata.rpnl) }} ({{ fmt(singledata.pnlc) }}%)
                    </v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item class="pt-3 pb-0">
                    <v-list-item-subtitle class="subtext--text font-weight-medium fs-13 mb-1">Order
                        Id</v-list-item-subtitle>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14">
                        {{ singledata.norenordno }}
                        <p class="float-right mb-0">
                            <svg v-if="singledata.status === 'COMPLETE'" xmlns="http://www.w3.org/2000/svg" width="20"
                                height="15" viewBox="0 0 20 15" fill="none">
                                <rect width="20" height="15" rx="7" fill="#2DB266" />
                                <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white" stroke-width="1.2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <svg v-else-if="singledata.status === 'CANCELED' || singledata.status === 'REJECTED'"
                                xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15"
                                fill="none">
                                <rect width="20" height="15" rx="7" fill="#DC2626" />
                                <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="17" height="12" viewBox="0 0 17 12"
                                fill="none">
                                <path
                                    d="M0.941406 6C0.941406 2.68629 3.6277 0 6.94141 0H10.9416C14.2553 0 16.9416 2.68629 16.9416 6C16.9416 9.31371 14.2553 12 10.9416 12H6.9414C3.62769 12 0.941406 9.31371 0.941406 6Z"
                                    fill="#FFB038" />
                                <path
                                    d="M5.19143 7C5.74373 7 6.19145 6.55228 6.19145 6C6.19145 5.44772 5.74373 5 5.19143 5C4.63914 5 4.19142 5.44772 4.19142 6C4.19142 6.55228 4.63914 7 5.19143 7Z"
                                    fill="white" />
                                <path
                                    d="M9.19149 7C9.74378 7 10.1915 6.55228 10.1915 6C10.1915 5.44772 9.74378 5 9.19149 5C8.63919 5 8.19147 5.44772 8.19147 6C8.19147 6.55228 8.63919 7 9.19149 7Z"
                                    fill="white" />
                                <path
                                    d="M13.1915 7C13.7438 7 14.1915 6.55228 14.1915 6C14.1915 5.44772 13.7438 5 13.1915 5C12.6392 5 12.1915 5.44772 12.1915 6C12.1915 6.55228 12.6392 7 13.1915 7Z"
                                    fill="white" />
                            </svg>
                            {{ singledata.status || '' }}
                        </p>
                    </v-list-item-title>
                </v-list-item>

                <div class="px-4 pb-6">
                    <v-btn
                        v-if="singledata.status === 'COMPLETE' || singledata.status === 'CANCELED' || singledata.status === 'REJECTED'"
                        @click="setSSDtab('order', singledata.token, singledata.exch, singledata.tsym, singledata.trantype?.toLowerCase(), singledata)"
                        class="rounded-pill text-none font-weight-bold" block height="40" variant="tonal">Place New
                        order</v-btn>
                    <v-row v-else>
                        <v-col cols="6">
                            <v-btn @click="onModify(singledata)" class="rounded-pill text-none font-weight-bold" block
                                height="40" variant="tonal">Modify Order</v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn @click="orderdrawer = false; openCancelDialog(singledata)"
                                class="rounded-pill text-none font-weight-bold" block height="40" variant="tonal">{{
                                    singledata.exord ? 'Exit' : 'Cancel' }}Order </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <v-divider class="pt-1"></v-divider>
                <div v-if="singledata.status !== 'COMPLETE'">
                    <div class="py-3 px-4">
                        <p class="subtext--text font-weight-medium fs-13 mb-1">Rejected reason</p>
                        <p class="error--text font-weight-bold fs-14 mb-0">{{ singledata.rejreason || '-' }}</p>
                    </div>
                    <v-divider></v-divider>
                </div>
                <div class="px-4 pt-1">
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Quantity
                        <p class="float-right mb-0">{{ singledata.qty ? (singledata.qty / (singledata.exch === 'MCX' ?
                            singledata.ls
                            : 1)) : '0' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Price
                        <p class="float-right mb-0">₹{{ fmt(singledata.prc) }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Avg price
                        <p class="float-right mb-0">₹{{ fmt(singledata.rprc || singledata.avgprc) }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Trigger price
                        <p class="float-right mb-0">₹{{ fmt(singledata.trgprc) }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Order type
                        <p class="float-right mb-0">{{ singledata.prctyp || '-' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Validity
                        <p class="float-right mb-0">{{ singledata.ret || '-' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Exch. Ord ID
                        <p class="float-right mb-0">{{ singledata.exchordid || '-' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Time
                        <p class="float-right mb-0">{{ timeStr(singledata.norentm) }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Exch time
                        <p class="float-right mb-0">{{ timeStr(singledata.norentm) }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Product
                        <p class="float-right mb-0">{{ singledata.s_prdt_ali || '-' }}</p>
                    </v-list-item-title>
                    <v-divider></v-divider>
                    <v-list-item-title class="txt-000 font-weight-bold fs-14 py-4">Place by
                        <p class="float-right mb-0">{{ singledata.uid || '-' }}</p>
                    </v-list-item-title>
                </div>
                <v-divider class="pt-1"></v-divider>
                <div class="px-4 pt-3 pb-4">
                    <v-btn @click="setSingleorderbook(singledata.norenordno)"
                        class="rounded-pill text-none font-weight-bold" block height="40"
                        variant="tonal"><v-icon>mdi-history</v-icon> Order history</v-btn>
                </div>
            </div>
        </v-navigation-drawer>

        <!-- Order History Dialog -->
        <v-dialog v-model="orderhistory" max-width="720" scrollable>
            <v-card class="rounded-xl elevation-0 py-4 overflow-hidden">
                <div class="px-6" v-if="orderhistorydata && orderhistorydata[0]">
                    <v-list-item-title class="font-weight-bold title maintext--text mb-0">Order history
                        <v-icon @click="orderhistory = false; orderhistorydata = []" class="float-right"
                            color="maintext">mdi-close</v-icon>
                    </v-list-item-title>
                    <v-divider class="mb-3"></v-divider>
                    <v-card class="elevation-0 py-2 mt-2 mb-3" color="secbg">
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">Order Number</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].norenordno || '-' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">User ID</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].actid || '-' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">Exchange</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].exch || '-' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">Product</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].prd === 'C' ? 'CNC' : orderhistorydata[0].prd === 'M' ? 'NRML' :
                                    'MIS' ||
                                    '-' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">Trading Symbol</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].tsym || '-' }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">PriceType</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold">{{
                                orderhistorydata[0].prctyp === 'MKT' ? 'Market' : orderhistorydata[0].prctyp === 'LMT' ?
                                    'LIMIT'
                                    : orderhistorydata[0].prctyp === 'SL-MKT' ? 'SL MARKET' : 'SL LIMIT' || '-'
                            }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item class="mb-1 maintext--text">
                            <v-list-item-title class="caption">Transaction Type</v-list-item-title>
                            <v-list-item-title class="subtitle-2 font-weight-bold"
                                :class="orderhistorydata[0].trantype === 'B' ? 'maingreen--text' : 'mainred--text'">{{
                                    orderhistorydata[0].trantype === 'B' ? 'BUY' : 'SELL' || '-' }}</v-list-item-title>
                        </v-list-item>
                    </v-card>

                    <v-card variant="outlined">
                        <v-data-table dense height="128" :headers="orderhistoryhead" :items="orderhistorydata"
                            :items-per-page="-1" class="elevation-0 rounded-lg" hide-default-footer>
                            <template #item.qty="{ item }">
                                <span>{{ item.qty / (item.exch === 'MCX' ? item.ls : 1) }}</span>
                            </template>
                        </v-data-table>
                    </v-card>
                    <v-row no-gutters class="mb-4 mt-2 px-2">
                        <v-col cols="4" class="pb-0">
                            <p class="mb-0 fs-14">Child ID :<span class="float-right">{{ orderhistorydata[0].kidid ||
                                '-'
                                    }}</span></p>
                        </v-col>
                        <v-col cols="4" class="pb-0">
                            <p class="mb-0 fs-14">Source :<span class="float-right">{{ orderhistorydata[0].ordersource
                                || '-'
                                    }}</span></p>
                        </v-col>
                        <v-col cols="4" class="pb-0">
                            <p class="mb-0 fs-14">Qty :<span class="float-right">{{ orderhistorydata[0].qty ?
                                (orderhistorydata[0].qty / (orderhistorydata[0].exch === 'MCX' ?
                                    orderhistorydata[0].ls :
                                    1)) : '-' }}</span></p>
                        </v-col>
                    </v-row>
                    <p class="font-weight-medium mb-1">Rejected reason</p>
                    <p class="mainred--text">{{ orderhistorydata[0].rejreason || '-' }}</p>
                </div>
            </v-card>
        </v-dialog>

        <!-- Cancel Dialog -->
        <v-dialog v-model="canceldialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">
                    Are you sure you want to<br />
                    {{ singledata === 'all' || (Array.isArray(singledata) && singledata.length === 0) ? 'cancel' :
                        singledata.exord ? 'exit' : 'cancel' }} <b>{{ singledata?.tsym || `${orddselected.length ===
                        openorders.length ? 'All Open' : 'Open'}` }} </b> {{ singledata?.exord ? 'position' : `order
                    (${singledata === 'all' ? openorders.length : orddselected.length})` }}?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6">
                        <v-btn @click="canceldialog = false; singledata = null" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="doCancel" color="btnclr"
                            class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block
                            height="40">{{
                                singledata?.exord ? 'Exit' : 'Yes' }}</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'
import { useAppStore } from '@/stores/appStore'
import { getMOrderbook, getSingleorderbook, getLtpdata } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const router = useRouter()

const loading = ref(false)
const ordertab = ref('orders')
const opensearch = ref('')
const filter = ref('All')
const filtercount = ref(0)
const orderdrawer = ref(false)
const canceldialog = ref(false)
const orderhistory = ref(false)
const singledata = ref({})
const orderhistorydata = ref(null)
const orddselected = ref([])
const openorders = ref([])
const execorders = ref([])
const orderbookdata = ref([])
const currentSort = ref({ column: 'norentm', desc: true })

const filterso = [
    { title: 'All', value: 'All' },
    { title: 'TRIGGER_PENDING', value: 'TRIGGER_PENDING' },
    { title: 'PENDING', value: 'PENDING' },
    { title: 'OPEN', value: 'OPEN' },
]

const filterse = [
    { title: 'All', value: 'All' },
    { title: 'COMPLETE', value: 'COMPLETE' },
    { title: 'REJECTED', value: 'REJECTED' },
    { title: 'CANCELED', value: 'CANCELED' },
]

const menulist = {
    open: [
        { name: 'Buy', icon: 'mdi-plus', type: 'order', trans: 'b' },
        { name: 'Sell', icon: 'mdi-minus', type: 'order', trans: 's', hr: true },
        { name: 'History', icon: 'mdi-history', type: 'his', hr: true },
        { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
        { name: 'Create Alert', icon: 5, type: 'alert' },
        { name: 'Market Depth', icon: 6, type: 'depth' },
        { name: 'Chart', icon: 7, type: 'chart', hr: true },
        { name: 'Fundamentals', icon: 9, type: 'Funda' },
        { name: 'Details', icon: 10, type: '' },
    ],
    exec: [
        { name: 'History', icon: 'mdi-history', type: 'his', hr: true },
        { name: 'Create GTT / GTC', icon: 4, type: 'cGTT' },
        { name: 'Create Alert', icon: 5, type: 'alert' },
        { name: 'Market Depth', icon: 6, type: 'depth' },
        { name: 'Chart', icon: 7, type: 'chart', hr: true },
        { name: 'Fundamentals', icon: 9, type: 'Funda' },
        { name: 'Details', icon: 10, type: '' },
    ],
}

const orderheader = [
    { title: 'Time', key: 'norentm', sortable: true },
    { title: 'Type', key: 'trantype', sortable: true },
    { title: 'Instrument', key: 'tsym', sortable: true },
    { title: 'Product', key: 's_prdt_ali', sortable: true },
    { title: 'Qty', key: 'qty', sortable: true, align: 'right' },
    { title: 'Avg price', key: 'rprc', sortable: true, align: 'right' },
    { title: 'LTP', key: 'ltp', sortable: true, align: 'right' },
    { title: 'Price', key: 'prc', sortable: true, align: 'right' },
    { title: 'Trigger price', key: 'trgprc', sortable: true, align: 'right' },
    { title: 'Order value', key: 'value', sortable: true, align: 'right' },
    { title: 'Status', key: 'status', sortable: false },
]

const orderhistoryhead = [
    { title: 'Date Time', key: 'norentm' },
    { title: 'Exch Time', key: 'exch' },
    { title: 'Price', key: 'prc' },
    { title: 'Pending Qty', key: 'qty' },
    { title: 'Status', key: 'status' },
    { title: 'Modified by', key: 'modifi' },
]

const filteredOpen = computed(() => {
    let list = openorders.value || []
    if (filter.value !== 'All') {
        list = list.filter(o => o.status === filter.value)
        filtercount.value = list.length
    } else {
        filtercount.value = 0
    }
    return list
})

const filteredExec = computed(() => {
    let list = execorders.value || []
    if (filter.value !== 'All') {
        list = list.filter(o => o.status === filter.value)
        filtercount.value = list.length
    } else {
        filtercount.value = 0
    }
    return list
})

const filteredOpenSorted = computed(() => {
    const list = [...filteredOpen.value]
    if (currentSort.value.column) {
        list.sort((a, b) => {
            const col = currentSort.value.column
            const dir = currentSort.value.desc ? -1 : 1
            if (col === 'norentm') {
                return dir * (a.norentm > b.norentm ? 1 : a.norentm < b.norentm ? -1 : 0)
            }
            const aVal = a[col]
            const bVal = b[col]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return dir * (aVal - bVal)
            }
            return dir * String(aVal || '').localeCompare(String(bVal || ''))
        })
    }
    return list
})

const filteredExecSorted = computed(() => {
    const list = [...filteredExec.value]
    if (currentSort.value.column) {
        list.sort((a, b) => {
            const col = currentSort.value.column
            const dir = currentSort.value.desc ? -1 : 1
            if (col === 'norentm') {
                return dir * (a.norentm > b.norentm ? 1 : a.norentm < b.norentm ? -1 : 0)
            }
            const aVal = a[col]
            const bVal = b[col]
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return dir * (aVal - bVal)
            }
            return dir * String(aVal || '').localeCompare(String(bVal || ''))
        })
    }
    return list
})

function fmt(v) {
    const n = Number(v)
    return isFinite(n) ? n.toFixed(2) : '0.00'
}

function timeStr(v) {
    if (!v) return '-'
    const s = String(v)
    if (s.includes(':')) return s.slice(0, 8)
    const num = Number(s)
    if (!isFinite(num)) return s
    const d = new Date(num)
    return isFinite(d.getTime()) ? d.toTimeString().slice(0, 8) : s
}

function setOrderPayload(payload) {
    const all = payload?.response || []
    orderbookdata.value = all
    openorders.value = payload?.openorders || all.filter(o => o.way === 'open')
    execorders.value = payload?.execorders || all.filter(o => o.way !== 'open')
    try {
        sessionStorage.setItem('orders_last', JSON.stringify(payload))
    } catch (e) { }
}

async function getOrderbook() {
    loading.value = true
    const data = await getMOrderbook(true)
    if (data && (Array.isArray(data.response) || Array.isArray(data.openorders))) {
        setOrderPayload(data)
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load orders')
    }
    loading.value = false
}

function onTabChange() {
    filter.value = 'All'
    filtercount.value = 0
}

function openCancelDialog(item) {
    singledata.value = item
    canceldialog.value = true
}

async function doCancel() {
    if (singledata.value === 'all' || orddselected.value.length === openorders.value.length) {
        // Cancel all selected
        for (let i = 0; i < orddselected.value.length; i++) {
            if (orddselected.value[i]) {
                window.dispatchEvent(new CustomEvent('menudialog', {
                    detail: {
                        type: 'cancel-order',
                        token: orddselected.value[i].token,
                        exch: orddselected.value[i].exch,
                        tsym: orddselected.value[i].tsym,
                        trantype: '',
                        item: orddselected.value[i]
                    }
                }))
            }
            if (i < orddselected.value.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }
        orddselected.value = []
    } else if (singledata.value && singledata.value.token) {
        // Cancel single order
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: {
                type: 'cancel-order',
                token: singledata.value.token,
                exch: singledata.value.exch,
                tsym: singledata.value.tsym,
                trantype: '',
                item: singledata.value
            }
        }))
    }
    canceldialog.value = false
    singledata.value = null
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'alert', token, exch, tsym } }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' } }))
    } else if (type === 'modify' || type === 'mod-order') {
        if (item.fillshares > 0 && item.qty !== item.fillshares) {
            item.qty = item.qty - item.fillshares
        }
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'mod-order', token, exch, tsym, trantype: trans?.toLowerCase(), item } }))
    } else if (type === 'order' || type === 're-order') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order', token, exch, tsym, trantype: trans, item } }))
    } else if (type === 'his') {
        setSingleorderbook(item.norenordno)
    } else {
        const path = [type, token, exch, tsym]
        router.push({ name: 'stocks details', params: { val: path } })
    }
}

function onModify(item) {
    if (item.fillshares > 0 && item.qty !== item.fillshares) {
        item.qty = item.qty - item.fillshares
    }
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: {
            type: 'mod-order',
            token: item.token,
            exch: item.exch,
            tsym: item.tsym,
            trantype: item.trantype?.toLowerCase(),
            item
        }
    }))
}

async function setSingleorderbook(id) {
    loading.value = true
    const data = await getSingleorderbook(id)
    if (data && Array.isArray(data) && data[0]?.stat === 'Ok') {
        orderhistorydata.value = data.map(d => ({
            ...d,
            modifi: d.rpt?.includes('New') ? 'NA' : d.actid
        }))
        orderhistory.value = true
    } else {
        appStore.showSnackbar(2, data?.emsg || 'Failed to load order history')
    }
    loading.value = false
}

async function setOrderrowdata(item) {
    orderdrawer.value = true
    singledata.value = { ...item }
    try {
        const raw = await getLtpdata([{ exch: item.exch, token: item.token }])
        if (raw && raw.data && raw.data[item.token]) {
            singledata.value.raw = raw.data[item.token]
        }
    } catch (e) {
        console.error('Failed to fetch LTP', e)
    }
}

function onTempUpdate(e) {
    const p = e.detail
    if (p && (p.stat || p.response || p.openorders)) {
        setOrderPayload(p)
    }
}

function onOrderbookUpdate() {
    getOrderbook()
}

function onWsTick(e) {
    const t = e.detail
    if (!t?.token || !orderbookdata.value?.length) return
    const idx = orderbookdata.value.findIndex(x => x.token === t.token)
    if (idx >= 0) {
        orderbookdata.value[idx].ltp = t.lp || t.ltp || orderbookdata.value[idx].ltp
        nextTick(() => {
            const tag = document.getElementById(`ord${orderbookdata.value[idx].idx || orderbookdata.value[idx].norenordno}|${t.token}ltp`)
            if (tag) tag.innerHTML = fmt(orderbookdata.value[idx].ltp)
        })
    }
}

onMounted(() => {
    try {
        const cached = sessionStorage.getItem('orders_last')
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed && (parsed.response || parsed.openorders)) setOrderPayload(parsed)
        }
    } catch (e) { }
    getOrderbook()
    window.addEventListener('tempdata-update', onTempUpdate)
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    window.addEventListener('web-scoketConn', onWsTick)
})

onBeforeUnmount(() => {
    window.removeEventListener('tempdata-update', onTempUpdate)
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
    window.removeEventListener('web-scoketConn', onWsTick)
})
</script>
