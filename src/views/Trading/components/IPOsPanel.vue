<template>
    <div class="ipos-panel">
        <div class="ipos-content">
            <div
                v-for="(ipo, index) in ipos"
                :key="index"
                class="ipo-item"
            >
                <div class="ipo-name">{{ ipo.name }}</div>
                <div class="ipo-company">{{ ipo.company }}</div>
                <div class="ipo-date">{{ formatDate(ipo.date) }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
    name: 'IPOsPanel',
    props: {
        theme: {
            type: String,
            default: 'dark',
        },
    },
    setup() {
        const ipos = ref([])

        const formatDate = (date) => {
            if (!date) return ''
            const d = new Date(date)
            return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
        }

        const loadIPOs = async () => {
            try {
                // Placeholder IPO data
                ipos.value = [
                    { name: 'ORKLAINDIA', company: 'Orkla India', date: '2024-11-06' },
                    { name: 'SAFECURE', company: 'Safecure Services', date: '2024-11-06' },
                    { name: 'STUDDS', company: 'Studds Accessories', date: '2024-11-07' },
                    { name: 'PHONEPE', company: 'PhonePe', date: null },
                    { name: 'SBIMF', company: 'SBI Mutual Fund', date: null },
                    { name: 'ZETWERK', company: 'Zetwerk', date: null },
                    { name: 'PAYU', company: 'Payu', date: null },
                    { name: 'FLIPKART', company: 'Flipkart', date: null },
                ]
            } catch (error) {
                console.error('Error loading IPOs:', error)
            }
        }

        onMounted(() => {
            loadIPOs()
        })

        return {
            ipos,
            formatDate,
        }
    },
}
</script>

<style scoped>
.ipos-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.ipos-content {
    flex: 1;
    overflow-y: auto;
}

.ipo-item {
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.2s;
}

.ipo-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.ipo-name {
    font-weight: 600;
    font-size: 13px;
}

.ipo-company {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
}

.ipo-date {
    font-size: 11px;
    opacity: 0.6;
    margin-top: 2px;
}
</style>

