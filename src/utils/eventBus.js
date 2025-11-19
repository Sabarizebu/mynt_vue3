// EventBus Utility - Backward compatibility for Vue 2 eventBus
// This provides a global event system for components that need event-based communication
// For state management, prefer Pinia stores

import { useAppStore } from '../stores/appStore'

class EventBus {
  constructor() {
    this.listeners = new Map()
  }

  // Subscribe to events (similar to eventBus.$on)
  $on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // Unsubscribe from events (similar to eventBus.$off)
  $off(event, callback) {
    if (!this.listeners.has(event)) {
      return
    }
    
    if (callback) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      // Remove all listeners for this event
      this.listeners.delete(event)
    }
  }

  // Emit events (similar to eventBus.$emit)
  $emit(event, ...args) {
    // Handle special events that should use Pinia stores
    if (event === 'snack-event') {
      const [type, msg] = args
      const appStore = useAppStore()
      appStore.showSnackbar(type, msg)
      return
    }

    if (event === 'login-event') {
      // Trigger user event to update user state
      this.$emit('user-event')
      return
    }

    // Emit to all listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          // console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
    
    // Also dispatch as DOM event for components using addEventListener
    const customEvent = new CustomEvent(event, {
      detail: args
    })
    window.dispatchEvent(customEvent)
  }
}

// Create singleton instance
const eventBus = new EventBus()

// Export singleton
export default eventBus



