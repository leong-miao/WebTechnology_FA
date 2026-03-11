const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// IMPORTANT: Define routes BEFORE 404 handler

// Home page route
app.get('/', (req, res) => {
    console.log('Home page requested');
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Menu page route
app.get('/menu', (req, res) => {
    console.log('Menu page requested');
    res.sendFile(path.join(__dirname, 'views', 'menu.html'));
});

// Cart page route
app.get('/cart', (req, res) => {
    console.log('Cart page requested');
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

// Dashboard page route
app.get('/dashboard', (req, res) => {
    console.log('Dashboard page requested');
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Order history page route
app.get('/order-history', (req, res) => {
    console.log('Order history page requested');
    res.sendFile(path.join(__dirname, 'views', 'order-history.html'));
});

// 404 handler - this should be LAST
app.use((req, res) => {
    console.log('404 - Page not found:', req.url);
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running!`);
    console.log(`📌 Homepage: http://localhost:${PORT}`);
    console.log(`📌 Menu: http://localhost:${PORT}/menu`);
    console.log(`📌 Cart: http://localhost:${PORT}/cart`);
    console.log(`📌 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📌 Order History: http://localhost:${PORT}/order-history`);
});