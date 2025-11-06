import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Layout Store
 * Manages trading page layouts, templates, and layout operations
 */
export const useLayoutStore = defineStore('layout', () => {
  // Current active layout
  const currentLayout = ref(null)
  const currentLayoutName = ref('Default Layout')
  
  // Saved layouts
  const savedLayouts = ref([])
  
  // Layout history for undo/redo
  const layoutHistory = ref([])
  const historyIndex = ref(-1)
  
  // Grid settings
  const gridEnabled = ref(true)
  const gridSize = ref(16) // 8, 16, 32
  const snapToGrid = ref(true)
  
  // Computed properties
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < layoutHistory.value.length - 1)
  
  const hasSavedLayouts = computed(() => savedLayouts.value.length > 0)
  
  /**
   * Save current layout
   * @param {String} name - Layout name
   * @param {Object} widgets - Widget configuration array
   */
  const saveLayout = (name, widgets) => {
    try {
      const layout = {
        id: `layout-${Date.now()}`,
        name: name || `Layout ${savedLayouts.value.length + 1}`,
        widgets: JSON.parse(JSON.stringify(widgets)), // Deep clone
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Check if layout with same name exists
      const existingIndex = savedLayouts.value.findIndex(l => l.name === name)
      if (existingIndex !== -1) {
        // Update existing layout
        savedLayouts.value[existingIndex] = {
          ...savedLayouts.value[existingIndex],
          ...layout,
          id: savedLayouts.value[existingIndex].id,
        }
      } else {
        // Add new layout
        savedLayouts.value.push(layout)
      }
      
      // Save to localStorage
      localStorage.setItem('trading_saved_layouts', JSON.stringify(savedLayouts.value))
      
      return layout
    } catch (error) {
      console.error('Error saving layout:', error)
      throw error
    }
  }
  
  /**
   * Load a saved layout
   * @param {String} layoutId - Layout ID
   */
  const loadLayout = (layoutId) => {
    try {
      const layout = savedLayouts.value.find(l => l.id === layoutId)
      if (!layout) {
        throw new Error('Layout not found')
      }
      
      // Add to history
      addToHistory(currentLayout.value)
      
      currentLayout.value = JSON.parse(JSON.stringify(layout.widgets)) // Deep clone
      currentLayoutName.value = layout.name
      
      // Update updatedAt
      layout.updatedAt = new Date().toISOString()
      localStorage.setItem('trading_saved_layouts', JSON.stringify(savedLayouts.value))
      
      return layout
    } catch (error) {
      console.error('Error loading layout:', error)
      throw error
    }
  }
  
  /**
   * Delete a saved layout
   * @param {String} layoutId - Layout ID
   */
  const deleteLayout = (layoutId) => {
    try {
      const index = savedLayouts.value.findIndex(l => l.id === layoutId)
      if (index !== -1) {
        savedLayouts.value.splice(index, 1)
        localStorage.setItem('trading_saved_layouts', JSON.stringify(savedLayouts.value))
        
        // If deleted layout was current, reset to default
        if (currentLayout.value && savedLayouts.value[index]?.id === layoutId) {
          currentLayout.value = null
          currentLayoutName.value = 'Default Layout'
        }
      }
    } catch (error) {
      console.error('Error deleting layout:', error)
      throw error
    }
  }
  
  /**
   * Duplicate a layout
   * @param {String} layoutId - Layout ID
   */
  const duplicateLayout = (layoutId) => {
    try {
      const layout = savedLayouts.value.find(l => l.id === layoutId)
      if (!layout) {
        throw new Error('Layout not found')
      }
      
      const duplicated = {
        ...layout,
        id: `layout-${Date.now()}`,
        name: `${layout.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      savedLayouts.value.push(duplicated)
      localStorage.setItem('trading_saved_layouts', JSON.stringify(savedLayouts.value))
      
      return duplicated
    } catch (error) {
      console.error('Error duplicating layout:', error)
      throw error
    }
  }
  
  /**
   * Apply preset template
   * @param {Object} template - Template configuration
   */
  const applyTemplate = (template) => {
    try {
      // Add to history
      addToHistory(currentLayout.value)
      
      // Clone template widgets
      currentLayout.value = JSON.parse(JSON.stringify(template.widgets))
      currentLayoutName.value = template.name || 'Template Layout'
      
      return currentLayout.value
    } catch (error) {
      console.error('Error applying template:', error)
      throw error
    }
  }
  
  /**
   * Set current layout
   * @param {Array} widgets - Widget configuration array
   */
  const setCurrentLayout = (widgets) => {
    currentLayout.value = widgets
  }
  
  /**
   * Update current layout name
   * @param {String} name - Layout name
   */
  const setCurrentLayoutName = (name) => {
    currentLayoutName.value = name
  }
  
  /**
   * Add layout state to history
   * @param {Array} widgets - Widget configuration
   */
  const addToHistory = (widgets) => {
    if (widgets) {
      // Remove any history after current index (for redo)
      layoutHistory.value = layoutHistory.value.slice(0, historyIndex.value + 1)
      
      // Add new state
      layoutHistory.value.push(JSON.parse(JSON.stringify(widgets)))
      historyIndex.value = layoutHistory.value.length - 1
      
      // Limit history size (keep last 50 states)
      if (layoutHistory.value.length > 50) {
        layoutHistory.value.shift()
        historyIndex.value--
      }
    }
  }
  
  /**
   * Undo layout change
   */
  const undo = () => {
    if (canUndo.value) {
      historyIndex.value--
      currentLayout.value = JSON.parse(JSON.stringify(layoutHistory.value[historyIndex.value]))
      return true
    }
    return false
  }
  
  /**
   * Redo layout change
   */
  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++
      currentLayout.value = JSON.parse(JSON.stringify(layoutHistory.value[historyIndex.value]))
      return true
    }
    return false
  }
  
  /**
   * Export layout as JSON
   * @param {String} layoutId - Layout ID (optional, exports current if not provided)
   */
  const exportLayout = (layoutId = null) => {
    try {
      let layout
      if (layoutId) {
        layout = savedLayouts.value.find(l => l.id === layoutId)
      } else {
        layout = {
          name: currentLayoutName.value,
          widgets: currentLayout.value,
        }
      }
      
      if (!layout) {
        throw new Error('Layout not found')
      }
      
      return JSON.stringify(layout, null, 2)
    } catch (error) {
      console.error('Error exporting layout:', error)
      throw error
    }
  }
  
  /**
   * Import layout from JSON
   * @param {String} jsonString - JSON string
   */
  const importLayout = (jsonString) => {
    try {
      const layout = JSON.parse(jsonString)
      
      if (!layout.widgets || !Array.isArray(layout.widgets)) {
        throw new Error('Invalid layout format')
      }
      
      const imported = {
        id: `layout-${Date.now()}`,
        name: layout.name || `Imported Layout ${savedLayouts.value.length + 1}`,
        widgets: layout.widgets,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      savedLayouts.value.push(imported)
      localStorage.setItem('trading_saved_layouts', JSON.stringify(savedLayouts.value))
      
      return imported
    } catch (error) {
      console.error('Error importing layout:', error)
      throw error
    }
  }
  
  /**
   * Load saved layouts from localStorage
   */
  const loadSavedLayouts = () => {
    try {
      const saved = localStorage.getItem('trading_saved_layouts')
      if (saved) {
        savedLayouts.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading saved layouts:', error)
      savedLayouts.value = []
    }
  }
  
  /**
   * Initialize layout store
   */
  const initialize = () => {
    loadSavedLayouts()
    
    // Initialize history with empty state
    if (layoutHistory.value.length === 0) {
      addToHistory([])
    }
  }
  
  // Grid settings
  const setGridEnabled = (enabled) => {
    gridEnabled.value = enabled
    localStorage.setItem('trading_grid_enabled', JSON.stringify(enabled))
  }
  
  const setGridSize = (size) => {
    gridSize.value = size
    localStorage.setItem('trading_grid_size', JSON.stringify(size))
  }
  
  const setSnapToGrid = (snap) => {
    snapToGrid.value = snap
    localStorage.setItem('trading_snap_to_grid', JSON.stringify(snap))
  }
  
  // Load grid settings from localStorage
  const loadGridSettings = () => {
    try {
      const gridEnabledSaved = localStorage.getItem('trading_grid_enabled')
      if (gridEnabledSaved !== null) {
        gridEnabled.value = JSON.parse(gridEnabledSaved)
      }
      
      const gridSizeSaved = localStorage.getItem('trading_grid_size')
      if (gridSizeSaved !== null) {
        gridSize.value = JSON.parse(gridSizeSaved)
      }
      
      const snapToGridSaved = localStorage.getItem('trading_snap_to_grid')
      if (snapToGridSaved !== null) {
        snapToGrid.value = JSON.parse(snapToGridSaved)
      }
    } catch (error) {
      console.error('Error loading grid settings:', error)
    }
  }
  
  // Initialize on store creation
  initialize()
  loadGridSettings()
  
  return {
    // State
    currentLayout,
    currentLayoutName,
    savedLayouts,
    layoutHistory,
    historyIndex,
    gridEnabled,
    gridSize,
    snapToGrid,
    
    // Computed
    canUndo,
    canRedo,
    hasSavedLayouts,
    
    // Actions
    saveLayout,
    loadLayout,
    deleteLayout,
    duplicateLayout,
    applyTemplate,
    setCurrentLayout,
    setCurrentLayoutName,
    addToHistory,
    undo,
    redo,
    exportLayout,
    importLayout,
    loadSavedLayouts,
    initialize,
    setGridEnabled,
    setGridSize,
    setSnapToGrid,
  }
})

