import mongoose from 'mongoose';
import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // fallback
}

export const connectDB = async () => {
    const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urban_jungle';
    
    // Attempt 1: Standard connection
    try {
        const conn = await mongoose.connect(rawUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return true;
    } catch (primaryErr) {
        // If querySrv or IP error occurred with an Atlas srv URI, try direct replica set string
        if (rawUri.includes('cluster0.2azzof0.mongodb.net')) {
            try {
                const directUri = rawUri.replace(
                    'mongodb+srv://purushottamkardabhajane_db_user:sRT1tRsGsLwopWQC@cluster0.2azzof0.mongodb.net/urban_jungle',
                    'mongodb://purushottamkardabhajane_db_user:sRT1tRsGsLwopWQC@ac-hza9q3l-shard-00-00.2azzof0.mongodb.net:27017,ac-hza9q3l-shard-00-01.2azzof0.mongodb.net:27017,ac-hza9q3l-shard-00-02.2azzof0.mongodb.net:27017/urban_jungle?ssl=true&replicaSet=atlas-2azzof-shard-0&authSource=admin'
                );
                const conn = await mongoose.connect(directUri, {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log(`[MongoDB] Connected via Atlas ReplicaSet: ${conn.connection.host}`);
                return true;
            } catch (replicaErr) {
                console.warn(`[MongoDB Atlas Status]: Still awaiting IP whitelist activation on Atlas servers (${replicaErr.message})`);
            }
        }
        
        console.warn(`[MongoDB Warning] Primary connection attempt: ${primaryErr.message}`);
        console.warn(`[MongoDB Guidance] Ensure IP 0.0.0.0/0 is set to "Active" in MongoDB Atlas > Network Access.`);
        return false;
    }
};
