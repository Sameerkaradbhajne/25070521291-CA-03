import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        required: true,
        default: () => 'CUST-' + Math.floor(1000 + Math.random() * 9000)
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastOrderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const Customer = mongoose.model('Customer', customerSchema);
