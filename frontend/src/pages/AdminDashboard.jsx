import { useEffect, useState } from 'react';
import api from '../api/client';

const StatCard = ({ label, value, accent }) => (
  <div className={`bg-white border border-slate-200 border-l-4 ${accent} rounded-2xl shadow-sm p-5`}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-1 text-slate-900">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-10 text-rose-600 text-sm">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Overview of complaint activity across the society.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Complaints" value={stats.total} accent="border-l-slate-400" />
        <StatCard label="Open" value={stats.byStatus.Open} accent="border-l-amber-400" />
        <StatCard label="In Progress" value={stats.byStatus['In Progress']} accent="border-l-teal-500" />
        <StatCard label="Resolved" value={stats.byStatus.Resolved} accent="border-l-emerald-500" />
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-rose-700">
          <strong className="text-base">{stats.overdueCount}</strong> complaint{stats.overdueCount !== 1 ? 's' : ''} currently
          overdue (open longer than {stats.overdueThresholdDays} day
          {stats.overdueThresholdDays !== 1 ? 's' : ''})
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">By Category</h2>
        <div className="space-y-2">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-600">{category}</span>
              <span className="font-semibold text-slate-800">{count}</span>
            </div>
          ))}
          {Object.keys(stats.byCategory).length === 0 && (
            <p className="text-slate-400 text-sm">No complaints yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;