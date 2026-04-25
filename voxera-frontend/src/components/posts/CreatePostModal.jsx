import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/posts';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export default function CreatePostModal({ open, onClose }) {
  const [form, setForm]         = useState({ title: '', body: '' });
  const [image, setImage]       = useState(null);   // File object
  const [preview, setPreview]   = useState(null);   // Local preview URL
  const [loading, setLoading]   = useState(false);
  const fileInputRef            = useRef(null);
  const queryClient             = useQueryClient();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm({ title: '', body: '' });
      setImage(null);
      setPreview(null);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB');
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    setLoading(true);
    try {
      await createPost({
        title: form.title,
        body:  form.body,
        image: image || undefined,  // pass File object if selected
      });
      toast.success('Post created!');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="font-semibold text-gray-100">Create a Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <Input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            autoFocus
            required
          />

          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="What's on your mind? (optional)"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-700">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
              >
                ×
              </button>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between pt-1">
            {/* Image picker button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-400 transition"
              >
                {/* Camera icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {image ? 'Change photo' : 'Add photo'}
              </button>

              {/* File size hint */}
              {!image && (
                <span className="text-xs text-gray-600">Max 5MB</span>
              )}

              {/* File name if selected */}
              {image && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  {image.name}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition"
              >
                Cancel
              </button>
              <Button type="submit" loading={loading}>Post</Button>
            </div>
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
      </div>
    </div>
  );
}