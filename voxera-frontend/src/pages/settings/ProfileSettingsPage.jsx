import { useState, useRef } from 'react';
import { updateProfile } from '../../api/users';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    display_name: user?.display_name || '',
    bio:          user?.bio          || '',
  });
  const [preview, setPreview]       = useState(user?.avatar_url || null);
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle file selection — show preview immediately
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview instantly
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Upload to backend
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(res.data.data);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreview(user?.avatar_url || null); // revert preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Profile Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Update your public profile information</p>
      </div>

      {/* Avatar upload */}
      <div className="flex items-center gap-5">
        {/* Avatar preview */}
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-700">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Camera overlay button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-lg transition disabled:opacity-50"
          >
            {uploading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Upload info */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-orange-400 hover:text-orange-300 transition font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Change photo'}
          </button>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF or WebP — max 2MB</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username read-only */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">Username</label>
          <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed">
            {user?.username}
          </div>
          <p className="text-xs text-gray-600">Username cannot be changed</p>
        </div>

        <Input
          label="Display Name"
          name="display_name"
          value={form.display_name}
          onChange={handleChange}
          placeholder="How you want to appear"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell the community about yourself..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}