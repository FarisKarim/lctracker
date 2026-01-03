const STAGES = {
  0: { label: 'Stage 0', color: 'bg-gray-100 text-gray-600' },
  1: { label: 'Stage 1', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Stage 2', color: 'bg-cyan-100 text-cyan-700' },
  3: { label: 'Stage 3', color: 'bg-violet-100 text-violet-700' },
  4: { label: 'Stage 4', color: 'bg-amber-100 text-amber-700' },
  5: { label: 'Stage 5', color: 'bg-emerald-100 text-emerald-700' },
};

export default function MasteryBadge({ stage }) {
  const { label, color } = STAGES[stage] || STAGES[0];

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${color}`}>
      {label}
    </span>
  );
}
