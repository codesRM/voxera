import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { logout } from '../../api/auth';
import toast from 'react-hot-toast';

const links = [
  { to: '/settings/profile',  label: '👤 Profile' },
  { to: '/settings/password', label: '🔒 Password' },
  { to: '/settings/reports',  label: '🚩 My Reports' },
  { to: '/settings/contact',  label: '📬 Contact Us' },
];

export default function SettingsLayout() {
  const { logout: clearAuth } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try { await logout(); } catch (_) {}
    clearAuth();
    queryClient.clear();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 min-h-[60vh]">
      {/* Sidebar */}
      <aside className="w-full sm:w-56 shrink-0">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
          </div>

          <nav className="py-2">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-400 font-medium'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-800 py-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition"
            >
              <span>{dark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${dark ? 'bg-orange-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition"
            >
              🚪 Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}