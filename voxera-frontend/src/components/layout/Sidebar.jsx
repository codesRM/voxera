import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Sidebar() {
  const { token } = useAuthStore();

  return (
    <div className="space-y-4">
      {/* About Voxera */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="font-bold text-orange-500 mb-2">Voxera</h2>
        <p className="text-sm text-gray-400 mb-4">
          A community platform to share ideas, discuss topics, and connect with others.
        </p>
        {!token && (
          <div className="space-y-2">
            <Link
              to="/register"
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="block w-full text-center border border-gray-700 hover:border-gray-500 text-sm font-medium py-2 rounded-lg transition"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
