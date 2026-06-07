export default function MovieModal({ movie, cast = [], similar = [], loading = false, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-red-500 transition bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
        >
          ×
        </button>

        {/* Backdrop + Title Overlay */}
        <div className="relative">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
            alt={movie.title}
            className="w-full h-96 object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-5xl font-bold text-white drop-shadow-2xl">{movie.title}</h1>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-yellow-400 text-3xl font-bold drop-shadow-lg">
                ⭐ {movie.vote_average.toFixed(1)} / 10
              </p>
              <p className="text-white/80 text-xl">({movie.vote_count?.toLocaleString()} votes)</p>
            </div>
            {movie.release_date && (
              <p className="text-white/70 text-lg mt-2">Released: {new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-white">
          {/* Overview */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-purple-300 mb-3">Overview</h3>
            <p className="text-gray-200 text-lg leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 text-sm">
            {movie.runtime && (
              <div>
                <span className="text-gray-400">Runtime</span>
                <p className="text-white font-medium">{movie.runtime} minutes</p>
              </div>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <span className="text-gray-400">Genres</span>
                <p className="text-white font-medium">{movie.genres.map(g => g.name).join(', ')}</p>
              </div>
            )}
            <div>
              <span className="text-gray-400">Popularity</span>
              <p className="text-white font-medium">{Math.round(movie.popularity)}</p>
            </div>
            <div>
              <span className="text-gray-400">Language</span>
              <p className="text-white font-medium uppercase">{movie.original_language}</p>
            </div>
          </div>

          {/* Top Cast - Horizontal Scroll */}
          <h3 className="text-2xl font-bold mb-4 text-purple-300">Top Cast</h3>
          {loading ? (
            <p className="text-gray-400">Loading cast...</p>
          ) : cast.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-purple-600">
              {cast.map((actor) => (
                <div key={actor.id} className="flex-shrink-0 text-center w-40">
                  <img
                    src={actor.profile_path
                      ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                      : 'https://via.placeholder.com/200x300?text=No+Photo'}
                    alt={actor.name}
                    className="w-full h-64 object-cover rounded-xl shadow-lg mb-3"
                  />
                  <p className="font-semibold text-white">{actor.name}</p>
                  <p className="text-sm text-gray-400 italic">as {actor.character}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No cast information available.</p>
          )}

          {/* Similar Movies - Horizontal Scroll */}
          <h3 className="text-2xl font-bold mb-4 mt-12 text-purple-300">Similar Movies</h3>
          {loading ? (
            <p className="text-gray-400">Loading similar movies...</p>
          ) : similar.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-purple-600">
              {similar.map((sim) => (
                <div 
                  key={sim.id} 
                  className="flex-shrink-0 w-48 cursor-pointer group"
                  onClick={() => {
                    // Optional: reload details for new movie
                    // You can pass a callback from Home to update selectedMovie
                  }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${sim.poster_path}`}
                    alt={sim.title}
                    className="w-full rounded-xl shadow-lg group-hover:scale-105 transition"
                  />
                  <p className="text-white text-sm mt-3 text-center font-medium truncate">{sim.title}</p>
                  <p className="text-yellow-400 text-xs text-center">⭐ {sim.vote_average.toFixed(1)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No similar movies found.</p>
          )}
        </div>
      </div>
    </div>
  );
}