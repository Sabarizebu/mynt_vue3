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

        <v-select v-if="ordertab === 0" v-model="filter" :items="filterso" item-title="title" item-value="value"
          prepend-inner-icon="mdi-format-list-bulleted" rounded hide-details class="rounded-pill ml-3" variant="solo"
          density="compact" flat bg-color="secbg" elevation="0" style="max-width: 160px" :disabled="tableloader"
          @update:model-value="filtercount = 0"></v-select>
        <v-select v-else v-model="filter" :items="filterse" item-title="title" item-value="value"
          prepend-inner-icon="mdi-format-list-bulleted" rounded hide-details class="rounded-pill ml-3" variant="solo"
          density="compact" flat bg-color="secbg" elevation="0" style="max-width: 160px" :disabled="tableloader"
          @update:model-value="filtercount = 0"></v-select>

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
        :item-class="() => 'table-row'" @click:row="(event, { item }) => setOrderrowdata(item)">
        <template v-slot:body="{ items, headers }">
          <tr v-if="filteredOrderbookdataSorted && filteredOrderbookdataSorted.length > 0" class="table-row"
            v-for="(item, o) in items" :key="o" @click="setOrderrowdata(item)">
            <td class="pos-rlt">
              <span class="table-hov-text maintext--text font-weight-medium">{{ item.symbol ? item.symbol : "-"
                }}</span> <span class="ml-1 subtext--text fs-10">{{ item.series ? item.series : "" }}</span>
              <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0; z-index: 1;">
                <v-menu close-on-click absolute offset-y class="table-menu">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" @click="handleMenuButtonClick" style="border: 1px solid var(--outline);"
                      min-width="20px" color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                      size="x-small">
                      <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                    </v-btn>
                  </template>
                  <v-card class="table-menu-list">
                    <v-list density="compact">
                      <div v-for="(m, k) in ordertab === 0 ? menulist.open : menulist.exec" :key="k">
                        <v-list-item @click="handleMenuItemClick(m.type, item)" class="pl-3 pr-6">
                          <template #prepend>
                            <img v-if="m.icon > 2 && getOrderbookIcon(m.icon)" width="20px" class="pl-1 mr-3"
                              :src="getOrderbookIcon(m.icon)" />
                            <v-icon v-else color="#506D84">{{ m.icon }}</v-icon>
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
              <v-chip size="small" class="table-hov-prd rounded-md" label text-color="subtext">
                <span class="font-weight-medium fs-12">{{ item.applicationNumber }}</span>
              </v-chip>
            </td>

            <td>
              <span class="font-weight-medium maintext--text">{{ item.response_datetime ?
                item.response_datetime.slice(0, 16) : "-"
                }}</span>
            </td>
            <td>
              <v-chip size="small" class="table-hov-prd rounded-md" label text-color="subtext">
                <span class="font-weight-medium fs-12">{{ item.quantity }}</span>
              </v-chip>
            </td>
            <td class="text-right font-weight-medium">
              <p class="font-weight-medium maintext--text mb-0">{{ item.bid_detail && item.bid_detail[0] ?
                `₹${item.amount.toLocaleString()}` : "" }}</p>
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
          <template v-if="!filteredOrderbookdataSorted || filteredOrderbookdataSorted.length === 0">
            <tr>
              <td colspan="7" class="text-center">
                <div class="mx-auto py-16 mt-16">
                  <img class="mx-auto" width="80px" :src="noDataFolder" />
                  <h4 class="txt-999 font-weight-regular caption">
                    There is no {{ ordertab == 1 ? "Close" : "Open" }} order <br />
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
                      <v-chip class="pr-0 crd-trn" text-color="maintext">
                        <span class="caption">BID Qty: </span> <b> {{ item.quantity }}</b>
                      </v-chip>
                    </v-chip-group>
                  </div>
                  <template v-slot:append>
                    <div @click.stop class="d-flex align-center">
                      <v-icon size="20" color="maintext">mdi-chevron-right</v-icon>

                      <v-menu close-on-click absolute offset-y>
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" @click="handleMenuButtonClick" style="border: 1px solid var(--outline)"
                            min-width="20px" color="cardbg"
                            class="px-0 font-weight-bold white--text elevation-0 float-right" size="x-small">
                            <v-icon size="20" color="maintext">mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-card class="table-menu-list">
                          <v-list density="compact">
                            <div v-for="(m, k) in ordertab == 0 ? menulist.open : menulist.exec" :key="k">
                              <v-list-item
                                @click="m.type == 'new' ? $router.push('/ipo') : m.type == 'md' ? setModifyorder(item) : m.type == 'cd' ? setOrdercancel(item) : setOrderrowdata(item)"
                                class="pl-3 pr-6">
                                <template #prepend>
                                  <div class="d-flex align-center justify-center mr-3"
                                    style="width: 20px; min-width: 20px;">
                                    <img v-if="m.icon > 2 && getOrderbookIcon(m.icon)" width="20px" class="pl-1"
                                      :src="getOrderbookIcon(m.icon)" />
                                    <v-icon v-else color="#506D84" size="20">{{ m.icon }}</v-icon>
                                  </div>
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
                    <p class="mb-1 fs-12 font-weight-bold maintext--text">{{ item.bid_detail && item.bid_detail[0] ?
                      `₹${item.amount.toLocaleString()}` : "" }}</p>
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
        <!-- Company Name and Symbol Section -->
        <div class="px-4 pt-6 pb-5">
          <p class="font-weight-bold maintext--text fs-18" style="font-size: 16px !important;">
            {{ singledata.company_name ? singledata.company_name : singledata.symbol || '' }}
          </p>
          <p class="subtext--text font-weight-medium fs-12 mb-0" style="font-size: 12px !important;">
            {{ singledata.symbol ? singledata.symbol : '' }}
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

        <!-- Payment Status Section -->
        <div class="px-4 py-5" style="border-bottom: 1px solid #EBEEF0;">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Payment</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ !singledata.upiPaymentStatus ? "Unknown" :
              singledata.upiPaymentStatus }}</p>
            <div class="d-flex align-center">
              <img width="20px" class="mr-1" v-if="singledata.upiPaymentStatus == 'Accepted by Investor'"
                :src="successIcon" />
              <img width="20px" class="mr-1"
                v-else-if='(singledata.upiPaymentStatus == "Request Accepted By Sponsor Bank" || singledata.upiPaymentStatus == "Request Sent") || !singledata.upiPaymentStatus'
                :src="warningIcon" />
              <img width="20px" class="mr-1" v-else :src="warningIcon" />
              <span class="txt-000 font-weight-bold fs-14">
                {{ singledata.upiPaymentStatus == "Accepted by Investor" ? "Verified" :
                  (singledata.upiPaymentStatus == "Request Accepted By Sponsor Bank" || singledata.upiPaymentStatus ==
                    "Request Sent") ? "Pending" :
                    !singledata.upiPaymentStatus ? "Unknown" : "Failed" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Id Section -->
        <div class="px-4 py-5">
          <p class="subtext--text font-weight-medium fs-13 mb-1">Order Id</p>
          <div class="d-flex justify-space-between align-center">
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.applicationNumber || '-' }}</p>
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
          <v-btn v-if="singledata.way == 'exec'" @click="router.push('/ipo')" rounded="pill"
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
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.resp_bid && singledata.resp_bid[0] ?
              singledata.resp_bid[0].bidReferenceNumber : "-" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Quantity</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.bid_detail ? singledata.quantity : "-" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Total amount</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ singledata.bid_detail ?
              singledata.amount.toLocaleString() :
              "0" }}</p>
          </div>
          <div class="d-flex justify-space-between align-center py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14 mb-0">Price</p>
            <p class="txt-000 font-weight-bold fs-14 mb-0">₹{{ singledata.bid_detail && singledata.quantity ?
              (singledata.amount / singledata.quantity).toFixed(2) : "0.00" }}</p>
          </div>
          <div class="py-4">
            <p class="txt-000 font-weight-bold fs-14 mb-0">{{ singledata.len ? (singledata.len == 1
              ? "Single" : singledata.len == 2 ? "Double" : "Triple") : "" }} bid order</p>
          </div>
          <div v-if="singledata.bid_detail && Array.isArray(singledata.bid_detail)">
            <div v-for="(b, s) in singledata.bid_detail" :key="s" class="pb-2"
              style="border-bottom: 1px solid #EBEEF0;">
              <p class="fs-12 txt-444 font-weight-medium mb-2">bid {{ s + 1 }}</p>
              <v-row no-gutters>
                <v-col cols="3">
                  <p class="txt-000 font-weight-bold fs-12 mb-0" style="color: #282828 !important;">{{ b.amount ?
                    b.amount.toLocaleString() : '-' }}</p>
                  <p class="fs-10 txt-444 mb-0">Amount</p>
                </v-col>
                <v-col cols="3">
                  <p class="txt-000 font-weight-bold fs-12 mb-0" style="color: #282828 !important;">{{ b.price || '-' }}
                  </p>
                  <p class="fs-10 txt-444 mb-0">Price</p>
                </v-col>
                <v-col cols="3">
                  <p class="txt-000 font-weight-bold fs-12 mb-0" style="color: #282828 !important;">{{ b.quantity || '-'
                    }}
                  </p>
                  <p class="fs-10 txt-444 mb-0">Quantity</p>
                </v-col>
                <v-col cols="3">
                  <p class="txt-000 font-weight-bold fs-12 mb-0" style="color: #282828 !important;">{{ b.atCutOff ?
                    "Yes" :
                    "No" }}
                  </p>
                  <p class="fs-10 txt-444 mb-0">Cut off</p>
                </v-col>
              </v-row>
              <v-divider v-if="singledata.len - 1 != s" class="mt-2 mb-2"></v-divider>
            </div>
          </div>
          <div class="py-4" style="border-bottom: 1px solid #EBEEF0;">
            <p class="txt-000 font-weight-bold fs-14">Reason</p>
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
          cancel this <b>{{ singledata.symbol ? singledata.symbol : "" }}</b> order?
        </p>
        <v-row class="px-6" no-gutters>
          <v-col cols="6" class="px-2">
            <v-btn @click="canceldialog = false" color="outline"
              class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block height="40">No</v-btn>
          </v-col>
          <v-col cols="6" class="px-2">
            <v-btn @click="ordCancel(singledata)" color="btnclr"
              class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40">Yes</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
    <v-dialog v-model="exitdialog" persistent max-width="400">
      <v-card class="rounded-xl elevation-0 pt-4 px-6 pb-6 overflow-hidden">
        <p class="font-weight-bold fs-22 lh-24 mb-4">Are you sure you want to Exit the order</p>
        <v-divider></v-divider>
        <v-list-item class="py-3 px-0 mb-2">
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-3">{{ singledata.tsym ? singledata.tsym :
              ""
              }} <span class="ml-1 subtext--text fs-10">{{ singledata.exch ? singledata.exch : ""
                }}</span></v-list-item-title>
            <v-list-item-title class="maintext--text font-weight-bold fs-14 mb-1">₹ 18,392.60 <span
                :class="singledata.avgprc > 0 ? 'maingreen--text' : singledata.avgprc < 0 ? 'mainred--text' : 'subtext--text'"
                class="font-weight-medium fs-12">-62.60 (0.34%)</span></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-row no-gutters>
          <v-col cols="6">
            <v-btn @click="exitdialog = false" color="secbg"
              class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block
              height="40px">Close</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn @click="exitdialog = false" color="btnclr"
              class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40px">Exit
              Order</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getIposbook } from '../../../components/mixins/getAPIdata.js'
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
const exitdialog = ref(false)
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
const filtercount = ref(0)
const ordertype = ref("open")
const orderbookdata = ref([])

const orderheader = computed(() => {
  return [
    { title: "Symbol", key: "symbol", sortable: false },
    { title: "Order Number", key: "applicationNumber", sortable: false },
    { title: "Datetime", key: "response_datetime" },
    { title: "Qty", key: "quantity", sortable: false },
    { title: "Amount", key: "amount", sortable: false, align: "end" },
    { title: "Reason", key: "reason", sortable: false, width: "24%" },
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

// Filter orderbook data based on search and status filter
const filteredOrderbookdata = computed(() => {
  let list = ordertab.value === 0 ? openorders.value : execorders.value

  if (!list || list.length === 0) {
    return []
  }

  // Ensure we only show items that match the current tab's way property
  const expectedWay = ordertab.value === 0 ? 'open' : 'exec'
  list = list.filter(item => item.way === expectedWay)

  // Apply search filter - search by symbol, company name, order number, application number, amount, and reason
  const searchValue = ordertab.value === 0 ? opensearch.value : execsearch.value
  if (searchValue && searchValue.trim()) {
    const searchTerm = searchValue.trim().toUpperCase()
    const numericPart = searchTerm.replace(/[^0-9.]/g, '')
    const isNumeric = numericPart !== '' && !isNaN(parseFloat(numericPart))

    list = list.filter(item => {
      // Search by symbol
      const symbol = (item.symbol || '').toUpperCase()
      // Search by company name
      const companyName = (item.company_name || '').toUpperCase()
      // Search by application number
      const applicationNumber = String(item.applicationNumber || '').toUpperCase()
      // Search by order number (bid reference number)
      const bidRefNumber = item.resp_bid && item.resp_bid[0]
        ? String(item.resp_bid[0].bidReferenceNumber || '').toUpperCase()
        : ''
      // Search by reason
      const reason = (item.fail_reason || '').toUpperCase()
      // Search by payment status
      const paymentStatus = (item.upiPaymentStatus || '').toUpperCase()

      // Search by amount (amount)
      const amount = item.amount ? item.amount.toLocaleString() : '0'
      // Search by quantity
      const quantity = String(item.quantity || '0')

      // Text search
      if (symbol.includes(searchTerm) ||
        companyName.includes(searchTerm) ||
        applicationNumber.includes(searchTerm) ||
        bidRefNumber.includes(searchTerm) ||
        reason.includes(searchTerm) ||
        paymentStatus.includes(searchTerm)) {
        return true
      }

      // Numeric search for amounts and quantities
      if (isNumeric) {
        if (amount.includes(numericPart) || quantity.includes(numericPart)) {
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

  return list
})

// Sorted version for display
const filteredOrderbookdataSorted = computed(() => {
  return [...filteredOrderbookdata.value]
})

// Handle orderbook update event
const handleOrderbookUpdate = (event) => {
  const book = event.detail || event
  if (book == 'ipo' || (book && book.detail === 'ipo')) {
    getOrderbook()
  }
}

onMounted(() => {
  token.value = sessionStorage.getItem("usession")
  uid.value = sessionStorage.getItem("userid")
  // Ensure drawer is closed on mount
  orderdrawer.value = false
  singledata.value = {}
  selectedOrderId.value = null
  getOrderbook()

  window.addEventListener('orderbook-update', handleOrderbookUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('orderbook-update', handleOrderbookUpdate)
})

// Guard to prevent multiple simultaneous API calls
let isFetchingOrderbook = false

const getOrderbook = async () => {
  // Prevent multiple simultaneous calls
  if (isFetchingOrderbook) {
    return
  }

  isFetchingOrderbook = true
  tableloader.value = true

  // Clear all data immediately before fetching
  openorders.value = []
  execorders.value = []
  orderbookdata.value = []

  try {
    let data = await getIposbook([uid.value, token.value])

    // Clear arrays again after API call to ensure no stale data
    openorders.value = []
    execorders.value = []

    if (data && Array.isArray(data) && data.length > 0) {
      // Use a Set to track unique orders by applicationNumber to prevent duplicates
      const seenOrders = new Set()

      for (let q = 0; q < data.length; q++) {
        if (!data[q] || !data[q].bid_detail || !Array.isArray(data[q].bid_detail) || data[q].bid_detail.length === 0) {
          continue
        }

        // Create a unique identifier for this order
        const orderId = data[q].applicationNumber || `${data[q].symbol}_${data[q].response_datetime}_${q}`

        // Skip if we've already processed this order
        if (seenOrders.has(orderId)) {
          continue
        }
        seenOrders.add(orderId)

        data[q]["idx"] = q
        if (((data[q].upiPaymentStatus == "Request Accepted By Sponsor Bank" || data[q].upiPaymentStatus == "Request Sent" || !data[q].upiPaymentStatus) && !data[q].fail_reason && data[q].reponse_status == "new success") || data[q].reponse_status == "pending") {
          openorders.value.push(data[q])
          data[q]["way"] = "open"
        } else {
          execorders.value.push(data[q])
          data[q]["way"] = "exec"
        }
        data[q]["amount"] = Math.max(...data[q].bid_detail.map((o) => Number(o.amount)))
        data[q]["quantity"] = Math.max(...data[q].bid_detail.map((o) => Number(o.quantity)))
        data[q]["len"] = data[q].bid_detail.length
        data[q]["fail_reason"] = data[q].upiPaymentStatus ? data[q].upiPaymentStatus : (data[q].bid_detail && data[q].bid_detail[0] && (data[q].bid_detail.requestfor == "REMOVE" || data[q].bid_detail[0].activityType == "cancel")) ? "Order was canceled by yourself." : data[q]["fail_reason"]
        data[q]["appstatus"] = data[q].upiPaymentStatus == "Accepted by Investor" || ((data[q].fail_reason == 'Request Accepted By Sponsor Bank' || data[q].fail_reason == 'Request Sent' || !data[q].upiPaymentStatus) && data[q].reponse_status == "new success") ? "Success" : data[q].reponse_status == "pending" ? "Pending" : "Failed"
      }
      orderbookdata.value = data
      ordertype.value = "open"
    } else {
      orderbookdata.value = []
      openorders.value = []
      execorders.value = []
    }
  } catch (error) {
    // console.error('Error fetching orderbook:', error)
    orderbookdata.value = []
    openorders.value = []
    execorders.value = []
  } finally {
    tableloader.value = false
    isFetchingOrderbook = false
  }
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

const setOrderrowdata = async (item) => {
  if (!item) return

  // Always open drawer and set data (don't toggle to avoid glitches)
  // Clear previous data first to prevent showing stale data
  singledata.value = null

  // Use nextTick to ensure drawer state is reset before opening
  await nextTick()

  // Set new order data
  singledata.value = { ...item }
  selectedOrderId.value = item.applicationNumber || item.id || JSON.stringify(item)

  // Open drawer
  orderdrawer.value = !orderdrawer.value
}

const closeOrderDrawer = () => {
  orderdrawer.value = false
  singledata.value = {}
  selectedOrderId.value = null
}

const handleMenuButtonClick = () => {
  if (orderdrawer.value) {
    closeOrderDrawer()
  }
}

const setModifyorder = (singledataItem) => {
  orderdrawer.value = false
  window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'iposorder', item: singledataItem, value: 'mod' } }))
}

const ordCancel = (singledataItem) => {
  window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: 'iposorder', item: singledataItem, value: 'can' } }))
  canceldialog.value = false
  singledata.value = {}
  // Refresh orderbook after cancel
  setTimeout(() => {
    getOrderbook()
  }, 500)
}

const handleMenuItemClick = (type, item) => {
  switch (type) {
    case 'new':
      router.push('/ipo')
      break
    case 'md':
      setModifyorder(item)
      break
    case 'cd':
      setOrdercancel(item)
      break
    default:
      setOrderrowdata(item)
      break
  }
}

// Watch for tab changes to clear search and filter
watch(ordertab, (newTab, oldTab) => {
  if (newTab !== oldTab) {
    opensearch.value = ''
    execsearch.value = ''
    filter.value = 'All'
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