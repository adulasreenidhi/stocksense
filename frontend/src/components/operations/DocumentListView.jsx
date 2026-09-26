import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '../common';
import {
  Search,
  Plus,
  LayoutList,
  Kanban,
  ArrowRight,
  Inbox,
  AlertTriangle,
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

export default function DocumentListView({
  title,
  subtitle,
  badgeText,
  icon: Icon,
  partnerHeader = 'From / Vendor',
  partnerField = 'partner',
  documents = [],
  stepperSteps = ['Draft', 'Ready', 'Done'],
  onSelectDocument,
  onCreateNew,
  actionButtonText = 'New Document',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (statusFilter !== 'ALL' && doc.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = doc.reference.toLowerCase().includes(q);
        const partnerVal = (doc[partnerField] || doc.partner || doc.contact || '').toLowerCase();
        const matchesPartner = partnerVal.includes(q);
        if (!matchesRef && !matchesPartner) return false;
      }
      return true;
    });
  }, [documents, searchQuery, statusFilter, partnerField]);

  // Grouped for Kanban view
  const kanbanColumns = useMemo(() => {
    const cols = {};
    stepperSteps.forEach((step) => {
      cols[step] = filteredDocs.filter((d) => d.status.toLowerCase() === step.toLowerCase());
    });
    return cols;
  }, [filteredDocs, stepperSteps]);

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'done':
        return 'done';
      case 'ready':
        return 'accent';
      case 'waiting':
        return 'waiting';
      case 'draft':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
              {badgeText}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-neutral-400 text-sm mt-1 max-w-xl font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onCreateNew}
        >
          {actionButtonText}
        </Button>
      </section>

      {/* 2. SEARCH & CONTROLS TOOLBAR */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface/90 border border-white/[0.08] backdrop-blur-xl">
        {/* Search by reference & contact */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reference or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-canvas-subtle border border-white/[0.08] focus:border-accent focus-visible:ring-1 focus-visible:ring-accent text-xs text-white placeholder:text-neutral-500 font-medium outline-none transition-all"
          />
        </div>

        {/* View Toggle: List vs Kanban */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Status Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-accent text-white shadow-accent-glow-sm'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white'
              }`}
            >
              All ({documents.length})
            </button>
            {stepperSteps.map((step) => {
              const count = documents.filter(
                (d) => d.status.toLowerCase() === step.toLowerCase()
              ).length;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setStatusFilter(step)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter.toLowerCase() === step.toLowerCase()
                      ? 'bg-white/[0.16] text-white'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                  }`}
                >
                  {step} ({count})
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-white/[0.1] hidden sm:block" />

          {/* List vs Kanban toggle button */}
          <div className="p-1 rounded-xl bg-canvas-subtle border border-white/[0.08] flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden md:inline font-semibold">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Kanban View"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden md:inline font-semibold">Kanban</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. VIEW MODE A: LIST VIEW (Desktop Table + Mobile Cards) */}
      {viewMode === 'list' && (
        <>
          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No Documents in Queue"
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No documents match your active search or status criteria.'
                  : `There are currently no ${title.toLowerCase()} recorded in this warehouse.`
              }
              actionLabel={actionButtonText}
              onAction={onCreateNew}
              secondaryActionLabel={searchQuery || statusFilter !== 'ALL' ? 'Reset Filters' : undefined}
              onSecondaryAction={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
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
                        <TableHead>{partnerHeader}</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead className="text-right">Lines / Units</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocs.map((doc) => {
                        const partnerVal = doc[partnerField] || doc.partner || doc.contact;
                        const totalUnits = (doc.lines || []).reduce(
                          (acc, l) => acc + (l.expectedQty || l.qty || 0),
                          0
                        );
                        const hasShortfall = (doc.lines || []).some(
                          (l) => l.availableQty !== undefined && l.availableQty < l.qty
                        );

                        return (
                          <TableRow
                            key={doc.id}
                            isClickable
                            onClick={() => onSelectDocument(doc)}
                            className={hasShortfall ? 'bg-status-danger/[0.04]' : ''}
                          >
                            <TableCell mono className="font-bold text-accent">
                              <div className="flex items-center gap-2">
                                <span>{doc.reference}</span>
                                {hasShortfall && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-status-danger/20 text-red-300 border border-status-danger/30">
                                    SHORT
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="font-semibold text-white">{partnerVal}</div>
                              {doc.note && (
                                <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                                  {doc.note}
                                </div>
                              )}
                            </TableCell>

                            <TableCell>
                              <span className="text-xs font-mono font-semibold text-neutral-300 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                                WH-{doc.warehouse}
                              </span>
                            </TableCell>

                            <TableCell mono className="text-xs text-neutral-400">
                              {doc.date || doc.scheduleDate}
                            </TableCell>

                            <TableCell mono className="text-right font-medium text-white">
                              {(doc.lines || []).length} items / {totalUnits.toLocaleString()} units
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(doc.status)}
                                size="sm"
                                dot
                                pulse={doc.status === 'Ready' || doc.status === 'Waiting'}
                              >
                                {doc.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectDocument(doc);
                                }}
                                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                              >
                                Open
                              </Button>
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
                {filteredDocs.map((doc) => {
                  const partnerVal = doc[partnerField] || doc.partner || doc.contact;
                  const totalUnits = (doc.lines || []).reduce(
                    (acc, l) => acc + (l.expectedQty || l.qty || 0),
                    0
                  );
                  const hasShortfall = (doc.lines || []).some(
                    (l) => l.availableQty !== undefined && l.availableQty < l.qty
                  );

                  return (
                    <Card
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className={`p-4 space-y-3 cursor-pointer ${
                        hasShortfall ? 'border-status-danger/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent">
                              {doc.reference}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              WH-{doc.warehouse}
                            </span>
                          </div>
                          <div className="font-display font-bold text-white text-sm mt-0.5">
                            {partnerVal}
                          </div>
                        </div>

                        <Badge
                          variant={getStatusBadgeVariant(doc.status)}
                          size="sm"
                          dot
                        >
                          {doc.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-2 border-t border-white/[0.06]">
                        <span>{totalUnits} units</span>
                        <span>{doc.date || doc.scheduleDate}</span>
                      </div>

                      {hasShortfall && (
                        <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Stock shortfall on item lines</span>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* 4. VIEW MODE B: KANBAN-BY-STATUS VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
          {stepperSteps.map((step) => {
            const cardsInStep = kanbanColumns[step] || [];
            return (
              <div
                key={step}
                className="rounded-2xl bg-surface/60 border border-white/[0.06] p-3 space-y-3"
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                      {step}
                    </span>
                    <Badge variant={getStatusBadgeVariant(step)} size="sm">
                      {cardsInStep.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2.5 min-h-[200px]">
                  {cardsInStep.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500 font-mono">
                      Queue clear
                    </div>
                  ) : (
                    cardsInStep.map((doc) => {
                      const partnerVal = doc[partnerField] || doc.partner || doc.contact;
                      const totalUnits = (doc.lines || []).reduce(
                        (acc, l) => acc + (l.expectedQty || l.qty || 0),
                        0
                      );
                      const hasShortfall = (doc.lines || []).some(
                        (l) => l.availableQty !== undefined && l.availableQty < l.qty
                      );

                      return (
                        <motion.div
                          key={doc.id}
                          whileHover={{ y: -2 }}
                          onClick={() => onSelectDocument(doc)}
                          className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer space-y-2 group ${
                            hasShortfall
                              ? 'bg-status-danger/10 border-status-danger/30 hover:border-status-danger/60'
                              : 'bg-surface-elevated/90 border-white/[0.08] hover:border-white/[0.2] hover:shadow-card-hover'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-accent">
                              {doc.reference}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              WH-{doc.warehouse}
                            </span>
                          </div>

                          <div className="font-display font-bold text-sm text-white group-hover:text-accent transition-colors line-clamp-1">
                            {partnerVal}
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/[0.06]">
                            <span>{totalUnits} units</span>
                            <span>{doc.date || doc.scheduleDate}</span>
                          </div>

                          {hasShortfall && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono font-semibold pt-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Insufficient stock</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
