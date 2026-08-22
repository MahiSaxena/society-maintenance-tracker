import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RaiseComplaint from './pages/RaiseComplaint';
import MyComplaints from './pages/MyComplaints';
import NoticeBoard from './pages/NoticeBoard';
import AdminComplaints from './pages/AdminComplaints';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

// Shows the right "home" page depending on who's logged in
const Home = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminComplaints />;
  return <MyComplaints />;
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
        <Route
          path="/raise"
          element={
            <ProtectedRoute role="resident">
              <RaiseComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notices"
          element={
            <ProtectedRoute>
              <NoticeBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;