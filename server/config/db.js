import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

let connectionPromise = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;

const dbconnect = async () => {
    if (isDbConnected()) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    if (!process.env.MONGO_URL) {
        throw new Error('MONGO_URL is not defined');
    }

    connectionPromise = mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    }).then((connect) => {
        console.log(`DB CONNECTED -> ${connect.connection.host}`);
        return connect.connection;
    }).catch((error) => {
        console.error('MONGODB CONNECTION ERROR:', error.message);

        if (/SSL|TLS|timeout/i.test(error.message)) {
            console.warn('Atlas connectivity looks unhealthy. Check the URI, TLS support, and Atlas network access.');
        }

        throw error;
    }).finally(() => {
        connectionPromise = null;
    });

    return connectionPromise;
};

export default dbconnect;
