import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getUnreadCount, getNotifications, markAllRead, markOneRead } from '../../api/notifications';
import { formatDate } from '../../utils/formatDate';
import Spinner from '../ui/Spinner';

const typeIcon = {
  new_post:       '📝',
  comment:        '💬',
  follow:         '👤',
  friend_request: '🤝',
  vote:           '⬆️',
};

export default function NotificationBell() {
  const [open, setOpen]     = useState(false);
  const ref                 = useRef(null);
  const queryClient         = useQueryClient();

  // Unread count — polls every 30s
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn:  () => getUnreadCount().then((r) => r.data.data.count),
    refetchInterval: 30000,
  });

  // Notifications list — only fetched when dropdown opens
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => getNotifications().then((r) => r.data.data),
    enabled:  open,
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllRead();
    queryClient.invalidateQueries(['unreadCount']);
    queryClient.invalidateQueries(['notifications']);
  };

  const handleClickNotification = async (n) => {
    if (!n.is_read) {
      await markOneRead(n.id);
      queryClient.invalidateQueries(['unreadCount']);
      queryClient.invalidateQueries(['notifications']);
    }
    setOpen(false);
  };

  const unread = unreadData || 0;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-gray-400 hover:text-gray-100 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <h3 className="font-semibold text-gray-100 text-sm">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-orange-400 hover:text-orange-300 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}

            {!isLoading && (!notifications || notifications.length === 0) && (
              <div className="text-center py-10">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}

            {!isLoading && notifications?.map((n) => (
              <Link
                key={n.id}
                to={n.target_type === 'post' ? `/posts/${n.target_id}` : `/users/${n.actor_username}`}
                onClick={() => handleClickNotification(n)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition border-b border-gray-800/50 last:border-0 ${
                  !n.is_read ? 'bg-orange-500/5' : ''
                }`}
              >
                {/* Icon */}
                <span className="text-lg shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(n.created_at)}</p>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-1.5" />
                )}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 px-4 py-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-orange-400 hover:text-orange-300 transition"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}