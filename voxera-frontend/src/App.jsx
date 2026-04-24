import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import { getMe } from './api/auth';

import Layout                from './components/layout/Layout';
import SettingsLayout        from './components/settings/SettingsLayout';
import HomePage              from './pages/HomePage';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';
import PostPage              from './pages/PostPage';
import ProfilePage           from './pages/ProfilePage';
import SearchPage            from './pages/SearchPage';
import NotificationsPage     from './pages/NotificationsPage';
import NotFoundPage          from './pages/NotFoundPage';
import ProfileSettingsPage   from './pages/settings/ProfileSettingsPage';
import PasswordSettingsPage  from './pages/settings/PasswordSettingsPage';
import ReportsSettingsPage   from './pages/settings/ReportsSettingsPage';
import ContactPage           from './pages/settings/ContactPage';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => logout());
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Layout-wrapped routes */}
        <Route path="/" element={<Layout />}>
          <Route index                  element={<HomePage />} />
          <Route path="posts/:id"       element={<PostPage />} />
          <Route path="users/:username" element={<ProfilePage />} />
          <Route path="search"          element={<SearchPage />} />
          <Route path="notifications"   element={<NotificationsPage />} />

          {/* Settings — protected */}
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }
          >
            <Route index           element={<Navigate to="profile" replace />} />
            <Route path="profile"  element={<ProfileSettingsPage />} />
            <Route path="password" element={<PasswordSettingsPage />} />
            <Route path="reports"  element={<ReportsSettingsPage />} />
            <Route path="contact"  element={<ContactPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}