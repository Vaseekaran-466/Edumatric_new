import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // If auth check is still pending AND we have no cached user at all,
    // show a spinner. This only happens on a true first-ever visit with no
    // session cache. If sessionStorage has a user, this block is skipped
    // entirely and content is displayed immediately.
    if (loading && !user) {
        return (
            <div className="min-h-screen bg-brand-background flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Auth check is done (or we have a cached user) and no user exists.
    // This is the only moment we redirect to login.
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access a wrong route
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
        if (user.role === 'student') return <Navigate to="/student" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
