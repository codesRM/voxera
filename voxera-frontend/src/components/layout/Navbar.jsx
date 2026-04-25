import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { logout } from '../../api/auth';
import SearchBar from '../search/SearchBar';
import NotificationBell from '../notifications/NotificationBell';
import CreatePostModal from '../posts/CreatePostModal';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, token, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    clearAuth();
    queryClient.clear();
    toast.success('Logged out');
    navigate('/login');
    setMenuOpen(false);
    setAvatarOpen(false);
  };

  const openCreate = () => {
    setCreateOpen(true);
    setMenuOpen(false);
    setAvatarOpen(false);
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="w-full px-4 h-16 flex items-center gap-4">
          {/* ✅ Logo — enlarged + Voxera text beside it */}
          <Link to="/" className="flex items-center gap-2 shrink-0 pl-0">
            <img
              src="/logo.png"
              alt="Voxera"
              className="h-16 w-auto"
            />
            <span className="text-xl font-bold text-orange-500 tracking-tight hidden sm:block">
              Voxera
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

           {/* ✅ Desktop nav — maximized spacing pushed to far right */}
          <div className="hidden sm:flex items-center gap-4 shrink-0 ml-auto pr-0">
            {token ? (
              <>
                {/* Create button */}
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  <span className="text-base leading-none">+</span> Create
                </button>

                <NotificationBell />

                {/* Avatar + dropdown menu */}
                <div className="relative" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen((o) => !o)}
                    className="flex items-center hover:opacity-80 transition"
                    aria-label="Open account menu"
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-700 hover:border-orange-500 transition"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold border-2 border-gray-700 hover:border-orange-400 transition">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {avatarOpen && (
                    <div className="absolute right-0 top-11 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-800">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-100 truncate">
                          u/{user?.username}
                        </p>
                      </div>
                      <Link
                        to={`/users/${user?.username}`}
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                      >
                        👤 View Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setAvatarOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                      >
                        ⚙️ Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition border-t border-gray-800"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-gray-400 hover:text-white transition"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-1">
            {token ? (
              <>
                <button
                  onClick={openCreate}
                  className="block w-full text-left py-2 text-sm text-orange-400 hover:text-orange-300"
                >
                  ＋ Create post
                </button>
                <Link to={`/users/${user?.username}`} onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-300 hover:text-white">
                  👤 Account settings
                </Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-300 hover:text-white">
                  🔔 Notifications
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-300 hover:text-white">
                  ⚙️ Settings
                </Link>
                <button onClick={handleLogout}
                  className="block w-full text-left py-2 text-sm text-red-400 hover:text-red-300">
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-gray-300 hover:text-white">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-orange-400 hover:text-orange-300">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
