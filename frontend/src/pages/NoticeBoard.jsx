import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);
  const [posting, setPosting] = useState(false);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices');
      setNotices(data.notices);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    try {
      await api.post('/notices', { title, content, important });
      setTitle('');
      setContent('');
      setImportant(false);
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notice');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-slate-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-800 mb-6">Notice Board</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {user?.role === 'admin' && (
        <form onSubmit={handlePost} className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-3">
          <h2 className="text-sm font-medium text-slate-700">Post a new notice</h2>
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            required
            rows={3}
            placeholder="Notice content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
            />
            Mark as important (pins to top + emails all residents)
          </label>
          <button
            type="submit"
            disabled={posting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-md"
          >
            {posting ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      )}

      {notices.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-xl">
          No notices posted yet.
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <div
            key={n._id}
            className={`bg-white border rounded-xl p-4 ${
              n.important ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {n.important && <span className="text-amber-600">📌</span>}
                  <h3 className="font-medium text-slate-800">{n.title}</h3>
                </div>
                <p className="text-sm text-slate-600 mt-1">{n.content}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {n.postedBy?.name} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-xs text-red-500 hover:underline flex-shrink-0"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;