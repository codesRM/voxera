import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/posts';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export default function CreatePostModal({ open, onClose }) {
  const [form, setForm] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setForm({ title: '', body: '' });
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    setLoading(true);
    try {
      await createPost(form);
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
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition"
            >
              Cancel
            </button>
            <Button type="submit" loading={loading}>Post</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
