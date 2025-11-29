<template>
    <div>
        <v-toolbar flat dense class="crd-trn tool-sty ">
            <div>
                <p class="font-weight-bold fs-22 mb-0">Securities Funds</p>
                <p class="fs-14  lh-16 font-weight-bold" style="color: #666666;">View margin breakup & add/withdraw
                    fund.</p>
            </div>
            <v-spacer />
            <v-icon class="ml-3 cursor-p" @click="getAllmargin" color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-row class="mt-7 ml-1">
            <v-col class="pa-10" cols="12" md="6" style="border: 1px solid #EBEEF0 !important ; border-radius: 10px;"
                outlined>
                <v-row>
                    <v-col cols="12" md="6" class="pb-2">
                        <p class="fs-14 subtext--text font-weight-semibold mb-0 txt-666 lh-16">Total credits</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.total || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="pb-2">
                        <p class="fs-14 subtext--text font-weight-semibold mb-0 txt-666 lh-16">Available balance to
                            trade</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.avbma || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                    </v-col>

                    <v-col cols="12" md="6" class="py-0 pb-2">
                        <p class="fs-14 subtext--text font-weight-semibold mb-0 txt-666 lh-16">Opening balance</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.opnbal || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="py-0 pb-2">
                        <p class="fs-12 subtext--text font-weight-semibold mb-0 txt-666 lh-16">Broker collateral</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.collateral || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                    </v-col>

                    <v-col cols="12" class="py-0 pb-2">
                        <p class="fs-12 subtext--text font-weight-bold mb-0 txt-999 lh-16">Note: Only 80% of the amount
                            after selling Demat holdings will be available to trade on the same day. The remaining 20%
                            will be available to trade on the next day. Learn more.</p>
                    </v-col>

                    <v-col cols="12" class="py-0 pb-2">
                        <p class="fs-14 subtext--text font-weight-semibold lh-16 mb-0 txt-666">
                            Margin used
                            <v-btn icon elevation="0" @click="expand = !expand"><v-icon color="#999">{{ expand ?
                                'mdi-chevron-up' :
                                    'mdi-chevron-down' }}</v-icon></v-btn>
                        </p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.marginused || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                        <div v-if="expand" class="mb-4">
                            <p class="fs-14 subtext--text font-weight-semibold text-666 mb-2 lh-24">Span <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.span || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-semibold text-666 mb-2 lh-24">Exposure <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.expo || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-semibold text-666 mb-2 lh-24">Additional margin
                                <span class="font-weight-bold maintext--text float-right">{{ limits.addmrg || '0.00'
                                }}</span>
                            </p>
                            <p class="fs-14 subtext--text font-weight-semibold text-666 mb-2 lh-24">Option premium <span
                                    class="font-weight-bold maintext--text float-right">{{ limits.premium || '0.00'
                                    }}</span></p>
                            <p class="fs-14 subtext--text font-weight-semibold text-666 mb-2 lh-24">Unrealized expenses
                                <span class="font-weight-bold maintext--text float-right">{{ limits.brokerage || '0.00'
                                }}</span>
                            </p>
                        </div>
                    </v-col>

                    <v-col cols="12" md="6" class="py-0">
                        <p class="fs-14 subtext--text font-weight-semibold mb-0 lh-16 txt-666">Peak margin</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.peak_mar || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
                    </v-col>
                    <v-col cols="12" md="6" class="py-0">
                        <p class="fs-14 subtext--text font-weight-semibold mb-0 lh-16 txt-666">Expiry margin</p>
                        <v-text-field variant="underlined" :value="`₹ ${limits.expiry_mar || '0.00'}`"
                            class="mt-0 font-weight-bold" readonly flat color="#999999" />
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
    // Initial load - force refresh to get latest funds data
    const data = await forceRefreshMLimits(true)
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

<style scoped>
:deep(.v-text-field input),
:deep(.v-text-field .v-field__input input) {
    font-size: 16px !important;
}
</style>