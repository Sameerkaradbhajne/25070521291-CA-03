import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || '819298a0218d68e68dc8ce4daca424499cc8f6f34745690a2196c5a0802860e3467e5eab387e2bbacf7a6b2ebf0e812921e172693d13aafab27cd0d4a54d10d5';

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // --- Server-side validation ---
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const rawPassword = password;

        if (!trimmedName) {
            return res.status(400).json({ success: false, message: 'Full name is required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }

        if (rawPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        // Ensure database connection is established
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database connection is temporarily unavailable. Please verify MongoDB is running or check Atlas IP whitelist (0.0.0.0/0).'
            });
        }

        // --- Duplicate email check (server-side before DB to give a friendly message) ---
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please sign in instead.' });
        }

        // --- Create user (password is hashed by pre-save hook in User model) ---
        const user = await User.create({
            name: trimmedName,
            email: normalizedEmail,
            password: rawPassword,
            role: 'customer'   // always default; never allow client to set role
        });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please sign in.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
                // NOTE: No token returned on register — client redirects to login
            }
        });
    } catch (error) {
        // MongoDB duplicate key error (handles concurrent registration race conditions)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
        }
        console.error('[Auth] Register error:', error.message);
        return res.status(500).json({ success: false, message: 'Registration failed due to a server error. Please try again.' });
    }
};

// @desc    Authenticate a registered user with correct password
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Server-side validation ---
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email address and password.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }

        // Ensure database connection is established
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database connection is temporarily unavailable. Please verify MongoDB is running or check Atlas IP whitelist (0.0.0.0/0).'
            });
        }

        // --- Look up registered user ---
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            // Generic message — don't reveal whether the email is registered
            return res.status(401).json({ success: false, message: 'Incorrect email or password. Please try again.' });
        }

        // --- Verify password against stored hash ---
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Generic message — don't reveal whether the password or email was wrong
            return res.status(401).json({ success: false, message: 'Incorrect email or password. Please try again.' });
        }

        // --- Authentication successful ---
        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error('[Auth] Login error:', error.message);
        return res.status(500).json({ success: false, message: 'Authentication failed due to a server error. Please try again.' });
    }
};

// @desc    Get currently authenticated user's safe profile
// @route   GET /api/auth/me  (protected)
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('[Auth] GetMe error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
    }
};

// @desc    Logout — client should discard its token; server-side is stateless JWT
// @route   POST /api/auth/logout  (protected)
export const logoutUser = async (req, res) => {
    // With stateless JWTs there is no server-side session to destroy.
    // The client must delete its stored token on receipt of this response.
    // For a production system, consider a token revocation blocklist.
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
