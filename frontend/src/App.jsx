import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './navigation/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ManageVendors from './pages/ManageVendors.jsx';
import AddEditVendor from './pages/AddEditVendor.jsx';
import VendorRiskProfile from './pages/VendorRiskProfile.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import WorkProgress from './pages/WorkProgress.jsx';
import FundDisbursement from './pages/FundDisbursement.jsx';
import DistrictDashboard from './pages/DistrictDashboard.jsx';
import InvestigationDashboard from './pages/InvestigationDashboard.jsx';
import ManageTenders from './pages/ManageTenders.jsx';
import TenderDetail from './pages/TenderDetail.jsx';
import MPDashboard from './pages/MPDashboard.jsx';
import StateDashboard from './pages/StateDashboard.jsx';
import NationalDashboard from './pages/NationalDashboard.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';
import Reports from './pages/Reports.jsx';

function RoleDefaultRedirect() {
  const { session } = useAuth();
  return <Navigate to={session?.landingRoute || '/dashboard'} replace />;
}

function VendorMyProfileRedirect() {
  const { session } = useAuth();
  return <Navigate to={`/vendors/${session?.vendorId || 'VND-007'}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Role-Aware Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Root redirects to current role's designated landing route */}
            <Route path="/" element={<RoleDefaultRedirect />} />

            {/* Role Dashboards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/district-dashboard" element={<DistrictDashboard />} />
            <Route path="/state-dashboard" element={<StateDashboard />} />
            <Route path="/national-dashboard" element={<NationalDashboard />} />
            <Route path="/mp-dashboard" element={<MPDashboard />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />

            {/* Vendor Management & Profiles */}
            <Route path="/vendors" element={<ManageVendors />} />
            <Route path="/vendors/new" element={<AddEditVendor />} />
            <Route path="/vendors/:id/edit" element={<AddEditVendor />} />
            <Route path="/vendors/own" element={<VendorMyProfileRedirect />} />
            <Route path="/vendors/my-profile" element={<VendorMyProfileRedirect />} />
            <Route path="/vendors/:id" element={<VendorRiskProfile />} />
            <Route path="/vendor-risk" element={<Navigate to="/vendors" replace />} />

            {/* Tenders */}
            <Route path="/tenders" element={<ManageTenders />} />
            <Route path="/tenders/:id" element={<TenderDetail />} />

            {/* Projects / Works */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/work-progress" element={<WorkProgress />} />
            <Route path="/inspections" element={<WorkProgress />} />

            {/* Payments & Funds */}
            <Route path="/fund-disbursement" element={<FundDisbursement />} />

            {/* Investigations & Risk */}
            <Route path="/investigations" element={<InvestigationDashboard />} />
            <Route path="/fraud-graph" element={<InvestigationDashboard />} />
            <Route path="/fraud-network" element={<InvestigationDashboard />} />
            <Route path="/risk-alerts" element={<InvestigationDashboard />} />

            {/* Statutory Reports */}
            <Route path="/reports" element={<Reports />} />

            {/* Additional Statutory Aliases */}
            <Route path="/implementing-agencies" element={<Projects />} />
            <Route path="/districts" element={<DistrictDashboard />} />
            <Route path="/documents" element={<ProjectDetail />} />
            <Route path="/compliance" element={<VendorDashboard />} />
            <Route path="/notifications" element={<InvestigationDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<RoleDefaultRedirect />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
