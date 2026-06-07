import express from "express";
import { addReview, getMovieReviews, updateReview, deleteReview } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to see reviews
router.get("/:movieId", getMovieReviews);

// Protected routes
router.post("/", authMiddleware, addReview);
router.put("/:reviewId", authMiddleware, updateReview);
router.delete("/:reviewId", authMiddleware, deleteReview);

export default router;
