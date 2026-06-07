import Review from "../models/Review.js";
import User from "../models/usersignup.js";
import MyList from "../models/MyList.js";
import axios from "axios";

// Add a Review
export const addReview = async (req, res) => {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        // Get user name for the review
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // --- NEW: Check if user already reviewed this movie ---
        const existingReview = await Review.findOne({ user: userId, movieId });
        if (existingReview) {
            return res.status(400).json({ 
                message: "You have already reviewed this movie. Please edit your existing review instead." 
            });
        }

        const newReview = new Review({
            user: userId,
            userName: user.username, // Assuming 'username' field exists, need to verify in usersignup.js later
            movieId,
            rating,
            comment,
        });

        await newReview.save();

        // --- NEW: Sync with MyList for personal recommendations ---
        try {
            // Check if movie is already in MyList
            let myListItem = await MyList.findOne({ user: userId, movieId });

            if (myListItem) {
                // Update existing item
                myListItem.personalRating = rating;
                myListItem.status = "watched";
                myListItem.updatedAt = Date.now();
                await myListItem.save();
                console.log(`✅ Updated MyList rating for movie ${movieId} to ${rating}`);
            } else {
                // Fetch movie details from TMDB to create a complete MyList entry
                console.log(`🎬 Fetching movie ${movieId} details for new MyList entry...`);
                const tmdbRes = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`
                );
                
                const newMyList = new MyList({
                    user: userId,
                    movieId,
                    title: tmdbRes.data.title || tmdbRes.data.name,
                    posterPath: tmdbRes.data.poster_path,
                    status: "watched",
                    personalRating: rating
                });
                await newMyList.save();
                console.log(`✅ Created new MyList entry with rating ${rating} for movie ${movieId}`);
            }
        } catch (syncError) {
            console.error("⚠️ Error syncing review to MyList:", syncError.message);
            // We don't fail the original review request if sync fails, but we log it
        }

        res.status(201).json({ message: "Review added", review: newReview });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Reviews for a Movie
export const getMovieReviews = async (req, res) => {
    const { movieId } = req.params;

    try {
        const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });

        // Calculate Average
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.json({ reviews, averageRating });
    } catch (error) {
        console.error("Get Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a Review
export const updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    try {
        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) return res.status(404).json({ message: "Review not found or unauthorized" });

        review.rating = rating;
        review.comment = comment;
        review.createdAt = Date.now(); // Optional: Update timestamp on edit
        await review.save();

        // Sync with MyList
        await MyList.findOneAndUpdate(
            { user: userId, movieId: review.movieId },
            { personalRating: rating, updatedAt: Date.now() }
        );

        res.json({ message: "Review updated", review });
    } catch (error) {
        console.error("Update Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a Review
export const deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    try {
        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
        if (!review) return res.status(404).json({ message: "Review not found or unauthorized" });

        // Note: As per user request, we JUST remove the comment/review.
        // The MyList entry with its rating is kept intact.
        
        res.json({ message: "Review removed" });
    } catch (error) {
        console.error("Delete Review Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
