import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import TutorLayout from './layouts/TutorLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import PricingPage from './pages/public/PricingPage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import UnderReviewPage from './pages/auth/UnderReviewPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MarketplacePage from './pages/student/MarketplacePage';
import MyExamsPage from './pages/student/MyExamsPage';
import PerformancePage from './pages/student/PerformancePage';
import SubscriptionPage from './pages/student/SubscriptionPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import SettingsPage from './pages/student/SettingsPage';
import ExamPreviewPage from './pages/student/ExamPreviewPage';
import ExamTakePage from './pages/student/ExamTakePage';
import ExamResultsPage from './pages/student/ExamResultsPage';

// Tutor Pages
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorExamsPage from './pages/tutor/TutorExamsPage';
import CreateExamPage from './pages/tutor/CreateExamPage';
import TutorEarningsPage from './pages/tutor/TutorEarningsPage';
import TutorProfilePage from './pages/tutor/TutorProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import TutorApprovalsPage from './pages/admin/TutorApprovalsPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// PROTECTED ROUTE GUARD COMPONENT
// Enforces role-based authentication rules according to system business rules
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  // If user session is not active, force redirect to login view context
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Enforce validation gate: If user role is not explicitly authorized, fallback to default public interface
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};



function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/exam/:id/preview" element={<ExamPreviewPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="under-review" element={<UnderReviewPage />} />
        </Route>

        {/* Exam Interface (fullscreen, no layout wrapper) */}
        <Route path="/exam/:id/take" element={<ExamTakePage />} />
        <Route path="/exam/:id/results" element={<ExamResultsPage />} />

        {/* Student Dashboard Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="exams" element={<MyExamsPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Tutor Dashboard Routes */}
        <Route path="/tutor" element={<TutorLayout />}>
          <Route index element={<TutorDashboard />} />
          <Route path="exams" element={<TutorExamsPage />} />
          <Route path="create" element={<CreateExamPage />} />
          <Route path="earnings" element={<TutorEarningsPage />} />
          <Route path="analytics" element={<TutorDashboard />} />
          <Route path="reviews" element={<TutorDashboard />} />
          <Route path="profile" element={<TutorProfilePage />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="approvals" element={<TutorApprovalsPage />} />
          <Route path="exams" element={<AdminDashboard />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="logs" element={<AuditLogsPage />} />
          <Route path="security" element={<AuditLogsPage />} />
        </Route>

        {/* Catch-all redirect */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
