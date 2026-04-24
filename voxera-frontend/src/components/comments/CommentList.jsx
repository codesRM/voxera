import CommentItem from './CommentItem';
import Spinner from '../ui/Spinner';

export default function CommentList({ comments, loading, postId, onRefresh }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        No comments yet. Be the first!
      </p>
    );
  }

  // Separate top-level and replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies  = comments.filter((c) => c.parent_id);

  return (
    <div className="space-y-4">
      {topLevel.map((comment) => (
        <div key={comment.id}>
          <CommentItem comment={comment} postId={postId} onRefresh={onRefresh} />
          {/* Nested replies */}
          <div className="ml-10 mt-3 space-y-3 border-l border-gray-800 pl-4">
            {replies
              .filter((r) => r.parent_id === comment.id)
              .map((reply) => (
                <CommentItem key={reply.id} comment={reply} postId={postId} onRefresh={onRefresh} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}