<template>
    <div>
      <v-dialog v-if="menudata.flow >= 0 || menudata.flow == 'mod'" v-model="iposorderdialog" persistent 
        @click:outside="!orderpoploader ? closeMenudialog('iposorder') : ''" width="540">
        <v-card class="pb-4 pt-2 overflow-hidden" color="cardbg" style="border-radius: 15px;">
          <v-toolbar class="elevation-0 px-1 px-md-2 crd-trn" density="compact">
            <p class="font-weight-bold fs-16 maintext--text mb-0">IPO Application</p>
            <v-spacer></v-spacer>
            <v-btn :disabled="orderpoploader" @click="closeMenudialog('iposorder')" color="maintext" size="x-small" variant="outlined">
              <v-icon size="10">mdi-close</v-icon>
             
            </v-btn>
          </v-toolbar>
          <v-progress-linear v-if="orderpoploader" indeterminate></v-progress-linear>
          <div v-else class="pt-1"></div>
  
          <v-card class="elevation-0 rounded-t-lg rounded-b-0 pt-3 mx-3 mx-md-6 px-4" color="secbg">
            <p class=" font-weight-bold mb-0 maintext--text table-hov-text mb-0">
              {{ menudata.name ? menudata.name : "" }}
              <v-chip color="grey" size="x-small" class="ml-2" text-color="#666"
                style="border-radius: 5px; padding: 10px 8px !important">
                <span class="font-weight-medium fs-10">
                  {{ menudata.symbol }}
                </span>
              </v-chip>
              <v-chip v-if="menudata.flow >= 0" color="grey" size="x-small" class="ml-2" text-color="#666"
                style="border-radius: 5px; padding: 10px 8px !important">
                <span class="font-weight-medium fs-10">
                  {{ menudata.flow == 0 ? "IPO" : "SME" }}
                </span>
              </v-chip>
            </p>
  
            <v-row class="px-0 pt-3">
              <v-col cols="4">
                <div>
                  <div class="font-weight-medium fs-14 maintext--text mb-0">{{
                    menudata.minBidQuantity
                      ?
                      menudata.minBidQuantity : "" }}</div>
                  <div class="fs-12 subtext--text">Min. quantity</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div>
                  <div class="font-weight-medium fs-14 maintext--text mb-0">₹ {{
                    menudata.minPrice ?
                      menudata.minPrice : "0.00" }} - ₹ {{ menudata.maxPrice ? menudata.maxPrice : "0.00"
                    }}</div>
                  <div class="fs-12 subtext--text">Price range</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div>
                  <div class="font-weight-medium fs-14 maintext--text mb-0"> {{
                    menudata.issueSize ?
                      (menudata.issueSize / 10000000).toFixed(2) : "" }} Cr</div>
                  <div class="fs-12 subtext--text">IPO Size</div>
                </div>
              </v-col>
            </v-row>
          </v-card>
          <v-card class="elevation-0 rounded-b-lg rounded-t-0 py-2 mx-3 mx-md-6 px-4" color="#FCEFD4">
            <p class="subtext--text fs-12 mb-0">
              IPO window is open till <b>{{ menudata.biddingEndDate ? menudata.biddingEndDate.slice(0, 11) :
                "" }}
                {{
                  menudata.dailyStartTime ? menudata.dailyEndTime.slice(0, 5) : "" }}.</b>
            </p>
          </v-card>
          <div v-if="iposbids.length > 0" id="bodytab" class="px-4 px-md-6 pt-4 pb-2 overflow-y-auto"
            style="height: calc(100vh - 500px) !important" @scroll.passive="handleScroll">
            <div v-if="menudata.category && menudata.category.val != 'modify'">
              <p class="font-weight-medium fs-14 maintext--text mb-2">Category</p>
              <v-autocomplete @update:model-value="ipoCalcs('cate')" return-object item-title="val" item-value="key"
                v-model="menudata.category" :items="menudata.categorys" append-icon="mdi-chevron-down"
                bg-color="secbg" flat class="rounded-pill mb-4" hide-details variant="solo"></v-autocomplete>
            </div>
            <div v-for="(b, i) in iposbids" :key="i">
              <div v-if="b.bitis">
                <p class="maintext--text fs-12 fs-12 font-weight-medium mb-2">
                  {{ iposbids[i].name }}
                  <v-btn
                    v-if="menudata.flow >= 0 && ((iposbids[2].bitis && iposbids[1].bitis && i == 2) || (!iposbids[2].bitis && iposbids[1].bitis && i == 1))"
                    @click="iposbids[i].bitis = false" color="mainred"
                    class="text-none font-weight-bold" variant="text" size="small">Delete</v-btn>
                </p>
                <v-row no-gutters>
                  <v-col cols="9">
                    <v-row no-gutters>
                      <v-col cols="6">
                        <p class="font-weight-medium fs-14 maintext--text mb-2">No.of Qty</p>
                        <v-text-field :disabled="orderpoploader" height="40px" density="compact"
                          bg-color="secbg" flat
                          @keyup="iposbids[i].qty ? (iposbids[i].qty = Number(iposbids[i].qty)) : iposbids[i].qty >= menudata.minBidQuantity ? iposbids[i].qty : menudata.minBidQuantity, ipoQtymultiper(i)"
                          class="rounded-pill" variant="solo" type="number" hide-spin-buttons
                          :min="menudata.minBidQuantity" hide-details :step="menudata.lotSize"
                          :max="menudata.maxbidqty" v-model="iposbids[i].qty">
                          <template #append>
                            <v-btn :disabled="orderpoploader"
                              @click="iposbids[i].qty = Number(iposbids[i].qty) + Number(menudata.lotSize); ipoCalcs()"
                              icon class="elevation-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="12" fill="white" />
                                <path d="M12 8V16" stroke="#999999" stroke-width="2"
                                  stroke-linecap="round" />
                                <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                  stroke-linecap="round" />
                              </svg>
                            </v-btn>
                          </template>
  
                          <template #prepend-inner>
                            <v-btn
                              :disabled="iposbids[i].qty <= menudata.lotSize || orderpoploader"
                              @click="iposbids[i].qty == menudata.lotSize ? iposbids[i].qty : (iposbids[i].qty = iposbids[i].qty - menudata.lotSize), ipoCalcs()"
                              icon class="elevation-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="12" fill="white" />
                                <path d="M16 12L8 12" stroke="#999999" stroke-width="2"
                                  stroke-linecap="round" />
                              </svg>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <p class="font-weight-medium fs-14 maintext--text mb-2">Bid Price</p>
                        <v-text-field density="compact" height="40px" bg-color="secbg" flat
                          class="rounded-pill" variant="solo" type="number" hide-details hide-spin-buttons
                          :disabled="iposbids[i].cutoff || orderpoploader"
                          @keyup="iposbids[i].price ? (iposbids[i].price = Number(iposbids[i].price)) : iposbids[i].price >= menudata.minPrice ? iposbids[i].price : menudata.minPrice, ipoCalcs()"
                          :min="menudata.minPrice" :max="menudata.maxPrice"
                          v-model="iposbids[i].price">
                          <template #prepend-inner>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                              viewBox="0 0 24 24" fill="none">
                              <path
                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                fill="white" />
                              <path
                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                fill="#999999" />
                            </svg>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="3" class="mt-auto">
                    <v-checkbox :disabled="orderpoploader" color="maintext" v-model="iposbids[i].cutoff"
                      @click="iposbids[i].cutoff ? (iposbids[i].price = menudata.cutOffPrice) : (iposbids[i].price = menudata.minPrice), ipoCalcs()"
                      class="mb-2" hide-details>
                      <template #label>
                        <p class="font-weight-regular fs-12 subtext--text mb-0">Cut-off <span
                            class="d-none d-sm-flex">price</span></p>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>
                <v-divider
                  v-if="i == 0 ? (iposbids[1].bitis ? true : false) : i == 1 ? (iposbids[2].bitis ? true : false) : false"
                  class="mb-3 mt-4"></v-divider>
              </div>
            </div>
            <v-btn v-if="menudata.flow >= 0 && !iposbids[2].bitis" :disabled="orderpoploader"
              @click="iposbids[1].bitis ? (iposbids[2].bitis = true) : (iposbids[1].bitis = true), ipoCalcs()"
              variant="text" color="primary" class="text-none mt-3">+ Add another bid </v-btn>
  
            <v-card v-if="menudata.iposmax" color="orange lighten-5"
              class="rounded-lg px-4 py-2 elevation-0 mt-3">
              <p class="mb-0 warning--text fs-12">
                <v-icon size="16" color="warning">mdi-information-outline</v-icon> Maximum investment
                upto<span class="text-none font-weight-bold" color="warning"> ₹ {{ menudata.maxamt }}
                </span>
                only
              </p>
            </v-card>
  
            <v-card v-if="menudata.iposrange" color="orange lighten-5"
              class="rounded-lg px-4 py-2 elevation-0 mt-3">
              <p class="mb-0 warning--text fs-12">
                <v-icon size="16" color="warning">mdi-information-outline</v-icon> Your bit price ranges
                between
                <span class="text-none font-weight-bold" color="warning">₹ {{ menudata.minPrice ?
                  menudata.minPrice : "0.00"
                }} - ₹ {{ menudata.maxPrice ? menudata.maxPrice : "0.00" }}</span>
              </p>
            </v-card>
  
            <v-card v-if="menudata.iposminqty" color="orange lighten-5"
              class="rounded-lg px-4 py-2 elevation-0 mt-3">
              <p class="mb-0 warning--text fs-12">
                <v-icon size="16" color="warning">mdi-information-outline</v-icon> Your minimum bit quantity
                <span class="text-none font-weight-bold" color="warning"> {{ menudata.minBidQuantity ?
                  menudata.minBidQuantity :
                  "0" }}</span>
              </p>
            </v-card>
  
            <v-form :class="menudata.flow >= 0 ? '' : 'pt-3'" ref="iposupiformRef" v-model="iposupivalid"
              @submit.prevent="setUpiValid()" lazy-validation>
              <p class="font-weight-medium fs-14 maintext--text mb-2"
                :class="!iposbids[2].bitis ? 'mt-2' : 'mt-6'">UPI ID
                (Virtual payment address)</p>
              <v-text-field :disabled="orderpoploader" required height="40px" density="compact" bg-color="secbg"
                flat class="rounded-pill" variant="solo" v-model="iposupiid" @keyup="upiidfield = false"
                :rules="[(v) => !!v || 'Upi Id is required', (v) => /.+@.+/.test(v) || 'Upi Id must be valid']"
                placeholder="Add UPI ID" :error-messages="upiIDerrors">
              </v-text-field>
              <v-checkbox id="check"
                :disabled="menudata.iposmax || menudata.iposrange || menudata.iposminqty || orderpoploader"
                required :rules="[(v) => !!v || 'You must agree to invest!']" color="maintext"
                v-model="iposcheckbox" class="mt-0" hide-details>
                <template #label>
                  <p class="font-weight-regular fs-12 subtext--text mb-0">I hereby undertake that I have
                    read the
                    Red Herring Prospectus and I am eligible bidder as per the applicable provisions of
                    SEBI
                    (Issue of Capital & Disclosure Agreement, 2009) regulations</p>
                </template>
              </v-checkbox>
            </v-form>
          </div>
          <v-toolbar class="tool-sty elevation-0 pt-3 mb-2 px-4 px-md-6 crd-trn" density="compact">
            <span class="font-weight-regular fs-12 subtext--text">
              Total investment : <span class="primary--text font-weight-bold"> ₹{{ menudata.ipostotal ?
                menudata.ipostotal.toFixed(2) : "" }}</span>
            </span>
            <v-spacer></v-spacer>
            <v-btn :disabled="orderpoploader" @click="closeMenudialog('iposorder')" color="secbg"
              class="text-none rounded-pill elevation-0 subtext--text px-6 d-none d-md-flex" height="40px">
              Cancel
            </v-btn>
            <v-btn @click="setUpiValid()"
              :disabled="!iposupivalid || menudata.iposmax || menudata.iposrange || menudata.iposminqty || upiidfield"
              type="submit" :loading="orderpoploader" color="btnclr"
              class="text-none rounded-pill elevation-0 btntext--text px-6 ml-4" height="40px">Continue
            </v-btn>
          </v-toolbar>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useAppStore } from '@/stores/appStore'
  import { getUpivpa, getFundsupis, getIposorder } from '@/components/mixins/getAPIdata.js'
  
  const appStore = useAppStore()
  
  const uid = ref(null)
  const token = ref(null)
  const mtoken = ref(null)
  
  const orderpoploader = ref(false)
  const iposorderdialog = ref(false)
  
  const iposbids = ref([])
  
  const menudata = ref({})
  const iposupivalid = ref(true)
  const iposcheckbox = ref(false)
  const iposupiid = ref(null)
  const iposupiDomain = ref(null)
  
  const upiidfield = ref(false)
  const iposupiformRef = ref(null)
  
  const upiIDerrors = computed(() => {
    const errors = []
    if (upiidfield.value) {
      errors.push("You have entered the invalid UPI ID")
    }
    return errors
  })
  
  const snackAlert = (color, msg) => {
    appStore.showSnackbar(color, msg)
  }
  
  const handleMenuDialogEvent = (event) => {
    const { type, item, value } = event.detail || {}
    if (type === "iposorder") {
      setMenudialog(item, value)
    }
  }
  
  const setMenudialog = async (itemdata, mode) => {
    appStore.showLoader()
    orderpoploader.value = false
    menudata.value = {}
    menudata.value = { ...itemdata }
    menudata.value["flow"] = mode
    if (menudata.value.flow == "can") {
      setTimeout(() => {
        setIposorder()
      }, 100)
    } else {
      iposbids.value = []
      let upis = await getFundsupis(uid.value)
      if (upis.stat == "Ok" && upis.data[0] && upis.data[0].upi_id && upis.data[0].client_id == uid.value) {
        iposupiid.value = upis.data[0].upi_id
      } else {
        iposupiid.value = ""
      }
  
      if (mode == "mod") {
        menudata.value["name"] = itemdata.company_name
        menudata.value["maxPrice"] = itemdata.maxprice
        menudata.value["minPrice"] = itemdata.minprice
        menudata.value["cutOffPrice"] = itemdata.cutoffprice
        menudata.value["issueSize"] = itemdata.issuesize ? itemdata.issuesize : "-"
        menudata.value["minBidQuantity"] = itemdata.minbidquantity ? itemdata.minbidquantity : itemdata.bid_detail[0].quantity
        menudata.value["lotSize"] = itemdata.minbidquanlotsizetity ? itemdata.lotsize : itemdata.bid_detail[0].quantity
        iposbids.value = [
          { name: "Bid-01", bitis: itemdata.bid_detail[0] ? true : false, qty: itemdata.minbidquantity, price: itemdata.bid_detail[0].price, cutoff: itemdata.bid_detail[0].atCutOff },
          { name: "Bid-02", bitis: itemdata.bid_detail[1] ? true : false, qty: itemdata.minbidquantity, price: itemdata.bid_detail[1] ? itemdata.bid_detail[1].price : itemdata.maxprice, cutoff: itemdata.bid_detail[1] ? itemdata.bid_detail[1].atCutOff : true },
          { name: "Bid-03", bitis: itemdata.bid_detail[2] ? true : false, qty: itemdata.minbidquantity, price: itemdata.bid_detail[2] ? itemdata.bid_detail[2].price : itemdata.maxprice, cutoff: itemdata.bid_detail[2] ? itemdata.bid_detail[2].atCutOff : true },
        ]
      } else {
        iposbids.value = [
          { name: "Bid-01", bitis: true, qty: itemdata.minBidQuantity, price: itemdata.issueType == "INVIT" ? itemdata.minPrice : itemdata.maxPrice, cutoff: itemdata.issueType == "INVIT" ? false : true },
          { name: "Bid-02", bitis: false, qty: itemdata.minBidQuantity, price: itemdata.issueType == "INVIT" ? itemdata.minPrice : itemdata.maxPrice, cutoff: itemdata.issueType == "INVIT" ? false : true },
          { name: "Bid-03", bitis: false, qty: itemdata.minBidQuantity, price: itemdata.issueType == "INVIT" ? itemdata.minPrice : itemdata.maxPrice, cutoff: itemdata.issueType == "INVIT" ? false : true },
        ]
      }
  
      if (itemdata.subCategorySettings) menudata.value["categorys"] = []
      if (itemdata.subCategorySettings) {
        for (var q = 0; q < itemdata.subCategorySettings.length; q++) {
          if (itemdata.subCategorySettings[q].allowUpi) {
            if (itemdata.subCategorySettings[q].subCatCode == "IND") {
              menudata.value.categorys.push({ key: "IND", val: "Individual", data: itemdata.subCategorySettings[q] })
            }
            if (itemdata.subCategorySettings[q].subCatCode == "EMP") {
              menudata.value.categorys.push({ key: "EMP", val: "Employee", data: itemdata.subCategorySettings[q] })
            }
            if (itemdata.subCategorySettings[q].subCatCode == "SHA") {
              menudata.value.categorys.push({ key: "SHA", val: "Shareholder", data: itemdata.subCategorySettings[q] })
            }
            if (itemdata.subCategorySettings[q].subCatCode == "POL") {
              menudata.value.categorys.push({ key: "POL", val: "Policyholder", data: itemdata.subCategorySettings[q] })
            }
            menudata.value["category"] = menudata.value.categorys[0]
          }
        }
      } else {
        menudata.value.categorys = [
          {
            key: "MODI",
            val: "modify",
            data: {
              allowCutOff: true,
              allowUpi: true,
              caCode: "modify",
              discountPrice: null,
              discountType: "",
              maxQuantity: null,
              maxUpiLimit: 500000.0,
              maxValue: 500000.0,
              minValue: 0.0,
              subCatCode: "MODI",
            },
          },
        ]
        menudata.value["category"] = menudata.value.categorys[0]
      }
      menudata.value["maxamt"] = menudata.value.category && menudata.value.category.data && menudata.value.category.data.maxUpiLimit ? Number(menudata.value.category.data.maxUpiLimit).toLocaleString() : menudata.value.flow == 1 ? 200000 : 500000
      ipoCalcs()
      iposcheckbox.value = false
      iposorderdialog.value = true
    }
  
    appStore.hideLoader()
  }
  
  const setUpiValid = async () => {
    if (iposupiformRef.value && iposupiformRef.value.validate()) {
      orderpoploader.value = true
      let data = await getUpivpa([iposupiid.value, uid.value, token.value])
      if (data && data.data && iposupiid.value.toLowerCase() == data.data.client_VPA && data.data.verified_VPA_status1 == "Available") {
        setIposorder()
      } else if (data.data && data.data.verified_VPA_status1 != "Available") {
        upiidfield.value = true
        orderpoploader.value = false
      } else {
        snackAlert(2, data.emsg ? data.emsg : data)
        orderpoploader.value = false
      }
    }
    if (!iposcheckbox.value) {
      var element = document.getElementById("check")
      if (element) element.scrollIntoView()
    }
  }
  
  const setIposorder = async () => {
    let bids = []
    if (menudata.value.flow != "can") {
      for (let i = 0; i < iposbids.value.length; i++) {
        if (iposbids.value[i].bitis) {
          if (menudata.value.type == "NSE") {
            bids.push({
              activityType: menudata.value.flow == "mod" ? "modify" : menudata.value.flow == "can" ? "cancel" : "new",
              quantity: iposbids.value[i].qty,
              atCutOff: iposbids.value[i].cutoff,
              price: iposbids.value[i].price.toString(),
              amount: iposbids.value[i].total.toString(),
              bidReferenceNumber: menudata.value.resp_bid && menudata.value.resp_bid[i] ? menudata.value.resp_bid[i].bidReferenceNumber.toString() : "",
            })
          } else {
            bids.push({
              actioncode: menudata.value.flow == "mod" ? "m" : menudata.value.flow == "can" ? "d" : "n",
              quantity: iposbids.value[i].qty.toString(),
              cuttoffflag: iposbids.value[i].cutoff,
              rate: iposbids.value[i].price.toString(),
              bidid: menudata.value.resp_bid && menudata.value.resp_bid[i] ? menudata.value.resp_bid[i].bidReferenceNumber.toString() : "",
              orderno: `1234${5 + i}`,
            })
          }
        }
      }
    }
    let data = {
      symbol: menudata.value.symbol,
      UPI: iposupiid.value,
      type: menudata.value.type,
      category: menudata.value.category.key,
      company_name: menudata.value.name,
      BID: bids,
    }
    if (menudata.value.flow == "can" || menudata.value.flow == "mod") {
      data["applicationNo"] = menudata.value.applicationNumber
    }
    if (menudata.value.flow == "can") {
      data["BID"] = [menudata.value.type == "NSE" ? { activityType: "cancel" } : { actioncode: "d" }]
      delete data["UPI"]
      delete data["company_name"]
    }
  
    let response = await getIposorder(JSON.stringify(data))
  
    if (response && response.msg == "order initiated success") {
      snackAlert(1, response.msg ? response.msg : response)
    } else {
      snackAlert(2, response.msg ? response.msg : response)
    }
    window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'ipo' }))
  
    menudata.value = {}
    iposbids.value = []
    orderpoploader.value = false
    appStore.hideLoader()
  }
  
  const ipoQtymultiper = (i) => {
    if (iposbids.value[i].qty > menudata.value.minBidQuantity) {
      setTimeout(() => {
        iposbids.value[i].qty = Math.round(iposbids.value[i].qty / menudata.value.minBidQuantity) * menudata.value.minBidQuantity
      }, 2000)
    }
    ipoCalcs()
  }
  
  const ipoCalcs = (key) => {
    var i = null
    var r = null
    var m = null
    if (iposbids.value[0].bitis) {
      if (key == "cate") {
        iposbids.value[0].qty = menudata.value.lotSize
      }
      iposbids.value[0]["total"] = iposbids.value[0].qty * iposbids.value[0].price
      i = 0
      r = iposbids.value[0].price >= menudata.value.minPrice && iposbids.value[0].price <= menudata.value.maxPrice ? false : true
      m = iposbids.value[0].qty < menudata.value.minBidQuantity ? true : false
    }
    if (iposbids.value[1].bitis) {
      if (key == "cate") {
        iposbids.value[1].qty = menudata.value.lotSize
      }
      iposbids.value[1]["total"] = iposbids.value[1].qty * iposbids.value[1].price
      i = 1
      r = r ? r : iposbids.value[1].price >= menudata.value.minPrice && iposbids.value[1].price <= menudata.value.maxPrice ? false : true
      m = m ? m : iposbids.value[1].qty < menudata.value.minBidQuantity ? true : false
    }
    if (iposbids.value[2].bitis) {
      if (key == "cate") {
        iposbids.value[2].qty = menudata.value.lotSize
      }
      iposbids.value[2]["total"] = iposbids.value[2].qty * iposbids.value[2].price
      i = 2
      r = r ? r : iposbids.value[2].price >= menudata.value.minPrice && iposbids.value[2].price <= menudata.value.maxPrice ? false : true
      m = m ? m : iposbids.value[2].qty < menudata.value.minBidQuantity ? true : false
    }
    menudata.value["ipostotal"] = iposbids.value[i]["total"]
    menudata.value["iposmax"] =
      iposbids.value[i]["total"] >= (menudata.value.category && menudata.value.category.data && menudata.value.category.data.maxUpiLimit && Number(menudata.value.category.data.maxUpiLimit) > 0 ? menudata.value.category.data.maxUpiLimit : menudata.value.flow == 1 ? 200000 : 500000)
    menudata.value["iposrange"] = r
    menudata.value["iposminqty"] = m
  }
  
  const handleScroll = () => {
  }
  const closeMenudialog = (type) => {
    switch(type) {
      case 'iposorder':
        iposorderdialog.value = false;
        break;
      // Add more cases here if you have more types
      default:
        break;
    }
    menudata.value = {};
  }
  
  
  onMounted(() => {
    window.addEventListener('menudialog', handleMenuDialogEvent)
    mtoken.value = sessionStorage.getItem("msession")
    token.value = sessionStorage.getItem("usession")
    uid.value = sessionStorage.getItem("userid")
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('menudialog', handleMenuDialogEvent)
  })
  </script>