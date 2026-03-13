import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dataModel from './module/model.js';

dotenv.config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const users = await dataModel.find({}).select('+password');
        console.log(`Found ${users.length} users.`);
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, Hash: ${u.password?.substring(0, 10)}...`);
            if (u.password && !u.password.startsWith('$2b$')) {
                console.error(`⚠️  MALFORMED HASH for ${u.email}`);
            }
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
