import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery]     = useState('');
  const [focused, setFocused] = useState(false);
  const navigate              = useNavigate();
  const inputRef              = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className={`flex items-center bg-gray-800 border rounded-lg px-3 py-1.5 gap-2 transition ${
        focused ? 'border-orange-500' : 'border-gray-700'
      }`}>
           {/* ✅ Voxera logo on far left inside search bar */}
        <img
          src="/logo.png"
          alt="Voxera"
          className="h-5 w-auto shrink-0 opacity-60"
        />

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600 shrink-0" />
        
        {/* Search icon */}
        <svg
          className="w-4 h-4 text-gray-400 shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search posts, users..."
          className="bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none w-full"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-gray-500 hover:text-gray-300 transition"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}