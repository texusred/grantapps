/**
 * ARU Students' Union Grant Application - PDF Export & Data Management
 * Handles PDF generation, data collection, and save/load functionality
 */

// ===== DATA COLLECTION SYSTEM =====

/**
 * Collect all application data from the form
 * @returns {Object} Complete application data object
 */
function collectApplicationData() {
    try {
        // Collect main information
        applicationData.main = {
            organisationType: elements.organisationType ? elements.organisationType.value : '',
            organisationName: elements.organisationName ? elements.organisationName.value : '',
            studentName: elements.studentName ? elements.studentName.value : '',
            campus: elements.campus ? elements.campus.value : '',
            applicationDate: elements.applicationDate ? elements.applicationDate.value : ''
        };
        
        // Collect category data
        CONSTANTS.CATEGORIES.forEach(category => {
            applicationData.categories[category] = collectCategoryData(category);
        });
        
        return applicationData;
        
    } catch (error) {
        console.error('Error collecting application data:', error);
        showNotification('Error collecting application data. Please try again.');
        return null;
    }
}

/**
 * Collect data from a specific category table
 * @param {string} category - The category name
 * @returns {Array} Array of item objects for the category
 */
function collectCategoryData(category) {
    const items = [];
    const table = document.getElementById(`${category}Table`);
    
    if (!table) {
        console.warn(`Table for category ${category} not found`);
        return items;
    }
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const itemData = extractRowData(row);
        
        // Only include rows that have meaningful data
        if (isValidItemData(itemData)) {
            items.push(itemData);
        }
    });
    
    return items;
}

/**
 * Extract data from a table row
 * @param {HTMLElement} row - The table row element
 * @returns {Object} Item data object
 */
function extractRowData(row) {
    const nameInput = row.querySelector('.item-name');
    const sourceInput = row.querySelector('.item-source');
    const justificationInput = row.querySelector('.item-justification');
    const quantityInput = row.querySelector('.item-quantity');
    const costInput = row.querySelector('.item-cost');
    
    return {
        name: nameInput ? nameInput.value.trim() : '',
        source: sourceInput ? sourceInput.value.trim() : '',
        justification: justificationInput ? justificationInput.value.trim() : '',
        quantity: quantityInput ? parseInt(quantityInput.value) || 1 : 1,
        cost: costInput ? parseFloat(costInput.value) || 0 : 0
    };
}

/**
 * Check if item data is valid and worth including
 * @param {Object} itemData - The item data to validate
 * @returns {boolean} True if the item has meaningful data
 */
function isValidItemData(itemData) {
    return itemData.name || 
           itemData.source || 
           itemData.justification || 
           (itemData.cost > 0 && itemData.quantity > 0);
}

/**
 * Enhanced validation specifically for PDF output
 * More strict than general validation to avoid empty rows in PDF
 * @param {Object} item - The item data to validate for PDF inclusion
 * @returns {boolean} True if the item should be included in PDF
 */
function isValidItemForPdf(item) {
    if (!item) return false;
    
    // Check for meaningful text content
    const hasName = item.name && item.name.trim().length > 0;
    const hasSource = item.source && item.source.trim().length > 0;
    const hasJustification = item.justification && item.justification.trim().length > 0;
    
    // Check for meaningful cost (must be > 0)
    const hasMeaningfulCost = item.cost > 0;
    
    // Include if has meaningful text content OR meaningful cost
    // This prevents empty rows with just default quantity=1, cost=0
    return hasName || hasSource || hasJustification || hasMeaningfulCost;
}

// ===== PDF GENERATION SYSTEM =====

/**
 * Export the application to PDF format
 */
function exportToPdf() {
    try {
        // Collect all data first
        const data = collectApplicationData();
        if (!data) {
            showNotification('Failed to collect application data for PDF export.');
            return;
        }
        
        // Check if jsPDF is available
        if (!window.jspdf) {
            showNotification('PDF generation library not loaded. Please refresh the page.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const orgName = data.main.organisationName || 'Grant Application';
        const fileName = createSafeFilename(orgName) + '_Grant_Application.pdf';
        
        // Create PDF document
        const doc = new jsPDF();
        
        // Generate PDF content
        generatePdfHeader(doc, data);
        generatePdfMainInfo(doc, data);
        const finalY = generatePdfCategories(doc, data);
        generatePdfSummary(doc, data, finalY);
        generatePdfFooter(doc);
        
        // Set PDF metadata
        setPdfMetadata(doc, data, fileName);
        
        // Save the PDF
        doc.save(fileName);
        
        // Show success notification and modal
        showNotification('PDF exported successfully! Please email it to ' + CONSTANTS.EMAIL_ADDRESS);
        showWarningModal();
        
        console.log('PDF exported successfully:', fileName);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.');
    }
}

/**
 * Generate PDF header
 * @param {jsPDF} doc - The PDF document
 * @param {Object} data - Application data
 */
function generatePdfHeader(doc, data) {
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Students' Union Grant Application", 14, 22);
    
    // Add subtle line under header
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 26, doc.internal.pageSize.getWidth() - 14, 26);
}

/**
 * Generate main information section
 * @param {jsPDF} doc - The PDF document
 * @param {Object} data - Application data
 */
function generatePdfMainInfo(doc, data) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Application Information", 14, 36);
    
    const mainInfoData = [
        ['Organisation Type', data.main.organisationType.charAt(0).toUpperCase() + data.main.organisationType.slice(1)],
        ['Organisation Name', data.main.organisationName],
        ['Student Name', data.main.studentName],
        ['Campus', data.main.campus],
        ['Application Date', formatDateForDisplay(data.main.applicationDate)]
    ];
    
    doc.autoTable({
        startY: 40,
        head: [['Field', 'Value']],
        body: mainInfoData,
        theme: 'striped',
        headStyles: { 
            fillColor: [66, 66, 66], 
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            fontSize: 11
        },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 130 }
        }
    });
}

/**
 * Generate category sections in PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Object} data - Application data
 * @returns {number} Final Y position after categories
 */
function generatePdfCategories(doc, data) {
    const categories = getCategoriesForPdf(data.main.organisationType);
    let currentY = doc.lastAutoTable.finalY + 20;
    
    categories.forEach(category => {
        const items = data.categories[category.id] || [];
        
        // Only generate section if there are valid items
        const validItems = items.filter(isValidItemForPdf);
        if (validItems.length > 0) {
            currentY = generatePdfCategorySection(doc, category, validItems, currentY);
        }
    });
    
    return currentY;
}

/**
 * Generate a single category section in PDF
 * @param {jsPDF} doc - The PDF document
 * @param {Object} category - Category configuration
 * @param {Array} items - Items for this category
 * @param {number} startY - Starting Y position
 * @returns {number} Final Y position after this section
 */
function generatePdfCategorySection(doc, category, items, startY) {
    // Filter items to only include those with meaningful data for PDF
    const validItems = items.filter(isValidItemForPdf);
    
    // Skip section if no valid items
    if (validItems.length === 0) {
        return startY;
    }
    
    // Check if we need a new page
    const estimatedHeight = (validItems.length * 20) + 40;
    if (startY + estimatedHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        startY = 20;
    }
    
    // Add section title
    doc.setFontSize(14);
    doc.setTextColor(...category.color.text);
    doc.text(category.label, 14, startY);
    startY += 8;
    
    // Prepare table data with improved URL formatting
    const tableData = validItems.map(item => {
        const lineTotal = item.cost * item.quantity;
        return [
            item.name,
            formatUrlForPdf(item.source, 30), // Shorter max length due to smaller column
            item.justification,
            item.quantity.toString(),
            formatCurrency(item.cost),
            formatCurrency(lineTotal)
        ];
    });
    
    // Calculate category total
    const categoryTotal = validItems.reduce((total, item) => total + (item.cost * item.quantity), 0);
    
    // Optimized column widths for better layout
    const columnWidths = {
        itemName: 40,        // Increased for longer product names
        sourceLink: 28,      // Reduced since URLs are now truncated
        justification: 52,   // Slightly reduced to accommodate other columns
        quantity: 12,        // Reduced - just numbers
        unitCost: 20,        // Adequate for currency
        total: 22            // Adequate for currency + some padding
    };
    
    // Generate table with optimized layout
    doc.autoTable({
        startY: startY,
        head: [['Item Name', 'Source/Link', 'Justification', 'Qty', 'Unit Cost', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
            fillColor: category.color.head, 
            textColor: category.color.text, 
            fontStyle: 'bold',
            fontSize: 10
        },
        styles: { 
            fontSize: 9, 
            cellPadding: 3,
            overflow: 'linebreak',
            cellWidth: 'wrap'
        },
        columnStyles: {
            0: { cellWidth: columnWidths.itemName }, // Item Name
            1: { cellWidth: columnWidths.sourceLink }, // Source/Link
            2: { cellWidth: columnWidths.justification }, // Justification
            3: { cellWidth: columnWidths.quantity, halign: 'center' }, // Quantity
            4: { cellWidth: columnWidths.unitCost, halign: 'right' }, // Unit Cost
            5: { cellWidth: columnWidths.total, halign: 'right' }  // Total
        },
        foot: [['', '', '', '', 'Total:', formatCurrency(categoryTotal)]],
        footStyles: { 
            fillColor: category.color.head, 
            textColor: category.color.text, 
            fontStyle: 'bold' 
        },
        // Enhanced link handler for clickable URLs
        didDrawCell: function(data) {
            if (data.column.index === 1 && data.section === 'body') { // Source/Link column
                const originalUrl = validItems[data.row.index]?.source;
                if (originalUrl && isValidUrl(originalUrl)) {
                    // Make the truncated text clickable with the full URL
                    const fullUrl = originalUrl.startsWith('http') ? originalUrl : `https://${originalUrl}`;
                    
                    // Add link to the cell (without redrawing text)
                    doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: fullUrl });
                }
            }
        }
    });
    
    return doc.lastAutoTable.finalY + 15;
}

/**
 * Generate PDF summary section
 * @param {jsPDF} doc - The PDF document
 * @param {Object} data - Application data
 * @param {number} startY - Starting Y position
 */
function generatePdfSummary(doc, data, startY) {
    // Check if we need a new page
    if (startY + 100 > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        startY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, startY);
    startY += 8;
    
    const categories = getCategoriesForPdf(data.main.organisationType);
    const summaryData = [];
    let grandTotal = 0;
    
    categories.forEach(category => {
        const items = data.categories[category.id] || [];
        // Only include categories that have valid items for accurate totals
        const validItems = items.filter(isValidItemForPdf);
        const categoryTotal = validItems.reduce((total, item) => total + (item.cost * item.quantity), 0);
        
        // Only add to summary if there's actually a total (avoids £0.00 entries)
        if (categoryTotal > 0) {
            summaryData.push([category.label, formatCurrency(categoryTotal)]);
            grandTotal += categoryTotal;
        }
    });
    
    // Only generate summary table if there are items to summarize
    if (summaryData.length > 0) {
        doc.autoTable({
            startY: startY,
            head: [['Category', 'Amount Requested']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 50, halign: 'right' }
            },
            foot: [['TOTAL AMOUNT REQUESTED', formatCurrency(grandTotal)]],
            footStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255], fontStyle: 'bold' }
        });
    } else {
        // If no valid items, show a message
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("No funding requested - application contains no items with costs.", 14, startY + 10);
    }
}

/**
 * Generate PDF footer
 * @param {jsPDF} doc - The PDF document
 */
function generatePdfFooter(doc) {
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Add email reminder
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Please email this application to ", 14, finalY);
    
    // Add clickable email link
    const emailText = CONSTANTS.EMAIL_ADDRESS;
    const emailX = doc.getTextWidth("Please email this application to ") + 14;
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(emailText, emailX, finalY, { url: `mailto:${emailText}` });
    
    const afterEmailX = emailX + doc.getTextWidth(emailText);
    doc.setTextColor(100, 100, 100);
    doc.text(" along with any supporting documents.", afterEmailX, finalY);
    
    // Add generation date
    doc.setFontSize(8);
    doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 285);
}

/**
 * Set PDF metadata
 * @param {jsPDF} doc - The PDF document
 * @param {Object} data - Application data
 * @param {string} fileName - The PDF filename
 */
function setPdfMetadata(doc, data, fileName) {
    doc.setProperties({
        title: fileName.replace('.pdf', ''),
        subject: 'Students Union Grant Application',
        author: data.main.studentName || 'Unknown',
        creator: 'ARU SU Grant Application System',
        keywords: 'grant, application, students union, ARU'
    });
}

// ===== PDF HELPER FUNCTIONS =====

/**
 * Get categories configuration for PDF generation
 * @param {string} orgType - Organization type ('club' or 'society')
 * @returns {Array} Array of category objects with colors
 */
function getCategoriesForPdf(orgType) {
    const allCategories = [
        { id: 'competition', label: 'Competition Fees & Travel', color: { head: [255, 235, 238], text: [198, 40, 40] } },
        { id: 'equipment', label: 'Equipment', color: { head: [255, 251, 230], text: [245, 127, 23] } },
        { id: 'advertising', label: 'Advertising & Promotion', color: { head: [232, 245, 233], text: [46, 125, 50] } },
        { id: 'cultural', label: 'Cultural Events', color: { head: [243, 229, 245], text: [106, 27, 154] } },
        { id: 'educational', label: 'Educational Events', color: { head: [240, 240, 240], text: [66, 66, 66] } },
        { id: 'social', label: 'Social & Recreational Events', color: { head: [227, 242, 253], text: [21, 101, 192] } }
    ];
    
    // Filter out competition for societies
    if (orgType === 'society') {
        return allCategories.filter(cat => cat.id !== 'competition');
    }
    
    return allCategories;
}

/**
 * Format URL for PDF display with smart truncation
 * @param {string} url - The URL to format
 * @param {number} maxLength - Maximum length for display (default: 35)
 * @returns {string} Formatted URL suitable for PDF display
 */
function formatUrlForPdf(url, maxLength = 35) {
    if (!url || typeof url !== 'string') return '';
    
    const trimmedUrl = url.trim();
    if (trimmedUrl.length <= maxLength) return trimmedUrl;
    
    try {
        // Strategy 1: Extract domain for URLs with protocols
        if (trimmedUrl.includes('://')) {
            const urlObj = new URL(trimmedUrl);
            const domain = urlObj.hostname.replace(/^www\./, ''); // Remove www prefix
            
            // If domain + "..." fits, use that
            if (domain.length <= maxLength - 4) {
                return `${domain}/...`;
            }
            
            // If domain is still too long, truncate the domain
            if (domain.length > maxLength - 4) {
                return domain.substring(0, maxLength - 7) + '.../...';
            }
        }
        
        // Strategy 2: Look for common patterns without protocol
        const domainMatch = trimmedUrl.match(/(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
        if (domainMatch) {
            const domain = domainMatch[1];
            if (domain.length <= maxLength - 4) {
                return `${domain}/...`;
            }
        }
        
        // Strategy 3: Smart truncation with ellipsis
        // Try to break at meaningful points (slashes, dots)
        const breakPoints = ['//', '/', '.', '-', '&', '?'];
        for (const breakPoint of breakPoints) {
            const lastBreak = trimmedUrl.lastIndexOf(breakPoint, maxLength - 3);
            if (lastBreak > maxLength * 0.6) { // At least 60% of desired length
                return trimmedUrl.substring(0, lastBreak) + '...';
            }
        }
        
        // Fallback: Simple truncation
        return trimmedUrl.substring(0, maxLength - 3) + '...';
        
    } catch (error) {
        // If URL parsing fails, fall back to simple truncation
        console.warn('URL parsing failed for:', trimmedUrl, error);
        return trimmedUrl.substring(0, maxLength - 3) + '...';
    }
}

/**
 * Generate link handler for PDF tables
 * @param {jsPDF} doc - The PDF document
 * @returns {Function} Link handler function
 */
function generatePdfLinkHandler(doc) {
    return function(data) {
        if (data.column.index === 1 && data.section === 'body') { // Source/Link column
            const linkText = data.cell.text[0];
            if (linkText && isValidUrl(linkText)) {
                // Add the link
                doc.textWithLink(linkText, data.cell.x + 2, data.cell.y + (data.cell.height / 2) + 3, { 
                    url: linkText.startsWith('http') ? linkText : `https://${linkText}` 
                });
            }
        }
    };
}

/**
 * Show the warning modal after PDF export
 */
function showWarningModal() {
    const warningModal = document.getElementById('warningModal');
    if (warningModal && window.bootstrap) {
        const bsModal = new bootstrap.Modal(warningModal);
        bsModal.show();
    }
}

// ===== SAVE/LOAD SYSTEM =====

/**
 * Save application progress to localStorage
 */
function saveProgress() {
    try {
        if (!isLocalStorageAvailable()) {
            showNotification('Browser storage not available. Unable to save progress.');
            return;
        }
        
        // Collect current application data
        const data = collectApplicationData();
        if (!data) {
            showNotification('Failed to collect application data for saving.');
            return;
        }
        
        // Get filename from input
        const filename = (elements.saveFilename ? elements.saveFilename.value : '') || 
                        (elements.saveFilename2 ? elements.saveFilename2.value : '') || 
                        'Grant Application';
        
        // Create save data object
        const saveData = {
            name: filename,
            date: new Date().toISOString(),
            data: data
        };
        
        // Get existing saved applications
        const savedApplications = getStorageItem(CONSTANTS.STORAGE_KEY, {});
        
        // Add new save or update existing
        const saveKey = createSafeFilename(filename).toLowerCase();
        savedApplications[saveKey] = saveData;
        
        // Save back to localStorage
        if (setStorageItem(CONSTANTS.STORAGE_KEY, savedApplications)) {
            showNotification(`Application "${filename}" saved successfully.`);
            updateSavedApplicationsList();
        } else {
            showNotification('Failed to save application. Please try again.');
        }
        
    } catch (error) {
        console.error('Error saving progress:', error);
        showNotification('Error saving progress. Please try again.');
    }
}

/**
 * Load a saved application
 * @param {string} saveKey - The key of the saved application to load
 */
function loadApplication(saveKey) {
    try {
        if (!saveKey) {
            showNotification('Please select a saved application to load.');
            return;
        }
        
        const savedApplications = getStorageItem(CONSTANTS.STORAGE_KEY, {});
        const saveData = savedApplications[saveKey];
        
        if (!saveData) {
            showNotification('Application not found.');
            return;
        }
        
        const data = saveData.data;
        
        // Load main information
        loadMainInformation(data.main);
        
        // Load category data
        loadCategoryData(data.categories);
        
        // Update UI state
        toggleCompetitionTab();
        updateSummary();
        
        // Update filename inputs
        if (elements.saveFilename) elements.saveFilename.value = saveData.name;
        if (elements.saveFilename2) elements.saveFilename2.value = saveData.name;
        
        // Switch to guidelines tab
        openTab(null, 'guidelines');
        
        showNotification(`Application "${saveData.name}" loaded successfully.`);
        
    } catch (error) {
        console.error('Error loading application:', error);
        showNotification('Error loading application. Please try again.');
    }
}

/**
 * Load main information into form fields
 * @param {Object} mainData - Main information data
 */
function loadMainInformation(mainData) {
    if (!mainData) return;
    
    const fields = [
        { element: elements.organisationType, value: mainData.organisationType },
        { element: elements.organisationName, value: mainData.organisationName },
        { element: elements.studentName, value: mainData.studentName },
        { element: elements.campus, value: mainData.campus },
        { element: elements.applicationDate, value: mainData.applicationDate }
    ];
    
    fields.forEach(field => {
        if (field.element && field.value !== undefined) {
            field.element.value = field.value;
        }
    });
}

/**
 * Load category data into tables
 * @param {Object} categoriesData - Categories data object
 */
function loadCategoryData(categoriesData) {
    if (!categoriesData) return;
    
    CONSTANTS.CATEGORIES.forEach(category => {
        const items = categoriesData[category] || [];
        const table = document.getElementById(`${category}Table`);
        
        if (table) {
            loadCategoryTable(table, items, category);
        }
    });
}

/**
 * Load data into a specific category table
 * @param {HTMLElement} table - The table element
 * @param {Array} items - Items to load
 * @param {string} category - Category name
 */
function loadCategoryTable(table, items, category) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (items.length === 0) {
        // Add a default empty row
        addItemRow(`${category}Table`);
    } else {
        // Add each item
        items.forEach(item => {
            const newRow = createTableRowFromItem(item);
            tbody.appendChild(newRow);
            
            // Add event listeners
            addRowEventListeners(newRow, table);
        });
        
        // Update remove button states
        updateRemoveButtonStates(table);
    }
    
    // Update category total
    updateCategoryTotal(table);
}

/**
 * Create a table row from item data
 * @param {Object} item - Item data
 * @returns {HTMLElement} Table row element
 */
function createTableRowFromItem(item) {
    const newRow = document.createElement('tr');
    
    // Handle backward compatibility - if quantity doesn't exist, default to 1
    const quantity = item.quantity !== undefined ? item.quantity : 1;
    
    newRow.innerHTML = `
        <td><input type="text" class="item-name" required value="${escapeHtml(item.name)}" aria-label="Item name"></td>
        <td><input type="text" class="item-source" required value="${escapeHtml(item.source)}" aria-label="Source or link"></td>
        <td><textarea class="item-justification" rows="2" required aria-label="Justification">${escapeHtml(item.justification)}</textarea></td>
        <td><input type="number" class="item-quantity" min="1" step="1" value="${quantity}" required aria-label="Quantity"></td>
        <td><input type="number" class="item-cost" min="0" step="0.01" required value="${item.cost}" aria-label="Unit cost"></td>
        <td class="text-center">
            <button type="button" class="delete-btn remove-row" aria-label="Remove this item">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    return newRow;
}

/**
 * Add event listeners to a table row
 * @param {HTMLElement} row - The table row
 * @param {HTMLElement} table - The parent table
 */
function addRowEventListeners(row, table) {
    const costInput = row.querySelector('.item-cost');
    const quantityInput = row.querySelector('.item-quantity');
    
    const debouncedUpdate = debounce(function() {
        updateCategoryTotal(table);
        updateSummary();
    }, 300);
    
    if (costInput) costInput.addEventListener('input', debouncedUpdate);
    if (quantityInput) quantityInput.addEventListener('input', debouncedUpdate);
}

/**
 * Delete a saved application
 * @param {string} saveKey - The key of the application to delete
 */
function deleteApplication(saveKey) {
    try {
        if (!saveKey) {
            showNotification('Please select a saved application to delete.');
            return;
        }
        
        const savedApplications = getStorageItem(CONSTANTS.STORAGE_KEY, {});
        
        if (!savedApplications[saveKey]) {
            showNotification('Application not found.');
            return;
        }
        
        const appName = savedApplications[saveKey].name;
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete "${appName}"?`)) {
            delete savedApplications[saveKey];
            
            if (setStorageItem(CONSTANTS.STORAGE_KEY, savedApplications)) {
                updateSavedApplicationsList();
                showNotification(`Application "${appName}" deleted successfully.`);
            } else {
                showNotification('Failed to delete application. Please try again.');
            }
        }
        
    } catch (error) {
        console.error('Error deleting application:', error);
        showNotification('Error deleting application. Please try again.');
    }
}

/**
 * Update the list of saved applications in dropdowns
 */
function updateSavedApplicationsList() {
    try {
        const savedApplications = getStorageItem(CONSTANTS.STORAGE_KEY, {});
        
        // Update both select elements
        [elements.loadSelect, elements.loadSelect2].forEach(selectElement => {
            updateSelectOptions(selectElement, savedApplications);
        });
        
    } catch (error) {
        console.error('Error updating saved applications list:', error);
    }
}

/**
 * Update options in a select element
 * @param {HTMLElement} selectElement - The select element to update
 * @param {Object} savedApplications - Saved applications data
 */
function updateSelectOptions(selectElement, savedApplications) {
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

// Make functions available globally for onclick handlers
window.exportToPdf = exportToPdf;
window.saveProgress = saveProgress;
window.loadApplication = loadApplication;
window.deleteApplication = deleteApplication;