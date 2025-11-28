import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Centralized Quote Store
 * Single source of truth for all WebSocket quote data across the application
 *
 * Usage:
 * 1. WebSocket callbacks update this store with new quote data
 * 2. All components read from this store instead of managing their own state
 * 3. Vue reactivity automatically updates UI when quotes change
 */
export const useQuoteStore = defineStore('quote', () => {
    // State: Map of token -> quote data
    // Using a reactive Map for efficient lookups and updates
    const quotes = ref(new Map())

    // Get quote by token
    const getQuote = (token) => {
        const tokenStr = String(token)
        return quotes.value.get(tokenStr)
    }

    // Get multiple quotes by tokens
    const getQuotes = (tokens) => {
        return tokens.map(token => getQuote(token)).filter(q => q !== undefined)
    }

    // Update a single quote
    const updateQuote = (token, quoteData) => {
        const tokenStr = String(token)

        // Get existing quote or create new one
        const existing = quotes.value.get(tokenStr) || {}

        // Normalize volume field to prevent flickering
        // CRITICAL: For logged-in users, WebSocket sends socketVolume (real-time accumulated volume)
        // For non-logged-in users, use volume field
        // Priority: socketVolume > volume > v > vol > existing
        const volumeValue = quoteData.socketVolume !== undefined ? Number(quoteData.socketVolume) :
            (quoteData.volume !== undefined ? Number(quoteData.volume) :
                (quoteData.v !== undefined ? Number(quoteData.v) :
                    (quoteData.vol !== undefined ? Number(quoteData.vol) : existing.volume)))

        // Merge new data with existing
        const updated = {
            ...existing,
            token: tokenStr,
            exchange: quoteData.exchange || quoteData.e || existing.exchange,
            tsym: quoteData.tsym || quoteData.ts || existing.tsym,
            ltp: quoteData.ltp !== undefined ? Number(quoteData.ltp) : (quoteData.lp !== undefined ? Number(quoteData.lp) : existing.ltp),
            ch: quoteData.ch !== undefined ? Number(quoteData.ch) : existing.ch,
            chp: quoteData.chp !== undefined ? Number(quoteData.chp) : (quoteData.pc !== undefined ? Number(quoteData.pc) : existing.chp),
            open: quoteData.open_price !== undefined ? Number(quoteData.open_price) : (quoteData.o !== undefined ? Number(quoteData.o) : existing.open),
            high: quoteData.high_price !== undefined ? Number(quoteData.high_price) : (quoteData.h !== undefined ? Number(quoteData.h) : existing.high),
            low: quoteData.low_price !== undefined ? Number(quoteData.low_price) : (quoteData.l !== undefined ? Number(quoteData.l) : existing.low),
            close: quoteData.prev_close_price !== undefined ? Number(quoteData.prev_close_price) : (quoteData.c !== undefined ? Number(quoteData.c) : existing.close),
            // CRITICAL: Always keep volume and v in sync to prevent flickering between different values
            volume: volumeValue,
            v: volumeValue,
            lastUpdateTime: Date.now()
        }

        // CRITICAL FIX: Update the map in place without creating new Map
        // This prevents massive memory leaks from creating thousands of Map objects
        quotes.value.set(tokenStr, updated)

        return updated
    }

    // Update multiple quotes at once
    const updateQuotes = (quotesArray) => {
        quotesArray.forEach(quoteData => {
            const token = quoteData.token || quoteData.tk
            if (token) {
                updateQuote(token, quoteData)
            }
        })
    }

    // Clear all quotes
    const clearQuotes = () => {
        quotes.value.clear()
        quotes.value = new Map(quotes.value)
    }

    // Remove a specific quote
    const removeQuote = (token) => {
        const tokenStr = String(token)
        quotes.value.delete(tokenStr)
    }

    // Remove multiple quotes
    const removeQuotes = (tokens) => {
        tokens.forEach(token => {
            const tokenStr = String(token)
            quotes.value.delete(tokenStr)
        })
    }

    // Clean up stale quotes (older than specified time in ms)
    const cleanupStaleQuotes = (maxAgeMs = 30 * 60 * 1000) => {
        // Default: 30 minutes
        const now = Date.now()
        const tokensToRemove = []

        quotes.value.forEach((quote, token) => {
            if (quote.lastUpdateTime && (now - quote.lastUpdateTime) > maxAgeMs) {
                tokensToRemove.push(token)
            }
        })

        if (tokensToRemove.length > 0) {
            console.log(`[QuoteStore] Cleaning up ${tokensToRemove.length} stale quotes`)
            removeQuotes(tokensToRemove)
        }

        return tokensToRemove.length
    }

    // Computed: Get all quotes as array
    const allQuotes = computed(() => {
        return Array.from(quotes.value.values())
    })

    // Computed: Get quote count
    const quoteCount = computed(() => {
        return quotes.value.size
    })

    return {
        // State
        quotes,

        // Getters
        getQuote,
        getQuotes,
        allQuotes,
        quoteCount,

        // Actions
        updateQuote,
        updateQuotes,
        clearQuotes,
        removeQuote,
        removeQuotes,
        cleanupStaleQuotes
    }
})
