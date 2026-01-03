const colors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${colors[difficulty] || 'bg-gray-100 text-gray-800'}`}
    >
      {difficulty}
    </span>
  );
}
