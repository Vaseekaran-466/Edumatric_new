import mongoose from "mongoose"


const dbconnect = async () => {

    try {
        const connect = await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000, // Wait 10s before failing
        });
        console.log(`✅ DB CONNECTED → ${connect.connection.host}`);
    } catch (error) {
        console.error('❌ MONGODB CONNECTION ERROR:', error.message);
        // Explicitly notify user about TLS errors which are common in Node 22+
        if (error.message.includes('SSL') || error.message.includes('TLS')) {
            console.error('💡 TIP: This might be a TLS version mismatch. Ensure your IP is whitelisted on MongoDB Atlas.');
        }
    }

}
export default dbconnect;