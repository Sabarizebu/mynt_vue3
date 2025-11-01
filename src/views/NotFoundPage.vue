<template>
    <div class="no-xhide">
        <v-card height="89vh" class="elevation-0">
            <v-container fill-height class="text-center pt-0 px-0">
                <v-card width="100%" color="secbg" class="rounded-xl mx-auto elevation-0 py-8">
                    <img :src="`/src/assets/404${$vuetify.theme.dark ? 'd' : ''}.svg`" alt="404 image"
                        class="pt-6 pb-3">
                    <h1 class="font-weight-bold lh-32 mb-4">Sorry, we couldn't find that page :/</h1>
                    <h4 class="font-weight-regular mb-5">Please check the URL or navigate back to our <br> homepage to
                        explore our current offerings and
                        resources
                    </h4>
                    <v-btn color="btnclr" to="/stocks" height="48px" class="text-none rounded-pill elevation-0 px-8">
                        <span class="btntext--text font-weight-medium body-2">Back to homepage</span>
                    </v-btn>
                </v-card>
            </v-container>
        </v-card>
    </div>
</template>

<script setup>
// Vue 3 Composition API - no additional logic needed
</script>
