import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import RaiseComplaint from './pages/RaiseComplaint';
import MyComplaints from './pages/MyComplaints';
import NoticeBoard from './pages/NoticeBoard';

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
            <ProtectedRoute role="resident">
              <MyComplaints />
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
      </Routes>
    </>
  );
}

export default App;