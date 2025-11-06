<template>
    <div class="marketwatch-panel">
        <v-window :model-value="activeTab" @update:model-value="$emit('update:activeTab', $event)">
            <v-window-item value="watchlist">
                <div class="watchlist-content">
                    <v-text-field
                        v-model="searchText"
                        placeholder="Search eg: nifty, bank nifty, fut, etc."
                        density="compact"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-magnify"
                        class="mb-2"
                    ></v-text-field>
                    <div class="watchlist-items">
                        <div
                            v-for="(item, index) in filteredWatchlist"
                            :key="index"
                            class="watchlist-item"
                            @click="selectInstrument(item)"
                        >
                            <div class="item-name">{{ formatInstrumentShort(item) }}</div>
                            <div class="item-price" :class="getPriceClass(item)">
                                ₹{{ formatPrice(item.ltp || item.lp || 0) }}
                            </div>
                            <div class="item-change" :class="getChangeClass(item)">
                                {{ formatChange(item.ch || 0) }} ({{ formatPercent(item.chp || 0) }}%)
                            </div>
                        </div>
                    </div>
                </div>
            </v-window-item>

            <v-window-item value="positions">
                <PositionsPanel :theme="theme" :compact="true" />
            </v-window-item>

            <v-window-item value="holdings">
                <PositionsPanel :theme="theme" :compact="true" />
            </v-window-item>
        </v-window>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getLtpdata } from '@/components/mixins/getAPIdata'
import { formatInstrumentShort } from '@/utils/instrumentHelpers'
import PositionsPanel from './PositionsPanel.vue'

export default {
    name: 'MarketwatchPanel',
    components: {
        PositionsPanel,
    },
    props: {
        theme: {
            type: String,
            default: 'dark',
        },
        activeTab: {
            type: String,
            default: 'watchlist',
        },
    },
    emits: ['select-instrument', 'update:activeTab'],
    setup(props, { emit }) {
        const searchText = ref('')
        const watchlist = ref([])

        const filteredWatchlist = computed(() => {
            if (!searchText.value) return watchlist.value
            const search = searchText.value.toLowerCase()
            return watchlist.value.filter(item => {
                const name = (item.tsym || item.name || '').toLowerCase()
                return name.includes(search)
            })
        })

        const formatPrice = (val) => {
            if (!val && val !== 0) return '0.00'
            return Number(val).toFixed(2)
        }

        const formatChange = (val) => {
            if (!val && val !== 0) return '0.00'
            return (val >= 0 ? '+' : '') + Number(val).toFixed(2)
        }

        const formatPercent = (val) => {
            if (!val && val !== 0) return '0.00'
            return Number(val).toFixed(2)
        }

        const getPriceClass = (item) => {
            const change = item.ch || 0
            return change >= 0 ? 'text-success' : 'text-error'
        }

        const getChangeClass = (item) => {
            const change = item.ch || 0
            return change >= 0 ? 'text-success' : 'text-error'
        }

        const selectInstrument = (item) => {
            emit('select-instrument', {
                token: item.token,
                exch: item.exch,
                tsym: item.tsym || item.name,
                name: `${item.exch}:${item.tsym || item.name}`,
            })
        }

        const loadWatchlist = async () => {
            try {
                // Load default watchlist items
                // This is a placeholder - should load from actual watchlist API
                watchlist.value = [
                    { token: '26000', exch: 'NSE', tsym: 'NIFTY 50', ltp: 25181.80, ch: 135.65, chp: 0.54 },
                    { token: '26009', exch: 'BSE', tsym: 'SENSEX', ltp: 82172.10, ch: 338.44, chp: 0.49 },
                    { token: '2885', exch: 'NSE', tsym: 'RELIANCE', ltp: 1377.80, ch: 10.40, chp: 0.76 },
                ]
            } catch (error) {
                console.error('Error loading watchlist:', error)
            }
        }

        onMounted(() => {
            loadWatchlist()
        })

        return {
            searchText,
            watchlist,
            filteredWatchlist,
            formatPrice,
            formatChange,
            formatPercent,
            getPriceClass,
            getChangeClass,
            selectInstrument,
            formatInstrumentShort,
        }
    },
}
</script>

<style scoped>
.marketwatch-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.watchlist-content {
    flex: 1;
    overflow-y: auto;
}

.watchlist-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.watchlist-item {
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.2s;
}

.watchlist-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.item-name {
    font-weight: 600;
    font-size: 13px;
}

.item-price {
    font-size: 14px;
    font-weight: 600;
    margin-top: 2px;
}

.item-change {
    font-size: 11px;
    margin-top: 2px;
}

.text-success {
    color: #26a69a;
}

.text-error {
    color: #ef5350;
}
</style>

