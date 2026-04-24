import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getNotifications, markAllRead, markOneRead } from '../api/notifications';
import { formatDate } from '../utils/formatDate';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const typeIcon = {
  new_post:       '📝',
  comment:        '💬',
  follow:         '👤',
  friend_request: '🤝',
  vote:           '⬆️',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => getNotifications().then((r) => r.data.data),
  });

  const handleMarkAll = async () => {
    await markAllRead();
    queryClient.invalidateQueries(['notifications']);
    queryClient.invalidateQueries(['unreadCount']);
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markOneRead(n.id);
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-100">Notifications</h1>
        {data?.some((n) => !n.is_read) && (
          <Button variant="secondary" onClick={handleMarkAll}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-400">You're all caught up!</p>
            <p className="text-gray-600 text-sm mt-1">Notifications from followers will appear here</p>
          </div>
        )}

        {!isLoading && data?.map((n) => (
          <Link
            key={n.id}
            to={n.target_type === 'post' ? `/posts/${n.target_id}` : `/users/${n.actor_username}`}
            onClick={() => handleClick(n)}
            className={`flex items-start gap-4 px-5 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition ${
              !n.is_read ? 'bg-orange-500/5' : ''
            }`}
          >
            <span className="text-2xl shrink-0">{typeIcon[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(n.created_at)}</p>
            </div>
            {!n.is_read && (
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0 mt-1.5" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}