/**
 * Security utilities for input sanitization and validation
 * Prevents XSS and injection attacks
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
