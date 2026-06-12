import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext'; 

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import TutorLayout from './layouts/TutorLayout';
import AdminLayout from './layouts/AdminLayout';
import ValidatorLayout from './layouts/AcademicValidatorLayout'; 

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
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import SystemSecurity from './pages/admin/SystemSecurity'; 

// Academic Validator Pages 
import AcademicValidatorDashboard from './pages/validator/AcademicValidatorDashboard';
import TutorVerificationPage from './pages/validator/TutorVerificationPage';
import ContentDisputePage from './pages/validator/ContentDisputePage';
import ExamQualityAuditsPage from './pages/validator/ExamQualityAuditsPage';

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

        {/* Exam Interface */}
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
          <Route path="exams" element={<AdminDashboard />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="logs" element={<AuditLogsPage />} />
          <Route path="security" element={<SystemSecurity />} /> 
        </Route>

        {/* Academic Validator Dashboard Routes */}
        <Route path="/validator" element={<ValidatorLayout />}>
          <Route index element={<AcademicValidatorDashboard />} />
          <Route path="tutor-verification" element={<TutorVerificationPage />} />
          <Route path="content-disputes" element={<ContentDisputePage />} />
          <Route path="quality-audits" element={<ExamQualityAuditsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;