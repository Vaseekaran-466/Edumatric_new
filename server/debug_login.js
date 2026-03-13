import { login } from './controller/controller.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mockRes = {
    status: function (code) {
        console.log('Status Code:', code);
        return this;
    },
    json: function (data) {
        console.log('Response Body:', JSON.stringify(data, null, 2));
        return this;
    },
    cookie: function (name, val, options) {
        console.log('Set Cookie:', name, val);
        return this;
    }
};

const mockReq = {
    body: {
        email: 'test@test.com',
        password: 'password'
    }
};

async function test() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Executing login logic...');
        await login(mockReq, mockRes);
    } catch (err) {
        console.error('Test Script Crash:', err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
