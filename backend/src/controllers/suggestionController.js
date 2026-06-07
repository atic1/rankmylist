import axios from "axios";
import MyList from "../models/MyList.js";

// Get Curated Categories for All Users
export const getCuratedCategories = async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        console.error("❌ TMDB_API_KEY is missing in backend .env");
        return res.status(500).json({ message: "API configuration error" });
    }

    try {
        console.log("🎬 Fetching curated categories... (API Key ends with:", apiKey.slice(-4), ")");

        // Helper to fetch category with its own error handling
        const fetchCategory = async (url) => {
            try {
                const response = await axios.get(url);
                return response.data.results || [];
            } catch (err) {
                console.error(`⚠️ Error fetching category from ${url.split('?')[0]}:`, err.message);
                return []; // Return empty array on failure instead of breaking Promise.all
            }
        };

        // Category 1: Hidden Gems (high rating, lower popularity)
        const hiddenGemsUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=50&vote_count.lte=500&page=1`;

        // Category 2: Top Rated Classics (1990-2010, high ratings)
        const classicsUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&primary_release_date.gte=1990-01-01&primary_release_date.lte=2010-12-31&vote_count.gte=500&page=1`;

        // Category 3: Recent Hits (last 2 years, high ratings)
        const currentYear = new Date().getFullYear();
        const twoYearsAgo = currentYear - 2;
        const recentHitsUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&primary_release_date.gte=${twoYearsAgo}-01-01&vote_count.gte=100&page=1`;

        // Category 4: Award Winners (high budget, high ratings)
        const awardWinnersUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=1000&with_runtime.gte=90&page=1`;

        // Category 5: Mandatory Fallback/Trending
        const trendingUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&page=1`;

        // Fetch all categories
        const [hiddenGemsResults, classicsResults, recentHitsResults, awardWinnersResults, trendingResults] = await Promise.all([
            fetchCategory(hiddenGemsUrl),
            fetchCategory(classicsUrl),
            fetchCategory(recentHitsUrl),
            fetchCategory(awardWinnersUrl),
            fetchCategory(trendingUrl)
        ]);

        const categories = [];

        if (hiddenGemsResults.length > 0) {
            categories.push({
                id: "hidden-gems",
                title: "💎 Hidden Gems",
                description: "Underrated masterpieces you might have missed",
                movies: hiddenGemsResults.slice(0, 20)
            });
        }

        if (classicsResults.length > 0) {
            categories.push({
                id: "classics",
                title: "🎭 Top Rated Classics",
                description: "Timeless films from the golden era",
                movies: classicsResults.slice(0, 20)
            });
        }

        if (recentHitsResults.length > 0) {
            categories.push({
                id: "recent-hits",
                title: "🔥 Recent Hits",
                description: "The best movies from the last couple years",
                movies: recentHitsResults.slice(0, 20)
            });
        }

        if (awardWinnersResults.length > 0) {
            categories.push({
                id: "award-winners",
                title: "🏆 Award-Worthy Films",
                description: "Critically acclaimed cinema",
                movies: awardWinnersResults.slice(0, 20)
            });
        }

        // Always push trending as a robust base
        if (trendingResults.length > 0) {
            categories.push({
                id: "trending",
                title: "🔥 Popular Today",
                description: "Movies everyone is talking about",
                movies: trendingResults.slice(0, 20)
            });
        }

        console.log(`✅ Successfully prepared ${categories.length} categories for response`);
        res.json(categories);
    } catch (error) {
        console.error("❌ Curated Categories Fatal Error:", error.message);
        res.status(500).json({ message: "Failed to fetch curated categories" });
    }
};

// Get Personalized Picks Based on User's MyList
export const getPersonalizedPicks = async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY;
    const userId = req.user?.userId;

    try {
        console.log("👤 Fetching personalized picks for user:", userId);

        // If not authenticated, return trending as fallback
        if (!userId) {
            console.log("⚠️ No user ID, returning trending movies");
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
            const response = await axios.get(trendingUrl);
            return res.json({
                category: {
                    id: "trending",
                    title: "🔥 Trending Now",
                    description: "Popular movies this week",
                    movies: response.data.results.slice(0, 20)
                }
            });
        }

        // Get user's watched movies with ratings, sorted by rating
        const userMovies = await MyList.find({
            user: userId,
            status: "watched",
            personalRating: { $exists: true, $ne: null }
        }).sort({ personalRating: -1 }).limit(3);

        console.log(`📊 Found ${userMovies.length} rated movies for user`);

        // If user has no ratings, return trending
        if (userMovies.length === 0) {
            console.log("⚠️ User has no ratings, returning trending movies");
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
            const response = await axios.get(trendingUrl);
            return res.json({
                category: {
                    id: "trending",
                    title: "🔥 Trending Now",
                    description: "Popular movies this week",
                    movies: response.data.results.slice(0, 20)
                }
            });
        }

        // Get a random movie from the top 3 to provide variety on refresh
        const randomIndex = Math.floor(Math.random() * userMovies.length);
        const topMovie = userMovies[randomIndex];
        
        console.log(`⭐ User's selected recommendation base: ${topMovie.title} (Rating: ${topMovie.personalRating})`);

        // Fetch similar movies based on selected movie
        const similarUrl = `https://api.themoviedb.org/3/movie/${topMovie.movieId}/similar?api_key=${apiKey}&page=1`;
        const similarResponse = await axios.get(similarUrl);

        // If no similar movies found, try recommendations endpoint
        let recommendedMovies = similarResponse.data.results || [];
        if (recommendedMovies.length === 0) {
            console.log("⚠️ No similar movies, trying recommendations endpoint");
            const recUrl = `https://api.themoviedb.org/3/movie/${topMovie.movieId}/recommendations?api_key=${apiKey}&page=1`;
            const recResponse = await axios.get(recUrl);
            recommendedMovies = recResponse.data.results || [];
        }

        console.log(`✅ Found ${recommendedMovies.length} personalized recommendations for ${topMovie.title}`);

        res.json({
            category: {
                id: "personalized",
                title: `✨ Because You Liked "${topMovie.title}"`,
                description: "Movies similar to your favorites",
                movies: recommendedMovies.slice(0, 20),
                basedOn: topMovie.title
            }
        });
    } catch (error) {
        console.error("❌ Personalized Picks Error:", error.message);
        // Fallback to trending on error
        try {
            const trendingUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
            const response = await axios.get(trendingUrl);
            res.json({
                category: {
                    id: "trending",
                    title: "🔥 Trending Now",
                    description: "Popular movies this week",
                    movies: response.data.results.slice(0, 20)
                }
            });
        } catch (fallbackError) {
            console.error("❌ Fallback Error:", fallbackError.message);
            res.status(500).json({ message: "Failed to fetch personalized picks" });
        }
    }
};
// Get Details for a Specific Category (Paginated)
export const getCategoryDetails = async (req, res) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const apiKey = process.env.TMDB_API_KEY;

    console.log(`📡 [GET] /suggestions/category/${categoryId}?page=${page} - Request Received`);

    try {
        let url = "";
        let title = "";
        let description = "";

        switch (categoryId) {
            case "hidden-gems":
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=100&vote_count.lte=1000&page=${page}`;
                title = "💎 Hidden Gems";
                description = "Underrated masterpieces you might have missed";
                break;
            case "classics":
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&primary_release_date.gte=1990-01-01&primary_release_date.lte=2010-12-31&vote_count.gte=1000&page=${page}`;
                title = "🎭 Top Rated Classics";
                description = "Timeless films from the golden era";
                break;
            case "recent-hits":
                const currentYear = new Date().getFullYear();
                const twoYearsAgo = currentYear - 2;
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&primary_release_date.gte=${twoYearsAgo}-01-01&vote_count.gte=500&page=${page}`;
                title = "🔥 Recent Hits";
                description = "The best movies from the last couple years";
                break;
            case "award-winners":
                url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=vote_average.desc&vote_count.gte=2000&with_runtime.gte=90&page=${page}`;
                title = "🏆 Award-Worthy Films";
                description = "Critically acclaimed cinema";
                break;
            case "trending":
                url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`;
                title = "🔥 Trending Now";
                description = "Popular movies this week";
                break;
            case "personalized":
                // This is a special case. We need user ratings.
                const userId = req.user?.userId;
                if (!userId) {
                    url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`;
                    title = "🔥 Trending Now (Fallback)";
                    description = "Popular movies this week";
                } else {
                    const userMovies = await MyList.find({
                        user: userId,
                        status: "watched",
                        personalRating: { $exists: true, $ne: null }
                    }).sort({ personalRating: -1 }).limit(1);

                    if (userMovies.length === 0) {
                        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&page=${page}`;
                        title = "🔥 Trending Now (No Ratings)";
                    } else {
                        const topMovie = userMovies[0];
                        url = `https://api.themoviedb.org/3/movie/${topMovie.movieId}/recommendations?api_key=${apiKey}&page=${page}`;
                        title = `✨ Recommended for You`;
                        description = `Because you enjoyed "${topMovie.title}"`;
                    }
                }
                break;
            default:
                return res.status(404).json({ message: "Category not found" });
        }

        const response = await axios.get(url);
        res.json({
            id: categoryId,
            title,
            description,
            movies: response.data.results,
            page: response.data.page,
            totalPages: response.data.total_pages,
            totalResults: response.data.total_results
        });
    } catch (error) {
        console.error(`❌ Error fetching category ${categoryId}:`, error.message);
        res.status(500).json({ message: "Failed to fetch category details" });
    }
};
