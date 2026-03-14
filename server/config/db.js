import mongoose from "mongoose"


const dbconnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 10000,
            tls: true, // Explicitly enable TLS for Atlas
        });
        console.log(`✅ DB CONNECTED → ${connect.connection.host}`);
    } catch (error) {
        console.error('❌ MONGODB CONNECTION ERROR:', error.message);
        // Explicitly notify about IP Whitelisting for Atlas
        if (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('timeout')) {
            console.warn('💡 ACTION REQUIRED: This is likely an IP Whitelist issue in MongoDB Atlas.');
            console.warn('   Please ensure your IP is added to "Network Access" in your Atlas dashboard.');
        }
    }
}
export default dbconnect;