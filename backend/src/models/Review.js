import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userName: {
        type: String, // Cache the name to avoid extra lookups
        required: true,
    },
    movieId: {
        type: Number, // TMDB ID
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index to quickly fetch reviews for a specific movie
reviewSchema.index({ movieId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
