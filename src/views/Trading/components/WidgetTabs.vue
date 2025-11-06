<template>
    <div class="widget-tabs" v-if="tabs.length > 0">
        <div class="tabs-container">
            <div
                v-for="(tab, index) in tabs"
                :key="tab.id"
                class="tab-item"
                :class="{ active: activeTabId === tab.id, 'can-close': tabs.length > 1 }"
                @click="selectTab(tab.id)"
                @mousedown="handleTabMouseDown($event, tab.id, index)"
            >
                <v-icon :icon="tab.icon" size="small" class="mr-1"></v-icon>
                <span class="tab-title">{{ tab.title }}</span>
                <v-btn
                    v-if="tabs.length > 1"
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    density="compact"
                    class="tab-close-btn"
                    @click.stop="closeTab(tab.id)"
                ></v-btn>
            </div>
        </div>
        <v-btn
            v-if="canAddTab"
            icon="mdi-plus"
            size="small"
            variant="text"
            density="compact"
            class="add-tab-btn"
            @click="addTab"
        ></v-btn>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
    name: 'WidgetTabs',
    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        activeTabId: {
            type: String,
            default: null,
        },
        canAddTab: {
            type: Boolean,
            default: true,
        },
        maxTabs: {
            type: Number,
            default: 10,
        },
    },
    emits: ['tab-selected', 'tab-closed', 'tab-added', 'tab-reordered'],
    setup(props, { emit }) {
        const isDragging = ref(false)
        const dragStartIndex = ref(-1)
        const dragOverIndex = ref(-1)

        /**
         * Select a tab
         */
        const selectTab = (tabId) => {
            if (props.activeTabId !== tabId) {
                emit('tab-selected', tabId)
            }
        }

        /**
         * Close a tab
         */
        const closeTab = (tabId) => {
            if (props.tabs.length > 1) {
                emit('tab-closed', tabId)
            }
        }

        /**
         * Add a new tab
         */
        const addTab = () => {
            if (props.tabs.length < props.maxTabs) {
                emit('tab-added')
            }
        }

        /**
         * Handle tab mouse down for dragging
         */
        const handleTabMouseDown = (e, tabId, index) => {
            if (e.button !== 0) return // Only handle left mouse button

            isDragging.value = false
            dragStartIndex.value = index

            const startX = e.clientX
            const startY = e.clientY

            const handleMouseMove = (moveEvent) => {
                const deltaX = Math.abs(moveEvent.clientX - startX)
                const deltaY = Math.abs(moveEvent.clientY - startY)

                // Start dragging if mouse moved more than 5px
                if (deltaX > 5 || deltaY > 5) {
                    isDragging.value = true
                }

                if (isDragging.value) {
                    // Find which tab we're over
                    const tabElements = document.querySelectorAll('.tab-item')
                    let overIndex = -1

                    tabElements.forEach((el, idx) => {
                        const rect = el.getBoundingClientRect()
                        if (
                            moveEvent.clientX >= rect.left &&
                            moveEvent.clientX <= rect.right &&
                            moveEvent.clientY >= rect.top &&
                            moveEvent.clientY <= rect.bottom
                        ) {
                            overIndex = idx
                        }
                    })

                    if (overIndex !== -1 && overIndex !== dragStartIndex.value) {
                        dragOverIndex.value = overIndex
                    }
                }
            }

            const handleMouseUp = () => {
                if (isDragging.value && dragOverIndex.value !== -1) {
                    // Reorder tabs
                    emit('tab-reordered', {
                        fromIndex: dragStartIndex.value,
                        toIndex: dragOverIndex.value,
                    })
                }

                isDragging.value = false
                dragStartIndex.value = -1
                dragOverIndex.value = -1

                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return {
            isDragging,
            dragStartIndex,
            dragOverIndex,
            selectTab,
            closeTab,
            addTab,
            handleTabMouseDown,
        }
    },
}
</script>

<style scoped>
.widget-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs-container {
    display: flex;
    align-items: center;
    gap: 2px;
    flex: 1;
    overflow-x: auto;
    scrollbar-width: thin;
}

.tabs-container::-webkit-scrollbar {
    height: 4px;
}

.tabs-container::-webkit-scrollbar-track {
    background: transparent;
}

.tabs-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
}

.tab-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    transition: all 0.2s ease;
    position: relative;
}

.tab-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
    background-color: var(--v-background-base);
    border-color: rgba(255, 255, 255, 0.2);
    border-bottom-color: transparent;
    z-index: 1;
}

.tab-title {
    font-size: 12px;
    font-weight: 500;
}

.tab-close-btn {
    opacity: 0;
    transition: opacity 0.2s ease;
    margin-left: 4px;
}

.tab-item:hover .tab-close-btn,
.tab-item.active .tab-close-btn {
    opacity: 1;
}

.add-tab-btn {
    flex-shrink: 0;
}

.tab-item.dragging {
    opacity: 0.5;
}
</style>

