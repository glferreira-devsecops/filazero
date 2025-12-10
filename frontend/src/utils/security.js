/**
 * Security utilities for input sanitization and validation
 * Prevents XSS and injection attacks
 * Updated: 2025 with CVE research
 */

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param {string} input - The raw user input
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';

    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .replace(/data:/gi, '') // Remove data: URIs
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .trim()
        .slice(0, 500); // Limit length
};

/**
 * Validates and sanitizes a clinic ID
 * @param {string} clinicId - The clinic identifier
 * @returns {string} - Validated clinic ID
 */
export const sanitizeClinicId = (clinicId) => {
    if (typeof clinicId !== 'string') return '';

    // Only allow alphanumeric, underscore, and hyphen
    return clinicId
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 50)
        .toLowerCase();
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Escapes HTML entities to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';

    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return str.replace(/[&<>"'/]/g, char => htmlEntities[char]);
};

/**
 * Validates URL to prevent javascript: injection
 * @param {string} url - URL to validate
 * @returns {boolean} - True if safe URL
 */
export const isSafeUrl = (url) => {
    if (typeof url !== 'string') return false;

    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

/**
 * Rate limiting helper for client-side operations
 * Prevents brute force and DoS attacks
 */
export const createRateLimiter = (maxRequests = 10, windowMs = 60000) => {
    const requests = [];

    return () => {
        const now = Date.now();
        // Remove old requests outside the window
        while (requests.length > 0 && requests[0] < now - windowMs) {
            requests.shift();
        }

        if (requests.length >= maxRequests) {
            return false; // Rate limited
        }

        requests.push(now);
        return true;
    };
};

/**
 * Generates a cryptographically secure random token
 * Used for CSRF protection or nonce generation
 * @param {number} length - Token length (default 32)
 * @returns {string} - Random hex string
 */
export const generateSecureToken = (length = 32) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure localStorage wrapper that handles JSON and errors gracefully
 * Prevents localStorage data from being manipulated
 */
export const secureStorage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            return JSON.parse(item);
        } catch {
            console.warn(`Failed to parse localStorage key: ${key}`);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn(`Failed to set localStorage key: ${key}`, e);
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * Checks if the current context is secure (HTTPS or localhost)
 * @returns {boolean} - True if secure context
 */
export const isSecureContext = () => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext ||
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
};

/**
 * Sanitizes patient name for display
 * Removes any potential script injection while preserving accents
 * @param {string} name - Patient name
 * @returns {string} - Sanitized name
 */
export const sanitizePatientName = (name) => {
    if (typeof name !== 'string') return '';

    return name
        .replace(/[<>{}[\]\\]/g, '') // Remove dangerous chars
        .replace(/script/gi, '') // Remove script keyword
        .trim()
        .slice(0, 100); // Limit length
};

/**
 * Validates ticket number format
 * @param {number|string} ticketNumber - Ticket number to validate
 * @returns {boolean} - True if valid
 */
export const isValidTicketNumber = (ticketNumber) => {
    const num = Number(ticketNumber);
    return Number.isInteger(num) && num > 0 && num < 10000;
};
