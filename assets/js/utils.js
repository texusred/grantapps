/**
 * Utility Functions for ARU Students' Union Grant Application
 * Contains helper functions used throughout the application
 */

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for HTML insertion
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.toString().replace(/[&<>"']/g, function(match) { 
        return map[match]; 
    });
}

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 * @param {number} duration - How long to show the message in milliseconds (default: 3000)
 */
function showNotification(message, duration = 3000) {
    let notification = document.getElementById('notification');
    
    if (!notification) {
        // Create notification element if it doesn't exist
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set notification text and display
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Hide after duration
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

/**
 * Formats a number as currency (GBP)
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string (e.g., "£12.34")
 */
function formatCurrency(amount) {
    const number = parseFloat(amount) || 0;
    return `£${number.toFixed(2)}`;
}

/**
 * Validates if a string is a valid email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid URL format
 */
function isValidUrl(url) {
    if (!url) return false;
    
    try {
        new URL(url);
        return true;
    } catch {
        // Check for common URL patterns without protocol
        const urlPattern = /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/;
        return urlPattern.test(url);
    }
}

/**
 * Debounces a function call to prevent excessive execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Gets the current date in YYYY-MM-DD format
 * @returns {string} The current date in ISO format
 */
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Formats a date from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    
    try {
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
        return dateString;
    } catch (error) {
        console.warn('Error formatting date:', error);
        return dateString;
    }
}

/**
 * Creates a filename-safe string from user input
 * @param {string} text - The text to make filename-safe
 * @returns {string} A safe filename string
 */
function createSafeFilename(text) {
    if (!text) return 'Grant_Application';
    
    return text
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '_')     // Replace spaces with underscores
        .substring(0, 50);        // Limit length
}

/**
 * Checks if the browser supports localStorage
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
    try {
        const test = 'localStorage-test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Safely gets an item from localStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - The default value if key doesn't exist
 * @returns {*} The stored value or default value
 */
function getStorageItem(key, defaultValue = null) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return defaultValue;
    }
    
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn('Error retrieving from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Safely sets an item in localStorage
 * @param {string} key - The key to store under
 * @param {*} value - The value to store
 * @returns {boolean} True if successful
 */
function setStorageItem(key, value) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return false;
    }
    
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Application constants
 */
const CONSTANTS = {
    CAMPUSES: ['Cambridge', 'Chelmsford', 'London', 'Writtle'],
    ORGANISATION_TYPES: ['club', 'society'],
    CATEGORIES: ['competition', 'equipment', 'advertising', 'cultural', 'educational', 'social'],
    EMAIL_ADDRESS: 'socsfinance@angliastudent.com',
    STORAGE_KEY: 'savedGrantApplications',
    TAB_ORDER: ['guidelines', 'main', 'competition', 'equipment', 'advertising', 'cultural', 'educational', 'social', 'summary']
};