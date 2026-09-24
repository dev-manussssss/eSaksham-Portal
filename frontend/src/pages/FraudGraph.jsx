import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button, Tabs } from '../components/primitives/index.js';

export default function FraudGraph() {
  const [activeTab, setActiveTab] = useState('clusters');

  const clusters = [
    {
      id: 'CLUST-01',
      name: 'Nadia Bridge & Civil Works Cluster',
      severity: 'CRITICAL',
      vendors: ['Eastern Structural & Engineering Co. (VND-007)', 'Bengal Infra Links LLP (VND-012)'],
      indicators: [
        'Matching Director DIN Hash (DIN: 0847****)',
        '3 Sequential single-bidder tenders awarded without competing quotes',
        'Co-located registered GSTIN office address in Nadia district',
      ],
      tendersAffected: ['WB/NAD/HLT/2026/04', 'WB/NAD/PWD/2026/08'],
      riskScore: 88,
    },
    {
      id: 'CLUST-02',
      name: 'Central Zone Heavy Engineering Syndicate',
      severity: 'HIGH',
      vendors: ['Marwar Heavy Engineering Co. (VND-003)', 'Rajputana Earthmovers (VND-014)'],
      indicators: [
        'Identical bank account branch routing code & common authorized signatory',
        'Bidding price overlap within 0.8% threshold across 4 sub-district packages',
      ],
      tendersAffected: ['RJ/AJM/VET/2026/07'],
      riskScore: 72,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Entity Relationship & Collusion Graph"
        subtitle="Network graph detecting cartels, shared director DINs, common bank accounts, and circular bidding clusters"
        breadcrumbs={['Dashboard', 'Fraud Intelligence', 'Entity Graph']}
        actions={
          <Button
            variant="outline"
            icon={<span className="material-symbols-outlined text-sm">download</span>}
          >
            Export Dossier
          </Button>
        }
      />

      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase">Monitored Entities</div>
          <div className="text-xl font-bold text-slate-900 mt-1">10 Registered Contractors</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Synthetic identity cleared</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase">Suspected Collusion Clusters</div>
          <div className="text-xl font-bold text-red-600 mt-1">2 Active Clusters</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cartel formation indicators detected</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 uppercase">Sole-Bidder Frequency</div>
          <div className="text-xl font-bold text-amber-600 mt-1">16.7% of Tenders</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires statutory competition review</div>
        </div>
      </div>

      {/* Visual Relationship Radar Container */}
      <Card className="mb-6" header={<span className="text-xs font-bold uppercase tracking-wider text-slate-700">Cluster Intelligence</span>}>
        <div className="space-y-6">
          {clusters.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                  <Badge variant="danger" size="xs">{c.id}</Badge>
                </div>
                <div className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">
                  Collusion Risk: {c.riskScore}/100
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1.5">Linked Commercial Entities:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {c.vendors.map((v, idx) => (
                      <li key={idx} className="font-mono">{v}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1.5">Detected Graph Linkages:</span>
                  <ul className="space-y-1.5 text-slate-600">
                    {c.indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>Affected Procurement Packages: <strong>{c.tendersAffected.join(', ')}</strong></span>
                <span className="font-medium text-[#1F497D] cursor-pointer hover:underline">
                  Inspect Linked Bid Timestamps →
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
