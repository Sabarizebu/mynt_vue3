<template>
    <div>
        <v-dialog v-if="menudata && menudata.item" v-model="mforderdialog" persistent
            @click:outside="!orderpoploader || !menudata.payment ? closeMenudialog('mforder') : ''"
            :width="menudata && menudata.payment ? '640' : '400'">
            <v-card class="pb-5 overflow-hidden " style="border-radius: 15px;" color="cardbg">
                <v-btn :disabled="orderpoploader" @click="closeMenudialog('mforder')" color="maintext" size="x-small"
                    variant="outlined" icon style="position: absolute; top: 20px; right: 20px; z-index: 1;">
                    <v-icon size="17">mdi-close</v-icon>
                </v-btn>
                <v-card class="elevation-0 pt-6 pb-2" color="secbg">
                    <P v-if="mf_tenure == null" class="font-weight-bold fs-16 maintext--text mb-2 px-4 px-md-6">Create
                        mandate </P>

                    <div class="px-4 px-md-6" v-if="mf_tenure != null && menudata.types == 'redem'">
                        <P class="font-weight-bold fs-16 maintext--text mb-1">Redemption</P>
                        <p class="font-weight-bold fs-13 subtext--text mb-0">{{ menudata.sname ? menudata.sname : "" }}
                        </p>
                    </div>

                    <v-list-item v-if="mf_tenure != null && menudata.types != 'redem'" class="px-4 px-md-6">
                        <v-list-item-content class="py-0">
                            <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-1">{{ menudata.item ?
                                menudata.item.name : "" }} </v-list-item-title>

                            <div class="d-flex align-center mt-1">
                                <div>
                                    <v-chip v-if="menudata.item && menudata.item.Type" size="x-small" variant="flat"
                                        class=""
                                        style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;">
                                        <span class=" fs-10">
                                            {{ menudata.item.Type }}
                                        </span>
                                    </v-chip>
                                </div>
                                <v-chip v-if="menudata.item && menudata.item.SubType" size="x-small" variant="flat"
                                    class="ml-2"
                                    style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;">
                                    <span class=" fs-10">
                                        {{ menudata.item.SubType }}
                                    </span>
                                </v-chip>
                            </div>
                        </v-list-item-content>
                    </v-list-item>
                </v-card>
                <v-progress-linear v-if="orderpoploader" indeterminate></v-progress-linear>

                <div :style="mf_tenure ? 'height:calc(100vh - 264px) !important;' : ''"
                    :class="mf_tenure ? 'overflow-y-auto' : ''">
                    <div id="payment"></div>
                    <div v-if="!menudata.payment">
                        <div class="px-4 px-md-6 pt-4 pb-2">
                            <div
                                v-if="mf_tenure != null && menudata.types != 'redem' && menudata.item.Purchase_Allowed == 'Y' && menudata.item.SIP_FLAG == 'Y'">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Choose tenure</p>
                                <div class="d-flex align-center mb-4">
                                    <span class="fs-14 font-weight-bold"
                                        :class="!mf_tenure ? 'maintext--text' : 'subtext--text'">Lumpsum</span>
                                    <v-switch v-model="mf_tenure"
                                        :disabled="menudata && menudata.sipvalue == false ? true : false" hide-details
                                        class="mx-3 tenure-switch" inset color="black"></v-switch>
                                    <span class="fs-14 font-weight-bold"
                                        :class="mf_tenure ? 'maintext--text' : 'subtext--text'">Monthly
                                        SIP</span>
                                </div>
                            </div>
                            <div v-if="menudata.types == 'redem'">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">
                                    Redemption units
                                    <span class="float-right">Total units : <b>{{ menudata.item.avg_qty }}</b></span>
                                </p>
                                <v-text-field height="40px" background-color="secbg" flat class="rounded-pill"
                                    variant="solo" type="number" hide-details hide-spin-buttons v-model="mf_redqty"
                                    :min="menudata.item.Minimum_Redemption_Qty" :max="menudata.item.avg_qty"
                                    @input="mf_invest_amt = (Number(mf_redqty || 0) * menudata.item.avg_qty).toFixed(2)">
                                    <template v-slot:append>
                                        <v-card v-if="menudata.item.avg_qty - mf_redqty > 0"
                                            @click="mf_redqty = menudata.item.avg_qty"
                                            class="font-weight-bold subtitle-2 primary--text elevation-0 crd-trn">
                                            +
                                            {{ menudata.item ? (menudata.item.avg_qty - mf_redqty).toFixed(3) : 0 }}
                                        </v-card>
                                    </template>
                                </v-text-field>
                                <p class="fs-10 subtext--text ml-0 mt-1">Min. redemption uints {{ menudata.item ?
                                    menudata.item.Minimum_Redemption_Qty : 0 }}</p>
                            </div>

                            <div v-else-if="mf_tenure">
                                <div v-if="menudata.types != 'redem'">
                                    <p class="font-weight-regular fs-14 subtext--text mb-2">
                                        Mandates
                                        <v-tooltip location="top" color="black">
                                            <template v-slot:activator="{ props }">
                                                <span v-bind="props">
                                                    <svg v-if="mf_mandate && mf_mandate.Status == 'APPROVED'"
                                                        xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                                                        viewBox="0 0 20 15" fill="none">
                                                        <rect width="20" height="15" rx="7" fill="#2DB266" />
                                                        <path d="M6.25 8.2475L8.415 10.4125L13.8275 5" stroke="white"
                                                            stroke-width="1.2" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                    <svg v-else-if="mf_mandate && mf_mandate.Status"
                                                        xmlns="http://www.w3.org/2000/svg" width="20" height="15"
                                                        viewBox="0 0 20 15" fill="none">
                                                        <rect width="20" height="15" rx="7" fill="#DC2626" />
                                                        <path d="M7.5 10L12.5 5M7.5 5L12.5 10" stroke="white"
                                                            stroke-width="1.2" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                </span>
                                            </template>
                                            <span>{{ mf_mandate && mf_mandate.Status == "APPROVED" ? "Valid" :
                                                "Not valid" }}</span>
                                        </v-tooltip>
                                        <span v-if="mf_mandate && mf_mandate.MandateId" class="float-right">Amt: <b>{{
                                            mf_mandate.Amount ?
                                                Number(mf_mandate.Amount).toFixed(2) : "0.00" }}</b></span>
                                    </p>
                                    <div v-if="mf_mandates.length > 0">
                                        <v-select bg-color="secbg" rounded dense density="comfortable"
                                            v-model="mf_mandate" :disabled="!mf_mandates" :items="mf_mandates"
                                            return-object background-color="secbg" flat class="rounded-pill mb-0"
                                            hide-details variant="solo" item-title="MandateId" item-value="MandateId">
                                            <template v-slot:selection="{ item }">
                                                <span v-if="item && item.raw && item.raw.MandateId">{{
                                                    item.raw.MandateId }}</span>
                                                <span v-else-if="item && item.MandateId">{{ item.MandateId }}</span>
                                                <span v-else-if="item && typeof item === 'object'">{{ item.MandateId ||
                                                    '' }}</span>
                                            </template>
                                            <template v-slot:item="{ item, props, on }">
                                                <v-list-item v-on="on" v-bind="props">
                                                    <v-list-item-content>
                                                        <v-list-item-title class="font-weight-medium">{{ item.MandateId
                                                            }}

                                                            <v-tooltip location="top" color="black">
                                                                <template v-slot:activator="{ props }">
                                                                    <span v-bind="props">
                                                                        <svg v-if="item.Status == 'APPROVED'"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="20" height="15" viewBox="0 0 20 15"
                                                                            fill="none">
                                                                            <rect width="20" height="15" rx="7"
                                                                                fill="#2DB266" />
                                                                            <path
                                                                                d="M6.25 8.2475L8.415 10.4125L13.8275 5"
                                                                                stroke="white" stroke-width="1.2"
                                                                                stroke-linecap="round"
                                                                                stroke-linejoin="round" />
                                                                        </svg>
                                                                        <svg v-else-if="item.Status == 'REJECTED' || item.Status == 'INITIAL REJECTION' || (item.Status && typeof item.Status === 'string' && item.Status.includes('REJECT'))"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="20" height="15" viewBox="0 0 20 15"
                                                                            fill="none">
                                                                            <rect width="20" height="15" rx="7"
                                                                                fill="#DC2626" />
                                                                            <path d="M7.5 10L12.5 5M7.5 5L12.5 10"
                                                                                stroke="white" stroke-width="1.2"
                                                                                stroke-linecap="round"
                                                                                stroke-linejoin="round" />
                                                                        </svg>
                                                                        <svg v-else xmlns="http://www.w3.org/2000/svg"
                                                                            width="20" height="15" viewBox="0 0 20 15"
                                                                            fill="none">
                                                                            <rect width="20" height="15" rx="7"
                                                                                fill="#FFB038" />
                                                                            <path
                                                                                d="M5.3125 8.75C6.00286 8.75 6.5625 8.19036 6.5625 7.5C6.5625 6.80964 6.00286 6.25 5.3125 6.25C4.62214 6.25 4.0625 6.80964 4.0625 7.5C4.0625 8.19036 4.62214 8.75 5.3125 8.75Z"
                                                                                fill="white" />
                                                                            <path
                                                                                d="M10.3125 8.75C11.0029 8.75 11.5625 8.19036 11.5625 7.5C11.5625 6.80964 11.0029 6.25 10.3125 6.25C9.62214 6.25 9.0625 6.80964 9.0625 7.5C9.0625 8.19036 9.62214 8.75 10.3125 8.75Z"
                                                                                fill="white" />
                                                                            <path
                                                                                d="M15.3125 8.75C16.0029 8.75 16.5625 8.19036 16.5625 7.5C16.5625 6.80964 16.0029 6.25 15.3125 6.25C14.6221 6.25 14.0625 6.80964 14.0625 7.5C14.0625 8.19036 14.6221 8.75 15.3125 8.75Z"
                                                                                fill="white" />
                                                                        </svg>
                                                                    </span>
                                                                </template>
                                                                <span>{{ item.Status }}</span>
                                                            </v-tooltip>
                                                            <span class="float-right">{{ Number(item.Amount).toFixed(2)
                                                                }}</span>
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle class="caption">reg date : {{
                                                            item.RegnDate }}
                                                        </v-list-item-subtitle>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                        <p class="text-right mb-2"><v-btn
                                                @click="(mf_tenure = null), setDefaultmandate()" color="primary"
                                                size="small" class="text-none font-weight-bold" variant="text">+ Create
                                                mandate</v-btn></p>
                                    </div>
                                    <v-btn v-else @click="mf_tenure = null" :loading="orderpoploader" color="btnclr"
                                        class="text-none rounded-pill elevation-0 btntext--text mb-4" block
                                        height="48px">+ Create
                                        mandate
                                    </v-btn>
                                </div>
                                <v-text-field bg-color="secbg" rounded dense density="comfortable" v-if="mf_sipinit"
                                    height="40px" background-color="secbg" flat class="rounded-pill mb-4" variant="solo"
                                    type="number" hide-details hide-spin-buttons
                                    @keyup="mf_initial_amt ? (mf_initial_amt = Number(mf_initial_amt)) : mf_initial_amt >= menudata.item.Minimum_Purchase_Amount ? mf_initial_amt : menudata.item.Minimum_Purchase_Amount"
                                    :min="menudata.item.Minimum_Purchase_Amount"
                                    :step="menudata.item.Minimum_Purchase_Amount" v-model="mf_initial_amt">
                                    <template v-slot:append>
                                        <v-card @click="mf_initial_amt += menudata.item.Minimum_Purchase_Amount"
                                            class="font-weight-bold subtitle-2 primary--text elevation-0 crd-trn">
                                            +
                                            {{ menudata.item.Minimum_Purchase_Amount }}
                                        </v-card>
                                    </template>

                                    <template v-slot:prepend-inner>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                                fill="white" />
                                            <path
                                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                                fill="#999999" />
                                        </svg>
                                    </template>
                                </v-text-field>

                                <p class="font-weight-regular fs-14 subtext--text mb-2">Instalment amount</p>
                                <v-text-field append-icon="" bg-color="secbg" rounded dense density="comfortable"
                                    v-if="mf_frequency" height="40px" background-color="secbg" flat class="rounded-pill"
                                    variant="solo" type="number" hide-details hide-spin-buttons
                                    @keyup="mf_instal_amt ? (mf_instal_amt = Number(mf_instal_amt)) : mf_instal_amt >= menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT ? mf_instal_amt : menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT"
                                    :min="menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT"
                                    :max="menudata.sipvalue[mf_frequency].SIP_MAXIMUM_INSTALLMENT_AMOUNT"
                                    :step="menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT"
                                    v-model="mf_instal_amt">
                                    <!-- <template v-slot:append>
                                        <v-card
                                            @click="mf_instal_amt += menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT"
                                            class="font-weight-bold subtitle-2 primary--text elevation-0 crd-trn">
                                            +
                                            {{ menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT }}
                                        </v-card>
                                    </template> -->

                                    <template v-slot:prepend-inner>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                                fill="white" />
                                            <path
                                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                                fill="#999999" />
                                        </svg>
                                    </template>
                                </v-text-field>
                                <p class="fs-10 subtext--text ml-0 mt-1">Min. ₹{{ menudata.sipvalue && mf_frequency ?
                                    menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT : 0.0 }} (multiple of
                                    1.0)</p>

                                <v-row class="pb-4 mt-4">
                                    <v-col cols="8">
                                        <p class="font-weight-regular fs-14 subtext--text mb-2">Frequency</p>
                                        <v-select bg-color="secbg" rounded dense density="comfortable"
                                            v-if="mf_frequency" v-model="mf_frequency"
                                            oninput="this.mf_frequency = mf_frequency.toUppercase()" hide-details
                                            :items="menudata.mf_frequencys" background-color="secbg" flat
                                            class="rounded-pill" variant="solo"
                                            @update:model-value="(mf_instal_amt = menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT), (mf_noof_instal = menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS)">
                                        </v-select>
                                    </v-col>
                                    <v-col cols="4" class="pl-0">
                                        <p class="font-weight-regular fs-14 subtext--text mb-2">Date</p>
                                        <v-select bg-color="secbg" rounded dense density="comfortable"
                                            v-if="mf_frequency"
                                            :disabled="menudata.sipvalue[mf_frequency].mf_dates.length <= 1"
                                            v-model="menudata.sipvalue[mf_frequency].mf_date" hide-details
                                            :items="menudata.sipvalue[mf_frequency].mf_dates" background-color="secbg"
                                            flat class="rounded-pill" variant="solo"></v-select>
                                    </v-col>
                                </v-row>

                                <p class="font-weight-regular fs-14 subtext--text mb-2 mt-3">
                                    Investment duration <span class="font-weight-bold txt-FF1 float-right">{{
                                        mf_noof_instal }} {{
                                            menudata.sipvalue && mf_frequency ? menudata.sipvalue[mf_frequency].freqis : ""
                                        }}</span>
                                </p>
                                <v-text-field bg-color="secbg" rounded dense density="comfortable" v-if="mf_frequency"
                                    height="40px" background-color="secbg" flat class="rounded-pill mb-2" variant="solo"
                                    type="number" hide-details hide-spin-buttons
                                    :max="menudata.sipvalue[mf_frequency].SIP_MAXIMUM_INSTALLMENT_NUMBERS"
                                    :min="menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS"
                                    :step="menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS"
                                    v-model="mf_noof_instal">
                                </v-text-field>
                                <p class="fs-10 subtext--text ml-0 mt-1">Min. duration {{ menudata.sipvalue &&
                                    mf_frequency ?
                                    menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS : 0 }} {{
                                        menudata.sipvalue &&
                                            mf_frequency ? menudata.sipvalue[mf_frequency].freqis : "" }}</p>
                            </div>

                            <div v-else-if="mf_tenure == false">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Investment amount</p>
                                <v-text-field rounded small density="comfortable" bg-color="secbg" flat
                                    class="rounded-pill" variant="solo" type="number" hide-details hide-spin-buttons
                                    @keyup="mf_invest_amt ? (mf_invest_amt = Number(mf_invest_amt)) : mf_invest_amt >= menudata.item.Minimum_Purchase_Amount ? mf_invest_amt : menudata.item.Minimum_Purchase_Amount"
                                    :min="menudata.item.Minimum_Purchase_Amount"
                                    :step="menudata.item.Minimum_Purchase_Amount" v-model="mf_invest_amt">
                                    <!-- <template v-slot:append>
                                        <v-card @click="incrEment(menudata.item.Minimum_Purchase_Amount)"
                                            class="font-weight-bold subtitle-2 primary--text elevation-0 crd-trn">
                                            +
                                            {{ menudata.item.Minimum_Purchase_Amount }}
                                        </v-card>
                                    </template> -->

                                    <template v-slot:prepend-inner>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                                fill="white" />
                                            <path
                                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                                fill="#999999" />
                                        </svg>
                                    </template>
                                </v-text-field>
                                <p class="fs-10 subtext--text ml-0 mt-1">Min. ₹{{ menudata.item ?
                                    menudata.item.Minimum_Purchase_Amount :
                                    0.0 }} (multiple of 1.0)</p>
                            </div>
                            <div v-else-if="mf_tenure == null">
                                <p class="font-weight-regular fs-14 subtext--text mb-2">Amount *</p>
                                <v-text-field bg-color="secbg" rounded dense density="comfortable"
                                    :readonly="orderpoploader" height="40px" background-color="secbg" flat
                                    class="rounded-pill mb-4" variant="solo" type="number" hide-details
                                    hide-spin-buttons
                                    @keyup="creatManmfamt ? (creatManmfamt = Number(creatManmfamt)) : creatManmfamt >= 100 ? mf_initial_amt : 100"
                                    :min="100" :step="1000" v-model="creatManmfamt">
                                    <!-- <template v-slot:append>
                                        <v-card @click="creatManmfamt += 1000"
                                            class="font-weight-bold subtitle-2 primary--text elevation-0 crd-trn">
                                            +
                                            {{ 1000 }}
                                        </v-card>
                                    </template> -->

                                    <template v-slot:prepend-inner>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                                fill="white" />
                                            <path
                                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                                fill="#999999" />
                                        </svg>
                                    </template>
                                </v-text-field>

                                <v-row class="pb-4">
                                    <v-col cols="6">
                                        <p class="font-weight-regular fs-14 subtext--text mb-2">Start date *</p>

                                        <v-menu v-model="creatManmffrommenu" :close-on-content-click="false"
                                            transition="scale-transition" location="bottom" max-width="290px"
                                            min-width="auto">
                                            <template v-slot:activator="{ props }">
                                                <v-text-field bg-color="secbg" rounded dense density="comfortable"
                                                    background-color="secbg" flat class="rounded-pill" variant="solo"
                                                    hide-details v-model="creatManmffrom" readonly
                                                    v-bind="props"></v-text-field>
                                            </template>
                                            <v-date-picker :readonly="orderpoploader" :min="minStartDate"
                                                v-model="creatManmffrommodel"
                                                @update:model-value="handleStartDateChange"></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="6">
                                        <p class="font-weight-regular fs-14 subtext--text mb-2">End date *</p>
                                        <v-menu v-model="creatManmftomenu" :close-on-content-click="false"
                                            transition="scale-transition" location="bottom" max-width="290px"
                                            min-width="auto">
                                            <template v-slot:activator="{ props }">
                                                <v-text-field bg-color="secbg" rounded dense density="comfortable"
                                                    background-color="secbg" flat class="rounded-pill" variant="solo"
                                                    hide-details v-model="creatManmfto" readonly
                                                    v-bind="props"></v-text-field>
                                            </template>
                                            <v-date-picker :readonly="orderpoploader" :min="minEndDate"
                                                v-model="creatManmftomodel"
                                                @update:model-value="handleEndDateChange"></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                </v-row>

                                <p class="font-weight-regular fs-14 subtext--text mb-2">Remarks</p>
                                <v-text-field bg-color="secbg" rounded dense density="comfortable"
                                    :readonly="orderpoploader" height="40px" background-color="secbg" flat
                                    class="rounded-pill mb-8" variant="solo" type="text" hide-details hide-spin-buttons
                                    v-model="creatManmRemarks">
                                </v-text-field>

                                <v-row no-gutters>
                                    <v-col cols="12" class="pb-1">
                                        <v-btn @click="setCreatMandate()"
                                            :disabled="!creatManmffrommodel || !creatManmftomodel || creatManmfamt < 100"
                                            :loading="orderpoploader" color="btnclr"
                                            class="text-none rounded-pill elevation-0 btntext--text" block
                                            height="40px">Submit
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>

                            <div v-if="mf_tenure != null && menudata.types != 'redem'">
                                <p v-if="mf_tenure != null && menudata.types != 'redem'"
                                    class="font-weight-regular mt-4 fs-12 subtext--text mb-0">
                                    <v-icon size="16" color="#666">mdi-information-outline</v-icon> NAV will be allotted
                                    on the day funds are
                                    realised at the
                                    clearing corporation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <v-toolbar v-if="!menudata.payment && mf_tenure != null"
                    class="tool-sty elevation-0 pt-4 mb-2 px-4 px-md-6 crd-trn" density="compact">
                    <span v-if="menudata.types != 'redem'"
                        class="font-weight-regular fs-10 subtext--text d-none d-md-block">
                        AUM <span class="text-primary font-weight-bold">{{ Number(menudata.item.AUM /
                            10000000).toFixed(2)
                            }}</span> Cr.
                        <br />
                    </span>
                    <v-spacer></v-spacer>
                    <v-btn @click="setmfUpiValid()"
                        style="background-color: black !important;color: #ffffff !important;" :disabled="menudata.types == 'redem'
                            ? menudata.item.Minimum_Redemption_Qty > mf_redqty || mf_redqty > menudata.netqty
                            : (mf_tenure
                                ? (mf_frequency && Number(mf_noof_instal) < menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS) ||
                                (mf_frequency && Number(mf_instal_amt) < menudata.sipvalue[mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT) ||
                                Number(mf_initial_amt) < menudata.item.Minimum_Purchase_Amount ||
                                (mf_mandate && mf_mandate.Status != 'APPROVED')
                                : Number(mf_invest_amt) < menudata.item.Minimum_Purchase_Amount)



                            " :loading="orderpoploader" color="btnclr"
                        class="text-none rounded-pill elevation-0 btntext--text px-6 ml-4" height="40px">
                        {{ menudata.types == "redem" ? "Redeem" : mf_tenure ? "Pay now" : "Buy now" }}
                    </v-btn>
                </v-toolbar>
            </v-card>
        </v-dialog>

        <v-dialog v-model="orderiniteddai" persistent max-width="400">
            <v-card v-if="ordersignale == 'waitpay'"
                class=" pb-5 pa-5 overflow-hidden d-flex flex-column align-center justify-center" color="cardbg"
                >
                <v-icon color="green" size="35">mdi-check-circle</v-icon>
                <p class="font-weight-bold subtitle-1 mt-2">Order Initiated</p>
            </v-card>
            <v-card v-else class="pb-5 pa-5" color="cardbg" :loading="orderpoploadernew" style="border-radius: 16px;">

                <p class="font-weight-bold text-h6 mb-4">Pay With</p>
                <v-divider class="mb-4"></v-divider>

                <p class="font-weight-medium fs-12 subtext--text mb-2">Bank Account</p>
                <v-select v-model="mf_accact" hide-details :items="menudata.mf_bankaccs" return-object
                    item-title="Bank_Name" item-value="Bank_AcNo" 
                    bg-color="#F2F3F8" flat density="compact" variant="solo-filled" rounded="pill" class=" mb-4" placeholder="bank" style="font-size: 14px;">
                    <template v-slot:item="{ item, props, on }">
                        <v-list-item v-on="on" v-bind="props">
                            <v-list-item-content class="py-1">
                                <v-list-item-title class="font-weight-bold fs-14">{{ item.Bank_Name }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="caption">XXXX XXXX {{
                                    item.Bank_AcNo && typeof item.Bank_AcNo === 'string' ? item.Bank_AcNo.slice(-4) : ''
                                    }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-select>

                <p class="font-weight-medium fs-12 subtext--text mb-2">Payment method<span class="red--text" style="font-size: 18px; line-height: 0;"></span></p>
                <v-select v-model="mfpayinmode" hide-details  :items="mfpayinmodes" item-title="val" item-value="key" 
                      bg-color="#F2F3F8" flat density="compact" variant="solo-filled"  rounded="pill" class="rounded-pill mb-6"
                    placeholder="UPI, Net banking" style="font-size: 14px;"> </v-select>


                <v-form v-if="mfpayinmode == 'UPI'" ref="mfupiform" v-model="mfupivalid"
                    @submit.prevent="setmfUpiValidnew()" lazy-validation>
                    <p class="font-weight-medium fs-12 subtext--text mb-2">UPI ID (Virtual payment
                        address)</p>

                    <v-text-field :disabled="orderpoploader" required density="compact"
                        bg-color="#F2F4F8" flat variant="solo-filled" rounded="pill" class="rounded-lg mb-4" v-model="mfpainids"
                        @keyup="upiidfield = false"
                        :rules="[(v) => !!v || 'Upi Id is required', (v) => /.+@.+/.test(v) || 'Upi Id must be valid']"
                        placeholder="Add UPI ID" :error-messages="upiIDerrors" style="font-size: 14px;">
                    </v-text-field>
                </v-form>
                
                <v-row class="mt-2">
                    <v-col cols="6">
                         <v-btn @click="orderiniteddai = false"
                            color="#F2F4F8"
                            class="text-none rounded-pill elevation-0 maintext--text font-weight-bold" block height="45px">
                            Cancel
                        </v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="setmfUpiValidnew()"
                            :disabled="!mf_accact || !mfpayinmode || (mfpayinmode === 'UPI' && !mfpainids)"
                            :loading="orderpoploadernew" color="black"
                            class="text-none rounded-pill elevation-0 white--text font-weight-bold" block height="45px">
                            Pay - One Time
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <v-dialog v-model="paymentcheck" persistent max-width="400">
            <v-card width="100%" class="elevation-0 px-5 text-center py-8 mx-auto rounded-lg" variant="outlined">
                <v-card width="40%" class="elevation-0 mx-auto">
                    <v-progress-linear color="#000" buffer-value="0" class="mb-5" reverse stream
                        value="0"></v-progress-linear>
                </v-card>
                <p class="font-weight-bold title">Awaiting UPI confirmation</p>
                <p class="caption txt-666 mb-8">This will take a few seconds.</p>
            </v-card>
        </v-dialog>

        <v-dialog v-model="paymentconfirm" persistent max-width="400">
            <v-card width="100%" class="elevation-0 px-5 text-center py-8 mx-auto rounded-lg" variant="outlined">
                <v-card width="40%" class="elevation-0 mx-auto">
                    <v-icon :color="paystausres.status == 'PAYMENT APPROVED' ? 'green' : 'red'" class="mt-3" size="50">
                        {{
                            paystausres.status == 'PAYMENT APPROVED' ? 'mdi-check-circle' : ' mdi-close-circle' }}</v-icon>
                </v-card>
                <p class="font-weight-bold title mt-5">
                    {{ paystausres.status && typeof paystausres.status === 'string' ?
                        (paystausres.status.charAt(0).toUpperCase() + paystausres.status.slice(1).toLowerCase()) : "---" }}
                </p>
                <p class="subtitle-1 txt-666 mb-2">{{ paystausres.name ? paystausres.statusname : '0.00' }}</p>
                <p class="subtitle-1 txt-666 font-weight-bold mb-2">{{ paystausres.OrderVal ? paystausres.OrderVal :
                    '0.00' }}</p>
                <p class="caption txt-666 mb-1">TransNo : {{ paystausres.TransNo ? paystausres.TransNo : '0.00' }}</p>
                <p class="caption txt-666 ">Order ID : {{ paystausres.OrderId ? paystausres.OrderId : '0.00' }}</p>


                <v-btn height="48px" color="#444" @click="paymentconfirm = false" variant="outlined"
                    style="border: 2px solid #444 !important" size="small"
                    class="text-none rounded-pill elevation-0"><span class="subtitle-1 font-weight-medium px-6">Close
                    </span></v-btn>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import apiurl from "../../apiurl.js";
import { useAppStore } from "../../stores/appStore";
import { getMFsipvalue, getMFmandate, getMFAddmandate, getUpivpa, getMFplaceoredr, getMFallpayments, getMFBankdetails, getFundsupis, getsendpaymentrequt, getcheckpaystatus } from "../mixins/getAPIdata.js";
export default {
    name: 'MutualFundOrderWindow',

    setup() {
        const appStore = useAppStore();
        return { appStore };
    },

    data: () => ({
        uid: null,
        token: null,
        mtoken: null,

        orderloader: false,

        // Mutual fund
        mf_mandates: [],
        mf_frequencys: [],
        mf_dates: false,
        mf_frequency: null,
        mf_mandate: "",
        mf_date: "",
        mf_invest_amt: 1000,
        mf_initial_amt: 1000,
        mf_instal_amt: 1000,
        mf_tenure: false,
        mf_sipinit: false,
        mf_noof_instal: 0,
        mf_redqty: 0,

        mfpayinmode: null,
        mfpayinmodes: [
            { key: "UPI", val: "UPI" },
            { key: "NET BANKING", val: "Net banking" },
        ],
        mfpainids: null,
        mf_accact: null,
        mfupivalid: true,

        orderpoploader: false,

        creatManmfamt: 1000,
        creatManmffrommodel: "",
        creatManmffrommenu: false,

        creatManmftomodel: "",
        creatManmftomenu: false,
        creatManmRemarks: "",

        mforderdialog: false,
        iposbids: [],
        menudata: {},
        upiidfield: false,
        orderiniteddai: false,
        ordersignale: '',
        orderpoploadernew: false,
        checkoredrid: "",
        invesrtamoutcheck: "",
        paymentcheck: false,
        intervalId: null,
        paymentconfirm: false,
        paystausres: []
    }),

    async mounted() {
        // Create bound handlers to maintain 'this' context
        this.handleMenuDialog = (event) => {
            const { type, action, data } = event.detail || {};
            if (type == "mforder") {
                this.setMenudialog(action, data);
            }
        };

        this.handleUserEvent = () => {
            this.mtoken = sessionStorage.getItem("msession");
            this.token = sessionStorage.getItem("usession");
            this.uid = sessionStorage.getItem("userid");
            // console.log("User event - UID updated:", this.uid);
        };

        window.addEventListener("menudialog", this.handleMenuDialog);
        window.addEventListener("user-event", this.handleUserEvent);

        this.mtoken = sessionStorage.getItem("msession");
        this.token = sessionStorage.getItem("usession");
        this.uid = sessionStorage.getItem("userid");
        // console.log("Mounted - Initial UID:", this.uid);
    },
    beforeUnmount() {
        window.removeEventListener("menudialog", this.handleMenuDialog);
        window.removeEventListener("user-event", this.handleUserEvent);
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    computed: {
        mf_dateformatted() {
            return this.formatDate(this.mf_date);
        },
        creatManmffrom() {
            return this.formatDate(this.creatManmffrommodel);
        },

        creatManmfto() {
            return this.formatDate(this.creatManmftomodel);
        },

        changefieldType(text) {
            return Number(text);
        },

        upiIDerrors() {
            const errors = [];
            if (this.upiidfield) {
                errors.push("You have entered the invalid UPI ID");
            }
            return errors;
        },
        minStartDate() {
            const today = new Date();
            const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
            return this.formatDateForPicker(minDate);
        },
        minEndDate() {
            if (this.creatManmffrommodel) {
                const startDate = this.parseDateString(this.creatManmffrommodel);
                if (startDate && !isNaN(startDate.getTime())) {
                    const minEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 2, startDate.getDate());
                    return this.formatDateForPicker(minEnd);
                }
            }
            const today = new Date();
            return this.formatDateForPicker(today);
        },
    },
    methods: {
        incrEment(amt) {
            this.mf_invest_amt = Number(this.mf_invest_amt) + Number(amt)
        },
        snackAlert(color, msg) {
            this.appStore.showSnackbar(color, msg)
        },
        formatDate(date) {
            if (!date) return null;
            const [year, month, day] = date.split("-");
            return `${day}/${month}/${year}`;
        },
        // Format date to YYYY-MM-DD in local time (no timezone conversion)
        formatDateForPicker(date) {
            if (!date) return null;
            const d = date instanceof Date ? date : new Date(date);
            if (isNaN(d.getTime())) return null;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        // Parse YYYY-MM-DD string to local Date (no timezone conversion)
        parseDateString(dateStr) {
            if (!dateStr) return null;
            if (typeof dateStr !== 'string') {
                // If it's already a Date object, return it
                if (dateStr instanceof Date) return dateStr;
                return null;
            }
            // Parse YYYY-MM-DD format in local time
            const parts = dateStr.split('T')[0].split('-');
            if (parts.length !== 3) return null;
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const day = parseInt(parts[2], 10);
            return new Date(year, month, day);
        },
        async setMenudialog(mode, itemdata) {
            this.appStore.showLoader();
            // console.log("itemdataitemdata", itemdata);
            // console.log("modemodemodemode", mode);

            // Refresh uid and token from sessionStorage
            this.mtoken = sessionStorage.getItem("msession");
            this.token = sessionStorage.getItem("usession");
            this.uid = sessionStorage.getItem("userid");

            // console.log("UID from sessionStorage:", this.uid);
            // console.log("Token from sessionStorage:", this.token);

            if (!this.uid) {
                // console.error("UID is null! Please check sessionStorage for 'userid'");
                this.appStore.showSnackbar(2, "User session expired. Please login again.");
                this.appStore.hideLoader();
                return;
            }

            this.orderpoploader = false;
            this.menudata = {};
            this.upiidfield = false;
            this.mf_tenure = mode == "sip" ? true : false;
            this.menudata["types"] = mode;
            this.menudata["item"] = itemdata;
            // console.log("   this.menudata[", this.menudata["item"]);

            if (mode == "redem") {
                this.menudata.item.Minimum_Redemption_Qty = Number(this.menudata.item.Minimum_Redemption_Qty);
                this.menudata["netqty"] = itemdata.avg_qty;
                this.menudata["sname"] = itemdata.name;

                this.mf_redqty = itemdata.avg_qty;
                this.mf_invest_amt = (this.mf_redqty * itemdata.invested_value).toFixed(2);
                this.mforderdialog = true;
            } else {
                if (itemdata.SIP_FLAG == "Y") {
                    let sipvalue = await getMFsipvalue([itemdata.ISIN, itemdata.Scheme_Code]);
                    if (sipvalue.stat == "Ok") {
                        this.menudata["sipvalue"] = {};
                        this.menudata["mf_frequencys"] = [];
                        for (let i = 0; i < sipvalue.data.length; i++) {
                            if (!sipvalue.data[i].SIP_FREQUENCY || typeof sipvalue.data[i].SIP_FREQUENCY !== 'string') {
                                continue; // Skip invalid entries
                            }
                            let freq = sipvalue.data[i].SIP_FREQUENCY.slice(0, 1) + sipvalue.data[i].SIP_FREQUENCY.slice(1, sipvalue.data[i].SIP_FREQUENCY.length).toLocaleLowerCase();
                            this.menudata.mf_frequencys.push(freq);
                            this.menudata.sipvalue[freq] = sipvalue.data[i];
                            this.menudata.sipvalue[freq]["mf_dates"] = sipvalue.data[i].SIP_DATES ? sipvalue.data[i].SIP_DATES.split(",") : ["0"];
                            this.menudata.sipvalue[freq]["mf_date"] = this.menudata.sipvalue[freq]["mf_dates"][0];
                            this.menudata.sipvalue[freq]["freqis"] = freq == "Daily" ? "Days" : freq == "Monthly" ? "Months" : freq == "Quarterly" ? "Qtrs" : freq;

                            this.menudata.sipvalue[freq]["SIP_INSTALLMENT_GAP"] = this.menudata.sipvalue[freq]["SIP_INSTALLMENT_GAP"] ? Number(this.menudata.sipvalue[freq]["SIP_INSTALLMENT_GAP"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MINIMUM_GAP"] = this.menudata.sipvalue[freq]["SIP_MINIMUM_GAP"] ? Number(this.menudata.sipvalue[freq]["SIP_MINIMUM_GAP"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MAXIMUM_GAP"] = this.menudata.sipvalue[freq]["SIP_MAXIMUM_GAP"] ? Number(this.menudata.sipvalue[freq]["SIP_MAXIMUM_GAP"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_AMOUNT"] = this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_AMOUNT"] ? Number(this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_AMOUNT"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_AMOUNT"] = this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_AMOUNT"] ? Number(this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_AMOUNT"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_NUMBERS"] = this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_NUMBERS"] ? Number(this.menudata.sipvalue[freq]["SIP_MINIMUM_INSTALLMENT_NUMBERS"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_NUMBERS"] = this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_NUMBERS"] ? Number(this.menudata.sipvalue[freq]["SIP_MAXIMUM_INSTALLMENT_NUMBERS"]) : "";
                            this.menudata.sipvalue[freq]["SIP_MULTIPLIER_AMOUNT"] = this.menudata.sipvalue[freq]["SIP_MULTIPLIER_AMOUNT"] ? Number(this.menudata.sipvalue[freq]["SIP_MULTIPLIER_AMOUNT"]) : "";
                        }
                        this.getMFmandata();
                        this.mf_frequency = this.menudata.mf_frequencys[0];
                        this.mf_instal_amt = this.menudata.sipvalue[this.mf_frequency].SIP_MINIMUM_INSTALLMENT_AMOUNT;
                        this.mf_noof_instal = this.menudata.sipvalue[this.mf_frequency].SIP_MINIMUM_INSTALLMENT_NUMBERS;
                        this.setDefaultmandate();
                    } else {
                        this.menudata["sipvalue"] = false;
                    }
                } else {
                    this.menudata["sipvalue"] = false;
                }
                this.mf_accact = null;
                this.mfpayinmode = null;
                this.mf_sipinit = false;
                itemdata.Minimum_Purchase_Amount = Number(itemdata.Minimum_Purchase_Amount);
                itemdata.Purchase_Amount_Multiplier = Number(itemdata.Purchase_Amount_Multiplier);
                this.mf_invest_amt = itemdata.Minimum_Purchase_Amount;
                this.mf_initial_amt = itemdata.Minimum_Purchase_Amount;
                this.mforderdialog = true;
            }
            this.appStore.hideLoader();
        },

        setDefaultmandate() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.creatManmffrommodel = this.formatDateForPicker(tomorrow);

            const endDate = new Date(tomorrow);
            endDate.setFullYear(endDate.getFullYear() + 30);
            this.creatManmftomodel = this.formatDateForPicker(endDate);
        },
        handleStartDateChange(date) {
            // v-model already updated creatManmffrommodel
            // Just ensure format is correct and handle side effects
            if (date) {
                // Normalize to YYYY-MM-DD string (v-model should already do this, but ensure)
                const dateStr = typeof date === 'string' ? date.split('T')[0] : this.formatDateForPicker(date);
                if (dateStr && this.creatManmffrommodel !== dateStr) {
                    this.creatManmffrommodel = dateStr;
                }
            }

            // Update end date to be 30 years from start date if it's before the new minimum
            this.$nextTick(() => {
                if (this.creatManmffrommodel) {
                    const startDate = this.parseDateString(this.creatManmffrommodel);
                    if (startDate && !isNaN(startDate.getTime())) {
                        const newMinEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 2, startDate.getDate());
                        const currentEndDate = this.creatManmftomodel ? this.parseDateString(this.creatManmftomodel) : null;

                        // Only update if current end date is before the new minimum
                        if (!currentEndDate || isNaN(currentEndDate.getTime()) || currentEndDate < newMinEnd) {
                            const newEndDate = new Date(startDate.getFullYear() + 30, startDate.getMonth(), startDate.getDate());
                            this.creatManmftomodel = this.formatDateForPicker(newEndDate);
                        }
                    }
                }
                // Close menu after date is selected
                setTimeout(() => {
                    this.creatManmffrommenu = false;
                }, 300);
            });
        },
        handleEndDateChange(date) {
            // v-model already updated creatManmftomodel
            // Just ensure format is correct
            if (date) {
                // Normalize to YYYY-MM-DD string (v-model should already do this, but ensure)
                const dateStr = typeof date === 'string' ? date.split('T')[0] : this.formatDateForPicker(date);
                if (dateStr && this.creatManmftomodel !== dateStr) {
                    this.creatManmftomodel = dateStr;
                }
            }
            // Close menu after date is selected
            this.$nextTick(() => {
                setTimeout(() => {
                    this.creatManmftomenu = false;
                }, 300);
            });
        },
        async setMForder() {
            // Ensure uid is set before placing order
            if (!this.uid) {
                this.uid = sessionStorage.getItem("userid");
                this.token = sessionStorage.getItem("usession");
                this.mtoken = sessionStorage.getItem("msession");
            }

            if (!this.uid) {
                // console.error("UID is null! Cannot place order.");
                this.appStore.showSnackbar(2, "User session expired. Please login again.");
                this.orderpoploader = false;
                return;
            }

            // console.log("Placing order with UID:", this.uid);
            this.orderpoploader = true;
            let data;
            if (this.mf_tenure && this.menudata.types != "redem") {
                data = {
                    "ClientCode": this.uid,
                    "no_of_installment": this.mf_noof_instal.toString(),
                    "scheme_code": this.menudata.item.Scheme_Code,
                    "freq_type": this.mf_frequency.toUpperCase(),
                    "installment_amt": this.mf_instal_amt.toString(),
                    "mandate_id": this.mf_mandate.MandateId,
                    "start_date": this.menudata.sipvalue[this.mf_frequency].mf_date.toString(),
                    "placed_by": this.uid,
                    "source": "WEB"
                };
            } else if (this.menudata.types == "redem") {
                data = {
                    "ClientCode": this.uid,
                    "scheme_code": this.menudata.item.Scheme_Code,
                    "redqty": this.mf_redqty.toString(),
                    "source": "WEB",
                    "placed_by": this.uid
                };
            } else {
                data = {
                    "ClientCode": this.uid,
                    "scheme_code": this.menudata.item.Scheme_Code,
                    "amount": this.mf_invest_amt.toString(),
                    "source": "WEB",
                    "placed_by": this.uid
                };
            }
            let url = this.menudata.types == "redem" ? "order/PlaceRedeemOrder" : this.mf_tenure ? "order/xsip_purchase" : "/order/PlaceLumpsumOrder";
            let res = await getMFplaceoredr(url, JSON.stringify(data));

            if (res.stat == "Ok") {
                // console.log("iffff elseeee order");
                this.mf_tenure = true

                if (this.menudata.types == "redem") {
                    this.closeMenudialog("mforder");
                    this.orderpoploader = false;
                    this.snackAlert(res.stat == 'Ok' ? 1 : 2, res.stat == 'Ok' ? 'Redemption Order  Initiated' : res);
                } else {
                    if (this.mf_tenure) {
                        // console.log("ifif 111");

                        if (this.mf_sipinit) {
                            // console.log("ifif sip");
                            // console.log("############")

                            this.setMfpayment(this.mf_initial_amt, res.OrderNumber);
                        } else {
                            // console.log("ifif elseee");

                            this.orderpoploader = false;
                            this.snackAlert(res.stat == "Ok" ? 1 : 0, (res.Remarks == 'Order Confirmed From STARMF' && res.status == 'PAYMENT NOT INITIATED') ? "Order Initiated successful" : res.error ? res.error : res);
                            if (res.Remarks == 'Order Confirmed From STARMF' && res.status == 'PAYMENT NOT INITIATED' && res.stat == 'Ok') {
                                this.paymentfun(this.mf_invest_amt, res.OrderId)
                            }

                        }
                        this.closeMenudialog("mforder");
                    } else {
                        // console.log("1234@@@@@@@@@");

                        this.setMfpayment(this.mf_invest_amt, res.order_number);

                    }
                }
            } else {
                // console.log("elseeee order");

                this.closeMenudialog("mforder");
                this.orderpoploader = false;
                this.snackAlert(res.stat == "Ok" ? 1 : 0, res.response_message ? res.response_message : res.error ? res.error : res);
            }
        },
        async paymentfun(amm, orderid) {
            this.invesrtamoutcheck = amm
            this.checkoredrid = orderid
            this.orderiniteddai = true
            this.ordersignale = "waitpay"
            let bank = await getMFBankdetails();
            if (bank && bank.stat == "Ok" && bank.data) {
                this.ordersignale = ""
                this.menudata.mf_bankaccs = bank.data;
            }
            let upis = await getFundsupis(this.uid);
            if (upis.stat == "Ok" && upis.data[0] && upis.data[0].upi_id && upis.data[0].client_id == this.uid) {
                this.mfpainids = upis.data[0].upi_id;
            } else {
                this.mfpainids = null;
            }
        },
        async getMFmandata() {
            let mandate = await getMFmandate([this.uid, ""]);
            if (mandate.stat == "Ok") {
                this.mf_mandates = mandate.data.MandateDetails;
                this.mf_mandate = mandate.data.MandateDetails[0];
            } else {
                this.mf_mandates = [];
                this.mf_mandate = null;
            }
            this.orderpoploader = false;
        },
        async setCreatMandate() {
            this.orderpoploader = true;
            let addmandate = await getMFAddmandate([this.uid, this.creatManmfamt, this.creatManmffrom, this.creatManmfto, this.creatManmRemarks]);
            if (addmandate.stat == "Ok") {
                this.snackAlert(1, addmandate.mandate ? `The mandate created was successful, ${addmandate.mandate}` : addmandate);
                this.mf_tenure = true;
                this.getMFmandata();
            } else {
                this.snackAlert(0, addmandate.error ? addmandate.error : addmandate);
                this.orderpoploader = false;
            }
        },
        async setmfUpiValid() {
            if (this.mfpayinmode == "UPI") {
                if (this.$refs.mfupiform.validate()) {
                    this.orderpoploader = true;
                    let data = await getUpivpa([this.mfpainids, this.uid, this.token]);
                    if (data && data.data && this.mfpainids.toUpperCase() == data.data.client_VPA.toUpperCase() && data.data.verified_VPA_status1 == "Available") {
                        this.setMForder();
                    } else if (data.data && data.data.verified_VPA_status1 != "Available") {
                        this.upiidfield = true;
                        this.upiIDerrors;
                        this.orderpoploader = false;
                    } else {
                        this.snackAlert(2, data.emsg ? data.emsg : data);
                        this.orderpoploader = false;
                    }
                }
            } else {
                this.setMForder();
            }
        },

        async setmfUpiValidnew() {
            this.orderpoploadernew = true

            if (this.mfpayinmode == "UPI") {
                if (this.$refs.mfupiform.validate()) {
                    this.orderpoploader = true;
                    let data = await getUpivpa([this.mfpainids, this.uid, this.token]);
                    if (data && data.data && this.mfpainids.toUpperCase() == data.data.client_VPA.toUpperCase() && data.data.verified_VPA_status1 == "Available") {
                        this.paymentstatuscall();
                    } else if (data.data && data.data.verified_VPA_status1 != "Available") {
                        this.upiidfield = true;
                        this.upiIDerrors;
                        this.orderpoploader = false;
                        this.orderpoploadernew = false

                    } else {
                        this.snackAlert(2, data.emsg ? data.emsg : data);
                        this.orderpoploader = false;
                        this.orderpoploadernew = false

                    }
                }
            } else {
                this.paymentstatuscall();

            }

        },
        async paymentstatuscall() {
            this.orderpoploadernew = true
            let data = JSON.stringify({
                "client_code": this.uid,
                "order_number": this.checkoredrid,
                "total_amount": this.invesrtamoutcheck.toString(),
                "mode_of_payment": this.mfpayinmode ? this.mfpayinmode.toUpperCase() : "",
                "vpa_id": this.mfpainids
            })
            let res = await getsendpaymentrequt(data)
            // console.log("res", res);
            if (res.stat == 'Ok' && res.type == 'UPI') {
                this.orderiniteddai = false
                this.paymentcheck = true
                let paydata = JSON.stringify({
                    "ClientCode": this.uid,
                    "OrderId": this.checkoredrid,
                })
                if (this.intervalId) return;
                this.intervalId = setInterval(async () => {
                    await this.paymentatusapicall(paydata);
                }, 3000);

            }
            else if (res.stat == 'Ok' && res.type == 'NET BANKING') {

                const newTab = window.open("", "_blank");
                newTab.document.write(res.msg);
                newTab.document.close();
                this.orderiniteddai = false
                this.orderpoploadernew = false
            }
            else {
                this.orderiniteddai = false
                this.orderpoploadernew = false

            }


        },

        async paymentatusapicall(data) {
            try {
                this.paystausres = []
                let res = await getcheckpaystatus(data);
                // console.log("paymentatusapicall:", res);
                this.paystausres = res

                if (res.status === "PAYMENT APPROVED" || res.status === "PAYMENT DECLINED" || res.status == 'PAYMENT REJECTED') {
                    // console.log("✅ Payment OK, stopping calls...");
                    this.stopPaymentCheck();
                    this.paymentcheck = false; // stop loader
                    this.paymentconfirm = true
                    this.orderpoploadernew = false

                } else if (res.stat !== "ok") {
                    // console.log("❌ Error response, stopping calls...");
                    this.stopPaymentCheck();
                    this.paymentcheck = false;
                    this.snackAlert(2, res);
                    this.orderpoploadernew = false

                }

            } catch (err) {
                // console.error("API error:", err);
                this.stopPaymentCheck();
                this.paymentcheck = false;
                this.snackAlert(2, "Something went wrong");
                this.orderpoploadernew = false

            }
        },
        stopPaymentCheck(val) {
            if (val == 'manual') {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                    this.snackAlert(2, "Payment Cancel By User");

                }
                this.paymentcheck = false;
                this.paymentconfirm = true
                this.orderpoploadernew = false


            }
            else {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
                this.paymentcheck = false
                this.paymentconfirm = true
                this.orderpoploadernew = false


            }

        },


        async setMfpayment(price, orderid) {
            let data = JSON.stringify({
                client_code: this.uid,
                order_number: `${orderid}`,
                total_amount: `${price}`,

                acc_number: this.mf_accact.Bank_AcNo,
                ifsc: this.mf_accact.IFSC_Code,
                bank_name: this.mf_accact.Bank_Name,

                mode_of_payment: this.mfpayinmode,
                internal_ref_no: "",
                mandate_id: this.mf_tenure ? this.mf_mandate.MandateId : "",
                vpa_id: this.mfpayinmode == "UPI" ? this.mfpainids : "",
                loop_back_url: window.location.href,
                allow_loop_back: "Y",
            });

            let res = await getMFallpayments(data)
            this.orderpoploader = false;
            if (res && res.stat == "Ok") {
                this.mforderdialog = false;
                if (res.type == "UPI") {
                    this.snackAlert(1, res.msg ? res.msg : res);
                    this.closeMenudialog("mforder");
                } else {
                    this.menudata["payment"] = true;
                    var payment = document.getElementById("payment");
                    payment.innerHTML = res.resp;
                    setTimeout(() => {
                        window.open(`${apiurl.mfapi}${res.file}`, "_blank");
                    }, 600);
                }
            } else {
                this.mforderdialog = false;
                this.snackAlert(2, res && res.msg ? res.msg : res);
            }
        },
        closeMenudialog(type) {
            if (type == "mforder") {
                this.mforderdialog = false;
            }
            this.menudata = {};
        },
    },
}
</script>

<style>
.white-chip-dialog {
    background-color: #b13131 !important;

}





.tenure-switch {
    flex: 0 0 auto;
}

.tenure-switch .v-switch__track {
    background-color: #E0E0E0 !important;
    /* border-radius: 20px !important; */
    height: 25px !important;
    width: 56px !important;
}

.tenure-switch .v-switch__thumb {
    background-color: #000000 !important;
    /* border-radius: 50% !important; */
    width: 28px !important;
    height: 20px !important;
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important; */
}

.tenure-switch.v-switch--checked .v-switch__track {
    background-color: #000000 !important;
}

.tenure-switch.v-switch--checked .v-switch__thumb {
    background-color: #FFFFFF !important;
    transform: translateX(24px) !important;
}

.tenure-switch:not(.v-switch--checked) .v-switch__thumb {
    transform: translateX(0px) !important;
}
</style>