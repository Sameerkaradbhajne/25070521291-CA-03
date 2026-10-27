import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// @desc    Protect routes — require a valid JWT from a real registered user
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Reject any token that was issued to a demo/evaluator session (legacy safety net)
        if (decoded.demo || String(decoded.id).startsWith('demo_')) {
            return res.status(401).json({ success: false, message: 'Not authorized: Please log in with a registered account.' });
        }

        // Fetch user from the database to confirm the account still exists
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized: Account no longer exists.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized: Invalid or expired token.' });
    }
};

// @desc    Restrict access to admin users only
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required.' });
    }
};
