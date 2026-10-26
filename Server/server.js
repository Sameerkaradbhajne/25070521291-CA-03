import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
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

// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);

// Helper for DB status
function mongooseStatus() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
}

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Urban Jungle Backend running on port ${PORT}`);
    console.log(` API Documentation & Base URL: http://localhost:${PORT}/api`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Excel Reports API: http://localhost:${PORT}/api/excel/download`);
    console.log(`====================================================`);
});
