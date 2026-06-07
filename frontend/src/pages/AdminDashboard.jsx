import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    List,
    Star,
    LayoutDashboard,
    Search,
    UserCircle,
    Film,
    Trash2,
    Edit,
    Plus,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalUsers: 0, totalTierLists: 0, totalReviews: 0, totalMovies: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    
    // Tab data states
    const [users, setUsers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Sidebar toggle for mobile
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const token = localStorage.getItem('token');
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const res = await api.get('/admin/dashboard');
                setStats(res.data.stats);
                setRecentUsers(res.data.recentUsers);
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } else if (activeTab === 'movies') {
                const res = await api.get('/admin/movies');
                setMovies(res.data);
            } else if (activeTab === 'reviews') {
                const res = await api.get('/admin/reviews');
                setReviews(res.data);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/user/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleDeleteMovie = async (id) => {
        if (!window.confirm("Are you sure you want to delete this movie?")) return;
        try {
            await api.delete(`/admin/movie/${id}`);
            setMovies(movies.filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete movie');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await api.delete(`/admin/review/${id}`);
            setReviews(reviews.filter(r => r._id !== id));
        } catch (err) {
            alert('Failed to delete review');
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // --- RENDER HELPERS ---
    const renderSidebar = () => (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:relative md:translate-x-0`}>
            <div className="flex items-center justify-between p-6">
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                    Admin
                </h1>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900">
                    <X size={24} />
                </button>
            </div>
            <nav className="mt-6 px-4 space-y-2">
                {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { id: 'users', icon: Users, label: 'Users' },
                    { id: 'movies', icon: Film, label: 'Movies' },
                    { id: 'reviews', icon: Star, label: 'Reviews' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <item.icon size={20} />
                        <span className="font-semibold">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="absolute bottom-6 left-4 right-4">
                 <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl transition-all border border-gray-200">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
                <div className="mt-4 text-center">
                    <button onClick={() => navigate('/')} className="text-xs text-blue-400 hover:text-blue-300 underline">Back to App</button>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Command Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Tier Lists', value: stats.totalTierLists, icon: List, color: 'from-pink-500 to-rose-500' },
                    { label: 'Total Reviews', value: stats.totalReviews, icon: Star, color: 'from-amber-500 to-orange-500' },
                    { label: 'Local Movies', value: stats.totalMovies, icon: Film, color: 'from-emerald-500 to-teal-500' },
                ].map((stat, i) => (
                    <div key={i} className="relative bg-white p-6 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full`}></div>
                        <p className="text-gray-500 text-sm font-medium tracking-wider uppercase mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-bold text-gray-900">{stat.value}</h3>
                        <div className="mt-4 text-gray-400"><stat.icon size={24} /></div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UserCircle className="text-pink-500"/> Recent Signups</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-sm border-b border-gray-200">
                                <th className="pb-3">Username</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentUsers.map(u => (
                                <tr key={u._id}>
                                    <td className="py-3 text-gray-900">{u.username}</td>
                                    <td className="py-3 text-gray-600">{u.email}</td>
                                    <td className="py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full uppercase">{u.role}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-4 rounded-tl-3xl">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 rounded-tr-3xl text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-900">{u.username}</td>
                                <td className="p-4">{u.email}</td>
                                <td className="p-4">{u.role}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="p-8 text-center text-gray-500">No users found.</p>}
            </div>
        </div>
    );

    const renderMovies = () => {
        // Implement Add Movie popup state inside the component if needed, or simple prompts
        const handleAddMovie = async () => {
            const title = prompt("Enter movie title:");
            if (!title) return;
            try {
                const res = await api.post('/admin/movie', { title, customAddedByAdmin: true });
                setMovies([res.data, ...movies]);
            } catch (err) { alert("Failed to add movie"); }
        };

        const handleEditMovie = async (movie) => {
            const title = prompt("Edit title:", movie.title);
            if (!title) return;
            try {
                const res = await api.put(`/admin/movie/${movie._id}`, { title });
                setMovies(movies.map(m => m._id === movie._id ? res.data : m));
            } catch (err) { alert("Failed to update movie"); }
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-900">Manage Movies</h2>
                    <button onClick={handleAddMovie} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-xl text-white font-bold transition-all shadow-lg shadow-pink-500/20">
                        <Plus size={18} /> Add Movie
                    </button>
                </div>
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-4 rounded-tl-3xl">Title</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4 rounded-tr-3xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {movies.map(m => (
                                <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-900">{m.title}</td>
                                    <td className="p-4">{m.voteAverage || 'N/A'}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEditMovie(m)} className="text-blue-500 hover:text-blue-600 bg-blue-50 p-2 rounded-lg transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteMovie(m._id)} className="text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {movies.length === 0 && <p className="p-8 text-center text-gray-500">No custom movies added.</p>}
                </div>
            </div>
        );
    };

    const renderReviews = () => (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Manage Reviews</h2>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-4 rounded-tl-3xl">User</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Comment</th>
                            <th className="p-4 rounded-tr-3xl text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                        {reviews.map(r => (
                            <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-900">{r.user?.username || r.userName || 'Unknown'}</td>
                                <td className="p-4 flex items-center gap-1 text-amber-500"><Star size={14} fill="currentColor"/> {r.rating}</td>
                                <td className="p-4 text-gray-600 max-w-xs truncate">{r.comment}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDeleteReview(r._id)} className="text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && <p className="p-8 text-center text-gray-500">No reviews found.</p>}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 w-full text-gray-900 font-sans">
            {/* Sidebar */}
            {renderSidebar()}
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Topbar for mobile */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
                    <h1 className="text-xl font-bold text-pink-500">Admin</h1>
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500"><Menu size={24} /></button>
                </div>
                
                {/* Content Area */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'movies' && renderMovies()}
                            {activeTab === 'reviews' && renderReviews()}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
