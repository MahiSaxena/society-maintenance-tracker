const statusStyles = {
  Open: 'bg-amber-50 text-amber-700 border border-amber-200',
  'In Progress': 'bg-teal-50 text-teal-700 border border-teal-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const priorityStyles = {
  Low: 'bg-slate-100 text-slate-600 border border-slate-200',
  Medium: 'bg-orange-50 text-orange-700 border border-orange-200',
  High: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || ''}`}>
    {status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityStyles[priority] || ''}`}>
    {priority}
  </span>
);

export const OverdueBadge = () => (
  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white">
    ⏰ Overdue
  </span>
);