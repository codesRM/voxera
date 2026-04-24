import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeed } from '../api/posts';
import PostCard from '../components/posts/PostCard';
import FeedTabs from '../components/posts/FeedTabs';
import Spinner from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';

const VALID_TABS = new Set(['home', 'following', 'trending']);

const EMPTY_STATES = {
  home:      { title: 'No posts yet.',                    hint: 'Be the first to post something!' },
  following: { title: 'Nothing from people you follow.',  hint: 'Follow some users to fill this feed.' },
  trending:  { title: 'No trending posts this week.',     hint: 'Check back later.' },
};

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const { token } = useAuthStore();
  const [page, setPage] = useState(1);

  const urlTab = params.get('tab');
  // Prevent stale "following" URLs from fighting the UI after logout.
  const activeTab =
    urlTab === 'following' && !token
      ? 'home'
      : VALID_TABS.has(urlTab)
      ? urlTab
      : 'home';

  const apiArgs = {
    page,
    ...(activeTab === 'following' ? { filter: 'following' } : {}),
    ...(activeTab === 'trending'  ? { sort: 'trending' }    : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', activeTab, page],
    queryFn:  () => getFeed(apiArgs).then((r) => r.data.data),
  });

  const changeTab = (id) => {
    setPage(1);
    const next = new URLSearchParams(params);
    if (id === 'home') next.delete('tab');
    else next.set('tab', id);
    setParams(next, { replace: true });
  };

  const empty = EMPTY_STATES[activeTab];

  return (
    <div className="space-y-4">
      <FeedTabs active={activeTab} onChange={changeTab} />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <p className="text-center text-red-400 py-20">
          Failed to load feed. Make sure your backend is running.
        </p>
      ) : data?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">{empty.title}</p>
          <p className="text-gray-600 text-sm mt-1">{empty.hint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {data?.length > 0 && (
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data?.length < 20}
            className="px-4 py-2 text-sm bg-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
