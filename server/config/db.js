import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

let connectionPromise = null;
let lastDbError = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;
export const getLastDbError = () => lastDbError;

export const isDbAuthError = (error) => {
    const message = error?.message || '';

    return error?.code === 8000 || error?.codeName === 'AtlasError' || /bad auth|authentication failed/i.test(message);
};

export const toDbErrorSummary = (error) => {
    if (!error) {
        return null;
    }

    return {
        name: error.name,
        message: error.message,
        code: error.code,
        codeName: error.codeName,
        at: new Date().toISOString(),
    };
};

const dbconnect = async () => {
    if (isDbConnected()) {
        lastDbError = null;
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
        lastDbError = null;
        console.log(`DB CONNECTED -> ${connect.connection.host}`);
        return connect.connection;
    }).catch((error) => {
        lastDbError = toDbErrorSummary(error);
        console.error('MONGODB CONNECTION ERROR:', error.message);

        if (isDbAuthError(error)) {
            console.warn('MongoDB authentication failed. Verify the username, password, auth database, and the full MONGO_URL in Render.');
        } else if (/SSL|TLS|timeout/i.test(error.message)) {
            console.warn('Atlas connectivity looks unhealthy. Check the URI, TLS support, and Atlas network access.');
        }

        throw error;
    }).finally(() => {
        connectionPromise = null;
    });

    return connectionPromise;
};

export default dbconnect;
