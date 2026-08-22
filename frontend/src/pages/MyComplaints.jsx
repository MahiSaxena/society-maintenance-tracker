import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';

const statusAccent = {
  Open: 'border-l-amber-400',
  'In Progress': 'border-l-teal-500',
  Resolved: 'border-l-emerald-500',
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get('/complaints/mine');
        setComplaints(data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
        <Link
          to="/raise"
          className="bg-[#0f4c3a] hover:bg-[#0c3d2e] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + Raise Complaint
        </Link>
      </div>
      <p className="text-slate-500 text-sm mb-6">Track your reported issues and their progress.</p>

      {error && <p className="text-rose-600 text-sm mb-4">{error}</p>}

      {complaints.length === 0 && !error && (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl">
          No complaints yet. Raised issues will show up here.
        </div>
      )}

      <div className="space-y-3">
        {complaints.map((c) => (
          <div
            key={c._id}
            className={`bg-white border border-slate-200 border-l-4 ${statusAccent[c.status]} rounded-2xl shadow-sm p-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-slate-800">{c.category}</span>
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                  {c.overdue && <OverdueBadge />}
                </div>
                <p className="text-sm text-slate-600">{c.description}</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Raised {new Date(c.createdAt).toLocaleDateString()}
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

export default MyComplaints;