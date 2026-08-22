import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-xl">🏢</span> Society Tracker
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            {user.role === 'resident' && (
              <>
                <Link to="/" className="text-slate-600 hover:text-blue-600">My Complaints</Link>
                <Link to="/raise" className="text-slate-600 hover:text-blue-600">Raise Complaint</Link>
                <Link to="/notices" className="text-slate-600 hover:text-blue-600">Notice Board</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/" className="text-slate-600 hover:text-blue-600">Complaints</Link>
                <Link to="/admin/dashboard" className="text-slate-600 hover:text-blue-600">Dashboard</Link>
                <Link to="/notices" className="text-slate-600 hover:text-blue-600">Notice Board</Link>
              </>
            )}
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{user.name} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;