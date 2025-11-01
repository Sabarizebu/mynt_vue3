<template>
    <div class="modern-watchlist">
        <!-- Search Header -->
        <div class="search-header">
            <div class="search-container">
                <v-icon class="search-icon">mdi-magnify</v-icon>
                <input v-model="search" @input="searchScript" placeholder="Search script"
                    class="search-input rounded-pill" :class="{ 'searching': searchloading }" />
                <v-progress-circular v-if="searchloading" size="16" width="2" indeterminate
                    class="search-loader"></v-progress-circular>
            </div>
        </div>

        <!-- Watchlist Tabs -->
        <div class="watchlist-tabs">
            <div class="tabs-container" v-dragscroll.x
                style="overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;">
                <!-- User Watchlists -->
                <div v-if="!watchsecti" class="tabs-scroll">
                    <button v-for="(wl, index) in watchlist" :key="index" @click="selectWatchlist(wl)"
                        class="tab-button rounded-pill" :class="{ 'active': watchlistis === wl }">
                        {{ wl }}
                    </button>
                </div>
                <!-- Predefined Watchlists -->
                <div v-if="PreMWlist && PreMWlist.length > 0" class="tabs-scroll">
                    <button v-for="(p, s) in PreMWlist" :key="s" @click="selectWatchlist(p.key)" class="tab-button"
                        :class="{ 'active': watchlistis === p.key }">
                        {{ p.key }}
                    </button>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button @click="addscript = true" class="action-btn">
                    <v-icon size="20">mdi-tune-variant</v-icon>
                </button>
                <button @click="watchsecti = !watchsecti" class="action-btn">
                    <v-icon size="20">mdi-dots-vertical</v-icon>
                </button>
            </div>
        </div>

        <!-- Watchlist Management Section -->
        <v-card v-if="watchsecti" class="elevation-0 rounded-xl mb-3" color="cardbg">
            <v-card-title class="pb-2">
                <span class="title font-weight-bold">Manage Watchlists</span>
                <v-spacer></v-spacer>
                <v-btn @click="createMWdialog = true" color="primary" small>
                    <v-icon left>mdi-plus</v-icon>
                    New Watchlist
                </v-btn>
            </v-card-title>

            <v-list>
                <v-list-item v-for="(wl, index) in watchlist" :key="index"
                    @click="selectWatchlist(wl); watchsecti = false" class="cursor-pointer">
                    <v-list-item-avatar>
                        <v-avatar :color="wl === watchlistis ? 'primary' : 'grey'" size="24">
                            <v-icon small color="white">mdi-chart-line</v-icon>
                        </v-avatar>
                    </v-list-item-avatar>

                    <v-list-item-content>
                        <v-list-item-title :class="wl === watchlistis ? 'primary--text font-weight-bold' : ''">
                            {{ wl }}
                        </v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-btn @click.stop="confirmDeleteWatchlist(wl)" icon small>
                            <v-icon color="error">mdi-delete</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>

        <!-- Stock List -->
        <div v-if="!addscript && !watchsecti" class="stock-list">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="loading-text">Loading watchlist...</span>
            </div>

            <!-- No Data State -->
            <div v-else-if="watchlistdata === 'no data'" class="no-data-state">
                <v-icon size="48" color="grey lighten-1">mdi-chart-line-variant</v-icon>
                <p class="no-data-text">No stocks in this watchlist</p>
                <button @click="addscript = true" class="add-stocks-btn">
                    <v-icon left size="16">mdi-plus</v-icon>
                    Add Stocks
                </button>
            </div>

            <!-- Stock Items -->
            <div v-else-if="watchlistdata && watchlistdata.length > 0" class="stocks-container watchlist-scroll"
                ref="stocksContainer" v-watchlist-scroll @wheel="handleWheelScroll" @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave">
                <draggable v-model="watchlistdata" @start="onDragStart" @end="onDragEnd"
                    :item-key="(item) => item.token || item.id || Math.random()" :disabled="isPreDefinedWatchlist"
                    handle=".drag-handle">
                    <template #item="{ element: item, index }">
                        <div :key="item.token || item.id || index" class="stock-item" @click="openStockDetails(item)"
                            @contextmenu.prevent="showContextMenu($event, item, index)">
                            <!-- Stock Info -->
                            <div class="stock-info">
                                <div class="stock-header">
                                    <div class="stock-left">
                                        <span class="stock-symbol">{{ item.tsyms || item.tsym }}</span>
                                        <div class="stock-meta">
                                            <span class="exchange-badge"
                                                :class="`exchange-${item.exch?.toLowerCase()}`">
                                                {{ item.exch }}
                                            </span>
                                            <span v-if="item.exp" class="expiry-info">{{ item.exp }}</span>
                                        </div>
                                    </div>

                                    <div class="stock-right">
                                        <div class="price-section">
                                            <span class="price-value" :id="`${item.token}ltp`">
                                                ₹{{ item.ltp || '0.00' }}
                                            </span>
                                            <div class="price-change">
                                                <span class="change-value" :class="getPriceChangeClass(item.ch)"
                                                    :id="`${item.token}ch`">
                                                    {{ formatPriceChange(item.ch) }}
                                                </span>
                                                <span class="change-percent" :class="getPriceChangeClass(item.chp)"
                                                    :id="`${item.token}chp`">
                                                    ({{ formatPercentageChange(item.chp) }})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Drag Handle (only for custom watchlists) -->
                            <div v-if="!isPreDefinedWatchlist" class="drag-handle">
                                <v-icon size="16" color="grey lighten-1">mdi-drag-vertical</v-icon>
                            </div>

                            <!-- Holdings Badge -->
                            <div v-if="getHoldingsBadge(item.token)" v-html="getHoldingsBadge(item.token)"
                                class="holdings-badge">
                            </div>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

        <!-- Search Results Overlay -->
        <div v-if="search && items && items.length > 0" class="search-results-overlay">
            <div class="search-results">
                <div v-for="(item, index) in items" :key="index" @click="addToWatchlist(item, index)"
                    class="search-result-item">
                    <div class="result-info">
                        <span class="result-symbol">{{ item.tsyms || item.tsym }}</span>
                        <span class="result-exchange">{{ item.exch }}</span>
                    </div>
                    <v-icon v-if="item.watchlist" color="success" size="20">mdi-check</v-icon>
                    <v-icon v-else color="primary" size="20">mdi-plus</v-icon>
                </div>
            </div>
        </div>

        <!-- Create Watchlist Dialog -->
        <v-dialog v-model="createMWdialog" max-width="400">
            <v-card>
                <v-card-title>Create New Watchlist</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newWatchlistName" label="Watchlist Name" outlined dense
                        :rules="[v => !!v || 'Name is required']"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="createMWdialog = false" text>Cancel</v-btn>
                    <v-btn @click="createWatchlist" color="primary" :disabled="!newWatchlistName">
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Watchlist Dialog -->
        <v-dialog v-model="deleteMWdialog" max-width="400">
            <v-card>
                <v-card-title>Delete Watchlist</v-card-title>
                <v-card-text>
                    Are you sure you want to delete "{{ watchlistToDelete }}" watchlist?
                    This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteMWdialog = false" text>Cancel</v-btn>
                    <v-btn @click="deleteWatchlist" color="error">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Context Menu -->
        <v-menu v-model="contextMenu.show" :position-x="contextMenu.x" :position-y="contextMenu.y" absolute offset-y>
            <v-list dense>
                <v-list-item @click="removeFromWatchlist(contextMenu.item, contextMenu.index)">
                    <v-list-item-icon>
                        <v-icon color="error">mdi-delete</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Remove from Watchlist</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openStockDetails(contextMenu.item)">
                    <v-list-item-icon>
                        <v-icon>mdi-chart-line</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import { getMwatchlistset, getGloabSearch, getMHoldingdata, getPreDefinedMW, getClientDetails } from '../../components/mixins/getAPIdata.js'
import { mynturl, myntappurl, params } from '../../apiurl.js'
import draggable from 'vuedraggable'
import { dragscroll } from 'vue-dragscroll'

// Register draggable component
const components = {
    draggable
}

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const sessionStore = useSessionStore()

// Reactive data
const addscript = ref(false)
const watchsecti = ref(false)
const searchloading = ref(false)
const isLoading = ref(true)
const wsListenerAdded = ref(false)
const stocksContainer = ref(null)
const isHoveringWatchlist = ref(false)
let lastScrollTop = 0
let cachedScrollInfo = null

// Watchlist data
const watchlist = ref(['Millionaire'])
const watchlistis = ref('Millionaire')
const watchlistdata = ref([])
// Cache last known prices to avoid flashing 0.00 when WS sends sparse/partial ticks
const priceCache = ref({})
// Persist a per-token merged quote so we can update only keys provided in each tick
const lastState = ref({})
// Cache complete watchlist data for fallback when WebSocket doesn't update
const watchlistDataCache = ref({}) // { watchlistName: { data: [], timestamp: number } }

const mergeTick = (token, patch) => {
    const prev = lastState.value[token] || {}
    const out = { ...prev }

    // Normalize numbers
    const num = (v) => {
        const n = parseFloat(v)
        return isFinite(n) ? n : undefined
    }

    const ltp = num(patch.ltp ?? patch.lp ?? patch.l)
    const prevClose = num(patch.c ?? patch.prev_close_price ?? patch.close)
    const chIn = num(patch.ch)
    const chpIn = num(patch.chp)

    if (typeof ltp !== 'undefined') out.ltp = ltp
    if (typeof prevClose !== 'undefined') out.prevClose = prevClose
    if (typeof chIn !== 'undefined') out.ch = chIn
    if (typeof chpIn !== 'undefined') out.chp = chpIn

    // Derive missing values
    if (typeof out.ch === 'undefined' && typeof out.ltp !== 'undefined' && typeof out.prevClose !== 'undefined') {
        out.ch = out.ltp - out.prevClose
    }
    if (typeof out.chp === 'undefined' && typeof out.ch !== 'undefined' && typeof out.prevClose !== 'undefined' && out.prevClose > 0) {
        out.chp = (out.ch / out.prevClose) * 100
    }

    lastState.value[token] = out
    return out
}
const PreMWlist = ref([
    { key: "MY:HOLDINGS", text: "My stocks" },
    { key: "NIFTY50:NSE", text: "Nifty50" },
    { key: "NIFTYBANK:NSE", text: "Bank Nifty" },
    { key: "SENSEX:BSE", text: "Sensex" },
])
const PreDefinedMW = ref({})
const watchdraglist = ref('')

// Search data
const search = ref('')
const items = ref([])
const model = ref(null)

// Dialog states
const createMWdialog = ref(false)
const deleteMWdialog = ref(false)
const newWatchlistName = ref('')
const watchlistToDelete = ref('')

// Context menu
const contextMenu = ref({
    show: false,
    x: 0,
    y: 0,
    item: null,
    index: null
})

// Computed
const uid = computed(() => authStore.uid)
const mtoken = computed(() => authStore.mtoken)
const isPreDefinedWatchlist = computed(() => {
    return ['MY:HOLDINGS', 'NIFTY50:NSE', 'NIFTYBANK:NSE', 'SENSEX:BSE'].includes(watchlistis.value)
})

// Methods
const ensureSessionReady = async () => {

    // Check if mynturl is loaded
    if (!mynturl.myntapi || !mynturl.stat) {

        // Try to load from sessionStorage
        if (uid.value) {
            const loaded = sessionStore.loadMyntUrl(uid.value)
            if (loaded) {
                return true
            }
        }

        // If still not loaded, check if we can use myntappurl as fallback
        if (params && myntappurl.myntapi) {
            // Temporarily populate mynturl with myntappurl data
            mynturl.myntapi = myntappurl.myntapi
            mynturl.wss = myntappurl.wss
            mynturl.source = myntappurl.source
            mynturl.stat = 1
            return true
        }

        // If still not available, show error
        console.error("❌ No API URL available, session may not be ready")
        appStore.showSnackbar(0, "Session not ready. Please wait or refresh the page.")
        return false
    }

    // Verify authentication tokens are present
    const suid = uid.value || sessionStorage.getItem('userid')
    const stok = mtoken.value || sessionStorage.getItem('msession')
    if (!suid || !stok) {
        return false
    }
    return true
}

const getExchangeColor = (exch) => {
    const colors = {
        'NSE': '#E6EBFFCC',
        'BSE': '#D4F0F0CC',
        'NFO': '#EAD6FFCC',
        'BFO': '#FFD6D6CC',
        'CDS': '#D4FBFFCC',
        'NCOM': '#FFF9C4CC',
        'BCOM': '#FFE6CCCC',
        'BCD': '#F2E1C3CC',
        'MCX': '#FFF0B3CC'
    }
    return colors[exch] || '#EBDDEFCC'
}

const getPriceChangeColor = (change) => {
    if (!change) return ''
    const num = parseFloat(change)
    if (num > 0) return 'success--text'
    if (num < 0) return 'error--text'
    return ''
}

const formatPriceChange = (change) => {
    if (!change) return '0.00'
    const num = parseFloat(change)
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
}

const formatPercentage = (percentage) => {
    if (!percentage) return '0.00'
    const num = parseFloat(percentage)
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
}

const getPriceChangeClass = (value) => {
    if (!value) return 'neutral'
    const numValue = parseFloat(value)
    if (numValue > 0) return 'positive'
    if (numValue < 0) return 'negative'
    return 'neutral'
}

const formatPercentageChange = (value) => {
    if (!value) return '0.00%'
    const numValue = parseFloat(value)
    const formatted = numValue > 0 ? `+${numValue.toFixed(2)}` : numValue.toFixed(2)
    return `${formatted}%`
}

// Search timeout ref for debouncing
let searchTimeout = null

const searchScript = async () => {
    if (!search.value || search.value.length < 2) {
        items.value = []
        addscript.value = false
        if (searchTimeout) {
            clearTimeout(searchTimeout)
            searchTimeout = null
        }
        return
    }

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // Debounce search by 500ms
    searchTimeout = setTimeout(async () => {
        await performSearch()
    }, 500)
}

const performSearch = async () => {
    if (!search.value || search.value.length < 2) {
        items.value = []
        addscript.value = false
        return
    }

    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    addscript.value = true
    searchloading.value = true
    try {
        // Build query string in the same format as old code
        const searchText = search.value.replace("&", "%26")
        // Get client details if available (may need to fetch)
        const clientdetails = await getClientDetails().catch(() => ({ exarr: [] }))
        const fil = clientdetails?.exarr || []
        const cat = "" // Default category for EQ
        const opt = false // Default option search off

        const query = `jData={"uid":"${uid.value}","stext":"${searchText}","fil":${JSON.stringify(fil)},"cat":"${cat}","opt":"${opt}"}&jKey=${mtoken.value}`

        const res = await getGloabSearch(query)

        if (res && res.stat === "Ok" && res.values && res.values.length > 0) {
            // Process items similar to old code
            const allitems = res.values

            // Mark items already in watchlist
            if (Array.isArray(watchlistdata.value)) {
                allitems.forEach((so) => {
                    if (watchlistdata.value.some(o => o.token === so.token)) {
                        so["watchlist"] = true
                    }

                    // Process NFO/BFO options similar to old code
                    if (["NFO", "BFO"].includes(so.exch)) {
                        const ser = so.tsym.includes("SENSEX") ? so.dname.split(" ") : so.tsym.split(/(\d+)/)
                        so["tsyms"] = ser[0]
                        so["exp"] = so.instname.includes("FUT")
                            ? "FUT"
                            : so.instname.includes("OPT")
                                ? `${ser[5] || ser[3] || ""} ${ser[4]}${so.tsym.includes("SENSEX") || ser[4]?.includes("E") ? "" : "E"}` : ""
                        so["ser"] = so.instname.includes("OPT")
                            ? `${ser[1]} ${ser[2]} ${ser[5] ? ser[3] : ""}`
                            : `${ser[1]} ${ser[2].slice(0, 3)} ${ser[3] && ser[3] !== "FUT" ? ser[3] : ""}`
                    }
                })
            }

            items.value = allitems
        } else {
            items.value = []
        }
    } catch (error) {
        console.error('Search error:', error)
        appStore.showSnackbar(0, 'Search failed')
        items.value = []
    } finally {
        searchloading.value = false
    }
}

const addToWatchlist = async (item, index) => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    if (item.watchlist) {
        // Remove from watchlist
        await removeFromWatchlist(item, -1)
        items.value[index].watchlist = false
    } else {
        // Add to watchlist
        try {
            const res = await getMwatchlistset(
                `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${item.exch}|${item.token}"}&jKey=${mtoken.value}`,
                "AddMultiScripsToMW"
            )

            if (res.stat === "Ok") {
                appStore.showSnackbar(1, `${item.tsym} added to watchlist`)
                items.value[index].watchlist = true
                await getMWlistdata() // Refresh watchlist data
            } else {
                appStore.showSnackbar(0, res.emsg || 'Failed to add to watchlist')
            }
        } catch (error) {
            console.error('Add to watchlist error:', error)
            appStore.showSnackbar(0, 'Failed to add to watchlist')
        }
    }
}

const selectWatchlist = async (wl) => {
    watchlistis.value = wl

    // Check if it's a predefined watchlist
    if (PreMWlist.value.find(p => p.key === wl)) {
        await setPDwatchlist()
    } else {
        await getMWlistdata()
    }
}

// Handle predefined watchlists
const setPDwatchlist = async () => {
    try {
        isLoading.value = true

        // First try to load from cache for immediate display
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            // Restore price states from lastState cache
            cached.forEach(item => {
                if (item.token && lastState.value[item.token]) {
                    const state = lastState.value[item.token]
                    item.ltp = state.ltp !== undefined ? state.ltp.toFixed(2) : (item.ltp || null)
                    item.ch = state.ch !== undefined ? state.ch.toFixed(2) : (item.ch || null)
                    item.chp = state.chp !== undefined ? state.chp.toFixed(2) : (item.chp || null)
                }
            })
            ensureUniqueIds()
        }

        // Unsubscribe from previous WebSocket data
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
        }

        if (watchlistis.value === "MY:HOLDINGS") {
            const holdingsData = getMHoldingdata()
            if (holdingsData && holdingsData.length > 0) {
                watchlistdata.value = []
                holdingsData.forEach(holding => {
                    if (holding.exch_tsym && holding.exch_tsym[0]) {
                        const item = holding.exch_tsym[0]
                        // Initialize price fields
                        if (!item.ltp && item.ltp !== 0) item.ltp = null
                        if (!item.ch && item.ch !== 0) item.ch = null
                        if (!item.chp && item.chp !== 0) item.chp = null

                        // Restore cached prices if available
                        if (item.token && lastState.value[item.token]) {
                            const state = lastState.value[item.token]
                            if (state.ltp !== undefined) item.ltp = state.ltp.toFixed(2)
                            if (state.ch !== undefined) item.ch = state.ch.toFixed(2)
                            if (state.chp !== undefined) item.chp = state.chp.toFixed(2)
                        }

                        watchlistdata.value.push(item)
                    }
                })
            } else {
                // Keep cached if available, otherwise show no data
                if (!cached || !Array.isArray(cached) || cached.length === 0) {
                    watchlistdata.value = "no data"
                }
            }
        } else if (["NIFTY50:NSE", "NIFTYBANK:NSE", "SENSEX:BSE"].includes(watchlistis.value)) {
            if (PreDefinedMW.value.stat !== "Ok") {
                PreDefinedMW.value = await getPreDefinedMW()
            }
            if (PreDefinedMW.value[watchlistis.value]) {
                const items = PreDefinedMW.value[watchlistis.value]
                // Initialize price fields for all items
                if (Array.isArray(items)) {
                    watchlistdata.value = []
                    items.forEach(item => {
                        if (!item.ltp && item.ltp !== 0) item.ltp = null
                        if (!item.ch && item.ch !== 0) item.ch = null
                        if (!item.chp && item.chp !== 0) item.chp = null

                        // Restore cached prices if available
                        if (item.token && lastState.value[item.token]) {
                            const state = lastState.value[item.token]
                            if (state.ltp !== undefined) item.ltp = state.ltp.toFixed(2)
                            if (state.ch !== undefined) item.ch = state.ch.toFixed(2)
                            if (state.chp !== undefined) item.chp = state.chp.toFixed(2)
                        }

                        watchlistdata.value.push(item)
                    })
                }
            } else {
                // Keep cached if available, otherwise show no data
                if (!cached || !Array.isArray(cached) || cached.length === 0) {
                    watchlistdata.value = "no data"
                }
            }
        }

        // Ensure unique IDs for draggable
        ensureUniqueIds()

        // Save to cache after loading
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }

        // Subscribe to WebSocket updates
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
            // Delayed re-subscribe after refresh/socket warm-up
            setTimeout(() => {
                const ev = new CustomEvent('web-scoketOn', {
                    detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                })
                window.dispatchEvent(ev)
            }, 1200)
        } else {
        }

        PreDefinedMW.value.is = true
    } catch (error) {
        console.error('Set predefined watchlist error:', error)
        // Try to keep cached data on error
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (!cached || !Array.isArray(cached) || cached.length === 0) {
            watchlistdata.value = 'no data'
        }
    } finally {
        isLoading.value = false
    }
}

const createWatchlist = async () => {
    if (!newWatchlistName.value) return

    if (watchlist.value.includes(newWatchlistName.value)) {
        appStore.showSnackbar(0, 'Watchlist name already exists')
        return
    }

    try {
        // For now, just add to local array - can be enhanced with API call later
        watchlist.value.unshift(newWatchlistName.value)
        watchlistis.value = newWatchlistName.value
        saveWatchlistsToLocalStorage()

        appStore.showSnackbar(1, `${newWatchlistName.value} watchlist created`)

        createMWdialog.value = false
        newWatchlistName.value = ''

        // Load data for new watchlist
        await getMWlistdata()
    } catch (error) {
        console.error('Create watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to create watchlist')
    }
}

const confirmDeleteWatchlist = (wl) => {
    watchlistToDelete.value = wl
    deleteMWdialog.value = true
}

const deleteWatchlist = async () => {
    try {
        const index = watchlist.value.indexOf(watchlistToDelete.value)
        if (index > -1) {
            watchlist.value.splice(index, 1)
            saveWatchlistsToLocalStorage()

            // Switch to first available watchlist
            if (watchlistis.value === watchlistToDelete.value) {
                watchlistis.value = watchlist.value[0] || 'Millionaire'
                if (watchlist.value.length === 0) {
                    watchlist.value = ['Millionaire']
                    watchlistis.value = 'Millionaire'
                }
                await getMWlistdata()
            }

            appStore.showSnackbar(1, `${watchlistToDelete.value} watchlist deleted`)
        }
    } catch (error) {
        console.error('Delete watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to delete watchlist')
    } finally {
        deleteMWdialog.value = false
        watchlistToDelete.value = ''
    }
}

const showContextMenu = (event, item, index) => {
    event.preventDefault()
    contextMenu.value = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        item,
        index
    }
}

const removeFromWatchlist = async (item, index) => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    try {
        const res = await getMwatchlistset(
            `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${item.exch}|${item.token}"}&jKey=${mtoken.value}`,
            "DeleteMultiMWScrips"
        )

        if (res.stat === "Ok") {
            if (index >= 0) {
                watchlistdata.value.splice(index, 1)
            } else {
                // Find and remove by token
                const idx = watchlistdata.value.findIndex(w => w.token === item.token)
                if (idx >= 0) {
                    watchlistdata.value.splice(idx, 1)
                }
            }

            appStore.showSnackbar(1, `${item.tsym || item.tsyms} removed from watchlist`)
        } else {
            appStore.showSnackbar(0, res.emsg || 'Failed to remove from watchlist')
        }
    } catch (error) {
        console.error('Remove from watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to remove from watchlist')
    } finally {
        contextMenu.value.show = false
    }
}

const openStockDetails = (item) => {
    if (uid.value && item) {

        // Store the stock data for the details page
        localStorage.setItem('ssdtsym', `${item.exch}:${item.token}`)
        localStorage.setItem('ssdtoken', item.token)
        localStorage.setItem('stockDetailsData', JSON.stringify({
            token: item.token,
            exch: item.exch,
            tsym: item.tsym || item.tsyms,
            ltp: item.ltp
        }))

        // Check if we're already on the stock details page
        const currentPath = window.location.pathname
        if (currentPath === '/stocks/details') {
            // If already on stock details page, emit ssd-event to update chart
            const event = new CustomEvent('ssd-event', {
                detail: {
                    type: 'chart',
                    token: item.token,
                    exch: item.exch,
                    tsym: item.tsym || item.tsyms
                }
            })
            window.dispatchEvent(event)
        } else {
            // Navigate to stock details page
            router.push({
                name: 'stocks details',
                query: {
                    token: item.token,
                    exch: item.exch,
                    tsym: item.tsym || item.tsyms
                }
            })
        }
    } else {
    }
}

const saveWatchlistsToLocalStorage = () => {
    if (uid.value) {
        localStorage.setItem(`${uid.value}_watchlists`, JSON.stringify(watchlist.value))
    }
}

// Drag and Drop Methods
const onDragStart = () => {
    if (!isPreDefinedWatchlist.value) {
        watchdraglist.value = watchlistdata.value.map(s => `${s.exch}|${s.token}#`).join("")
    }
}

const onDragEnd = async () => {
    if (!isPreDefinedWatchlist.value) {
        try {
            const currentOrder = watchlistdata.value.map(s => `${s.exch}|${s.token}#`).join("")

            // Delete current order
            const deleteRes = await getMwatchlistset(
                `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${watchdraglist.value}"}&jKey=${mtoken.value}`,
                "DeleteMultiMWScrips"
            )

            if (deleteRes && deleteRes.stat === "Ok") {
                // Add in new order
                const addRes = await getMwatchlistset(
                    `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${currentOrder}"}&jKey=${mtoken.value}`,
                    "AddMultiScripsToMW"
                )

                if (!(addRes && addRes.stat === "Ok")) {
                    appStore.showSnackbar(0, 'Reorder failed. Please try again.')
                    await getMWlistdata() // Refresh to original order
                }
            } else {
                appStore.showSnackbar(0, 'Reorder failed. Please try again.')
                await getMWlistdata() // Refresh to original order
            }
        } catch (error) {
            console.error('Drag end error:', error)
            appStore.showSnackbar(0, 'Reorder failed. Please try again.')
            await getMWlistdata() // Refresh to original order
        }
    }
}

// Holdings Badge Method
const getHoldingsBadge = (token) => {
    try {
        const holdingsData = getMHoldingdata()
        if (!holdingsData?.length) return null

        const holding = holdingsData.find(x => x.token == token)
        const netqty = holding?.netqty || null

        if (netqty > 0) {
            return `<span style="border-radius: 4px; padding: 0px 6px; background-color: var(--secbg) !important"
                        class="mr-1 table-hov-prd d-inline-flex align-center">
                        <img width="13px" src="/src/assets/suitcase.svg" />
                        <span class="font-weight-medium fs-12 pl-1 pt-1 primary--text">${netqty}</span>
                    </span>`
        }
        return null
    } catch (error) {
        console.error('Holdings badge error:', error)
        return null
    }
}

// Cache management functions
const saveWatchlistToCache = (watchlistName, data) => {
    if (!watchlistName || !data) return

    try {
        // Save to memory cache
        watchlistDataCache.value[watchlistName] = {
            data: JSON.parse(JSON.stringify(data)), // Deep copy
            timestamp: Date.now()
        }

        // Also save to localStorage for persistence across sessions
        if (uid.value) {
            const cacheKey = `${uid.value}_watchlist_cache_${watchlistName}`
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }))
        }
    } catch (error) {
        console.error('Error saving watchlist to cache:', error)
    }
}

const loadWatchlistFromCache = (watchlistName) => {
    if (!watchlistName) return null

    try {
        // First check memory cache
        if (watchlistDataCache.value[watchlistName] && watchlistDataCache.value[watchlistName].data) {
            return JSON.parse(JSON.stringify(watchlistDataCache.value[watchlistName].data)) // Deep copy
        }

        // Then check localStorage
        if (uid.value) {
            const cacheKey = `${uid.value}_watchlist_cache_${watchlistName}`
            const cached = localStorage.getItem(cacheKey)
            if (cached) {
                const parsed = JSON.parse(cached)
                // Cache is valid if less than 24 hours old
                if (parsed && parsed.data && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
                    // Restore to memory cache
                    watchlistDataCache.value[watchlistName] = parsed
                    return JSON.parse(JSON.stringify(parsed.data)) // Deep copy
                }
            }
        }
    } catch (error) {
        console.error('Error loading watchlist from cache:', error)
    }

    return null
}

// Ensure each watchlist item has a unique identifier
const ensureUniqueIds = () => {
    if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
        watchlistdata.value.forEach((item, index) => {
            if (!item.id && !item.token) {
                item.id = `item_${index}_${Date.now()}`
            }
        })
    }
}

const loadWatchlistsFromLocalStorage = () => {
    if (uid.value) {
        const stored = localStorage.getItem(`${uid.value}_watchlists`)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                if (Array.isArray(data) && data.length > 0) {
                    watchlist.value = data
                    watchlistis.value = data[0]
                    return true
                }
            } catch (error) {
                console.error('Error loading watchlists from localStorage:', error)
            }
        }
    }
    return false
}

const getWatchlist = async () => {
    try {
        // First try localStorage
        if (loadWatchlistsFromLocalStorage()) {
            // Ensure session is ready before making API calls even from localStorage
            if (await ensureSessionReady()) {
                await getMWlistdata()
            } else {
                watchlistdata.value = 'no data'
                isLoading.value = false
            }
            return
        }


        // Ensure session is ready before making API calls
        if (!(await ensureSessionReady())) {
            // Initialize with default if session not ready
            watchlist.value = ['Millionaire']
            watchlistis.value = 'Millionaire'
            saveWatchlistsToLocalStorage()
            watchlistdata.value = 'no data'
            isLoading.value = false
            return
        }

        // If no localStorage data, try API
        const res = await getMwatchlistset(
            `jData={"uid":"${uid.value}","actid":"${uid.value}"}&jKey=${mtoken.value}`,
            "MWList"
        )

        if (res && res.values && res.values.length > 0 && res.stat === "Ok") {
            watchlist.value = res.values.sort((a, b) => a.localeCompare(b))
            watchlistis.value = watchlist.value[0]
            saveWatchlistsToLocalStorage()
        } else {
            // Initialize with default
            watchlist.value = ['Millionaire']
            watchlistis.value = 'Millionaire'
            saveWatchlistsToLocalStorage()
        }

        await getMWlistdata()
    } catch (error) {
        console.error('Get watchlist error:', error)
        watchlist.value = ['Millionaire']
        watchlistis.value = 'Millionaire'
        saveWatchlistsToLocalStorage()
        await getMWlistdata()
    } finally {
        isLoading.value = false
    }
}

const getMWlistdata = async () => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        // Try to load from cache if session not ready
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            isLoading.value = false
            return
        }
        watchlistdata.value = 'no data'
        isLoading.value = false
        return
    }

    isLoading.value = true

    try {
        // First, try to load from cache for immediate display
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            // Restore price states from lastState cache
            cached.forEach(item => {
                if (item.token && lastState.value[item.token]) {
                    const state = lastState.value[item.token]
                    item.ltp = state.ltp !== undefined ? state.ltp.toFixed(2) : (item.ltp || null)
                    item.ch = state.ch !== undefined ? state.ch.toFixed(2) : (item.ch || null)
                    item.chp = state.chp !== undefined ? state.chp.toFixed(2) : (item.chp || null)
                }
            })
            ensureUniqueIds()
        }

        // Unsubscribe from previous WebSocket data
        if (watchlistdata.value && typeof watchlistdata.value == "object") {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
        }

        let res = await getMwatchlistset(`jData={"uid":"${uid.value}","wlname":"${watchlistis.value}"}&jKey=${mtoken.value}`, "MarketWatch");

        if (res && res.values && res.values.length > 0 && res.stat == "Ok") {
            isLoading.value = false;
            let wl = res.values;
            // Clear current data and rebuild
            watchlistdata.value = []

            for (let l = 0; l < wl.length; l++) {
                wl[l]["id"] = l + 1;
                if (wl[l].exch == "NFO" || wl[l].exch == "BFO") {
                    wl[l]["ser"] = wl[l].tsym.includes("SENSEX") ? wl[l].dname.split(" ") : wl[l].tsym.split(/(\d+)/);
                    wl[l]["tsyms"] = wl[l].ser[0];
                    wl[l]["exp"] = wl[l].instname.includes("FUT") ? "FUT" : wl[l].instname.includes("OPT") ? `${wl[l].ser[5] ? wl[l].ser[5] : wl[l].ser[3] ? wl[l].ser[3] : ""} ${wl[l].ser[4] ? wl[l].ser[4] : ""}${wl[l].ser[4] && wl[l].ser[4].includes("E") ? "" : "E"}` : "";
                    wl[l].ser = wl[l].instname.includes("OPT") ? `${wl[l].ser[1]} ${wl[l].ser[2]} ${wl[l].ser[5] ? wl[l].ser[3] : ""}` : `${wl[l].ser[1]} ${wl[l].ser[2].slice(0, 3)} ${wl[l].ser[3] && wl[l].ser[3] != "FUT" ? wl[l].ser[3] : ""}`;
                }
                // Initialize price fields to prevent showing zeros
                if (!wl[l].ltp && wl[l].ltp !== 0) wl[l].ltp = null;
                if (!wl[l].ch && wl[l].ch !== 0) wl[l].ch = null;
                if (!wl[l].chp && wl[l].chp !== 0) wl[l].chp = null;

                // Restore cached prices if available
                if (wl[l].token && lastState.value[wl[l].token]) {
                    const state = lastState.value[wl[l].token]
                    if (state.ltp !== undefined) wl[l].ltp = state.ltp.toFixed(2)
                    if (state.ch !== undefined) wl[l].ch = state.ch.toFixed(2)
                    if (state.chp !== undefined) wl[l].chp = state.chp.toFixed(2)
                }

                watchlistdata.value.push(wl[l]);
            }

            // Ensure unique IDs for draggable
            ensureUniqueIds()

            // Save to cache after successful load
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)

            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
            // this.setMWfilter();
            // Also re-subscribe after a short delay to handle page refreshes
            setTimeout(() => {
                const ev = new CustomEvent('web-scoketOn', {
                    detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                })
                window.dispatchEvent(ev)
            }, 1200)
        } else {
            isLoading.value = false;
            // If API fails, keep cached data if available
            if (!cached || !Array.isArray(cached) || cached.length === 0) {
                watchlistdata.value = "no data";
            }
            // eventBus.$emit('snack-event', 2, res.emsg ? res.emsg : 'no data');
        }
    } catch (error) {
        console.error('Get watchlist data error:', error)
        // On error, try to keep cached data
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (!cached || !Array.isArray(cached) || cached.length === 0) {
            watchlistdata.value = 'no data'
        }
    } finally {
        isLoading.value = false
    }
}

// WebSocket data update handler
const handleWebSocketUpdate = (event) => {
    const detail = event.detail

    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail

        if (data && watchlistdata.value && Array.isArray(watchlistdata.value)) {
            // Handle different data formats
            if (data.t === 'dk' || data.t === 'df') {
                // Direct WebSocket feed format
                updateWatchlistDataFromWebSocket(data)
            } else if (data.tk || data.token) {
                // Processed quote format
                updateWatchlistData(data)
            }
        }
    }
}

const updateWatchlistDataFromWebSocket = (wsData) => {
    // Map WebSocket field names to our data structure
    const token = wsData.tk || wsData.token
    const exchange = wsData.e || wsData.exchange

    if (!token) {
        return
    }

    // Try to find by token and exchange, or just token if exchange doesn't match
    let index = watchlistdata.value.findIndex(item =>
        item.token === token && item.exch === exchange
    )

    // If not found with exchange match, try just token
    if (index < 0) {
        index = watchlistdata.value.findIndex(item => item.token === token)
    }

    if (index >= 0) {
        const merged = mergeTick(token, wsData)

        // Save to simple cache for legacy use
        if (isFinite(merged.ltp)) {
            priceCache.value[token] = {
                ltp: merged.ltp,
                ch: merged.ch ?? 0,
                chp: merged.chp ?? 0
            }
        }

        // Update only provided keys
        const current = { ...watchlistdata.value[index] }
        if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2)
        watchlistdata.value[index] = { ...watchlistdata.value[index], ...current }

        updateDOMElements(token, {
            ltp: current.ltp ?? watchlistdata.value[index].ltp ?? '0.00',
            ch: current.ch ?? watchlistdata.value[index].ch ?? '0.00',
            chp: current.chp ?? watchlistdata.value[index].chp ?? '0.00'
        })

        // Update cache after WebSocket update
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }
    }
}

const updateWatchlistData = (data) => {

    const token = data.token || data.tk
    const index = watchlistdata.value.findIndex(item => item.token === token)

    if (index >= 0) {
        const merged = mergeTick(token, data)

        // cache
        if (isFinite(merged.ltp)) {
            priceCache.value[token] = {
                ltp: merged.ltp,
                ch: merged.ch ?? 0,
                chp: merged.chp ?? 0
            }
        }

        const current = { ...watchlistdata.value[index] }
        if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2)
        watchlistdata.value[index] = { ...watchlistdata.value[index], ...current }

        updateDOMElements(token, {
            ltp: current.ltp ?? watchlistdata.value[index].ltp ?? '0.00',
            ch: current.ch ?? watchlistdata.value[index].ch ?? '0.00',
            chp: current.chp ?? watchlistdata.value[index].chp ?? '0.00'
        })

        // Update cache after WebSocket update
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }
    }
}

const updateDOMElements = (token, prices) => {
    // Update DOM elements directly for better performance
    const ltpElement = document.getElementById(`${token}ltp`)
    const chElement = document.getElementById(`${token}ch`)
    const chpElement = document.getElementById(`${token}chp`)

    if (ltpElement) {
        // Update with rupee symbol as per template
        ltpElement.textContent = `₹${prices.ltp}`
    }
    if (chElement) {
        chElement.textContent = formatPriceChange(prices.ch)
        chElement.className = `change-value ${getPriceChangeClass(prices.ch)}`
    }
    if (chpElement) {
        // Template shows ({{ formatPercentageChange(item.chp) }}), so wrap in parentheses
        chpElement.textContent = `(${formatPercentageChange(prices.chp)})`
        chpElement.className = `change-percent ${getPriceChangeClass(prices.chp)}`
    }
}

// Hover scroll functionality (watchlist only)
const handleMouseEnter = () => {
    isHoveringWatchlist.value = true
}

const handleMouseLeave = () => {
    isHoveringWatchlist.value = false
    // Clear cache on mouse leave
    cachedScrollInfo = null
}

// Optimized scroll handler - direct updates for minimal lag
const handleWheelScroll = (event) => {
    if (!stocksContainer.value || !isHoveringWatchlist.value) {
        return
    }

    const container = stocksContainer.value

    // Only recalculate scroll info if scroll position changed significantly or cache invalid
    const currentScrollTop = container.scrollTop
    const needsRecalc = !cachedScrollInfo || Math.abs(currentScrollTop - lastScrollTop) > 10

    if (needsRecalc) {
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight
        const hasScrollableContent = scrollHeight > clientHeight

        cachedScrollInfo = {
            hasScrollableContent,
            scrollHeight,
            clientHeight,
            isAtTop: currentScrollTop <= 1,
            isAtBottom: Math.abs(currentScrollTop + clientHeight - scrollHeight) <= 1
        }
        lastScrollTop = currentScrollTop
    }

    const { hasScrollableContent, isAtTop, isAtBottom } = cachedScrollInfo

    if (hasScrollableContent) {
        // If we can scroll within the container, prevent page scroll and scroll container directly
        if ((event.deltaY > 0 && !isAtBottom) || (event.deltaY < 0 && !isAtTop)) {
            event.preventDefault()
            event.stopPropagation()
            // Direct scroll assignment for immediate response (lower latency than RAF)
            container.scrollTop += event.deltaY
            lastScrollTop = container.scrollTop
            // Update boundary cache after scroll for next event
            cachedScrollInfo.isAtTop = container.scrollTop <= 1
            cachedScrollInfo.isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) <= 1
        } else if ((event.deltaY > 0 && isAtBottom) || (event.deltaY < 0 && isAtTop)) {
            // At boundaries - prevent page scroll when at container limits
            event.preventDefault()
            event.stopPropagation()
        }
    }
}

// Lifecycle
onMounted(async () => {
    // Ensure listener is attached before any subscriptions
    if (!wsListenerAdded.value) {
        window.addEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = true
    }

    // Check if user is logged in
    const sessionStatus = sessionStorage.getItem("c3RhdHVz")
    if (sessionStatus === "dmFsaWR1c2Vy" && uid.value) {
        await getWatchlist()
    } else {
        // If not logged in, show predefined watchlists
        watchlistis.value = "NIFTY50:NSE"
        await setPDwatchlist()
    }

    // Warm-up re-subscribe after refresh to avoid stuck state
    setTimeout(() => {
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const ev = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(ev)
        }
    }, 1200)
})

onUnmounted(() => {
    // Clean up WebSocket subscription
    if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
        const event = new CustomEvent('web-scoketOn', {
            detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
        })
        window.dispatchEvent(event)
    }

    // Remove event listener
    window.removeEventListener('web-scoketConn', handleWebSocketUpdate)

    // Clean up scroll cache
    cachedScrollInfo = null
})

// Start WS and load watchlist immediately after login without refresh
watch([uid, mtoken], async ([newUid, newMtok]) => {
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    if (sessionStatus === 'dmFsaWR1c2Vy' && newUid && newMtok) {
        await getWatchlist()
        if (!wsListenerAdded.value) {
            window.addEventListener('web-scoketConn', handleWebSocketUpdate)
            wsListenerAdded.value = true
        }
    }
})
</script>

<script>
// For Vue 3 compatibility with directives
import { dragscroll } from 'vue-dragscroll'

export default {
    directives: {
        dragscroll
    }
}
</script>

<style scoped>
.watchlist-container {
    padding: 16px;
    max-width: 100%;
}

.watchlist-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    transition: background-color 0.2s;
}

.watchlist-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.watchlist-item:last-child {
    border-bottom: none;
}

.stock-info {
    min-width: 0;
}

.weekly-badge {
    background-color: var(--v-secondary-base);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-left: 4px;
}

.search-results {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
}

.cursor-pointer {
    cursor: pointer;
}

/* Dark theme adjustments */
.theme--dark .watchlist-item {
    border-bottom-color: rgba(255, 255, 255, 0.12);
}

.theme--dark .watchlist-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
}

.theme--dark .search-results {
    border-color: rgba(255, 255, 255, 0.12);
}

/* Drag and Drop Styles */
.drag-handle {
    cursor: grab;
}

.drag-handle:active {
    cursor: grabbing;
}

.sortable-ghost {
    opacity: 0.5;
}

.sortable-chosen {
    background-color: rgba(0, 0, 0, 0.08);
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.fade-leave-active {
    position: absolute;
}

/* Weekly Badge Styling */
.weekly-badge {
    border-radius: 4px;
    padding: 0px 4px;
    background-color: var(--secbg) !important;
    font-weight: 500;
    font-size: 10px;
    line-height: 16px;
}

/* Holdings Badge Styling */
.table-hov-prd {
    transition: all 0.2s ease;
}

/* No scroll styling */
.no-scroll::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

/* Modern Watchlist Styles */
.modern-watchlist {
    padding: 0;
    background: transparent;
}

/* Search Header */
.search-header {
    /* padding: 16px; */
    background: var(--cardbg);
    border-radius: 12px;
    /* margin-bottom: 12px; */
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--secbg);
    border-radius: 30px;
    padding: 10px 16px;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

.search-icon {
    color: var(--subtext) !important;
    margin-right: 12px;
    font-size: 20px !important;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--maintext);
    font-size: 14px;
    font-weight: 400;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.search-input::placeholder {
    color: var(--subtext);
}

.search-loader {
    position: absolute;
    right: 16px;
}

/* Watchlist Tabs */
.watchlist-tabs {
    display: flex;
    align-items: center;
    background: var(--cardbg);
    border-radius: 12px;
    padding: 8px;
    margin-bottom: 16px;
    gap: 8px;
}

.tabs-container {
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    white-space: nowrap;
}

.tabs-container::-webkit-scrollbar {
    display: none;
}

.tabs-scroll {
    display: inline-flex;
    gap: 8px;
    min-width: max-content;
    flex-shrink: 0;
}

.tab-button {
    background: var(--secbg);
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    color: var(--subtext);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: 'Tenon', 'Inter', sans-serif;
    margin: 2px;
}

.tab-button:hover {
    background: var(--secbg);
    color: var(--maintext);
}

.tab-button.active {
    background: black;
    color: white;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.action-btn {
    background: var(--secbg);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--subtext);
}

.action-btn:hover {
    background: var(--primary);
    color: white;
}

/* Stock List */
.stock-list {
    background: var(--cardbg);
    border-radius: 12px;
    overflow: hidden;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 16px;
    color: var(--subtext);
}

.loading-text {
    font-size: 14px;
    font-weight: 500;
}

.no-data-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;
}

.no-data-text {
    color: var(--subtext);
    margin: 16px 0;
    font-size: 14px;
}

.add-stocks-btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.add-stocks-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Stock Items */
.stocks-container {
    padding: 0;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE and Edge */
    scroll-behavior: auto;
    /* Change to auto for better performance during scroll */
    position: relative;
    /* Performance optimizations */
    will-change: scroll-position;
    contain: layout style paint;
    transform: translateZ(0);
    /* Force GPU acceleration */
    -webkit-overflow-scrolling: touch;
    /* Smooth on iOS */
    overscroll-behavior: contain;
    /* Prevent scroll chaining */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.stocks-container::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}

.stock-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    cursor: pointer;
    transition: background-color 0.15s ease;
    /* Only transition background for better performance */
    position: relative;
    contain: layout style paint;
    /* Optimize rendering */
    will-change: background-color;
    /* Optimize hover effect */
    scroll-behavior: smooth;
}

.stock-item:hover {
    background: var(--secbg);
}

.stock-item:last-child {
    border-bottom: none;
}

.stock-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stock-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
}

.stock-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stock-symbol {
    color: var(--maintext);
    font-size: 16px;
    font-weight: 600;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.stock-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.exchange-badge {
    background: var(--secbg);
    color: var(--maintext);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

.exchange-nse {
    background: #e3f2fd;
    color: #1976d2;
}

.exchange-bse {
    background: #fff3e0;
    color: #f57c00;
}

.exchange-mcx {
    background: #f3e5f5;
    color: #7b1fa2;
}

.expiry-info {
    color: var(--subtext);
    font-size: 12px;
}

.stock-right {
    text-align: right;
}

.price-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.price-value {
    color: var(--maintext);
    font-size: 16px;
    font-weight: 600;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.price-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
}

.change-value.positive,
.change-percent.positive {
    color: #35d05d;
}

.change-value.negative,
.change-percent.negative {
    color: #ff5252;
}

.change-value.neutral,
.change-percent.neutral {
    color: var(--subtext);
}

.drag-handle {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: grab;
    padding: 4px;
    border-radius: 4px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.drag-handle:hover {
    opacity: 1;
}

.holdings-badge {
    position: absolute;
    top: 8px;
    right: 8px;
}

/* Search Results Overlay */
.search-results-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
}

.search-results {
    background: var(--cardbg);
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
    cursor: pointer;
    transition: background 0.2s ease;
}

.search-result-item:hover {
    background: var(--secbg);
}

.search-result-item:last-child {
    border-bottom: none;
}

.result-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.result-symbol {
    color: var(--maintext);
    font-size: 14px;
    font-weight: 600;
}

.result-exchange {
    color: var(--subtext);
    font-size: 12px;
}

/* Dark theme adjustments */
.theme--dark .search-container {
    border-color: rgba(255, 255, 255, 0.1);
}

.theme--dark .stock-item {
    border-color: rgba(255, 255, 255, 0.05);
}

.theme--dark .search-result-item {
    border-color: rgba(255, 255, 255, 0.05);
}

/* Light theme adjustments */
.theme--light .search-container {
    border-color: rgba(0, 0, 0, 0.1);
}

.theme--light .stock-item {
    border-color: rgba(0, 0, 0, 0.05);
}

.theme--light .search-result-item {
    border-color: rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
    .search-header {
        padding: 12px;
    }

    .search-container {
        padding: 10px 12px;
    }

    .stock-item {
        padding: 12px;
    }

    .stock-symbol {
        font-size: 14px;
    }

    .price-value {
        font-size: 14px;
    }

    .watchlist-tabs {
        padding: 6px;
    }

    .tab-button {
        padding: 6px 12px;
        font-size: 13px;
    }
}
</style>