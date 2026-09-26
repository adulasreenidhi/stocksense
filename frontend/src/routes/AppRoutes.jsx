import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProductsPage from '../pages/ProductsPage.jsx';
import ReceiptsPage from '../pages/ReceiptsPage.jsx';
import DeliveriesPage from '../pages/DeliveriesPage.jsx';
import TransfersPage from '../pages/TransfersPage.jsx';
import AdjustmentsPage from '../pages/AdjustmentsPage.jsx';
import MoveHistoryPage from '../pages/MoveHistoryPage.jsx';
import WarehousesPage from '../pages/WarehousesPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/adjustments" element={<AdjustmentsPage />} />
        <Route path="/move-history" element={<MoveHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['inventory_manager']} />}>
        <Route path="/settings" element={<Navigate to="/settings/warehouses" replace />} />
        <Route path="/settings/warehouses" element={<WarehousesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
