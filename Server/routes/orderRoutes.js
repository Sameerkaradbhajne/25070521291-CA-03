import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(createOrder)
    .get(protect, admin, getOrders);

router.route('/:id')
    .get(protect, admin, getOrderById);

router.route('/:id/status')
    .patch(protect, admin, updateOrderStatus);

export default router;
