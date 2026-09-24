import { supabase } from '../supabase.js';
import { SEEDED_ACCOUNTS } from '../middleware/auth.js';
import { MPLADS_SECTORS } from '../constants/sectors.js';
import { PROJECT_STATUS } from '../constants/statuses.js';

export async function seedDatabase() {
  // Safety check: Prevent running in production (AUD-006)
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ABORT: Seeding is strictly forbidden in production environments.');
    process.exit(1);
  }

  console.log('========================================================');
  console.log(' SAKSHAM Authoritative Dataset Rebuild v2.0');
  console.log(' Deterministic Seeding via Server-Side CLI');
  console.log('========================================================');

  // 1. Roles
  const roles = [
    { role_key: 'DISTRICT_AUTHORITY', title: 'District Authority / Collector', description: 'Statutory district administrative head' },
    { role_key: 'IMPLEMENTING_AGENCY', title: 'Implementing Agency', description: 'Executive department executing civil and technical works' },
    { role_key: 'VENDOR', title: 'Vendor / Contractor', description: 'Registered executing commercial contractor' },
    { role_key: 'MP', title: 'Member of Parliament', description: 'Constituency scheme recommending representative' },
    { role_key: 'INVESTIGATOR', title: 'Statutory Investigator / Auditor', description: 'Independent inspection and vigilance cell' },
    { role_key: 'STATE_NODAL_AUTHORITY', title: 'State Nodal Authority', description: 'State-level planning and monitoring directorate' },
    { role_key: 'CENTRAL_NODAL_AGENCY', title: 'Central Nodal Agency', description: 'MoSPI national oversight and scheme administration' },
  ];
  await supabase.from('roles').upsert(roles, { onConflict: 'role_key' });
  console.log('✓ Roles seeded.');

  // 2. Profiles / Dedicated Test Accounts (AUD-002, AUD-030)
  const profiles = Object.values(SEEDED_ACCOUNTS).map(acc => ({
    id: acc.id,
    name: acc.name,
    email: acc.email,
    role_key: acc.role,
    designation: acc.designation,
    organization_name: acc.organizationName,
    state: acc.state,
    district: acc.district,
    constituency: acc.constituency || null,
    vendor_id: acc.vendorId || null,
  }));
  await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });
  console.log('✓ 7 Dedicated role test accounts seeded.');

  // 3. Vendors with clearly synthetic identifiers
  const vendors = [
    { id: 'VND-001', company_name: 'Aarya Infraworks Private Limited', gstin: '23TEST0001A1Z5', pan: 'AAAPT0001A', state: 'Madhya Pradesh', district: 'Sehore', sector: 'Civil Infrastructure', longitudinal_risk_score: 34, risk_level: 'LOW', is_active: true, is_blacklisted: false },
    { id: 'VND-002', company_name: 'Northstar Digital Systems LLP', gstin: '29TEST0002B1Z6', pan: 'BBBPT0002B', state: 'Karnataka', district: 'Bengaluru Urban', sector: 'IT Hardware & Telecom', longitudinal_risk_score: 18, risk_level: 'LOW', is_active: true, is_blacklisted: false },
    { id: 'VND-003', company_name: 'Marwar Heavy Engineering Co.', gstin: '08TEST0003C1Z7', pan: 'CCCPT0003C', state: 'Rajasthan', district: 'Ajmer', sector: 'Heavy Engineering', longitudinal_risk_score: 72, risk_level: 'HIGH', is_active: true, is_blacklisted: false },
    { id: 'VND-004', company_name: 'Coastal Water Solutions', gstin: '21TEST0004D1Z8', pan: 'DDDPT0004D', state: 'Odisha', district: 'Ganjam', sector: 'Water Supply', longitudinal_risk_score: 42, risk_level: 'MEDIUM', is_active: true, is_blacklisted: false },
    { id: 'VND-005', company_name: 'Shivalik Precision Labs', gstin: '06TEST0005E1Z9', pan: 'EEEPT0005E', state: 'Haryana', district: 'Ambala', sector: 'Educational Tech', longitudinal_risk_score: 65, risk_level: 'HIGH', is_active: true, is_blacklisted: false },
    { id: 'VND-006', company_name: 'Himalayan Clean Energy Corp', gstin: '02TEST0006F1Z1', pan: 'FFFPT0006F', state: 'Himachal Pradesh', district: 'Kangra', sector: 'Renewable Power', longitudinal_risk_score: 28, risk_level: 'LOW', is_active: true, is_blacklisted: false },
    { id: 'VND-007', company_name: 'Eastern Structural & Engineering Co.', gstin: '19TEST0007G1Z2', pan: 'GGGPT0007G', state: 'West Bengal', district: 'Nadia', sector: 'Bridges & Highways', longitudinal_risk_score: 84, risk_level: 'CRITICAL', is_active: true, is_blacklisted: false },
    { id: 'VND-008', company_name: 'Pragati Green Utilities', gstin: '02TEST0008H1Z3', pan: 'HHHPT0008H', state: 'Himachal Pradesh', district: 'Kangra', sector: 'Solar Systems', longitudinal_risk_score: 35, risk_level: 'LOW', is_active: true, is_blacklisted: false },
    { id: 'VND-009', company_name: 'Saurashtra Highway Builders', gstin: '24TEST0009I1Z4', pan: 'IIIPT0009I', state: 'Gujarat', district: 'Rajkot', sector: 'Road Construction', longitudinal_risk_score: 70, risk_level: 'HIGH', is_active: true, is_blacklisted: false },
    { id: 'VND-010', company_name: 'Dakshin Civic Solutions', gstin: '33TEST0010J1Z5', pan: 'JJJPT0010J', state: 'Tamil Nadu', district: 'Tiruchirappalli', sector: 'Sanitation Infrastructure', longitudinal_risk_score: 44, risk_level: 'MEDIUM', is_active: true, is_blacklisted: false },
  ];
  await supabase.from('vendors').upsert(vendors, { onConflict: 'id' });
  console.log('✓ Vendors with synthetic fixtures seeded.');

  // 4. Tenders
  const tenders = [
    { id: 'TND-001', reference_no: 'MP/BPL/PWD/2026/01', title: 'Construction of Community Hall & Multi-Purpose Shelter', estimated_budget: 5000000, status: 'AWARDED', awarded_vendor_id: 'VND-001', state: 'Madhya Pradesh', district: 'Bhopal' },
    { id: 'TND-002', reference_no: 'KA/BEN/SEC/2026/02', title: 'Solar Street Lights & Integrated CCTV Surveillance Network', estimated_budget: 3500000, status: 'AWARDED', awarded_vendor_id: 'VND-002', state: 'Karnataka', district: 'Bengaluru Urban' },
    { id: 'TND-003', reference_no: 'HR/AMB/EDU/2026/03', title: 'Supply of Smart Science Laboratory & STEM Equipment', estimated_budget: 2800000, status: 'AWARDED', awarded_vendor_id: 'VND-005', state: 'Haryana', district: 'Ambala' },
    { id: 'TND-004', reference_no: 'WB/NAD/HLT/2026/04', title: 'Primary Health Sub-Centre Civil & Diagnostic Upgrade', estimated_budget: 4200000, status: 'AWARDED', awarded_vendor_id: 'VND-007', state: 'West Bengal', district: 'Nadia' },
    { id: 'TND-005', reference_no: 'OD/GAN/WAT/2026/05', title: 'Community Reverse Osmosis Filtration & Pipeline', estimated_budget: 2500000, status: 'AWARDED', awarded_vendor_id: 'VND-004', state: 'Odisha', district: 'Ganjam' },
    { id: 'TND-006', reference_no: 'MH/NSK/IRR/2026/06', title: 'Perennial Lift Irrigation & Check Dam Rehabilitation', estimated_budget: 6500000, status: 'AWARDED', awarded_vendor_id: 'VND-001', state: 'Maharashtra', district: 'Nashik' },
    { id: 'TND-007', reference_no: 'RJ/AJM/VET/2026/07', title: 'Veterinary Care Dispensary & Cattle Shelter Works', estimated_budget: 1800000, status: 'AWARDED', awarded_vendor_id: 'VND-003', state: 'Rajasthan', district: 'Ajmer' },
    { id: 'TND-008', reference_no: 'GJ/RJK/AGR/2026/08', title: 'Solar Multi-Commodity Agro-Produce Storage Facility', estimated_budget: 4500000, status: 'AWARDED', awarded_vendor_id: 'VND-009', state: 'Gujarat', district: 'Rajkot' },
    { id: 'TND-009', reference_no: 'HP/KNG/PWR/2026/09', title: 'Decentralized Solar Rooftop Micro-Grid Power Systems', estimated_budget: 3200000, status: 'AWARDED', awarded_vendor_id: 'VND-008', state: 'Himachal Pradesh', district: 'Kangra' },
    { id: 'TND-010', reference_no: 'MP/SEH/ROD/2026/10', title: 'All-Weather Rural Link Road, Drainage & Culverts', estimated_budget: 5500000, status: 'AWARDED', awarded_vendor_id: 'VND-001', state: 'Madhya Pradesh', district: 'Sehore' },
    { id: 'TND-011', reference_no: 'HP/KNG/ENV/2026/11', title: 'Eco-Park Nursery & Rainwater Harvesting System', estimated_budget: 2000000, status: 'PUBLISHED', state: 'Himachal Pradesh', district: 'Kangra' },
    { id: 'TND-012', reference_no: 'TN/TRI/SPT/2026/12', title: 'Rural Youth Sports Complex & Multi-Game Track', estimated_budget: 3800000, status: 'PUBLISHED', state: 'Tamil Nadu', district: 'Tiruchirappalli' },
  ];
  await supabase.from('tenders').upsert(tenders, { onConflict: 'id' });
  console.log('✓ 12 Tenders seeded.');

  // 5. Projects: Exactly 12 Canonical Scenarios covering all 12 Mandatory MPLADS Sectors
  const projects = [
    {
      id: 'PRJ-001',
      project_code: 'MPLADS/MP/BPL/BLD/2026/01',
      title: 'Construction of Community Hall & Multi-Purpose Shelter',
      sector: 'Public & Community Buildings',
      category: 'Public & Community Buildings',
      scheme: 'MPLADS',
      mp_name: 'Shri R. K. Singh, MP',
      constituency: 'Bhopal (PC-19)',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      implementing_agency: 'Public Works Department (Central Zone)',
      vendor_id: 'VND-001',
      tender_id: 'TND-001',
      sanctioned_amount: 5000000,
      released_amount: 4000000,
      expenditure_amount: 3850000,
      physical_progress_percent: 82.0,
      financial_progress_percent: 77.0,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'LOW',
      risk_score: 15,
      start_date: '2026-01-15',
      target_completion_date: '2026-10-31',
    },
    {
      id: 'PRJ-002',
      project_code: 'MPLADS/KA/BEN/SEC/2026/02',
      title: 'Solar Street Lights & Integrated CCTV Surveillance Network',
      sector: 'Public Conveniences, Safety & Security',
      category: 'Public Conveniences, Safety & Security',
      scheme: 'MPLADS',
      mp_name: 'Shri Tejasvi Surya, MP',
      constituency: 'Bangalore South (PC-26)',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      implementing_agency: 'Bruhat Bengaluru Mahanagara Palike',
      vendor_id: 'VND-002',
      tender_id: 'TND-002',
      sanctioned_amount: 3500000,
      released_amount: 3500000,
      expenditure_amount: 3500000,
      physical_progress_percent: 100.0,
      financial_progress_percent: 100.0,
      status: PROJECT_STATUS.COMPLETED,
      risk_level: 'LOW',
      risk_score: 8,
      start_date: '2026-01-10',
      target_completion_date: '2026-06-30',
    },
    {
      id: 'PRJ-003',
      project_code: 'MPLADS/HR/AMB/EDU/2026/03',
      title: 'Supply of Smart Science Laboratory & STEM Equipment',
      sector: 'Education',
      category: 'Education',
      scheme: 'MPLADS',
      mp_name: 'Smt. Banto Kataria, MP',
      constituency: 'Ambala (PC-01)',
      district: 'Ambala',
      state: 'Haryana',
      implementing_agency: 'Haryana School Education Board',
      vendor_id: 'VND-005',
      tender_id: 'TND-003',
      sanctioned_amount: 2800000,
      released_amount: 2200000,
      expenditure_amount: 2150000,
      physical_progress_percent: 75.0,
      financial_progress_percent: 76.7,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'MEDIUM',
      risk_score: 48,
      start_date: '2026-02-01',
      target_completion_date: '2026-09-30',
    },
    {
      id: 'PRJ-004',
      project_code: 'MPLADS/MP/BPL/HLT/2026/04',
      title: 'Primary Health Sub-Centre Civil & Diagnostic Upgrade',
      sector: 'Public Health',
      category: 'Public Health',
      scheme: 'MPLADS',
      mp_name: 'Shri R. K. Singh, MP',
      constituency: 'Bhopal (PC-19)',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      implementing_agency: 'Public Works Department (Central Zone)',
      vendor_id: 'VND-001',
      tender_id: 'TND-001',
      sanctioned_amount: 4200000,
      released_amount: 3200000,
      expenditure_amount: 3100000,
      physical_progress_percent: 45.0,
      financial_progress_percent: 73.8,
      status: PROJECT_STATUS.INSPECTION_REQUIRED,
      risk_level: 'CRITICAL',
      risk_score: 86,
      start_date: '2026-01-20',
      target_completion_date: '2026-11-15',
    },

    {
      id: 'PRJ-005',
      project_code: 'MPLADS/OD/GAN/WAT/2026/05',
      title: 'Community Reverse Osmosis Filtration & Pipeline',
      sector: 'Drinking Water & Sanitation',
      category: 'Drinking Water & Sanitation',
      scheme: 'MPLADS',
      mp_name: 'Shri Chandra Sekhar Sahu, MP',
      constituency: 'Berhampur (PC-19)',
      district: 'Ganjam',
      state: 'Odisha',
      implementing_agency: 'Rural Water Supply & Sanitation Division',
      vendor_id: 'VND-004',
      tender_id: 'TND-005',
      sanctioned_amount: 2500000,
      released_amount: 2000000,
      expenditure_amount: 1950000,
      physical_progress_percent: 80.0,
      financial_progress_percent: 78.0,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'LOW',
      risk_score: 22,
      start_date: '2026-03-01',
      target_completion_date: '2026-12-15',
    },
    {
      id: 'PRJ-006',
      project_code: 'MPLADS/MH/NSK/IRR/2026/06',
      title: 'Perennial Lift Irrigation & Check Dam Rehabilitation',
      sector: 'Irrigation, Drainage & Flood Control Systems',
      category: 'Irrigation, Drainage & Flood Control Systems',
      scheme: 'MPLADS',
      mp_name: 'Shri Hemant Godse, MP',
      constituency: 'Nashik (PC-20)',
      district: 'Nashik',
      state: 'Maharashtra',
      implementing_agency: 'Zilla Parishad Irrigation Dept',
      vendor_id: 'VND-001',
      tender_id: 'TND-006',
      sanctioned_amount: 6500000,
      released_amount: 4500000,
      expenditure_amount: 4100000,
      physical_progress_percent: 65.0,
      financial_progress_percent: 63.0,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'LOW',
      risk_score: 25,
      start_date: '2026-02-15',
      target_completion_date: '2026-12-31',
    },
    {
      id: 'PRJ-007',
      project_code: 'MPLADS/RJ/AJM/VET/2026/07',
      title: 'Veterinary Care Dispensary & Cattle Shelter Works',
      sector: 'Animal Husbandry, Dairy & Fisheries',
      category: 'Animal Husbandry, Dairy & Fisheries',
      scheme: 'MPLADS',
      mp_name: 'Shri Bhagirath Choudhary, MP',
      constituency: 'Ajmer (PC-13)',
      district: 'Ajmer',
      state: 'Rajasthan',
      implementing_agency: 'Animal Husbandry Development Board',
      vendor_id: 'VND-003',
      tender_id: 'TND-007',
      sanctioned_amount: 1800000,
      released_amount: 1400000,
      expenditure_amount: 1350000,
      physical_progress_percent: 70.0,
      financial_progress_percent: 75.0,
      status: PROJECT_STATUS.ON_HOLD,
      risk_level: 'HIGH',
      risk_score: 68,
      start_date: '2026-02-10',
      target_completion_date: '2026-10-15',
    },
    {
      id: 'PRJ-008',
      project_code: 'MPLADS/GJ/RJK/AGR/2026/08',
      title: 'Solar Multi-Commodity Agro-Produce Storage Facility',
      sector: 'Agriculture & Farmer Welfare',
      category: 'Agriculture & Farmer Welfare',
      scheme: 'MPLADS',
      mp_name: 'Shri Mohanbhai Kundariya, MP',
      constituency: 'Rajkot (PC-10)',
      district: 'Rajkot',
      state: 'Gujarat',
      implementing_agency: 'Agricultural Produce Market Committee',
      vendor_id: 'VND-009',
      tender_id: 'TND-008',
      sanctioned_amount: 4500000,
      released_amount: 3000000,
      expenditure_amount: 2800000,
      physical_progress_percent: 60.0,
      financial_progress_percent: 62.2,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'MEDIUM',
      risk_score: 52,
      start_date: '2026-03-05',
      target_completion_date: '2026-11-30',
    },
    {
      id: 'PRJ-009',
      project_code: 'MPLADS/HP/KNG/PWR/2026/09',
      title: 'Decentralized Solar Rooftop Micro-Grid Power Systems',
      sector: 'Energy Supply & Distribution Systems',
      category: 'Energy Supply & Distribution Systems',
      scheme: 'MPLADS',
      mp_name: 'Shri Kishan Kapoor, MP',
      constituency: 'Kangra (PC-01)',
      district: 'Kangra',
      state: 'Himachal Pradesh',
      implementing_agency: 'HIMURJA Renewable Energy Agency',
      vendor_id: 'VND-008',
      tender_id: 'TND-009',
      sanctioned_amount: 3200000,
      released_amount: 2500000,
      expenditure_amount: 2450000,
      physical_progress_percent: 75.0,
      financial_progress_percent: 76.5,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'LOW',
      risk_score: 18,
      start_date: '2026-02-20',
      target_completion_date: '2026-09-30',
    },
    {
      id: 'PRJ-010',
      project_code: 'MPLADS/MP/SEH/ROD/2026/10',
      title: 'All-Weather Rural Link Road, Drainage & Culverts',
      sector: 'Railways, Roads, Bridges & Pathways',
      category: 'Railways, Roads, Bridges & Pathways',
      scheme: 'MPLADS',
      mp_name: 'Shri R. K. Singh, MP',
      constituency: 'Bhopal (PC-19)',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      implementing_agency: 'Madhya Pradesh Rural Road Authority',
      vendor_id: 'VND-001',
      tender_id: 'TND-010',
      sanctioned_amount: 5500000,
      released_amount: 4500000,
      expenditure_amount: 4400000,
      physical_progress_percent: 85.0,
      financial_progress_percent: 80.0,
      status: PROJECT_STATUS.UNDER_IMPLEMENTATION,
      risk_level: 'LOW',
      risk_score: 15,
      start_date: '2026-01-25',
      target_completion_date: '2026-10-15',
    },
    {
      id: 'PRJ-011',
      project_code: 'MPLADS/HP/KNG/ENV/2026/11',
      title: 'Eco-Park Nursery & Rainwater Harvesting System',
      sector: 'Environment, Wild Animals, Forest & Other Natural Resources',
      category: 'Environment, Wild Animals, Forest & Other Natural Resources',
      scheme: 'MPLADS',
      mp_name: 'Shri Kishan Kapoor, MP',
      constituency: 'Kangra (PC-01)',
      district: 'Kangra',
      state: 'Himachal Pradesh',
      implementing_agency: 'State Forest Conservation Society',
      sanctioned_amount: 2000000,
      released_amount: 0,
      expenditure_amount: 0,
      physical_progress_percent: 0.0,
      financial_progress_percent: 0.0,
      status: PROJECT_STATUS.SANCTIONED,
      risk_level: 'LOW',
      risk_score: 5,
      start_date: '2026-04-01',
      target_completion_date: '2026-12-31',
    },
    {
      id: 'PRJ-012',
      project_code: 'MPLADS/TN/TRI/SPT/2026/12',
      title: 'Rural Youth Sports Complex & Multi-Game Track',
      sector: 'Public Recreational Facilities, Sports & Parks',
      category: 'Public Recreational Facilities, Sports & Parks',
      scheme: 'MPLADS',
      mp_name: 'Shri Su. Thirunavukkarasar, MP',
      constituency: 'Tiruchirappalli (PC-24)',
      district: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      implementing_agency: 'District Sports Development Authority',
      sanctioned_amount: 3800000,
      released_amount: 0,
      expenditure_amount: 0,
      physical_progress_percent: 0.0,
      financial_progress_percent: 0.0,
      status: PROJECT_STATUS.RECOMMENDED,
      risk_level: 'LOW',
      risk_score: 5,
      start_date: '2026-04-15',
      target_completion_date: '2027-01-31',
    },
    {
      id: 'PRJ-013',
      project_code: 'MPLADS/MP/BPL/WAT/2026/13',
      title: 'Solar RO Drinking Water ATMs & Deep Tube-well Installation',
      sector: 'Drinking Water Facility',
      category: 'Drinking Water Facility',
      scheme: 'MPLADS',
      mp_name: 'Shri R. K. Singh, MP',
      constituency: 'Bhopal (PC-19)',
      district: 'Bhopal',
      state: 'Madhya Pradesh',
      implementing_agency: 'Public Works Department (Central Zone)',
      sanctioned_amount: 2500000,
      released_amount: 0,
      expenditure_amount: 0,
      physical_progress_percent: 0.0,
      financial_progress_percent: 0.0,
      status: PROJECT_STATUS.RECOMMENDED,
      risk_level: 'LOW',
      risk_score: 8,
      start_date: '2026-05-01',
      target_completion_date: '2026-11-30',
    },
  ];

  await supabase.from('projects').upsert(projects, { onConflict: 'id' });
  console.log(`✓ ${projects.length} Canonical projects across all 12 MPLADS sectors seeded.`);

  // 6. Bids & Bid Participants (AUD-011)
  const bids = [
    { id: '11111111-1111-4111-a111-111111111111', tender_id: 'TND-001', bid_reference: 'BID-TND001-01', submission_date: '2026-01-05T10:00:00Z', technical_score: 92.5, financial_quote: 4850000, status: 'SELECTED' },
    { id: '22222222-2222-4222-a222-222222222222', tender_id: 'TND-001', bid_reference: 'BID-TND001-02', submission_date: '2026-01-05T11:30:00Z', technical_score: 84.0, financial_quote: 4920000, status: 'QUALIFIED' },
    { id: '33333333-3333-4333-a333-333333333333', tender_id: 'TND-004', bid_reference: 'BID-TND004-01', submission_date: '2026-01-12T09:15:00Z', technical_score: 88.0, financial_quote: 4100000, status: 'SELECTED' },
  ];
  await supabase.from('bids').upsert(bids, { onConflict: 'id' });

  const bidParticipants = [
    { id: '44444444-4444-4444-a444-444444444444', bid_id: '11111111-1111-4111-a111-111111111111', vendor_id: 'VND-001', is_lead_bidder: true, consortium_share_percent: 100 },
    { id: '55555555-5555-4555-a555-555555555555', bid_id: '22222222-2222-4222-a222-222222222222', vendor_id: 'VND-003', is_lead_bidder: true, consortium_share_percent: 100 },
    { id: '66666666-6666-4666-a666-666666666666', bid_id: '33333333-3333-4333-a333-333333333333', vendor_id: 'VND-007', is_lead_bidder: true, consortium_share_percent: 100 },
  ];
  await supabase.from('bid_participants').upsert(bidParticipants, { onConflict: 'id' });
  console.log('✓ Bids and bid participants seeded.');

  // 7. Inspections & Geotagged Evidence (AUD-017)
  const inspections = [
    {
      id: '77777777-7777-4777-a777-777777777777',
      project_id: 'PRJ-001',
      inspector_id: 'DA-BPL-001',
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
      inspector_id: 'INV-CENTRAL-001',
      inspector_name: 'K. S. Narayanan, IPS',
      inspection_date: '2026-08-20',
      milestone_stage: 'Foundation & RCC Framing',
      physical_progress_observed: 45.0,
      quality_assessment: 'DEFICIENCIES_NOTED',
      remarks: 'Significant physical progress delay detected relative to 73.8% fund release. MB discrepancy noted.',
      cadastral_boundary_verified: true,
      latitude: 23.4710,
      longitude: 88.5565,
    },
  ];
  await supabase.from('inspections').upsert(inspections, { onConflict: 'id' });
  console.log('✓ Inspections seeded.');

  // 8. Alerts (AUD-017)
  const alerts = [
    {
      id: '99999999-9999-4999-a999-999999999999',
      project_id: 'PRJ-004',
      vendor_id: 'VND-007',
      severity: 'CRITICAL',
      category: 'FINANCIAL',
      title: 'Disproportionate Fund Drawdown Alert',
      description: 'Physical progress recorded at 45.0% while cumulative payments have exceeded 73.8% of sanction.',
      status: 'ACTIVE',
    },
    {
      id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
      vendor_id: 'VND-007',
      severity: 'HIGH',
      category: 'COLLUSION',
      title: 'Sole-Bidder Frequency Anomaly',
      description: 'Vendor Eastern Structural has won 3 consecutive sub-district tenders without competing qualified bids.',
      status: 'ACTIVE',
    },
  ];
  await supabase.from('alerts').upsert(alerts, { onConflict: 'id' });
  console.log('✓ Risk alerts seeded.');

  // 9. Audit Logs (AUD-022: Demonstrates project and non-project actions)
  const auditLogs = [
    {
      project_id: 'PRJ-001',
      entity_type: 'PROJECT',
      entity_id: 'PRJ-001',
      actor_id: 'MP-BPL-001',
      role: 'MP',
      action: 'RECOMMENDATION_CREATED',
      comment: 'Initial constituency proposal submitted.',
    },
    {
      project_id: null,
      entity_type: 'VENDOR',
      entity_id: 'VND-001',
      actor_id: 'DA-BPL-001',
      role: 'DISTRICT_AUTHORITY',
      action: 'VENDOR_VERIFIED',
      comment: 'Statutory GSTIN and PAN synthetic clearance completed.',
    },
    {
      project_id: null,
      entity_type: 'TENDER',
      entity_id: 'TND-001',
      actor_id: 'PWD-BPL-IA-001',
      role: 'IMPLEMENTING_AGENCY',
      action: 'TENDER_PUBLISHED',
      comment: 'Civil works e-procurement published on portal.',
    },
  ];
  await supabase.from('audit_logs').insert(auditLogs);
  console.log('✓ Multi-entity audit logs seeded.');

  console.log('========================================================');
  console.log(' SAKSHAM Authoritative Seeding COMPLETE.');
  console.log('========================================================');
}

// Allow direct CLI execution: node src/scripts/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
