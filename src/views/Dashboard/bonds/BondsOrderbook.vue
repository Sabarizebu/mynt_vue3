<template>
  <div>
    <div class="mb-10 mt-4">
      <v-toolbar flat class="tool-sty pl-4 d-none d-md-block crd-trn" density="compact">
        <v-tabs fixed color="primary" @update:model-value="ordertab == 1 ? (ordertype = 'exec') : (ordertype = 'open')"
          v-model="ordertab">
          <v-tab :disabled="tableloader" class="font-weight-bold subtitle-1 mb-0 text-none">Open Orders (<span>{{
            openorders ? openorders.length : "0" }}</span>)
          </v-tab>
          <v-tab :disabled="tableloader" class="font-weight-bold subtitle-1 mb-0 text-none">Close Orders (<span>{{
            execorders ? execorders.length : "0" }}</span>)
          </v-tab>
          <v-tabs-slider color="primary"></v-tabs-slider>
        </v-tabs>
        <v-spacer></v-spacer>

        <v-text-field v-if="ordertab === 0" v-model="opensearch" prepend-inner-icon="mdi-magnify" placeholder="Search"
          variant="solo" density="compact" hide-details class="rounded mr-3" style="max-width: 220px" flat
          bg-color="secbg" elevation="0" rounded :disabled="tableloader"></v-text-field>
        <v-text-field v-else v-model="execsearch" prepend-inner-icon="mdi-magnify" placeholder="Search" variant="solo"
          density="compact" hide-details class="rounded mr-3" style="max-width: 220px" flat bg-color="secbg"
          elevation="0" rounded :disabled="tableloader"></v-text-field>

        <v-select v-model="seriesFilter" :items="uniqueSeries" item-title="text" item-value="value"
          placeholder="Bond series" clearable  hide-details :disabled="tableloader" density="compact" variant="flat"
          rounded="pill" bg-color="secbg" elevation="0" class="rounded-pill ml-3 pl-3" style="max-width: 160px">
        </v-select>


        <v-icon :disabled="tableloader" :class="['ml-3 cursor-p', { 'reload-rotating': tableloader }]"
          @click="getOrderbook()" color="maintext" size="24">mdi-reload</v-icon>
      </v-toolbar>
      <v-tabs class="d-md-none" fixed-tabs color="primary"
        @update:model-value="ordertab == 1 ? (ordertype = 'exec') : (ordertype = 'open')" v-model="ordertab">
        <v-tab :disabled="tableloader" class="font-weight-bold subtitle-1 mb-0 text-none">Open Orders (<span>{{
          openorders ? openorders.length : "0" }}</span>)
        </v-tab>
        <v-tab :disabled="tableloader" class="font-weight-bold subtitle-1 mb-0 text-none">Close Orders (<span>{{
          execorders ? execorders.length : "0" }}</span>)
        </v-tab>
        <v-tabs-slider color="primary"></v-tabs-slider>
      </v-tabs>
      <v-data-table must-sort :sort-by="[{ key: 'response_datetime', order: 'desc' }]" hide-default-footer fixed-header
        :loading="tableloader" class="mt-3 rounded-lg overflow-y-auto d-none d-md-block holdings-table"
        style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;" height="480px"
        :headers="orderheader" :items="filteredOrderbookdataSorted" :items-per-page="filteredOrderbookdataSorted.length"
        item-key="orderNumber" :item-class="() => 'table-row'" @click:row="(event, { item }) => setOrderrowdata(item)">
        <template v-if="ordertab === 0" #header.data-table-select>
          <v-checkbox-btn
            :model-value="filteredOrderbookdataSorted.length > 0 && bonddselected.length === filteredOrderbookdataSorted.length"
            :indeterminate="bonddselected.length > 0 && bonddselected.length < filteredOrderbookdataSorted.length"
            @click="() => {
              if (bonddselected.length === filteredOrderbookdataSorted.length) {
                bonddselected.splice(0, bonddselected.length)
              } else {
                filteredOrderbookdataSorted.forEach(item => {
                  if (!bonddselected.some(sel => sel.orderNumber === item.orderNumber)) {
                    bonddselected.push(item)
                  }
                })
              }
            }" color="primary" hide-details density="compact"></v-checkbox-btn>
        </template>

        <template v-if="ordertab === 0" #item.data-table-select="{ item }">
          <v-checkbox-btn :model-value="bonddselected.some(sel => sel.orderNumber === item.orderNumber)" @click.stop="() => {
            const isCurrentlySelected = bonddselected.some(sel => sel.orderNumber === item.orderNumber)
            if (isCurrentlySelected) {
              const index = bonddselected.findIndex(sel => sel.orderNumber === item.orderNumber)
              if (index > -1) {
                bonddselected.splice(index, 1)
              }
            } else {
              bonddselected.push(item)
            }
          }" color="primary" hide-details density="compact"></v-checkbox-btn>
        </template>

        <template v-slot:body="{ items, headers }">
          <tr v-if="ordertab == 1 ? execorders && execorders.length > 0 : openorders && openorders.length > 0"
            class="table-row" v-for="(item, o) in items" :key="o">
            <td class="pos-rlt">
              <span class="table-hov-text maintext--text font-weight-medium">{{ item.symbol ? item.symbol : "-"
                }}</span> <span class="ml-1 subtext--text fs-10">{{ item.series ? item.series : "" }}</span>
              <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0; z-index: 1;">
                <v-menu close-on-click absolute offset-y class="table-menu">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" style="border: 1px solid var(--outline);" min-width="20px" color="mainbg"
                      class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                      <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-card class="table-menu-list">
                    <v-list density="compact">
                      <div v-for="(m, k) in ordertab === 0 ? menulist.open : menulist.exec" :key="k">
                        <v-list-item
                          @click="m.type === 'new' ? router.push('/bonds') : m.type === 'cd' ? setOrdercancel(item) : setOrderrowdata(item)"
                          class="pl-3 pr-6">
                          <template #prepend>
                            <img v-if="m.icon > 2 && getOrderbookIcon(m.icon)" width="20px" class="pl-1 mr-3"
                              :src="getOrderbookIcon(m.icon)" />
                            <v-icon v-else class="" color="#506D84" size="20">{{ m.icon }}</v-icon>
                          </template>
                          <v-list-item-title class="subline--text font-weight-medium fs-14">
                            {{ m.name }}
                          </v-list-item-title>
                        </v-list-item>
                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                      </div>
                    </v-list>
                  </v-card>
                </v-menu>
              </div>
            </td>

            <td>
              <v-chip size="x-small" class="table-hov-prd rounded-md" label variant="flat" style="background-color: #F1F3F8; color: #666666; border-radius: 5px;">
                <span class=" fs-12">{{ item.orderNumber }}</span>
              </v-chip>
            </td>

            <td>
              <span class="font-weight-medium maintext--text">{{ item.response_datetime ?
                item.response_datetime.slice(0, 16) : "-"
                }}</span>
            </td>
            <td class="text-right font-weight-medium">
              <p class="font-weight-medium maintext--text mb-0">{{ item.investmentValue ?
                `₹${item.investmentValue.toLocaleString()}` : "" }}</p>
            </td>
            <td>
              <p class="font-weight-regular maintext--text mb-0">
                {{ item.fail_reason ? item.fail_reason : "Order placed successfully" }}
              </p>
            </td>
            <td>
              <p class="font-weight-medium maintext--text mb-0 text-capitalize">
                <img width="20px" class="mb-n02" v-if="item.appstatus == 'Success'" :src="successIcon" />
                <img width="20px" class="mb-n02" v-else-if="item.appstatus == 'Pending'" :src="warningIcon" />
                <img width="20px" class="mb-n02" v-else :src="errorIcon" />

                {{ item.appstatus ? item.appstatus : "" }}
              </p>
            </td>
          </tr>
          <template
            v-if="ordertab == 1 ? (!execorders || execorders.length === 0) : (!openorders || openorders.length === 0)">
            <tr>
              <td colspan="6" class="text-center">
                <div class="mx-auto py-16 mt-16">
                  <img class="mx-auto" width="80px" :src="noDataFolder" />
                  <h4 class="txt-999 font-weight-regular caption">
                    There is no {{ ordertab == 1 ? "Open" : "Close" }} order 
                    data here yet!
                  </h4>
                </div>
              </td>
            </tr>
          </template>
        </template>
      </v-data-table>
      <div class="d-md-none mb-16">
        <v-divider></v-divider>
        <v-progress-linear v-if="tableloader" indeterminate></v-progress-linear>
        <div v-if="filteredOrderbookdataSorted && filteredOrderbookdataSorted.length > 0">
          <v-card
            v-for="(item, o) in filteredOrderbookdataSorted.length < showtable ? filteredOrderbookdataSorted.slice(0, showtable) : filteredOrderbookdataSorted"
            :key="o" class="elevation-0 rounded-0 overflow-hidden crd-trn">
            <div>
              <div class="px-0" @click="setOrderrowdata(item)">
                <v-list-item class="pa-0">
                  <div class="d-flex flex-column flex-grow-1 pa-0 pt-1">
                    <p class="fs-13 font-weight-bold mb-0 maintext--text table-hov-text mt-2">
                      {{ item.symbol ? item.symbol : "" }}
                    </p>
                    <v-chip-group column class="mb-0">
                      <v-chip class="px-0 crd-trn" text-color="maintext">
                        <p class="font-weight-medium maintext--text mb-0 text-capitalize">
                          <img width="20px" class="mb-n02" v-if="item.appstatus == 'Success'" :src="successIcon" />
                          <img width="20px" class="mb-n02" v-else-if="item.appstatus == 'Pending'" :src="warningIcon" />
                          <img width="20px" class="mb-n02" v-else :src="errorIcon" />

                          {{ item.appstatus ? item.appstatus : "" }}
                        </p>
                      </v-chip>
                    </v-chip-group>
                  </div>
                  <template v-slot:append>
                    <div @click.stop class="d-flex align-center">
                      <v-icon size="20" color="maintext">mdi-chevron-right</v-icon>

                      <v-menu close-on-click absolute offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" style="border: 1px solid var(--outline)" min-width="20px" color="cardbg"
                            class="px-0 font-weight-bold white--text elevation-0 float-right" size="x-small">
                            <v-icon size="20" color="maintext">mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-card class="table-menu-list">
                          <v-list density="compact">
                            <div v-for="(m, k) in ordertab == 0 ? menulist.open : menulist.exec" :key="k">
                              <v-list-item
                                @click="m.type == 'new' ? router.push('/bonds') : m.type == 'cd' ? setOrdercancel(item) : setOrderrowdata(item)"
                                class="pl-3 pr-6">
                                <template v-slot:prepend>
                                  <img v-if="m.icon > 2 && getOrderbookIcon(m.icon)" width="20px" class="pl-1 mr-3"
                                    :src="getOrderbookIcon(m.icon)" />
                                  <v-icon v-else class="mr-3" color="#506D84">{{ m.icon }}</v-icon>
                                </template>
                                <v-list-item-title class="subline--text font-weight-medium fs-14">{{ m.name
                                  }}</v-list-item-title>
                              </v-list-item>
                              <v-divider v-if="m.hr" class="mx-3"></v-divider>
                            </div>
                          </v-list>
                        </v-card>
                      </v-menu>
                    </div>
                  </template>
                </v-list-item>
                <v-divider></v-divider>

                <v-row class="py-2" no-gutters>
                  <v-col cols="6">
                    <p class="mb-1 fs-12 font-weight-bold maintext--text">{{ item.investmentValue ?
                      `₹${item.investmentValue.toLocaleString()}` : "" }}</p>
                    <p class="mb-1 fs-12 subtext--text">Invested amount</p>
                  </v-col>
                  <v-col cols="6" class="text-right">
                    <p class="mb-1 fs-12 font-weight-bold maintext--text">{{ item.response_datetime ?
                      item.response_datetime.slice(0, 16) : "-" }}</p>
                    <p class="mb-1 fs-12 subtext--text">Bid Date & time</p>
                  </v-col>
                </v-row>
              </div>
              <v-card v-if="uid && showtable - 1 != o" class="pt-1 rounded-0 elevation-0" color="secbg"></v-card>
            </div>
          </v-card>
        </div>
        <v-card v-else class="elevation-0 rounded-0 text-center">
          <div class="mx-auto py-8">
            <img class="align-self-stretch mx-auto" width="70px" :src="noDataFolder" />
            <h4 class="txt-999 font-weight-regular fs-14">There is no data here yet!</h4>
          </div>
        </v-card>
        <v-btn v-if="showtable < filteredOrderbookdataSorted.length" color="primary" variant="text"
          class="elevation-0 text-none font-weight-bold py-4 mb-1" @click="showtable += 24" block>show more</v-btn>
      </div>
    </div>
    <v-navigation-drawer v-model="orderdrawer" temporary location="right" :scrim="false" width="360" color="cardbg"
      class="pt-0">
      <template v-slot:prepend>
        <v-toolbar class="nav-drawer crd-trn" density="comfortable" style="border-bottom: 1px solid #EBEEF0;">
          <v-btn icon variant="text" density="comfortable" @click="closeOrderDrawer">
            <v-icon color="maintext" size="20">mdi-close</v-icon>
          </v-btn>
          <p class="maintext--text font-weight-bold mb-0 ml-2">Order Details</p>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>

      <div v-if="singledata && Object.keys(singledata).length > 0" class="d-flex flex-column"
        style="height: calc(100% - 64px);">
        <!-- Symbol and Investment Value Section -->
        <div class="px-4 pt-6 pb-5">
          <p class="font-weight-bold maintext--text fs-18" style="font-size: 16px !important;">
            {{ singledata.symbol ? singledata.symbol : "" }}
            <span class="ml-1 txt-999 fs-10">{{ singledata.series ? singledata.series : "" }}</span>
          </p>
          <p class="subtext--text font-weight-medium fs-12 mb-0" style="font-size: 12px !important;">
            ₹{{ singledata.investmentValue ? singledata.investmentValue.toLocaleString() : "0.00" }}
          </p>
        </div>

        <!-- Order Status Section -->
        <div class="px-4 py-1">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Order</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Entry Success</p>
            <div class="d-flex align-center">
              <img width="20px" class="mr-1" :src="successIcon" />
              <span class="txt-000 font-weight-bold fs-14">Success</span>
            </div>
          </div>
        </div>

        <!-- Verification Status Section -->
        <div class="px-4 py-5" style="border-bottom: 1px solid #EBEEF0;">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Verification</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">
              {{ singledata.verificationStatus == "S" ? "Verified" : singledata.verificationStatus == "P" ? "Pending" :
                "Failed" }}
            </p>
            <div class="d-flex align-center">
              <img width="20px" class="mr-1" v-if="singledata.verificationStatus == 'S'" :src="successIcon" />
              <img width="20px" class="mr-1" v-else-if="singledata.verificationStatus == 'P'" :src="warningIcon" />
              <img width="20px" class="mr-1" v-else :src="errorIcon" />
              <span class="txt-000 font-weight-bold fs-14">
                {{ singledata.verificationStatus == "S" ? "Success" : singledata.verificationStatus == "P" ? "Pending" :
                  "Failed" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Clearing Status Section -->
        <div class="px-4 py-5" style="border-bottom: 1px solid #EBEEF0;">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Clearing</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.clearingStatus ? singledata.clearingStatus : ""
              }}
            </p>
            <div class="d-flex align-center">
              <img width="20px" class="mr-1" v-if="singledata.clearingStatus == 'Allotted'" :src="successIcon" />
              <img width="20px" class="mr-1"
                v-else-if="singledata.clearingStatus == 'Fund Pending' || singledata.clearingStatus == 'Sent to NSCCL'"
                :src="warningIcon" />
              <img width="20px" class="mr-1" v-else :src="errorIcon" />
              <span class="txt-000 font-weight-bold fs-14">
                {{ singledata.clearingStatus == "Allotted" ? "Success" : singledata.clearingStatus == "Fund Pending" ||
                  singledata.clearingStatus == "Sent to NSCCL" ? "Pending" : "Failed" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Id Section -->
        <div class="px-4 py-5">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Order Id</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.orderNumber || '-' }}</p>
            <div class="d-flex align-center">
              <img width="20px" class="mr-1" v-if="singledata.appstatus == 'Success'" :src="successIcon" />
              <img width="20px" class="mr-1" v-else-if="singledata.appstatus == 'Pending'" :src="warningIcon" />
              <img width="20px" class="mr-1" v-else :src="errorIcon" />
              <span class="txt-000 font-weight-bold fs-14">{{ singledata.appstatus ? singledata.appstatus : "" }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-4 py-5" style="border-bottom: 1px solid #EBEEF0;">
          <v-btn v-if="singledata.way == 'exec'" @click="router.push('/bonds')" rounded="pill"
            class="text-none font-weight-bold" block height="40" variant="outlined"
            style="border: 1px solid #000;">Place
            New order</v-btn>
          <v-btn v-else @click="handleCancelClick" rounded="pill" class="text-none font-weight-bold" block height="40"
            variant="outlined" style="border: 1px solid #000;">Cancel Order</v-btn>
        </div>

        <!-- Details Section -->
        <div class="px-4 flex-grow-1" style="overflow-y: auto;">
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">App no</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.applicationNumber ?
              singledata.applicationNumber :
              "-" }}</p>
          </div>
          <div v-if="singledata.series == 'SGB'" class="d-flex justify-space-between align-center py-4"
            style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Quantity</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.quantity ? singledata.quantity : "-" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Total amount</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ singledata.investmentValue ?
              singledata.investmentValue.toLocaleString() : "0" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Price</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ singledata.bid_detail ? (singledata.bid_detail.price ||
              "0.00") : "0.00" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Series</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.series ? singledata.series : "-" }}</p>
          </div>
          <div class="py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14">Failed reason</p>
            <p class="fs-12 txt-444 font-weight-regular mb-0">
              {{ singledata.fail_reason ? singledata.fail_reason : "Order placed successfully" }}
            </p>
          </div>
        </div>
      </div>
    </v-navigation-drawer>
    <!-- Cancel Dialog -->
    <v-dialog v-model="canceldialog" max-width="400">
      <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
        <div class="text-center">
          <img src="@/assets/orderbook/cancel-icon.svg" width="50px" alt="cancel icon" />
        </div>
        <p class="font-weight-medium mt-3 lh-24 mb-8" style="font-size: 22px !important;">
          Are you sure you want to<br />
          cancel <b>{{ singledata === 'all' ? 'all' : Array.isArray(singledata) ? `${singledata.length}` :
            singledata?.symbol || '' }}</b>
          {{ singledata === 'all' || (Array.isArray(singledata) && singledata.length > 1) ? 'orders' : 'order' }}?
        </p>
        <v-row class="px-6" no-gutters>
          <v-col cols="6" class="px-2">
            <v-btn @click="canceldialog = false; singledata = {}" color="outline"
              class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block height="40">No</v-btn>
          </v-col>
          <v-col cols="6" class="px-2">
            <v-btn @click="handleCancelConfirm" color="btnclr"
              class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40">Yes</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getBondbook, getBondsgbbook } from '../../../components/mixins/getAPIdata.js'
import { useAppStore } from '@/stores/appStore'

// Import assets statically
import noDataFolder from '@/assets/no data folder.svg'
import orderbookIcon3 from '@/assets/orderbook/3.svg'
import orderbookIcon10 from '@/assets/orderbook/10.svg'
import orderbookIcon12 from '@/assets/orderbook/12.svg'
import successIcon from '@/assets/success.svg'
import warningIcon from '@/assets/warning.svg'
import errorIcon from '@/assets/error.svg'

const router = useRouter()
const appStore = useAppStore()

// Helper function to get orderbook icon
const getOrderbookIcon = (iconNumber) => {
  const iconMap = {
    3: orderbookIcon3,
    10: orderbookIcon10,
    12: orderbookIcon12,
  }
  return iconMap[iconNumber] || null
}

const uid = ref("")
const token = ref("")
const orderdrawer = ref(false)
const canceldialog = ref(false)
const singledata = ref({})
const selectedOrderId = ref(null)
const tableloader = ref(true)
const ordertab = ref(0)
const showtable = ref(24)
const menulist = ref({
  open: [
    { name: "Cancel Order", icon: 12, type: "cd" },
    { name: "Order Status", icon: 3, type: "", hr: true },
    { name: "Details", icon: 10, type: "detail" },
  ],
  exec: [
    { name: "New Order", icon: "mdi-plus", type: "new", trans: "b" },
    { name: "Order Status", icon: 3, type: "", hr: true },
    { name: "Details", icon: 10, type: "detail" },
  ],
})
const opensearch = ref('')
const execsearch = ref('')
const openorders = ref([])
const execorders = ref([])
const filter = ref('All')
const seriesFilter = ref(null)
const filtercount = ref(0)
const bonddselected = ref([])
const ordertype = ref("open")
const orderbookdata = ref([])

const orderheader = computed(() => {
  return [
    { title: "Symbol", key: "symbol", sortable: false },
    { title: "Order Number", key: "orderNumber", sortable: false },
    { title: "Datetime", key: "response_datetime" },
    { title: "Amount", key: "investmentValue", sortable: false, align: "end" },
    { title: "Reason", key: "reason", sortable: false, width: "30%" },
    { title: "Status", key: "reponse_status", sortable: false },
  ]
})

const filterso = [
  { title: 'All', value: 'All' },
  { title: 'Success', value: 'Success' },
  { title: 'Pending', value: 'Pending' },
  { title: 'Failed', value: 'Failed' },
]

const filterse = [
  { title: 'All', value: 'All' },
  { title: 'Success', value: 'Success' },
  { title: 'Pending', value: 'Pending' },
  { title: 'Failed', value: 'Failed' },
]

// Get unique series for filter dropdown
const uniqueSeries = computed(() => {
  if (!orderbookdata.value || orderbookdata.value.length === 0) {
    return []
  }

  const seriesSet = new Set()
  orderbookdata.value.forEach(item => {
    if (item && item.series) {
      seriesSet.add(item.series)
    }
  })

  return Array.from(seriesSet)
    .sort()
    .map(series => ({
      text: series,
      value: series
    }))
})

// Filter orderbook data based on search, status filter, and series filter
const filteredOrderbookdata = computed(() => {
  let list = ordertab.value === 0 ? openorders.value : execorders.value

  if (!list || list.length === 0) {
    return []
  }

  // Apply search filter - search by symbol, order number, series, amount, and reason
  const searchValue = ordertab.value === 0 ? opensearch.value : execsearch.value
  if (searchValue && searchValue.trim()) {
    const searchTerm = searchValue.trim().toUpperCase()
    const numericPart = searchTerm.replace(/[^0-9.]/g, '')
    const isNumeric = numericPart !== '' && !isNaN(parseFloat(numericPart))

    list = list.filter(item => {
      // Search by symbol
      const symbol = (item.symbol || '').toUpperCase()
      // Search by series
      const series = (item.series || '').toUpperCase()
      // Search by order number
      const orderNumber = String(item.orderNumber || '').toUpperCase()
      // Search by application number
      const applicationNumber = String(item.applicationNumber || '').toUpperCase()
      // Search by reason
      const reason = (item.fail_reason || '').toUpperCase()

      // Search by amount (investmentValue)
      const amount = item.investmentValue ? item.investmentValue.toLocaleString() : '0'

      // Text search
      if (symbol.includes(searchTerm) ||
        series.includes(searchTerm) ||
        orderNumber.includes(searchTerm) ||
        applicationNumber.includes(searchTerm) ||
        reason.includes(searchTerm)) {
        return true
      }

      // Numeric search for amounts
      if (isNumeric) {
        if (amount.includes(numericPart)) {
          return true
        }
      }

      return false
    })
  }

  // Apply status filter
  if (filter.value && filter.value !== 'All') {
    list = list.filter(item => item.appstatus === filter.value)
    filtercount.value = list.length
  } else {
    filtercount.value = 0
  }

  // Filter by series if selected
  if (seriesFilter.value) {
    list = list.filter(item => item.series === seriesFilter.value)
  }

  return list
})

// Sorted version for display
const filteredOrderbookdataSorted = computed(() => {
  return [...filteredOrderbookdata.value]
})

// Handle orderbook update event
const handleOrderbookUpdate = (event) => {
  const book = event.detail || event
  if (book == 'bonds' || (book && book.detail === 'bonds')) {
    getOrderbook()
  }
}

onMounted(async () => {
  try {
    token.value = sessionStorage.getItem("usession") || ""
    uid.value = sessionStorage.getItem("userid") || ""
    // Ensure drawer is closed on mount
    orderdrawer.value = false
    singledata.value = {}
    selectedOrderId.value = null

    // Only fetch if we have credentials
    if (token.value && uid.value) {
      await getOrderbook()
    } else {
      tableloader.value = false
    }

    window.addEventListener('orderbook-update', handleOrderbookUpdate)
  } catch (error) {
    // console.error('Error in onMounted:', error)
    tableloader.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('orderbook-update', handleOrderbookUpdate)
})

const getOrderbook = async () => {
  openorders.value = []
  execorders.value = []
  tableloader.value = true
  try {
    // Fetch both bond types in parallel
    const [datab, datas] = await Promise.all([
      getBondbook([uid.value, token.value]).catch(() => []),
      getBondsgbbook([uid.value, token.value]).catch(() => [])
    ])

    let data = []
    if (datab && datab.length > 0 && datas && datas.length > 0) {
      data = [...datab, ...datas]
    } else if (datab && datab.length > 0) {
      data = datab
    } else if (datas && datas.length > 0) {
      data = datas
    }

    if (data && data.length > 0) {
      for (let q = 0; q < data.length; q++) {
        if (!data[q]) continue

        data[q]["idx"] = q

        // Parse bid_detail if it's a string
        if (data[q].bid_detail && typeof data[q].bid_detail === 'string') {
          try {
            // Handle Python-like string representation
            let cleaned = data[q].bid_detail
              .replace(/'/g, '"')
              .replace(/\bNone\b/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false")
            data[q]["bid_detail"] = JSON.parse(cleaned)
          } catch (e) {
            // console.warn('Error parsing bid_detail:', e)
            data[q]["bid_detail"] = {}
          }
        }

        // Parse response_json if it's a string
        if (data[q].response_json && typeof data[q].response_json === 'string') {
          try {
            let cleanedJson = data[q].response_json
              .replace(/'/g, '"')
              .replace(/\bNone\b/g, "null")
              .replace(/\bTrue\b/g, "true")
              .replace(/\bFalse\b/g, "false")

            // Remove wrapping quotes if present
            if ((cleanedJson.startsWith("'") && cleanedJson.endsWith("'")) ||
              (cleanedJson.startsWith('"') && cleanedJson.endsWith('"'))) {
              cleanedJson = cleanedJson.slice(1, -1)
            }

            data[q]["response_json"] = JSON.parse(cleanedJson)
          } catch (e) {
            // console.warn('Error parsing response_json:', e)
            data[q]["response_json"] = {}
          }
        }

        // Set series based on response_json
        if (data[q].response_json && data[q].response_json.series) {
          const seriesMap = {
            "TB": "T-BILL",
            "GS": "G-SEC",
            "GB": "SGB"
          }
          data[q]["series"] = seriesMap[data[q].response_json.series] || data[q].response_json.series
        }

        // Set fail_reason
        if (data[q].bid_detail && data[q].bid_detail.requestfor == "REMOVE") {
          data[q]["fail_reason"] = "Order was canceled by yourself."
        }

        // Set appstatus
        if (!data[q].fail_reason) {
          if (data[q].verificationStatus == "S" && data[q].clearingStatus == "Allotted") {
            data[q]["appstatus"] = "Success"
          } else if (data[q].verificationStatus == "P" &&
            (data[q].clearingStatus == "Sent to NSCCL" || data[q].clearingStatus == "Fund Pending")) {
            data[q]["appstatus"] = "Pending"
          } else {
            data[q]["appstatus"] = "Failed"
          }
        } else {
          data[q]["appstatus"] = "Failed"
        }

        // Categorize as open or exec
        if (data[q].orderStatus == "ES" &&
          (data[q].verificationStatus == "S" || data[q].verificationStatus == "P") &&
          data[q].clearingStatus != "Rejected") {
          data[q]["way"] = "open"
          openorders.value.push(data[q])
        } else {
          data[q]["way"] = "exec"
          execorders.value.push(data[q])
        }
      }
      orderbookdata.value = JSON.parse(JSON.stringify(data))
      ordertype.value = "open"
    } else {
      orderbookdata.value = []
    }
  } catch (error) {
    // console.error('Error fetching orderbook:', error)
    appStore.showSnackbar(2, 'Failed to load bonds orderbook')
    orderbookdata.value = []
  }
  tableloader.value = false
}

const setOrdercancel = (item) => {
  singledata.value = {}
  canceldialog.value = true
  singledata.value = item
}

const handleCancelClick = () => {
  orderdrawer.value = false
  canceldialog.value = true
}

const openCancelDialog = (item) => {
  if (item === 'all') {
    singledata.value = 'all'
  } else if (Array.isArray(item) && item.length > 0) {
    singledata.value = item
  } else if (item && item.orderNumber) {
    singledata.value = item
  } else {
    // If no item provided, use selected orders or all
    if (bonddselected.value.length > 0) {
      singledata.value = bonddselected.value
    } else {
      singledata.value = 'all'
    }
  }
  canceldialog.value = true
}

async function cancelSelectedBonds() {
  // Cancel all selected orders
  for (let i = 0; i < bonddselected.value.length; i++) {
    if (bonddselected.value[i]) {
      window.dispatchEvent(new CustomEvent('bondmodify-event', {
        detail: bonddselected.value[i]
      }))
    }
    if (i < bonddselected.value.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  bonddselected.value = []
}

const handleCancelConfirm = () => {
  if (singledata.value === 'all' || (Array.isArray(singledata.value) && singledata.value.length === 0)) {
    // Cancel all orders - select all items first
    bonddselected.value = [...filteredOrderbookdataSorted.value]
    if (bonddselected.value.length > 0) {
      cancelSelectedBonds()
    } else {
      appStore.showSnackbar(0, 'No orders to cancel')
    }
  } else if (Array.isArray(singledata.value) && singledata.value.length > 0) {
    // Cancel selected orders from array
    bonddselected.value = [...singledata.value]
    cancelSelectedBonds()
  } else if (singledata.value && singledata.value.orderNumber) {
    // Cancel single order
    window.dispatchEvent(new CustomEvent('bondmodify-event', {
      detail: singledata.value
    }))
  } else {
    // Cancel all selected orders from table selection
    if (bonddselected.value.length > 0) {
      cancelSelectedBonds()
    } else {
      appStore.showSnackbar(0, 'Please select at least one order to cancel')
    }
  }
  canceldialog.value = false
  singledata.value = {}
  // Refresh orderbook after cancel
  setTimeout(() => {
    getOrderbook()
  }, 500)
}

const setOrderrowdata = (item) => {
  // Get the current item ID for comparison
  const currentItemId = item.orderNumber || item.id || JSON.stringify(item)

  // If drawer is open and same item is clicked, close it
  if (orderdrawer.value && selectedOrderId.value === currentItemId) {
    orderdrawer.value = false
    singledata.value = {}
    selectedOrderId.value = null
  } else {
    // Otherwise, open drawer with the clicked item
    singledata.value = item
    selectedOrderId.value = currentItemId
    orderdrawer.value = true
  }
}

const closeOrderDrawer = () => {
  orderdrawer.value = false
  singledata.value = {}
  selectedOrderId.value = null
}

const ordCancel = (singledataItem) => {
  window.dispatchEvent(new CustomEvent('bondmodify-event', { detail: singledataItem }))
  canceldialog.value = false
  singledata.value = {}
  // Refresh orderbook after cancel
  setTimeout(() => {
    getOrderbook()
  }, 500)
}

// Watch for tab changes to clear selection and search
watch(ordertab, (newTab, oldTab) => {
  if (newTab !== oldTab) {
    bonddselected.value = []
    opensearch.value = ''
    execsearch.value = ''
    filter.value = 'All'
    seriesFilter.value = null
    filtercount.value = 0
    orderdrawer.value = false
    canceldialog.value = false
    singledata.value = {}
  }
})
</script>
<style scoped>
.maintext--text {
  color: black !important;
}

/* Drawer styling */
:deep(.v-navigation-drawer) {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-navigation-drawer .v-btn--variant-outlined) {
  border-color: #000 !important;
  color: #000 !important;
}

:deep(.v-navigation-drawer .v-btn--variant-outlined:hover) {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

/* Data table header font size */
:deep(.v-data-table thead th),
:deep(.v-data-table table thead th),
:deep(.v-data-table .v-data-table__wrapper table thead th),
:deep(.v-data-table.v-data-table--fixed-header thead th),
:deep(.v-data-table.v-data-table--fixed-header table thead th),
:deep(.holdings-table.v-data-table thead th),
:deep(.holdings-table.v-data-table table thead th),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header table thead th) {
  font-size: 13px !important;
}

/* Reload icon rotation animation */
.reload-rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Make table rows clickable */
:deep(.table-row) {
  cursor: pointer;
}

:deep(.table-row:hover) {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

:deep(.v-text-field input) {
  font-size: 14px !important;
}
</style>
