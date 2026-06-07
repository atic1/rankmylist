import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

export default function CategoryDetailsPage() {
    const { categoryId } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const currentPage = parseInt(searchParams.get('page')) || 1

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        const fetchCategoryData = async () => {
            console.log("🔍 Fetching category details for:", categoryId, "Page:", currentPage)
            setLoading(true)
            const token = localStorage.getItem('token')
            const url = `${API_URL}/movies/suggestions/category/${categoryId}?page=${currentPage}`
            console.log("🔗 Request URL:", url)

            try {
                const res = await axios.get(
                    url,
                    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                )
                console.log("✅ Category data received:", res.data)
                setData(res.data)
                setLoading(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } catch (err) {
                console.error("❌ Failed to fetch category data:", err.response?.status, err.message)
                if (err.response) {
                    console.error("📄 Error response data:", err.response.data)
                }
                setError("Failed to load this category. Please try again later.")
                setLoading(false)
            }
        }
        fetchCategoryData()
    }, [categoryId, currentPage, API_URL])

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage })
    }

    const getPageNumbers = () => {
        if (!data) return []
        const pages = []
        const total = data.totalPages
        const maxVisible = 7

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) {
                pages.push(i)
            }
            if (currentPage < total - 2) pages.push('...')
            pages.push(total)
        }
        return pages
    }

    if (loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="pt-24 min-h-screen text-center px-4">
                <h2 className="text-3xl font-bold text-white mb-4">{error || "Category Not Found"}</h2>
                <Link to="/" className="text-indigo-400 hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
            </div>
        )
    }

    return (
        <div className="pt-24 min-h-screen bg-transparent pb-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-10">
                    <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                    <h1 className="text-5xl font-extrabold text-white mb-4">{data.title}</h1>
                    <p className="text-xl text-gray-400 max-w-3xl">{data.description}</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
                    {data.movies.map((movie) => {
                        const mediaType = movie.media_type || 'movie'
                        return (
                            <Link
                                key={movie.id}
                                to={`/movie/${movie.id}?type=${mediaType}`}
                                className="cursor-pointer group relative overflow-hidden rounded-xl shadow-2xl transform transition hover:scale-105"
                            >
                                <img
                                    src={movie.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                        : 'https://via.placeholder.com/500x750?text=No+Poster'}
                                    alt={movie.title || movie.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg truncate">{movie.title || movie.name}</h3>
                                    <p className="text-yellow-400 font-semibold flex items-center gap-1">
                                        ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                        {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 'N/A'}
                                    </p>
                                </div>
                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
                                    <span className="text-yellow-400 text-xs font-bold">
                                        ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-4 py-2 rounded-lg transition min-w-[40px] ${currentPage === page
                                            ? 'bg-indigo-600 text-white font-bold'
                                            : 'bg-gray-800 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === data.totalPages}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
