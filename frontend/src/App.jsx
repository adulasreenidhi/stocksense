import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { ToastProvider } from './components/common/Toast.jsx';
import AppShell from './components/layout/AppShell.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { checkAuth } from './features/auth/authSlice.js';

function NeutralSplash() {
  return (
    <div className="min-h-screen bg-canvas text-neutral-100 flex flex-col items-center justify-center p-4 selection:bg-accent selection:text-white">
      <div className="relative flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/[0.12] flex items-center justify-center shadow-accent-glow-sm">
          <Boxes className="w-7 h-7 text-accent animate-pulse" />
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-400">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="tracking-widest uppercase">INITIALIZING SESSION...</span>
        </div>
      </div>
    </div>
  );
}

function AnimatedShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(checkAuth())
        .unwrap()
        .then(() => {
          // If the user landed on root "/", send to /dashboard
          if (location.pathname === '/') {
            navigate('/dashboard', { replace: true });
          } else if (location.pathname === '/login' || location.pathname === '/signup') {
            navigate('/dashboard', { replace: true });
          }
        })
        .catch(() => {
          // On 401 or network failure, send to /login unless explicitly on /signup
          if (location.pathname !== '/signup') {
            navigate('/login', { replace: true });
          }
        });
    }
  }, [dispatch, isInitialized]);

  // While refresh check is in-flight, show neutral loading splash
  if (!isInitialized) {
    return <NeutralSplash />;
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage || !accessToken) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AnimatedShell />
      </BrowserRouter>
    </ToastProvider>
  );
}
