import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
    .post(createOrder)
    .get(getOrders);

router.route('/:id')
    .get(getOrderById);

router.route('/:id/status')
    .patch(updateOrderStatus);

export default router;
