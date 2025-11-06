<template>
    <div class="pt-0">
      <v-row no-gutters class="pt-0">
        <v-col cols="12">
          <v-card class="elevation-0 mb-4 mb-md-14 pa-4 pa-md-6 rounded-lg" color="#834EDA">
      <v-row>
         <!-- Text Column -->
         <v-col cols="12" md="4">
           <p class="fs-26 d-md-none font-weight-bold lh-24 white--text">Invest in IPOs</p>
           <p class="fs-36 d-none d-md-flex font-weight-bold lh-32 white--text">Invest in IPOs</p>
           <p class="title white--text mb-0 lh-24 font-weight-regular">Initial public offering of a new stock issuance for the first time to market.</p>
         </v-col>
  
         <!-- Cards Column -->
         <v-col cols="7" class="d-none ml-auto mr-4 d-md-flex pos-rlt">
           <div style="width: 100%" class="pos-abs d-inline-flex flex-row-reverse">
             <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl text-center">
               <img :src="mainCard3Src" class="px-4 pt-6 pb-2" alt="main-card-3" width="79%" />
               <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0 maintext--text">
                 Check IPO <br />
                 gains post<br />
                 listing.
               </p>
             </v-card>
             <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl text-center">
               <img :src="mainCard2Src" class="px-4 pt-6 pb-2" alt="main-card-2" width="79%" />
               <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0 maintext--text">
                 Invest safely<br />
                 in small<br />
                 via UPI.
               </p>
             </v-card>
             <v-card width="170px" class="pb-4 mr-3 stk-land-crds rounded-xl text-center">
               <img :src="mainCard1Src" class="px-4 pt-6 pb-2" alt="main-card-1" width="79%" />
               <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0 maintext--text">
                 Build wealth<br />
                 investing on<br />
                 main IPOs
               </p>
             </v-card>
           </div>
         </v-col>
      </v-row>
    </v-card>
  
    <div class="default-tab">
      <v-tabs class="d-md-none" color="primary" fixed-tabs v-model="ipotype">
        <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">
          <v-badge color="primary" :content="iposdatas[0] ? iposdatas[0].length : ''" :model-value="iposdatas[0] && iposdatas[0].length > 0">
            <span>Main stream IPOs</span>
          </v-badge>
        </v-tab>
        <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">
          <v-badge color="primary" :content="iposdatas[1] ? iposdatas[1].length : ''" :model-value="iposdatas[1] && iposdatas[1].length > 0">
            <span>SME IPOs</span>
          </v-badge>
        </v-tab>
        <v-tabs-slider></v-tabs-slider>
      </v-tabs>
      <v-tabs class="d-none d-md-flex" color="primary" fixed v-model="ipotype">
        <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">
          <v-badge color="primary" :content="iposdatas[0] ? iposdatas[0].length : ''" :model-value="iposdatas[0] && iposdatas[0].length > 0">
            <span>Main stream IPOs</span>
          </v-badge>
        </v-tab>
        <v-tab class="font-weight-bold subtitle-2 mb-0 text-none">
          <v-badge color="primary" :content="iposdatas[1] ? iposdatas[1].length : ''" :model-value="iposdatas[1] && iposdatas[1].length > 0">
            <span>SME IPOs</span>
          </v-badge>
        </v-tab>
        <v-tabs-slider></v-tabs-slider>
      </v-tabs>
    </div>
  
          <v-card style="border: 1px solid var(--outline)" class="crd-trn elevation-0 rounded-lg mb-0 d-none d-md-block">
            <v-toolbar class="tool-sty elevation-0 py-4 mb-0 px-4 pb-0 crd-trn" density="compact">
    <v-row align="center" class="w-100">
      <!-- First column: Image -->
      <v-col cols="auto">
        <v-img :src="currentMainCardSrc" width="50" height="50" />
      </v-col>
  
      <!-- Second column: Title & Subtitle -->
      <v-col>
        <div>
          <div class="font-weight-bold title">
            {{ ipotype === 0 ? "Main stream IPOs" : "Small and Medium Enterprises IPOs" }}
          </div>
          <div class="fs-12 subtext--text">
            {{ ipotype === 0
              ? "Initial public offering a new stock issuance for the first time."
              : "Small and Medium Enterprises a new stock issuance for the first time." }}
          </div>
        </div>
      </v-col>
    </v-row>
  </v-toolbar>
  
  
            <v-data-table
              must-sort
              :sort-by="[{ key: 'biddingStartDate', order: 'asc' }]"
              hide-default-footer
              fixed-header
              :loading="loading"
              class="rounded-0 overflow-y-auto"
              :headers="tradeheader"
              height="calc(100vh - 180px)"
              :items="iposdatas[ipotype]"
              :items-per-page="iposdatas[ipotype] && iposdatas[ipotype].length > 0 ? showtable : 0"
              item-key="Scheme_Code"
            >
              <template v-slot:body="{items, headers}">
                <tr v-if="items && items.length > 0" class="table-row" v-for="(item, o) in items" :key="o">
                  <td class="pos-rlt" cols="1">
                    <P class="fs-13 font-weight-medium mb-0 maintext--text table-hov-text mt-2 ">
                      {{ item.name ? item.name : "" }}
                    </P>
                    <v-chip-group column class="mb-1">
                      <v-chip color="secbg" size="x-small" class="table-hov-prd" text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important">
                        <span class="font-weight-medium fs-10">
                          {{ item.symbol ? item.symbol : "" }}
                        </span>
                      </v-chip>
                      <v-chip :color="item.dateof ? '#FFF6E6' : 'secgreen'" size="x-small" :text-color="item.dateof ? '#B37702' : 'maingreen'" style="border-radius: 5px; padding: 10px 8px !important">
                        <span class="font-weight-medium fs-10">
                          {{ item.dateof ? "Upcoming" : "Open" }}
                        </span>
                      </v-chip>
                    </v-chip-group>
                  </td>
                  <td>
                    <div @click.stop class="table-hov mb-2">
                      <v-btn @click="handleApplyClick(item, ipotype)" size="small" class="elevation-0 rounded-pill text-none primary--text font-weight-bold" color="#F1F3F8">{{ item.dateof ? "Pre" : "" }} Apply</v-btn>
                    </div>
                    <span class="font-weight-medium ">{{ item.datebit ? item.datebit : "" }}</span>
                  </td>
                  <td class="text-right font-weight-medium">₹{{ item.minPrice ? item.minPrice : "0.00" }} - ₹{{ item.maxPrice ? item.maxPrice : "0.00" }}</td>
                  <td class="text-right font-weight-medium">
                    ₹{{ item.minPrice ? item.minPrice * item.minBidQuantity : "0.00" }} <br /><span class="subtext--text font-weight-regular">{{ item.minBidQuantity ? item.minBidQuantity : "0" }} Qty.</span>
                  </td>
                </tr>
                <template v-if="items && items.length > 0 && showtable < iposdatas[ipotype].length">
                  <tr>
                    <td :colspan="headers.length">
                      <v-btn color="primary" variant="text" class="elevation-0 text-none font-weight-bold py-4" @click="showtable += 24" block>show more</v-btn>
                    </td>
                  </tr>
                </template>
                <template v-if="!items || items.length === 0">
                  <tr>
                    <td :colspan="headers.length" class="text-center">
                      <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80px" :src="noDataFolder" />
                        <h4 class="txt-999 font-weight-regular caption">There is no {{ ipotype == 0 ? "IPOs" : ipotype == 1 ? "SME" : "" }} data here yet!</h4>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </v-data-table>
          </v-card>
          <div class="d-md-none overflow-hidden ">
            <v-divider></v-divider>
            <v-list-item class="pl-0">
              <v-list-item-icon class="mr-3">
                <img width="48px" :src="currentMainCardSrc" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold fs-18">{{ ipotype == 0 ? "Main stream IPOs" : "Small and Medium Enterprises IPOs" }}</v-list-item-title>
                <p class="fs-12 subtext--text mb-0">{{ ipotype == 0 ? "Initial public offering a new stock issuance for the first time." : "Small and Medium Enterprises a new stock issuance for the first time." }}</p>
              </v-list-item-content>
            </v-list-item>
            <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
            <div v-if="iposdatas[ipotype] && iposdatas[ipotype].length > 0">
              <v-card v-for="(item, o) in iposdatas[ipotype].length < showtable ? iposdatas[ipotype].slice(0, showtable) : iposdatas[ipotype]" :key="o" class="elevation-0 rounded-0 overflow-hidden crd-trn">
                <div class="px-0">
                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-0 pt-1">
                      <v-list-item-title class="fs-13 font-weight-bold mb-0 maintext--text table-hov-text mt-2">
                        {{ item.name ? item.name : "" }}
                      </v-list-item-title>
                      <v-chip-group column class="mb-1">
                        <v-chip color="secbg" size="x-small" class="table-hov-prd" text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important">
                          <span class="font-weight-medium fs-10">
                            {{ item.symbol ? item.symbol : "" }}
                          </span>
                        </v-chip>
                        <v-chip :color="item.dateof ? '#FFF6E6' : 'secgreen'" size="x-small" :text-color="item.dateof ? '#B37702' : 'maingreen'" style="border-radius: 5px; padding: 10px 8px !important">
                          <span class="font-weight-medium fs-10">
                            {{ item.dateof ? "Upcoming" : "Open" }}
                          </span>
                        </v-chip>
                        <v-chip class="px-0 crd-trn" size="x-small" text-color="#000">
                          {{ item.datebit ? item.datebit : "" }}
                        </v-chip>
                      </v-chip-group>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
  
                  <v-row class="py-2" no-gutters>
                    <v-col cols="6">
                      <p class="mb-1 fs-12 subtext--text">Price range</p>
                      <p class="mb-1 fs-12 font-weight-bold maintext--text">₹{{ item.minPrice ? item.minPrice : "0.00" }} - ₹{{ item.maxPrice ? item.maxPrice : "0.00" }}</p>
                    </v-col>
                    <v-col cols="6" class="text-right">
                      <p class="mb-1 fs-12 subtext--text">
                        Min. qty: <span class="font-weight-bold maintext--text">{{ item.lotSize ? item.lotSize : "0" }}</span>
                      </p>
                      <p class="mb-1 fs-12 subtext--text">
                        Min. Inv: <span class="font-weight-bold maintext--text">₹{{ item.minPrice ? item.minPrice * item.minBidQuantity : "0.00" }}</span>
                      </p>
                    </v-col>
                  </v-row>
                </div>
                <div class="px-4">
                  <v-btn block @click="uid ? IposOrder(item, ipotype) : $emit('gologin')" size="small" class="elevation-0 rounded-pill text-none primary--text font-weight-bold mb-2" color="#F1F3F8">{{ item.dateof ? "Pre" : "" }} Apply</v-btn>
                </div>
                <v-card v-if="uid && showtable - 1 != o" class="pt-1 rounded-0 elevation-0" color="outline"></v-card>
              </v-card>
            </div>
            <v-card v-else class="elevation-0 rounded-0 text-center crd-trn pl-10" height="200">
    <div class="mx-auto align-center">
      <v-img :src="noDataFolder" width="70" class="mb-2 mx-auto" />
      <h4 class="txt-999 font-weight-regular fs-14">
        There is no data here yet!
      </h4>
    </div>
  </v-card>
  
            <v-btn v-if="iposdatas[ipotype] && showtable < iposdatas[ipotype].length" color="primary" variant="text" class="elevation-0 text-none font-weight-bold py-4 mb-1" @click="showtable += 24" block>show more</v-btn>
          </div>
        </v-col>
        <v-col cols="12">
          <v-toolbar @click="addscript = true" flat class="tool-sty crd-trn" density="compact">
            <p class="mb-0 font-weight-bold">IPO Performance {{ new Date().getFullYear() }}</p>
            <v-spacer></v-spacer>
          </v-toolbar>
          <div v-if="iposdatas[2]">
            <v-row>
              <v-col cols="12" md="6" v-for="(p, t) in iposdatas[2].slice(0, 10)" :key="t">
                <v-card class="rounded-lg crd-trn" variant="outlined" style="border: 1px solid #E0E0E0;">
                  <div>
                    <v-card color="secbg" class="elevation-0 rounded-b-0 rounded-t-lg px-3 py-2" style="display: flex; align-items: center; justify-content: space-between;">
    <!-- Left content -->
    <div>
      <div class="fs-15 font-weight-medium">{{ p["Company Name"] }}</div>
      <div class="fs-12 grey--text">{{ p.covertdate ? p.covertdate.slice(4, 16) : "" }}</div>
    </div>
  
    <!-- Right content -->
    <div class="fs-14" :class="p.listing_gain_per > 0 ? 'txt-gre' : p.listing_gain_per < 0 ? 'txt-red' : 'maintext--text'">
      {{ p.listing_gain_per ? p.listing_gain_per : "0.00" }}%
    </div>
  </v-card>
  
  
                    <v-card class="elevation-0 rounded-t-0 rounded-b-lg px-2 py-1">
                      <v-row no-gutters>
                        <v-col cols="6" class="subtext--text fs-13"
                          >Issue price<span class="fs-14 maintext--text font-weight-medium"> ₹{{ p.Price_Range }}</span></v-col
                        >
                        <v-col cols="6" class="subtext--text fs-13 text-right"
                          >Listing gain <span class="fs-14 font-weight-medium" :class="p.listing_gain > 0 ? 'txt-gre' : p.listing_gain < 0 ? 'txt-red' : 'maintext--text'"> ₹{{ p.listing_gain ? p.listing_gain : "0.00" }}</span></v-col
                        >
                      </v-row>
                    </v-card>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <v-skeleton-loader v-for="n in 8" :key="n" class="rounded-lg mb-3" width="100%" height="90" type="card"></v-skeleton-loader>
          </div>
          <v-btn color="primary" variant="text" class="elevation-0 text-none font-weight-bold py-4 mb-6 mb-md-0 mt-2" to="/ipo/performance" block>Performance dashboard</v-btn>
        </v-col>
      </v-row>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { useAuthStore } from '../../../stores/authStore'
  import { useAppStore } from '../../../stores/appStore'
  import { getIposIpo, getIposSme, getIposPerform } from '../../../components/mixins/getAPIdata.js' 
  
  // Import assets statically
  import mainCard1 from '@/assets/ipos/main-card-1.svg'
  import mainCard1d from '@/assets/ipos/main-card-1d.svg'
  import mainCard2 from '@/assets/ipos/main-card-2.svg'
  import mainCard2d from '@/assets/ipos/main-card-2d.svg'
  import mainCard3 from '@/assets/ipos/main-card-3.svg'
  import mainCard3d from '@/assets/ipos/main-card-3d.svg'
  import noDataFolder from '@/assets/no data folder.svg'
  
  const router = useRouter()
  const route = useRoute()
  const theme = useTheme()
  const authStore = useAuthStore()
  const appStore = useAppStore()
  
  const emit = defineEmits(['gologin', 'receive'])
  
  const ipotype = ref(0)
  const iposdatas = ref([[], [], []])
  const loading = ref(true)
  const opensearch = ref(null)
  const showtable = ref(24)
  const uid = ref(null)
  const token = ref("")
  const addscript = ref(false)
  
  // Computed properties for dynamic assets
  const mainCard1Src = computed(() => theme.global.name.value === 'dark' ? mainCard1d : mainCard1)
  const mainCard2Src = computed(() => theme.global.name.value === 'dark' ? mainCard2d : mainCard2)
  const mainCard3Src = computed(() => theme.global.name.value === 'dark' ? mainCard3d : mainCard3)
  const currentMainCardSrc = computed(() => {
    const isDark = theme.global.name.value === 'dark'
    if (ipotype.value === 0) {
      return isDark ? mainCard1d : mainCard1
    } else {
      return isDark ? mainCard2d : mainCard2
    }
  })
  
  const tradeheader = computed(() => {
    return [
      { title: "Stock name", key: "name", width: "36%" },
      { title: "IPO date", key: "date" },
      { title: "Price range", key: "Price", align: "end" },
      { title: "Min. amount", key: "minPrice", align: "end" },
    ]
  })
  
  // Handle receive event
  const handleReceiveEvent = (event) => {
    const res = event.detail || event
    if (res == 'stat_ok') {
      emit('receive', 'ipos')
    } else if (res && res.ipo && res.sme) {
      getiposdata(res)
    } else {
      // If event fires but no data, stop loading
      loading.value = false
    }
  }
  
  // Handle user event
  const handleUserEvent = () => {
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
      token.value = sessionStorage.getItem("usession")
      uid.value = sessionStorage.getItem("userid")
    }
  }
  
  onMounted(async () => {
    // Emit events using Custom Events (matching original eventBus.$emit)
    window.dispatchEvent(new CustomEvent('tabBar-load'))
    window.dispatchEvent(new CustomEvent('login-event'))
    
    appStore.setMainLoader(false)
    emit('receive', 'ipos')
    
    window.addEventListener('setRec-event', handleReceiveEvent)
    window.addEventListener('user-event', handleUserEvent)
    
    // Check for tab parameter
    const tab = new URL(window.location.href).searchParams.get("t")
    ipotype.value = tab == "sme" ? 1 : 0
    
    // Check initial user status
    handleUserEvent()
    
    // Fetch IPO data directly
    await getIposApis()
    
    // Set a timeout to stop loading if no data arrives after 5 seconds
    setTimeout(() => {
      if (loading.value) {
        loading.value = false
      }
    }, 5000)
  })
  
  // Fetch IPO APIs
  const getIposApis = async () => {
    try {
      loading.value = true
      const [ipoData, smeData, perfData] = await Promise.all([
        getIposIpo(),
        getIposSme(),
        getIposPerform(new Date().getFullYear())
      ])
      
      const iposdatasObj = {
        ipo: ipoData || {},
        sme: smeData || {},
        perf: perfData || {}
      }
      
      // Process and set data
      getiposdata(iposdatasObj)
    } catch (error) {
      console.error('Error fetching IPO data:', error)
      loading.value = false
    }
  }
  
  onBeforeUnmount(() => {
    window.removeEventListener('setRec-event', handleReceiveEvent)
    window.removeEventListener('user-event', handleUserEvent)
  })
  
  const getiposdata = (receive) => {
    // Ensure arrays exist
    if (!Array.isArray(iposdatas.value)) {
      iposdatas.value = [[], [], []]
    }
    
    iposdatas.value[0] = []
    iposdatas.value[1] = []
    
    if (receive && receive.ipo && receive.ipo.MainIPO) {
      receive.ipo &&
        receive.ipo.MainIPO.forEach((element) => {
          if (element) {
            element["dateof"] = differentDate(element.biddingStartDate.slice(3, 5) + "-" + element.biddingStartDate.slice(0, 2) + "-" + element.biddingStartDate.slice(-4))
            element["datebit"] = `${getOrdinal(element.biddingStartDate.slice(0, 2))} - ${getOrdinal(element.biddingEndDate.slice(4, 7))}${element.biddingEndDate.slice(7, 16)}`
            iposdatas.value[0].push(element)
          }
        })
    }
    
    if (receive.sme && receive.sme.SMEIPO) {
      receive.sme &&
        receive.sme.SMEIPO.forEach((element) => {
          if (element) {
            element["dateof"] = differentDate(element.biddingStartDate.slice(3, 5) + "-" + element.biddingStartDate.slice(0, 2) + "-" + element.biddingStartDate.slice(-4))
            element["datebit"] = `${getOrdinal(element.biddingStartDate.slice(0, 2))} - ${getOrdinal(element.biddingEndDate.slice(4, 7))}${element.biddingEndDate.slice(7, 16)}`
            iposdatas.value[1].push(element)
          }
        })
    }
    
    iposdatas.value[2] = receive.perf && receive.perf.data ? receive.perf.data : []
  
    if (iposdatas.value[2] && iposdatas.value[2].length > 0) {
      iposdatas.value[2].sort(function (a, b) {
        return new Date(b.covertdate) - new Date(a.covertdate)
      })
    }
    
    // Always set loading to false after processing data
    loading.value = false
  }
  
  const handleApplyClick = (item, type) => {
    // Check if user is logged in using authStore
    if (authStore.uid && authStore.token) {
      // User is logged in, proceed with order
      IposOrder(item, type)
    } else {
      // User is not logged in, trigger login flow
      emit('gologin')
    }
  }
  
  const IposOrder = (item, type) => {
    // User is already verified, just show the dialog
    window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'iposorder', item, value: type } }))
  }
  
  const getOrdinal = (n) => {
    let ord = "th"
    if (n % 10 == 1 && n % 100 != 11) {
      ord = "st"
    } else if (n % 10 == 2 && n % 100 != 12) {
      ord = "nd"
    } else if (n % 10 == 3 && n % 100 != 13) {
      ord = "rd"
    }
    return `${n}${ord}`
  }
  
  const differentDate = (date) => {
    var date1 = new Date(date)
    var date2 = new Date()
    var yy = (date1 - date2) / (1000 * 60 * 60 * 24)
    return yy > 0 ? true : false
  }
  </script>
  
  <style>
  .stk-land-crds {
    background-color: linear-gradient(270deg, #fff 77.04%, #f6f6f6 115%), #fff !important;
    box-shadow: 0px 38.519px 25.482px 0px rgba(83, 30, 0, 0.04), 0px 20px 13px 0px rgba(83, 30, 0, 0.04), 0px 8.148px 6.519px 0px rgba(83, 30, 0, 0.03), 0px 1.852px 3.148px 0px rgba(83, 30, 0, 0.02) !important;
  }
  .grey--text{
    color:grey;
  }
  </style>