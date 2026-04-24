import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPost, deletePost } from '../api/posts';
import { getComments } from '../api/comments';
import VoteButtons from '../components/posts/VoteButtons';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { formatDate } from '../utils/formatDate';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id).then((r) => r.data.data),
  });

  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id).then((r) => r.data.data),
  });

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      toast.success('Post deleted');
      queryClient.invalidateQueries(['feed']);
      navigate('/');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  if (postLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-center text-gray-400 py-20">Post not found.</p>;
  }

  const isOwner = user?.id === post.author_id;
  const isMod   = ['admin', 'moderator'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Post */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={post.avatar_url} username={post.username} size="sm" />
          <Link
            to={`/users/${post.username}`}
            className="text-sm text-gray-400 hover:text-orange-400 transition"
          >
            u/{post.username}
          </Link>
          <span className="text-xs text-gray-600">•</span>
          <span className="text-xs text-gray-600">{formatDate(post.created_at)}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-100 mb-3">{post.title}</h1>

        {/* Body */}
        {post.body && (
          <p className="text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {post.body}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <VoteButtons
            targetType="post"
            targetId={post.id}
            initialCount={post.vote_count}
            initialVote={post.user_vote}
          />
          {(isOwner || isMod) && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Comment form */}
      {token ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-200 mb-3">Leave a comment</h3>
          <CommentForm postId={id} onSuccess={refetchComments} />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">
            <Link to="/login" className="text-orange-400 hover:underline">Log in</Link>{' '}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-200 mb-4">
          Comments ({comments?.length || 0})
        </h3>
        <CommentList
          comments={comments}
          loading={commentsLoading}
          postId={id}
          onRefresh={refetchComments}
        />
      </div>
    </div>
  );
}