<template>
    <div>
        <!-- Toolbar -->
        <v-toolbar variant="flat" density="compact" class="tool-sty my-1 mt-2 pl-4 crd-trn">
            <v-tabs v-model="ordertab" color="#2B38B7" fixed show-arrows density="compact"
                @update:model-value="onTabChange">
                <v-tab value="orders" density="compact"
                    style="font-size: 16px !important;letter-spacing: 0px !important;"
                    class="font-weight-bold mb-0 text-none">
                    Open Orders ({{ filteredOpen.length }})
                </v-tab>
                <v-tab value="executed" style="font-size: 16px !important;letter-spacing: 0px !important;"
                    class="font-weight-bold mb-0 text-none">
                    Executed Orders ({{ filteredExec.length }})
                </v-tab>
            </v-tabs>
            <v-spacer></v-spacer>

            <v-text-field elevation="0" rounded v-if="ordertab === 'orders'" v-model="opensearch"
                prepend-inner-icon="mdi-magnify" placeholder="Search" variant="solo" density="compact" hide-details
                class="rounded mr-4" style="max-width: 220px" flat bg-color="secbg" />
            <v-text-field elevation="0" rounded v-else v-model="execsearch" prepend-inner-icon="mdi-magnify"
                placeholder="Search" variant="solo" density="compact" hide-details class="rounded mr-4"
                style="max-width: 220px" flat bg-color="secbg" />

            <v-select v-if="ordertab === 'orders'" style="max-width: 160px" v-model="filter" rounded hide-details
                item-title="title" item-value="value" prepend-inner-icon="mdi-format-list-bulleted"
                class="rounded-pill ml-4" variant="solo" density="compact" flat bg-color="secbg" elevation="0"
                :items="filterso" @update:model-value="filtercount = 0" />
            <v-select v-else style="max-width: 160px" v-model="filter" rounded hide-details item-title="title"
                item-value="value" prepend-inner-icon="mdi-format-list-bulleted" class="rounded-pill ml-4"
                variant="solo" density="compact" flat bg-color="secbg" elevation="0" :items="filterse"
                @update:model-value="filtercount = 0" />

            <v-btn v-if="ordertab === 'orders'" variant="elevated"
                :disabled="!openorders.length || openorders.length === 0"
                @click="openCancelDialog(orddselected.length > 0 ? orddselected : 'all')"
                class=" bgg-color elevation-0 rounded-pill font-weight-bold text-none ml-4" >
                Cancel {{ orddselected.length > 0 ? orddselected.length : 'all' }}
            </v-btn>
            <v-icon :disabled="loading" :class="['ml-3 cursor-p', { 'reload-rotating': loading }]" @click="getOrderbook"
                color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <!-- Orders Table -->
        <v-window v-model="ordertab" style="z-index:0">
            <v-window-item value="orders">
                <v-data-table :headers="orderheader" :items="filteredOpenSorted" :loading="loading" fixed-header
                    :hide-default-footer="true" :items-per-page="-1" height="480px"
                    class="holdings-table mt-3 rounded-lg overflow-y-auto"
                    style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;"
                    item-key="norenordno" show-select :item-class="() => 'table-row'"
                    @click:row="(event, { item }) => setOrderrowdata(item)">

                    <template #header.data-table-select="{ props, toggleSelectAll, isSomeSelected, isAllSelected }">
                        <v-checkbox-btn
                            :model-value="filteredOpenSorted.length > 0 && orddselected.length === filteredOpenSorted.length"
                            :indeterminate="orddselected.length > 0 && orddselected.length < filteredOpenSorted.length"
                            @click="() => {
                                // console.log('[StocksOrderBook] Toggle select all clicked:', {
                                //     currentSelectionCount: orddselected.length,
                                //     totalItems: filteredOpenSorted.length,
                                //     willSelectAll: orddselected.length !== filteredOpenSorted.length
                                // });
                                if (orddselected.length === filteredOpenSorted.length) {
                                    // Deselect all
                                    orddselected.splice(0, orddselected.length);
                                    // console.log('[StocksOrderBook] Deselected all, new count:', orddselected.length);
                                } else {
                                    // Select all - add items that aren't already selected
                                    const beforeCount = orddselected.length;
                                    filteredOpenSorted.forEach(item => {
                                        if (!orddselected.some(sel => sel.norenordno === item.norenordno)) {
                                            orddselected.push(item);
                                        }
                                    });
                                    // console.log('[StocksOrderBook] Selected all, count before:', beforeCount, 'count after:', orddselected.length);
                                }
                            }" color="primary" hide-details density="compact"></v-checkbox-btn>
                    </template>

                    <template #item.data-table-select="{ item, toggleSelect, isSelected }">
                        <v-checkbox-btn :model-value="orddselected.some(sel => sel.norenordno === item.norenordno)"
                            @click.stop="() => {
                                const isCurrentlySelected = orddselected.some(sel => sel.norenordno === item.norenordno);
                                // console.log('[StocksOrderBook] Individual checkbox clicked:', {
                                //     norenordno: item.norenordno,
                                //     tsym: item.tsym,
                                //     currentlySelected: isCurrentlySelected,
                                //     currentSelectionCount: orddselected.length,
                                //     itemObject: item
                                // });
                                if (isCurrentlySelected) {
                                    // Remove from selection by norenordno
                                    const index = orddselected.findIndex(sel => sel.norenordno === item.norenordno);
                                    if (index > -1) {
                                        orddselected.splice(index, 1);
                                        // console.log('[StocksOrderBook] Removed from selection, new count:', orddselected.length);
                                    }
                                } else {
                                    // Add to selection - use the item from filteredOpenSorted to maintain reference
                                    orddselected.push(item);
                                    // console.log('[StocksOrderBook] Added to selection, new count:', orddselected.length);
                                }
                            }" color="primary" hide-details density="compact"></v-checkbox-btn>
                    </template>
                    <template #item.norentm="{ item }">
                        <span @click="setOrderrowdata(item)" class="cursor-pointer font-weight-medium maintext--text">{{
                            timeStr(item.norentm) }}</span>
                    </template>
                    <template #item.trantype="{ item }">
                        <v-chip @click="setOrderrowdata(item)" small :color="item.trantype === 'B' ? 'green' : 'red'"
                            :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                            style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer;">
                            <span class="font-weight-medium fs-12">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                        </v-chip>
                    </template>
                    <template #item.tsym="{ item }">
                        <div class="pos-rlt">
                            <p @click="setOrderrowdata(item)"
                                class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4 cursor-pointer">
                                {{ item.tsym || '' }}
                                <span class="ml-1 subtext--text fs-10">{{ item.exchs || item.exch || '' }}</span>
                            </p>
                            <div @click.stop class="pos-abs table-hov" style="top: 10px; right: 0">
                                <!-- Modify Order Button (Pen icon) - Only for Open Orders -->
                                <v-tooltip location="top" text="Modify Order">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" @click.stop="onModify(item)"
                                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                            min-width="20px" class="elevation-0 mr-1" size="x-small">
                                            <v-icon size="18" color="maintext">mdi-pencil</v-icon>
                                        </v-btn>
                                    </template>
                                </v-tooltip>

                                <!-- Cancel/Exit Order Button (Close icon) - Only for Open Orders -->
                                <v-tooltip location="top" :text="item.exord ? 'Exit Order' : 'Cancel Order'">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props" @click.stop="openCancelDialog(item)"
                                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                            min-width="20px" class="elevation-0 mr-1" size="x-small">
                                            <v-icon size="18" color="maintext">mdi-close-circle-outline</v-icon>
                                        </v-btn>
                                    </template>
                                </v-tooltip>

                                <!-- Chart Button -->
                                <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                    min-width="20px" class="elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                                </v-btn>

                                <!-- Repeat Order Button (Autorenew icon) - Only for Open Orders -->
                                <v-btn
                                    @click.stop="setSSDtab('re-order', item.token, item.exch, item.tsym, item.trantype?.toLowerCase(), item)"
                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                    min-width="20px" class="elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-autorenew</v-icon>
                                    <v-tooltip activator="parent" location="top" text="Repeat order"></v-tooltip>
                                </v-btn>

                                <!-- Menu (3 dots) -->
                                <v-menu location="bottom" class="table-menu">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props"
                                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                            class="elevation-0 mr-1" size="x-small">
                                            <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card class="table-menu-list">
                                        <v-list density="compact">
                                            <template v-for="(m, k) in menulist.open" :key="k">
                                                <v-list-item
                                                    @click="m.type === 'cancel' ? openCancelDialog(item) : m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, m.trans || item.trantype?.toLowerCase(), item) : setOrderrowdata(item)">
                                                    <template #prepend>
                                                        <div class="d-flex align-center justify-center mr-3"
                                                            style="width: 20px; min-width: 20px;">
                                                            <img v-if="m.icon > 2" width="20px" height="20px"
                                                                :src="getIconUrl(m.icon)"
                                                                style="object-fit: contain;" />
                                                            <v-icon v-else :icon="m.icon" size="20" color="#506D84" />
                                                        </div>
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
                    <template #item.s_prdt_ali="{ item }">
                        <v-chip @click="setOrderrowdata(item)" v-if="item.s_prdt_ali" small class="table-hov-prd"
                            text-color="subtext"
                            style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer;">
                            <span class="font-weight-medium fs-12">{{ item.s_prdt_ali }}</span>
                        </v-chip>
                        <v-chip @click="setOrderrowdata(item)" v-else-if="item.ordersource === 'ESIP'" small
                            class="table-hov-prd" text-color="subtext"
                            style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer;">
                            <span class="font-weight-medium fs-12">{{ item.ordersource }}</span>
                        </v-chip>
                    </template>
                    <template #item.qty="{ item }">
                        <p @click="setOrderrowdata(item)" class="cursor-pointer font-weight-medium maintext--text mb-0">
                            {{ item.fillshares && Number(item.fillshares) > 0 ? `${item.fillshares / (item.exch ===
                                'MCX' ?
                                item.ls : 1)}/` : '' }}{{ item.qty ? (item.qty / (item.exch === 'MCX' ? item.ls : 1)) : '0'
                            }}
                        </p>
                    </template>
                    <template #item.rprc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.avgprc
                                || item.rprc) }}
                        </p>
                    </template>
                    <template #item.ltp="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">
                            <span :id="`ord${item.idx || item.norenordno}|${item.token}ltp`">{{ fmt(item.ltp ||
                                item.raw?.lp || item.raw?.ltp || '0.00') }}</span>
                        </p>
                    </template>
                    <template #item.prc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.prc) }}
                        </p>
                    </template>
                    <template #item.trgprc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.trgprc)
                            }}</p>
                    </template>
                    <template #item.value="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.value)
                            }}</p>
                    </template>
                    <template #item.status="{ item }">
                        <div @click="setOrderrowdata(item)"
                            class="cursor-pointer ws-p font-weight-medium maintext--text align-center">
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props" class="d-inline-flex">

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
                                    There is no Open order data here yet!
                                </h4>
                            </div>
                        </div>
                    </template>
                </v-data-table>
            </v-window-item>

            <!-- Executed Orders Table -->
            <v-window-item value="executed">
                <v-data-table :headers="orderheader" :items="filteredExecSorted" :loading="loading" fixed-header
                    :hide-default-footer="true" :items-per-page="-1"
                    class="holdings-table mt-3 rounded-lg overflow-y-auto"
                    style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;"
                    height="480px" :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })"
                    @click:row="(event, { item }) => setOrderrowdata(item)">
                    <template #item.norentm="{ item }">
                        <span @click="setOrderrowdata(item)" class="cursor-pointer font-weight-medium maintext--text">{{
                            timeStr(item.norentm) }}</span>
                    </template>
                    <template #item.trantype="{ item }">
                        <v-chip @click="setOrderrowdata(item)" small    :color="item.trantype === 'B' ? 'green' : 'red'"
                            :text-color="item.trantype === 'B' ? 'maingreen' : 'mainred'"
                            style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer; height: 15px;">
                            <span class="font-weight-medium fs-12 mt-1">{{ item.trantype === 'B' ? 'BUY' : 'SELL' }}</span>
                        </v-chip>
                    </template>
                    <template #item.tsym="{ item }">
                        <div class="pos-rlt">
                            <p class="font-weight-medium maintext--text mb-0 table-hov-text ws-p mr-4">
                                {{ item.tsym || '' }}
                                <span class="ml-1 subtext--text fs-10">{{ item.exchs || item.exch || '' }}</span>
                            </p>
                            <div v-if="item" @click.stop class="pos-abs table-hov" style="top: 2px; right: 0">
                                <!-- Buy Button -->
                                <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 'b', item)"
                                    min-width="20px"
                                    style="background-color: #43A833; color: #ffffff; border-radius: 4px; height: 20px; padding: 0 4px;"
                                    class="font-weight-bold elevation-0 mr-0" size="x-small"> B
                                </v-btn>

                                <!-- Sell Button -->
                                <v-btn @click.stop="setSSDtab('order', item.token, item.exch, item.tsym, 's', item)"
                                    min-width="20px"
                                    style="background-color: #FF1717; color: #ffffff; border-radius: 4px; height: 20px; padding: 0 4px;"
                                    class="font-weight-bold elevation-0 mr-0" size="x-small"> S
                                </v-btn>

                                <!-- Chart Button -->
                                <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym, null, item)"
                                    style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                    min-width="20px" class="elevation-0 mr-0" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                                </v-btn>

                                <!-- Menu (3 dots) -->
                                <v-menu location="bottom" class="table-menu">
                                    <template #activator="{ props }">
                                        <v-btn v-bind="props"
                                            style="border: 1px solid #EBEEF0; background-color: #ffffff; border-radius: 4px; min-width: 20px; height: 20px; padding: 0;"
                                            class="elevation-0 mr-0" size="x-small">
                                            <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card class="table-menu-list">
                                        <v-list density="compact">
                                            <template v-for="(m, k) in menulist.exec" :key="k">
                                                <v-list-item
                                                    @click="m.type ? setSSDtab(m.type, item.token, item.exch, item.tsym, m.trans || item.trantype?.toLowerCase(), item) : setOrderrowdata(item)">
                                                    <template #prepend>
                                                        <div class="d-flex align-center justify-center mr-3"
                                                            style="width: 20px; min-width: 20px;">
                                                            <img v-if="m.icon > 2" width="20px" height="20px"
                                                                :src="getIconUrl(m.icon)"
                                                                style="object-fit: contain;" />
                                                            <v-icon v-else :icon="m.icon" size="20" color="#506D84" />
                                                        </div>
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
                    <template #item.s_prdt_ali="{ item }">
                        <v-chip @click="setOrderrowdata(item)" v-if="item.s_prdt_ali" small class="table-hov-prd"
                            text-color="subtext"
                            style="border-radius: 5px; padding: 10px 8px !important; cursor: pointer; height: 15px;">
                            <span class="font-weight-medium fs-12 mt-1">{{ item.s_prdt_ali }}</span>
                        </v-chip>
                    </template>
                    <template #item.qty="{ item }">
                        <p @click="setOrderrowdata(item)" class="cursor-pointer font-weight-medium maintext--text mb-0">
                            {{ item.fillshares && Number(item.fillshares)
                                > 0 ?
                                `${item.fillshares / (item.exch === 'MCX' ? item.ls : 1)}/` : '' }}{{ item.qty ? (item.qty /
                                (item.exch === 'MCX' ? item.ls : 1)) : '0' }}</p>
                    </template>
                    <template #item.rprc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.avgprc
                                || item.rprc) }}
                        </p>
                    </template>
                    <template #item.ltp="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">
                            <span :id="`ord${item.idx || item.norenordno}|${item.token}ltp`">{{ fmt(item.ltp ||
                                item.raw?.lp || item.raw?.ltp || '0.00') }}</span>
                        </p>
                    </template>
                    <template #item.prc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.prc) }}
                        </p>
                    </template>
                    <template #item.trgprc="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.trgprc)
                            }}</p>
                    </template>
                    <template #item.value="{ item }">
                        <p @click="setOrderrowdata(item)"
                            class="cursor-pointer text-right font-weight-medium maintext--text mb-0">{{ fmt(item.value)
                            }}</p>
                    </template>
                    <template #item.status="{ item }">
                        <div @click="setOrderrowdata(item)"
                            class="cursor-pointer d-flex justify-center ws-p font-weight-medium maintext--text align-center">
                            <v-tooltip location="top" color="black">
                                <template #activator="{ props }">
                                    <div v-bind="props" class="d-inline-flex align-center">
                                        <svg v-if="item.status === 'COMPLETE'" xmlns="http://www.w3.org/2000/svg"
                                            width="20" height="15" viewBox="0 0 20 15" fill="none">
                                            <rect width="20" height="15" rx="7" fill="#2DB266" />
                                            <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white"
                                                stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        <svg v-else-if="item.status === 'CANCELED' || item.status === 'REJECTED'"
                                            xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                                            viewBox="0 0 20 15" fill="none">
                                            <rect width="20" height="15" rx="7" fill="#DC2626" />
                                            <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white" stroke-width="1.2"
                                                stroke-linecap="round" stroke-linejoin="round" />
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
                                    There is no Executed order data here yet!
                                </h4>
                            </div>
                        </div>
                    </template>
                </v-data-table>
            </v-window-item>
        </v-window>

        <!-- Order Details Drawer -->
        <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="false" width="360" color="cardbg"
            class="pt-2" :key="`drawer-${ordertab}-${singledata?.norenordno || 'empty'}`">
            <template v-slot:prepend>
                <v-toolbar class="nav-drawer crd-trn" density="comfortable">
                    <v-btn icon variant="text" density="comfortable" @click="orderdrawer = false; singledata = null"
                        color="maintext" size="20">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </template>

            <div v-if="singledata && singledata.tsym">
                <v-list-item class="pt-3 pb-3" style="border-bottom: 1px solid #EBEEF0;">
                    <v-list-item-title class="font-weight-bold maintext--text fs-16">
                        {{ singledata.tsym || '' }}
                        <span class="ml-1 txt-999 fs-12">{{ singledata.exch || '' }}</span>
                    </v-list-item-title>
                    <v-list-item-title style="font-size: 16px !important;"
                        class="txt-000 font-weight-medium ma-0 pa-0">₹{{
                            fmt(singledata.prc || singledata.raw?.lprc)
                        }}</v-list-item-title>
                    <v-list-item-title
                        :class="singledata.rpnl > 0 ? 'maingreen--text' : singledata.rpnl < 0 ? 'mainred--text' : 'subtext--text'"
                        class="font-weight-medium fs-12">
                        {{ fmt(singledata.rpnl) }} ({{ fmt(singledata.pnlc) }}%)
                    </v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>

                <div class="px-4 py-2">
                    <p class="subtext--text font-weight-medium fs-13 mb-1">Order Id</p>
                    <div class="d-flex justify-space-between align-center">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.norenordno }}</p>
                        <div class="d-flex align-center">
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
                            <span class="ml-1 txt-000 fs-13">{{ singledata.status || '' }}</span>
                        </div>
                    </div>
                </div>

                <div class="px-4 py-3" style="border-bottom: 1px solid #EBEEF0;">
                    <v-btn
                        v-if="singledata.status === 'COMPLETE' || singledata.status === 'CANCELED' || singledata.status === 'REJECTED'"
                        @click="setSSDtab('re-order', singledata.token, singledata.exch, singledata.tsym, singledata.trantype?.toLowerCase(), singledata)"
                        class="rounded-pill text-none font-weight-bold" block height="40" variant="outlined">Place New
                        order</v-btn>
                    <v-row v-else no-gutters>
                        <v-col cols="6" class="px-2">
                            <v-btn @click="onModify(singledata)" class="rounded-pill text-none font-weight-bold" block
                                height="40" variant="outlined">Modify Order</v-btn>
                        </v-col>
                        <v-col cols="6" class="px-2">
                            <v-btn @click="orderdrawer = false; openCancelDialog(singledata)"
                                class="rounded-pill text-none font-weight-bold" block height="40" variant="outlined">{{
                                    singledata.exord ? 'Exit' : 'Cancel' }} Order</v-btn>
                        </v-col>
                    </v-row>
                </div>

                <div v-if="singledata.status !== 'COMPLETE'" style="border-bottom: 1px solid #EBEEF0;">
                    <div class="px-4 py-2">
                        <p class="subtext--text font-weight-medium fs-13 mb-1">Rejected reason</p>
                        <p class="error--text font-weight-bold fs-14 mb-0">{{ singledata.rejreason || '-' }}</p>
                    </div>
                </div>

                <div class="px-4">
                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Quantity</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.qty ? (singledata.qty /
                            (singledata.exch
                                === 'MCX' ?
                                singledata.ls : 1)) : '0' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Price</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">₹{{ fmt(singledata.prc) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Avg price</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">₹{{ fmt(singledata.rprc || singledata.avgprc)
                        }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Trigger price</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">₹{{ fmt(singledata.trgprc) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-2"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Order type</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.prctyp || '-' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Validity</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.ret || '-' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Exch. Ord ID</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.exchordid || '-' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Time</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ timeStr(singledata.norentm) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Exch time</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ timeStr(singledata.norentm) }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Product</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.s_prdt_ali || '-' }}</p>
                    </div>

                    <div class="d-flex justify-space-between align-center py-4"
                        style="border-bottom: 1px solid #EBEEF0;">
                        <p class="txt-000 font-weight-bold fs-14 mb-0">Place by</p>
                        <p class="txt-000 font-weight-regular fs-14 mb-0">{{ singledata.uid || '-' }}</p>
                    </div>
                </div>

                <div class="px-4 py-3">
                    <v-btn @click="setSingleorderbook(singledata.norenordno)"
                        class="rounded-pill text-none font-weight-bold" block height="40" variant="outlined">
                        <v-icon class="mr-1">mdi-history</v-icon>Order history
                    </v-btn>
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
                <div class="text-center">
                    <img src="@/assets/orderbook/cancel-icon.svg" width="50px" alt="cancel icon" />
                </div>
                <p class="font-weight-medium mt-3 lh-24 mb-8" style="font-size: 22px !important;">
                    Are you sure you want to<br />
                    {{ singledata === 'all' ? 'cancel' : singledata?.exord ? 'exit' : 'cancel' }}
                    <b>{{ tableorcan === 'oneorder' ? singledata?.tsym : (singledata?.tsym || `${orddselected.length ===
                        openorders.length ? 'All Open' : 'Open'}`)
                    }}</b>
                    {{ singledata?.exord ? 'position' : `order${tableorcan === 'oneorder' ? '' : (singledata === 'all'
                        ||
                        orddselected.length > 1 ? `
                    (${singledata === 'all' ? openorders.length : orddselected.length})` : '')}` }}?
                </p>
                <v-row class="px-6" no-gutters>
                    <v-col cols="6" class="px-2">
                        <v-btn @click="canceldialog = false; singledata = null; tableorcan = ''" color="outline"
                            class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
                            height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6" class="px-2">
                        <v-btn @click="handleCancelConfirm" color="btnclr"
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
import { useOrderStore } from '@/stores/orderStore'
import { getMOrderbook, getSingleorderbook, getLtpdata } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()
const orderStore = useOrderStore()
const router = useRouter()

const loading = ref(false)
const ordertab = ref('orders')
const opensearch = ref('')
const execsearch = ref('')
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
const tableorcan = ref('')

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

    // Apply search filter - search by instrument, product, and prices
    if (opensearch.value && opensearch.value.trim()) {
        const searchTerm = opensearch.value.trim().toUpperCase()
        const numericPart = searchTerm.replace(/[^0-9.]/g, '')
        const isNumeric = numericPart !== '' && !isNaN(parseFloat(numericPart))

        list = list.filter(o => {
            // Search by instrument (tsym, exch)
            const tsym = (o.tsym || '').toUpperCase()
            const exch = (o.exch || o.exchs || '').toUpperCase()
            const norenordno = String(o.norenordno || '').toUpperCase()

            // Search by product
            const product = (o.s_prdt_ali || '').toUpperCase()

            // Search by prices (prc, rprc, avgprc, trgprc)
            const prc = fmt(o.prc || 0)
            const rprc = fmt(o.rprc || o.avgprc || 0)
            const trgprc = fmt(o.trgprc || 0)

            // Text search
            if (tsym.includes(searchTerm) || exch.includes(searchTerm) || norenordno.includes(searchTerm) || product.includes(searchTerm)) {
                return true
            }

            // Numeric search for prices
            if (isNumeric) {
                if (prc.includes(numericPart) ||
                    rprc.includes(numericPart) ||
                    trgprc.includes(numericPart)) {
                    return true
                }
            }

            return false
        })
    }

    // Apply status filter
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

    // Apply search filter - search by instrument, product, and prices
    if (execsearch.value && execsearch.value.trim()) {
        const searchTerm = execsearch.value.trim().toUpperCase()
        const numericPart = searchTerm.replace(/[^0-9.]/g, '')
        const isNumeric = numericPart !== '' && !isNaN(parseFloat(numericPart))

        list = list.filter(o => {
            // Search by instrument (tsym, exch)
            const tsym = (o.tsym || '').toUpperCase()
            const exch = (o.exch || o.exchs || '').toUpperCase()
            const norenordno = String(o.norenordno || '').toUpperCase()

            // Search by product
            const product = (o.s_prdt_ali || '').toUpperCase()

            // Search by prices (prc, rprc, avgprc, trgprc)
            const prc = fmt(o.prc || 0)
            const rprc = fmt(o.rprc || o.avgprc || 0)
            const trgprc = fmt(o.trgprc || 0)

            // Text search
            if (tsym.includes(searchTerm) || exch.includes(searchTerm) || norenordno.includes(searchTerm) || product.includes(searchTerm)) {
                return true
            }

            // Numeric search for prices
            if (isNumeric) {
                if (prc.includes(numericPart) ||
                    rprc.includes(numericPart) ||
                    trgprc.includes(numericPart)) {
                    return true
                }
            }

            return false
        })
    }

    // Apply status filter
    if (filter.value !== 'All') {
        list = list.filter(o => o.status === filter.value)
        filtercount.value = list.length
    } else {
        filtercount.value = 0
    }
    return list
})

const filteredOpenSorted = computed(() => {
    // Use the same object references from filteredOpen, don't create new objects
    // This is critical for Vuetify 3 selection to work properly with return-object
    const list = filteredOpen.value
    if (currentSort.value.column) {
        // Sort in place to maintain object references, or create new array but keep same objects
        const sorted = [...list] // Create new array but keep same object references
        sorted.sort((a, b) => {
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
        return sorted
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

    // Ensure all orders have a unique norenordno for proper selection tracking
    // Vuetify 3 requires a unique item-key for proper selection behavior
    // IMPORTANT: Mutate original objects to maintain reference identity for selection
    const ensureUniqueKey = (order, index) => {
        if (!order.norenordno) {
            // Generate a unique key if norenordno is missing using token, exch, tsym, and index
            order.norenordno = `temp_${order.token || 'unknown'}_${order.exch || 'unknown'}_${order.tsym || 'unknown'}_${index}_${Math.random().toString(36).substr(2, 9)}`
            // console.log('[StocksOrderBook] Generated norenordno for order:', {
            //     generated: order.norenordno,
            //     index,
            //     tsym: order.tsym
            // })
        }
        return order // Return same object reference
    }

    // Process all orders once and maintain object references
    all.forEach((order, index) => ensureUniqueKey(order, index))
    orderbookdata.value = all

    // Use the same object references from orderbookdata, don't create new objects
    const open = payload?.openorders || all.filter(o => o.way === 'open')
    const exec = payload?.execorders || all.filter(o => o.way !== 'open')

    openorders.value = open
    execorders.value = exec

    // Set initial sort order based on current tab
    if (ordertab.value === 'executed') {
        // Executed orders: ascending order by time (oldest first)
        currentSort.value = { column: 'norentm', desc: false }
    } else {
        // Open orders: descending order by time (newest first)
        currentSort.value = { column: 'norentm', desc: true }
    }

    // console.log('[StocksOrderBook] setOrderPayload completed:', {
    //     totalOrders: all.length,
    //     openOrders: openorders.value.length,
    //     execOrders: execorders.value.length,
    //     sampleNorenordnos: openorders.value.slice(0, 3).map(o => o.norenordno),
    //     allNorenordnos: openorders.value.map(o => o.norenordno)
    // })

    // Update order counts in store if stat array is available
    if (payload?.stat && Array.isArray(payload.stat) && payload.stat.length >= 3) {
        orderStore.setOrderCounts(payload.stat)
    } else {
        // Calculate counts from orders if stat is not available
        const openCount = openorders.value.length
        const execCount = execorders.value.filter(o => o.status === 'COMPLETE').length
        const rejectedCount = execorders.value.filter(o => o.status === 'REJECTED' || o.status === 'CANCELED').length
        orderStore.setOrderCounts([openCount, execCount, rejectedCount])
    }

    try {
        sessionStorage.setItem('orders_last', JSON.stringify(payload))
    } catch (e) { }

    // Subscribe to WebSocket for LTP updates (same as old code: setWebsocket("sub", this.orderbookdata, "ord"))
    if (all.length > 0) {
        try {
            window.dispatchEvent(new CustomEvent('web-scoketOn', {
                detail: {
                    flow: 'sub',
                    data: all.map(item => ({
                        exch: item.exch,
                        token: item.token,
                        tsym: item.tsym
                    })),
                    is: 'ord',
                    page: 'orders'
                }
            }))
        } catch (e) {
            // console.error('[StocksOrderBook] Error subscribing to WebSocket:', e)
        }
    }
}

async function getOrderbook() {
    // Prevent duplicate calls if already loading
    if (loading.value) {
        return
    }

    loading.value = true
    try {
        const data = await getMOrderbook(true)
        if (data && (Array.isArray(data.response) || Array.isArray(data.openorders))) {
            setOrderPayload(data)
        } else if (data !== 500) {
            appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load orders')
        }
    } catch (error) {
        appStore.showSnackbar(2, 'Failed to load orders')
    } finally {
        loading.value = false
    }
}

function onTabChange() {
    filter.value = 'All'
    filtercount.value = 0
    // Clear search when switching tabs
    opensearch.value = ''
    execsearch.value = ''
    // Close all dialogs and drawer when switching tabs
    orderdrawer.value = false
    canceldialog.value = false
    orderhistory.value = false

    // Set initial sort order based on tab
    if (ordertab.value === 'executed') {
        // Executed orders: ascending order by time (oldest first)
        currentSort.value = { column: 'norentm', desc: false }
    } else {
        // Open orders: descending order by time (newest first)
        currentSort.value = { column: 'norentm', desc: true }
    }

    // Clear selected data - use nextTick to ensure drawer closes before clearing data
    nextTick(() => {
        singledata.value = null
        orddselected.value = []
        tableorcan.value = ''
    })
}

function openCancelDialog(item) {
    if (item === 'all') {
        singledata.value = 'all'
        tableorcan.value = ''
    } else if (Array.isArray(item) && item.length > 0) {
        singledata.value = item
        tableorcan.value = ''
    } else if (item && item.token) {
        // Single order cancellation - ignore any selected items
        singledata.value = item
        tableorcan.value = 'oneorder'
    } else {
        // If no item provided, use selected orders or all
        if (orddselected.value.length > 0) {
            singledata.value = orddselected.value
        } else {
            singledata.value = 'all'
        }
        tableorcan.value = ''
    }
    canceldialog.value = true
}

async function setColseOrders() {
    // Cancel all selected orders and collect messages to show sequentially
    const cancelResults = []
    const itemsToCancel = [...orddselected.value]

    // Set up result listener before starting cancellations
    const resultPromises = itemsToCancel.map((item, index) => {
        return new Promise((resolve) => {
            // Create a one-time listener for this specific item's cancel result
            const handler = (event) => {
                if (event.detail && event.detail.item &&
                    event.detail.item.norenordno === item.norenordno) {
                    window.removeEventListener('cancel-order-result', handler)
                    resolve(event.detail.result)
                }
            }
            window.addEventListener('cancel-order-result', handler)

            // Dispatch cancel event with skipMessage flag after a small delay
            // This ensures listeners are set up before events are dispatched
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('menudialog', {
                    detail: {
                        type: 'cancel-order',
                        token: item.token,
                        exch: item.exch,
                        tsym: item.tsym,
                        trantype: '',
                        item: item,
                        skipMessage: true // Flag to skip immediate message
                    }
                }))
            }, index * 100) // Small delay between each dispatch
        })
    })

    // Wait for all cancellations to complete
    const results = await Promise.all(resultPromises)

    // Collect success messages
    results.forEach(result => {
        if (result && result.success && result.message) {
            cancelResults.push(result.message)
        }
    })

    // Show all success messages sequentially with 2-second delay
    if (cancelResults.length > 0) {
        for (let i = 0; i < cancelResults.length; i++) {
            setTimeout(() => {
                appStore.showSnackbar(0, cancelResults[i])
            }, i * 2000) // 2 seconds delay between each message
        }

        // Trigger orderbook update once after all cancellations complete (only once)
        // Wait for all messages to be shown before refreshing
        setTimeout(() => {
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }
        }, cancelResults.length * 2000 + 500) // Wait for all messages + small buffer
    } else {
        // If no success messages, still trigger orderbook update after a short delay
        setTimeout(() => {
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }
        }, 500)
    }

    orddselected.value = []
}

function handleCancelConfirm() {
    if (singledata.value === 'all' || (Array.isArray(singledata.value) && singledata.value.length === 0)) {
        // Cancel all orders - select all items first
        orddselected.value = [...filteredOpenSorted.value]
        if (orddselected.value.length > 0) {
            setColseOrders()
        } else {
            appStore.showSnackbar(0, 'No orders to cancel')
        }
    } else if (tableorcan.value === 'oneorder') {
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
    } else if (Array.isArray(singledata.value) && singledata.value.length > 0) {
        // Cancel selected orders from array
        orddselected.value = [...singledata.value]
        setColseOrders()
    } else {
        // Cancel all selected orders from table selection
        if (orddselected.value.length > 0) {
            setColseOrders()
        } else {
            appStore.showSnackbar(0, 'Please select at least one order to cancel')
        }
    }
    canceldialog.value = false
    singledata.value = null
    tableorcan.value = ''
}

function setSSDtab(type, token, exch, tsym, trans, item) {
    // console.log('[StocksOrderBook] setSSDtab called:', { type, token, exch, tsym, trans, item })

    if (type === 'alert') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'alert', token, exch, tsym } }))
    } else if (type === 'cGTT') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order-GTT', token, exch, tsym, trantype: 'b' } }))
    } else if (type === 'modify' || type === 'mod-order') {
        // Create a copy of item to avoid mutating original
        const itemCopy = item ? { ...item } : null
        if (itemCopy) {
            // Calculate pending quantity for modify order
            // qty and fillshares are in raw units (not divided by lot size)
            const rawQty = Math.abs(Number(itemCopy.qty) || 0)
            const rawFillshares = Math.abs(Number(itemCopy.fillshares) || 0)

            if (rawFillshares > 0 && rawQty > rawFillshares) {
                // Pending quantity = total quantity - filled quantity
                itemCopy.qty = rawQty - rawFillshares
            } else {
                // Use original quantity if no fills or all filled
                itemCopy.qty = rawQty
            }

            // Ensure product information is included for delivery/intraday selection
            // Map s_prdt_ali to prd if prd is not available
            if (!itemCopy.prd && itemCopy.s_prdt_ali) {
                const productMap = {
                    'CNC': 'C',
                    'MIS': 'I',
                    'NRML': 'M',
                    'C': 'C',
                    'I': 'I',
                    'M': 'M'
                }
                itemCopy.prd = productMap[itemCopy.s_prdt_ali.toUpperCase()] || itemCopy.prd
            }
            // If still no prd, default based on exchange
            if (!itemCopy.prd) {
                itemCopy.prd = (exch === 'NSE' || exch === 'BSE') ? 'C' : 'I'
            }

            // console.log('[StocksOrderBook] Modify order quantity calculation:', {
            //     originalQty: rawQty,
            //     fillshares: rawFillshares,
            //     pendingQty: itemCopy.qty,
            //     item: itemCopy
            // })
        }
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: {
                type: 'mod-order',
                token,
                exch,
                tsym,
                trantype: trans?.toLowerCase(),
                item: itemCopy
            }
        }))
    } else if (type === 're-order') {
        // Pass complete item with all order details for re-order
        const itemCopy = item ? { ...item } : null
        if (itemCopy) {
            // Ensure product information is included for delivery/intraday selection
            // Map s_prdt_ali to prd if prd is not available
            if (!itemCopy.prd && itemCopy.s_prdt_ali) {
                const productMap = {
                    'CNC': 'C',
                    'MIS': 'I',
                    'NRML': 'M',
                    'C': 'C',
                    'I': 'I',
                    'M': 'M'
                }
                itemCopy.prd = productMap[itemCopy.s_prdt_ali.toUpperCase()] || itemCopy.prd
            }
            // If still no prd, default based on exchange
            if (!itemCopy.prd) {
                itemCopy.prd = (exch === 'NSE' || exch === 'BSE') ? 'C' : 'I'
            }
        }
        // console.log('[StocksOrderBook] Dispatching re-order event', {
        //     token,
        //     exch,
        //     tsym,
        //     trantype: trans?.toLowerCase(),
        //     item: itemCopy
        // })
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: {
                type: 're-order',
                token,
                exch,
                tsym,
                trantype: trans?.toLowerCase(),
                item: itemCopy
            }
        }))
        // console.log('[StocksOrderBook] Re-order event dispatched successfully')
        // Note: Orderbook refresh will happen after order is placed via order-placed event listener
    } else if (type === 'order') {
        window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'order', token, exch, tsym, trantype: trans, item } }))
    } else if (type === 'his') {
        setSingleorderbook(item.norenordno)
    } else if (type === 'chart' || type === 'depth' || type === 'Funda') {
        // Navigate to stock details page with the correct tab
        // console.log('[StocksOrderBook] Navigating to:', type, 'for stock:', tsym, 'token:', token, 'exch:', exch)
        const path = [type, token, exch, tsym]
        // console.log('[StocksOrderBook] Path array:', path)

        // Store in localStorage to ensure params persist
        localStorage.setItem('ssdParams', JSON.stringify(path))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)

        // Navigate with both params and query for redundancy
        router.push({
            name: 'stocks details',
            params: { val: path },
            query: {
                type: type,
                token: token,
                exch: exch,
                tsym: tsym
            }
        })
            .then(() => {
                // console.log('[StocksOrderBook] Navigation successful to:', type, 'with params:', path)
            })
            .catch(err => {
                // console.error('[StocksOrderBook] Navigation error:', err)
            })
    } else if (type !== '') {
        // Default case for any other type (Details, etc)
        // console.log('[StocksOrderBook] Default navigation for type:', type, 'stock:', tsym)
        const path = [type, token, exch, tsym]
        // console.log('[StocksOrderBook] Path array:', path)

        // Store in localStorage
        localStorage.setItem('ssdParams', JSON.stringify(path))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)

        router.push({
            name: 'stocks details',
            params: { val: path },
            query: {
                type: type,
                token: token,
                exch: exch,
                tsym: tsym
            }
        })
            .then(() => {
                // console.log('[StocksOrderBook] Navigation successful with params:', path)
            })
            .catch(err => {
                // console.error('[StocksOrderBook] Navigation error:', err)
            })
    }
}

function onModify(item) {
    // Create a copy of item to avoid mutating original
    const itemCopy = item ? { ...item } : null
    if (itemCopy) {
        // Calculate pending quantity for modify order
        // qty and fillshares are in raw units (not divided by lot size)
        const rawQty = Math.abs(Number(itemCopy.qty) || 0)
        const rawFillshares = Math.abs(Number(itemCopy.fillshares) || 0)

        if (rawFillshares > 0 && rawQty > rawFillshares) {
            // Pending quantity = total quantity - filled quantity
            itemCopy.qty = rawQty - rawFillshares
        } else {
            // Use original quantity if no fills or all filled
            itemCopy.qty = rawQty
        }

        // Ensure product information is included for delivery/intraday selection
        // Map s_prdt_ali to prd if prd is not available
        if (!itemCopy.prd && itemCopy.s_prdt_ali) {
            const productMap = {
                'CNC': 'C',
                'MIS': 'I',
                'NRML': 'M',
                'C': 'C',
                'I': 'I',
                'M': 'M'
            }
            itemCopy.prd = productMap[itemCopy.s_prdt_ali.toUpperCase()] || itemCopy.prd
        }
        // If still no prd, default based on exchange
        if (!itemCopy.prd) {
            itemCopy.prd = (item.exch === 'NSE' || item.exch === 'BSE') ? 'C' : 'I'
        }

        // console.log('[StocksOrderBook] onModify quantity calculation:', {
        //     originalQty: rawQty,
        //     fillshares: rawFillshares,
        //     pendingQty: itemCopy.qty,
        //     item: itemCopy
        // })
    }
    window.dispatchEvent(new CustomEvent('menudialog', {
        detail: {
            type: 'mod-order',
            token: item.token,
            exch: item.exch,
            tsym: item.tsym,
            trantype: item.trantype?.toLowerCase(),
            item: itemCopy
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
    // Always open drawer and set data (don't toggle to avoid glitches)
    // Clear previous data first to prevent showing stale data
    singledata.value = null

    // Use nextTick to ensure drawer state is reset before opening
    await nextTick()

    // Set new order data
    singledata.value = { ...item }

    // Open drawer
    orderdrawer.value = !orderdrawer.value

    try {
        const raw = await getLtpdata([{ exch: item.exch, token: item.token }])
        if (raw && raw.data && raw.data[item.token]) {
            singledata.value.raw = raw.data[item.token]
        }
    } catch (e) {
        // console.error('Failed to fetch LTP', e)
    }
}

function onTempUpdate(e) {
    const p = e.detail
    if (p && (p.stat || p.response || p.openorders)) {
        setOrderPayload(p)
    }
}

// Debounce flag to prevent multiple simultaneous API calls
let isOrderbookLoading = false
let orderbookUpdateTimeout = null

function onOrderbookUpdate() {
    // Debounce: if already loading or if there's a pending update, skip
    if (isOrderbookLoading) {
        return
    }

    // Clear any pending timeout
    if (orderbookUpdateTimeout) {
        clearTimeout(orderbookUpdateTimeout)
    }

    // Set loading flag
    isOrderbookLoading = true

    // Call getOrderbook after a short delay to batch multiple rapid updates
    orderbookUpdateTimeout = setTimeout(() => {
        getOrderbook().finally(() => {
            isOrderbookLoading = false
            orderbookUpdateTimeout = null
        })
    }, 300)
}

// LTP Update Handler - Migrated from old Vue 2 code (optionChainDataParse)
// This function updates LTP for both open and executed orders exactly like the old app
function onWsTick(e) {
    // Handle different WebSocket data formats (same as old code: eventBus.$on("web-scoketConn", (data, page) => { if (page == "orders") ... }))
    let data = e.detail
    let page = null

    // Handle array format [data, page] - same as old code
    if (Array.isArray(data) && data.length > 0) {
        page = data[1] || data.page
        data = data[0]?.v || data[0] || data
    } else if (data?.v) {
        data = data.v
        page = data.page
    } else {
        page = data.page
    }

    // Validate data and token first (same as old code: if (!data || !data.token) return;)
    if (!data || !data.token) return

    const token = data.token

    // Only process if page is 'orders' OR if token matches an order in our data
    // This ensures LTP updates work even if page identifier is missing
    if (page && page !== 'orders') {
        // Check if this token is in our orderbook - if so, process it anyway
        const tokenInOrderbook = orderbookdata.value?.some(item => item.token == token) ||
            openorders.value?.some(item => item.token == token) ||
            execorders.value?.some(item => item.token == token)
        if (!tokenInOrderbook) return
    }

    // Get LTP value from WebSocket data (same as old code: data.lp)
    const ltpValue = data.lp || data.ltp || data.l
    if (ltpValue === undefined || ltpValue === null) return

    // Format LTP to 2 decimal places (same as old code: Number(data.lp).toFixed(2))
    const formattedLtp = Number(ltpValue).toFixed(2)

    // Track which DOM elements need updating to avoid duplicate updates
    const updatedElements = new Set()

    // Update orderbookdata - same logic as old code: this.orderbookdata.forEach((item, index) => { if (item.token == data.token) { ... } })
    if (orderbookdata.value && orderbookdata.value.length > 0) {
        orderbookdata.value.forEach((item, index) => {
            if (item.token == token) {
                // Update the LTP value in orderbookdata (same as old code)
                orderbookdata.value[index].ltp = formattedLtp

                // Store element ID for DOM update
                const elementId = `ord${item.idx || item.norenordno}|${token}ltp`
                updatedElements.add(elementId)
            }
        })
    }

    // Also update openorders and execorders arrays to keep them in sync
    // This ensures both open and executed orders tables show updated LTP
    if (openorders.value && openorders.value.length > 0) {
        openorders.value.forEach((item, index) => {
            if (item.token == token) {
                openorders.value[index].ltp = formattedLtp
                const elementId = `ord${item.idx || item.norenordno}|${token}ltp`
                updatedElements.add(elementId)
            }
        })
    }

    if (execorders.value && execorders.value.length > 0) {
        execorders.value.forEach((item, index) => {
            if (item.token == token) {
                execorders.value[index].ltp = formattedLtp
                const elementId = `ord${item.idx || item.norenordno}|${token}ltp`
                updatedElements.add(elementId)
            }
        })
    }

    // Update DOM elements (same as old code: document.getElementById(`ord${item.idx}|${data.token}ltp`))
    // Use nextTick to ensure DOM is ready, but update immediately after
    nextTick(() => {
        updatedElements.forEach(elementId => {
            const tag = document.getElementById(elementId)
            if (tag) {
                // Directly set the formatted LTP value (same as old code: tag.innerHTML = this.orderbookdata[index].ltp)
                tag.innerHTML = formattedLtp
            }
        })
    })
}

// Helper function to get icon image URL (Vite compatible)
function getIconUrl(iconNumber) {
    return new URL(`/src/assets/orderbook/${iconNumber}.svg`, import.meta.url).href
}

// Watch for tab changes to close drawer and clear data
watch(ordertab, (newTab, oldTab) => {
    if (newTab !== oldTab) {
        // Close drawer and dialogs first
        orderdrawer.value = false
        canceldialog.value = false
        orderhistory.value = false

        // Clear search when switching tabs
        opensearch.value = ''
        execsearch.value = ''

        // Set initial sort order based on tab
        if (newTab === 'executed') {
            // Executed orders: ascending order by time (oldest first)
            currentSort.value = { column: 'norentm', desc: false }
        } else {
            // Open orders: descending order by time (newest first)
            currentSort.value = { column: 'norentm', desc: true }
        }

        // Clear selected data - use nextTick to ensure drawer closes before clearing data
        nextTick(() => {
            singledata.value = null
            orddselected.value = []
            tableorcan.value = ''
        })
    }
})

// Watch orddselected to log selection changes
watch(orddselected, (newSelection, oldSelection) => {
    // console.log('[StocksOrderBook] orddselected changed:', {
    //     count: newSelection.length,
    //     items: newSelection.map(item => ({
    //         norenordno: item.norenordno,
    //         tsym: item.tsym,
    //         token: item.token,
    //         exch: item.exch
    //     })),
    //     previousCount: oldSelection?.length || 0
    // })
}, { deep: true })

// Function to close drawer and clear data
function closeDrawerAndClearData() {
    orderdrawer.value = false
    nextTick(() => {
        singledata.value = null
        orddselected.value = []
        tableorcan.value = ''
    })
}

// Event handler for closing drawer when parent tab changes
function onCloseAllDrawers(event) {
    // console.log('[StocksOrderBook] Close all drawers event received:', event.detail)
    closeDrawerAndClearData()
}

onMounted(() => {
    // console.log('[StocksOrderBook] Component mounted')

    try {
        const cached = sessionStorage.getItem('orders_last')
        if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed && (parsed.response || parsed.openorders)) setOrderPayload(parsed)
        }
    } catch (e) { }

    // Apply filter from store if set (from StatBoard navigation)
    if (orderStore.orderFilterTab) {
        ordertab.value = orderStore.orderFilterTab
        if (orderStore.orderFilterType) {
            filter.value = orderStore.orderFilterType
        }
        // Clear the filter after applying
        orderStore.clearOrderFilter()
    }

    // Set initial sort order based on current tab
    if (ordertab.value === 'executed') {
        // Executed orders: ascending order by time (oldest first)
        currentSort.value = { column: 'norentm', desc: false }
    } else {
        // Open orders: descending order by time (newest first)
        currentSort.value = { column: 'norentm', desc: true }
    }

    getOrderbook()

    // Event listeners
    window.addEventListener('tempdata-update', onTempUpdate)
    window.addEventListener('orderbook-update', onOrderbookUpdate)
    window.addEventListener('web-scoketConn', onWsTick)

    // Listen for parent tab change to close drawer
    window.addEventListener('close-all-order-drawers', onCloseAllDrawers)

    // Listen for order placement success to refresh orderbook
    // Use orderbook-update event instead to avoid duplicate calls
    // window.addEventListener('order-placed', () => {
    //     setTimeout(() => getOrderbook(), 1000)
    // })

    // Listen for order modification/cancellation success
    // Use orderbook-update event instead to avoid duplicate calls
    // window.addEventListener('order-modified', () => {
    //     setTimeout(() => getOrderbook(), 1000)
    // })

    // Remove order-cancelled listener - orderbook-update already handles it
    // This prevents duplicate API calls when order is cancelled
    // window.addEventListener('order-cancelled', () => {
    //     setTimeout(() => getOrderbook(), 1000)
    // })
})

onBeforeUnmount(() => {
    // console.log('[StocksOrderBook] Component unmounting, removing event listeners')

    // Close drawer and clear data before unmounting
    closeDrawerAndClearData()

    window.removeEventListener('tempdata-update', onTempUpdate)
    window.removeEventListener('orderbook-update', onOrderbookUpdate)
    window.removeEventListener('web-scoketConn', onWsTick)
    window.removeEventListener('close-all-order-drawers', onCloseAllDrawers)
    // Removed listeners for order-placed, order-modified, order-cancelled
    // These are no longer used to prevent duplicate API calls

    // Clear any pending timeout
    if (orderbookUpdateTimeout) {
        clearTimeout(orderbookUpdateTimeout)
        orderbookUpdateTimeout = null
    }
    isOrderbookLoading = false
})
</script>

<style scoped>
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

:deep(.v-tab--selected) {
    color: #2B38B7 !important;
}

.cursor-pointer {
    cursor: pointer;
}

/* Make table rows clickable */
:deep(.table-row) {
    cursor: pointer;
}

:deep(.table-row:hover) {
    background-color: rgba(0, 0, 0, 0.02) !important;
}

:deep(.v-text-field input) {
    font-size: 14px !important;
}

.maintext--text {
    color: black !important;
}

/* Data table header font size */
:deep(.v-data-table thead th),
:deep(.v-data-table table thead th),
:deep(.v-data-table .v-data-table__wrapper table thead th),
:deep(.v-data-table.v-data-table--fixed-header thead th),
:deep(.v-data-table.v-data-table--fixed-header table thead th),
:deep(.holdings-table.v-data-table thead th),
:deep(.holdings-table.v-data-table table thead th),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header table thead th) {
    font-size: 13px !important;
}
.bgg-color {
    background-color: #F1F3F8 !important;
}
</style>
