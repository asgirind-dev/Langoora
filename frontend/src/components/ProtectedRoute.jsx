import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a global loading spinner while Firebase resolves authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d1f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 1. Redirect unauthenticated users straight to the login page
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Route restriction for tutors whose accounts are still pending admin verification
  if (user.role === 'tutor' && user.status === 'pending') {
    if (location.pathname !== '/auth/under-review') {
      return <Navigate to="/auth/under-review" replace />;
    }
  }

  // 3. Prevent approved users from manually revisiting the under-review screen
  if (user.status === 'approved' && location.pathname === '/auth/under-review') {
    return <Navigate to={user.role === 'tutor' ? '/tutor' : '/student'} replace />;
  }

  // 4. Enforce role-based access control rules across workspace dashboards
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'tutor' ? '/tutor' : '/student'} replace />;
  }

  // Render the requested core workspace layout nodes if all validation gates pass
  return children;
}