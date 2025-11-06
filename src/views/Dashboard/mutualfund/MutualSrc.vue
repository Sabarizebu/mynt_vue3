<template>
    <div>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="pa-4 px-sm-8 py-sm-6 elevation-0 rounded-lg mb-6" color="secbg">
          <p class="fs-24 font-weight-bold mb-1">Best mutual funds</p>
          <p class="text-subtitle-2 subtext--text mb-6">Find the right mutual fund across these asset classes</p>
          <v-card v-if="newbestmflist.length > 0" class="crd-trn d-inline-flex overflow-x-auto elevation-0 no-scroll"
            width="100%">
            <v-card @click="navigateToCategory(b)"
              v-for="(b, l) in newbestmflist" :key="l" class="px-5 pb-3 pt-4 mr-4 rounded-lg elevation-0"
              min-width="184px" max-width="190px" style="border: thin solid var(--outline) !important">
              <div class="mb-1">
                <img :src="getImageUrl(b.image)" width="50px" />
              </div>
              <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">{{ b.title }}</v-list-item-title>
              <p class="fs-12 subtext--text mb-4">{{ b.subtitle }}</p>
              <p class="text-subtitle-1 font-weight-bold mb-0">{{ b.funds }} </p>
            </v-card>
          </v-card>
          <v-card v-else class="d-inline-flex overflow-x-auto elevation-0 no-scroll mb-0 crd-trn" width="100%">
            <v-skeleton-loader v-for="n in 10" :key="n" class="pb-3 mr-4 rounded-lg elevation-0" min-width="184"
              height="200" type="card"></v-skeleton-loader>
          </v-card>
        </v-card>
        <v-card v-if="nfocount > 0" to="/mutualfund/nfo" variant="outlined" class="pt-4 pb-4 pb-sm-2 rounded-lg my-4 mr-sm-4">
          <v-row>
            <v-col cols="1" class="pb-2 d-none d-sm-flex">
              <img src="@/assets/mf/side-one.svg" class="mb-2 ml-4" />
            </v-col>
            <v-col cols="12" sm="9" class="pb-2">
              <div class="px-5">
                <p class="text-uppercase fs-12 font-weight-regular primary--text mb-2">Invest in</p>
                <v-badge color="primary" :content="nfocount">
                  <p class="font-weight-bold fs-18 maintext--text mb-0">Ongoing new fund offerings</p>
                </v-badge>

                <p class="fs-14 subtext--text mb-0">A new fund offer (NFO) is the first subscription for any new fund by
                  an investment company.</p>
              </div>
            </v-col>
            <v-col cols="2" sm="1" class="d-none d-sm-flex align-center pt-0">
              <v-btn color="btnclr" block
                class="btntext--text text-none font-weight-bold rounded-pill pl-6 pr-4 elevation-0">View <v-icon
                  size="16" class="ml-2">mdi-arrow-right</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-card>

        <p class="text-h6 font-weight-bold mb-3">Mutual funds categories</p>
        <v-card v-if="!mfcatloader && newcatlistdata && newcatlistdata.length > 0" class="d-inline-flex overflow-x-auto elevation-0 no-scroll mb-0 crd-trn"
          width="100%">
          <v-card @click=" setChangewl(n)" v-for="(n, k) in newcatlistdata" :key="k" class="px-3 py-2 mr-4"
            min-width="160px" variant="outlined">
            <v-list-item-title class="text-subtitle-2 font-weight-bold mb-2 text-capitalize">{{ n ? n.name : "" }}
              funds</v-list-item-title>
            <v-card class="pt-02 mb-3 elevation-0 rounded-pill" width="30%" color="maintext"></v-card>
            <p class="fs-12 subtext--text font-weight-medium mb-0">{{ n ? n.count : "" }} funds</p>
          </v-card>
        </v-card>
        <v-card v-else class="d-inline-flex overflow-x-auto elevation-0 no-scroll mb-0 crd-trn" width="100%">
          <v-skeleton-loader v-for="n in 10" :key="n" class="py-2 mr-4" min-width="160" height="99"
            type="card"></v-skeleton-loader>
        </v-card>
      </v-col>
      <v-col cols="3" class="pt-2 pr-0 d-none d-md-none">
        <v-card variant="outlined" class="py-4 rounded-lg my-3">
          <img src="@/assets/mf/side-one.svg" class="mb-2 ml-4" />
          <div class="px-5">
            <p class="text-uppercase fs-12 font-weight-regular primary--text mb-1">Invest in</p>
            <p class="font-weight-bold fs-18 maintext--text mb-2">Ongoing new fund offerings</p>
            <p class="fs-12 subtext--text mb-0">A new fund offer (NFO) is the first subscription for any new fund by an
              investment company.</p>
          </div>
        </v-card>
        <!-- to="/mutualfund/compare" -->
        <v-card variant="outlined" class="py-4 rounded-lg mt-6">
          <img src="@/assets/mf/side-two.svg" class="mb-2 ml-4" />
          <div class="px-5">
            <p class="text-uppercase fs-12 font-weight-regular primary--text mb-1">Explore by</p>
            <p class="font-weight-bold fs-18 maintext--text mb-2">Comparing Funds</p>
            <p class="fs-12 subtext--text mb-0">Find the best suited Mutual Funds for wealth creation by comparing
              multiple funds.</p>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12">
        <div>
          <v-card style="border: 1px solid var(--outline)" variant="outlined" class="elevation-0 rounded-lg mb-8 mb-md-0 crd-trn">
            <v-toolbar class="tool-sty elevation-0 py-4 mb-7 px-4 crd-trn" density="compact">
              <p class="text-h6 font-weight-bold mb-0">{{ headertext ? headertext : "" }}</p>
              <v-spacer></v-spacer>
              <div v-if="mfcategorie.cat != '' || mfcategorie.sub != '' || mfcategorie.amc != ''">
                <v-list-item>
                  <v-list-item-title class="font-weight-bold text-subtitle-1">
                    <span class="mr-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="16"
                        viewBox="0 0 18 16" fill="none">
                        <path d="M1.5 2.5H11.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M14.5 2.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M14.5 6.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M14.5 10.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M14.5 14.5H16.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M1.5 6.5H7.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M1.5 10.5H11.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M1.5 14.5H6.5" stroke="#0037B7" stroke-width="2" stroke-miterlimit="10"
                          stroke-linecap="round" stroke-linejoin="round" />
                      </svg></span>
                    {{ mftabledata ? mftabledata.length : "0" }} funds
                  </v-list-item-title>
                </v-list-item>
              </div>

              <v-text-field style="max-width: 160px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search" class="rounded-pill ml-1 d-none d-md-flex" density="compact" variant="solo" flat
                bg-color="secbg"></v-text-field>
            </v-toolbar>
            <v-data-table must-sort :sort-by="[{ key: '', order: 'asc' }]" :search="opensearch" hide-default-footer
              fixed-header mobile :loading="mftableloader"
              class="rounded-0 overflow-y-auto mftable-responsive" :headers="tradeheader" height="calc(100vh - 180px)"
              :items="mftabledata" :items-per-page="mftabledata && mftabledata.length > 0 ? showtable : 0"
              item-key="Scheme_Code">
              <template v-slot:body="{ items, headers }">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead style="background-color: #F5F5F5; position: sticky; top: 0; z-index: 10;">
                    <tr>
                      <th v-for="header in tradeheader" :key="header.key" 
                          :class="header.class"
                          :style="{
                            textAlign: header.align === 'end' ? 'right' : 'left',
                            padding: '12px 16px',
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
                    <tr class="table-row" v-for="(item, o) in items" :key="o" 
                        @mouseenter="hoveredRow = o" 
                        @mouseleave="hoveredRow = null"
                        :style="{ 
                          backgroundColor: hoveredRow === o ? '#E3F2FD' : 'white', 
                          borderBottom: '1px solid #E0E0E0',
                          transition: 'background-color 0.2s ease'
                        }">
                      <td class="pl-md-6 pl-4" style="width: 40%; vertical-align: middle; padding: 16px;">
                        <div class="d-flex align-center justify-space-between">
                          <div class="flex-grow-1" style="min-width: 0;">
                            <P @click="setSinglepage(item)" 
                              class="fs-13 font-weight-medium mb-1 primary--text table-hov-text txt-dec-cust"
                              style="cursor: pointer; color: #0037B7; line-height: 1.4;">
                              {{ item.name ? setNamehide(item.name) : "" }}
                            </P>

                            <v-chip-group column class="mb-0">
                              <v-chip color="#F5F5F5" size="x-small" class="mr-1 mb-1" text-color="#666"
                                style="border-radius: 4px; padding: 4px 8px; height: 20px; font-size: 10px; display: inline-block;">
                                <span class="font-weight-medium">
                                  {{ item.Type ? item.Type : "" }}
                                </span>
                              </v-chip>
                              <v-chip v-if="item.SubType" color="#F5F5F5" size="x-small" class="mr-1 mb-1" text-color="#666"
                                style="border-radius: 4px; padding: 4px 8px; height: 20px; font-size: 10px; display: inline-block;">
                                <span class="font-weight-medium">
                                  {{ item.SubType ? item.SubType : "" }}
                                </span>
                              </v-chip>
                            </v-chip-group>
                          </div>
                          <div @click.stop 
                            :class="{ 'd-flex': hoveredRow === o, 'd-none': hoveredRow !== o }"
                            class="align-center"
                            style="min-width: fit-content; margin-left: 16px; flex-shrink: 0;">
                            <!-- Show Invest button only when NOT logged in -->
                            <v-btn v-if="!isLoggedIn" @click="$emit('gologin')" size="small"
                              class="elevation-0 text-none white--text font-weight-bold mr-1"
                              style="background-color: #0037B7; border-radius: 4px; padding: 6px 16px; height: 28px; font-size: 12px; min-width: 70px; box-shadow: none;">
                              Invest</v-btn>
                            <!-- Show Buy, SIP, and watchlist icon only when logged in -->
                            <template v-else>
                              <v-btn v-if="item.Purchase_Allowed == 'Y'" @click="putMForder(item, 'buy')" size="small"
                                class="elevation-0 text-none white--text font-weight-bold mr-1"
                                style="background-color: #148564; border-radius: 4px; padding: 6px 16px; height: 28px; font-size: 12px; min-width: 70px; box-shadow: none;">
                                Buy</v-btn>
                              <v-btn v-if="item.SIP_FLAG == 'Y'" @click="putMForder(item, 'sip')" size="small"
                                class="elevation-0 text-none white--text font-weight-bold mr-1"
                                style="background-color: #0037B7; border-radius: 4px; padding: 6px 16px; height: 28px; font-size: 12px; min-width: 70px; box-shadow: none;">
                                SIP</v-btn>
                              <v-btn @click="getusedMutual(item)" style="border: 1px solid var(--outline); box-shadow: none;"
                                min-width="20px" color="mainbg" class="px-0 elevation-0 ml-2 d-none d-sm-flex" size="x-small">
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
                      <td class="text-right font-weight-medium pr-md-6 pr-4" style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item.AUM ? Number(item.AUM).toFixed(2) : "0.00" }}
                      </td>
                      <td class="text-right font-weight-medium pr-md-6 pr-4" style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item['1Year'] ? Number(item['1Year']).toFixed(2) : "0.00" }}
                      </td>
                      <td class="text-right font-weight-medium pr-md-6 pr-4" style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item['3Year'] ? Number(item['3Year']).toFixed(2) : "0.00" }} %
                      </td>
                      <td class="text-right font-weight-medium pr-md-6 pr-4" style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
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
        </div>
      </v-col>
      <v-col cols="3" class="pt-2 pr-0 d-none d-md-none">
        <v-toolbar @click="addscript = true" flat density="compact" class="tool-sty">
          <p class="mb-0 font-weight-bold">
            Filters
            <v-chip class="ml-1" v-if="mfcategorie.cat || mfcategorie.sub || mfcategorie.amc" size="x-small" color="secbg"
              text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important">clear all<v-icon
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
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel4"> AUM </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.rangeaum"
                :max="mfcategorie.aum_max" :min="mfcategorie.aum_min" hide-details :step="mfcategorie.aum_max / 50"
                class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ (mfcategorie.rangeaum[0] / 10000000 / 1000).toFixed(0) }}k <span
                      class="subtext--text">Cr</span><br />
                  </p>
                </template>

                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹{{ (mfcategorie.rangeaum[1] / 10000000 / 1000).toFixed(0) }}k <span
                      class="subtext--text">Cr</span><br />
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel>
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
          <v-expansion-panel>
            <v-expansion-panel-title class="px-0">
              <span id="panel4"> AUM </span>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0 pb-4">
              <v-range-slider @update:model-value="setChangewl()" color="#FF1717" v-model="mfcategorie.rangeaum"
                :max="mfcategorie.aum_max" :min="mfcategorie.aum_min" hide-details :step="mfcategorie.aum_max / 50"
                class="align-center mt-4">
                <template v-slot:prepend>
                  <p class="fs-12 black-text mb-0 text-right">
                    <span class="fs-10 subtext--text">MIN</span><br />
                    ₹{{ (mfcategorie.rangeaum[0] / 10000000 / 1000).toFixed(0) }}k <span
                      class="subtext--text">Cr</span><br />
                  </p>
                </template>
                <template v-slot:append>
                  <p class="fs-12 black-text mb-0">
                    <span class="fs-10 subtext--text">MAX</span><br />
                    ₹{{ (mfcategorie.rangeaum[1] / 10000000 / 1000).toFixed(0) }}k <span
                      class="subtext--text">Cr</span><br />
                  </p>
                </template>
              </v-range-slider>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-sheet>
    </v-bottom-sheet>
    </div>
</template>

<script>
import eventBus from "@/utils/eventBus.js";
import { getnewBestMF, gettopfirstapi, getnewcatgreapi, getMFnofdata } from "@/components/mixins/getAPIdata";

// Import images for Vite
import loanImg from '@/assets/mf/loan.svg';
import growthnewImg from '@/assets/mf/growthnew.svg';
import goldcoinImg from '@/assets/mf/goldcoin.svg';
import transactionsImg from '@/assets/mf/transactions.svg';
import globeImg from '@/assets/mf/globe.svg';
import balancehybridImg from '@/assets/mf/balancehybrid.svg';
import noDataImg from '@/assets/no data folder.svg';

export default {
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
    mfcatloader: true,

    bestmfdata: [],
    mobilefilter: false,
    nfocount: 0,
    newbestmflist: [],
    staticData: [
      {
        "funds": "46 funds",
        "image": "loan.svg",
        "subtitle": "Build wealth and save taxes",
        "title": "Tax Saving",
        "titlekey": "taxSaving"
      },
      {
        "funds": "90 funds",
        "image": "growthnew.svg",
        "subtitle": "Maximize returns with high growth",
        "title": "High Growth Equity",
        "titlekey": "highGrowthEquity"
      },
      {
        "funds": "56 funds",
        "image": "goldcoin.svg",
        "subtitle": "Stable income and growth",
        "title": "Stable Debt",
        "titlekey": "stableDebt"
      },
      {
        "funds": "120 funds",
        "image": "transactions.svg",
        "subtitle": "Focused investments in key sectors",
        "title": "Sectoral Thematic",
        "titlekey": "sectoralThematic"
      },
      {
        "funds": "56 funds",
        "image": "globe.svg",
        "subtitle": "Diversify your portfolio globally",
        "title": "International Exposure",
        "titlekey": "internationalExposure"
      },
      {
        "funds": "120 funds",
        "image": "balancehybrid.svg",
        "subtitle": "Stability and growth combined",
        "title": "Balanced Hybrid",
        "titlekey": "balancedHybrid"
      }
    ],
    newcatlistdata: [],
    headertext: "Top 100 mutual funds"
  }),
  computed: {
    tradeheader() {
      return [
        { title: "Fund name", key: "name", sortable: false, class: "pl-md-6 pl-4", align: "start", width: "40%" },
        { title: "AUM", key: "AUM", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
        { title: "1yr CAGR", key: "1Year", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
        { title: "3yr CAGR", key: "3Year", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
        { title: "Min. Invest", key: "Minimum_Purchase_Amount", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
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
    imageMap() {
      return {
        'loan.svg': loanImg,
        'growthnew.svg': growthnewImg,
        'goldcoin.svg': goldcoinImg,
        'transactions.svg': transactionsImg,
        'globe.svg': globeImg,
        'balancehybrid.svg': balancehybridImg
      };
    },
  },
  created() {
    //
  },
  async mounted() {
    eventBus.$emit("login-event");
    eventBus.$emit("tabBar-load");
    
    // Initialize uid from sessionStorage on mount
    let res = sessionStorage.getItem("c3RhdHVz");
    if (res == "dmFsaWR1c2Vy") {
      this.token = sessionStorage.getItem("usession");
      this.uid = sessionStorage.getItem("userid");
    } else {
      this.token = "";
      this.uid = "";
    }
    
    // Initialize with static data so UI shows something immediately
    this.newbestmflist = [...this.staticData];
    
    // Try to load data directly if no parent component handles the "receive" event
    await this.loadMFData();
    
    // Also listen for setRec-event in case parent component handles it
    eventBus.$on("setRec-event", (value) => {
      if (value == "stat_ok") {
        this.loadMFData();
      } else if (value && value.stat == "Ok") {
        this.handleMFData(value);
      }
    });
    
    eventBus.$on("user-event", () => {
      let res = sessionStorage.getItem("c3RhdHVz");
      if (res == "dmFsaWR1c2Vy") {
        this.token = sessionStorage.getItem("usession");
        this.uid = sessionStorage.getItem("userid");
      } else {
        this.token = "";
        this.uid = "";
      }
    });
    
    // Watch for route changes to reload data when coming back
    this.$watch(() => this.$route.path, (newPath, oldPath) => {
      if (newPath === '/mutualfund' && oldPath && oldPath.startsWith('/mutualfund/categories')) {
        // Reload data when coming back from categories page
        this.loadMFData();
      }
    });
  },
  activated() {
    // Reload data if component is activated (kept alive or navigated back to)
    if (this.$route.path === '/mutualfund') {
      this.loadMFData();
    }
  },
  beforeUnmount() {
    eventBus.$off("setRec-event");
    eventBus.$off("user-event");
  },

  methods: {
    getImageUrl(imageName) {
      // Return the imported image from the map
      return this.imageMap[imageName] || '';
    },
    async loadMFData() {
      try {
        this.mftableloader = true;
        this.mfcatloader = true;
        
        // Load data from multiple APIs
        const [bestMFRes, topSchemesRes, categoryRes, nfoRes] = await Promise.all([
          getnewBestMF(),
          gettopfirstapi(),
          getnewcatgreapi(),
          getMFnofdata()
        ]);
        
        console.log("API Responses:", { bestMFRes, topSchemesRes, categoryRes, nfoRes });
        
        // Process NFO count
        if (nfoRes) {
          if (nfoRes.stat == "Ok" && nfoRes.data && Array.isArray(nfoRes.data)) {
            this.nfocount = nfoRes.data.length;
          } else if (Array.isArray(nfoRes)) {
            this.nfocount = nfoRes.length;
          } else if (nfoRes.data && Array.isArray(nfoRes.data)) {
            this.nfocount = nfoRes.data.length;
          }
        }
        
        // Process best MF list
        if (bestMFRes) {
          let bestMFData = bestMFRes;
          if (bestMFRes.stat == "Ok" && bestMFRes.data) {
            bestMFData = bestMFRes.data;
          } else if (bestMFRes.stat == "Ok") {
            bestMFData = bestMFRes;
          }
          
          // Initialize with static data
          this.newbestmflist = [...this.staticData];
          
          if (bestMFData && bestMFData.baskets_length && Array.isArray(bestMFData.baskets_length)) {
            this.newbestmflist = this.staticData.map(item => {
              const match = bestMFData.baskets_length.find(apiItem => 
                apiItem.title && apiItem.title.trim() === item.title.trim()
              );
              if (match && match.count) {
                return {
                  ...item,
                  funds: `${match.count} funds`
                };
              }
              return item;
            });
          } else if (bestMFData && Array.isArray(bestMFData)) {
            // Handle if response is directly an array
            this.newbestmflist = this.staticData.map(item => {
              const match = bestMFData.find(apiItem => 
                apiItem.title && apiItem.title.trim() === item.title.trim()
              );
              if (match && (match.count || match.funds)) {
                return {
                  ...item,
                  funds: `${match.count || match.funds || '0'} funds`
                };
              }
              return item;
            });
          }
        } else {
          // Use static data if API fails
          this.newbestmflist = [...this.staticData];
        }
        
        // Process top schemes
        if (topSchemesRes) {
          let topData = null;
          if (topSchemesRes.stat == "Ok" && topSchemesRes.data) {
            topData = topSchemesRes.data;
          } else if (topSchemesRes.stat == "Ok" && Array.isArray(topSchemesRes)) {
            topData = topSchemesRes;
          } else if (topSchemesRes.data && Array.isArray(topSchemesRes.data)) {
            topData = topSchemesRes.data;
          } else if (Array.isArray(topSchemesRes)) {
            topData = topSchemesRes;
          }
          
          if (topData && Array.isArray(topData) && topData.length > 0) {
            this.mftabledata = topData;
            this.headertext = "Top 100 mutual funds";
          } else {
            this.mftabledata = [];
            this.headertext = "Top 100 mutual funds";
          }
        } else {
          this.mftabledata = [];
        }
        
        // Process categories
        if (categoryRes) {
          let categoryData = null;
          if (categoryRes.stat == "Ok" && categoryRes.data) {
            categoryData = categoryRes.data;
          } else if (categoryRes.stat == "Ok" && Array.isArray(categoryRes)) {
            categoryData = categoryRes;
          } else if (categoryRes.data && Array.isArray(categoryRes.data)) {
            categoryData = categoryRes.data;
          } else if (Array.isArray(categoryRes)) {
            categoryData = categoryRes;
          }
          
          if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
            const transformed = categoryData.map(group => {
              if (group.values && Array.isArray(group.values)) {
                const flatValues = group.values.flatMap(subGroup => {
                  if (subGroup.values && Array.isArray(subGroup.values)) {
                    return subGroup.values.map(item => ({
                      category: subGroup.name,
                      ...item
                    }));
                  }
                  return [];
                });

                return {
                  name: group.name,
                  count: flatValues.length,
                  values: flatValues
                };
              }
              return {
                name: group.name,
                count: 0,
                values: []
              };
            });

            this.newcatlistdata = transformed;
          } else {
            this.newcatlistdata = [];
          }
        } else {
          this.newcatlistdata = [];
        }
        
        this.mftableloader = false;
        this.mfcatloader = false;
      } catch (error) {
        console.error("Error loading MF data:", error);
        eventBus.$emit("snack-event", 0, `Error loading mutual fund data: ${error.message || error}`);
        this.mftableloader = false;
        this.mfcatloader = false;
      }
    },
    
    handleMFData(res) {
      if (res && res.stat == "Ok" && res) {
        this.nfocount = res.nfocount || 0;
        this.mftabledata = res.toplistdata || [];
        
        if (res.newapilist && res.newapilist.data) {
          this.newbestmflist = this.staticData.map(item => {
            const match = res.newapilist.data.baskets_length?.find(apiItem => apiItem.title.trim() === item.title.trim());
            if (match) {
              return {
                ...item,
                funds: `${match.count} funds`
              };
            }
            return item;
          });
        }

        if (res.newapicatlist && res.newapicatlist.data) {
          const transformed = res.newapicatlist.data.map(group => {
            const flatValues = group.values.flatMap(subGroup =>
              subGroup.values.map(item => ({
                category: subGroup.name,
                ...item
              }))
            );

            return {
              name: group.name,
              count: flatValues.length,
              values: flatValues
            };
          });

          this.newcatlistdata = transformed;
        }
        
        this.headertext = "Top 100 mutual funds";
        this.mftableloader = false;
        this.mfcatloader = false;
      } else {
        eventBus.$emit("snack-event", 2, res.msg ? res.msg : res);
      }
    },
    
    setNamehide(name) {
      return name && name.length > 30 ? `${name.slice(0, 30)}...` : name;
    },
    setSinglepage(item) {
      console.log("Navigating to single page with item:", item);
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
        console.error("No ISIN or Scheme_Code found in item:", item);
        eventBus.$emit("snack-event", 0, "Unable to navigate: Missing fund identifier");
      }
    },
    putMForder(item, type) {
      eventBus.$emit("menudialog", "mforder", type, item);
    },
    getusedMutual(item) {
      eventBus.$emit("addscript-wl", item, "mf");
    },
    setChangewl(n) {
      this.showtable = 24;
      this.mftabledata = [];
      this.headertext = "";
      
      if (n && n.name) {
        this.headertext = n.name + " Funds";
        let newlisttt = this.newcatlistdata.find(
          group => group.name.toLowerCase() === n.name.toLowerCase()
        );
        if (newlisttt && newlisttt.values) {
          this.mftabledata = newlisttt.values;
        }
      }
      
      this.mftableloader = false;
    },
    setMFrowdata(item) {
      this.$router.push({ name: "mutual fund amc", params: { mfamc: item } });
    },
    navigateToCategory(category) {
      // Store category data in sessionStorage for navigation
      sessionStorage.setItem('mf_category_data', JSON.stringify(category));
      this.$router.push({ 
        name: 'mutual fund categories', 
        query: { 
          title: category.title,
          titlekey: category.titlekey 
        } 
      });
    },
  },
};
</script>

<style scoped>
.mf-table-header {
  background-color: #F5F5F5 !important;
  position: sticky;
  top: 0;
  z-index: 10;
}

.mf-table-header th {
  background-color: #F5F5F5 !important;
  border-bottom: 1px solid #E0E0E0 !important;
}

.mftable-responsive :deep(.v-data-table__thead) {
  background-color: #F5F5F5 !important;
}

.mftable-responsive :deep(.v-data-table__thead th) {
  background-color: #F5F5F5 !important;
  border-bottom: 1px solid #E0E0E0 !important;
  padding: 12px 16px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}
</style>
