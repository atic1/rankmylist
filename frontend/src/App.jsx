import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Register from './pages/SignUp'
import Login from './pages/Login'
import Home from './pages/Home'
import Search from './pages/Search'
import MovieDetails from './pages/MovieDetails'
import TierListPage from './pages/TierListPage'
import MyListPage from './pages/MyListPage'
import CategoryDetailsPage from './pages/CategoryDetailsPage'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import ForYouPage from './pages/ForYouPage'
import { ThemeProvider } from './context/ThemeContext'
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col transition-colors duration-200">
      {!isAdminRoute && <Navbar />}
      
      <div className="flex-grow flex w-full">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tierlist" element={
            <ProtectedRoute>
              <TierListPage />
            </ProtectedRoute>
          } />
          <Route path="/mylist" element={
            <ProtectedRoute>
              <MyListPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/foryou" element={
            <ProtectedRoute>
              <ForYouPage />
            </ProtectedRoute>
          } />
          <Route path="/category/:categoryId" element={<CategoryDetailsPage />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App