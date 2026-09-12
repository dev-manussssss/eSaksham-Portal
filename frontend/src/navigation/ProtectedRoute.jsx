import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { isRouteAllowed } from './permissions.js';
import AccessRestricted from '../components/AccessRestricted.jsx';

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const allowed = isRouteAllowed(session.role, location.pathname);

  if (!allowed) {
    return <AccessRestricted attemptedPath={location.pathname} />;
  }

  return children;
}
