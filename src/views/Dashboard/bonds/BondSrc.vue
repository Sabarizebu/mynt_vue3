<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="elevation-0 mb-4 mb-md-14 pa-4 pa-md-6 rounded-lg pos-rlt" color="#148564"
          style="overflow: visible;">
          <v-row no-gutters>
            <v-col md="4" cols="12">
              <p class="fs-26 d-md-none font-weight-bold lh-24 white--text">Invest in Bonds</p>
              <p class="fs-36 d-none d-md-flex font-weight-bold lh-32 white--text mb-4">Invest in Bonds</p>
              <p class="title white--text mb-0 fs-20 font-weight-regular">Handpicked bonds from our experts that meet
                your investment needs.</p>
            </v-col>
          </v-row>

          <!-- Three Cards Div - Position Absolute -->
          <div class="pos-abs d-none d-md-flex align-stretch"
            style="right: 16px; top: 130px; transform: translateY(-50%); gap: 12px;">
            <v-card width="170px" class="pb-4 stk-land-crds rounded-xl text-center d-flex flex-column align-center"
              style="height: 200px;">
              <img src="@/assets/Bonds/main-card-1.svg" class="d-block mx-auto pt-6 pb-2" alt="main-card-1"
                style="width: 50%;" />
              <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0">
                Invest in <br />
                Government <br />
                Securities
              </p>
            </v-card>
            <v-card width="170px" class="pb-4 stk-land-crds rounded-xl text-center d-flex flex-column align-center"
              style="height: 200px; ">
              <img src="@/assets/Bonds/main-card-2.svg" class="d-block mx-auto pt-6 pb-2" alt="main-card-2"
                style="width: 58%;" />
              <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0">
                Investing in <br />
                Sovereign Gold <br />
                Bonds is easy
              </p>
            </v-card>
            <v-card width="170px" class="pb-4 stk-land-crds rounded-xl text-center d-flex flex-column align-center"
              style="height: 200px;">
              <img src="@/assets/Bonds/main-card-3.svg" class="d-block mx-auto pt-6 pb-2" alt="main-card-3"
                style="width: 50%;" />
              <p class="fs-16 font-weight-bold lh-16 px-4 mt-1 mb-0">
                Checkout tax <br />
                free bonds <br />
                in market
              </p>
            </v-card>
          </div>
        </v-card>

        <p class="title font-weight-bold mb-0 mb-md-3">Top Bonds</p>
        <v-chip-group v-model="bondtype" class="d-md-none">
          <v-chip v-for="(t, b) in bondsitem" :key="b" :color="bondtype == b ? '#000' : 'subtext666'"
            :text-color="bondtype == b ? '#fff' : 'subtext666'" :variant="bondtype != b ? 'outlined' : 'flat'"
            @click="bondtype = b">
            {{ t }}
          </v-chip>
        </v-chip-group>

        <div class="default-tab ">
          <v-tabs v-model="bondtype" color="primary" class="d-none d-md-flex ">
            <v-tab v-for="(t, b) in bondsitem" :key="b" class="font-weight-bold  mb-0 text-none px-3 ">
              <v-badge color="primary" :content="(bondsdatas[b] && bondsdatas[b].length) ? bondsdatas[b].length : ''"
                :model-value="(bondsdatas[b] && bondsdatas[b].length) ? bondsdatas[b].length : 0">
                <span>{{ t }}</span>
              </v-badge>
            </v-tab>
          </v-tabs>
        </div>

        <v-data-table :must-sort="true" :sort-by="[{ key: '', order: 'asc' }]" hide-default-footer fixed-header
          :loading="loading" class="rounded-lg overflow-y-auto d-none d-md-block bonds-data-table"
          :headers="tradeheader" style="border-radius: 4px; border: 1px solid var(--outline)"
          height="calc(100vh - 180px)" color="grey" :items="currentBondsData"
          :items-per-page="currentBondsData.length > 0 ? showtable : 0">
          <template v-slot:progress>
            <v-progress-linear indeterminate height="4" color="primary"></v-progress-linear>
          </template>
          <template v-slot:body="{ items, headers }">
            <tr v-if="items && items.length > 0" class="table-row" v-for="(item, o) in items" :key="o"
              @mouseenter="hoveredRow = o" @mouseleave="hoveredRow = null" :style="{
                backgroundColor: hoveredRow === o ? '#E3F2FD' : 'white',
                transition: 'background-color 0.2s ease'
              }">
              <td class="pos-rlt" style="width: 36%; vertical-align: middle;">
                <div class="d-flex align-center justify-space-between">
                  <div class="flex-grow-1" style="min-width: 0;">
                    <P class="fs-13 font-weight-medium mt-2  txt-000 table-hov-text">
                      {{ item.name ? item.name : "" }}
                    </P>
                    <v-chip-group column class="mb-0">
                      <v-chip size="x-small" variant="flat" class="table-hov-prd mr-1 mb-1" :style="{
                        backgroundColor: '#F1F3F8',
                        color: '#666666',
                        borderRadius: '5px',
                        height: '20px'
                      }">
                        <span class="fs-10">
                          {{ item.symbol ? item.symbol : "" }}
                        </span>
                      </v-chip>
                    </v-chip-group>
                  </div>
                  <div @click.stop class="ml-3" :class="{ 'd-flex': hoveredRow === o, 'd-none': hoveredRow !== o }"
                    style="min-width: fit-content; flex-shrink: 0; z-index: 10; align-items: center;">
                    <v-btn @click="uid ? bondOrder(item, bondtype) : $emit('gologin')" size="small"
                      class="elevation-0 rounded-pill text-none primary--text font-weight-bold" color="#F1F3F8"
                      style="min-width: 80px; box-shadow: none !important;">
                      Invest
                    </v-btn>
                  </div>
                </div>
              </td>
              <td style="vertical-align: middle;">
                <div style="width: 220px" class="d-flex flex-column my-2">
                  <!-- Row 1: Labels -->
                  <div class="d-flex flex-row justify-space-between mb-1">
                    <span class=" txt-666 fs-10 ">Start date</span>
                    <span class=" txt-666 fs-10">End date</span>
                  </div>
                  <!-- Row 2: Dates -->
                  <div class="d-flex flex-row justify-space-between mb-1">
                    <span class="font-weight-bold caption txt-000 fs-12">
                      {{ item.biddingStartDate ? formatDate(item.biddingStartDate) : '' }}
                    </span>
                    <span class="font-weight-bold caption txt-000 fs-12">
                      {{ item.biddingEndDate ? formatDate(item.biddingEndDate) : '' }}
                    </span>
                  </div>
                  <!-- Row 3: Times -->
                  <div class="d-flex flex-row justify-space-between">
                    <span class=" fs-10">{{ item.dailyStartTime || '' }}</span>
                    <span class=" fs-10">{{ item.dailyEndTime || '' }}</span>
                  </div>
                </div>
              </td>

              <td class="text-right font-weight-medium txt-000" style="vertical-align: middle; ">
                ₹{{ item.lotSize ? Number(item.lotSize).toLocaleString() : "0.00" }} <br />
                <span class="subtext--text font-weight-regular fs-12">{{ item.lotSize ? item.lotSize / 100 : "0" }}
                  Qty.</span>
              </td>
              <td class="text-right font-weight-medium" style="vertical-align: middle; ">
                <span class="txt-000 pr-1">{{ item.issueSize ? (item.issueSize / 10000000).toFixed(2) : "0.00" }}
                </span>
                <span class=" font-weight-regular fs-12">Cr.</span>
              </td>
            </tr>
            <template v-if="items && items.length > 0 && showtable < currentBondsData.length">
              <tr>
                <td :colspan="headers.length" class="text-center">
                  <v-btn color="primary" variant="text" class="elevation-0 text-none font-weight-bold py-4"
                    @click="showtable += 24" block>
                    show more
                  </v-btn>
                </td>
              </tr>
            </template>
            <template v-if="!items || items.length === 0">
              <tr>
                <td colspan="4" style="height: calc(100vh - 280px); vertical-align: middle;">
                  <div
                    style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <img style="display: block; margin-bottom: 16px;" width="80px" :src="noDataImg" />
                    <h4 class="txt-999 font-weight-regular caption text-center">There is no {{ getBondTypeName(bondtype)
                    }} data here yet!</h4>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </v-data-table>

        <div class="d-md-none overflow-hidden">
          <v-divider></v-divider>
          <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
          <div v-if="currentBondsData.length > 0">
            <v-card
              v-for="(item, o) in (currentBondsData.length < showtable ? currentBondsData.slice(0, showtable) : currentBondsData)"
              :key="o" class="elevation-0 rounded-0 overflow-hidden">
              <div class="px-0">
                <v-list-item class="pa-0">
                  <v-list-item-content class="pa-0 pt-1">
                    <v-list-item-title class="fs-13 font-weight-bold mb-0 txt-000 table-hov-text mt-2">
                      {{ item.name ? item.name : "" }}
                    </v-list-item-title>
                    <v-chip-group column class="mb-1">
                      <v-chip color="secbg" size="x-small" class="table-hov-prd" text-color="subtext"
                        style="border-radius: 5px; padding: 10px 8px !important">
                        <span class="font-weight-medium fs-10">
                          {{ item.symbol ? item.symbol : "" }}
                        </span>
                      </v-chip>
                      <v-chip class="px-0 crd-trn" size="x-small" text-color="#000">
                        {{
                          `${item.biddingStartDate} ${item.dailyStartTime ? item.dailyStartTime.slice(0, 5) : ''} to
                        ${item.biddingEndDate ? formatDate(item.biddingEndDate) : ''} ${item.dailyEndTime ?
                            item.dailyEndTime.slice(0, 5) : ''}`
                        }}
                      </v-chip>
                    </v-chip-group>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-row class="py-2" no-gutters>
                  <v-col cols="6">
                    <p class="mb-1 fs-12 txt-666">
                      Min. qty: <span class="font-weight-bold black--text">{{ item.lotSize ? item.lotSize / 100 : "0"
                      }}</span>
                    </p>
                    <p class="mb-1 fs-12 txt-666">
                      Min. Inv: <span class="font-weight-bold black--text">₹{{ item.lotSize ?
                        Number(item.lotSize).toLocaleString() : "0.00" }}</span>
                    </p>
                  </v-col>
                  <v-col cols="6" class="text-right">
                    <p class="mb-1 fs-12 txt-666">Lot size</p>
                    <p class="mb-1 fs-12 font-weight-bold black--text">
                      {{ item.issueSize ? (item.issueSize / 10000000).toFixed(2) : "0.00" }}
                      <span class="subtext--text font-weight-regular">Cr.</span>
                    </p>
                  </v-col>
                </v-row>
              </div>
              <div class="px-4">
                <v-btn block @click="uid ? bondOrder(item, bondtype) : $emit('gologin')" size="small"
                  class="elevation-0 rounded-pill text-none primary--text font-weight-bold mb-2" color="secbg">
                  Invest
                </v-btn>
              </div>
              <v-card v-if="uid && showtable - 1 != o" class="pt-1 rounded-0 elevation-0" color="secbg"></v-card>
            </v-card>
          </div>
          <v-card v-else class="elevation-0 rounded-0 text-center">
            <div class="mx-auto py-8">
              <img class="align-self-stretch mx-auto" width="70px" :src="noDataImg" />
              <h4 class="txt-999 font-weight-regular fs-14">There is no data here yet!</h4>
            </div>
          </v-card>
          <v-btn v-if="showtable < currentBondsData.length" color="primary" variant="text"
            class="elevation-0 text-none font-weight-bold py-4 mb-1" @click="showtable += 24" block>
            show more
          </v-btn>
        </div>
      </v-col>
      <v-col cols="3" class="d-none"></v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { getBondGsec, getBondTbill, getBondSdl, getBondSgb } from '@/components/mixins/getAPIdata.js'
import noDataImg from '@/assets/no data folder.svg'

const appStore = useAppStore()

// Props and Emits
const emit = defineEmits(['gologin', 'receive'])

// Reactive data
const bondtype = ref(0)
const bondsdatas = ref({
  0: [],
  1: [],
  2: [],
  3: []
})
const loading = ref(true)
const showtable = ref(24)
const uid = ref(null)
const token = ref('')
const hoveredRow = ref(null)

const bondsitem = ref(["Govt. bonds", "Treasury bonds", "State bonds", "Sovereign Gold bonds"])

// Computed
const tradeheader = computed(() => {
  return [
    { title: "Bonds name", key: "name", sortable: false, width: "36%" },
    { title: "BID date", key: "date", sortable: false },
    { title: "Min. Invest", key: "minPrice", sortable: false, align: "end" },
    { title: "Lot Size", key: "lotSize", sortable: false, align: "end" },
  ]
})

const currentBondsData = computed(() => {
  const data = bondsdatas.value[bondtype.value] || []
  // console.log('Computed currentBondsData - bondtype:', bondtype.value, 'data length:', data.length)
  return data
})

// Methods
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch (error) {
    return dateString
  }
}

function getBondTypeName(type) {
  const names = ["G-SEC", "T-BILL", "SDL", "SGB"]
  return names[type] || ""
}

async function loadBondsData() {
  loading.value = true
  try {
    // Load all bond types in parallel
    const [gsecRes, tbillRes, sdlRes, sgbRes] = await Promise.all([
      getBondGsec(),
      getBondTbill(),
      getBondSdl(),
      getBondSgb()
    ])

    // console.log('Bond API Responses:', { gsecRes, tbillRes, sdlRes, sgbRes })

    // Process G-SEC data - handle multiple response formats
    if (gsecRes) {
      let gsecData = []

      // Check if response has NCBGsec property
      if (gsecRes.NCBGsec) {
        gsecData = Array.isArray(gsecRes.NCBGsec) ? gsecRes.NCBGsec : []
      }
      // Check if response has data.NCBGsec
      else if (gsecRes.data && gsecRes.data.NCBGsec) {
        gsecData = Array.isArray(gsecRes.data.NCBGsec) ? gsecRes.data.NCBGsec : []
      }
      // Check if response.data is an array
      else if (gsecRes.data && Array.isArray(gsecRes.data)) {
        gsecData = gsecRes.data
      }
      // Check if response itself is an array
      else if (Array.isArray(gsecRes)) {
        gsecData = gsecRes
      }
      // Check if response has stat: "Ok" and data
      else if (gsecRes.stat === "Ok" && gsecRes.data) {
        if (Array.isArray(gsecRes.data)) {
          gsecData = gsecRes.data
        } else if (gsecRes.data.NCBGsec && Array.isArray(gsecRes.data.NCBGsec)) {
          gsecData = gsecRes.data.NCBGsec
        }
      }

      // console.log('G-SEC Data processed:', gsecData.length, gsecData)
      bondsdatas.value[0] = gsecData
    } else {
      bondsdatas.value[0] = []
    }

    // Process T-BILL data
    if (tbillRes) {
      let tbillData = []
      if (tbillRes.NCBTBill) {
        tbillData = Array.isArray(tbillRes.NCBTBill) ? tbillRes.NCBTBill : []
      } else if (tbillRes.data && tbillRes.data.NCBTBill) {
        tbillData = Array.isArray(tbillRes.data.NCBTBill) ? tbillRes.data.NCBTBill : []
      } else if (tbillRes.data && Array.isArray(tbillRes.data)) {
        tbillData = tbillRes.data
      } else if (Array.isArray(tbillRes)) {
        tbillData = tbillRes
      } else if (tbillRes.stat === "Ok" && tbillRes.data) {
        if (Array.isArray(tbillRes.data)) {
          tbillData = tbillRes.data
        } else if (tbillRes.data.NCBTBill && Array.isArray(tbillRes.data.NCBTBill)) {
          tbillData = tbillRes.data.NCBTBill
        }
      }
      bondsdatas.value[1] = tbillData
    } else {
      bondsdatas.value[1] = []
    }

    // Process SDL data
    if (sdlRes) {
      let sdlData = []
      if (sdlRes.NCBSDL) {
        sdlData = Array.isArray(sdlRes.NCBSDL) ? sdlRes.NCBSDL : []
      } else if (sdlRes.data && sdlRes.data.NCBSDL) {
        sdlData = Array.isArray(sdlRes.data.NCBSDL) ? sdlRes.data.NCBSDL : []
      } else if (sdlRes.data && Array.isArray(sdlRes.data)) {
        sdlData = sdlRes.data
      } else if (Array.isArray(sdlRes)) {
        sdlData = sdlRes
      } else if (sdlRes.stat === "Ok" && sdlRes.data) {
        if (Array.isArray(sdlRes.data)) {
          sdlData = sdlRes.data
        } else if (sdlRes.data.NCBSDL && Array.isArray(sdlRes.data.NCBSDL)) {
          sdlData = sdlRes.data.NCBSDL
        }
      }
      bondsdatas.value[2] = sdlData
    } else {
      bondsdatas.value[2] = []
    }

    // Process SGB data
    if (sgbRes) {
      let sgbData = []
      if (sgbRes.SGB) {
        sgbData = Array.isArray(sgbRes.SGB) ? sgbRes.SGB : []
      } else if (sgbRes.data && sgbRes.data.SGB) {
        sgbData = Array.isArray(sgbRes.data.SGB) ? sgbRes.data.SGB : []
      } else if (sgbRes.data && Array.isArray(sgbRes.data)) {
        sgbData = sgbRes.data
      } else if (Array.isArray(sgbRes)) {
        sgbData = sgbRes
      } else if (sgbRes.stat === "Ok" && sgbRes.data) {
        if (Array.isArray(sgbRes.data)) {
          sgbData = sgbRes.data
        } else if (sgbRes.data.SGB && Array.isArray(sgbRes.data.SGB)) {
          sgbData = sgbRes.data.SGB
        }
      }
      bondsdatas.value[3] = sgbData
    } else {
      bondsdatas.value[3] = []
    }

    // console.log('Processed bonds data:', bondsdatas.value)
    // console.log('G-SEC count:', bondsdatas.value[0]?.length || 0)
    // console.log('Current bond type:', bondtype.value)
    // console.log('Current bonds data:', currentBondsData.value)
    loading.value = false
  } catch (error) {
    // console.error('Error loading bonds data:', error)
    appStore.showSnackbar(0, `Error loading bonds data: ${error.message || error}`)
    bondsdatas.value = { 0: [], 1: [], 2: [], 3: [] }
    loading.value = false
  }
}

function getBondsdata(receive) {
  if (receive) {
    bondsdatas.value[0] = receive.gsec && receive.gsec.NCBGsec ? receive.gsec.NCBGsec : []
    bondsdatas.value[1] = receive.tbill && receive.tbill.NCBTBill ? receive.tbill.NCBTBill : []
    bondsdatas.value[2] = receive.sdl && receive.sdl.NCBSDL ? receive.sdl.NCBSDL : []
    bondsdatas.value[3] = receive.sgb && receive.sgb.SGB ? receive.sgb.SGB : []
  }
  loading.value = false
}

function bondOrder(item, type) {
  let res = sessionStorage.getItem("c3RhdHVz")
  if (res == "dmFsaWR1c2Vy") {
    item["minbidqty"] = item.minBidQuantity ? item.minBidQuantity / 100 : 0
    item["maxbidqty"] = item.maxQuantity ? item.maxQuantity / 100 : 0
    item["lotbitsize"] = item.lotSize ? item.lotSize / 100 : 0
    window.dispatchEvent(new CustomEvent('menudialog', {
      detail: { type: 'bondorder', itemdata: item, mode: type }
    }))
  } else {
    token.value = ""
    uid.value = ""
    emit("gologin")
  }
}

// Lifecycle
const route = useRoute()

onMounted(async () => {
  // Initialize user data
  let res = sessionStorage.getItem("c3RhdHVz")
  if (res == "dmFsaWR1c2Vy") {
    token.value = sessionStorage.getItem("usession")
    uid.value = sessionStorage.getItem("userid")
  }

  // Emit events
  window.dispatchEvent(new CustomEvent('tabBar-load'))
  window.dispatchEvent(new CustomEvent('login-event'))
  emit("receive", "bonds")

  // Check URL params for tab
  const tab = route.query.t
  if (tab === "sgb") {
    bondtype.value = 3
  } else if (tab === "sdl") {
    bondtype.value = 2
  } else if (tab === "tbill") {
    bondtype.value = 1
  } else {
    bondtype.value = 0
  }

  // Listen for setRec-event
  window.addEventListener('setRec-event', handleSetRecEvent)

  // Listen for user-event
  window.addEventListener('user-event', handleUserEvent)

  // Load bonds data
  await loadBondsData()
})

onBeforeUnmount(() => {
  window.removeEventListener('setRec-event', handleSetRecEvent)
  window.removeEventListener('user-event', handleUserEvent)
})

function handleSetRecEvent(event) {
  const value = event.detail
  if (value == "stat_ok") {
    emit("receive", "bonds")
    loadBondsData()
  } else if (value && Object.entries(value).length > 0) {
    getBondsdata(value)
  }
}

function handleUserEvent() {
  let res = sessionStorage.getItem("c3RhdHVz")
  if (res == "dmFsaWR1c2Vy") {
    token.value = sessionStorage.getItem("usession")
    uid.value = sessionStorage.getItem("userid")
  } else {
    token.value = ""
    uid.value = ""
  }
}
</script>

<style scoped>
.stk-land-crds {
  background: linear-gradient(270deg, #fff 77.04%, #f6f6f6 115%), #fff !important;
  box-shadow: 0px 38.519px 25.482px 0px rgba(83, 30, 0, 0.04), 0px 20px 13px 0px rgba(83, 30, 0, 0.04), 0px 8.148px 6.519px 0px rgba(83, 30, 0, 0.03), 0px 1.852px 3.148px 0px rgba(83, 30, 0, 0.02) !important;
}

.bonds-data-table :deep(.v-progress-linear) {
  color: rgb(var(--v-theme-primary)) !important;
}

.bonds-data-table :deep(.v-progress-linear__determinate) {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.bonds-data-table :deep(.v-progress-linear__indeterminate .v-progress-linear__indeterminate-line) {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.bonds-data-table :deep(.v-progress-linear__indeterminate .v-progress-linear__indeterminate-line-long) {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.bonds-data-table :deep(.v-progress-linear__indeterminate .v-progress-linear__indeterminate-line-short) {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.bonds-data-table :deep(thead th) {
  color: #666 !important;
}

.bonds-data-table :deep(thead th .v-data-table-header__content) {
  color: #666 !important;
}
</style>