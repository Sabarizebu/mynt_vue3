<template>
    <div>
        <v-toolbar flat dense class="tool-sty pl-4 crd-trn my-4">
            <v-btn :disabled="baskets.length >= 10" class="elevation-0 rounded-pill font-weight-bold text-none" color="primary" height="40" @click="openCreate">+ Create Basket</v-btn>
            <v-spacer></v-spacer>
            <v-text-field style="max-width: 220px" v-model="opensearch" hide-details prepend-inner-icon="mdi-magnify" label="Search" class="rounded-pill mr-2" variant="solo" density="comfortable" :bg-color="'secbg'" />
            <v-icon class="ml-3 cursor-p" :disabled="loading" @click="reload" color="maintext" size="24">mdi-reload</v-icon>
        </v-toolbar>

        <v-data-table :headers="headers" :items="filteredBaskets" fixed-header :hide-default-footer="true" :loading="loading" class="mt-3 rounded-lg overflow-y-auto" style="border-radius: 4px; border:1px solid var(--outline)" height="480" :items-per-page="10" @click:row="(_, { item }) => openBasket(item)">
            <template #item.name="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.name }}</span>
            </template>
            <template #item.count="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ (item.list && item.list.length) || 0 }}/20</span>
            </template>
            <template #item.date="{ item }">
                <span class="font-weight-medium maintext--text ws-p">{{ item.date }}</span>
            </template>
            <template #item.actions="{ item }">
                <div class="d-inline-flex" @click.stop>
                    <v-btn icon size="small" class="mr-1" @click="renameBasket(item)"><v-icon>mdi-square-edit-outline</v-icon></v-btn>
                    <v-btn icon size="small" @click="askDelete(item)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
                </div>
            </template>
            <template #no-data>
                <div class="text-center">
                    <div class="mx-auto py-16 mt-16">
                        <img class="mx-auto" width="80" :src="noDataImg" />
                        <h4 class="txt-999 font-weight-regular caption">There is no data here yet!</h4>
                    </div>
                </div>
            </template>
        </v-data-table>

        <v-dialog v-model="nameDialog" max-width="420">
            <v-card class="pb-4 pt-2 px-6 overflow-hidden elevation-0" color="cardbg">
                <v-list-item-title class="font-weight-bold title maintext--text mt-2 mb-4">{{ editTarget ? 'Edit' : 'Create' }} basket
                    <v-icon @click="nameDialog=false" class="float-right" color="maintext">mdi-close</v-icon>
                </v-list-item-title>
                <p class="font-weight-regular fs-14 subtext--text mb-2">Enter the basket name</p>
                <v-text-field hide-details height="40" variant="solo" :bg-color="'secbg'" density="comfortable" flat class="rounded-pill mb-4" placeholder="my first millions" v-model="basketName" />
                <v-btn :disabled="!basketName" color="btnclr" class="text-none rounded-pill elevation-0 btntext--text px-6 float-right" height="40" @click="saveBasket">{{ editTarget ? 'Edit' : 'Create' }}</v-btn>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden" color="cardbg">
                <img :src="cancelIcon" alt="cancel icon" />
                <p class="font-weight-medium mt-3 fs-22 lh-24 mb-8">Are you sure you want to delete this <b>{{ editTarget?.name || '' }}</b> basket?</p>
                <v-row class="px-6" no-gluttters>
                    <v-col cols="6">
                        <v-btn @click="deleteDialog=false; editTarget=null" color="secbg" class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block height="40">No</v-btn>
                    </v-col>
                    <v-col cols="6">
                        <v-btn @click="doDelete" color="btnclr" class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40">Yes</v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <v-dialog v-model="basketDialog" width="760">
            <v-card class="pb-6 px-6 overflow-hidden rounded-lg" color="cardbg">
                <v-list-item-title class="font-weight-bold title maintext--text mt-4 mb-1">Basket order
                    <v-icon @click="basketDialog=false" class="float-right" color="maintext">mdi-close</v-icon>
                </v-list-item-title>
                <v-divider class="mb-2"></v-divider>
                <v-row class="pt-2 pb-2">
                    <v-col cols="6" class="d-inline-flex">
                        <v-text-field readonly hide-details height="40" variant="solo" :bg-color="'secbg'" density="comfortable" flat class="rounded-pill mb-0" v-model="activeBasket.name" />
                    </v-col>
                    <v-col cols="6" class="text-right">
                        <span class="subtext--text">Items: {{ activeBasket.list?.length || 0 }}</span>
                    </v-col>
                </v-row>
                <v-data-table fixed-header :hide-default-footer="true" class="mt-0 rounded-lg overflow-y-auto" style="border: 1px solid var(--outline)" height="288" :headers="itemHeaders" :items="activeBasket.list || []" :items-per-page="20">
                    <template #item.tsym="{ item }">
                        <p class="font-weight-medium maintext--text mb-0 ws-p">{{ item.tsym || '' }}<span class="ml-1 txt-999 fs-10">{{ item.exch || '' }}</span></p>
                    </template>
                    <template #item.qty="{ item }">
                        <v-chip small class="table-hov-prd" text-color="subtext" style="border-radius: 5px; padding: 10px 8px !important">
                            <span class="font-weight-medium maintext--text fs-12">{{ item.qty }}</span>
                        </v-chip>
                    </template>
                    <template #item.buyrsell="{ item }">
                        <v-chip small :color="!item.buyrsell ? 'secgreen' : 'secred'" :text-color="!item.buyrsell ? 'maingreen' : 'mainred'" :style="`border: 1px solid ${!item.buyrsell ? '#C1E7BA' : '#FFCDCD'}; border-radius: 5px; padding: 10px 8px !important;`">
                            <span class="font-weight-medium fs-12">{{ item.buyrsell ? 'SELL' : 'BUY' }}</span>
                        </v-chip>
                    </template>
                    <template #item.actions="{ index }">
                        <div class="d-inline-flex" @click.stop>
                            <v-btn icon size="small" class="mr-1" @click="duplicateItem(index)"><v-icon>mdi-content-copy</v-icon></v-btn>
                            <v-btn icon size="small" @click="removeItem(index)"><v-icon>mdi-trash-can-outline</v-icon></v-btn>
                        </div>
                    </template>
                </v-data-table>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import noDataImg from '@/assets/no data folder.svg'
import cancelIcon from '@/assets/orderbook/cancel-icon.svg'

const loading = ref(false)
const opensearch = ref('')
const baskets = ref([])
const nameDialog = ref(false)
const deleteDialog = ref(false)
const basketDialog = ref(false)
const basketName = ref('')
const editTarget = ref(null)
const activeBasket = ref({ name: '', list: [] })

const headers = [
    { title: 'Basket Name', key: 'name' },
    { title: 'No.of item', key: 'count' },
    { title: 'Created on', key: 'date' },
    { title: '', key: 'actions', sortable: false, align: 'right' }
]

const itemHeaders = [
    { title: 'Instrument', key: 'tsym' },
    { title: 'Buy/Sell', key: 'buyrsell' },
    { title: 'Product', key: 'investype' },
    { title: 'Price type', key: 'prctype' },
    { title: 'Qty', key: 'qty', align: 'right' },
    { title: 'Price', key: 'price', align: 'right' },
    { title: '', key: 'actions', sortable: false, align: 'right' }
]

const filteredBaskets = computed(() => {
    const q = opensearch.value?.toLowerCase()
    if (!q) return baskets.value
    return baskets.value.filter(b => b.name && b.name.toLowerCase().includes(q))
})

function loadFromStorage() {
    try {
        const uid = sessionStorage.getItem('userid')
        const raw = localStorage.getItem(`${uid}_basketorder`)
        baskets.value = raw ? JSON.parse(raw) : []
    } catch {
        baskets.value = []
    }
}

function saveToStorage() {
    try {
        const uid = sessionStorage.getItem('userid')
        localStorage.setItem(`${uid}_basketorder`, JSON.stringify(baskets.value))
    } catch {
        // no-op
    }
}

function reload() {
    loadFromStorage()
}

function openCreate() {
    editTarget.value = null
    basketName.value = ''
    nameDialog.value = true
}

function renameBasket(b) {
    editTarget.value = b
    basketName.value = b?.name || ''
    nameDialog.value = true
}

function saveBasket() {
    const name = basketName.value?.trim()
    if (!name) return
    if (editTarget.value) {
        editTarget.value.name = name
        editTarget.value = null
    } else {
        baskets.value.push({ name, date: new Date().toDateString(), idx: Date.now(), list: [] })
    }
    nameDialog.value = false
    basketName.value = ''
    saveToStorage()
}

function askDelete(b) {
    editTarget.value = b
    deleteDialog.value = true
}

function doDelete() {
    const idx = baskets.value.findIndex(o => o.idx === editTarget.value?.idx)
    if (idx >= 0) baskets.value.splice(idx, 1)
    editTarget.value = null
    deleteDialog.value = false
    saveToStorage()
}

function openBasket(b) {
    activeBasket.value = JSON.parse(JSON.stringify(b))
    basketDialog.value = true
}

function duplicateItem(i) {
    const list = activeBasket.value.list || []
    if (!list[i]) return
    const d = { ...list[i], idx: Date.now() }
    list.push(d)
    persistActive()
}

function removeItem(i) {
    const list = activeBasket.value.list || []
    list.splice(i, 1)
    persistActive()
}

function persistActive() {
    const idx = baskets.value.findIndex(o => o.idx === activeBasket.value.idx)
    if (idx >= 0) baskets.value[idx] = JSON.parse(JSON.stringify(activeBasket.value))
    saveToStorage()
}

onMounted(() => {
    loadFromStorage()
})
</script>
