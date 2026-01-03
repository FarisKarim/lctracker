import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { problemsApi } from '../api/client';
import DifficultyBadge from '../components/DifficultyBadge';
import TagChips from '../components/TagChips';
import { formatDateTime, formatRelativeDate, getMasteryLabel } from '../utils/formatters';

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

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attemptForm, setAttemptForm] = useState({
    outcome: 'PASS',
    time_spent_minutes: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesForm, setNotesForm] = useState({
    notes_trick: '',
    notes_mistakes: '',
    notes_edge_cases: '',
  });
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchProblem = async () => {
    try {
      const result = await problemsApi.get(id);
      setProblem(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleAttemptSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await problemsApi.logAttempt(id, {
        outcome: attemptForm.outcome,
        time_spent_minutes: attemptForm.time_spent_minutes
          ? parseInt(attemptForm.time_spent_minutes)
          : null,
        notes: attemptForm.notes.trim() || null,
      });

      setAttemptForm({ outcome: 'PASS', time_spent_minutes: '', notes: '' });
      fetchProblem();
    } catch (err) {
      alert('Failed to log attempt: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await problemsApi.delete(id);
      navigate('/library');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const startEditingNotes = () => {
    setNotesForm({
      notes_trick: problem.notes_trick || '',
      notes_mistakes: problem.notes_mistakes || '',
      notes_edge_cases: problem.notes_edge_cases || '',
    });
    setIsEditingNotes(true);
  };

  const cancelEditingNotes = () => {
    setIsEditingNotes(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await problemsApi.update(id, {
        notes_trick: notesForm.notes_trick.trim() || null,
        notes_mistakes: notesForm.notes_mistakes.trim() || null,
        notes_edge_cases: notesForm.notes_edge_cases.trim() || null,
      });
      setIsEditingNotes(false);
      fetchProblem();
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        Error: {error || 'Problem not found'}
      </div>
    );
  }

  const isOverdue = new Date(problem.next_due_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <TagChips tags={problem.tags} />
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
            >
              Open on {problem.platform} →
            </a>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
        >
          Delete
        </button>
      </div>

      {/* Scheduling Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Scheduling</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Next Due</span>
            <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {formatRelativeDate(problem.next_due_date)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Interval</span>
            <p className="font-medium text-gray-900 dark:text-white">{problem.interval_days} days</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Mastery</span>
            <p className="font-medium text-gray-900 dark:text-white">{getMasteryLabel(problem.mastery_stage)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Streak</span>
            <p className="font-medium text-gray-900 dark:text-white">{problem.consecutive_successes} passes</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          {!isEditingNotes && (
            <button
              onClick={startEditingNotes}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Trick / Key Insight
              </label>
              <textarea
                value={notesForm.notes_trick}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_trick: e.target.value }))
                }
                rows={3}
                placeholder="What's the key insight or trick to solve this problem?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Common Mistakes
              </label>
              <textarea
                value={notesForm.notes_mistakes}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_mistakes: e.target.value }))
                }
                rows={3}
                placeholder="What mistakes did you make or should watch out for?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Edge Cases
              </label>
              <textarea
                value={notesForm.notes_edge_cases}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_edge_cases: e.target.value }))
                }
                rows={3}
                placeholder="What edge cases should you consider?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
              <button
                onClick={cancelEditingNotes}
                disabled={savingNotes}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {problem.notes_trick || problem.notes_mistakes || problem.notes_edge_cases ? (
              <>
                {problem.notes_trick && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Trick / Key Insight:</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{problem.notes_trick}</p>
                  </div>
                )}
                {problem.notes_mistakes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Common Mistakes:</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{problem.notes_mistakes}</p>
                  </div>
                )}
                {problem.notes_edge_cases && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Edge Cases:</span>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{problem.notes_edge_cases}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No notes yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </div>

      {/* Log Attempt Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Log Attempt</h2>
        <form onSubmit={handleAttemptSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['PASS', 'SHAKY', 'FAIL', 'SKIP'].map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => setAttemptForm((prev) => ({ ...prev, outcome }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  attemptForm.outcome === outcome
                    ? OUTCOME_STYLES[outcome] + ' ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {OUTCOME_ICONS[outcome]} {outcome}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="w-32">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Time (min)</label>
              <input
                type="number"
                value={attemptForm.time_spent_minutes}
                onChange={(e) =>
                  setAttemptForm((prev) => ({ ...prev, time_spent_minutes: e.target.value }))
                }
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Notes</label>
              <input
                type="text"
                value={attemptForm.notes}
                onChange={(e) =>
                  setAttemptForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes about this attempt..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Logging...' : 'Log Attempt'}
          </button>
        </form>
      </div>

      {/* Attempt History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Attempt History
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
            ({problem.attempts?.length || 0} attempts)
          </span>
        </h2>

        {!problem.attempts || problem.attempts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No attempts logged yet.</p>
        ) : (
          <div className="space-y-2">
            {problem.attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${OUTCOME_STYLES[attempt.outcome]}`}
                  >
                    {OUTCOME_ICONS[attempt.outcome]} {attempt.outcome}
                  </span>
                  {attempt.stage_before !== null && attempt.stage_after !== null && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Stage {attempt.stage_before} → Stage {attempt.stage_after}
                    </span>
                  )}
                  {attempt.next_due_date_after && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {formatRelativeDate(attempt.next_due_date_after)}
                    </span>
                  )}
                  {attempt.time_spent_minutes && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {attempt.time_spent_minutes} min
                    </span>
                  )}
                  {attempt.notes && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 italic">{attempt.notes}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                  {formatDateTime(attempt.attempted_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <Link to="/library" className="inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
        ← Back to Library
      </Link>
    </div>
  );
}
