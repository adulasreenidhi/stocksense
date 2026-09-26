import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Wraps manager-only routes. Usage: <Route element={<ProtectedRoute roles={['inventory_manager']} />}>
export default function ProtectedRoute({ roles }) {
  const { user, accessToken } = useSelector((state) => state.auth);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
