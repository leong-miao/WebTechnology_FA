const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Generate unique order number
const generateOrderNumber = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// CREATE new order
router.post('/', [
    body('customerName').trim().isLength({ min: 2 }).escape(),
    body('customerEmail').isEmail().normalizeEmail(),
    body('customerPhone').matches(/^[0-9]{10,11}$/),
    body('items').isArray({ min: 1 }),
    body('pickupTime').isISO8601()
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const orderNumber = generateOrderNumber();
        const { customerName, customerEmail, customerPhone, items, totalAmount, pickupTime, notes } = req.body;

        // Insert into database
        const [result] = await req.db.execute(
            `INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone, items, total_amount, pickup_time, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                customerName,
                customerEmail,
                customerPhone,
                JSON.stringify(items), // Store items as JSON
                totalAmount,
                pickupTime,
                notes || ''
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: {
                orderNumber: orderNumber,
                id: result.insertId
            }
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to place order'
        });
    }
});

// GET all orders
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM orders ORDER BY order_date DESC';
        let params = [];

        if (status) {
            query = 'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC';
            params = [status];
        }

        const [rows] = await req.db.execute(query, params);
        
        // Parse JSON items for each order
        rows.forEach(order => {
            if (order.items) {
                order.items = JSON.parse(order.items);
            }
        });

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
});

// UPDATE order status
router.patch('/:orderNumber/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { orderNumber } = req.params;

        const [result] = await req.db.execute(
            'UPDATE orders SET status = ? WHERE order_number = ?',
            [status, orderNumber]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order'
        });
    }
});

// DELETE order
router.delete('/:orderNumber', async (req, res) => {
    try {
        const [result] = await req.db.execute(
            'DELETE FROM orders WHERE order_number = ?',
            [req.params.orderNumber]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete order'
        });
    }
});

// GET order history by email
router.get('/customer/:email', async (req, res) => {
    try {
        const [rows] = await req.db.execute(
            'SELECT * FROM orders WHERE customer_email = ? ORDER BY order_date DESC LIMIT 20',
            [req.params.email]
        );

        rows.forEach(order => {
            if (order.items) {
                order.items = JSON.parse(order.items);
            }
        });

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order history'
        });
    }
});

module.exports = router;