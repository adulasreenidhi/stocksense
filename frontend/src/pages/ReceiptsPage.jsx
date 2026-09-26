import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentListView from '../components/operations/DocumentListView';
import DocumentDetailView from '../components/operations/DocumentDetailView';
import { INITIAL_RECEIPTS } from '../mock/mockData';
import { ArrowDownLeft } from 'lucide-react';

export default function ReceiptsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);

  const docIdParam = searchParams.get('id');
  const selectedDoc = receipts.find((r) => r.id === docIdParam) || null;

  const [activeDoc, setActiveDoc] = useState(selectedDoc);

  useEffect(() => {
    if (docIdParam) {
      const match = receipts.find((r) => r.id === docIdParam);
      if (match) setActiveDoc(match);
    }
  }, [docIdParam, receipts]);

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
    setReceipts((prev) => {
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
        partnerLabel="Receive From (Vendor)"
        onBack={handleBackToList}
        onSaveDocument={handleSaveDocument}
      />
    );
  }

  return (
    <DocumentListView
      title="Receipts"
      subtitle="Inbound vendor shipments, purchase intake, and stock receiving validation."
      badgeText="INBOUND STOCK FLOW"
      icon={ArrowDownLeft}
      partnerHeader="From / Vendor"
      partnerField="partner"
      documents={receipts}
      stepperSteps={['Draft', 'Ready', 'Done']}
      onSelectDocument={handleSelectDocument}
      onCreateNew={handleCreateNew}
      actionButtonText="New Receipt"
    />
  );
}
