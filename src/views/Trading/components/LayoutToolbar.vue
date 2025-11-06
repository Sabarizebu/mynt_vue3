<template>
    <div class="layout-toolbar">
        <!-- Layout Selector -->
        <v-select
            v-model="selectedLayout"
            :items="savedLayouts"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            hide-details
            class="layout-selector"
            style="max-width: 200px;"
            placeholder="Select Layout"
            @update:model-value="onLayoutSelected"
        >
            <template v-slot:prepend-inner>
                <v-icon icon="mdi-view-dashboard" size="small" class="mr-2"></v-icon>
            </template>
            <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name" :subtitle="formatDate(item.raw.updatedAt || item.raw.createdAt)">
                    <template v-slot:append>
                        <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="x-small"
                            @click.stop="deleteLayout(item.raw.id)"
                        ></v-btn>
                    </template>
                </v-list-item>
            </template>
        </v-select>

        <!-- Quick Actions -->
        <v-btn-toggle
            v-model="quickAction"
            mandatory
            density="compact"
            variant="outlined"
            class="quick-actions"
        >
            <v-btn value="save" size="small" @click="saveLayout">
                <v-icon icon="mdi-content-save" size="small" class="mr-1"></v-icon>
                Save
            </v-btn>
            <v-btn value="load" size="small" @click="loadLayout">
                <v-icon icon="mdi-folder-open" size="small" class="mr-1"></v-icon>
                Load
            </v-btn>
            <v-btn value="template" size="small" @click="showTemplates">
                <v-icon icon="mdi-view-grid" size="small" class="mr-1"></v-icon>
                Templates
            </v-btn>
        </v-btn-toggle>

        <!-- Undo/Redo -->
        <v-btn-toggle
            v-model="historyAction"
            density="compact"
            variant="outlined"
            class="history-actions"
        >
            <v-btn
                value="undo"
                size="small"
                :disabled="!canUndo"
                @click="undo"
            >
                <v-icon icon="mdi-undo" size="small"></v-icon>
            </v-btn>
            <v-btn
                value="redo"
                size="small"
                :disabled="!canRedo"
                @click="redo"
            >
                <v-icon icon="mdi-redo" size="small"></v-icon>
            </v-btn>
        </v-btn-toggle>

        <!-- Layout Settings -->
        <v-menu location="bottom">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon="mdi-cog" variant="text" size="small" title="Layout Settings"></v-btn>
            </template>
            <v-list density="compact">
                <v-list-item>
                    <v-list-item-title>Enable Grid</v-list-item-title>
                    <template v-slot:append>
                        <v-switch v-model="gridEnabled" density="compact" hide-details @update:model-value="onGridEnabledChange"></v-switch>
                    </template>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Snap to Grid</v-list-item-title>
                    <template v-slot:append>
                        <v-switch v-model="snapToGrid" density="compact" hide-details @update:model-value="onSnapToGridChange"></v-switch>
                    </template>
                </v-list-item>
                <v-list-item>
                    <v-list-item-title>Grid Size</v-list-item-title>
                    <template v-slot:append>
                        <v-select
                            v-model="gridSize"
                            :items="[8, 16, 32, 64]"
                            density="compact"
                            hide-details
                            variant="outlined"
                            style="max-width: 80px;"
                            @update:model-value="onGridSizeChange"
                        ></v-select>
                    </template>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLayoutStore } from '@/stores/layoutStore'

export default {
    name: 'LayoutToolbar',
    props: {
        modelValue: {
            type: String,
            default: null,
        },
    },
    emits: ['update:modelValue', 'layout-selected', 'save-layout', 'load-layout', 'show-templates', 'undo', 'redo'],
    setup(props, { emit }) {
        const layoutStore = useLayoutStore()

        const selectedLayout = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })
        const quickAction = ref(null)
        const historyAction = ref(null)
        const gridEnabled = ref(layoutStore.gridEnabled)
        const snapToGrid = ref(layoutStore.snapToGrid)
        const gridSize = ref(layoutStore.gridSize)

        const savedLayouts = computed(() => layoutStore.savedLayouts || [])
        const canUndo = computed(() => layoutStore.canUndo)
        const canRedo = computed(() => layoutStore.canRedo)

        const onLayoutSelected = (layoutId) => {
            selectedLayout.value = layoutId
            emit('layout-selected', layoutId)
        }

        const saveLayout = () => {
            emit('save-layout')
            quickAction.value = null
        }

        const loadLayout = () => {
            emit('load-layout')
            quickAction.value = null
        }

        const showTemplates = () => {
            emit('show-templates')
            quickAction.value = null
        }

        const undo = () => {
            emit('undo')
            historyAction.value = null
        }

        const redo = () => {
            emit('redo')
            historyAction.value = null
        }

        const deleteLayout = (layoutId) => {
            if (confirm('Are you sure you want to delete this layout?')) {
                layoutStore.deleteLayout(layoutId)
                if (selectedLayout.value === layoutId) {
                    selectedLayout.value = null
                    emit('update:modelValue', null)
                }
            }
        }

        const onGridEnabledChange = (value) => {
            layoutStore.setGridEnabled(value)
        }

        const onSnapToGridChange = (value) => {
            layoutStore.setSnapToGrid(value)
        }

        const onGridSizeChange = (value) => {
            layoutStore.setGridSize(value)
        }

        const formatDate = (timestamp) => {
            if (!timestamp) return 'No date'
            try {
                const date = new Date(timestamp)
                if (isNaN(date.getTime())) return 'Invalid date'
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
            } catch (error) {
                return 'Invalid date'
            }
        }


        onMounted(() => {
            // Load saved layouts
            layoutStore.loadSavedLayouts()
        })

        return {
            selectedLayout,
            quickAction,
            historyAction,
            gridEnabled,
            snapToGrid,
            gridSize,
            savedLayouts,
            canUndo,
            canRedo,
            onLayoutSelected,
            saveLayout,
            loadLayout,
            showTemplates,
            undo,
            redo,
            deleteLayout,
            onGridEnabledChange,
            onSnapToGridChange,
            onGridSizeChange,
            formatDate,
        }
    },
}
</script>

<style scoped>
.layout-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
}

.layout-selector {
    flex-shrink: 0;
}

.quick-actions {
    flex-shrink: 0;
}

.history-actions {
    flex-shrink: 0;
}
</style>

