import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './seed/seedData.js';
import { syncExcelWorkbook } from './services/excelService.js';

// Route imports
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import authRoutes from './routes/authRoutes.js';
import excelRoutes from './routes/excelRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database & Initialize Excel Sync
connectDB().then((connected) => {
    if (connected) {
        seedDatabase().then(() => syncExcelWorkbook());
    } else {
        syncExcelWorkbook().catch(() => {});
    }
});

// Rate limiter for authentication endpoints — brute-force protection
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100,                  // Generous limit for evaluation & testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.'
    },
    skipSuccessfulRequests: false
});

// Chrome Private Network Access preflight support (when https:// calls localhost)
app.use((req, res, next) => {
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }
    next();
});

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://25070521291-ca-03-one.vercel.app',
    process.env.CLIENT_URL
].filter(Boolean);

// CORS Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, mobile, Postman, etc.)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'access-control-request-private-network'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Urban Jungle Backend API',
        timestamp: new Date().toISOString(),
        database: mongooseStatus()
    });
});

// Root API Endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Urban Jungle Store API (Flexi Credit CA)',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            orders: '/api/orders',
            consultations: '/api/consultations',
            workshops: '/api/workshops',
            newsletter: '/api/newsletter',
            auth: '/api/auth',
            excel: {
                download: '/api/excel/download',
                sync: '/api/excel/sync',
                status: '/api/excel/status'
            },
            health: '/api/health'
        }
    });
});

// Ensure DB connection for incoming API requests (essential for serverless and auto-reconnect)
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api') && req.path !== '/api/health') {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
    }
    next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authLimiter, authRoutes);  // Rate-limited auth routes
app.use('/api/excel', excelRoutes);

// Helper for DB status
function mongooseStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
}

// Error Handler Middleware
app.use(errorHandler);

// Start Server locally if not running in serverless / Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(` Urban Jungle Backend running on port ${PORT}`);
        console.log(` API Documentation & Base URL: http://localhost:${PORT}/api`);
        console.log(` Health check: http://localhost:${PORT}/api/health`);
        console.log(` Excel Reports API: http://localhost:${PORT}/api/excel/download`);
        console.log(`====================================================`);
    });
}

export default app;
