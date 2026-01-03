import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyApi } from '../api/client';
import DifficultyBadge from '../components/DifficultyBadge';
import { formatDateTime } from '../utils/formatters';

const OUTCOME_STYLES = {
  PASS: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  SHAKY: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  FAIL: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  SKIP: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  POSTPONE: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
};

const OUTCOME_ICONS = {
  PASS: '✅',
  SHAKY: '🟨',
  FAIL: '❌',
  SKIP: '⏭️',
  POSTPONE: '📅',
};

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outcomeFilter, setOutcomeFilter] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await historyApi.get({
        limit: 100,
        outcome: outcomeFilter || undefined,
      });
      setAttempts(result.attempts);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [outcomeFilter]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          History
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({total} attempts)
          </span>
        </h1>

        <select
          value={outcomeFilter}
          onChange={(e) => setOutcomeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Outcomes</option>
          <option value="PASS">Pass</option>
          <option value="SHAKY">Shaky</option>
          <option value="FAIL">Fail</option>
          <option value="SKIP">Skip</option>
          <option value="POSTPONE">Postpone</option>
        </select>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No attempts recorded yet.</p>
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mt-2 inline-block">
            Go to Today to start practicing
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {attempts.map((attempt) => (
              <Link
                key={attempt.id}
                to={`/problem/${attempt.problem_id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {attempt.problem_title}
                      </span>
                      <DifficultyBadge difficulty={attempt.problem_difficulty} />
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-sm font-medium whitespace-nowrap ${OUTCOME_STYLES[attempt.outcome]}`}
                  >
                    {OUTCOME_ICONS[attempt.outcome]} {attempt.outcome}
                  </span>

                  {attempt.stage_before !== null && attempt.stage_after !== null && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      Stage {attempt.stage_before} → {attempt.stage_after}
                    </span>
                  )}

                  {attempt.time_spent_minutes && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {attempt.time_spent_minutes} min
                    </span>
                  )}
                </div>

                <span className="text-sm text-gray-400 dark:text-gray-500 ml-4 whitespace-nowrap">
                  {formatDateTime(attempt.attempted_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
