import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../../features/auth/authSlice';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownHeader,
  DropdownSeparator,
} from '../common/Dropdown';
import Badge from '../common/Badge';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  SlidersHorizontal,
  History,
  Settings,
  Warehouse,
  Search,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Read actual user from auth state — no hardcoded mock fallback
  const user = useSelector((state) => state.auth?.user);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll responsiveness for condensation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isOperationsActive = [
    '/receipts',
    '/deliveries',
    '/transfers',
    '/adjustments',
  ].some((path) => location.pathname.startsWith(path));

  const isSettingsActive = location.pathname.startsWith('/settings');

  const navLinkClass = ({ isActive }) =>
    `relative px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 select-none ${
      isActive
        ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-accent text-white shadow-accent-glow-sm'
        : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
    }`;

  const isManager = user?.role === 'inventory_manager';

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-7xl mx-auto pt-3 sm:pt-4">
          {/* Floating Glassmorphic Pill Dock with Framer Motion scroll condensation */}
          <motion.div
            layout
            animate={{
              height: isScrolled ? 58 : 72,
              backgroundColor: isScrolled
                ? 'rgba(10, 10, 13, 0.94)'
                : 'rgba(14, 15, 18, 0.82)',
              boxShadow: isScrolled
                ? '0 20px 48px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 0 24px -2px rgba(255, 122, 51, 0.12)'
                : '0 12px 40px -8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 20px -2px rgba(255, 122, 51, 0.08)',
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full rounded-2xl sm:rounded-full backdrop-blur-2xl flex items-center justify-between px-3.5 sm:px-6 relative"
          >
            {/* Scrim highlight line across top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent pointer-events-none rounded-t-2xl sm:rounded-t-full" />

            {/* LEFT: Brand Logo & Status indicator */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2.5 group transition-transform active:scale-95"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/[0.12] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:border-accent/60 group-hover:shadow-accent-glow-sm transition-all duration-300">
                  <Boxes className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-200" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white leading-none">
                      STOCKSENSE
                    </span>
                    <span className="hidden md:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent/20 text-[#FF7A33] border border-accent/30 uppercase tracking-widest leading-none">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 tracking-wider hidden sm:block">
                    CENTRAL INV • WH-01
                  </span>
                </div>
              </NavLink>

              <div className="hidden lg:block h-6 w-px bg-white/[0.08]" />

              {/* PRIMARY DESKTOP NAVIGATION LINKS */}
              <nav className="hidden md:flex items-center gap-1">
                {/* Dashboard */}
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>

                {/* Operations Dropdown */}
                <Dropdown>
                  <DropdownTrigger
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 select-none flex items-center gap-1.5 cursor-pointer ${
                      isOperationsActive
                        ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>Operations</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </DropdownTrigger>
                  <DropdownContent width="w-64" align="left">
                    <DropdownHeader
                      title="Inventory Operations"
                      subtitle="Inbound, Outbound & Internal stock flow"
                    />
                    <DropdownItem
                      icon={ArrowDownLeft}
                      onClick={() => navigate('/receipts')}
                      badge={<Badge size="sm" variant="success">IN</Badge>}
                    >
                      Receipts (Inbound)
                    </DropdownItem>
                    <DropdownItem
                      icon={ArrowUpRight}
                      onClick={() => navigate('/deliveries')}
                      badge={<Badge size="sm" variant="accent">OUT</Badge>}
                    >
                      Deliveries (Outbound)
                    </DropdownItem>
                    <DropdownItem
                      icon={Repeat}
                      onClick={() => navigate('/transfers')}
                    >
                      Internal Transfers
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem
                      icon={SlidersHorizontal}
                      onClick={() => navigate('/adjustments')}
                      badge={<Badge size="sm" variant="warning">AUDIT</Badge>}
                    >
                      Stock Adjustments
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>

                {/* Products */}
                <NavLink to="/products" className={navLinkClass}>
                  Products
                </NavLink>

                {/* Move History */}
                <NavLink to="/move-history" className={navLinkClass}>
                  Move History
                </NavLink>

                {/* Settings Dropdown - Only available for Managers */}
                {isManager && (
                  <Dropdown>
                    <DropdownTrigger
                      className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 select-none flex items-center gap-1.5 cursor-pointer ${
                        isSettingsActive
                          ? 'text-white bg-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>Settings</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </DropdownTrigger>
                    <DropdownContent width="w-56" align="left">
                      <DropdownHeader title="System Configuration" />
                      <DropdownItem
                        icon={Warehouse}
                        onClick={() => navigate('/settings/warehouses')}
                        badge={<Badge size="sm" variant="neutral">WH</Badge>}
                      >
                        Warehouses
                      </DropdownItem>
                      <DropdownItem
                        icon={Building2}
                        onClick={() => navigate('/settings/warehouses')}
                      >
                        Location Nodes
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                )}
              </nav>
            </div>

            {/* RIGHT: Quick Search, Alert bell, Profile avatar & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Search Trigger (Desktop) */}
              <div className="relative hidden lg:flex items-center">
                <div className="relative flex items-center group">
                  <Search className="absolute left-3 w-4 h-4 text-neutral-400 group-focus-within:text-accent transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Quick search SKU / receipt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-44 xl:w-56 h-8 pl-9 pr-8 rounded-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-canvas focus:w-60 border border-white/[0.08] focus:border-accent text-xs text-white placeholder:text-neutral-400 font-medium transition-all duration-200 outline-none"
                  />
                  <div className="absolute right-2.5 pointer-events-none">
                    <kbd className="text-[9px] font-mono text-neutral-400 bg-white/[0.08] px-1 py-0.5 rounded border border-white/[0.1]">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Interactive Notification bell */}
              <Dropdown>
                <DropdownTrigger className="p-0 border-0 bg-transparent hover:bg-transparent">
                  <div
                    className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-150 active:scale-95 cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
                  </div>
                </DropdownTrigger>
                <DropdownContent width="w-80" align="right">
                  <DropdownHeader
                    title="Notifications"
                    subtitle="System & stock operational alerts"
                  />
                  <div className="p-2 space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Low Stock Alert</span>
                      </div>
                      <p className="text-neutral-300 text-[11px]">
                        Items are approaching reorder levels in Central Warehouse.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Receipt Validated</span>
                      </div>
                      <p className="text-neutral-300 text-[11px]">
                        Stock quantities updated and ledger entries posted.
                      </p>
                    </div>
                  </div>
                </DropdownContent>
              </Dropdown>

              {/* Profile Avatar Menu (Desktop) */}
              <div className="hidden sm:block">
                <Dropdown>
                  <DropdownTrigger className="p-0 border-0 bg-transparent hover:bg-transparent">
                    <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-150 group cursor-pointer">
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-accent to-[#FFA048] p-0.5 shadow-sm">
                        <div className="w-full h-full rounded-full bg-[#111114] flex items-center justify-center text-xs font-bold text-white uppercase font-display">
                          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-status-success border-2 border-[#111114]" />
                      </div>
                      <div className="hidden xl:flex flex-col text-left mr-1">
                        <span className="text-xs font-semibold text-white leading-tight font-display">
                          {user?.name || 'Operator'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase leading-tight">
                          {isManager ? 'Manager' : 'Staff'}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200" />
                    </div>
                  </DropdownTrigger>

                  <DropdownContent width="w-60" align="right">
                    <DropdownHeader
                      title={user?.name || 'Operator'}
                      subtitle={user?.email || 'Logged In'}
                    />
                    <div className="px-3 py-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase">Role</span>
                      <Badge size="sm" variant={isManager ? 'accent' : 'neutral'}>
                        {isManager ? 'Inventory Manager' : 'Warehouse Staff'}
                      </Badge>
                    </div>
                    <DropdownSeparator />
                    <DropdownItem icon={User} onClick={() => navigate('/profile')}>
                      My Profile
                    </DropdownItem>
                    {isManager && (
                      <DropdownItem icon={Warehouse} onClick={() => navigate('/settings/warehouses')}>
                        Warehouses
                      </DropdownItem>
                    )}
                    <DropdownSeparator />
                    <DropdownItem icon={LogOut} destructive onClick={handleLogout}>
                      Logout
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>

              {/* MOBILE HAMBURGER BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT GLASS PANEL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex justify-end">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-4/5 max-w-sm h-full bg-[#121316]/95 border-l border-white/[0.12] backdrop-blur-3xl p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6 pt-16">
                {/* User quick badge in drawer */}
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-[#FFA048] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#111114] flex items-center justify-center font-bold text-sm text-white">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-white">
                      {user?.name || 'Operator'}
                    </div>
                    <div className="text-[11px] font-mono text-accent uppercase">
                      {isManager ? 'Inventory Manager' : 'Staff'}
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation List */}
                <nav className="flex flex-col gap-1.5">
                  <NavLink to="/dashboard" className={mobileNavLinkClass}>
                    <span>Dashboard</span>
                    <span className="text-xs font-mono opacity-60">01</span>
                  </NavLink>
                  <NavLink to="/receipts" className={mobileNavLinkClass}>
                    <span>Receipts (Incoming)</span>
                    <Badge size="sm" variant="success">IN</Badge>
                  </NavLink>
                  <NavLink to="/deliveries" className={mobileNavLinkClass}>
                    <span>Deliveries (Outgoing)</span>
                    <Badge size="sm" variant="accent">OUT</Badge>
                  </NavLink>
                  <NavLink to="/transfers" className={mobileNavLinkClass}>
                    <span>Internal Transfers</span>
                    <span className="text-xs font-mono opacity-60">TRANSIT</span>
                  </NavLink>
                  <NavLink to="/products" className={mobileNavLinkClass}>
                    <span>Products & Stock</span>
                    <span className="text-xs font-mono opacity-60">SKU</span>
                  </NavLink>
                  <NavLink to="/move-history" className={mobileNavLinkClass}>
                    <span>Move History</span>
                    <span className="text-xs font-mono opacity-60">LEDGER</span>
                  </NavLink>
                  {isManager && (
                    <NavLink to="/settings/warehouses" className={mobileNavLinkClass}>
                      <span>Warehouses Settings</span>
                      <span className="text-xs font-mono opacity-60">WH</span>
                    </NavLink>
                  )}
                  <NavLink to="/profile" className={mobileNavLinkClass}>
                    <span>My Profile</span>
                  </NavLink>
                </nav>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="pt-6 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-status-danger/15 text-red-300 border border-status-danger/30 font-display font-semibold text-xs uppercase tracking-wider hover:bg-status-danger/25 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
