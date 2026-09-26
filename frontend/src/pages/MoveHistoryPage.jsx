import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  useToast,
  EmptyState,
} from '../components/common';
import { INITIAL_MOVE_HISTORY, INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../mock/mockData';
import {
  History,
  Download,
  Search,
  RotateCcw,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  SlidersHorizontal,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function MoveHistoryPage() {
  const { addToast } = useToast();
  const [moves, setMoves] = useState(INITIAL_MOVE_HISTORY);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  // Filtered movements
  const filteredMoves = useMemo(() => {
    return moves.filter((m) => {
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      if (warehouseFilter !== 'ALL' && m.warehouse !== warehouseFilter) return false;
      if (productFilter !== 'ALL' && m.productName !== productFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = m.reference.toLowerCase().includes(q);
        const matchesContact = m.contact.toLowerCase().includes(q);
        const matchesProd = m.productName.toLowerCase().includes(q);
        const matchesSku = (m.sku || '').toLowerCase().includes(q);
        if (!matchesRef && !matchesContact && !matchesProd && !matchesSku) return false;
      }
      return true;
    });
  }, [moves, typeFilter, warehouseFilter, productFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setProductFilter('ALL');
    setWarehouseFilter('ALL');
    setTypeFilter('ALL');
    setDateRangeFilter('ALL');
    addToast({
      title: 'Ledger Filters Reset',
      description: 'Displaying complete chronological audit trail.',
      variant: 'info',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Reference,From,To,Contact,Product,Quantity,Type,Date\n'];
    const rows = filteredMoves.map(
      (m) =>
        `"${m.reference}","${m.from}","${m.to}","${m.contact}","${m.productName}",${m.quantity},"${m.type}","${m.date}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockSense_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    addToast({
      title: 'Ledger Exported',
      description: `Dispatched ${filteredMoves.length} transaction entries to CSV download.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
              Audit & Ledger // Append-Only
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <History className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
              Move History
            </h1>
          </div>
          <p className="text-neutral-400 text-sm mt-1 max-w-2xl font-medium">
            Immutable transaction ledger capturing every stock intake, customer dispatch, internal shift, and physical count adjustment.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export CSV Ledger
        </Button>
      </section>

      {/* 2. FILTER BAR: Product, Warehouse, Type, Date Range */}
      <section className="p-4 sm:p-5 rounded-2xl bg-surface/90 border border-white/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, contact, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-canvas-subtle border border-white/[0.08] focus:border-accent focus-visible:ring-1 focus-visible:ring-accent text-xs text-white placeholder:text-neutral-500 font-medium outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">
              {filteredMoves.length} records matching
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-mono text-neutral-400 hover:text-accent flex items-center gap-1 ml-2 transition-colors focus-visible:ring-1 focus-visible:ring-accent rounded px-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* 4 Multi-Select Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase">
              Move Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white text-xs font-medium outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
            >
              <option value="ALL">All Types (+ & -)</option>
              <option value="receipt">Incoming (+) Receipts</option>
              <option value="delivery">Outgoing (-) Deliveries</option>
              <option value="transfer">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase">
              Filter by Product
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white text-xs font-medium outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
            >
              <option value="ALL">All Products</option>
              {INITIAL_PRODUCTS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase">
              Warehouse
            </label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white text-xs font-medium outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
            >
              <option value="ALL">All Facilities</option>
              {INITIAL_WAREHOUSES.map((w) => (
                <option key={w.id} value={w.shortCode}>
                  [{w.shortCode}] {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase">
              Date Period
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white text-xs font-medium outline-none focus:border-accent focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
            >
              <option value="ALL">All Recorded Time</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. READ-ONLY LEDGER TABLE: Desktop Table + Mobile Cards */}
      <section>
        {filteredMoves.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Ledger Transactions"
            description={
              searchQuery || typeFilter !== 'ALL' || productFilter !== 'ALL'
                ? 'No move records match your active ledger filters. Reset filters to view all entries.'
                : 'No stock movements recorded in the ledger yet.'
            }
            actionLabel="Reset Ledger Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Card className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Product / SKU</TableHead>
                      <TableHead>From Location</TableHead>
                      <TableHead>To Destination</TableHead>
                      <TableHead>Contact / Partner</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Date / Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMoves.map((m) => {
                      const isPositive = m.quantity > 0;
                      const isNegative = m.quantity < 0;

                      return (
                        <TableRow key={m.id} className="hover:bg-white/[0.02]">
                          <TableCell mono className="font-bold text-accent">
                            {m.reference}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-white">{m.productName}</div>
                            {m.sku && (
                              <div className="text-[11px] font-mono text-neutral-400">
                                {m.sku}
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <span className="text-xs text-neutral-300 font-mono">
                              {m.from}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs text-neutral-300 font-mono">
                              {m.to}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs text-neutral-300 font-medium">
                              {m.contact}
                            </span>
                          </TableCell>

                          {/* Quantity */}
                          <TableCell mono className="text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                                isPositive
                                  ? 'bg-status-success/15 text-emerald-400 border-status-success/30 shadow-success-glow'
                                  : isNegative
                                  ? 'bg-status-danger/15 text-red-400 border-status-danger/30 shadow-danger-glow'
                                  : 'bg-white/[0.06] text-neutral-300 border-white/[0.1]'
                              }`}
                            >
                              {isPositive ? `+${m.quantity.toLocaleString()}` : m.quantity.toLocaleString()}
                            </span>
                          </TableCell>

                          <TableCell mono className="text-xs text-neutral-400">
                            {m.date}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden space-y-3">
              {filteredMoves.map((m) => {
                const isPositive = m.quantity > 0;
                const isNegative = m.quantity < 0;

                return (
                  <Card key={m.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-accent">
                          {m.reference}
                        </span>
                        <div className="font-display font-bold text-white text-sm mt-0.5">
                          {m.productName}
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg border ${
                          isPositive
                            ? 'bg-status-success/15 text-emerald-400 border-status-success/30'
                            : isNegative
                            ? 'bg-status-danger/15 text-red-400 border-status-danger/30'
                            : 'bg-white/[0.06] text-neutral-300'
                        }`}
                      >
                        {isPositive ? `+${m.quantity}` : m.quantity}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-neutral-400 pt-2 border-t border-white/[0.06]">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">From:</span>
                        <span className="text-neutral-300">{m.from}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">To:</span>
                        <span className="text-neutral-300">{m.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Party:</span>
                        <span className="text-neutral-300">{m.contact}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-white/[0.04]">
                        <span className="text-neutral-500">Timestamp:</span>
                        <span className="text-neutral-400">{m.date}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
