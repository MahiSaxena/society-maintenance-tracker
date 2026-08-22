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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-[#0f4c3a] flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-[#edf5f2] flex items-center justify-center text-lg">
            🏢
          </span>
          Society Tracker
        </Link>

        {user && (
          <div className="flex items-center gap-5 text-sm">
            {user.role === 'resident' && (
              <>
                <Link to="/" className="text-slate-600 hover:text-[#0f4c3a] font-medium">My Complaints</Link>
                <Link to="/raise" className="text-slate-600 hover:text-[#0f4c3a] font-medium">Raise Complaint</Link>
                <Link to="/notices" className="text-slate-600 hover:text-[#0f4c3a] font-medium">Notice Board</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/" className="text-slate-600 hover:text-[#0f4c3a] font-medium">Complaints</Link>
                <Link to="/admin/dashboard" className="text-slate-600 hover:text-[#0f4c3a] font-medium">Dashboard</Link>
                <Link to="/notices" className="text-slate-600 hover:text-[#0f4c3a] font-medium">Notice Board</Link>
              </>
            )}
            <span className="text-slate-200">|</span>
            <span className="text-slate-500">{user.name} <span className="text-slate-400">({user.role})</span></span>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
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