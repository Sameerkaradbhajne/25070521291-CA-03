import app from '../server.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    return app(req, res);
}
