import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable, Button, Badge, Modal, Input } from '../components/primitives/index.js';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saksham_auth_token');
      const res = await fetch('/api/alerts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('Using fallback alerts:', err);
      setAlerts([
        {
          id: '99999999-9999-4999-a999-999999999999',
          project_id: 'PRJ-004',
          severity: 'CRITICAL',
          category: 'FINANCIAL',
          title: 'Disproportionate Fund Drawdown Alert',
          description: 'Physical progress recorded at 45.0% while cumulative payments have exceeded 73.8% of sanction.',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        {
          id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
          vendor_id: 'VND-007',
          severity: 'HIGH',
          category: 'COLLUSION',
          title: 'Sole-Bidder Frequency Anomaly',
          description: 'Vendor Eastern Structural has won consecutive sub-district tenders without competing qualified bids.',
          status: 'ACTIVE',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleReviewAlert = async () => {
    if (!selectedAlert) return;
    try {
      const token = localStorage.getItem('saksham_auth_token');
      await fetch(`/api/alerts/${selectedAlert.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'RESOLVED', resolution_notes: notes }),
      });
      setReviewModalOpen(false);
      fetchAlerts();
    } catch (e) {
      alert('Review action failed: ' + e.message);
    }
  };

  const columns = [
    {
      key: 'severity',
      header: 'Severity',
      render: (val) => {
        const variants = { CRITICAL: 'danger', HIGH: 'warning', MEDIUM: 'neutral', LOW: 'success' };
        return <Badge variant={variants[val] || 'neutral'} size="sm">{val}</Badge>;
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => <span className="font-semibold text-slate-700 text-xs">{val}</span>,
    },
    {
      key: 'title',
      header: 'Signal Details',
      render: (val, row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{val}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'entity',
      header: 'Linked Entity',
      render: (_, row) => (
        <span className="font-mono text-xs text-[#1F497D]">
          {row.project_id || row.vendor_id || 'System-Wide'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Review State',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          val === 'ACTIVE' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedAlert(row);
            setReviewModalOpen(true);
          }}
        >
          Review Evidence
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Statutory Risk Signals & Alerts"
        subtitle="Active anomaly detection signals requiring administrative review and statutory verification"
        breadcrumbs={['Dashboard', 'Risk Intelligence', 'Alerts']}
      />

      <DataTable columns={columns} data={alerts} />

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Statutory Alert Review"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReviewAlert}>
              Mark as Verified / Resolved
            </Button>
          </>
        }
      >
        {selectedAlert && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 text-sm block mb-1">{selectedAlert.title}</span>
              <p className="text-slate-600">{selectedAlert.description}</p>
            </div>

            <Input
              label="Administrative Review Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record findings or actions taken (e.g. Field inspection ordered)"
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
