<template>
    <div>
        <v-dialog v-model="bondorderdialog" persistent
            @click:outside="!orderpoploader ? closeMenudialog('bondorder') : ''" max-width="400">
            <v-card class="pb-1 overflow-hidden" color="cardbg" style="border-radius: 15px;">
                <v-card class="elevation-0 pt-2 pb-1" color="secbg">
                    <v-toolbar class="elevation-0 px-1 px-md-2 crd-trn" density="compact">
                        <P class="font-weight-bold fs-16 maintext--text mb-0 px-4">
                            Order {{ menudata.type == 0 ? "G-SEC" : menudata.type == 1 ? "T-BILL" : menudata.type == 2 ?
                                "SDL" : menudata.type == 3 ? "SGB" : "" }}
                        </P>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="orderpoploader" @click="closeMenudialog('bondorder')" color="maintext"
                            size="x-small" variant="outlined" icon class="mr-3">
                            <v-icon color="maintext">mdi-close</v-icon>
                        </v-btn>
                    </v-toolbar>
                </v-card>
                <v-progress-linear v-if="orderpoploader" indeterminate></v-progress-linear>

                <div class="px-4 px-md-6 pt-4 pb-2">
                    <v-list-item class="px-0">
                        <v-list-item-content class="py-0">
                            <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-0">
                                {{ menudata.name ? menudata.name : "" }}
                            </v-list-item-title>
                            <v-chip-group column class="mb-1 pt-0 mt-0">
                                <v-chip size="x-small" variant="flat" :style="{
                                    backgroundColor: '#F1F3F8',
                                    color: '#666666',
                                    borderRadius: '5px',
                                    height: '20px'
                                }">
                                    <span class="fs-10">
                                        {{ menudata.symbol ? menudata.symbol : "" }}
                                    </span>
                                </v-chip>
                                <v-chip v-if="menudata.isin" size="x-small" variant="flat" :style="{
                                    backgroundColor: '#F1F3F8',
                                    color: '#666666',
                                    borderRadius: '5px',
                                    height: '20px'
                                }">
                                    <span class="fs-10">
                                        {{ menudata.isin ? menudata.isin : "" }}
                                    </span>
                                </v-chip>
                            </v-chip-group>
                        </v-list-item-content>
                    </v-list-item>

                    <p class="font-weight-regular fs-14 subtext--text mb-2">Units</p>
                    <v-text-field :model-value="bondqty" @update:model-value="bondqty = $event" @keyup="handleQtyKeyup"
                        density="compact" variant="solo" flat rounded="pill" :bg-color="'secbg'" class="rounded-pill"
                        type="number" hide-spin-buttons :min="menudata.minbidqty" hide-details
                        :step="menudata.lotbitsize" :max="menudata.maxbidqty">
                        <template #append-inner>
                            <v-btn @click="incrementQty" icon class="elevation-0" variant="text" size="small">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M12 8V16" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>

                        <template #prepend-inner>
                            <v-btn @click="decrementQty" icon class="elevation-0" variant="text" size="small">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none">
                                    <circle cx="12" cy="12" r="12" fill="white" />
                                    <path d="M16 12L8 12" stroke="#999999" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </v-btn>
                        </template>
                    </v-text-field>

                    <p class="fs-10 subtext--text ml-6 mt-2">
                        Units limit {{ menudata.minbidqty || 0 }} - {{ menudata.maxbidqty || 0 }}
                    </p>

                    <p class="subtext--text fs-12 mt-3 mb-0">
                        Ledger balance : <b>₹{{ menudata.ledger ? menudata.ledger : "0.00" }}</b>
                    </p>

                    <v-card v-if="menudata.ledger < menudata.cutoffPrice * bondqty" color="primhover"
                        class="rounded-lg px-4 py-2 elevation-0 mt-4">
                        <div class="mb-0 primary--text fs-12 d-flex align-center"
                            style="gap: 4px; white-space: nowrap;">
                            <v-icon size="16" color="primary">mdi-information-outline</v-icon>
                            <span class="text-primary">
                                Insufficient balance, Add fund ₹{{ (menudata.cutoffPrice * bondqty).toFixed(2) }}
                            </span>
                            <v-btn @click="closeMenudialog('bondorder')" variant="text"
                                class="text-none font-weight-black px-0" size="small" color="primary" to="/funds">
                                Click here
                            </v-btn>
                        </div>

                    </v-card>
                </div>

                <v-toolbar class="tool-sty elevation-0 pt-4 mb-2 px-4 px-md-6 crd-trn" density="compact">
                    <span class="font-weight-regular fs-12 subtext--text">
                        Price : <span class="text-primary font-weight-bold">
                            ₹{{ menudata.cutoffPrice ? menudata.cutoffPrice.toFixed(2) : "0.00" }}
                        </span>
                    </span>
                    <v-spacer></v-spacer>

                    <v-btn :disabled="bondqty < menudata.minbidqty || menudata.ledger < menudata.cutoffPrice * bondqty"
                        @click="setBondorder()" :loading="orderpoploader" text-color="white"
                        class="blk text-none rounded-pill elevation-0  px-4 ml-4" height="40px">
                        Invest ₹{{ menudata.cutoffPrice && bondqty ? Math.round(menudata.cutoffPrice * bondqty) : "0" }}

                    </v-btn>
                </v-toolbar>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import eventBus from '@/utils/eventBus.js'
import { getBondLedger, getBondOrder } from '@/components/mixins/getAPIdata.js'

const router = useRouter()

// Reactive data
const uid = ref(null)
const token = ref(null)
const mtoken = ref(null)
const orderpoploader = ref(false)
const bondqty = ref(null)
const bondorderdialog = ref(false)
const menudata = ref({})

// Computed
const totalInvestment = computed(() => {
    if (menudata.value.cutoffPrice && bondqty.value) {
        return (menudata.value.cutoffPrice * bondqty.value).toFixed(2)
    }
    return "0.00"
})

// Methods
function snackAlert(color, msg) {
    eventBus.$emit('snack-event', color, msg)
}

function handleQtyKeyup() {
    if (bondqty.value) {
        bondqty.value = Number(bondqty.value)
    } else if (bondqty.value < menudata.value.minbidqty) {
        bondqty.value = menudata.value.minbidqty
    }
}

function incrementQty() {
    if (menudata.value.lotbitsize) {
        bondqty.value = (bondqty.value || 0) + menudata.value.lotbitsize
        if (menudata.value.maxbidqty && bondqty.value > menudata.value.maxbidqty) {
            bondqty.value = menudata.value.maxbidqty
        }
    }
}

function decrementQty() {
    if (menudata.value.lotbitsize) {
        if (bondqty.value === menudata.value.lotbitsize) {
            bondqty.value = menudata.value.lotbitsize
        } else {
            bondqty.value = Math.max((bondqty.value || 0) - menudata.value.lotbitsize, menudata.value.minbidqty || 0)
        }
    }
}

async function setMenudialog(itemdata, mode) {
    eventBus.$emit("sub-loader", 1)
    orderpoploader.value = false
    menudata.value = {}
    menudata.value = { ...itemdata }

    try {
        const ledgerRes = await getBondLedger([uid.value, token.value])
        menudata.value.ledger = ledgerRes && ledgerRes.total > 0 ? Number(ledgerRes.total).toFixed(2) : null
    } catch (error) {
        console.error('Error fetching ledger:', error)
        menudata.value.ledger = null
    }

    menudata.value.type = mode
    bondqty.value = itemdata.minbidqty || 0
    bondorderdialog.value = true
    eventBus.$emit("sub-loader", 0)
}

async function setBondorder(mode, item) {
    if (mode == 0) {
        // Cancel order mode
        orderpoploader.value = true
    } else {
        // Buy order mode
        orderpoploader.value = true
    }

    let data = {}

    if (mode == 0) {
        // Cancel order
        data = {
            requestfor: "REMOVE",
            symbol: item.symbol,
            investmentValue: item.investmentValue,
            price: item.bid_detail?.price || item.price,
            orderNumber: item.orderNumber,
            clientApplicationNumber: item.clientApplicationNumber,
        }
    } else {
        // Buy order
        data = {
            requestfor: "BUY",
            symbol: menudata.value.symbol,
            investmentValue: menudata.value.flow == 3
                ? menudata.value.minPrice * bondqty.value
                : bondqty.value * 100,
            price: menudata.value.cutoffPrice,
        }

        if (menudata.value.flow == 3) {
            data.bidQuantity = bondqty.value
        }
    }

    try {
        const response = await getBondOrder(menudata.value.flow == 3, JSON.stringify(data))
        orderpoploader.value = false

        if (response && response.status) {
            const success = response.status == "success"
            const message = response.orderStatus_response
                ? `${mode == 0 ? item.symbol : menudata.value.name}, ${response.orderStatus_response}`
                : response.reason || response

            snackAlert(success ? 1 : 0, message)

            if (mode == 0) {
                eventBus.$emit("watch-load")
            }
        } else {
            const errorMsg = response && response.emsg
                ? response.emsg
                : response.reason || response || "Unknown error"
            snackAlert(2, errorMsg)
        }
    } catch (error) {
        console.error('Error placing bond order:', error)
        orderpoploader.value = false
        snackAlert(2, error.message || "Failed to place order")
    }

    bondorderdialog.value = false
    menudata.value = {}
}

function closeMenudialog(type) {
    if (type == "bondorder") {
        bondorderdialog.value = false
    }
    menudata.value = {}
}

// Event handlers
function handleMenudialog(type, itemdata, mode) {
    if (type == "bondorder") {
        setMenudialog(itemdata, mode)
    }
}

function handleBondModify(data) {
    setBondorder(0, data)
}

// Lifecycle
onMounted(async () => {
    eventBus.$on("menudialog", handleMenudialog)
    eventBus.$on("bondmodify-event", handleBondModify)

    mtoken.value = sessionStorage.getItem("msession")
    token.value = sessionStorage.getItem("usession")
    uid.value = sessionStorage.getItem("userid")
})

onBeforeUnmount(() => {
    eventBus.$off("menudialog", handleMenudialog)
    eventBus.$off("bondmodify-event", handleBondModify)
})
</script>
