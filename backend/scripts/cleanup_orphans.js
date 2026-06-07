import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../src/models/Review.js';
import MyList from '../src/models/MyList.js';
import TierList from '../src/models/TierList.js';
import User from '../src/models/usersignup.js';

dotenv.config({ path: './.env' });

async function findOrphans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, '_id').lean();
        const userIds = users.map(u => u._id.toString());

        console.log(`--- DATABASE INTEGRITY CHECK (Users Found: ${userIds.length}) ---`);

        // 1. Check Reviews
        const reviews = await Review.find({}).lean();
        const orphanedReviews = reviews.filter(r => !userIds.includes(r.user.toString()));
        console.log(`- Reviews: ${reviews.length} (Orphaned: ${orphanedReviews.length})`);

        // 2. Check MyList
        const myLists = await MyList.find({}).lean();
        const orphanedMyLists = myLists.filter(m => !userIds.includes(m.user.toString()));
        console.log(`- MyLists: ${myLists.length} (Orphaned: ${orphanedMyLists.length})`);

        // 3. Check TierLists
        const tierLists = await TierList.find({}).lean();
        const orphanedTierLists = tierLists.filter(t => !userIds.includes(t.user.toString()));
        console.log(`- TierLists: ${tierLists.length} (Orphaned: ${orphanedTierLists.length})`);

        if (orphanedReviews.length > 0) {
            console.log(`🗑️ Deleting ${orphanedReviews.length} orphaned reviews...`);
            await Review.deleteMany({ _id: { $in: orphanedReviews.map(r => r._id) } });
        }
        if (orphanedMyLists.length > 0) {
            console.log(`🗑️ Deleting ${orphanedMyLists.length} orphaned mylists...`);
            await MyList.deleteMany({ _id: { $in: orphanedMyLists.map(m => m._id) } });
        }
        if (orphanedTierLists.length > 0) {
            console.log(`🗑️ Deleting ${orphanedTierLists.length} orphaned tierlists...`);
            await TierList.deleteMany({ _id: { $in: orphanedTierLists.map(t => t._id) } });
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

findOrphans();
