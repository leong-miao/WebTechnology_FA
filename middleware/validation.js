const { body } = require('express-validator');

const validateOrder = [
    body('customerName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces')
        .escape(),
    
    body('customerEmail')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail()
        .toLowerCase(),
    
    body('customerPhone')
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Phone number must be 10-11 digits')
        .escape(),
    
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    
    body('items.*.itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .escape(),
    
    body('items.*.name')
        .notEmpty()
        .withMessage('Item name is required')
        .escape(),
    
    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    body('items.*.quantity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10'),
    
    body('items.*.specialInstructions')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Special instructions cannot exceed 200 characters')
        .escape(),
    
    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    
    body('pickupTime')
        .isISO8601()
        .withMessage('Please provide a valid pickup time')
        .custom(value => {
            const pickupDate = new Date(value);
            const now = new Date();
            const minPickup = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
            
            if (pickupDate < minPickup) {
                throw new Error('Pickup time must be at least 15 minutes from now');
            }
            
            const maxPickup = new Date(now.getTime() + 2 * 60 * 60000); // 2 hours from now
            if (pickupDate > maxPickup) {
                throw new Error('Pickup time cannot be more than 2 hours from now');
            }
            
            return true;
        }),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Notes cannot exceed 300 characters')
        .escape()
];

const preventSQLInjection = (req, res, next) => {
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|WHERE)\b)|('--)|(\|\|)/i;
    
    for (let key in req.query) {
        if (typeof req.query[key] === 'string' && sqlPattern.test(req.query[key])) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input detected'
            });
        }
    }
    
    if (req.body) {
        const checkObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    if (sqlPattern.test(obj[key])) {
                        return true;
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (checkObject(obj[key])) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        if (checkObject(req.body)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input detected'
            });
        }
    }
    
    next();
};

const preventXSS = (req, res, next) => {
    if (req.body) {
        const sanitizeObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key]
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;')
                        .replace(/\//g, '&#x2F;');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                }
            }
        };
        
        sanitizeObject(req.body);
    }
    
    next();
};

module.exports = {
    validateOrder,
    preventSQLInjection,
    preventXSS
};