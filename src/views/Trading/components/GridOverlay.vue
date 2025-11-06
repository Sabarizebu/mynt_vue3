<template>
    <div
        v-if="enabled"
        class="grid-overlay"
        :style="gridStyle"
    ></div>
</template>

<script>
import { computed } from 'vue'

export default {
    name: 'GridOverlay',
    props: {
        enabled: {
            type: Boolean,
            default: true,
        },
        size: {
            type: Number,
            default: 16,
        },
    },
    setup(props) {
        const gridStyle = computed(() => {
            return {
                backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${props.size}px ${props.size}px`,
                pointerEvents: 'none',
            }
        })

        return {
            gridStyle,
        }
    },
}
</script>

<style scoped>
.grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    opacity: 0.3;
}
</style>

