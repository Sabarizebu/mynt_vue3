<template>
    <v-dialog v-model="dialog" max-width="700px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Layout Sharing</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <v-tabs v-model="activeTab" density="compact">
                    <v-tab value="export">Export</v-tab>
                    <v-tab value="import">Import</v-tab>
                    <v-tab value="share">Share URL</v-tab>
                    <v-tab value="library">Public Library</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" class="mt-4">
                    <!-- Export Tab -->
                    <v-window-item value="export">
                        <div class="export-section">
                            <v-select
                                v-model="selectedLayoutForExport"
                                :items="savedLayouts"
                                item-title="name"
                                item-value="id"
                                label="Select Layout to Export"
                                density="compact"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                            ></v-select>

                            <v-textarea
                                v-model="exportedJson"
                                label="Exported JSON"
                                rows="10"
                                variant="outlined"
                                readonly
                                hide-details
                                class="mb-4"
                            ></v-textarea>

                            <div class="d-flex gap-2">
                                <v-btn
                                    color="primary"
                                    variant="flat"
                                    @click="exportLayout"
                                >
                                    <v-icon icon="mdi-download" class="mr-2"></v-icon>
                                    Export Layout
                                </v-btn>
                                <v-btn
                                    color="secondary"
                                    variant="outlined"
                                    @click="copyToClipboard"
                                >
                                    <v-icon icon="mdi-content-copy" class="mr-2"></v-icon>
                                    Copy JSON
                                </v-btn>
                                <v-btn
                                    color="success"
                                    variant="outlined"
                                    @click="downloadAsFile"
                                >
                                    <v-icon icon="mdi-file-download" class="mr-2"></v-icon>
                                    Download File
                                </v-btn>
                            </div>
                        </div>
                    </v-window-item>

                    <!-- Import Tab -->
                    <v-window-item value="import">
                        <div class="import-section">
                            <v-textarea
                                v-model="importJson"
                                label="Paste JSON Layout"
                                rows="10"
                                variant="outlined"
                                hide-details
                                placeholder='{"name": "My Layout", "widgets": [...]}'
                                class="mb-4"
                            ></v-textarea>

                            <v-file-input
                                v-model="importFile"
                                label="Or Upload JSON File"
                                accept=".json"
                                density="compact"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                                @change="handleFileUpload"
                            ></v-file-input>

                            <v-alert
                                v-if="importError"
                                type="error"
                                density="compact"
                                variant="tonal"
                                class="mb-4"
                            >
                                {{ importError }}
                            </v-alert>

                            <v-alert
                                v-if="importSuccess"
                                type="success"
                                density="compact"
                                variant="tonal"
                                class="mb-4"
                            >
                                Layout imported successfully!
                            </v-alert>

                            <v-btn
                                color="primary"
                                variant="flat"
                                block
                                :disabled="!importJson && !importFile"
                                :loading="isImporting"
                                @click="importLayout"
                            >
                                <v-icon icon="mdi-upload" class="mr-2"></v-icon>
                                Import Layout
                            </v-btn>
                        </div>
                    </v-window-item>

                    <!-- Share URL Tab -->
                    <v-window-item value="share">
                        <div class="share-section">
                            <v-text-field
                                v-model="shareUrl"
                                label="Shareable URL"
                                density="compact"
                                variant="outlined"
                                readonly
                                hide-details
                                class="mb-4"
                            >
                                <template v-slot:append>
                                    <v-btn
                                        icon="mdi-content-copy"
                                        variant="text"
                                        size="small"
                                        @click="copyShareUrl"
                                    ></v-btn>
                                </template>
                            </v-text-field>

                            <v-select
                                v-model="selectedLayoutForShare"
                                :items="savedLayouts"
                                item-title="name"
                                item-value="id"
                                label="Select Layout to Share"
                                density="compact"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                            ></v-select>

                            <v-checkbox
                                v-model="makePublic"
                                label="Make layout public (visible in library)"
                                density="compact"
                                hide-details
                                class="mb-4"
                            ></v-checkbox>

                            <v-btn
                                color="primary"
                                variant="flat"
                                block
                                :disabled="!selectedLayoutForShare"
                                @click="generateShareUrl"
                            >
                                <v-icon icon="mdi-link" class="mr-2"></v-icon>
                                Generate Share URL
                            </v-btn>

                            <v-alert
                                v-if="shareUrl"
                                type="info"
                                density="compact"
                                variant="tonal"
                                class="mt-4"
                            >
                                Share this URL with others to let them import your layout.
                            </v-alert>
                        </div>
                    </v-window-item>

                    <!-- Public Library Tab -->
                    <v-window-item value="library">
                        <div class="library-section">
                            <v-text-field
                                v-model="librarySearch"
                                label="Search Public Layouts"
                                prepend-inner-icon="mdi-magnify"
                                density="compact"
                                variant="outlined"
                                hide-details
                                class="mb-4"
                            ></v-text-field>

                            <v-list v-if="publicLayouts.length > 0" density="compact">
                                <v-list-item
                                    v-for="layout in filteredPublicLayouts"
                                    :key="layout.id"
                                    :title="layout.name"
                                    :subtitle="layout.description || 'No description'"
                                >
                                    <template v-slot:prepend>
                                        <v-avatar color="primary" size="40">
                                            <v-icon icon="mdi-view-dashboard"></v-icon>
                                        </v-avatar>
                                    </template>
                                    <template v-slot:append>
                                        <div class="d-flex align-center gap-2">
                                            <v-chip size="small" color="info">
                                                {{ layout.downloads || 0 }} downloads
                                            </v-chip>
                                            <v-btn
                                                size="small"
                                                variant="flat"
                                                color="primary"
                                                @click="importPublicLayout(layout)"
                                            >
                                                Import
                                            </v-btn>
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-list>

                            <v-alert
                                v-else
                                type="info"
                                density="compact"
                                variant="tonal"
                            >
                                No public layouts available. Be the first to share a layout!
                            </v-alert>
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

export default {
    name: 'LayoutSharing',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'layout-imported'],
    setup(props, { emit }) {
        const layoutStore = useLayoutStore()

        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const activeTab = ref('export')
        const selectedLayoutForExport = ref(null)
        const exportedJson = ref('')
        const importJson = ref('')
        const importFile = ref(null)
        const importError = ref('')
        const importSuccess = ref(false)
        const isImporting = ref(false)
        const shareUrl = ref('')
        const selectedLayoutForShare = ref(null)
        const makePublic = ref(false)
        const librarySearch = ref('')
        const publicLayouts = ref([])

        const savedLayouts = computed(() => layoutStore.savedLayouts || [])

        const filteredPublicLayouts = computed(() => {
            if (!librarySearch.value) return publicLayouts.value

            const query = librarySearch.value.toLowerCase()
            return publicLayouts.value.filter(
                (layout) =>
                    layout.name.toLowerCase().includes(query) ||
                    (layout.description && layout.description.toLowerCase().includes(query))
            )
        })

        /**
         * Export layout as JSON
         */
        const exportLayout = () => {
            if (!selectedLayoutForExport.value) {
                exportedJson.value = layoutStore.exportLayout()
            } else {
                exportedJson.value = layoutStore.exportLayout(selectedLayoutForExport.value)
            }
        }

        /**
         * Copy JSON to clipboard
         */
        const copyToClipboard = async () => {
            if (!exportedJson.value) {
                exportLayout()
            }

            try {
                await navigator.clipboard.writeText(exportedJson.value)
                alert('JSON copied to clipboard!')
            } catch (error) {
                console.error('Failed to copy:', error)
                alert('Failed to copy to clipboard')
            }
        }

        /**
         * Download as JSON file
         */
        const downloadAsFile = () => {
            if (!exportedJson.value) {
                exportLayout()
            }

            try {
                const layout = JSON.parse(exportedJson.value)
                const filename = `${layout.name || 'layout'}.json`
                const blob = new Blob([exportedJson.value], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = filename
                link.click()
                URL.revokeObjectURL(url)
            } catch (error) {
                console.error('Failed to download:', error)
                alert('Failed to download file')
            }
        }

        /**
         * Handle file upload
         */
        const handleFileUpload = (event) => {
            const file = event.target.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                importJson.value = e.target.result
            }
            reader.readAsText(file)
        }

        /**
         * Import layout from JSON
         */
        const importLayout = async () => {
            if (!importJson.value && !importFile.value) {
                importError.value = 'Please provide JSON or upload a file'
                return
            }

            isImporting.value = true
            importError.value = ''
            importSuccess.value = false

            try {
                let jsonString = importJson.value

                if (importFile.value) {
                    const file = importFile.value
                    jsonString = await new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = (e) => resolve(e.target.result)
                        reader.onerror = reject
                        reader.readAsText(file)
                    })
                }

                const imported = layoutStore.importLayout(jsonString)
                importSuccess.value = true
                importJson.value = ''
                importFile.value = null

                emit('layout-imported', imported)

                setTimeout(() => {
                    importSuccess.value = false
                }, 3000)
            } catch (error) {
                importError.value = error.message || 'Failed to import layout'
            } finally {
                isImporting.value = false
            }
        }

        /**
         * Generate shareable URL
         */
        const generateShareUrl = () => {
            if (!selectedLayoutForShare.value) return

            try {
                const layout = layoutStore.savedLayouts.find((l) => l.id === selectedLayoutForShare.value)
                if (!layout) {
                    alert('Layout not found')
                    return
                }

                // Encode layout data in URL
                const layoutData = btoa(JSON.stringify(layout))
                const baseUrl = window.location.origin + window.location.pathname
                shareUrl.value = `${baseUrl}?layout=${layoutData}`

                // If making public, save to public library
                if (makePublic.value) {
                    saveToPublicLibrary(layout)
                }
            } catch (error) {
                console.error('Failed to generate share URL:', error)
                alert('Failed to generate share URL')
            }
        }

        /**
         * Copy share URL to clipboard
         */
        const copyShareUrl = async () => {
            if (!shareUrl.value) {
                generateShareUrl()
            }

            try {
                await navigator.clipboard.writeText(shareUrl.value)
                alert('Share URL copied to clipboard!')
            } catch (error) {
                console.error('Failed to copy:', error)
                alert('Failed to copy URL')
            }
        }

        /**
         * Save layout to public library
         */
        const saveToPublicLibrary = (layout) => {
            try {
                const publicLayouts = JSON.parse(localStorage.getItem('public_layouts') || '[]')
                const existingIndex = publicLayouts.findIndex((l) => l.id === layout.id)

                const publicLayout = {
                    ...layout,
                    public: true,
                    sharedAt: new Date().toISOString(),
                    downloads: 0,
                }

                if (existingIndex >= 0) {
                    publicLayouts[existingIndex] = publicLayout
                } else {
                    publicLayouts.push(publicLayout)
                }

                localStorage.setItem('public_layouts', JSON.stringify(publicLayouts))
                loadPublicLayouts()
            } catch (error) {
                console.error('Failed to save to public library:', error)
            }
        }

        /**
         * Load public layouts
         */
        const loadPublicLayouts = () => {
            try {
                publicLayouts.value = JSON.parse(localStorage.getItem('public_layouts') || '[]')
            } catch (error) {
                console.error('Failed to load public layouts:', error)
                publicLayouts.value = []
            }
        }

        /**
         * Import public layout
         */
        const importPublicLayout = (layout) => {
            try {
                // Increment download count
                const publicLayouts = JSON.parse(localStorage.getItem('public_layouts') || '[]')
                const index = publicLayouts.findIndex((l) => l.id === layout.id)
                if (index >= 0) {
                    publicLayouts[index].downloads = (publicLayouts[index].downloads || 0) + 1
                    localStorage.setItem('public_layouts', JSON.stringify(publicLayouts))
                    loadPublicLayouts()
                }

                // Import the layout
                const imported = layoutStore.importLayout(JSON.stringify(layout))
                emit('layout-imported', imported)
                alert('Layout imported successfully!')
            } catch (error) {
                console.error('Failed to import public layout:', error)
                alert('Failed to import layout')
            }
        }

        /**
         * Check URL for layout parameter
         */
        const checkUrlForLayout = () => {
            const urlParams = new URLSearchParams(window.location.search)
            const layoutParam = urlParams.get('layout')
            if (layoutParam) {
                try {
                    const layout = JSON.parse(atob(layoutParam))
                    importJson.value = JSON.stringify(layout, null, 2)
                    activeTab.value = 'import'
                    dialog.value = true
                } catch (error) {
                    console.error('Failed to parse layout from URL:', error)
                }
            }
        }

        const close = () => {
            dialog.value = false
            importError.value = ''
            importSuccess.value = false
            shareUrl.value = ''
        }

        watch(() => props.modelValue, (newValue) => {
            if (newValue) {
                loadPublicLayouts()
                checkUrlForLayout()
            }
        })

        return {
            dialog,
            activeTab,
            selectedLayoutForExport,
            exportedJson,
            importJson,
            importFile,
            importError,
            importSuccess,
            isImporting,
            shareUrl,
            selectedLayoutForShare,
            makePublic,
            librarySearch,
            publicLayouts,
            savedLayouts,
            filteredPublicLayouts,
            exportLayout,
            copyToClipboard,
            downloadAsFile,
            handleFileUpload,
            importLayout,
            generateShareUrl,
            copyShareUrl,
            importPublicLayout,
            close,
        }
    },
}
</script>

<style scoped>
.export-section,
.import-section,
.share-section,
.library-section {
    padding: 8px 0;
}
</style>

