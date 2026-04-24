import { useState } from 'react';
import Avatar from '../ui/Avatar';
import VoteButtons from '../posts/VoteButtons';
import CommentForm from './CommentForm';
import { formatDate } from '../../utils/formatDate';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function CommentItem({ comment, postId, onRefresh }) {
  const { token } = useAuthStore();
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="flex gap-3">
      <Avatar src={comment.avatar_url} username={comment.username} size="sm" />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/users/${comment.username}`}
            className="text-xs font-semibold text-gray-300 hover:text-orange-400 transition"
          >
            u/{comment.username}
          </Link>
          <span className="text-xs text-gray-600">{formatDate(comment.created_at)}</span>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-300 mb-2">{comment.body}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <VoteButtons
            targetType="comment"
            targetId={comment.id}
            initialCount={comment.vote_count}
            initialVote={comment.user_vote}
          />
          {token && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-gray-500 hover:text-gray-300 transition"
            >
              {showReply ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReply && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={() => { setShowReply(false); onRefresh?.(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}