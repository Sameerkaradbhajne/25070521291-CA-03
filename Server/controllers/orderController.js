import { Order } from '../models/Order.js';
import { Customer } from '../models/Customer.js';
import { syncExcelWorkbook } from '../services/excelService.js';

// In-memory orders cache in case MongoDB is in cold boot
export const memoryOrders = [];

// @desc    Create new order (from CheckoutModal)
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const { customer, items, total, payment } = req.body;

        if (!customer || !customer.firstName || !customer.lastName || !customer.address || !customer.city || !customer.zipCode) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete shipping information. First name, last name, address, city, and zip code are required.'
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Please add items before placing an order.'
            });
        }

        const calculatedTotal = Number(total) || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const orderNumber = 'UJ-' + Math.floor(100000 + Math.random() * 900000);
        const customerId = customer.customerId || 'CUST-' + Math.floor(1000 + Math.random() * 9000);

        const orderData = {
            orderNumber,
            customer: {
                customerId,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email || `${customer.firstName.toLowerCase()}.${customer.lastName.toLowerCase()}@example.com`,
                phone: customer.phone || '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
                address: customer.address,
                city: customer.city,
                zipCode: customer.zipCode
            },
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image
            })),
            total: calculatedTotal,
            discount: 0,
            tax: 0,
            shippingCharges: 0,
            payment: {
                paymentId: 'PAY-' + orderNumber.replace('UJ-', ''),
                method: 'Credit Card',
                cardLast4: payment?.cardNumber ? String(payment.cardNumber).slice(-4) : '4242',
                status: 'Paid',
                transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
                amount: calculatedTotal
            },
            status: 'Confirmed',
            statusHistory: [
                {
                    previousStatus: 'Created',
                    newStatus: 'Confirmed',
                    changedAt: new Date(),
                    updatedBy: 'System / Customer Checkout'
                }
            ]
        };

        try {
            const savedOrder = await Order.create(orderData);

            // Upsert into Customer collection
            try {
                await Customer.findOneAndUpdate(
                    { email: orderData.customer.email },
                    {
                        $setOnInsert: {
                            customerId: orderData.customer.customerId,
                            name: `${orderData.customer.firstName} ${orderData.customer.lastName}`.trim(),
                            registrationDate: new Date(),
                            phone: orderData.customer.phone
                        },
                        $inc: { totalOrders: 1, totalSpent: calculatedTotal },
                        $set: { lastOrderDate: new Date() }
                    },
                    { upsert: true, new: true }
                );
            } catch (custErr) {
                console.error('[Customer Sync Warning]:', custErr.message);
            }

            // Auto-sync Excel in background
            syncExcelWorkbook(memoryOrders).catch(err => console.error('[Excel Auto-Sync Error]:', err.message));

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully and recorded in database & Excel!',
                data: savedOrder
            });
        } catch (dbErr) {
            // DB fallback
            orderData._id = 'mem_' + Date.now();
            orderData.createdAt = new Date().toISOString();
            memoryOrders.unshift(orderData);

            // Auto-sync Excel in background
            syncExcelWorkbook(memoryOrders).catch(err => console.error('[Excel Auto-Sync Error]:', err.message));

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully! (Buffered to database cache & Excel)',
                data: orderData
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error processing order: ' + error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
    try {
        let orders = await Order.find().sort({ createdAt: -1 });
        if (orders.length === 0 && memoryOrders.length > 0) {
            orders = memoryOrders;
        }
        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.json({
            success: true,
            count: memoryOrders.length,
            data: memoryOrders
        });
    }
};

// @desc    Get single order by orderNumber or ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        let order = await Order.findOne({
            $or: [
                { orderNumber: id },
                ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
            ]
        });

        if (!order) {
            order = memoryOrders.find(o => o.orderNumber === id || o._id === id);
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, updatedBy = 'Admin' } = req.body;
        const id = req.params.id;

        const currentOrder = await Order.findOne({ orderNumber: id });
        const prevStatus = currentOrder ? currentOrder.status : 'Processing';

        const order = await Order.findOneAndUpdate(
            { orderNumber: id },
            { 
                status,
                $push: {
                    statusHistory: {
                        previousStatus: prevStatus,
                        newStatus: status,
                        changedAt: new Date(),
                        updatedBy
                    }
                }
            },
            { new: true }
        );

        if (!order) {
            const mem = memoryOrders.find(o => o.orderNumber === id);
            if (mem) {
                const prev = mem.status;
                mem.status = status;
                if (!mem.statusHistory) mem.statusHistory = [];
                mem.statusHistory.push({
                    previousStatus: prev,
                    newStatus: status,
                    changedAt: new Date(),
                    updatedBy
                });
                syncExcelWorkbook(memoryOrders).catch(() => {});
                return res.json({ success: true, data: mem });
            }
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Auto-sync Excel with status update
        syncExcelWorkbook(memoryOrders).catch(err => console.error('[Excel Sync Error]:', err.message));

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
