import { Newsletter } from '../models/Newsletter.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: "You're already subscribed to our newsletter! Check your inbox for discounts."
            });
        }

        const subscriber = await Newsletter.create({ email });
        return res.status(201).json({
            success: true,
            message: 'Thank you for subscribing to Urban Jungle news and offers!',
            data: subscriber
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error: Could not save newsletter subscription. ' + error.message });
    }
};

// @desc    Get all newsletter subscribers (Admin only)
// @route   GET /api/newsletter
export const getSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort({ createdAt: -1 });
        res.json({ success: true, count: subscribers.length, data: subscribers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve newsletter subscribers: ' + error.message });
    }
};
