import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) return null;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-500">
          RankMyList
        </Link>
        <div className="flex gap-6 text-gray-600 dark:text-gray-300 font-medium items-center">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition">Home</Link>
          <Link to="/foryou" className="hover:text-pink-500 dark:hover:text-pink-400 transition flex items-center gap-1">
            <span className="text-pink-500 dark:text-pink-400">✨</span> For You
          </Link>
          <Link to="/search" className="hover:text-gray-900 dark:hover:text-white transition">Search</Link>
          <Link to="/tierlist" className="hover:text-gray-900 dark:hover:text-white transition">Tier List</Link>
          <Link to="/mylist" className="hover:text-gray-900 dark:hover:text-white transition">My Library</Link>
          {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'admin' && (
            <Link to="/admin" className="text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 font-bold border-l border-gray-300 dark:border-gray-700 pl-6 transition">
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="text-sm bg-red-600/20 text-red-500 dark:text-red-400 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;