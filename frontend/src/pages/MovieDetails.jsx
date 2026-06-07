import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Plus, Check } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';

const MovieDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const mediaType = searchParams.get('type') || 'movie'; // Get type from URL, default to movie

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inList, setInList] = useState(null); // 'watched', 'plan_to_watch', or null
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchMovie = async () => {
        try {
            // Pass type parameter to backend
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/movies/${id}?type=${mediaType}`);
            setMovie(res.data);
        } catch (error) {
            console.error("Error fetching movie", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovie();
    }, [id, mediaType, refreshTrigger]);

    const handleListAction = async (status) => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login first");

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/mylist`, {
                movieId: movie.id,
                title: movie.title || movie.name,
                posterPath: movie.poster_path,
                status: status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInList(status);
            alert(`Added to ${status === 'watched' ? 'Watched' : 'Watch List'}!`);
        } catch (error) {
            if (error.response?.status === 401) {
                alert("Session expired. Please log out and back in.");
            } else {
                alert("Failed to update list");
            }
        }
    };

    if (loading) return <div className="text-gray-900 text-center mt-20">Loading...</div>;
    if (!movie) return <div className="text-gray-900 text-center mt-20">Movie not found</div>;

    // Handle both movie and TV show data structures
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-8">
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={title}
                    className="w-full md:w-80 rounded-lg shadow-2xl"
                />

                <div className="flex-1 text-gray-900">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold">{title}</h1>
                        {mediaType === 'tv' && (
                            <span className="bg-purple-600 px-3 py-1 rounded-full text-sm font-semibold">TV Show</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="bg-indigo-600 px-2 py-1 rounded text-sm">
                            {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-600">
                            <Star size={20} fill="currentColor" />
                            <span className="font-bold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                            <span className="text-gray-500 text-sm">(TMDB)</span>
                        </div>
                        {movie.localRating && (
                            <div className="flex items-center gap-1 text-green-600">
                                <Star size={20} fill="currentColor" />
                                <span className="font-bold">{movie.localRating}</span>
                                <span className="text-gray-500 text-sm">(Community)</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                        {movie.overview}
                    </p>

                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => handleListAction('plan_to_watch')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition"
                        >
                            <Plus size={20} /> Plan to Watch
                        </button>
                        <button
                            onClick={() => handleListAction('watched')}
                            className="flex items-center gap-2 border border-green-500 text-green-400 hover:bg-green-500/10 px-6 py-3 rounded-full font-semibold transition"
                        >
                            <Check size={20} /> Mark Watched
                        </button>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2">
                        {movie.genres?.map(g => (
                            <span key={g.id} className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-700">
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <ReviewSection movieId={movie.id} onReviewChange={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
    );
};

export default MovieDetails;
