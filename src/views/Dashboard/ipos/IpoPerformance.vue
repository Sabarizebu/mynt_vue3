<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card style="border: 1px solid #E0E0E0;" class="crd-trn elevation-0 rounded-lg mb-8 mb-md-0">
          <v-toolbar class="tool-sty elevation-0 py-3   px-1 crd-trn" density="compact">
            <v-row align="center" class="w-100">
              <!-- First column: Image -->
              <v-col cols="auto">
                <v-img :src="mainCard4Src" width="40" height="40" />
              </v-col>

              <!-- Second column: Title & Subtitle -->
              <v-col>
                <div>
                  <div class="font-weight-bold title mb-1">IPO Performance {{ year }}</div>
                  <div class="fs-12 subtext--text">
                    Monitor the IPO Performance of Mainline <br class="d-md-none"> IPO Stocks listed at BSE and NSE
                  </div>
                </div>
              </v-col>
            </v-row>



            <v-spacer></v-spacer>
            <v-text-field :disabled="loading" style="width:200px;" v-model="year" hide-details
              class="mr-0  d-none d-md-flex" rounded="pill" density="compact" variant="text" flat bg-color="secbg">
              <template #append-inner>
                <div class="d-flex flex-column">
                  <v-icon size="20" color="grey" @click="setYearupdate('+')">mdi-chevron-up</v-icon>
                  <v-icon size="20" color="grey" @click="setYearupdate('-')">mdi-chevron-down</v-icon>
                </div>
              </template>
            </v-text-field>


            <v-text-field rounded="pill" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
              label="Search IPOs" class="pwidth rounded-pill mr-4  d-none d-md-flex search-field-center"
              density="compact" variant="text" flat bg-color="secbg"></v-text-field>
          </v-toolbar>
          <v-toolbar class="tool-sty elevation-0 py-0 mb-2 px-0 d-md-none" color="#fff" density="compact">
            <v-text-field style="max-width: 100px;" :disabled="loading" v-model="year" hide-details label="Year"
              class="rounded-pill mr-4" density="compact" variant="outlined">
              <template #append-inner>
                <div class="d-flex flex-column align-center">
                  <v-icon size="20" class="cursor-pointer" @click="setYearupdate('+')">mdi-chevron-up</v-icon>
                  <v-icon size="20" class="cursor-pointer" @click="setYearupdate('-')">mdi-chevron-down</v-icon>
                </div>
              </template>
            </v-text-field>


            <v-text-field v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify" label="Search IPOs"
              class="rounded-pill" density="compact" variant="solo" flat bg-color="secbg"></v-text-field>
          </v-toolbar>

          <v-data-table :sort-by="[{ key: 'dateis', order: 'desc' }]" :search="opensearch" must-sort hide-default-footer
            fixed-header :loading="loading" class="rounded-0 overflow-y-auto d-none d-md-block ipo-data-table"
            :headers="tradeheader" height="calc(100vh - 180px)" :items="iposdatas"
            :items-per-page="iposdatas && iposdatas.length > 0 ? showtable : 0" item-key="Scheme_Code">

            <template v-slot:body="{ items, headers }">
              <tr v-if="items && items.length > 0" class="table-row" v-for="(item, o) in items" :key="o">
                <td class="pos-rlt" cols="1">
                  <P class="fs-13 font-weight-medium mb-0 txt-000 table-hov-text mt-2">
                    {{
                      item['Company Name'] ?
                        item['Company Name'] : '' }}
                  </P>
                </td>
                <td class="font-weight-medium txt-000">{{ item.listed_date ? item.listed_date : '' }}</td>
                <td class="text-right font-weight-medium txt-000">₹{{ item.Price_Range ?
                  item.Price_Range.toFixed(2) : '0.00'
                  }}</td>
                <td class="text-right font-weight-medium txt-000">₹{{ item.ClsPric ? item.ClsPric.toFixed(2)
                  : '0.00' }}</td>
                <td class="text-right font-weight-medium"
                  :class="item.listing_gain > 0 ? 'txt-gre' : item.listing_gain < 0 ? 'txt-red' : 'black--text'">
                  ₹{{ item.listing_gain ? item.listing_gain.toFixed(2) :
                    '0.00' }}</td>
                <td class="text-right font-weight-medium"
                  :class="item.listing_gain_per > 0 ? 'txt-gre' : item.listing_gain_per < 0 ? 'txt-red' : 'black--text'">
                  {{ item.listing_gain_per ? item.listing_gain_per.toFixed(2) :
                    '0.00' }}%</td>
              </tr>
              <template v-if="items && items.length > 0 && showtable < iposdatas.length">
                <tr>
                  <td colspan="6">
                    <v-btn color="primary" variant="text" class="elevation-0 text-none font-weight-bold py-4"
                      @click="showtable += 24" block>show more</v-btn>
                  </td>
                </tr>
              </template>
              <template v-if="!items || items.length === 0">

                <td colspan="6" class="text-center align-middle">
                  <div class="mx-auto py-16 mt-16">
                    <img class="mx-auto" width="80px" :src="noDataFolder" />
                    <h4 class="txt-999 font-weight-regular caption">There is no IPO Performance data for {{ year
                      }}
                      yet!</h4>
                  </div>
                </td>

              </template>
            </template>
          </v-data-table>

          <div class="d-md-none">
            <div v-if="iposdatas.length > 0">
              <v-card class="rounded-lg mb-3" variant="outlined"
                v-for="(p, t) in iposdatas.length < showtable ? iposdatas.slice(0, showtable) : iposdatas" :key="t">
                <div>
                  <v-card color="#FAFBFF" class="elevation-0 rounded-b-0 rounded-t-lg">
                    <v-list-item class="px-2">
                      <v-list-item-content>
                        <v-list-item-title class="mb-0 fs-15">{{ p['Company Name']
                          }}</v-list-item-title>
                        <v-list-item-subtitle class="fs-12">{{ p.covertdate ?
                          p.covertdate.slice(4, 16) :
                          ''
                          }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-icon>
                        <span class="fs-14"
                          :class="p.listing_gain_per > 0 ? 'txt-gre' : p.listing_gain_per < 0 ? 'txt-red' : 'black--text'">
                          {{ p.listing_gain_per ? p.listing_gain_per : '0.00' }}%
                        </span>
                      </v-list-item-icon>
                    </v-list-item>
                  </v-card>
                  <v-card class="elevation-0 rounded-t-0 rounded-b-lg px-2 py-1">
                    <v-row no-gutters>
                      <v-col cols="6" class="subtext--text fs-13">Issue price<span
                          class="fs-14 black--text font-weight-medium">
                          ₹{{ p.Price_Range
                          }}</span></v-col>
                      <v-col cols="6" class="subtext--text fs-13 text-right">Listing gain <span
                          class="fs-14 font-weight-medium"
                          :class="p.listing_gain > 0 ? 'txt-gre' : p.listing_gain < 0 ? 'txt-red' : 'black--text'">
                          ₹{{
                            p.listing_gain ? p.listing_gain : '0.00' }}</span></v-col>
                    </v-row>
                  </v-card>
                </div>
              </v-card>
              <v-btn v-if="showtable < iposdatas.length" color="primary" variant="text"
                class="elevation-0 text-none font-weight-bold py-4" @click="showtable += 24" block>show
                more</v-btn>
            </div>
            <div v-else>
              <v-skeleton-loader v-for="n in 4" :key="n" class="rounded-lg mb-3" width="100%" height="90"
                type="card"></v-skeleton-loader>
            </div>
          </div>

        </v-card>
      </v-col>
      <v-col cols="3" class="d-none d-md-none"></v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from 'vuetify'
import { getIposPerform } from '@/components/mixins/getAPIdata'
import { useAppStore } from '../../../stores/appStore'

// Import assets statically
import mainCard4 from '@/assets/ipos/main-card-4.svg'
import mainCard4d from '@/assets/ipos/main-card-4d.svg'
import noDataFolder from '@/assets/no data folder.svg'

const theme = useTheme()
const appStore = useAppStore()

// Computed property for main card based on theme
const mainCard4Src = computed(() => theme.global.name.value === 'dark' ? mainCard4d : mainCard4)

const emit = defineEmits(['gologin', 'receive'])

const iposdatas = ref([])
const loading = ref(true)
const opensearch = ref(null)
const showtable = ref(24)
const uid = ref(null)
const token = ref(null)
const year = ref(new Date().getFullYear())

const tradeheader = computed(() => {
  return [
    { title: `${year.value} listings`, key: 'Company Name', sortable: false, width: '30%', },
    { title: 'Listed on', key: 'listed_date', sortable: false },
    { title: 'Issue price', key: 'Price_Range', align: 'end' },
    { title: 'Close price', key: 'ClsPric', align: 'end' },
    { title: 'Gain/Loss', key: 'listing_gain', align: 'end' },
    { title: 'Gain/Loss (%)', key: 'listing_gain_per', align: 'end' },
  ]
})

// Handle receive event
const handleReceiveEvent = (event) => {
  const res = event.detail || event
  if (res == 'stat_ok') {
    emit('receive', 'ipos', 'Performance')
  } else {
    setSortdata(res.perf)
  }
}

const setSortdata = (data) => {
  if (data && data.data) {
    for (let s = 0; s < data.data.length; s++) {
      const element = data.data[s]
      element['dateis'] = new Date(element.listed_date).toISOString().replace('-', '/').split('T')[0].replace('-', '/')
      element.listed_date = new Date(element.listed_date).toLocaleString('en-gb', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    iposdatas.value = data.data
  } else {
    iposdatas.value = []
  }
  loading.value = false
}

const getiposdata = async () => {
  loading.value = true
  let data = await getIposPerform(year.value)
  setSortdata(data)
}

onMounted(async () => {
  // Emit events using Custom Events (matching original eventBus.$emit)
  window.dispatchEvent(new CustomEvent('tabBar-load'))

  emit('receive', 'ipos', 'Performance')

  window.addEventListener('setRec-event', handleReceiveEvent)

  // Check user status
  let res = sessionStorage.getItem("c3RhdHVz")
  if (res == "dmFsaWR1c2Vy") {
    token.value = sessionStorage.getItem("usession")
    uid.value = sessionStorage.getItem("userid")
  } else {
    token.value = ''
    uid.value = ''
  }

  // Fetch initial data
  await getiposdata()

  // Fallback: stop loading after 5 seconds if no data arrives
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
    }
  }, 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('setRec-event', handleReceiveEvent)
})

const IposOrder = (item, type) => {
  let res = sessionStorage.getItem("c3RhdHVz")
  if (res == "dmFsaWR1c2Vy") {
    window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'iposorder', item, value: type } }))
  } else {
    token.value = ''
    uid.value = ''
    emit('gologin')
  }
}

const setYearupdate = (opt) => {
  let currentYear = new Date().getFullYear()
  if (opt === '+' && currentYear != year.value) {
    year.value = year.value + 1
    getiposdata()
  } else if (opt === '-') {
    year.value = year.value - 1
    getiposdata()
  }
}
</script>

<style>
.stk-land-crds {
  background-color: linear-gradient(270deg, #FFF 77.04%, #F6F6F6 115%), #FFF !important;
  box-shadow: 0px 38.519px 25.482px 0px rgba(83, 30, 0, 0.04), 0px 20px 13px 0px rgba(83, 30, 0, 0.04), 0px 8.148px 6.519px 0px rgba(83, 30, 0, 0.03), 0px 1.852px 3.148px 0px rgba(83, 30, 0, 0.02) !important;
}

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
</style>