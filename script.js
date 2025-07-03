// Global variables
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculation listeners
    setupCalculationListeners();
    
    // Check for organisation type changes
    document.getElementById('organisationType').addEventListener('change', function() {
        toggleCompetitionTab();
    });
    
    // Update saved applications list
    updateSavedApplicationsList();
    
    // Setup direct event handlers for "Add Item" buttons
    document.querySelectorAll('.item-table').forEach(function(table) {
        table.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-row') || e.target.closest('.remove-row')) {
                const button = e.target.classList.contains('remove-row') ? e.target : e.target.closest('.remove-row');
                const row = button.closest('tr');
                
                if (!button.disabled) {
                    row.remove();
                    updateCategoryTotal(table);
                    updateSummary();
                }
            }
        });
        
        // Add listeners for cost and quantity inputs to update totals
        table.querySelectorAll('.item-cost, .item-quantity').forEach(input => {
            input.addEventListener('input', function() {
                updateCategoryTotal(table);
                updateSummary();
            });
        });
    });
    
    // Update file name when organisation name changes
    document.getElementById('organisationName').addEventListener('input', function() {
        const saveFilename = document.getElementById('saveFilename');
        if (!saveFilename.value || saveFilename.value === saveFilename.defaultValue) {
            saveFilename.value = this.value + ' Grant Application';
        }
    });
    
    // Add validation to PDF export and Email buttons
    document.getElementById('exportPdfBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (validateMainFields()) {
            exportToPdf();
        }
    });
    
    document.getElementById('exportPdfBtn2').addEventListener('click', function(e) {
        e.preventDefault();
        if (validateMainFields()) {
            exportToPdf();
        }
    });

    // Initialize mobile navigation
    initializeMobileNavigation();
    
    // Initialize for first time use
    updateSummary();
    
    // Start with guidelines tab active
    openTab(null, 'guidelines');
});

// Initialize mobile navigation
function initializeMobileNavigation() {
    // Mobile hamburger menu
    const mobileHamburger = document.getElementById('mobileHamburger');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobilePrevBtn = document.getElementById('mobilePrevBtn');
    const mobileNextBtn = document.getElementById('mobileNextBtn');
    
    // Hamburger menu toggle
    if (mobileHamburger) {
        mobileHamburger.addEventListener('click', function() {
            toggleMobileMenu();
        });
    }
    
    // Close button
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', function() {
            closeMobileMenu();
        });
    }
    
    // Overlay click to close
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function(e) {
            if (e.target === mobileMenuOverlay) {
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
    if (mobilePrevBtn) {
        mobilePrevBtn.addEventListener('click', function() {
            const currentTab = getCurrentActiveTab();
            if (currentTab) {
                prevTab(currentTab);
            }
        });
    }
    
    if (mobileNextBtn) {
        mobileNextBtn.addEventListener('click', function() {
            const currentTab = getCurrentActiveTab();
            if (currentTab) {
                nextTab(currentTab);
            }
        });
    }
}

// Mobile menu functions
function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.toggle('hidden');
    }
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function openMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// Get current active tab
function getCurrentActiveTab() {
    const activeTab = document.querySelector('.tab-content[style*="block"]');
    return activeTab ? activeTab.id : null;
}

// Update mobile page title
function updateMobilePageTitle(tabName) {
    const mobilePageTitle = document.getElementById('mobilePageTitle');
    if (!mobilePageTitle) return;
    
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
    
    mobilePageTitle.textContent = tabTitles[tabName] || tabName;
}

// Update mobile menu active state
function updateMobileMenuState(tabName) {
    // Update active menu item
    document.querySelectorAll('.mobile-menu-item').forEach(function(item) {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        }
    });
}

// Update mobile navigation buttons
function updateMobileNavButtons(tabName) {
    const mobilePrevBtn = document.getElementById('mobilePrevBtn');
    const mobileNextBtn = document.getElementById('mobileNextBtn');
    
    if (!mobilePrevBtn || !mobileNextBtn) return;
    
    const tabOrder = ['guidelines', 'main', 'competition', 'equipment', 'advertising', 'cultural', 'educational', 'social', 'summary'];
    const orgType = document.getElementById('organisationType').value;
    
    // Filter out competition tab if society
    let availableTabs = tabOrder;
    if (orgType === 'society') {
        availableTabs = tabOrder.filter(tab => tab !== 'competition');
    }
    
    const currentIndex = availableTabs.indexOf(tabName);
    
    // Update previous button
    if (currentIndex <= 0) {
        mobilePrevBtn.disabled = true;
    } else {
        mobilePrevBtn.disabled = false;
    }
    
    // Update next button
    if (currentIndex >= availableTabs.length - 1) {
        mobileNextBtn.disabled = true;
    } else {
        mobileNextBtn.disabled = false;
    }
}

// Mark mobile menu item as completed
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

// Email the application
function emailApplication() {
    // Get application name
    const appName = document.getElementById('organisationName').value || 'Grant Application';
    
    // Create email link
    const subject = encodeURIComponent(`${appName} - Grant Application`);
    const body = encodeURIComponent(
        `Dear Students' Union Finance Team,\n\n` +
        `Please find attached my grant application for ${appName}.\n\n` +
        `I have exported the PDF from your online application system and attached it to this email.\n\n` +
        `Kind regards,\n` +
        `${document.getElementById('studentName').value}`
    );
    
    // Remind to attach the PDF
    showNotification('Please remember to attach your exported PDF to this email before sending.');
    
    // Open email client
    window.location.href = `mailto:socsfinance@angliastudent.com?subject=${subject}&body=${body}`;
}

// Show notification
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    if (!notification) {
        // Create notification element if it doesn't exist
        const newNotification = document.createElement('div');
        newNotification.id = 'notification';
        newNotification.className = 'notification';
        document.body.appendChild(newNotification);
        
        // Set notification text and display
        newNotification.textContent = message;
        newNotification.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            newNotification.style.display = 'none';
        }, duration);
    } else {
        // Use existing notification
        notification.textContent = message;
        notification.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Validate main information fields
function validateMainFields() {
    // Fields to validate
    const organisationType = document.getElementById('organisationType');
    const organisationName = document.getElementById('organisationName');
    const studentName = document.getElementById('studentName');
    const campus = document.getElementById('campus');
    const applicationDate = document.getElementById('applicationDate');
    
    // Create validation message container if it doesn't exist
    let validationMessage = document.getElementById('validationMessage');
    if (!validationMessage) {
        validationMessage = document.createElement('div');
        validationMessage.id = 'validationMessage';
        validationMessage.className = 'validation-message';
        const mainTab = document.getElementById('main');
        if (mainTab) {
            mainTab.appendChild(validationMessage);
        }
    }
    
    // Check each field
    let isValid = true;
    let errorMessages = [];
    
    if (!organisationType.value) {
        isValid = false;
        errorMessages.push('Please select an organisation type.');
        organisationType.classList.add('invalid-field');
    } else {
        organisationType.classList.remove('invalid-field');
    }
    
    if (!organisationName.value.trim()) {
        isValid = false;
        errorMessages.push('Please enter a club/society name.');
        organisationName.classList.add('invalid-field');
    } else {
        organisationName.classList.remove('invalid-field');
    }
    
    if (!studentName.value.trim()) {
        isValid = false;
        errorMessages.push('Please enter a student name.');
        studentName.classList.add('invalid-field');
    } else {
        studentName.classList.remove('invalid-field');
    }

    if (!campus.value.trim()) {
        isValid = false;
        errorMessages.push('Please select a valid campus.');
        campus.classList.add('invalid-field');
    } else {
        campus.classList.remove('invalid-field');
    }
    
    if (!applicationDate.value) {
        isValid = false;
        errorMessages.push('Please select a date.');
        applicationDate.classList.add('invalid-field');
    } else {
        applicationDate.classList.remove('invalid-field');
    }
    
    // If validation fails, show message and switch to main tab
    if (!isValid) {
        validationMessage.innerHTML = '<div class="alert alert-danger">' +
            '<strong>Please correct the following errors:</strong>' +
            '<ul>' +
            errorMessages.map(function(msg) { return '<li>' + msg + '</li>'; }).join('') +
            '</ul>' +
            '</div>';
        validationMessage.style.display = 'block';
        
        // Switch to main tab to show errors
        openTab(null, 'main');
        
        // Make the validation message visible by scrolling to it
        validationMessage.scrollIntoView({ behavior: 'smooth' });
        
        return false;
    } else {
        // Clear any previous validation messages
        validationMessage.style.display = 'none';
        return true;
    }
}

// Update this function in script.js
function openTab(evt, tabName) {
    var i, tabcontent, tabbuttons;
    
    // Hide all tab content
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Remove the "active" class from all tab buttons
    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
    }
    
    // Show the current tab and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    
    // Add active class to the clicked button
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
    } else {
        // Find and activate the tab button for this tab
        const tabButton = document.querySelector(`.tab-button[onclick*="${tabName}"]`);
        if (tabButton) {
            tabButton.className += " active";
        }
    }
    
    // Update mobile navigation
    updateMobilePageTitle(tabName);
    updateMobileMenuState(tabName);
    updateMobileNavButtons(tabName);
    
    // If summary tab is opened, update calculations
    if (tabName === "summary") {
        updateSummary();
    }
}

// Navigate to the next tab
function nextTab(currentTabId) {
    const tabOrder = ['guidelines', 'main', 'competition', 'equipment', 'advertising', 'cultural', 'educational', 'social', 'summary'];
    let currentIndex = tabOrder.indexOf(currentTabId);
    
    // Mark current tab as completed (except summary)
    if (currentTabId !== 'summary') {
        markMobileTabCompleted(currentTabId);
    }
    
    if (currentIndex >= 0 && currentIndex < tabOrder.length - 1) {
        // Move to next index
        let nextIndex = currentIndex + 1;
        
        // Skip competition tab if society is selected
        if (tabOrder[nextIndex] === 'competition' && 
            document.getElementById('organisationType').value === 'society') {
            nextIndex++;
        }
        
        // Make sure we don't go beyond the array bounds
        if (nextIndex < tabOrder.length) {
            // Simulate click on the tab by creating an event object and calling openTab
            const tabButtons = document.getElementsByClassName('tab-button');
            for (let i = 0; i < tabButtons.length; i++) {
                if (tabButtons[i].getAttribute('onclick') && tabButtons[i].getAttribute('onclick').includes(tabOrder[nextIndex])) {
                    // Create a simple event object
                    const evt = { currentTarget: tabButtons[i] };
                    openTab(evt, tabOrder[nextIndex]);
                    break;
                }
            }
            
            // If no desktop tab button found, just open the tab directly (mobile)
            if (!document.querySelector(`.tab-button[onclick*="${tabOrder[nextIndex]}"]`)) {
                openTab(null, tabOrder[nextIndex]);
            }
        }
    }
}

// Navigate to the previous tab
function prevTab(currentTabId) {
    const tabOrder = ['guidelines', 'main', 'competition', 'equipment', 'advertising', 'cultural', 'educational', 'social', 'summary'];
    let currentIndex = tabOrder.indexOf(currentTabId);
    
    if (currentIndex > 0) {
        // Move to previous index
        let prevIndex = currentIndex - 1;
        
        // Skip competition tab if society is selected
        if (tabOrder[prevIndex] === 'competition' && 
            document.getElementById('organisationType').value === 'society') {
            prevIndex--;
        }
        
        // Make sure we don't go beyond the array bounds
        if (prevIndex >= 0) {
            // Simulate click on the tab by creating an event object and calling openTab
            const tabButtons = document.getElementsByClassName('tab-button');
            for (let i = 0; i < tabButtons.length; i++) {
                if (tabButtons[i].getAttribute('onclick') && tabButtons[i].getAttribute('onclick').includes(tabOrder[prevIndex])) {
                    // Create a simple event object
                    const evt = { currentTarget: tabButtons[i] };
                    openTab(evt, tabOrder[prevIndex]);
                    break;
                }
            }
            
            // If no desktop tab button found, just open the tab directly (mobile)
            if (!document.querySelector(`.tab-button[onclick*="${tabOrder[prevIndex]}"]`)) {
                openTab(null, tabOrder[prevIndex]);
            }
        }
    }
}

// Toggle visibility of Competition tab based on organisation type
function toggleCompetitionTab() {
    const orgType = document.getElementById('organisationType').value;
    const competitionTabButton = document.querySelector('.tab-button[onclick*="competition"]');
    const summaryCompetition = document.querySelector('.summary-competition');
    const mobileCompetitionItem = document.querySelector('.mobile-menu-item[data-tab="competition"]');
    
    if (orgType === 'society') {
        if (competitionTabButton) competitionTabButton.style.display = 'none';
        if (summaryCompetition) summaryCompetition.style.display = 'none';
        if (mobileCompetitionItem) mobileCompetitionItem.style.display = 'none';
        
        // Add class to body for mobile CSS targeting
        document.body.classList.add('society-type');
    } else {
        if (competitionTabButton) competitionTabButton.style.display = '';
        if (summaryCompetition) summaryCompetition.style.display = '';
        if (mobileCompetitionItem) mobileCompetitionItem.style.display = '';
        
        // Remove class from body
        document.body.classList.remove('society-type');
    }
    
    updateSummary();
}

// Add a new item row to a table
function addItemRow(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td><input type="text" class="item-name" required aria-label="Item name"></td>
        <td><input type="text" class="item-source" required aria-label="Source or link"></td>
        <td><textarea class="item-justification" rows="2" required aria-label="Justification"></textarea></td>
        <td><input type="number" class="item-quantity" min="1" step="1" value="1" required></td>
        <td><input type="number" class="item-cost" min="0" step="0.01" required></td>
        <td class="text-center">
            <button type="button" class="delete-btn remove-row">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // Enable all remove buttons if we have more than 1 row
    if (tbody.querySelectorAll('tr').length > 1) {
        tbody.querySelectorAll('.remove-row').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    // Add event listeners for the cost and quantity inputs
    const costInput = newRow.querySelector('.item-cost');
    const quantityInput = newRow.querySelector('.item-quantity');
    
    costInput.addEventListener('input', function() {
        updateCategoryTotal(table);
        updateSummary();
    });
    
    quantityInput.addEventListener('input', function() {
        updateCategoryTotal(table);
        updateSummary();
    });
    
    // Focus on the first input of the new row
    newRow.querySelector('.item-name').focus();
}

// Update the total for a category (now includes quantity calculation)
function updateCategoryTotal(table) {
    const rows = table.querySelectorAll('tbody tr');
    let total = 0;
    
    rows.forEach(row => {
        const costInput = row.querySelector('.item-cost');
        const quantityInput = row.querySelector('.item-quantity');
        
        const cost = parseFloat(costInput.value) || 0;
        const quantity = parseInt(quantityInput.value) || 0;
        
        total += cost * quantity;
    });
    
    const totalElement = table.querySelector('.category-total');
    if (totalElement) {
        totalElement.textContent = `£${total.toFixed(2)}`;
    }
    
    return total;
}

// Setup listeners for calculations
function setupCalculationListeners() {
    document.querySelectorAll('.item-cost, .item-quantity').forEach(input => {
        input.addEventListener('input', function() {
            const table = this.closest('.item-table');
            if (table) {
                updateCategoryTotal(table);
                updateSummary();
            }
        });
    });
}

// Update the summary tab
function updateSummary() {
    // Update main information
    const orgType = document.getElementById('organisationType').value;
    const orgName = document.getElementById('organisationName').value;
    const studentName = document.getElementById('studentName').value;
    const campus = document.getElementById('campus').value;
    const appDate = document.getElementById('applicationDate').value;
    
    const summaryType = document.getElementById('summary-type');
    const summaryName = document.getElementById('summary-name');
    const summaryStudent = document.getElementById('summary-student');
    const summaryCampus = document.getElementById('summary-campus');
    const summaryDate = document.getElementById('summary-date');
    
    if (summaryType) summaryType.textContent = orgType.charAt(0).toUpperCase() + orgType.slice(1);
    if (summaryName) summaryName.textContent = orgName;
    if (summaryStudent) summaryStudent.textContent = studentName;
    if (summaryCampus) summaryCampus.textContent = campus;
    
    // Format date
    if (appDate && summaryDate) {
        const dateParts = appDate.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        summaryDate.textContent = formattedDate;
    } else if (summaryDate) {
        summaryDate.textContent = '';
    }
    
    // Update category totals
    const categories = [
        { id: 'competition', label: 'Competition Fees & Travel' },
        { id: 'equipment', label: 'Equipment' },
        { id: 'advertising', label: 'Advertising & Promotion' },
        { id: 'cultural', label: 'Cultural Events' },
        { id: 'educational', label: 'Educational Events' },
        { id: 'social', label: 'Social & Recreational Events' }
    ];
    
    let grandTotal = 0;
    
    categories.forEach(category => {
        const table = document.getElementById(`${category.id}Table`);
        const totalElement = document.getElementById(`summary-${category.id}-total`);
        
        if (table && totalElement) {
            const total = updateCategoryTotal(table);
            totalElement.textContent = `£${total.toFixed(2)}`;
            grandTotal += total;
        }
    });
    
    // Update grand total
    const grandTotalElement = document.getElementById('summary-grand-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = `£${grandTotal.toFixed(2)}`;
    }
    
    // Hide competition row if society
    const summaryCompetition = document.querySelector('.summary-competition');
    if (summaryCompetition) {
        if (orgType === 'society') {
            summaryCompetition.style.display = 'none';
        } else {
            summaryCompetition.style.display = '';
        }
    }
}

// Save application progress
function saveProgress() {
    // Get application data
    collectApplicationData();
    
    // Get filename
    const filename = document.getElementById('saveFilename').value || 'Grant Application';
    
    // Save to localStorage
    const saveData = {
        name: filename,
        date: new Date().toISOString(),
        data: applicationData
    };
    
    // Get existing saved applications
    let savedApplications = JSON.parse(localStorage.getItem('savedGrantApplications')) || {};
    
    // Add new save or update existing
    const saveKey = filename.replace(/\s+/g, '_').toLowerCase();
    savedApplications[saveKey] = saveData;
    
    // Save back to localStorage
    localStorage.setItem('savedGrantApplications', JSON.stringify(savedApplications));
    
    // Show success alert
    showNotification(`Application "${filename}" saved successfully.`);
    
    // Update saved applications list
    updateSavedApplicationsList();
}

// Collect all application data (updated to include quantity)
function collectApplicationData() {
    // Main information
    applicationData.main = {
        organisationType: document.getElementById('organisationType').value,
        organisationName: document.getElementById('organisationName').value,
        studentName: document.getElementById('studentName').value,
        campus: document.getElementById('campus').value,
        applicationDate: document.getElementById('applicationDate').value
    };
    
    // Category data
    const categories = ['competition', 'equipment', 'advertising', 'cultural', 'educational', 'social'];
    
    categories.forEach(category => {
        applicationData.categories[category] = [];
        const table = document.getElementById(`${category}Table`);
        
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const nameInput = row.querySelector('.item-name');
                const sourceInput = row.querySelector('.item-source');
                const justificationInput = row.querySelector('.item-justification');
                const quantityInput = row.querySelector('.item-quantity');
                const costInput = row.querySelector('.item-cost');
                
                if (nameInput && sourceInput && justificationInput && quantityInput && costInput) {
                    const itemName = nameInput.value;
                    const itemSource = sourceInput.value;
                    const itemJustification = justificationInput.value;
                    const itemQuantity = parseInt(quantityInput.value) || 1;
                    const itemCost = parseFloat(costInput.value) || 0;
                    
                    if (itemName || itemSource || itemJustification || itemQuantity > 0 || itemCost > 0) {
                        applicationData.categories[category].push({
                            name: itemName,
                            source: itemSource,
                            justification: itemJustification,
                            quantity: itemQuantity,
                            cost: itemCost
                        });
                    }
                }
            });
        }
    });
    
    return applicationData;
}

// Load application data into form (updated to handle quantity and backward compatibility)
function loadApplication(saveKey) {
    if (!saveKey) {
        showNotification('Please select a saved application to load.');
        return;
    }
    
    // Get saved applications
    const savedApplications = JSON.parse(localStorage.getItem('savedGrantApplications')) || {};
    const saveData = savedApplications[saveKey];
    
    if (!saveData) {
        showNotification('Application not found.');
        return;
    }
    
    const data = saveData.data;
    
    // Load main information
    document.getElementById('organisationType').value = data.main.organisationType;
    document.getElementById('organisationName').value = data.main.organisationName;
    document.getElementById('studentName').value = data.main.studentName;
    document.getElementById('campus').value = data.main.campus;
    document.getElementById('applicationDate').value = data.main.applicationDate;
    
    // Toggle competition tab
    toggleCompetitionTab();
    
    // Load category data
    const categories = ['competition', 'equipment', 'advertising', 'cultural', 'educational', 'social'];
    
    categories.forEach(category => {
        const items = data.categories[category] || [];
        const table = document.getElementById(`${category}Table`);
        
        if (table) {
            const tbody = table.querySelector('tbody');
            
            // Clear existing rows
            if (tbody) {
                tbody.innerHTML = '';
                
                if (items.length === 0) {
                    // Add a default empty row
                    addItemRow(`${category}Table`);
                } else {
                    // Add each item
                    items.forEach(item => {
                        const newRow = document.createElement('tr');
                        
                        // Handle backward compatibility - if quantity doesn't exist, default to 1
                        const quantity = item.quantity !== undefined ? item.quantity : 1;
                        
                        newRow.innerHTML = `
                            <td><input type="text" class="item-name" required value="${escapeHtml(item.name)}"></td>
                            <td><input type="text" class="item-source" required value="${escapeHtml(item.source)}"></td>
                            <td><textarea class="item-justification" rows="2" required>${escapeHtml(item.justification)}</textarea></td>
                            <td><input type="number" class="item-quantity" min="1" step="1" value="${quantity}" required></td>
                            <td><input type="number" class="item-cost" min="0" step="0.01" required value="${item.cost}"></td>
                            <td class="text-center">
                                <button type="button" class="delete-btn remove-row">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        `;
                        
                        tbody.appendChild(newRow);
                        
                        // Add event listeners for the cost and quantity inputs
                        const costInput = newRow.querySelector('.item-cost');
                        const quantityInput = newRow.querySelector('.item-quantity');
                        
                        costInput.addEventListener('input', function() {
                            updateCategoryTotal(table);
                            updateSummary();
                        });
                        
                        quantityInput.addEventListener('input', function() {
                            updateCategoryTotal(table);
                            updateSummary();
                        });
                    });
                    
                    // Enable/disable remove buttons
                    const removeButtons = tbody.querySelectorAll('.remove-row');
                    const disableRemove = removeButtons.length <= 1;
                    removeButtons.forEach(btn => {
                        btn.disabled = disableRemove;
                    });
                }
                
                // Update category total
                updateCategoryTotal(table);
            }
        }
    });
    
    // Switch to guidelines tab
    openTab(null, 'guidelines');
    
    // Update summary
    updateSummary();
    
    // Update filename
    document.getElementById('saveFilename').value = saveData.name;
    
    showNotification(`Application "${saveData.name}" loaded successfully.`);
}

// Delete application
function deleteApplication(saveKey) {
    if (!saveKey) {
        showNotification('Please select a saved application to delete.');
        return;
    }
    
    // Get saved applications
    const savedApplications = JSON.parse(localStorage.getItem('savedGrantApplications')) || {};
    
    if (!savedApplications[saveKey]) {
        showNotification('Application not found.');
        return;
    }
    
    const appName = savedApplications[saveKey].name;
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${appName}"?`)) {
        // Delete the application
        delete savedApplications[saveKey];
        
        // Save back to localStorage
        localStorage.setItem('savedGrantApplications', JSON.stringify(savedApplications));
        
        // Update saved applications list
        updateSavedApplicationsList();
        
        showNotification(`Application "${appName}" deleted successfully.`);
    }
}

// Update the list of saved applications in the dropdown
function updateSavedApplicationsList() {
    const loadSelect = document.getElementById('loadSelect');
    const loadSelect2 = document.getElementById('loadSelect2');
    
    const savedApplications = JSON.parse(localStorage.getItem('savedGrantApplications')) || {};
    
    // Function to update a select element
    function updateSelect(selectElement) {
        if (!selectElement) return;
        
        // Clear existing options except the first
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        if (Object.keys(savedApplications).length === 0) {
            return;
        }
        
        // Sort by date (newest first)
        const sortedSaves = Object.entries(savedApplications).sort((a, b) => {
            return new Date(b[1].date) - new Date(a[1].date);
        });
        
        sortedSaves.forEach(([key, save]) => {
            const option = document.createElement('option');
            option.value = key;
            
            const saveDate = new Date(save.date);
            const formattedDate = saveDate.toLocaleDateString() + ' ' + 
                                 saveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            option.text = `${save.name} (${formattedDate})`;
            selectElement.add(option);
        });
    }
    
    // Update both select elements
    updateSelect(loadSelect);
    updateSelect(loadSelect2);
}

// Export to PDF (with hidden data storage removed)
function exportToPdf() {
    // Collect all data first
    collectApplicationData();
    
    try {
        const { jsPDF } = window.jspdf;
        const orgName = document.getElementById('organisationName').value || 'Grant Application';
        
        // Define fileName early so it can be used in metadata
        const fileName = orgName.replace(/\s+/g, '_') + '_Grant_Application.pdf';
        
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(33, 33, 33); // Changed to dark grey for better contrast
        doc.text("Students' Union Grant Application", 14, 22);
        
        // Add main information
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Main Information", 14, 32);
        
        // Get main info
        const orgType = document.getElementById('organisationType').value;
        const studentName = document.getElementById('studentName').value;
        const campus = document.getElementById('campus').value;
        const appDate = document.getElementById('applicationDate').value;
        
        // Format date
        let formattedDate = '';
        if (appDate) {
            const date = new Date(appDate);
            formattedDate = date.toLocaleDateString('en-GB');
        }
        
        // Generate main info table
        doc.autoTable({
            startY: 36,
            head: [['Field', 'Value']],
            body: [
                ['Organisation Type', orgType.charAt(0).toUpperCase() + orgType.slice(1)],
                ['Organisation Name', orgName],
                ['Student Name', studentName],
                ['Campus', campus],
                ['Date', formattedDate]
            ],
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10 }
        });
        
        // Add category tables
        const categories = [
            { id: 'competition', label: 'Competition Fees & Travel' },
            { id: 'equipment', label: 'Equipment' },
            { id: 'advertising', label: 'Advertising & Promotion' },
            { id: 'cultural', label: 'Cultural Events' },
            { id: 'educational', label: 'Educational Events' },
            { id: 'social', label: 'Social & Recreational Events' }
        ];
        
        let currentY = doc.lastAutoTable.finalY + 15;
        let grandTotal = 0;
        const summaryData = [];
        
        categories.forEach(category => {
            // Skip competition if it's a society
            if (category.id === 'competition' && applicationData.main.organisationType === 'society') {
                return;
            }
            
            const items = applicationData.categories[category.id];
            
            if (items.length > 0) {
                let categoryTotal = 0;
                
                // Add section title
                doc.setFontSize(14);
                doc.text(category.label, 14, currentY);
                currentY += 5;
                
                // Create table data with quantity calculations
                const tableData = items.map(item => {
                    const lineTotal = item.cost * item.quantity;
                    categoryTotal += lineTotal;
                    return [
                        item.name,
                        item.source,
                        item.justification,
                        item.quantity.toString(),
                        `£${item.cost.toFixed(2)}`,
                        `£${lineTotal.toFixed(2)}`
                    ];
                });

                // Define category-specific colors
                const categoryColorMap = {
                    'competition': { head: [255, 205, 210], text: [198, 40, 40] }, // Pastel red
                    'equipment': { head: [255, 249, 196], text: [245, 127, 23] }, // Pastel yellow
                    'advertising': { head: [200, 230, 201], text: [46, 125, 50] }, // Pastel light green
                    'cultural': { head: [225, 190, 231], text: [106, 27, 154] }, // Pastel light purple
                    'educational': { head: [224, 224, 224], text: [66, 66, 66] }, // Pastel grey
                    'social': { head: [187, 222, 251], text: [21, 101, 192] } // Pastel light blue
                };

                const colors = categoryColorMap[category.id];
                
                // Add table
                doc.autoTable({
                    startY: currentY,
                    head: [['Item Name', 'Source/Link', 'Justification', 'Qty', 'Unit Cost', 'Total']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: colors.head, textColor: colors.text, fontStyle: 'bold' },
                    styles: { fontSize: 10 },
                    columnStyles: {
                        0: { cellWidth: 35 },
                        1: { cellWidth: 35 },
                        2: { cellWidth: 60 },
                        3: { cellWidth: 15, halign: 'center' },
                        4: { cellWidth: 22, halign: 'right' },
                        5: { cellWidth: 22, halign: 'right' }
                    },
                    foot: [['', '', '', '', 'Total:', `£${categoryTotal.toFixed(2)}`]],
                    footStyles: { fillColor: colors.head, textColor: colors.text, fontStyle: 'bold' },
                    // Add hyperlink support
                    didDrawCell: function(data) {
                        if (data.column.index === 1 && data.section === 'body') { // Source/Link column
                            const link = data.cell.text[0]; // Get the text from the cell itself
                            // Check if the source looks like a URL
                            if (link && (link.startsWith('http://') || link.startsWith('https://') || link.includes('www.'))) {
                                // Clear the existing text first to avoid overlap
                                doc.setFillColor(255, 255, 255);
                                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                                
                                // Reset the border
                                doc.setDrawColor(0, 0, 0);
                                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
                                
                                // Add styled link text
                                const linkY = data.cell.y + (data.cell.height / 2) + 3;
                                const linkX = data.cell.x + 2;
                                
                                // Set link color
                                doc.setTextColor(0, 102, 204); // A professional blue color
                                doc.setFontSize(9); // Slightly smaller than regular text
                                
                                // Add the link with underline
                                const textWidth = doc.getTextWidth(link);
                                doc.textWithLink(link, linkX, linkY, { url: link });
                                
                                // Reset text properties
                                doc.setTextColor(0, 0, 0);
                                doc.setFontSize(10);
                                
                                // Prevent the default cell drawing
                                return false;
                            }
                        }
                    }
                });
                
                currentY = doc.lastAutoTable.finalY + 10;
                grandTotal += categoryTotal;
                
                // Add to summary data
                summaryData.push([category.label, `£${categoryTotal.toFixed(2)}`]);
            }
        });
        
        // Add summary section
        doc.setFontSize(14);
        doc.text("Summary", 14, currentY);
        currentY += 5;

        // Color definitions for each category (pastel tones)
        const categoryColors = {
            'Competition Fees & Travel': { bg: [255, 205, 210], text: [198, 40, 40] }, // Pastel red
            'Equipment': { bg: [255, 249, 196], text: [245, 127, 23] }, // Pastel yellow
            'Advertising & Promotion': { bg: [200, 230, 201], text: [46, 125, 50] }, // Pastel light green
            'Cultural Events': { bg: [225, 190, 231], text: [106, 27, 154] }, // Pastel light purple
            'Educational Events': { bg: [224, 224, 224], text: [66, 66, 66] }, // Pastel grey
            'Social & Recreational Events': { bg: [187, 222, 251], text: [21, 101, 192] } // Pastel light blue
        };
        
        // Add summary table
        doc.autoTable({
            startY: currentY,
            head: [['Category', 'Amount Requested']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            columnStyles: {
                1: { halign: 'right' }
            },
            foot: [['TOTAL AMOUNT REQUESTED', `£${grandTotal.toFixed(2)}`]],
            footStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255], fontStyle: 'bold' },
            // Custom draw function to apply category colors
            willDrawCell: function(data) {
                if (data.section === 'body') {
                    const categoryLabel = data.row.raw[0];
                    const colors = categoryColors[categoryLabel];
                    if (colors) {
                        doc.setFillColor(...colors.bg);
                        doc.setTextColor(...colors.text);
                    }
                }
            }
        });

        // Add reminder to email (with clickable email)
        currentY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Please email this application to ", 14, currentY);

        // Add clickable email link
        doc.setTextColor(0, 0, 255);
        const emailX = doc.getTextWidth("Please email this application to ") + 14;
        doc.textWithLink("socsfinance@angliastudent.com", emailX, currentY, { 
            url: 'mailto:socsfinance@angliastudent.com' 
        });

        doc.setTextColor(100, 100, 100);
        const afterEmailX = emailX + doc.getTextWidth("socsfinance@angliastudent.com");
        doc.text(" along with any supporting documents.", afterEmailX, currentY);

        // Add date of generation
        doc.setFontSize(8);
        doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 285);

        // Set basic PDF metadata
        doc.setProperties({
            title: fileName.replace('.pdf', ''),
            subject: 'Students Union Grant Application',
            author: applicationData.main.studentName || 'Unknown',
            creator: 'SU Grant Application System'
        });

        doc.save(fileName);
        console.log("PDF saved with filename:", fileName);

        // Show modal with reminder
        showNotification('PDF exported successfully! Please email it to socsfinance@angliastudent.com');
        const warningModal = document.getElementById('warningModal');
        if (warningModal) {
            const bsModal = new bootstrap.Modal(warningModal);
            bsModal.show();
        }
    } catch (error) {
        console.error("PDF generation error:", error);
        showNotification("Error generating PDF. Please try again.");
    }
}