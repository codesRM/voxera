import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-gray-400 text-lg mb-6">This page doesn't exist.</p>
      <Link
        to="/"
        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
      >
        Go Home
      </Link>
    </div>
  );
}