import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import User from '../models/usersignup.js';
import TierList from '../models/TierList.js';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authMiddleware, adminMiddleware);

// --- DASHBOARD STATS ---
router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTierLists = await TierList.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalMovies = await Movie.countDocuments();

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

        res.json({
            stats: {
                totalUsers,
                totalTierLists,
                totalReviews,
                totalMovies
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Maintain /stats for backward compatibility just in case
router.get('/stats', async (req, res) => {
    res.redirect('/admin/dashboard');
});

// --- USERS MANAGEMENT ---
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Optionally delete cascade logic
        await Review.deleteMany({ user: id });
        await TierList.deleteMany({ user: id });
        
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- MOVIES MANAGEMENT ---
router.get('/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/movie', async (req, res) => {
    try {
        const { title, overview, posterPath, releaseDate, genres, voteAverage } = req.body;
        const newMovie = new Movie({
            title,
            overview,
            posterPath,
            releaseDate,
            genres,
            voteAverage
        });
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/movie/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedMovie) return res.status(404).json({ message: "Movie not found" });
        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/movie/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMovie = await Movie.findByIdAndDelete(id);
        if (!deletedMovie) return res.status(404).json({ message: "Movie not found" });
        res.json({ message: "Movie deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- REVIEWS MANAGEMENT ---
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().populate('user', 'username email').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/review/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
