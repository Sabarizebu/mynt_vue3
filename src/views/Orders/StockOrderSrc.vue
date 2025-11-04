<template>
    <div>
        <v-tabs v-model="bodytab" color="primary" fixed show-arrows density="comfortable"
            @update:model-value="onTabChange">
            <v-tab :value="0" class="font-weight-bold subtitle-1 mb-0 text-none">Orders Book</v-tab>
            <v-tab :value="1" class="font-weight-bold subtitle-1 mb-0 text-none">Trade Book</v-tab>
            <v-tab :value="2" class="font-weight-bold subtitle-1 mb-0 text-none">GTT Order</v-tab>
            <v-tab :value="3" class="font-weight-bold subtitle-1 mb-0 text-none">Basket Order</v-tab>
            <v-tab :value="4" class="font-weight-bold subtitle-1 mb-0 text-none">SIP Order</v-tab>
            <v-tab :value="5" class="font-weight-bold subtitle-1 mb-0 text-none">Mutual funds</v-tab>
            <v-tab :value="6" class="font-weight-bold subtitle-1 mb-0 text-none">IPOs</v-tab>
            <v-tab :value="7" class="font-weight-bold subtitle-1 mb-0 text-none">Bonds</v-tab>
        </v-tabs>

        <v-window v-model="bodytab" class="mt-4">
            <v-window-item :value="0">
                <StocksOrderBook />
            </v-window-item>
            <v-window-item :value="1">
                <StocksTradeBook />
            </v-window-item>
            <v-window-item :value="2">
                <StockGTTorders />
            </v-window-item>
            <v-window-item :value="3">
                <StockBSKorders />
            </v-window-item>
            <v-window-item :value="4">
                <StockSIPorders />
            </v-window-item>
            <v-window-item :value="5">
                <MutualOrderbook />
            </v-window-item>
            <v-window-item :value="6">
                <IpoOrderbook />
            </v-window-item>
            <v-window-item :value="7">
                <BondsOrderbook />
            </v-window-item>
        </v-window>
    </div>
    
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import StocksOrderBook from './StocksOrderBook.vue'
import StocksTradeBook from './StocksTradeBook.vue'
import StockGTTorders from './StockGTTorders.vue'
import StockBSKorders from './StockBSKorders.vue'
import StockSIPorders from './StockSIPorders.vue'
import MutualOrderbook from '@/views/Dashboard/mutualfund/MutualOrderbook.vue'
import IpoOrderbook from '@/views/Dashboard/ipos/IpoOrderbook.vue'
import BondsOrderbook from '@/views/Dashboard/bonds/BondsOrderbook.vue'

const route = useRoute()
const bodytab = ref(0)

// Phase 8: Store security data for SIP tab integration
let pendingSIPData = null

// Phase 8: Handle route params and query for SIP tab integration
function handleRouteParams() {
    // Check if route has params or query (from buy/sell dialog navigation)
    const params = route.params
    const query = route.query
    
    // Combine params and query for security data
    const securityData = { ...params, ...query }
    
    // Check if security data contains token or tsym
    if (securityData && (securityData.token || securityData.tsym)) {
        // Store security data for later use
        pendingSIPData = {
            token: securityData.token,
            tsym: securityData.tsym,
            exch: securityData.exch,
            ls: securityData.ls || 1, // Lot size
            ...securityData // Include any other params/query
        }
        
        // Switch to SIP tab (index 4)
        // The watch on bodytab will trigger the event once tab becomes active
        bodytab.value = 4
    } else if (route.path === '/orders/sip') {
        // Direct navigation to SIP orders page
        bodytab.value = 4
    }
}

function onTabChange() {
    // reserved for future behaviors
}

function onOrderTab(e) {
    const tab = e?.detail
    if ([0,1,2,3,4,5,6,7].includes(tab)) bodytab.value = tab
}

// Phase 8: Watch for route changes to handle SIP tab navigation
watch(() => [route.params, route.query, route.path], () => {
    handleRouteParams()
}, { deep: true })

// Phase 8: Watch for tab changes to trigger SIP dialog when tab becomes active
watch(bodytab, (newTab) => {
    // If SIP tab (4) becomes active and we have pending SIP data, trigger dialog
    if (newTab === 4 && pendingSIPData) {
        // Wait for component to mount and be ready
        setTimeout(() => {
            if (pendingSIPData) {
                window.dispatchEvent(new CustomEvent('siporder-trigger', {
                    detail: pendingSIPData
                }))
                // Clear after use to prevent duplicate events
                pendingSIPData = null
            }
        }, 500)
    }
})

onMounted(() => {
    // Phase 8: Handle route params on mount
    handleRouteParams()
    
    // support external triggers similar to old EventBus
    window.addEventListener('order-tab', onOrderTab)
})

onBeforeUnmount(() => {
    window.removeEventListener('order-tab', onOrderTab)
})
</script>
