import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, getUserPosts } from '../api/users';
import { followUser, unfollowUser } from '../api/social';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, token } = useAuthStore();
  const queryClient = useQueryClient();
  const meId = me?.id ?? null;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username, meId],
    queryFn: () => getUserProfile(username).then((r) => r.data.data),
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => getUserPosts(username).then((r) => r.data.data),
  });

  const following = !!profile?.is_following;

  const followMut = useMutation({
    mutationFn: () => followUser(profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username, meId] });
      toast.success(`Following ${username}`);
    },
    onError: () => toast.error('Action failed'),
  });

  const unfollowMut = useMutation({
    mutationFn: () => unfollowUser(profile.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username, meId] });
      toast.success(`Unfollowed ${username}`);
    },
    onError: () => toast.error('Action failed'),
  });

  const handleFollow = () => {
    if (!token) return toast.error('Login to follow users');
    (following ? unfollowMut : followMut).mutate();
  };

  const isPending = followMut.isPending || unfollowMut.isPending;

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center text-gray-400 py-20">User not found.</p>;
  }

  const isMe = me?.username === username;

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar_url} username={profile.username} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-100">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm text-gray-400">u/{profile.username}</p>
              <p className="text-xs text-gray-600 capitalize mt-0.5">{profile.role}</p>
            </div>
          </div>

          {/* Follow button */}
          {token && !isMe && (
            <Button
              variant={following ? 'secondary' : 'primary'}
              onClick={handleFollow}
              disabled={isPending}
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-gray-400 mt-4">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-100">{profile.post_count || 0}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-100">{profile.follower_count || 0}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-100">{profile.following_count || 0}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>
      </div>

      {/* User's posts */}
      <h2 className="font-semibold text-gray-300">Posts by u/{username}</h2>

      {postsLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : posts?.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
