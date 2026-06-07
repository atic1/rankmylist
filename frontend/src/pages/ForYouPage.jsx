import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Star, Info, ArrowRight } from 'lucide-react'
import MovieCarousel from '../components/MovieCarousel'

export default function ForYouPage() {
    const [personalized, setPersonalized] = useState(null)
    const [curated, setCurated] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const token = localStorage.getItem('token')
            
            try {
                // Fetch curated categories
                const curatedRes = await axios.get(`${API_URL}/movies/suggestions/curated`)
                setCurated(curatedRes.data)

                // Fetch personalized if logged in
                if (token) {
                    const personalizedRes = await axios.get(
                        `${API_URL}/movies/suggestions/personalized`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                    setPersonalized(personalizedRes.data.category)
                }
                
                setLoading(false)
            } catch (err) {
                console.error("❌ Error fetching for-you data:", err.message)
                setError("Unable to load your personalized content. Please try again later.")
                setLoading(false)
            }
        }
        fetchData()
    }, [API_URL])

    if (loading) {
        return (
            <div className="pt-24 min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                </div>
                <p className="mt-4 text-gray-400 font-medium animate-pulse">Crafting your unique experience...</p>
            </div>
        )
    }

    return (
        <div className="pt-24 min-h-screen bg-transparent pb-20">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold mb-6">
                    <Sparkles size={16} />
                    <span>Personalized for You</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                    Your Daily <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Recommendations</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Based on your ratings, watchlist, and movie preferences. We find the stories you'll love.
                </p>
                
                {!localStorage.getItem('token') && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-amber-400 mb-2">Sign in for better picks</h3>
                        <p className="text-gray-400 mb-6">
                            Log in to let our recommendation engine analyze your taste and provide truly personal suggestions.
                        </p>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform hover:scale-105"
                        >
                            Login Now <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Personalized Content Section */}
                {personalized && personalized.id !== 'trending' ? (
                    <div className="mb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-widest mb-2">
                                    <Star size={16} fill="currentColor" />
                                    <span>Top Choice for You</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{personalized.title}</h2>
                                <p className="text-gray-400 text-lg">{personalized.description}</p>
                            </div>
                            <Link 
                                to={`/category/personalized`}
                                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                            >
                                Explore All Personal Picks <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="bg-gray-800/20 border border-gray-700/30 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
                            <MovieCarousel movies={personalized.movies} categoryId="personalized" />
                        </div>
                    </div>
                ) : localStorage.getItem('token') && (
                    <div className="mb-20 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Let's build your <span className="text-indigo-400">Personalized</span> list!</h2>
                            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                                Your personal recommendation engine is ready, but it needs to learn about your movie taste first.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-2xl font-bold text-indigo-400 mb-2">01</div>
                                    <h4 className="text-white font-bold mb-2">Search</h4>
                                    <p className="text-sm text-gray-400">Find a movie you really liked</p>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-2xl font-bold text-pink-400 mb-2">02</div>
                                    <h4 className="text-white font-bold mb-2">Rate</h4>
                                    <p className="text-sm text-gray-400">Give it 4-5 stars in a review</p>
                                </div>
                                <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                    <div className="text-2xl font-bold text-purple-400 mb-2">03</div>
                                    <h4 className="text-white font-bold mb-2">Refresh</h4>
                                    <p className="text-sm text-gray-400">See your new recommendations!</p>
                                </div>
                            </div>
                            
                            <Link 
                                to="/search" 
                                className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                            >
                                Start Searching <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Trending Fallback Section (if no personalized or as addition) */}
                {(!personalized || personalized.id === 'trending') && (
                    <div className="mb-20">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="text-pink-400" size={32} />
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Worldwide <span className="text-pink-400">Trending</span></h2>
                        </div>
                        <div className="bg-gray-800/10 border border-gray-700/20 rounded-3xl p-6">
                            <MovieCarousel movies={personalized?.movies || []} categoryId="trending" />
                        </div>
                    </div>
                )}

                {/* Curated Sets */}
                <div className="space-y-20">
                    {curated.map((category, idx) => (
                        <div key={category.id} className={`${idx % 2 === 1 ? 'md:pl-12 border-l-2 border-gray-800/50' : ''}`}>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-400 text-lg max-w-2xl">{category.description}</p>
                                </div>
                                <Link 
                                    to={`/category/${category.id}`}
                                    className="px-6 py-2 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-indigo-500 transition-all font-medium text-sm"
                                >
                                    Browse All
                                </Link>
                            </div>
                            <MovieCarousel movies={category.movies} categoryId={category.id} />
                        </div>
                    ))}
                </div>

                {/* Info Box */}
                <div className="mt-32 p-10 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 text-center">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Info className="text-indigo-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">How these are picked</h3>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Our recommendation engine analyzes your ratings in your "Watched" list and finds similar movies 
                        using global cinematic data. Rate more movies higher (4+ stars) to get even better suggestions!
                    </p>
                </div>
            </div>
        </div>
    )
}
