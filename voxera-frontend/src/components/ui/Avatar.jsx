export default function Avatar({ src, username, size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  // Fallback — first letter of username
  const letter = username?.charAt(0).toUpperCase() || '?';
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'];
  const color  = colors[letter.charCodeAt(0) % colors.length];

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold text-white shrink-0`}>
      {letter}
    </div>
  );
}