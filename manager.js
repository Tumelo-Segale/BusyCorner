// Check if user is manager
function checkManagerAccess() {
    // Check session storage for manager flag
    const isManager = sessionStorage.getItem('isManager') === 'true';
    
    if (!isManager) {
        // Check if current user is manager
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email === 'manager@BusyCorner.com' && currentUser.password === 'manager123') {
            sessionStorage.setItem('isManager', 'true');
            return true;
        }
        
        // Redirect to main site if not manager
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

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

// Performance-optimized Order Manager
class OrderManager {
    constructor() {
        this.orders = [];
        this.orderMap = new Map();
        this.statusCache = null;
        this.initialized = false;
    }
    
    init(orders) {
        this.orders = orders || [];
        this.orderMap.clear();
        this.statusCache = null;
        
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
    
    getOrder(id) {
        return this.orderMap.get(id);
    }
    
    getOrdersByStatus(status) {
        if (this.statusCache && this.statusCache.status === status && 
            Date.now() - this.statusCache.timestamp < 5000) {
            return this.statusCache.orders;
        }
        
        const orders = this.orders.filter(order => order.status === status);
        
        this.statusCache = {
            status: status,
            orders: orders,
            timestamp: Date.now()
        };
        
        return orders;
    }
    
    getCompletedOrders() {
        return this.orders.filter(order => order.status === 'completed');
    }
    
    getOrdersByDateRange(startDate, endDate) {
        return this.orders.filter(order => {
            if (order.status !== 'completed') return false;
            const orderDate = new Date(order.timestamp);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }
    
    updateOrderStatus(id, status) {
        const order = this.orderMap.get(id);
        if (order) {
            order.status = status;
            this.statusCache = null;
            return true;
        }
        return false;
    }
    
    searchOrders(searchTerm, status = null) {
        const term = searchTerm.toLowerCase();
        return this.orders.filter(order => {
            if (status && order.status !== status) return false;
            return order.orderId && order.orderId.toLowerCase().includes(term);
        });
    }
    
    addOrder(order) {
        if (!order.id) order.id = Date.now();
        
        // Check if order already exists
        if (!this.orderMap.has(order.id)) {
            this.orders.unshift(order);
            this.orderMap.set(order.id, order);
            this.statusCache = null;
        }
    }
}

const orderManager = new OrderManager();

// Get DOM elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');

// Dashboard elements
const todayOrders = document.getElementById('todayOrders');
const todayOrdersChange = document.getElementById('todayOrdersChange');
const todayRevenue = document.getElementById('todayRevenue');
const todayRevenueChange = document.getElementById('todayRevenueChange');
const pendingOrders = document.getElementById('pendingOrders');
const yearRevenue = document.getElementById('yearRevenue');
const downloadStatementBtn = document.getElementById('downloadStatementBtn');
const monthRevenue = document.getElementById('monthRevenue');
const monthOrders = document.getElementById('monthOrders');
const weekRevenue = document.getElementById('weekRevenue');
const weekOrders = document.getElementById('weekOrders');
const weeklyStatLabel = document.getElementById('weeklyStatLabel');
const monthlyStatLabel = document.getElementById('monthlyStatLabel');
const yearlyStatLabel = document.getElementById('yearlyStatLabel');

// Statement modal elements
const statementModal = document.getElementById('statementModal');
const closeStatementModal = document.getElementById('closeStatementModal');
const cancelStatement = document.getElementById('cancelStatement');
const confirmStatement = document.getElementById('confirmStatement');
const statementType = document.getElementById('statementType');
const includeProfit = document.getElementById('includeProfit');

// Orders elements
const orderFilters = document.querySelectorAll('.filter-btn');
const ordersContainer = document.getElementById('ordersContainer');
const orderSearch = document.getElementById('orderSearch');

// Cash Orders elements
const cashItemSelect = document.getElementById('cashItemSelect');
const cashItemQuantity = document.getElementById('cashItemQuantity');
const addToCashOrderBtn = document.getElementById('addToCashOrderBtn');
const cashOrderItems = document.getElementById('cashOrderItems');
const cashTotalAmount = document.getElementById('cashTotalAmount');
const processCashPaymentBtn = document.getElementById('processCashPaymentBtn');

// Cash Payment Modal elements
const cashPaymentModal = document.getElementById('cashPaymentModal');
const closeCashPaymentModal = document.getElementById('closeCashPaymentModal');
const cancelCashPayment = document.getElementById('cancelCashPayment');
const confirmCashPayment = document.getElementById('confirmCashPayment');
const cashPaymentTotal = document.getElementById('cashPaymentTotal');
const cashPaymentItems = document.getElementById('cashPaymentItems');
const cashAmountReceived = document.getElementById('cashAmountReceived');
const cashChangeContainer = document.getElementById('cashChangeContainer');
const cashChangeAmount = document.getElementById('cashChangeAmount');

// Items elements
const itemsGrid = document.getElementById('itemsGrid');
const addNewItemBtn = document.getElementById('addNewItemBtn');
const itemFilterBtns = document.querySelectorAll('.item-filter-btn');
const descriptionGroup = document.getElementById('descriptionGroup');
const itemDescription = document.getElementById('itemDescription');

// Messages elements
const messagesContainer = document.getElementById('messagesContainer');

// Details elements
const managerForm = document.getElementById('managerForm');
const cancelChanges = document.getElementById('cancelChanges');

// Modal elements
const itemModal = document.getElementById('itemModal');
const closeItemModal = document.getElementById('closeItemModal');
const cancelItem = document.getElementById('cancelItem');
const itemForm = document.getElementById('itemForm');
const itemModalTitle = document.getElementById('itemModalTitle');
const itemCategory = document.getElementById('itemCategory');

const orderDetailsModal = document.getElementById('orderDetailsModal');
const closeOrderDetails = document.getElementById('closeOrderDetails');
const orderDetailsBody = document.getElementById('orderDetailsBody');
const orderDetailsFooter = document.getElementById('orderDetailsFooter');

const messageModal = document.getElementById('messageModal');
const closeMessageModal = document.getElementById('closeMessageModal');
const messageModalBody = document.getElementById('messageModalBody');

const confirmModal = document.getElementById('confirmModal');
const closeConfirmModal = document.getElementById('closeConfirmModal');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');
const confirmMessage = document.getElementById('confirmMessage');

const pinModal = document.getElementById('pinModal');
const closePinModal = document.getElementById('closePinModal');
const cancelPin = document.getElementById('cancelPin');
const pinInput = document.getElementById('pinInput');
const verifyPin = document.getElementById('verifyPin');
const pinError = document.getElementById('pinError');

// Toast element
const toast = document.getElementById('toast');

// State
let managerData = safeStorage.getJSON('managerData') || {
    email: 'manager@BusyCorner.com',
    password: 'manager123',
    name: 'Manager'
};

let items = safeStorage.getJSON('managerItems') || [];
let messages = safeStorage.getJSON('contactMessages') || [];
let currentOrders = [];
let editingItemId = null;
let currentAction = null;
let currentActionData = null;
let currentOrderForPin = null;
let currentOrderForDetails = null;
let currentFilterStatus = 'pending';

// Cash Order State
let currentCashOrder = {
    items: [],
    total: 0,
    type: 'cash'
};

// Helper function to get week number
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
}

// Helper function to get start and end of week
function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

// Initialize cash orders in localStorage
let cashOrders = safeStorage.getJSON('cashOrders') || [];

// Initialize stats with proper structure
function initializeStats() {
    const now = new Date();
    const today = now.toDateString();
    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let stats = safeStorage.getJSON('managerStats');
    
    // If no stats exist or stats structure is incomplete, create new stats
    if (!stats || typeof stats !== 'object') {
        stats = {
            today: {
                date: today,
                orders: 0,
                revenue: 0
            },
            weekly: {
                week: currentWeek,
                year: currentYear,
                orders: 0,
                revenue: 0
            },
            monthly: {
                month: currentMonth,
                year: currentYear,
                orders: 0,
                revenue: 0
            },
            yearly: {
                year: currentYear,
                orders: 0,
                revenue: 0
            }
        };
    } else {
        // Ensure all required properties exist
        if (!stats.today) stats.today = { date: today, orders: 0, revenue: 0 };
        if (!stats.weekly) stats.weekly = { week: currentWeek, year: currentYear, orders: 0, revenue: 0 };
        if (!stats.monthly) stats.monthly = { month: currentMonth, year: currentYear, orders: 0, revenue: 0 };
        if (!stats.yearly) stats.yearly = { year: currentYear, orders: 0, revenue: 0 };
    }
    
    safeStorage.setJSON('managerStats', stats);
    return stats;
}

// Stats tracking with auto-reset
let stats = initializeStats();

// Check and reset stats if needed
function checkAndResetStats() {
    const now = new Date();
    const today = now.toDateString();
    const currentWeek = getWeekNumber(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize stats if they don't exist
    if (!stats) {
        stats = initializeStats();
    }
    
    // Ensure stats object has all required properties
    if (!stats.today) stats.today = { date: today, orders: 0, revenue: 0 };
    if (!stats.weekly) stats.weekly = { week: currentWeek, year: currentYear, orders: 0, revenue: 0 };
    if (!stats.monthly) stats.monthly = { month: currentMonth, year: currentYear, orders: 0, revenue: 0 };
    if (!stats.yearly) stats.yearly = { year: currentYear, orders: 0, revenue: 0 };
    
    // Reset daily stats if it's a new day
    if (stats.today.date !== today) {
        stats.today = {
            date: today,
            orders: 0,
            revenue: 0
        };
    }
    
    // Reset weekly stats if it's a new week
    if (stats.weekly.week !== currentWeek || stats.weekly.year !== currentYear) {
        stats.weekly = {
            week: currentWeek,
            year: currentYear,
            orders: 0,
            revenue: 0
        };
    }
    
    // Reset monthly stats if it's a new month
    if (stats.monthly.month !== currentMonth || stats.monthly.year !== currentYear) {
        stats.monthly = {
            month: currentMonth,
            year: currentYear,
            orders: 0,
            revenue: 0
        };
    }
    
    // Reset yearly stats if it's a new year
    if (stats.yearly.year !== currentYear) {
        stats.yearly = {
            year: currentYear,
            orders: 0,
            revenue: 0
        };
    }
    
    safeStorage.setJSON('managerStats', stats);
}

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

// Format date to DD/MM/YYYY for statements
function formatDateForStatement(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error('Error formatting date for statement:', e);
        return 'Unknown date';
    }
}

// Format currency
function formatCurrency(amount) {
    return `R${parseFloat(amount).toFixed(2)}`;
}

// Calculate 5% profit
function calculateProfit(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Get status class
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'ready':
            return 'status-ready';
        case 'completed':
            return 'status-completed';
        default:
            return 'status-pending';
    }
}

// Generate order ID for cash orders
function generateCashOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    return `CASH${year}${month}${day}-${randomNum}`;
}

// Update stat labels with current date information
function updateStatLabels() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[now.getMonth()];
    
    if (weeklyStatLabel) {
        weeklyStatLabel.textContent = `Current week only`;
    }
    
    if (monthlyStatLabel) {
        monthlyStatLabel.textContent = `${currentMonth} ${currentYear} only`;
    }
    
    if (yearlyStatLabel) {
        yearlyStatLabel.textContent = `${currentYear} only`;
    }
}

// Load orders from main app (including cash orders)
function loadOrders() {
    try {
        // Clear current orders
        currentOrders = [];
        
        // Load online orders from localStorage
        let onlineOrders = safeStorage.getJSON('orders') || [];
        
        // Load cash orders
        cashOrders = safeStorage.getJSON('cashOrders') || [];
        
        // Create a Set to track unique orders by ID to avoid duplicates
        const uniqueOrderIds = new Set();
        
        // Process online orders
        onlineOrders.forEach(order => {
            if (!order.id) order.id = Date.now();
            if (!uniqueOrderIds.has(order.id)) {
                uniqueOrderIds.add(order.id);
                const formattedOrder = {
                    id: order.id,
                    orderId: order.orderId || `BCR${order.id.toString().slice(-8)}`,
                    timestamp: order.timestamp || new Date().toISOString(),
                    items: order.items || [],
                    total: order.total || 0,
                    userEmail: order.userEmail || 'unknown@email.com',
                    pin: order.pin || Math.floor(100000 + Math.random() * 900000).toString(),
                    status: (order.status || 'pending').toLowerCase(),
                    type: 'card'
                };
                currentOrders.push(formattedOrder);
            }
        });
        
        // Process cash orders
        cashOrders.forEach(order => {
            if (!order.id) order.id = Date.now();
            if (!uniqueOrderIds.has(order.id)) {
                uniqueOrderIds.add(order.id);
                const formattedOrder = {
                    id: order.id,
                    orderId: order.orderId || `CASH${order.id.toString().slice(-8)}`,
                    timestamp: order.timestamp || new Date().toISOString(),
                    items: order.items || [],
                    total: order.total || 0,
                    userEmail: order.userEmail || 'cash@payment.com',
                    pin: null,
                    status: (order.status || 'pending').toLowerCase(),
                    type: 'cash',
                    amountReceived: order.amountReceived || 0,
                    change: order.change || 0
                };
                currentOrders.push(formattedOrder);
            }
        });
        
        // Sort by timestamp (newest first)
        currentOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        orderManager.init(currentOrders);
        
    } catch (error) {
        console.error('Error loading orders in manager:', error);
        orderManager.init([]);
    }
}

// Update dashboard stats with auto-reset (including cash orders)
function updateDashboardStats() {
    // Check and reset stats if needed
    checkAndResetStats();
    
    // Update stat labels with current date
    updateStatLabels();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get week range
    const weekRange = getWeekRange(now);
    const weekStart = weekRange.start;
    const weekEnd = weekRange.end;
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const firstDayOfNextYear = new Date(currentYear + 1, 0, 1);
    
    // Get ALL completed orders (card + cash)
    const completedOrdersList = orderManager.getCompletedOrders();
    
    // Calculate today's stats (card + cash)
    const todayOrdersList = completedOrdersList.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= today && orderDate < tomorrow;
    });
    
    const todayOrdersCount = todayOrdersList.length;
    const todayRevenueAmount = todayOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate weekly stats (card + cash)
    const weeklyOrdersList = completedOrdersList.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= weekStart && orderDate <= weekEnd;
    });
    
    const weeklyOrdersCount = weeklyOrdersList.length;
    const weeklyRevenueAmount = weeklyOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate monthly stats (card + cash)
    const monthlyOrdersList = completedOrdersList.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= firstDayOfMonth && orderDate < firstDayOfNextMonth;
    });
    
    const monthlyOrdersCount = monthlyOrdersList.length;
    const monthlyRevenueAmount = monthlyOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate yearly stats (card + cash)
    const yearlyOrdersList = completedOrdersList.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= firstDayOfYear && orderDate < firstDayOfNextYear;
    });
    
    const yearlyOrdersCount = yearlyOrdersList.length;
    const yearlyRevenueAmount = yearlyOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get pending orders (including cash orders)
    const pendingOrdersList = currentOrders.filter(order => order.status === 'pending');
    const pendingCount = pendingOrdersList.length;
    
    // Update display with requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        if (todayOrders) todayOrders.textContent = todayOrdersCount;
        if (todayRevenue) todayRevenue.textContent = formatCurrency(todayRevenueAmount);
        if (pendingOrders) pendingOrders.textContent = pendingCount;
        if (weekRevenue) weekRevenue.textContent = formatCurrency(weeklyRevenueAmount);
        if (weekOrders) weekOrders.textContent = weeklyOrdersCount;
        if (monthRevenue) monthRevenue.textContent = formatCurrency(monthlyRevenueAmount);
        if (monthOrders) monthOrders.textContent = monthlyOrdersCount;
        if (yearRevenue) yearRevenue.textContent = formatCurrency(yearlyRevenueAmount);
    });
    
    // Update stats tracking
    stats.today.orders = todayOrdersCount;
    stats.today.revenue = todayRevenueAmount;
    stats.weekly.orders = weeklyOrdersCount;
    stats.weekly.revenue = weeklyRevenueAmount;
    stats.monthly.orders = monthlyOrdersCount;
    stats.monthly.revenue = monthlyRevenueAmount;
    stats.yearly.orders = yearlyOrdersCount;
    stats.yearly.revenue = yearlyRevenueAmount;
    
    safeStorage.setJSON('managerStats', stats);
}

// Search orders
function searchOrders(searchTerm) {
    const filteredOrders = orderManager.searchOrders(searchTerm, currentFilterStatus);
    
    displayFilteredOrders(filteredOrders);
}

// Display filtered orders - REMOVED customer email for both card and cash orders, shows date only
function displayFilteredOrders(filteredOrders) {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '';
    
    // Show both online and cash orders in this section
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilterStatus} orders found</p>
            </div>
        `;
        return;
    }
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
    });
    
    filteredOrders.forEach(order => {
        const statusClass = getStatusClass(order.status || 'pending');
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.dataset.orderId = order.id;
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Status:</strong> <span class="order-status-display ${statusClass}">${order.status || 'pending'}</span></p>
                <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
                <p><strong>Type:</strong> ${order.type === 'cash' ? 'Cash' : 'Card'}</p>
                ${order.type === 'cash' && order.items && order.items.length > 0 ? 
                    `<p><strong>Items:</strong> ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}</p>` : 
                    ''}
            </div>
            <div class="order-actions">
                <button class="status-btn view-order-btn" data-order-id="${order.id}">View Details</button>
                ${order.status === 'pending' ? `<button class="status-btn ready-btn" data-order-id="${order.id}" data-status="ready">Mark as Ready</button>` : ''}
                ${order.status === 'ready' ? `<button class="status-btn complete-btn" data-order-id="${order.id}" data-status="complete">Mark as Complete</button>` : ''}
            </div>
        `;
        fragment.appendChild(orderElement);
    });
    
    ordersContainer.appendChild(fragment);
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            const order = orderManager.getOrder(orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });
    
    document.querySelectorAll('.ready-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            updateOrderStatus(orderId, 'ready');
        });
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            const order = orderManager.getOrder(orderId);
            if (order && order.type === 'card') {
                showPinVerification(order);
            } else if (order && order.type === 'cash') {
                // Cash orders don't need PIN verification
                updateOrderStatus(orderId, 'completed');
            }
        });
    });
}

// Display all orders
function displayAllOrders(status = 'pending') {
    currentFilterStatus = status;
    const searchTerm = orderSearch ? orderSearch.value.trim() : '';
    
    if (searchTerm) {
        searchOrders(searchTerm);
    } else {
        const filteredOrders = orderManager.getOrdersByStatus(status);
        displayFilteredOrders(filteredOrders);
    }
}

// Load items for cash order dropdown
function loadCashOrderItems() {
    if (!cashItemSelect) return;
    
    cashItemSelect.innerHTML = '<option value="">Select an item...</option>';
    
    const activeItems = items.filter(item => item.available);
    
    activeItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} - ${formatCurrency(item.price)}`;
        option.dataset.price = item.price;
        option.dataset.name = item.name;
        cashItemSelect.appendChild(option);
    });
}

// Update cash order display
function updateCashOrderDisplay() {
    if (!cashOrderItems || !cashTotalAmount) return;
    
    cashOrderItems.innerHTML = '';
    
    if (currentCashOrder.items.length === 0) {
        cashOrderItems.innerHTML = `
            <div class="empty-state">
                <p>No items added yet</p>
            </div>
        `;
        cashTotalAmount.textContent = 'R 0.00';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    currentCashOrder.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cash-order-item';
        itemElement.innerHTML = `
            <div class="cash-order-item-info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)} x ${item.quantity}</p>
            </div>
            <div class="cash-order-item-actions">
                <span>${formatCurrency(item.price * item.quantity)}</span>
                <button class="remove-cash-item-btn" data-index="${index}">&times;</button>
            </div>
        `;
        fragment.appendChild(itemElement);
    });
    
    cashOrderItems.appendChild(fragment);
    
    // Calculate total
    const total = currentCashOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    currentCashOrder.total = total;
    cashTotalAmount.textContent = formatCurrency(total);
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-cash-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            currentCashOrder.items.splice(index, 1);
            updateCashOrderDisplay();
        });
    });
}

// Add item to cash order
function addItemToCashOrder() {
    const selectedItemId = parseInt(cashItemSelect.value);
    const quantity = parseInt(cashItemQuantity.value) || 1;
    
    if (!selectedItemId || quantity < 1) {
        showToast('Please select an item and enter a valid quantity', 'error');
        return;
    }
    
    const item = items.find(i => i.id === selectedItemId);
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }
    
    // Check if item already exists in order
    const existingItemIndex = currentCashOrder.items.findIndex(i => i.id === item.id);
    if (existingItemIndex > -1) {
        currentCashOrder.items[existingItemIndex].quantity += quantity;
    } else {
        currentCashOrder.items.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantity
        });
    }
    
    updateCashOrderDisplay();
    cashItemQuantity.value = 1;
    showToast('Item added to order');
}

// Show cash payment modal
function showCashPaymentModal() {
    if (currentCashOrder.items.length === 0) {
        showToast('Please add items to the order first', 'error');
        return;
    }
    
    if (cashPaymentTotal) cashPaymentTotal.textContent = formatCurrency(currentCashOrder.total);
    
    if (cashPaymentItems) {
        cashPaymentItems.innerHTML = '';
        currentCashOrder.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cash-payment-item';
            itemDiv.innerHTML = `
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            `;
            cashPaymentItems.appendChild(itemDiv);
        });
    }
    
    if (cashAmountReceived) cashAmountReceived.value = '';
    if (cashChangeContainer) cashChangeContainer.style.display = 'none';
    
    if (cashPaymentModal) cashPaymentModal.classList.add('active');
}

// Calculate cash change
function calculateCashChange() {
    const amountReceived = parseFloat(cashAmountReceived.value) || 0;
    const total = currentCashOrder.total;
    
    if (amountReceived >= total) {
        const change = amountReceived - total;
        if (cashChangeAmount) cashChangeAmount.textContent = formatCurrency(change);
        if (cashChangeContainer) cashChangeContainer.style.display = 'block';
        return true;
    } else {
        if (cashChangeContainer) cashChangeContainer.style.display = 'none';
        return false;
    }
}

// Process cash payment
function processCashPayment() {
    const amountReceived = parseFloat(cashAmountReceived.value) || 0;
    
    if (amountReceived < currentCashOrder.total) {
        showToast('Amount received is less than total amount', 'error');
        return;
    }
    
    // Generate unique ID
    const orderId = Date.now();
    
    // Create cash order with 'pending' status initially
    const cashOrder = {
        id: orderId,
        orderId: generateCashOrderId(),
        timestamp: new Date().toISOString(),
        items: [...currentCashOrder.items],
        total: currentCashOrder.total,
        userEmail: 'cash@payment.com',
        pin: null,
        status: 'pending', // Start as pending
        type: 'cash',
        paymentMethod: 'cash',
        amountReceived: amountReceived,
        change: amountReceived - currentCashOrder.total
    };
    
    // Add to cash orders array
    cashOrders.unshift(cashOrder);
    safeStorage.setJSON('cashOrders', cashOrders);
    
    // Add to order manager
    orderManager.addOrder(cashOrder);
    
    // Clear current cash order
    currentCashOrder = {
        items: [],
        total: 0,
        type: 'cash'
    };
    
    updateCashOrderDisplay();
    updateDashboardStats();
    
    // Refresh orders display if we're on the orders page
    if (document.getElementById('orders')?.classList.contains('active')) {
        displayAllOrders(currentFilterStatus);
    }
    
    if (cashPaymentModal) cashPaymentModal.classList.remove('active');
    
    // Trigger update for customer app
    updateRealTimeOrders();
    
    showToast(`Cash order created successfully. Change: ${formatCurrency(cashOrder.change)}`);
}

// Show order details modal - REMOVED customer email from card orders, shows date only
function showOrderDetails(order) {
    currentOrderForDetails = order;
    const statusClass = getStatusClass(order.status || 'pending');
    
    if (!orderDetailsBody || !orderDetailsFooter) return;
    
    orderDetailsBody.innerHTML = `
        <div class="order-details-info">
            <div class="detail-row">
                <div class="detail-label">Order ID:</div>
                <div class="detail-value">${order.orderId || 'Unknown ID'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Payment Type:</div>
                <div class="detail-value">${order.type === 'cash' ? 'Cash' : 'Card'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="order-status-display ${statusClass}">${order.status || 'pending'}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Amount:</div>
                <div class="detail-value">${formatCurrency(order.total || 0)}</div>
            </div>
            ${order.type === 'cash' ? `
                <div class="detail-row">
                    <div class="detail-label">Amount Received:</div>
                    <div class="detail-value">${formatCurrency(order.amountReceived || 0)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Change:</div>
                    <div class="detail-value">${formatCurrency(order.change || 0)}</div>
                </div>
            ` : ''}
        </div>
        <div class="order-items-list">
            <h4>Order Items:</h4>
            ${order.items && order.items.length > 0 ? order.items.map(item => `
                <div class="order-item-row">
                    <span>${item.quantity || 1}x ${item.name || 'Unknown item'}</span>
                    <span>${formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                </div>
            `).join('') : '<p>No items in this order</p>'}
        </div>
        <div class="order-total-row">
            <strong>Total:</strong>
            <span>${formatCurrency(order.total || 0)}</span>
        </div>
    `;
    
    // Clear footer and add appropriate action buttons
    orderDetailsFooter.innerHTML = '';
    
    const orderStatus = order.status || 'pending';
    
    if (orderStatus === 'pending') {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
            <button type="button" class="save-btn" id="markAsReadyBtn">Mark as Ready</button>
        `;
    } else if (orderStatus === 'ready') {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
            <button type="button" class="save-btn" id="markAsCompleteBtn">Mark as Complete</button>
        `;
    } else {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
        `;
    }
    
    // Add event listeners to footer buttons
    setTimeout(() => {
        const closeBtn = document.getElementById('closeOrderDetailsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
        
        const markAsReadyBtn = document.getElementById('markAsReadyBtn');
        if (markAsReadyBtn) {
            markAsReadyBtn.addEventListener('click', () => {
                updateOrderStatus(order.id, 'ready');
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
        
        const markAsCompleteBtn = document.getElementById('markAsCompleteBtn');
        if (markAsCompleteBtn) {
            markAsCompleteBtn.addEventListener('click', () => {
                if (order.type === 'card') {
                    showPinVerification(order);
                } else {
                    // Cash orders don't need PIN
                    updateOrderStatus(order.id, 'completed');
                }
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
    }, 100);
    
    if (orderDetailsModal) orderDetailsModal.classList.add('active');
}

// Show PIN verification modal
function showPinVerification(order) {
    currentOrderForPin = order;
    if (pinInput) pinInput.value = '';
    if (pinError) pinError.style.display = 'none';
    if (pinModal) pinModal.classList.add('active');
}

// Verify PIN and update order status
function verifyOrderPin() {
    const enteredPin = pinInput ? pinInput.value : '';
    
    if (enteredPin.length !== 6) {
        if (pinError) {
            pinError.textContent = 'PIN must be 6 digits';
            pinError.style.display = 'block';
        }
        return;
    }
    
    if (enteredPin !== currentOrderForPin.pin) {
        if (pinError) {
            pinError.textContent = 'Incorrect PIN. Please try again.';
            pinError.style.display = 'block';
        }
        return;
    }
    
    // Update order status
    updateOrderStatus(currentOrderForPin.id, 'completed');
    if (pinModal) pinModal.classList.remove('active');
    showToast('Order marked as complete');
    currentOrderForPin = null;
}

// Update order status for both card and cash orders
function updateOrderStatus(orderId, newStatus) {
    const order = orderManager.getOrder(orderId);
    if (order) {
        const currentStatus = order.status || 'pending';
        
        // Prevent status regression
        const statusOrder = ['pending', 'ready', 'completed'];
        const currentStatusIndex = statusOrder.indexOf(currentStatus);
        const newStatusIndex = statusOrder.indexOf(newStatus);
        
        if (newStatusIndex < currentStatusIndex) {
            showToast(`Cannot change status from ${currentStatus} to ${newStatus}`, 'error');
            return;
        }
        
        if (currentStatus === 'completed') {
            showToast('Completed orders cannot be modified', 'error');
            return;
        }
        
        // Update in order manager
        orderManager.updateOrderStatus(orderId, newStatus);
        
        // Update in appropriate storage based on order type
        if (order.type === 'cash') {
            // Update in cashOrders array
            const cashOrderIndex = cashOrders.findIndex(o => o.id === orderId);
            if (cashOrderIndex !== -1) {
                cashOrders[cashOrderIndex].status = newStatus;
                safeStorage.setJSON('cashOrders', cashOrders);
            }
        } else {
            // Update in main orders array
            const mainOrders = safeStorage.getJSON('orders') || [];
            const mainOrderIndex = mainOrders.findIndex(o => o.id === orderId);
            if (mainOrderIndex !== -1) {
                mainOrders[mainOrderIndex].status = newStatus;
                safeStorage.setJSON('orders', mainOrders);
            }
        }
        
        // Reload orders to ensure consistency
        loadOrders();
        
        // Update dashboard and displays
        updateDashboardStats();
        displayAllOrders(currentFilterStatus);
        showToast(`Order status updated to ${newStatus}`);
        
        // Update real-time for customers
        updateRealTimeOrders();
    }
}

// Update real-time orders for customers
function updateRealTimeOrders() {
    const event = new Event('ordersUpdated');
    window.dispatchEvent(event);
}

// Display menu items
function displayMenuItems(filter = 'meals') {
    if (!itemsGrid) return;
    
    itemsGrid.innerHTML = '';
    
    let filteredItems = [...items];
    
    if (filter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === filter);
    }
    
    if (filteredItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <p>No ${filter} items found</p>
            </div>
        `;
        return;
    }
    
    // Sort by availability (available first)
    filteredItems.sort((a, b) => b.available - a.available);
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `item-card ${item.available ? '' : 'unavailable'}`;
        itemElement.innerHTML = `
            <div class="item-header">
                <h3 class="item-name">${item.name}</h3>
                <span class="item-price">${formatCurrency(item.price)}</span>
            </div>
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
            <div class="item-footer">
                <span class="item-category">${item.category}</span>
                <div class="item-actions">
                    <button class="item-btn edit-item-btn" data-item-id="${item.id}">Edit</button>
                    <button class="item-btn delete-item-btn" data-item-id="${item.id}">Delete</button>
                </div>
            </div>
        `;
        fragment.appendChild(itemElement);
    });
    
    itemsGrid.appendChild(fragment);
    
    // Add event listeners to item buttons
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (item) {
                showEditItemModal(item);
            }
        });
    });
    
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (item) {
                showConfirmModal('deleteItem', itemId, `Are you sure you want to delete "${item.name}"?`);
            }
        });
    });
}

// Show add item modal
function showAddItemModal() {
    editingItemId = null;
    if (itemModalTitle) itemModalTitle.textContent = 'Add New Item';
    if (itemForm) itemForm.reset();
    if (document.getElementById('itemAvailable')) document.getElementById('itemAvailable').checked = true;
    if (itemCategory) itemCategory.value = 'meals';
    updateDescriptionField();
    if (itemModal) itemModal.classList.add('active');
}

// Show edit item modal
function showEditItemModal(item) {
    editingItemId = item.id;
    if (itemModalTitle) itemModalTitle.textContent = 'Edit Item';
    
    if (document.getElementById('itemName')) document.getElementById('itemName').value = item.name;
    if (itemDescription) itemDescription.value = item.description || '';
    if (document.getElementById('itemPrice')) document.getElementById('itemPrice').value = item.price;
    if (itemCategory) itemCategory.value = item.category;
    if (document.getElementById('itemAvailable')) document.getElementById('itemAvailable').checked = item.available;
    
    updateDescriptionField();
    if (itemModal) itemModal.classList.add('active');
}

// Update description field based on category
function updateDescriptionField() {
    const category = itemCategory ? itemCategory.value : 'meals';
    
    if (descriptionGroup) {
        if (category === 'drinks') {
            descriptionGroup.style.display = 'none';
            if (itemDescription) itemDescription.value = '';
        } else {
            descriptionGroup.style.display = 'block';
        }
    }
}

// Save item
function saveItem(formData) {
    if (editingItemId !== null) {
        // Edit existing item
        const itemIndex = items.findIndex(item => item.id === editingItemId);
        if (itemIndex !== -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                ...formData
            };
            showToast('Item updated successfully');
        }
    } else {
        // Add new item
        const newItem = {
            id: Date.now(),
            ...formData
        };
        items.unshift(newItem);
        showToast('Item added successfully');
    }
    
    // Save to localStorage
    safeStorage.setJSON('managerItems', items);
    
    // Sync with main app
    syncItemsToMainApp();
    
    // Reload cash order items dropdown
    loadCashOrderItems();
    
    if (itemModal) itemModal.classList.remove('active');
    displayMenuItems();
    updateDashboardStats();
}

// Sync items to main app
function syncItemsToMainApp() {
    // Convert manager items to main app format
    const mainAppItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        category: item.category,
        active: item.available
    }));
    
    safeStorage.setJSON('menuItems', mainAppItems);
    
    // Trigger real-time update for customers
    const event = new Event('menuItemsUpdated');
    window.dispatchEvent(event);
}

// Delete item
function deleteItem(itemId) {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        safeStorage.setJSON('managerItems', items);
        
        // Sync with main app
        syncItemsToMainApp();
        
        // Reload cash order items dropdown
        loadCashOrderItems();
        
        showToast('Item deleted successfully');
        displayMenuItems();
        updateDashboardStats();
    }
}

// Display messages
function displayMessages() {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <p>No messages yet</p>
            </div>
        `;
        return;
    }
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Sort by date (newest first) and read status
    messages.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message-item ${message.read ? '' : 'unread'}`;
        messageElement.dataset.messageId = message.id;
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-sender">${message.name}</div>
                <div class="message-date">${formatDate(message.timestamp)}</div>
            </div>
            <p class="message-preview">${message.message}</p>
        `;
        fragment.appendChild(messageElement);
    });
    
    messagesContainer.appendChild(fragment);
    
    // Add event listeners to messages
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const messageId = parseInt(item.dataset.messageId);
            const message = messages.find(m => m.id === messageId);
            if (message) {
                showMessageDetails(message);
                
                // Mark as read
                if (!message.read) {
                    message.read = true;
                    safeStorage.setJSON('contactMessages', messages);
                    item.classList.remove('unread');
                }
            }
        });
    });
}

// Show message details
function showMessageDetails(message) {
    if (!messageModalBody) return;
    
    messageModalBody.innerHTML = `
        <div class="message-details">
            <div class="message-detail-row">
                <label>From:</label>
                <p>${message.name} (${message.email})</p>
            </div>
            <div class="message-detail-row">
                <label>Date:</label>
                <p>${formatDate(message.timestamp)}</p>
            </div>
            <div class="message-detail-row">
                <label>Message:</label>
                <p>${message.message}</p>
            </div>
        </div>
    `;
    
    if (messageModal) messageModal.classList.add('active');
}

// Load manager data
function loadManagerData() {
    const currentEmailInput = document.getElementById('currentManagerEmail');
    if (currentEmailInput) {
        currentEmailInput.value = managerData.email;
    }
}

// Save manager data
function saveManagerData(formData) {
    const newEmail = document.getElementById('newManagerEmail') ? document.getElementById('newManagerEmail').value.trim() : '';
    const currentPassword = document.getElementById('currentManagerPassword') ? document.getElementById('currentManagerPassword').value : '';
    const newPassword = document.getElementById('newManagerPassword') ? document.getElementById('newManagerPassword').value : '';
    const confirmPassword = document.getElementById('confirmManagerPassword') ? document.getElementById('confirmManagerPassword').value : '';
    
    // Check if email is being changed
    if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        managerData.email = newEmail;
    }
    
    // Check if password is being changed
    if (newPassword) {
        if (currentPassword !== managerData.password) {
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
        
        managerData.password = newPassword;
    }
    
    safeStorage.setJSON('managerData', managerData);
    return true;
}

// Show statement selection modal
function showStatementModal() {
    if (statementModal) {
        statementModal.classList.add('active');
    }
}

// Download statement as Excel file - FIXED sheet name length
function downloadStatement(statementTypeValue, includeProfitCalc) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let filteredOrders = [];
    let fileName = '';
    let sheetName = '';
    let title = '';
    
    if (statementTypeValue === 'weekly') {
        // Get current week range
        const weekRange = getWeekRange(currentDate);
        const weekStart = weekRange.start;
        const weekEnd = weekRange.end;
        
        filteredOrders = orderManager.getOrdersByDateRange(weekStart, weekEnd);
        
        // Format dates for filename
        const startStr = `${weekStart.getDate().toString().padStart(2, '0')}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`;
        const endStr = `${weekEnd.getDate().toString().padStart(2, '0')}-${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`;
        
        fileName = `BusyCorner_Statement_Week_${startStr}_to_${endStr}_${currentYear}`;
        sheetName = `Week_${startStr}_${endStr}_${currentYear}`; // Shortened to prevent >31 chars
        title = `BusyCorner - Week ${startStr} to ${endStr} ${currentYear} - Statement`;
    } else if (statementTypeValue === 'monthly') {
        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        filteredOrders = orderManager.getOrdersByDateRange(firstDay, lastDay);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[currentMonth];
        fileName = `BusyCorner_Statement_${monthName}_${currentYear}`;
        sheetName = `${monthName}_${currentYear}`; // Shortened to prevent >31 chars
        title = `BusyCorner - ${monthName} ${currentYear} - Statement`;
    } else {
        // Get first and last day of current year
        const firstDay = new Date(currentYear, 0, 1);
        const lastDay = new Date(currentYear, 11, 31);
        
        filteredOrders = orderManager.getOrdersByDateRange(firstDay, lastDay);
        fileName = `BusyCorner_Statement_${currentYear}`;
        sheetName = `Year_${currentYear}`; // Shortened to prevent >31 chars
        title = `BusyCorner - ${currentYear} - Statement`;
    }
    
    if (filteredOrders.length === 0) {
        showToast(`No completed orders for selected period`, 'error');
        return;
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
        [title],
        statementTypeValue === 'weekly' ? 
            [`Period: ${formatDateForStatement(filteredOrders[filteredOrders.length-1]?.timestamp)} to ${formatDateForStatement(filteredOrders[0]?.timestamp)}`] :
        statementTypeValue === 'monthly' ? 
            [`Month: ${currentMonth + 1}/${currentYear}`] : 
            [`Year: ${currentYear}`],
        [],
        ["Summary"],
        ["Total Completed Orders", filteredOrders.length],
        ["Total Revenue", `R${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}`],
    ];
    
    if (includeProfitCalc) {
        const totalProfit = filteredOrders.reduce((sum, order) => sum + calculateProfit(order.total || 0), 0);
        summaryData.push(["Total Profit (5%)", `R${totalProfit.toFixed(2)}`]);
    }
    
    summaryData.push([], ["Order Details"]);
    
    // Order details - REMOVED Payment Type column
    const orderDetails = filteredOrders.map(order => {
        const profit = calculateProfit(order.total || 0);
        const row = [
            order.timestamp ? formatDateForStatement(order.timestamp) : 'Unknown',
            order.orderId || 'Unknown',
            `R${(order.total || 0).toFixed(2)}`
        ];
        
        if (includeProfitCalc) {
            row.push(`R${profit.toFixed(2)}`);
        }
        
        return row;
    });
    
    // Combine data - REMOVED "Payment Type" header
    const headers = ["Date", "Order ID", "Order Amount"];
    if (includeProfitCalc) {
        headers.push("5% Transactional Profit");
    }
    
    const allData = [...summaryData, headers, ...orderDetails];
    
    const worksheet = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths
    const colWidths = [
        { wch: 15 }, // Date column
        { wch: 25 }, // Order ID column
        { wch: 15 }  // Amount column
    ];
    
    if (includeProfitCalc) {
        colWidths.push({ wch: 20 }); // Profit column
    }
    
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate and download Excel file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    const typeText = statementTypeValue === 'weekly' ? 'Weekly' : 
                    statementTypeValue === 'monthly' ? 'Monthly' : 'Annual';
    
    showToast(`${typeText} statement downloaded${includeProfitCalc ? ' with profit calculation' : ''}`);
}

// Show confirm modal
function showConfirmModal(action, data, message) {
    currentAction = action;
    currentActionData = data;
    if (confirmMessage) confirmMessage.textContent = message;
    if (confirmModal) confirmModal.classList.add('active');
    
    // Set up confirm action
    if (confirmAction) {
        confirmAction.onclick = handleConfirmedAction;
    }
}

// Handle confirmed action
function handleConfirmedAction() {
    switch (currentAction) {
        case 'deleteItem':
            deleteItem(currentActionData);
            break;
        case 'logout':
            // Clear session storage
            sessionStorage.removeItem('isManager');
            // Clear current user from localStorage
            safeStorage.removeItem('currentUser');
            // Redirect to main site
            window.location.href = 'index.html';
            break;
    }
    
    if (confirmModal) confirmModal.classList.remove('active');
    currentAction = null;
    currentActionData = null;
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
    
    if (targetId === 'logout') {
        showConfirmModal('logout', null, 'Are you sure you want to logout?');
        closeSidebar();
        return;
    }
    
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
        } else if (targetId === 'orders') {
            displayAllOrders('pending');
        } else if (targetId === 'cash-orders') {
            loadCashOrderItems();
        } else if (targetId === 'items') {
            displayMenuItems('meals');
        } else if (targetId === 'messages') {
            displayMessages();
        } else if (targetId === 'details') {
            loadManagerData();
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
    // Check manager access
    if (!checkManagerAccess()) return;
    
    // Load initial data
    loadOrders();
    updateDashboardStats();
    displayAllOrders('pending');
    displayMenuItems('meals');
    displayMessages();
    loadManagerData();
    loadCashOrderItems();
    
    // Sync items to main app on initial load
    syncItemsToMainApp();
    
    // Set active section based on URL hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    const validSections = ['dashboard', 'orders', 'cash-orders', 'items', 'messages', 'details'];
    
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

// Add new item button
if (addNewItemBtn) addNewItemBtn.addEventListener('click', showAddItemModal);

// Item form
if (itemForm) itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const category = itemCategory ? itemCategory.value : 'meals';
    const description = itemDescription ? itemDescription.value.trim() : '';
    
    const formData = {
        name: document.getElementById('itemName') ? document.getElementById('itemName').value.trim() : '',
        description: category === 'drinks' ? '' : description,
        price: parseFloat(document.getElementById('itemPrice') ? document.getElementById('itemPrice').value : 0),
        category: category,
        available: document.getElementById('itemAvailable') ? document.getElementById('itemAvailable').checked : true
    };
    
    saveItem(formData);
});

// Category change handler
if (itemCategory) itemCategory.addEventListener('change', updateDescriptionField);

// Close item modal
if (closeItemModal) closeItemModal.addEventListener('click', () => {
    if (itemModal) itemModal.classList.remove('active');
});

if (cancelItem) cancelItem.addEventListener('click', () => {
    if (itemModal) itemModal.classList.remove('active');
});

// Close item modal when clicking outside
if (itemModal) itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        itemModal.classList.remove('active');
    }
});

// Close order details modal
if (closeOrderDetails) closeOrderDetails.addEventListener('click', () => {
    if (orderDetailsModal) orderDetailsModal.classList.remove('active');
});

// Close order details modal when clicking outside
if (orderDetailsModal) orderDetailsModal.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
        orderDetailsModal.classList.remove('active');
    }
});

// Close message modal
if (closeMessageModal) closeMessageModal.addEventListener('click', () => {
    if (messageModal) messageModal.classList.remove('active');
});

// Close message modal when clicking outside
if (messageModal) messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
        messageModal.classList.remove('active');
    }
});

// Order filters
if (orderFilters) {
    orderFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            orderFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayAllOrders(btn.dataset.status);
        });
    });
}

// Item filters
if (itemFilterBtns) {
    itemFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            itemFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMenuItems(btn.dataset.filter);
        });
    });
}

// Order search
if (orderSearch) orderSearch.addEventListener('input', (e) => {
    displayAllOrders(currentFilterStatus);
});

// Manager form
if (managerForm) managerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('newManagerEmail') ? document.getElementById('newManagerEmail').value.trim() : managerData.email
    };
    
    if (saveManagerData(formData)) {
        showToast('Settings saved successfully');
        // Clear form fields
        if (document.getElementById('newManagerEmail')) document.getElementById('newManagerEmail').value = '';
        if (document.getElementById('currentManagerPassword')) document.getElementById('currentManagerPassword').value = '';
        if (document.getElementById('newManagerPassword')) document.getElementById('newManagerPassword').value = '';
        if (document.getElementById('confirmManagerPassword')) document.getElementById('confirmManagerPassword').value = '';
        // Update current email display
        loadManagerData();
    }
});

// Cancel changes
if (cancelChanges) cancelChanges.addEventListener('click', () => {
    loadManagerData();
    // Clear form fields
    if (document.getElementById('newManagerEmail')) document.getElementById('newManagerEmail').value = '';
    if (document.getElementById('currentManagerPassword')) document.getElementById('currentManagerPassword').value = '';
    if (document.getElementById('newManagerPassword')) document.getElementById('newManagerPassword').value = '';
    if (document.getElementById('confirmManagerPassword')) document.getElementById('confirmManagerPassword').value = '';
    showToast('Changes cancelled');
});

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

// Statement modal functionality
if (closeStatementModal) closeStatementModal.addEventListener('click', () => {
    if (statementModal) statementModal.classList.remove('active');
});

if (cancelStatement) cancelStatement.addEventListener('click', () => {
    if (statementModal) statementModal.classList.remove('active');
});

if (confirmStatement) confirmStatement.addEventListener('click', () => {
    const type = statementType ? statementType.value : 'weekly';
    const includeProfitCalc = includeProfit ? includeProfit.checked : true;
    downloadStatement(type, includeProfitCalc);
    if (statementModal) statementModal.classList.remove('active');
});

// Close statement modal when clicking outside
if (statementModal) statementModal.addEventListener('click', (e) => {
    if (e.target === statementModal) {
        statementModal.classList.remove('active');
    }
});

// Download statement button - show modal
if (downloadStatementBtn) {
    downloadStatementBtn.addEventListener('click', showStatementModal);
}

// PIN modal functionality
if (closePinModal) closePinModal.addEventListener('click', () => {
    if (pinModal) pinModal.classList.remove('active');
    currentOrderForPin = null;
});

if (cancelPin) cancelPin.addEventListener('click', () => {
    if (pinModal) pinModal.classList.remove('active');
    currentOrderForPin = null;
});

// Verify PIN
if (verifyPin) verifyPin.addEventListener('click', verifyOrderPin);

// PIN input validation
if (pinInput) pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value.length > 6) {
        e.target.value = e.target.value.slice(0, 6);
    }
    if (pinError) pinError.style.display = 'none';
});

// Close PIN modal when clicking outside
if (pinModal) pinModal.addEventListener('click', (e) => {
    if (e.target === pinModal) {
        pinModal.classList.remove('active');
        currentOrderForPin = null;
    }
});

// Cash order functionality
if (addToCashOrderBtn) addToCashOrderBtn.addEventListener('click', addItemToCashOrder);

if (processCashPaymentBtn) processCashPaymentBtn.addEventListener('click', showCashPaymentModal);

// Cash payment modal functionality
if (closeCashPaymentModal) closeCashPaymentModal.addEventListener('click', () => {
    if (cashPaymentModal) cashPaymentModal.classList.remove('active');
});

if (cancelCashPayment) cancelCashPayment.addEventListener('click', () => {
    if (cashPaymentModal) cashPaymentModal.classList.remove('active');
});

if (confirmCashPayment) confirmCashPayment.addEventListener('click', processCashPayment);

// Cash amount received input
if (cashAmountReceived) cashAmountReceived.addEventListener('input', calculateCashChange);

// Close cash payment modal when clicking outside
if (cashPaymentModal) cashPaymentModal.addEventListener('click', (e) => {
    if (e.target === cashPaymentModal) {
        cashPaymentModal.classList.remove('active');
    }
});

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (itemModal && itemModal.classList.contains('active')) {
            itemModal.classList.remove('active');
        }
        if (orderDetailsModal && orderDetailsModal.classList.contains('active')) {
            orderDetailsModal.classList.remove('active');
        }
        if (messageModal && messageModal.classList.contains('active')) {
            messageModal.classList.remove('active');
        }
        if (confirmModal && confirmModal.classList.contains('active')) {
            confirmModal.classList.remove('active');
        }
        if (pinModal && pinModal.classList.contains('active')) {
            pinModal.classList.remove('active');
            currentOrderForPin = null;
        }
        if (statementModal && statementModal.classList.contains('active')) {
            statementModal.classList.remove('active');
        }
        if (cashPaymentModal && cashPaymentModal.classList.contains('active')) {
            cashPaymentModal.classList.remove('active');
        }
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
    // Load XLSX library for Excel file generation
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
    script.onload = initialize;
    script.onerror = () => {
        console.error('Failed to load XLSX library');
        showToast('Failed to load Excel library. Please check your connection.', 'error');
        initialize();
    };
    document.head.appendChild(script);
    
    checkDevice();
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const validSections = ['dashboard', 'orders', 'cash-orders', 'items', 'messages', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
});

// Performance-optimized event listeners for real-time updates
let orderUpdateDebounce = null;
window.addEventListener('ordersUpdated', function() {
    if (orderUpdateDebounce) clearTimeout(orderUpdateDebounce);
    
    orderUpdateDebounce = setTimeout(() => {
        loadOrders();
        updateDashboardStats();
        if (document.getElementById('orders')?.classList.contains('active')) {
            displayAllOrders(currentFilterStatus);
        }
    }, 100);
});

let messageUpdateDebounce = null;
window.addEventListener('messagesUpdated', function() {
    if (messageUpdateDebounce) clearTimeout(messageUpdateDebounce);
    
    messageUpdateDebounce = setTimeout(() => {
        messages = safeStorage.getJSON('contactMessages') || [];
        if (document.getElementById('messages')?.classList.contains('active')) {
            displayMessages();
        }
    }, 100);
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);