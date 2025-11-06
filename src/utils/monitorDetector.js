/**
 * Monitor Detector Utility
 * Detects and manages multiple monitor configurations
 */

/**
 * Get current monitor information
 */
export function getCurrentMonitor() {
    if (!window.screen) {
        return {
            id: 'primary',
            width: window.innerWidth,
            height: window.innerHeight,
            x: 0,
            y: 0,
            isPrimary: true,
        }
    }

    // Get window position relative to screen
    const screenX = window.screenX || window.screenLeft || 0
    const screenY = window.screenY || window.screenTop || 0
    const screenWidth = window.screen.width || window.innerWidth
    const screenHeight = window.screen.height || window.innerHeight

    // Determine if this is the primary monitor (window at 0,0)
    const isPrimary = screenX === 0 && screenY === 0

    // Generate monitor ID based on position
    const monitorId = isPrimary ? 'primary' : `monitor-${screenX}-${screenY}`

    return {
        id: monitorId,
        width: screenWidth,
        height: screenHeight,
        x: screenX,
        y: screenY,
        isPrimary: isPrimary,
    }
}

/**
 * Get all detected monitors
 * Note: Browser limitations mean we can only detect monitors when windows are opened on them
 */
export function getAllMonitors() {
    const monitors = []
    
    // Get primary monitor
    const primaryMonitor = {
        id: 'primary',
        width: window.screen.width || window.innerWidth,
        height: window.screen.height || window.innerHeight,
        x: 0,
        y: 0,
        isPrimary: true,
    }
    monitors.push(primaryMonitor)

    // Try to get additional monitors from localStorage (stored when detected)
    try {
        const storedMonitors = JSON.parse(localStorage.getItem('detected_monitors') || '[]')
        storedMonitors.forEach((monitor) => {
            // Only add if not already in list
            if (!monitors.find((m) => m.id === monitor.id)) {
                monitors.push(monitor)
            }
        })
    } catch (error) {
        console.error('Error loading stored monitors:', error)
    }

    return monitors
}

/**
 * Detect and store monitor information
 */
export function detectAndStoreMonitor() {
    const currentMonitor = getCurrentMonitor()
    
    try {
        const storedMonitors = JSON.parse(localStorage.getItem('detected_monitors') || '[]')
        
        // Check if this monitor is already stored
        const existingIndex = storedMonitors.findIndex((m) => m.id === currentMonitor.id)
        
        if (existingIndex >= 0) {
            // Update existing monitor info
            storedMonitors[existingIndex] = currentMonitor
        } else {
            // Add new monitor
            storedMonitors.push(currentMonitor)
        }
        
        localStorage.setItem('detected_monitors', JSON.stringify(storedMonitors))
        
        return currentMonitor
    } catch (error) {
        console.error('Error storing monitor info:', error)
        return currentMonitor
    }
}

/**
 * Get monitor-specific layout key
 */
export function getMonitorLayoutKey(monitorId) {
    return `trading_layout_${monitorId}`
}

/**
 * Get layout for specific monitor
 */
export function getMonitorLayout(monitorId) {
    try {
        const layoutKey = getMonitorLayoutKey(monitorId)
        const layout = localStorage.getItem(layoutKey)
        return layout ? JSON.parse(layout) : null
    } catch (error) {
        console.error('Error loading monitor layout:', error)
        return null
    }
}

/**
 * Save layout for specific monitor
 */
export function saveMonitorLayout(monitorId, layout) {
    try {
        const layoutKey = getMonitorLayoutKey(monitorId)
        localStorage.setItem(layoutKey, JSON.stringify(layout))
        return true
    } catch (error) {
        console.error('Error saving monitor layout:', error)
        return false
    }
}

/**
 * Sync layout across all monitors
 */
export function syncLayoutAcrossMonitors(layout) {
    const monitors = getAllMonitors()
    monitors.forEach((monitor) => {
        saveMonitorLayout(monitor.id, layout)
    })
}

/**
 * Check if window is on a different monitor
 */
export function isOnDifferentMonitor(previousMonitorId) {
    const currentMonitor = getCurrentMonitor()
    return currentMonitor.id !== previousMonitorId
}

/**
 * Monitor window position changes
 */
export function watchMonitorChanges(callback) {
    let lastMonitorId = getCurrentMonitor().id
    
    const checkMonitor = () => {
        const currentMonitor = getCurrentMonitor()
        
        if (currentMonitor.id !== lastMonitorId) {
            lastMonitorId = currentMonitor.id
            detectAndStoreMonitor()
            callback(currentMonitor, lastMonitorId)
        }
    }
    
    // Check on window move
    window.addEventListener('move', checkMonitor)
    
    // Check periodically (in case move event doesn't fire)
    const interval = setInterval(checkMonitor, 1000)
    
    // Return cleanup function
    return () => {
        window.removeEventListener('move', checkMonitor)
        clearInterval(interval)
    }
}

