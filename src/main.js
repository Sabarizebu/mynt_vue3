import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'

// Import Firebase
import './firebase.js'

// Import storage cleanup utility to prevent QuotaExceededError
import { initStorageCleanup } from './utils/storageCleanup'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// Initialize storage cleanup to prevent QuotaExceededError
initStorageCleanup()

// Global error handler for QuotaExceededError (catches Firebase storage errors)
window.addEventListener('error', (event) => {
    if (event.error && (event.error.name === 'QuotaExceededError' || event.error.code === 22)) {
        console.warn('⚠️ QuotaExceededError detected, cleaning up storage...')
        // Dynamic import to avoid circular dependency
        import('./utils/storageCleanup.js').then(({ cleanupFirebaseStorage, cleanupOldSessionData }) => {
            cleanupFirebaseStorage()
            cleanupOldSessionData()
        }).catch(err => console.error('Error importing cleanup utility:', err))
        // Prevent the error from being logged multiple times
        event.preventDefault()
        return false
    }
}, true)

// Catch unhandled promise rejections related to storage
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.name === 'QuotaExceededError' || event.reason.code === 22)) {
        console.warn('⚠️ Unhandled QuotaExceededError in promise, cleaning up storage...')
        // Dynamic import to avoid circular dependency
        import('./utils/storageCleanup.js').then(({ cleanupFirebaseStorage, cleanupOldSessionData }) => {
            cleanupFirebaseStorage()
            cleanupOldSessionData()
        }).catch(err => console.error('Error importing cleanup utility:', err))
        event.preventDefault()
    }
})

// Global directive: smooth scroll inside watchlist containers and prevent body scroll
app.directive('watchlist-scroll', {
  mounted(el) {
    const onWheel = (e) => {
      // allow the container to consume scroll, prevent body scroll
      el.scrollTop += e.deltaY;
      e.preventDefault();
    };
    el.__wl_onWheel = onWheel;
    el.addEventListener('wheel', onWheel, { passive: false });
  },
  unmounted(el) {
    if (el.__wl_onWheel) {
      el.removeEventListener('wheel', el.__wl_onWheel);
      delete el.__wl_onWheel;
    }
  }
})

app.mount('#app')