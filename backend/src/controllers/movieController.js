import axios from "axios";
import Review from "../models/Review.js";

// Get Movie Details (TMDB + Local Ratings)
export const getMovieDetails = async (req, res) => {
  const { id } = req.params;
  const { type = "movie" } = req.query;

  try {
    // 1. Fetch TMDB Details
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}`
    );
    const movieData = tmdbResponse.data;

    // 2. Fetch Local Reviews to calculate average
    const reviews = await Review.find({ movieId: id });
    let localRating = null;
    let reviewCount = 0;

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      localRating = (sum / reviews.length).toFixed(1);
      reviewCount = reviews.length;
    }

    // 3. Combine Data
    res.json({
      ...movieData,
      localRating, // Our custom rating
      reviewCount,
    });
  } catch (error) {
    console.error("Movie Details Error:", error.message);
    res.status(500).json({ message: "Failed to fetch movie details" });
  }
};

// Trending Movies (kept as movies only — as per your original intent)
export const getTrendingMovies = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("Trending Error:", error.message);
    res.status(500).json({ message: "Failed to fetch trending movies" });
  }
};

// Search Movies + TV Shows (multi search)
export const searchMovies = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&api_key=${process.env.TMDB_API_KEY}`
    );

    // Filter only movies and TV shows (removes people, etc.)
    const filteredResults = response.data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    res.json(filteredResults);
  } catch (error) {
    console.error("Search Error:", error.message);
    res.status(500).json({ message: "Failed to search movies and TV shows" });
  }
};

// Get Credits (Cast) — works for both movie and TV
export const getMovieCredits = async (req, res) => {
  const { id } = req.params;
  const { type = "movie" } = req.query; // Optional: ?type=tv for TV shows

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${process.env.TMDB_API_KEY}`
    );
    res.json(response.data.cast.slice(0, 12)); // Top 12 cast members
  } catch (error) {
    console.error("Credits Error:", error.message);
    res.status(500).json({ message: "Failed to fetch cast" });
  }
};

// Get Similar/Recommendations — works for both movie and TV
export const getSimilarMovies = async (req, res) => {
  const { id } = req.params;
  const { type = "movie" } = req.query; // Optional: ?type=tv for TV shows

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${process.env.TMDB_API_KEY}`
    );
    res.json(response.data.results.slice(0, 10)); // Top 10 similar
  } catch (error) {
    console.error("Similar Error:", error.message);
    res.status(500).json({ message: "Failed to fetch similar media" });
  }
};

// Discover Movies by Category (WITH PAGINATION)
export const getMoviesByCategory = async (req, res) => {
  const { category, genreId, page = 1 } = req.query;
  console.log(`👉 Fetching: Category='${category}', Genre='${genreId}', Page=${page}`);

  const apiKey = process.env.TMDB_API_KEY;
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${page}`;

  try {
    // 1. Special "Smart" Categories
    if (category === 'anime') {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
    } else if (category === 'series') {
      url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&page=${page}`;
    } else if (category === 'trending') {
      url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`;
    }
    // 2. Generic Genre ID (if provided) e.g. ?genreId=28
    else if (genreId) {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`;
    }

    console.log("🔗 TMDB URL:", url);
    const response = await axios.get(url);
    console.log(`✅ Found ${response.data.results?.length || 0} items (Page ${response.data.page}/${response.data.total_pages})`);

    // Return full response with pagination info
    res.json({
      results: response.data.results || [],
      page: response.data.page,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results
    });
  } catch (error) {
    console.error("❌ Category Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
};