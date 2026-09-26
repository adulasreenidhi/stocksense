import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/receipts', label: 'Receipts' },
  { to: '/deliveries', label: 'Delivery Orders' },
  { to: '/transfers', label: 'Internal Transfers' },
  { to: '/adjustments', label: 'Stock Adjustments' },
  { to: '/move-history', label: 'Move History' },
];

const MANAGER_ONLY_NAV = [{ to: '/settings/warehouses', label: 'Warehouses (Settings)' }];

export default function Sidebar() {
  const role = useSelector((state) => state.auth.user?.role);
  const items = role === 'inventory_manager' ? [...NAV, ...MANAGER_ONLY_NAV] : NAV;

  return (
    <aside className="w-56 shrink-0 border-r h-screen p-4">
      <div className="font-bold mb-6">StockSense</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm ${isActive ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/profile" className="px-3 py-2 rounded text-sm hover:bg-gray-100 mt-4">
          My Profile
        </NavLink>
      </nav>
    </aside>
  );
}
