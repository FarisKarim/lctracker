import { Link } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';
import MasteryBadge from './MasteryBadge';
import TagChips from './TagChips';
import QuickActions from './QuickActions';
import { formatRelativeDate } from '../utils/formatters';

export default function ProblemCard({ problem, onAction, showActions = true }) {
  const isOverdue = new Date(problem.next_due_date) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/problem/${problem.id}`}
              className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
            >
              {problem.title}
            </Link>
            <DifficultyBadge difficulty={problem.difficulty} />
            <MasteryBadge stage={problem.mastery_stage} />
          </div>

          <TagChips tags={problem.tags} />

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {problem.last_attempted_at && (
              <span>
                Last: {formatRelativeDate(problem.last_attempted_at)}
              </span>
            )}
            <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
              Due: {formatRelativeDate(problem.next_due_date)}
            </span>
          </div>
        </div>

        {showActions && (
          <QuickActions problemId={problem.id} onAction={onAction} />
        )}
      </div>
    </div>
  );
}
