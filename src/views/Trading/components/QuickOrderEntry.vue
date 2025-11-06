<template>
    <v-dialog v-model="dialog" max-width="400px" persistent>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Quick Order</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <div v-if="instrument" class="instrument-info mb-4">
                    <div class="text-subtitle-2 font-weight-bold">{{ formatInstrumentName(instrument) }}</div>
                    <div class="text-caption text-grey">Current Price: ₹{{ formatPrice(currentPrice) }}</div>
                </div>

                <v-text-field
                    v-model.number="quantity"
                    label="Quantity"
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

                <v-select
                    v-model="orderType"
                    :items="orderTypes"
                    label="Order Type"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                ></v-select>

                <v-select
                    v-model="productType"
                    :items="productTypes"
                    label="Product Type"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-2"
                ></v-select>

                <v-checkbox
                    v-model="intraday"
                    label="Intraday"
                    density="compact"
                    hide-details
                    class="mb-2"
                ></v-checkbox>

                <div class="order-summary mt-4">
                    <div class="summary-row">
                        <span>Required:</span>
                        <span class="font-weight-bold">₹{{ formatPrice(requiredAmount) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>Available:</span>
                        <span class="font-weight-bold text-success">₹{{ formatPrice(availableAmount) }}</span>
                    </div>
                </div>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="close">Cancel</v-btn>
                <v-btn
                    color="success"
                    variant="flat"
                    :disabled="!canPlaceOrder"
                    :loading="isPlacingOrder"
                    @click="placeOrder('buy')"
                >
                    Buy
                </v-btn>
                <v-btn
                    color="error"
                    variant="flat"
                    :disabled="!canPlaceOrder"
                    :loading="isPlacingOrder"
                    @click="placeOrder('sell')"
                >
                    Sell
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatInstrumentName } from '@/utils/instrumentHelpers'

export default {
    name: 'QuickOrderEntry',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        instrument: {
            type: Object,
            default: null,
        },
        defaultPrice: {
            type: Number,
            default: 0,
        },
        defaultSide: {
            type: String,
            default: 'buy',
            validator: (value) => ['buy', 'sell'].includes(value),
        },
    },
    emits: ['update:modelValue', 'order-placed'],
    setup(props, { emit }) {
        const orderStore = useOrderStore()

        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const quantity = ref(1)
        const price = ref(props.defaultPrice || 0)
        const orderType = ref('LMT')
        const productType = ref('INTRADAY')
        const intraday = ref(true)
        const isPlacingOrder = ref(false)
        const currentPrice = ref(props.defaultPrice || 0)
        const availableAmount = ref(100000) // Placeholder - should fetch from limits API

        const orderTypes = ['LMT', 'MKT', 'SL', 'SL-M']
        const productTypes = ['INTRADAY', 'CNC', 'MARGIN', 'CO']

        const requiredAmount = computed(() => {
            return quantity.value * price.value
        })

        const canPlaceOrder = computed(() => {
            return (
                props.instrument &&
                quantity.value > 0 &&
                price.value > 0 &&
                requiredAmount.value <= availableAmount.value
            )
        })

        const formatPrice = (val) => {
            if (!val && val !== 0) return '0.00'
            return Number(val).toFixed(2)
        }

        const placeOrder = async (side) => {
            if (!canPlaceOrder.value || !props.instrument) return

            isPlacingOrder.value = true
            try {
                const order = {
                    instrument: props.instrument,
                    side: side,
                    quantity: quantity.value,
                    price: price.value,
                    orderType: orderType.value,
                    productType: productType.value,
                    intraday: intraday.value,
                }

                // Place order via order store
                // await orderStore.placeOrder(order)
                console.log('Placing order:', order)

                emit('order-placed', order)
                close()
            } catch (error) {
                console.error('Error placing order:', error)
            } finally {
                isPlacingOrder.value = false
            }
        }

        const close = () => {
            dialog.value = false
        }

        watch(() => props.defaultPrice, (newPrice) => {
            if (newPrice) {
                price.value = newPrice
                currentPrice.value = newPrice
            }
        }, { immediate: true })

        watch(() => props.instrument, (newInstrument) => {
            if (newInstrument) {
                // Load current price
                loadCurrentPrice()
            }
        }, { immediate: true })

        const loadCurrentPrice = async () => {
            if (!props.instrument) return

            try {
                // Load current price from API
                // const response = await getLtpdata([{
                //     exch: props.instrument.exch,
                //     token: props.instrument.token,
                // }])
                // if (response && response.data) {
                //     const data = response.data[props.instrument.token]
                //     if (data) {
                //         currentPrice.value = Number(data.ltp || data.lp || 0)
                //         if (!price.value || price.value === 0) {
                //             price.value = currentPrice.value
                //         }
                //     }
                // }
            } catch (error) {
                console.error('Error loading current price:', error)
            }
        }

        return {
            dialog,
            quantity,
            price,
            orderType,
            productType,
            intraday,
            isPlacingOrder,
            currentPrice,
            availableAmount,
            orderTypes,
            productTypes,
            requiredAmount,
            canPlaceOrder,
            formatPrice,
            placeOrder,
            close,
            formatInstrumentName,
        }
    },
}
</script>

<style scoped>
.instrument-info {
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}

.order-summary {
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
</style>

