import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getRoleLandingRoute } from './auth/AuthContext.jsx';
import ProtectedRoute from './navigation/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';

// Role Dashboards
import Dashboard from './pages/Dashboard.jsx';
import DistrictDashboard from './pages/DistrictDashboard.jsx';
import StateDashboard from './pages/StateDashboard.jsx';
import NationalDashboard from './pages/NationalDashboard.jsx';
import MPDashboard from './pages/MPDashboard.jsx';
import VendorDashboard from './pages/VendorDashboard.jsx';

// Vendor Pages
import ManageVendors from './pages/ManageVendors.jsx';
import AddEditVendor from './pages/AddEditVendor.jsx';
import VendorRiskProfile from './pages/VendorRiskProfile.jsx';

// Procurement & Tenders
import ProcurementDashboard from './pages/ProcurementDashboard.jsx';
import ManageTenders from './pages/ManageTenders.jsx';
import TenderDetail from './pages/TenderDetail.jsx';


// Projects & Works
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import WorkProgress from './pages/WorkProgress.jsx';

// Dedicated Operational Pages (AUD-010: Zero Aliasing)
import Inspections from './pages/Inspections.jsx';
import FraudGraph from './pages/FraudGraph.jsx';
import Alerts from './pages/Alerts.jsx';
import AuditTrail from './pages/AuditTrail.jsx';

// Financial & Reports
import FundDisbursement from './pages/FundDisbursement.jsx';
import InvestigationDashboard from './pages/InvestigationDashboard.jsx';
import Reports from './pages/Reports.jsx';

function RoleDefaultRedirect() {
  const { session } = useAuth();
  return <Navigate to={session?.landingRoute || getRoleLandingRoute(session?.role)} replace />;
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
          {/* Public Portal Landing & Sign In */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Role-Aware Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Authenticated default */}
            <Route path="/app" element={<RoleDefaultRedirect />} />

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

            {/* Procurement / Tenders */}
            <Route path="/procurement-dashboard" element={<ProcurementDashboard />} />
            <Route path="/tenders" element={<ManageTenders />} />
            <Route path="/tenders/:id" element={<TenderDetail />} />


            {/* Projects / Works */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/work-progress" element={<WorkProgress />} />

            {/* Dedicated Pages (AUD-010) */}
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/fraud-graph" element={<FraudGraph />} />
            <Route path="/fraud-network" element={<FraudGraph />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/risk-alerts" element={<Alerts />} />
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/audit-logs" element={<AuditTrail />} />

            {/* Payments & Funds */}
            <Route path="/fund-disbursement" element={<FundDisbursement />} />

            {/* Investigations & Risk */}
            <Route path="/investigations" element={<InvestigationDashboard />} />

            {/* Statutory Reports */}
            <Route path="/reports" element={<Reports />} />

            {/* Additional Operational Aliases */}
            <Route path="/implementing-agencies" element={<Projects />} />
            <Route path="/districts" element={<DistrictDashboard />} />
            <Route path="/compliance" element={<VendorDashboard />} />

            {/* Fallback */}
            <Route path="*" element={<RoleDefaultRedirect />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
