<template>
    <div ref="containerRef" class="lazy-widget-container" :style="containerStyle">
        <component
            v-if="isVisible || forceLoad"
            :is="widgetComponent"
            v-bind="widgetProps"
            v-on="widgetEvents"
        />
        <div v-else class="lazy-widget-placeholder">
            <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export default {
    name: 'LazyWidget',
    props: {
        widgetComponent: {
            type: [Object, String],
            required: true,
        },
        widgetProps: {
            type: Object,
            default: () => ({}),
        },
        widgetEvents: {
            type: Object,
            default: () => ({}),
        },
        forceLoad: {
            type: Boolean,
            default: false,
        },
        rootMargin: {
            type: String,
            default: '100px', // Load 100px before widget is visible
        },
        threshold: {
            type: Number,
            default: 0.1, // Load when 10% visible
        },
        containerStyle: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ['visible', 'hidden'],
    setup(props, { emit }) {
        const containerRef = ref(null)
        const isVisible = ref(props.forceLoad)
        let observer = null

        /**
         * Initialize IntersectionObserver
         */
        const initObserver = () => {
            if (!containerRef.value || props.forceLoad) {
                isVisible.value = true
                return
            }

            // Check if IntersectionObserver is supported
            if (!window.IntersectionObserver) {
                // Fallback: load immediately if IntersectionObserver not supported
                isVisible.value = true
                return
            }

            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if (!isVisible.value) {
                                isVisible.value = true
                                emit('visible')
                            }
                        } else {
                            // Optionally unload when hidden (for memory management)
                            // Uncomment if you want to unload hidden widgets
                            // if (isVisible.value) {
                            //     isVisible.value = false
                            //     emit('hidden')
                            // }
                        }
                    })
                },
                {
                    root: null, // Use viewport as root
                    rootMargin: props.rootMargin,
                    threshold: props.threshold,
                }
            )

            observer.observe(containerRef.value)
        }

        /**
         * Cleanup observer
         */
        const cleanupObserver = () => {
            if (observer && containerRef.value) {
                observer.unobserve(containerRef.value)
                observer.disconnect()
                observer = null
            }
        }

        onMounted(() => {
            initObserver()
        })

        onBeforeUnmount(() => {
            cleanupObserver()
        })

        watch(() => props.forceLoad, (newValue) => {
            if (newValue && !isVisible.value) {
                isVisible.value = true
                cleanupObserver()
            }
        })

        return {
            containerRef,
            isVisible,
        }
    },
}
</script>

<style scoped>
.lazy-widget-container {
    width: 100%;
    height: 100%;
    min-height: 100px;
}

.lazy-widget-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 100px;
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
}
</style>

