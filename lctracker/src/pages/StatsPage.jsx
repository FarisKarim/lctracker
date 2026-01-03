import { useState, useEffect } from 'react';
import { statsApi } from '../api/client';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await statsApi.get();
        setStats(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Problems"
          value={stats.total_problems}
          icon="📚"
        />
        <StatCard
          label="Due Today"
          value={stats.due_today}
          icon="📋"
          highlight={stats.due_today > 0}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon="⚠️"
          highlight={stats.overdue > 0}
          danger
        />
        <StatCard
          label="Attempts (7d)"
          value={stats.attempts_last_7_days}
          icon="📈"
        />
      </div>

      {/* Attempts Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.attempts_last_7_days}
            </span>
            <p className="text-gray-500 dark:text-gray-400">attempts in the last 7 days</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.attempts_last_30_days}
            </span>
            <p className="text-gray-500 dark:text-gray-400">attempts in the last 30 days</p>
          </div>
        </div>
      </div>

      {/* Weak Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weak Areas
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            (tags with {'>'} 40% fail rate)
          </span>
        </h2>

        {stats.weak_tags.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">💪</span>
            <p className="text-gray-600 dark:text-gray-300">No weak areas identified!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Keep practicing to maintain your skills.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.weak_tags.map((tag) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded text-sm font-medium">
                    {tag.tag}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tag.total_attempts} attempts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${tag.fail_rate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {Math.round(tag.fail_rate * 100)}% fail
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          Spaced Repetition Tips
        </h2>
        <ul className="text-indigo-700 dark:text-indigo-400 space-y-1 text-sm">
          <li>• Review problems when they're due for optimal retention</li>
          <li>• Mark problems as "Shaky" if you needed hints or took too long</li>
          <li>• Focus on weak areas to improve faster</li>
          <li>• Consistency beats intensity - a few problems daily is better than cramming</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false, danger = false }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        highlight
          ? danger
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <span
        className={`text-2xl font-bold ${
          highlight ? (danger ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400') : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
