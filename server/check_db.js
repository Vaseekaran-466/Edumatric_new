import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    const uri = process.env.MONGO_URL;
    if (!uri) {
        console.error('❌ MONGO_URL not found in .env');
        process.exit(1);
    }

    console.log('--- MongoDB Connectivity Test ---');
    console.log(`Connecting to: ${uri.replace(/\/\/.*@/, '//****:****@')}`); // Hide credentials

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ FAILURE: Could not connect.');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);

        if (err.message.includes('SSL') || err.message.includes('TLS') || err.message.includes('timeout')) {
            console.log('\n--- Troubleshooting Checklist ---');
            console.log('1. IP WHITELIST: Ensure your current IP is allowed in MongoDB Atlas (Network Access).');
            console.log('   - You can add "0.0.0.0/0" to allow all IPs (for testing only).');
            console.log('2. CREDENTIALS: Verify the username and password in your MONGO_URL.');
            console.log('3. CLUSTER STATE: Ensure your Atlas cluster is active.');
        }
    }
    process.exit(0);
};

testConnection();
