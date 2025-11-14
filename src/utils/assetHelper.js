// Helper utility for loading assets in Vite (Vue 3)
// This ensures assets work in both development and production

// Pre-load all assets using import.meta.glob for production compatibility
export const assetModules = import.meta.glob('/src/assets/**/*.{svg,png,jpg,jpeg,gif,ico,webp}', { 
    eager: true,
    import: 'default'
})

/**
 * Get asset path that works in both dev and production
 * @param {string} assetPath - Path to asset relative to /src/assets/ (e.g., 'logo.svg' or 'usermenu/1.svg')
 * @returns {string} - Resolved asset URL
 */
export const getAssetPath = (assetPath) => {
    try {
        // Normalize the path to match the glob pattern
        const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
        const fullPath = `/src/assets${normalizedPath}`
        
        // Try to get from pre-loaded modules
        if (assetModules[fullPath]) {
            return assetModules[fullPath]
        }
        
        // Fallback: use new URL for development
        if (!import.meta.env.PROD) {
            return new URL(`../assets/${assetPath}`, import.meta.url).href
        }
        
        // Production fallback: try direct path
        return `/assets/${assetPath}`
    } catch (e) {
        console.warn('Asset path error:', e, assetPath)
        return `/assets/${assetPath}`
    }
}

