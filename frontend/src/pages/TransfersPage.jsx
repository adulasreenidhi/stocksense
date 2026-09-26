import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentListView from '../components/operations/DocumentListView';
import DocumentDetailView from '../components/operations/DocumentDetailView';
import { Repeat } from 'lucide-react';

const INITIAL_TRANSFERS = [
  {
    id: 'tr-1',
    reference: 'WH/INT/0001',
    partner: 'Zone A -> Zone B Mezzanine',
    contact: 'Internal Logistics Team',
    warehouse: 'WH',
    responsible: 'Alex Vance',
    status: 'Ready',
    date: '2026-09-25',
    note: 'Intra-warehouse bin replenishment',
    lines: [
      {
        id: 'tl-1',
        productId: 'prod-1',
        name: 'Air Zoom Flight 95 OG',
        sku: 'NK-ZM-95',
        qty: 100,
        expectedQty: 100,
        availableQty: 1300,
        uom: 'Pairs',
      },
    ],
  },
  {
    id: 'tr-2',
    reference: 'WH/INT/0002',
    partner: 'Central WH -> North Depot',
    contact: 'Regional Transit Carrier',
    warehouse: 'WH',
    responsible: 'Alex Vance',
    status: 'Draft',
    date: '2026-09-28',
    note: 'Inter-facility inventory balancing',
    lines: [
      {
        id: 'tl-2',
        productId: 'prod-5',
        name: 'Metcon 9 Training Shoes',
        sku: 'NK-MC-009',
        qty: 50,
        expectedQty: 50,
        availableQty: 580,
        uom: 'Pairs',
      },
    ],
  },
];

export default function TransfersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);

  const docIdParam = searchParams.get('id');
  const selectedDoc = transfers.find((t) => t.id === docIdParam) || null;
  const [activeDoc, setActiveDoc] = useState(selectedDoc);

  useEffect(() => {
    if (docIdParam) {
      const match = transfers.find((t) => t.id === docIdParam);
      if (match) setActiveDoc(match);
    }
  }, [docIdParam, transfers]);

  const handleSelectDocument = (doc) => {
    setActiveDoc(doc);
    setSearchParams({ id: doc.id });
  };

  const handleCreateNew = () => {
    setActiveDoc(null);
    setSearchParams({ id: 'new' });
  };

  const handleBackToList = () => {
    setActiveDoc(null);
    setSearchParams({});
  };

  const handleSaveDocument = (updatedDoc) => {
    setTransfers((prev) => {
      const exists = prev.some((d) => d.id === updatedDoc.id);
      if (exists) {
        return prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
      }
      return [updatedDoc, ...prev];
    });
    setActiveDoc(updatedDoc);
    setSearchParams({ id: updatedDoc.id });
  };

  if (activeDoc || docIdParam === 'new') {
    return (
      <DocumentDetailView
        document={activeDoc}
        docType="receipt"
        partnerLabel="Transit Route"
        onBack={handleBackToList}
        onSaveDocument={handleSaveDocument}
      />
    );
  }

  return (
    <DocumentListView
      title="Internal Transfers"
      subtitle="Relocations between warehouse facilities, staging areas, and inventory racks."
      badgeText="INTER-FACILITY TRANSIT"
      icon={Repeat}
      partnerHeader="Transit Route / Carrier"
      partnerField="partner"
      documents={transfers}
      stepperSteps={['Draft', 'Ready', 'Done']}
      onSelectDocument={handleSelectDocument}
      onCreateNew={handleCreateNew}
      actionButtonText="New Transfer Order"
    />
  );
}
