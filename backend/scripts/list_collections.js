import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function listCollections() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('--- COLLECTIONS IN DATABASE ---');
        collections.forEach(c => console.log(`- ${c.name}`));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

listCollections();
