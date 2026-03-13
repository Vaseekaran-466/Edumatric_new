import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dataModel from '../module/model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const demoUsers = [
    {
        name: 'Demo Student',
        email: 'student1@edu.com',
        password: 'EduDemo@123',
        confirmPassword: 'EduDemo@123',
        role: 'student'
    },
    {
        name: 'Demo Teacher',
        email: 'teacher@edu.com',
        password: 'EduDemo@123',
        confirmPassword: 'EduDemo@123',
        role: 'teacher'
    },
    {
        name: 'Demo Admin',
        email: 'admin@edu.com',
        password: 'EduDemo@123',
        confirmPassword: 'EduDemo@123',
        role: 'admin'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to DB for seeding...');

        for (const user of demoUsers) {
            const existing = await dataModel.findOne({ email: user.email });
            if (existing) {
                console.log(`User ${user.email} already exists, skipping...`);
            } else {
                await dataModel.create(user);
                console.log(`User ${user.email} created successfully.`);
            }
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
