import { supabase } from '../supabase.js';

export async function seedDatabase() {
  console.log('Seeding SAKSHAM authoritative database on Supabase...');

  // 1. Roles
  const roles = [
    { role_key: 'DISTRICT_AUTHORITY', title: 'District Authority / Collector' },
    { role_key: 'IMPLEMENTING_AGENCY', title: 'Implementing Agency' },
    { role_key: 'VENDOR', title: 'Vendor / Contractor' },
    { role_key: 'MP', title: 'Member of Parliament' },
    { role_key: 'INVESTIGATOR', title: 'Statutory Investigator / Auditor' },
    { role_key: 'STATE_NODAL_AUTHORITY', title: 'State Nodal Authority' },
    { role_key: 'CENTRAL_NODAL_AGENCY', title: 'Central Nodal Agency' },
  ];
  await supabase.from('roles').upsert(roles, { onConflict: 'role_key' });

  // 2. Vendors
  const vendors = [
    { id: 'VND-001', company_name: 'Aarya Infraworks Private Limited', gstin: '23AAACA0001A1Z5', state: 'Madhya Pradesh', district: 'Sehore', sector: 'Civil Infrastructure', longitudinal_risk_score: 34, risk_level: 'LOW' },
    { id: 'VND-002', company_name: 'Northstar Digital Systems LLP', gstin: '29BBBCB0002B1Z6', state: 'Karnataka', district: 'Bengaluru Urban', sector: 'IT Hardware & Telecom', longitudinal_risk_score: 18, risk_level: 'LOW' },
    { id: 'VND-003', company_name: 'Marwar Heavy Engineering Co.', gstin: '08CCCC0003C1Z7', state: 'Rajasthan', district: 'Ajmer', sector: 'Heavy Engineering', longitudinal_risk_score: 72, risk_level: 'HIGH' },
    { id: 'VND-004', company_name: 'Coastal Water Solutions', gstin: '21DDDD0004D1Z8', state: 'Odisha', district: 'Ganjam', sector: 'Water Supply', longitudinal_risk_score: 42, risk_level: 'MEDIUM' },
    { id: 'VND-005', company_name: 'Shivalik Precision Labs', gstin: '06EEEE0005E1Z9', state: 'Haryana', district: 'Ambala', sector: 'Educational Tech', longitudinal_risk_score: 65, risk_level: 'HIGH' },
    { id: 'VND-006', company_name: 'Himalayan Clean Energy Corp', gstin: '02FFFF0006F1Z1', state: 'Himachal Pradesh', district: 'Kangra', sector: 'Renewable Power', longitudinal_risk_score: 30, risk_level: 'LOW' },
    { id: 'VND-007', company_name: 'Eastern Structural & Engineering Co.', gstin: '19GGGG0007G1Z2', state: 'West Bengal', district: 'Nadia', sector: 'Bridges & Highways', longitudinal_risk_score: 83, risk_level: 'CRITICAL' },
    { id: 'VND-008', company_name: 'Pragati Green Utilities', gstin: '02HHHH0008H1Z3', state: 'Himachal Pradesh', district: 'Kangra', sector: 'Solar Systems', longitudinal_risk_score: 35, risk_level: 'LOW' },
    { id: 'VND-009', company_name: 'Saurashtra Highway Builders', gstin: '24IIII0009I1Z4', state: 'Gujarat', district: 'Rajkot', sector: 'Road Construction', longitudinal_risk_score: 71, risk_level: 'HIGH' },
    { id: 'VND-010', company_name: 'Dakshin Civic Solutions', gstin: '33JJJJ0010J1Z5', state: 'Tamil Nadu', district: 'Tiruchirappalli', sector: 'Sanitation Infrastructure', longitudinal_risk_score: 44, risk_level: 'MEDIUM' },
  ];
  await supabase.from('vendors').upsert(vendors, { onConflict: 'id' });

  // 3. Tenders
  const tenders = [
    { id: 'TND-001', reference_no: 'MP/SEH/PWD/2026/01', title: 'Rural Road Strengthening & Drainage', estimated_budget: 4500000, awarded_vendor_id: 'VND-001', state: 'Madhya Pradesh', district: 'Sehore' },
    { id: 'TND-002', reference_no: 'KA/BEN/IT/2026/02', title: 'Desktop Computers & UPS Systems', estimated_budget: 3500000, awarded_vendor_id: 'VND-002', state: 'Karnataka', district: 'Bengaluru Urban' },
    { id: 'TND-003', reference_no: 'OD/GAN/PHED/2026/03', title: 'Community Drinking Water Solar Pumps', estimated_budget: 2500000, awarded_vendor_id: 'VND-004', state: 'Odisha', district: 'Ganjam' },
    { id: 'TND-004', reference_no: 'WB/NAD/PWD/2026/04', title: 'RCC Bridge Approach & Protection Works', estimated_budget: 6000000, awarded_vendor_id: 'VND-007', state: 'West Bengal', district: 'Nadia' },
    { id: 'TND-005', reference_no: 'TN/TRI/CIVIL/2026/05', title: 'Community Sanitation Block', estimated_budget: 1500000, awarded_vendor_id: 'VND-010', state: 'Tamil Nadu', district: 'Tiruchirappalli' },
    { id: 'TND-006', reference_no: 'HP/KNG/SOLAR/2026/06', title: 'Solar Street Lighting Remote Settlements', estimated_budget: 2000000, awarded_vendor_id: 'VND-008', state: 'Himachal Pradesh', district: 'Kangra' },
    { id: 'TND-007', reference_no: 'HR/AMB/EDU/2026/07', title: 'School Digital Learning Equipment', estimated_budget: 3000000, awarded_vendor_id: 'VND-005', state: 'Haryana', district: 'Ambala' },
    { id: 'TND-008', reference_no: 'MH/NSK/DRAIN/2026/08', title: 'Village Drainage Rehabilitation', estimated_budget: 2200000, awarded_vendor_id: 'VND-001', state: 'Maharashtra', district: 'Nashik' },
    { id: 'TND-009', reference_no: 'RJ/AJM/LIB/2026/09', title: 'Supply of Library Furniture', estimated_budget: 800000, awarded_vendor_id: 'VND-003', state: 'Rajasthan', district: 'Ajmer' },
    { id: 'TND-010', reference_no: 'WB/NAD/HEALTH/2026/10', title: 'Community Health Facility Civil Works', estimated_budget: 4000000, awarded_vendor_id: 'VND-007', state: 'West Bengal', district: 'Nadia' },
  ];
  await supabase.from('tenders').upsert(tenders, { onConflict: 'id' });

  // 4. Projects (10 Synthetic Projects from official dataset)
  const projects = [
    {
      id: 'PRJ-001',
      project_code: 'MPLADS/MP/SEH/ROAD/2026/01',
      title: 'Rural Road Strengthening and Drainage Package',
      category: 'Rural Roads',
      scheme: 'MPLADS',
      mp_name: 'Shri R. K. Singh, MP',
      constituency: 'Bhopal (PC-19)',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      vendor_id: 'VND-001',
      tender_id: 'TND-001',
      sanctioned_amount: 4500000,
      released_amount: 3660000,
      expenditure_amount: 3330600,
      physical_progress_percent: 75.0,
      financial_progress_percent: 74.0,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'LOW',
      risk_score: 20,
      start_date: '2026-02-01',
      target_completion_date: '2026-11-30',
      last_inspection_date: '2026-08-15',
    },
    {
      id: 'PRJ-002',
      project_code: 'MPLADS/KA/BEN/IT/2026/02',
      title: 'Supply of Desktop Computers and UPS Systems',
      category: 'IT Equipment',
      scheme: 'MPLADS',
      mp_name: 'Shri Tejasvi Surya, MP',
      constituency: 'Bengaluru South (PC-26)',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      vendor_id: 'VND-002',
      tender_id: 'TND-002',
      sanctioned_amount: 3500000,
      released_amount: 3500000,
      expenditure_amount: 3325000,
      physical_progress_percent: 100.0,
      financial_progress_percent: 95.0,
      status: 'VERIFIED',
      risk_level: 'LOW',
      risk_score: 15,
      start_date: '2026-03-01',
      target_completion_date: '2026-07-01',
      last_inspection_date: '2026-07-25',
    },
    {
      id: 'PRJ-003',
      project_code: 'MPLADS/OD/GAN/WATER/2026/03',
      title: 'Community Drinking Water Solar Pump Systems',
      category: 'Water Supply',
      scheme: 'MPLADS',
      mp_name: 'Dr. Amar Patnaik, MP',
      constituency: 'Aska (PC-19)',
      district: 'Ganjam',
      state: 'Odisha',
      vendor_id: 'VND-004',
      tender_id: 'TND-003',
      sanctioned_amount: 2500000,
      released_amount: 2000000,
      expenditure_amount: 1820000,
      physical_progress_percent: 65.0,
      financial_progress_percent: 72.8,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'LOW',
      risk_score: 25,
      start_date: '2026-03-15',
      target_completion_date: '2026-10-15',
      last_inspection_date: '2026-07-30',
    },
    {
      id: 'PRJ-004',
      project_code: 'MPLADS/WB/NAD/BRIDGE/2026/04',
      title: 'RCC Bridge Approach and Protection Works',
      category: 'Bridges',
      scheme: 'MPLADS',
      mp_name: 'Smt. Mahua Moitra, MP',
      constituency: 'Krishnanagar (PC-12)',
      district: 'Nadia',
      state: 'West Bengal',
      vendor_id: 'VND-007',
      tender_id: 'TND-004',
      sanctioned_amount: 6000000,
      released_amount: 4500000,
      expenditure_amount: 4095000,
      physical_progress_percent: 71.0,
      financial_progress_percent: 68.25,
      status: 'INSPECTION_REQUIRED',
      risk_level: 'CRITICAL',
      risk_score: 83,
      inspection_note: 'Measurement Book mismatch: reported 880 cum RCC M25 vs on-site verified 710 cum. Independent inspection requested.',
      start_date: '2026-01-15',
      target_completion_date: '2027-01-15',
      last_inspection_date: '2026-08-20',
    },
    {
      id: 'PRJ-005',
      project_code: 'MPLADS/TN/TRI/CIVIL/2026/05',
      title: 'Community Sanitation and Accessibility Block',
      category: 'Sanitation',
      scheme: 'MPLADS',
      mp_name: 'Shri Su. Thirunavukkarasar, MP',
      constituency: 'Tiruchirappalli (PC-24)',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      vendor_id: 'VND-010',
      tender_id: 'TND-005',
      sanctioned_amount: 1500000,
      released_amount: 1000000,
      expenditure_amount: 910000,
      physical_progress_percent: 66.7,
      financial_progress_percent: 60.6,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'LOW',
      risk_score: 22,
      start_date: '2026-03-01',
      target_completion_date: '2026-09-30',
      last_inspection_date: '2026-08-18',
    },
    {
      id: 'PRJ-006',
      project_code: 'MPLADS/HP/KNG/SOLAR/2026/06',
      title: 'Solar Street Lighting for Remote Settlements',
      category: 'Solar / Electrical',
      scheme: 'MPLADS',
      mp_name: 'Shri Kishan Kapoor, MP',
      constituency: 'Kangra (PC-01)',
      district: 'Kangra',
      state: 'Himachal Pradesh',
      vendor_id: 'VND-008',
      tender_id: 'TND-006',
      sanctioned_amount: 2000000,
      released_amount: 1500000,
      expenditure_amount: 1350000,
      physical_progress_percent: 75.0,
      financial_progress_percent: 67.5,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'LOW',
      risk_score: 20,
      start_date: '2026-04-01',
      target_completion_date: '2026-10-01',
      last_inspection_date: '2026-07-20',
    },
    {
      id: 'PRJ-007',
      project_code: 'MPLADS/HR/AMB/EDU/2026/07',
      title: 'School Digital Learning Equipment Package',
      category: 'Equipment',
      scheme: 'MPLADS',
      mp_name: 'Shri Rattan Lal Kataria, MP',
      constituency: 'Ambala (PC-01)',
      district: 'Ambala',
      state: 'Haryana',
      vendor_id: 'VND-005',
      tender_id: 'TND-007',
      sanctioned_amount: 3000000,
      released_amount: 3000000,
      expenditure_amount: 2700000,
      physical_progress_percent: 100.0,
      financial_progress_percent: 90.0,
      status: 'VERIFIED',
      risk_level: 'LOW',
      risk_score: 18,
      start_date: '2026-04-15',
      target_completion_date: '2026-08-30',
      last_inspection_date: '2026-08-01',
    },
    {
      id: 'PRJ-008',
      project_code: 'MPLADS/MH/NSK/DRAIN/2026/08',
      title: 'Village Drainage Rehabilitation',
      category: 'Drainage',
      scheme: 'MPLADS',
      mp_name: 'Shri Hemant Godse, MP',
      constituency: 'Nashik (PC-20)',
      district: 'Nashik',
      state: 'Maharashtra',
      vendor_id: 'VND-001',
      tender_id: 'TND-008',
      sanctioned_amount: 2200000,
      released_amount: 1100000,
      expenditure_amount: 990000,
      physical_progress_percent: 50.0,
      financial_progress_percent: 45.0,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'LOW',
      risk_score: 24,
      start_date: '2026-04-01',
      target_completion_date: '2026-12-31',
      last_inspection_date: '2026-08-10',
    },
    {
      id: 'PRJ-009',
      project_code: 'MPLADS/RJ/AJM/LIB/2026/09',
      title: 'Supply of Library Furniture',
      category: 'Furniture & Supplies',
      scheme: 'MPLADS',
      mp_name: 'Shri Bhagirath Choudhary, MP',
      constituency: 'Ajmer (PC-13)',
      district: 'Ajmer',
      state: 'Rajasthan',
      vendor_id: 'VND-003',
      tender_id: 'TND-009',
      sanctioned_amount: 800000,
      released_amount: 800000,
      expenditure_amount: 720000,
      physical_progress_percent: 100.0,
      financial_progress_percent: 90.0,
      status: 'COMPLETED',
      risk_level: 'LOW',
      risk_score: 12,
      start_date: '2026-05-01',
      target_completion_date: '2026-07-31',
      last_inspection_date: '2026-08-01',
    },
    {
      id: 'PRJ-010',
      project_code: 'MPLADS/WB/NAD/HEALTH/2026/10',
      title: 'Community Health Facility Civil Works',
      category: 'Public Buildings',
      scheme: 'MPLADS',
      mp_name: 'Smt. Mahua Moitra, MP',
      constituency: 'Krishnanagar (PC-12)',
      district: 'Nadia',
      state: 'West Bengal',
      vendor_id: 'VND-007',
      tender_id: 'TND-010',
      sanctioned_amount: 4000000,
      released_amount: 2000000,
      expenditure_amount: 1800000,
      physical_progress_percent: 50.0,
      financial_progress_percent: 45.0,
      status: 'UNDER_IMPLEMENTATION',
      risk_level: 'HIGH',
      risk_score: 68,
      inspection_note: 'Tender bidder cluster overlap identified; director DIN cross-linkage to VND-007.',
      start_date: '2026-02-01',
      target_completion_date: '2026-12-01',
      last_inspection_date: '2026-08-05',
    },
  ];
  await supabase.from('projects').upsert(projects, { onConflict: 'id' });

  // 5. BOQ Items for PRJ-004 (High-risk demo project) and PRJ-001
  const boqItems = [
    { project_id: 'PRJ-004', item_no: '1.1', description: 'Earthwork in filling (embankment)', unit: 'cum', sanctioned_qty: 5000, rate: 200, total_amount: 1000000 },
    { project_id: 'PRJ-004', item_no: '1.2', description: 'RCC M25 for approach slab', unit: 'cum', sanctioned_qty: 500, rate: 6000, total_amount: 3000000 },
    { project_id: 'PRJ-004', item_no: '1.3', description: 'TMT Steel Reinforcement', unit: 'kg', sanctioned_qty: 25000, rate: 80, total_amount: 2000000 },
    { project_id: 'PRJ-001', item_no: '1', description: 'Earthwork in excavation', unit: 'cum', sanctioned_qty: 2000, rate: 150, total_amount: 300000 },
    { project_id: 'PRJ-001', item_no: '2', description: 'Granular Sub-Base (GSB)', unit: 'cum', sanctioned_qty: 1000, rate: 1200, total_amount: 1200000 },
    { project_id: 'PRJ-001', item_no: '3', description: 'Bituminous Macadam', unit: 'sqm', sanctioned_qty: 5000, rate: 600, total_amount: 3000000 },
  ];
  await supabase.from('boq_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('boq_items').insert(boqItems);

  // 6. Measurements for PRJ-004
  const measurements = [
    { project_id: 'PRJ-004', mb_number: 'MB-P14', item_no: '1.1', description: 'Earthwork in filling', recorded_qty: 5000, observed_qty: 5000, unit: 'cum', entry_date: '2026-08-15', verification_status: 'VERIFIED' },
    { project_id: 'PRJ-004', mb_number: 'MB-P14', item_no: '1.2', description: 'RCC M25 for approach slab', recorded_qty: 880, observed_qty: 710, unit: 'cum', entry_date: '2026-08-18', verification_status: 'DISCREPANCY_FLAGGED', notes: 'Recorded 880 cum but observed 710 cum (-170 cum variance).' },
  ];
  await supabase.from('measurements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('measurements').insert(measurements);

  // 7. Initial AI Flag for PRJ-004
  const initialFlags = [
    {
      project_id: 'PRJ-004',
      flag_code: 'MB_OBSERVED_MISMATCH',
      severity: 'CRITICAL',
      title: 'Measurement Book Discrepancy & Quantity Shortfall',
      explanation: 'On-site verification observed only 710 cum of RCC M25 placed versus 880 cum recorded in Measurement Book MB-P14 (170 cum shortfall, ~17 percentage point divergence).',
      recommended_action: 'HOLD_PAYMENT',
      primary_evidence: { mb_number: 'MB-P14', item_no: '1.2', recorded: 880, observed: 710, variance: -170, unit: 'cum' },
      status: 'ACTIVE',
    },
  ];
  await supabase.from('ai_flags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('ai_flags').insert(initialFlags);

  // 8. Initial Audit Logs for PRJ-004
  const auditLogs = [
    { project_id: 'PRJ-004', actor_id: 'DA-BPL-001', role: 'DISTRICT_AUTHORITY', action: 'SANCTION_APPROVED', previous_status: 'APPROVED', new_status: 'SANCTIONED', comment: 'Administrative sanction accorded under MPLADS FY26-27.' },
    { project_id: 'PRJ-004', actor_id: 'PWD-BPL-IA-001', role: 'IMPLEMENTING_AGENCY', action: 'WORK_ORDER_ISSUED', previous_status: 'SANCTIONED', new_status: 'UNDER_IMPLEMENTATION', comment: 'Contract executed with Eastern Structural & Eng. Co.' },
    { project_id: 'PRJ-004', actor_id: 'SYSTEM_AI', role: 'SYSTEM', action: 'AI_ANOMALY_FLAGGED', previous_status: 'UNDER_IMPLEMENTATION', new_status: 'INSPECTION_REQUIRED', comment: 'CRITICAL flag generated: MB record quantity exceeds on-site inspection findings.' },
  ];
  await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('audit_logs').insert(auditLogs);

  console.log('Database seeded successfully with 10 synthetic projects, BOQs, and initial audit logs!');
}

// Run if called directly
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
