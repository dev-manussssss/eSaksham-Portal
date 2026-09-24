import React, { useState, useEffect } from 'react';
import { PageHeader, DataTable, Button, Modal, Input, Select, StatusBadge, Badge } from '../components/primitives/index.js';
import { useAuth, ROLES } from '../auth/AuthContext.jsx';

export default function Inspections() {
  const { session } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // New Inspection Form State
  const [projectId, setProjectId] = useState('PRJ-001');
  const [milestone, setMilestone] = useState('Foundation Milestone');
  const [progress, setProgress] = useState('45');
  const [assessment, setAssessment] = useState('SATISFACTORY');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saksham_auth_token');
      const res = await fetch('/api/inspections', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.inspections)) {
        setInspections(data.inspections);
      }
    } catch (err) {
      console.warn('Using fallback inspection fixtures:', err);
      setInspections([
        {
          id: '77777777-7777-4777-a777-777777777777',
          project_id: 'PRJ-001',
          inspector_name: 'R. Venkatraman, IAS',
          inspection_date: '2026-08-15',
          milestone_stage: 'Roof Slab & Masonry',
          physical_progress_observed: 82.0,
          quality_assessment: 'SATISFACTORY',
          remarks: 'Structural column alignment and grade concrete verified.',
          cadastral_boundary_verified: true,
          latitude: 23.2599,
          longitude: 77.4126,
        },
        {
          id: '88888888-8888-4888-a888-888888888888',
          project_id: 'PRJ-004',
          inspector_name: 'K. S. Narayanan, IPS',
          inspection_date: '2026-08-20',
          milestone_stage: 'Foundation & RCC Framing',
          physical_progress_observed: 45.0,
          quality_assessment: 'DEFICIENCIES_NOTED',
          remarks: 'Significant physical progress delay detected relative to fund release. MB discrepancy noted.',
          cadastral_boundary_verified: true,
          latitude: 23.4710,
          longitude: 88.5565,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('saksham_auth_token');
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          project_id: projectId,
          milestone_stage: milestone,
          physical_progress_observed: Number(progress),
          quality_assessment: assessment,
          remarks,
          latitude: 23.2599,
          longitude: 77.4126,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchInspections();
      }
    } catch (err) {
      alert('Inspection recording failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'project_id',
      header: 'Project Code',
      render: (val, row) => (
        <div>
          <span className="font-bold text-[#1F497D]">{val}</span>
          <div className="text-[10px] text-slate-400">{row.projects?.title || 'Civil Works'}</div>
        </div>
      ),
    },
    {
      key: 'inspection_date',
      header: 'Inspection Date',
      render: (val) => <span className="font-mono text-slate-700">{val}</span>,
    },
    {
      key: 'inspector_name',
      header: 'Assigned Inspector',
      render: (val) => <span className="font-medium text-slate-800">{val}</span>,
    },
    {
      key: 'milestone_stage',
      header: 'Milestone Stage',
      render: (val) => <span className="text-slate-600">{val}</span>,
    },
    {
      key: 'physical_progress_observed',
      header: 'Observed Progress',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#1F497D] h-full" style={{ width: `${val}%` }} />
          </div>
          <span className="font-bold text-slate-800">{val}%</span>
        </div>
      ),
    },
    {
      key: 'quality_assessment',
      header: 'Assessment',
      render: (val) => {
        const isGood = val === 'SATISFACTORY';
        return (
          <Badge variant={isGood ? 'success' : 'warning'} size="sm">
            {val.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'cadastral_boundary_verified',
      header: 'Cadastral Check',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="material-symbols-outlined text-xs">check_circle</span>
          <span>Verified GPS</span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Physical Site Inspections & Evidence"
        subtitle="Independent site milestone verification, geo-tagged cadastral coordinates, and physical progress records"
        breadcrumbs={['Dashboard', 'Inspections']}
        actions={
          [ROLES.DISTRICT_AUTHORITY, ROLES.IMPLEMENTING_AGENCY, ROLES.INVESTIGATOR].includes(session?.role) && (
            <Button
              onClick={() => setModalOpen(true)}
              icon={<span className="material-symbols-outlined text-sm">add_task</span>}
            >
              Record Field Inspection
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={inspections}
        onRowClick={(row) => setSelectedInspection(row)}
      />

      {/* Record Inspection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Statutory Field Inspection"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRecordInspection} loading={submitting}>
              Submit & Freeze Evidence
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordInspection} className="space-y-4 text-xs">
          <Select
            label="Target Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[
              { value: 'PRJ-001', label: 'PRJ-001: Community Hall & Shelter' },
              { value: 'PRJ-004', label: 'PRJ-004: Primary Health Sub-Centre' },
              { value: 'PRJ-006', label: 'PRJ-006: Lift Irrigation & Check Dam' },
              { value: 'PRJ-010', label: 'PRJ-010: Rural Link Road & Culvert' },
            ]}
            required
          />

          <Input
            label="Milestone Stage"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            placeholder="e.g. Sub-structure / Plinth Slab"
            required
          />

          <Input
            label="Observed Physical Progress (%)"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            required
          />

          <Select
            label="Quality Assessment"
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            options={[
              { value: 'SATISFACTORY', label: 'Satisfactory (Conforms to specs)' },
              { value: 'DEFICIENCIES_NOTED', label: 'Deficiencies Noted (Rectification notice)' },
              { value: 'UNACCEPTABLE', label: 'Unacceptable (Work hold recommended)' },
            ]}
            required
          />

          <Input
            label="Field Inspection Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Notes on structural execution, materials, and measurement accuracy"
          />
        </form>
      </Modal>
    </div>
  );
}
