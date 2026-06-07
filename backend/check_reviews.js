import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../src/models/Review.js';

dotenv.config({ path: './.env' });

async function checkReviews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const reviews = await Review.find({});
        console.log('--- ALL REVIEWS ---');
        console.log(JSON.stringify(reviews, null, 2));
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkReviews();
