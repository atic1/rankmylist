import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import { Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react'

// Same category list as TierListPage
const ALL_CATEGORIES = [
  // Special Collections
  { id: 'trending', label: '🔥 Trending Movies', type: 'special' },
  { id: 'anime', label: '🎌 Anime', type: 'special' },
  { id: 'series', label: '📺 Series', type: 'special' },

  // Movie Genres
  { id: 28, label: '💥 Action', type: 'genre' },
  { id: 12, label: '🗺️ Adventure', type: 'genre' },
  { id: 16, label: '🎨 Animation', type: 'genre' },
  { id: 35, label: '😂 Comedy', type: 'genre' },
  { id: 80, label: '🕵️ Crime', type: 'genre' },
  { id: 99, label: '📹 Documentary', type: 'genre' },
  { id: 18, label: '🎭 Drama', type: 'genre' },
  { id: 10751, label: '👨‍👩‍👧 Family', type: 'genre' },
  { id: 14, label: '🧚 Fantasy', type: 'genre' },
  { id: 36, label: '📜 History', type: 'genre' },
  { id: 27, label: '🧟 Horror', type: 'genre' },
  { id: 10402, label: '🎵 Music', type: 'genre' },
  { id: 9648, label: '🧩 Mystery', type: 'genre' },
  { id: 10749, label: '💖 Romance', type: 'genre' },
  { id: 878, label: '🚀 Sci-Fi', type: 'genre' },
  { id: 10770, label: '📺 TV Movie', type: 'genre' },
  { id: 53, label: '😱 Thriller', type: 'genre' },
  { id: 10752, label: '⚔️ War', type: 'genre' },
  { id: 37, label: '🤠 Western', type: 'genre' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  const API_URL = import.meta.env.VITE_API_URL

  // Sync local state if URL changes
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Perform search when submitted
  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setActiveCategory(null) // Clear category when searching
    setCurrentPage(1)
    try {
      const res = await axios.get(
        `${API_URL}/movies/search?query=${encodeURIComponent(searchTerm)}`
      )
      setResults(res.data || [])
      setTotalPages(1) // Search doesn't have pagination in current backend
    } catch (err) {
      console.error("Search failed:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch by category with pagination
  const fetchCategory = async (catObj, page = 1) => {
    setLoading(true)
    setActiveCategory(catObj.id)
    setQuery('') // Clear search when browsing category
    setCurrentPage(page)

    let url = `${API_URL}/movies/discover?page=${page}&`
    if (catObj.type === 'special') {
      url += `category=${catObj.id}`
    } else {
      url += `genreId=${catObj.id}`
    }

    try {
      const res = await axios.get(url)
      // Backend now returns { results, page, total_pages, total_results }
      setResults(res.data.results || [])
      setTotalPages(res.data.total_pages || 1)
      setTotalResults(res.data.total_results || 0)
      setCurrentPage(res.data.page || 1)

      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error("Category fetch failed:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Effect to search on mount if URL has query
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchParams({ q: query })
    performSearch(query)
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (activeCategory) {
      const catObj = ALL_CATEGORIES.find(c => c.id === activeCategory)
      if (catObj) {
        fetchCategory(catObj, newPage)
      }
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  // Determine media type for routing
  const getMediaType = (item) => {
    // If it has media_type from search, use that
    if (item.media_type) return item.media_type

    // If from anime or series category, it's TV
    if (activeCategory === 'anime' || activeCategory === 'series') return 'tv'

    // If it has 'name' instead of 'title', it's TV
    if (item.name && !item.title) return 'tv'

    // Default to movie
    return 'movie'
  }

  // Filter categories
  const filteredCategories = ALL_CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(categoryFilter.toLowerCase())
  )

  return (
    <div className="pt-8 min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <SearchIcon className="absolute left-4 text-gray-500" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full bg-white text-gray-900 pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 shadow-xl text-lg transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 bg-indigo-600 px-6 py-2 rounded-full text-white font-bold hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Browser Section */}
        <div className="bg-gray-100/80 p-6 rounded-2xl mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-900">🎬 Browse by Category</h2>
            <input
              type="text"
              placeholder="Filter categories..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-64 bg-white text-gray-900 border border-gray-300 rounded-full py-2 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => fetchCategory(cat, 1)}
                className={`px-3 py-1.5 rounded-full font-medium text-sm transition-all whitespace-nowrap
                  ${activeCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:scale-105'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-900 text-2xl animate-pulse">Loading...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-xl font-semibold">
                {activeCategory
                  ? `${filteredCategories.find(c => c.id === activeCategory)?.label} (${totalResults.toLocaleString()} results)`
                  : `Search results for "${query}"`}
              </h3>
              {activeCategory && totalPages > 1 && (
                <p className="text-gray-600 text-sm">Page {currentPage} of {totalPages}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((movie) => {
                const mediaType = getMediaType(movie)
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
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4">
                      <h3 className="text-gray-900 font-bold text-lg truncate">{movie.title || movie.name}</h3>
                      <p className="text-yellow-600 font-semibold">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</p>
                      <p className="text-gray-700 text-sm">
                        {movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 'N/A'}
                      </p>
                      {mediaType === 'tv' && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded mt-1 w-fit">TV Show</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {activeCategory && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <div className="flex gap-1">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition ${currentPage === page
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          !loading && (
            <div className="text-center text-gray-900 py-20">
              <p className="text-3xl mb-4 font-bold">
                {query ? `No movies found for "${query}"` : activeCategory ? 'No movies found in this category' : 'Search for movies or browse by category'}
              </p>
              <p className="text-xl text-gray-600">
                {query ? 'Try checking your spelling or browse categories above.' : 'Use the search bar or click a category to get started.'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}