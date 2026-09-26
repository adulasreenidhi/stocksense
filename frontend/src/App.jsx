import { BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function Shell() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) return <AppRoutes />;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <AppRoutes />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
