// Admin Dashboard JavaScript
// Handles authentication, data management, filtering, and CSV export

/**
 * Admin Dashboard Controller
 */
class AdminController {
    constructor() {
        this.isLoggedIn = false;
        this.currentFilters = {};
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.allResults = [];
        this.filteredResults = [];
        this.init();
    }

    /**
     * Initialize the admin dashboard
     */
    init() {
        this.bindEventListeners();
        this.checkAuthStatus();
        
        // Initialize UI elements
        this.initializeUI();
    }

    /**
     * Bind all event listeners
     */
    bindEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }

        // Filter controls
        const applyFiltersButton = document.getElementById('applyFiltersButton');
        const clearFiltersButton = document.getElementById('clearFiltersButton');
        
        if (applyFiltersButton) {
            applyFiltersButton.addEventListener('click', this.applyFilters.bind(this));
        }
        
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', this.clearFilters.bind(this));
        }

        // Data management buttons
        const exportCsvButton = document.getElementById('exportCsvButton');
        const clearDataButton = document.getElementById('clearDataButton');
        const refreshButton = document.getElementById('refreshButton');
        const backupButton = document.getElementById('backupButton');

        if (exportCsvButton) {
            exportCsvButton.addEventListener('click', this.exportToCSV.bind(this));
        }
        
        if (clearDataButton) {
            clearDataButton.addEventListener('click', this.confirmClearData.bind(this));
        }
        
        if (refreshButton) {
            refreshButton.addEventListener('click', this.refreshData.bind(this));
        }
        
        if (backupButton) {
            backupButton.addEventListener('click', this.backupData.bind(this));
        }

        // Modal controls
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalOverlay = document.getElementById('modalOverlay');

        if (modalClose) modalClose.addEventListener('click', this.hideModal.bind(this));
        if (modalCancel) modalCancel.addEventListener('click', this.hideModal.bind(this));
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) this.hideModal();
            });
        }

        // Pagination controls
        const prevPageButton = document.getElementById('prevPageButton');
        const nextPageButton = document.getElementById('nextPageButton');
        
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => this.changePage(this.currentPage - 1));
        }
        
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => this.changePage(this.currentPage + 1));
        }

        // Real-time filter updates
        const filterInputs = document.querySelectorAll('#gameFilter, #statusFilter, #rewardFilter, #dateFromFilter, #dateToFilter');
        filterInputs.forEach(input => {
            input.addEventListener('change', this.applyFilters.bind(this));
        });

        // Search input with debounce
        const rewardFilter = document.getElementById('rewardFilter');
        if (rewardFilter) {
            rewardFilter.addEventListener('input', window.UtilityFunctions.debounce(this.applyFilters.bind(this), 500));
        }
    }

    /**
     * Check authentication status
     */
    checkAuthStatus() {
        // In a real application, this would check session/token
        const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
        
        if (isAuthenticated) {
            this.isLoggedIn = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    /**
     * Handle login form submission
     * @param {Event} event - Form submission event
     */
    async handleLogin(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const email = formData.get('email').trim();
            const password = formData.get('password').trim();

            // Clear previous errors
            this.clearLoginErrors();

            // Validate inputs
            if (!email) {
                this.showLoginError('emailError', 'Email is required');
                return;
            }

            if (!password) {
                this.showLoginError('passwordError', 'Password is required');
                return;
            }

            // Set loading state
            this.setLoginLoading(true);

            // Validate credentials
            const isValid = window.GameDB.validateAdminCredentials(email, password);
            
            if (isValid) {
                this.isLoggedIn = true;
                sessionStorage.setItem('admin_authenticated', 'true');
                this.showDashboard();
                this.showToast('Login successful!', 'success');
            } else {
                this.showLoginError('loginError', 'Invalid email or password');
            }

        } catch (error) {
            window.UtilityFunctions.logError('handleLogin', error);
            this.showLoginError('loginError', 'Login failed. Please try again.');
        } finally {
            this.setLoginLoading(false);
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.isLoggedIn = false;
        sessionStorage.removeItem('admin_authenticated');
        this.showLogin();
        this.showToast('Logged out successfully', 'success');
    }

    /**
     * Show login section
     */
    showLogin() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
        
        // Clear login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
        
        this.clearLoginErrors();
    }

    /**
     * Show dashboard section
     */
    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Load dashboard data
        this.loadDashboardData();
    }

    /**
     * Load dashboard data
     */
    async loadDashboardData() {
        try {
            this.showTableLoading(true);
            
            // Get all game results
            this.allResults = window.GameDB.getGameResults();
            this.filteredResults = [...this.allResults];
            
            // Update statistics
            this.updateStatistics();
            
            // Update table
            this.updateTable();
            
            // Update pagination
            this.updatePagination();
            
        } catch (error) {
            window.UtilityFunctions.logError('loadDashboardData', error);
            this.showToast('Failed to load dashboard data', 'error');
        } finally {
            this.showTableLoading(false);
        }
    }

    /**
     * Update statistics cards
     */
    updateStatistics() {
        try {
            const stats = window.GameDB.getStatistics();
            
            if (stats) {
                document.getElementById('totalPlaysCount').textContent = stats.totalPlays;
                document.getElementById('totalWinsCount').textContent = stats.totalWins;
                document.getElementById('totalClaimedCount').textContent = stats.totalClaimed;
                document.getElementById('winRatePercent').textContent = stats.winRate + '%';
            }
        } catch (error) {
            window.UtilityFunctions.logError('updateStatistics', error);
        }
    }

    /**
     * Apply filters to results
     */
    applyFilters() {
        try {
            // Get filter values
            const gameFilter = document.getElementById('gameFilter').value;
            const statusFilter = document.getElementById('statusFilter').value;
            const rewardFilter = document.getElementById('rewardFilter').value.toLowerCase();
            const dateFromFilter = document.getElementById('dateFromFilter').value;
            const dateToFilter = document.getElementById('dateToFilter').value;

            // Build filters object
            this.currentFilters = {};
            
            if (gameFilter) this.currentFilters.game = gameFilter;
            if (statusFilter) this.currentFilters.claimed = statusFilter === 'claimed';
            if (dateFromFilter) this.currentFilters.dateFrom = new Date(dateFromFilter).getTime();
            if (dateToFilter) this.currentFilters.dateTo = new Date(dateToFilter + ' 23:59:59').getTime();
            if (rewardFilter) this.currentFilters.reward = rewardFilter;

            // Apply filters
            this.filteredResults = this.allResults.filter(result => {
                // Game filter
                if (this.currentFilters.game && result.game !== this.currentFilters.game) {
                    return false;
                }

                // Status filter
                if (this.currentFilters.claimed !== undefined && result.claimed !== this.currentFilters.claimed) {
                    return false;
                }

                // Date filters
                if (this.currentFilters.dateFrom && result.timestamp < this.currentFilters.dateFrom) {
                    return false;
                }
                
                if (this.currentFilters.dateTo && result.timestamp > this.currentFilters.dateTo) {
                    return false;
                }

                // Reward filter
                if (this.currentFilters.reward && !result.reward.toLowerCase().includes(this.currentFilters.reward)) {
                    return false;
                }

                return true;
            });

            // Reset to first page
            this.currentPage = 1;
            
            // Update table and pagination
            this.updateTable();
            this.updatePagination();

        } catch (error) {
            window.UtilityFunctions.logError('applyFilters', error);
            this.showToast('Failed to apply filters', 'error');
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        try {
            // Clear filter inputs
            document.getElementById('gameFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('rewardFilter').value = '';
            document.getElementById('dateFromFilter').value = '';
            document.getElementById('dateToFilter').value = '';

            // Reset filters
            this.currentFilters = {};
            this.filteredResults = [...this.allResults];
            this.currentPage = 1;

            // Update table and pagination
            this.updateTable();
            this.updatePagination();

            this.showToast('Filters cleared', 'success');

        } catch (error) {
            window.UtilityFunctions.logError('clearFilters', error);
        }
    }

    /**
     * Update results table
     */
    updateTable() {
        try {
            const tableBody = document.getElementById('resultsTableBody');
            const tableEmpty = document.getElementById('tableEmpty');
            
            if (!tableBody) return;

            // Clear existing rows
            tableBody.innerHTML = '';

            // Check if we have results
            if (this.filteredResults.length === 0) {
                tableEmpty.style.display = 'block';
                return;
            }

            tableEmpty.style.display = 'none';

            // Calculate pagination
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            const pageResults = this.filteredResults.slice(startIndex, endIndex);

            // Generate table rows
            pageResults.forEach(result => {
                const row = this.createTableRow(result);
                tableBody.appendChild(row);
            });

        } catch (error) {
            window.UtilityFunctions.logError('updateTable', error);
        }
    }

    /**
     * Create table row for a result
     * @param {Object} result - Game result data
     * @returns {HTMLElement} - Table row element
     */
    createTableRow(result) {
        const row = document.createElement('tr');
        
        const formatDate = (timestamp) => {
            return new Date(timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        row.innerHTML = `
            <td>${window.UtilityFunctions.sanitizeInput(result.name)}</td>
            <td>${result.whatsapp}</td>
            <td>${result.game}</td>
            <td>${result.reward}</td>
            <td><code>${result.code}</code></td>
            <td>
                <span class="status-badge ${result.claimed ? 'status-claimed' : 'status-unclaimed'}">
                    ${result.claimed ? 'Claimed' : 'Not Claimed'}
                </span>
            </td>
            <td>${formatDate(result.timestamp)}</td>
            <td>
                <div class="action-buttons">
                    <button class="toggle-button ${result.claimed ? 'toggle-claimed' : 'toggle-unclaimed'}" 
                            onclick="adminController.toggleClaimedStatus('${result.id}', ${!result.claimed})">
                        ${result.claimed ? 'Mark Unclaimed' : 'Mark Claimed'}
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    /**
     * Toggle claimed status of a result
     * @param {string} resultId - ID of the result
     * @param {boolean} claimed - New claimed status
     */
    async toggleClaimedStatus(resultId, claimed) {
        try {
            const success = window.GameDB.updateClaimedStatus(resultId, claimed);
            
            if (success) {
                // Update local data
                const result = this.allResults.find(r => r.id === resultId);
                if (result) {
                    result.claimed = claimed;
                }

                // Update filtered results
                const filteredResult = this.filteredResults.find(r => r.id === resultId);
                if (filteredResult) {
                    filteredResult.claimed = claimed;
                }

                // Refresh display
                this.updateTable();
                this.updateStatistics();

                this.showToast(`Status updated to ${claimed ? 'Claimed' : 'Not Claimed'}`, 'success');
            } else {
                this.showToast('Failed to update status', 'error');
            }

        } catch (error) {
            window.UtilityFunctions.logError('toggleClaimedStatus', error);
            this.showToast('Failed to update status', 'error');
        }
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        try {
            const totalResults = this.filteredResults.length;
            const totalPages = Math.ceil(totalResults / this.itemsPerPage);
            
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            const prevPageButton = document.getElementById('prevPageButton');
            const nextPageButton = document.getElementById('nextPageButton');
            const paginationPages = document.getElementById('paginationPages');

            if (totalResults === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            // Update info
            const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, totalResults);
            paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalResults} results`;

            // Update buttons
            prevPageButton.disabled = this.currentPage <= 1;
            nextPageButton.disabled = this.currentPage >= totalPages;

            // Update page numbers
            this.updatePageNumbers(totalPages);

        } catch (error) {
            window.UtilityFunctions.logError('updatePagination', error);
        }
    }

    /**
     * Update page number buttons
     * @param {number} totalPages - Total number of pages
     */
    updatePageNumbers(totalPages) {
        const paginationPages = document.getElementById('paginationPages');
        if (!paginationPages) return;

        paginationPages.innerHTML = '';

        // Show max 5 page numbers
        const maxPages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);

        if (endPage - startPage < maxPages - 1) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => this.changePage(i));
            paginationPages.appendChild(pageButton);
        }
    }

    /**
     * Change current page
     * @param {number} page - Page number to change to
     */
    changePage(page) {
        const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.updateTable();
        this.updatePagination();
    }

    /**
     * Export filtered results to CSV
     */
    exportToCSV() {
        try {
            if (this.filteredResults.length === 0) {
                this.showToast('No data to export', 'warning');
                return;
            }

            const success = window.GameDB.downloadCSV(
                `game_results_${new Date().toISOString().split('T')[0]}.csv`,
                this.filteredResults
            );

            if (success) {
                this.showToast('CSV export started', 'success');
            } else {
                this.showToast('Failed to export CSV', 'error');
            }

        } catch (error) {
            window.UtilityFunctions.logError('exportToCSV', error);
            this.showToast('Failed to export CSV', 'error');
        }
    }

    /**
     * Confirm data clearing
     */
    confirmClearData() {
        this.showModal(
            'Clear All Data',
            'Are you sure you want to clear all game results? This action cannot be undone.',
            () => this.clearAllData()
        );
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            const success = window.GameDB.clearAllData();
            
            if (success) {
                this.allResults = [];
                this.filteredResults = [];
                this.currentPage = 1;
                
                this.updateTable();
                this.updateStatistics();
                this.updatePagination();
                
                this.showToast('All data cleared successfully', 'success');
            } else {
                this.showToast('Failed to clear data', 'error');
            }

        } catch (error) {
            window.UtilityFunctions.logError('clearAllData', error);
            this.showToast('Failed to clear data', 'error');
        }
    }

    /**
     * Refresh dashboard data
     */
    async refreshData() {
        this.showToast('Refreshing data...', 'info');
        await this.loadDashboardData();
        this.showToast('Data refreshed', 'success');
    }

    /**
     * Backup data
     */
    backupData() {
        try {
            const success = window.GameDB.backupData();
            
            if (success) {
                this.showToast('Backup created successfully', 'success');
            } else {
                this.showToast('Failed to create backup', 'error');
            }

        } catch (error) {
            window.UtilityFunctions.logError('backupData', error);
            this.showToast('Failed to create backup', 'error');
        }
    }

    /**
     * Show modal dialog
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {Function} onConfirm - Callback for confirm action
     */
    showModal(title, message, onConfirm) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Remove existing event listeners
        const newConfirmButton = modalConfirm.cloneNode(true);
        modalConfirm.parentNode.replaceChild(newConfirmButton, modalConfirm);
        
        // Add new event listener
        newConfirmButton.addEventListener('click', () => {
            this.hideModal();
            if (onConfirm) onConfirm();
        });

        modalOverlay.style.display = 'flex';
    }

    /**
     * Hide modal dialog
     */
    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        modalOverlay.style.display = 'none';
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    /**
     * Show/hide table loading state
     * @param {boolean} loading - Loading state
     */
    showTableLoading(loading) {
        const tableLoading = document.getElementById('tableLoading');
        const tableEmpty = document.getElementById('tableEmpty');
        const resultsTable = document.getElementById('resultsTable');
        
        if (loading) {
            tableLoading.style.display = 'block';
            tableEmpty.style.display = 'none';
            resultsTable.style.opacity = '0.5';
        } else {
            tableLoading.style.display = 'none';
            resultsTable.style.opacity = '1';
        }
    }

    /**
     * Set login loading state
     * @param {boolean} loading - Loading state
     */
    setLoginLoading(loading) {
        const loginButton = document.getElementById('loginButton');
        const buttonText = loginButton.querySelector('.button-text');
        const buttonLoader = loginButton.querySelector('.button-loader');
        
        if (loading) {
            buttonText.style.display = 'none';
            buttonLoader.style.display = 'inline';
            loginButton.disabled = true;
        } else {
            buttonText.style.display = 'inline';
            buttonLoader.style.display = 'none';
            loginButton.disabled = false;
        }
    }

    /**
     * Show login error
     * @param {string} fieldId - Field ID for error
     * @param {string} message - Error message
     */
    showLoginError(fieldId, message) {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Clear all login errors
     */
    clearLoginErrors() {
        const errorElements = ['emailError', 'passwordError', 'loginError'];
        errorElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '';
                element.style.display = 'none';
            }
        });
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Set current date as default for date filters
        const today = new Date().toISOString().split('T')[0];
        const dateToFilter = document.getElementById('dateToFilter');
        if (dateToFilter) {
            dateToFilter.value = today;
        }
    }

    /**
     * Get current dashboard state
     * @returns {Object} - Current state
     */
    getCurrentState() {
        return {
            isLoggedIn: this.isLoggedIn,
            currentFilters: this.currentFilters,
            currentPage: this.currentPage,
            totalResults: this.filteredResults.length,
            timestamp: Date.now()
        };
    }
}

// Initialize admin controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.adminController = new AdminController();
        console.log('Admin Dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Admin Dashboard:', error);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.adminController && window.adminController.isLoggedIn) {
        // Refresh data when page becomes visible
        window.adminController.refreshData();
    }
});

// Export for global access
window.AdminController = AdminController;
