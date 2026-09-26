import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  useToast,
} from '../components/common';
import { INITIAL_WAREHOUSES } from '../mock/mockData';
import {
  Warehouse,
  MapPin,
  Plus,
  Trash2,
  Check,
  Building2,
} from 'lucide-react';

export default function WarehousesPage() {
  const { addToast } = useToast();
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(INITIAL_WAREHOUSES[0].id);

  // Selected warehouse
  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  // Edit Warehouse form fields
  const [editWhForm, setEditWhForm] = useState({
    name: activeWarehouse.name,
    shortCode: activeWarehouse.shortCode,
    address: activeWarehouse.address,
  });

  // New Location sub-form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');
  const [showAddLoc, setShowAddLoc] = useState(false);

  // New Warehouse modal state
  const [isNewWhModalOpen, setIsNewWhModalOpen] = useState(false);
  const [newWhData, setNewWhData] = useState({ name: '', shortCode: '', address: '' });
  const [whSavedSuccess, setWhSavedSuccess] = useState(false);

  // Switch active warehouse
  const handleSelectWarehouse = (wh) => {
    setSelectedWarehouseId(wh.id);
    setEditWhForm({
      name: wh.name,
      shortCode: wh.shortCode,
      address: wh.address,
    });
    setShowAddLoc(false);
  };

  // Save current warehouse details
  const handleSaveWarehouse = (e) => {
    e.preventDefault();
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id === activeWarehouse.id
          ? {
              ...w,
              name: editWhForm.name,
              shortCode: editWhForm.shortCode.toUpperCase(),
              address: editWhForm.address,
            }
          : w
      )
    );
    setWhSavedSuccess(true);
    addToast({
      title: 'Warehouse Updated',
      description: `${editWhForm.name} profile successfully updated.`,
      variant: 'success',
    });
    setTimeout(() => setWhSavedSuccess(false), 2000);
  };

  // Create brand new warehouse
  const handleCreateNewWarehouse = (e) => {
    e.preventDefault();
    if (!newWhData.name.trim() || !newWhData.shortCode.trim()) return;

    const createdWh = {
      id: `wh-${Date.now()}`,
      name: newWhData.name.trim(),
      shortCode: newWhData.shortCode.trim().toUpperCase(),
      address: newWhData.address.trim(),
      locations: [
        {
          id: `loc-${Date.now()}-1`,
          name: 'Main Storage Zone',
          shortCode: `${newWhData.shortCode.trim().toUpperCase()}/MAIN`,
          parentWarehouse: newWhData.shortCode.trim().toUpperCase(),
        },
      ],
    };

    setWarehouses((prev) => [...prev, createdWh]);
    setSelectedWarehouseId(createdWh.id);
    setEditWhForm({
      name: createdWh.name,
      shortCode: createdWh.shortCode,
      address: createdWh.address,
    });
    setNewWhData({ name: '', shortCode: '', address: '' });
    setIsNewWhModalOpen(false);
    addToast({
      title: 'Warehouse Added',
      description: `Facility [${createdWh.shortCode}] ${createdWh.name} online.`,
      variant: 'success',
    });
  };

  // Add Location to active warehouse
  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocCode.trim()) return;

    const formattedCode = newLocCode.startsWith(activeWarehouse.shortCode)
      ? newLocCode.toUpperCase()
      : `${activeWarehouse.shortCode}/${newLocCode.toUpperCase().replace(/^\//, '')}`;

    const newLoc = {
      id: `loc-${Date.now()}`,
      name: newLocName.trim(),
      shortCode: formattedCode,
      parentWarehouse: activeWarehouse.shortCode,
    };

    setWarehouses((prev) =>
      prev.map((w) =>
        w.id === activeWarehouse.id
          ? { ...w, locations: [...w.locations, newLoc] }
          : w
      )
    );

    setNewLocName('');
    setNewLocCode('');
    setShowAddLoc(false);

    addToast({
      title: 'Location Node Added',
      description: `Zone ${newLoc.name} (${newLoc.shortCode}) mapped to warehouse.`,
      variant: 'accent',
    });
  };

  // Remove Location
  const handleRemoveLocation = (locId) => {
    const locToRemove = activeWarehouse.locations.find((l) => l.id === locId);
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id === activeWarehouse.id
          ? { ...w, locations: w.locations.filter((l) => l.id !== locId) }
          : w
      )
    );

    if (locToRemove) {
      addToast({
        title: 'Location Node Removed',
        description: `Zone ${locToRemove.name} removed from ${activeWarehouse.shortCode}.`,
        variant: 'warning',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
              Facility Configuration // Multi-Echelon
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight uppercase">
            Warehouses & Locations
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Configure physical fulfillment centers, rack allocations, and bin hierarchies.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewWhModalOpen(true)}
        >
          Add Warehouse
        </Button>
      </section>

      {/* 2. MAIN LAYOUT: Warehouse Selector (Left) + Detail & Nested Locations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Warehouse List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase text-neutral-400 tracking-wider">
              Active Facilities ({warehouses.length})
            </span>
          </div>

          <div className="space-y-2">
            {warehouses.map((wh) => {
              const isSelected = wh.id === activeWarehouse.id;
              return (
                <div
                  key={wh.id}
                  onClick={() => handleSelectWarehouse(wh)}
                  className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-surface-elevated border-accent shadow-accent-glow-sm'
                      : 'bg-surface/80 border-white/[0.08] hover:border-white/[0.2] hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : 'bg-white/[0.05] border-white/[0.08] text-neutral-300'
                        }`}
                      >
                        <Warehouse className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-white">
                          {wh.name}
                        </div>
                        <span className="text-[11px] font-mono text-accent font-semibold">
                          Code: {wh.shortCode}
                        </span>
                      </div>
                    </div>

                    <Badge size="sm" variant={isSelected ? 'accent' : 'neutral'}>
                      {wh.locations.length} locs
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                    <span className="truncate">{wh.address}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Warehouse Form & Nested Locations (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. Warehouse Detail Form */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Warehouse Profile: {activeWarehouse.name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Parent node configuration and operational address.
                  </p>
                </div>
              </div>

              {whSavedSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Changes Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Warehouse Name"
                    value={editWhForm.name}
                    onChange={(e) => setEditWhForm({ ...editWhForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Short Code"
                    value={editWhForm.shortCode}
                    onChange={(e) =>
                      setEditWhForm({ ...editWhForm, shortCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. WH"
                    required
                  />
                </div>
              </div>

              <Input
                label="Physical Address"
                value={editWhForm.address}
                onChange={(e) => setEditWhForm({ ...editWhForm, address: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm">
                  Save Warehouse Details
                </Button>
              </div>
            </form>
          </Card>

          {/* B. Nested Locations Sub-list per Warehouse */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-widest">
                    Topology Grid
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  Nested Locations & Zones
                </h3>
                <p className="text-xs text-neutral-400">
                  Holds multiple locations of {activeWarehouse.name} (rooms, racks, staging bays).
                </p>
              </div>

              {!showAddLoc && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowAddLoc(true)}
                >
                  Add Location
                </Button>
              )}
            </div>

            {/* Inline Add Location Sub-form */}
            {showAddLoc && (
              <form
                onSubmit={handleAddLocation}
                className="p-4 rounded-xl bg-canvas-subtle/90 border border-accent/40 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-display text-white uppercase tracking-wider">
                    New Location Node
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddLoc(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Location Name"
                    placeholder="e.g. Zone C - Cold Storage"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    required
                  />
                  <Input
                    label="Short Code"
                    placeholder="e.g. ZONE-C"
                    value={newLocCode}
                    onChange={(e) => setNewLocCode(e.target.value)}
                    helperText={`Parent: ${activeWarehouse.shortCode}`}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowAddLoc(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="xs">
                    Save Location
                  </Button>
                </div>
              </form>
            )}

            {/* Locations List */}
            <div className="space-y-2">
              {activeWarehouse.locations.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No nested locations mapped. Click "Add Location" to create rooms, aisles, or racks.
                </div>
              ) : (
                activeWarehouse.locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3.5 rounded-xl bg-surface-subtle/80 border border-white/[0.06] hover:border-white/[0.14] flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 group-hover:text-white">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-display font-semibold text-sm text-white">
                          {loc.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-accent">
                            {loc.shortCode}
                          </span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            Parent: {loc.parentWarehouse}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        Online
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-status-danger/20 text-neutral-400 hover:text-red-400 transition-all"
                        title="Delete location node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 3. MODAL: "ADD WAREHOUSE" */}
      {isNewWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-white/[0.12] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-display font-bold text-xl text-white">
                Add New Warehouse
              </h3>
              <button
                type="button"
                onClick={() => setIsNewWhModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewWarehouse} className="space-y-4">
              <Input
                label="Warehouse Name"
                placeholder="e.g. South Regional Depot"
                value={newWhData.name}
                onChange={(e) => setNewWhData({ ...newWhData, name: e.target.value })}
                required
              />
              <Input
                label="Short Code"
                placeholder="e.g. SRD"
                value={newWhData.shortCode}
                onChange={(e) =>
                  setNewWhData({ ...newWhData, shortCode: e.target.value.toUpperCase() })
                }
                required
              />
              <Input
                label="Address"
                placeholder="e.g. 100 Logistics Way, Austin, TX"
                value={newWhData.address}
                onChange={(e) => setNewWhData({ ...newWhData, address: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsNewWhModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Warehouse
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
