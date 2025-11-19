<template>
    <v-container fluid class="pa-0">
        <v-row justify="center" class="ma-0">
            <v-col>
                <v-card elevation="0" variant="outlined" style="border: 1px solid #e0e0e0;" class="api-key-card">
                    <!-- Form Content -->
                    <v-card-text class="pa-6">
                        <!-- Client ID Section -->
                        <v-text-field label="Client Id" :model-value="clientId" readonly variant="outlined" density="compact" class="mb-4">
                            <template v-slot:append-inner>
                                <v-btn icon size="small" @click="copyToClipboard(clientId)" elevation="0" title="Copy Client ID">
                                    <v-icon size="small">mdi-content-copy</v-icon>
                                </v-btn>
                            </template>
                        </v-text-field>

                        <!-- Secret Code Section -->
                        <v-text-field label="Secret Code" :model-value="showSecret ? secretCode : maskedSecretCode" readonly
                            variant="outlined" density="compact" class="mb-4" :type="showSecret ? 'text' : 'password'">
                            <template v-slot:append-inner>
                                <v-btn icon elevation="0" size="small" @click="toggleSecretVisibility"
                                    :title="showSecret ? 'Hide Secret Code' : 'Show Secret Code'" class="mr-1">
                                    <v-icon size="small">{{ showSecret ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                                </v-btn>
                                <v-btn icon elevation="0" size="small" @click="copyToClipboard(secretCode)" title="Copy Secret Code">
                                    <v-icon size="small">mdi-content-copy</v-icon>
                                </v-btn>
                            </template>
                        </v-text-field>

                        <!-- URL Input -->
                        <v-text-field v-model="formData.url" label="URL" variant="outlined" density="compact" class="mb-4"
                            :error-messages="errors.url" :error="!!errors.url" @keyup="validateUrl" @blur="validateUrl"
                            placeholder="Enter URL" type="url" />

                        <!-- Primary IP Address Input -->
                        <v-text-field v-model="formData.primaryIp" label="Primary IP Address" variant="outlined"
                            density="compact" class="mb-4" :error-messages="errors.primaryIp" :error="!!errors.primaryIp"
                            @blur="validatePrimaryIp" placeholder="Enter Primary IP Address" />

                        <!-- Backup IP Address Input -->
                        <v-text-field v-model="formData.backupIp" label="Backup IP Address" variant="outlined" density="compact" class="mb-4"
                            :error-messages="errors.backupIp" :error="!!errors.backupIp" @blur="validateBackupIp"
                            placeholder="Backup IP Address" />

                        <!-- Update Button -->
                        <v-btn color="primary" :loading="updateload" size="large" block :disabled="!isFormValid" @click="handleUpdate" elevation="0"
                            class="text-none mt-4">
                            Update
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from "@/stores/appStore"
import { getApikeyData, getApiKeyStore } from "@/components/mixins/getAPIdata.js"

const appStore = useAppStore()

const clientId = ref('')
const secretCode = ref('')
const showSecret = ref(false)
const formData = ref({
    url: '',
    primaryIp: '',
    backupIp: '',
    highVolumeOrders: false
})
const errors = ref({
    url: '',
    primaryIp: '',
    backupIp: '',
    highVolumeOrders: ''
})
const updateload = ref(false)
const uid = ref('')

const maskedSecretCode = computed(() => {
    return secretCode.value.replace(/[A-Za-z0-9]/g, 'X')
})

const isFormValid = computed(() => {
    return formData.value.url &&
        formData.value.primaryIp &&
        !errors.value.url &&
        !errors.value.primaryIp &&
        !errors.value.backupIp
})

const toggleSecretVisibility = () => {
    showSecret.value = !showSecret.value
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        appStore.showSnackbar(1, 'Copied to clipboard!')
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        appStore.showSnackbar(1, 'Copied to clipboard!')
    }
}

const validateUrl = () => {
    // Must start with http(s):// or www.
    // Must have valid TLD from allowed list
    // No bare domains like google.com or app.mynt.in
    const urlPattern = /^(https?:\/\/|www\.)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.(com|in|org|net|io|co|edu|gov|info|biz|dev|app)(\/\S*)?$/i

    const url = formData.value.url?.trim()

    if (!url) {
        errors.value.url = "URL is required"
    } else if (!urlPattern.test(url)) {
        errors.value.url =
            "Enter valid URL (Ex: https://mynt.zebuetrade.com or www.mynt.zebuetrade.com)"
    } else {
        errors.value.url = ""
    }
}

const validatePrimaryIp = () => {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!formData.value.primaryIp) {
        errors.value.primaryIp = 'Primary IP Address is required'
    } else if (!ipPattern.test(formData.value.primaryIp)) {
        errors.value.primaryIp = 'Please enter a valid IP address'
    } else {
        errors.value.primaryIp = ''
    }
}

const validateBackupIp = () => {
    if (formData.value.backupIp) {
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        if (!ipPattern.test(formData.value.backupIp)) {
            errors.value.backupIp = 'Please enter a valid IP address'
        } else {
            errors.value.backupIp = ''
        }
    } else {
        errors.value.backupIp = ''
    }
}

const validateHighVolumeOrders = () => {
    if (!formData.value.highVolumeOrders) {
        errors.value.highVolumeOrders = 'This field is required'
    } else {
        errors.value.highVolumeOrders = ''
    }
}

const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

const setAPikeydata = async () => {
    let key = await getApikeyData()
    // console.log("key.ipaddr", key)
    if (key && key.stat == 'Not_Ok') {
        // console.log("iffff1111")
        // Ensure uid is available, fallback to sessionStorage if needed
        const userId = uid.value || sessionStorage.getItem("userid") || ''
        if (userId) {
            let hashedText = await sha256(userId)
            clientId.value = userId + '_U'
            secretCode.value = hashedText
            // console.log("clientId:", clientId.value, typeof clientId.value)
        } else {
            // console.warn("User ID not available for clientId generation")
            clientId.value = ''
        }
    } else if (key && key.stat == 'Ok') {
        // console.log("elseeeeeeeeeeeeeee")
        clientId.value = key.app_key || ''
        secretCode.value = key.sec_code || ''
        formData.value.url = key.red_url || ''
        formData.value.primaryIp = key.ipaddr?.[0]?.ipaddr || ""
        formData.value.backupIp = key.ipaddr?.[1]?.ipaddr || ""
    }
}

const handleUpdate = async () => {
    // Validate all fields before proceeding
    validateUrl()
    validatePrimaryIp()
    validateBackupIp()
    validateHighVolumeOrders()

    if (isFormValid.value) {
        updateload.value = true
        // console.log('=== API Key Update Data ===')
        // console.log('Client ID:', clientId.value)
        // console.log('Secret Code:', secretCode.value)
        // console.log('URL:', formData.value.url)
        // console.log('Primary IP Address:', formData.value.primaryIp)
        // console.log('Backup IP Address:', formData.value.backupIp || 'Not provided')
        // console.log('High Volume Orders:', formData.value.highVolumeOrders ? 'Yes' : 'No')
        // console.log('========================')

        const apiKeyUpdateData = {
            clientId: clientId.value,
            secretCode: secretCode.value,
            url: formData.value.url,
            primaryIp: formData.value.primaryIp,
            backupIp: formData.value.backupIp,
            highVolumeOrders: formData.value.highVolumeOrders ? true : false,
        }

        let key = await getApiKeyStore(apiKeyUpdateData)
        updateload.value = false
        if (key && key.stat == 'Ok') {
            appStore.showSnackbar(1, "API Key Updated.")
            await setAPikeydata()
        } else {
            appStore.showSnackbar(2, key && key.emsg ? key.emsg : 'Unknown error')
        }
    } else {
        appStore.showSnackbar(2, 'Please fix the validation errors before updating')
    }
}

// Helper function to load API key data
const loadApiKeyData = async () => {
    let res = sessionStorage.getItem("c3RhdHVz")
    if (res == "dmFsaWR1c2Vy") {
        uid.value = sessionStorage.getItem("userid")
        if (uid.value) {
            await setAPikeydata()
        }
    } else {
        window.dispatchEvent(new CustomEvent('login'))
    }
}

const userEventHandler = () => {
    loadApiKeyData()
}

onMounted(() => {
    // Try to load data directly first
    loadApiKeyData()

    // Also listen for user-event
    window.dispatchEvent(new CustomEvent('login-event'))

    window.addEventListener('user-event', userEventHandler)
})

onBeforeUnmount(() => {
    window.removeEventListener('user-event', userEventHandler)
})
</script>

<style scoped>
.api-key-card {
    max-width: 100%;
}
</style>

