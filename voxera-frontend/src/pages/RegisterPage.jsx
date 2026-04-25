import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, checkUsername, checkEmail } from '../api/auth';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

// ─── Password strength logic ───────────────────────────────────────────────
const getPasswordStrength = (password) => {
  const rules = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    number:   /[0-9]/.test(password),
    special:  /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(rules).filter(Boolean).length;
  return { rules, passed };
};

const strengthConfig = [
  { label: 'Weak',    color: 'bg-red-500',    text: 'text-red-400'    },
  { label: 'Weak',    color: 'bg-red-500',    text: 'text-red-400'    },
  { label: 'Okay',    color: 'bg-orange-500', text: 'text-orange-400' },
  { label: 'Good',    color: 'bg-yellow-500', text: 'text-yellow-400' },
  { label: 'Strong',  color: 'bg-green-500',  text: 'text-green-400'  },
];

// ─── Eye icon components ───────────────────────────────────────────────────
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

// ─── Reusable field wrapper ────────────────────────────────────────────────
function Field({ label, children, status, message }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {children}
      {message && (
        <p className={`text-xs flex items-center gap-1 ${
          status === 'error'   ? 'text-red-400'   :
          status === 'success' ? 'text-green-400' :
          'text-gray-500'
        }`}>
          {status === 'error'   && '✕ '}
          {status === 'success' && '✓ '}
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate       = useNavigate();
  const { setAuth }    = useAuthStore();

  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
  });

  const [showPassword, setShowPassword]       = useState(false);
  const [loading, setLoading]                 = useState(false);

  // Availability states: null = unchecked, true = available, false = taken
  const [usernameStatus, setUsernameStatus]   = useState(null);
  const [emailStatus, setEmailStatus]         = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail]     = useState(false);

  // Debounce timers
  const usernameTimer = useRef(null);
  const emailTimer    = useRef(null);

  // ── Username availability check ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(usernameTimer.current);
    setUsernameStatus(null);

    if (form.username.length < 3) return;

    setCheckingUsername(true);
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await checkUsername(form.username);
        setUsernameStatus(res.data.available);
      } catch {
        setUsernameStatus(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 600); // wait 600ms after user stops typing

    return () => clearTimeout(usernameTimer.current);
  }, [form.username]);

  // ── Email availability check ─────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(emailTimer.current);
    setEmailStatus(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return;

    setCheckingEmail(true);
    emailTimer.current = setTimeout(async () => {
      try {
        const res = await checkEmail(form.email);
        setEmailStatus(res.data.available);
      } catch {
        setEmailStatus(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(emailTimer.current);
  }, [form.email]);

  // ── Password strength ────────────────────────────────────────────────────
  const { rules, passed } = getPasswordStrength(form.password);
  const strength           = form.password.length > 0 ? strengthConfig[passed] : null;

  // ── Form change ──────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block if username or email is taken
    if (usernameStatus === false) return toast.error('Username is already taken');
    if (emailStatus    === false) return toast.error('Email is already in use');

    // Block if password doesn't meet all rules
    if (passed < 4) return toast.error('Please meet all password requirements');

    setLoading(true);
    try {
      const res = await register(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome to Voxera, ${user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Username field status ────────────────────────────────────────────────
  const getUsernameStatus = () => {
    if (form.username.length < 3) return { status: null, message: null };
    if (checkingUsername)         return { status: null, message: 'Checking availability...' };
    if (usernameStatus === true)  return { status: 'success', message: 'Username is available!' };
    if (usernameStatus === false) return { status: 'error',   message: 'Username is already taken' };
    return { status: null, message: null };
  };

  // ── Email field status ───────────────────────────────────────────────────
  const getEmailStatus = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return { status: null, message: null };
    if (checkingEmail)                return { status: null, message: 'Checking availability...' };
    if (emailStatus === true)         return { status: 'success', message: 'Email is available!' };
    if (emailStatus === false)        return { status: 'error',   message: 'Email is already in use' };
    return { status: null, message: null };
  };

  const unStatus  = getUsernameStatus();
  const emStatus  = getEmailStatus();

  // ── Input border color ───────────────────────────────────────────────────
  const inputBorder = (status) => {
    if (status === 'error')   return 'border-red-500   focus:border-red-500';
    if (status === 'success') return 'border-green-500 focus:border-green-500';
    return 'border-gray-700 focus:border-orange-500';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Voxera" className="h-20 w-auto mx-auto" />
          <p className="text-gray-400 mt-2 text-sm">Join the conversation</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-100">Create account</h2>

          {/* ── Username ── */}
          <Field label="Username" {...unStatus}>
            <div className="relative">
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="cooluser123"
                required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 pr-8 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition ${inputBorder(unStatus.status)}`}
              />
              {/* Spinner or check */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUsername && (
                  <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
                {!checkingUsername && usernameStatus === true  && <span className="text-green-400 text-sm">✓</span>}
                {!checkingUsername && usernameStatus === false && <span className="text-red-400 text-sm">✕</span>}
              </div>
            </div>
          </Field>

          {/* ── Email ── */}
          <Field label="Email" {...emStatus}>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 pr-8 text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition ${inputBorder(emStatus.status)}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingEmail && (
                  <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                )}
                {!checkingEmail && emailStatus === true  && <span className="text-green-400 text-sm">✓</span>}
                {!checkingEmail && emailStatus === false && <span className="text-red-400 text-sm">✕</span>}
              </div>
            </div>
          </Field>

          {/* ── Password ── */}
          <Field label="Password">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* ── Strength bar ── */}
            {form.password.length > 0 && (
              <div className="mt-2 space-y-2">
                {/* Bar */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        i < passed
                          ? strength.color
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Label */}
                <p className={`text-xs font-medium ${strength.text}`}>
                  {strength.label}
                </p>

                {/* Rules checklist */}
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { key: 'length',  label: 'At least 8 characters' },
                    { key: 'upper',   label: 'One uppercase letter'   },
                    { key: 'number',  label: 'One number'             },
                    { key: 'special', label: 'One special character'  },
                  ].map(({ key, label }) => (
                    <p
                      key={key}
                      className={`text-xs flex items-center gap-1 transition ${
                        rules[key] ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {rules[key] ? '✓' : '○'} {label}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Field>

          {/* ── Submit ── */}
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={
              loading ||
              usernameStatus === false ||
              emailStatus    === false ||
              (form.password.length > 0 && passed < 4)
            }
          >
            Create account
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}