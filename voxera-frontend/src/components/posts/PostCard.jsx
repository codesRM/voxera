import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import VoteButtons from './VoteButtons';
import { formatDate } from '../../utils/formatDate';

export default function PostCard({ post }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center pt-1">
          <VoteButtons
            targetType="post"
            targetId={post.id}
            initialCount={post.vote_count}
            initialVote={post.user_vote}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.avatar_url} username={post.username} size="sm" />
            <Link
              to={`/users/${post.username}`}
              className="text-xs text-gray-400 hover:text-orange-400 transition"
            >
              u/{post.username}
            </Link>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-600">{formatDate(post.created_at)}</span>
          </div>

          {/* Title */}
          <Link to={`/posts/${post.id}`}>
            <h2 className="text-base font-semibold text-gray-100 hover:text-orange-400 transition leading-snug mb-1">
              {post.title}
            </h2>
          </Link>

          {/* Body preview */}
          {post.body && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{post.body}</p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4">
            <Link
              to={`/posts/${post.id}`}
              className="text-xs text-gray-500 hover:text-gray-300 transition"
            >
              💬 {post.comment_count || 0} comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}