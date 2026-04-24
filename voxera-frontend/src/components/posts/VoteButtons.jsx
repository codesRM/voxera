import { useState } from 'react';
import { castVote } from '../../api/votes';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function VoteButtons({ targetType, targetId, initialCount, initialVote }) {
  const { token } = useAuthStore();
  const [count, setCount]   = useState(initialCount || 0);
  const [myVote, setMyVote] = useState(initialVote || null);

  const handleVote = async (value) => {
    if (!token) {
      toast.error('Login to vote');
      return;
    }

    try {
      const res = await castVote(targetType, targetId, value);
      setCount(res.data.data.vote_count);
      setMyVote(myVote === value ? null : value); // toggle off
    } catch {
      toast.error('Could not register vote');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Upvote */}
      <button
        onClick={() => handleVote('up')}
        className={`p-1 rounded transition text-sm font-bold ${
          myVote === 'up'
            ? 'text-orange-500'
            : 'text-gray-500 hover:text-orange-400'
        }`}
      >
        ▲
      </button>

      <span className={`text-sm font-semibold min-w-[2rem] text-center ${
        myVote === 'up' ? 'text-orange-500' :
        myVote === 'down' ? 'text-blue-400' : 'text-gray-300'
      }`}>
        {count}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote('down')}
        className={`p-1 rounded transition text-sm font-bold ${
          myVote === 'down'
            ? 'text-blue-400'
            : 'text-gray-500 hover:text-blue-400'
        }`}
      >
        ▼
      </button>
    </div>
  );
}