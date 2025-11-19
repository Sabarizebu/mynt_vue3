<template>
  <div>
    <div class="overflow-y-auto h91vh ss-cust-scroll overflow-x-hidden" @scroll.passive="handleScroll">
      <div class="body-part">
        <div class="mb-6 pos-rlt default-tab">
          <v-toolbar class="d-none d-md-block px-0 pos-stk z-i3" style="top: 0px" flat density="compact" color="cardbg">
            <v-tabs @update:model-value="setbodyTab" fixed color="maintext" v-model="bodytab" show-arrows
              density="compact">
              <v-tab density="compact" v-for="(t, index) in dashitems" :key="index"
                class="text-none text-start min-w-fit">
                <span class="text-center tab-txt">{{ t.txt }}</span></v-tab>
              <v-tabs-slider color="maintext"></v-tabs-slider>
            </v-tabs>
            <v-spacer></v-spacer>
            <!-- {{typeof sessstoreddata}} -->
            <v-btn v-if="uid && sessstoreddata.Purchase_Allowed == 'Y'" @click="putMForder('buy')" size="small"
              class="text-none font-weight-bold elevation-0 rounded-pill mr-2 maingreen--text fs-14"
              style="background-color: #ECF8F1 !important;color: #43A833 !important;">Buy</v-btn>
            <v-btn v-if="uid && sessstoreddata.SIP_FLAG == 'Y'" @click="putMForder('sip')" size="small"
              class="text-none font-weight-bold elevation-0 rounded-pill mr-2 primary--text fs-14" color="secbg"
              style="background-color: #F6F6F6 !important">SIP</v-btn>
          </v-toolbar>
          <v-divider class="mb-md-0 mb-3 d-none d-md-flex pos-stk z-i3" style="top: 48px"></v-divider>
          <div>
            <v-card :loading="mainloader" id="overview" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
              <v-card color="secbg" class="elevation-0 rounded-0 py-3 pb-1 px-md-2 px-3">
                <v-row no-gutters>
                  <v-col cols="12" md="8" class="pb-0">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-avatar color="#fbfbfb" size="56" class="my-0 mr-0">
                          <img v-if="imageicon" :src="imageicon" @error="imageLoadError" :alt="imageicon"
                            width="100%" />
                          <span class="headline font-weight-bold" v-else>{{ menudata.fundName ? menudata.fundName : "-"
                            }}</span>
                        </v-avatar>
                      </template>
                      <v-list-item-title :class="menudata ? 'maintext--text' : 'txt-trn'"
                        class="fs-18 font-weight-bold mb-0 text-capitalize lh-14"> {{ menudata ? menudata.fundName :
                          "abcd"
                        }}</v-list-item-title>
                      <div class="d-flex align-center mt-1">
                        <v-chip v-if="sessstoreddata && sessstoreddata.Type" size="x-small" variant="flat" class="ml-2"
                          style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;">
                          <span class=" fs-10">
                            {{ sessstoreddata.Type }}
                          </span>
                        </v-chip>
                        <v-chip v-if="sessstoreddata && sessstoreddata.SubType" size="x-small" variant="flat"
                          class="ml-2"
                          style="border-radius: 5px; background-color: #ffffff !important; color: #666666 !important;">
                          <span class=" fs-10">
                            {{ sessstoreddata.SubType }}
                          </span>
                        </v-chip>
                      </div>
                    </v-list-item>
                  </v-col>
                  <v-col cols="12" md="4" class="text-md-right text-left pt-0 pt-md-5 pb-2 pl-4 pl-md-3">
                    <div class="px-0 px-md-4 d-flex justify-end">
                      <div class="text-left mb-3">
                        <div class="fs-12 subtext--text text-uppercase mb-1">NAV <span v-if="menudata.navDate">({{
                          menudata.navDate
                            }})</span></div>
                        <div class="fs-14 maintext--text text-right font-weight-bold">{{ Number(menudata.currentNAV) ?
                          `₹
                          ${Number(menudata.currentNAV).toFixed(2)}` : "0.00" }}</div>
                      </div>
                      <div class="text-left mb-3 ml-10">
                        <div class="fs-12 subtext--text text-uppercase mb-1">5yr CAGR</div>
                        <div class="fs-14 font-weight-bold text-right"
                          :style="{ color: menudata['5Year'] > 0 ? '#43A833' : menudata['5Year'] < 0 ? '#F23645' : '#666666' }">
                          <span :class="!uid ? 'blur-text' : ''">{{ menudata["5Year"] ?
                            `${Number(menudata["5Year"]).toFixed(2)}%` :
                            "0.00" }}</span>
                        </div>
                      </div>
                      <div class="text-left mb-3 ml-10">
                        <div class="fs-12 subtext--text text-uppercase mb-1">AMU (Cr.)</div>
                        <div class="fs-14 maintext--text font-weight-bold text-right">{{ menudata.params ?
                          `${(Number(menudata.AUM) /
                            10000000).toFixed(2)}` : "0.00" }}</div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <div class="px-md-6 px-4 pt-4 pt-md-5">
                <v-row>
                  <v-col cols="12" md="10">
                    <p class="font-weight-bold title mb-1 fs-20 text-capitalize">{{ menudata ? menudata.fundName : "" }}
                      - {{
                        menudata.category ? menudata.category : "" }}</p>
                    <p class="fs-14 subtext--text txt-x-j grey--text mb-0">
                      {{
                        menudata.overview ?
                          menudata.overview.split("The fund portfolio")[0] : " - " }}</p>
                  </v-col>

                  <v-col cols="12" md="2" class="pt-5">
                    <img v-if="menudata && menudata.risk" :src="getRiskMeterImage(menudata.risk)" alt="riskmeter"
                      width="100%" />
                  </v-col>
                </v-row>

                <v-row no-gutters class="mt-0">
                  <v-col cols="12" md="12" class="py-2">
                    <p class="font-weight-bold  subtitle-1 mb-2">Volatility Measures</p>
                    <v-row>
                      <v-col cols="4" class="pb-0" v-for="(t, d, l) in volatilityfield" :key="l">
                        <v-text-field class="funda-field mb-0 " variant="underlined" readonly color="maintext"
                          :label="d" :model-value="t ? t : '-'"> </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-divider class="mt-6 mb-3 d-none d-md-flex"></v-divider>
              </div>

              <div class="pb-3 pb-md-6">
                <v-toolbar class="nav-drawer elevation-0 px-md-5 px-0 crd-trn" density="compact">
                  <p class="wid-160 font-weight-bold fs-20 title mb-0">Historical NAV</p>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-row class="pt-md-5 pb-md-3 pl-md-6 pr-md-8 flex-column-reverse flex-md-row">
                  <v-col cols="12" md="4" class="px-7 px-md-3">
                    <div class="d-flex justify-space-between align-center mb-3">
                      <p class="font-weight-bold subtitle-1 mb-0">Trailing Returns (%)</p>
                      <div class="d-flex align-center">
                        <v-icon size="12" color="maingreen" class="mr-1">mdi-checkbox-blank</v-icon>
                        <v-icon size="12" color="mainred" class="mr-1">mdi-checkbox-blank</v-icon>
                        <span class="font-weight-medium fs-14 ">Benchmark</span>
                      </div>
                    </div>
                    <div class="d-flex pt-0">
                      <v-row no-gutters>
                        <v-col cols="6" md="4" v-for="(r, l) in schemereturns ? schemereturns : 6" :key="l"
                          class="py-3 pr-4">
                          <v-card :color="r.returns > 0 ? 'secgreen' : r.returns < 0 ? 'secred' : 'secbg'"
                            class="rounded-lg pt-2 elevation-0  text-center d-flex flex-column pt-0" width="100%">
                            <div class="px-1 flex-grow-1 d-flex flex-column justify-center">
                              <p :style="{ color: r.returns > 0 ? '#43A833' : r.returns < 0 ? '#F23645' : 'black' }"
                                class="fs-16 font-weight-bold mb-1 text-center">
                                <span :class="!uid ? 'blur-text' : ''">{{ Number(r.returns) ? r.returns.toFixed(2) :
                                  "0.00" }}
                                  %</span>
                              </p>
                              <p class="mb-2 fs-10 text-uppercase text-black  text-center">
                                {{ r.type ? r.type : "---" }}
                              </p>
                            </div>
                            <v-card v-if="benchreturns[l] && benchreturns[l].returns"
                              :color="benchreturns[l].returns > 0 ? 'maingreen' : benchreturns[l].returns < 0 ? 'mainred' : 'subsec'"
                              class="elevation-0 rounded-t-0 rounded-b-lg px-3 py-1 text-center" width="100%">
                              <p class="fs-13 font-weight-bold mb-0 white--text text-center">
                                <span :class="!uid ? 'blur-text' : ''">{{ Number(benchreturns[l].returns) ?
                                  benchreturns[l].returns.toFixed(2) : "0.00" }}%</span>
                              </p>
                            </v-card>
                          </v-card>
                        </v-col>
                        <v-col cols="12">
                          <p class="font-weight-regular fs-10 subtext--text mb-0 mt-4">52 Weeks high - 52 Weeks low</p>
                          <div class="d-flex flex-row mb-1">
                            <span class="maintext--text font-weight-bold fs-12 pt-2 lh-16">
                              {{ menudata && Number(menudata.weekHigh) ? `₹${Number(menudata.weekHigh).toFixed(2)}` :
                                "0.00" }} <br />
                              <span class="fs-10">{{ menudata.weekLowDate ? new
                                Date(menudata.weekLowDate).toLocaleDateString() : "-"
                                }}</span>
                            </span>
                            <v-card v-if="menudata" width="100%" class=" elevation-0 px-2 pt-1">
                              <v-slider class="thin-slider" hide-details thumb-color="maintext" color="subtext"
                                v-model="menudata.currentNAV" readonly :min="Number(menudata.weekLow)"
                                :max="Number(menudata.weekHigh)" track-color="maintext"></v-slider>
                            </v-card>
                            <span class="maintext--text font-weight-bold fs-12 pt-2 lh-16 float-right">
                              {{ menudata && Number(menudata.weekLow) ? `₹${Number(menudata.weekLow).toFixed(2)}` :
                                "0.00" }}<br />
                              <span class="fs-10">{{ menudata.weekHighDate ? new
                                Date(menudata.weekHighDate).toLocaleDateString() :
                                "-" }}</span>
                            </span>
                          </div>
                          <v-divider></v-divider>
                        </v-col>
                      </v-row>
                    </div>
                  </v-col>
                  <v-col cols="12" md="8" class="pa-md-0 pt-4 pb-0 px-6">
                    <v-card class="elevation-0 rounded-0 ss-adv-chart crd-trn" v-if="menudata">
                      <v-card height="360px" width="100%" id="navchart" class="crd-trn rounded-lg elevation-0">
                      </v-card>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-card>

            <v-card id="fin" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
              <div class="pt-md-6 pt-4 px-4 px-md-6">
                <v-list-item class="px-0">
                  <v-list-item-title class="font-weight-bold fs-20 title mb-2">Cumulative Performance of Last 3
                    Years</v-list-item-title>
                  <v-list-item-subtitle class=" fs-12">Cumulative Performance breakdown of
                    {{ menudata ? menudata.fundName : "" }}
                    information</v-list-item-subtitle>
                </v-list-item>
              </div>
              <v-card height="420px" width="100%" id="cumchart" class="crd-trn rounded-lg pt-4 elevation-0"> </v-card>
              <v-divider class="d-md-none"></v-divider>
            </v-card>
            <v-card id="info" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
              <div class="pt-md-6 py-4 px-4 px-md-6">
                <p class="font-weight-bold title fs-20 mb-4 lh-16">Scheme Information</p>

                <v-row>
                  <v-col cols="12" md="7">
                    <p class="font-weight-bold  mb-1">Investment Objective</p>
                    <p class="fs-14 mb-0 txt-x-j fs-14">
                      {{
                        menudata.overview ? `The fund portfolio
                      ${menudata.overview.split("The fund portfolio")[1].split("Additional details")[0]}`
                          :
                          " - " }}</p>
                  </v-col>
                  <v-col cols="12" md="5">
                    <p class="font-weight-bold mb-1">Fund Manager</p>

                    <v-card variant="outlined" class="bordercss rounded-lg mb-4">
                      <v-list-item class="px-0 px-md-3">
                        <template v-slot:prepend>
                          <v-avatar color="#fbfbfb" size="52" class="mb-auto mt-3 mr-0">
                            <img v-if="menudata && menudata.manageris" :src="menudata.manageris"
                              :alt="menudata.fundManager" width="100%" />
                          </v-avatar>
                        </template>
                        <div class="d-flex">
                          <div>
                            <v-list-item-title class="fs-18 font-weight-bold mb-1 text-capitalize black--text "> {{
                              menudata ?
                                menudata.fundManager : "-" }}</v-list-item-title>
                            <v-list-item-subtitle class="fs-14 font-weight-bold mb-0 lh-20"> {{
                              menudata.Manager_designation ?
                                menudata.Manager_designation : "-" }}</v-list-item-subtitle>
                            <v-list-item-subtitle class="fs-13 font-weight-medium pb-2 lh-14"><b>{{
                              menudata.Manager_totalExperience
                                ? menudata.Manager_totalExperience : "N/A" }}</b> experience</v-list-item-subtitle>
                          </div>
                          <div class="ml-4 mt-1">
                            <v-list-item-title class="txt-trn fs-16 font-weight-bold mb-1 text-capitalize lh-14">
                              none</v-list-item-title>
                            <v-list-item-title class="fs-14 font-weight-bold mb-0 lh-20"> ₹ {{
                              menudata.Manager_activeFundsAumSum ?
                                menudata.Manager_activeFundsAumSum.toFixed(2) : "-" }}</v-list-item-title>
                            <v-list-item-subtitle class="fs-13 font-weight-medium pb-2  lh-14"><b>{{
                              menudata.Manager_numberOfActiveFunds ? Math.round(menudata.Manager_numberOfActiveFunds)
                                : "N/A"
                                }}</b> funds managed</v-list-item-subtitle>
                          </div>
                        </div>
                      </v-list-item>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- <p class="fs-14 mb-0 txt-x-j">{{ menudata.overview ? `Additional details ${menudata.overview.split("Additional details")[1]}` : "-" }}</p> -->
              </div>
              <v-row class="px-4 px-md-6 mb-md-3 mb-4">
                <v-col cols="4" class="pb-0" v-for="(t, d, l) in schemefield" :key="l">
                  <v-text-field variant="underlined" class="funda-field" readonly color="maintext" :label="d"
                    :model-value="t ? t : '-'"> </v-text-field>
                </v-col>
              </v-row>
            </v-card>
            <v-card id="hold" class="crd-trn ss-cards overflow-hidden mb-md-6" width="100%">
              <div class="pt-md-6 py-4 px-4 px-md-6">
                <p class="font-weight-bold title mb-5 lh-16">Asset allocation and Holdings</p>

                <v-row>
                  <v-col cols="12" md="4">
                    <p class="font-weight-bold ">Fund's overall asset allocation</p>
                    <p class="fs-14 txt-x-j">Each fund is uniquely allocated to suit and match customer expectations
                      based on the
                      risk profile and return expectations.</p>

                    <p class=" fs-18 grey--text mt-3  mb-0">Fund asset allocation</p>

                    <v-card height="420px" width="100%" id="asschart" class="crd-trn rounded-lg elevation-0 px-0">
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4">
                    <p class="font-weight-bold">Fund's equity sector distribution</p>
                    <p class="fs-14 txt-x-j">Equity Sector refers to the allocation of the fund's investments across
                      different
                      sectors of the economy.</p>
                    <p class=" fs-18 grey--text mt-3 mb-3 subtext--text">Equity allocation by Sector</p>
                    <div v-for="(s, j) in menudata && menudata.sectors ? menudata.sectors.slice(0, 10) : 10" :key="j">
                      <div class="mb-5">
                        <p class="fs-14 mb-1">
                          {{ s.sectorRating ? s.sectorRating : "-" }} <span
                            class="float-right lh-24 font-weight-bold">{{ s.netAsset
                              ? s.netAsset : "0.00" }}%</span>
                        </p>
                        <v-progress-linear v-if="s.netAsset" color="#148564" height="6px" rounded
                          :model-value="Math.round(s.netAsset)"></v-progress-linear>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <p class="font-weight-bold ">Fund's top stock holdings</p>
                    <p class="fs-14 txt-x-j">The performance of the mutual fund is significantly influenced by the
                      performance of
                      its top stock holdings.</p>
                    <p class=" fs-18 grey--text mt-3 fs-18 mb-3">Top Stock Holdings</p>
                    <div v-for="(s, j) in menudata && menudata.holdings ? menudata.holdings.slice(0, 10) : 10" :key="j">
                      <div class="mb-5">
                        <p class="fs-14 mb-1">
                          {{ s.holdings ? s.holdings : "-" }} <span class="float-right lh-24 font-weight-bold">{{
                            s.netAsset ?
                              s.netAsset : "0.00" }}%</span>
                        </p>
                        <v-progress-linear v-if="s.netAsset" color="#7CD36E" height="6px" rounded
                          :model-value="Math.round(s.netAsset)"></v-progress-linear>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card>
            <v-card id="roll" class="crd-trn ss-cards overflow-hidden mb-md-6 py-6" width="100%">
              <v-toolbar class="elevation-0 px-md-5 px-3 crd-trn" density="compact">
                <v-list-item class="px-0">
                  <v-list-item-title class="font-weight-bold title mb-2">Rolling Return</v-list-item-title>
                  <v-list-item-subtitle class="maintext--text font-weight-medium fs-12">Rolling Return breakdown of
                    {{ menudata ? menudata.fundName : "" }}
                    information</v-list-item-subtitle>
                </v-list-item>
                <v-spacer></v-spacer>
                <v-select rounded @update:model-value="getRollingData()" hide-details v-model="roolstab"
                  :items="['1 Year', '2 Year', '3 Year', '5 Year', '7 Year', '10 Year']"
                  class="rounded-pill max-w-160 mr-3" density="compact" variant="solo" flat bg-color="secbg"></v-select>

                <v-menu class="d-none" v-model="menu2" :close-on-content-click="false" transition="scale-transition"
                  offset-y min-width="auto">
                  <template v-slot:activator="{ props }">
                    <v-text-field density="compact" class="rounded-pill d-none" variant="solo" flat bg-color="secbg"
                      v-model="rolldate" hide-details readonly append-icon="mdi-chevron-down"
                      v-bind="props"></v-text-field>
                  </template>
                  <v-date-picker no-title :max="new Date().toISOString().split('T')[0]" class="rounded-xl"
                    v-model="rolldate" @update:model-value="(menu2 = false), getRollingData()"></v-date-picker>
                </v-menu>
              </v-toolbar>

              <v-card width="100%" style="height: 420px; width: 100%" id="rollchart"
                class="crd-trn rounded-lg pt-4 elevation-0">
              </v-card>
              <v-divider class="d-md-none"></v-divider>
            </v-card>
            <v-card id="peers" class="crd-trn ss-cards overflow-hidden mb-md-6 pt-6" width="100%">
              <v-toolbar class="elevation-0 px-md-5 px-0 crd-trn" density="compact">
                <div class="d-flex flex-column align-start justify-center">
                  <p class="font-weight-bold title mb-1">Comparison with {{ menudata.category }}</p>
                  <p class="maintext--text font-weight-medium fs-12 mb-0">Comparison breakdown of {{ menudata ?
                    menudata.fundName :
                    "" }} information</p>
                </div>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                  <v-select @update:model-value="setPeersdata()" hide-details v-model="peerstab"
                    :items="['1 Year', '2 Year', '3 Year', '5 Year', '10 Year']" class="rounded-pill max-w-160 mr-3"
                    density="compact" variant="solo" flat bg-color="secbg" rounded></v-select>

                  <v-text-field rounded v-model="peersearch" hide-details prepend-inner-icon="mdi-magnify"
                    placeholder="Search" class="rounded-pill d-none d-md-flex" density="compact" variant="solo" flat
                    bg-color="secbg"></v-text-field>
                </div>
              </v-toolbar>
              <v-data-table hide-default-footer fixed-header class="rounded-0 overflow-y-auto mt-4"
                :headers="peerheader" height="334px" :search="peersearch" :items="peeritem"
                :items-per-page="peeritem.length">
                <template v-slot:[`item.name`]="{ item }">
                  <td class="font-weight-medium maintext--text txt-000 text-capitalize">
                    {{ item.name }}
                  </td>
                </template>
                <template v-slot:[`item.aum`]="{ item }">
                  <td class="text-left txt-000">
                    {{ item.aum ? Number(item.aum).toFixed(2) : "0.00" }}
                  </td>
                </template>
                <template v-slot:[`item.10Year`]="{ item }">
                  <td class="text-right txt-000">
                    {{ item[peerstab.replace(" ", "")] ? Number(item[peerstab.replace(" ", "")]).toFixed(2) : "0.00" }}
                  </td>
                </template>
                <template v-slot:[`item.fundRat`]="{ item }">
                  <p v-if="item.fundRat" class="mb-0 lh-16"><v-icon color="#F6CE47"
                      v-for="(n, l) in Number(item.fundRat)" :key="l">mdi-star</v-icon> <v-icon color="secbg"
                      v-for="s in 5 - Number(item.fundRat)" :key="s + Number(item.fundRat) + 1">mdi-star</v-icon></p>
                </template>
                <template v-slot:no-data>
                  <td colspan="100%" class="text-center ">
                    <div class="mx-auto">
                      <img class="align-self-stretch mx-auto" width="80px" :src="noDataImage" alt="no data" />
                      <h5 class="txt-999 font-weight-regular">There is no Peers comparison data here yet!</h5>
                    </div>
                  </td>
                </template>
              </v-data-table>
              <v-divider class="d-md-none"></v-divider>
            </v-card>
          </div>
        </div>
        <v-overlay color="mainbg" :model-value="mainloader" opacity="0.1" class="rounded-0"> </v-overlay>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import apiurl from "../../../apiurl.js";
import { useAppStore } from "@/stores/appStore";
import { getMFsheetdata, getMFNAVchart, getMFSchemePeers, getMFsheetchart, getMFrollschart } from "@/components/mixins/getAPIdata.js";

// Import risk meter images
import riskMeter1 from '@/assets/mf/riskmeter/1.svg';
import riskMeter2 from '@/assets/mf/riskmeter/2.svg';
import riskMeter3 from '@/assets/mf/riskmeter/3.svg';
import riskMeter4 from '@/assets/mf/riskmeter/4.svg';
import riskMeter5 from '@/assets/mf/riskmeter/5.svg';
import riskMeter6 from '@/assets/mf/riskmeter/6.svg';
import noDataImg from '@/assets/no data folder.svg';

export default {
  setup() {
    const appStore = useAppStore();
    return { appStore };
  },
  data: () => ({
    uid: null,
    mtoken: null,
    stoken: null,

    mainloader: true,
    bodytab: 0,
    valid: true,
    isni: null,
    menu2: false,
    mfnavchart: [],

    dashitems: [{ txt: "Overview" }, { txt: "Performance" }, { txt: "Scheme" }, { txt: "Allocation" }, { txt: "Rollings" }, { txt: "Comparison" }],
    menudata: {},

    volatilityfield: {
      Alpha: "",
      "Sharp Ratio": "",
      Mean: "",
      Beta: "",
      "Std. Deviation": "",
      YTM: "",
      "Modified Duration": "",
      "Average Maturity": "",
      "Face Value": "",
    },

    schemefield: {
      Launched: "",
      "SIP Minimum": "",
      "Corpus (Cr.)": "",
      "Expense Ratio": "",
      "Lumpsum Min.": "",
      "AMU (Cr.)": "",
      "Settlement type": "",
      "Lock-in": "",
      "Scheme type": "",
    },

    peerstab: "10 Year",
    peersearch: null,
    peeritem: [],

    pricecompar: [],

    imageicon: "",

    roolstab: "1 Year",
    rollingitem: [],
    rolldate: "1970-01-01",

    schemereturns: [],
    benchreturns: [],
    sessstoreddata: []
  }),
  computed: {
    peerheader() {
      return [
        { title: "Scheme", key: "name", sortable: false, class: "peer-w-head pl-md-6 pl-4" },
        { title: "AUM (Cr)", key: "aum", sortable: false, class: "d-none d-md-table-cell" },
        { title: "10 Year %", key: "10Year", sortable: false, class: "ws-p d-none d-md-table-cell" },
        { title: "Rating", key: "fundRat", sortable: false, class: "ws-p d-none d-md-table-cell" },
      ];
    },
    mfholdheader() {
      return [
        { title: "Funds", key: "mutual_fund", sortable: false, class: "mf-w-head pl-md-6 pl-4" },
        { title: "Mkt. cap held%", key: "market_cap_Held", sortable: false, align: "end", class: "ws-p d-none d-md-table-cell" },
        { title: "AUM", key: "mf_aum", sortable: false, align: "end", class: "d-none d-md-table-cell" },
        { title: "Weight%", key: "mf_holding_percent", sortable: false, align: "end", class: "pr-md-6 pr-4 d-none d-md-table-cell" },
        { title: "Trend", key: "mftrend", sortable: false, align: "end", class: "pr-4 d-md-none" },
      ];
    },
    riskMeterMap() {
      return {
        1: riskMeter1,
        2: riskMeter2,
        3: riskMeter3,
        4: riskMeter4,
        5: riskMeter5,
        6: riskMeter6
      };
    },
    noDataImage() {
      return noDataImg;
    },
  },
  async created() {
    let params = this.$route.params;
    // console.log("Route params:", params);

    // If no ISIN in route params, try to get from sessionStorage
    if (!params || !params.ISIN) {
      const storedData = sessionStorage.getItem('mf_single_data');
      if (storedData) {
        try {
          const itemData = JSON.parse(storedData);
          params = {
            ISIN: itemData.ISIN || itemData.Scheme_Code || itemData.schemeCode || itemData.isin,
            ...itemData
          };
          // console.log("Using stored data for params:", params);
        } catch (e) {
          // console.error("Error parsing stored data:", e);
          sessionStorage.removeItem('mf_single_data');
        }
      }
    }

    // Load data from route params
    if (params && params.ISIN) {
      await this.getMenuData(params);
    } else {
      // If no ISIN, try to get from other params
      if (params && (params.Scheme_Code || params.Scheme_Name)) {
        // Try to construct params or redirect
        // console.warn("No ISIN in route params, redirecting to mutual fund page");
        this.$router.push(`/mutualfund`);
      } else {
        // console.warn("No valid fund identifier found, redirecting to mutual fund page");
        this.$router.push(`/mutualfund`);
      }
    }
  },
  mounted() {
    let paramsdata = this.$route.params;
    // console.log("Mounted paramsdata:", paramsdata);

    // Check sessionStorage immediately for user data
    let res = sessionStorage.getItem("c3RhdHVz");
    if (res == "dmFsaWR1c2Vy") {
      if (!this.uid && !this.stoken) {
        this.mtoken = sessionStorage.getItem("msession");
        this.stoken = sessionStorage.getItem("usession");
        this.uid = sessionStorage.getItem("userid");
      }
    }

    // console.log("uid", this.uid);
    // console.log("stoken", this.stoken);
    // console.log("mtoken", this.mtoken);

    window.dispatchEvent(new CustomEvent('tabBar-load'));
    window.dispatchEvent(new CustomEvent('login-event'));

    // Also listen for user-event updates
    this.userEventHandler = () => {
      let res = sessionStorage.getItem("c3RhdHVz");
      if (res == "dmFsaWR1c2Vy") {
        if (!this.uid && !this.stoken) {
          this.mtoken = sessionStorage.getItem("msession");
          this.stoken = sessionStorage.getItem("usession");
          this.uid = sessionStorage.getItem("userid");
        }
      }
    };
    window.addEventListener('user-event', this.userEventHandler);

    this.ssdmfEventHandler = (event) => {
      const params = event.detail;
      if (this.isni != params.ISIN) {
        this.mainloader = true;
        this.menudata = {};
        this.mfnavchart = [];
        this.volatilityfield = {
          Alpha: "",
          "Sharp Ratio": "",
          Mean: "",
          Beta: "",
          "Std. Deviation": "",
          YTM: "",
          "Modified Duration": "",
          "Average Maturity": "",
          "Face Value": "",
        };
        this.schemefield = {
          Launched: "",
          "SIP Minimum": "",
          "Corpus (Cr.)": "",
          "Expense Ratio": "",
          "Lumpsum Min.": "",
          "AMU (Cr.)": "",
          "Settlement type": "",
          "Lock-in": "",
          "Scheme type": "",
        };
        this.peerstab = "10 Year";
        this.peersearch = null;
        this.peeritem = [];
        this.pricecompar = [];
        this.imageicon = "";
        this.roolstab = "1 Year";
        this.rollingitem = [];
        this.rolldate = "1970-01-01";
        this.schemereturns = [];
        this.benchreturns = [];
        this.getMenuData(params);
      } else {
        this.$router.push('/mutualfund');
      }
    };
    window.addEventListener('ssdmf-event', this.ssdmfEventHandler);
    this.sessstoreddata = JSON.parse(sessionStorage.getItem('mf_single_data'));
    // Watch for route changes to reload data
    this.$watch(() => this.$route.params, (newParams) => {
      if (newParams && newParams.ISIN && newParams.ISIN !== this.isni) {
        this.getMenuData(newParams);
      }
    }, { deep: true });
  },
  beforeUnmount() {
    window.removeEventListener('ssdmf-event', this.ssdmfEventHandler);
    window.removeEventListener('user-event', this.userEventHandler);
  },
  methods: {
    getRiskMeterImage(risk) {
      const riskNum = risk ? parseInt(risk.toString()) : 1;
      return this.riskMeterMap[riskNum] || riskMeter1;
    },
    async getMenuData(params) {
      // console.log("getMenuData params:", params);

      if (!params || !params.ISIN) {
        // console.error("No ISIN in params:", params);
        this.$router.push(`/mutualfund`);
        return;
      }

      try {
        this.mainloader = true;

        var x = new Date().getFullYear() - 1;
        this.rolldate = new Date(x.toString()).toISOString().split("T")[0];
        // console.log("rolldate", this.rolldate);

        this.isni = params.ISIN;
        // console.log("Loading data for ISIN:", this.isni);

        this.menudata = await getMFsheetdata(params.ISIN);
        // console.log("MF sheet data response:", this.menudata);

        if (this.menudata && this.menudata.stat == "Ok") {
          this.mfnavchart = await getMFNAVchart(params.ISIN, "1990-01-01", new Date().toISOString().split("T")[0]);
          // console.log("NAV chart response:", this.mfnavchart);

          this.menudata = this.menudata.data;
          this.menudata["params"] = params;

          if (this.menudata.navDate) {
            this.menudata.navDate = new Date(this.menudata.navDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }

          this.setSingleSheet(this.menudata, this.mfnavchart, this.peeritem);
          this.imageicon = `${apiurl.mfapi}static/images/mf/${this.menudata.AMC_Code}.png`;

          if (this.menudata.fundManager) {
            this.menudata["manageris"] = `${apiurl.mfapi}static/images/manager/${this.menudata.fundManager.replace(" ", "").toLowerCase()}.png`;
          }

          this.setPeersdata();

          this.mainloader = false;
        } else {
          const errorMsg = this.menudata && this.menudata.data ? this.menudata.data : (this.menudata && this.menudata.msg ? this.menudata.msg : "Failed to load fund data");
          this.appStore.showSnackbar(0, errorMsg);
          // console.error("Error loading fund data:", errorMsg);
          this.$router.push(`/mutualfund`);
        }
      } catch (error) {
        // console.error("Error in getMenuData:", error);
        this.appStore.showSnackbar(0, `Error loading fund data: ${error.message || error}`);
        this.$router.push(`/mutualfund`);
      }
    },
    imageLoadError() {
      this.imageicon = null;
    },
    async setSingleSheet(o, t) {
      this.volatilityfield = {
        Alpha: o.alpha || "",
        "Sharp Ratio": o.sharpRatio || "",
        Mean: o.mean || "",
        Beta: o.beta || "",
        "Std. Deviation": o.standardDev || "",
        YTM: o.ytm || "",
        "Modified Duration": o.modifiedDuration || "",
        "Average Maturity": o.avgMat || "",
        "Face Value": this.menudata.params && this.menudata.params.Face_Value ? this.menudata.params.Face_Value : "",
      };

      this.schemefield = {
        Launched: this.menudata.params && this.menudata.params.Launch_Date ? this.menudata.params.Launch_Date : "",
        "SIP Minimum": o.sipMinAmount || "",
        "Corpus (Cr.)": this.menudata.corpus || "",
        "Expense Ratio": this.menudata.expenseRatio || "",
        "Lumpsum Min.": o.purchaseMinAmount || "",
        "AMU (Cr.)": this.menudata.params && this.menudata.params.AUM ? `${(Number(this.menudata.params.AUM) / 10000000).toFixed(2)}` : "",
        "Settlement type": this.menudata.SETTLEMENT_TYPE || "",
        "Lock-in": this.menudata.params && this.menudata.params.Lock_in_Period ? this.menudata.params.Lock_in_Period : "",
        "Scheme type": this.menudata.params && this.menudata.params.NAV_Scheme_Type ? this.menudata.params.NAV_Scheme_Type : "",
      };

      let ass = [
        { value: o.vEquity && o.vEquity > 0 ? o.vEquity : 0, name: "Equity" },
        { value: o.vDebt && o.vDebt > 0 ? o.vDebt : 0, name: "Debt" },
        { value: o.goldPercent && o.goldPercent > 0 ? o.goldPercent : 0, name: "Gold" },
        { value: o.globalEquityPercent && o.globalEquityPercent > 0 ? o.globalEquityPercent : 0, name: "Global Equity" },
        { value: o.vOther && o.vOther > 0 ? o.vOther : 0, name: "Others" },
      ];
      this.setAssetchart(ass);

      if (t && t.stat == "Ok") {
        var key = [];
        var data = [];

        for (let b = 0; b < t.data.length; b++) {
          key.push(new Date(t.data[b].navDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "2-digit" }));
          data.push(t.data[b].nav ? Number(t.data[b].nav).toFixed(2) : null);
        }
        this.setNavchart(key, data);
      }

      var c = await getMFsheetchart(this.isni);
      if (c && c.stat == "Ok") {
        var set1 = [];
        var set2 = [];
        var key1 = [];

        for (let b = 0; b < c.data.length; b++) {
          key1.push(new Date(c.data[b].navDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }));
          set1.push(c.data[b].schReturns ? Number(c.data[b].schReturns).toFixed(2) : null);
          set2.push(c.data[b].benchmarkReturns ? Number(c.data[b].benchmarkReturns).toFixed(2) : null);
        }
        this.setCumPerchart(key1, set1, set2);
      }

      this.schemereturns = [
        { returns: o["3Month"], type: "3 Months" },
        { returns: o["6Month"], type: "6 Months" },
        { returns: o["1Year"], type: "1 Year" },
        { returns: o["3Year"], type: "3 Years" },
        { returns: o["5Year"], type: "5 Years" },
        { returns: o["10Year"], type: "10 Years" },
      ];

      if (o.benchmarkTrailingReturn) {
        this.benchreturns = [
          { returns: o.benchmarkTrailingReturn["3MonthBenchMarkReturn"], type: "3 Months" },
          { returns: o.benchmarkTrailingReturn["6MonthBenchMarkReturn"], type: "6 Months" },
          { returns: o.benchmarkTrailingReturn["1YearBenchMarkReturn"], type: "1 Year" },
          { returns: o.benchmarkTrailingReturn["3YearBenchMarkReturn"], type: "3 Years" },
          { returns: o.benchmarkTrailingReturn["5YearBenchMarkReturn"], type: "5 Years" },
          { returns: o.benchmarkTrailingReturn["10YearBenchMarkReturn"], type: "10 Years" },
        ];
      } else {
        this.benchreturns = [];
      }
    },
    async getRollingData() {
      var q = await getMFrollschart(`[${this.rollingitem}]`, this.rolldate, this.roolstab.replace(" Year", ""));
      if (q && q.stat == "Ok") {
        var rollings = { key: [], data: [] };
        var colors = ["#148564", "#7CD36E", "#F9CD6C", "#FDEBC4", "#DEDEDE"];
        rollings.key = q.data.map((o) => o.finalDate);
        for (let x = 0; x < this.rollingitem.length; x++) {
          rollings.data.push({
            name: q.data[0][`${x}schemeName`],
            type: "line",
            symbol: "none",
            sampling: "lttb",
            data: q.data.map((o) => (o[`ret${x}`] ? o[`ret${x}`].toFixed(2) : null)),
            color: colors[x],
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: colors[x] + "30",
                },
                {
                  offset: 1,
                  color: colors[x] + "05",
                },
              ]),
            },
          });
        }
        this.setRollchart(rollings.key, rollings.data);
      }
    },
    async setPeersdata() {
      this.peeritem = [];
      var r = await getMFSchemePeers(this.isni, this.peerstab.replace(" ", ""));
      if (r && r.stat == "Ok") {
        // Update header dynamically
        const headerIndex = this.peerheader.findIndex(h => h.key === "10Year");
        if (headerIndex !== -1) {
          this.peerheader[headerIndex].title = `${this.peerstab} %`;
          this.peerheader[headerIndex].key = this.peerstab.replace(" ", "");
        }

        this.peeritem = r.topSchemes || [];
        this.rollingitem = [];
        for (var i = 0; i < r.topSchemes.length; i++) {
          this.rollingitem.push(`"${r.topSchemes[i].ISIN}"`);
        }
        this.rollingitem = this.rollingitem.slice(0, 4);
        this.rollingitem.unshift(`"${this.isni}"`);
        this.getRollingData();
      }
    },
    setNavchart(a, b) {
      this.$nextTick(() => {
        const chartElement = document.getElementById("navchart");
        if (!chartElement) {
          // console.warn("NAV chart element not found");
          return;
        }

        // Dispose existing chart instance if any
        const existingChart = echarts.getInstanceByDom(chartElement);
        if (existingChart) {
          existingChart.dispose();
        }

        try {
          var myChart = echarts.init(chartElement);

          var option = {
            grid: {
              left: 24,
              right: 32,
              top: 32,
              bottom: 24,
            },
            tooltip: {
              trigger: "axis",
            },
            toolbox: {
              show: true,
              orient: "vertical",
              left: "right",
              top: "center",
            },
            xAxis: {
              type: "category",
              data: a,
            },
            yAxis: {
              type: "value",
              position: "right",
              splitLine: {
                show: false,
              },
              axisLabel: {
                formatter: (val) => (val >= 1000 ? `${val / 1000} K` : val),
              },
            },

            series: [
              {
                type: "line",
                symbol: "none",
                sampling: "lttb",
                itemStyle: {
                  color: "#1e53e5",
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#1e53e5" + "30",
                    },
                    {
                      offset: 1,
                      color: "#1e53e5" + "05",
                    },
                  ]),
                },
                markLine: {
                  silent: true,
                  symbol: "none",
                  data: [
                    {
                      yAxis: Number(this.menudata.currentNAV),
                      label: {
                        show: true,
                      },
                    },
                  ],
                },
                data: b,
              },
            ],
          };

          option && myChart.setOption(option);

          window.addEventListener("resize", function () {
            myChart.resize();
          });
        } catch (error) {
          // console.error("Error initializing NAV chart:", error);
        }
      });
    },
    setCumPerchart(a, b, c) {
      this.$nextTick(() => {
        const chartElement = document.getElementById("cumchart");
        if (!chartElement) {
          // console.warn("Cumulative performance chart element not found");
          return;
        }

        // Dispose existing chart instance if any
        const existingChart = echarts.getInstanceByDom(chartElement);
        if (existingChart) {
          existingChart.dispose();
        }

        try {
          var myChart = echarts.init(chartElement);

          var option = {
            grid: {
              left: 52,
              right: 24,
              y: "4%",
              bottom: 80,
            },
            tooltip: {
              trigger: "axis",
            },
            toolbox: {
              show: true,
              orient: "vertical",
              left: "right",
              top: "center",
            },
            legend: {
              bottom: 16,
            },
            xAxis: {
              type: "category",
              data: a,
            },
            yAxis: {
              type: "value",
              axisLabel: {
                formatter: (val) => `${val / 1000} K`,
              },
            },
            series: [
              {
                name: "Scheme Returns",
                type: "line",
                symbol: "none",
                sampling: "lttb",
                itemStyle: {
                  color: "#1e53e5",
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#1e53e5" + "30",
                    },
                    {
                      offset: 1,
                      color: "#1e53e5" + "05",
                    },
                  ]),
                },
                data: b,
              },
              {
                name: "Benchmark Returns",
                type: "line",
                symbol: "none",
                sampling: "lttb",
                itemStyle: {
                  color: "#D86F10",
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#D86F10" + "30",
                    },
                    {
                      offset: 1,
                      color: "#D86F10" + "05",
                    },
                  ]),
                },
                data: c,
              },
            ],
          };

          option && myChart.setOption(option);

          window.addEventListener("resize", function () {
            myChart.resize();
          });
        } catch (error) {
          // console.error("Error initializing cumulative performance chart:", error);
        }
      });
    },
    setAssetchart(data) {
      this.$nextTick(() => {
        const chartElement = document.getElementById("asschart");
        if (!chartElement) {
          // console.warn("Asset chart element not found");
          return;
        }

        // Dispose existing chart instance if any
        const existingChart = echarts.getInstanceByDom(chartElement);
        if (existingChart) {
          existingChart.dispose();
        }

        try {
          var myChart = echarts.init(chartElement);

          var option = {
            grid: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 8,
            },
            legend: {
              bottom: -4,
            },
            tooltip: {
              trigger: "item",
            },

            series: [
              {
                name: "Asset allocation",
                type: "pie",
                radius: ["58%", "88%"],
                label: {
                  show: false,
                },
                color: ["#148564", "#7CD36E", "#F9CD6C", "#FDEBC4", "#DEDEDE"],
                data: data,
              },
            ],
          };

          option && myChart.setOption(option);

          window.addEventListener("resize", function () {
            myChart.resize();
          });
        } catch (error) {
          // console.error("Error initializing asset chart:", error);
        }
      });
    },
    setRollchart(a, b) {
      this.$nextTick(() => {
        const chartElement = document.getElementById("rollchart");
        if (!chartElement) {
          // console.warn("Roll chart element not found");
          return;
        }

        // Dispose existing chart instance if any
        const existingChart = echarts.getInstanceByDom(chartElement);
        if (existingChart) {
          existingChart.dispose();
        }

        try {
          var myChart = echarts.init(chartElement);

          var option = {
            grid: {
              left: 60,
              right: 24,
              y: "4%",
              bottom: 100,
            },
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "shadow",
              },
            },
            legend: {
              orient: "horizontal",
              bottom: 0,
              top: "bottom",
            },
            toolbox: {
              show: true,
              orient: "vertical",
              left: "right",
              top: "center",
            },
            xAxis: {
              type: "category",
              data: a,
            },
            yAxis: {
              type: "value",
              axisLabel: {
                formatter: "{value} %",
              },
            },
            series: b,
          };

          option && myChart.setOption(option);

          window.addEventListener("resize", function () {
            myChart.resize();
          });
        } catch (error) {
          // console.error("Error initializing roll chart:", error);
        }
      });
    },
    setbodyTab() {
      this.$nextTick(() => {
        var element;
        if (this.bodytab == 0) {
          element = document.getElementById("overview");
        } else if (this.bodytab == 1) {
          element = document.getElementById("fin");
        } else if (this.bodytab == 2) {
          element = document.getElementById("info");
        } else if (this.bodytab == 3) {
          element = document.getElementById("hold");
        } else if (this.bodytab == 4) {
          element = document.getElementById("roll");
        } else if (this.bodytab == 5) {
          element = document.getElementById("peers");
        }
        if (element) {
          // Find the scroll container - try multiple selectors
          const scrollContainer = this.$el?.querySelector('.overflow-y-auto.h91vh') ||
            this.$el?.querySelector('.ss-cust-scroll') ||
            document.querySelector('.overflow-y-auto.h91vh');

          if (scrollContainer) {
            // Calculate the position relative to the scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollTop = scrollContainer.scrollTop;
            const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 48; // 48px for sticky toolbar

            scrollContainer.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          } else {
            // Fallback to scrollIntoView if container not found
            element.scrollIntoView({ block: "start", behavior: "smooth", inline: "start" });
          }
        }
      });
    },
    handleScroll(e) {
      var scrollPos = e.target.scrollTop;
      var fin = document.getElementById("fin")?.offsetTop - 216 || 0;
      var info = document.getElementById("info")?.offsetTop - 216 || 0;
      var hold = document.getElementById("hold")?.offsetTop - 216 || 0;
      var roll = document.getElementById("roll")?.offsetTop - 216 || 0;
      var peers = document.getElementById("peers")?.offsetTop - 216 || 0;

      if (scrollPos >= 0 && scrollPos < fin) {
        this.bodytab = 0;
      } else if (scrollPos > fin && scrollPos < info) {
        this.bodytab = 1;
      } else if (scrollPos > info && scrollPos < hold) {
        this.bodytab = 2;
      } else if (scrollPos > hold && scrollPos < roll) {
        this.bodytab = 3;
      } else if (scrollPos > roll && scrollPos < peers) {
        this.bodytab = 4;
      } else if (scrollPos > peers) {
        this.bodytab = 5;
      }
    },
    putMForder(type) {
      window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type: 'mforder', action: type, data: this.sessstoreddata }
      }));
    },
  },
};
</script>
<style>
.thin-slider .v-slider-track__background,
.thin-slider .v-slider-track__foreground {
  height: 1px !important;
  /* Track thickness */
}

.thin-slider .v-slider-track__container {
  height: 1px !important;
  /* Container height */
}

.thin-slider {
  --v-slider-track-size: 1px !important;
  /* thinner track */
}

.thin-slider .v-slider-thumb {
  width: 15px !important;
  height: 15px !important;
}

.thin-slider .v-slider-thumb__surface {
  width: 15px !important;
  height: 15px !important;
}

.white-chip {
  background-color: #FFFFFF !important;
  color: #666666 !important;
  border: 1px solid #E0E0E0 !important;
}

.white-chip .v-chip__content {
  color: #666666 !important;
}

.white-chip.v-chip {
  background-color: #FFFFFF !important;
  color: #666666 !important;
}

.white-chip.v-chip .v-chip__content,
.white-chip.v-chip .v-chip__underlay {
  color: #666666 !important;
}
</style>
