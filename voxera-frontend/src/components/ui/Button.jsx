import Spinner from './Spinner';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:  'bg-orange-500 hover:bg-orange-600 text-white',
    secondary:'bg-gray-800 hover:bg-gray-700 text-gray-100',
    danger:   'bg-red-600 hover:bg-red-700 text-white',
    ghost:    'hover:bg-gray-800 text-gray-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}