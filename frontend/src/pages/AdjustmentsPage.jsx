import React from 'react';
import { Card, Button, Badge } from '../components/common';
import { SlidersHorizontal, Plus } from 'lucide-react';

export default function AdjustmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-status-warning" />
            <span className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Audit & Corrections
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Stock Adjustments
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Physical cycle counts, discrepancy reconciliation, and shrinkage reconciliation.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Start Physical Count
        </Button>
      </div>

      <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-amber-400">
          <SlidersHorizontal className="w-7 h-7" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="font-display font-bold text-xl text-white">
            Cycle Counting & Discrepancies
          </h3>
          <p className="text-neutral-400 text-xs">
            App Shell & design system established. Inventory adjustments ledger will be mounted here.
          </p>
        </div>
        <Badge variant="warning" dot>
          Adjustments Module Stage
        </Badge>
      </Card>
    </div>
  );
}
