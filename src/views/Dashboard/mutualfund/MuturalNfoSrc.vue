<template>
  <div class="pa-0">
    <v-row no-gutters class="pt-0">
      <v-col cols="12" class="pt-0">
        <p class="text-h6 font-weight-bold px-3 pb-3">Mutual funds NFO</p>
        <!-- <v-card v-if="!mfallsearchloader" class="d-inline-flex overflow-x-auto elevation-0 no-scroll mb-0 crd-trn" width="100%">
          <v-card v-for="(n, j, k) in mfcategorie.cats" :key="k" class="px-3 py-2 mr-4" min-width="160px" variant="outlined">
            <v-list-item-title class="text-subtitle-2 font-weight-bold mb-2 text-capitalize">{{ j ? j : "" }} funds</v-list-item-title>
            <v-card class="pt-02 mb-3 elevation-0 rounded-pill" width="30%" color="maintext"></v-card>
            <p class="fs-12 subtext--text font-weight-medium mb-0">{{ n ? n : "" }} funds</p>
          </v-card>
        </v-card>
        <v-card v-else class="d-inline-flex overflow-x-auto elevation-0 no-scroll mb-0 crd-trn" width="100%">
          <v-skeleton-loader v-for="n in 10" :key="n" class="py-2 mr-4" min-width="160" height="99" type="card"></v-skeleton-loader>
        </v-card> -->
      </v-col>
      <v-col cols="3" class="d-none d-md-none"> </v-col>
      <v-col cols="12">
        <v-card style="border: 1px solid #E0E0E0" variant="outlined"
          class="elevation-0 rounded-lg mb-8 mb-md-0 pt-0 crd-trn">
          <v-toolbar class="tool-sty elevation-0 pa-3 crd-trn" density="compact">
            <v-list-item class="pl-0">
              <template v-slot:prepend>
                <v-avatar class="mr-4" size="60">
                  <img width="57px" src="@/assets/mf/side-one.svg" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-h6 pa-0">
                <v-badge color="primary" class="pt-2" :content="mftabledata ? mftabledata.length : 0"
                  :model-value="mftabledata && mftabledata.length > 0"><span>Ongoing new fund offerings</span></v-badge>
              </v-list-item-title>
              <v-list-item-subtitle class="fs-12 txt-666">A new fund offer (NFO) is the first subscription for any new
                fund by an
                investment company.</v-list-item-subtitle>
            </v-list-item>
            <v-spacer></v-spacer>
            <!-- <div>
              <v-list-item>
                <v-list-item-title class="font-weight-bold text-subtitle-1">
                  <span class="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="12" viewBox="0 0 18 12" fill="none">
                      <path d="M1.5 1H16.5" stroke="#999" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M4 6H14" stroke="#999" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M6.5 11H11.5" stroke="#999" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                    {{ mftabledata ? mftabledata.length : "0" }} funds
                </v-list-item-title>
              </v-list-item>
            </div> -->

            <v-text-field rounded="pill" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
              label="Search" class="pwidth rounded-pill ml-1 d-none d-md-flex search-field-center" density="compact"
              variant="solo" flat bg-color="secbg"></v-text-field>
          </v-toolbar>
          <v-data-table must-sort :sort-by="[{ key: '', order: 'asc' }]" hide-default-footer hide-default-header
            fixed-header :loading="mftableloader" :search="opensearch" mobile
            class="rounded-0 overflow-y-auto  ipo-data-table" :headers="tradeheader" height="calc(100vh - 180px)"
            :items="mftabledata" :items-per-page="mftabledata && mftabledata.length > 0 ? showtable : 0"
            item-key="Scheme_Code">
            <template v-slot:body="{ items, headers }">
              <table style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #F5F5F5; position: sticky; top: 0; z-index: 10;">
                  <tr>
                    <th v-for="header in tradeheader" :key="header.key" :class="header.class" :style="{
                      textAlign: header.align === 'end' ? 'right' : 'left',
                      padding: '16px 16px',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: '#F5F5F5',
                      borderBottom: '1px solid #E0E0E0',
                      position: 'sticky',
                      top: '0'
                    }">
                      {{ header.title }}
                    </th>
                  </tr>
                </thead>
                <tbody v-if="mftabledata && mftabledata.length > 0">
                  <tr class="table-row" v-for="(item, o) in items" :key="o" @mouseenter="hoveredRow = o"
                    @mouseleave="hoveredRow = null" :style="{
                      backgroundColor: hoveredRow === o ? '#E3F2FD' : 'white',
                      borderBottom: '1px solid #E0E0E0',
                      transition: 'background-color 0.2s ease'
                    }">
                    <td class="px-4" style="width: 40%; vertical-align: middle;">
                      <div class="d-flex align-center justify-space-between">
                        <div class="flex-grow-1" style="min-width: 0;">
                          <P @click="setSinglepage(item)"
                            class="fs-13 font-weight-medium mt-2 table-hov-text txt-dec-cust fund-name-link"
                            :class="{ 'fund-name-hover': hoveredRow === o }" style="cursor: pointer; line-height: 1.4;">
                            {{ item.name ? setNamehide(item.name) : "" }}
                          </P>
                          <v-chip-group column class="mb-0">
                            <v-chip size="x-small" variant="flat" class="mr-1 mb-1" :style="{
                              backgroundColor: '#F1F3F8',
                              color: '#666666',
                              borderRadius: '5px',
                              height: '20px',
                            }">
                              <span class="fs-10">
                                {{ item.splito ? item.splito : "" }}
                              </span>
                            </v-chip>
                            <v-chip size="x-small" variant="flat" class="mr-1 mb-1" :style="{
                              backgroundColor: '#F1F3F8',
                              color: '#666666',
                              borderRadius: '5px',
                              height: '20px'
                            }">
                              <span class="fs-10">
                                {{ item.splitt ? item.splitt : "" }}
                              </span>
                            </v-chip>
                            <v-chip v-if="item.splitr" size="x-small" variant="flat" class="mr-1 mb-1" :style="{
                              backgroundColor: '#F1F3F8',
                              color: '#666666',
                              borderRadius: '5px',
                              height: '20px'
                            }">
                              <span class="fs-10">
                                {{ item.splitr ? item.splitr : "" }}
                              </span>
                            </v-chip>
                          </v-chip-group>
                        </div>
                        <div @click.stop :class="{ 'd-flex': hoveredRow === o, 'd-none': hoveredRow !== o }"
                          class="align-center" style="min-width: fit-content; margin-left: 16px; flex-shrink: 0;">
                          <!-- Show Invest button only when NOT logged in -->
                          <v-btn v-if="!isLoggedIn" @click="goToLogin()" size="small"
                            class="elevation-0 rounded-pill text-none primary--text font-weight-bold" color="#F1F3F8"
                            style="min-width: 80px; box-shadow: none !important;">
                            Invest</v-btn>
                          <!-- Show Buy, SIP, and watchlist icon only when logged in -->
                          <template v-else>
                            <v-btn v-if="item.Purchase_Allowed == 'Y'" @click="putMForder(item, 'buy')" size="small"
                              class="elevation-0 text-none font-weight-bold mr-1 mf-buy-chip">
                              Buy</v-btn>
                            <v-btn v-if="item.SIP_FLAG == 'Y'" @click="putMForder(item, 'sip')" size="small"
                              class="elevation-0 text-none font-weight-bold mr-1 mf-sip-chip">
                              SIP</v-btn>
                            <v-btn @click="getusedMutual(item)"
                              style="border: 1px solid var(--outline); box-shadow: none;" min-width="20px"
                              color="mainbg" class="px-0 elevation-0 ml-2 d-none d-sm-flex" size="x-small">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" viewBox="0 0 10 12"
                                fill="none">
                                <path
                                  d="M9 11L5 8.61905L1 11V1.95238C1 1.69979 1.09365 1.45755 1.26035 1.27895C1.42705 1.10034 1.65314 1 1.88889 1H8.11111C8.34686 1 8.57295 1.10034 8.73965 1.27895C8.90635 1.45755 9 1.69979 9 1.95238V11Z"
                                  stroke="#999" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"
                                  stroke-linejoin="round" />
                              </svg>
                            </v-btn>
                          </template>
                        </div>
                      </div>
                    </td>
                    <td class="font-weight-medium px-4 txt-000"
                      style="width: 20%; vertical-align: middle; padding: 16px; text-align: left;">
                      {{ item.Start_Date ? item.Start_Date : "-" }}
                    </td>
                    <td class="font-weight-medium px-4 txt-000"
                      style="width: 20%; vertical-align: middle; padding: 16px; text-align: left;">
                      {{ item.End_Date ? item.End_Date : "-" }}
                    </td>
                    <td class="text-right font-weight-medium px-4 txt-000"
                      style="width: 20%; vertical-align: middle; padding: 16px; text-align: right;">
                      <span class="font-weight-medium maintext--text">₹{{ item.Minimum_Purchase_Amount ?
                        Number(item.Minimum_Purchase_Amount).toFixed(2) : "0.00" }}</span>
                    </td>
                  </tr>
                  <tr v-if="showtable < mftabledata.length">
                    <td :colspan="tradeheader.length" class="text-center">
                      <v-btn v-if="!opensearch" color="primary" variant="text"
                        class="elevation-0 text-none font-weight-bold py-4" @click="showtable += 24" block>show
                        more</v-btn>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td :colspan="tradeheader.length" class="text-center">
                      <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataImage" />
                        <h4 class="txt-999 font-weight-regular text-caption">There is no data here yet!</h4>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="3" class="pt-2 pr-0 d-none d-md-none">
        <v-toolbar @click="addscript = true" flat density="compact" class="tool-sty">
          <p class="mb-0 font-weight-bold">
            Filters
            <v-chip class="ml-1" v-if="mfcategorie.cat || mfcategorie.sub || mfcategorie.amc" size="x-small"
              color="secbg" text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important">
              clear all<v-icon
                @click="(mfcategorie.cat = ''), (mfcategorie.sub = ''), (mfcategorie.amc = ''), setChangewl()" size="14"
                color="#666" class="ml-2"> mdi-close </v-icon>
            </v-chip>
          </p>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-chip-group v-if="mfcategorie.cat != '' || mfcategorie.sub != '' || mfcategorie.amc != ''" column
          class="my-0">
          <v-chip class="rounded-lg" v-if="mfcategorie.cat" color="secbg" text-color="subtext"
            style="border-radius: 5px; padding: 10px 8px !important">
            {{ mfcategorie.cat.replace("Scheme", "") }} <v-icon @click="(mfcategorie.cat = ''), setChangewl()" size="14"
              color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>
          <v-chip class="rounded-lg" v-if="mfcategorie.sub" color="secbg" text-color="subtext"
            style="border-radius: 5px; padding: 10px 8px !important"> {{ mfcategorie.sub }} <v-icon
              @click="(mfcategorie.sub = ''), setChangewl()" size="14" color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>
          <v-chip class="rounded-lg" v-if="mfcategorie.amc" color="secbg" text-color="subtext"
            style="border-radius: 5px; padding: 10px 8px !important">
            {{ mfcategorie.amc.split("_")[0] }} <v-icon @click="(mfcategorie.amc = ''), setChangewl()" size="14"
              color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>
        </v-chip-group>
        <v-expansion-panels v-model="panel" class="expan">
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.cat" dot> Category </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.cats ? Object.keys(mfcategorie.cats).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div>
                <div v-for="(w, j, l) in mfcategorie.cats" :key="l">
                  <v-list-item
                    @click="mfcategorie.cat != j ? (mfcategorie.cat = j) : (mfcategorie.cat = ''), setChangewl()"
                    class="crd-trn px-2">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.cat == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-capitalize"
                      :style="`color:${mfcategorie.cat == j ? '#0037B7' : '#000000'};`"> {{ j.replace("Scheme", "")
                      }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.sub" dot> Sub category </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.subs ? Object.keys(mfcategorie.subs).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div class="c-side-expand-panel">
                <div v-for="(w, j, l) in mfcategorie.subs" :key="l">
                  <v-list-item
                    @click="mfcategorie.sub != j ? (mfcategorie.sub = j) : (mfcategorie.sub = ''), setChangewl()"
                    class="px-2 crd-trn">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.sub == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-capitalize"
                      :style="`color:${mfcategorie.sub == j ? '#0037B7' : '#000000'};`"> {{ j }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.amc" dot> AMC </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.amcs ? Object.keys(mfcategorie.amcs).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div class="c-side-expand-panel">
                <div v-for="(w, j, l) in mfcategorie.amcs" :key="l">
                  <v-list-item
                    @click="mfcategorie.amc != j ? (mfcategorie.amc = j) : (mfcategorie.amc = ''), setChangewl()"
                    class="px-2 crd-trn">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.amc == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-lowercase"
                      :style="`color:${mfcategorie.amc == j ? '#0037B7' : '#000000'};`"> {{ j.split("_")[0]
                      }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel3"> Min. purchase amount </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.minamt"
                :max="mfcategorie.minamt_max" :min="mfcategorie.minamt_min" hide-details
                :step="mfcategorie.minamt_max / 50" class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ mfcategorie.minamt[0] < 1000 ? mfcategorie.minamt[0] : `${(mfcategorie.minamt[0] /
                      1000).toFixed(0)}k` }} </p>
                </template>

                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹200k
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <!-- <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel4"> AUM </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.rangeaum" :max="mfcategorie.aum_max" :min="mfcategorie.aum_min" hide-details :step="mfcategorie.aum_max / 50" class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ (mfcategorie.rangeaum[0] / 10000000 / 1000).toFixed(0) }}k <span class="subtext--text">Cr</span><br />
                  </p>
                </template>

                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹{{ (mfcategorie.rangeaum[1] / 10000000 / 1000).toFixed(0) }}k <span class="subtext--text">Cr</span><br />
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel> -->
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-bottom-sheet v-model="mobilefilter" class="d-md-none">
      <v-sheet class="rounded-t-xl px-4" height="70vh">
        <div @click="mobilefilter = false" class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="3" viewBox="0 0 32 3" fill="none">
            <rect width="32" height="3" rx="1.5" fill="#DDDDDD" fill-opacity="0.866667" />
          </svg>
        </div>
        <v-chip-group v-if="mfcategorie.cat != '' || mfcategorie.sub != '' || mfcategorie.amc != ''" column
          class="my-0">
          <v-chip class="rounded-lg" v-if="mfcategorie.cat" color="secbg" text-color="subtext" size="x-small"
            style="border-radius: 5px; padding: 10px 8px !important">
            {{ mfcategorie.cat.replace("Scheme", "") }} <v-icon @click="(mfcategorie.cat = ''), setChangewl()" size="14"
              color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>
          <v-chip class="rounded-lg" v-if="mfcategorie.sub" color="secbg" text-color="subtext" size="x-small"
            style="border-radius: 5px; padding: 10px 8px !important">
            {{ mfcategorie.sub }} <v-icon @click="(mfcategorie.sub = ''), setChangewl()" size="14" color="#666"
              class="ml-2"> mdi-close </v-icon>
          </v-chip>
          <v-chip class="rounded-lg" v-if="mfcategorie.amc" color="secbg" text-color="subtext" size="x-small"
            style="border-radius: 5px; padding: 10px 8px !important">
            {{ mfcategorie.amc.split("_")[0] }} <v-icon @click="(mfcategorie.amc = ''), setChangewl()" size="14"
              color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>

          <v-chip class="rounded-lg" color="secbg" text-color="subtext" size="x-small"
            style="border-radius: 5px; padding: 10px 8px !important">
            Clear all <v-icon
              @click="(mfcategorie.cat = ''), (mfcategorie.sub = ''), (mfcategorie.amc = ''), setChangewl(), (mobilefilter = false)"
              size="14" color="#666" class="ml-2"> mdi-close </v-icon>
          </v-chip>
        </v-chip-group>
        <v-expansion-panels v-model="panel" class="expan">
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.cat" dot> Category </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.cats ? Object.keys(mfcategorie.cats).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div>
                <div v-for="(w, j, l) in mfcategorie.cats" :key="l">
                  <v-list-item
                    @click="mfcategorie.cat != j ? (mfcategorie.cat = j) : (mfcategorie.cat = ''), setChangewl()"
                    class="px-2 crd-trn">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.cat == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-capitalize"
                      :style="`color:${mfcategorie.cat == j ? '#0037B7' : '#000000'};`"> {{ j.replace("Scheme", "")
                      }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.sub" dot> Sub category </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.subs ? Object.keys(mfcategorie.subs).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div class="c-side-expand-panel">
                <div v-for="(w, j, l) in mfcategorie.subs" :key="l">
                  <v-list-item
                    @click="mfcategorie.sub != j ? (mfcategorie.sub = j) : (mfcategorie.sub = ''), setChangewl()"
                    class="px-2 crd-trn">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.sub == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-capitalize"
                      :style="`color:${mfcategorie.sub == j ? '#0037B7' : '#000000'};`"> {{ j }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span>
                <v-badge :model-value="mfcategorie.amc" dot> AMC </v-badge>
                <span class="float-right mr-3 fs-12">{{ mfcategorie.amcs ? Object.keys(mfcategorie.amcs).length : ""
                  }}</span>
              </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div class="c-side-expand-panel">
                <div v-for="(w, j, l) in mfcategorie.amcs" :key="l">
                  <v-list-item
                    @click="mfcategorie.amc != j ? (mfcategorie.amc = j) : (mfcategorie.amc = ''), setChangewl()"
                    class="px-2 crd-trn">
                    <v-card class="pa-2 elevation-0 mr-2"
                      :color="mfcategorie.amc == j ? '#0037B7' : '#F1F3F8'"></v-card>
                    <v-list-item-title class="fs-12 text-lowercase"
                      :style="`color:${mfcategorie.amc == j ? '#0037B7' : '#000000'};`"> {{ j.split("_")[0]
                      }}</v-list-item-title>
                  </v-list-item>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel3"> Min. purchase amount </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0 pb-4">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.minamt"
                :max="mfcategorie.minamt_max" :min="mfcategorie.minamt_min" hide-details
                :step="mfcategorie.minamt_max / 50" class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ mfcategorie.minamt[0] < 1000 ? mfcategorie.minamt[0] : `${(mfcategorie.minamt[0] /
                      1000).toFixed(0)}k` }} </p>
                </template>
                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹200k
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <!-- <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel4"> AUM </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0 pb-4">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.rangeaum" :max="mfcategorie.aum_max" :min="mfcategorie.aum_min" hide-details :step="mfcategorie.aum_max / 50" class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ (mfcategorie.rangeaum[0] / 10000000 / 1000).toFixed(0) }}k <span class="subtext--text">Cr</span><br />
                  </p>
                </template>
                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹{{ (mfcategorie.rangeaum[1] / 10000000 / 1000).toFixed(0) }}k <span class="subtext--text">Cr</span><br />
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel> -->
        </v-expansion-panels>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { getMFnofdata } from "@/components/mixins/getAPIdata";
import noDataImg from '@/assets/no data folder.svg';
import { useAppStore } from '@/stores/appStore';

export default {
  setup() {
    const appStore = useAppStore();
    return { appStore };
  },
  data: () => ({
    uid: "",
    token: "",
    mutualuseritems: [],
    mftabledata: [],
    mftableloader: true,
    showtable: 24,
    opensearch: null,
    hoveredRow: null,

    panel: null,

    allmutualfunddata: [],
    mfcategorie: [],
    model: null,
    items: [],
    search: null,
    nodata: null,
    mfallsearchloader: true,

    mobilefilter: false,
  }),
  computed: {
    tradeheader() {
      return [
        { title: "Fund name", key: "name", sortable: false, class: "pl-md-6 pl-4", align: "start", width: "40%" },
        { title: "Opening", key: "Start_Date", sortable: false, class: "pl-md-6 pl-4", align: "start", width: "20%" },
        { title: "Closing", key: "End_Date", sortable: false, class: "pl-md-6 pl-4", align: "start", width: "20%" },
        { title: "Min. Invest", key: "Minimum_Purchase_Amount", sortable: false, align: "end", class: "pr-md-6 pr-4", width: "20%" },
      ];
    },
    isLoggedIn() {
      // Check if user is logged in - check both uid and sessionStorage
      const sessionUid = sessionStorage.getItem("userid");
      const uid = this.uid || sessionUid;
      // Return true only if uid is a valid non-empty string
      return uid && uid !== null && uid !== '' && uid !== 'null' && uid !== 'undefined' && uid.trim() !== '';
    },
    noDataImage() {
      return noDataImg;
    },
  },
  created() {
    //
  },
  async mounted() {
    window.dispatchEvent(new CustomEvent('login-event'));
    window.dispatchEvent(new CustomEvent('tabBar-load'));

    // Load NFO data directly
    await this.ressetMFnfodata();

    // Also listen for setRec-event in case parent component handles it
    window.addEventListener("setRec-event", this.handleSetRecEvent);
    window.addEventListener("user-event", this.handleUserEvent);
  },
  beforeUnmount() {
    window.removeEventListener("setRec-event", this.handleSetRecEvent);
    window.removeEventListener("user-event", this.handleUserEvent);
  },

  methods: {
    handleSetRecEvent(event) {
      const mfdata = event.detail;
      if (mfdata == "stat_ok") {
        this.ressetMFnfodata();
      } else {
        let res = mfdata;
        if (res && res.stat && res.stat == "Ok") {
          this.allmutualfunddata = [];
          this.allmutualfunddata = res.data;
          this.ressetMFnfodata();
          this.mfcategorie = [];
          this.mfcategorie["cats"] = res.cat;
          this.mfcategorie["subs"] = res.sub;
          this.mfcategorie["amcs"] = res.amc;
          this.mfcategorie["cat"] = "";
          this.mfcategorie["sub"] = "";
          this.mfcategorie["amc"] = "";

          this.mfcategorie["minamt_min"] = Math.min(...this.allmutualfunddata.map((o) => Number(o.Minimum_Purchase_Amount)));
          this.mfcategorie["minamt_max"] = 200000;
          this.mfcategorie["aum_min"] = 0;
          this.mfcategorie["aum_max"] = Math.max(...this.allmutualfunddata.map((o) => Number(o.AUM)));

          this.mfcategorie["minamt"] = [this.mfcategorie.minamt_min, this.mfcategorie.minamt_max];
          this.mfcategorie["rangeaum"] = [this.mfcategorie.aum_min, this.mfcategorie.aum_max];
        } else if (res) {
          this.appStore.showSnackbar(2, res.msg ? res.msg : res);
          this.mfallsearchloader = false;
        }
      }
    },
    handleUserEvent() {
      let res = sessionStorage.getItem("c3RhdHVz");
      if (res == "dmFsaWR1c2Vy") {
        this.token = sessionStorage.getItem("usession");
        this.uid = sessionStorage.getItem("userid");
      } else {
        this.token = "";
        this.uid = "";
      }
    },
    setNamehide(name) {
      return name && name.length > 30 ? `${name.slice(0, 30)}...` : name;
    },
    setSinglepage(item) {
      // console.log("Navigating to single page with item:", item);
      // Store item data in sessionStorage for the single page
      if (item) {
        sessionStorage.setItem('mf_single_data', JSON.stringify(item));
      }
      // Navigate using ISIN if available, otherwise use Scheme_Code
      const identifier = item.ISIN || item.Scheme_Code || item.schemeCode || item.isin;
      if (identifier) {
        this.$router.push({
          name: "mutual fund single",
          params: { ISIN: identifier }
        });
      } else {
        // console.error("No ISIN or Scheme_Code found in item:", item);
        this.appStore.showSnackbar(0, "Unable to navigate: Missing fund identifier");
      }
    },
    async ressetMFnfodata() {
      try {
        this.mftableloader = true;

        let res1 = await getMFnofdata();
        // console.log("NFO API Response:", res1);

        let res = null;

        // Handle different response structures
        if (res1) {
          if (res1.stat == "Ok" && res1.data && Array.isArray(res1.data)) {
            res = res1.data;
          } else if (res1.data && Array.isArray(res1.data)) {
            res = res1.data;
          } else if (Array.isArray(res1)) {
            res = res1;
          } else if (res1.stat == "Ok" && Array.isArray(res1)) {
            res = res1;
          }
        }

        // console.log("Processed NFO data:", res);
        // console.log("NFO data length:", res?.length || 0);

        if (res && Array.isArray(res) && res.length > 0) {
          // Process each item
          for (let w = 0; w < res.length; w++) {
            // Ensure name field exists
            if (!res[w].name && res[w].Scheme_Name) {
              res[w].name = res[w].Scheme_Name;
            }

            // Process scheme name for splits
            if (res[w].Scheme_Name) {
              let arr = res[w].Scheme_Name.split("-").slice(0);
              for (let d = 0; d < arr.length; d++) {
                res[w]["splito"] = arr[d].includes("GROWTH") ? "GROWTH" : arr[d].includes("IDCW PAYOUT") ? "IDCW PAYOUT" : arr[d].includes("IDCW REINVESTMENT") ? "IDCW REINVESTMENT" : arr[d].includes("IDCW") ? "IDCW" : "NORMAL";
                if (res[w].SCHEME_SUB_CATEGORY == "" || !res[w].SCHEME_SUB_CATEGORY) {
                  res[w].SCHEME_SUB_CATEGORY = arr[d].includes("ETF") ? "ETFs" : "";
                }
              }
            }

            res[w]["splitt"] = res[w].SCHEME_CATEGORY ? res[w].SCHEME_CATEGORY.toUpperCase() : "OTHER SCHEME";
            res[w]["splitr"] = res[w].SCHEME_SUB_CATEGORY ? res[w].SCHEME_SUB_CATEGORY.replace(/Fund|Hybrid|_/gi, "").toUpperCase() : "";
          }

          this.mftabledata = res;
          // console.log("Final NFO data:", this.mftabledata.length, "items");
          // console.log("First item:", this.mftabledata[0]);
        } else {
          this.mftabledata = [];
          // console.warn("No NFO data found or empty array");
        }

        this.mftableloader = false;
        this.mfallsearchloader = false;
      } catch (error) {
        // console.error("Error loading NFO data:", error);
        this.appStore.showSnackbar(0, `Error loading NFO data: ${error.message || error}`);
        this.mftableloader = false;
        this.mfallsearchloader = false;
        this.mftabledata = [];
      }
    },
    goToLogin() {
      // Trigger login by redirecting to login URL
      window.location.assign(
        `https://desk.zebuetrade.com/mynt/?url=${window.location.origin + window.location.pathname}`
      );
    },
    putMForder(item, type) {
      window.dispatchEvent(new CustomEvent('menudialog', {
        detail: { type: 'mforder', action: type, item }
      }));
    },
    getusedMutual(item) {
      window.dispatchEvent(new CustomEvent('addscript-wl', {
        detail: { item, type: 'mf' }
      }));
    },
    setChangewl() {
      this.showtable = 24;
      this.mftabledata = [];
      this.mftabledata = this.mutualuseritems.filter(
        (x) =>
          x["SCHEME_CATEGORY"].includes(this.mfcategorie.cat == "Other" ? "others" : this.mfcategorie.cat) &&
          x["SCHEME_SUB_CATEGORY"].includes(this.mfcategorie.sub) &&
          x["AMC_Code"].includes(this.mfcategorie.amc) &&
          x["AUM"] >= this.mfcategorie.rangeaum[0] &&
          x["AUM"] <= this.mfcategorie.rangeaum[1] &&
          x["Minimum_Purchase_Amount"] >= this.mfcategorie.minamt[0] &&
          x["Minimum_Purchase_Amount"] <= this.mfcategorie.minamt[1]
      );

      this.mftableloader = false;
    },
    setMFrowdata(item) {
      this.$router.push({ name: "mutual fund amc", params: { mfamc: item } });
    },
  },
};
</script>

<style>
.search-field-center .v-field__input {
  display: flex !important;
  align-items: center !important;
}

.search-field-center input {
  line-height: 1.5 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.search-field-center .v-field__input input {
  line-height: 1.5 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.search-field-center .v-field--focused .v-label,
.search-field-center .v-field--has-value .v-label {
  display: none !important;
}

.fund-name-link {
  color: #000000 !important;
  transition: color 0.2s ease;
}

.fund-name-hover {
  color: #0037B7 !important;
}
</style>
