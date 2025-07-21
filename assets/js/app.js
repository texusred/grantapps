/**
 * ARU Students' Union Grant Application - Core Application Logic
 * Main application functionality, navigation, and form handling
 */

// ===== GLOBAL APPLICATION STATE =====
let applicationData = {
    main: {
        organisationType: '',
        organisationName: '',
        studentName: '',
        campus: '',
        applicationDate: ''
    },
    categories: {
        competition: [],
        equipment: [],
        advertising: [],
        cultural: [],
        educational: [],
        social: []
    }
};

// ===== DOM ELEMENT CACHE =====
const elements = {
    // Form elements
    organisationType: null,
    organisationName: null,
    studentName: null,
    campus: null,
    applicationDate: null,
    
    // Navigation elements
    mobileHamburger: null,
    mobileMenuOverlay: null,
    mobileCloseBtn: null,
    mobilePrevBtn: null,
    mobileNextBtn: null,
    mobilePageTitle: null,
    
    // Save/Load elements
    saveFilename: null,
    saveFilename2: null,
    loadSelect: null,
    loadSelect2: null,
    
    // Export buttons
    exportPdfBtn: null,
    exportPdfBtn2: null
};

// ===== APPLICATION INITIALIZATION =====

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeElements();
        setupEventListeners();
        setupCalculationListeners();
        initializeMobileNavigation();
        initializeGuidelinesTabs();
        updateSavedApplicationsList();
        updateSummary();
        
        // Set default date to today
        if (elements.applicationDate) {
            elements.applicationDate.value = getCurrentDate();
        }
        
        // Start with guidelines tab active
        openTab(null, 'guidelines');
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showNotification('Application failed to initialize. Please refresh the page.');
    }
});

/**
 * Cache DOM elements for better performance
 */
function initializeElements() {
    // Form elements
    elements.organisationType = document.getElementById('organisationType');
    elements.organisationName = document.getElementById('organisationName');
    elements.studentName = document.getElementById('studentName');
    elements.campus = document.getElementById('campus');
    elements.applicationDate = document.getElementById('applicationDate');
    
    // Mobile navigation
    elements.mobileHamburger = document.getElementById('mobileHamburger');
    elements.mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    elements.mobileCloseBtn = document.getElementById('mobileCloseBtn');
    elements.mobilePrevBtn = document.getElementById('mobilePrevBtn');
    elements.mobileNextBtn = document.getElementById('mobileNextBtn');
    elements.mobilePageTitle = document.getElementById('mobilePageTitle');
    
    // Save/Load elements
    elements.saveFilename = document.getElementById('saveFilename');
    elements.saveFilename2 = document.getElementById('saveFilename2');
    elements.loadSelect = document.getElementById('loadSelect');
    elements.loadSelect2 = document.getElementById('loadSelect2');
    
    // Export buttons
    elements.exportPdfBtn = document.getElementById('exportPdfBtn');
}

/**
 * Setup main event listeners
 */
function setupEventListeners() {
    // Organization type change handler
    if (elements.organisationType) {
        elements.organisationType.addEventListener('change', function() {
            toggleCompetitionTab();
            updateSummary();
        });
    }
    
    // Auto-fill filename when organization name changes
    if (elements.organisationName) {
        elements.organisationName.addEventListener('input', debounce(function() {
            const filename = createSafeFilename(this.value) + '_Grant_Application';
            if (elements.saveFilename) elements.saveFilename.value = filename;
            if (elements.saveFilename2) elements.saveFilename2.value = filename;
            updateSummary();
        }, 300));
    }
    
    // Other main form field changes
    ['studentName', 'campus', 'applicationDate'].forEach(fieldName => {
        const element = elements[fieldName];
        if (element) {
            element.addEventListener('change', debounce(updateSummary, 300));
        }
    });
    
    // PDF export button handlers
    if (elements.exportPdfBtn) {
        elements.exportPdfBtn.addEventListener('click', function(event) {
            event.preventDefault();
            if (validateMainFields()) {
                exportToPdf();
            }
        });
    }
    
    // Table event delegation for dynamic rows
    setupTableEventListeners();
}

/**
 * Setup event listeners for item tables using event delegation
 */
function setupTableEventListeners() {
    const tables = document.querySelectorAll('.item-table');
    
    tables.forEach(function(table) {
        // Event delegation for remove buttons and input changes
        table.addEventListener('click', function(event) {
            const target = event.target;
            
            // Handle remove row button clicks
            if (target.classList.contains('remove-row') || target.closest('.remove-row')) {
                const button = target.classList.contains('remove-row') ? target : target.closest('.remove-row');
                const row = button.closest('tr');
                
                if (!button.disabled && row) {
                    row.remove();
                    updateCategoryTotal(table);
                    updateRemoveButtonStates(table);
                    updateSummary();
                }
            }
        });
        
        // Event delegation for input changes
        table.addEventListener('input', debounce(function(event) {
            const target = event.target;
            
            if (target.classList.contains('item-cost') || target.classList.contains('item-quantity')) {
                updateCategoryTotal(table);
                updateSummary();
            }
        }, 300));
        
        // Initial setup for existing rows
        updateRemoveButtonStates(table);
    });
}

/**
 * Setup calculation listeners with debouncing for performance
 */
function setupCalculationListeners() {
    const debouncedCalculation = debounce(function(event) {
        const table = event.target.closest('.item-table');
        if (table) {
            updateCategoryTotal(table);
            updateSummary();
        }
    }, 300);
    
    // Apply to all existing cost and quantity inputs
    document.querySelectorAll('.item-cost, .item-quantity').forEach(input => {
        input.addEventListener('input', debouncedCalculation);
    });
}

// ===== TAB NAVIGATION SYSTEM =====

/**
 * Opens a specific tab and updates navigation state
 * @param {Event|null} event - The click event (can be null for programmatic calls)
 * @param {string} tabName - The name of the tab to open
 */
function openTab(event, tabName) {
    try {
        // Hide all tab content
        const tabContents = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = "none";
        }
        
        // Remove active class from all tab buttons
        const tabButtons = document.getElementsByClassName("tab-button");
        for (let i = 0; i < tabButtons.length; i++) {
            tabButtons[i].classList.remove("active");
        }
        
        // Show the selected tab
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.style.display = "block";
        }
        
        // Add active class to the clicked button
        if (event && event.currentTarget) {
            event.currentTarget.classList.add("active");
        } else {
            // Find and activate the tab button for this tab
            const tabButton = document.querySelector(`.tab-button[onclick*="${tabName}"]`);
            if (tabButton) {
                tabButton.classList.add("active");
            }
        }
        
        // Update mobile navigation
        updateMobilePageTitle(tabName);
        updateMobileMenuState(tabName);
        updateMobileNavButtons(tabName);
        
        // Update summary if summary tab is opened
        if (tabName === "summary") {
            updateSummary();
        }
        
        // Scroll to top of content
        if (targetTab) {
            targetTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
    } catch (error) {
        console.error('Error opening tab:', error);
        showNotification('Error switching tabs. Please try again.');
    }
}

/**
 * Navigate to the next tab in sequence
 * @param {string} currentTabId - The current tab identifier
 */
function nextTab(currentTabId) {
    try {
        const availableTabs = getAvailableTabOrder();
        const currentIndex = availableTabs.indexOf(currentTabId);
        
        // Mark current tab as completed (except summary)
        if (currentTabId !== 'summary') {
            markMobileTabCompleted(currentTabId);
        }
        
        if (currentIndex >= 0 && currentIndex < availableTabs.length - 1) {
            const nextTabName = availableTabs[currentIndex + 1];
            
            // Find and click the tab button
            const tabButton = document.querySelector(`.tab-button[onclick*="${nextTabName}"]`);
            if (tabButton) {
                const event = { currentTarget: tabButton };
                openTab(event, nextTabName);
            } else {
                // Fallback for mobile
                openTab(null, nextTabName);
            }
        }
    } catch (error) {
        console.error('Error navigating to next tab:', error);
    }
}

/**
 * Navigate to the previous tab in sequence
 * @param {string} currentTabId - The current tab identifier
 */
function prevTab(currentTabId) {
    try {
        const availableTabs = getAvailableTabOrder();
        const currentIndex = availableTabs.indexOf(currentTabId);
        
        if (currentIndex > 0) {
            const prevTabName = availableTabs[currentIndex - 1];
            
            // Find and click the tab button
            const tabButton = document.querySelector(`.tab-button[onclick*="${prevTabName}"]`);
            if (tabButton) {
                const event = { currentTarget: tabButton };
                openTab(event, prevTabName);
            } else {
                // Fallback for mobile
                openTab(null, prevTabName);
            }
        }
    } catch (error) {
        console.error('Error navigating to previous tab:', error);
    }
}

/**
 * Gets the available tab order based on organization type
 * @returns {string[]} Array of available tab names in order
 */
function getAvailableTabOrder() {
    const allTabs = CONSTANTS.TAB_ORDER;
    const orgType = elements.organisationType ? elements.organisationType.value : '';
    
    // Filter out competition tab if society is selected
    if (orgType === 'society') {
        return allTabs.filter(tab => tab !== 'competition');
    }
    
    return allTabs;
}

/**
 * Toggle visibility of Competition tab based on organisation type
 */
function toggleCompetitionTab() {
    const orgType = elements.organisationType ? elements.organisationType.value : '';
    const competitionTabButton = document.querySelector('.tab-button[onclick*="competition"]');
    const summaryCompetition = document.querySelector('.summary-competition');
    const mobileCompetitionItem = document.querySelector('.mobile-menu-item[data-tab="competition"]');
    
    const isVisible = orgType !== 'society';
    
    // Show/hide desktop tab
    if (competitionTabButton) {
        competitionTabButton.style.display = isVisible ? '' : 'none';
    }
    
    // Show/hide summary row
    if (summaryCompetition) {
        summaryCompetition.style.display = isVisible ? '' : 'none';
    }
    
    // Show/hide mobile menu item
    if (mobileCompetitionItem) {
        mobileCompetitionItem.style.display = isVisible ? '' : 'none';
    }
    
    // Add/remove class to body for CSS targeting
    if (isVisible) {
        document.body.classList.remove('society-type');
    } else {
        document.body.classList.add('society-type');
    }
}

// ===== MOBILE NAVIGATION SYSTEM =====

/**
 * Initialize mobile navigation functionality
 */
function initializeMobileNavigation() {
    try {
        // Hamburger menu toggle
        if (elements.mobileHamburger) {
            elements.mobileHamburger.addEventListener('click', toggleMobileMenu);
        }
        
        // Close button
        if (elements.mobileCloseBtn) {
            elements.mobileCloseBtn.addEventListener('click', closeMobileMenu);
        }
        
        // Overlay click to close
        if (elements.mobileMenuOverlay) {
            elements.mobileMenuOverlay.addEventListener('click', function(event) {
                if (event.target === elements.mobileMenuOverlay) {
                    closeMobileMenu();
                }
            });
        }
        
        // Menu item clicks
        document.querySelectorAll('.mobile-menu-item').forEach(function(item) {
            item.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                if (tabName) {
                    openTab(null, tabName);
                    closeMobileMenu();
                }
            });
        });
        
        // Mobile navigation buttons
        if (elements.mobilePrevBtn) {
            elements.mobilePrevBtn.addEventListener('click', function() {
                const currentTab = getCurrentActiveTab();
                if (currentTab) {
                    prevTab(currentTab);
                }
            });
        }
        
        if (elements.mobileNextBtn) {
            elements.mobileNextBtn.addEventListener('click', function() {
                const currentTab = getCurrentActiveTab();
                if (currentTab) {
                    nextTab(currentTab);
                }
            });
        }
        
    } catch (error) {
        console.error('Error initializing mobile navigation:', error);
    }
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.toggle('hidden');
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.add('hidden');
    }
}

/**
 * Get current active tab
 * @returns {string|null} The ID of the currently active tab
 */
function getCurrentActiveTab() {
    const activeTab = document.querySelector('.tab-content[style*="block"]');
    return activeTab ? activeTab.id : null;
}

/**
 * Update mobile page title
 * @param {string} tabName - The name of the current tab
 */
function updateMobilePageTitle(tabName) {
    if (!elements.mobilePageTitle) return;
    
    const tabTitles = {
        'guidelines': 'Guidelines & FAQ',
        'main': 'Main Information',
        'competition': 'Competition Fees & Travel',
        'equipment': 'Equipment',
        'advertising': 'Advertising & Promotion',
        'cultural': 'Cultural Events',
        'educational': 'Educational Events',
        'social': 'Social & Recreational Events',
        'summary': 'Summary'
    };
    
    elements.mobilePageTitle.textContent = tabTitles[tabName] || tabName;
}

/**
 * Update mobile menu active state
 * @param {string} tabName - The name of the current tab
 */
function updateMobileMenuState(tabName) {
    document.querySelectorAll('.mobile-menu-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });
}

/**
 * Update mobile navigation buttons state
 * @param {string} tabName - The name of the current tab
 */
function updateMobileNavButtons(tabName) {
    if (!elements.mobilePrevBtn || !elements.mobileNextBtn) return;
    
    const availableTabs = getAvailableTabOrder();
    const currentIndex = availableTabs.indexOf(tabName);
    
    // Update previous button
    elements.mobilePrevBtn.disabled = currentIndex <= 0;
    
    // Update next button
    elements.mobileNextBtn.disabled = currentIndex >= availableTabs.length - 1;
}

/**
 * Mark mobile menu item as completed
 * @param {string} tabName - The name of the tab to mark as completed
 */
function markMobileTabCompleted(tabName) {
    const menuItem = document.querySelector(`.mobile-menu-item[data-tab="${tabName}"]`);
    if (menuItem && !menuItem.classList.contains('completed')) {
        menuItem.classList.add('completed');
        const icon = menuItem.querySelector('.mobile-completion-icon');
        if (icon && tabName !== 'summary') {
            icon.textContent = '✓';
        }
    }
}

// ===== TABLE MANAGEMENT SYSTEM =====

/**
 * Add a new item row to a table
 * @param {string} tableId - The ID of the table to add a row to
 */
function addItemRow(tableId) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Table with ID ${tableId} not found`);
            return;
        }
        
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.error(`tbody not found in table ${tableId}`);
            return;
        }
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="item-name" required aria-label="Item name"></td>
            <td><input type="text" class="item-source" required aria-label="Source or link"></td>
            <td><textarea class="item-justification" rows="2" required aria-label="Justification"></textarea></td>
            <td><input type="number" class="item-quantity" min="1" step="1" value="1" required aria-label="Quantity"></td>
            <td><input type="number" class="item-cost" min="0" step="0.01" required aria-label="Unit cost"></td>
            <td class="text-center">
                <button type="button" class="delete-btn remove-row" aria-label="Remove this item">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(newRow);
        
        // Update remove button states
        updateRemoveButtonStates(table);
        
        // Add event listeners for the new inputs
        const costInput = newRow.querySelector('.item-cost');
        const quantityInput = newRow.querySelector('.item-quantity');
        
        const debouncedUpdate = debounce(function() {
            updateCategoryTotal(table);
            updateSummary();
        }, 300);
        
        if (costInput) costInput.addEventListener('input', debouncedUpdate);
        if (quantityInput) quantityInput.addEventListener('input', debouncedUpdate);
        
        // Focus on the first input of the new row
       // const firstInput = newRow.querySelector('.item-name');
       // if (firstInput) {
       //     firstInput.focus();
      //  }
        
    } catch (error) {
        console.error('Error adding item row:', error);
        showNotification('Error adding new item. Please try again.');
    }
}

/**
 * Update remove button states for a table
 * @param {HTMLElement} table - The table element
 */
function updateRemoveButtonStates(table) {
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    const removeButtons = tbody.querySelectorAll('.remove-row');
    
    // Disable remove buttons if only one row exists
    const shouldDisable = rows.length <= 1;
    
    removeButtons.forEach(button => {
        button.disabled = shouldDisable;
    });
}

/**
 * Update the total for a category table
 * @param {HTMLElement} table - The table element
 * @returns {number} The calculated total
 */
function updateCategoryTotal(table) {
    if (!table) return 0;
    
    const rows = table.querySelectorAll('tbody tr');
    let total = 0;
    
    rows.forEach(row => {
        const costInput = row.querySelector('.item-cost');
        const quantityInput = row.querySelector('.item-quantity');
        
        if (costInput && quantityInput) {
            const cost = parseFloat(costInput.value) || 0;
            const quantity = parseInt(quantityInput.value) || 0;
            total += cost * quantity;
        }
    });
    
    const totalElement = table.querySelector('.category-total');
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    return total;
}

// ===== SUMMARY AND CALCULATIONS =====

/**
 * Update the summary tab with current application data
 */
function updateSummary() {
    try {
        // Update main information display
        updateSummaryMainInfo();
        
        // Update category totals and grand total
        updateSummaryCategoryTotals();
        
        // Hide competition row if society
        const orgType = elements.organisationType ? elements.organisationType.value : '';
        const summaryCompetition = document.querySelector('.summary-competition');
        if (summaryCompetition) {
            summaryCompetition.style.display = orgType === 'society' ? 'none' : '';
        }
        
    } catch (error) {
        console.error('Error updating summary:', error);
    }
}

/**
 * Update main information in summary
 */
function updateSummaryMainInfo() {
    const summaryElements = {
        type: document.getElementById('summary-type'),
        name: document.getElementById('summary-name'),
        student: document.getElementById('summary-student'),
        campus: document.getElementById('summary-campus'),
        date: document.getElementById('summary-date')
    };
    
    // Update organization type
    if (summaryElements.type && elements.organisationType) {
        const orgType = elements.organisationType.value;
        summaryElements.type.textContent = orgType ? orgType.charAt(0).toUpperCase() + orgType.slice(1) : '';
    }
    
    // Update organization name
    if (summaryElements.name && elements.organisationName) {
        summaryElements.name.textContent = elements.organisationName.value;
    }
    
    // Update student name
    if (summaryElements.student && elements.studentName) {
        summaryElements.student.textContent = elements.studentName.value;
    }
    
    // Update campus
    if (summaryElements.campus && elements.campus) {
        summaryElements.campus.textContent = elements.campus.value;
    }
    
    // Update and format date
    if (summaryElements.date && elements.applicationDate) {
        const dateValue = elements.applicationDate.value;
        summaryElements.date.textContent = dateValue ? formatDateForDisplay(dateValue) : '';
    }
}

/**
 * Update category totals in summary
 */
function updateSummaryCategoryTotals() {
    let grandTotal = 0;
    
    CONSTANTS.CATEGORIES.forEach(categoryId => {
        const table = document.getElementById(`${categoryId}Table`);
        const totalElement = document.getElementById(`summary-${categoryId}-total`);
        
        if (table && totalElement) {
            const total = updateCategoryTotal(table);
            totalElement.textContent = formatCurrency(total);
            grandTotal += total;
        }
    });
    
    // Update grand total
    const grandTotalElement = document.getElementById('summary-grand-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = formatCurrency(grandTotal);
    }
}

// ===== FORM VALIDATION =====

/**
 * Validate main information fields
 * @returns {boolean} True if all fields are valid
 */
function validateMainFields() {
    const validationMessage = getOrCreateValidationMessage();
    const errors = [];
    
    // Clear previous validation styles
    clearValidationStyles();
    
    // Validate each required field
    const validations = [
        { element: elements.organisationType, message: 'Please select an organisation type.' },
        { element: elements.organisationName, message: 'Please enter a club/society name.', checkEmpty: true },
        { element: elements.studentName, message: 'Please enter a student name.', checkEmpty: true },
        { element: elements.campus, message: 'Please select a campus.' },
        { element: elements.applicationDate, message: 'Please select a date.' }
    ];
    
    validations.forEach(validation => {
        const { element, message, checkEmpty } = validation;
        
        if (!element) return;
        
        let isValid = true;
        
        if (checkEmpty) {
            isValid = element.value && element.value.trim();
        } else {
            isValid = element.value;
        }
        
        if (!isValid) {
            errors.push(message);
            element.classList.add('invalid-field');
        } else {
            element.classList.remove('invalid-field');
        }
    });
    
    // Display validation results
    if (errors.length > 0) {
        showValidationErrors(validationMessage, errors);
        return false;
    } else {
        hideValidationMessage(validationMessage);
        return true;
    }
}

/**
 * Get or create validation message container
 * @returns {HTMLElement} The validation message element
 */
function getOrCreateValidationMessage() {
    let validationMessage = document.getElementById('validationMessage');
    
    if (!validationMessage) {
        validationMessage = document.createElement('div');
        validationMessage.id = 'validationMessage';
        validationMessage.className = 'validation-message';
        
        const mainTab = document.getElementById('main');
        if (mainTab) {
            mainTab.insertBefore(validationMessage, mainTab.firstChild);
        }
    }
    
    return validationMessage;
}

/**
 * Clear validation styles from all form elements
 */
function clearValidationStyles() {
    document.querySelectorAll('.invalid-field').forEach(element => {
        element.classList.remove('invalid-field');
    });
}

/**
 * Show validation errors to the user
 * @param {HTMLElement} container - The validation message container
 * @param {string[]} errors - Array of error messages
 */
function showValidationErrors(container, errors) {
    container.innerHTML = `
        <div class="alert alert-danger">
            <strong>Please correct the following errors:</strong>
            <ul>
                ${errors.map(error => `<li>${escapeHtml(error)}</li>`).join('')}
            </ul>
        </div>
    `;
    container.style.display = 'block';
    
    // Switch to main tab to show errors
    openTab(null, 'main');
    
    // Scroll to validation message
    container.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Hide validation message
 * @param {HTMLElement} container - The validation message container
 */
function hideValidationMessage(container) {
    if (container) {
        container.style.display = 'none';
    }
}

// ===== GUIDELINES TAB SYSTEM =====

/**
 * Initialize guidelines internal tab navigation
 */
function initializeGuidelinesTabs() {
    try {
        const tabButtons = document.querySelectorAll('.guidelines-tab-btn');
        const tabPanes = document.querySelectorAll('.guidelines-tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Show target tab pane
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
        
        console.log('Guidelines tabs initialized successfully');
    } catch (error) {
        console.error('Error initializing guidelines tabs:', error);
    }
}

/**
 * Toggle FAQ items in the guidelines section
 * @param {HTMLElement} button - The FAQ header button that was clicked
 */
function toggleGuidelinesFaq(button) {
    try {
        const body = button.nextElementSibling;
        const chevron = button.querySelector('.bi-chevron-down');
        
        if (!body || !chevron) {
            console.warn('FAQ toggle: Missing body or chevron element');
            return;
        }
        
        const isHidden = body.style.display === 'none' || body.style.display === '';
        
        if (isHidden) {
            // Show the FAQ answer
            body.style.display = 'block';
            chevron.style.transform = 'rotate(180deg)';
        } else {
            // Hide the FAQ answer
            body.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
        }
    } catch (error) {
        console.error('Error toggling FAQ:', error);
    }
}

// Make the FAQ toggle function available globally for onclick handlers
window.toggleGuidelinesFaq = toggleGuidelinesFaq;

// Make functions available globally for onclick handlers
window.openTab = openTab;
window.nextTab = nextTab;
window.prevTab = prevTab;
window.addItemRow = addItemRow;
