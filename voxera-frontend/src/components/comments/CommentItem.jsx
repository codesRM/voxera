import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import VoteButtons from '../posts/VoteButtons';
import CommentForm from './CommentForm';
import { formatDate } from '../../utils/formatDate';
import useAuthStore from '../../store/authStore';

export default function CommentItem({ comment, postId, onRefresh }) {
  const { token } = useAuthStore();
  const [showReply, setShowReply] = useState(false);
  const [imgExpanded, setImgExpanded] = useState(false);

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
          <span className="text-xs text-gray-600">
            {formatDate(comment.created_at)}
          </span>
        </div>

        {/* Body text */}
        {comment.body && (
          <p className="text-sm text-gray-300 mb-2">{comment.body}</p>
        )}

        {/* ✅ Comment image */}
        {comment.image_url && (
          <div className="mb-2">
            <img
              src={comment.image_url}
              alt="Comment image"
              loading="lazy"
              onClick={() => setImgExpanded(!imgExpanded)}
              className={`rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition object-cover ${
                imgExpanded
                  ? 'w-full max-h-[500px]'
                  : 'max-h-48 max-w-xs'
              }`}
            />
            <p className="text-xs text-gray-600 mt-1">
              {imgExpanded ? 'Click to collapse' : 'Click to expand'}
            </p>
          </div>
        )}

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
              onSuccess={() => {
                setShowReply(false);
                onRefresh?.();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}