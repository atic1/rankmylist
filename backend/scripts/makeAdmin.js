import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/usersignup.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: node scripts/makeAdmin.js your-email@gmail.com');
    process.exit(1);
}

async function makeAdmin() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env file');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: email });

        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\n🎉 Success! ${email} is now an admin.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

makeAdmin();
