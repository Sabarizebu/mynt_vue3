<template>
    <v-menu location="bottom end" :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                icon="mdi-link-variant"
                variant="text"
                size="x-small"
                :color="isLinked ? 'primary' : 'default'"
                @click.stop
            ></v-btn>
        </template>
        <v-card min-width="300">
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-subtitle-2">Widget Linking</span>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="x-small"
                    @click="close"
                ></v-btn>
            </v-card-title>

            <v-card-text>
                <div v-if="!isLinked" class="link-setup">
                    <p class="text-body-2 mb-4">Link this widget with other widgets to sync changes.</p>
                    <v-select
                        v-model="selectedWidgets"
                        :items="availableWidgets"
                        item-title="title"
                        item-value="id"
                        label="Select widgets to link"
                        multiple
                        density="compact"
                        variant="outlined"
                        hide-details
                    ></v-select>
                    <v-divider class="my-4"></v-divider>
                    <div class="link-options">
                        <p class="text-caption mb-2">Sync Options:</p>
                        <v-checkbox
                            v-model="syncOptions.syncInstrument"
                            label="Sync Instrument"
                            density="compact"
                            hide-details
                        ></v-checkbox>
                        <v-checkbox
                            v-model="syncOptions.syncTimeframe"
                            label="Sync Timeframe"
                            density="compact"
                            hide-details
                        ></v-checkbox>
                        <v-checkbox
                            v-model="syncOptions.syncChartType"
                            label="Sync Chart Type"
                            density="compact"
                            hide-details
                        ></v-checkbox>
                        <v-checkbox
                            v-model="syncOptions.syncIndicators"
                            label="Sync Indicators"
                            density="compact"
                            hide-details
                        ></v-checkbox>
                    </div>
                    <v-btn
                        block
                        color="primary"
                        variant="flat"
                        size="small"
                        class="mt-4"
                        :disabled="selectedWidgets.length === 0"
                        @click="createLink"
                    >
                        Create Link
                    </v-btn>
                </div>

                <div v-else class="link-info">
                    <p class="text-body-2 mb-2">Linked with:</p>
                    <v-list density="compact">
                        <v-list-item
                            v-for="linkedWidget in linkedWidgets"
                            :key="linkedWidget.id"
                            class="linked-widget-item"
                        >
                            <template v-slot:prepend>
                                <v-icon :icon="linkedWidget.icon" size="small" class="mr-2"></v-icon>
                            </template>
                            <v-list-item-title>{{ linkedWidget.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <v-divider class="my-4"></v-divider>
                    <div class="link-options">
                        <p class="text-caption mb-2">Sync Options:</p>
                        <v-checkbox
                            v-model="linkConfig.syncInstrument"
                            label="Sync Instrument"
                            density="compact"
                            hide-details
                            @update:model-value="updateLinkConfig"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="linkConfig.syncTimeframe"
                            label="Sync Timeframe"
                            density="compact"
                            hide-details
                            @update:model-value="updateLinkConfig"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="linkConfig.syncChartType"
                            label="Sync Chart Type"
                            density="compact"
                            hide-details
                            @update:model-value="updateLinkConfig"
                        ></v-checkbox>
                        <v-checkbox
                            v-model="linkConfig.syncIndicators"
                            label="Sync Indicators"
                            density="compact"
                            hide-details
                            @update:model-value="updateLinkConfig"
                        ></v-checkbox>
                    </div>
                    <v-btn
                        block
                        color="error"
                        variant="flat"
                        size="small"
                        class="mt-4"
                        @click="breakLink"
                    >
                        Break Link
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import {
    isWidgetLinked,
    getLinkedWidgetIds,
    getWidgetLinkConfig,
    createWidgetLink,
    breakWidgetLink,
} from '@/utils/widgetEventBus'

export default {
    name: 'WidgetLinkManager',
    props: {
        widgetId: {
            type: String,
            required: true,
        },
        availableWidgets: {
            type: Array,
            default: () => [],
        },
    },
    emits: ['link-created', 'link-broken'],
    setup(props, { emit }) {
        const selectedWidgets = ref([])
        const syncOptions = ref({
            syncInstrument: true,
            syncTimeframe: true,
            syncChartType: true,
            syncIndicators: true,
        })

        const isLinked = computed(() => isWidgetLinked(props.widgetId))
        const linkConfig = ref({
            syncInstrument: true,
            syncTimeframe: true,
            syncChartType: true,
            syncIndicators: true,
        })

        const linkedWidgets = computed(() => {
            if (!isLinked.value) return []
            const linkedIds = getLinkedWidgetIds(props.widgetId)
            return props.availableWidgets.filter((w) => linkedIds.includes(w.id))
        })

        const filteredAvailableWidgets = computed(() => {
            return props.availableWidgets.filter((w) => w.id !== props.widgetId)
        })

        const createLink = () => {
            if (selectedWidgets.value.length === 0) return

            const linkGroupId = `link-group-${Date.now()}`
            const widgetIds = [props.widgetId, ...selectedWidgets.value]

            createWidgetLink(linkGroupId, widgetIds, syncOptions.value)
            emit('link-created', { linkGroupId, widgetIds })
            selectedWidgets.value = []
        }

        const breakLink = () => {
            breakWidgetLink(props.widgetId)
            emit('link-broken', props.widgetId)
        }

        const updateLinkConfig = () => {
            const config = getWidgetLinkConfig(props.widgetId)
            if (config) {
                // Update link config for all widgets in the group
                const linkedIds = getLinkedWidgetIds(props.widgetId)
                const allWidgetIds = [props.widgetId, ...linkedIds]
                const linkGroupId = config.linkGroupId

                createWidgetLink(linkGroupId, allWidgetIds, linkConfig.value)
            }
        }

        const close = () => {
            // Menu will close automatically
        }

        watch(
            () => isLinked.value,
            (newValue) => {
                if (newValue) {
                    const config = getWidgetLinkConfig(props.widgetId)
                    if (config && config.config) {
                        linkConfig.value = { ...config.config }
                    }
                }
            },
            { immediate: true }
        )

        onMounted(() => {
            if (isLinked.value) {
                const config = getWidgetLinkConfig(props.widgetId)
                if (config && config.config) {
                    linkConfig.value = { ...config.config }
                }
            }
        })

        return {
            selectedWidgets,
            syncOptions,
            isLinked,
            linkConfig,
            linkedWidgets,
            filteredAvailableWidgets,
            createLink,
            breakLink,
            updateLinkConfig,
            close,
        }
    },
}
</script>

<style scoped>
.link-setup,
.link-info {
    padding: 8px 0;
}

.link-options {
    padding: 8px 0;
}

.linked-widget-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>

