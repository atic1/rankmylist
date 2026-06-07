import mongoose from "mongoose";

const myListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    movieId: {
        type: Number, // TMDB ID
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    posterPath: {
        type: String,
    },
    status: {
        type: String,
        enum: ["watched", "plan_to_watch"],
        required: true,
    },
    personalRating: {
        type: Number,
        min: 1,
        max: 10,
        default: null, // Only for 'watched' movies
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only have one entry per movie
myListSchema.index({ user: 1, movieId: 1 }, { unique: true });

export default mongoose.model("MyList", myListSchema);
