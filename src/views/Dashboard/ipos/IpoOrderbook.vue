<template>
    <div>
        <v-toolbar flat dense class="tool-sty pl-4 crd-trn">
            <v-tabs v-model="ordertab" color="primary" fixed show-arrows density="compact" @update:model-value="onTab">
                <v-tab :value="'open'" class="font-weight-bold subtitle-1 mb-0 text-none">Open Orders ({{ openorders.length }})</v-tab>
                <v-tab :value="'exec'" class="font-weight-bold subtitle-1 mb-0 text-none">Close Orders ({{ execorders.length }})</v-tab>
            </v-tabs>
            <v-spacer></v-spacer>
            <v-text-field style="max-width: 320px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify"
                label="Search ipos" class="rounded-pill mr-2" variant="solo" density="comfortable" :bg-color="'secbg'" />
            <v-icon class="ml-3 cursor-p" :disabled="loading" @click="getOrderbook" color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table :headers="orderheader" :items="filteredItems" fixed-header :hide-default-footer="true" :loading="loading"
            class="mt-3 rounded-lg overflow-y-auto" style="border-radius:4px; border:1px solid #EBEEF0" height="480" :items-per-page="-1">
            <template #item.symbol="{ item }">
                <div class="pos-rlt">
                    <span class="table-hov-text maintext--text font-weight-medium">{{ item.symbol || '-' }}</span>
                    <span class="ml-1 subtext--text fs-10">{{ item.series || '' }}</span>
                    <div @click.stop class="pos-abs table-hov" style="top: 15px; right: 0">
                        <v-menu location="bottom">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" style="border:1px solid #EBEEF0" min-width="20" color="mainbg" class="px-0 font-weight-bold elevation-0 mr-1" size="x-small">
                                    <v-icon size="20" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-list density="compact">
                                <v-list-item v-for="(m,k) in (ordertab==='open'?menulist.open:menulist.exec)" :key="k" @click="onMenu(m,item)">
                                    <template #prepend>
                                        <v-icon v-if="typeof m.icon==='string'" :icon="m.icon" />
                                    </template>
                                    <v-list-item-title>{{ m.name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
            </template>
            <template #item.amount="{ item }">
                <p class="font-weight-medium maintext--text mb-0 text-right">{{ item.bid_detail?.[0] ? `₹${item.amount.toLocaleString()}` : '' }}</p>
            </template>
            <template #item.response_datetime="{ item }">
                <span class="font-weight-medium maintext--text">{{ (item.response_datetime||'').slice(0,16) }}</span>
            </template>
            <template #item.quantity="{ item }">
                <v-chip size="x-small" class="table-hov-prd rounded-md" label text-color="subtext"><span class="font-weight-medium fs-12">{{ item.quantity }}</span></v-chip>
            </template>
            <template #item.reponse_status="{ item }">
                <p class="font-weight-regular maintext--text mb-0">{{ item.fail_reason || 'Order placed successfully' }}</p>
            </template>
            <template #item.appstatus="{ item }">
                <p class="font-weight-medium maintext--text mb-0 text-capitalize">
                    <img width="20" class="mb-n02" v-if="item.appstatus==='Success'" src="@/assets/success.svg" />
                    <img width="20" class="mb-n02" v-else-if="item.appstatus==='Pending'" src="@/assets/warning.svg" />
                    <img width="20" class="mb-n02" v-else src="@/assets/error.svg" />
                    {{ item.appstatus || '' }}
                </p>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80" :src="noDataImg" />
                        <h4 class="txt-999 font-weight-regular caption">There is no {{ ordertab==='open' ? 'Open' : 'Close' }} order data here yet!</h4>
                    </div>
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import noDataImg from '@/assets/no data folder.svg'
import { useAppStore } from '@/stores/appStore'
import { getIposbook } from '@/components/mixins/getAPIdata'

const appStore = useAppStore()

const loading = ref(false)
const ordertab = ref('open')
const opensearch = ref('')
const openorders = ref([])
const execorders = ref([])
const orderbookdata = ref([])

const menulist = {
    open: [ { name:'Cancel Order', icon:'mdi-close-circle-outline', type:'cd' }, { name:'Order Status', icon:'mdi-information-outline', type:'status', hr:true }, { name:'Details', icon:'mdi-file-eye-outline', type:'detail' } ],
    exec: [ { name:'New Order', icon:'mdi-plus', type:'new' }, { name:'Order Status', icon:'mdi-information-outline', type:'status', hr:true }, { name:'Details', icon:'mdi-file-eye-outline', type:'detail' } ]
}

const orderheader = [
    { title:'Symbol', key:'symbol' },
    { title:'Order Number', key:'applicationNumber' },
    { title:'Datetime', key:'response_datetime' },
    { title:'Qty', key:'quantity' },
    { title:'Amount', key:'amount', align:'right' },
    { title:'Reason', key:'reponse_status' },
    { title:'Status', key:'appstatus' }
]

const filteredItems = computed(() => {
    const q = opensearch.value?.toLowerCase()
    const list = orderbookdata.value.filter(o => o.way === ordertab.value)
    if (!q) return list
    return list.filter(o => (o.symbol||'').toLowerCase().includes(q) || (o.applicationNumber||'').toLowerCase().includes(q))
})

function onTab(){ /* reserved */ }

async function getOrderbook(){
    loading.value = true
    openorders.value = []; execorders.value = []; orderbookdata.value = []
    const uid = sessionStorage.getItem('userid'); const tok = sessionStorage.getItem('usession')
    try{
        const data = await getIposbook([uid, tok])
        if (Array.isArray(data) && data.length){
            for (let q=0;q<data.length;q++){
                const d = data[q]
                d.idx = q
                if ( ((d.upiPaymentStatus==='Request Accepted By Sponsor Bank' || d.upiPaymentStatus==='Request Sent' || !d.upiPaymentStatus) && !d.fail_reason && d.reponse_status==='new success') || d.reponse_status==='pending'){
                    d.way='open'; openorders.value.push(d)
                } else { d.way='exec'; execorders.value.push(d) }
                d.amount = Math.max(...d.bid_detail.map(o=>Number(o.amount)))
                d.quantity = Math.max(...d.bid_detail.map(o=>Number(o.quantity)))
                d.len = d.bid_detail.length
                d.fail_reason = d.upiPaymentStatus ? d.upiPaymentStatus : d.bid_detail.requestfor==='REMOVE' || d.bid_detail[0].activityType==='cancel' ? 'Order was canceled by yourself.' : d.fail_reason
                d.appstatus = d.upiPaymentStatus==='Accepted by Investor' || ((d.fail_reason==='Request Accepted By Sponsor Bank' || d.fail_reason==='Request Sent' || !d.upiPaymentStatus) && d.reponse_status==='new success') ? 'Success' : d.reponse_status==='pending' ? 'Pending' : 'Failed'
                orderbookdata.value.push(d)
            }
        }
    } catch(e){ appStore.showSnackbar(2,'Failed to load IPO orders') }
    loading.value = false
}

function onMenu(m,item){ if(m.type==='new'){ window.location.href='/ipo' } }

onMounted(()=>{ getOrderbook() })
</script>
