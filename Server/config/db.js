import mongoose from 'mongoose';
import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // fallback
}

export const connectDB = async () => {
    // Reuse existing connection if already connected (vital for serverless cold/warm cycles)
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_jungle';
    
    // Attempt 1: Standard connection using configured MONGODB_URI
    try {
        const conn = await mongoose.connect(rawUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return true;
    } catch (primaryErr) {
        // Attempt 2: If Atlas SRV string, try direct replica set string
        if (rawUri.includes('cluster0.2azzof0.mongodb.net')) {
            try {
                const directUri = 'mongodb://purushottamkardabhajane_db_user:sRT1tRsGsLwopWQC@ac-hza9q3l-shard-00-00.2azzof0.mongodb.net:27017,ac-hza9q3l-shard-00-01.2azzof0.mongodb.net:27017,ac-hza9q3l-shard-00-02.2azzof0.mongodb.net:27017/urban_jungle?ssl=true&replicaSet=atlas-2azzof-shard-0&authSource=admin';
                const conn = await mongoose.connect(directUri, {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log(`[MongoDB] Connected via Atlas ReplicaSet: ${conn.connection.host}`);
                return true;
            } catch (replicaErr) {
                console.warn(`[MongoDB Atlas Status]: Awaiting IP whitelist (0.0.0.0/0) in Atlas Network Access: ${replicaErr.message}`);
            }
        }
        
        // Attempt 3: If running locally and primary URI was remote/Atlas, try local MongoDB
        if (!rawUri.includes('127.0.0.1') && !rawUri.includes('localhost')) {
            try {
                const conn = await mongoose.connect('mongodb://127.0.0.1:27017/urban_jungle', {
                    serverSelectionTimeoutMS: 2000,
                });
                console.log(`[MongoDB] Fallback connected to local MongoDB: ${conn.connection.host}/${conn.connection.name}`);
                return true;
            } catch (localErr) {
                // local not available in cloud/serverless
            }
        }

        console.warn(`[MongoDB Warning] Primary connection attempt: ${primaryErr.message}`);
        console.warn(`[MongoDB Guidance] Ensure IP 0.0.0.0/0 is set to "Active" in MongoDB Atlas > Network Access.`);
        return false;
    }
};
