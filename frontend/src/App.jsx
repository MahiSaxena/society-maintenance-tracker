import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

// Temporary placeholder home page — we'll replace this with the real
// resident/admin pages in the next steps.
const Home = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-800">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-slate-500 mt-2">
        You're logged in as a <strong>{user?.role}</strong>. Real pages coming next.
      </p>
    </div>
  );
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;