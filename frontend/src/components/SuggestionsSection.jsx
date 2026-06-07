import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { ArrowRight, RefreshCcw, Sparkles } from 'lucide-react'
import MovieCarousel from './MovieCarousel'

export default function SuggestionsSection() {
    const [curatedCategories, setCuratedCategories] = useState([])
    const [personalizedCategory, setPersonalizedCategory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const fetchSuggestions = async () => {
        try {
            console.log("🔗 VITE_API_URL:", import.meta.env.VITE_API_URL);
            setLoading(true)
            const token = localStorage.getItem('token')

            // Fetch curated categories (public)
            console.log("🎬 Fetching curated categories...");
            const curatedRes = await axios.get(
                `${import.meta.env.VITE_API_URL}/movies/suggestions/curated`
            )
            console.log("✅ Curated Response:", curatedRes.data);
            setCuratedCategories(curatedRes.data)

            // Fetch personalized picks if user is logged in
            if (token) {
                console.log("👤 Fetching personalized picks...");
                try {
                    const personalizedRes = await axios.get(
                        `${import.meta.env.VITE_API_URL}/movies/suggestions/personalized`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    )
                    console.log("✅ Personalized Response:", personalizedRes.data);
                    setPersonalizedCategory(personalizedRes.data.category)
                } catch (err) {
                    console.error('❌ Personalized Error:', err.response?.status, err.message);
                    if (err.response?.status === 401) {
                        console.log("Session expired while fetching personalized picks");
                    }
                }
            }

            setLoading(false)
        } catch (err) {
            console.error('❌ Failed to fetch suggestions:', err.response?.status, err.message)
            setError('Failed to load suggestions')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-10">
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-48 mb-4 animate-pulse transition-colors duration-200"></div>
                    <div className="h-6 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl w-96 animate-pulse transition-colors duration-200"></div>
                </div>
                {[1, 2].map((i) => (
                    <div key={i} className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 animate-pulse transition-colors duration-200"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-20 animate-pulse transition-colors duration-200"></div>
                        </div>
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="w-48 aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0 animate-pulse transition-colors duration-200"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-6 transition-colors duration-200">
                    <p className="text-lg">{error}</p>
                    <button
                        onClick={fetchSuggestions}
                        className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                            ✨ For You
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-200">
                            Personalized picks and curated collections
                        </p>
                    </div>
                    <Link 
                        to="/foryou" 
                        className="group flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 rounded-2xl transition-all font-bold"
                    >
                        Explore More <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                </div>
                {curatedCategories.length === 0 && !loading && !error && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm italic transition-colors duration-200">
                        ⚠️ Data was fetched but 0 categories were returned. This usually happens if the TMDB API fails or returns empty results for all curated filters.
                    </div>
                )}
            </div>

            {/* Personalized Category (if available) */}
            {personalizedCategory && personalizedCategory.movies && personalizedCategory.movies.length > 0 && (
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                                {personalizedCategory.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">{personalizedCategory.description}</p>
                        </div>
                        <Link
                            to="/category/personalized"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm mb-1 transition-colors duration-200"
                        >
                            View All →
                        </Link>
                    </div>
                    <MovieCarousel movies={personalizedCategory.movies} categoryId="personalized" />
                </div>
            )}

            {/* Curated Categories */}
            {curatedCategories.length > 0 ? (
                curatedCategories.map((category) => (
                    <div key={category.id} className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                                    {category.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">{category.description}</p>
                            </div>
                            <Link
                                to={`/category/${category.id}`}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm mb-1 transition-colors duration-200"
                            >
                                View All →
                            </Link>
                        </div>
                        <MovieCarousel movies={category.movies} categoryId={category.id} />
                    </div>
                ))
            ) : (
                null
            )}
        </div>
    )
}
