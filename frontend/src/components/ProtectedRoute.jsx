import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth(); // Extracted 'role' from global context state instance
  const location = useLocation();

  // Show a global loading spinner while Firebase resolves authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d1f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // GATE 1: Redirect unauthenticated users straight to the centralized login view
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // GATE 2: Route restriction for tutors whose profiles are still pending structural admin/validator verification
  if (role === 'tutor' && user.status === 'pending') {
    if (location.pathname !== '/auth/under-review') {
      return <Navigate to="/auth/under-review" replace />;
    }
  }

  // GATE 3: Prevent approved production consumers from manually revisiting the under-review screen backyards
  if (user.status === 'approved' && location.pathname === '/auth/under-review') {
    // Dynamic fallbacks matching correct workspace layouts
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'validator') return <Navigate to="/validator" replace />;
    return <Navigate to={role === 'tutor' ? '/tutor' : '/student'} replace />;
  }

  // GATE 4: Enforce granular Role-Based Access Control (RBAC) rules across workspace nodes
  // If the logged-in user's role is not included in the allowedRoles array, block access and redirect
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'validator') return <Navigate to="/validator" replace />;
    return <Navigate to={role === 'tutor' ? '/tutor' : '/student'} replace />;
  }

  // Render the requested core workspace layout nodes safely if all structural firewall validation gates pass
  return children;
}