import { useState, useEffect } from 'react';
import { statsApi, problemsApi } from '../api/client';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [masteryDistribution, setMasteryDistribution] = useState(null);
  const [difficultyDistribution, setDifficultyDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResult, problemsResult] = await Promise.all([
          statsApi.get(),
          problemsApi.list(),
        ]);
        setStats(statsResult);

        // Aggregate mastery distribution (API returns array directly)
        const mastery = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const difficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
        problemsResult.forEach((p) => {
          mastery[p.mastery_stage] = (mastery[p.mastery_stage] || 0) + 1;
          difficulty[p.difficulty] = (difficulty[p.difficulty] || 0) + 1;
        });
        setMasteryDistribution(mastery);
        setDifficultyDistribution(difficulty);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {masteryDistribution && (
          <MasteryChart distribution={masteryDistribution} />
        )}
        {difficultyDistribution && (
          <DifficultyChart distribution={difficultyDistribution} />
        )}
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

const MASTERY_STAGES = [
  { stage: 0, label: 'New', color: 'bg-red-500', lightBg: 'bg-red-100 dark:bg-red-900/30' },
  { stage: 1, label: 'Learning', color: 'bg-orange-500', lightBg: 'bg-orange-100 dark:bg-orange-900/30' },
  { stage: 2, label: 'Familiar', color: 'bg-yellow-500', lightBg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { stage: 3, label: 'Comfortable', color: 'bg-lime-500', lightBg: 'bg-lime-100 dark:bg-lime-900/30' },
  { stage: 4, label: 'Proficient', color: 'bg-green-500', lightBg: 'bg-green-100 dark:bg-green-900/30' },
  { stage: 5, label: 'Mastered', color: 'bg-emerald-600', lightBg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

function MasteryChart({ distribution }) {
  const maxCount = Math.max(...Object.values(distribution), 1);
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Mastery Distribution
      </h2>
      <div className="space-y-3">
        {MASTERY_STAGES.map(({ stage, label, color, lightBg }) => {
          const count = distribution[stage] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 dark:text-gray-400 shrink-0">
                {label}
              </div>
              <div className={`flex-1 h-8 ${lightBg} rounded-lg overflow-hidden`}>
                <div
                  className={`h-full ${color} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${barWidth}%`, minWidth: count > 0 ? '2rem' : '0' }}
                >
                  {count > 0 && (
                    <span className="text-xs font-medium text-white">{count}</span>
                  )}
                </div>
              </div>
              <div className="w-12 text-right text-sm text-gray-500 dark:text-gray-400 shrink-0">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DIFFICULTY_CONFIG = [
  { key: 'EASY', label: 'Easy', color: '#22c55e', darkColor: '#4ade80' },
  { key: 'MEDIUM', label: 'Medium', color: '#eab308', darkColor: '#facc15' },
  { key: 'HARD', label: 'Hard', color: '#ef4444', darkColor: '#f87171' },
];

function DifficultyChart({ distribution }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  // Calculate stroke-dasharray values for donut chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;
  const segments = DIFFICULTY_CONFIG.map(({ key, color }) => {
    const count = distribution[key] || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const dashLength = (percentage / 100) * circumference;
    const dashOffset = circumference - (cumulativePercentage / 100) * circumference;
    cumulativePercentage += percentage;
    return { key, color, dashLength, dashOffset, count, percentage };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Difficulty Breakdown
      </h2>
      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Segments */}
            {segments.map(({ key, color, dashLength, dashOffset }) => (
              <circle
                key={key}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6">
          {DIFFICULTY_CONFIG.map(({ key, label, color }) => {
            const count = distribution[key] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
