import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UnderReviewPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToLogin = async () => {
    // Clear session and route user back to login entrypoint
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6 text-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md border border-yellow-600/30">
        <div className="text-yellow-500 text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold mb-3 text-yellow-400">Account Under Review</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Thank you for registering as an Academic Tutor on Langoora! Your academic certificates and credentials are currently being reviewed by our Academic Validators.
        </p>
        <div className="bg-gray-900/50 p-3 rounded text-xs text-gray-500 mb-6 border border-gray-700">
          Status: <span className="text-yellow-500 font-semibold uppercase">Pending Approval</span>
        </div>
        <button 
          onClick={handleBackToLogin}
          className="w-full bg-gray-700 hover:bg-gray-600 transition p-2.5 rounded font-medium text-sm text-gray-200"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}