import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user || user.role !== 'admin') {
        console.warn("🚫 Access denied: User is not an admin");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
