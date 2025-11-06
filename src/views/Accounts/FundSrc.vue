<template>
    <div>
        <v-toolbar flat dense class="crd-trn tool-sty pt-3 mb-6 mt-4">
            <div>
                <p class="font-weight-bold fs-22 mb-0">Securities Funds</p>
                <p class="subtitle-2 subtext--text">View margin breakup & add/withdraw fund.</p>
            </div>
            <v-spacer />
            <v-icon class="ml-3 cursor-p" @click="getAllmargin" color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-row class="py-6">
            <v-col class="pa-10" cols="12" md="6"
                style="border: 1px solid #EBEEF0 !important ; border-radius: 10px;" outlined>
                <v-row>
                    <v-col cols="12" md="6" class="pb-2">
                        <p class="fs-14 subtext--text font-weight-medium mb-0 lh-16">Total credits</p>
                        <v-text-field :value="`₹ ${limits.total || '0.00'}`" class="mt-0 font-weight-bold" readonly flat
                            color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="pb-2">
                        <p class="fs-14 subtext--text font-weight-medium mb-0 lh-16">Available balance to trade</p>
                        <v-text-field :value="`₹ ${limits.avbma || '0.00'}`" class="mt-0 font-weight-bold" readonly flat
                            color="#999999" />
                    </v-col>

                    <v-col cols="12" md="6" class="py-0 pb-2">
                        <p class="fs-14 subtext--text font-weight-regular mb-0 lh-16">Opening balance</p>
                        <v-text-field :value="`₹ ${limits.opnbal || '0.00'}`" class="mt-0 font-weight-bold" readonly
                            flat color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="py-0 pb-2">
                        <p class="fs-14 subtext--text font-weight-regular mb-0 lh-16">Broker collateral</p>
                        <v-text-field :value="`₹ ${limits.collateral || '0.00'}`" class="mt-0 font-weight-bold" readonly
                            flat color="#999999" />
                    </v-col>

                    <v-col cols="12" class="py-0 pb-2">
                        <p class="fs-14 subtext--text font-weight-medium lh-16 mb-0">
                            Margin used
                            <v-btn icon @click="expand = !expand"><v-icon color="#999">{{ expand ? 'mdi-chevron-up' :
                                    'mdi-chevron-down' }}</v-icon></v-btn>
                        </p>
                        <v-text-field :value="`₹ ${limits.marginused || '0.00'}`" class="mt-0 font-weight-bold" readonly
                            flat color="#999999" />
                        <div v-if="expand" class="mb-4">
                            <p class="fs-14 subtext--text font-weight-regular mb-2 lh-24">Span <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.span || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-regular mb-2 lh-24">Exposure <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.expo || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-regular mb-2 lh-24">Additional margin <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.addmrg || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-regular mb-2 lh-24">Option premium <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.premium || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-regular mb-2 lh-24">Unrealized expenses <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.brokerage || '0.00'
                                    }}</span></p>
                        </div>
                    </v-col>

                    <v-col cols="12" md="6" class="py-0">
                        <p class="fs-14 subtext--text font-weight-regular mb-0 lh-16">Peak margin</p>
                        <v-text-field :value="`₹ ${limits.peak_mar || '0.00'}`" class="mt-0 font-weight-bold" readonly
                            flat color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="py-0">
                        <p class="fs-14 subtext--text font-weight-regular mb-0 lh-16">Expiry margin</p>
                        <v-text-field :value="`₹ ${limits.expiry_mar || '0.00'}`" class="mt-0 font-weight-bold" readonly
                            flat color="#999999" />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-card outlined elevation="0" class="mb-6 rounded-lg">
                            <v-btn :disabled="loading" @click="openFunds('fund')" color="black"
                                class="elevation-0 rounded-lg white--text" block> Add fund </v-btn>
                        </v-card>
                    </v-col>
                    <v-col>
                        <v-card outlined elevation="0" class="mb-6 rounded-lg">
                            <v-btn :disabled="loading" @click="openFunds('withdrawal')" color="black"
                                class="elevation-0 rounded-lg white--text" block> Withdrawal </v-btn>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { getMLimits, forceRefreshMLimits } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()

const loading = ref(false)
const limits = ref({})
const expand = ref(false)

async function getAllmargin() {
    loading.value = true
    // Manual refresh button - force refresh the API
    const data = await forceRefreshMLimits(true)
    if (data && data.stat === 'Ok') {
        limits.value = data
    } else if (data !== 500) {
        appStore.showSnackbar(2, data && data.emsg ? data.emsg : 'Failed to load funds')
    }
    loading.value = false
}

async function loadLimits() {
    // Initial load - use getMLimits which returns cached data if already loaded once
    const data = await getMLimits(true)
    if (data && data.stat === 'Ok') {
        limits.value = data
    } else if (data !== 500 && data && data.emsg) {
        appStore.showSnackbar(2, data.emsg)
    }
}

function openFunds(pageis) {
    const uid = sessionStorage.getItem('userid')
    const stoken = sessionStorage.getItem('usession')
    if (!uid || !stoken) return
    let url = pageis === 'fund'
        ? `https://fund.zebuetrade.com?uid=${uid}&token=${stoken}`
        : `https://fund.zebuetrade.com/${pageis}?uid=${uid}&token=${stoken}`
    window.open(url, '_blank')
}

onMounted(() => {
    loadLimits()
})
</script>
