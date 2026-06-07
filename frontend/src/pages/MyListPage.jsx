import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyListPage = () => {
    const [list, setList] = useState([]);
    const [filter, setFilter] = useState('all'); // all, watched, plan_to_watch
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchList = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/mylist`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setList(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
        fetchList();
    }, []);

    const filteredList = list.filter(item => filter === 'all' ? true : item.status === filter);

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl text-white font-bold mb-8">My Library</h1>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-700 pb-2">
                {['all', 'watched', 'plan_to_watch'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 capitalize font-semibold transition-colors
              ${filter === f ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {f.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {loading ? <p className="text-gray-400">Loading library...</p> :
                    filteredList.map((item) => (
                        <Link to={`/movie/${item.movieId}`} key={item._id} className="bg-gray-800 rounded-lg overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-lg">
                            <div className="relative">
                                <img src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} alt={item.title} className="w-full h-64 object-cover" />
                                <div className="absolute top-2 right-2 bg-black/70 p-1 rounded-full text-white">
                                    {item.status === 'watched' ? <CheckCircle size={16} className="text-green-400" /> : <Clock size={16} className="text-blue-400" />}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-white font-semibold truncate group-hover:text-indigo-400">{item.title}</h3>
                                {item.personalRating && (
                                    <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                                        <Star size={12} fill="currentColor" />
                                        <span>{item.personalRating}/10</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
            </div>

            {!loading && filteredList.length === 0 && (
                <div className="text-center py-20 bg-gray-800/20 border border-dashed border-gray-700 rounded-3xl mt-12 px-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
                        <Plus size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Your library is waiting...</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed text-lg">
                        Build your movie library to unlock personalized recommendations specifically tailored to your taste.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/search" 
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                        >
                            Find Your First Movie
                        </Link>
                        <Link 
                            to="/trending" 
                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all"
                        >
                            Browse Trending
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyListPage;
