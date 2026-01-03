import { useState, useEffect } from 'react';
import { todayApi } from '../api/client';
import ProblemCard from '../components/ProblemCard';

export default function TodayPage() {
  const [data, setData] = useState({ due: [], new: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const result = await todayApi.get();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      {/* Due Today Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span>
          Due Today
          {data.due.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-sm">
              {data.due.length}
            </span>
          )}
        </h2>

        {data.due.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <span className="text-4xl mb-2 block">🎉</span>
            <p className="text-green-700 font-medium">All caught up!</p>
            <p className="text-green-600 text-sm">No problems due for review today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.due.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onAction={fetchData}
              />
            ))}
          </div>
        )}
      </section>

      {/* Optional New Section */}
      {data.new.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>✨</span>
            New Problems
            <span className="text-sm font-normal text-gray-500">
              (never attempted)
            </span>
          </h2>
          <div className="space-y-3">
            {data.new.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onAction={fetchData}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
