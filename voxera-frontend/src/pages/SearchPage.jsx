import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAll } from '../api/search';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query).then((r) => r.data),
    enabled: query.length >= 2,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">
          Search results for{' '}
          <span className="text-orange-400">"{query}"</span>
        </h1>
        {data && (
          <p className="text-sm text-gray-500 mt-1">
            {data.data.total} result{data.data.total !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-center text-red-400 py-10">
          Search failed. Make sure your backend is running.
        </p>
      )}

      {/* No results */}
      {data && data.data.total === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No results found.</p>
          <p className="text-gray-600 text-sm mt-1">Try a different keyword.</p>
        </div>
      )}

      {data && data.data.total > 0 && (
        <>
          {/* Users section */}
          {data.data.users.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Users
              </h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                {data.data.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/users/${user.username}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800 transition"
                  >
                    <Avatar
                      src={user.avatar_url}
                      username={user.username}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-100">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        u/{user.username} · {user.follower_count || 0} followers
                      </p>
                      {user.bio && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts section */}
          {data.data.posts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Posts
              </h2>
              <div className="space-y-3">
                {data.data.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}