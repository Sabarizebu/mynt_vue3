/**
 * Instrument Helper Utilities
 * Provides safe access and formatting for instrument objects
 */

/**
 * Format instrument name for display
 * @param {Object} instrument - Instrument object
 * @returns {String} Formatted instrument name
 */
export function formatInstrumentName(instrument) {
    if (!instrument) return 'No instrument selected'
    
    // Priority: name > tsym > exch:tsym > exch > token
    if (instrument.name && instrument.name !== 'undefined') {
        return instrument.name
    }
    
    if (instrument.tsym && instrument.tsym !== 'undefined') {
        if (instrument.exch && instrument.exch !== 'undefined') {
            return `${instrument.exch}:${instrument.tsym}`
        }
        return instrument.tsym
    }
    
    if (instrument.exch && instrument.exch !== 'undefined') {
        return instrument.exch
    }
    
    if (instrument.token && instrument.token !== 'undefined') {
        return `Token: ${instrument.token}`
    }
    
    return 'Unknown Instrument'
}

/**
 * Format instrument display text (short version)
 * @param {Object} instrument - Instrument object
 * @returns {String} Short formatted name
 */
export function formatInstrumentShort(instrument) {
    if (!instrument) return '--'
    
    if (instrument.tsym && instrument.tsym !== 'undefined') {
        return instrument.tsym
    }
    
    if (instrument.name && instrument.name !== 'undefined') {
        return instrument.name
    }
    
    return '--'
}

/**
 * Format instrument with exchange
 * @param {Object} instrument - Instrument object
 * @returns {String} Formatted with exchange
 */
export function formatInstrumentWithExchange(instrument) {
    if (!instrument) return 'No instrument selected'
    
    const name = formatInstrumentShort(instrument)
    const exch = instrument.exch && instrument.exch !== 'undefined' ? instrument.exch : ''
    
    if (exch && name !== '--') {
        return `${exch}:${name}`
    }
    
    return name
}

/**
 * Validate instrument object
 * @param {Object} instrument - Instrument object to validate
 * @returns {Boolean} True if instrument is valid
 */
export function isValidInstrument(instrument) {
    if (!instrument) return false
    
    // Check for required fields
    const hasToken = instrument.token && instrument.token !== 'undefined' && instrument.token !== null
    const hasExch = instrument.exch && instrument.exch !== 'undefined' && instrument.exch !== null
    const hasTsym = instrument.tsym && instrument.tsym !== 'undefined' && instrument.tsym !== null
    
    // At minimum, need token or (exch and tsym)
    return hasToken || (hasExch && hasTsym)
}

/**
 * Get instrument display properties safely
 * @param {Object} instrument - Instrument object
 * @returns {Object} Safe instrument properties
 */
export function getInstrumentDisplayProps(instrument) {
    if (!instrument) {
        return {
            name: 'No instrument selected',
            tsym: '--',
            exch: '--',
            token: null,
            displayName: 'No instrument selected',
            shortName: '--',
            fullName: 'No instrument selected',
        }
    }
    
    const name = instrument.name && instrument.name !== 'undefined' ? instrument.name : null
    const tsym = instrument.tsym && instrument.tsym !== 'undefined' ? instrument.tsym : '--'
    const exch = instrument.exch && instrument.exch !== 'undefined' ? instrument.exch : '--'
    const token = instrument.token && instrument.token !== 'undefined' ? instrument.token : null
    
    const displayName = formatInstrumentName(instrument)
    const shortName = formatInstrumentShort(instrument)
    const fullName = formatInstrumentWithExchange(instrument)
    
    return {
        name: name || displayName,
        tsym,
        exch,
        token,
        displayName,
        shortName,
        fullName,
    }
}

/**
 * Normalize instrument object (ensure all required fields exist)
 * @param {Object} instrument - Instrument object to normalize
 * @returns {Object} Normalized instrument object
 */
export function normalizeInstrument(instrument) {
    if (!instrument) return null
    
    return {
        ...instrument,
        name: instrument.name && instrument.name !== 'undefined' ? instrument.name : null,
        tsym: instrument.tsym && instrument.tsym !== 'undefined' ? instrument.tsym : '',
        exch: instrument.exch && instrument.exch !== 'undefined' ? instrument.exch : '',
        token: instrument.token && instrument.token !== 'undefined' ? instrument.token : null,
    }
}

/**
 * Check if instrument has required fields for API calls
 * @param {Object} instrument - Instrument object
 * @returns {Boolean} True if has required fields
 */
export function hasRequiredFields(instrument) {
    if (!instrument) return false
    
    const hasExch = instrument.exch && instrument.exch !== 'undefined' && instrument.exch !== null
    const hasToken = instrument.token && instrument.token !== 'undefined' && instrument.token !== null
    const hasTsym = instrument.tsym && instrument.tsym !== 'undefined' && instrument.tsym !== null
    
    return hasExch && hasToken && hasTsym
}

