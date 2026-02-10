// Check if user is admin
function checkAdminAccess() {
    // Check session storage for admin flag
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        // Check if current user is admin
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email === 'admin@admin.com' && currentUser.password === 'admin123') {
            sessionStorage.setItem('isAdmin', 'true');
            return true;
        }
        
        // Redirect to main site if not admin
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Get DOM elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');

// Dashboard elements
const completedOrders = document.getElementById('completedOrders');
const totalProfit = document.getElementById('totalProfit');

// Details elements
const adminForm = document.getElementById('adminForm');
const cancelChanges = document.getElementById('cancelChanges');

// Logout button
const logoutBtn = document.getElementById('logoutBtn');

// Modal elements
const confirmModal = document.getElementById('confirmModal');
const closeConfirmModal = document.getElementById('closeConfirmModal');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');
const confirmMessage = document.getElementById('confirmMessage');

// Toast element
const toast = document.getElementById('toast');

// Safe localStorage wrapper
const safeStorage = {
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error getting from localStorage:', e);
            return null;
        }
    },
    
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Error setting to localStorage:', e);
        }
    },
    
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    
    getJSON: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error parsing JSON from localStorage:', e);
            return null;
        }
    },
    
    setJSON: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error stringifying JSON to localStorage:', e);
        }
    }
};

// State
let adminData = safeStorage.getJSON('adminData') || {
    email: 'admin@admin.com',
    password: 'admin123',
    name: 'Tumelo Segale'
};

// Performance-optimized order storage
class OrderManager {
    constructor() {
        this.orders = [];
        this.orderMap = new Map();
        this.initialized = false;
    }
    
    init(orders) {
        this.orders = orders || [];
        this.orderMap.clear();
        
        // Create a Set to track unique order IDs
        const uniqueOrderIds = new Set();
        const uniqueOrders = [];
        
        this.orders.forEach(order => {
            if (order.id && !uniqueOrderIds.has(order.id)) {
                uniqueOrderIds.add(order.id);
                uniqueOrders.push(order);
                this.orderMap.set(order.id, order);
            }
        });
        
        this.orders = uniqueOrders;
        this.initialized = true;
    }
    
    getCompletedOrders() {
        return this.orders.filter(order => order.status === 'completed');
    }
    
    getOrdersByYear(year) {
        return this.orders.filter(order => {
            if (order.status !== 'completed') return false;
            const orderYear = new Date(order.timestamp).getFullYear();
            return orderYear === year;
        });
    }
}

const orderManager = new OrderManager();

// Performance-optimized statistics calculation
class StatsCalculator {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 60000;
    }
    
    getCacheKey(type, ...args) {
        return `${type}_${args.join('_')}`;
    }
    
    calculateYearlyStats(year, orders) {
        const cacheKey = this.getCacheKey('yearly', year);
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const yearlyOrders = orders.filter(order => {
            const orderYear = new Date(order.timestamp).getFullYear();
            return orderYear === year;
        });
        
        const revenue = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const profit = parseFloat((revenue * 0.05).toFixed(2));
        
        const stats = {
            year: year,
            revenue: revenue,
            orders: yearlyOrders.length,
            profit: profit
        };
        
        this.cache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });
        
        return stats;
    }
}

const statsCalculator = new StatsCalculator();

// Show toast message
function showToast(message, type = 'success') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#500000';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Format currency
function formatCurrency(amount) {
    return `R${parseFloat(amount).toFixed(2)}`;
}

// Calculate 5% profit
function calculateProfit(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Format date to DD MMM YYYY (date only, no time)
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Unknown date';
    }
}

// Load all orders (card + cash)
function loadOrders() {
    try {
        // Load online orders
        const onlineOrders = safeStorage.getJSON('orders') || [];
        
        // Load cash orders
        const cashOrders = safeStorage.getJSON('cashOrders') || [];
        
        // Combine all orders
        const allOrders = [...onlineOrders, ...cashOrders];
        
        // Ensure all orders have proper structure
        const formattedOrders = allOrders.map(order => ({
            id: order.id || Date.now(),
            orderId: order.orderId || (order.type === 'cash' ? `CASH${Date.now().toString().slice(-8)}` : `ORD${Date.now().toString().slice(-8)}`),
            timestamp: order.timestamp || new Date().toISOString(),
            items: order.items || [],
            total: order.total || 0,
            userEmail: order.userEmail || (order.type === 'cash' ? 'cash@payment.com' : 'unknown@email.com'),
            pin: order.type === 'cash' ? null : (order.pin || '000000'),
            status: (order.status || 'pending').toLowerCase(),
            type: order.type || 'card'
        }));
        
        // Filter to only completed orders for admin dashboard
        const completedOrders = formattedOrders.filter(order => order.status === 'completed');
        
        orderManager.init(completedOrders);
        
    } catch (error) {
        console.error('Error loading orders in admin:', error);
        orderManager.init([]);
    }
}

// Update dashboard stats - FOCUS ON CURRENT YEAR ONLY
function updateDashboardStats() {
    // Get current year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get completed orders (card + cash) for current year
    const yearlyOrders = orderManager.getOrdersByYear(currentYear);
    
    // Calculate yearly stats
    const yearlyStats = statsCalculator.calculateYearlyStats(currentYear, yearlyOrders);
    
    // Update display - SHOW ONLY CURRENT YEAR STATS
    requestAnimationFrame(() => {
        if (completedOrders) completedOrders.textContent = yearlyStats.orders;
        if (totalProfit) totalProfit.textContent = formatCurrency(yearlyStats.profit);
    });
}

// Load admin data
function loadAdminData() {
    const currentEmailInput = document.getElementById('currentAdminEmail');
    if (currentEmailInput) {
        currentEmailInput.value = adminData.email;
    }
}

// Save admin data
function saveAdminData(e) {
    e.preventDefault();
    
    const newEmail = document.getElementById('newAdminEmail') ? document.getElementById('newAdminEmail').value.trim() : '';
    const currentPassword = document.getElementById('currentAdminPassword') ? document.getElementById('currentAdminPassword').value : '';
    const newPassword = document.getElementById('newAdminPassword') ? document.getElementById('newAdminPassword').value : '';
    const confirmPassword = document.getElementById('confirmAdminPassword') ? document.getElementById('confirmAdminPassword').value : '';
    
    // Check if email is being changed
    if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        adminData.email = newEmail;
    }
    
    // Check if password is being changed
    if (newPassword) {
        if (currentPassword !== adminData.password) {
            showToast('Current password is incorrect', 'error');
            return false;
        }
        
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return false;
        }
        
        adminData.password = newPassword;
    }
    
    safeStorage.setJSON('adminData', adminData);
    showToast('Admin details updated successfully');
    
    // Clear form fields
    if (document.getElementById('newAdminEmail')) document.getElementById('newAdminEmail').value = '';
    if (document.getElementById('currentAdminPassword')) document.getElementById('currentAdminPassword').value = '';
    if (document.getElementById('newAdminPassword')) document.getElementById('newAdminPassword').value = '';
    if (document.getElementById('confirmAdminPassword')) document.getElementById('confirmAdminPassword').value = '';
    
    // Update current email display
    loadAdminData();
    
    return true;
}

// Show confirm modal for logout
function showLogoutConfirmModal() {
    if (confirmMessage) {
        confirmMessage.textContent = 'Are you sure you want to logout?';
    }
    if (confirmModal) {
        confirmModal.classList.add('active');
    }
    
    // Set up confirm action
    if (confirmAction) {
        confirmAction.onclick = handleConfirmedLogout;
    }
}

// Handle logout
function handleConfirmedLogout() {
    // Clear session storage
    sessionStorage.removeItem('isAdmin');
    // Clear current user from localStorage
    safeStorage.removeItem('currentUser');
    // Redirect to main site
    window.location.href = 'index.html';
}

// Toggle sidebar function
function toggleSidebar() {
    if (!hamburgerBtn || !sidebar || !overlay) return;
    
    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Close sidebar function
function closeSidebar() {
    if (!hamburgerBtn || !sidebar || !overlay) return;
    
    hamburgerBtn.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle navigation link clicks
function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const activeSection = document.getElementById(targetId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Load data for the section
        if (targetId === 'dashboard') {
            updateDashboardStats();
        } else if (targetId === 'details') {
            loadAdminData();
        }
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar
    closeSidebar();
    
    // Update URL
    window.location.hash = targetId;
}

// Initialize
function initialize() {
    // Check admin access
    if (!checkAdminAccess()) return;
    
    // Load initial data
    loadOrders();
    updateDashboardStats();
    loadAdminData();
    
    // Set active section based on URL hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    const validSections = ['dashboard', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
}

// Event listeners
if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Admin form
if (adminForm) adminForm.addEventListener('submit', saveAdminData);

// Cancel changes
if (cancelChanges) cancelChanges.addEventListener('click', () => {
    loadAdminData();
    // Clear form fields
    if (document.getElementById('newAdminEmail')) document.getElementById('newAdminEmail').value = '';
    if (document.getElementById('currentAdminPassword')) document.getElementById('currentAdminPassword').value = '';
    if (document.getElementById('newAdminPassword')) document.getElementById('newAdminPassword').value = '';
    if (document.getElementById('confirmAdminPassword')) document.getElementById('confirmAdminPassword').value = '';
    showToast('Changes cancelled');
});

// Logout button
if (logoutBtn) logoutBtn.addEventListener('click', showLogoutConfirmModal);

// Confirm modal
if (closeConfirmModal) closeConfirmModal.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

if (cancelConfirm) cancelConfirm.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

// Close confirm modal when clicking outside
if (confirmModal) confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
    }
});

// Handle window resize for desktop warning
function checkDevice() {
    const desktopWarning = document.getElementById('desktopWarning');
    const mobileContent = document.getElementById('mobileContent');
    
    if (!desktopWarning || !mobileContent) return;
    
    if (window.innerWidth >= 1025) {
        desktopWarning.style.display = 'flex';
        mobileContent.style.display = 'none';
    } else {
        desktopWarning.style.display = 'none';
        mobileContent.style.display = 'block';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    checkDevice();
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const validSections = ['dashboard', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
});

// Performance-optimized order update listener - IMMEDIATE REAL-TIME UPDATES
let orderUpdateTimeout = null;
window.addEventListener('ordersUpdated', function() {
    // Immediate update for real-time responsiveness
    if (orderUpdateTimeout) clearTimeout(orderUpdateTimeout);
    
    // Update immediately without debounce for real-time feel
    loadOrders();
    updateDashboardStats();
    
    // Set a small delay to prevent UI blocking
    orderUpdateTimeout = setTimeout(() => {
        // Force refresh if needed
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            updateDashboardStats();
        }
    }, 50);
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);