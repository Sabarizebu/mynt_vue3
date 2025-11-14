<template>
    <div>
        <div class="my-6">
            <!-- Toolbar -->
            <v-toolbar flat dense class="tool-sty my-6 pl-4 crd-trn">
                <v-tabs v-model="bodytab" color="primary" fixed show-arrows density="compact"
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
            </v-toolbar>

            <v-window v-model="bodytab" style="z-index:0">
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
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StocksOrderBook from './StocksOrderBook.vue'
import StocksTradeBook from './StocksTradeBook.vue'
import StockGTTorders from './StockGTTorders.vue'
import StockBSKorders from './StockBSKorders.vue'
import StockSIPorders from './StockSIPorders.vue'
import MutualOrderbook from '@/views/Dashboard/mutualfund/MutualOrderbook.vue'
import IpoOrderbook from '@/views/Dashboard/ipos/IpoOrderbook.vue'
import BondsOrderbook from '@/views/Dashboard/bonds/BondsOrderbook.vue'

const route = useRoute()
const router = useRouter()
const bodytab = ref(0)

// Phase 8: Store security data for SIP tab integration
// Store in window object so StockSIPorders can check it on mount
let pendingSIPData = null
if (typeof window !== 'undefined') {
    window.__pendingSIPData = null
}

// Phase 8: Handle route params and query for SIP tab integration
function handleRouteParams() {
    // Check if route has params or query (from buy/sell dialog navigation)
    const params = route.params
    const query = route.query
    
    // Combine params and query for security data (exclude timestamp _t)
    const { _t, ...queryWithoutTimestamp } = query
    const securityData = { ...params, ...queryWithoutTimestamp }
    
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
        
        // Also store in window object so StockSIPorders can check it on mount
        if (typeof window !== 'undefined') {
            window.__pendingSIPData = pendingSIPData
        }
        
        console.log('[StockOrderSrc] SIP data detected, switching to SIP tab:', pendingSIPData)
        
        // Switch to SIP tab (index 4)
        // The watch on bodytab will trigger the event once tab becomes active
        bodytab.value = 4
    } else if (route.path === '/orders/sip' || route.path.startsWith('/orders/sip')) {
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
    console.log('[StockOrderSrc] Route changed:', { path: route.path, params: route.params, query: route.query })
    handleRouteParams()
}, { deep: true, immediate: true })

// Phase 8: Watch for tab changes to trigger SIP dialog when tab becomes active
watch(bodytab, async (newTab, oldTab) => {
    // If SIP tab (4) becomes active and we have pending SIP data, trigger dialog
    if (newTab === 4 && pendingSIPData) {
        console.log('[StockOrderSrc] SIP tab activated, triggering dialog with data:', pendingSIPData)
        
        // Wait for Vue to update the DOM and render the SIP component
        await nextTick()
        
        // Wait a bit more to ensure StockSIPorders component is fully mounted and event listener is registered
        // Use multiple nextTick calls to ensure component is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        await nextTick()
        
        // Additional delay to ensure SIP component event listener is ready
        setTimeout(() => {
            if (pendingSIPData) {
                console.log('[StockOrderSrc] Dispatching siporder-trigger event with data:', pendingSIPData)
                
                // Dispatch the event
                const event = new CustomEvent('siporder-trigger', {
                    detail: pendingSIPData
                })
                window.dispatchEvent(event)
                
                // Store data temporarily before clearing for retry
                const dataToRetry = { ...pendingSIPData }
                
                // Clear after use to prevent duplicate events
                pendingSIPData = null
                if (typeof window !== 'undefined') {
                    window.__pendingSIPData = null
                }
                
                // Also try dispatching after a small delay as fallback (in case component wasn't ready)
                setTimeout(() => {
                    console.log('[StockOrderSrc] Retry dispatching siporder-trigger event')
                    window.dispatchEvent(new CustomEvent('siporder-trigger', {
                        detail: dataToRetry
                    }))
                }, 500)
                
                // Clear URL query params after dialog is opened (clean URL)
                setTimeout(() => {
                    if (route.path === '/orders' && Object.keys(route.query).length > 0) {
                        router.replace({
                            path: '/orders',
                            query: {} // Clear all query params
                        })
                        console.log('[StockOrderSrc] Cleared URL query params')
                    }
                }, 1000) // Wait 1 second to ensure dialog is fully opened
                
                console.log('[StockOrderSrc] SIP dialog trigger sent, cleared pending data')
            }
        }, 800) // Increased delay to 800ms to ensure component is mounted
    }
}, { immediate: false })

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
