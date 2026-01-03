const STAGES = {
  0: { label: 'Stage 0', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  1: { label: 'Stage 1', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
  2: { label: 'Stage 2', color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300' },
  3: { label: 'Stage 3', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' },
  4: { label: 'Stage 4', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
  5: { label: 'Stage 5', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
};

export default function MasteryBadge({ stage }) {
  const { label, color } = STAGES[stage] || STAGES[0];

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${color}`}>
      {label}
    </span>
  );
}
