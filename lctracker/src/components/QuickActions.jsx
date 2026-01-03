import { useState } from 'react';
import { problemsApi } from '../api/client';

const ACTIONS = [
  { outcome: 'PASS', icon: '✅', label: 'Pass', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/60' },
  { outcome: 'SHAKY', icon: '🟨', label: 'Shaky', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', hoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/60' },
  { outcome: 'FAIL', icon: '❌', label: 'Fail', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', hoverBg: 'hover:bg-red-200 dark:hover:bg-red-900/60' },
  { outcome: 'POSTPONE', icon: '📅', label: 'Later', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/60' },
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
