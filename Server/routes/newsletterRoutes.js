import express from 'express';
import { subscribeNewsletter, getSubscribers } from '../controllers/newsletterController.js';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.get('/', getSubscribers);

export default router;
