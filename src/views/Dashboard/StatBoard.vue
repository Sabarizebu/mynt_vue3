<template>
  <div class="mb-2">
    <v-row>
      <!-- HOLDINGS CARD -->
      <v-col sm="6" cols="12">
        <v-card class="elevation-0 px-2 pt-3 pb-4 px-1 rounded-0 stat-card rounded">
          <div class="ml-4" style="display:flex; align-items:center; gap:10px;">
            <v-list-item-avatar tile size="24">
              <img src="@/assets/stocks/holdings.svg" alt="" />
            </v-list-item-avatar>
            <p class="font-weight-bold fs-18">Holdings</p>
          </div>

          <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg px-2 py-3">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0 10px;">
              <v-list-item-content style="max-width:22%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span>{{ statholding.invested ? setFormatNumber(statholding.invested) : "0.00" }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px;">Invested</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:22%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span>{{ statholding.stockvalue ? setFormatNumber(statholding.stockvalue) : "0.00" }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px;">Current</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:30%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span :class="Number(statholding.cpnl) > 0 ? 'maingreen--text' : Number(statholding.cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                    <span>{{ statholding.pnl && (Number(statholding.pnl) > 0 || Number(statholding.pnl) < 0) ? setFormatNumber(Math.abs(Number(statholding.pnl))) : "0.00" }}</span>
                  </span>
                  <span class="subtext--text" style="font-size:14px !important;">(<span>{{ statholding.cpnl && (Number(statholding.cpnl) > 0 || Number(statholding.cpnl) < 0) ? Math.abs(Number(statholding.cpnl)).toFixed(2) : "0.00" }}</span>%)</span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">Total P&L</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:26%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span :class="Number(statholding.d_cpnl) > 0 ? 'maingreen--text' : Number(statholding.d_cpnl) < 0 ? 'mainred--text' : 'subtext--text'">
                    <span>{{ statholding.d_pnl && (Number(statholding.d_pnl) > 0 || Number(statholding.d_pnl) < 0) ? Math.abs(Number(statholding.d_pnl)).toFixed(2) : "0.00" }}</span>
                  </span>
                  <span class="subtext--text" style="font-size:14px !important;">(<span>{{ statholding.d_cpnl && (Number(statholding.d_cpnl) > 0 || Number(statholding.d_cpnl) < 0) ? Math.abs(Number(statholding.d_cpnl)).toFixed(2) : "0.00" }}</span>%)</span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">Today P&L</v-list-item-subtitle>
              </v-list-item-content>
            </div>
          </v-card>

          <div class="px-4 pt-4 pb-2 d-flex justify-space-between align-center">
            <p class="subtext--text fs-14 mb-0">No of holdings - <b>{{ holdingdata.length }}</b></p>
            <v-btn to="/holdings" text class="fs-12 text-none px-0 primary--text" small dense variant="flat">View details</v-btn>
          </div>

          <div class="px-4">
            <v-card :disabled="holdingdata.length === 0" class="elevation-0 d-inline-flex" style="width:100%; background-color:#F1F3F8;">
              <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                      :style="{ width: statholding.p_advdec + '%' }" style="transition: width 250ms ease;">
                <div v-for="n in 250" :key="`ph-${n}`">
                  <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                          :style="`width:4px; min-width:4px; background-color:${holdingdata.length === 0 ? '#F1F3F8' : '#ECF8F1'};`"></v-card>
                  <v-card v-else class="elevation-0 rounded-0 py-4"
                          :style="`width:4px; min-width:4px; background-color:${holdingdata.length === 0 ? '#ffffff' : '#43A833'};`"></v-card>
                </div>
              </v-card>

              <v-card class="elevation-0 rounded-0 crd-trn" style="width:4px; min-width:4px;"></v-card>

              <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex"
                      :style="{ width: statholding.n_advdec + '%' }" style="transition: width 250ms ease;">
                <div v-for="n in 250" :key="`nh-${n}`">
                  <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4"
                          :style="`width:4px; min-width:4px; background-color:${holdingdata.length === 0 ? '#F1F3F8' : '#ffcdcd90'};`"></v-card>
                  <v-card v-else class="elevation-0 rounded-0 py-4"
                          :style="`width:4px; min-width:4px; background-color:${holdingdata.length === 0 ? '#ffffff' : '#F23645'};`"></v-card>
                </div>
              </v-card>
            </v-card>
          </div>

          <div class="px-4 pb-2 d-flex justify-start align-center mt-3">
            <v-chip small class="mr-2" color="success" style="border: 1px solid #43A833;" outlined>
              <img src="@/assets/stocks/pos-icon.svg" class="mr-1" alt="">
              <span class="mr-1">{{ statholding.positive ? statholding.positive.length : "0" }}</span> Positive
            </v-chip>
            <v-chip small color="error" style="border: 1px solid #F23645;" outlined>
              <img src="@/assets/stocks/neg-icon.svg" class="mr-1" alt="">
              <span class="mr-1">{{ statholding.negative ? statholding.negative.length : "0" }}</span> Negative
            </v-chip>
          </div>
        </v-card>
      </v-col>

      <!-- POSITIONS CARD -->
      <v-col sm="6" cols="12">
        <v-card class="elevation-0 px-2 pt-3 pb-4 px-1 rounded-0 stat-card rounded">
          <div style="display:flex; align-items:center; gap:10px;" class="ml-4">
            <v-list-item-avatar tile size="20">
              <img src="@/assets/stocks/position.svg" width="22" alt="" />
            </v-list-item-avatar>
            <p class="font-weight-bold fs-18">Position</p>
          </div>

          <v-card class="elevation-0 card-border py-1 mx-4 mt-2 cardbg px-2 py-3">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0 10px;">
              <v-list-item-content style="max-width:22%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span>{{ statposition.tradeval && (Number(statposition.tradeval) > 0 || Number(statposition.tradeval) < 0) ? setFormatNumber(Math.abs(Number(statposition.tradeval))) : "0.00" }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">Trade value</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:22%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span :class="Number(statposition.mtm) > 0 ? 'maingreen--text' : Number(statposition.mtm) < 0 ? 'mainred--text' : 'subtext--text'">
                    {{ statposition.mtm && (Number(statposition.mtm) > 0 || Number(statposition.mtm) < 0) ? setFormatNumber(Math.abs(Number(statposition.mtm))) : "0.00" }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">MTM</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:30%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span :class="Number(statposition.pnl) > 0 ? 'maingreen--text' : Number(statposition.pnl) < 0 ? 'mainred--text' : 'subtext--text'">
                    {{ statposition.pnl && (Number(statposition.pnl) > 0 || Number(statposition.pnl) < 0) ? setFormatNumber(Math.abs(Number(statposition.pnl))) : "0.00" }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">Total P&L</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-content style="max-width:26%;">
                <v-list-item-title class="font-weight-medium" style="font-size:16px !important;">
                  <span :class="Number(statposition.oppnl) > 0 ? 'maingreen--text' : Number(statposition.oppnl) < 0 ? 'mainred--text' : 'subtext--text'">
                    {{ statposition.oppnl && (Number(statposition.oppnl) > 0 || Number(statposition.oppnl) < 0) ? setFormatNumber(Math.abs(Number(statposition.oppnl))) : "0.00" }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle class="font-weight-regular" style="font-size:14px !important;">Open P&L</v-list-item-subtitle>
              </v-list-item-content>
            </div>
          </v-card>

          <div class="px-4 pt-4 pb-2 d-flex justify-space-between align-center">
            <p class="subtext--text fs-14 mb-0">No of positions - <b>{{ positiondata.length }}</b> / Open positions - <b>{{ statposition && statposition.open ? statposition.open.length : 0 }}</b></p>
            <v-btn to="/positions" text class="fs-12 text-none px-0 primary--text" small dense variant="flat">View details</v-btn>
          </div>

          <div class="px-4">
            <v-card :disabled="positiondata.length === 0" class="elevation-0 d-inline-flex" style="width:100%; background-color:#F1F3F8;">
              <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex" :style="{ width: statposition.p_advdec + '%' }" style="transition: width 250ms ease;">
                <div v-for="n in 250" :key="`pp-${n}`">
                  <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4" :style="`width:4px; min-width:4px; background-color:${positiondata.length === 0 ? '#F1F3F8' : '#ECF8F1'};`"></v-card>
                  <v-card v-else class="elevation-0 rounded-0 py-4" :style="`width:4px; min-width:4px; background-color:${positiondata.length === 0 ? '#ffffff' : '#43A833'};`"></v-card>
                </div>
              </v-card>

              <v-card class="elevation-0 rounded-0 crd-trn" style="width:4px; min-width:4px;"></v-card>

              <v-card class="elevation-0 rounded-0 crd-trn overflow-hidden d-inline-flex" :style="{ width: statposition.n_advdec + '%' }" style="transition: width 250ms ease;">
                <div v-for="n in 250" :key="`np-${n}`">
                  <v-card v-if="n % 2 === 0" class="elevation-0 rounded-0 py-4" :style="`width:4px; min-width:4px; background-color:${positiondata.length === 0 ? '#F1F3F8' : '#ffcdcd90'};`"></v-card>
                  <v-card v-else class="elevation-0 rounded-0 py-4" :style="`width:4px; min-width:4px; background-color:${positiondata.length === 0 ? '#ffffff' : '#F23645'};`"></v-card>
                </div>
              </v-card>
            </v-card>
          </div>

          <div class="px-4 pb-2 d-flex justify-start align-center mt-3">
            <v-chip small class="mr-2" color="success" style="border: 1px solid #43A833;" outlined>
              <img src="@/assets/stocks/pos-icon.svg" class="mr-1" alt="">
              <span class="mr-1">{{ statposition.positive ? statposition.positive.length : "0" }}</span> Positive
            </v-chip>
            <v-chip small color="error" style="border: 1px solid #F23645;" outlined>
              <img src="@/assets/stocks/neg-icon.svg" class="mr-1" alt="">
              <span class="mr-1">{{ statposition.negative ? statposition.negative.length : "0" }}</span> Negative
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ORDERS & MARGINS ROW -->
    <v-row>
      <v-col sm="6" cols="12">
        <v-card class="elevation-0 px-2 pt-1 pb-4 rounded-0 stat-card rounded">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:10px;">
              <v-list-item-avatar tile size="20">
                <img src="@/assets/stocks/orders.svg" alt="">
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium" style="font-size:18px !important;">Orders</v-list-item-title>
              </v-list-item-content>
            </div>
            <v-list-item-content>
              <v-btn class="ml-auto" to="/orders" icon style="background-color:transparent !important; box-shadow:none !important; color:#0037B7 !important;">
                <v-icon size="26">mdi-arrow-right</v-icon>
              </v-btn>
            </v-list-item-content>
          </div>

          <v-card class="elevation-0 card-border py-3 mx-4 mt-2 cardbg">
            <v-row>
              <v-col cols="4">
                <div class="text-center cursor-pointer">
                  <p class="fs-16 font-weight-bold mb-0">{{ statorders && statorders[0] ? statorders[0] : 0 }}</p>
                  <span class="fs-14 font-weight-regular">Open Orders</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center cursor-pointer">
                  <p class="fs-16 font-weight-bold mb-0">{{ statorders && statorders[1] ? statorders[1] : 0 }}</p>
                  <span class="fs-14 font-weight-regular">Execute Orders</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center cursor-pointer">
                  <p class="fs-16 font-weight-bold mb-0">{{ statorders && statorders[2] ? statorders[2] : 0 }}</p>
                  <span class="fs-14 font-weight-regular">Rejected</span>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-col>

      <v-col sm="6" cols="12">
        <v-card class="elevation-0 px-2 pt-1 pb-4 rounded-0 stat-card rounded">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:10px;">
              <v-list-item-avatar tile size="20">
                <img src="@/assets/stocks/margin.svg" alt="">
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium" style="font-size:18px !important;">Margins</v-list-item-title>
              </v-list-item-content>
            </div>
            <v-list-item-content>
              <v-btn class="ml-auto" to="/funds" icon style="background-color:transparent !important; box-shadow:none !important; color:#0037B7 !important;">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
            </v-list-item-content>
          </div>

          <v-card class="elevation-0 card-border py-3 mx-4 mt-2 cardbg">
            <v-row>
              <v-col cols="4">
                <v-tooltip top color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on" class="text-center">
                      <p :class="Number(statlimits.avbma) < 0 ? 'mainred--text' : ''" class="fs-16 font-weight-bold mb-0">
                        {{ statlimits.avbma && (Number(statlimits.avbma) > 0 || Number(statlimits.avbma) < 0) ? setFormatNumber(statlimits.avbma) : '0.00' }}
                      </p>
                      <span class="fs-14 font-weight-regular">Available balance</span>
                    </div>
                  </template>
                  <span>{{ statlimits.avbma ? differentView(statlimits.avbma) : '0.00' }}</span>
                </v-tooltip>
              </v-col>

              <v-col cols="4">
                <v-tooltip top color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on" class="text-center">
                      <p class="fs-16 font-weight-bold mb-0">{{ statlimits.total && (Number(statlimits.total) > 0 || Number(statlimits.total) < 0) ? setFormatNumber(statlimits.total) : '0.00' }}</p>
                      <span class="fs-14 font-weight-regular">Total credits</span>
                    </div>
                  </template>
                  <span>{{ statlimits.total ? differentView(statlimits.total) : '0.00' }}</span>
                </v-tooltip>
              </v-col>

              <v-col cols="4">
                <v-tooltip top color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on" class="text-center">
                      <p class="fs-16 font-weight-bold mb-0">{{ statlimits.marginused && (Number(statlimits.marginused) > 0 || Number(statlimits.marginused) < 0) ? setFormatNumber(statlimits.marginused) : '0.00' }}</p>
                      <span class="fs-14 font-weight-regular">Margin used</span>
                    </div>
                  </template>
                  <span>{{ statlimits.marginused ? differentView(statlimits.marginused) : '0.00' }}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
/* eslint-disable no-console */
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { getMHoldings, getMPosotion, getMOrderbook, getMLimits } from '../../components/mixins/getAPIdata'

// Reactive data
const holdingdata = ref([])
const positiondata = ref([])
const statorders = ref([])

const statholding = reactive({
  invested: 0,
  stockvalue: 0,
  pnl: 0,
  cpnl: 0,
  d_pnl: 0,
  d_cpnl: 0,
  positive: [],
  negative: [],
  p_advdec: 0,
  n_advdec: 0
})

const statposition = reactive({
  tradeval: 0,
  mtm: 0,
  pnl: 0,
  oppnl: 0,
  opcpnl: 0,
  positive: [],
  negative: [],
  open: [],
  close: [],
  p_advdec: 0,
  n_advdec: 0
})

const statlimits = reactive({
  avbma: 0,
  total: 0,
  marginused: 0
})

// Component mount tracking
const isMounted = ref(false)
const subscribedHoldTokens = new Set()
const subscribedPosTokens = new Set()

/* helpers */
const toNumber = (v, def = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

const differentView = (view) => {
  const num = toNumber(view)
  return num !== 0 ? Number(num).toFixed(2) : "0.00"
}

const setFormatNumber = (value) => {
  const num = toNumber(value)
  const absNum = Math.abs(num)
  
  if (absNum > 9999999) {
    return (num / 10000000).toFixed(2) + "Cr"
  } else if (absNum > 99999) {
    return (num / 100000).toFixed(2) + "L"
  } else if (absNum > 9999) {
    return (num / 1000).toFixed(2) + "K"
  } else if (num !== 0) {
    return Number(num).toFixed(2)
  }
  return "0.00"
}

/* ---------- WEBSOCKET SUBSCRIPTION ---------- */
const setWebsocket = (flow, data, is) => {
  if (!isMounted.value) return
  
  try {
    const ev = new CustomEvent('web-scoketOn', { 
      detail: { flow, data, is, page: 'stockDASH' } 
    })
    window.dispatchEvent(ev)
    
    if (flow === 'sub' && is === 'hold') {
      subscribedHoldTokens.clear()
      data.forEach(item => item.token && subscribedHoldTokens.add(item.token))
    } else if (flow === 'sub' && is === 'pos') {
      subscribedPosTokens.clear()
      data.forEach(item => item.token && subscribedPosTokens.add(item.token))
    }
  } catch (e) {
    console.error('WebSocket subscription error:', e)
  }
}

const unsubscribeAll = () => {
  try {
    if (subscribedHoldTokens.size > 0 && holdingdata.value.length > 0) {
      const ev1 = new CustomEvent('web-scoketOn', { 
        detail: { flow: 'unsub', data: holdingdata.value, is: 'hold', page: 'stockDASH' } 
      })
      window.dispatchEvent(ev1)
      subscribedHoldTokens.clear()
    }
    
    if (subscribedPosTokens.size > 0 && positiondata.value.length > 0) {
      const ev2 = new CustomEvent('web-scoketOn', { 
        detail: { flow: 'unsub', data: positiondata.value, is: 'pos', page: 'stockDASH' } 
      })
      window.dispatchEvent(ev2)
      subscribedPosTokens.clear()
    }
  } catch (e) {
    console.error('Unsubscribe error:', e)
  }
}

/* ---------- HOLDINGS CALCULATION ---------- */
const calculateHoldingStats = () => {
  if (!isMounted.value) return
  
  const statdata = holdingdata.value
  if (!statdata || statdata.length === 0) {
    statholding.positive = []
    statholding.negative = []
    statholding.invested = 0
    statholding.stockvalue = 0
    statholding.pnl = 0
    statholding.cpnl = 0
    statholding.d_pnl = 0
    statholding.d_cpnl = 0
    statholding.p_advdec = 0
    statholding.n_advdec = 0
    return
  }

  // CRITICAL FIX: Filter based on numeric pnlc value
  statholding.positive = statdata.filter((x) => Number(x.pnlc) > 0)
  statholding.negative = statdata.filter((x) => Number(x.pnlc) < 0)

  let stockvalue = statdata.reduce((acc, o) => acc + toNumber(o.curr), 0)
  statholding.stockvalue = differentView(stockvalue)

  let invested = statdata.reduce((acc, o) => acc + toNumber(o.inv), 0)
  statholding.invested = differentView(invested)

  let d_pnl = statdata.reduce((acc, o) => acc + toNumber(o.d_pnl), 0)
  statholding.d_pnl = d_pnl.toFixed(2)
  statholding.d_cpnl = invested !== 0 ? ((d_pnl / invested) * 100).toFixed(2) : "0.00"

  let pnl = statdata.reduce((acc, o) => acc + toNumber(o.pnl), 0)
  statholding.pnl = pnl.toFixed(2)
  statholding.cpnl = invested !== 0 ? ((pnl / invested) * 100).toFixed(2) : "0.00"

  statholding.p_advdec = holdingdata.value.length > 0 ? Math.round((statholding.positive.length / holdingdata.value.length) * 100) : 0
  statholding.n_advdec = 100 - statholding.p_advdec
}

/* ---------- POSITIONS CALCULATION ---------- */
const calculatePositionStats = () => {
  if (!isMounted.value) return
  
  const statdata = positiondata.value
  if (!statdata || statdata.length === 0) {
    statposition.positive = []
    statposition.negative = []
    statposition.open = []
    statposition.close = []
    statposition.tradeval = 0
    statposition.mtm = 0
    statposition.pnl = 0
    statposition.oppnl = 0
    statposition.opcpnl = 0
    statposition.p_advdec = 0
    statposition.n_advdec = 0
    return
  }

  // CRITICAL FIX: Filter based on numeric rpnl value
  statposition.positive = statdata.filter((x) => toNumber(x.rpnl) > 0)
  statposition.negative = statdata.filter((x) => toNumber(x.rpnl) < 0)

  statposition.close = statdata.filter((x) => toNumber(x.netqty) == 0)
  statposition.open = statdata.filter((x) => toNumber(x.netqty) != 0)

  let tradeval = statdata.reduce((acc, o) => acc + toNumber(o.val), 0)
  statposition.tradeval = differentView(tradeval)

  let oppnl = statposition.open.reduce((acc, o) => acc + toNumber(o.rpnl), 0)
  statposition.oppnl = differentView(oppnl)
  statposition.opcpnl = oppnl

  let pnl = statdata.reduce((acc, o) => acc + toNumber(o.rpnl), 0)
  statposition.pnl = differentView(pnl)

  let mtm = statdata.reduce((acc, o) => acc + toNumber(o.mtm), 0)
  statposition.mtm = differentView(mtm)

  statposition.p_advdec = positiondata.value.length > 0 ? Math.round((statposition.positive.length / positiondata.value.length) * 100) : 0
  statposition.n_advdec = 100 - statposition.p_advdec
}

/* ---------- WS UPDATE FOR HOLDINGS ---------- */
const optionChainHoldDataParse = (data) => {
  if (!isMounted.value || !data || !data.token) return
  
  let w = holdingdata.value.findIndex((o) => o.token == data.token)
  if (w < 0) return

  const holding = holdingdata.value[w]
  if (holding.token != data.token) return

  let newLtp = 0
  if (holding.exchs == "MF") {
    newLtp = toNumber(holding.quotes && holding.quotes.nav ? holding.quotes.nav : data.lp)
  } else {
    newLtp = toNumber(data.lp)
  }

  if (newLtp <= 0) return

  holding.ltp = holding.exchs == "MF" ? newLtp : newLtp.toFixed(2)
  
  const upldprc = toNumber(holding.upldprc)
  const avgForCalc = upldprc !== 0 ? upldprc : newLtp
  const absQty = Math.abs(toNumber(holding.netqty))
  
  holding.inv = (avgForCalc * absQty).toFixed(2)
  holding.curr = (newLtp * absQty).toFixed(2)
  holding.pnl = (holding.curr - holding.inv).toFixed(2)
  holding.pnlc = holding.inv > 0 ? ((holding.pnl / holding.inv) * 100).toFixed(2) : "0"

  const prevClose = toNumber(data.prev_close_price ?? data.c)
  if (prevClose > 0) {
    holding.d_pnl = ((newLtp - prevClose) * absQty).toFixed(2)
    holding.d_cpnl = holding.inv > 0 ? ((holding.d_pnl / holding.inv) * 100).toFixed(2) : "0"
  }

  calculateHoldingStats()
}

/* ---------- WS UPDATE FOR POSITIONS ---------- */
const optionChainPosiDataParse = (data) => {
  if (!isMounted.value || !data || !data.token) return

  var mult = positiondata.value.filter((arr) => arr.token == data.token)
  if (!mult || mult.length === 0) return

  for (let a = 0; a < mult.length; a++) {
    data.tokn = mult[a].tokn
    let w = positiondata.value.findIndex((o) => o.tokn == mult[a].tokn)
    
    if (w < 0 || positiondata.value[w].tokn != data.tokn) continue

    const newLtp = toNumber(data.lp)
    if (newLtp <= 0) continue

    const p = positiondata.value[w]
    p.ltp = newLtp.toFixed(2)
    p.val = (toNumber(p.avgprc) * Math.abs(toNumber(p.netqty)) * toNumber(p.prcftr || 1)).toFixed(2)

    let qtyis = toNumber(p.netqty)
    const prcftr = toNumber(p.prcftr || 1)
    var cmtm
    var crpnl

    if (qtyis == 0) {
      if (p.cfbuyqty != "0" && p.cfbuyqty) {
        crpnl = toNumber(p.daysellavgprc) * (toNumber(p.daysellqty) * prcftr) - 
                ((toNumber(p.cfbuyqty) * prcftr) * toNumber(p.avgprc) + 
                 (toNumber(p.daybuyqty) * prcftr) * toNumber(p.daybuyavgprc))
      } else if (p.cfsellqty != "0" && p.cfsellqty) {
        crpnl = (toNumber(p.daysellqty) * prcftr) * toNumber(p.daysellavgprc) + 
                (toNumber(p.cfsellqty) * prcftr) * toNumber(p.avgprc) - 
                toNumber(p.daybuyavgprc) * (toNumber(p.daybuyqty) * prcftr)
      } else {
        crpnl = toNumber(p.rpnl)
      }
      cmtm = toNumber(p.crpnl)
    } else {
      var tempunpnl = newLtp - toNumber(p.netupldprc || 0)
      crpnl = tempunpnl * (qtyis * prcftr) + toNumber(p.temprpnl || 0)
      
      if (["NFO", "BFO", "NSE", "BSE"].includes(p.exch)) {
        cmtm = (newLtp - toNumber(p.netavgprc)) * (qtyis * prcftr) + toNumber(p.crpnl || 0)
      } else {
        cmtm = (newLtp - toNumber(p.netavgprc)) * (toNumber(p.mult || 1) * qtyis * prcftr) + toNumber(p.crpnl || 0)
      }
    }

    p.mtm = cmtm.toFixed(2)
    p.rpnl = crpnl.toFixed(2)

    var chgper = toNumber(p.avgprc) > 0 ? ((toNumber(p.avgprc) - newLtp) / toNumber(p.avgprc)) * 100 : 0
    p.pnlc = chgper.toFixed(2)
  }

  calculatePositionStats()
}

/* ---------- API CALLS ---------- */
const getStatboardapi = async () => {
  await Promise.all([
    getPositionbook(),
    getHoldingbook(),
    getOrderbook(),
    getAllmargin()
  ])
}

const getPositionbook = async () => {
  try {
    let data = await getMPosotion(true)
    if (data && data.a && data.a.length > 0) {
      positiondata.value = data.a.map((p, index) => {
        const qtyis = toNumber(p.netqty)
        const avgprc = toNumber(p.avgprc)
        const prcftr = toNumber(p.prcftr || 1)
        const ltp = toNumber(p.ltp ?? p.lp ?? 0)
        
        let cmtm = 0
        let crpnl = 0
        
        if (qtyis == 0) {
          if (p.cfbuyqty != "0" && p.cfbuyqty) {
            crpnl = toNumber(p.daysellavgprc) * (toNumber(p.daysellqty) * prcftr) - 
                    ((toNumber(p.cfbuyqty) * prcftr) * avgprc + 
                     (toNumber(p.daybuyqty) * prcftr) * toNumber(p.daybuyavgprc))
          } else if (p.cfsellqty != "0" && p.cfsellqty) {
            crpnl = (toNumber(p.daysellqty) * prcftr) * toNumber(p.daysellavgprc) + 
                    (toNumber(p.cfsellqty) * prcftr) * avgprc - 
                    toNumber(p.daybuyavgprc) * (toNumber(p.daybuyqty) * prcftr)
          } else {
            crpnl = toNumber(p.rpnl)
          }
          cmtm = toNumber(p.crpnl)
        } else if (ltp > 0) {
          var tempunpnl = ltp - toNumber(p.netupldprc || 0)
          crpnl = tempunpnl * (qtyis * prcftr) + toNumber(p.temprpnl || 0)
          
          if (["NFO", "BFO", "NSE", "BSE"].includes(p.exch)) {
            cmtm = (ltp - toNumber(p.netavgprc)) * (qtyis * prcftr) + toNumber(p.crpnl || 0)
          } else {
            cmtm = (ltp - toNumber(p.netavgprc)) * (toNumber(p.mult || 1) * qtyis * prcftr) + toNumber(p.crpnl || 0)
          }
        }
        
        return {
          ...p,
          tokn: p.tokn || `${p.token}_${index}`,
          ltp: ltp.toFixed(2),
          val: (avgprc * Math.abs(qtyis) * prcftr).toFixed(2),
          mtm: cmtm.toFixed(2),
          rpnl: crpnl.toFixed(2)
        }
      })
      
      statposition.open = data.o || []
      
      calculatePositionStats()
      setWebsocket("sub", positiondata.value, "pos")
    }
  } catch (e) {
    console.error('Error loading positions:', e)
  }
}

const getHoldingbook = async () => {
  try {
    let data = await getMHoldings(true)
    if (data && data.response && data.response.length > 0) {
      holdingdata.value = data.response.map(h => {
        const netqty = toNumber(h.netqty ?? h.holdqty ?? h.qty)
        const absQty = Math.abs(netqty)
        
        const upldprc = toNumber(h.upldprc ?? h.avgprc ?? 0)
        let ltp = toNumber(h.ltp ?? h.lp ?? h.last_price ?? 0)
        
        if (h.exchs === 'MF' && h.quotes && h.quotes.nav) {
          ltp = toNumber(h.quotes.nav)
        }
        
        if (ltp === 0 && upldprc > 0) {
          ltp = upldprc
        }
        
        const prevClose = toNumber(h.prev_close_price ?? h.close ?? h.cp ?? h.previous_close ?? ltp)
        
        const inv = upldprc * absQty
        const curr = ltp * absQty
        const pnl = curr - inv
        const pnlc = inv > 0 ? (pnl / inv) * 100 : 0
        const d_pnl = (ltp - prevClose) * absQty
        const d_cpnl = inv > 0 ? (d_pnl / inv) * 100 : 0
        
        return {
          ...h,
          netqty,
          upldprc,
          ltp: h.exchs === 'MF' ? ltp : ltp.toFixed(2),
          prev_close_price: prevClose,
          inv: inv.toFixed(2),
          curr: curr.toFixed(2),
          pnl: pnl.toFixed(2),
          pnlc: pnlc.toFixed(2),
          d_pnl: d_pnl.toFixed(2),
          d_cpnl: d_cpnl.toFixed(2)
        }
      })

      calculateHoldingStats()
      setWebsocket("sub", holdingdata.value, "hold")
    }
  } catch (e) {
    console.error('Error loading holdings:', e)
  }
}

const getOrderbook = async () => {
  try {
    let response = await getMOrderbook(true)
    if (response && response.stat) {
      statorders.value = response.stat
    }
  } catch (e) {
    console.error('Error loading orders:', e)
  }
}

const getAllmargin = async () => {
  try {
    let limit = await getMLimits(false)
    if (limit && limit.stat == "Ok") {
      const cash = toNumber(limit.cash ?? 0)
      const collateral = toNumber(limit.collateral ?? 0)
      const payin = toNumber(limit.payin ?? 0)
      const payout = toNumber(limit.payout ?? 0)
      
      statlimits.avbma = toNumber(limit.avbma ?? 0)
      statlimits.total = cash + collateral + payin - payout
      statlimits.marginused = toNumber(limit.marginused ?? 0)
    }
  } catch (e) {
    console.error('Error loading margins:', e)
  }
}

/* ---------- Event handlers ---------- */
const handleWsUpdate = (event) => {
  if (!isMounted.value) return
  
  try {
    const detail = event.detail
    if (!detail) return
    
    const data = Array.isArray(detail) ? detail[0] : detail
    if (data && data.token) {
      optionChainHoldDataParse(data)
      optionChainPosiDataParse(data)
    }
  } catch (e) {
    console.error('Error in handleWsUpdate:', e)
  }
}

const statboardEventHandler = () => {
  if (isMounted.value) getStatboardapi()
}

const handleOrderbookUpdate = (evt) => {
  if (isMounted.value && evt.detail === 'port-order') {
    getStatboardapi()
  }
}

/* ---------- Lifecycle ---------- */
let sessionPoll = null

async function loadAll() {
  if (!isMounted.value) return
  await getStatboardapi()
}

onMounted(async () => {
  isMounted.value = true
  
  window.addEventListener('web-scoketConn', handleWsUpdate)
  window.addEventListener('statboard-event', statboardEventHandler)
  window.addEventListener('orderbook-update', handleOrderbookUpdate)

  await new Promise(r => setTimeout(r, 100))

  const uid = sessionStorage.getItem('userid')
  const tok = sessionStorage.getItem('msession')
  
  if (uid && tok) {
    loadAll()
  } else {
    let tries = 0
    sessionPoll = setInterval(() => {
      tries++
      if (sessionStorage.getItem('userid') && sessionStorage.getItem('msession')) {
        clearInterval(sessionPoll)
        sessionPoll = null
        loadAll()
      } else if (tries > 40) { 
        clearInterval(sessionPoll)
        sessionPoll = null
      }
    }, 300)
  }
})

onBeforeUnmount(() => {
  isMounted.value = false
  unsubscribeAll()
  
  window.removeEventListener('web-scoketConn', handleWsUpdate)
  window.removeEventListener('statboard-event', statboardEventHandler)
  window.removeEventListener('orderbook-update', handleOrderbookUpdate)
  
  if (sessionPoll) {
    clearInterval(sessionPoll)
    sessionPoll = null
  }
})
</script>

<style scoped>
.cursor-pointer { cursor: pointer; transition: opacity 0.2s ease; }
.cursor-pointer:hover { opacity: 0.7; }

.maingreen--text { color: #43A833 !important; }
.mainred--text { color: #F23645 !important; }
.subtext--text { color: #6b7280 !important; }
.cardbg { background: #fff; }
</style>
