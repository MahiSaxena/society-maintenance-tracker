import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Lift', 'Parking', 'Noise', 'Other'];

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please describe the issue');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      if (photo) formData.append('photo', photo);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c3a]/30 focus:border-[#0f4c3a]';

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Raise a Complaint</h1>
      <p className="text-slate-500 text-sm mb-6">
        Describe the issue and optionally attach a photo for context.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 border-t-4 border-t-[#0f4c3a] rounded-2xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Photo (optional)</label>
          <div className="mt-1.5 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-slate-600"
            />
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
          {preview && (
            <img src={preview} alt="Preview" className="mt-3 h-32 rounded-lg border border-slate-200 object-cover" />
          )}
        </div>

        {error && <p className="text-rose-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0f4c3a] hover:bg-[#0c3d2e] disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default RaiseComplaint;