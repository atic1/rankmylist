import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { PlusCircle, CheckCircle } from 'lucide-react'
import SuggestionsSection from '../components/SuggestionsSection'
import MovieCarousel from '../components/MovieCarousel'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch trending movies on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/movies/trending`)
        setMovies(res.data)
        setLoading(false)
      } catch (err) {
        console.error("Failed to load movies:", err)
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <div className="pt-8 min-h-screen bg-transparent">
      {/* Suggestions Section */}
      <SuggestionsSection />

      {/* Trending Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white transition-colors duration-200">
            🔥 Trending This Week
          </h2>
          <Link
            to="/category/trending"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-48 h-72 bg-gray-200 dark:bg-gray-800 rounded-xl flex-shrink-0 transition-colors duration-200"></div>
            ))}
          </div>
        ) : (
          <MovieCarousel movies={movies} categoryId="trending" />
        )}
      </div>
    </div>
  )
}
