import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const TABS = [
  { id: 'home',      label: 'Home' },
  { id: 'following', label: 'Following', authRequired: true },
  { id: 'trending',  label: 'Trending' },
];

export default function FeedTabs({ active, onChange }) {
  const { token } = useAuthStore();

  const handleCommunity = () =>
    toast('Communities are coming soon!', { icon: '🚧' });

  return (
    <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const locked   = t.authRequired && !token;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => !locked && onChange(t.id)}
              disabled={locked}
              title={locked ? 'Log in to see posts from people you follow' : undefined}
              className={`px-3 py-1.5 text-sm rounded-md transition whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white font-medium'
                  : locked
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={handleCommunity}
        className="flex items-center gap-1 text-sm border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-white px-3 py-1.5 rounded-md transition whitespace-nowrap"
      >
        <span className="text-base leading-none">+</span> Community
      </button>
    </div>
  );
}
