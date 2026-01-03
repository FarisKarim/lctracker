import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemsApi } from '../api/client';

export default function AddProblemPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    url: '',
    difficulty: 'MEDIUM',
    tags: '',
    notes_trick: '',
    notes_mistakes: '',
    notes_edge_cases: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        title: form.title.trim(),
        url: form.url.trim() || null,
        difficulty: form.difficulty,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        notes_trick: form.notes_trick.trim() || null,
        notes_mistakes: form.notes_mistakes.trim() || null,
        notes_edge_cases: form.notes_edge_cases.trim() || null,
      };

      await problemsApi.create(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Problem</h1>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Two Sum"
            className={inputClass}
          />
        </div>

        {/* URL */}
        <div>
          <label htmlFor="url" className={labelClass}>
            URL
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://leetcode.com/problems/two-sum/"
            className={inputClass}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className={labelClass}>
            Difficulty *
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(comma-separated)</span>
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="arrays, hash-map, two-pointers"
            className={inputClass}
          />
        </div>

        {/* Notes - Trick */}
        <div>
          <label htmlFor="notes_trick" className={labelClass}>
            Trick / Key Insight
          </label>
          <textarea
            id="notes_trick"
            name="notes_trick"
            value={form.notes_trick}
            onChange={handleChange}
            placeholder="Use a hash map to store complement values"
            rows={2}
            className={inputClass}
          />
        </div>

        {/* Notes - Mistakes */}
        <div>
          <label htmlFor="notes_mistakes" className={labelClass}>
            Common Mistakes
          </label>
          <textarea
            id="notes_mistakes"
            name="notes_mistakes"
            value={form.notes_mistakes}
            onChange={handleChange}
            placeholder="Forgot to handle duplicate elements"
            rows={2}
            className={inputClass}
          />
        </div>

        {/* Notes - Edge Cases */}
        <div>
          <label htmlFor="notes_edge_cases" className={labelClass}>
            Edge Cases
          </label>
          <textarea
            id="notes_edge_cases"
            name="notes_edge_cases"
            value={form.notes_edge_cases}
            onChange={handleChange}
            placeholder="Empty array, single element, negative numbers"
            rows={2}
            className={inputClass}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Problem'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
