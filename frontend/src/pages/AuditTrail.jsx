import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable, Badge, Select, Search } from '../components/primitives/index.js';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saksham_auth_token');
      const url = entityFilter ? `/api/audit?entity_type=${entityFilter}` : '/api/audit';
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.warn('Using fallback audit log entries:', e);
      setLogs([
        {
          id: '1',
          created_at: new Date().toISOString(),
          action: 'RECOMMENDATION_CREATED',
          entity_type: 'PROJECT',
          project_id: 'PRJ-001',
          actor_id: 'MP-BPL-001',
          role: 'MP',
          comment: 'Recommended project in sector Public & Community Buildings',
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          action: 'VENDOR_VERIFIED',
          entity_type: 'VENDOR',
          entity_id: 'VND-001',
          actor_id: 'DA-BPL-001',
          role: 'DISTRICT_AUTHORITY',
          comment: 'Statutory GSTIN and PAN synthetic clearance completed.',
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          action: 'TENDER_PUBLISHED',
          entity_type: 'TENDER',
          entity_id: 'TND-001',
          actor_id: 'PWD-BPL-IA-001',
          role: 'IMPLEMENTING_AGENCY',
          comment: 'Civil works e-procurement published on portal.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.actor_id?.toLowerCase().includes(term) ||
      log.comment?.toLowerCase().includes(term) ||
      log.project_id?.toLowerCase().includes(term) ||
      log.entity_id?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: 'created_at',
      header: 'Timestamp',
      render: (val) => (
        <span className="font-mono text-xs text-slate-600">
          {val ? new Date(val).toLocaleString('en-IN') : 'Recent'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Statutory Action',
      render: (val) => (
        <span className="font-bold text-[#1F497D] text-xs">
          {val}
        </span>
      ),
    },
    {
      key: 'entity_type',
      header: 'Entity Type',
      render: (val, row) => (
        <span className="text-xs">
          <Badge variant="neutral" size="xs">{val || 'PROJECT'}</Badge>
          <span className="font-mono text-[10px] text-slate-500 ml-1.5">{row.entity_id || row.project_id || '—'}</span>
        </span>
      ),
    },
    {
      key: 'actor_id',
      header: 'Authorized Actor',
      render: (val, row) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{val}</div>
          <div className="text-[10px] text-slate-400">{row.role}</div>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Governance Audit Summary',
      render: (val) => <span className="text-xs text-slate-600">{val || 'Action recorded.'}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Immutable Governance Audit Trail"
        subtitle="Append-only record of all administrative sanctions, vendor updates, tender publishing, and verification decisions"
        breadcrumbs={['Dashboard', 'Audit Trail']}
      />

      {/* Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="w-full sm:w-72">
          <Search value={searchTerm} onChange={setSearchTerm} placeholder="Filter audit actions, actors, or IDs..." />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Entity Types' },
              { value: 'PROJECT', label: 'Projects' },
              { value: 'VENDOR', label: 'Vendors' },
              { value: 'TENDER', label: 'Tenders' },
              { value: 'BID', label: 'Bids' },
              { value: 'INSPECTION', label: 'Inspections' },
              { value: 'AUTH', label: 'Authentication' },
            ]}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredLogs} />
    </div>
  );
}
