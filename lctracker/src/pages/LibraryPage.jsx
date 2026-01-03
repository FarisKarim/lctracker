import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsApi } from '../api/client';
import DifficultyBadge from '../components/DifficultyBadge';
import TagChips from '../components/TagChips';
import { formatRelativeDate, getMasteryLabel } from '../utils/formatters';

export default function LibraryPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    status: '',
    sort: 'next_due_date',
  });

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const result = await problemsApi.list(filters);
      setProblems(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await problemsApi.delete(id);
      fetchProblems();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const selectClass =
    'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <span className="text-gray-500">{problems.length} problems</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <input
          type="text"
          name="search"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleFilterChange}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />

        <select
          name="difficulty"
          value={filters.difficulty}
          onChange={handleFilterChange}
          className={selectClass}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="overdue">Overdue</option>
          <option value="due_soon">Due This Week</option>
          <option value="mastered">Mastered</option>
        </select>

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          className={selectClass}
        >
          <option value="next_due_date">Sort by Due Date</option>
          <option value="last_attempted">Sort by Last Attempted</option>
          <option value="difficulty">Sort by Difficulty</option>
          <option value="created_at">Sort by Added Date</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No problems found</p>
          <Link
            to="/add"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add your first problem
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {problems.map((problem) => {
                const isOverdue = new Date(problem.next_due_date) < new Date();
                return (
                  <tr key={problem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link
                        to={`/problem/${problem.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {problem.title}
                      </Link>
                      <div className="mt-1">
                        <TagChips tags={problem.tags.slice(0, 3)} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {getMasteryLabel(problem.mastery_stage)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}
                      >
                        {formatRelativeDate(problem.next_due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/problem/${problem.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm mr-3"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
