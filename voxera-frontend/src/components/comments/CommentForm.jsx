import { useState } from 'react';
import { createComment } from '../../api/comments';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function CommentForm({ postId, parentId = null, onSuccess }) {
  const [body, setBody]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      await createComment(postId, { body, parent_id: parentId });
      setBody('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply...' : 'Add a comment...'}
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
      />
      <div className="flex justify-end">
        <Button type="submit" loading={loading} disabled={!body.trim()}>
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}