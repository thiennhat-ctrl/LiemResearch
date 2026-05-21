import { Navigate, Outlet, useLocation } from 'react-router';
import { getAuthSession, type AppRole } from '../utils/auth';

interface ProtectedRouteProps {
  requiredRole?: AppRole;
  redirectTo?: string;
}

export function ProtectedRoute({ requiredRole, redirectTo = '/login' }: ProtectedRouteProps) {
  const location = useLocation();
  const session = getAuthSession();

  if (!session) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to={session.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
