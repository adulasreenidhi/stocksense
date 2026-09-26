import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentListView from '../components/operations/DocumentListView';
import DocumentDetailView from '../components/operations/DocumentDetailView';
import { INITIAL_DELIVERIES } from '../mock/mockData';
import { ArrowUpRight } from 'lucide-react';

export default function DeliveriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);

  const docIdParam = searchParams.get('id');
  const selectedDoc = deliveries.find((d) => d.id === docIdParam) || null;

  const [activeDoc, setActiveDoc] = useState(selectedDoc);

  useEffect(() => {
    if (docIdParam) {
      const match = deliveries.find((d) => d.id === docIdParam);
      if (match) setActiveDoc(match);
    }
  }, [docIdParam, deliveries]);

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
    setDeliveries((prev) => {
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
        docType="delivery"
        partnerLabel="Customer / Contact"
        onBack={handleBackToList}
        onSaveDocument={handleSaveDocument}
      />
    );
  }

  return (
    <DocumentListView
      title="Delivery Orders"
      subtitle="Outbound customer shipments, store replenishment dispatches, and fulfillment manifests."
      badgeText="OUTBOUND FULFILLMENT FLOW"
      icon={ArrowUpRight}
      partnerHeader="Destination / Contact"
      partnerField="contact"
      documents={deliveries}
      stepperSteps={['Draft', 'Waiting', 'Ready', 'Done']}
      onSelectDocument={handleSelectDocument}
      onCreateNew={handleCreateNew}
      actionButtonText="New Delivery Order"
    />
  );
}
