import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true }
});

const statusHistorySchema = new mongoose.Schema({
    previousStatus: { type: String, default: 'Created' },
    newStatus: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        default: () => 'UJ-' + Math.floor(100000 + Math.random() * 900000)
    },
    customer: {
        customerId: { type: String, default: () => 'CUST-' + Math.floor(1000 + Math.random() * 9000) },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true }
    },
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingCharges: {
        type: Number,
        default: 0
    },
    payment: {
        paymentId: { type: String, default: () => 'PAY-' + Math.floor(100000 + Math.random() * 900000) },
        method: { type: String, default: 'Credit Card' },
        cardLast4: { type: String, default: '4242' },
        status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
        transactionId: { type: String, default: () => 'TXN-' + Math.floor(10000000 + Math.random() * 90000000) },
        amount: { type: Number }
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Confirmed'
    },
    statusHistory: [statusHistorySchema]
}, {
    timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);
