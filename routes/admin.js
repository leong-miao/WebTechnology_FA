const express = require('express');
const router = express.Router();

// GET dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total orders
        const [totalRows] = await req.db.execute('SELECT COUNT(*) as count FROM orders');
        
        // Get orders by status
        const [pendingRows] = await req.db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");
        const [preparingRows] = await req.db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Preparing'");
        const [readyRows] = await req.db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Ready'");
        const [collectedRows] = await req.db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'Collected'");
        
        // Today's orders
        const [todayRows] = await req.db.execute(
            'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(order_date) = CURDATE()'
        );

        res.json({
            success: true,
            data: {
                totalOrders: totalRows[0].count,
                pendingOrders: pendingRows[0].count,
                preparingOrders: preparingRows[0].count,
                readyOrders: readyRows[0].count,
                collectedOrders: collectedRows[0].count,
                todayOrders: todayRows[0].count,
                todayRevenue: todayRows[0].revenue || 0
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;