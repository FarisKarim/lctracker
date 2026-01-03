const colors = {
  EASY: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
  MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  HARD: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${colors[difficulty] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
    >
      {difficulty}
    </span>
  );
}
