const statusStyles = {
  Open: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
};

const priorityStyles = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
    {status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority] || ''}`}>
    {priority}
  </span>
);

export const OverdueBadge = () => (
  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
    ⏰ Overdue
  </span>
);