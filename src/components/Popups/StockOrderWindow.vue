<template>
    <div>
        <!-- Slice Order Dialog -->
        <v-dialog v-model="sliceDialog" persistent :scrim="false" width="380px">
            <v-card class="mx-auto py-2 pb-4 text-right" style="border-radius: 19px;" elevation="6" color="cardbg"
                width="100%">
                <v-toolbar class="elevation-0 mb-0" color="transparent" density="compact"
                    style="border-bottom: 1px solid #e0e0e0;">
                    <span class="font-weight-bold fs-13 mx-6" style="color: black !important;">Slice Order</span>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isPlacingOrder" @click="closeSliceDialog" color="maintext" size="x-small"
                        variant="outlined" icon class="mx-4">
                        <v-icon color="maintext">mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-divider class="mb-2"></v-divider>
                <div class="px-3">
                    <v-row class="pb-4" style="margin: 2px auto !important;">
                        <v-col cols="6" class="text-left pb-2">
                            <p class="font-weight-bold fs-14 maintext--text mb-0">
                                {{ menudata[0]?.tsym || '' }}
                                <span class="ml-1 subtext--text fs-10">{{ menudata[0]?.exch || '' }}</span>
                            </p>
                        </v-col>
                        <v-col cols="6" class="text-right pb-0">
                            <p class="font-weight-bold fs-14 maintext--text mb-0">
                                {{ sliceFzqty[0] || 0 }} <span class="fs-12 subtext--text">x {{ sliceFq === 1 ? '1' :
                                    sliceFq }}</span>
                            </p>
                        </v-col>
                        <v-col v-if="sliceFzqty[sliceFq] > 0" cols="6" class="text-left pb-0">
                            <p class="font-weight-bold fs-14 maintext--text mb-0">
                                {{ menudata[0]?.tsym || '' }}
                                <span class="ml-1 subtext--text fs-10">{{ menudata[0]?.exch || '' }}</span>
                            </p>
                        </v-col>
                        <v-col v-if="sliceFzqty[sliceFq] > 0" cols="6" class="text-right pb-0">
                            <p class="font-weight-bold fs-14 maintext--text mb-0">
                                {{ sliceFzqty[sliceFq] }}
                                <span class="fs-12 subtext--text">x 1</span>
                            </p>
                        </v-col>
                    </v-row>

                    <v-btn block @click="placeSliceOrder" :loading="isPlacingOrder"
                        :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                        class="text-none rounded-pill elevation-0 white--text px-6" height="40px">
                        {{ buyOrSellIsSell ? 'Sell' : 'Buy' }}
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>

        <!-- Main Order Dialog -->
        <v-card v-if="orderDialog" id="maindiv" elevation="6"
            :class="['pb-5 overflow-hidden rounded-lg', isStickyDialog ? 'sticky-dialog' : '']" :style="dialogStyle"
            color="cardbg" :width="isQuickOrder ? '400px' : '540px'" height="auto" >
            <v-card id="maindivheader" :loading="isPlacingOrder" class="elevation-0 rounded-b-0 "
                :class="isQuickOrder ? 'py-2 pt-3 pb-3' : 'pt-4 pb-2'" :color="!buyOrSellIsSell ? 'secgreen' : 'secred'">
                <v-toolbar class="elevation-0 " :class="isQuickOrder ? 'pr-4' : 'px-2'" density="compact"
                    style="background-color: #00000000 !important;">
                    <div :class="isQuickOrder ? 'px-5 pt-3 ' : 'px-5'">
                        <p class="font-weight-bold  maintext--text mb-0" style="font-size: 16px !important;">
                            {{ menudata[0]?.tsym || '' }} <span class="ml-1 subtext--text fs-10">{{ menudata[0]?.exch ||
                                '' }}</span>
                        </p>
                        <p class="maintext--text font-weight-bold fs-14 mb-1">
                            ₹<span>{{ ltpDisplay }}</span>
                            <span class="fs-12 ml-2" :style="{ color: chColorStyle }" :class="chColor">{{ chDisplay }}
                                ({{ chpDisplay }}%)</span>
                        </p>
                    </div>
                    <v-spacer></v-spacer>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text mr-0"
                        color="maingreen">B</v-card>
                    <v-switch v-model="buyOrSellIsSell"  hide-details class="mx-2 tenure-switch"></v-switch>
                    <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text ml-0"
                        color="mainred">S</v-card>
                </v-toolbar>
            </v-card>

            <div v-if="menudata[0]" :style="{ height: isQuickOrder ? '380px' : 'calc(100vh - 320px)' }"
                class="overflow-y-auto pos-rlt no-scroll">
                <div class="px-6  py-1">
                    <!-- Order Type Tabs: Regular / Cover / Bracket / GTT / SIP -->
                    <div v-if="!isQuickOrder" class="d-flex align-center" style="border-bottom: 1px solid #e0e0e0;">
                        <v-tabs v-model="orderType" density="compact" class="mb-0 flex-grow-1"
                            @update:model-value="onOrderTypeChanged">
                            <v-tab :value="0" class="text-none fs-14">Regular</v-tab>
                            <v-tab :value="1" class="text-none fs-14">Cover</v-tab>
                            <v-tab :value="2" class="text-none fs-14">Bracket</v-tab>
                            <v-tab :value="3" class="text-none fs-14">GTT</v-tab>
                            <v-tab v-if="menudata[0]?.exch === 'NSE' || menudata[0]?.exch === 'BSE'" :value="4"
                                class="text-none fs-12">SIP</v-tab>
                        </v-tabs>
                        <v-menu offset-y right>
                            <template v-slot:activator="{ props }">
                                <v-btn icon v-bind="props" variant="text" density="compact">
                                    <v-badge :model-value="isStickyDialog || quickOrderDefault" dot overlap
                                        color="warning">
                                        <v-icon>mdi-dots-vertical</v-icon>
                                    </v-badge>
                                </v-btn>
                            </template>
                            <v-list density="compact" class="py-2 ">
                                <v-list-item class="px-3">
                                    <v-switch v-model="isStickyDialog" color="primary" hide-details density="compact"
                                        @update:model-value="saveOrderPreferences" class="ma-2">
                                        <template #label>
                                            <div class="d-flex align-center">
                                                <span class="fs-14 maintext--text">Sticky {{ isStickyDialog ? 'On' :
                                                    'Off' }}</span>
                                                <v-tooltip location="bottom" color="black">
                                                    <template v-slot:activator="{ props }">
                                                        <v-icon v-bind="props" color="subtext" size="14" class="ml-1">
                                                            mdi-information-outline
                                                        </v-icon>
                                                    </template>
                                                    <span>The order screen stays<br />open after order placement.</span>
                                                </v-tooltip>
                                            </div>
                                        </template>
                                    </v-switch>
                                </v-list-item>
                                <v-list-item class="px-3">
                                    <v-switch v-model="quickOrderDefault" color="primary" hide-details density="compact"
                                        @update:model-value="saveOrderPreferences" class="ma-2">
                                        <template #label>
                                            <div class="d-flex align-center">
                                                <span class="fs-14 maintext--text">Quick Order screen {{
                                                    quickOrderDefault ? 'enable' : 'disable' }}</span>
                                                <v-tooltip location="bottom" color="black">
                                                    <template v-slot:activator="{ props }">
                                                        <v-icon v-bind="props" color="subtext" size="14" class="ml-1">
                                                            mdi-information-outline
                                                        </v-icon>
                                                    </template>
                                                    <span>The Quick Order screen<br />will be enabled by default</span>
                                                </v-tooltip>
                                            </div>
                                        </template>
                                    </v-switch>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>

                    <!-- Investment Type (hidden for SIP and GTT) -->
                    <div v-if="isQuickOrder">
                        <v-tooltip location="top" color="black">
                            <template v-slot:activator="{ props }">
                                <v-card v-bind="props" class="elevation-0" color="transparent">
                                    <v-switch class="px-3" :disabled="orderType != 0"
                                        @update:model-value="onOrderTypeChanged" density="compact" v-model="isDelivery"
                                        hide-details color="maintext">
                                        <template #label>
                                            <p style="font-size: 16px !important;"
                                                class="maintext--text pl-2 font-weight-medium mb-0">{{
                                                    orderType == 2 ? 'Bracket order' :
                                                        orderType == 1 ? 'Cover order' : investType === 'M' ? 'Carry Forward' :
                                                            investType === 'C' ? 'Delivery' : 'Intraday' }}</p>
                                        </template>
                                    </v-switch>
                                </v-card>
                            </template>
                            <span>{{ orderType == 2 || orderType == 1 ? "Can't Switch to Delivery" :
                                investType != 'I' ? 'Switch to Intraday' : (menudata[0].exch == 'NSE' ||
                                    menudata[0].exch == 'BSE') ?
                                    'Switch to Delivery' : 'Switch to Carry Forward' }}</span>
                        </v-tooltip>
                    </div>
                    <div v-else-if="orderType == 0 || orderType == 3" class="pt-4   ">
                        <p class="subtext--text fs-13 font-weight-regular mb-0">Investment type</p>
                        <v-radio-group @update:model-value="onOrderTypeChanged" v-model="investType" inline hide-details
                            class="ml-n2">
                            <v-radio color="maintext" label="Intraday" value="I"></v-radio>
                            <v-radio v-if="menudata[0].exch === 'NSE' || menudata[0].exch === 'BSE'" color="maintext"
                                label="Delivery" value="C"></v-radio>
                            <v-radio v-else color="maintext" label="Carry Forward" value="M"></v-radio>
                        </v-radio-group>
                    </div>

                    <!-- Price Type (hidden for SIP and GTT, and Quick Order) -->
                    <div v-if="!isQuickOrder && orderType !== 3 && orderType !== 4"
                        style="border-bottom: 1px solid #e0e0e0;" class="pb-2 mt-3 ">
                        <p class="subtext--text fs-13 font-weight-regular mb-0">Select order type</p>
                        <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row mandatory>
                            <v-chip value="LMT" :style="{
                                backgroundColor: priceType === 'LMT' ? '#000' : '#F1F3F8',
                                color: priceType === 'LMT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                Limit
                            </v-chip>
                            <v-chip value="MKT" :style="{
                                backgroundColor: priceType === 'MKT' ? '#000' : '#F1F3F8',
                                color: priceType === 'MKT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                Market
                            </v-chip>
                            <v-chip value="SL-LMT" :style="{
                                backgroundColor: priceType === 'SL-LMT' ? '#000' : '#F1F3F8',
                                color: priceType === 'SL-LMT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                SL Limit
                            </v-chip>
                            <v-chip v-if="orderType !== 1 && orderType !== 2" value="SL-MKT" :style="{
                                backgroundColor: priceType === 'SL-MKT' ? '#000' : '#F1F3F8',
                                color: priceType === 'SL-MKT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                SL Mkt
                            </v-chip>
                        </v-chip-group>
                    </div>

                    <!-- Quantity and Price Row -->
                    <v-row class="d-flex justify-space-between align-start mt-0" v-if="orderType !== 3">
                        <!-- Quantity -->
                        <v-col :cols="isQuickOrder ? 12 : 12" :md="isQuickOrder ? 12 : 6">
                            <!-- Quick Order Quantity UI -->
                            <div v-if="isQuickOrder">
                                <!-- Header -->
                                <div class="d-flex justify-space-between align-center mb-2 mt-n3">
                                    <p class="font-weight-regular fs-14 subtext--text mb-0">Quantity</p>
                                    <p class="font-weight-regular fs-14 subtext--text mb-0 text-right">
                                        MLot: {{ menudata[0]?.ls ?? '-' }}
                                    </p>
                                </div>

                                <!-- Quantity Field -->
                                <v-text-field density="compact" bg-color="secbg" rounded="xl" variant="flat"
                                    type="number" v-model.number="quantity" hide-details hide-spin-buttons single-line
                                    class=" fs-16 disclosed-field" @blur="validateQuantity">
                                    <!-- PREPEND ( - ) -->
                                    <template #prepend-inner>
                                        <v-btn @click="decreaseQuantity()" icon class="elevation-0"
                                            style="background-color: transparent !important;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="white" />
                                                <path d="M16 12H8" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </v-btn>
                                    </template>

                                    <!-- APPEND ( + ) -->
                                    <template #append-inner>
                                        <v-btn @click="increaseQuantity()" icon class="elevation-0"
                                            style="background-color: transparent !important;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="white" />
                                                <path d="M12 8V16" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                                <path d="M16 12H8" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </v-btn>
                                    </template>
                                </v-text-field>

                                <!-- Freeze qty -->
                                <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-1">
                                    Freeze qty: {{ menudata[1]?.frzqty ?? '-' }}
                                </p>
                            </div>



                            <!-- Advanced Order Quantity UI -->
                            <div v-else>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <p class="font-weight-regular fs-14 subtext--text mb-0">Quantity</p>
                                    <p class="font-weight-regular fs-14 subtext--text mb-0 text-right">MLot: {{
                                        menudata[0]?.ls ?? '-' }}</p>
                                </div>
                                <v-text-field density="compact" bg-color="secbg" rounded="xl" variant="flat"
                                    type="number" v-model.number="quantity" :rules="quantityRules" hide-details
                                    hide-spin-buttons @blur="validateQuantity">
                                    <template #append-inner>
                                        <v-btn @click="increaseQuantity()" icon class="elevation-0"
                                            style="background-color: transparent !important;">
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
                                        <v-btn @click="decreaseQuantity()" icon class="elevation-0"
                                            style="background-color: transparent !important;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="white" />
                                                <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                                    stroke-linecap="round" />
                                            </svg>
                                        </v-btn>
                                    </template>
                                </v-text-field>
                                <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text mb-0 mt-0">Freeze qty: {{
                                    menudata[1]?.frzqty ?? '-' }}</p>
                            </div>
                        </v-col>

                        <!-- Price -->
                        <v-col :cols="isQuickOrder ? 12 : 12" :md="isQuickOrder ? 12 : 6">
                            <div class="d-flex justify-space-between align-center mb-2 ">
                                <p class="font-weight-regular fs-14 subtext--text mb-0">Price</p>
                                <p class="font-weight-regular fs-14 subtext--text mb-0 text-right">Tick: {{
                                    menudata[0]?.ti ?? '-' }}
                                </p>
                            </div>

                            <!-- Quick Order Price UI -->
                            <v-row no-gutters v-if="isQuickOrder">
                                <v-col cols="5" class="pr-2">
                                    <div class="d-flex rounded-pill overflow-hidden "
                                        style="background-color: #F1F3F8; height: 40px; width: 128px;">
                                        <v-btn class="rounded-0 text-none font-weight-bold fs-12"
                                            :color="(priceType === 'LMT' || priceType === 'SL-LMT') ? 'black' : 'transparent'"
                                            :variant="priceType === 'LMT' ? 'flat' : 'flat'" height="100%"
                                            @click="priceType = showTrigger ? 'SL-LMT' : 'LMT'; onOrderTypeChanged()">LMT</v-btn>
                                        <v-btn class="rounded-0 text-none font-weight-bold fs-12"
                                            :color="(priceType === 'MKT' || priceType === 'SL-MKT') ? 'black' : 'transparent'"
                                            :variant="priceType === 'MKT' ? 'flat' : 'flat'" height="100%"
                                            @click="priceType = showTrigger ? 'SL-MKT' : 'MKT'; onOrderTypeChanged()">MKT</v-btn>
                                    </div>
                                </v-col>
                                <v-col cols="7">
                                    <v-text-field density="compact" bg-color="secbg" variant="flat" class="disclosed-field"
                                        style="height: 45px;" rounded="xl" type="number" hide-spin-buttons
                                        :readonly="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="price"
                                        hide-details @input="handlePriceInput">
                                        <template #prepend-inner>
                                            <div class="d-flex align-center justify-center pt-1" style="
                                                background-color: white;
                                                border-radius: 50%;
                                                height: 23px;
                                                width: 24px;
                                                color: grey;
                                                font-size: 14px;
                                            ">
                                                ₹
                                            </div>
                                        </template>
                                        <template #append-inner>
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
                                <v-col cols="5">

                                </v-col>
                    
                                <v-col cols="6">
                                    <p v-if="menudata[1]" class=" fs-10 subtext--text mb-0 mt-0">Circuit level: {{
                                        menudata[1]?.lc ?? '-' }} - {{ menudata[1]?.uc ?? '-' }}</p>
                                </v-col>
                            </v-row>

                            <!-- Advanced Order Price UI -->
                            <div v-else>
                                <v-text-field density="compact" hide-spin-buttons bg-color="secbg" variant="flat"
                                    style="height: 45px;" rounded="xl" type="number"
                                    :readonly="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="price"
                                    hide-details @input="handlePriceInput">
                                    <template #prepend-inner>
                                        <v-btn icon class="elevation-0"
                                            style="background-color: transparent !important;border-radius: 50% !important;background-color: white !important;height: 23px;width: 24px;color: grey !important;">
                                            ₹
                                        </v-btn>
                                    </template>
                                    <template #append-inner>
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
                                <p v-if="menudata[1]" class="lh-16 fs-10 subtext--text ml-2 mb-0 mt-1">Circuit
                                    level: {{
                                        menudata[1]?.lc ?? '-' }} - {{
                                        menudata[1]?.uc ?? '-' }}</p>
                            </div>
                        </v-col>
                    </v-row>



                    <!-- Trigger / Stoploss / Target Fields -->
                    <!-- Quick Order Layout -->
                    <div v-if="isQuickOrder && orderType !== 3">
                        <!-- SL/Trigger -->
                        <div class="mt-2">
                            <v-checkbox v-model="showTrigger" label="SL/Trigger" density="compact" hide-details
                                 class="font-weight-bold"></v-checkbox>
                            <!-- <v-text-field v-if="showTrigger" density="compact" bg-color="secbg" variant="flat"
                                rounded="xl" type="number" v-model.number="triggerPrice" hide-details class="mt-1">
                                <template #prepend-inner><span class="text-grey mr-1">₹</span></template>
                            </v-text-field> -->

                            <v-text-field v-if="showTrigger" density="compact" bg-color="secbg" variant="flat"
                                rounded="xl" type="number" hide-spin-buttons v-model.number="triggerPrice" hide-details
                                style="height: 45px;" class="mt-1 disclosed-field">
                                <template #prepend-inner>
                                    <div class="d-flex align-center justify-center" style="
                background-color: white;
                border-radius: 50%;
                height: 23px;
                width: 24px;
                color: grey;
                font-size: 14px;
            ">
                                        ₹
                                    </div>
                                </template>
                            </v-text-field>




                        </div>

                        <!-- Target & Stoploss Row -->
                        <v-row class="mt-n3">
                            <v-col cols="6">
                                <v-checkbox v-model="showTarget" label="Target" density="compact" hide-details
                                    color="black" class="font-weight-bold disclosed-field"></v-checkbox>
                                <v-text-field v-if="showTarget" density="compact" bg-color="secbg" variant="flat"
                                    rounded="xl" type="number" v-model.number="targetPrice" hide-details
                                    style="height: 45px;" class="mt-1 mb-2 no-spin" hide-spin-buttons>
                                    <template #prepend-inner>
                                        <div class="d-flex align-center justify-center" style="
        background-color: white;
        border-radius: 50%;
        height: 23px;
        width: 24px;
        color: grey;
        font-size: 14px;
      ">
                                            ₹
                                        </div>
                                    </template>
                                </v-text-field>

                            </v-col>
                            <v-col cols="6">
                                <v-checkbox v-model="showStopLoss" label="Stoploss" density="compact" hide-details
                                    color="black" class="font-weight-bold disclosed-field"></v-checkbox>
                                <v-text-field v-if="showStopLoss" density="compact" bg-color="secbg" variant="flat"
                                    rounded="xl" type="number" v-model.number="stopLossPrice" hide-details
                                    hide-spin-buttons style="height: 45px;" class="mt-1 no-spin">
                                    <template #prepend-inner>
                                        <div class="d-flex align-center justify-center" style="
        background-color: white;
        border-radius: 50%;
        height: 23px;
        width: 24px;
        color: grey;
        font-size: 14px;
      ">
                                            ₹
                                        </div>
                                    </template>
                                </v-text-field>

                            </v-col>
                        </v-row>
                    </div>

                    <!-- Advanced Order Layout -->
                    <v-row v-else-if="orderType !== 3">
                        <!-- Trigger -->
                        <v-col cols="12" md="6" v-if="priceType === 'SL-LMT' || priceType === 'SL-MKT'">
                            <div class="">
                                <p class="subtext--text fs-14 font-weight-regular mb-2 mt-2">Trigger</p>
                            </div>
                            <v-text-field class="mt-2" style="height: 50px;" density="compact" bg-color="secbg"
                                variant="flat" type="number" v-model.number="triggerPrice" rounded="xl"
                                label="Trigger price" hide-details>
                                <template #prepend-inner>
                                    <div class="d-flex align-center justify-center pt-1" style="
                                        background-color: white;
                                        border-radius: 50%;
                                        height: 23px;
                                        width: 24px;
                                        color: grey;
                                        ">
                                        ₹
                                    </div>
                                </template>
                            </v-text-field>
                        </v-col>

                        <!-- Stop Loss -->
                        <v-col cols="12" md="6" v-if="orderType === 1 || orderType === 2">
                            <div class="">
                                <p class="subtext--text fs-14 font-weight-regular mb-2 mt-2">Stop Loss</p>
                            </div>
                            <v-text-field density="comfortable" bg-color="secbg" variant="flat" rounded="xl"
                                type="number" v-model.number="stopLossPrice" hide-details height="45px"
                                @input="handleStopLossInput">
                                <template #prepend-inner>
                                    <v-btn icon class="elevation-0"
                                        style="border-radius: 50% !important;background-color: white !important;height: 23px;width: 24px;color: grey !important;">
                                        ₹
                                    </v-btn>
                                </template>
                            </v-text-field>
                        </v-col>

                        <!-- Target -->
                        <v-col cols="12" md="6" v-if="orderType === 2">
                            <div class="d-flex align-center justify-space-between">
                                <p class="font-weight-regular fs-14 subtext--text mb-2 mt-2">Target</p>
                            </div>
                            <v-text-field density="comfortable" bg-color="secbg" variant="flat" rounded="xl"
                                type="number" v-model.number="targetPrice" hide-details height="45px"
                                @input="handleTargetPriceInput">
                                <template #prepend-inner>
                                    <div class="d-flex align-center justify-center" style="
                                        background-color: white;
                                        border-radius: 50%;
                                        width: 22px;
                                        font-size: 14px;
                                        color: #666;
                                    ">
                                        ₹
                                    </div>
                                </template>
                            </v-text-field>
                        </v-col>
                    </v-row>

                    <!-- GTT Fields -->
                    <div v-if="orderType === 3" class="mt-4">
                        <!-- Price Type Selection for GTT (like old app) -->
                        <p class="subtext--text fs-14 font-weight-regular mb-2">Select order type</p>
                        <!-- <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row class="mb-3">
                            <v-chip value="LMT" :color="priceType === 'LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'LMT' ? 'mainbg' : 'maintext'">Limit</v-chip>
                            <v-chip value="MKT" :color="priceType === 'MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'MKT' ? 'mainbg' : 'maintext'">Market</v-chip>
                            <v-chip value="SL-LMT" :color="priceType === 'SL-LMT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-LMT' ? 'mainbg' : 'maintext'">SL Limit</v-chip>
                            <v-chip value="SL-MKT" :color="priceType === 'SL-MKT' ? 'maintext' : 'secbg'"
                                :text-color="priceType === 'SL-MKT' ? 'mainbg' : 'maintext'">SL Mkt</v-chip>
                        </v-chip-group> -->

                        <v-chip-group v-model="priceType" @update:model-value="onOrderTypeChanged" row mandatory>
                            <v-chip value="LMT" :style="{
                                backgroundColor: priceType === 'LMT' ? '#000' : '#F1F3F8',
                                color: priceType === 'LMT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                Limit
                            </v-chip>
                            <v-chip value="MKT" :style="{
                                backgroundColor: priceType === 'MKT' ? '#000' : '#F1F3F8',
                                color: priceType === 'MKT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                Market
                            </v-chip>
                            <v-chip value="SL-LMT" :style="{
                                backgroundColor: priceType === 'SL-LMT' ? '#000' : '#F1F3F8',
                                color: priceType === 'SL-LMT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                SL Limit
                            </v-chip>
                            <v-chip v-if="orderType !== 1 && orderType !== 2" value="SL-MKT" :style="{
                                backgroundColor: priceType === 'SL-MKT' ? '#000' : '#F1F3F8',
                                color: priceType === 'SL-MKT' ? '#fff' : '#000',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }">
                                SL Mkt
                            </v-chip>
                        </v-chip-group>
                        <v-divider class="mb-2"></v-divider>
                        <v-row no-gutters>
                            <v-col cols="4" class="pb-2 pr-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Alert</p>
                                <v-select density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    :items="buyOrSellIsSell ? gttAlertItemsSO : gttAlertItemsSO"
                                    @update:model-value="onGTTAlertTypeChanged" v-model="gttAlertType"
                                    :disabled="gttOCOPanel && buyOrSellIsSell"
                                    :menu-props="{ attach: '#maindiv', contentClass: 'gtt-select-menu', maxHeight: '200px', zIndex: 10000 }"
                                    hide-details />
                            </v-col>
                            <v-col cols="4" class="pb-2 px-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Condition</p>
                                <v-select density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    :items="gttConItems"
                                    :disabled="gttAlertType === 'VOLUME' || (gttOCOPanel && buyOrSellIsSell)"
                                    :menu-props="{ attach: '#maindiv', contentClass: 'gtt-select-menu', maxHeight: '200px', zIndex: 10000 }"
                                    v-model="gttCond" hide-details />
                            </v-col>
                            <v-col cols="4" class="pb-2 pl-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Value</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    v-model.number="gttValue" type="number" min="0" hide-spin-buttons hide-details
                                    @input="onOrderTypeChanged" />
                            </v-col>
                        </v-row>
                        <v-divider class="mb-2 mt-2"></v-divider>
                        <v-row no-gutters>
                            <v-col cols="4" class="pb-2 pr-1">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                                <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    v-model.number="gttQty" type="number" :min="menudata[0]?.ls || 1"
                                    :step="menudata[0]?.ls || 1" hide-spin-buttons hide-details>
                                    <template #append-inner>
                                        <v-btn @click="gttQty = Number(gttQty) + Number(menudata[0]?.ls || 1)" icon
                                            class="elevation-0" height="24px" width="24px">
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
                                            icon class="elevation-0" height="24px" width="24px">
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
                                <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    :disabled="priceType === 'MKT' || priceType === 'SL-MKT'" v-model.number="gttPrice"
                                    type="number" min="0" hide-spin-buttons hide-details @input="handlePriceInput">
                                    <template #prepend-inner>
                                        <v-btn icon class="elevation-0"
                                            style="background-color: transparent !important;border-radius: 50% !important;background-color: white !important;height: 23px;width: 24px;color: grey !important;">
                                            ₹
                                        </v-btn>
                                    </template>
                                    <template #append-inner>
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
                                <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                    v-model.number="gttTriggerPrice" type="number" min="0" hide-spin-buttons
                                    hide-details />
                            </v-col>
                        </v-row>
                        <v-divider v-if="buyOrSellIsSell" class="mb-2 mt-2"></v-divider>
                        <!-- OCO Panel Toggle - Only show for Sell orders -->
                        <v-btn v-if="buyOrSellIsSell" class="font-weight-bold mb-2"
                            :color="gttOCOPanel ? 'primary' : 'maintext'" variant="plain" height="40px" block
                            rounded="xl" :ripple="true" text
                            @click="gttOCOPanel = !gttOCOPanel; if (gttOCOPanel) { gttAlertType = 'LTP'; gttCond = '>'; } else { gttAlertType = 'LTP'; gttCond = '<'; }">
                            OCO
                            <v-icon class="ml-auto">{{ gttOCOPanel ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </v-btn>
                        <!-- OCO Panel - Only show for Sell orders -->
                        <div v-if="gttOCOPanel && buyOrSellIsSell" class="mt-3">
                            <p class="subtext--text fs-14 font-weight-regular mb-2">Select order type</p>
                            <v-chip-group v-model="ocoPriceType" @update:model-value="onOrderTypeChanged" row mandatory
                                class="mb-3">
                                <v-chip value="LMT" :style="{
                                    backgroundColor: ocoPriceType === 'LMT' ? '#000' : '#F1F3F8',
                                    color: ocoPriceType === 'LMT' ? '#fff' : '#000',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }">
                                    Limit
                                </v-chip>
                                <v-chip value="MKT" :style="{
                                    backgroundColor: ocoPriceType === 'MKT' ? '#000' : '#F1F3F8',
                                    color: ocoPriceType === 'MKT' ? '#fff' : '#000',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }">
                                    Market
                                </v-chip>
                                <v-chip value="SL-LMT" :style="{
                                    backgroundColor: ocoPriceType === 'SL-LMT' ? '#000' : '#F1F3F8',
                                    color: ocoPriceType === 'SL-LMT' ? '#fff' : '#000',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }">
                                    SL Limit
                                </v-chip>
                                <v-chip v-if="orderType !== 1 && orderType !== 2" value="SL-MKT" :style="{
                                    backgroundColor: ocoPriceType === 'SL-MKT' ? '#000' : '#F1F3F8',
                                    color: ocoPriceType === 'SL-MKT' ? '#fff' : '#000',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }">
                                    SL Mkt
                                </v-chip>
                            </v-chip-group>
                            <v-row no-gutters>
                                <v-col cols="4" class="pb-2 pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Alert</p>
                                    <v-select density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        :items="['LTP']" value="LTP" disabled hide-details />
                                </v-col>
                                <v-col cols="4" class="pb-2 px-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Condition</p>
                                    <v-select density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        :items="['<']" value="<" disabled hide-details />
                                </v-col>
                                <v-col cols="4" class="pb-2 pl-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Value</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        v-model.number="ocoValue" type="number" min="0" hide-spin-buttons hide-details
                                        @input="onOrderTypeChanged" />
                                </v-col>
                            </v-row>
                            <v-divider class="mb-2 mt-2"></v-divider>
                            <v-row no-gutters>
                                <v-col cols="4" class="pb-2 pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Quantity</p>
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        v-model.number="ocoQty" type="number" :min="menudata[0]?.ls || 1"
                                        :step="menudata[0]?.ls || 1" hide-spin-buttons hide-details>
                                        <template #append-inner>
                                            <v-btn @click="ocoQty = Number(ocoQty) + Number(menudata[0]?.ls || 1)" icon
                                                class="elevation-0" height="24px" width="24px">
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
                                                icon class="elevation-0" height="24px" width="24px">
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
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        :disabled="ocoPriceType === 'MKT' || ocoPriceType === 'SL-MKT'"
                                        v-model.number="ocoPrice" type="number" :min="menudata[1]?.lc || 0"
                                        :max="menudata[1]?.uc || 999999" hide-spin-buttons hide-details>
                                        <template #prepend-inner>
                                            <v-btn icon class="elevation-0"
                                                style="background-color: transparent !important;border-radius: 50% !important;background-color: white !important;height: 23px;width: 24px;color: grey !important;">
                                                ₹
                                            </v-btn>
                                        </template>
                                        <template #append-inner>
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
                                    <v-text-field density="compact" variant="flat" bg-color="secbg" rounded="xl"
                                        v-model.number="ocoTriggerPrice" type="number" min="0" hide-spin-buttons
                                        hide-details />
                                </v-col>
                            </v-row>
                        </div>
                    </div>

                    <!-- SIP Tab - Handled by onOrderTypeChanged function -->
                    <!-- No content needed here as SIP tab click is handled automatically -->

                    <!-- Validity & Disclosed Qty -->
                    <div v-if="orderType !== 3 && orderType !== 4 && !isQuickOrder">
                        <v-checkbox color="maintext" v-model="addValidityQty" hide-details class="checkbox-left">
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">Add Validity & Disclosed Qty</p>
                            </template>
                        </v-checkbox>
                        <div v-if="addValidityQty" class="mt-1">
                            <v-row no-gutters>
                                <v-col cols="6" class="pr-1">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Validity</p>
                                    <v-chip-group v-model="validityType"
                                        @update:model-value="debouncedComputeMarginAndBrokerage" column>
                                        <v-chip v-if="menudata[0]?.exch !== 'BSE'" value="IOC" :style="{
                                            backgroundColor: validityType === 'IOC' ? '#000' : '#f5f5f5',
                                            color: validityType === 'IOC' ? '#fff' : '#000',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }">IOC</v-chip>
                                        <v-chip
                                            v-if="(menudata[0]?.exch === 'BFO' || menudata[0]?.exch === 'BCD') && menudata[0]?.exch !== 'BSE'"
                                            value="EOS" :style="{
                                                backgroundColor: validityType === 'EOS' ? '#000' : '#f5f5f5',
                                                color: validityType === 'EOS' ? '#fff' : '#000',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }">EOS</v-chip>
                                        <v-chip value="DAY" :style="{
                                            backgroundColor: validityType === 'DAY' ? '#000' : '#f5f5f5',
                                            color: validityType === 'DAY' ? '#fff' : '#000',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }">Day</v-chip>
                                    </v-chip-group>
                                </v-col>
                                <v-col cols="6" class="pl-1 mb-3">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">Disclosed Qty</p>
                                    <!-- <v-text-field density="compact" bg-color="secbg" variant="flat" class="rounded-pill"
                                        type="number" hide-spin-buttons min="0" v-model.number="disclosedQty"
                                        hide-details /> -->


                                    <v-text-field density="compact" bg-color="secbg" rounded="xl" variant="flat"
                                        type="number" v-model.number="disclosedQty" hide-details single-line class="disclosed-field"
                                        @blur="validateDisclosedQty">
                                        <template #append-inner>
                                            <v-btn @click="increaseDisclosedQty()" icon class="elevation-0"
                                                style="background-color: transparent !important;">
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
                                            <v-btn @click="decreaseDisclosedQty()" icon class="elevation-0"
                                                style="background-color: transparent !important;">
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
                            </v-row>
                        </div>
                    </div>

                    <!-- After Market Order -->
                    <div class="d-flex align-center mt-0" style="border-top: 1px solid #e0e0e0;"
                        v-if="orderType === 0 || orderType === 1 || orderType === 2 && !isQuickOrder">
                        <v-checkbox color="maintext" v-model="afterMarket" hide-details class="checkbox-left"
                            :disabled="orderContextType === 're-order' || orderContextType === 'mod-order'">
                            <template #label>
                                <p class="font-weight-regular fs-14 subtext--text mb-0">After market order (AMO)</p>
                            </template>
                        </v-checkbox>
                    </div>

                    <!-- Market Protection % (shown when price type is MKT or SL-MKT) -->
                    <div v-if="orderType !== 3 && orderType !== 4 && (priceType === 'MKT' || priceType === 'SL-MKT') && !isQuickOrder"
                        class="mt-0">
                        <v-divider class="mb-3"></v-divider>
                        <p class="font-weight-regular fs-14 subtext--text mb-2">Market Protection %</p>
                        <v-text-field density="compact" bg-color="secbg" variant="flat" rounded="xl"
                            v-model.number="marketProtection" type="number" min="0" max="20" step="0.01"
                            hide-spin-buttons hide-details="auto" persistent-hint
                            @blur="validateMarketProtectionOnBlur" />
                    </div>

                    <!-- Quick Order Link -->
                    <div class="mt-3">
                        <v-btn text block color="primary" variant="text" class="rounded-pill text-none"
                            @click="isQuickOrder = !isQuickOrder">
                            {{ !isQuickOrder ? 'Quick order ' : 'Advanced order ' }}
                            <v-icon size="16">{{ !isQuickOrder ? 'mdi-chevron-double-left' : 'mdi-chevron-double-right'
                            }}</v-icon>
                        </v-btn>
                    </div>

                </div>
            </div>
            <!-- Margin Preview -->

            <div class="d-flex align-center pl-5 pr-2 flex-nowrap" :class="isQuickOrder && 'mt-10'">
                <v-menu offset-y location="top">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props" class="d-flex align-center flex-nowrap cursor-pointer">
                            <p class="font-weight-medium fs-12 subtext--text mb-0">
                                <span>Margin </span>
                                <span class="ml-1 primary--text">
                                    <b>₹{{ orderMarginDisplay }}</b>
                                    <span class="ml-1"> + </span>
                                    <span class="ml-1 primary--text">
                                        <b>₹{{ chargesDisplay }}</b>
                                    </span>
                                </span>
                                <v-icon class="ml-1" size="14"
                                    :color="marginRemarks === 'Order Success' ? 'maingreen' : 'mainred'">
                                    {{ marginRemarks === 'Order Success' ? 'mdi-checkbox-marked-circle' :
                                        'mdi-alert-octagon' }}
                                </v-icon>
                                <span class="ml-1">Avail </span>
                                <span class="ml-1 primary--text">
                                    <b>₹{{ cashAvailableDisplay }}</b>
                                </span>
                                <span v-if="$route.name !== 'funds'" class="ml-1 primary--text cursor-pointer"
                                    @click.stop="router.push('/funds')">+ Add fund</span>
                            </p>
                        </div>
                    </template>

                    <v-list density="compact" min-width="260px" class="py-2">
                        <!-- Order Margin -->
                        <v-list-item class="px-3">
                            <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                                Order margin:
                                <span class="ml-1 float-right maintext--text">
                                    <b>₹{{ orderMarginDisplay }}</b>
                                </span>
                            </v-list-item-title>
                        </v-list-item>

                        <!-- Available Balance -->
                        <v-list-item class="px-3">
                            <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                                Available balance to trade:
                                <span class="ml-1 float-right maintext--text">
                                    <b>₹{{ cashAvailableDisplay }}</b>
                                </span>
                            </v-list-item-title>
                        </v-list-item>

                        <!-- Remarks -->
                        <v-list-item class="px-3">
                            <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                                Remarks:
                                <span class="ml-1 float-right">
                                    <b
                                        :style="marginRemarks === 'Order Success' ? 'color: #43A833 !important;' : 'color: #FF1717 !important;'">
                                        {{ marginRemarks || '' }}
                                    </b>
                                </span>
                            </v-list-item-title>
                        </v-list-item>

                        <v-divider class="mx-3 mb-2 mt-1"></v-divider>

                        <!-- Charges Breakdown -->
                        <v-list-item v-for="(item, index) in chargeItemsList" :key="index" class="px-3">
                            <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                                {{ item.label }}:
                                <span class="ml-1 maintext--text float-right">
                                    <b>₹{{ formatNumber(brokerageData[item.key] || 0) }}</b>
                                </span>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-spacer></v-spacer>
                <v-btn icon variant="text" density="compact" :loading="isRefreshingFunds" @click="refreshFunds">
                    <v-icon size="16">mdi-refresh</v-icon>
                </v-btn>
            </div>
            <!-- Button Section for Regular/Cover/Bracket orders -->
            <div v-if="orderType !== 3" class="px-6 py-3">
                <v-row no-gutters>
                    <v-col cols="6" class="pr-2">
                        <v-btn block @click="closeOrderDialog" color="secbg" :disabled="isPlacingOrder"
                            class="text-none rounded-pill elevation-0 subtext--text" height="40px">Cancel</v-btn>
                    </v-col>
                    <v-col cols="6" class="pl-2">
                        <v-btn block @click="placeOrder()" :loading="isPlacingOrder"
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
                <v-btn @click="placeOrder()" :loading="isPlacingOrder" :disabled="isGTTButtonDisabled"
                    variant="elevated" :color="buyOrSellIsSell ? 'mainred' : 'maingreen'"
                    class="text-none rounded-pill elevation-0 white--text px-6 ml-4" height="40px">
                    {{ orderContextType === 'mod-GTT' ? 'Modify' : 'Create' }} {{ (gttOCOPanel && buyOrSellIsSell) ?
                        'OCO' : 'GTT'
                    }}
                </v-btn>
            </v-toolbar>
        </v-card>
    </div>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useMarginsStore } from '@/stores/marginsStore'
import { getQuotesdata, getSecuritydata, getPlaceOrder, getOrderMargin, getBrokerage, setOrdprefApi, getGTTPlaceOrder, forceRefreshMLimits } from '@/components/mixins/getAPIdata'

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
let websocketHandler = null
// Guard flags to prevent duplicate API calls
let isComputingMargin = false
let marginDebounceTimer = null
let lastPriceForMargin = null // Track last price that triggered margin calculation
let websocketMarginDebounceTimer = null // Separate timer for websocket-triggered margin calls

// Slice order state
const sliceFzqty = ref([]) // Array containing all slice quantities: [freezeQty, freezeQty, ..., remainder]
const sliceFq = ref(1) // number of slices (not including remainder)

// Quick Order State
const quickOrderDefault = ref(false)
const showTrigger = ref(false)
const showStopLoss = ref(false)
const showTarget = ref(false)
const isDelivery = ref(false)

// Watchers for Quick Order logic
watch(isQuickOrder, (newVal) => {
    if (newVal) {
        showTrigger.value = !!triggerPrice.value
        showStopLoss.value = !!stopLossPrice.value
        showTarget.value = !!targetPrice.value
        isDelivery.value = investType.value === 'C' || investType.value === 'M'
    }
})

watch(isDelivery, (newVal) => {
    if (isQuickOrder.value) {
        if (newVal) {
            if (menudata.value[0]?.exch === 'NSE' || menudata.value[0]?.exch === 'BSE') {
                investType.value = 'C'
            } else {
                investType.value = 'M'
            }
        } else {
            investType.value = 'I'
        }
        onOrderTypeChanged()
    }
})

watch(showTrigger, (newVal) => {
    if (!newVal) {
        triggerPrice.value = null
        if (priceType.value === 'SL-LMT') priceType.value = 'LMT'
        if (priceType.value === 'SL-MKT') priceType.value = 'MKT'
    } else {
        if (priceType.value === 'LMT') priceType.value = 'SL-LMT'
        if (priceType.value === 'MKT') priceType.value = 'SL-MKT'
    }
})

watch(showStopLoss, (newVal) => {
    if (!newVal) stopLossPrice.value = null
})

watch(showTarget, (newVal) => {
    if (!newVal) targetPrice.value = null
})

// Watch quickOrderDefault to update isQuickOrder when user toggles the Quick Order switch
// This matches old app behavior: this.quickord = this.quickordswt
watch(quickOrderDefault, (newVal) => {
    isQuickOrder.value = newVal
})

const saveOrderPreferences = async () => {
    // Update localStorage immediately
    localStorage.setItem('isStickyDialog', isStickyDialog.value)
    localStorage.setItem('quickOrderDefault', quickOrderDefault.value)

    // Also save to backend API (like old code setStickyupdate)
    try {
        const uid = sessionStorage.getItem('userid')
        // First get existing preferences to avoid overwriting
        const ordpre = await setOrdprefApi({}, false)

        if (ordpre && ordpre.stat === 'Ok' && ordpre.metadata) {
            // Update only the sticky and quick order settings in metadata
            ordpre.metadata.stickysrc = isStickyDialog.value
            ordpre.metadata.quicksrc = quickOrderDefault.value

            // Save updated metadata back to API
            await setOrdprefApi({
                clientid: uid,
                metadata: ordpre.metadata,
                source: 'WEB'
            }, true)
        } else {
            // If no existing preferences, create new with minimal data
            await setOrdprefApi({
                clientid: uid,
                metadata: {
                    stickysrc: isStickyDialog.value,
                    quicksrc: quickOrderDefault.value
                },
                source: 'WEB'
            }, true)
        }
    } catch (e) {
        // console.error('Failed to save preferences to backend', e)
    }
}

// Initialize preferences
onMounted(() => {
    const savedSticky = localStorage.getItem('isStickyDialog')
    if (savedSticky !== null) {
        isStickyDialog.value = savedSticky === 'true'
    }
    const savedQuick = localStorage.getItem('quickOrderDefault')
    if (savedQuick !== null) {
        quickOrderDefault.value = savedQuick === 'true'
        // Don't set isQuickOrder here - always start with Advanced Order (false)
    }
})

const appStore = useAppStore()
const marginsStore = useMarginsStore()

const ltpDisplay = computed(() => {
    const ltp = menudata.value[0]?.ltp || menudata.value[0]?.lp || menudata.value?.ltp || 0
    return Number(ltp).toFixed(2)
})
const chDisplay = computed(() => {
    const ch = menudata.value[0]?.ch ?? menudata.value?.ch ?? 0
    return Number(ch).toFixed(2)
})
const chpDisplay = computed(() => {
    const chp = menudata.value[0]?.chp ?? menudata.value?.chp ?? 0
    return Number(chp).toFixed(2)
})
const chColor = computed(() => {
    const ch = Number(menudata.value[0]?.ch ?? menudata.value?.ch ?? 0)
    return ch > 0 ? 'maingreen--text' : ch < 0 ? 'mainred--text' : 'subtext--text'
})
const chColorStyle = computed(() => {
    const ch = Number(menudata.value[0]?.ch ?? menudata.value?.ch ?? 0)
    return ch > 0 ? '#43A833' : ch < 0 ? '#FF0000' : '#666666'
})
const priceColorClass = computed(() => {
    const ch = Number(menudata.value[0]?.ch ?? menudata.value?.ch ?? 0)
    return ch > 0 ? 'maingreen--text' : ch < 0 ? 'mainred--text' : 'maintext--text'
})
// GTT button disabled state - always allow clicking, validations will be shown via snackbar
const isGTTButtonDisabled = computed(() => {
    // Always return false to allow button to be clickable
    // Validations will be handled in validateOrder function and shown via snackbar
    return false
})

// Helper to format numbers with K/L/Cr suffixes (like old app setFormatNumber)
function formatNumber(value) {
    const val = Number(value)
    if (isNaN(val)) return '0.00'

    if (val > 9999999) {
        return (val / 10000000).toFixed(2) + "Cr"
    } else if (val > 99999) {
        return (val / 100000).toFixed(2) + "L"
    } else if (val > 9999) {
        return (val / 1000).toFixed(2) + "K"
    } else {
        return val.toFixed(2)
    }
}

// Margin / Brokerage preview state
const orderMargin = ref(0)
const cashAvailable = ref(0)
const orderMarginDisplay = computed(() => formatNumber(orderMargin.value || 0))
const cashAvailableDisplay = computed(() => formatNumber(cashAvailable.value || 0))
const chargesDisplay = computed(() => formatNumber(charges.value || 0))

// Brokerage breakdown data for tooltip
const brokerageData = ref({})
const marginRemarks = ref('')

// Charge items for tooltip display
const chargeItemsList = computed(() => [
    { label: 'Brokerage amt', key: 'brkage_amt' },
    { label: 'STT Chrg', key: 'stt_amt' },
    { label: 'Exch Chrg', key: 'exch_chrg' },
    { label: 'SEBI Chrg', key: 'sebi_chrg' },
    { label: 'Stamp duty', key: 'stamp_duty' },
    { label: 'Clearing Chrg', key: 'clr_chrg' },
    { label: 'GST Chrg', key: 'gst' }
])

const isRefreshingFunds = ref(false)

async function refreshFunds() {
    if (isRefreshingFunds.value) return
    isRefreshingFunds.value = true
    try {
        const response = await forceRefreshMLimits(false)
        if (response && response.stat === 'Ok') {
            cashAvailable.value = Number(response.avbma || response.avbal || 0)
            marginsStore.setMargins(response)
        }
    } catch (e) {
        console.error('Error refreshing funds', e)
    } finally {
        isRefreshingFunds.value = false
    }
}

// Quantity validation rules (no helper text - only for basic validation)
const quantityRules = computed(() => {
    return [
        (v) => {
            if (v === null || v === undefined || v === '') return true // Allow empty during typing
            const numValue = Number(v)
            if (isNaN(numValue) || numValue <= 0) {
                return 'Quantity must be greater than zero'
            }
            return true
        }
        // Removed freeze quantity validation from rules - handled in validateQuantity and validateOrder
    ]
})

// GTT Value validation rules
const gttValueRules = computed(() => {
    return [
        (v) => {
            if (v === null || v === undefined || v === '') {
                return 'Value cannot be empty'
            }
            const numValue = Number(v)
            if (isNaN(numValue) || numValue <= 0) {
                return 'Value must be greater than zero'
            }
            return true
        }
    ]
})

// GTT Quantity validation rules
const gttQtyRules = computed(() => {
    return [
        (v) => {
            if (v === null || v === undefined || v === '') {
                return 'Quantity cannot be empty'
            }
            const numValue = Number(v)
            if (isNaN(numValue) || numValue <= 0) {
                return 'Quantity must be greater than zero'
            }
            return true
        }
    ]
})

// GTT Price validation rules (only for LMT and SL-LMT)
const gttPriceRules = computed(() => {
    return [
        (v) => {
            // Skip validation for market orders
            if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
                return true
            }
            if (v === null || v === undefined || v === '') {
                return 'Price cannot be empty'
            }
            const numValue = Number(v)
            if (isNaN(numValue) || numValue <= 0) {
                return 'Price must be greater than zero'
            }
            return true
        }
    ]
})

// GTT Trigger Price validation rules (only for SL-LMT and SL-MKT)
const gttTriggerPriceRules = computed(() => {
    return [
        (v) => {
            if (v === null || v === undefined || v === '') {
                return 'Trigger cannot be empty'
            }
            const numValue = Number(v)
            if (isNaN(numValue) || numValue <= 0) {
                return 'Trigger must be greater than zero'
            }
            return true
        }
    ]
})

// Validate quantity function
function validateQuantity() {
    const qty = Number(quantity.value)
    const freezeQty = Number(menudata.value[1]?.frzqty || 0)
    const maxQty = freezeQty * 40

    // Check if quantity is <= 0
    if (isNaN(qty) || qty <= 0) {
        // Don't show snackbar here - only show when buy button is clicked
        return false
    }

    // Check if quantity exceeds freeze quantity * 40
    if (freezeQty > 0 && qty > maxQty) {
        // Don't show snackbar here - only show when buy button is clicked
        return false
    }

    // Check if quantity exceeds freeze quantity but <= freeze quantity * 40 - show slice dialog
    // Note: This is handled in placeOrder function, not here in validateQuantity
    // validateQuantity is called on input/blur, so we don't want to show slice dialog here
    // The slice dialog will be shown when user clicks Buy button

    // Valid quantity - compute margin (debounced)
    debouncedComputeMarginAndBrokerage()
    return true
}

function handleMarketProtectionInput() {
    // Allow dynamic input - user can type freely (like price input)
    // Validation will be done on blur and on order placement
    const value = Number(marketProtection.value)

    // Handle negative values - set to 0 (no snackbar on input)
    if (!isNaN(value) && value < 0) {
        marketProtection.value = 0
        return true
    }

    // Handle values above 20 - set to 20 (no snackbar on input)
    if (!isNaN(value) && value > 20) {
        marketProtection.value = 20
        debouncedComputeMarginAndBrokerage()
        return true
    }

    // Recalculate margin only if value is valid (0 < value <= 20)
    if (!isNaN(value) && value > 0 && value <= 20) {
        debouncedComputeMarginAndBrokerage()
        return true
    }

    return true
}

// Validate market protection - returns true if valid, false if invalid
function validateMarketProtection() {
    // Only validate if price type is MKT or SL-MKT
    if (orderType.value === 3 || orderType.value === 4) {
        return true // GTT and SIP don't need market protection
    }

    if (priceType.value !== 'MKT' && priceType.value !== 'SL-MKT') {
        return true // Only required for market orders
    }

    // Get the raw value first
    const rawValue = marketProtection.value

    // Check if value is empty, null, undefined, or empty string
    if (rawValue === null || rawValue === undefined || rawValue === '') {
        appStore.showSnackbar(2, 'Market Protection must be above zero')
        return false
    }

    // Convert to number - handle string values too
    let value
    if (typeof rawValue === 'string') {
        const trimmed = rawValue.trim()
        if (trimmed === '') {
            appStore.showSnackbar(2, 'Market Protection must be above zero')
            return false
        }
        value = Number(trimmed)
    } else {
        value = Number(rawValue)
    }

    // Check if value is NaN (invalid number)
    if (isNaN(value)) {
        appStore.showSnackbar(2, 'Market Protection must be above zero')
        return false
    }

    // Check if value is <= 0 (including 0)
    if (value <= 0) {
        appStore.showSnackbar(2, 'Market Protection must be above zero')
        return false
    }

    // Check if value exceeds 20 (explicit number comparison)
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue > 20) {
        appStore.showSnackbar(2, 'Market Protection cannot exceed 20%')
        return false
    }

    // Valid value (0 < value <= 20)
    return true
}

function validateMarketProtectionOnBlur() {
    // Validate on blur - don't auto-correct values (let validation handle it on buy click)
    // Just recalculate margin if value is valid
    const rawValue = marketProtection.value

    if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
        const value = Number(rawValue)

        if (!isNaN(value) && value > 0 && value <= 20) {
            // Valid value (0 < value <= 20) - just recalculate (debounced)
            debouncedComputeMarginAndBrokerage()
        }
    }
}

function handlePriceInput() {
    // Validate price input before calling margin calculation
    // Works for both regular price and GTT price
    const priceValue = orderType.value === 3 ? gttPrice.value : price.value

    // For market orders, price can be 0, for limit orders it must be > 0
    if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
        // Market orders - allow 0 or any positive value
        const value = Number(priceValue)
        if (!isNaN(value) && value >= 0) {
            debouncedComputeMarginAndBrokerage()
        } else {
            orderMargin.value = 0
        }
    } else {
        // Limit orders - must be > 0
        const value = validateNumber(priceValue, 0.01, false)
        if (value) {
            debouncedComputeMarginAndBrokerage()
        } else {
            orderMargin.value = 0
        }
    }
}

function handleStopLossInput() {
    // Validate stop loss input - only allow positive numbers
    const value = Number(stopLossPrice.value)
    if (isNaN(value) || value < 0) {
        // Reset to empty if invalid
        if (stopLossPrice.value !== '' && stopLossPrice.value !== null) {
            stopLossPrice.value = null
        }
        return
    }

    // Recalculate margin when stop loss is entered (for Cover/Bracket orders) - debounced
    // Only call if value is valid and > 0
    if ((orderType.value === 1 || orderType.value === 2) && value > 0) {
        debouncedComputeMarginAndBrokerage()
    } else {
        // Clear margin if stop loss is invalid or removed
        orderMargin.value = 0
    }
}

function handleTargetPriceInput() {
    // Validate target price input - only allow positive numbers
    const value = Number(targetPrice.value)
    if (isNaN(value) || value < 0) {
        // Reset to empty if invalid
        if (targetPrice.value !== '' && targetPrice.value !== null) {
            targetPrice.value = null
        }
        return
    }

    // Recalculate margin when target price is entered (for Bracket orders) - debounced
    // Only call if both target and stop loss are valid
    const stopLoss = validateNumber(stopLossPrice.value, 0.01, false)
    if (orderType.value === 2 && value > 0 && stopLoss) {
        debouncedComputeMarginAndBrokerage()
    } else {
        // Clear margin if target is invalid or removed
        orderMargin.value = 0
    }
}


// Debounced version of computeMarginAndBrokerage to prevent continuous API calls
function debouncedComputeMarginAndBrokerage(immediate = false, isWebsocketUpdate = false) {
    // Clear existing timer
    if (marginDebounceTimer) {
        clearTimeout(marginDebounceTimer)
        marginDebounceTimer = null
    }
    if (websocketMarginDebounceTimer) {
        clearTimeout(websocketMarginDebounceTimer)
        websocketMarginDebounceTimer = null
    }

    // If immediate flag is set (e.g., when dialog opens or user changes input), call immediately
    if (immediate) {
        computeMarginAndBrokerage()
        // Update last price after immediate call
        const q = menudata.value[0]
        if (q && (q.ltp || q.lp)) {
            lastPriceForMargin = Number(q.ltp || q.lp)
        }
        return
    }

    // For websocket updates, use longer debounce and check price change
    if (isWebsocketUpdate) {
        const q = menudata.value[0]
        if (!q || !(q.ltp || q.lp)) return

        const currentPrice = Number(q.ltp || q.lp)

        // Only trigger API call if price changed by more than 0.1% (significant change)
        if (lastPriceForMargin !== null) {
            const priceChangePercent = Math.abs((currentPrice - lastPriceForMargin) / lastPriceForMargin) * 100
            if (priceChangePercent < 0.1) {
                // Price change is too small, skip API call
                return
            }
        }

        // Use longer debounce for websocket updates (2000ms) to prevent excessive API calls
        websocketMarginDebounceTimer = setTimeout(() => {
            computeMarginAndBrokerage()
            lastPriceForMargin = currentPrice
            websocketMarginDebounceTimer = null
        }, 2000)
        return
    }

    // For user input changes, use shorter debounce (300ms delay)
    marginDebounceTimer = setTimeout(() => {
        computeMarginAndBrokerage()
        // Update last price after user-triggered call
        const q = menudata.value[0]
        if (q && (q.ltp || q.lp)) {
            lastPriceForMargin = Number(q.ltp || q.lp)
        }
        marginDebounceTimer = null
    }, 300)
}

// Helper function to validate and convert number values
function validateNumber(value, min = 0, allowZero = false) {
    if (value === null || value === undefined || value === '') {
        return null
    }
    const num = Number(value)
    if (isNaN(num) || num < min) {
        return null
    }
    if (!allowZero && num === 0) {
        return null
    }
    return num
}

async function computeMarginAndBrokerage() {
    // Guard: Prevent concurrent API calls
    if (isComputingMargin) {
        return
    }

    const q = menudata.value[0]
    if (!q) {
        orderMargin.value = 0
        return
    }

    // Validate quantity - must be a valid positive number
    const validatedQty = validateNumber(quantity.value, 1, false)
    if (!validatedQty) {
        orderMargin.value = 0
        return
    }

    // Validate price based on price type
    let validatedPrice = null
    if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
        // Market orders can have price 0
        validatedPrice = validateNumber(price.value, 0, true) ?? 0
    } else {
        // Limit orders must have valid price > 0
        validatedPrice = validateNumber(price.value, 0.01, false)
        if (!validatedPrice) {
            orderMargin.value = 0
            return
        }
    }

    // For Cover/Bracket orders, validate stop loss is set and valid
    if (orderType.value === 1 || orderType.value === 2) {
        const validatedStopLoss = validateNumber(stopLossPrice.value, 0.01, false)
        if (!validatedStopLoss) {
            orderMargin.value = 0
            return
        }
    }

    // For Bracket orders, validate target price is set and valid
    if (orderType.value === 2) {
        const validatedTarget = validateNumber(targetPrice.value, 0.01, false)
        if (!validatedTarget) {
            orderMargin.value = 0
            return
        }
    }

    // For SL orders, validate trigger price if provided
    let validatedTriggerPrice = 0
    if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
        const triggerVal = validateNumber(triggerPrice.value, 0.01, false)
        if (triggerVal !== null) {
            validatedTriggerPrice = triggerVal
        } else if (priceType.value === 'SL-LMT') {
            // SL-LMT requires trigger price
            orderMargin.value = 0
            return
        }
    }

    // Set flag to prevent concurrent calls
    isComputingMargin = true

    try {
        const item = {
            exch: q.exch,
            tsym: encodeURIComponent(q.tsym),
            qty: validatedQty * Number(q.ls || 1),
            prc: validatedPrice,
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
            trgprc: validatedTriggerPrice,
        }

        // Add blprc for Cover/Bracket orders (stop loss)
        if (orderType.value === 1 || orderType.value === 2) {
            const validatedStopLoss = validateNumber(stopLossPrice.value, 0.01, false)
            if (validatedStopLoss) {
                item['blprc'] = String(validatedStopLoss)
            }
        }

        // Add bpprc for Bracket orders (target price)
        if (orderType.value === 2) {
            const validatedTarget = validateNumber(targetPrice.value, 0.01, false)
            if (validatedTarget) {
                item['bpprc'] = String(validatedTarget)
            }
        }

        // Call APIs in parallel
        const [m, b] = await Promise.all([
            getOrderMargin(item).catch(() => null),
            getBrokerage(item).catch(() => null)
        ])

        if (m && m.stat === 'Ok') {
            orderMargin.value = Number(m.ordermargin || 0)
            cashAvailable.value = Number(m.avbal || m.avbma || 0)
            marginRemarks.value = m.remarks || ''
        }
        if (b && b.stat === 'Ok') {
            charges.value = Number(b.brkage_amt || b.charges || 0)
            // Store entire brokerage breakdown for tooltip
            brokerageData.value = b
        }
    } catch (e) {
        // silent - don't show error on every input change
        // console.debug('[StockOrderWindow] Margin calculation error:', e)
    } finally {
        // Reset flag
        isComputingMargin = false
    }
}

// Handle GTT Alert type changes
function onGTTAlertTypeChanged() {
    // When VOLUME is selected, automatically set condition to '>'
    if (gttAlertType.value === 'VOLUME') {
        gttCond.value = '>'
    }
}

function onOrderTypeChanged() {
    // Handle GTT order type changes (like old app setOrdertypes)
    if (orderType.value === 3) {
        // Auto-set price based on price type (like old app lines 1812-1821)
        if (priceType.value === 'MKT' || priceType.value === 'SL-MKT') {
            gttPrice.value = 0
        } else if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            const ltp = Number(menudata.value[0]?.lp || menudata.value[0]?.ltp || 0)
            if (ltp > 0 && (!gttPrice.value || gttPrice.value === 0)) {
                gttPrice.value = ltp
            }
        }

        // Auto-set OCO price based on OCO price type
        // Only set default price when price type changes, not when user types in price field
        // This prevents resetting user-entered values
        if (gttOCOPanel.value && buyOrSellIsSell.value) {
            if (ocoPriceType.value === 'MKT' || ocoPriceType.value === 'SL-MKT') {
                // For market orders, only set to 0 if price is truly empty (not when user is typing)
                if (ocoPrice.value === null || ocoPrice.value === undefined || ocoPrice.value === '') {
                    ocoPrice.value = 0
                }
            } else if (ocoPriceType.value === 'LMT' || ocoPriceType.value === 'SL-LMT') {
                // For limit orders, only set to LTP if price is truly empty (null, undefined, or empty string)
                // Don't reset if user has entered a value (even if it's 0 temporarily)
                const ltp = Number(menudata.value[0]?.lp || menudata.value[0]?.ltp || 0)
                if (ltp > 0 && (ocoPrice.value === null || ocoPrice.value === undefined || ocoPrice.value === '')) {
                    ocoPrice.value = ltp
                }
            }
        }

        // Only reset trigger prices when not in modify mode AND when switching away from SL orders
        // Don't reset when switching TO SL-LMT or SL-MKT (preserve user input)
        if (orderContextType.value !== 'mod-GTT') {
            // Only reset if we're switching FROM SL orders TO non-SL orders
            // Keep trigger price when switching TO SL orders - only set default if truly empty
            if (priceType.value !== 'SL-LMT' && priceType.value !== 'SL-MKT') {
                // Switching away from SL orders - clear trigger
                // console.log('[GTT onOrderTypeChanged] Clearing trigger - switching away from SL orders', { priceType: priceType.value })
                gttTriggerPrice.value = null
            } else {
                // Switching TO SL orders - only set default if trigger is truly empty (null, undefined, empty string, or exactly 0)
                // Don't override if user has already entered a value (check for any positive number)
                // Use a more strict check to avoid resetting valid user input
                const currentTrigger = gttTriggerPrice.value
                const isTriggerEmpty = (currentTrigger === null ||
                    currentTrigger === undefined ||
                    currentTrigger === '' ||
                    (typeof currentTrigger === 'number' && currentTrigger === 0))

                // console.log('[GTT onOrderTypeChanged] Checking trigger for SL orders', {
                //     currentTrigger,
                //     type: typeof currentTrigger,
                //     isTriggerEmpty,
                //     priceType: priceType.value
                // })

                if (isTriggerEmpty) {
                    const ltp = Number(menudata.value[0]?.lp || menudata.value[0]?.ltp || 0)
                    if (ltp > 0) {
                        // console.log('[GTT onOrderTypeChanged] Setting trigger to LTP', { ltp })
                        gttTriggerPrice.value = ltp
                    }
                } else {
                    // console.log('[GTT onOrderTypeChanged] Preserving user-entered trigger value', { currentTrigger })
                }
                // If trigger has a value (even if it's a string that needs conversion), preserve it
            }
            if (gttOCOPanel.value && buyOrSellIsSell.value) {
                if (ocoPriceType.value !== 'SL-LMT' && ocoPriceType.value !== 'SL-MKT') {
                    ocoTriggerPrice.value = null
                } else {
                    if (ocoTriggerPrice.value === null || ocoTriggerPrice.value === undefined || ocoTriggerPrice.value === 0 || ocoTriggerPrice.value === '') {
                        const ltp = Number(menudata.value[0]?.lp || menudata.value[0]?.ltp || 0)
                        if (ltp > 0) {
                            ocoTriggerPrice.value = ltp
                        }
                    }
                }
            }
        }
    }

    // Handle SIP tab click (orderType === 4)
    if (orderType.value === 4) {
        // SIP tab clicked - redirect to orders page or trigger SIP dialog
        // Match old code behavior: navigate to orders page and open SIP dialog
        const currentPath = router.currentRoute.value.path

        // Get security data - use menudata[0] (quote) as primary, menudata[1] (security) as fallback
        // Match old code: use menudata[1] (security data) like old code uses this.menudata[1]
        const quoteData = menudata.value[0] || {}
        const securityData = menudata.value[1] || {}

        // Prepare SIP security data with proper fallbacks (match old code structure)
        const sipSecurityData = {
            token: securityData.token || quoteData.token,
            tsym: securityData.tsym || quoteData.tsym,
            exch: securityData.exch || quoteData.exch,
            ls: securityData.ls || quoteData.ls || 1,
            symbol: securityData.tsym || quoteData.tsym || securityData.symbol || quoteData.symbol,
        }

        // Close order dialog first (match old code: this.closeMenudialog("order"))
        closeOrderDialog()

        // Always navigate to orders page with query params to ensure it works from any route
        // Use router.replace to ensure we navigate away from current route completely
        // This fixes the issue where navigation gets stuck when coming from stocks details page
        router.replace({
            path: '/orders',
            query: {
                // Pass security data as query params (like old code params)
                token: sipSecurityData.token,
                tsym: sipSecurityData.tsym,
                exch: sipSecurityData.exch,
                ls: sipSecurityData.ls,
                // Add a timestamp to force route update even if params are the same
                _t: Date.now()
            }
        }).then(() => {
            // Navigation completed - handleRouteParams in StockOrderSrc will:
            // 1. Detect the query params
            // 2. Switch to SIP tab (index 4)
            // 3. Trigger siporder-trigger event which opens the dialog
            // console.log('[SIP Tab] Navigation to orders page completed')
        }).catch((error) => {
            // console.error('[SIP Tab] Navigation error:', error)
            // Fallback: If navigation fails, try to trigger directly
            // This ensures the dialog opens even if navigation has issues
            window.dispatchEvent(new CustomEvent('order-tab', {
                detail: 4
            }))
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('siporder-trigger', {
                    detail: sipSecurityData
                }))
            }, 300)
        })

        return
    }

    // Handle Cover and Bracket order type changes
    if (orderType.value === 1 || orderType.value === 2) {
        // Reset stop loss and target if not in modify mode
        if (orderContextType.value !== 'mod-order' && orderContextType.value !== 're-order') {
            stopLossPrice.value = 0
            if (orderType.value === 2) {
                targetPrice.value = 0
            }
        }
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

    // Only compute margin if stop loss is set for Cover/Bracket orders
    // This prevents 400 error when switching tabs
    // Use immediate flag to call immediately when order type changes
    if (orderType.value === 1 || orderType.value === 2) {
        if (stopLossPrice.value && stopLossPrice.value > 0) {
            debouncedComputeMarginAndBrokerage(true) // immediate call
        }
    } else {
        debouncedComputeMarginAndBrokerage(true) // immediate call
    }
}

async function handleMenuDialogEvent(event) {
    const { type, token, exch, tsym, trantype, item } = event.detail || {}
    if (!type || !token || !exch || !tsym) return

    // Guard 0: Ignore alert types - these are handled by AlertSrceen component
    // But close this dialog if it's open when alert is opened
    if (type === 'alert' || type === 'm-alert') {
        if (orderDialog.value) {
            closeOrderDialog()
        }
        return
    }

    // Guard 1: Prevent duplicate opening if dialog is already opening
    if (isOpeningDialog.value) {
        return
    }

    // Guard 2: If dialog is already open, close it first before opening with new data
    if (orderDialog.value) {
        closeOrderDialog()
        await nextTick()
    }

    // Guard 3: Set flag to prevent concurrent openings
    isOpeningDialog.value = true

    // Handle cancel order directly (no dialog needed)
    if (type === 'cancel-order' && item) {
        isOpeningDialog.value = false
        const skipMessage = event.detail?.skipMessage || false
        const result = await cancelOrder(item, skipMessage)

        // If skipMessage is true, dispatch result event for batch cancellation
        if (skipMessage && result) {
            window.dispatchEvent(new CustomEvent('cancel-order-result', {
                detail: { item, result }
            }))
        }
        return
    }

    try {
        orderContextType.value = type
        existingOrderItem.value = item || null

        // Reset dialog position - always open at center
        localStorage.removeItem('stockOrderWindow_position')
        dialogStyle.value = {}

        // CRITICAL: Open dialog immediately with basic data to avoid delay on first click
        // Create minimal quote data from available info to show dialog instantly
        const basicQuote = {
            token: token,
            tsym: tsym,
            exch: exch,
            ls: 1, // Default lot size, will be updated when real data loads
            lp: 0, // Will be updated when real data loads
            ltp: 0,
            ch: 0,
            chp: 0,
            instname: 'EQ' // Default, will be updated
        }

        // Set basic data immediately and open dialog
        menudata.value = [basicQuote]
        buyOrSellIsSell.value = (trantype || '').toLowerCase() === 's'
        investType.value = (exch === 'NSE' || exch === 'BSE') ? 'C' : 'I'
        priceType.value = 'LMT'
        // Don't set isQuickOrder from quickOrderDefault - always start with Advanced Order (false)
        orderType.value = 0
        // Don't set default quantity if it's modify/re-order - let the prefill logic handle it
        if (!item || (type !== 'mod-order' && type !== 're-order' && type !== 'exit-order')) {
            quantity.value = 1 // Default, will be updated
        }
        price.value = 0 // Will be updated when quote loads
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

        // Open dialog immediately (no delay) - this ensures instant response on first click
        orderDialog.value = true

        // Load quote and security data in background (non-blocking)
        // This ensures dialog opens instantly while data loads
        Promise.all([
            getQuotesdata(`${exch}|${token}`).catch(err => {
                // console.error('Error fetching quote:', err)
                return null
            }),
            // Security data will be fetched after quote if needed
            Promise.resolve(null)
        ]).then(async ([q]) => {
            if (q) {
                // Update menudata with real quote data
                if (menudata.value[0]) {
                    Object.assign(menudata.value[0], q)
                } else {
                    menudata.value[0] = q
                }

                // Update quantity and price with real data
                // Don't overwrite quantity if it's modify/re-order - let the prefill logic handle it
                if (!item || (type !== 'mod-order' && type !== 're-order' && type !== 'exit-order')) {
                    quantity.value = Number(q?.ls || 1)
                }
                // Only update price if not already set by modify/re-order logic
                if (!item || (type !== 'mod-order' && type !== 're-order' && type !== 'exit-order') || price.value === 0) {
                    price.value = Number(q?.lp || 0)
                }

                // Fetch security data if needed (non-blocking)
                if (q && q.instname !== 'UNDIND' && q.instname !== 'COM') {
                    getSecuritydata(`${exch}|${token}`).then(s => {
                        if (s) {
                            // Add or update security data
                            if (menudata.value.length > 1) {
                                menudata.value[1] = s
                            } else {
                                menudata.value.push(s)
                            }
                        }
                    }).catch(err => {
                        // console.error('Error fetching security:', err)
                    })
                }

                // Compute margin after quote data is loaded
                debouncedComputeMarginAndBrokerage(true)
            }
        })

        // Modify / Re-order / Exit prefill
        // Note: This will be updated when quote data loads, but set defaults now
        if (item && (type === 'mod-order' || type === 're-order' || type === 'exit-order')) {
            priceType.value = item.prctyp || 'LMT'
            // Store raw quantity from item (this is the actual order quantity in raw units)
            const rawItemQty = Math.abs(Number(item.qty) || 0)

            // Set initial quantity based on exchange and item lot size
            // Old app logic: divide by lot size for MCX, divide by 1 for others
            // Use item.ls if available, otherwise use exchange-based logic
            const itemLotSize = item.ls ? Number(item.ls) : (exch === 'MCX' ? 1 : 1)
            const initialLotSize = (exch === 'MCX') ? itemLotSize : 1
            const displayQty = rawItemQty > 0 ? Number(rawItemQty / initialLotSize) : 1
            quantity.value = displayQty || 1

            price.value = (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? 0 : Number(item.prc || 0)
            triggerPrice.value = (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') ? Number(item.trgprc || 0) : 0
            buyOrSellIsSell.value = (item.trantype || '').toUpperCase() === 'S'

            // Set product type (delivery/intraday) from item for modify and re-order
            if (type === 'mod-order' || type === 're-order') {
                // Use prd field if available, otherwise map from s_prdt_ali
                if (item.prd) {
                    investType.value = item.prd
                } else if (item.s_prdt_ali) {
                    const productMap = {
                        'CNC': 'C',
                        'MIS': 'I',
                        'NRML': 'M',
                        'C': 'C',
                        'I': 'I',
                        'M': 'M'
                    }
                    investType.value = productMap[item.s_prdt_ali.toUpperCase()] || investType.value
                }
                // Set AMO value from item
                afterMarket.value = item.amo === 'Yes' || item.amo === true
            }

            // console.log('[StockOrderWindow] Pre-filling order data:', {
            //     type,
            //         rawItemQty,
            //         initialQuantity: quantity.value,
            //             itemLotSize,
            //             initialLotSize,
            //             displayQty: quantity.value,
            //                 fullItem: item,
            //                     itemFields: {
            //         qty: item.qty,
            //             fillshares: item.fillshares,
            //                 ls: item.ls,
            //                     exch: item.exch,
            //                         tsym: item.tsym
            //     }
            // })

            // Update quantity with lot size when quote loads
            // Match old app logic: divide by lot size for MCX, divide by 1 for others
            Promise.all([
                getQuotesdata(`${exch}|${token}`).catch(() => null)
            ]).then(([q]) => {
                if (q && item) {
                    // Old app logic: Number(Math.abs(item.qty) / Number(exch == "MCX" ? this.menudata[1].ls : 1))
                    // item.qty is in raw units, divide by lot size only for MCX, otherwise divide by 1
                    const lotSize = (exch === 'MCX') ? Number(q?.ls || 1) : 1
                    const displayQty = rawItemQty > 0 ? Number(rawItemQty / lotSize) : 1
                    quantity.value = displayQty || 1

                    // console.log('[StockOrderWindow] Updated quantity after quote load:', {
                    // rawItemQty,
                    //     exch,
                    //     lotSize,
                    //     displayQty: quantity.value,
                    //     quoteData: q
                    // })

                    if (priceType.value !== 'MKT' && priceType.value !== 'SL-MKT' && !price.value) {
                        price.value = Number(item.prc || q?.lp || 0)
                    }
                } else {
                    // If quote fails to load, use old app logic: divide by 1 for non-MCX, or assume lot size = 1
                    const lotSize = (exch === 'MCX') ? 1 : 1 // Default to 1 if quote not available
                    const displayQty = rawItemQty > 0 ? Number(rawItemQty / lotSize) : 1
                    quantity.value = displayQty || 1
                    // console.warn('[StockOrderWindow] Quote data not available, using default lot size calculation:', {
                    //     rawItemQty,
                    //     exch,
                    //     displayQty: quantity.value
                    // })
                }
            })
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
            gttPrice.value = null
            gttTriggerPrice.value = null
            ocoPrice.value = null
            ocoTriggerPrice.value = null
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

            // Clear cache when modifying GTT order - reset OCO panel for buy orders
            // This must be done AFTER setting buyOrSellIsSell to ensure correct check
            if (!buyOrSellIsSell.value) {
                gttOCOPanel.value = false
                ocoValue.value = 0
                ocoQty.value = 1
                ocoPrice.value = null
                ocoTriggerPrice.value = null
                ocoPriceType.value = 'LMT'
            }

            if (item.res?.place_order_params) {
                gttValue.value = Number(item.res?.oivariable?.[0]?.d || item.value || 0)
                priceType.value = item.res.place_order_params.prctyp || 'LMT'
                investType.value = item.res.place_order_params.prd || investType.value
                // Set default qty, will be updated when quote loads
                gttQty.value = Number(item.res.place_order_params.qty) || 1
                gttPrice.value = (item.res.place_order_params.prctyp === 'MKT' || item.res.place_order_params.prctyp === 'SL-MKT') ? 0 : Number(item.res.place_order_params.prc || 0)
                gttTriggerPrice.value = Number(item.res.place_order_params.trgprc || 0)

                // Update with lot size when quote loads
                getQuotesdata(`${exch}|${token}`).then(q => {
                    if (q && item.res?.place_order_params) {
                        gttQty.value = Number(item.res.place_order_params.qty) / Number(q?.ls || 1) || 1
                    }
                }).catch(() => { })
            }

            // Only load OCO data if it's a sell order (buy orders don't have OCO)
            if (item.res?.place_order_params_leg2 && buyOrSellIsSell.value) {
                gttOCOPanel.value = true
                ocoValue.value = Number(item.res?.oivariable?.[1]?.d || 0)
                ocoPriceType.value = item.res.place_order_params_leg2.prctyp || 'LMT'
                // Set default qty, will be updated when quote loads
                ocoQty.value = Number(item.res.place_order_params_leg2.qty) || 1
                ocoPrice.value = (item.res.place_order_params_leg2.prctyp === 'MKT' || item.res.place_order_params_leg2.prctyp === 'SL-MKT') ? 0 : Number(item.res.place_order_params_leg2.prc || 0)
                ocoTriggerPrice.value = Number(item.res.place_order_params_leg2.trgprc || 0)

                // Update with lot size when quote loads
                getQuotesdata(`${exch}|${token}`).then(q => {
                    if (q && item.res?.place_order_params_leg2) {
                        ocoQty.value = Number(item.res.place_order_params_leg2.qty) / Number(q?.ls || 1) || 1
                    }
                }).catch(() => { })
            }

            orderType.value = 3
        }

        // Load preferences in background (non-blocking, best-effort)
        setOrdprefApi({}, false).then(pref => {
            if (pref && pref.stat === 'Ok') {
                // Load sticky and quick order settings from metadata (like old app: orepre['stickysrc'] and orepre['quicksrc'])
                if (pref.metadata) {
                    if (pref.metadata.stickysrc !== undefined) {
                        isStickyDialog.value = pref.metadata.stickysrc === true || pref.metadata.stickysrc === 'true'
                    }
                    if (pref.metadata.quicksrc !== undefined) {
                        const quickSrc = pref.metadata.quicksrc === true || pref.metadata.quicksrc === 'true'
                        quickOrderDefault.value = quickSrc
                        // Don't set isQuickOrder here - always start with Advanced Order (false)
                    }
                }
                // Legacy support for old format (if metadata doesn't exist)
                if (pref.quickord !== undefined && !pref.metadata?.quicksrc) {
                    quickOrderDefault.value = pref.quickord === true || pref.quickord === 'true'
                    // Don't set isQuickOrder here - always start with Advanced Order (false)
                }
                if (pref.ordsrcpop !== undefined && !pref.metadata?.stickysrc) {
                    isStickyDialog.value = pref.ordsrcpop === true || pref.ordsrcpop === 'true'
                }
                if (pref.investype) investType.value = pref.investype
                // Don't overwrite price type if it's modify/re-order - it's already set from item
                if (pref.prc && (!item || (type !== 'mod-order' && type !== 're-order' && type !== 'exit-order'))) {
                    priceType.value = pref.prc
                }
                // Don't overwrite quantity if it's modify/re-order - it's already set from item
                if (pref.ordqty && (!item || (type !== 'mod-order' && type !== 're-order' && type !== 'exit-order'))) {
                    quantity.value = Number(pref.ordqty) || quantity.value
                }
            }
        }).catch(() => { })

        // Dialog is already opened above, just restore position and setup drag
        await nextTick()
        restoreDialogPosition()
        setupDragFunctionality()

        // Subscribe to websocket for live price updates (will use token from basicQuote initially)
        // This will be updated when real quote data loads
        if (token && exch) {
            try {
                const wsEvent = new CustomEvent('web-scoketOn', {
                    detail: {
                        flow: 'sub',
                        data: [{
                            token: token,
                            exch: exch,
                            tsym: tsym
                        }],
                        is: 'order-window',
                        page: 'order-window'
                    }
                })
                window.dispatchEvent(wsEvent)
            } catch (e) {
                // console.error('[StockOrderWindow] Error subscribing to websocket:', e)
            }
        }

        // Update websocket subscription when quote loads with real data
        Promise.all([
            getQuotesdata(`${exch}|${token}`).catch(() => null)
        ]).then(([q]) => {
            if (q && q.token && q.exch) {
                // Re-subscribe with real quote data for better accuracy
                try {
                    const wsEvent = new CustomEvent('web-scoketOn', {
                        detail: {
                            flow: 'sub',
                            data: [{
                                token: q.token,
                                exch: q.exch,
                                tsym: q.tsym
                            }],
                            is: 'order-window',
                            page: 'order-window'
                        }
                    })
                    window.dispatchEvent(wsEvent)
                } catch (e) {
                    // console.error('[StockOrderWindow] Error re-subscribing to websocket:', e)
                }
            }
        })

        // Reset last price tracking when dialog opens
        lastPriceForMargin = null
        // Margin will be computed after quote data loads (see Promise.all above)
        // For now, compute with basic data if available
        if (basicQuote.token) {
            debouncedComputeMarginAndBrokerage(true)
        }
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to open order window')
        // console.error('[StockOrderWindow] Error opening dialog:', e)
    } finally {
        // Clear the opening flag after a short delay
        setTimeout(() => {
            isOpeningDialog.value = false
        }, 500)
    }
}

// Cancel order function - handles cancel-order directly without opening dialog
// Returns: { success: boolean, message: string } or null on error
async function cancelOrder(item, skipMessage = false) {
    if (!item || !item.norenordno) {
        if (!skipMessage) {
            appStore.showSnackbar(2, 'Invalid order data')
        }
        return { success: false, message: 'Invalid order data' }
    }

    try {
        isPlacingOrder.value = true

        // Call GetQuotes API first (like old app) to get quote data for snackbar message
        let quotesData = null
        try {
            const exch = item.exch || item.exchs || ''
            const token = item.token || ''
            if (exch && token) {
                quotesData = await getQuotesdata(`${exch}|${token}`)
            }
        } catch (quoteError) {
            // Continue even if GetQuotes fails - use item data as fallback
        }

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
            const errorMessage = res?.emsg || 'Failed to cancel order'
            if (!skipMessage) {
                appStore.showSnackbar(2, errorMessage)
            }
            return { success: false, message: errorMessage }
        } else {
            // Format snackbar message like old app: "Your BUY order 25111700041237 for CIPLA-EQ in NSE is CANCELED"
            const orderType = item.trantype === 'B' || item.trantype === 'b' ? 'BUY' : 'SELL'
            const norenordno = item.norenordno || ''
            // Use quotesData if available, otherwise fallback to item data
            const tsym = quotesData?.tsym || item.tsym || ''
            const exch = quotesData?.exch || item.exch || item.exchs || ''

            const message = `Your ${orderType} order ${norenordno} for ${tsym} in ${exch} is CANCELED`

            // Only show message immediately if not skipping (single order cancellation)
            if (!skipMessage) {
                appStore.showSnackbar(0, message)

                // Trigger orderbook update to refresh the orders list (only for single cancellation)
                // For batch cancellation, the parent component handles the update
                try {
                    window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
                    // Removed order-cancelled event to prevent duplicate API calls
                } catch (_) { }
            }
            // For batch cancellation (skipMessage=true), don't trigger orderbook update here
            // The parent component (StocksOrderBook) will trigger it once after all cancellations

            return { success: true, message }
        }
    } catch (e) {
        const errorMessage = 'Failed to cancel order'
        if (!skipMessage) {
            appStore.showSnackbar(2, errorMessage)
        }
        // console.error('Cancel order error:', e)
        return { success: false, message: errorMessage }
    } finally {
        isPlacingOrder.value = false
    }
}

function increaseQuantity() {
    const q = menudata.value[0]
    if (!q) return
    const ls = Number(q.ls || 1)
    const step = q.exch === 'MCX' ? 1 : ls
    const freezeQty = Number(menudata.value[1]?.frzqty || 0)
    const maxQty = freezeQty > 0 ? freezeQty * 40 : Infinity

    let adjustedQty = Math.round(Number(quantity.value) / ls) * ls
    const newQty = Number(quantity.value) !== adjustedQty ? adjustedQty : Number(quantity.value) + step

    // Check if new quantity exceeds freeze quantity * 40
    // Don't show snackbar here - only show when buy button is clicked
    if (newQty > maxQty) {
        return
    }

    quantity.value = newQty
    validateQuantity()
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
    validateQuantity()
}

function increaseDisclosedQty() {
    // Increment disclosed quantity by 1
    const currentQty = Number(disclosedQty.value || 0)
    const orderQty = Number(quantity.value || 0)
    const q = menudata.value[0]
    if (!q) return

    const ls = Number(q.ls || 1)
    const isMCX = q.exch === 'MCX'
    // Calculate actual order quantity in lot size units
    const actualOrderQty = orderQty * (isMCX ? ls : 1)

    // Don't allow disclosed qty to exceed order quantity
    if (currentQty < actualOrderQty) {
        disclosedQty.value = currentQty + 1
    }
}

function decreaseDisclosedQty() {
    // Decrement disclosed quantity by 1, but don't go below 0
    const currentQty = Number(disclosedQty.value || 0)
    if (currentQty > 0) {
        disclosedQty.value = currentQty - 1
    }
}

function validateDisclosedQty() {
    // Validate disclosed quantity - must be > 0 if addValidityQty is checked
    if (addValidityQty.value) {
        const dq = Number(disclosedQty.value || 0)
        if (dq <= 0) {
            appStore.showSnackbar(2, 'Disclosed Qty must be greater than zero')
            return
        }

        // Check if disclosed qty doesn't exceed order quantity
        const orderQty = Number(quantity.value || 0)
        const q = menudata.value[0]
        if (!q) return

        const ls = Number(q.ls || 1)
        const isMCX = q.exch === 'MCX'
        // Calculate actual order quantity in lot size units
        const actualOrderQty = orderQty * (isMCX ? ls : 1)

        if (dq > actualOrderQty) {
            appStore.showSnackbar(2, 'Disclosed Qty cannot exceed order quantity')
            // Auto-correct to order quantity if it exceeds
            disclosedQty.value = actualOrderQty
            return
        }
    }
}

function closeSliceDialog() {
    // Close slice dialog and restore order dialog
    sliceDialog.value = false
    orderDialog.value = true
    // Restore dialog position
    nextTick(() => {
        restoreDialogPosition()
        setupDragFunctionality()
    })
}

function calculateSliceQuantities() {
    // Calculate slice quantities when quantity exceeds freeze quantity (like old code)
    const q = menudata.value[0]
    const sec = menudata.value[1]
    if (!q || !sec) {
        // Reset to default if no data
        sliceFq.value = 1
        sliceFzqty.value = []
        return
    }

    const freezeQty = Number(sec.frzqty || 0)
    const lotSize = Number(q.ls || 1)
    const isMCX = q.exch === 'MCX'

    // Calculate total quantity in lot size units (like old code)
    const totalQty = Number(quantity.value || 0) * (isMCX ? lotSize : 1)

    if (freezeQty > 0 && totalQty > freezeQty) {
        // Calculate number of slices using Math.trunc (like old code)
        const numSlices = Math.trunc(totalQty / freezeQty)
        const remainder = totalQty - (freezeQty * numSlices)

        // Ensure numSlices is at least 1
        if (numSlices > 0) {
            // Create array with all slice quantities (like old code)
            sliceFzqty.value = []
            for (let i = 0; i < numSlices; i++) {
                sliceFzqty.value.push(freezeQty)
            }
            if (remainder > 0) {
                sliceFzqty.value.push(remainder)
            }

            sliceFq.value = numSlices
        } else {
            // Fallback: if calculation fails, use single slice
            sliceFq.value = 1
            sliceFzqty.value = [totalQty]
        }
    } else {
        // No slicing needed
        sliceFq.value = 1
        sliceFzqty.value = [totalQty]
    }
}

async function placeSliceOrder() {
    // Place slice orders sequentially (like old code setUPPlaceorder with loop=true)
    const q = menudata.value[0]
    const sec = menudata.value[1]
    if (!q || !sec) {
        appStore.showSnackbar(2, 'Invalid order data')
        return
    }

    // Recalculate slices to ensure we have the latest data
    calculateSliceQuantities()

    if (sliceFzqty.value.length === 0) {
        appStore.showSnackbar(2, 'No slice quantities to place')
        return
    }

    try {
        isPlacingOrder.value = true

        // Store original quantity
        const originalQty = quantity.value
        const lotSize = Number(q.ls || 1)
        const isMCX = q.exch === 'MCX'

        // Place orders sequentially (like old code)
        let i = 0
        let successCount = 0
        let failCount = 0
        const placeSliceSequentially = async () => {
            if (i >= sliceFzqty.value.length) {
                isPlacingOrder.value = false
                // Close dialogs after all orders placed
                sliceDialog.value = false
                orderDialog.value = false
                // Restore original quantity
                quantity.value = originalQty

                // Show snackbar message based on results
                if (failCount === 0) {
                    appStore.showSnackbar(1, `Slice order placed successfully (${successCount} order${successCount > 1 ? 's' : ''})`)
                } else {
                    appStore.showSnackbar(2, `Slice order partially failed (${successCount} succeeded, ${failCount} failed)`)
                }

                // Trigger orderbook update
                try {
                    window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))
                } catch (_) { }
                return
            }

            if (sliceFzqty.value[i] > 0) {
                // Use actual quantity from sliceFzqty (already in lot size units)
                // Convert to display units for quantity.value (like old code uses fqty directly)
                const sliceQty = isMCX ? sliceFzqty.value[i] : sliceFzqty.value[i] / lotSize
                quantity.value = sliceQty

                // Place order for this slice (suppress individual success messages with loop=true)
                // Pass actual quantity to placeOrder (like old code passes fqty)
                try {
                    // Ensure order dialog is closed when placing slice orders
                    orderDialog.value = false
                    // Place order with actual quantity (like old code)
                    await placeOrder(true, sliceFzqty.value[i])
                    successCount++
                } catch (e) {
                    failCount++
                    // console.error(`Slice ${i + 1} failed:`, e)
                }

                // Small delay between orders (like old code uses 0ms timeout)
                i++
                setTimeout(placeSliceSequentially, 0)
            } else {
                i++
                setTimeout(placeSliceSequentially, 0)
            }
        }

        // Start placing orders
        placeSliceSequentially()
    } catch (e) {
        appStore.showSnackbar(2, 'Failed to place slice order')
        // console.error('Slice order error:', e)
        isPlacingOrder.value = false
    }
}

function closeOrderDialog() {
    // Clear any pending debounce timers to prevent API calls after dialog closes
    if (marginDebounceTimer) {
        clearTimeout(marginDebounceTimer)
        marginDebounceTimer = null
    }
    if (websocketMarginDebounceTimer) {
        clearTimeout(websocketMarginDebounceTimer)
        websocketMarginDebounceTimer = null
    }

    // Reset last price tracking
    lastPriceForMargin = null

    // Reset dialog position - always open at center next time
    localStorage.removeItem('stockOrderWindow_position')
    dialogStyle.value = {}

    // Unsubscribe from websocket before closing
    if (menudata.value[0] && menudata.value[0].token && menudata.value[0].exch) {
        try {
            const wsEvent = new CustomEvent('web-scoketOn', {
                detail: {
                    flow: 'unsub',
                    data: [{
                        token: menudata.value[0].token,
                        exch: menudata.value[0].exch,
                        tsym: menudata.value[0].tsym
                    }],
                    is: 'order-window',
                    page: 'order-window'
                }
            })
            window.dispatchEvent(wsEvent)
        } catch (e) {
            // console.error('[StockOrderWindow] Error unsubscribing from websocket:', e)
        }
    }

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
        sliceDialog.value = false
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
        // Reset to Advanced Order mode (not Quick Order)
        isQuickOrder.value = false
        // Reset slice order state
        sliceFzqty.value = []
        sliceFq.value = 1
    })
}

function validateOrder() {
    const q = menudata.value[0]
    if (!q) return 'Symbol not loaded'

    // Quantity validation: must be > 0
    if (!(quantity.value > 0)) {
        // Don't show snackbar here - it will be shown in placeOrder
        return 'Quantity must be greater than zero'
    }

    // Quantity validation: check freeze quantity limits
    const sec = menudata.value[1]
    if (sec) {
        const freezeQty = Number(sec.frzqty || 0)
        const lotSize = Number(q.ls || 1)
        const isMCX = q.exch === 'MCX'
        const maxQty = freezeQty * 40

        // Convert quantity to actual units for comparison
        const totalQty = Number(quantity.value || 0) * (isMCX ? lotSize : 1)

        if (freezeQty > 0) {
            // If quantity exceeds freeze quantity * 40 - prevent order
            if (totalQty > maxQty) {
                // Don't show snackbar here - it will be shown in placeOrder
                return 'Quantity cannot be split more than 20 times.'
            }
            // If quantity exceeds freeze quantity but <= freeze quantity * 40 - slice dialog will handle it
            // (This check is already done in placeOrder before validateOrder is called)
        }
    }

    if ((priceType.value === 'LMT' || priceType.value === 'SL-LMT') && (price.value <= 0)) {
        return 'Price must be greater than zero'
    }
    // Validate trigger price for SL-LMT (skip for GTT orders - they have their own validation)
    if (priceType.value === 'SL-LMT' && orderType.value !== 3) {
        // Check if triggerPrice is defined and valid
        if (triggerPrice.value == null || triggerPrice.value === undefined || triggerPrice.value === '' || triggerPrice.value <= 0) {
            return 'Trigger price must be greater than zero'
        }

        const triggerPriceNum = Number(triggerPrice.value || 0)
        const priceNum = Number(price.value || 0)

        // First check circuit limits
        const lc = Number(q.lc)
        const uc = Number(q.uc)
        if (isFinite(lc) && isFinite(uc)) {
            if (triggerPriceNum < lc || triggerPriceNum > uc) {
                return `Trigger must be within circuit limits ${lc} - ${uc}`
            }
        }

        // For Cover orders with SL-LMT: trigger must be less than limit price
        if (orderType.value === 1 && triggerPriceNum > 0 && priceNum > 0) {
            if (triggerPriceNum >= priceNum) {
                return 'Trigger price must be less than limit price'
            }
        } else if (orderType.value === 0) {
            // For regular orders: check buy vs sell
            if (buyOrSellIsSell.value) {
                // For Sell orders: trigger must be greater than or equal to limit price
                if (triggerPriceNum > 0 && priceNum > 0 && triggerPriceNum < priceNum) {
                    return 'Trigger price must be greater than limit price'
                }
            } else {
                // For Buy orders: trigger must be less than or equal to limit price
                if (triggerPriceNum > 0 && priceNum > 0 && triggerPriceNum > priceNum) {
                    return 'Trigger price must be less than limit price'
                }
            }
        } else if (orderType.value !== 1) {
            // For other non-Cover orders (Bracket, etc.): trigger must be less than limit price (existing logic)
            if (triggerPriceNum > 0 && priceNum > 0 && triggerPriceNum >= priceNum) {
                return 'Trigger price must be less than limit price'
            }
        }
    }

    // Validate trigger price for SL-MKT (skip for GTT orders - they have their own validation)
    if (priceType.value === 'SL-MKT' && orderType.value !== 3) {
        // Check if triggerPrice is defined and valid
        if (triggerPrice.value == null || triggerPrice.value === undefined || triggerPrice.value === '' || triggerPrice.value <= 0) {
            return 'Trigger price must be greater than zero'
        }

        const triggerPriceNum = Number(triggerPrice.value || 0)
        const ltp = Number(menudata.value?.ltp || menudata.value[0]?.lp || 0)

        // First check circuit limits
        const lc = Number(q.lc)
        const uc = Number(q.uc)
        if (isFinite(lc) && isFinite(uc)) {
            if (triggerPriceNum < lc || triggerPriceNum > uc) {
                return `Trigger must be within circuit limits ${lc} - ${uc}`
            }
        }

        // For regular orders: check buy vs sell
        if (orderType.value === 0) {
            if (buyOrSellIsSell.value) {
                // For Sell orders: trigger must be less than LTP
                if (triggerPriceNum > 0 && ltp > 0 && triggerPriceNum >= ltp) {
                    return 'Trigger price must be less than LTP'
                }
            } else {
                // For Buy orders: trigger must be greater than LTP (existing logic)
                if (triggerPriceNum > 0 && ltp > 0 && triggerPriceNum <= ltp) {
                    return 'Trigger price must be greater than LTP'
                }
            }
        } else {
            // For other order types (Cover, Bracket, etc.): trigger must be greater than LTP (existing logic)
            if (triggerPriceNum > 0 && ltp > 0 && triggerPriceNum <= ltp) {
                return 'Trigger price must be greater than LTP'
            }
        }
    }
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
    // GTT order validation (like old app lines 1806-1810)
    if (orderType.value === 3) {
        // Validate GTT value - cannot be empty and must be > 0
        if (gttValue.value === null || gttValue.value === undefined || gttValue.value === '') {
            return 'Value cannot be empty'
        }
        // Convert to number and check if it's > 0
        const valueNum = Number(gttValue.value)
        if (isNaN(valueNum) || valueNum <= 0) {
            return 'Value must be greater than zero'
        }

        // Validate GTT quantity - cannot be empty and must be > 0
        if (gttQty.value === null || gttQty.value === undefined || gttQty.value === '') {
            return 'Quantity cannot be empty'
        }
        // Convert to number and check if it's > 0
        const qtyNum = Number(gttQty.value)
        if (isNaN(qtyNum) || qtyNum <= 0) {
            return 'Quantity must be greater than zero'
        }

        // Validate GTT price (for non-market orders) - cannot be empty and must be > 0
        if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
            // Check if price is null, undefined, or empty string
            if (gttPrice.value === null || gttPrice.value === undefined || gttPrice.value === '') {
                return 'Price cannot be empty'
            }
            // Convert to number and check if it's > 0
            const priceNum = Number(gttPrice.value)
            if (isNaN(priceNum) || priceNum <= 0) {
                return 'Price must be greater than zero'
            }
        }

        // Validate GTT trigger price (for SL orders) - cannot be empty and must be > 0
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            const triggerValue = gttTriggerPrice.value

            // Debug logging
            // console.log('[GTT Trigger Validation]', {
            //     triggerValue,
            //     type: typeof triggerValue,
            //     priceType: priceType.value,
            //     orderType: orderType.value,
            //     isNull: triggerValue === null,
            //     isUndefined: triggerValue === undefined,
            //     isEmptyString: triggerValue === '',
            //     isZero: triggerValue === 0
            // })

            // First, check if the value is truly empty (null, undefined, empty string)
            if (triggerValue === null || triggerValue === undefined || triggerValue === '') {
                // console.log('[GTT Trigger Validation] Failed: Value is empty')
                return 'Trigger cannot be empty'
            }

            // Convert to number - handle both string and number inputs
            let triggerNum
            if (typeof triggerValue === 'string') {
                const trimmed = triggerValue.trim()
                if (trimmed === '' || trimmed === '0') {
                    // console.log('[GTT Trigger Validation] Failed: String is empty or "0"')
                    return 'Trigger cannot be empty'
                }
                triggerNum = parseFloat(trimmed)
                // console.log('[GTT Trigger Validation] String conversion:', { trimmed, triggerNum })
            } else {
                triggerNum = Number(triggerValue)
                // console.log('[GTT Trigger Validation] Number conversion:', { triggerValue, triggerNum })
            }

            // Check if conversion resulted in NaN, or if value is 0 or negative
            // Only show error if the value is actually invalid (not just 0 from empty input)
            if (isNaN(triggerNum) || !isFinite(triggerNum)) {
                // console.log('[GTT Trigger Validation] Failed: Invalid number', { triggerNum, isNaN: isNaN(triggerNum), isFinite: isFinite(triggerNum) })
                return 'Trigger must be a valid number'
            }
            if (triggerNum <= 0) {
                // console.log('[GTT Trigger Validation] Failed: Value <= 0', { triggerNum })
                return 'Trigger must be greater than zero'
            }

            // console.log('[GTT Trigger Validation] Success:', { triggerNum })
        }

        // Validate OCO fields if OCO panel is open
        if (gttOCOPanel.value) {
            if (ocoValue.value <= 0) {
                return 'OCO value must be greater than zero'
            }
            if (ocoQty.value <= 0) {
                return 'OCO quantity must be greater than zero'
            }

            // Validate OCO price (for non-market orders)
            if (ocoPriceType.value === 'LMT' || ocoPriceType.value === 'SL-LMT') {
                if (!ocoPrice.value || ocoPrice.value <= 0) {
                    return 'OCO price must be greater than zero'
                }
            }

            // Validate OCO trigger price (for SL orders)
            if (ocoPriceType.value === 'SL-LMT' || ocoPriceType.value === 'SL-MKT') {
                if (!ocoTriggerPrice.value || ocoTriggerPrice.value <= 0) {
                    return 'OCO trigger price must be greater than zero'
                }
            }
        }

        // GTT quantity lot size validation
        const ls = Number(q.ls || 1)
        if (q.exch !== 'MCX' && (gttQty.value % ls !== 0)) {
            return `GTT quantity must be a multiple of lot size ${ls}`
        }
        if (gttOCOPanel.value && q.exch !== 'MCX' && (ocoQty.value % ls !== 0)) {
            return `OCO quantity must be a multiple of lot size ${ls}`
        }

        // Skip regular quantity validation for GTT orders
        return null
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
            // Safely check trigger price
            if (triggerPrice.value != null && triggerPrice.value !== undefined && triggerPrice.value !== '') {
                if (!isTickMultiple(Number(triggerPrice.value || 0))) return `Trigger should be multiple of tick size ${ti}`
            }
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
        // Note: Trigger price circuit limits are checked earlier in SL-LMT and SL-MKT sections
        if (orderType.value === 1 || orderType.value === 2) {
            // Cover order stop loss validation
            if (orderType.value === 1) {
                // First check: stop loss must be greater than zero
                if (!stopLossPrice.value || !(stopLossPrice.value > 0)) {
                    return 'Stop loss must be greater than zero'
                }

                const sl = Number(stopLossPrice.value)

                // Get limit price based on price type
                let limitPrice = 0
                if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
                    limitPrice = Number(price.value || 0)
                } else if (priceType.value === 'MKT') {
                    limitPrice = Number(menudata.value?.ltp || menudata.value[0]?.lp || 0)
                }

                // Second check: Calculate price using formula based on buy/sell
                // For BUY orders: price = limit price - stoploss price
                // For SELL orders: price = limit price + stoploss price
                // Then check if calculated price is within circuit limits
                if (limitPrice > 0) {
                    let calculatedPrice = 0
                    if (buyOrSellIsSell.value) {
                        // SELL orders: price = limit price + stoploss price
                        calculatedPrice = limitPrice + sl
                    } else {
                        // BUY orders: price = limit price - stoploss price
                        calculatedPrice = limitPrice - sl
                    }
                    // Check if calculated price is within circuit limits
                    if (calculatedPrice < lc || calculatedPrice > uc) {
                        const formula = buyOrSellIsSell.value ? 'Limit + Stop Loss' : 'Limit - Stop Loss'
                        return `Price (${formula} = ${calculatedPrice.toFixed(2)}) must be within circuit limits ${lc} - ${uc}`
                    }
                }
            }

            // Bracket order stop loss validation
            if (orderType.value === 2) {
                // First check: stop loss must be greater than zero
                if (!stopLossPrice.value || !(stopLossPrice.value > 0)) {
                    return 'Stop loss must be greater than zero'
                }

                const sl = Number(stopLossPrice.value)

                // Get limit price based on price type
                let limitPrice = 0
                if (priceType.value === 'LMT' || priceType.value === 'SL-LMT') {
                    limitPrice = Number(price.value || 0)
                } else if (priceType.value === 'MKT') {
                    limitPrice = Number(menudata.value?.ltp || menudata.value[0]?.lp || 0)
                }

                // Second check: Calculate price using formula based on buy/sell
                // For BUY orders: price = limit price - stoploss price
                // For SELL orders: price = limit price + stoploss price
                // Then check if calculated price is within circuit limits
                if (limitPrice > 0) {
                    let calculatedPrice = 0
                    if (buyOrSellIsSell.value) {
                        // SELL orders: price = limit price + stoploss price
                        calculatedPrice = limitPrice + sl
                    } else {
                        // BUY orders: price = limit price - stoploss price
                        calculatedPrice = limitPrice - sl
                    }
                    // Check if calculated price is within circuit limits
                    if (calculatedPrice < lc || calculatedPrice > uc) {
                        const formula = buyOrSellIsSell.value ? 'Limit + Stop Loss' : 'Limit - Stop Loss'
                        return `Price (${formula} = ${calculatedPrice.toFixed(2)}) must be within circuit limits ${lc} - ${uc}`
                    }
                }
            }
        }
    }
    // Cover/Bracket requirements - check if stoploss is greater than zero
    // Note: Cover and Bracket order stop loss validation is handled in circuit limits section above
    // Bracket order target validation: only check target cannot be empty and cannot be zero
    if (orderType.value === 2) {
        // Target validation: target cannot be empty and cannot be zero
        if (!targetPrice.value || !(targetPrice.value > 0)) {
            return 'Target must be greater than zero'
        }
    }
    return null
}

async function placeOrder(loop, fqty = null) {
    const q = menudata.value[0]
    if (!q) return

    // If fqty is provided (for slice orders), use it directly (like old code)
    // Otherwise, convert quantity to actual units (like old code: ordqty * (MCX ? ls : 1))
    const actualQty = fqty !== null && fqty > 0 ? fqty : (quantity.value * Number(q.exch === 'MCX' ? (q.ls || 1) : 1))

    // Check if quantity exceeds freeze quantity (only for non-loop orders)
    if (!loop) {
        const sec = menudata.value[1]
        if (sec) {
            const freezeQty = Number(sec.frzqty || 0)
            const lotSize = Number(q.ls || 1)
            const isMCX = q.exch === 'MCX'

            // Convert quantity to actual units (like calculateSliceQuantities)
            const totalQty = Number(quantity.value || 0) * (isMCX ? lotSize : 1)
            const maxQty = freezeQty * 40

            // Check if quantity exceeds freeze quantity
            if (freezeQty > 0 && totalQty > freezeQty) {
                // If quantity exceeds freeze quantity * 40, validateOrder will prevent it
                if (totalQty > maxQty) {
                    // Quantity exceeds maximum allowed - let validateOrder handle the error
                    // Continue to validateOrder to show error message
                } else {
                    // Quantity exceeds freeze quantity but <= freeze quantity * 40, show slice dialog
                    // Calculate slice quantities first to ensure data is ready
                    calculateSliceQuantities()

                    // Verify that slice quantities were calculated correctly
                    if (sliceFzqty.value && sliceFzqty.value.length > 0 && sliceFzqty.value[0] > 0) {
                        // Close order dialog first
                        orderDialog.value = false

                        // Use nextTick to ensure order dialog closes before opening slice dialog
                        await nextTick()

                        // Small delay to ensure smooth transition
                        setTimeout(() => {
                            sliceDialog.value = true
                        }, 50)
                        return
                    } else {
                        // If calculation failed, show error
                        appStore.showSnackbar(2, 'Failed to calculate slice quantities')
                        return
                    }
                }
            }
        }
    }

    // Validate market protection first (only for non-loop orders)
    if (!loop) {
        if (!validateMarketProtection()) {
            return // Snackbar already shown in validateMarketProtection
        }
    }

    // Validate order before placing
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
            // Map alert type to API format
            let aler = gttAlertType.value
            if (gttAlertType.value === 'Perc. change') {
                aler = 'CH_PER'
            }
            // Construct alert type string - format: ALERT_TYPE_CONDITION
            const ait = `${aler}_${con}`
            const uid = sessionStorage.getItem('userid')

            // Get al_id for modify operations (check both item.al_id and item.res.al_id)
            const gttAlId = existingOrderItem.value?.al_id || existingOrderItem.value?.res?.al_id

            // Handle OCO (One-Cancel-Other) orders - only for sell orders
            if (gttOCOPanel.value && buyOrSellIsSell.value) {
                gttItem = {
                    uid: uid,
                    ai_t: 'LMT_BOS_O',
                    al_id: (orderContextType.value === 'mod-GTT' && gttAlId) ? gttAlId : '',
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
                    al_id: (orderContextType.value === 'mod-GTT' && gttAlId) ? gttAlId : '',
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
            // For GTT orders, check al_id instead of norenordno (GTT orders use al_id)
            // gttAlId is already defined above
            if (orderContextType.value === 'mod-GTT' && gttAlId) {
                gttUrl = 'ModifyGTTOrder'
            } else if (gttOCOPanel.value && buyOrSellIsSell.value) {
                gttUrl = 'PlaceOCOOrder'
            }

            const resGtt = await getGTTPlaceOrder(gttItem, gttUrl)
            if (resGtt?.stat !== 'Ok' && resGtt?.stat !== 'OI created' && resGtt?.stat !== 'OI replaced') {
                appStore.showSnackbar(2, resGtt?.emsg || 'GTT order failed')
            } else {
                // Close dialog only if sticky is OFF (like old app: if (loop != true && !this.ordsrcpop))
                if (!loop && !isStickyDialog.value) {
                    orderDialog.value = false
                    // Use nextTick to ensure dialog closes before showing snackbar
                    await nextTick()
                }

                // Show success message in snackbar (right corner bottom like old app)
                // Suppress individual messages when placing slice orders (loop = true)
                if (!loop) {
                    const successMsg = resGtt?.stat === 'OI created' ? 'GTT Order have been Placed' :
                        resGtt?.stat === 'OI replaced' ? 'GTT Order have been Modified' :
                            gttUrl === 'ModifyGTTOrder' ? 'GTT order modified' : 'GTT order placed'
                    appStore.showSnackbar(1, successMsg)
                }

                // Trigger orderbook update to refresh the GTT orders table
                // Add delay to ensure API has processed the new/modified order
                try {
                    // For both new orders and modify operations, refresh after a delay
                    // This ensures the API has processed the order before we fetch the updated list
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'gtt' } }))
                    }, 1000)
                } catch (_) { }
            }
            return
        }

        const item = {
            uid: sessionStorage.getItem('userid'),
            actid: sessionStorage.getItem('userid'),
            exch: q.exch,
            tsym: q.tsym,
            ret: addValidityQty.value ? validityType.value : 'DAY',
            qty: actualQty.toString(),
            prc: (priceType.value === 'MKT' || priceType.value === 'SL-MKT') ? '0' : String(price.value),
            prd: orderType.value === 1 ? 'H' : (orderType.value === 2 ? 'B' : investType.value),
            trantype: buyOrSellIsSell.value ? 'S' : 'B',
            prctyp: priceType.value,
        }
        if (priceType.value === 'SL-LMT' || priceType.value === 'SL-MKT') {
            // Safely get trigger price value
            const triggerPriceVal = (triggerPrice.value != null && triggerPrice.value !== undefined && triggerPrice.value !== '')
                ? Number(triggerPrice.value) || 0
                : 0
            item['trgprc'] = String(triggerPriceVal)
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
            // Close dialog only if sticky is OFF (like old app: if (loop != true && !this.ordsrcpop))
            if (!loop && !isStickyDialog.value) {
                orderDialog.value = false
                // Use nextTick to ensure dialog closes before showing snackbar
                await nextTick()
            }

            // Show success message in snackbar (right corner bottom like old app)
            // Suppress individual messages when placing slice orders (loop = true)
            if (!loop) {
                appStore.showSnackbar(1, 'Order placed successfully')
            }

            // Trigger orderbook update and specific event based on order type
            try {
                window.dispatchEvent(new CustomEvent('orderbook-update', { detail: { type: 'orders' } }))

                // Dispatch specific event for better granularity
                if (typeArg === 'place' || typeArg === 're') {
                    window.dispatchEvent(new CustomEvent('order-placed'))
                } else if (typeArg === 'mod') {
                    window.dispatchEvent(new CustomEvent('order-modified'))
                }
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
        // console.error('Order placement error:', e)
    } finally {
        isPlacingOrder.value = false
        // Only close order dialog if sticky is OFF and not opening slice dialog
        // The slice dialog opening logic handles closing the order dialog
        if (!sliceDialog.value && !isStickyDialog.value) {
            orderDialog.value = false
        }
    }
}

onMounted(() => {
    // Guard: Only add event listener if not already added (prevent duplicate registration)
    if (!eventListenerAdded) {
        window.addEventListener('menudialog', handleMenuDialogEvent)
        eventListenerAdded = true
    }

    // WebSocket data update handler
    websocketHandler = (ev) => {
        // Only process if dialog is open
        if (!orderDialog.value) return

        let data = null
        // Handle different data formats
        if (Array.isArray(ev.detail) && ev.detail.length > 0) {
            data = ev.detail[0]?.v || ev.detail[0] || ev.detail
        } else if (ev.detail?.v) {
            data = ev.detail.v
        } else {
            data = ev.detail
        }

        if (!data || !menudata.value || !menudata.value[0]) return

        // Check if token matches (handle different token field names and types)
        const wsToken = String(data.token || data.tk || data.t || '')
        const currentToken = String(menudata.value[0]?.token || '')

        // Compare tokens (both as strings to handle number/string mismatches)
        if (wsToken && currentToken && wsToken === currentToken) {
            // Update menudata[0] with live websocket data
            if (menudata.value[0]) {
                const ltp = data.lp || data.ltp || data.l
                const ch = data.ch || data.c
                const chp = data.chp

                if (ltp !== undefined && ltp !== null && !isNaN(ltp)) {
                    menudata.value[0].ltp = Number(ltp).toFixed(2)
                    menudata.value[0].lp = Number(ltp).toFixed(2) // Keep both for compatibility
                }
                if (ch !== undefined && ch !== null && !isNaN(ch)) {
                    menudata.value[0].ch = Number(ch).toFixed(2)
                }
                if (chp !== undefined && chp !== null && !isNaN(chp)) {
                    menudata.value[0].chp = Number(chp).toFixed(2)
                }
            }
            // Debounce websocket updates to prevent continuous API calls
            // Pass isWebsocketUpdate=true to use longer debounce and price change check
            debouncedComputeMarginAndBrokerage(false, true)
        }
    }

    window.addEventListener('web-scoketConn', websocketHandler)
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
    }

    // Remove websocket event listener
    if (websocketHandler) {
        window.removeEventListener('web-scoketConn', websocketHandler)
        websocketHandler = null
    }

    // Unsubscribe from websocket if dialog is still open
    if (orderDialog.value && menudata.value[0] && menudata.value[0].token && menudata.value[0].exch) {
        try {
            const wsEvent = new CustomEvent('web-scoketOn', {
                detail: {
                    flow: 'unsub',
                    data: [{
                        token: menudata.value[0].token,
                        exch: menudata.value[0].exch,
                        tsym: menudata.value[0].tsym
                    }],
                    is: 'order-window',
                    page: 'order-window'
                }
            })
            window.dispatchEvent(wsEvent)
        } catch (e) {
            // console.error('[StockOrderWindow] Error unsubscribing on unmount:', e)
        }
    }

    // Clear debounce timers on unmount
    if (marginDebounceTimer) {
        clearTimeout(marginDebounceTimer)
        marginDebounceTimer = null
    }
    if (websocketMarginDebounceTimer) {
        clearTimeout(websocketMarginDebounceTimer)
        websocketMarginDebounceTimer = null
    }

    // Reset last price tracking
    lastPriceForMargin = null
})
</script>


<style scoped>
/* Remove outline effects from price type chips (Limit, Market, SL Limit, SL Mkt) */
:deep(.v-chip-group .v-chip),
:deep(.v-chip-group .v-chip:focus),
:deep(.v-chip-group .v-chip:focus-visible),
:deep(.v-chip-group .v-chip:hover),
:deep(.v-chip-group .v-chip:active) {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
}

.rounded-pill {
    border-radius: 20px !important;
}

/* Target input field font size */
:deep(.v-field__input input),
:deep(.v-field__input) {
    font-size: 14px !important;
    border-radius: 50% !important;
    font-weight: 500 !important;
    color: #000 !important;
    line-height: 1.2 !important;
}

:deep(.target-input .v-field__input) {
    align-items: center !important;
    display: flex !important;
}

/* Make active tab text black */
:deep(.v-tabs .v-tab--selected),
:deep(.v-tabs .v-tab--selected .v-tab__text) {
    color: #000000 !important;
}

:deep(.v-tabs .v-tab--selected) {
    opacity: 1 !important;
}

/* GTT Select Menu - Ensure dropdown opens within dialog */
:deep(.gtt-select-menu) {
    z-index: 10000 !important;
    position: fixed !important;
}

/* Ensure v-menu content is properly positioned */
:deep(.v-menu__content) {
    z-index: 10000 !important;
}

.fs-12 {
    font-size: 12px !important;
}
::v-deep(.checkbox-left .v-selection-control) {
  margin-left: -10px !important;   /* adjust as needed */
}
::v-deep(.disclosed-field .v-field__input) {
  display: flex !important;
  align-items: center !important;
  padding-top: 6 !important;
  padding-bottom: 0 !important;
}

::v-deep(.disclosed-field .v-field__prepend-inner),
::v-deep(.disclosed-field .v-field__append-inner) {
  display: flex !important;
  align-items: center !important;
}


</style>
