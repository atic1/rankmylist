import React, { useState, useEffect } from 'react';
import TierBoard from '../components/TierBoard';
import axios from 'axios';
import { Plus, Search, ChevronLeft, ChevronRight, Save, CheckCircle, PlusCircle } from 'lucide-react';

// Extensive List of Categories & Genres
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

const TierListPage = () => {
    const [tiers, setTiers] = useState({ S: [], A: [], B: [], C: [], D: [] });
    const [pool, setPool] = useState([]);
    const [categoryMovies, setCategoryMovies] = useState([]);
    const [activeCategory, setActiveCategory] = useState('trending');
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
    const [lastSaved, setLastSaved] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL;

    // 1. Initial Load from Database
    useEffect(() => {
        const loadTierList = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`${API_URL}/tierlist`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Assuming the backend returns an array of lists, take the first one
                if (res.data && res.data.length > 0) {
                    const list = res.data[0];
                    if (list.tiers) setTiers(list.tiers);
                    if (list.pool) setPool(list.pool);
                    if (list.updatedAt) setLastSaved(new Date(list.updatedAt));
                }
            } catch (error) {
                console.error("Failed to load tier list:", error);
            }
        };

        loadTierList();
        fetchCategory({ id: 'trending', type: 'special' }, 1);
    }, []);

    // 2. Save Strategy
    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to save your ranking");

        setSaveStatus('saving');
        try {
            const res = await axios.post(`${API_URL}/tierlist`, {
                tiers,
                pool,
                name: "My Movie Ranking"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200 || res.status === 201) {
                setSaveStatus('saved');
                setLastSaved(new Date());
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (error) {
            console.error("Save Error:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    };

    // Fetch by category with pagination
    const fetchCategory = async (catObj, page = 1) => {
        setLoading(true);
        setActiveCategory(catObj.id);
        setSearchQuery(''); // Clear search when browsing category
        setCurrentPage(page);

        let url = `${API_URL}/movies/discover?page=${page}&`;
        if (catObj.type === 'special') {
            url += `category=${catObj.id}`;
        } else {
            url += `genreId=${catObj.id}`;
        }

        try {
            const res = await axios.get(url);
            setCategoryMovies(res.data.results || []);
            setTotalPages(res.data.total_pages || 1);
            setTotalResults(res.data.total_results || 0);
            setCurrentPage(res.data.page || 1);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Search for movies directly
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setActiveCategory(null); // Clear category when searching
        setCurrentPage(1);

        try {
            const res = await axios.get(`${API_URL}/movies/search?query=${encodeURIComponent(searchQuery)}`);
            setCategoryMovies(res.data || []);
            setTotalPages(1); // Search doesn't have pagination
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToPool = (movie) => {
        const allRankedIds = new Set([
            ...pool.map(m => m.id),
            ...Object.values(tiers).flat().map(m => m.id)
        ]);

        if (allRankedIds.has(movie.id)) {
            alert("Already in your list!");
            return;
        }
        setPool([...pool, movie]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (activeCategory) {
            const catObj = ALL_CATEGORIES.find(c => c.id === activeCategory);
            if (catObj) {
                fetchCategory(catObj, newPage);
                // Scroll to discover section
                window.scrollTo({ top: 600, behavior: 'smooth' });
            }
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Filter categories based on search input
    const filteredCategories = ALL_CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(categoryFilter.toLowerCase())
    );

    return (
        <div className="pt-10 min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">

                {/* 1. TIER BOARD */}
                <div className="mb-16 mt-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center text-gray-900 dark:text-white drop-shadow-sm transition-colors duration-200">🏆 Your Rankings</h1>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 md:p-6 transition-colors duration-200">
                        <TierBoard tiers={tiers} setTiers={setTiers} pool={pool} setPool={setPool} />
                    </div>
                </div>

                {/* 2. DISCOVER SECTION */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 rounded-3xl shadow-xl transition-all duration-200">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white transition-colors duration-200">
                            🎬 Discover Movies
                        </h2>

                        {/* Direct Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search movies directly..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent rounded-full py-2.5 pl-12 pr-24 outline-none focus:ring-2 focus:ring-pink-500 transition-colors duration-200 shadow-inner"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-pink-600 hover:bg-pink-700 px-5 rounded-full text-white font-semibold transition shadow-md"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Category Filter Input */}
                    <div className="mb-6 relative">
                        <input
                            type="text"
                            placeholder="Filter categories (e.g., action, anime...)"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full md:w-96 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-transparent rounded-full py-3 px-6 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors duration-200 shadow-sm"
                        />
                    </div>

                    {/* Scrollable Category Chips */}
                    <div className="flex flex-wrap gap-2 mb-8 max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {filteredCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => fetchCategory(cat, 1)}
                                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm
                                    ${activeCategory === cat.id
                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:scale-105 border border-gray-200 dark:border-transparent'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {filteredCategories.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6 font-medium bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-8 transition-colors duration-200">No categories match your search.</p>
                    )}

                    {/* Results Header */}
                    {categoryMovies.length > 0 && (
                        <div className="flex justify-between items-center mb-6 px-2 border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-200">
                            <h3 className="text-gray-900 dark:text-white text-xl font-bold transition-colors duration-200">
                                {activeCategory
                                    ? <>{filteredCategories.find(c => c.id === activeCategory)?.label} <span className="text-gray-500 dark:text-gray-400 text-base font-medium ml-2">({totalResults.toLocaleString()} items)</span></>
                                    : `Search results for "${searchQuery}"`}
                            </h3>
                            {activeCategory && totalPages > 1 && (
                                <p className="text-gray-500 dark:text-gray-400 font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm transition-colors duration-200">Page {currentPage} of {totalPages}</p>
                            )}
                        </div>
                    )}

                    {/* Movie Grid */}
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-200">
                            <div className="text-center">
                                <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-medium text-gray-500 dark:text-gray-400">Loading movies...</p>
                            </div>
                        </div>
                    ) : categoryMovies.length > 0 ? (
                        <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5">
                                {categoryMovies.map(movie => (
                                    <div key={movie.id} className="relative group bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110"
                                            alt={movie.title || movie.name}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                            <button
                                                onClick={() => addToPool(movie)}
                                                className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                            >
                                                <div className="bg-gradient-to-tr from-green-500 to-green-400 p-3 rounded-full text-white font-bold shadow-2xl transform hover:scale-110 flex items-center justify-center border-2 border-white dark:border-transparent">
                                                    <Plus size={28} />
                                                </div>
                                            </button>
                                        </div>
                                        <div className="p-2 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                          <p className="text-xs font-bold text-white truncate drop-shadow-md">{movie.title || movie.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {activeCategory && totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-12 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl transition-colors duration-200">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <ChevronLeft size={18} />
                                        Previous
                                    </button>

                                    <div className="flex gap-2">
                                        {getPageNumbers().map((page, idx) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500 dark:text-gray-400 font-bold">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center ${currentPage === page
                                                        ? 'bg-pink-600 text-white scale-110 shadow-pink-500/30'
                                                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
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
                                        className="px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        Next
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-200">
                           <Search size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                           <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                              {searchQuery ? `No results for "${searchQuery}"` : 'Click a category or search to discover movies'}
                           </p>
                        </div>
                    )}
                </div>

            </div>

            {/* FLOATING SAVE BAR */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2 text-white">
                {lastSaved && (
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                        {saveStatus === 'saved' ? 'Saved just now' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-extrabold shadow-xl transition-all transform hover:scale-105 active:scale-95 border-b-4 
                        ${saveStatus === 'saving' ? 'bg-gray-500 border-gray-700 cursor-wait' : 
                          saveStatus === 'saved' ? 'bg-green-500 border-green-700 shadow-green-500/40 text-white' :
                          saveStatus === 'error' ? 'bg-red-500 border-red-700 shadow-red-500/40' : 
                          'bg-indigo-600 hover:bg-indigo-500 border-indigo-800 shadow-indigo-500/40 text-white'}`}
                >
                    {saveStatus === 'saving' ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving Changes...
                        </>
                    ) : saveStatus === 'saved' ? (
                        <>
                            <CheckCircle size={20} />
                            Rankings Saved!
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Rankings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TierListPage;
