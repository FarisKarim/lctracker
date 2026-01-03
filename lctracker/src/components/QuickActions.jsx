import { useState } from 'react';
import { problemsApi } from '../api/client';

const ACTIONS = [
  { outcome: 'PASS', icon: '✅', label: 'Pass', bg: 'bg-green-100', text: 'text-green-700', hoverBg: 'hover:bg-green-200' },
  { outcome: 'SHAKY', icon: '🟨', label: 'Shaky', bg: 'bg-yellow-100', text: 'text-yellow-700', hoverBg: 'hover:bg-yellow-200' },
  { outcome: 'FAIL', icon: '❌', label: 'Fail', bg: 'bg-red-100', text: 'text-red-700', hoverBg: 'hover:bg-red-200' },
  { outcome: 'POSTPONE', icon: '📅', label: 'Later', bg: 'bg-blue-100', text: 'text-blue-700', hoverBg: 'hover:bg-blue-200' },
];

export default function QuickActions({ problemId, onAction }) {
  const [loading, setLoading] = useState(null);
  const [hovered, setHovered] = useState(null);

  const handleAction = async (outcome) => {
    setLoading(outcome);
    try {
      if (outcome === 'POSTPONE') {
        await problemsApi.postpone(problemId);
      } else {
        await problemsApi.logAttempt(problemId, { outcome });
      }
      onAction?.();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed: ' + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {ACTIONS.map(({ outcome, icon, label, bg, text, hoverBg }) => (
        <button
          key={outcome}
          onClick={() => handleAction(outcome)}
          onMouseEnter={() => setHovered(outcome)}
          onMouseLeave={() => setHovered(null)}
          disabled={loading}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-150 disabled:opacity-50 ${bg} ${text} ${hoverBg} hover:scale-110`}
        >
          {loading === outcome ? '...' : hovered === outcome ? label : icon}
        </button>
      ))}
    </div>
  );
}
