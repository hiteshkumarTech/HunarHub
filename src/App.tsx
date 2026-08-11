import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import { RequireAuth } from './components/RequireAuth';

// Landing and Browse are the highest-traffic entry points, so they load eagerly
// (part of the initial bundle). Everything else is code-split — its JS is only
// fetched when a visitor actually navigates there.
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Favourites = lazy(() => import('./pages/Favourites'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-[13px] font-mono uppercase tracking-widest text-gray-400">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <div className="font-sans">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/marketplace" element={<Marketplace />} />
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
          <Route
            path="/favourites"
            element={
              <RequireAuth role="customer">
                <Favourites />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth role="customer">
                <MyOrders />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
