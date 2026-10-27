import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Demo token — build virtual user without DB lookup
        if (decoded.demo || String(decoded.id).startsWith('demo_')) {
            req.user = {
                _id: decoded.id,
                id: decoded.id,
                name: 'Demo User',
                email: decoded.email || 'demo@example.com',
                role: 'customer',  // never admin
                demo: true
            };
            return next();
        }

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token verification failed: ' + err.message });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required' });
    }
};
