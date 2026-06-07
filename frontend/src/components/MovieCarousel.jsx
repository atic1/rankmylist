import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function MovieCarousel({ movies, categoryId }) {
    if (!movies || movies.length === 0) {
        return (
            <div className="flex items-center justify-center h-72 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-600">No movies available in this category</p>
            </div>
        )
    }

    return (
        <div className="relative group">
            {/* Scrollable Container */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth min-h-[300px]">
                {movies.map((movie) => {
                    // Handle both movie and TV show data structures
                    const title = movie.title || movie.name
                    const posterPath = movie.poster_path
                    const mediaType = movie.media_type || 'movie'
                    const rating = movie.vote_average

                    return (
                        <Link
                            key={movie.id}
                            to={`/movie/${movie.id}?type=${movie.media_type || 'movie'}`}
                            className="flex-shrink-0 w-40 sm:w-48 snap-start cursor-pointer group"
                        >
                            <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-colors duration-200">
                                {movie.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                        alt={title}
                                        className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium p-4 text-center">
                                        {title}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-black/95 via-white/50 dark:via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                    <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight mb-1 truncate transition-colors duration-200">{title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                        {rating && (
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500 dark:text-yellow-400">⭐</span>
                                                <span className="font-semibold">
                                                    {rating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {rating && (
                                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                                        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold transition-colors duration-200">
                                            ⭐ {rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}

                {/* "View More" Card at the end */}
                {categoryId && (
                    <Link
                        to={`/category/${categoryId}`}
                        className="flex-shrink-0 w-40 sm:w-48 snap-start cursor-pointer group flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300"
                    >
                        <div className="group flex flex-col items-center justify-center h-full gap-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-all duration-300">
                                <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="font-bold tracking-wide">View All</span>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    )
}

