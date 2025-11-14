<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12">
        <v-col cols="3" class="d-none d-md-none"> </v-col>
        <v-col cols="12">
          <v-card style="border: 1px solid #E0E0E0" variant="outlined"
            class="elevation-0 rounded-lg mb-8 mb-md-0 crd-trn">
            <v-toolbar class="tool-sty elevation-0 pa-3 crd-trn" density="compact">
              <v-list-item v-if="paramsdata && paramsdata.title" class="pl-0">
                <template v-slot:prepend>
                  <v-avatar class="mr-0">
                    <img :src="getImageUrl(paramsdata.image)" width="40px" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold title pl-0">{{ paramsdata.title }}</v-list-item-title>
                <v-list-item-subtitle class="fs-12 txt-666">{{ paramsdata.subtitle }}</v-list-item-subtitle>
              </v-list-item>
              <v-spacer></v-spacer>
              <div>
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
                      </svg>
                    </span>
                    {{ paramsdata ? paramsdata.funds : "0" }}
                  </v-list-item-title>
                </v-list-item>
              </div>

              <v-text-field rounded="pill" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search" class="pwidth rounded-pill ml-1 d-none d-md-flex search-field-center" density="compact"
                variant="solo" flat bg-color="secbg"></v-text-field>
            </v-toolbar>
            <v-data-table must-sort :sort-by="[{ key: '', order: 'asc' }]" hide-default-footer hide-default-header
              fixed-header :loading="mftableloader" :search="opensearch"
              class="rounded-0 overflow-y-auto ipo-data-table" :headers="tradeheader" height="calc(100vh - 180px)"
              :items="mftabledata" :items-per-page="mftabledata && mftabledata.length > 0 ? showtable : 0"
              item-key="Scheme_Code">
              <template v-slot:body="{ items, headers }">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead style="background-color: #F5F5F5; position: sticky; top: 0; z-index: 10;">
                    <tr>
                      <th v-for="header in tradeheader" :key="header.key" :class="header.class" :style="{
                        textAlign: header.align === 'end' ? 'right' : 'left',
                        padding: '14px',
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
                              :class="{ 'fund-name-hover': hoveredRow === o }"
                              style="cursor: pointer; line-height: 1.4;">
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
                                  {{ item.Type ? item.Type : "" }}
                                </span>
                              </v-chip>
                              <v-chip v-if="item.SubType" size="x-small" variant="flat" class="mr-1 mb-1" :style="{
                                backgroundColor: '#F1F3F8',
                                color: '#666666',
                                borderRadius: '5px',
                                height: '20px'
                              }">
                                <span class="fs-10">
                                  {{ item.SubType ? item.SubType : "" }}
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
                      <td class="text-right font-weight-medium px-4 txt-000"
                        style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item.AUM ? Number(item.AUM).toFixed(2) : "0.00" }}
                      </td>
                      <td class="text-right font-weight-medium px-4 txt-000"
                        style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item['1Year'] ? Number(item['1Year']).toFixed(2) : "0.00" }}
                      </td>
                      <td class="text-right font-weight-medium px-4 txt-000"
                        style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
                        {{ item['3Year'] ? Number(item['3Year']).toFixed(2) : "0.00" }} %
                      </td>
                      <td class="text-right font-weight-medium px-4 txt-000"
                        style="width: 15%; vertical-align: middle; padding: 16px; text-align: right;">
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
      </v-col>
    </v-row>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus.js";
import { getnewBestMF, getnewcatgreapi } from "@/components/mixins/getAPIdata";

// Import images
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
    mfallsearchloader: true,

    bestmfdata: [],
    mobilefilter: false,
    paramsdata: null
  }),
  computed: {
    tradeheader() {
      return [
        { title: "Fund name", key: "name", sortable: false, class: "pl-md-6 pl-4", align: "start", width: "40%" },
        { title: "AUM", key: "AUM", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
        { title: "1yr CAGR", key: "1Year", align: "end", sortable: false, class: "pr-md-6 pr-4", width: "15%" },
        { title: "3yr CAGR", key: "3Year", align: "end", sortable: true, class: "pr-md-6 pr-4", width: "15%" },
        { title: "Min. Invest", key: "Minimum_Purchase_Amount", sortable: true, align: "end", class: "pr-md-6 pr-4", width: "15%" },
      ];
    },
    isLoggedIn() {
      // Check if user is logged in - check both uid and sessionStorage
      const sessionUid = sessionStorage.getItem("userid");
      const uid = this.uid || sessionUid;
      // Return true only if uid is a valid non-empty string
      return uid && uid !== null && uid !== '' && uid !== 'null' && uid !== 'undefined' && uid.trim() !== '';
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
    noDataImage() {
      return noDataImg;
    },
  },
  created() {
    //
  },
  async mounted() {
    // Get category data from query params or sessionStorage
    const categoryData = sessionStorage.getItem('mf_category_data');
    if (categoryData) {
      try {
        this.paramsdata = JSON.parse(categoryData);
      } catch (e) {
        console.error("Error parsing category data:", e);
      }
    }

    // Fallback to query params if available
    if (!this.paramsdata && this.$route.query.title) {
      this.paramsdata = {
        title: this.$route.query.title,
        titlekey: this.$route.query.titlekey,
        image: this.getImageForTitle(this.$route.query.title),
        subtitle: '',
        funds: '0 funds'
      };
    }

    if (!this.paramsdata || !this.paramsdata.title) {
      this.$router.push('/mutualfund');
      return;
    }

    console.log("Category data:", this.paramsdata);

    eventBus.$emit("tabBar-load");
    eventBus.$emit("login-event");

    // Load data directly
    await this.loadCategoryData();

    // Also listen for setRec-event in case parent component handles it
    eventBus.$on("setRec-event", (mfdata) => {
      if (mfdata == "stat_ok") {
        this.loadCategoryData();
      } else {
        this.handleMFData(mfdata);
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

    // Watch for route changes to reload data
    this.$watch(() => this.$route.query, (newQuery) => {
      if (newQuery.title && newQuery.title !== this.paramsdata?.title) {
        this.paramsdata = {
          title: newQuery.title,
          titlekey: newQuery.titlekey,
          image: this.getImageForTitle(newQuery.title),
          subtitle: '',
          funds: '0 funds'
        };
        this.loadCategoryData();
      }
    });
  },
  beforeUnmount() {
    eventBus.$off("setRec-event");
    eventBus.$off("user-event");
  },

  methods: {
    getImageUrl(imageName) {
      return this.imageMap[imageName] || '';
    },
    getImageForTitle(title) {
      // Map title to image name
      const titleMap = {
        'Tax Saving': 'loan.svg',
        'High Growth Equity': 'growthnew.svg',
        'Stable Debt': 'goldcoin.svg',
        'Sectoral Thematic': 'transactions.svg',
        'International Exposure': 'globe.svg',
        'Balanced Hybrid': 'balancehybrid.svg'
      };
      return titleMap[title] || 'loan.svg';
    },
    async loadCategoryData() {
      try {
        this.mftableloader = true;
        this.mftabledata = []; // Reset data

        // Load best MF data to get category data
        const bestMFRes = await getnewBestMF();

        console.log("Best MF Response:", bestMFRes);
        console.log("Params data:", this.paramsdata);
        console.log("Looking for category:", this.paramsdata?.title);

        let categoryDataFound = false;

        if (bestMFRes) {
          let bestMFData = bestMFRes;

          // Handle different response structures
          if (bestMFRes.stat == "Ok" && bestMFRes.data) {
            bestMFData = bestMFRes.data;
          } else if (bestMFRes.stat == "Ok") {
            bestMFData = bestMFRes;
          } else if (bestMFRes.data) {
            // Response is {data: {...}} without stat property
            bestMFData = bestMFRes.data;
          }

          console.log("Processed bestMFData:", bestMFData);
          console.log("bestMFData keys:", Object.keys(bestMFData || {}));

          // Structure 1: { newapilist: { data: { baskets: { "Tax Saving": [...] } } } }
          if (bestMFData.newapilist && bestMFData.newapilist.data && bestMFData.newapilist.data.baskets) {
            const categoryKey = this.paramsdata.title;
            console.log("Checking baskets structure:", bestMFData.newapilist.data.baskets);
            console.log("Available basket keys:", Object.keys(bestMFData.newapilist.data.baskets || {}));
            if (bestMFData.newapilist.data.baskets[categoryKey]) {
              this.mftabledata = Array.isArray(bestMFData.newapilist.data.baskets[categoryKey])
                ? bestMFData.newapilist.data.baskets[categoryKey]
                : [];
              categoryDataFound = true;
              console.log("Found data in newapilist.data.baskets:", this.mftabledata.length);
            }
          }

          // Structure 2: { baskets: { "Tax Saving": [...], "High Growth Equity": [...] } }
          if (!categoryDataFound && bestMFData.baskets) {
            const categoryKey = this.paramsdata.title;
            console.log("Checking baskets direct:", bestMFData.baskets);
            console.log("Available basket keys:", Object.keys(bestMFData.baskets || {}));
            if (bestMFData.baskets[categoryKey]) {
              this.mftabledata = Array.isArray(bestMFData.baskets[categoryKey])
                ? bestMFData.baskets[categoryKey]
                : [];
              categoryDataFound = true;
              console.log("Found data in baskets:", this.mftabledata.length);
            }
          }

          // Structure 3: { baskets_length: [{ title: "Tax Saving", data: [...] }, ...] }
          if (!categoryDataFound && bestMFData.baskets_length && Array.isArray(bestMFData.baskets_length)) {
            console.log("Checking baskets_length:", bestMFData.baskets_length);
            const match = bestMFData.baskets_length.find(basket =>
              basket.title && basket.title.trim() === this.paramsdata.title.trim()
            );
            if (match) {
              console.log("Found match in baskets_length:", match);
              this.mftabledata = Array.isArray(match.data)
                ? match.data
                : (Array.isArray(match.funds) ? match.funds : []);
              categoryDataFound = true;
              console.log("Found data in baskets_length:", this.mftabledata.length);
            }
          }

          // Structure 4: { "taxSaving": [...], "highGrowthEquity": [...] }
          if (!categoryDataFound && this.paramsdata.titlekey && bestMFData[this.paramsdata.titlekey]) {
            console.log("Checking titlekey:", this.paramsdata.titlekey, bestMFData[this.paramsdata.titlekey]);
            this.mftabledata = Array.isArray(bestMFData[this.paramsdata.titlekey])
              ? bestMFData[this.paramsdata.titlekey]
              : [];
            categoryDataFound = true;
            console.log("Found data using titlekey:", this.mftabledata.length);
          }

          // Structure 5: Check if data is nested further (e.g., data.newapilist or data.baskets)
          if (!categoryDataFound && bestMFData.data) {
            console.log("Checking nested data structure:", bestMFData.data);
            const nestedData = bestMFData.data;

            if (nestedData.newapilist && nestedData.newapilist.data && nestedData.newapilist.data.baskets) {
              const categoryKey = this.paramsdata.title;
              console.log("Checking nested baskets structure:", nestedData.newapilist.data.baskets);
              if (nestedData.newapilist.data.baskets[categoryKey]) {
                this.mftabledata = Array.isArray(nestedData.newapilist.data.baskets[categoryKey])
                  ? nestedData.newapilist.data.baskets[categoryKey]
                  : [];
                categoryDataFound = true;
                console.log("Found data in nested newapilist.data.baskets:", this.mftabledata.length);
              }
            }

            if (!categoryDataFound && nestedData.baskets) {
              const categoryKey = this.paramsdata.title;
              if (nestedData.baskets[categoryKey]) {
                this.mftabledata = Array.isArray(nestedData.baskets[categoryKey])
                  ? nestedData.baskets[categoryKey]
                  : [];
                categoryDataFound = true;
                console.log("Found data in nested baskets:", this.mftabledata.length);
              }
            }
          }
        }

        // If no data found in bestMF, try getnewcatgreapi
        if (!categoryDataFound || !this.mftabledata || this.mftabledata.length === 0) {
          console.warn("No data found in bestMF response, trying getnewcatgreapi");

          try {
            const categoryRes = await getnewcatgreapi();
            console.log("Category API Response:", categoryRes);
            console.log("Category API Response keys:", Object.keys(categoryRes || {}));

            if (categoryRes) {
              let categoryData = categoryRes;
              if (categoryRes.stat == "Ok" && categoryRes.data) {
                categoryData = categoryRes.data;
              } else if (categoryRes.stat == "Ok") {
                categoryData = categoryRes;
              } else if (categoryRes.data && Array.isArray(categoryRes.data)) {
                // Response is {data: Array(6)}
                categoryData = categoryRes.data;
              }

              console.log("Processed categoryData:", categoryData);
              console.log("Is array:", Array.isArray(categoryData));

              // Process category data structure
              if (Array.isArray(categoryData)) {
                console.log("Category data array length:", categoryData.length);
                console.log("Category data array:", categoryData);
                console.log("First item:", categoryData[0]);

                // Find the matching category group - try multiple matching strategies
                let categoryGroup = categoryData.find(group => {
                  const match = group.name && group.name.toLowerCase() === this.paramsdata.title.toLowerCase();
                  console.log("Comparing:", group.name, "with", this.paramsdata.title, "=", match);
                  return match;
                });

                // If not found, try partial match
                if (!categoryGroup) {
                  categoryGroup = categoryData.find(group => {
                    const groupName = group.name ? group.name.toLowerCase() : '';
                    const title = this.paramsdata.title ? this.paramsdata.title.toLowerCase() : '';
                    const match = groupName.includes(title) || title.includes(groupName);
                    console.log("Partial match:", group.name, "with", this.paramsdata.title, "=", match);
                    return match;
                  });
                }

                // If still not found, check if the array contains the category data directly
                if (!categoryGroup && categoryData.length > 0) {
                  // Maybe the structure is different - check if first item has the structure we need
                  console.log("No category group found, checking array structure");
                  console.log("All category names:", categoryData.map(g => g.name));

                  // Try to find by titlekey or other matching
                  categoryGroup = categoryData.find(group => {
                    if (group.titlekey && group.titlekey === this.paramsdata.titlekey) {
                      return true;
                    }
                    if (group.title && group.title.toLowerCase() === this.paramsdata.title.toLowerCase()) {
                      return true;
                    }
                    return false;
                  });
                }

                console.log("Found category group:", categoryGroup);

                if (categoryGroup) {
                  // Check different possible data structures
                  if (categoryGroup.values && Array.isArray(categoryGroup.values)) {
                    console.log("Category group values:", categoryGroup.values);
                    console.log("First value item:", categoryGroup.values[0]);

                    // Flatten nested structure if needed
                    const flatValues = categoryGroup.values.flatMap(subGroup => {
                      if (subGroup.values && Array.isArray(subGroup.values)) {
                        console.log("Found nested values in subGroup:", subGroup.values.length);
                        return subGroup.values;
                      }
                      // If subGroup itself is an object with fund data, return it
                      if (subGroup && typeof subGroup === 'object' && !Array.isArray(subGroup)) {
                        return subGroup;
                      }
                      return subGroup;
                    });

                    this.mftabledata = flatValues || [];
                    categoryDataFound = true;
                    console.log("Found data in category API:", this.mftabledata.length);
                  } else if (Array.isArray(categoryGroup)) {
                    // If categoryGroup itself is an array
                    this.mftabledata = categoryGroup;
                    categoryDataFound = true;
                    console.log("Category group is array, using directly:", this.mftabledata.length);
                  } else if (categoryGroup.data && Array.isArray(categoryGroup.data)) {
                    // If data is in categoryGroup.data
                    this.mftabledata = categoryGroup.data;
                    categoryDataFound = true;
                    console.log("Found data in categoryGroup.data:", this.mftabledata.length);
                  }
                }
              }
            }
          } catch (catError) {
            console.error("Error loading from category API:", catError);
          }
        }

        // Process the data to ensure it has the right structure
        if (this.mftabledata && this.mftabledata.length > 0) {
          this.mftabledata = this.mftabledata.map(item => {
            // Ensure name field exists
            if (!item.name && item.Scheme_Name) {
              item.name = item.Scheme_Name;
            }
            // Ensure other required fields exist
            if (!item.Type && item.SCHEME_CATEGORY) {
              item.Type = item.SCHEME_CATEGORY;
            }
            if (!item.SubType && item.SCHEME_SUB_CATEGORY) {
              item.SubType = item.SCHEME_SUB_CATEGORY;
            }
            // Ensure Purchase_Allowed field
            if (item.Purchase_Allowed === undefined && item.Purchase_Allowed !== null) {
              item.Purchase_Allowed = item.Purchase_Allowed || 'Y';
            }
            return item;
          });
        }

        // Update funds count
        if (this.paramsdata && this.mftabledata) {
          this.paramsdata.funds = `${this.mftabledata.length} funds`;
        }

        console.log("Final mftabledata:", this.mftabledata?.length || 0, "items");
        console.log("First item:", this.mftabledata?.[0]);

        this.mftableloader = false;
        this.mfallsearchloader = false;

        // Set user data
        let res = sessionStorage.getItem("c3RhdHVz");
        if (res == "dmFsaWR1c2Vy") {
          this.token = sessionStorage.getItem("usession");
          this.uid = sessionStorage.getItem("userid");
        } else {
          this.token = "";
          this.uid = "";
        }
      } catch (error) {
        console.error("Error loading category data:", error);
        eventBus.$emit("snack-event", 0, `Error loading category data: ${error.message || error}`);
        this.mftableloader = false;
        this.mfallsearchloader = false;
      }
    },

    handleMFData(mfdata) {
      if (mfdata && mfdata.stat == "Ok") {
        if (mfdata.newapilist && mfdata.newapilist.data && mfdata.newapilist.data.baskets) {
          const categoryKey = this.paramsdata.title;
          if (mfdata.newapilist.data.baskets[categoryKey]) {
            this.mftabledata = mfdata.newapilist.data.baskets[categoryKey] || [];

            if (this.paramsdata) {
              this.paramsdata.funds = `${this.mftabledata.length} funds`;
            }
          }
        }

        this.allmutualfunddata = mfdata.data || [];
        this.mftableloader = false;
        this.mfallsearchloader = false;
      } else if (mfdata) {
        eventBus.$emit("snack-event", 2, mfdata.msg ? mfdata.msg : mfdata);
        this.mfallsearchloader = false;
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
    async setMFcatdata() {
      this.mftableloader = false;
      this.mfallsearchloader = false;

      let res = sessionStorage.getItem("c3RhdHVz");
      if (res == "dmFsaWR1c2Vy") {
        this.token = sessionStorage.getItem("usession");
        this.uid = sessionStorage.getItem("userid");
      } else {
        this.token = "";
        this.uid = "";
      }
    },
    goToLogin() {
      // Trigger login by redirecting to login URL
      window.location.assign(
        `https://desk.zebuetrade.com/mynt/?url=${window.location.origin + window.location.pathname}`
      );
    },
    putMForder(item, type) {
      eventBus.$emit("menudialog", "mforder", type, item);
    },
    getusedMutual(item) {
      eventBus.$emit("addscript-wl", item, "mf");
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
