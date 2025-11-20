<template>
    <div>
        <v-progress-linear v-if="lwloader" color="primary" indeterminate rounded></v-progress-linear>
        <div ref="chartContainer" id="containerlw" class="chart-container mt-4 mb-2"></div>
        <div>
            <v-chip-group v-model="toggle" mandatory active-class="primary--text" class=""
                @update:model-value="setData(toggle)">
                <v-chip variant="outlined" size="small">1D</v-chip>
                <v-chip variant="outlined" size="small">1W</v-chip>
                <v-chip variant="outlined" size="small">1M</v-chip>
                <v-chip variant="outlined" size="small">1Y</v-chip>
                <v-chip variant="outlined" size="small">YTD</v-chip>
                <v-chip variant="outlined" size="small">MAX</v-chip>
            </v-chip-group>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useTheme } from 'vuetify'
import axios from 'axios'
import { mynturl } from '@/apiurl'
import { createChart } from 'lightweight-charts'

// Props
const props = defineProps({
    propstsym: {
        type: Object,
        required: true,
    },
})

// Vuetify Theme
const theme = useTheme()

// Template refs
const chartContainer = ref(null)

// Reactive data
const symbol = ref({})
const lwloader = ref(true)
const toggle = ref(0)
const userid = ref(null)
const usession = ref(null)

const chart = ref(null)
const lineSeries = ref(null)

const chartdata = ref([])

const law = ref(null)
const isChartActive = ref(true)

// Request management to prevent duplicate API calls
const isLoading = ref(false)
const currentRequest = ref(null) // AbortController for current request
const currentSymbolKey = ref(null) // Track current symbol to prevent duplicate calls
const isInitialized = ref(false) // Track if chart is initialized

// Helper function to generate symbol key for comparison
const getSymbolKey = (sym) => {
    if (!sym || !sym.token || !sym.exch || !sym.tsym) return null
    return `${sym.exch}:${sym.token}:${sym.tsym}`
}

// Methods
const initializeData = async (resolution, init) => {
    // Prevent duplicate calls
    if (isLoading.value) {
        // console.log('API call already in progress, skipping...')
        return
    }

    // Cancel previous request if exists
    if (currentRequest.value) {
        currentRequest.value.abort()
        currentRequest.value = null
    }

    isLoading.value = true
    lwloader.value = false
    chartdata.value = []
    if (lineSeries.value) {
        lineSeries.value.setData(chartdata.value)
    }
    const ep = await getEpochRanges(resolution)
    var raw
    let data
    var inx = symbol.value.instname == "UNDIND" || symbol.value.instname == "COM" ? true : false
    var flow = resolution == "1D" || (resolution == "1W" && !inx) ? true : false
    if (flow) {
        data = `jData={"uid":"${userid.value}","exch":"${symbol.value.exch}","token":"${encodeURIComponent(symbol.value.tsym)}","st":"${ep.to}","et":"${ep.fr}","intrv":"${resolution == "1D" ? 1 : 5}"}&jKey=${usession.value}`
    } else {
        data = `jData={"sym":"${symbol.value.exch}:${encodeURIComponent(symbol.value.tsym)}","from":"${ep.to}","to":"${ep.fr}"}&jKey=${usession.value}`
    }

    // Create AbortController for this request
    const abortController = new AbortController()
    currentRequest.value = abortController

    let config = {
        method: "post",
        url: `${mynturl.myntapi}${flow ? "TPSeries" : "EODChartData"}`,
        headers: {
            "Content-Type": "text/plain",
        },
        data: data,
        signal: abortController.signal, // Add signal for cancellation
    }

    try {
        const response = await axios.request(config)
        raw = flow ? response.data : response.data.map(JSON.parse)
        if (raw && raw.length > 0) {
            raw = raw.sort((a, b) => parseFloat(a.ssboe) - parseFloat(b.ssboe))
            const newChartData = []
            for (var i = 0; i < raw.length; i++) {
                var r = {
                    time: flow ? setEpoch(raw[i].ssboe) : convertToExpectedFormat(raw[i].time),
                    value: flow ? Number(raw[i].intvwap) : Number(raw[i].intc)
                }
                newChartData.push(r)
            }
            chartdata.value = newChartData
            if (lineSeries.value) {
                lineSeries.value.setData(chartdata.value)
            }
            law.value = convertToExpectedFormat(new Date())
            if (isChartActive.value && chart.value) {
                chart.value.timeScale().fitContent()
            }
            lwloader.value = false
        }

        if (init && resolution == "1D" && raw && raw.emsg && raw.emsg.includes('no data')) {
            setData(1)
            toggle.value = 1
        }
        isLoading.value = false
        currentRequest.value = null
    } catch (error) {
        // Don't log error if request was aborted
        // Axios uses 'canceled' message for aborted requests
        if (error.name !== 'CanceledError' && error.message !== 'canceled' && !abortController.signal.aborted) {
            // console.error('Error loading chart data:', error)
        }
        lwloader.value = false
        isLoading.value = false
        currentRequest.value = null
    }
}

const convertToExpectedFormat = (dateTimeString) => {
    let date = new Date(dateTimeString)
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, "0")
    let day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`
    return formattedDate
}

const setData = (range) => {
    if (lineSeries.value) {
        const resolution = range == 0 ? "1D" : range == 1 ? "1W" : range == 2 ? "1M" : range == 3 ? "1Y" : range == 4 ? "YTD" : range == 5 ? "MAX" : range
        initializeData(resolution, false)
    }
}

const getEpochRanges = (range) => {
    const now = new Date()
    const toEpoch = (date) => Math.floor(date.getTime() / 1000)

    const ranges = {
        "1D": toEpoch(new Date(new Date().setHours(0, 0, 0, 0))),
        "1W": toEpoch(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
        "1M": toEpoch(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())),
        "1Y": toEpoch(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())),
        YTD: toEpoch(new Date(now.getFullYear(), 0, 1)),
        MAX: toEpoch(new Date(1970, 0, 1)),
    }

    return {
        fr: toEpoch(now),
        to: ranges[range] || null,
    }
}

const setEpoch = (dateStr) => {
    return Number(dateStr) + 19800
}

const showDateformat = (date) => {
    if (!date) {
        return ''
    }

    try {
        if (toggle.value == 0 || (toggle.value == 1 && symbol.value && (symbol.value.instname == "UNDIND" || symbol.value.instname == "COM"))) {
            const dateo = new Date((date - 19800) * 1000)
            if (isNaN(dateo.getTime())) {
                return ''
            }
            let hours = dateo.getHours()
            const minutes = dateo.getMinutes()
            const ampm = hours >= 12 ? "PM" : "AM"
            hours = hours % 12 || 12
            const minutesStr = minutes.toString().padStart(2, "0")
            return `${hours}:${minutesStr} ${ampm}`
        } else {
            const datet = new Date(date)
            if (isNaN(datet.getTime())) {
                return ''
            }
            const day = datet.getDate().toString().padStart(2, "0")
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const month = monthNames[datet.getMonth()]
            const year = datet.getFullYear().toString()
            return `${day} ${month} ${year}`
        }
    } catch (error) {
        // console.error('Error formatting date:', error)
        return ''
    }
}

const optionChainDataParse = (data) => {
    if (!data || !data.lp || !symbol.value || !law.value || !lineSeries.value || !chartdata.value) {
        return
    }

    let w = chartdata.value.findIndex((o) => o.time == law.value)
    if (toggle.value != 0 && symbol.value.instname && (symbol.value.instname == "UNDIND" || symbol.value.instname == "COM")) {
        const priceValue = Number(data.lp)
        if (isNaN(priceValue)) {
            return
        }

        if (w >= 0) {
            chartdata.value[w].value = priceValue
            lineSeries.value.update(chartdata.value[w])
        } else {
            chartdata.value.push({ time: law.value, value: priceValue })
            lineSeries.value.setData(chartdata.value)
        }
    }
}

const setLWchart = async (init) => {
    // Prevent duplicate initialization
    if (isInitialized.value && !init) {
        // console.log('Chart already initialized, skipping...')
        return
    }

    // Ensure DOM element exists and has dimensions before creating chart
    if (!chartContainer.value) {
        await nextTick()
        if (!chartContainer.value) {
            // console.error('Chart container element not found')
            return
        }
    }

    // Wait for container to have proper dimensions (critical for chart rendering)
    let retries = 10
    while (retries > 0 && chartContainer.value && (chartContainer.value.offsetWidth === 0 || chartContainer.value.offsetHeight === 0)) {
        await new Promise(resolve => setTimeout(resolve, 100))
        retries--
    }

    if (chartContainer.value && (chartContainer.value.offsetWidth === 0 || chartContainer.value.offsetHeight === 0)) {
        // console.warn('Chart container has no dimensions, chart may not render correctly')
        // Still try to initialize, but it might fail
    }

    userid.value = sessionStorage.getItem("userid")
    usession.value = sessionStorage.getItem("msession")

    // Clean up existing chart if any
    if (chart.value) {
        chart.value.remove()
        chart.value = null
        lineSeries.value = null
    }

    const isDark = theme.current.value.dark
    const chartOptions = {
        rightPriceScale: {
            visible: false,
            borderVisible: false,
        },
        leftPriceScale: {
            visible: false,
        },
        timeScale: {
            visible: false,
            timeVisible: true,
        },
        handleScroll: {
            mouseWheel: false,
            pressedMouseMove: false,
            horzTouchDrag: false,
            vertTouchDrag: false,
        },
        handleScale: {
            axisPressedMouseMove: false,
            mouseWheel: false,
            pinch: false,
        },
        layout: {
            background: { type: "solid", color: isDark ? "#121212" : "#fff" },
            textColor: isDark ? "#fff" : "#000",
        },
        grid: {
            vertLines: {
                visible: false,
                color: isDark ? "#222222" : "#EBEEF0",
            },
            horzLines: {
                visible: false,
                color: isDark ? "#222222" : "#EBEEF0",
            },
        },
    }
    /** @type {import('lightweight-charts').IChartApi} */
    chart.value = createChart(chartContainer.value, chartOptions)

    lineSeries.value = chart.value.addAreaSeries({
        topColor: isDark ? "#2E65F62c" : "#0037B72c",
        bottomColor: isDark ? "#2E65F600" : "#0037B700",
        lineColor: isDark ? "#2E65F6" : "#0037B7",
        lineWidth: 2,
        crossHairMarkerVisible: false,
    })
    toggle.value = 0
    initializeData("1D", init)
    isInitialized.value = true

    const container = chartContainer.value

    const toolTipWidth = 80
    const toolTipHeight = 80
    const toolTipMargin = 16

    const toolTip = document.createElement("div")
    toolTip.style = `position: absolute; display: none; box-sizing: border-box; z-index: 1000; top: 12px; left: 12px; pointer-events: none; border: 1px solid; border-radius: 6px;`
    toolTip.style.background = isDark ? "#000" : "#fff"
    toolTip.style.borderColor = "#EBEEF0"
    container.appendChild(toolTip)

    chart.value.subscribeCrosshairMove((param) => {
        // Comprehensive validation checks
        if (
            param.point === undefined ||
            !param.time ||
            param.point.x < 0 ||
            param.point.x > container.clientWidth ||
            param.point.y < 0 ||
            param.point.y > container.clientHeight ||
            !param.seriesData ||
            !lineSeries.value ||
            !symbol.value ||
            !symbol.value.tsym
        ) {
            toolTip.style.display = "none"
            return
        }

        // Get series data and validate
        const data = param.seriesData.get(lineSeries.value)
        if (!data) {
            toolTip.style.display = "none"
            return
        }

        // Validate price data exists
        const price = data.value !== undefined ? data.value : (data.close !== undefined ? data.close : null)
        if (price === null || price === undefined || isNaN(price)) {
            toolTip.style.display = "none"
            return
        }

        // time will be in the same format that we supplied to setData.
        // thus it will be YYYY-MM-DD
        const dateStr = param.time
        toolTip.style.display = "block"

        try {
            toolTip.innerHTML = `<div class=" rounded-lg px-2 pt-2 pb-1"><div class="font-weight-medium maintext--text fs-14">${symbol.value.tsym || ''}</div> <div class="font-weight-bold maintext--text fs-16 py-1">₹${Math.round(100 * price) / 100}</div> <div class="font-weight-medium subtext--text fs-12">${showDateformat(dateStr)}</div></div>`

            const y = param.point.y
            let left = param.point.x + toolTipMargin
            if (left > container.clientWidth - toolTipWidth) {
                left = param.point.x - toolTipMargin - toolTipWidth
            }

            let top = y + toolTipMargin
            if (top > container.clientHeight - toolTipHeight) {
                top = y - toolTipHeight - toolTipMargin
            }
            toolTip.style.left = left + "px"
            toolTip.style.top = top + "px"
        } catch (error) {
            // console.error('Error updating tooltip:', error)
            toolTip.style.display = "none"
        }
    })
}

// Event handlers
const handleWebSocketConnection = (event) => {
    const data = event.detail
    if (data && data.token == symbol.value.token && chart.value && lineSeries.value && chartdata.value && chartdata.value.length > 0) {
        optionChainDataParse(data)
    }
}

// Watch for prop changes - only when symbol actually changes
watch(() => props.propstsym, async (newVal, oldVal) => {
    if (!newVal || Object.keys(newVal).length === 0) {
        return
    }

    // Generate symbol keys for comparison
    const newSymbolKey = getSymbolKey(newVal)
    const oldSymbolKey = oldVal ? getSymbolKey(oldVal) : null

    // Skip if symbol hasn't actually changed
    if (newSymbolKey && newSymbolKey === oldSymbolKey && newSymbolKey === currentSymbolKey.value) {
        // console.log('Symbol unchanged, skipping API call')
        return
    }

    // Update current symbol key
    if (newSymbolKey) {
        currentSymbolKey.value = newSymbolKey
    }

    symbol.value = newVal

    // Ensure chart container is mounted and has dimensions
    await nextTick()
    if (!chartContainer.value) {
        await nextTick()
    }

    // Wait for container to have dimensions
    let retries = 5
    while (retries > 0 && chartContainer.value && (chartContainer.value.offsetWidth === 0 || chartContainer.value.offsetHeight === 0)) {
        await new Promise(resolve => setTimeout(resolve, 100))
        retries--
    }

    if (chart.value && lineSeries.value && chartContainer.value) {
        // Chart exists, just update data
        lwloader.value = true
        initializeData(toggle.value == 0 ? "1D" : toggle.value == 1 ? "1W" : toggle.value == 2 ? "1M" : toggle.value == 3 ? "1Y" : toggle.value == 4 ? "YTD" : toggle.value == 5 ? "MAX" : "1D", false)
    } else if (chartContainer.value && !isInitialized.value) {
        // Chart doesn't exist yet, initialize it
        const hasDimensions = chartContainer.value.offsetWidth > 0 && chartContainer.value.offsetHeight > 0
        if (hasDimensions) {
            await setLWchart(true)
        } else {
            // Retry initialization if dimensions aren't ready
            attemptChartInit()
        }
    }
}, { deep: false, immediate: true }) // Add immediate: true to handle initial mount

// Watch for theme changes
watch(() => theme.current.value.dark, () => {
    if (chart.value && lineSeries.value) {
        const isDark = theme.current.value.dark
        chart.value.applyOptions({
            layout: {
                background: { type: "solid", color: isDark ? "#121212" : "#fff" },
                textColor: isDark ? "#fff" : "#000",
            },
            grid: {
                vertLines: {
                    visible: false,
                    color: isDark ? "#222222" : "#EBEEF0",
                },
                horzLines: {
                    visible: false,
                    color: isDark ? "#222222" : "#EBEEF0",
                },
            },
        })
        lineSeries.value.applyOptions({
            topColor: isDark ? "#2E65F62c" : "#0037B72c",
            bottomColor: isDark ? "#2E65F600" : "#0037B700",
            lineColor: isDark ? "#2E65F6" : "#0037B7",
        })
    }
})

// Helper function to attempt chart initialization with retries
const attemptChartInit = async (maxRetries = 5, delay = 200) => {
    for (let i = 0; i < maxRetries; i++) {
        await nextTick()

        // Check if props are ready
        if (props.propstsym && Object.keys(props.propstsym).length > 0) {
            symbol.value = props.propstsym
            const symbolKey = getSymbolKey(props.propstsym)
            if (symbolKey) {
                currentSymbolKey.value = symbolKey
            }
        }

        // Check if container exists and has dimensions
        if (chartContainer.value) {
            const containerEl = chartContainer.value
            const hasDimensions = containerEl.offsetWidth > 0 && containerEl.offsetHeight > 0

            if (hasDimensions && props.propstsym && Object.keys(props.propstsym).length > 0) {
                if (!isInitialized.value) {
                    await setLWchart(true)
                    return true // Successfully initialized
                }
            }
        }

        // Wait before retrying
        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    return false // Failed to initialize after retries
}

// Lifecycle hooks
onMounted(async () => {
    // Listen for WebSocket connection events
    window.addEventListener("web-scoketConn", handleWebSocketConnection)

    // Attempt chart initialization with retries (handles refresh scenarios)
    attemptChartInit()
})

onBeforeUnmount(() => {
    isChartActive.value = false
    isInitialized.value = false

    // Cancel any in-flight requests
    if (currentRequest.value) {
        currentRequest.value.abort()
        currentRequest.value = null
    }

    if (chart.value) {
        chart.value.remove()
        chart.value = null
    }
    lineSeries.value = null

    // Remove event listeners
    window.removeEventListener("web-scoketConn", handleWebSocketConnection)

    // Reset tracking variables
    currentSymbolKey.value = null
    isLoading.value = false
})
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    height: 40vh !important;
}
</style>
