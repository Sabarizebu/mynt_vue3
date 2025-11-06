<template>
    <v-dialog v-model="dialog" max-width="800px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Layout Manager</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <v-tabs v-model="activeTab" density="compact">
                    <v-tab value="saved">Saved Layouts</v-tab>
                    <v-tab value="templates">Templates</v-tab>
                    <v-tab value="settings">Settings</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" class="mt-4">
                    <!-- Saved Layouts Tab -->
                    <v-window-item value="saved">
                        <div v-if="hasSavedLayouts" class="layout-list">
                            <v-list density="compact">
                                <v-list-item
                                    v-for="layout in savedLayouts"
                                    :key="layout.id"
                                    class="layout-item"
                                >
                                    <template v-slot:prepend>
                                        <v-icon icon="mdi-view-dashboard" class="mr-2"></v-icon>
                                    </template>

                                    <v-list-item-title>{{ layout.name }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ formatDate(layout.updatedAt) }} • {{ layout.widgets?.length || 0 }} widgets
                                    </v-list-item-subtitle>

                                    <template v-slot:append>
                                        <v-menu location="bottom end">
                                            <template v-slot:activator="{ props }">
                                                <v-btn
                                                    v-bind="props"
                                                    icon="mdi-dots-vertical"
                                                    variant="text"
                                                    size="small"
                                                    @click.stop
                                                ></v-btn>
                                            </template>
                                            <v-list density="compact">
                                                <v-list-item @click="loadLayoutItem(layout.id)">
                                                    <v-list-item-title>Load</v-list-item-title>
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-folder-open" size="small"></v-icon>
                                                    </template>
                                                </v-list-item>
                                                <v-list-item @click="duplicateLayoutItem(layout.id)">
                                                    <v-list-item-title>Duplicate</v-list-item-title>
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-content-copy" size="small"></v-icon>
                                                    </template>
                                                </v-list-item>
                                                <v-list-item @click="exportLayoutItem(layout.id)">
                                                    <v-list-item-title>Export</v-list-item-title>
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-download" size="small"></v-icon>
                                                    </template>
                                                </v-list-item>
                                                <v-divider></v-divider>
                                                <v-list-item @click="deleteLayoutItem(layout.id)" class="text-error">
                                                    <v-list-item-title>Delete</v-list-item-title>
                                                    <template v-slot:prepend>
                                                        <v-icon icon="mdi-delete" size="small" color="error"></v-icon>
                                                    </template>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                        <div v-else class="empty-state text-center py-8">
                            <v-icon icon="mdi-view-dashboard-outline" size="64" color="grey"></v-icon>
                            <p class="text-h6 mt-4">No saved layouts</p>
                            <p class="text-body-2 mt-2">Create and save your first layout to get started</p>
                        </div>
                    </v-window-item>

                    <!-- Templates Tab -->
                    <v-window-item value="templates">
                        <LayoutTemplateSelector @select-template="applyTemplate" />
                    </v-window-item>

                    <!-- Settings Tab -->
                    <v-window-item value="settings">
                        <div class="settings-content">
                            <v-list density="compact">
                                <v-list-item>
                                    <v-list-item-title>Grid Settings</v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <template v-slot:prepend>
                                        <v-switch
                                            v-model="gridEnabled"
                                            density="compact"
                                            hide-details
                                            @update:model-value="updateGridEnabled"
                                        ></v-switch>
                                    </template>
                                    <v-list-item-title>Show Grid</v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <template v-slot:prepend>
                                        <v-switch
                                            v-model="snapToGrid"
                                            density="compact"
                                            hide-details
                                            :disabled="!gridEnabled"
                                            @update:model-value="updateSnapToGrid"
                                        ></v-switch>
                                    </template>
                                    <v-list-item-title>Snap to Grid</v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <v-list-item-title>Grid Size</v-list-item-title>
                                    <template v-slot:append>
                                        <v-btn-toggle
                                            v-model="gridSize"
                                            mandatory
                                            density="compact"
                                            variant="outlined"
                                            @update:model-value="updateGridSize"
                                        >
                                            <v-btn value="8" size="small">8px</v-btn>
                                            <v-btn value="16" size="small">16px</v-btn>
                                            <v-btn value="32" size="small">32px</v-btn>
                                        </v-btn-toggle>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </div>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useLayoutStore } from '@/stores/layoutStore'
import LayoutTemplateSelector from './LayoutTemplateSelector.vue'

export default {
    name: 'LayoutManager',
    components: {
        LayoutTemplateSelector,
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'layout-loaded', 'template-applied'],
    setup(props, { emit }) {
        const layoutStore = useLayoutStore()

        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const activeTab = ref('saved')
        const gridEnabled = ref(layoutStore.gridEnabled)
        const snapToGrid = ref(layoutStore.snapToGrid)
        const gridSize = ref(String(layoutStore.gridSize))

        const savedLayouts = computed(() => layoutStore.savedLayouts)
        const hasSavedLayouts = computed(() => layoutStore.hasSavedLayouts)

        const formatDate = (dateString) => {
            if (!dateString) return 'Unknown'
            const date = new Date(dateString)
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        }

        const loadLayoutItem = (layoutId) => {
            try {
                const layout = layoutStore.loadLayout(layoutId)
                if (!layout || !layout.widgets || !Array.isArray(layout.widgets)) {
                    console.error('Invalid layout:', layout)
                    return
                }
                emit('layout-loaded', layoutId)
                close()
            } catch (error) {
                console.error('Error loading layout:', error)
            }
        }

        const duplicateLayoutItem = (layoutId) => {
            try {
                layoutStore.duplicateLayout(layoutId)
            } catch (error) {
                console.error('Error duplicating layout:', error)
            }
        }

        const deleteLayoutItem = (layoutId) => {
            if (confirm('Are you sure you want to delete this layout?')) {
                try {
                    layoutStore.deleteLayout(layoutId)
                } catch (error) {
                    console.error('Error deleting layout:', error)
                }
            }
        }

        const exportLayoutItem = (layoutId) => {
            try {
                const json = layoutStore.exportLayout(layoutId)
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `layout-${layoutId}.json`
                a.click()
                URL.revokeObjectURL(url)
            } catch (error) {
                console.error('Error exporting layout:', error)
            }
        }

        const applyTemplate = (template) => {
            try {
                if (!template || !template.widgets || !Array.isArray(template.widgets)) {
                    console.error('Invalid template:', template)
                    return
                }
                layoutStore.applyTemplate(template)
                emit('template-applied', template)
                close()
            } catch (error) {
                console.error('Error applying template:', error)
            }
        }

        const updateGridEnabled = (value) => {
            layoutStore.setGridEnabled(value)
        }

        const updateSnapToGrid = (value) => {
            layoutStore.setSnapToGrid(value)
        }

        const updateGridSize = (value) => {
            layoutStore.setGridSize(Number(value))
        }

        const close = () => {
            dialog.value = false
        }

        return {
            dialog,
            activeTab,
            gridEnabled,
            snapToGrid,
            gridSize,
            savedLayouts,
            hasSavedLayouts,
            formatDate,
            loadLayoutItem,
            duplicateLayoutItem,
            deleteLayoutItem,
            exportLayoutItem,
            applyTemplate,
            updateGridEnabled,
            updateSnapToGrid,
            updateGridSize,
            close,
        }
    },
}
</script>

<style scoped>
.layout-list {
    max-height: 400px;
    overflow-y: auto;
}

.layout-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-state {
    opacity: 0.6;
}

.settings-content {
    padding: 8px 0;
}
</style>

