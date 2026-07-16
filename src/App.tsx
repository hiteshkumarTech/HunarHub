import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <div className="font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth role="entrepreneur">
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
