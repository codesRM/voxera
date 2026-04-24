import { useState } from 'react';
import { updateProfile } from '../../api/users';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Eye icons
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.318-3.95M6.5 6.5A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.132 5.411M3 3l18 18" />
  </svg>
);

// Reusable password input with show/hide toggle
function PasswordInput({ label, name, value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordSettingsPage() {
  const [form, setForm] = useState({
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    if (form.new_password !== form.confirm_password) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await updateProfile({
        current_password: form.current_password,
        new_password:     form.new_password,
      });
      toast.success('Password updated!');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Change Password</h2>
        <p className="text-sm text-gray-500 mt-1">Keep your account secure with a strong password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Current Password"
          name="current_password"
          value={form.current_password}
          onChange={handleChange}
          placeholder="Enter your current password"
          required
        />
        <PasswordInput
          label="New Password"
          name="new_password"
          value={form.new_password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          required
        />
        <PasswordInput
          label="Confirm New Password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          placeholder="Repeat your new password"
          required
        />

        {/* Password strength hint */}
        {form.new_password.length > 0 && (
          <div className="text-xs space-y-1 bg-gray-800 rounded-lg p-3">
            <p className={form.new_password.length >= 8 ? 'text-green-400' : 'text-red-400'}>
              {form.new_password.length >= 8 ? '✅' : '❌'} At least 8 characters
            </p>
            <p className={/[A-Z]/.test(form.new_password) ? 'text-green-400' : 'text-gray-500'}>
              {/[A-Z]/.test(form.new_password) ? '✅' : '○'} One uppercase letter
            </p>
            <p className={/[0-9]/.test(form.new_password) ? 'text-green-400' : 'text-gray-500'}>
              {/[0-9]/.test(form.new_password) ? '✅' : '○'} One number
            </p>
          </div>
        )}

        {/* Match indicator */}
        {form.confirm_password.length > 0 && (
          <p className={`text-xs ${form.new_password === form.confirm_password ? 'text-green-400' : 'text-red-400'}`}>
            {form.new_password === form.confirm_password ? '✅ Passwords match' : '❌ Passwords do not match'}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>Update Password</Button>
        </div>
      </form>
    </div>
  );
}