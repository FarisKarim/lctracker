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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>

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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <span className="text-3xl font-bold text-indigo-600">
              {stats.attempts_last_7_days}
            </span>
            <p className="text-gray-500">attempts in the last 7 days</p>
          </div>
          <div>
            <span className="text-3xl font-bold text-indigo-600">
              {stats.attempts_last_30_days}
            </span>
            <p className="text-gray-500">attempts in the last 30 days</p>
          </div>
        </div>
      </div>

      {/* Weak Tags */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Weak Areas
          <span className="text-sm font-normal text-gray-500 ml-2">
            (tags with {'>'} 40% fail rate)
          </span>
        </h2>

        {stats.weak_tags.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">💪</span>
            <p className="text-gray-600">No weak areas identified!</p>
            <p className="text-gray-500 text-sm">
              Keep practicing to maintain your skills.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.weak_tags.map((tag) => (
              <div
                key={tag.tag}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-white text-gray-700 rounded text-sm font-medium">
                    {tag.tag}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tag.total_attempts} attempts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${tag.fail_rate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    {Math.round(tag.fail_rate * 100)}% fail
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-6">
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">
          Spaced Repetition Tips
        </h2>
        <ul className="text-indigo-700 space-y-1 text-sm">
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
            ? 'bg-red-50 border-red-200'
            : 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span
        className={`text-2xl font-bold ${
          highlight ? (danger ? 'text-red-600' : 'text-indigo-600') : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
