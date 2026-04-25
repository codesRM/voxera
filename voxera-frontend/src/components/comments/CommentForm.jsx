import { useRef, useState } from 'react';
import { createComment } from '../../api/comments';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function CommentForm({ postId, parentId = null, onSuccess }) {
  const [body, setBody]       = useState('');
  const [image, setImage]     = useState(null);    // File object
  const [preview, setPreview] = useState(null);    // Local preview URL
  const [loading, setLoading] = useState(false);
  const fileInputRef          = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB');
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Must have either text or image
    if (!body.trim() && !image) {
      return toast.error('Please write something or add an image');
    }

    setLoading(true);
    try {
      await createComment(postId, {
        body:      body || undefined,
        parent_id: parentId,
        image:     image || undefined,
      });
      setBody('');
      setImage(null);
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Text input */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? 'Write a reply...' : 'Add a comment...'}
        rows={3}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
      />

      {/* Image preview */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden border border-gray-700">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition"
          >
            ×
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Image picker */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {image ? 'Change photo' : 'Add photo'}
        </button>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          disabled={!body.trim() && !image}
        >
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleImageChange}
        className="hidden"
      />
    </form>
  );
}