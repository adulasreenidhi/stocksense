import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardStat,
  Button,
  Badge,
  useToast,
  KPICardSkeleton,
  TableSkeleton,
} from '../components/common';
import {
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_WAREHOUSES,
} from '../mock/mockData';
import {
  Boxes,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  SlidersHorizontal,
  Search,
  ExternalLink,
  Clock,
  RotateCcw,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Filters state
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Live stats
  const totalStockCount = useMemo(
    () => INITIAL_PRODUCTS.reduce((acc, p) => acc + p.onHand, 0),
    []
  );

  const lowStockCount = useMemo(
    () => INITIAL_PRODUCTS.filter((p) => p.onHand <= p.reorderPoint).length,
    []
  );

  const pendingReceiptsCount = useMemo(
    () => INITIAL_RECEIPTS.filter((r) => r.status !== 'Done' && r.status !== 'Canceled').length,
    []
  );

  const pendingDeliveriesCount = useMemo(
    () => INITIAL_DELIVERIES.filter((d) => d.status !== 'Done' && d.status !== 'Canceled').length,
    []
  );

  const internalTransfersCount = 2;

  // Filtered feeds
  const filteredReceipts = useMemo(() => {
    if (docTypeFilter !== 'ALL' && docTypeFilter !== 'Receipts') return [];
    return INITIAL_RECEIPTS.filter((r) => {
      if (statusFilter !== 'ALL' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (warehouseFilter !== 'ALL' && r.warehouse !== warehouseFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesRef = r.reference.toLowerCase().includes(q);
        const matchesPartner = r.partner.toLowerCase().includes(q);
        if (!matchesRef && !matchesPartner) return false;
      }
      return true;
    });
  }, [docTypeFilter, statusFilter, warehouseFilter, searchQuery]);

  const filteredDeliveries = useMemo(() => {
    if (docTypeFilter !== 'ALL' && docTypeFilter !== 'Delivery') return [];
    return INITIAL_DELIVERIES.filter((d) => {
      if (statusFilter !== 'ALL' && d.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (warehouseFilter !== 'ALL' && d.warehouse !== warehouseFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesRef = d.reference.toLowerCase().includes(q);
        const matchesContact = d.contact.toLowerCase().includes(q);
        if (!matchesRef && !matchesContact) return false;
      }
      return true;
    });
  }, [docTypeFilter, statusFilter, warehouseFilter, searchQuery]);

  const totalFilteredOperations = filteredReceipts.length + filteredDeliveries.length;
  const lateOperationsCount = 1;

  const hasActiveFilters =
    docTypeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    warehouseFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setDocTypeFilter('ALL');
    setStatusFilter('ALL');
    setWarehouseFilter('ALL');
    setCategoryFilter('ALL');
    setSearchQuery('');
    addToast({
      title: 'Filters Cleared',
      description: 'Operational queues reset to full multi-facility view.',
      variant: 'info',
    });
  };

  const handleSimulateRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast({
        title: 'Inventory Feed Synchronized',
        description: 'Ledger quant views reconciled with active warehouse nodes.',
        variant: 'success',
      });
    }, 600);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* 1. TOP HERO HEADER */}
      <motion.section
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
              Central Logistics Command // WH-01
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight uppercase leading-none">
            Operational Dashboard
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-2xl font-medium">
            Real-time multi-echelon stock health, throughput velocity, and warehouse dispatch queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSimulateRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            disabled={isLoading}
          >
            Sync State
          </Button>
          <Badge variant="accent" size="lg" dot pulse>
            {lateOperationsCount} Late · {totalFilteredOperations} Operations
          </Badge>
        </div>
      </motion.section>

      {/* 2. KPI HERO ROW (Oversized Nike-style numbers with staggered animation) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          <motion.div variants={itemVariants}>
            <CardStat
              label="Products in Stock"
              value={totalStockCount.toLocaleString()}
              trend="+8.2%"
              trendDirection="up"
              subtext="across all nodes"
              icon={Boxes}
              onClick={() => navigate('/products')}
              className="cursor-pointer h-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CardStat
              label="Low / Out of Stock"
              value={String(lowStockCount).padStart(2, '0')}
              trend="Reorder req"
              trendDirection={lowStockCount > 0 ? 'down' : 'neutral'}
              subtext="2 SKU shortfalls"
              icon={AlertTriangle}
              className="border-status-danger/30 hover:border-status-danger/50 cursor-pointer h-full"
              valueClassName={lowStockCount > 0 ? 'text-red-400' : 'text-white'}
              onClick={() => navigate('/products')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CardStat
              label="Pending Receipts"
              value={String(pendingReceiptsCount).padStart(2, '0')}
              trend="Inbound flow"
              trendDirection="neutral"
              subtext="4 to receive"
              icon={ArrowDownLeft}
              onClick={() => navigate('/receipts')}
              className="cursor-pointer h-full"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CardStat
              label="Pending Deliveries"
              value={String(pendingDeliveriesCount).padStart(2, '0')}
              trend="Dispatch queue"
              trendDirection="neutral"
              subtext="4 to deliver"
              icon={ArrowUpRight}
              onClick={() => navigate('/deliveries')}
              className="cursor-pointer h-full"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1 md:col-span-1 lg:col-span-1">
            <CardStat
              label="Internal Transfers"
              value={String(internalTransfersCount).padStart(2, '0')}
              trend="Inter-facility"
              trendDirection="up"
              subtext="Scheduled transit"
              icon={Repeat}
              onClick={() => navigate('/transfers')}
              className="cursor-pointer h-full"
            />
          </motion.div>
        </motion.section>
      )}

      {/* 3. DYNAMIC FILTER BAR */}
      <motion.section
        variants={itemVariants}
        className="p-4 sm:p-5 rounded-2xl bg-surface/90 border border-white/[0.08] backdrop-blur-xl space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Dynamic Filters
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-neutral-400 hover:text-accent flex items-center gap-1 ml-2 transition-colors focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-canvas-subtle border border-white/[0.08] focus:border-accent focus-visible:ring-1 focus-visible:ring-accent text-xs text-white placeholder:text-neutral-500 font-medium outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Document Type
            </label>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent focus-visible:ring-1 focus-visible:ring-accent outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Documents (All Types)</option>
              <option value="Receipts">Receipts (Incoming)</option>
              <option value="Delivery">Delivery (Outgoing)</option>
              <option value="Internal">Internal Transfers</option>
              <option value="Adjustments">Stock Adjustments</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Document Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent focus-visible:ring-1 focus-visible:ring-accent outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Warehouse Facility
            </label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent focus-visible:ring-1 focus-visible:ring-accent outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Warehouses</option>
              {INITIAL_WAREHOUSES.map((wh) => (
                <option key={wh.id} value={wh.shortCode}>
                  [{wh.shortCode}] {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Category Scope
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent focus-visible:ring-1 focus-visible:ring-accent outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Footwear">Footwear</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>
      </motion.section>

      {/* 4. ACTIVITY & STATUS FEED: Grouped like "4 to receive" and "4 to Deliver" */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase">
              Operational Status Feed
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              Discord-style compact rows grouped by document queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-neutral-400">
              Showing {totalFilteredOperations} active pipelines
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GROUP 1: RECEIPTS FEED ("4 to receive") */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-status-success/15 border border-status-success/30 flex items-center justify-center text-emerald-400">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {filteredReceipts.length} to receive
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">
                    Inbound Shipments • Incoming
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/receipts')}
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                View all
              </Button>
            </div>

            {filteredReceipts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                No matching inbound receipts for the selected filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredReceipts.map((rec) => {
                  const totalItems = rec.lines.reduce((acc, l) => acc + l.expectedQty, 0);
                  const isDone = rec.status === 'Done';
                  const isReady = rec.status === 'Ready';

                  return (
                    <motion.div
                      key={rec.id}
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      onClick={() => navigate(`/receipts?id=${rec.id}`)}
                      className="group p-3 rounded-xl bg-surface-subtle/80 hover:bg-surface-elevated border border-white/[0.06] hover:border-white/[0.16] transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent">
                              {rec.reference}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase px-1.5 py-0.2 rounded bg-white/[0.04]">
                              WH-{rec.warehouse}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-300 font-medium truncate">
                            {rec.partner}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-mono font-medium text-white">
                            {totalItems.toLocaleString()} items
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            {rec.date}
                          </div>
                        </div>

                        <Badge
                          size="sm"
                          variant={isDone ? 'done' : isReady ? 'accent' : 'neutral'}
                          dot={isReady}
                          pulse={isReady}
                        >
                          {rec.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* GROUP 2: DELIVERIES FEED ("4 to Deliver") */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {filteredDeliveries.length} to Deliver
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase">
                    Outbound Pick & Pack • Dispatch
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/deliveries')}
                rightIcon={<ExternalLink className="w-3 h-3" />}
              >
                View all
              </Button>
            </div>

            {filteredDeliveries.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium">
                No matching delivery orders for the selected filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDeliveries.map((del) => {
                  const totalItems = del.lines.reduce((acc, l) => acc + l.qty, 0);
                  const isDone = del.status === 'Done';
                  const isReady = del.status === 'Ready';
                  const isWaiting = del.status === 'Waiting';
                  const hasShortfall = del.lines.some((l) => l.availableQty < l.qty);

                  return (
                    <motion.div
                      key={del.id}
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      onClick={() => navigate(`/deliveries?id=${del.id}`)}
                      className={`group p-3 rounded-xl bg-surface-subtle/80 hover:bg-surface-elevated border transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                        hasShortfall
                          ? 'border-status-danger/30 hover:border-status-danger/60'
                          : 'border-white/[0.06] hover:border-white/[0.16]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            hasShortfall ? 'bg-red-400 animate-pulse' : 'bg-accent'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white group-hover:text-accent transition-colors">
                              {del.reference}
                            </span>
                            {hasShortfall && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-status-danger/20 text-red-300 border border-status-danger/30">
                                Stock Alert
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-300 font-medium truncate">
                            {del.contact}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-mono font-medium text-white">
                            {totalItems.toLocaleString()} items
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            {del.scheduleDate}
                          </div>
                        </div>

                        <Badge
                          size="sm"
                          variant={
                            isDone
                              ? 'done'
                              : isReady
                              ? 'accent'
                              : isWaiting
                              ? 'waiting'
                              : 'neutral'
                          }
                          dot={isReady || isWaiting}
                          pulse={isWaiting}
                        >
                          {del.status}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </motion.section>
    </motion.div>
  );
}
