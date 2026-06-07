import express from "express";
import { getTrendingMovies, getMovieCredits, getSimilarMovies, searchMovies, getMovieDetails, getMoviesByCategory } from "../controllers/movieController.js";
import { getCuratedCategories, getPersonalizedPicks, getCategoryDetails } from "../controllers/suggestionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Suggestions endpoints
router.get("/suggestions/curated", getCuratedCategories); // Public: curated categories
router.get("/suggestions/personalized", authMiddleware, getPersonalizedPicks); // Protected: personalized picks
router.get("/suggestions/category/:categoryId", (req, res, next) => {
    // Optional auth: if token exists, we use authMiddleware, otherwise we just continue
    if (req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    next();
}, getCategoryDetails);

// Existing routes
router.get("/discover", getMoviesByCategory); // New: Category discovery
router.get("/:id/credits", getMovieCredits);
router.get("/:id/similar", getSimilarMovies)
router.get("/trending", getTrendingMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieDetails);

export default router;