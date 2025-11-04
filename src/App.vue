<template>
    <v-app>
        <div>
            <router-view />
            <!-- Global Order Window -->
            <StockOrderWindow />
        </div>
    </v-app>
</template>

<script setup>
// Vue 3 Composition API - no need for export default
import StockOrderWindow from '@/components/Popups/StockOrderWindow.vue'
</script>
