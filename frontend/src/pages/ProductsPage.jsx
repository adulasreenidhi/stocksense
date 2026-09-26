import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  useToast,
  EmptyState,
} from '../components/common';
import { INITIAL_PRODUCTS } from '../mock/mockData';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // New Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Footwear',
    uom: 'Units',
    perUnitCost: 50.0,
    initialStock: 100,
    reorderPoint: 20,
  });
  const [formError, setFormError] = useState('');

  // Inline Stock Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }
      return true;
    });
  }, [products, categoryFilter, searchQuery]);

  // Handle New Product Submit
  const handleCreateProduct = (e) => {
    e.preventDefault();
    setFormError('');

    if (!newProduct.name.trim() || !newProduct.sku.trim()) {
      setFormError('Product Name and SKU are required.');
      return;
    }

    if (products.some((p) => p.sku.toUpperCase() === newProduct.sku.trim().toUpperCase())) {
      setFormError(`A product with SKU "${newProduct.sku.toUpperCase()}" already exists.`);
      return;
    }

    const created = {
      id: `prod-${Date.now()}`,
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim().toUpperCase(),
      category: newProduct.category,
      uom: newProduct.uom,
      perUnitCost: parseFloat(newProduct.perUnitCost) || 0,
      onHand: parseInt(newProduct.initialStock, 10) || 0,
      freeToUse: parseInt(newProduct.initialStock, 10) || 0,
      reorderPoint: parseInt(newProduct.reorderPoint, 10) || 0,
    };

    setProducts((prev) => [created, ...prev]);
    setIsModalOpen(false);
    addToast({
      title: 'Product Registered',
      description: `${created.name} (${created.sku}) added to catalog with ${created.onHand} units.`,
      variant: 'success',
    });
    setNewProduct({
      name: '',
      sku: '',
      category: 'Footwear',
      uom: 'Units',
      perUnitCost: 50.0,
      initialStock: 100,
      reorderPoint: 20,
    });
  };

  // Start inline stock editing
  const startEditStock = (product) => {
    setEditingStockId(product.id);
    setTempStockValue(String(product.onHand));
  };

  // Save updated stock
  const saveStock = (productId) => {
    const val = parseInt(tempStockValue, 10);
    if (isNaN(val) || val < 0) {
      setEditingStockId(null);
      return;
    }

    let updatedProduct = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const reserved = p.onHand - p.freeToUse;
          const newFreeToUse = Math.max(0, val - (reserved > 0 ? reserved : 0));
          updatedProduct = { ...p, onHand: val, freeToUse: newFreeToUse };
          return updatedProduct;
        }
        return p;
      })
    );

    if (updatedProduct) {
      addToast({
        title: 'Stock Updated',
        description: `${updatedProduct.sku} on-hand quantity adjusted to ${val} ${updatedProduct.uom}.`,
        variant: 'accent',
      });
    }
    setEditingStockId(null);
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
              Inventory Master // SKUs
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Products & Stock
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Real-time on-hand quant, valuation cost, and inventory availability across warehouses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Product
        </Button>
      </section>

      {/* 2. SEARCH & FILTER BAR */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface/90 border border-white/[0.08] backdrop-blur-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-canvas-subtle border border-white/[0.08] focus:border-accent focus-visible:ring-1 focus-visible:ring-accent text-xs text-white placeholder:text-neutral-500 font-medium outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-neutral-400 uppercase shrink-0">
            Category:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  categoryFilter === cat
                    ? 'bg-accent text-white shadow-accent-glow-sm'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS DATA DISPLAY: Stacked cards on mobile, Table on desktop */}
      <section>
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description={
              searchQuery || categoryFilter !== 'ALL'
                ? 'No catalog items match your active search filters. Try adjusting your query or category.'
                : 'Your inventory catalog is currently empty. Add your first item to begin tracking stock.'
            }
            actionLabel="Add New Product"
            onAction={() => setIsModalOpen(true)}
            secondaryActionLabel={
              searchQuery || categoryFilter !== 'ALL' ? 'Clear Filters' : undefined
            }
            onSecondaryAction={() => {
              setSearchQuery('');
              setCategoryFilter('ALL');
            }}
          />
        ) : (
          <>
            {/* Desktop Table View (Hidden below md) */}
            <div className="hidden md:block">
              <Card className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Per Unit Cost</TableHead>
                      <TableHead className="text-right">On Hand</TableHead>
                      <TableHead className="text-right">Free to Use</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => {
                      const isLow = p.onHand <= p.reorderPoint;
                      const isOut = p.onHand === 0;
                      const isEditingThisStock = editingStockId === p.id;

                      return (
                        <TableRow key={p.id} className="group">
                          {/* Product */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-300 group-hover:text-accent group-hover:border-accent/40 transition-colors">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-display font-bold text-white text-sm">
                                  {p.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-xs text-accent font-semibold">
                                    {p.sku}
                                  </span>
                                  <span className="text-neutral-500">•</span>
                                  <span className="text-[11px] font-mono text-neutral-400">
                                    {p.category} ({p.uom})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Per Unit Cost */}
                          <TableCell mono className="text-right font-medium text-neutral-200">
                            ${p.perUnitCost.toFixed(2)}
                          </TableCell>

                          {/* On Hand (Editable directly from this view) */}
                          <TableCell mono className="text-right">
                            {isEditingThisStock ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={tempStockValue}
                                  onChange={(e) => setTempStockValue(e.target.value)}
                                  className="w-20 h-7 px-2 text-right font-mono text-xs rounded-lg bg-canvas border border-accent text-white focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveStock(p.id);
                                    if (e.key === 'Escape') setEditingStockId(null);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => saveStock(p.id)}
                                  className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStockId(null)}
                                  className="p-1 rounded bg-white/[0.08] text-neutral-400 hover:text-white"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 group/edit">
                                <span className="font-mono font-bold text-sm text-white">
                                  {p.onHand.toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditStock(p)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-accent transition-opacity"
                                  title="Edit stock"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </TableCell>

                          {/* Free to Use */}
                          <TableCell mono className="text-right">
                            <span
                              className={`font-mono font-semibold ${
                                p.freeToUse === 0
                                  ? 'text-red-400'
                                  : isLow
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {p.freeToUse.toLocaleString()}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-right">
                            <Badge
                              variant={isOut ? 'late' : isLow ? 'waiting' : 'done'}
                              size="sm"
                              dot
                              pulse={isOut || isLow}
                            >
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                            </Badge>
                          </TableCell>

                          {/* Quick Actions */}
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => startEditStock(p)}
                              leftIcon={<Edit2 className="w-3 h-3" />}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Mobile Stacked Card View (Visible below md) */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((p) => {
                const isLow = p.onHand <= p.reorderPoint;
                const isOut = p.onHand === 0;
                const isEditingThisStock = editingStockId === p.id;

                return (
                  <Card key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-bold text-white text-sm">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-accent font-semibold">
                            {p.sku}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            • {p.category}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={isOut ? 'late' : isLow ? 'waiting' : 'done'}
                        size="sm"
                        dot
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low' : 'OK'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-xs font-mono">
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase">Cost</span>
                        <span className="text-neutral-200 font-medium">${p.perUnitCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase">On Hand</span>
                        <span className="text-white font-bold">{p.onHand}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px] uppercase">Free</span>
                        <span className={isOut ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {p.freeToUse}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      {isEditingThisStock ? (
                        <div className="flex items-center gap-2 w-full justify-between">
                          <input
                            type="number"
                            min="0"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                            className="w-24 h-8 px-2 font-mono text-xs rounded-lg bg-canvas border border-accent text-white"
                          />
                          <div className="flex items-center gap-1.5">
                            <Button size="xs" variant="primary" onClick={() => saveStock(p.id)}>
                              Save
                            </Button>
                            <Button size="xs" variant="ghost" onClick={() => setEditingStockId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="xs"
                          className="w-full"
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => startEditStock(p)}
                        >
                          Adjust On-Hand Stock
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* 4. MODAL: "NEW PRODUCT" CREATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-white/[0.12] shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-widest">
                  Catalog Registry
                </span>
                <h3 className="font-display font-bold text-xl text-white">
                  Add New Product
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-status-danger/15 border border-status-danger/30 text-red-300 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  placeholder="e.g. Pegasus 41 Road Shoe"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <Input
                  label="SKU Code"
                  placeholder="e.g. NK-PEG-041"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 font-display uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent text-sm font-medium outline-none"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 font-display uppercase tracking-wider">
                    Unit of Measure (UoM)
                  </label>
                  <select
                    value={newProduct.uom}
                    onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl bg-canvas-subtle border border-white/[0.08] text-white focus:border-accent text-sm font-medium outline-none"
                  >
                    <option value="Units">Units</option>
                    <option value="Pairs">Pairs</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Per Unit Cost ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newProduct.perUnitCost}
                  onChange={(e) => setNewProduct({ ...newProduct, perUnitCost: e.target.value })}
                  required
                />
                <Input
                  label="Initial Stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newProduct.initialStock}
                  onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                  required
                />
                <Input
                  label="Reorder Point"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newProduct.reorderPoint}
                  onChange={(e) => setNewProduct({ ...newProduct, reorderPoint: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
