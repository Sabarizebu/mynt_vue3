<template>
    <div>
        <!-- Slice Order Dialog (minimal scaffold) -->
        <v-dialog v-model="sliceDialog" persistent :scrim="false" width="380px">
            <v-card class="mx-auto py-2 pb-4 text-right rounded-xl elevation-0" color="cardbg" width="100%">
                <v-toolbar class="elevation-0 mb-0" color="transparent" density="compact">
                    <span class="font-weight-bold fs-14">Slice Order</span>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isPlacingOrder" @click="(sliceDialog = false), (orderDialog = true)"
                        color="maintext" size="x-small" variant="outlined" icon>
                        <v-icon color="maintext">mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider class="mb-2"></v-divider>
                <div class="px-4">
                    <v-btn block @click="placeOrder(true)" :loading="isPlacingOrder"
                        :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                        class="text-none rounded-pill elevation-0 white--text px-6" height="40px">
                        {{ buyOrSellIsSell ? 'Sell' : 'Buy' }}
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>

        <!-- Main Order Dialog -->
        <v-card v-if="orderDialog" id="maindiv"
            :class="['pb-5 overflow-hidden rounded-lg', isStickyDialog ? 'sticky-dialog' : '']" :style="dialogStyle"
            color="cardbg" width="540px" height="auto">
            <v-card id="maindivheader" :loading="isPlacingOrder" class="elevation-0 rounded-b-0 pt-4 pb-2"
                :color="!buyOrSellIsSell ? 'secgreen' : 'secred'">
                <v-toolbar class="elevation-0 crd-trn px-2" density="compact">
                    <v-list-item class="px-0">
                        <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-0">
                            {{ menudata[0]?.tsym || '' }} <span class="ml-1 subtext--text fs-10">{{ menudata[0]?.exch ||
                                '' }}</span>
                        </v-list-item-title>
                        <v-list-item-title class="maintext--text font-weight-bold fs-14 mb-1">₹<span>{{ ltpDisplay
                                }}</span>
                            <span class="fs-12 ml-2" :class="chColor">{{ chDisplay }} ({{ chpDisplay }}%)</span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-spacer></v-spacer>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text mr-4 mt-n5"
                        color="maingreen">B</v-card>
                    <v-switch v-model="buyOrSellIsSell" inset></v-switch>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text ml-1 mt-n5"
                        color="mainred">S</v-card>
                </v-toolbar>
            </v-card>

            <div v-if="menudata[0]" style="height: calc(100vh - 320px)" class="overflow-y-auto pos-rlt no-scroll">
                <div class="pt-4 px-6 pb-2">
                    <!-- Order Type Tabs: Regular / Cover / Bracket / GTT / SIP -->
                    <v-tabs v-model="orderType" density="compact" class="mb-2" @update:model-value="onOrderTypeChanged">
                        <v-tab :value="0" class="text-none">Regular</v-tab>
                        <v-tab :value="1" class="text-none">Cover</v-tab>
                        <v-tab :value="2" class="text-none">Bracket</v-tab>
                        <v-tab :value="3" class="text-none">GTT</v-tab>
                        <v-tab v-if="menudata[0]?.exch === 'NSE' || menudata[0]?.exch === 'BSE'" :value="4"
                            class="text-none">SIP</v-tab>
                    </v-tabs>

                    <!-- Investment Type (hidden for SIP and GTT) -->
                    <div v-if="orderType !== 3 && orderType !== 4">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Investment type</p>
                        <v-radio-group @update:model-value="onOrderTypeChanged" v-model="investType" inline
                            hide-details>
                            <v-radio color="maintext" label="Intraday" value="I"></v-radio>
                            <v-radio v-if="menudata[0].exch === 'NSE' || menudata[0].exch === 'BSE'" color="maintext"
                                label="Delivery" value="C"></v-radio>
                            <v-radio v-else color="maintext" label="Carry Forward" value="M"></v-radio>
                        </v-radio-group>
                    </div>

                    <!-- Price Type (hidden for SIP and GTT) -->
                    <div v-if="orderType !== 3 && orderType !== 4">
                        <p class="subtext--text fs-14 font-weight-regular mb-0 mt-2">Select order type</p>
                        <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row>
                            <v-chip value="LMT" :color="priceType === 'LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'LMT' ? 'mainbg' : 'maintext'">
                                Limit
                            </v-chip>
                            <v-chip value="MKT" :color="priceType === 'MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'MKT' ? 'mainbg' : 'maintext'">
                                Market
                            </v-chip>
                            <v-chip value="SL-LMT" :color="priceType === 'SL-LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-LMT' ? 'mainbg' : 'maintext'">
                                SL Limit
                            </v-chip>
                            <v-chip value="SL-MKT" :color="priceType === 'SL-MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-MKT' ? 'mainbg' : 'maintext'">
                                SL Mkt
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <!-- Quantity -->
                    <div class="d-flex justify-space-between mt-2">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                        <p class="font-weight-regular fs-14 subtext--text mb-2 mr-2 text-right">MLot: {{ menudata[0]?.ls
                            ?? '-' }}</p>
                    </div>
                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill" type="number"
                        v-model.number="quantity" hide-details @input="computeMarginAndBrokerage">
                        <template #append>
                            <v-btn @click="increaseQuantity()" icon class="elevation-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M12 8V16" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>
                        <template #prepend-inner>
                            <v-btn @click="decreaseQuantity()" icon class="elevation-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>
                    </v-text-field>
                    <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-1">Freeze qty: {{ menudata[1]?.frzqty
                        ?? '-' }}</p>

                    <!-- Price / Trigger / SL / TP -->
                    <div class="d-flex justify-space-between mt-4">
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Price</p>
                        <p class="font-weight-regular fs-14 subtext--text mb-2 mr-2 text-right">
                            <span class="mr-2">MLot: {{ menudata[0]?.ls ?? '-' }}</span>
                            Tick: {{ menudata[0]?.ti ?? '-' }}
                        </p>
                    </div>
                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill" type="number"
                        :readonly="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="price" hide-details
                        @input="computeMarginAndBrokerage">
                        <template #append>
                            <svg v-if="priceType === 'MKT' || priceType === 'SL-MKT'" xmlns="http://www.w3.org/2000/svg"
                                width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M10.0625 4.8125H9.1875V3.0625C9.1875 1.85456 8.20794 0.875 7 0.875C5.79206 0.875 4.8125 1.85456 4.8125 3.0625V4.8125H3.9375V3.0625C3.9375 1.37112 5.30862 0 7 0C8.69137 0 10.0625 1.37112 10.0625 3.0625V4.8125Z"
                                    fill="#999999" />
                                <path
                                    d="M11.5938 5.6875H2.40625C1.80206 5.6875 1.3125 6.17706 1.3125 6.78125V12.9062C1.3125 13.5104 1.80206 14 2.40625 14H11.5938C12.1979 14 12.6875 13.5104 12.6875 12.9062V6.78125C12.6875 6.17706 12.1979 5.6875 11.5938 5.6875ZM7.4375 10.8754V11.8125C7.4375 12.054 7.2415 12.25 7 12.25C6.7585 12.25 6.5625 12.054 6.5625 11.8125V10.8754C5.62669 10.6339 5.06406 9.67925 5.30556 8.74344C5.54706 7.80763 6.50169 7.245 7.4375 7.4865C8.37331 7.728 8.93594 8.68263 8.69444 9.61844C8.53519 10.2349 8.05394 10.7161 7.4375 10.8754Z"
                                    fill="#999999" />
                            </svg>
                        </template>
                    </v-text-field>
                    <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-1">Circuit level: {{ menudata[1]?.lc
                        ?? '-' }} - {{
                            menudata[1]?.uc ?? '-' }}</p>

                    <v-text-field v-if="priceType === 'SL-LMT' || priceType === 'SL-MKT'" class="mt-2" density="compact"
                        bg-color="secbg" variant="flat" type="number" v-model.number="triggerPrice"
                        label="Trigger price" hide-details />

                    <!-- Cover / Bracket Fields -->
                    <div v-if="orderType === 1 || orderType === 2" class="mt-2">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Stop Loss</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                            type="number" v-model.number="stopLossPrice" hide-details />
                    </div>
                    <div v-if="orderType === 2" class="mt-2">
                        <p class="subtext--text fs-14 font-weight-regular mb-0">Target</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                            type="number" v-model.number="targetPrice" hide-details />
                    </div>

                    <!-- GTT Fields -->
                    <div v-if="orderType === 3" class="mt-2">
                        <!-- Price Type Selection for GTT (like old app) -->
                        <p class="subtext--text fs-14 font-weight-regular mb-2">Select order type</p>
                        <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row class="mb-3">
                            <v-chip value="LMT" :color="priceType === 'LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'LMT' ? 'mainbg' : 'maintext'">Limit</v-chip>
                            <v-chip value="MKT" :color="priceType === 'MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'MKT' ? 'mainbg' : 'maintext'">Market</v-chip>
                            <v-chip value="SL-LMT" :color="priceType === 'SL-LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-LMT' ? 'mainbg' : 'maintext'">SL Limit</v-chip>
                            <v-chip value="SL-MKT" :color="priceType === 'SL-MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-MKT' ? 'mainbg' : 'maintext'">SL Mkt</v-chip>
                        </v-chip-group>
                        <v-divider class="mb-2"></v-divider>
                        <v-row no-gutters>
                            <v-col cols="4" class="pb-2 pr-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Alert</p>
                                <v-select density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    :items="gttCond === '>' ? gttAlertItemsSO : gttAlertItemsST" :disabled="gttOCOPanel"
                                    @update:model-value="gttAlertType === 'VOLUME' ? (gttCond = '>') : ''"
                                    v-model="gttAlertType" hide-details />
                            </v-col>
                            <v-col cols="4" class="pb-2 px-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Condition</p>
                                <v-select density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    :items="gttConItems" :disabled="gttOCOPanel || gttAlertType === 'VOLUME'"
                                    v-model="gttCond" hide-details />
                            </v-col>
                            <v-col cols="4" class="pb-2 pl-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Value</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    v-model.number="gttValue" type="number" min="0" hide-spin-buttons hide-details />
                            </v-col>
                        </v-row>
                        <v-divider class="mb-2 mt-2"></v-divider>
                        <v-row no-gutters>
                            <v-col cols="4" class="pb-2 pr-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    v-model.number="gttQty" type="number" :min="menudata[0]?.ls || 1"
                                    :step="menudata[0]?.ls || 1" hide-spin-buttons hide-details>
                                    <template #append>
                                        <v-btn @click="gttQty = Number(gttQty) + Number(menudata[0]?.ls || 1)" icon
                                            class="elevation-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="white" />
                                                <path d="M12 8V16" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                                <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </v-btn>
                                    </template>
                                    <template #prepend-inner>
                                        <v-btn
                                            @click="gttQty == (menudata[0]?.ls || 1) ? gttQty : (gttQty = Number(gttQty) - Number(menudata[0]?.ls || 1))"
                                            icon class="elevation-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="white" />
                                                <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </v-btn>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col cols="4" class="pb-2 px-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Price</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    :disabled="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="gttPrice"
                                    type="number" min="0" hide-spin-buttons hide-details
                                    @input="computeMarginAndBrokerage">
                                    <template #append>
                                        <svg v-if="priceType === 'MKT' || priceType === 'SL-MKT'"
                                            xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                            viewBox="0 0 14 14" fill="none">
                                            <path
                                                d="M10.0625 4.8125H9.1875V3.0625C9.1875 1.85456 8.20794 0.875 7 0.875C5.79206 0.875 4.8125 1.85456 4.8125 3.0625V4.8125H3.9375V3.0625C3.9375 1.37112 5.30862 0 7 0C8.69137 0 10.0625 1.37112 10.0625 3.0625V4.8125Z"
                                                fill="#999999" />
                                            <path
                                                d="M11.5938 5.6875H2.40625C1.80206 5.6875 1.3125 6.17706 1.3125 6.78125V12.9062C1.3125 13.5104 1.80206 14 2.40625 14H11.5938C12.1979 14 12.6875 13.5104 12.6875 12.9062V6.78125C12.6875 6.17706 12.1979 5.6875 11.5938 5.6875ZM7.4375 10.8754V11.8125C7.4375 12.054 7.2415 12.25 7 12.25C6.7585 12.25 6.5625 12.054 6.5625 11.8125V10.8754C5.62669 10.6339 5.06406 9.67925 5.30556 8.74344C5.54706 7.80763 6.50169 7.245 7.4375 7.4865C8.37331 7.728 8.93594 8.68263 8.69444 9.61844C8.53519 10.2349 8.05394 10.7161 7.4375 10.8754Z"
                                                fill="#999999" />
                                        </svg>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <v-col v-if="priceType === 'SL-LMT' || priceType === 'SL-MKT'" cols="4" class="pb-2 pl-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Trigger</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                    v-model.number="gttTriggerPrice" type="number" min="0" hide-spin-buttons
                                    hide-details />
                            </v-col>
                        </v-row>
                        <v-divider class="mb-2 mt-2"></v-divider>
                        <!-- OCO Panel Toggle -->
                        <v-btn class="font-weight-bold mb-2" :color="gttOCOPanel ? 'primary' : 'maintext'"
                            variant="text" height="40px" block
                            @click="gttOCOPanel = !gttOCOPanel; if (gttOCOPanel) { gttAlertType = 'LTP'; gttCond = '>'; } else { gttAlertType = 'LTP'; gttCond = '<'; }">
                            OCO
                            <v-icon class="ml-auto">{{ gttOCOPanel ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </v-btn>
                        <!-- OCO Panel -->
                        <div v-if="gttOCOPanel" class="mt-2">
                            <p class="subtext--text fs-14 font-weight-regular mb-2">Select order type</p>
                            <v-chip-group v-model="ocoPriceType" @update:model-value="computeMarginAndBrokerage" row
                                class="mb-3">
                                <v-chip value="LMT" :color="ocoPriceType === 'LMT' ? 'maintext' : 'secbg'"
                                    :text-color="ocoPriceType === 'LMT' ? 'mainbg' : 'maintext'">Limit</v-chip>
                                <v-chip value="MKT" :color="ocoPriceType === 'MKT' ? 'maintext' : 'secbg'"
                                    :text-color="ocoPriceType === 'MKT' ? 'mainbg' : 'maintext'">Market</v-chip>
                                <v-chip value="SL-LMT" :color="ocoPriceType === 'SL-LMT' ? 'maintext' : 'secbg'"
                                    :text-color="ocoPriceType === 'SL-LMT' ? 'mainbg' : 'maintext'">SL Limit</v-chip>
                                <v-chip value="SL-MKT" :color="ocoPriceType === 'SL-MKT' ? 'maintext' : 'secbg'"
                                    :text-color="ocoPriceType === 'SL-MKT' ? 'mainbg' : 'maintext'">SL Mkt</v-chip>
                            </v-chip-group>
                            <v-row no-gutters>
                                <v-col cols="4" class="pb-2 pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Alert</p>
                                    <v-select density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        :items="['LTP']" value="LTP" disabled hide-details />
                                </v-col>
                                <v-col cols="4" class="pb-2 px-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Condition</p>
                                    <v-select density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        :items="['<']" value="<" disabled hide-details />
                                </v-col>
                                <v-col cols="4" class="pb-2 pl-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Value</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        v-model.number="ocoValue" type="number" min="0" hide-spin-buttons
                                        hide-details />
                                </v-col>
                            </v-row>
                            <v-divider class="mb-2 mt-2"></v-divider>
                            <v-row no-gutters>
                                <v-col cols="4" class="pb-2 pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        v-model.number="ocoQty" type="number" :min="menudata[0]?.ls || 1"
                                        :step="menudata[0]?.ls || 1" hide-spin-buttons hide-details>
                                        <template #append>
                                            <v-btn @click="ocoQty = Number(ocoQty) + Number(menudata[0]?.ls || 1)" icon
                                                class="elevation-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="12" fill="white" />
                                                    <path d="M12 8V16" stroke="#999999" stroke-width="2"
                                                        stroke-linecap="round" />
                                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                                        stroke-linecap="round" />
                                                </svg>
                                            </v-btn>
                                        </template>
                                        <template #prepend-inner>
                                            <v-btn
                                                @click="ocoQty == (menudata[0]?.ls || 1) ? ocoQty : (ocoQty = Number(ocoQty) - Number(menudata[0]?.ls || 1))"
                                                icon class="elevation-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="12" fill="white" />
                                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                                        stroke-linecap="round" />
                                                </svg>
                                            </v-btn>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="4" class="pb-2 px-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Price</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        :disabled="ocoPriceType === 'MKT' || ocoPriceType === 'SL-MKT'"
                                        v-model.number="ocoPrice" type="number" :min="menudata[1]?.lc || 0"
                                        :max="menudata[1]?.uc || 999999" hide-spin-buttons hide-details>
                                        <template #append>
                                            <svg v-if="ocoPriceType === 'MKT' || ocoPriceType === 'SL-MKT'"
                                                xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                viewBox="0 0 14 14" fill="none">
                                                <path
                                                    d="M10.0625 4.8125H9.1875V3.0625C9.1875 1.85456 8.20794 0.875 7 0.875C5.79206 0.875 4.8125 1.85456 4.8125 3.0625V4.8125H3.9375V3.0625C3.9375 1.37112 5.30862 0 7 0C8.69137 0 10.0625 1.37112 10.0625 3.0625V4.8125Z"
                                                    fill="#999999" />
                                                <path
                                                    d="M11.5938 5.6875H2.40625C1.80206 5.6875 1.3125 6.17706 1.3125 6.78125V12.9062C1.3125 13.5104 1.80206 14 2.40625 14H11.5938C12.1979 14 12.6875 13.5104 12.6875 12.9062V6.78125C12.6875 6.17706 12.1979 5.6875 11.5938 5.6875ZM7.4375 10.8754V11.8125C7.4375 12.054 7.2415 12.25 7 12.25C6.7585 12.25 6.5625 12.054 6.5625 11.8125V10.8754C5.62669 10.6339 5.06406 9.67925 5.30556 8.74344C5.54706 7.80763 6.50169 7.245 7.4375 7.4865C8.37331 7.728 8.93594 8.68263 8.69444 9.61844C8.53519 10.2349 8.05394 10.7161 7.4375 10.8754Z"
                                                    fill="#999999" />
                                            </svg>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col v-if="ocoPriceType === 'SL-LMT' || ocoPriceType === 'SL-MKT'" cols="4"
                                    class="pb-2 pl-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Trigger</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" class="rounded-pill"
                                        v-model.number="ocoTriggerPrice" type="number" min="0" hide-spin-buttons
                                        hide-details />
                                </v-col>
                            </v-row>
                        </div>
                    </div>

                    <!-- SIP Tab - Handled by onOrderTypeChanged function -->
                    <!-- No content needed here as SIP tab click is handled automatically -->

                    <!-- Validity & Disclosed Qty -->
                    <div v-if="orderType !== 3 && orderType !== 4" class="mt-3">
                        <v-checkbox color="maintext" v-model="addValidityQty" hide-details>
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">Add Validity & Disclosed Qty</p>
                            </template>
                        </v-checkbox>
                        <div v-if="addValidityQty" class="mt-2">
                            <v-row no-gutters>
                                <v-col cols="6" class="pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Validity</p>
                                    <v-chip-group v-model="validityType" @update:model-value="computeMarginAndBrokerage"
                                        column>
                                        <v-chip v-if="menudata[0]?.exch !== 'BSE'" value="IOC"
                                            :color="validityType === 'IOC' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'IOC' ? 'mainbg' : 'maintext'">IOC</v-chip>
                                        <v-chip
                                            v-if="(menudata[0]?.exch === 'BFO' || menudata[0]?.exch === 'BCD') && menudata[0]?.exch !== 'BSE'"
                                            value="EOS" :color="validityType === 'EOS' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'EOS' ? 'mainbg' : 'maintext'">EOS</v-chip>
                                        <v-chip value="DAY" :color="validityType === 'DAY' ? 'maintext' : 'secbg'"
                                            :text-color="validityType === 'DAY' ? 'mainbg' : 'maintext'">Day</v-chip>
                                    </v-chip-group>
                                </v-col>
                                <v-col cols="6" class="pl-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Disclosed Qty</p>
                                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                                        type="number" hide-spin-buttons min="0" v-model.number="disclosedQty"
                                        hide-details />
                                </v-col>
                            </v-row>
                        </div>
                    </div>

                    <!-- After Market Order -->
                    <div class="d-flex align-center mt-3">
                        <v-checkbox color="maintext" v-model="afterMarket" hide-details>
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">After market order (AMO)</p>
                            </template>
                        </v-checkbox>
                    </div>

                    <!-- Market Protection % (shown when price type is MKT or SL-MKT) -->
                    <div v-if="orderType !== 3 && orderType !== 4 && (priceType === 'MKT' || priceType === 'SL-MKT')"
                        class="mt-3">
                        <v-divider class="mb-3"></v-divider>
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Market Protection %</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                            v-model.number="marketProtection" type="number" min="0" max="20" step="0.01"
                            hide-spin-buttons hide-details="auto" persistent-hint hint="Enter a value between 1 to 20"
                            @input="handleMarketProtectionInput" @blur="validateMarketProtectionOnBlur" />
                    </div>

                    <!-- Quick Order Link -->
                    <div class="mt-3">
                        <v-btn text block color="primary" variant="text" class="rounded-pill text-none"
                            @click="isQuickOrder = !isQuickOrder">
                            {{ !isQuickOrder ? 'Quick order ' : 'Advanced order ' }}
                            <v-icon size="16">{{ isQuickOrder ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'
                                }}</v-icon>
                        </v-btn>
                    </div>

                    <!-- Margin Preview -->
                    <v-divider class="my-3"></v-divider>
                    <div class="d-flex align-center">
                        <p class="font-weight-medium fs-12 subtext--text mb-0">
                            <span>Margin </span>
                            <span class="ml-1 primary--text">
                                <b>₹{{ orderMarginDisplay }}</b>
                                <span class="ml-1"> + </span>
                                <span class="ml-1 primary--text">
                                    <b>₹{{ chargesDisplay }}</b>
                                </span>
                            </span>
                            <v-icon class="ml-1" size="14" color="maintext">mdi-information-outline</v-icon>
                        </p>
                    </div>
                    <div class="d-flex align-center mt-2">
                        <p class="font-weight-medium fs-12 subtext--text mb-0">
                            <span>Avail </span>
                            <span class="ml-1 primary--text">
                                <b>₹{{ cashAvailableDisplay }}</b>
                            </span>
                            <span class="ml-1 primary--text cursor-pointer" @click="router.push('/funds')">+ Add
                                fund</span>
                            <v-icon class="ml-1" size="14" color="mainred">mdi-alert-octagon</v-icon>
                        </p>
                    </div>
                </div>
            </div>

            <v-divider></v-divider>
            <!-- Button Section for Regular/Cover/Bracket orders -->
            <div v-if="orderType !== 3" class="px-6 py-3">
                <v-row no-gutters>
                    <v-col cols="6" class="pr-2">
                        <v-btn block @click="closeOrderDialog" color="secbg" :disabled="isPlacingOrder"
                            class="text-none rounded-pill elevation-0 subtext--text" height="40px">Cancel</v-btn>
                    </v-col>
                    <v-col cols="6" class="pl-2">
                        <v-btn block @click="placeOrder" :loading="isPlacingOrder"
                            :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                            class="text-none rounded-pill elevation-0 white--text" height="40px">
                            {{ orderContextType === 'mod-order' ? 'Modify' : buyOrSellIsSell ? 'Sell' : 'Buy' }}
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
            <!-- Button Section for GTT orders -->
            <v-toolbar v-else class="tool-sty elevation-0 pt-4 mb-3 px-6" color="cardbg" density="compact">
                <v-spacer></v-spacer>
                <v-btn @click="closeOrderDialog" color="gray" variant="tonal" :disabled="isPlacingOrder"
                    class="text-none rounded-pill elevation-0 subtext--text px-6" height="40px">Cancel</v-btn>
                <v-btn @click="placeOrder" :loading="isPlacingOrder" :disabled="false" variant="elevated"
                    :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                    class="text-none rounded-pill elevation-0 white--text px-6 ml-4" height="40px">
                    {{ orderContextType === 'mod-GTT' ? 'Modify' : 'Create' }} {{ gttOCOPanel ? 'OCO' : 'GTT' }}
                </v-btn>
            </v-toolbar>
        </v-card>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getQuotesdata, getSecuritydata, getPlaceOrder, getOrderMargin, getBrokerage, setOrdprefApi, getGTTPlaceOrder } from '@/components/mixins/getAPIdata'

const router = useRouter()

// Local state (can be replaced/augmented by Pinia orderStore later)
const orderDialog = ref(false)
const sliceDialog = ref(false)
const menudata = ref([])
const buyOrSellIsSell = ref(false)
const investType = ref('I')
const priceType = ref('LMT')
const orderType = ref(0) // 0=Regular,1=Cover,2=Bracket,3=GTT,4=SIP
const quantity = ref(0)
const price = ref(0)
const triggerPrice = ref(0)
const isPlacingOrder = ref(false)
// GTT
const gttAlertType = ref('LTP')
const gttCond = ref('>')
const gttValue = ref(0)
const gttQty = ref(1)
const gttPrice = ref(null)
const gttTriggerPrice = ref(null)
const gttOCOPanel = ref(false)
// GTT Alert Items
const gttAlertItemsSO = ref(['LTP', 'Perc. change', 'ATP', 'OI', 'TOI', '52HIGH', 'VOLUME'])
const gttAlertItemsST = ref(['LTP', 'Perc. change', 'ATP', 'OI', 'TOI', '52LOW'])
const gttConItems = ref(['>', '<'])
// OCO (One-Cancel-Other)
const ocoPrice = ref(null)
const ocoQty = ref(1)
const ocoTriggerPrice = ref(null)
const ocoPriceType = ref('LMT')
const ocoValue = ref(0)
const stopLossPrice = ref(0)
const targetPrice = ref(0)
const disclosedQty = ref(0)
const afterMarket = ref(false)
const marketProtection = ref(5)
const orderContextType = ref('order')
const existingOrderItem = ref(null)
const isStickyDialog = ref(false)
const isQuickOrder = ref(false)
const dialogStyle = ref({})
const addValidityQty = ref(false)
const validityType = ref('DAY')
const charges = ref(0)
// Guard flags to prevent duplicate dialog opening
const isOpeningDialog = ref(false)
let eventListenerAdded = false

const appStore = useAppStore()

const ltpDisplay = computed(() => {
    return (menudata.value?.ltp || menudata.value[0]?.lp || 0).toString()
})
const chDisplay = computed(() => (menudata.value?.ch ?? 0).toString())
const chpDisplay = computed(() => (menudata.value?.chp ?? 0).toString())
const chColor = computed(() => {
    const ch = Number(menudata.value?.ch || 0)
    return ch > 0 ? 'maingreen--text' : ch < 0 ? 'mainred--text' : 'subtext--text'
})

// Margin / Brokerage preview state
const orderMargin = ref(0)
const cashAvailable = ref(0)
const orderMarginDisplay = computed(() => Number(orderMargin.value || 0).toFixed(2))
const cashAvailableDisplay = computed(() => Number(cashAvailable.value || 0).toFixed(2))
const chargesDisplay = computed(() => Number(charges.value || 0).toFixed(2))

function handleMarketProtectionInput() {
    // Allow dynamic input - user can type freely (like price input)
    // Validation will be done on blur and on order placement
    const value = Number(marketProtection.value)

    // Handle negative values - set to 0 and show warning
    if (!isNaN(value) && value < 0) {
        marketProtection.value = 0
        appStore.showSnackbar(2, 'Market Protection cannot be negative. Set to 0')
        return
    }

    // Handle values above 20 - set to 20 and show warning
    if (!isNaN(value) && value > 20) {
        marketProtection.value = 20
        appStore.showSnackbar(2, 'Market Protection cannot exceed 20%. Set to maximum: 20%')
        computeMarginAndBrokerage()
        return
    }

    // Show warning if value is 0 (but allow typing)
    if (!isNaN(value) && value === 0 && value !== '' && value !== null) {
        // Don't auto-correct while typing, just show warning
        appStore.showSnackbar(2, 'Market Protection must be above zero')
    }

    // Recalculate margin only if value is valid (0 < value <= 20)
    if (!isNaN(value) && value > 0 && value <= 20) {
        computeMarginAndBrokerage()
    }
}

function validateMarketProtectionOnBlur() {
    // Validate on blur - show warning if invalid (like price input validation)
    const value = Number(marketProtection.value)

    if (isNaN(value) || value === null || value === '' || value <= 0) {
        // Empty, invalid, or <= 0 - set to default
        marketProtection.value = 5
        appStore.showSnackbar(2, 'Market Protection must be above zero.')
        computeMarginAndBrokerage()
        return
    }

    if (value > 20) {
        // Value above 20 - set to maximum
        marketProtection.value = 20
        appStore.showSnackbar(2, 'Market Protection cannot exceed 20%.')
        computeMarginAndBrokerage()
        return
    }

    // Valid value (0 < value <= 20) - just recalculate
    computeMarginAndBrokerage()
}

async function computeMarginAndBrokerage() {
    const q = menudata.value[0]
    if (!q || !quantity.value) {
        orderMargin.value = 0
        return
    }
    try {
        const item = {
            exch: q.exch,
            tsym: encodeURIComponent(q.tsym),
            qty: (quantity.value * Number(q.ls || 1)),
            prc: price.value,
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
            trgprc: (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') ? triggerPrice.value : 0,
        }
        const m = await getOrderMargin(item)
        if (m && m.stat === 'Ok') {
            orderMargin.value = Number(m.ordermargin || 0)
            cashAvailable.value = Number(m.avbal || m.avbma || 0)
        }
        const b = await getBrokerage(item).catch(() => { })
        if (b && b.charges) {
            charges.value = Number(b.charges || 0)
        }
    } catch (e) {
        // silent
    }
}

function onOrderTypeChanged() {
    // Handle SIP tab click (orderType === 4)
    if (orderType.value === 4) {
        // SIP tab clicked - redirect to orders page or trigger SIP dialog
        const currentPath = router.currentRoute.value.path

        // Get security data - use menudata[0] (quote) as primary, menudata[1] (security) as fallback
        const quoteData = menudata.value[0] || {}
        const securityData = menudata.value[1] || {}

        // Prepare SIP security data with proper fallbacks
        const sipSecurityData = {
            token: quoteData.token || securityData.token,
            tsym: quoteData.tsym || securityData.tsym,
            exch: quoteData.exch || securityData.exch,
            ls: securityData.ls || quoteData.ls || 1,
            symbol: quoteData.tsym || securityData.tsym || quoteData.symbol || securityData.symbol,
        }

        // Phase 8: Navigate to orders page with security data
        // Use /orders/sip route to ensure SIP tab is shown
        if (currentPath !== '/orders' && !currentPath.startsWith('/orders/')) {
            // Navigate to SIP orders page with security data
            router.push({
                path: '/orders/sip',
                query: {
                    // Pass security data as query params for better compatibility
                    token: sipSecurityData.token,
                    tsym: sipSecurityData.tsym,
                    exch: sipSecurityData.exch,
                    ls: sipSecurityData.ls,
                }
            }).then(() => {
                // Navigation will trigger handleRouteParams in StockOrderSrc
                // which will switch to SIP tab and trigger the event
                // The watch on bodytab will trigger siporder-trigger event
            })
        } else {
            // Already on orders page - switch to SIP tab and emit event
            // First, set the tab to SIP (index 4) using the order-tab event
            window.dispatchEvent(new CustomEvent('order-tab', {
                detail: 4
            }))

            // Trigger SIP order dialog with security data after a delay
            // to ensure the SIP tab component is mounted and ready
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('siporder-trigger', {
                    detail: sipSecurityData
                }))
            }, 500)
        }

        // Close order dialog
        closeOrderDialog()
        return
    }

    // Handle other order types (Regular, Cover, Bracket, GTT)
    if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
        price.value = 0
    } else if (menudata.value[0]?.lp && (priceType.value === 'LMT' || priceType.value === 'SL-LMT')) {
        price.value = Number(menudata.value[0].lp)
    }
    if (priceType.value !== 'SL-LMT' && priceType.value !== 'SL-MKT') {
        triggerPrice.value = 0
    }
    computeMarginAndBrokerage()
}

async function handleMenuDialogEvent(event) {
    const { type, token, exch, tsym, trantype, item } = event.detail || {}
    if (!type || !token || !exch || !tsym) return

    // Guard 0: Ignore alert types - these are handled by AlertSrceen component
    if (type === 'alert' || type === 'm-alert') {
        return
    }

    // Guard 1: Prevent duplicate opening if dialog is already opening
    if (isOpeningDialog.value) {
        console.warn('[StockOrderWindow] Dialog is already opening, ignoring duplicate event')
        return
    }

    // Guard 2: If dialog is already open, close it first before opening with new data
    if (orderDialog.value) {
        console.log('[StockOrderWindow] Dialog already open, closing first...')
        closeOrderDialog()
        await nextTick()
    }

    // Guard 3: Set flag to prevent concurrent openings
    isOpeningDialog.value = true

    // Handle cancel order directly (no dialog needed)
    if (type === 'cancel-order' && item) {
        isOpeningDialog.value = false
        await cancelOrder(item)
        return
    }

    try {
        orderContextType.value = type
        existingOrderItem.value = item || null
        // Fetch quote and security
        const q = await getQuotesdata(`${exch}|${token}`)
        let s = null
        if (q && q.instname !== 'UNDIND' && q.instname !== 'COM') {
            s = await getSecuritydata(`${exch}|${token}`)
        }
        menudata.value = []
        menudata.value.push(q)
        if (s) menudata.value.push(s)

        // Defaults
        buyOrSellIsSell.value = (trantype || '').toLowerCase() === 's'
        investType.value = (exch === 'NSE' || exch === 'BSE') ? 'C' : 'I'
        priceType.value = 'LMT'
        orderType.value = 0
        quantity.value = Number(q?.ls || 1)
        price.value = Number(q?.lp || 0)
        triggerPrice.value = 0
        stopLossPrice.value = 0
        targetPrice.value = 0
        disclosedQty.value = 0
        afterMarket.value = false
        marketProtection.value = 5
        // Reset GTT fields
        gttQty.value = 1
        gttPrice.value = null
        gttTriggerPrice.value = null
        gttOCOPanel.value = false
        gttAlertType.value = 'LTP'
        gttCond.value = '>'
        gttValue.value = 0
        // Reset OCO fields
        ocoQty.value = 1
        ocoPrice.value = null
        ocoTriggerPrice.value = null
        ocoPriceType.value = 'LMT'
        ocoValue.value = 0

        // Modify / Re-order / Exit prefill
        if (item && (type === 'mod-order' || type === 're-order' || type === 'exit-order')) {
            priceType.value = item.prctyp || 'LMT'
            quantity.value = Number(Math.abs(item.qty) / Number(q?.ls || 1)) || Number(q?.ls || 1)
            price.value = (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? 0 : Number(item.prc || q?.lp || 0)
            triggerPrice.value = (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') ? Number(item.trgprc || 0) : 0
            buyOrSellIsSell.value = (item.trantype || '').toUpperCase() === 'S'
        }

        // GTT modify prefill (like old app line 1299-1336)
        // Handle order-GTT separately (doesn't require item)
        if (type === 'order-GTT') {
            orderType.value = 3
            gttCond.value = '>'
            gttOCOPanel.value = false
            gttValue.value = 0
            ocoValue.value = 0
            gttAlertType.value = 'LTP'
            gttQty.value = 1
            ocoQty.value = 1
            priceType.value = 'LMT'
        } else if (item && type === 'mod-GTT') {
            // Parse alert type from item.res.ai_t (like old app line 1301-1317)
            const ai_t = item.res?.ai_t || ''
            gttAlertType.value = ai_t.includes('LTP_') ? 'LTP' :
                ai_t.includes('CH_PER_') ? 'Perc. change' :
                    ai_t.includes('ATP_') ? 'ATP' :
                        ai_t.includes('OI_') ? 'OI' :
                            ai_t.includes('TOI_') ? 'TOI' :
                                ai_t.includes('_52HIGH') ? '52HIGH' :
                                    ai_t.includes('_52LOW') ? '52LOW' :
                                        ai_t.includes('VOLUME_') ? 'VOLUME' : 'LTP'
            gttCond.value = ai_t.includes('A_O') ? '>' : '<'
            buyOrSellIsSell.value = (item.trantype || '').toUpperCase() === 'S'

            if (item.res?.place_order_params) {
                gttValue.value = Number(item.res?.oivariable?.[0]?.d || item.value || 0)
                priceType.value = item.res.place_order_params.prctyp || 'LMT'
                investType.value = item.res.place_order_params.prd || investType.value
                gttQty.value = Number(item.res.place_order_params.qty) / Number(q?.ls || 1) || 1
                gttPrice.value = (item.res.place_order_params.prctyp === 'MKT' || item.res.place_order_params.prctyp === 'SL-MKT') ? 0 : Number(item.res.place_order_params.prc || 0)
                gttTriggerPrice.value = Number(item.res.place_order_params.trgprc || 0)
            }

            if (item.res?.place_order_params_leg2) {
                gttOCOPanel.value = true
                ocoValue.value = Number(item.res?.oivariable?.[1]?.d || 0)
                ocoPriceType.value = item.res.place_order_params_leg2.prctyp || 'LMT'
                ocoQty.value = Number(item.res.place_order_params_leg2.qty) / Number(q?.ls || 1) || 1
                ocoPrice.value = (item.res.place_order_params_leg2.prctyp === 'MKT' || item.res.place_order_params_leg2.prctyp === 'SL-MKT') ? 0 : Number(item.res.place_order_params_leg2.prc || 0)
                ocoTriggerPrice.value = Number(item.res.place_order_params_leg2.trgprc || 0)
            }

            orderType.value = 3
        }

        // Load preferences (best-effort)
        try {
            const pref = await setOrdprefApi({}, false)
            if (pref && pref.stat === 'Ok') {
                if (pref.quickord !== undefined) isQuickOrder.value = pref.quickord
                if (pref.ordsrcpop !== undefined) isStickyDialog.value = pref.ordsrcpop
                if (pref.investype) investType.value = pref.investype
                if (pref.prc) priceType.value = pref.prc
                if (pref.ordqty) quantity.value = Number(pref.ordqty) || quantity.value
            }
        } catch (e) { }

        orderDialog.value = true
        console.log('[StockOrderWindow] Dialog opened')
        await nextTick()
        restoreDialogPosition()
        setupDragFunctionality()
        computeMarginAndBrokerage()
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to open order window')
        console.error('[StockOrderWindow] Error opening dialog:', e)
    } finally {
        // Clear the opening flag after a short delay
        setTimeout(() => {
            isOpeningDialog.value = false
        }, 500)
    }
}

// Cancel order function - handles cancel-order directly without opening dialog
async function cancelOrder(item) {
    if (!item || !item.norenordno) {
        appStore.showSnackbar(2, 'Invalid order data')
        return
    }

    try {
        isPlacingOrder.value = true

        // Determine cancel type: 'can' for regular cancel, 'can-ex' for exit order
        const cancelType = item.exord ? 'can-ex' : 'can'

        // Build cancel item based on type
        const cancelItem = {
            uid: sessionStorage.getItem('userid'),
        }

        if (cancelType === 'can-ex') {
            // Exit order (SNO order) - needs snonum and prd
            cancelItem.norenordno = item.snonum || item.norenordno
            cancelItem.prd = item.prd || 'I'
        } else {
            // Regular cancel order - needs norenordno
            cancelItem.norenordno = item.norenordno
        }

        // Call cancel order API
        const res = await getPlaceOrder(cancelItem, cancelType)

        if (res?.stat !== 'Ok') {
            appStore.showSnackbar(2, res?.emsg || 'Failed to cancel order')
        } else {
            appStore.showSnackbar(1, cancelType === 'can-ex' ? 'Order exited successfully' : 'Order cancelled successfully')
            // Trigger orderbook update to refresh the orders list
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to cancel order')
        console.error('Cancel order error:', e)
    } finally {
        isPlacingOrder.value = false
    }
}

function increaseQuantity() {
    const q = menudata.value[0]
    if (!q) return
    const ls = Number(q.ls || 1)
    const step = q.exch === 'MCX' ? 1 : ls
    let adjustedQty = Math.round(Number(quantity.value) / ls) * ls
    quantity.value = Number(quantity.value) !== adjustedQty ? adjustedQty : Number(quantity.value) + step
    computeMarginAndBrokerage()
}

function decreaseQuantity() {
    const q = menudata.value[0]
    if (!q) return
    const ls = Number(q.ls || 1)
    const step = q.exch === 'MCX' ? 1 : ls
    let adjustedQty = Math.floor(Number(quantity.value) / ls) * ls
    if (Number(quantity.value) !== adjustedQty) {
        quantity.value = adjustedQty
    } else if (Number(quantity.value) > step) {
        quantity.value -= step
    }
    computeMarginAndBrokerage()
}

function closeOrderDialog() {
    // Set orderDialog to false immediately (do this first to close dialog immediately)
    orderDialog.value = false

    // Use nextTick to ensure the dialog closes before resetting state
    nextTick(() => {
        // Clear any active drag handlers that might interfere
        if (document.onmouseup) {
            document.onmouseup = null
        }
        if (document.onmousemove) {
            document.onmousemove = null
        }

        // Reset all state after dialog is closed
        orderDialog.value = false
        menudata.value = []
        quantity.value = 0
        price.value = 0
        buyOrSellIsSell.value = false
        orderType.value = 0
        investType.value = 'I'
        priceType.value = 'LMT'
        addValidityQty.value = false
        validityType.value = 'DAY'
        disclosedQty.value = 0
        afterMarket.value = false
        triggerPrice.value = 0
        stopLossPrice.value = 0
        targetPrice.value = 0
        gttAlertType.value = 'LTP'
        gttCond.value = '>'
        gttValue.value = 0
        gttQty.value = 1
        gttPrice.value = null
        gttTriggerPrice.value = null
        gttOCOPanel.value = false
        ocoQty.value = 1
        ocoPrice.value = null
        ocoTriggerPrice.value = null
        ocoPriceType.value = 'LMT'
        ocoValue.value = 0
    })
}

function validateOrder() {
    const q = menudata.value[0]
    if (!q) return 'Symbol not loaded'
    if (!(quantity.value > 0)) return 'Quantity must be greater than zero'
    if ((priceType.value === 'LMT' || priceType.value === 'SL-LMT') && (price.value <= 0)) return 'Price must be greater than zero'
    if ((priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') && (triggerPrice.value <= 0)) return 'Trigger price must be greater than zero'
    // Market Protection validation (must be above zero and not exceed 20)
    if ((priceType.value === 'MKT' || priceType.value === 'SL-MKT') && marketProtection.value) {
        const mpValue = Number(marketProtection.value)
        if (isNaN(mpValue) || mpValue <= 0) {
            return 'Market Protection must be above zero'
        }
        if (mpValue > 20) {
            return 'Market Protection cannot exceed 20%'
        }
    }
    // Lot size multiple validation (except MCX where step=1)
    const ls = Number(q.ls || 1)
    if (q.exch !== 'MCX' && (quantity.value % ls !== 0)) return `Quantity must be a multiple of lot size ${ls}`
    // Tick size multiple validation
    const ti = Number(q.ti || 0)
    if (ti > 0) {
        const isTickMultiple = (val) => Math.abs(val / ti - Math.round(val / ti)) < 1e-6
        if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            if (!isTickMultiple(Number(price.value || 0))) return `Price should be multiple of tick size ${ti}`
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            if (!isTickMultiple(Number(triggerPrice.value || 0))) return `Trigger should be multiple of tick size ${ti}`
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value && !isTickMultiple(Number(stopLossPrice.value))) return `Stop loss should be multiple of tick size ${ti}`
            if (orderType.value === 2 && targetPrice.value && !isTickMultiple(Number(targetPrice.value))) return `Target should be multiple of tick size ${ti}`
        }
    }
    // Circuit limits validation
    const lc = Number(q.lc)
    const uc = Number(q.uc)
    if (isFinite(lc) && isFinite(uc)) {
        if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            const p = Number(price.value || 0)
            if (p < lc || p > uc) return `Price must be within circuit limits ${lc} - ${uc}`
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            const t = Number(triggerPrice.value || 0)
            if (t < lc || t > uc) return `Trigger must be within circuit limits ${lc} - ${uc}`
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value) {
                const sl = Number(stopLossPrice.value)
                if (sl < lc || sl > uc) return `Stop loss must be within circuit limits ${lc} - ${uc}`
            }
            if (orderType.value === 2 && targetPrice.value) {
                const tp = Number(targetPrice.value)
                if (tp < lc || tp > uc) return `Target must be within circuit limits ${lc} - ${uc}`
            }
        }
    }
    // Cover/Bracket requirements
    if (orderType.value === 1 && !(stopLossPrice.value > 0)) return 'Stop loss is required for Cover orders'
    if (orderType.value === 2) {
        if (!(stopLossPrice.value > 0)) return 'Stop loss is required for Bracket orders'
        if (!(targetPrice.value > 0)) return 'Target is required for Bracket orders'
    }
    return null
}

async function placeOrder(loop) {
    const q = menudata.value[0]
    if (!q) return
    const err = validateOrder()
    if (err) {
        appStore.showSnackbar(2, err)
        return
    }
    try {
        isPlacingOrder.value = true
        // If GTT order, call GTT API
        if (orderType.value === 3) {
            let gttItem
            const con = gttCond.value === '>' ? 'A_O' : 'B_O'
            const aler = gttAlertType.value === 'Perc. change' ? 'CH_PER' : gttAlertType.value
            const ait = `${aler}_${con}`
            const uid = sessionStorage.getItem('userid')

            // Handle OCO (One-Cancel-Other) orders
            if (gttOCOPanel.value) {
                gttItem = {
                    uid: uid,
                    ai_t: 'LMT_BOS_O',
                    al_id: (orderContextType.value === 'mod-GTT' && existingOrderItem.value?.al_id) ? existingOrderItem.value.al_id : '',
                    validity: 'GTT',
                    tsym: q.tsym,
                    exch: q.exch,
                    oivariable: [
                        { d: String(gttValue.value || 0), var_name: 'x' },
                        { d: String(ocoValue.value || 0), var_name: 'y' },
                    ],
                    place_order_params: {
                        tsym: q.tsym,
                        exch: q.exch,
                        trantype: buyOrSellIsSell.value ? 'S' : 'B',
                        prctyp: priceType.value,
                        prd: investType.value,
                        ret: 'DAY',
                        actid: uid,
                        uid: uid,
                        ordersource: 'TP',
                        qty: String(gttQty.value * Number(q.ls || 1)),
                        prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(gttPrice.value || 0),
                        trgprc: String(gttTriggerPrice.value || 0),
                    },
                    place_order_params_leg2: {
                        tsym: q.tsym,
                        exch: q.exch,
                        trantype: buyOrSellIsSell.value ? 'S' : 'B',
                        prctyp: ocoPriceType.value,
                        prd: investType.value,
                        ret: 'DAY',
                        actid: uid,
                        uid: uid,
                        ordersource: 'TP',
                        qty: String(ocoQty.value * Number(q.ls || 1)),
                        prc: (ocoPriceType.value === 'MKT' || ocoPriceType.value === 'SL-MKT') ? '0' : String(ocoPrice.value || 0),
                        trgprc: String(ocoTriggerPrice.value || 0),
                    },
                }
            } else {
                // Regular GTT order
                gttItem = {
                    uid: uid,
                    tsym: q.tsym,
                    exch: q.exch,
                    ai_t: ait,
                    al_id: (orderContextType.value === 'mod-GTT' && existingOrderItem.value?.al_id) ? existingOrderItem.value.al_id : '',
                    validity: 'GTT',
                    d: String(gttValue.value || 0),
                    trantype: buyOrSellIsSell.value ? 'S' : 'B',
                    prctyp: priceType.value,
                    prd: investType.value,
                    ret: 'DAY',
                    actid: uid,
                    qty: String(gttQty.value * Number(q.ls || 1)),
                    prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(gttPrice.value || 0),
                    trgprc: String(gttTriggerPrice.value || 0),
                }
            }

            // Determine GTT URL
            let gttUrl = 'PlaceGTTOrder'
            if (orderContextType.value === 'mod-GTT' && existingOrderItem.value?.norenordno) {
                gttUrl = 'ModifyGTTOrder'
            } else if (gttOCOPanel.value) {
                gttUrl = 'PlaceOCOOrder'
            }

            const resGtt = await getGTTPlaceOrder(gttItem, gttUrl)
            if (resGtt?.stat !== 'Ok' && resGtt?.stat !== 'OI created' && resGtt?.stat !== 'OI replaced') {
                appStore.showSnackbar(2, resGtt?.emsg || 'GTT order failed')
            } else {
                // Close dialog first (like old app) - close on successful order regardless of sticky setting
                if (!loop) {
                    orderDialog.value = false
                    // Use nextTick to ensure dialog closes before showing snackbar
                    await nextTick()
                }

                // Show success message in snackbar (right corner bottom like old app)
                const successMsg = resGtt?.stat === 'OI created' ? 'GTT Order have been Placed' :
                    resGtt?.stat === 'OI replaced' ? 'GTT Order have been Modified' :
                        gttUrl === 'ModifyGTTOrder' ? 'GTT order modified' : 'GTT order placed'
                appStore.showSnackbar(1, successMsg)

                // Trigger orderbook update
                try { window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'gtt' } })) } catch (_) { }
            }
            return
        }

        const item = {
            uid: sessionStorage.getItem('userid'),
            actid: sessionStorage.getItem('userid'),
            exch: q.exch,
            tsym: q.tsym,
            ret: addValidityQty.value ? validityType.value : 'DAY',
            qty: (quantity.value).toString(),
            prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(price.value),
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            item['trgprc'] = String(triggerPrice.value)
        }
        if (orderType.value === 1 || orderType.value === 2) {
            if (stopLossPrice.value) item['blprc'] = String(stopLossPrice.value)
        }
        if (orderType.value === 2) {
            if (targetPrice.value) item['bpprc'] = String(targetPrice.value)
        }
        if (disclosedQty.value) item['dscqty'] = String(disclosedQty.value)
        if (afterMarket.value) item['amo'] = 'Yes'
        if (marketProtection.value && (priceType.value === 'MKT' || priceType.value === 'SL-MKT')) item['mktProt'] = String(marketProtection.value)

        let typeArg = 'place'
        if (orderContextType.value === 'mod-order') typeArg = 'mod'
        if (orderContextType.value === 'exit-order') typeArg = 'can-ex'
        if (orderContextType.value === 're-order') typeArg = 're'
        if (typeArg === 'mod' || typeArg === 'can-ex') {
            const nor = existingOrderItem.value?.norenordno
            if (nor) item['norenordno'] = nor
        }

        const res = await getPlaceOrder(item, typeArg)
        if (res?.stat !== 'Ok') {
            appStore.showSnackbar(2, res?.emsg || 'Order failed')
        } else {
            // Close dialog first (like old app) - close on successful order regardless of sticky setting
            if (!loop) {
                orderDialog.value = false
                // Use nextTick to ensure dialog closes before showing snackbar
                await nextTick()
            }

            // Show success message in snackbar (right corner bottom like old app)
            appStore.showSnackbar(1, 'Order placed successfully')

            // Trigger orderbook update
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
            } catch (_) { }

            // Save preferences on successful order
            if (orderContextType.value === 'order') {
                try {
                    await setOrdprefApi({
                        quickord: isQuickOrder.value,
                        ordsrcpop: isStickyDialog.value,
                        investype: investType.value,
                        prc: priceType.value,
                        ordqty: quantity.value
                    }, true)
                } catch (e) { }
            }
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to place order')
    } finally {
        isPlacingOrder.value = false
        orderDialog.value = false
    }
}

onMounted(() => {
    // Guard: Only add event listener if not already added (prevent duplicate registration)
    if (!eventListenerAdded) {
        window.addEventListener('menudialog', handleMenuDialogEvent)
        eventListenerAdded = true
        console.log('[StockOrderWindow] Event listener registered')
    }

    window.addEventListener('web-scoketConn', (ev) => {
        const data = ev.detail
        if (!data || !menudata.value[0]) return
        if (data.token === menudata.value[0].token) {
            menudata.value['ltp'] = Number(data.lp).toFixed(2)
            menudata.value['ch'] = Number(data.ch || 0).toFixed(2)
            menudata.value['chp'] = Number(data.chp || 0).toFixed(2)
            computeMarginAndBrokerage()
        }
    })
})

// Drag functionality
function setupDragFunctionality() {
    setTimeout(() => {
        const elmnt = document.getElementById('maindiv')
        if (!elmnt) return

        dragElement(elmnt)
    }, 100)
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    const header = document.getElementById(elmnt.id + 'header')

    const dragMouseDown = (e) => {
        e = e || window.event
        // Don't interfere with button clicks
        const target = e.target || e.srcElement
        if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.v-btn'))) {
            return
        }
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
    }

    const elementDrag = (e) => {
        e = e || window.event
        e.preventDefault()
        pos1 = pos3 - e.clientX
        pos2 = pos4 - e.clientY
        pos3 = e.clientX
        pos4 = e.clientY
        elmnt.style.position = 'fixed'
        elmnt.style.top = (elmnt.offsetTop - pos2) + 'px'
        elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px'
        elmnt.style.zIndex = '9999'
    }

    const closeDragElement = () => {
        document.onmouseup = null
        document.onmousemove = null
        saveDialogPosition(elmnt)
    }

    if (header) {
        header.onmousedown = dragMouseDown
    } else {
        elmnt.onmousedown = dragMouseDown
    }
}

function saveDialogPosition(element) {
    const position = {
        top: element.style.top || element.offsetTop + 'px',
        left: element.style.left || element.offsetLeft + 'px'
    }
    if (position.top && position.left && (position.top !== '0px' || position.left !== '0px')) {
        localStorage.setItem('stockOrderWindow_position', JSON.stringify(position))
    }
}

function restoreDialogPosition() {
    const savedPosition = localStorage.getItem('stockOrderWindow_position')
    if (!savedPosition) return

    try {
        const position = JSON.parse(savedPosition)
        if (position.top && position.left) {
            dialogStyle.value = {
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: '9999'
            }

            nextTick(() => {
                const elmnt = document.getElementById('maindiv')
                if (!elmnt) return

                requestAnimationFrame(() => {
                    const rect = elmnt.getBoundingClientRect()
                    const vw = window.innerWidth
                    const vh = window.innerHeight

                    if (rect.right > vw) dialogStyle.value.left = (vw - rect.width) + 'px'
                    if (rect.bottom > vh) dialogStyle.value.top = (vh - rect.height) + 'px'
                    if (rect.left < 0) dialogStyle.value.left = '0px'
                    if (rect.top < 0) dialogStyle.value.top = '0px'
                })
            })
        }
    } catch (e) {
        localStorage.removeItem('stockOrderWindow_position')
    }
}

onBeforeUnmount(() => {
    // Guard: Only remove if it was added
    if (eventListenerAdded) {
        window.removeEventListener('menudialog', handleMenuDialogEvent)
        eventListenerAdded = false
        isOpeningDialog.value = false
        console.log('[StockOrderWindow] Event listener removed')
    }
})
</script>


<style>
:deep(.v-chip.v-chip--link:focus-visible),
:deep(.v-chip.v-chip--link:focus) {
    outline: 2px solid black !important;
    outline-offset: 2px;
}

/* Optional: add hover effect too */
:deep(.v-chip:hover) {
    box-shadow: 0 0 0 2px black inset !important;
}
</style>