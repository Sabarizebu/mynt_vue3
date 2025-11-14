<template>
    <div>
        <div v-if="optionsStore.optionchainid" class="tvcharts">
            <v-card color="cardbg" width="100%" class="rounded-md" style="overflow: hidden">
                <div style="border-top: 1px solid #EBEEF0;">
                    <!-- Toolbar Section - Improved UI -->
                    <v-toolbar flat dense class="tool-sty crd-trn px-4" height="56">
                        <div class="d-flex align-center" style="gap: 12px;">
                            <!-- Search Button - Improved styling -->
                            <v-btn :readonly="optionsStore.coractloader" @click="handleOptionSearch"
                                class="elevation-0 text-none" variant="text"
                                style="color: #000 !important; text-transform: none;">
                                <v-icon size="20" class="mr-2">mdi-magnify</v-icon>
                                <span class="font-weight-bold" style="font-size: 14px;">
                                    {{ optionsStore.optionStockName || '' }}
                                </span>
                            </v-btn>

                            <!-- Expiry Date Selector - Pill-shaped -->
                            <v-menu location="bottom" offset="4">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" :readonly="optionsStore.coractloader" variant="flat"
                                        class="elevation-0 text-none" style="
                                            background-color: #F1F3F8 !important;
                                            color: #000 !important;
                            
                                            height: 36px;
                                            font-size: 14px;
                                            font-weight: 500;
                                            text-transform: none;
                                            min-width: auto;
                                            padding: 0 16px;
                                        ">
                                        <span>{{ optionsStore.lsexdval || '' }}</span>
                                        <span v-if="optionsStore.lsexdval && optionsStore.daydiff"
                                            class="ml-2 font-weight-bold" style="font-size: 12px;">
                                            {{ optionsStore.daydiff }}(D)
                                        </span>
                                        <v-icon size="18" class="ml-2">mdi-chevron-down</v-icon>
                                    </v-btn>
                                </template>
                                <v-list density="compact"
                                    style="max-height: 320px; overflow-y: scroll; min-width: 200px;">
                                    <v-list-item v-for="(item, index) in optionsStore.lsexd" :key="index" :value="index"
                                        :active="optionsStore.lsexdfilter === index"
                                        @click="optionsStore.lsexdfilter = index; optionChainDate()">
                                        <v-list-item-title style="font-size: 14px;">{{ item }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>

                            <!-- Chain Count Selector - Pill-shaped -->
                            <v-menu location="bottom" offset="4">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" :readonly="optionsStore.coractloader" variant="flat"
                                        class="elevation-0 text-none" style="
                                            background-color: #F1F3F8 !important;
                                            color: #000 !important;
                                            height: 36px;
                                            font-size: 14px;
                                            font-weight: 500;
                                            text-transform: none;
                                            min-width: auto;
                                            padding: 0 16px;
                                        ">
                                        <span>{{ optionsStore.chainCount ? (optionsStore.chainCount == '50' ? 'All' :
                                            optionsStore.chainCount) : '' }}</span>
                                        <v-icon size="18" class="ml-2">mdi-chevron-down</v-icon>
                                    </v-btn>
                                </template>
                                <v-list density="compact" style="min-width: 120px;">
                                    <v-list-item v-for="(item, index) in ['5', '10', '15', '30', 'All']" :key="index"
                                        :value="index" :active="optionsStore.ccfilter === index"
                                        @click="optionsStore.ccfilter = index; optionChainDate()">
                                        <v-list-item-title style="font-size: 14px;">{{ item }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>

                        <v-spacer></v-spacer>

                        <div class="d-flex align-center" style="gap: 8px;">
                            <!-- Trash/Delete Button -->
                            <v-btn :readonly="optionsStore.coractloader" icon variant="text" size="small"
                                class="elevation-0" style="color: #666 !important;">
                                <v-icon size="20">mdi-delete-outline</v-icon>
                            </v-btn>

                            <!-- Basket Order Button -->
                            <v-btn :readonly="optionsStore.coractloader" icon variant="text" size="small"
                                class="elevation-0" @click="setBaskorder('create')">
                                <img width="20px" height="20px" :src="basketOrderIcon" />
                            </v-btn>

                            <!-- Settings Button -->
                            <v-btn :readonly="optionsStore.coractloader" v-if="optionsStore.drawer == false" icon
                                variant="text" size="small" class="elevation-0" @click="optionsStore.drawer = true"
                                style="color: #666 !important;">
                                <v-icon size="20">mdi-cog-outline</v-icon>
                            </v-btn>
                        </div>
                    </v-toolbar>
                    <v-divider></v-divider>

                    <!-- Options Chain Table -->
                    <div>
                        <v-card v-if="optionsStore.coractdata" class="crd-trn elevation-0 rounded-0"
                            style="overflow: hidden">
                            <v-table class="no-scroll crd-trn" fixed-header
                                :style="`--my-simtblwidth-var:${optionsStore.simtblwidth};--my-simtblscroll-var:${optionsStore.simtblscroll};`"
                                height="calc(100vh - 178px)" density="compact">
                                <thead class="secbg">
                                    <!-- Header Row 1: CALLS | PUTS -->
                                    <tr class="cardbg">
                                        <th :colspan="optionsStore.opchtablehead" class="px-0 text-center">
                                            <span class="font-weight-bold">CALLS</span>
                                        </th>
                                        <th colspan="4" class="text-center pa-0"></th>
                                        <th :colspan="optionsStore.opchtablehead" class="px-0 text-center">
                                            <span class="font-weight-bold">PUTS</span>
                                        </th>
                                    </tr>
                                    <!-- Header Row 2: Column Headers -->
                                    <tr>
                                        <!-- Call Side Headers -->
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">THETA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VEGA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">GAMA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">DELTA</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VOL<span
                                                        class="optionchsty">(lac)</span></span>
                                            </v-card>
                                        </th>
                                        <th width="96px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">OI<span
                                                        class="optionchsty">(ch)</span></span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">BID</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">ASK</span>
                                            </v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">CH</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">LTP</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">IV</span>
                                            </v-card>
                                        </th>
                                        <!-- Strike Price Header -->
                                        <th colspan="4"
                                            style="border-left: thin solid rgba(0, 0, 0, 0.12); border-right: thin solid rgba(0, 0, 0, 0.12)">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="mx-4 optionheadsty">STRIKES</span>
                                            </v-card>
                                        </th>
                                        <!-- Put Side Headers -->
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">IV</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">LTP</span>
                                            </v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">CH</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">BID</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">ASK</span>
                                            </v-card>
                                        </th>
                                        <th width="96px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">OI<span
                                                        class="optionchsty">(ch)</span></span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VOL<span
                                                        class="optionchsty">(lac)</span></span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">DELTA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">GAMA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">VEGA</span>
                                            </v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile>
                                                <span class="optionheadsty">THETA</span>
                                            </v-card>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Phase 2: Calls above spot (upcallSO) -->
                                    <tr v-for="(script, k) in optionsStore.upcallSO" :key="'calloption' + k"
                                        class="totrhover">
                                        <!-- Call Side: Greeks (optional) -->
                                        <th v-if="optionsStore.thetacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.theta ? script.theta : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.vagacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.vega ? script.vega : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.gamacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.gamma ? script.gamma : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.deltacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.delta ? script.delta : '0.0000'"></div>
                                        </th>
                                        <!-- Call Side: VOL -->
                                        <th colspan="2" class="text-center opdatas" :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`upcall${script.token}vol`"
                                                v-html="script.vol ? script.vol : '0.00'"></span>
                                        </th>
                                        <!-- Call Side: OI with Progress Bar -->
                                        <th colspan="2" class="text-center opdatas opdatacalluphov"
                                            :style="optionsStore.opdatabgs">
                                            <div class="callprogress" :style="`--my-width-var:${script.pro || 0}%;`"
                                                :id="`upcall${script.token}pro`">
                                                <span class="optiondatasty optionbartext">
                                                    <span :id="`upcall${script.token}oi`">{{ script.oi ? script.oi :
                                                        '0.00'
                                                        }}</span>
                                                    <span :id="`upcall${script.token}oiclr`"
                                                        :style="`color:${script.oich > 0 ? '#43A833' : script.oich < 0 ? '#F23645' : 'none'};`"
                                                        class="optionchsty">
                                                        <span :id="`upcall${script.token}oich`">({{ script.oich ?
                                                            script.oich : '0.00'
                                                            }})</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- Call Side: BID (optional) -->
                                        <th v-if="optionsStore.bitcheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                :id="`upcall${script.token}bid`"
                                                v-html="script.bid ? script.bid : '0.00'"></div>
                                        </th>
                                        <!-- Call Side: ASK (optional) -->
                                        <th v-if="optionsStore.askcheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                :id="`upcall${script.token}ask`"
                                                v-html="script.ask ? script.ask : '0.00'"></div>
                                        </th>
                                        <!-- Call Side: CH -->
                                        <th colspan="2" class="text-center opdatas" :style="optionsStore.opdatabgs">
                                            <span
                                                :style="`color:${script.ch > 0 ? '#43A833' : script.ch < 0 ? '#F23645' : ''};`"
                                                :id="`upcall${script.token}chpclr`" class="optiondatasty">
                                                <span :id="`upcall${script.token}ch`">{{ script.ch ? script.ch : '0.00'
                                                    }}</span>
                                                <span :id="`upcall${script.token}chp`" class="optionchsty">
                                                    ({{ script.chp ? script.chp : '0.00' }}%)
                                                </span>
                                            </span>
                                        </th>
                                        <!-- Call Side: LTP -->
                                        <th colspan="2" class="text-center opdatacalluphov opdatas"
                                            :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`upcall${script.token}ltp`"
                                                v-html="script.ltp ? script.ltp : '0.00'"> </span>
                                            <!-- Hover Action Buttons (Left Side) -->
                                    <tr v-if="script.token" class="opdatacallupbtn lfttrbtn"
                                        style="margin-left: -192px">
                                        <th colspan="1" @click="chartOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-chart-line-variant</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="depthOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-format-align-center</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="basketOption(script)">
                                            <div style="height: 22px; min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <img width="16px" :src="getBasketIcon()" />
                                            </div>
                                        </th>
                                        <th colspan="1" @click="addOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-bookmark-outline</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="sellOption(script)">
                                            <div style="background-color: #F23645 !important;color: #fff !important;"
                                                class="newhoverbtn newhoverbtnsize white--text cursor-p">S</div>
                                        </th>
                                        <th colspan="1" @click="buyOption(script)">
                                            <div style="background-color: #43A833 !important;color: #fff !important;"
                                                class="newhoverbtn newhoverbtnsize white--text cursor-p">
                                                B</div>
                                        </th>
                                    </tr>
                                    </th>
                                    <!-- Call Side: IV (optional) -->
                                    <th v-if="optionsStore.ivcheckbox" colspan="1" class="text-center pa-0"
                                        :style="optionsStore.opdatabgs">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="script.IV ? script.IV : '0.00'"></div>
                                    </th>
                                    <!-- Strike Price (Center) -->
                                    <th colspan="4" class="text-center opstrprcborder opdatacalluphov pos-rlt"
                                        :style="optionsStore.opdatabgs">
                                        <div class="lftbarstatus"
                                            :style="`--my-lftbrdclr-var:${script.bar || 'rgba(0, 0, 0, 0.12)'};`"
                                            :id="`upcall${script.token}bar`"></div>
                                        <!-- Position Badge (Call Side) -->
                                        <v-tooltip v-if="script.p" location="left" color="black">
                                            <template v-slot:activator="{ props }">
                                                <v-icon v-bind="props" class="badghlpos pos-abs"
                                                    :color="script.pz || 'rgba(0, 0, 0, 0.12)'"
                                                    @click="router.push('/positions')" size="14">
                                                    {{ script.icon || 'mdi-minus-circle' }}
                                                </v-icon>
                                            </template>
                                            <span>
                                                <b :class="script.qtyclr">{{ script.qtyp || '0' }}</b> Qty @
                                                <span :class="script.px" class="font-weight-bold">{{ script.pmtm ||
                                                    '0.00' }}</span> MTM
                                            </span>
                                        </v-tooltip>
                                        <span class="subtitle-2 font-weight-bold">
                                            {{ Number(script.strprc) ? script.strprc : '0.00' }}
                                        </span>
                                        <!-- Position Badge (Put Side) -->
                                        <v-tooltip v-if="optionsStore.upputSO[k] && optionsStore.upputSO[k].p"
                                            location="right" color="black">
                                            <template v-slot:activator="{ props }">
                                                <v-icon v-bind="props" class="badghrpos pos-abs"
                                                    :color="optionsStore.upputSO[k].pz || 'rgba(0, 0, 0, 0.12)'"
                                                    @click="router.push('/positions')" size="14">
                                                    {{ optionsStore.upputSO[k].icon || 'mdi-minus-circle' }}
                                                </v-icon>
                                            </template>
                                            <span>
                                                <b :class="optionsStore.upputSO[k].qtyclr">{{
                                                    optionsStore.upputSO[k].qtyp || '0' }}</b> Qty
                                                @
                                                <span :class="optionsStore.upputSO[k].px" class="font-weight-bold">
                                                    {{ optionsStore.upputSO[k].pmtm || '0.00' }}
                                                </span> MTM
                                            </span>
                                        </v-tooltip>
                                        <div class="rgtbarstatus"
                                            :style="`--my-rgtbrdclr-var:${optionsStore.upputSO[k]?.bar || 'rgba(0, 0, 0, 0.12)'};`"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}bar`"></div>
                                    </th>
                                    <!-- Put Side: IV (optional) -->
                                    <th v-if="optionsStore.ivcheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.upputSO[k]?.IV ? optionsStore.upputSO[k].IV : '0.00'">
                                        </div>
                                    </th>
                                    <!-- Put Side: LTP -->
                                    <th colspan="2" class="text-center opdatacalluphov opdatas">
                                        <span class="optiondatasty"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}ltp`"
                                            v-html="optionsStore.upputSO[k]?.ltp ? optionsStore.upputSO[k].ltp : '0.00'">
                                        </span>
                                        <!-- Hover Action Buttons (Right Side - Upper) -->
                                        <tr v-if="optionsStore.upputSO[k] && optionsStore.upputSO[k].token"
                                            class="opdatacallupbtn uprghtrbtn">
                                            <th colspan="1" @click="buyOption(script, optionsStore.upputSO)">
                                                <div style="background-color: #43A833 !important;color: #fff !important;"
                                                    class="newhoverbtn newhoverbtnsize white--text cursor-p">B</div>
                                            </th>
                                            <th colspan="1" @click="sellOption(script, optionsStore.upputSO)">
                                                <div style="background-color: #F23645 !important;color: #fff !important;"
                                                    class="newhoverbtn newhoverbtnsize white--text cursor-p">S</div>
                                            </th>
                                            <th colspan="1" @click="addOption(script, optionsStore.upputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p">
                                                    <v-icon size="16" color="maintext">mdi-bookmark-outline</v-icon>
                                                </div>
                                            </th>
                                            <th colspan="1" @click="basketOption(script, optionsStore.upputSO)">
                                                <div style="height: 22px; min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <img width="16px" :src="getBasketIcon()" />
                                                </div>
                                            </th>
                                            <th colspan="1" @click="depthOption(script, optionsStore.upputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <v-icon size="16" color="maintext">mdi-format-align-center</v-icon>
                                                </div>
                                            </th>
                                            <th colspan="1" @click="chartOption(script, optionsStore.upputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <v-icon size="16" color="maintext">mdi-chart-line-variant</v-icon>
                                                </div>
                                            </th>
                                        </tr>
                                    </th>
                                    <!-- Put Side: CH -->
                                    <th colspan="2" class="text-center opdatas">
                                        <span
                                            :style="`color:${optionsStore.upputSO[k]?.ch > 0 ? '#43A833' : optionsStore.upputSO[k]?.ch < 0 ? '#F23645' : ''};`"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}chpclr`"
                                            class="optiondatasty">
                                            <span :id="`upput${optionsStore.upputSO[k]?.token || ''}ch`">
                                                {{ optionsStore.upputSO[k]?.ch ? optionsStore.upputSO[k].ch : '0.00' }}
                                            </span>
                                            <span :id="`upput${optionsStore.upputSO[k]?.token || ''}chp`"
                                                class="optionchsty">
                                                ({{ optionsStore.upputSO[k]?.chp ? optionsStore.upputSO[k].chp : '0.00'
                                                }}%)
                                            </span>
                                        </span>
                                    </th>
                                    <!-- Put Side: BID (optional) -->
                                    <th v-if="optionsStore.bitcheckbox" colspan="1" class="text-center opdatas">
                                        <span class="optiondatasty"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}bid`"
                                            v-html="optionsStore.upputSO[k]?.bid ? optionsStore.upputSO[k].bid : '0.00'"></span>
                                    </th>
                                    <!-- Put Side: ASK (optional) -->
                                    <th v-if="optionsStore.askcheckbox" colspan="1" class="text-center opdatas">
                                        <span class="optiondatasty"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}ask`"
                                            v-html="optionsStore.upputSO[k]?.ask ? optionsStore.upputSO[k].ask : '0.00'"></span>
                                    </th>
                                    <!-- Put Side: OI with Progress Bar -->
                                    <th colspan="2" class="text-center opdatas opdatacalluphov">
                                        <div class="putprogress"
                                            :style="`--my-width-var:${optionsStore.upputSO[k]?.pro || 0}%;`"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}pro`">
                                            <span class="optiondatasty optionbartext">
                                                <span :id="`upput${optionsStore.upputSO[k]?.token || ''}oi`">
                                                    {{ optionsStore.upputSO[k]?.oi ? optionsStore.upputSO[k].oi : '0.00'
                                                    }}
                                                </span>
                                                <span :id="`upput${optionsStore.upputSO[k]?.token || ''}oiclr`"
                                                    :style="`color:${optionsStore.upputSO[k]?.oich > 0 ? '#43A833' : optionsStore.upputSO[k]?.oich < 0 ? '#F23645' : 'none'};`"
                                                    class="optionchsty">
                                                    <span :id="`upput${optionsStore.upputSO[k]?.token || ''}oich`">
                                                        ({{ optionsStore.upputSO[k]?.oich ? optionsStore.upputSO[k].oich
                                                            : '0.00' }})
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                    </th>
                                    <!-- Put Side: VOL -->
                                    <th colspan="2" class="text-center opdatas">
                                        <span class="optiondatasty"
                                            :id="`upput${optionsStore.upputSO[k]?.token || ''}vol`"
                                            v-html="optionsStore.upputSO[k]?.vol ? optionsStore.upputSO[k].vol : '0.00'"></span>
                                    </th>
                                    <!-- Put Side: Greeks (optional) -->
                                    <th v-if="optionsStore.deltacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.upputSO[k]?.delta ? optionsStore.upputSO[k].delta : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.gamacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.upputSO[k]?.gamma ? optionsStore.upputSO[k].gamma : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.vagacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.upputSO[k]?.vega ? optionsStore.upputSO[k].vega : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.thetacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.upputSO[k]?.theta ? optionsStore.upputSO[k].theta : '0.0000'">
                                        </div>
                                    </th>
                                    </tr>
                                    <!-- Spot Price Row -->
                                    <tr v-if="optionsStore.chainSpotdata && optionsStore.chainSpotdata.lp"
                                        ref="chainSpotRow">
                                        <th :colspan="optionsStore.opchtablehead" class="px-0">
                                            <div style="height: 2px; background-color: #FF720C;"></div>
                                        </th>
                                        <th id="opcenterview" colspan="4" class="text-center pa-2 opdatacalluphov">
                                            <v-card class="white--text elevation-0" color="#FF720C"
                                                style="border-radius: 4px; padding: 4px 12px; display: inline-block;">
                                                <span class="font-weight-bold" style="font-size: 14px;">
                                                    {{ optionsStore.chainSpotdata.lp ?
                                                        Number(optionsStore.chainSpotdata.lp).toFixed(2) :
                                                        '0.00' }}
                                                </span>
                                            </v-card>
                                        </th>
                                        <th :colspan="optionsStore.opchtablehead" class="px-0">
                                            <div style="height: 2px; background-color: #FF720C;"></div>
                                        </th>
                                    </tr>
                                    <!-- Phase 6: Calls below spot (dwncallSO) -->
                                    <tr v-for="(script, k) in optionsStore.dwncallSO" :key="'dwncall' + k"
                                        class="totrhover">
                                        <!-- Call Side: Greeks (optional) -->
                                        <th v-if="optionsStore.thetacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.theta ? script.theta : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.vagacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.vega ? script.vega : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.gamacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.gamma ? script.gamma : '0.0000'"></div>
                                        </th>
                                        <th v-if="optionsStore.deltacheckbox" colspan="1" class="text-center pa-0"
                                            :style="optionsStore.opdatabgs">
                                            <div width="100%" height="32px" class="optiondatasty"
                                                v-html="script.delta ? script.delta : '0.0000'"></div>
                                        </th>
                                        <!-- Call Side: VOL -->
                                        <th colspan="2" class="text-center opdatas" :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`dwncall${script.token}vol`"
                                                v-html="script.vol ? script.vol : '0.00'"></span>
                                        </th>
                                        <!-- Call Side: OI with Progress Bar -->
                                        <th colspan="2" class="text-center opdatas opdatacalluphov"
                                            :style="optionsStore.opdatabgs">
                                            <div class="callprogress" :style="`--my-width-var:${script.pro || 0}%;`"
                                                :id="`dwncall${script.token}pro`">
                                                <span class="optiondatasty optionbartext">
                                                    <span :id="`dwncall${script.token}oi`">{{ script.oi ? script.oi :
                                                        '0.00'
                                                        }}</span>
                                                    <span :id="`dwncall${script.token}oiclr`"
                                                        :style="`color:${script.oich > 0 ? '#43A833' : script.oich < 0 ? '#F23645' : 'none'};`"
                                                        class="optionchsty">
                                                        <span :id="`dwncall${script.token}oich`">({{ script.oich ?
                                                            script.oich : '0.00'
                                                            }})</span>
                                                    </span>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- Call Side: BID (optional) -->
                                        <th v-if="optionsStore.bitcheckbox" colspan="1" class="text-center opdatas"
                                            :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`dwncall${script.token}bid`"
                                                v-html="script.bid ? script.bid : '0.00'"></span>
                                        </th>
                                        <!-- Call Side: ASK (optional) -->
                                        <th v-if="optionsStore.askcheckbox" colspan="1" class="text-center opdatas"
                                            :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`dwncall${script.token}ask`"
                                                v-html="script.ask ? script.ask : '0.00'"></span>
                                        </th>
                                        <!-- Call Side: CH -->
                                        <th colspan="2" class="text-center opdatas" :style="optionsStore.opdatabgs">
                                            <span
                                                :style="`color:${script.ch > 0 ? '#43A833' : script.ch < 0 ? '#F23645' : ''};`"
                                                :id="`dwncall${script.token}chpclr`" class="optiondatasty">
                                                <span :id="`dwncall${script.token}ch`">{{ script.ch ? script.ch :
                                                    '0.00'
                                                    }}</span>
                                                <span :id="`dwncall${script.token}chp`" class="optionchsty">
                                                    ({{ script.chp ? script.chp : '0.00' }}%)
                                                </span>
                                            </span>
                                        </th>
                                        <!-- Call Side: LTP -->
                                        <th colspan="2" class="text-center opdatacalluphov opdatas"
                                            :style="optionsStore.opdatabgs">
                                            <span class="optiondatasty" :id="`dwncall${script.token}ltp`"
                                                v-html="Number(script.ltp) ? script.ltp : '0.00'"></span>
                                            <!-- Hover Action Buttons (Left Side) -->
                                    <tr v-if="script.token" class="opdatacallupbtn lfttrbtn"
                                        style="margin-left: -192px">
                                        <th colspan="1" @click="chartOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-chart-line-variant</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="depthOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-format-align-center</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="basketOption(script)">
                                            <div style="height: 22px; min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <img width="16px" :src="getBasketIcon()" />
                                            </div>
                                        </th>
                                        <th colspan="1" @click="addOption(script)">
                                            <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                class="cursor-p mr-1">
                                                <v-icon size="16" color="maintext">mdi-bookmark-outline</v-icon>
                                            </div>
                                        </th>
                                        <th colspan="1" @click="sellOption(script)">
                                            <div style="background-color: #F23645"
                                                class="newhoverbtn newhoverbtnsize white--text cursor-p">
                                                S</div>
                                        </th>
                                        <th colspan="1" @click="buyOption(script)">
                                            <div style="background-color: #43A833"
                                                class="newhoverbtn newhoverbtnsize white--text cursor-p">
                                                B</div>
                                        </th>
                                    </tr>
                                    </th>
                                    <!-- Call Side: IV (optional) -->
                                    <th v-if="optionsStore.ivcheckbox" colspan="1" class="text-center pa-0"
                                        :style="optionsStore.opdatabgs">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="script.IV ? script.IV : '0.00'"></div>
                                    </th>
                                    <!-- Strike Price (Center) -->
                                    <th colspan="4" class="text-center opstrprcborder opdatacalluphov pos-rlt"
                                        :style="optionsStore.opdatabgs">
                                        <div class="lftbarstatus"
                                            :style="`--my-lftbrdclr-var:${script.bar || 'rgba(0, 0, 0, 0.12)'};`"
                                            :id="`dwncall${script.token}bar`"></div>
                                        <!-- Position Badge (Call Side) -->
                                        <v-tooltip v-if="script.p" location="left" color="black">
                                            <template v-slot:activator="{ props }">
                                                <v-icon v-bind="props" class="badghlpos pos-abs"
                                                    :color="script.pz || 'rgba(0, 0, 0, 0.12)'"
                                                    @click="router.push('/positions')" size="14">
                                                    {{ script.icon || 'mdi-minus-circle' }}
                                                </v-icon>
                                            </template>
                                            <span>
                                                <b :class="script.qtyclr">{{ script.qtyp || '0' }}</b> Qty @
                                                <span :class="script.px" class="font-weight-bold">{{ script.pmtm ||
                                                    '0.00' }}</span> MTM
                                            </span>
                                        </v-tooltip>
                                        <span class="subtitle-2 font-weight-bold">
                                            {{ Number(script.strprc) ? script.strprc : '0.00' }}
                                        </span>
                                        <!-- Position Badge (Put Side) -->
                                        <v-tooltip v-if="optionsStore.dwnputSO[k] && optionsStore.dwnputSO[k].p"
                                            location="right" color="black">
                                            <template v-slot:activator="{ props }">
                                                <v-icon v-bind="props" class="badghrpos pos-abs"
                                                    :color="optionsStore.dwnputSO[k].pz || 'rgba(0, 0, 0, 0.12)'"
                                                    @click="router.push('/positions')" size="14">
                                                    {{ optionsStore.dwnputSO[k].icon || 'mdi-minus-circle' }}
                                                </v-icon>
                                            </template>
                                            <span>
                                                <b :class="optionsStore.dwnputSO[k].qtyclr">{{
                                                    optionsStore.dwnputSO[k].qtyp || '0' }}</b> Qty
                                                @
                                                <span :class="optionsStore.dwnputSO[k].px" class="font-weight-bold">
                                                    {{ optionsStore.dwnputSO[k].pmtm || '0.00' }}
                                                </span> MTM
                                            </span>
                                        </v-tooltip>
                                        <div class="rgtbarstatus"
                                            :style="`--my-rgtbrdclr-var:${optionsStore.dwnputSO[k]?.bar || 'rgba(0, 0, 0, 0.12)'};`"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}bar`"></div>
                                    </th>
                                    <!-- Put Side: IV (optional) -->
                                    <th v-if="optionsStore.ivcheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.dwnputSO[k]?.IV ? optionsStore.dwnputSO[k].IV : '0.00'">
                                        </div>
                                    </th>
                                    <!-- Put Side: LTP -->
                                    <th colspan="2" class="text-center opdatacalluphov opdatas">
                                        <span class="optiondatasty"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}ltp`"
                                            v-html="Number(optionsStore.dwnputSO[k]?.ltp) ? optionsStore.dwnputSO[k].ltp : '0.00'"></span>
                                        <!-- Hover Action Buttons (Right Side - Lower) -->
                                        <tr v-if="optionsStore.dwnputSO[k] && optionsStore.dwnputSO[k].token"
                                            class="opdatacallupbtn dwnrghtrbtn">
                                            <th colspan="1" @click="buyOption(script, optionsStore.dwnputSO)">
                                                <div style="background-color: #43A833"
                                                    class="newhoverbtn newhoverbtnsize white--text cursor-p">B</div>
                                            </th>
                                            <th colspan="1" @click="sellOption(script, optionsStore.dwnputSO)">
                                                <div style="background-color: #F23645"
                                                    class="newhoverbtn newhoverbtnsize white--text cursor-p">S</div>
                                            </th>
                                            <th colspan="1" @click="addOption(script, optionsStore.dwnputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p">
                                                    <v-icon size="16" color="maintext">mdi-bookmark-outline</v-icon>
                                                </div>
                                            </th>
                                            <th colspan="1" @click="basketOption(script, optionsStore.dwnputSO)">
                                                <div style="height: 22px; min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <img width="16px" :src="getBasketIcon()" />
                                                </div>
                                            </th>
                                            <th colspan="1" @click="depthOption(script, optionsStore.dwnputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <v-icon size="16" color="maintext">mdi-format-align-center</v-icon>
                                                </div>
                                            </th>
                                            <th colspan="1" @click="chartOption(script, optionsStore.dwnputSO)">
                                                <div style="min-width: 32px; border-radius: 4px; border: thin solid #EBEEF0; padding: 1px 4px; background-color: #fff"
                                                    class="cursor-p ml-1">
                                                    <v-icon size="16" color="maintext">mdi-chart-line-variant</v-icon>
                                                </div>
                                            </th>
                                        </tr>
                                    </th>
                                    <!-- Put Side: CH -->
                                    <th colspan="2" class="text-center opdatas">
                                        <span
                                            :style="`color:${optionsStore.dwnputSO[k]?.ch > 0 ? '#43A833' : optionsStore.dwnputSO[k]?.ch < 0 ? '#F23645' : ''};`"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}chpclr`"
                                            class="optiondatasty">
                                            <span :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}ch`">
                                                {{ optionsStore.dwnputSO[k]?.ch ? optionsStore.dwnputSO[k].ch :
                                                    '0.00' }}
                                            </span>
                                            <span :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}chp`"
                                                class="optionchsty">
                                                ({{ optionsStore.dwnputSO[k]?.chp ? optionsStore.dwnputSO[k].chp :
                                                    '0.00'
                                                }}%)
                                            </span>
                                        </span>
                                    </th>
                                    <!-- Put Side: BID (optional) -->
                                    <th v-if="optionsStore.bitcheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}bid`"
                                            v-html="optionsStore.dwnputSO[k]?.bid ? optionsStore.dwnputSO[k].bid : '0.00'">
                                        </div>
                                    </th>
                                    <!-- Put Side: ASK (optional) -->
                                    <th v-if="optionsStore.askcheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}ask`"
                                            v-html="optionsStore.dwnputSO[k]?.ask ? optionsStore.dwnputSO[k].ask : '0.00'">
                                        </div>
                                    </th>
                                    <!-- Put Side: OI with Progress Bar -->
                                    <th colspan="2" class="text-center opdatas opdatacalluphov">
                                        <div class="putprogress"
                                            :style="`--my-width-var:${optionsStore.dwnputSO[k]?.pro || 0}%;`"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}pro`">
                                            <span class="optiondatasty optionbartext">
                                                <span :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}oi`">
                                                    {{ optionsStore.dwnputSO[k]?.oi ? optionsStore.dwnputSO[k].oi :
                                                        '0.00'
                                                    }}
                                                </span>
                                                <span :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}oiclr`"
                                                    :style="`color:${optionsStore.dwnputSO[k]?.oich > 0 ? '#43A833' : optionsStore.dwnputSO[k]?.oich < 0 ? '#F23645' : 'none'};`"
                                                    class="optionchsty">
                                                    <span :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}oich`">
                                                        ({{ optionsStore.dwnputSO[k]?.oich ?
                                                            optionsStore.dwnputSO[k].oich
                                                            : '0.00' }})
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                    </th>
                                    <!-- Put Side: VOL -->
                                    <th colspan="2" class="text-center opdatas">
                                        <span class="optiondatasty"
                                            :id="`dwnput${optionsStore.dwnputSO[k]?.token || ''}vol`"
                                            v-html="optionsStore.dwnputSO[k]?.vol ? optionsStore.dwnputSO[k].vol : '0.00'"></span>
                                    </th>
                                    <!-- Put Side: Greeks (optional) -->
                                    <th v-if="optionsStore.deltacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.dwnputSO[k]?.delta ? optionsStore.dwnputSO[k].delta : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.gamacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.dwnputSO[k]?.gamma ? optionsStore.dwnputSO[k].gamma : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.vagacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.dwnputSO[k]?.vega ? optionsStore.dwnputSO[k].vega : '0.0000'">
                                        </div>
                                    </th>
                                    <th v-if="optionsStore.thetacheckbox" colspan="1" class="text-center pa-0">
                                        <div width="100%" height="32px" class="optiondatasty"
                                            v-html="optionsStore.dwnputSO[k]?.theta ? optionsStore.dwnputSO[k].theta : '0.0000'">
                                        </div>
                                    </th>
                                    </tr>
                                    <!-- No Data State -->
                                    <tr
                                        v-if="optionsStore.dwncallSO.length === 0 && optionsStore.upcallSO.length === 0">
                                        <td :colspan="optionsStore.opchtablehead + 4 + optionsStore.opchtablehead"
                                            class="text-center py-16">
                                            <p class="subtext--text">No options chain data available</p>
                                        </td>
                                    </tr>
                                </tbody>
                                <!-- Phase 3: Footer with PCR ratios -->
                                <tfoot class="mb-3" v-if="optionsStore.coractdata">
                                    <tr>
                                        <!-- Call Side Footer -->
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="96px" colspan="2" class="px-0">
                                            <v-card class="elevation-0 text-center" color="secbg" tile>
                                                <span class="optionheadsty">{{ optionsStore.pcrcallRatio > 0 ?
                                                    optionsStore.pcrcallRatio :
                                                    '0' }}</span>
                                            </v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <!-- Strike Price Footer -->
                                        <th colspan="4"
                                            style="border-left: thin solid rgba(0, 0, 0, 0.12); border-right: thin solid rgba(0, 0, 0, 0.12)">
                                            <v-card class="crd-trn elevation-0 text-center" tile>
                                                <span class="optionheadsty">PCR : {{ optionsStore.pcrRatio > 0 ?
                                                    optionsStore.pcrRatio :
                                                    '0.0000' }}</span>
                                            </v-card>
                                        </th>
                                        <!-- Put Side Footer -->
                                        <th width="60px" v-if="optionsStore.ivcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="100px" colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th v-if="optionsStore.bitcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th v-if="optionsStore.askcheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="96px" colspan="2" class="px-0">
                                            <v-card class="elevation-0 text-center" color="secbg" tile>
                                                <span class="optionheadsty">{{ optionsStore.pcrputRatio > 0 ?
                                                    optionsStore.pcrputRatio : '0'
                                                    }}</span>
                                            </v-card>
                                        </th>
                                        <th colspan="2">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.deltacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.gamacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.vagacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                        <th width="60px" v-if="optionsStore.thetacheckbox" colspan="1">
                                            <v-card class="crd-trn elevation-0 text-center subtext--text" tile></v-card>
                                        </th>
                                    </tr>
                                </tfoot>
                            </v-table>
                        </v-card>

                        <!-- Phase 3: Settings Drawer -->
                        <v-navigation-drawer hide-overlay class="elevation-1" v-model="optionsStore.drawer"
                            color="cardbg" absolute temporary location="right">
                            <!-- Header -->
                            <div class="d-flex align-center justify-space-between pa-3">
                                <p class="mt-2 mb-0">View setting</p>
                                <v-btn tile icon @click="optionsStore.drawer = false">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" width="17" height="17"
                                        fill="currentColor">
                                        <path d="m.58 1.42.82-.82 15 15-.82.82z"></path>
                                        <path d="m.58 15.58 15-15 .82.82-15 15z"></path>
                                    </svg>
                                </v-btn>
                            </div>

                            <v-divider></v-divider>

                            <!-- Add Columns Section -->
                            <div class="pa-3">
                                <p class="mt-0 mb-1">Add columns</p>
                                <v-card flat color="transparent">
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.bitcheckbox" label="BID" />
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.askcheckbox" label="ASK" />
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.ivcheckbox" label="IV" />
                                </v-card>
                            </div>

                            <v-divider></v-divider>

                            <!-- Add Greeks Section -->
                            <div class="pa-3">
                                <p class="mt-0 mb-1">Add greeks</p>
                                <v-card flat color="transparent">
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.deltacheckbox" label="DELTA" />
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.gamacheckbox" label="GAMA" />
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.vagacheckbox" label="VEGA" />
                                    <v-checkbox @update:model-value="simpleTablestyle()"
                                        v-model="optionsStore.thetacheckbox" label="THETA" />
                                </v-card>
                            </div>

                            <v-divider></v-divider>

                            <!-- Info Section -->
                            <div class="pa-3">
                                <p class="mt-0 mb-1">Info</p>
                                <div class="d-flex align-center">
                                    <div style="background-color: #1e53e530" class="infoprogress"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">OI percentage bar</p>
                                        <p class="text-caption mb-0">size diff from max <br />call & put</p>
                                    </div>
                                </div>
                            </div>

                            <v-divider class="mx-4"></v-divider>

                            <!-- Bullish Section -->
                            <div class="pa-3">
                                <p class="mt-0 mb-1">Bullish</p>
                                <div class="d-flex align-center mb-2">
                                    <div style="background-color: #43A833" class="infobarstatus"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">Up trend (Long build-up)</p>
                                        <p class="text-caption mb-0">More traders are buying</p>
                                    </div>
                                </div>
                                <div class="d-flex align-center">
                                    <div style="background-color: #ECF8F1" class="infobarstatus"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">Down trend (Short covering)</p>
                                        <p class="text-caption mb-0">Buyers are squaring</p>
                                    </div>
                                </div>
                            </div>

                            <v-divider class="mx-4"></v-divider>

                            <!-- Bearish Section -->
                            <div class="pa-3">
                                <p class="mt-0 mb-1">Bearish</p>
                                <div class="d-flex align-center mb-2">
                                    <div style="background-color: #F23645" class="infobarstatus"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">Down trend (Short build-up)</p>
                                        <p class="text-caption mb-0">More traders are selling</p>
                                    </div>
                                </div>
                                <div class="d-flex align-center">
                                    <div style="background-color: #ffcdcd90" class="infobarstatus"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">Down trend (Long unwinding)</p>
                                        <p class="text-caption mb-0">Profit booking</p>
                                    </div>
                                </div>
                            </div>

                            <v-divider class="mx-4"></v-divider>

                            <!-- Trade Not Accurate -->
                            <div class="pa-3">
                                <div class="d-flex align-center">
                                    <div style="background-color: rgba(0, 0, 0, 0.12)" class="infobarstatus"></div>
                                    <div class="ml-2">
                                        <p class="mb-0 font-weight-medium">Trade not accurate</p>
                                        <p class="text-caption mb-0">none</p>
                                    </div>
                                </div>
                            </div>
                        </v-navigation-drawer>

                        <!-- Loading State -->
                        <v-card color="transparent" v-if="optionsStore.coractloader" width="100%"
                            style="z-index: 0 !important" class="elevation-0 rounded-lg py-10 px-16">
                            <p class="pa-16 pb-0 text-center">Getting your Option Chain</p>
                            <v-card width="200px" class="elevation-0 mx-auto">
                                <v-progress-linear class="mb-12" color="primary" indeterminate rounded height="6">
                                </v-progress-linear>
                            </v-card>
                        </v-card>
                    </div>
                </div>
            </v-card>
        </div>
        <!-- No Data State -->
        <div v-else class="no-scroll pos-rlt" style="height: calc(100vh - 118px)">
            <div class="pos-cent">
                <p class="mb-0 fs-14 maintext--text font-weight-medium text-center">
                    No Option chain data <br />
                    for <b>{{ optionsStore.optionStockSymbol || '' }}</b>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useOptionsStore } from '@/stores/optionsStore'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getMasters, getOptionschain, getQuotesdata, getGreekoptions, getMPosotion } from '@/components/mixins/getAPIdata'
import basketIconLight from '@/assets/usermenu/9.svg'
import basketIconDark from '@/assets/usermenu/9d.svg'
import basketOrderIcon from '@/assets/usermenu/9opt.svg'

const route = useRoute()
const router = useRouter()
const theme = useTheme()
const optionsStore = useOptionsStore()
const authStore = useAuthStore()
const appStore = useAppStore()

// Phase 4: WebSocket state management
const lastState = ref({}) // Store last known state for each token

// Initialize global data cache if not exists
if (typeof window !== 'undefined' && !window.ssdreqdata) {
    window.ssdreqdata = { data: {} }
}
if (typeof window !== 'undefined' && !window.ssddetail) {
    window.ssddetail = []
}

// Phase 4: Merge tick data function (similar to watchlist and stocks page)
function mergeTick(token, patch) {
    const prev = lastState.value[token] || {}
    const out = { ...prev }

    // Normalize numbers
    const num = (v) => {
        const n = parseFloat(v)
        return isFinite(n) ? n : undefined
    }

    // Map various field names to standard names
    const ltp = num(patch.ltp ?? patch.lp ?? patch.l)
    const prevClose = num(patch.c ?? patch.prev_close_price ?? patch.close ?? patch.pc)
    const chIn = num(patch.ch)
    const chpIn = num(patch.chp ?? patch.pc)
    const ask = num(patch.ask ?? patch.a)
    const bid = num(patch.bid ?? patch.b)
    const oi = num(patch.oi)
    const poi = num(patch.poi ?? patch.prev_oi)
    const vol = num(patch.vol ?? patch.volume ?? patch.socketVolume)
    const ch = num(patch.ch)
    const chp = num(patch.chp)

    if (typeof ltp !== 'undefined') out.ltp = ltp
    if (typeof prevClose !== 'undefined') out.prevClose = prevClose
    if (typeof ask !== 'undefined') out.ask = ask
    if (typeof bid !== 'undefined') out.bid = bid
    if (typeof oi !== 'undefined') out.oi = oi
    if (typeof poi !== 'undefined') out.poi = poi
    if (typeof vol !== 'undefined') out.vol = vol
    if (typeof chIn !== 'undefined') out.ch = chIn
    if (typeof chpIn !== 'undefined') out.chp = chpIn

    // Derive missing values
    if (typeof out.ch === 'undefined' && typeof out.ltp !== 'undefined' && typeof out.prevClose !== 'undefined') {
        out.ch = out.ltp - out.prevClose
    }
    if (typeof out.chp === 'undefined' && typeof out.ch !== 'undefined' && typeof out.prevClose !== 'undefined' && out.prevClose > 0) {
        out.chp = (out.ch / out.prevClose) * 100
    }

    lastState.value[token] = out
    return out
}

// Phase 1: Basic data fetching functions
async function setWaiting(tsym, exit) {
    const token = localStorage.getItem('ssdtoken')
    const windata = window.ssdreqdata?.data
    let opt

    if ((windata && windata[token] && windata[token].l) || (window.ssddetail && window.ssddetail[0] && window.ssddetail[0].token == token)) {
        opt = windata && windata[token] && windata[token].l ? windata[token].l : window.ssddetail[2]
        let sym = tsym.toUpperCase()

        // Parse symbol to get underlying symbol
        if (sym.split(':')[0].match(/^NFO$/)) {
            optionsStore.optionStockSymbol = sym
        } else {
            let matchval = sym.match(/(\d{1,2})[a-zA-Z]{3}(\d{2,4})?/g)
            if (matchval) {
                let scriptList = sym.split(matchval[0])

                if (scriptList[0].split(':')[1]?.match(/^NIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY 50'
                } else if (scriptList[0].split(':')[1]?.match(/^BANKNIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY BANK'
                } else if (scriptList[0].split(':')[1]?.match(/^FINNIFTY$/)) {
                    optionsStore.optionStockSymbol = 'NSE:NIFTY FIN SERVICE'
                } else if (scriptList[0].split(':')[0]?.match(/^NFO$/)) {
                    optionsStore.optionStockSymbol = `NSE:${scriptList[0].split(':')[1]}-EQ`
                } else {
                    optionsStore.optionStockSymbol = sym
                }
            } else {
                optionsStore.optionStockSymbol = sym
            }
        }

        let symbols = await getMasters(`${optionsStore.optionStockSymbol}`)
        if (symbols && opt && opt.opt_exp && opt.opt_exp.length > 0 && ((windata && windata[token] && windata[token].q) || window.ssddetail[0])) {
            optionsStore.optionStockSpot = 0
            optionsStore.lsexdfilter = 0
            // Match old code: Don't await optionchainMet, set loading state immediately (like old code line 1040-1043)
            optionchainMet(exit ? exit : null, opt, token)
            optionsStore.optionchainid = true
            optionsStore.coractloader = true
            optionsStore.coractdata = false
        } else {
            optionsStore.clearOption()
            optionsStore.optionStockSymbol = sym
        }
    } else if (opt && opt.opt_exp && opt.opt_exp.length === 0) {
        optionsStore.clearOption()
    } else {
        setTimeout(() => {
            setWaiting(tsym, exit)
        }, 100)
    }
}

async function optionchainMet(exit, windata, tokenis) {
    try {
        if (exit == 'exit') {
            optionsStore.coractloader = true
            optionsStore.coractdata = false
            optionsStore.optionchainid = false
            return
        }
        // Load column visibility settings from localStorage
        optionsStore.loadColumnSettings(authStore.uid)
        optionsStore.drawer = false

        // Initialize table style after loading settings
        nextTick(() => {
            simpleTablestyle()
        })

        optionsStore.chainCount = ''
        optionsStore.chainSpotdata = {}
        optionsStore.lsexd = []
        optionsStore.upcallSO = []
        optionsStore.upputSO = []
        optionsStore.dwncallSO = []
        optionsStore.dwnputSO = []

        let symbols = await getMasters(`${optionsStore.optionStockSymbol}`)
        if (symbols && symbols.length > 0) {
            optionsStore.exchange = optionsStore.optionStockSymbol.split(':')[0]
            optionsStore.scriptToken = symbols[0]

            const winssd = window.ssdreqdata?.data?.[tokenis] ? window.ssdreqdata.data[tokenis].i : window.ssddetail?.[3]
            const winqut = window.ssdreqdata?.data?.[tokenis] ? window.ssdreqdata.data[tokenis].q : window.ssddetail?.[0]

            if (winssd) {
                optionsStore.securityinfo = winssd
                optionsStore.opname = winssd.symname || ''
                optionsStore.opexch = winssd.exch || ''
                optionsStore.optoken = winssd.token || ''

                // Process expiry dates
                let o = []
                if (windata.opt_exp && Array.isArray(windata.opt_exp)) {
                    windata.opt_exp.forEach((i) => {
                        o.push({ ...i })
                    })
                    o.sort((a, b) => new Date(a.exd) - new Date(b.exd))
                    optionsStore.data1 = o
                    optionsStore.lsexd = []
                    optionsStore.tsym = []
                    for (let i = 0; i < o.length; i++) {
                        optionsStore.lsexd.push(o[i].exd)
                        optionsStore.tsym.push(o[i].tsym)
                    }
                    optionsStore.lsexdval = optionsStore.lsexd[0] || ''
                }

                optionsStore.chainCount = '10'

                // Get spot price
                let qu
                if (winqut && winqut.und_exch && winqut.und_tk) {
                    qu = await getQuotesdata(`${winqut.und_exch}|${winqut.und_tk}`)
                } else {
                    qu = winqut
                }

                if (qu) {
                    console.log('[Options] Spot price data:', qu)
                    optionsStore.subscriptionchainStocksList.push({
                        exch: qu.exch,
                        token: qu.token,
                        tsym: qu.tsym,
                    })
                    optionsStore.optionStockSymbolInfo = {
                        exch: qu.exch,
                        token: qu.token,
                        tsym: qu.tsym,
                    }
                    optionsStore.optionStockName = optionsStore.optionStockSymbolInfo.tsym || ''
                    optionsStore.optionStockSpot = qu.lp || 0
                    console.log('[Options] Spot price:', optionsStore.optionStockSpot)
                    console.log('[Options] Symbol info:', optionsStore.optionStockSymbolInfo)

                    // Match old code: call optionChainDate without await (it will set loading state internally)
                    optionChainDate()
                } else {
                    console.error('[Options] No quote data available')
                    optionsStore.coractloader = false
                    optionsStore.coractdata = false
                    appStore.showSnackbar(2, 'Unable to fetch spot price data')
                }
            } else {
                console.error('[Options] Symbol has no tradable futures or options')
                optionsStore.coractloader = false
                optionsStore.coractdata = false
                appStore.showSnackbar(2, 'The symbol has no tradable futures or options.')
            }
        } else {
            console.error('[Options] Missing security info or expiry data')
            optionsStore.coractloader = false
            optionsStore.coractdata = false
        }
    } catch (error) {
        console.error('[Options] Error in optionchainMet:', error)
        optionsStore.coractloader = false
        optionsStore.coractdata = false
        appStore.showSnackbar(2, `Error: ${error.message || 'Unknown error'}`)
    }
}

async function optionChainDate() {
    try {
        console.log('[Options] Starting optionChainDate...')
        console.log('[Options] Current expiry filter:', optionsStore.lsexdfilter)
        console.log('[Options] Available expiry dates:', optionsStore.lsexd)

        // Match old code: Reset state first (like old code line 1187-1193)
        // NOTE: Old code does NOT set coractloader = true here - it's already set in optionchainMet
        optionsStore.greekCount = 0
        optionsStore.daydiff = ''
        optionsStore.chainStocksList = []
        optionsStore.upcallSO = []
        optionsStore.dwncallSO = []
        optionsStore.upputSO = []
        optionsStore.dwnputSO = []
        optionsStore.chainSpotPrice = optionsStore.optionStockSpot

        // Match old code: Get lsexdval from filter index (like old code line 1195)
        optionsStore.lsexdval = optionsStore.lsexd[optionsStore.lsexdfilter] || ''
        const ccc = ['5', '10', '15', '30', '50']
        optionsStore.chainCount = ccc[optionsStore.ccfilter] || '10'

        console.log('[Options] Selected expiry:', optionsStore.lsexdval)
        console.log('[Options] Chain count:', optionsStore.chainCount)
        console.log('[Options] Data1 length:', optionsStore.data1?.length || 0)

        let result = optionsStore.data1?.find((item) => item.exd === optionsStore.lsexdval)

        // Match old code: Only check if lsexdval exists, not if result exists (like old code line 1199)
        if (optionsStore.lsexdval) {
            // Calculate days to expiry
            let fromdate = new Date(optionsStore.lsexdval)
            let fromdateof =
                (fromdate.getMonth() > 8 ? fromdate.getMonth() + 1 : '0' + (fromdate.getMonth() + 1)) +
                '/' +
                (fromdate.getDate() > 9 ? fromdate.getDate() : '0' + fromdate.getDate()) +
                '/' +
                fromdate.getFullYear()
            let todate = new Date()
            let todateof =
                (todate.getMonth() > 8 ? todate.getMonth() + 1 : '0' + (todate.getMonth() + 1)) +
                '/' +
                (todate.getDate() > 9 ? todate.getDate() : '0' + todate.getDate()) +
                '/' +
                todate.getFullYear()
            let d1 = new Date(todateof)
            let d2 = new Date(fromdateof)
            let diff = d2.getTime() - d1.getTime()
            let bfodaydiff = diff / (1000 * 60 * 60 * 24)
            optionsStore.daydiff = bfodaydiff + 1
        }

        // Match old code: Fetch options chain directly (like old code line 1211)
        // Note: Old code doesn't check if result exists before using it - we need result for API call
        if (!result) {
            console.error('[Options] Expiry date not found in data1:', optionsStore.lsexdval)
            console.error('[Options] Available data1:', optionsStore.data1)
            optionsStore.coractloader = false
            optionsStore.coractdata = false
            appStore.showSnackbar(2, `Expiry date ${optionsStore.lsexdval} not found`)
            return
        }

        const userid = sessionStorage.getItem('userid') || 'G'
        const usession = sessionStorage.getItem('msession') || 'G'
        optionsStore.userid = userid
        optionsStore.usession = usession

        const tsymEncoded = result.tsym.includes('&') ? result.tsym.replace('&', '%26') : result.tsym
        const query = `jData={"uid":"${userid}","exch":"${result.exch}","tsym":"${tsymEncoded}","cnt":"${optionsStore.chainCount}","strprc":"${optionsStore.optionStockSpot}"}&jKey=${usession}`

        console.log('[Options] Fetching options chain...')
        console.log('[Options] Query params:', {
            exch: result.exch,
            tsym: tsymEncoded,
            cnt: optionsStore.chainCount,
            strprc: optionsStore.optionStockSpot
        })

        let ocdata = null
        try {
            ocdata = await getOptionschain(query)
            console.log('[Options] API Response:', ocdata)
        } catch (error) {
            console.error('[Options] API Error:', error)
            optionsStore.coractloader = false
            optionsStore.coractdata = false
            appStore.showSnackbar(2, `Error fetching options chain: ${error.message || 'Unknown error'}`)
            return
        }

        if (!ocdata) {
            console.error('[Options] No data returned from API')
            optionsStore.coractloader = false
            optionsStore.coractdata = false
            appStore.showSnackbar(2, 'No data returned from options chain API')
            return
        }

        // Match old code: Check stat == 'Ok' (like old code line 1213)
        if (ocdata && ocdata.stat == 'Ok') {
            console.log('[Options] API Success - Processing data...')
            console.log('[Options] Values count:', ocdata.values?.length || 0)

            // Match old code: Set optionchain and chainStocksList directly (like old code line 1214-1215)
            optionsStore.optionchain = ocdata
            optionsStore.chainStocksList = ocdata.values || []
            optionsStore.subscriptionchainStocksList = ocdata.values || []

            const spot = Number(optionsStore.optionStockSpot)

            // Process option chain data
            // Add complement options (CE/PE pairs)
            optionsStore.chainStocksList.forEach((el) => {
                const complementType = el.optt === 'PE' ? 'CE' : 'PE'
                const exists = optionsStore.chainStocksList.some(
                    (item) => item.optt === complementType && Number(item.strprc) === Number(el.strprc)
                )
                if (!exists) {
                    optionsStore.chainStocksList.push({
                        exch: el.exch,
                        token: '',
                        tsym: '',
                        optt: complementType,
                        pp: el.pp,
                        ls: el.ls,
                        ti: el.ti,
                        strprc: el.strprc,
                    })
                }
            })

            // Sort by strike price (match old code line 1239)
            const myArray = [...optionsStore.chainStocksList].sort((a, b) => Number(a.strprc) - Number(b.strprc))

            // Match old code: Process OI data correctly (store raw OI in coi, format for display in oi)
            // OLD CODE DOES NOT SET DEFAULT "0.00" VALUES - it uses actual API values
            myArray.forEach((item) => {
                // Store raw OI in coi if available
                if (item.oi !== undefined && item.oi !== null && item.coi === undefined) {
                    item.coi = Number(item.oi)
                }
                // Format OI for display (in lakhs) if coi exists
                if (item.coi !== undefined && item.coi !== null) {
                    item.oi = (Number(item.coi) / 100000).toFixed(2)
                }
                // Calculate OI change if poi (prev OI) is available
                if (item.poi !== undefined && item.poi !== null && item.coi !== undefined) {
                    item.oich = ((Number(item.coi) - Number(item.poi)) / 100000).toFixed(2)
                }
                // Format volume if available (in lakhs)
                if (item.vol !== undefined && item.vol !== null && typeof item.vol === 'number') {
                    item.vol = (Number(item.vol) / 100000).toFixed(2)
                } else if (item.socketVolume !== undefined && item.socketVolume !== null) {
                    item.vol = (Number(item.socketVolume) / 100000).toFixed(2)
                }
                // Format other numeric fields
                if (item.ltp !== undefined && item.ltp !== null) {
                    item.ltp = Number(item.ltp) ? Number(item.ltp).toFixed(2) : item.ltp
                }
                if (item.ch !== undefined && item.ch !== null) {
                    item.ch = Number(item.ch) ? Number(item.ch).toFixed(2) : item.ch
                }
                if (item.chp !== undefined && item.chp !== null) {
                    item.chp = Number(item.chp) ? Number(item.chp).toFixed(2) : item.chp
                }
                if (item.bid !== undefined && item.bid !== null) {
                    item.bid = Number(item.bid) ? Number(item.bid).toFixed(2) : item.bid
                }
                if (item.ask !== undefined && item.ask !== null) {
                    item.ask = Number(item.ask) ? Number(item.ask).toFixed(2) : item.ask
                }
                // Set default bar color only if not set
                if (!item.bar) {
                    item.bar = 'rgba(0, 0, 0, 0.12)'
                }
            })

            // Separate calls and puts, above and below spot
            optionsStore.callsideopc = myArray.filter((item) => {
                if (item.optt === 'CE') {
                    if (spot > Number(item.strprc)) {
                        optionsStore.upcallSO.push({ ...item, p: '' })
                    } else {
                        optionsStore.dwncallSO.push({ ...item, p: '' })
                    }
                    return true
                }
                return false
            })

            optionsStore.putsideopc = myArray.filter((item) => {
                if (item.optt === 'PE') {
                    if (spot > Number(item.strprc)) {
                        optionsStore.upputSO.push({ ...item, p: '' })
                    } else {
                        optionsStore.dwnputSO.push({ ...item, p: '' })
                    }
                    return true
                }
                return false
            })

            // Match old code: Calculate max OI for progress bars from coi (raw OI)
            // Note: coi should already be set from the processing above

            // Match old code: Calculate max OI for progress bars (use coi - raw OI)
            if (optionsStore.callsideopc.length > 0) {
                const coiValues = optionsStore.callsideopc.map((o) => Number(o.coi || 0)).filter(v => v > 0)
                if (coiValues.length > 0) {
                    optionsStore.barCallsOi = Math.max(...coiValues)
                } else {
                    optionsStore.barCallsOi = null
                }
            } else {
                optionsStore.barCallsOi = null
            }
            if (optionsStore.putsideopc.length > 0) {
                const coiValues = optionsStore.putsideopc.map((o) => Number(o.coi || 0)).filter(v => v > 0)
                if (coiValues.length > 0) {
                    optionsStore.barPutsOi = Math.max(...coiValues)
                } else {
                    optionsStore.barPutsOi = null
                }
            } else {
                optionsStore.barPutsOi = null
            }

            // Calculate progress bar percentages for all options
            if (optionsStore.barCallsOi) {
                optionsStore.upcallSO.forEach((o) => {
                    if (o.coi) {
                        o.pro = (((o.coi - optionsStore.barCallsOi) / optionsStore.barCallsOi) * 100 + 100)?.toFixed(0)
                    }
                })
                optionsStore.dwncallSO.forEach((o) => {
                    if (o.coi) {
                        o.pro = (((o.coi - optionsStore.barCallsOi) / optionsStore.barCallsOi) * 100 + 100)?.toFixed(0)
                    }
                })
            }
            if (optionsStore.barPutsOi) {
                optionsStore.upputSO.forEach((o) => {
                    if (o.coi) {
                        o.pro = (((o.coi - optionsStore.barPutsOi) / optionsStore.barPutsOi) * 100 + 100)?.toFixed(0)
                    }
                })
                optionsStore.dwnputSO.forEach((o) => {
                    if (o.coi) {
                        o.pro = (((o.coi - optionsStore.barPutsOi) / optionsStore.barPutsOi) * 100 + 100)?.toFixed(0)
                    }
                })
            }

            // Calculate PCR
            optionsStore.calculatePCR()

            // Match old code: Scroll first, then positions, then WebSocket, then set state (like old code line 1265-1272)
            setTimeout(() => {
                scrollToChainSpot()
            }, 10)

            // Phase 5: Load position data if user is logged in
            if (authStore.uid) {
                try {
                    await setPositionbook()
                } catch (error) {
                    console.error('[Options] Error loading positions:', error)
                    // Don't block rendering if positions fail to load
                }
            }

            // Subscribe to WebSocket (match old code order)
            optionsStore.subscriptionchainStocksList.push(optionsStore.optionStockSymbolInfo)
            setWebsocket('sub', optionsStore.subscriptionchainStocksList, 'ssd')

            // Match old code: Set data loaded state LAST (like old code line 1271-1272)
            optionsStore.coractdata = true
            optionsStore.coractloader = false

            console.log('[Options] Data loaded successfully!')
            console.log('[Options] upcallSO count:', optionsStore.upcallSO.length)
            console.log('[Options] upputSO count:', optionsStore.upputSO.length)
            console.log('[Options] dwncallSO count:', optionsStore.dwncallSO.length)
            console.log('[Options] dwnputSO count:', optionsStore.dwnputSO.length)
        } else {
            // API returned error
            console.error('[Options] API Error:', ocdata?.stat, ocdata?.emsg)
            optionsStore.coractloader = false
            optionsStore.coractdata = false
            appStore.showSnackbar(2, ocdata?.emsg || 'Failed to fetch options chain')
        }
    } catch (error) {
        // Catch any unexpected errors
        console.error('[Options] Unexpected error in optionChainDate:', error)
        optionsStore.coractloader = false
        optionsStore.coractdata = false
        appStore.showSnackbar(2, `Unexpected error: ${error.message || 'Unknown error'}`)
    }
}

function setWebsocket(flow, data, is) {
    const event = new CustomEvent('web-scoketOn', {
        detail: { flow, data, is, page: 'stockSSD' },
    })
    window.dispatchEvent(event)
}

function scrollToChainSpot() {
    // Scroll to spot price row on load
    nextTick(() => {
        const spotRow = document.getElementById('opcenterview')
        if (spotRow) {
            spotRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    })
}

// Phase 3: Update table width and column count based on visible columns
function simpleTablestyle() {
    try {
        // Use the store's updateColumnVisibility action
        // This calculates opchtablehead, simtblwidth, and simtblscroll based on visible columns
        if (optionsStore && typeof optionsStore.updateColumnVisibility === 'function') {
            optionsStore.updateColumnVisibility()
        } else {
            console.error('[Options] updateColumnVisibility is not available')
            return
        }

        // Save settings to localStorage
        if (authStore && authStore.uid) {
            if (optionsStore && typeof optionsStore.saveColumnSettings === 'function') {
                optionsStore.saveColumnSettings(authStore.uid)
            }
        }
    } catch (error) {
        console.error('[Options] Error in simpleTablestyle:', error)
    }
}

function handleOptionSearch() {
    // Will open option search dialog
    window.dispatchEvent(
        new CustomEvent('option-search', {
            detail: optionsStore.optionStockSymbolInfo,
        })
    )
}

function setBaskorder(type) {
    window.dispatchEvent(
        new CustomEvent('bskwatch-event', {
            detail: { type, data: optionsStore.optionStockSymbolInfo },
        })
    )
}

// Event Handlers
function handleSSDEvent(event) {
    const detail = event.detail
    let type, token, exch, tsym

    // Handle both array and object formats
    if (Array.isArray(detail)) {
        ;[type, token, exch, tsym] = detail
    } else if (detail && typeof detail === 'object') {
        type = detail.type
        token = detail.token
        exch = detail.exch
        tsym = detail.tsym
    }

    if (token && exch && tsym) {
        optionsStore.optionStockSymbol = tsym
        setWebsocket('unsub-D', optionsStore.chainStocksList, 'ssd')
        optionsStore.clearOption(true)
        optionsStore.coractloader = true
        optionsStore.coractdata = false
        setWaiting(`${exch}:${tsym}`, 'exit')
    }
}

// Phase 4: WebSocket update handler
function handleWebSocketUpdate(event) {
    const detail = event.detail
    let data = null

    // Handle different event formats
    if (Array.isArray(detail) && detail.length >= 2) {
        const [wsData, page] = detail
        if (page === 'stockSSD' && wsData) {
            data = wsData
        }
    } else if (detail && typeof detail === 'object') {
        if (detail.page === 'stockSSD' || detail.token) {
            data = detail
        }
    }

    if (data && data.token) {
        optionChainDataParse(data)
    }
}

// Phase 4: Parse option chain WebSocket data
function optionChainDataParse(data) {
    const token = String(data.token)
    const tokenStr = token

    // Update spot price if this is the underlying symbol
    if (optionsStore.optionStockSymbolInfo && String(optionsStore.optionStockSymbolInfo.token) === tokenStr) {
        const merged = mergeTick(token, data)
        optionsStore.chainSpotdata = {
            ...optionsStore.chainSpotdata,
            lp: merged.ltp?.toFixed(2) || data.lp || '0.00',
            ch: merged.ch?.toFixed(2) || data.ch || '0.00',
            chp: merged.chp?.toFixed(2) || data.chp || '0.00',
        }
    }

    // Find option in all arrays
    let upci = optionsStore.upcallSO.findIndex((script) => String(script.token) === tokenStr)
    let uppi = optionsStore.upputSO.findIndex((script) => String(script.token) === tokenStr)
    let dwnci = optionsStore.dwncallSO.findIndex((script) => String(script.token) === tokenStr)
    let dwnpi = optionsStore.dwnputSO.findIndex((script) => String(script.token) === tokenStr)

    // Use mergeTick to merge data
    const merged = mergeTick(token, data)

    // Process updates for upcallSO (calls above spot)
    if (upci >= 0) {
        const option = optionsStore.upcallSO[upci]

        // Update option data
        if (typeof merged.ltp !== 'undefined') option.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ask !== 'undefined') option.ask = merged.ask.toFixed(2)
        if (typeof merged.bid !== 'undefined') option.bid = merged.bid.toFixed(2)
        if (typeof merged.ch !== 'undefined') option.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') option.chp = merged.chp.toFixed(2)

        // Update OI data
        if (typeof merged.oi !== 'undefined') {
            option.coi = merged.oi
            option.oi = (merged.oi / 100000).toFixed(2)
        }
        if (typeof merged.poi !== 'undefined' && typeof merged.oi !== 'undefined') {
            option.oich = ((merged.oi - merged.poi) / 100000).toFixed(2)
        }

        // Update progress bar percentage
        if (optionsStore.barCallsOi && typeof merged.oi !== 'undefined') {
            option.pro = (((merged.oi - optionsStore.barCallsOi) / optionsStore.barCallsOi) * 100 + 100)?.toFixed(0)
        }

        // Update volume
        if (typeof merged.vol !== 'undefined') {
            option.vol = (merged.vol / 100000)?.toFixed(2)
        }

        // Update bar color based on price change and OI change
        const ch = typeof merged.ch !== 'undefined' ? merged.ch : parseFloat(option.ch) || 0
        const oich = typeof option.oich !== 'undefined' ? parseFloat(option.oich) : 0
        option.bar = ch > 0 && oich > 0 ? '#43A833'
            : ch < 0 && oich > 0 ? '#F23645'
                : ch > 0 && oich < 0 ? '#ECF8F1'
                    : ch < 0 && oich < 0 ? '#ffcdcd90'
                        : 'rgba(0, 0, 0, 0.12)'

        // Update position data if exists
        if (option.p && option.ppp) {
            const p = option.ppp
            const ltp = typeof merged.ltp !== 'undefined' ? merged.ltp : parseFloat(option.ltp) || 0
            option.pmtm = ((ltp - Number(p.netavgprc)) * Number(p.netqty) + Number(p.crpnl)).toFixed(2)
            option.px = option.pmtm > 0 ? 'maingreen--text' : option.pmtm < 0 ? 'mainred--text' : 'white--text'
            option.pz = option.pmtm > 0 ? 'maingreen' : option.pmtm < 0 ? 'mainred' : 'rgba(0, 0, 0, 0.12)'
            option.icon = option.pmtm > 0 ? 'mdi-arrow-up-drop-circle' : option.pmtm < 0 ? 'mdi-arrow-down-drop-circle' : 'mdi-minus-circle'
        }

        // Update reactive array
        optionsStore.upcallSO[upci] = { ...optionsStore.upcallSO[upci], ...option }
        optionsStore.upcallSO = [...optionsStore.upcallSO]

        // Update DOM elements
        setOptionchainvalue('upcall', token, option)
    }
    // Process updates for upputSO (puts above spot)
    else if (uppi >= 0) {
        const option = optionsStore.upputSO[uppi]

        // Update option data
        if (typeof merged.ltp !== 'undefined') option.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ask !== 'undefined') option.ask = merged.ask.toFixed(2)
        if (typeof merged.bid !== 'undefined') option.bid = merged.bid.toFixed(2)
        if (typeof merged.ch !== 'undefined') option.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') option.chp = merged.chp.toFixed(2)

        // Update OI data
        if (typeof merged.oi !== 'undefined') {
            option.coi = merged.oi
            option.oi = (merged.oi / 100000).toFixed(2)
        }
        if (typeof merged.poi !== 'undefined' && typeof merged.oi !== 'undefined') {
            option.oich = ((merged.oi - merged.poi) / 100000).toFixed(2)
        }

        // Update progress bar percentage
        if (optionsStore.barPutsOi && typeof merged.oi !== 'undefined') {
            option.pro = (((merged.oi - optionsStore.barPutsOi) / optionsStore.barPutsOi) * 100 + 100)?.toFixed(0)
        }

        // Update volume
        if (typeof merged.vol !== 'undefined') {
            option.vol = (merged.vol / 100000)?.toFixed(2)
        }

        // Update bar color
        const ch = typeof merged.ch !== 'undefined' ? merged.ch : parseFloat(option.ch) || 0
        const oich = typeof option.oich !== 'undefined' ? parseFloat(option.oich) : 0
        option.bar = ch > 0 && oich > 0 ? '#43A833'
            : ch < 0 && oich > 0 ? '#F23645'
                : ch > 0 && oich < 0 ? '#ECF8F1'
                    : ch < 0 && oich < 0 ? '#ffcdcd90'
                        : 'rgba(0, 0, 0, 0.12)'

        // Update position data if exists
        if (option.p && option.ppp) {
            const pr = option.ppp
            const ltp = typeof merged.ltp !== 'undefined' ? merged.ltp : parseFloat(option.ltp) || 0
            option.pmtm = ((ltp - Number(pr.netavgprc)) * Number(pr.netqty) + Number(pr.crpnl)).toFixed(2)
            option.px = option.pmtm > 0 ? 'maingreen--text' : option.pmtm < 0 ? 'mainred--text' : 'white--text'
            option.pz = option.pmtm > 0 ? 'maingreen' : option.pmtm < 0 ? 'mainred' : 'rgba(0, 0, 0, 0.12)'
            option.icon = option.pmtm > 0 ? 'mdi-arrow-up-drop-circle' : option.pmtm < 0 ? 'mdi-arrow-down-drop-circle' : 'mdi-minus-circle'
        }

        // Update reactive array
        optionsStore.upputSO[uppi] = { ...optionsStore.upputSO[uppi], ...option }
        optionsStore.upputSO = [...optionsStore.upputSO]

        // Update DOM elements
        setOptionchainvalue('upput', token, option)
    }
    // Process updates for dwncallSO (calls below spot)
    else if (dwnci >= 0) {
        const option = optionsStore.dwncallSO[dwnci]

        // Update option data
        if (typeof merged.ltp !== 'undefined') option.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ask !== 'undefined') option.ask = merged.ask.toFixed(2)
        if (typeof merged.bid !== 'undefined') option.bid = merged.bid.toFixed(2)
        if (typeof merged.ch !== 'undefined') option.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') option.chp = merged.chp.toFixed(2)

        // Update OI data
        if (typeof merged.oi !== 'undefined') {
            option.coi = merged.oi
            option.oi = (merged.oi / 100000).toFixed(2)
        }
        if (typeof merged.poi !== 'undefined' && typeof merged.oi !== 'undefined') {
            option.oich = ((merged.oi - merged.poi) / 100000).toFixed(2)
        }

        // Update progress bar percentage
        if (optionsStore.barCallsOi && typeof merged.oi !== 'undefined') {
            option.pro = (((merged.oi - optionsStore.barCallsOi) / optionsStore.barCallsOi) * 100 + 100)?.toFixed(0)
        }

        // Update volume
        if (typeof merged.vol !== 'undefined') {
            option.vol = (merged.vol / 100000)?.toFixed(2)
        }

        // Update bar color
        const ch = typeof merged.ch !== 'undefined' ? merged.ch : parseFloat(option.ch) || 0
        const oich = typeof option.oich !== 'undefined' ? parseFloat(option.oich) : 0
        option.bar = ch > 0 && oich > 0 ? '#43A833'
            : ch < 0 && oich > 0 ? '#F23645'
                : ch > 0 && oich < 0 ? '#ECF8F1'
                    : ch < 0 && oich < 0 ? '#ffcdcd90'
                        : 'rgba(0, 0, 0, 0.12)'

        // Update position data if exists
        if (option.p && option.ppp) {
            const po = option.ppp
            const ltp = typeof merged.ltp !== 'undefined' ? merged.ltp : parseFloat(option.ltp) || 0
            option.pmtm = ((ltp - Number(po.netavgprc)) * Number(po.netqty) + Number(po.crpnl)).toFixed(2)
            option.px = option.pmtm > 0 ? 'maingreen--text' : option.pmtm < 0 ? 'mainred--text' : 'white--text'
            option.pz = option.pmtm > 0 ? 'maingreen' : option.pmtm < 0 ? 'mainred' : 'rgba(0, 0, 0, 0.12)'
            option.icon = option.pmtm > 0 ? 'mdi-arrow-up-drop-circle' : option.pmtm < 0 ? 'mdi-arrow-down-drop-circle' : 'mdi-minus-circle'
        }

        // Update reactive array
        optionsStore.dwncallSO[dwnci] = { ...optionsStore.dwncallSO[dwnci], ...option }
        optionsStore.dwncallSO = [...optionsStore.dwncallSO]

        // Update DOM elements
        setOptionchainvalue('dwncall', token, option)
    }
    // Process updates for dwnputSO (puts below spot)
    else if (dwnpi >= 0) {
        const option = optionsStore.dwnputSO[dwnpi]

        // Update option data
        if (typeof merged.ltp !== 'undefined') option.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ask !== 'undefined') option.ask = merged.ask.toFixed(2)
        if (typeof merged.bid !== 'undefined') option.bid = merged.bid.toFixed(2)
        if (typeof merged.ch !== 'undefined') option.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') option.chp = merged.chp.toFixed(2)

        // Update OI data
        if (typeof merged.oi !== 'undefined') {
            option.coi = merged.oi
            option.oi = (merged.oi / 100000).toFixed(2)
        }
        if (typeof merged.poi !== 'undefined' && typeof merged.oi !== 'undefined') {
            option.oich = ((merged.oi - merged.poi) / 100000).toFixed(2)
        }

        // Update progress bar percentage
        if (optionsStore.barPutsOi && typeof merged.oi !== 'undefined') {
            option.pro = (((merged.oi - optionsStore.barPutsOi) / optionsStore.barPutsOi) * 100 + 100)?.toFixed(0)
        }

        // Update volume
        if (typeof merged.vol !== 'undefined') {
            option.vol = (merged.vol / 100000)?.toFixed(2)
        }

        // Update bar color
        const ch = typeof merged.ch !== 'undefined' ? merged.ch : parseFloat(option.ch) || 0
        const oich = typeof option.oich !== 'undefined' ? parseFloat(option.oich) : 0
        option.bar = ch > 0 && oich > 0 ? '#43A833'
            : ch < 0 && oich > 0 ? '#F23645'
                : ch > 0 && oich < 0 ? '#ECF8F1'
                    : ch < 0 && oich < 0 ? '#ffcdcd90'
                        : 'rgba(0, 0, 0, 0.12)'

        // Update position data if exists
        if (option.p && option.ppp) {
            const pt = option.ppp
            const ltp = typeof merged.ltp !== 'undefined' ? merged.ltp : parseFloat(option.ltp) || 0
            option.pmtm = ((ltp - Number(pt.netavgprc)) * Number(pt.netqty) + Number(pt.crpnl)).toFixed(2)
            option.px = option.pmtm > 0 ? 'maingreen--text' : option.pmtm < 0 ? 'mainred--text' : 'white--text'
            option.pz = option.pmtm > 0 ? 'maingreen' : option.pmtm < 0 ? 'mainred' : 'rgba(0, 0, 0, 0.12)'
            option.icon = option.pmtm > 0 ? 'mdi-arrow-up-drop-circle' : option.pmtm < 0 ? 'mdi-arrow-down-drop-circle' : 'mdi-minus-circle'
        }

        // Update reactive array
        optionsStore.dwnputSO[dwnpi] = { ...optionsStore.dwnputSO[dwnpi], ...option }
        optionsStore.dwnputSO = [...optionsStore.dwnputSO]

        // Update DOM elements
        setOptionchainvalue('dwnput', token, option)
    }

    // Update max OI for progress bars
    if (optionsStore.callsideopc.length > 0) {
        const maxCoi = Math.max(...optionsStore.callsideopc.map((o) => Number(o.coi || 0)))
        if (maxCoi > 0) {
            optionsStore.barCallsOi = maxCoi
        }
    }
    if (optionsStore.putsideopc.length > 0) {
        const maxPoi = Math.max(...optionsStore.putsideopc.map((o) => Number(o.coi || 0)))
        if (maxPoi > 0) {
            optionsStore.barPutsOi = maxPoi
        }
    }

    // Update PCR ratios
    const oitotalupcal = optionsStore.upcallSO.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const oitotaldowncal = optionsStore.dwncallSO.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const pcrcall = oitotalupcal + oitotaldowncal

    const oitotalupput = optionsStore.upputSO.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const oitotaldownput = optionsStore.dwnputSO.reduce((v1, v2) => v1 + parseFloat(v2.oi || 0), 0)
    const pcrput = oitotalupput + oitotaldownput

    if (pcrcall > 0) {
        optionsStore.pcrRatio = Number(pcrput / pcrcall).toFixed(2)
    } else {
        optionsStore.pcrRatio = 0.0
    }
    optionsStore.pcrcallRatio = Number(pcrcall).toFixed(2)
    optionsStore.pcrputRatio = Number(pcrput).toFixed(2)

    // Update Greeks if columns are visible
    if (optionsStore.ivcheckbox || optionsStore.vagacheckbox || optionsStore.thetacheckbox || optionsStore.gamacheckbox || optionsStore.deltacheckbox) {
        if (dwnci >= 0 && optionsStore.dwncallSO[dwnci] && !('IV' in optionsStore.dwncallSO[dwnci])) {
            getGreekValues('dwncallSO', optionsStore.dwncallSO, dwnci)
        }
        if (dwnpi >= 0 && optionsStore.dwnputSO[dwnpi] && !('IV' in optionsStore.dwnputSO[dwnpi])) {
            getGreekValues('dwnputSO', optionsStore.dwnputSO, dwnpi)
        }
        if (upci >= 0 && optionsStore.upcallSO[upci] && !('IV' in optionsStore.upcallSO[upci])) {
            getGreekValues('upcallSO', optionsStore.upcallSO, upci)
        }
        if (uppi >= 0 && optionsStore.upputSO[uppi] && !('IV' in optionsStore.upputSO[uppi])) {
            getGreekValues('upputSO', optionsStore.upputSO, uppi)
        }
    }
}

// Phase 4: Update DOM elements directly for performance
function setOptionchainvalue(k, t, d) {
    // k: prefix (upcall, upput, dwncall, dwnput)
    // t: token
    // d: data object
    const token = String(t)

    const tag = document.getElementById(`${k}${token}ltp`)
    if (tag) {
        // Update LTP
        const ltpTag = document.getElementById(`${k}${token}ltp`)
        if (ltpTag) {
            ltpTag.innerHTML = d.ltp || '0.00'
        }

        // Update CH
        const chTag = document.getElementById(`${k}${token}ch`)
        if (chTag) {
            chTag.innerHTML = d.ch || '0.00'
        }

        // Update CHP
        const chpTag = document.getElementById(`${k}${token}chp`)
        if (chpTag) {
            chpTag.innerHTML = ` (${d.chp || '0.00'}%)`
        }

        // Update color for CH
        const chpclrTag = document.getElementById(`${k}${token}chpclr`)
        if (chpclrTag) {
            const ch = parseFloat(d.ch) || 0
            chpclrTag.className = ch > 0 ? 'optiondatasty maingreen--text' : ch < 0 ? 'optiondatasty mainred--text' : 'optiondatasty'
            chpclrTag.style.color = ch > 0 ? '#43A833' : ch < 0 ? '#F23645' : ''
        }

        // Update OI
        const oiTag = document.getElementById(`${k}${token}oi`)
        if (oiTag) {
            oiTag.innerHTML = d.oi || '0.00'
        }

        // Update OI Change
        const oichTag = document.getElementById(`${k}${token}oich`)
        if (oichTag) {
            oichTag.innerHTML = ` (${d.oich || '0.00'})`
        }

        // Update color for OI Change
        const oiclrTag = document.getElementById(`${k}${token}oiclr`)
        if (oiclrTag) {
            const oich = parseFloat(d.oich) || 0
            oiclrTag.style.color = oich > 0 ? '#43A833' : oich < 0 ? '#F23645' : 'none'
        }

        // Update VOL
        const volTag = document.getElementById(`${k}${token}vol`)
        if (volTag) {
            volTag.innerHTML = d.vol || '0.00'
        }

        // Update progress bar width
        const proTag = document.getElementById(`${k}${token}pro`)
        if (proTag && d.pro) {
            proTag.style.setProperty('--my-width-var', `${d.pro}%`)
        }

        // Update bar color
        const barTag = document.getElementById(`${k}${token}bar`)
        if (barTag && d.bar) {
            const prop = k === 'upput' || k === 'dwnput' ? '--my-rgtbrdclr-var' : '--my-lftbrdclr-var'
            barTag.style.setProperty(prop, d.bar)
        }
    }

    // Update BID
    const bidTag = document.getElementById(`${k}${token}bid`)
    if (bidTag) {
        bidTag.innerHTML = d.bid || '0.00'
    }

    // Update ASK
    const askTag = document.getElementById(`${k}${token}ask`)
    if (askTag) {
        askTag.innerHTML = d.ask || '0.00'
    }
}

// Phase 5: Greeks calculation
async function getGreekValues(section, optionData, index) {
    // Limit concurrent Greeks calculations
    if (optionsStore.greekCount >= parseInt(optionsStore.chainCount) * 4) {
        return
    }

    optionsStore.greekCount += 1

    const option = optionData[index]
    if (!option) return

    try {
        const greek = await getGreekoptions(
            JSON.stringify({
                spotPrice: optionsStore.optionStockSpot,
                expiryDay: parseInt(optionsStore.daydiff),
                OPTIONS: option,
            })
        )

        if (greek && 'GreekValues' in greek && greek.GreekValues.length > 0) {
            const greekValue = greek.GreekValues[0]

            // Determine which array to update
            let update = null
            if (section === 'dwncallSO') {
                update = optionsStore.dwncallSO[index]
            } else if (section === 'dwnputSO') {
                update = optionsStore.dwnputSO[index]
            } else if (section === 'upcallSO') {
                update = optionsStore.upcallSO[index]
            } else if (section === 'upputSO') {
                update = optionsStore.upputSO[index]
            }

            if (update) {
                // Update Greeks values
                update.IV = Number(greekValue.IV) ? Number(greekValue.IV).toFixed(2) : greekValue.IV
                update.Rho = greekValue.Rho
                update.delta = Number(greekValue.delta) ? Number(greekValue.delta).toFixed(4) : greekValue.delta
                update.gamma = Number(greekValue.gamma) ? Number(greekValue.gamma).toFixed(4) : greekValue.gamma
                update.theta = Number(greekValue.theta) ? Number(greekValue.theta).toFixed(4) : greekValue.theta
                update.vega = Number(greekValue.vega) ? Number(greekValue.vega).toFixed(4) : greekValue.vega

                // Update reactive array using spread operator
                if (section === 'dwncallSO') {
                    optionsStore.dwncallSO[index] = { ...optionsStore.dwncallSO[index], ...update }
                    optionsStore.dwncallSO = [...optionsStore.dwncallSO]
                } else if (section === 'dwnputSO') {
                    optionsStore.dwnputSO[index] = { ...optionsStore.dwnputSO[index], ...update }
                    optionsStore.dwnputSO = [...optionsStore.dwnputSO]
                } else if (section === 'upcallSO') {
                    optionsStore.upcallSO[index] = { ...optionsStore.upcallSO[index], ...update }
                    optionsStore.upcallSO = [...optionsStore.upcallSO]
                } else if (section === 'upputSO') {
                    optionsStore.upputSO[index] = { ...optionsStore.upputSO[index], ...update }
                    optionsStore.upputSO = [...optionsStore.upputSO]
                }
            }
        }
    } catch (error) {
        console.error('Error calculating Greeks:', error)
    } finally {
        // Decrement counter on completion (even if error)
        // Note: This might need adjustment based on actual requirements
    }
}

// Phase 5: Set position book (fetch positions)
async function setPositionbook() {
    if (!optionsStore.positions || !optionsStore.positions.o) {
        const data = await getMPosotion()
        optionsStore.positions = data
    }
    getPositionbook()
}

// Phase 5: Get position book (integrate positions with options chain)
async function getPositionbook() {
    const data = optionsStore.positions
    optionsStore.positiondata = []

    if (data && data.o && data.o.length > 0) {
        optionsStore.positiondata = [...data.o]

        // Match positions to options in chain
        for (let i = 0; i < optionsStore.positiondata.length; i++) {
            const position = optionsStore.positiondata[i]

            // Only process option positions (OPTIDX, OPTFUT, or NFO exchange)
            if (position && (['OPTIDX', 'OPTFUT'].includes(position.instname) || position.exch === 'NFO') && Number(position.netqty) !== 0) {
                // Find matching option in all arrays
                const uc = optionsStore.upcallSO.findIndex((x) => x.tsym === position.tsym)
                const up = optionsStore.upputSO.findIndex((x) => x.tsym === position.tsym)
                const dc = optionsStore.dwncallSO.findIndex((x) => x.tsym === position.tsym)
                const dp = optionsStore.dwnputSO.findIndex((x) => x.tsym === position.tsym)

                // Position data to attach
                const positionData = {
                    p: true,
                    ppp: {
                        netqty: position.netqty,
                        netavgprc: position.netavgprc || position.avgprc,
                        avgprc: position.avgprc,
                        crpnl: position.crpnl || 0,
                    },
                    pmtm: ((Number(position.ltp || 0) - Number(position.netavgprc || position.avgprc || 0)) * Number(position.netqty) + Number(position.crpnl || 0)).toFixed(2),
                    px: '',
                    pz: '',
                    icon: '',
                    qtyp: Number(position.netqty),
                    qtyclr: Number(position.netqty) > 0 ? 'maingreen--text' : 'mainred--text',
                }

                // Calculate MTM and colors
                const pmtm = parseFloat(positionData.pmtm)
                positionData.px = pmtm > 0 ? 'maingreen--text' : pmtm < 0 ? 'mainred--text' : 'white--text'
                positionData.pz = pmtm > 0 ? 'maingreen' : pmtm < 0 ? 'mainred' : 'rgba(0, 0, 0, 0.12)'
                positionData.icon = pmtm > 0 ? 'mdi-arrow-up-drop-circle' : pmtm < 0 ? 'mdi-arrow-down-drop-circle' : 'mdi-minus-circle'

                // Attach position data to matching options
                if (uc >= 0) {
                    optionsStore.upcallSO[uc] = { ...optionsStore.upcallSO[uc], ...positionData }
                    optionsStore.upcallSO = [...optionsStore.upcallSO]
                }
                if (up >= 0) {
                    optionsStore.upputSO[up] = { ...optionsStore.upputSO[up], ...positionData }
                    optionsStore.upputSO = [...optionsStore.upputSO]
                }
                if (dc >= 0) {
                    optionsStore.dwncallSO[dc] = { ...optionsStore.dwncallSO[dc], ...positionData }
                    optionsStore.dwncallSO = [...optionsStore.dwncallSO]
                }
                if (dp >= 0) {
                    optionsStore.dwnputSO[dp] = { ...optionsStore.dwnputSO[dp], ...positionData }
                    optionsStore.dwnputSO = [...optionsStore.dwnputSO]
                }
            }
        }
    }
}

// Phase 2: Helper functions for hover actions
function getBasketIcon() {
    // Match old code: $vuetify.theme.dark - use Vuetify 3 theme
    // Match old code: require(`@/assets/usermenu/${$vuetify.theme.dark ? '9d' : '9'}.svg`)
    return theme.current.value.dark ? basketIconDark : basketIconLight
}

function chartOption(script, putArray) {
    // Match old code: chartOption logic exactly
    let chart
    if (typeof putArray === 'object' && putArray) {
        chart = putArray.find((item) => item.strprc === script.strprc)
    } else {
        chart = script
    }

    // Match old code: eventBus.$emit('ssd-event', 'chart', chart.token, chart.exch, chart.tsym)
    // StocksDetails expects both array and object formats - send as array for compatibility
    if (chart && chart.token) {
        window.dispatchEvent(new CustomEvent('ssd-event', {
            detail: ['chart', chart.token, chart.exch, chart.tsym]
        }))
    }
}

function depthOption(script, putArray) {
    // Match old code: depthOption logic exactly
    let chart
    if (typeof putArray === 'object' && putArray) {
        chart = putArray.find((item) => item.strprc === script.strprc)
    } else {
        chart = script
    }

    // Match old code: eventBus.$emit('ssd-event', 'depth', chart.token, chart.exch, chart.tsym)
    // StocksDetails expects both array and object formats - send as array for compatibility
    if (chart && chart.token) {
        window.dispatchEvent(new CustomEvent('ssd-event', {
            detail: ['depth', chart.token, chart.exch, chart.tsym]
        }))
    }
}

function basketOption(script, putArray) {
    // Match old code: basketOption logic exactly
    let bak
    if (typeof putArray === 'object' && putArray) {
        bak = putArray.find((item) => item.strprc === script.strprc)
    } else {
        bak = script
    }

    if (bak) {
        bak.buySell = 'BUY'
        bak.expdate = optionsStore.lsexd
        bak.ordvai = 'MKT'
        bak.ordlot = 1
        bak.ordprc = Number(bak.ltp || 0)
        bak.checkbox = true

        // Match old code: eventBus.$emit('bskwatch-event', 'add', bak, this.optionchain)
        window.dispatchEvent(new CustomEvent('bskwatch-event', {
            detail: {
                type: 'add',
                data: bak,
                optionchain: optionsStore.optionchain
            }
        }))
    }
}

function addOption(script, putArray) {
    // Match old code: addOption logic exactly
    let Add
    if (typeof putArray === 'object' && putArray) {
        Add = putArray.find((item) => item.strprc === script.strprc)
    } else {
        Add = script
    }

    // Match old code: eventBus.$emit('addscript-wl', Add)
    if (Add) {
        window.dispatchEvent(new CustomEvent('addscript-wl', {
            detail: Add
        }))
    }
}

function buyOption(script, putArray) {
    // Match old code: buyOption logic exactly
    let buy
    if (typeof putArray === 'object' && putArray) {
        buy = putArray.find((item) => item.strprc === script.strprc)
    } else {
        buy = script
    }

    // Match old code: eventBus.$emit('menudialog', 'order', buy.token, buy.exch, buy.tsym, 'b')
    // StockOrderWindow expects object format: { type, token, exch, tsym, trantype }
    if (buy && buy.token) {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: {
                type: 'order',
                token: buy.token,
                exch: buy.exch,
                tsym: buy.tsym,
                trantype: 'b'
            }
        }))
    }
}

function sellOption(script, putArray) {
    // Match old code: sellOption logic exactly
    let sell
    if (typeof putArray === 'object' && putArray) {
        sell = putArray.find((item) => item.strprc === script.strprc)
    } else {
        sell = script
    }

    // Match old code: eventBus.$emit('menudialog', 'order', sell.token, sell.exch, sell.tsym, 's')
    // StockOrderWindow expects object format: { type, token, exch, tsym, trantype }
    if (sell && sell.token) {
        window.dispatchEvent(new CustomEvent('menudialog', {
            detail: {
                type: 'order',
                token: sell.token,
                exch: sell.exch,
                tsym: sell.tsym,
                trantype: 's'
            }
        }))
    }
}

// Lifecycle
onMounted(() => {
    // Initialize user session
    optionsStore.userid = sessionStorage.getItem('userid') || ''
    optionsStore.usession = sessionStorage.getItem('msession') || ''

    // Load symbol from localStorage
    let local = localStorage.getItem('ssdtsym')
    if (local && local.includes(':')) {
        setWaiting(local)
    }

    // Listen for ssd-event
    window.addEventListener('ssd-event', handleSSDEvent)

    // Listen for WebSocket updates
    window.addEventListener('web-scoketConn', handleWebSocketUpdate)

    // Phase 5: Listen for orderbook updates (for position data)
    window.addEventListener('orderbook-update', (event) => {
        const book = event.detail
        if (book === 'port-order') {
            setPositionbook()
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('ssd-event', handleSSDEvent)
    window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
})
</script>

<style scoped>
.opdatas {
    padding: 0 1px !important;
}

.opstrprcborder {
    border-left: thin solid rgba(0, 0, 0, 0.12);
    border-right: thin solid rgba(0, 0, 0, 0.12);
    padding: 0 1px;
}

.optionheadsty,
.optionhoversty {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #666666 !important;
}

.optiondatasty {
    font-size: 12px !important;
    font-weight: 400 !important;
    color: #000 !important;
}

.optionchsty {
    font-size: 9px !important;
    color: inherit;
}

/* Phase 3: Settings drawer info styles */
.infobarstatus {
    width: 4px !important;
    height: 32px !important;
}

.infoprogress {
    height: 32px !important;
    width: 80px !important;
}

.opdatacalluphov {
    position: relative !important;
}

.no-scroll {
    overflow: hidden;
}

.pos-rlt {
    position: relative;
}

.pos-abs {
    position: absolute;
}

.pos-cent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.fs-14 {
    font-size: 14px;
}

.lh-24 {
    line-height: 24px;
}

.fs-12 {
    font-size: 12px;
}

.maintext--text {
    color: #000 !important;
}

.subtext--text {
    color: #666666 !important;
}

.tvcharts .v-table>.v-table__wrapper>table {
    width: var(--my-simtblwidth-var) !important;
    overflow-x: var(--my-simtblscroll-var);
}

/* Ensure table wrapper uses CSS variables correctly */
.tvcharts .v-table {
    --my-simtblwidth-var: var(--my-simtblwidth-var);
    --my-simtblscroll-var: var(--my-simtblscroll-var);
}

/* Phase 2: Progress bars and position badges */
.lftbarstatus {
    width: 4px;
    height: 33px;
    position: absolute;
    background-color: var(--my-lftbrdclr-var);
    margin-top: -5px;
    margin-left: -16px;
    z-index: 1;
}

.rgtbarstatus {
    right: 0;
    width: 4px;
    height: 33px;
    position: absolute;
    background-color: var(--my-rgtbrdclr-var);
    margin-top: -27px;
    z-index: 1;
}

.badghlpos {
    top: 8px !important;
    left: 6px !important;
}

.badghrpos {
    top: 8px !important;
    right: 6px !important;
}

.optionbartext {
    position: absolute;
    z-index: 1;
    margin-top: 2px;
    margin-left: -34px;
}

.callprogress,
.putprogress {
    width: 100%;
    height: 24px;
    position: relative;
    bottom: -1px;
}

.callprogress:after,
.putprogress:after {
    content: "\A";
    position: absolute;
    background: #1e53e530;
    top: 0;
    bottom: 0;
    width: var(--my-width-var);
}

.callprogress:after {
    left: 0;
}

.putprogress:after {
    right: 0;
}

/* Phase 2: Hover action buttons */
tr.opdatacallupbtn {
    position: absolute !important;
    z-index: 3;
}

.lfttrbtn {
    margin-top: -20px;
    display: none !important;
}

.dwnrghtrbtn {
    margin-top: -2px;
    margin-left: 72px;
    display: none !important;
    z-index: 1;
}

.uprghtrbtn {
    margin-top: -20px;
    margin-left: 72px;
    display: none !important;
    z-index: 1;
}

.totrhover:hover .lfttrbtn,
.totrhover:hover .dwnrghtrbtn,
.totrhover:hover .uprghtrbtn {
    display: flex !important;
}

.newhoverbtn {
    margin-right: 4px;
    height: 22px;
    border-radius: 4px;
}

.newhoverbtnsize {
    padding: 2px 12px;
}

.cursor-p {
    cursor: pointer;
}

tbody tr:hover {
    background-color: transparent !important;
}

/* Improved toolbar styling */
.tool-sty {
    min-height: 56px !important;
}

/* Improved table header styling */
:deep(.v-table thead) {
    background-color: #F5F5F5 !important;
}

:deep(.v-table thead th) {
    border-bottom: 1px solid #EBEEF0 !important;
    padding: 8px 4px !important;
}

:deep(.v-table tbody th) {
    padding: 4px !important;
    border-bottom: 1px solid #F5F5F5 !important;
}

/* Better spacing for table cells */
:deep(.v-table td),
:deep(.v-table th) {
    white-space: nowrap;
}
</style>
