import { useEffect, useState } from 'react';
import api from '../api/client';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Parking', 'Noise', 'Other'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const statusAccent = {
  Open: 'border-l-amber-400',
  'In Progress': 'border-l-teal-500',
  Resolved: 'border-l-emerald-500',
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({ category: '', status: '' });
  const [noteDrafts, setNoteDrafts] = useState({});

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/complaints', { params });
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleStatusChange = async (id, status) => {
    try {
      const note = noteDrafts[id] || '';
      const { data } = await api.patch(`/complaints/${id}/status`, { status, note });
      setComplaints((prev) => prev.map((c) => (c._id === id ? data.complaint : c)));
      setNoteDrafts((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      const { data } = await api.patch(`/complaints/${id}/priority`, { priority });
      setComplaints((prev) => prev.map((c) => (c._id === id ? data.complaint : c)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update priority');
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">All Complaints</h1>
      <p className="text-slate-500 text-sm mb-6">Manage and track every complaint raised by residents.</p>

      <div className="flex gap-3 mb-6">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

      {complaints.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl">
          No complaints match these filters.
        </div>
      )}

      <div className="space-y-3">
        {complaints.map((c) => (
          <div
            key={c._id}
            className={`bg-white border border-slate-200 border-l-4 ${statusAccent[c.status]} rounded-2xl shadow-sm p-4`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-slate-800">{c.category}</span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                  {c.overdue && <OverdueBadge />}
                </div>
                <p className="text-sm text-slate-600">{c.description}</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  {c.resident?.name} ({c.resident?.flatNumber || 'no flat'}) · Raised{' '}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              {c.photoUrl && (
                <img
                  src={c.photoUrl}
                  alt="Complaint"
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>

            {c.status !== 'Resolved' && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex gap-2 flex-wrap items-center">
                  <select
                    value={c.priority}
                    onChange={(e) => handlePriorityChange(c._id, e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p} priority</option>)}
                  </select>

                  <input
                    placeholder="Optional note..."
                    value={noteDrafts[c._id] || ''}
                    onChange={(e) => setNoteDrafts({ ...noteDrafts, [c._id]: e.target.value })}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs flex-1 min-w-[150px]"
                  />

                  {STATUSES.filter((s) => s !== c.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(c._id, s)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#edf5f2] hover:bg-[#dcebe5] text-[#0f4c3a] transition-colors"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
              className="text-xs text-[#0f4c3a] font-medium hover:underline mt-3"
            >
              {expandedId === c._id ? 'Hide history' : 'View history'}
            </button>

            {expandedId === c._id && (
              <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
                {c.history.slice().reverse().map((h, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#0f4c3a] flex-shrink-0" />
                    <div>
                      <p className="text-slate-700">
                        <StatusBadge status={h.status} />{' '}
                        <span className="text-slate-500">by {h.changedByName}</span>
                      </p>
                      {h.note && <p className="text-slate-500 text-xs mt-0.5">{h.note}</p>}
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(h.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaints;