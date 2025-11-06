<template>
    <div v-if="isLinked" class="link-indicator" :class="{ 'link-active': isActive }">
        <v-icon icon="mdi-link-variant" size="small" :color="isActive ? 'primary' : 'grey'"></v-icon>
        <span v-if="linkCount > 0" class="link-count">{{ linkCount }}</span>
    </div>
</template>

<script>
import { computed } from 'vue'
import { isWidgetLinked, getLinkedWidgetIds } from '@/utils/widgetEventBus'

export default {
    name: 'LinkIndicator',
    props: {
        widgetId: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const isLinked = computed(() => isWidgetLinked(props.widgetId))
        const linkCount = computed(() => getLinkedWidgetIds(props.widgetId).length)

        return {
            isLinked,
            linkCount,
        }
    },
}
</script>

<style scoped>
.link-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: rgba(var(--v-theme-primary), 0.1);
    transition: background-color 0.2s;
}

.link-indicator.link-active {
    background-color: rgba(var(--v-theme-primary), 0.2);
}

.link-count {
    font-size: 10px;
    font-weight: 600;
    color: var(--v-theme-primary);
}
</style>

