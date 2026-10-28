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
        const secret = process.env.JWT_SECRET || '819298a0218d68e68dc8ce4daca424499cc8f6f34745690a2196c5a0802860e3467e5eab387e2bbacf7a6b2ebf0e812921e172693d13aafab27cd0d4a54d10d5';
        const decoded = jwt.verify(token, secret);

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
