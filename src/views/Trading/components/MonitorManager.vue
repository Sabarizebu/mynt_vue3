<template>
    <v-dialog v-model="dialog" max-width="600px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h6">Multi-Monitor Manager</span>
                <v-btn icon="mdi-close" variant="text" size="small" @click="close"></v-btn>
            </v-card-title>

            <v-card-text>
                <!-- Current Monitor Info -->
                <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">Current Monitor</v-card-title>
                    <v-card-text>
                        <div class="monitor-info">
                            <div class="info-row">
                                <span class="label">Monitor ID:</span>
                                <span class="value">{{ currentMonitorId }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Resolution:</span>
                                <span class="value">{{ currentMonitor?.width }}x{{ currentMonitor?.height }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Position:</span>
                                <span class="value">({{ currentMonitor?.x }}, {{ currentMonitor?.y }})</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Type:</span>
                                <span class="value">{{ isPrimaryMonitor ? 'Primary' : 'Secondary' }}</span>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Sync Settings -->
                <v-card variant="outlined" class="mb-4">
                    <v-card-title class="text-subtitle-1">Layout Sync</v-card-title>
                    <v-card-text>
                        <v-switch
                            v-model="syncLayouts"
                            label="Sync layouts across all monitors"
                            density="compact"
                            hide-details
                            @update:model-value="toggleSync"
                        ></v-switch>
                        <p class="text-caption text-grey mt-2">
                            When enabled, layout changes will be applied to all monitors
                        </p>
                    </v-card-text>
                </v-card>

                <!-- Detected Monitors -->
                <v-card variant="outlined">
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span class="text-subtitle-1">Detected Monitors</span>
                        <v-btn
                            icon="mdi-refresh"
                            variant="text"
                            size="small"
                            @click="refreshMonitors"
                        ></v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-list density="compact">
                            <v-list-item
                                v-for="monitor in monitors"
                                :key="monitor.id"
                                :class="{ 'monitor-active': monitor.id === currentMonitorId }"
                            >
                                <template v-slot:prepend>
                                    <v-icon
                                        :icon="monitor.isPrimary ? 'mdi-monitor' : 'mdi-monitor-multiple'"
                                        :color="monitor.id === currentMonitorId ? 'primary' : 'grey'"
                                    ></v-icon>
                                </template>
                                <v-list-item-title>
                                    {{ monitor.isPrimary ? 'Primary Monitor' : `Monitor ${monitor.id}` }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ monitor.width }}x{{ monitor.height }} at ({{ monitor.x }}, {{ monitor.y }})
                                </v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-chip
                                        v-if="monitor.id === currentMonitorId"
                                        color="primary"
                                        size="small"
                                    >
                                        Active
                                    </v-chip>
                                    <v-btn
                                        v-if="!monitor.isPrimary"
                                        icon="mdi-delete"
                                        variant="text"
                                        size="small"
                                        @click="removeMonitor(monitor.id)"
                                    ></v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                        <v-alert
                            v-if="monitors.length === 0"
                            type="info"
                            density="compact"
                            variant="tonal"
                            class="mt-2"
                        >
                            No monitors detected. Move the window to different screens to detect monitors.
                        </v-alert>
                    </v-card-text>
                </v-card>

                <!-- Monitor Layouts -->
                <v-card variant="outlined" class="mt-4">
                    <v-card-title class="text-subtitle-1">Monitor Layouts</v-card-title>
                    <v-card-text>
                        <v-list density="compact">
                            <v-list-item
                                v-for="monitor in monitors"
                                :key="monitor.id"
                            >
                                <v-list-item-title>
                                    {{ monitor.isPrimary ? 'Primary Monitor' : `Monitor ${monitor.id}` }}
                                </v-list-item-title>
                                <template v-slot:append>
                                    <v-btn
                                        size="small"
                                        variant="outlined"
                                        @click="loadLayout(monitor.id)"
                                    >
                                        Load Layout
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
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
import { useMonitorStore } from '@/stores/monitorStore'

export default {
    name: 'MonitorManager',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue', 'layout-loaded'],
    setup(props, { emit }) {
        const monitorStore = useMonitorStore()

        const dialog = computed({
            get: () => props.modelValue,
            set: (value) => emit('update:modelValue', value),
        })

        const currentMonitor = computed(() => monitorStore.currentMonitor)
        const currentMonitorId = computed(() => monitorStore.currentMonitorId)
        const isPrimaryMonitor = computed(() => monitorStore.isPrimaryMonitor)
        const monitors = computed(() => monitorStore.monitors)
        const syncLayouts = computed(() => monitorStore.syncLayouts)

        const toggleSync = () => {
            monitorStore.toggleSyncLayouts()
        }

        const refreshMonitors = () => {
            monitorStore.refreshMonitors()
        }

        const removeMonitor = (monitorId) => {
            if (confirm('Are you sure you want to remove this monitor?')) {
                monitorStore.removeMonitor(monitorId)
            }
        }

        const loadLayout = (monitorId) => {
            const layout = monitorStore.getLayoutForMonitor(monitorId)
            if (layout) {
                emit('layout-loaded', { monitorId, layout })
            } else {
                alert('No layout found for this monitor')
            }
        }

        const close = () => {
            dialog.value = false
        }

        return {
            dialog,
            currentMonitor,
            currentMonitorId,
            isPrimaryMonitor,
            monitors,
            syncLayouts,
            toggleSync,
            refreshMonitors,
            removeMonitor,
            loadLayout,
            close,
        }
    },
}
</script>

<style scoped>
.monitor-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.label {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
}

.value {
    font-weight: 500;
}

.monitor-active {
    background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>

