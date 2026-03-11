const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: 200
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Collected'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    pickupTime: {
        type: Date,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 300
    }
}, {
    timestamps: true
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

orderSchema.pre('save', function(next) {
    if (this.customerName) {
        this.customerName = this.customerName.replace(/<[^>]*>/g, '');
    }
    if (this.notes) {
        this.notes = this.notes.replace(/<[^>]*>/g, '');
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);