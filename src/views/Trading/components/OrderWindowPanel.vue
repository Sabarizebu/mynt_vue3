<template>
    <div class="order-window-panel">
        <div v-if="instrument" class="instrument-header">
            <div class="instrument-name">{{ formatInstrumentName(instrument) }}</div>
            <div class="instrument-price" :class="priceChange >= 0 ? 'text-success' : 'text-error'">
                <span v-if="instrument.exch && instrument.exch !== 'undefined'">{{ instrument.exch }} </span>
                ₹{{ formatPrice(currentPrice) }}
                <span v-if="priceChange !== null">
                    {{ priceChange >= 0 ? '+' : '' }}{{ formatPrice(priceChange) }} ({{ formatPercent(priceChangePercent) }}%)
                </span>
            </div>
        </div>

        <v-tabs v-model="orderTypeTab" density="compact" class="order-type-tabs">
            <v-tab value="quick">Quick</v-tab>
            <v-tab value="regular">Regular</v-tab>
            <v-tab value="cover">Cover</v-tab>
            <v-tab value="amo">AMO</v-tab>
        </v-tabs>

        <div class="order-form">
            <v-text-field
                v-model.number="quantity"
                label="Qty"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
            ></v-text-field>

            <v-text-field
                v-model.number="price"
                label="Price"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
            ></v-text-field>

            <v-checkbox
                v-model="intraday"
                label="Intraday"
                density="compact"
                hide-details
                class="mb-2"
            ></v-checkbox>

            <div class="order-summary">
                <div class="summary-row">
                    <span>Required:</span>
                    <span class="font-weight-bold">₹{{ formatPrice(requiredAmount) }}</span>
                </div>
                <div class="summary-row">
                    <span>Available:</span>
                    <span class="font-weight-bold text-success">₹{{ formatPrice(availableAmount) }}</span>
                </div>
            </div>

            <v-btn
                block
                :color="isBuy ? 'success' : 'error'"
                class="mt-2"
                @click="placeOrder"
                :loading="isPlacingOrder"
            >
                {{ isBuy ? 'BUY' : 'SELL' }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { getLtpdata } from '@/components/mixins/getAPIdata'
import { formatInstrumentName, isValidInstrument, hasRequiredFields } from '@/utils/instrumentHelpers'

export default {
    name: 'OrderWindowPanel',
    props: {
        instrument: {
            type: Object,
            default: null,
        },
        theme: {
            type: String,
            default: 'dark',
        },
    },
    setup(props) {
        const orderStore = useOrderStore()

        const orderTypeTab = ref('quick')
        const quantity = ref(1)
        const price = ref(0)
        const intraday = ref(true)
        const isBuy = ref(true)
        const isPlacingOrder = ref(false)
        const currentPrice = ref(0)
        const priceChange = ref(null)
        const priceChangePercent = ref(null)

        const requiredAmount = computed(() => {
            return quantity.value * price.value
        })

        const availableAmount = computed(() => {
            // Placeholder - should fetch from limits API
            return 100000
        })

        const formatPrice = (val) => {
            if (!val && val !== 0) return '0.00'
            return Number(val).toFixed(2)
        }

        const formatPercent = (val) => {
            if (!val && val !== 0) return '0.00'
            return Number(val).toFixed(2)
        }

        const placeOrder = async () => {
            if (!props.instrument || !quantity.value || !price.value) return

            isPlacingOrder.value = true
            try {
                // Place order logic here
                console.log('Placing order:', {
                    instrument: props.instrument,
                    quantity: quantity.value,
                    price: price.value,
                    isBuy: isBuy.value,
                    intraday: intraday.value,
                })
                // await orderStore.placeOrder(...)
            } catch (error) {
                console.error('Error placing order:', error)
            } finally {
                isPlacingOrder.value = false
            }
        }

        // Debouncing for API calls
        let loadDataTimeout = null
        let isLoadingData = false

        const loadInstrumentData = async () => {
            if (!props.instrument) return

            // Prevent multiple simultaneous calls
            if (isLoadingData) {
                console.log('OrderWindowPanel: Already loading data, skipping...')
                return
            }

            try {
                // Validate instrument
                if (!isValidInstrument(props.instrument)) {
                    console.warn('OrderWindowPanel: Invalid instrument')
                    return
                }

                // Check if instrument has required fields for API call
                if (!hasRequiredFields(props.instrument)) {
                    console.warn('OrderWindowPanel: Invalid instrument - missing exch, token, or tsym')
                    return
                }

                // Clear any pending timeout
                if (loadDataTimeout) {
                    clearTimeout(loadDataTimeout)
                    loadDataTimeout = null
                }

                // Debounce the API call
                loadDataTimeout = setTimeout(async () => {
                    try {
                        isLoadingData = true
                        const response = await getLtpdata([{
                            exch: props.instrument.exch,
                            token: props.instrument.token,
                            tsym: props.instrument.tsym,
                        }])

                        // Handle error response
                        if (response && response.error) {
                            console.error('Error loading instrument data:', response.error)
                            return
                        }

                        // Handle successful response
                        if (response && Array.isArray(response) && response.length > 0) {
                            const data = response[0] // Get first item from response array
                            currentPrice.value = Number(data.ltp || data.lp || 0)
                            price.value = currentPrice.value
                            priceChange.value = Number(data.ch || 0)
                            priceChangePercent.value = Number(data.chp || 0)
                        }
                    } catch (error) {
                        console.error('Error loading instrument data:', error)
                    } finally {
                        isLoadingData = false
                    }
                }, 300) // 300ms debounce
            } catch (error) {
                console.error('Error loading instrument data:', error)
                isLoadingData = false
            }
        }

        watch(() => props.instrument, (newVal, oldVal) => {
            if (newVal && newVal !== oldVal) {
                loadInstrumentData()
            }
        }, { immediate: true })

        // Cleanup on unmount
        onBeforeUnmount(() => {
            if (loadDataTimeout) {
                clearTimeout(loadDataTimeout)
                loadDataTimeout = null
            }
        })

        return {
            orderTypeTab,
            quantity,
            price,
            intraday,
            isBuy,
            isPlacingOrder,
            currentPrice,
            priceChange,
            priceChangePercent,
            requiredAmount,
            availableAmount,
            formatPrice,
            formatPercent,
            placeOrder,
        }
    },
}
</script>

<style scoped>
.order-window-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.instrument-header {
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.instrument-name {
    font-weight: 600;
    font-size: 14px;
}

.instrument-price {
    font-size: 12px;
    margin-top: 4px;
}

.order-type-tabs {
    flex-shrink: 0;
}

.order-form {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
}

.order-summary {
    margin-top: 16px;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 12px;
}

.text-success {
    color: #26a69a;
}

.text-error {
    color: #ef5350;
}
</style>

