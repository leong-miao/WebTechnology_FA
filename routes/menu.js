const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const menuItems = [
    {
        id: '1',
        name: 'Nasi Lemak',
        description: 'Fragrant rice cooked in coconut milk, served with sambal, fried anchovies, peanuts, and egg',
        price: 5.50,
        category: 'Malay',
        image: '/images/nasi-lemak.jpg',
        available: true,
        preparationTime: 10
    },
    {
        id: '2',
        name: 'Chicken Rice',
        description: 'Poached chicken with seasoned rice, served with chili sauce and cucumber',
        price: 6.00,
        category: 'Chinese',
        image: '/images/chicken-rice.jpg',
        available: true,
        preparationTime: 8
    },
    {
        id: '3',
        name: 'Roti Canai',
        description: 'Flaky flatbread served with dhal curry',
        price: 2.50,
        category: 'Indian',
        image: '/images/roti-canai.jpg',
        available: true,
        preparationTime: 5
    },
    {
        id: '4',
        name: 'Mee Goreng',
        description: 'Spicy fried noodles with vegetables and tofu',
        price: 5.00,
        category: 'Malay',
        image: '/images/mee-goreng.jpg',
        available: true,
        preparationTime: 7
    },
    {
        id: '5',
        name: 'Wantan Mee',
        description: 'Egg noodles with char siu pork and wantan dumplings',
        price: 6.50,
        category: 'Chinese',
        image: '/images/wantan-mee.jpg',
        available: true,
        preparationTime: 8
    }
];

router.get('/', (req, res) => {
    try {
        res.json({
            success: true,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu items'
        });
    }
});

router.get('/category/:category', (req, res) => {
    try {
        const category = req.params.category;
        const filteredItems = menuItems.filter(item => 
            item.category.toLowerCase() === category.toLowerCase()
        );
        
        res.json({
            success: true,
            data: filteredItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu items by category'
        });
    }
});

router.get('/:id', (req, res) => {
    try {
        const item = menuItems.find(item => item.id === req.params.id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }
        
        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu item'
        });
    }
});

module.exports = router;