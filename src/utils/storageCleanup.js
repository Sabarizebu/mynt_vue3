/**
 * Storage cleanup utility to prevent QuotaExceededError
 * Cleans up old/unused localStorage data
 */

/**
 * Clean up Firebase-related storage keys
 */
export function cleanupFirebaseStorage() {
    try {
        const keysToRemove = []
        
        // Collect all Firebase keys first
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('firebase:')) {
                keysToRemove.push(key)
            }
        }

        // Remove Firebase keys
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key)
                // console.log(`🧹 Cleaned up Firebase key: ${key}`)
            } catch (e) {
                // console.warn(`⚠️ Could not remove Firebase key ${key}:`, e)
            }
        })

        if (keysToRemove.length > 0) {
            // console.log(`✅ Cleaned up ${keysToRemove.length} Firebase storage keys`)
        }
    } catch (error) {
        // console.warn('⚠️ Error cleaning Firebase storage:', error)
    }
}

/**
 * Clean up old session data that's no longer needed
 */
export function cleanupOldSessionData() {
    try {
        const keysToKeep = [
            'userid',
            'usession',
            'msession',
            'wsstat',
            'c3RhdHVz', // status
            'profile_data',
            'client_data',
        ]

        const keysToRemove = []
        
        // Check all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
                // Keep essential keys
                if (!keysToKeep.includes(key) && 
                    !key.startsWith('firebase:') && // Don't remove here, let cleanupFirebaseStorage handle it
                    !key.includes('_wllayout')) { // Keep watchlist layouts
                    keysToRemove.push(key)
                }
            }
        }

        // Remove old keys
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key)
                // console.log(`🧹 Cleaned up old key: ${key}`)
            } catch (e) {
                // console.warn(`⚠️ Could not remove key ${key}:`, e)
            }
        })
    } catch (error) {
        // console.warn('⚠️ Error cleaning old session data:', error)
    }
}

/**
 * Get approximate storage size
 */
export function getStorageSize() {
    try {
        let total = 0
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length
            }
        }
        return total
    } catch (error) {
        return 0
    }
}

/**
 * Check if storage is near quota and clean up if needed
 */
export function checkAndCleanupStorage() {
    try {
        const size = getStorageSize()
        const maxSize = 5 * 1024 * 1024 // 5MB (browsers typically allow 5-10MB)
        
        // console.log(`📊 Current storage size: ${(size / 1024).toFixed(2)}KB / ${(maxSize / 1024).toFixed(2)}KB`)
        
        if (size > maxSize * 0.8) { // Clean up if > 80% full
            // console.log('🧹 Storage > 80% full, cleaning up...')
            cleanupFirebaseStorage()
            cleanupOldSessionData()
        }
    } catch (error) {
        // console.warn('⚠️ Error checking storage:', error)
    }
}

/**
 * Safe localStorage.setItem with quota error handling
 */
export function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value)
        return true
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            // console.warn('⚠️ QuotaExceededError, cleaning up storage...')
            // Clean up before retrying
            cleanupFirebaseStorage()
            cleanupOldSessionData()
            
            try {
                // Retry after cleanup
                localStorage.setItem(key, value)
                // console.log('✅ Successfully stored after cleanup')
                return true
            } catch (retryError) {
                // console.error('❌ Still out of quota after cleanup:', retryError)
                // Last resort: remove some less critical data
                try {
                    const keysToRemove = ['firebase:previous_websocket_failure']
                    keysToRemove.forEach(k => localStorage.removeItem(k))
                    localStorage.setItem(key, value)
                    return true
                } catch (finalError) {
                    // console.error('❌ Failed to store after all cleanup attempts:', finalError)
                    return false
                }
            }
        }
        // console.error('❌ Error storing data:', error)
        return false
    }
}

/**
 * Initialize storage cleanup on app start
 */
export function initStorageCleanup() {
    // Clean up Firebase storage on init
    cleanupFirebaseStorage()
    
    // Check storage periodically (every 5 minutes)
    setInterval(() => {
        checkAndCleanupStorage()
    }, 5 * 60 * 1000)
    
    // Check storage on page load
    checkAndCleanupStorage()
}

