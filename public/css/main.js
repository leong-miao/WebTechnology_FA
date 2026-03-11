// Global variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Utility Functions
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR'
    }).format(amount);
};

const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-MY', options);
};

// API Calls
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`/api/${endpoint}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API POST Error:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    async patch(endpoint, data) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API PATCH Error:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    async delete(endpoint) {
        try {
            const response = await fetch(`/api/${endpoint}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API DELETE Error:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Cart Functions
const cartManager = {
    add(item) {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            });
        }
        
        this.save();
        this.updateCartCount();
        showNotification(`${item.name} added to cart`);
    },
    
    remove(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        this.save();
        this.updateCartCount();
        this.displayCart();
    },
    
    updateQuantity(itemId, quantity) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.remove(itemId);
            } else {
                item.quantity = quantity;
                this.save();
                this.displayCart();
            }
        }
    },
    
    clear() {
        cart = [];
        this.save();
        this.updateCartCount();
        showNotification('Cart cleared');
    },
    
    save() {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    
    getTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    getCount() {
        return cart.reduce((count, item) => count + item.quantity, 0);
    },
    
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });
    },
    
    displayCart() {
        const cartContainer = document.querySelector('.cart-container');
        if (!cartContainer) return;
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Browse our menu to add items</p>
                    <a href="/menu" class="btn">View Menu</a>
                </div>
            `;
            return;
        }
        
        let html = '<h2>Your Cart</h2>';
        
        cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${formatCurrency(item.price)} each</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="cart-item-subtotal">
                        ${formatCurrency(item.price * item.quantity)}
                    </div>
                    <button class="btn-danger" onclick="cartManager.remove('${item.id}')">Remove</button>
                </div>
            `;
        });
        
        html += `
            <div class="cart-total">
                <strong>Total:</strong> ${formatCurrency(this.getTotal())}
            </div>
            <div class="cart-actions">
                <button class="btn" onclick="cartManager.clear()">Clear Cart</button>
                <a href="/checkout" class="btn">Proceed to Checkout</a>
            </div>
        `;
        
        cartContainer.innerHTML = html;
    }
};

// Menu Functions
const menuManager = {
    async loadMenu(category = 'all') {
        const menuContainer = document.querySelector('.menu-grid');
        if (!menuContainer) return;
        
        menuContainer.innerHTML = '<div class="spinner"></div>';
        
        try {
            let url = 'menu';
            if (category !== 'all') {
                url = `menu/category/${category}`;
            }
            
            const response = await api.get(url);
            
            if (!response.success || !response.data.length) {
                menuContainer.innerHTML = '<p class="no-items">No menu items available</p>';
                return;
            }
            
            let html = '';
            response.data.forEach(item => {
                html += `
                    <div class="menu-item">
                        <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" class="menu-item-image" loading="lazy">
                        <div class="menu-item-content">
                            <h3 class="menu-item-title">${item.name}</h3>
                            <p class="menu-item-description">${item.description}</p>
                            <div class="menu-item-footer">
                                <span class="menu-item-price">
                                    ${formatCurrency(item.price)}
                                    <small>RM</small>
                                </span>
                                <button class="btn" onclick="menuManager.addToCart('${item.id}')">
                                    Add to Cart
                                </button>
                            </div>
                            <div class="prep-time">
                                <small>Prep time: ${item.preparationTime} mins</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            menuContainer.innerHTML = html;
            
        } catch (error) {
            menuContainer.innerHTML = '<p class="error">Failed to load menu. Please try again.</p>';
        }
    },
    
    async addToCart(itemId) {
        try {
            const response = await api.get(`menu/${itemId}`);
            
            if (response.success) {
                cartManager.add(response.data);
            }
        } catch (error) {
            showNotification('Failed to add item to cart', 'error');
        }
    }
};

// Order Functions
const orderManager = {
    async placeOrder(orderData) {
        try {
            const response = await api.post('orders', orderData);
            
            if (response.success) {
                cartManager.clear();
                showNotification(`Order placed successfully! Order number: ${response.data.orderNumber}`);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    },
    
    async loadOrders(status = 'all') {
        const ordersContainer = document.querySelector('.orders-table');
        if (!ordersContainer) return;
        
        ordersContainer.innerHTML = '<div class="spinner"></div>';
        
        try {
            let url = 'orders';
            if (status !== 'all') {
                url += `?status=${status}`;
            }
            
            const response = await api.get(url);
            
            if (!response.success || !response.data.length) {
                ordersContainer.innerHTML = '<p class="no-items">No orders found</p>';
                return;
            }
            
            let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Pickup Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            response.data.forEach(order => {
                const statusClass = `status-${order.status.toLowerCase()}`;
                const itemsList = order.items.map(item => `${item.name} x${item.quantity}`).join(', ');
                
                html += `
                    <tr>
                        <td>${order.orderNumber}</td>
                        <td>${order.customerName}</td>
                        <td>${itemsList}</td>
                        <td>${formatCurrency(order.totalAmount)}</td>
                        <td>${formatDate(order.pickupTime)}</td>
                        <td>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </td>
                        <td>
                            <div class="status-actions">
                                <button class="status-btn pending" onclick="orderManager.updateStatus('${order.orderNumber}', 'Pending')">Pending</button>
                                <button class="status-btn preparing" onclick="orderManager.updateStatus('${order.orderNumber}', 'Preparing')">Preparing</button>
                                <button class="status-btn ready" onclick="orderManager.updateStatus('${order.orderNumber}', 'Ready')">Ready</button>
                                <button class="status-btn collected" onclick="orderManager.updateStatus('${order.orderNumber}', 'Collected')">Collected</button>
                                <button class="btn-danger" onclick="orderManager.deleteOrder('${order.orderNumber}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            ordersContainer.innerHTML = html;
            
        } catch (error) {
            ordersContainer.innerHTML = '<p class="error">Failed to load orders</p>';
        }
    },
    
    async updateStatus(orderNumber, status) {
        try {
            const response = await api.patch(`orders/${orderNumber}/status`, { status });
            
            if (response.success) {
                showNotification(`Order ${orderNumber} status updated to ${status}`);
                this.loadOrders();
            }
        } catch (error) {
            showNotification('Failed to update order status', 'error');
        }
    },
    
    async deleteOrder(orderNumber) {
        if (!confirm('Are you sure you want to delete this order?')) return;
        
        try {
            const response = await api.delete(`orders/${orderNumber}`);
            
            if (response.success) {
                showNotification(`Order ${orderNumber} deleted`);
                this.loadOrders();
            }
        } catch (error) {
            showNotification('Failed to delete order', 'error');
        }
    },
    
    async loadOrderHistory(email) {
        const historyContainer = document.querySelector('.order-history');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '<div class="spinner"></div>';
        
        try {
            const response = await api.get(`orders/customer/${email}`);
            
            if (!response.success || !response.data.length) {
                historyContainer.innerHTML = '<p class="no-items">No order history found</p>';
                return;
            }
            
            let html = `
                <div class="history-list">
            `;
            
            response.data.forEach(order => {
                const statusClass = `status-${order.status.toLowerCase()}`;
                
                html += `
                    <div class="history-item">
                        <div class="history-header">
                            <span class="order-number">${order.orderNumber}</span>
                            <span class="status-badge ${statusClass}">${order.status}</span>
                        </div>
                        <div class="history-body">
                            <p>Date: ${formatDate(order.orderDate)}</p>
                            <p>Pickup: ${formatDate(order.pickupTime)}</p>
                            <p>Total: ${formatCurrency(order.totalAmount)}</p>
                            <p>Items:</p>
                            <ul>
                `;
                
                order.items.forEach(item => {
                    html += `<li>${item.name} x${item.quantity}</li>`;
                });
                
                html += `
                            </ul>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            historyContainer.innerHTML = html;
            
        } catch (error) {
            historyContainer.innerHTML = '<p class="error">Failed to load order history</p>';
        }
    }
};

// Dashboard Functions
const dashboardManager = {
    async loadStats() {
        const statsContainer = document.querySelector('.dashboard-stats');
        if (!statsContainer) return;
        
        try {
            const response = await api.get('admin/stats');
            
            if (response.success) {
                document.querySelector('.total-orders').textContent = response.data.totalOrders;
                document.querySelector('.pending-orders').textContent = response.data.pendingOrders;
                document.querySelector('.preparing-orders').textContent = response.data.preparingOrders;
                document.querySelector('.ready-orders').textContent = response.data.readyOrders;
                document.querySelector('.collected-orders').textContent = response.data.collectedOrders;
                document.querySelector('.today-orders').textContent = response.data.todayOrders;
                document.querySelector('.today-revenue').textContent = formatCurrency(response.data.todayRevenue);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }
};

// Form Validation
const formValidator = {
    validateOrderForm(formData) {
        const errors = [];
        
        // Name validation
        if (!formData.customerName || formData.customerName.length < 2) {
            errors.push({
                field: 'customerName',
                message: 'Name must be at least 2 characters long'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.customerEmail || !emailRegex.test(formData.customerEmail)) {
            errors.push({
                field: 'customerEmail',
                message: 'Please enter a valid email address'
            });
        }
        
        // Phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!formData.customerPhone || !phoneRegex.test(formData.customerPhone)) {
            errors.push({
                field: 'customerPhone',
                message: 'Please enter a valid phone number (10-11 digits)'
            });
        }
        
        // Pickup time validation
        const pickupTime = new Date(formData.pickupTime);
        const now = new Date();
        const minPickup = new Date(now.getTime() + 15 * 60000);
        const maxPickup = new Date(now.getTime() + 2 * 60 * 60000);
        
        if (pickupTime < minPickup) {
            errors.push({
                field: 'pickupTime',
                message: 'Pickup time must be at least 15 minutes from now'
            });
        }
        
        if (pickupTime > maxPickup) {
            errors.push({
                field: 'pickupTime',
                message: 'Pickup time cannot be more than 2 hours from now'
            });
        }
        
        return errors;
    },
    
    displayErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-group.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // Display new errors
        errors.forEach(error => {
            const field = document.querySelector(`[name="${error.field}"]`);
            if (field) {
                const formGroup = field.closest('.form-group');
                formGroup.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = error.message;
                formGroup.appendChild(errorDiv);
            }
        });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count
    cartManager.updateCartCount();
    
    // Load menu if on menu page
    if (document.querySelector('.menu-grid')) {
        menuManager.loadMenu();
        
        // Category filter
        const categoryFilter = document.querySelector('#category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                menuManager.loadMenu(e.target.value);
            });
        }
    }
    
    // Display cart if on cart page
    if (document.querySelector('.cart-container')) {
        cartManager.displayCart();
    }
    
    // Load orders if on dashboard
    if (document.querySelector('.orders-table')) {
        orderManager.loadOrders();
        
        // Status filter
        const statusFilter = document.querySelector('#status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                orderManager.loadOrders(e.target.value);
            });
        }
    }
    
    // Load dashboard stats
    if (document.querySelector('.dashboard-stats')) {
        dashboardManager.loadStats();
    }
    
    // Order form submission
    const orderForm = document.querySelector('#order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(orderForm);
            const data = Object.fromEntries(formData.entries());
            
            // Add cart items
            data.items = cart;
            data.totalAmount = cartManager.getTotal();
            
            // Validate form
            const errors = formValidator.validateOrderForm(data);
            
            if (errors.length > 0) {
                formValidator.displayErrors(errors);
                return;
            }
            
            try {
                await orderManager.placeOrder(data);
                window.location.href = '/order-history';
            } catch (error) {
                console.error('Order placement failed:', error);
            }
        });
    }
    
    // Set minimum pickup time
    const pickupTimeInput = document.querySelector('#pickupTime');
    if (pickupTimeInput) {
        const now = new Date();
        const minPickup = new Date(now.getTime() + 15 * 60000);
        const formattedMin = minPickup.toISOString().slice(0, 16);
        pickupTimeInput.min = formattedMin;
        
        const maxPickup = new Date(now.getTime() + 2 * 60 * 60000);
        const formattedMax = maxPickup.toISOString().slice(0, 16);
        pickupTimeInput.max = formattedMax;
    }
});

// Export for use in other files
window.cartManager = cartManager;
window.menuManager = menuManager;
window.orderManager = orderManager;
window.dashboardManager = dashboardManager;
window.formValidator = formValidator;