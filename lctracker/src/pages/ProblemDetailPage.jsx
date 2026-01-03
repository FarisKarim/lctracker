import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { problemsApi } from '../api/client';
import DifficultyBadge from '../components/DifficultyBadge';
import TagChips from '../components/TagChips';
import { formatDateTime, formatRelativeDate, getMasteryLabel } from '../utils/formatters';

const OUTCOME_STYLES = {
  PASS: 'bg-green-100 text-green-700',
  SHAKY: 'bg-yellow-100 text-yellow-700',
  FAIL: 'bg-red-100 text-red-700',
  SKIP: 'bg-gray-100 text-gray-700',
  POSTPONE: 'bg-blue-100 text-blue-700',
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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
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
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <TagChips tags={problem.tags} />
          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Open on {problem.platform} →
            </a>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>

      {/* Scheduling Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Scheduling</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">Next Due</span>
            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatRelativeDate(problem.next_due_date)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Interval</span>
            <p className="font-medium text-gray-900">{problem.interval_days} days</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Mastery</span>
            <p className="font-medium text-gray-900">{getMasteryLabel(problem.mastery_stage)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Streak</span>
            <p className="font-medium text-gray-900">{problem.consecutive_successes} passes</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          {!isEditingNotes && (
            <button
              onClick={startEditingNotes}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trick / Key Insight
              </label>
              <textarea
                value={notesForm.notes_trick}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_trick: e.target.value }))
                }
                rows={3}
                placeholder="What's the key insight or trick to solve this problem?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Common Mistakes
              </label>
              <textarea
                value={notesForm.notes_mistakes}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_mistakes: e.target.value }))
                }
                rows={3}
                placeholder="What mistakes did you make or should watch out for?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edge Cases
              </label>
              <textarea
                value={notesForm.notes_edge_cases}
                onChange={(e) =>
                  setNotesForm((prev) => ({ ...prev, notes_edge_cases: e.target.value }))
                }
                rows={3}
                placeholder="What edge cases should you consider?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
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
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
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
                    <span className="text-sm font-medium text-gray-700">Trick / Key Insight:</span>
                    <p className="text-gray-600 mt-1">{problem.notes_trick}</p>
                  </div>
                )}
                {problem.notes_mistakes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Common Mistakes:</span>
                    <p className="text-gray-600 mt-1">{problem.notes_mistakes}</p>
                  </div>
                )}
                {problem.notes_edge_cases && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Edge Cases:</span>
                    <p className="text-gray-600 mt-1">{problem.notes_edge_cases}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">No notes yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </div>

      {/* Log Attempt Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Log Attempt</h2>
        <form onSubmit={handleAttemptSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['PASS', 'SHAKY', 'FAIL', 'SKIP'].map((outcome) => (
              <button
                key={outcome}
                type="button"
                onClick={() => setAttemptForm((prev) => ({ ...prev, outcome }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  attemptForm.outcome === outcome
                    ? OUTCOME_STYLES[outcome] + ' ring-2 ring-offset-2 ring-gray-400'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {OUTCOME_ICONS[outcome]} {outcome}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="w-32">
              <label className="block text-sm text-gray-600 mb-1">Time (min)</label>
              <input
                type="number"
                value={attemptForm.time_spent_minutes}
                onChange={(e) =>
                  setAttemptForm((prev) => ({ ...prev, time_spent_minutes: e.target.value }))
                }
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Notes</label>
              <input
                type="text"
                value={attemptForm.notes}
                onChange={(e) =>
                  setAttemptForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes about this attempt..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Attempt History
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({problem.attempts?.length || 0} attempts)
          </span>
        </h2>

        {!problem.attempts || problem.attempts.length === 0 ? (
          <p className="text-gray-500 text-sm">No attempts logged yet.</p>
        ) : (
          <div className="space-y-2">
            {problem.attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${OUTCOME_STYLES[attempt.outcome]}`}
                  >
                    {OUTCOME_ICONS[attempt.outcome]} {attempt.outcome}
                  </span>
                  {attempt.stage_before !== null && attempt.stage_after !== null && (
                    <span className="text-sm text-gray-600">
                      Stage {attempt.stage_before} → Stage {attempt.stage_after}
                    </span>
                  )}
                  {attempt.next_due_date_after && (
                    <span className="text-sm text-gray-500">
                      Due: {formatRelativeDate(attempt.next_due_date_after)}
                    </span>
                  )}
                  {attempt.time_spent_minutes && (
                    <span className="text-sm text-gray-500">
                      {attempt.time_spent_minutes} min
                    </span>
                  )}
                  {attempt.notes && (
                    <span className="text-sm text-gray-600 italic">{attempt.notes}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap ml-2">
                  {formatDateTime(attempt.attempted_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <Link to="/library" className="inline-block text-indigo-600 hover:text-indigo-800">
        ← Back to Library
      </Link>
    </div>
  );
}
